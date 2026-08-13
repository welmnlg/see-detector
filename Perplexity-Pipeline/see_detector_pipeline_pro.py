
import pandas as pd
import numpy as np
from urllib.parse import urlparse, parse_qs, unquote
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupKFold, GroupShuffleSplit, cross_validate
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    roc_curve,
    precision_recall_curve,
)
import json
import matplotlib.pyplot as plt
import seaborn as sns

# =====================
# KONFIGURASI PATH
# =====================
# Ganti sesuai nama file di folder kamu
AMAN_STATIC_PATH = 'static_aman.csv'
RENTAN_STATIC_PATH = 'static_rentan.csv'
AMAN_DYNAMIC_PATH = 'dynamic_aman.csv'
RENTAN_DYNAMIC_PATH = 'dynamic_rentan.csv'

RANDOM_STATE = 42


# =====================
# 1. LOAD DATA
# =====================

def load_data():
    """Load laporan statis & dinamis, lalu gabungkan."""
    aman_static = pd.read_csv(AMAN_STATIC_PATH)
    rentan_static = pd.read_csv(RENTAN_STATIC_PATH)
    static = pd.concat([aman_static, rentan_static], ignore_index=True)
    static = static[static['risk_level_id'].isin(['AMAN', 'RENTAN'])].copy()

    rentan_dyn = pd.read_csv(RENTAN_DYNAMIC_PATH, low_memory=False)
    aman_dyn = pd.read_csv(AMAN_DYNAMIC_PATH, low_memory=False)
    all_dyn = pd.concat([rentan_dyn, aman_dyn], ignore_index=True)
    return static, all_dyn


# =====================
# 2. FEATURE ENGINEERING DINAMIS
# =====================

def preprocess_dynamic(all_dyn: pd.DataFrame) -> pd.DataFrame:
    d = all_dyn.copy()

    d['is_unauth'] = d['is_unauthorized_domain'].astype(str).str.lower().isin(['true', '1'])
    d['is_ext_init'] = d['is_extension_initiated'].astype(str).str.lower().isin(['true', '1'])
    d['method'] = d['method'].fillna('GET')
    d['has_postdata'] = d['post_data_preview'].notna()
    d['post_data_preview'] = d['post_data_preview'].astype(str)
    d['post_len'] = d['post_data_preview'].fillna('').astype(str).str.len()

    endpoint_keywords = ['upload', 'collect', 'track', 'metrics', 'event', 'pixel', 'send', 'log', 'httpapi', 'insights']
    d['url_has_exfil_keyword'] = d['url'].fillna('').astype(str).str.lower().apply(
        lambda s: any(k in s for k in endpoint_keywords)
    )

    d['post_is_json'] = d['post_data_preview'].fillna('').astype(str).str.strip().str.startswith('{')
    d['post_looks_structured'] = d['post_data_preview'].fillna('').astype(str).str.contains('[<&={"]', regex=True)

    sensitive_hosts = ['mail.google.com', 'www.facebook.com', 'www.linkedin.com', 'accounts.google.com']

    def extract_victim_urls(row):
        urls = []
        raw_url = str(row.get('url', '') or '')
        try:
            parsed = urlparse(raw_url)
            qs = parse_qs(parsed.query)
            for key in ['url', 'page_url', 'pageUrl', 'Page URL', 'page_location', 'Page Location']:
                if key in qs:
                    for v in qs[key]:
                        urls.append(unquote(v))
        except Exception:
            pass

        body = str(row.get('post_data_preview', '') or '')
        if body.strip().startswith('{') and len(body) < 5000:
            try:
                data = json.loads(body)
                def walk(obj):
                    if isinstance(obj, dict):
                        for _k, v in obj.items():
                            if isinstance(v, (dict, list)):
                                walk(v)
                            else:
                                if isinstance(v, str) and ('http://' in v or 'https://' in v or v.startswith('file:///')):
                                    urls.append(v)
                    elif isinstance(obj, list):
                        for it in obj:
                            walk(it)
                walk(data)
            except Exception:
                pass
        return urls

    victim_data = d.apply(extract_victim_urls, axis=1)
    d['victim_url_count'] = victim_data.apply(len)

    def count_sensitive(vlist):
        file_c = 0
        hosts = []
        for u in vlist:
            try:
                p = urlparse(u)
                if p.scheme == 'file':
                    file_c += 1
                if p.hostname:
                    hosts.append(p.hostname)
            except Exception:
                continue
        sens = sum(h in sensitive_hosts for h in hosts)
        return pd.Series({
            'victim_sensitive': sens,
            'victim_file': file_c,
            'victim_hosts_unique': len(set(hosts)),
        })

    sens_df = victim_data.apply(count_sensitive)
    d = pd.concat([d, sens_df], axis=1)
    return d


def aggregate_dynamic(all_dyn: pd.DataFrame) -> pd.DataFrame:
    def agg_group(df: pd.DataFrame) -> pd.Series:
        return pd.Series({
            'dyn_total': len(df),
            'dyn_unauth': int(df['is_unauth'].sum()),
            'dyn_extinit': int(df['is_ext_init'].sum()),
            'dyn_unauth_ratio': float(df['is_unauth'].mean() if len(df) else 0.0),
            'dyn_extinit_ratio': float(df['is_ext_init'].mean() if len(df) else 0.0),
            'dyn_domains': int(df['domain'].nunique()),
            'dyn_scenarios': int(df['scenario'].nunique()),
            'dyn_sources': int(df['source'].nunique()),
            'dyn_get': int((df['method'] == 'GET').sum()),
            'dyn_post': int((df['method'] == 'POST').sum()),
            'dyn_post_nonnull': int(df['has_postdata'].sum()),
            'dyn_post_nonnull_unauth': int(((df['has_postdata']) & (df['is_unauth'])).sum()),
            'dyn_post_avg_len': float(df['post_len'].mean() if len(df) else 0.0),
            'dyn_post_max_len': float(df['post_len'].max() if len(df) else 0.0),
            'dyn_url_exfil_cnt': int(df['url_has_exfil_keyword'].sum()),
            'dyn_has_dom_scraping': bool(df['evidence_summary'].fillna('').astype(str).str.contains('dom_scraping', case=False).any()),
            'dyn_has_injected': bool(df['evidence_summary'].fillna('').astype(str).str.contains('injected into page', case=False).any()),
            'dyn_post_json_cnt': int(df['post_is_json'].sum()),
            'dyn_post_structured_cnt': int(df['post_looks_structured'].sum()),
            'victim_url_count_total': int(df['victim_url_count'].sum()),
            'victim_sensitive_total': int(df['victim_sensitive'].sum()),
            'victim_file_total': int(df['victim_file'].sum()),
            'victim_hosts_unique_total': int(df['victim_hosts_unique'].sum()),
        })

    agg_dyn = all_dyn.groupby('extension_id').apply(agg_group).reset_index()
    return agg_dyn


# =====================
# 3. BUILD DATASET
# =====================

def build_dataset(static: pd.DataFrame, agg_dyn: pd.DataFrame):
    merged = static.merge(agg_dyn, on='extension_id', how='left')

    for col in agg_dyn.columns:
        if col == 'extension_id':
            continue
        if merged[col].dtype == bool:
            merged[col] = merged[col].fillna(False)
        else:
            merged[col] = merged[col].fillna(0)

    merged['y'] = (merged['risk_level_id'] == 'RENTAN').astype(int)

    feature_cols = [
        'risk_score', 'permissions_count', 'sensitive_perms_count',
        'http_api_total', 'external_domains'
    ]
    merged['has_wildcard_cs'] = merged['has_wildcard_cs'].astype(int)
    feature_cols.append('has_wildcard_cs')

    for col in agg_dyn.columns:
        if col != 'extension_id' and merged[col].dtype != bool:
            feature_cols.append(col)

    merged['dyn_has_dom_scraping'] = merged['dyn_has_dom_scraping'].astype(int)
    merged['dyn_has_injected'] = merged['dyn_has_injected'].astype(int)
    feature_cols += ['dyn_has_dom_scraping', 'dyn_has_injected']

    X = merged[feature_cols].values
    y = merged['y'].values
    groups = merged['extension_id'].values
    return merged, X, y, groups, feature_cols


# =====================
# 4. TRAIN / CV / TEST + PLOTS
# =====================

def plot_confusion_matrix(cm, labels, filename):
    plt.figure(figsize=(4, 3))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=labels, yticklabels=labels)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.tight_layout()
    plt.savefig(filename, dpi=150)
    plt.close()


def plot_roc_pr(y_true, y_proba, filename):
    plt.figure(figsize=(10, 4))

    # ROC
    plt.subplot(1, 2, 1)
    fpr, tpr, _ = roc_curve(y_true, y_proba)
    auc = roc_auc_score(y_true, y_proba)
    plt.plot(fpr, tpr, label=f'AUC = {auc:.3f}')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve')
    plt.legend()

    # Precision-Recall
    plt.subplot(1, 2, 2)
    prec, rec, _ = precision_recall_curve(y_true, y_proba)
    plt.plot(rec, prec)
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')

    plt.tight_layout()
    plt.savefig(filename, dpi=150)
    plt.close()


def plot_feature_importance(feature_cols, importances, top_n, filename):
    idx = np.argsort(importances)[::-1][:top_n]
    top_features = [feature_cols[i] for i in idx]
    top_importances = importances[idx]

    plt.figure(figsize=(8, max(4, 0.4 * top_n)))
    sns.barplot(x=top_importances, y=top_features, orient='h')
    plt.xlabel('Importance')
    plt.title(f'Top {top_n} Feature Importances')
    plt.tight_layout()
    plt.savefig(filename, dpi=150)
    plt.close()


def train_evaluate_with_plots(X, y, groups, feature_cols, test_size: float = 0.2):
    rf = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        class_weight='balanced',
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )

    # Train/Test split per extension
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=RANDOM_STATE)
    train_idx, test_idx = next(gss.split(X, y, groups=groups))
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    groups_train = groups[train_idx]

    print('Train size:', len(y_train), 'samples; Test size:', len(y_test), 'samples')

    # Cross-validation di train
    cv = GroupKFold(n_splits=5)
    scores = cross_validate(
        rf,
        X_train,
        y_train,
        cv=cv,
        groups=groups_train,
        scoring=['accuracy', 'precision', 'recall', 'f1'],
        return_train_score=True,
        return_estimator=False,
    )

    print('===== Cross-validation on TRAIN (5-fold, GroupKFold) =====')
    for metric in ['train_accuracy', 'train_precision', 'train_recall', 'train_f1',
                   'test_accuracy', 'test_precision', 'test_recall', 'test_f1']:
        vals = scores[metric]
        print(f"{metric}: {vals.mean():.4f} ± {vals.std():.4f}")

    # Fit final model di train dan evaluasi di test
    rf.fit(X_train, y_train)
    y_pred = rf.predict(X_test)
    y_proba = rf.predict_proba(X_test)[:, 1]

    print('===== Evaluation on TEST HOLDOUT =====')
    cm = confusion_matrix(y_test, y_pred)
    print('Confusion matrix (TEST):')
    print(cm)
    print('===== Classification report (TEST):')
    print(classification_report(y_test, y_pred, digits=4))

    try:
        auc = roc_auc_score(y_test, y_proba)
        print(f"ROC-AUC (TEST): {auc:.4f}")
    except ValueError:
        print('ROC-AUC (TEST): not defined (only one class present).')

    # Simpan hasil test ke CSV
    results = pd.DataFrame({
        'extension_id': groups[test_idx],
        'y_true': y_test,
        'y_pred': y_pred,
        'y_proba': y_proba,
    })
    results.to_csv('results_test_predictions.csv', index=False)

    cv_summary = pd.DataFrame({
        'fold': np.arange(1, len(scores['test_accuracy']) + 1),
        'train_accuracy': scores['train_accuracy'],
        'train_precision': scores['train_precision'],
        'train_recall': scores['train_recall'],
        'train_f1': scores['train_f1'],
        'val_accuracy': scores['test_accuracy'],
        'val_precision': scores['test_precision'],
        'val_recall': scores['test_recall'],
        'val_f1': scores['test_f1'],
    })
    cv_summary.to_csv('results_cv_summary.csv', index=False)

    # Buat grafik
    plot_confusion_matrix(cm, labels=['AMAN', 'RENTAN'], filename='plot_confusion_matrix_test.png')
    plot_roc_pr(y_test, y_proba, filename='plot_roc_pr_test.png')

    # Feature importance dari model fit di seluruh data
    rf_all = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        class_weight='balanced',
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    rf_all.fit(X, y)
    importances = rf_all.feature_importances_
    plot_feature_importance(feature_cols, importances, top_n=20, filename='plot_feature_importance_top20.png')

    print('===== Plot disimpan sebagai: =====')
    print('- plot_confusion_matrix_test.png')
    print('- plot_roc_pr_test.png')
    print('- plot_feature_importance_top20.png')

    return rf, rf_all


def main():
    static, all_dyn = load_data()
    print(f"Static extensions (AMAN+RENTAN): {len(static)}")
    all_dyn_prep = preprocess_dynamic(all_dyn)
    agg_dyn = aggregate_dynamic(all_dyn_prep)
    print(f"Dynamic extensions with traffic: {agg_dyn['extension_id'].nunique()}")
    merged, X, y, groups, feature_cols = build_dataset(static, agg_dyn)
    print(f"Dataset size: {len(merged)} extensions")
    print('Label distribution:', merged['y'].value_counts().to_dict())

    model_train, model_all = train_evaluate_with_plots(X, y, groups, feature_cols)

    import joblib
    joblib.dump({'model_train': model_train, 'model_all': model_all, 'feature_cols': feature_cols}, 'see_rf_model_pro.joblib')
    print("Model(s) saved to see_rf_model_pro.joblib")


if __name__ == '__main__':
    main()
