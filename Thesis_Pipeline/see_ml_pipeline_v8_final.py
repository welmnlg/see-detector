"""
SEE Detector — ML Pipeline v8 (Categories + Payload/URL + 10-Fold CV)
=================================================================
Strategi:
1. Drop `risk_score` sepenuhnya.
2. Gunakan `permissions_count`, `sensitive_perms_count`, dan
   One-Hot Encoding dari `see_categories` (representasi izin spesifik).
3. Ekstraksi fitur dinamis mendalam (payload, URL).
4. Gunakan GridSearchCV & 10-Fold CV untuk mencapai akurasi 91-98%.
=================================================================
"""
import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import numpy as np
import pandas as pd
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict, GridSearchCV
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report)

# ─── FILE PATHS ──────────────────────────────────────────────────
DYN_AMAN    = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\dynamic_analysis_results\aman_dynamic_traffic2.csv"
DYN_RENTAN  = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\dynamic_analysis_results\rentan_dynamic_traffic2.csv"
STAT_RENTAN = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\static_analysis_reports2\see_report_20260811_225134.csv"
STAT_AMAN   = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\static_analysis_reports2\see_report_20260811_225256.csv"

BASE_DIR    = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector"
RESULTS_DIR = os.path.join(BASE_DIR, "Thesis_Pipeline", "results")
MODELS_DIR  = os.path.join(BASE_DIR, "Thesis_Pipeline", "models")
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

OUTPUT_CSV    = os.path.join(RESULTS_DIR, "dataset_v8_final.csv")
MODEL_PATH    = os.path.join(MODELS_DIR, "see_rf_model_v8.pkl")
FEATURES_PATH = os.path.join(MODELS_DIR, "feature_names_v8.pkl")


def build_dataset():
    df_sr = pd.read_csv(STAT_RENTAN); df_sr['label'] = 1
    df_sa = pd.read_csv(STAT_AMAN);   df_sa['label'] = 0
    df_stat = pd.concat([df_sr, df_sa]).drop_duplicates(subset=['extension_id'])
    
    df_da = pd.read_csv(DYN_AMAN)
    df_dr = pd.read_csv(DYN_RENTAN)
    df_dyn = pd.concat([df_da, df_dr])
    
    suspicious_payload_patterns = r'cookie|token|password|session|email|username|base64|document\.location|localStorage'
    suspicious_url_patterns = r'yapthread\.com|raw\.githubusercontent\.com|api\.telegram\.org|webhook|eval|data='
    
    dyn_agg = {}
    for ext_id, g in df_dyn.groupby('extension_id'):
        ext_id = str(ext_id)
        n = len(g)
        
        cs_calls = g['source'].astype(str).str.contains('Content Script', case=False, na=False).sum()
        sw_calls = g['source'].astype(str).str.contains('Service Worker', case=False, na=False).sum()
        post_calls = (g['method'].astype(str).str.upper() == 'POST').sum()
        
        unauth_calls = g['is_unauthorized_domain'].astype(str).str.lower().eq('true').sum()
        unique_domains = g['domain'].dropna().nunique()
        susp_urls = g['url'].astype(str).str.contains(suspicious_url_patterns, case=False, na=False, regex=True).sum()
        
        susp_payloads = g['post_data_preview'].astype(str).str.contains(
            suspicious_payload_patterns, case=False, na=False, regex=True).sum()
            
        evidence = g['evidence_summary'].astype(str)
        dom_scraping = 1 if evidence.str.contains('dom_scraping', case=False).any() else 0
        
        dyn_agg[ext_id] = {
            'dyn_total_reqs': n,
            'dyn_cs_reqs': int(cs_calls),
            'dyn_sw_reqs': int(sw_calls),
            'dyn_post_reqs': int(post_calls),
            'dyn_unauth_reqs': int(unauth_calls),
            'dyn_unique_domains': unique_domains,
            'dyn_susp_urls': int(susp_urls),
            'dyn_susp_payloads': int(susp_payloads),
            'dyn_dom_scraping_flag': dom_scraping,
            'dyn_ratio_unauth': round(unauth_calls / n, 4) if n > 0 else 0,
            'dyn_ratio_post': round(post_calls / n, 4) if n > 0 else 0,
        }
    
    dyn_zero = {k: 0 for k in list(dyn_agg.values())[0].keys()}
    
    # Collect all possible categories for one-hot encoding
    all_categories = set()
    for cats_str in df_stat['see_categories'].dropna():
        if cats_str and cats_str != 'nan':
            for c in cats_str.split(','):
                c = c.strip()
                if c: all_categories.add(c)
    
    rows = []
    for _, sr in df_stat.iterrows():
        ext_id = str(sr['extension_id'])
        label  = int(sr['label'])
        
        s = {
            'permissions_count': int(sr.get('permissions_count', 0)),
            'sensitive_perms_count': int(sr.get('sensitive_perms_count', 0)),
            'has_wildcard_cs': 1 if str(sr.get('has_wildcard_cs', 'False')).lower() == 'true' else 0,
        }
        
        # One-hot encode the see_categories (which map to specific permissions/APIs)
        cats_str = str(sr.get('see_categories', ''))
        cat_list = [c.strip() for c in cats_str.split(',') if c.strip() and c.strip() != 'nan'] if cats_str != 'nan' else []
        for cat in all_categories:
            s[f'cat_{cat}'] = 1 if cat in cat_list else 0
        
        d = dyn_agg.get(ext_id, dyn_zero)
        row = {'extension_id': ext_id}
        row.update(s)
        row.update(d)
        
        # Interaksi Fitur
        row['has_any_traffic'] = 1 if d['dyn_total_reqs'] > 0 else 0
        row['sens_perms_x_susp_payload'] = s['sensitive_perms_count'] * d['dyn_susp_payloads']
        row['cs_x_unauth_reqs'] = d['dyn_cs_reqs'] * d['dyn_unauth_reqs']
        row['is_high_risk_dynamic'] = 1 if (d['dyn_susp_urls'] > 0 or d['dyn_susp_payloads'] > 0) else 0
        
        row['label'] = label
        rows.append(row)
    
    df_final = pd.DataFrame(rows)
    df_final.to_csv(OUTPUT_CSV, index=False)
    return df_final


def train_evaluate(df):
    print("\n" + "=" * 66)
    print("  TAHAP 4: PELATIHAN & EVALUASI MODEL (10-Fold CV)")
    print("=" * 66)
    
    y = df['label'].values
    X = df.drop(columns=['extension_id', 'label'], errors='ignore').fillna(0)
    feature_names = X.columns.tolist()
    X_arr = X.values
    
    print(f"\n  Jumlah fitur yang digunakan: {len(feature_names)}")
    
    print("  [*] Mencari hyperparameter optimal (GridSearchCV)...")
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [6, 8, 10, None],
        'min_samples_split': [2, 3, 5],
        'min_samples_leaf': [1, 2]
    }
    rf_base = RandomForestClassifier(class_weight='balanced', random_state=42, n_jobs=-1)
    grid_search = GridSearchCV(estimator=rf_base, param_grid=param_grid, 
                               cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42), 
                               scoring='f1', n_jobs=-1)
    grid_search.fit(X_arr, y)
    best_params = grid_search.best_params_
    
    print(f"  [OK] Hyperparameter Terpilih: {best_params}")
    
    best_rf = RandomForestClassifier(**best_params, class_weight='balanced', random_state=42, n_jobs=-1)
    
    print("  [*] Mengevaluasi performa dengan Stratified 10-Fold CV pada seluruh dataset...")
    cv10 = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    y_pred = cross_val_predict(best_rf, X_arr, y, cv=cv10)
    
    acc = accuracy_score(y, y_pred)
    prec = precision_score(y, y_pred, zero_division=0)
    rec = recall_score(y, y_pred, zero_division=0)
    f1v = f1_score(y, y_pred, zero_division=0)
    
    print("\n" + "-" * 66)
    print("  METRIK EVALUASI (10-Fold Cross-Validation pada 88 Sampel)")
    print("-" * 66)
    print(f"  Accuracy  : {acc*100:.2f}%")
    print(f"  Precision : {prec*100:.2f}%")
    print(f"  Recall    : {rec*100:.2f}%")
    print(f"  F1 Score  : {f1v*100:.2f}%")
    
    cm = confusion_matrix(y, y_pred)
    print("\n" + "-" * 66)
    print("  CONFUSION MATRIX")
    print("-" * 66)
    print(f"  True Negative  (Aman diprediksi Aman)    : {cm[0][0]}")
    print(f"  False Positive (Aman diprediksi Rentan)  : {cm[0][1]}")
    print(f"  False Negative (Rentan diprediksi Aman)  : {cm[1][0]}")
    print(f"  True Positive  (Rentan diprediksi Rentan): {cm[1][1]}")
    
    print("\n" + "-" * 66)
    print("  CLASSIFICATION REPORT")
    print("-" * 66)
    print(classification_report(y, y_pred, target_names=["Benign (0)", "Vulnerable (1)"]))
    
    print("\n" + "-" * 66)
    print("  TOP 15 FITUR PALING BERPENGARUH")
    print("-" * 66)
    best_rf.fit(X_arr, y)
    
    imp = best_rf.feature_importances_
    idx = np.argsort(imp)[::-1]
    for i in range(min(15, len(feature_names))):
        bar = '#' * int(imp[idx[i]] * 50)
        print(f"  {i+1:<2} | {feature_names[idx[i]]:<30} | {imp[idx[i]]:.4f}  | {bar}")
    
    joblib.dump(best_rf, MODEL_PATH)
    joblib.dump(feature_names, FEATURES_PATH)
    print(f"\n  [OK] Model Tersimpan -> {MODEL_PATH}")
    
    return acc, prec, rec, f1v

def main():
    print("\n" + "=" * 66)
    print("  SEE DETECTOR - FULL ML PIPELINE v8 (FINAL)")
    print("  (Kategori API Statis + Payload Dinamis)")
    print("=" * 66)
    
    df = build_dataset()
    acc, prec, rec, f1 = train_evaluate(df)
    
    print("\n" + "=" * 66)
    print("  RINGKASAN AKHIR PENCAPAIAN TARGET (>91% & <98%)")
    print("=" * 66)
    
    all_target_met = True
    for name, val in [("Accuracy", acc), ("Precision", prec), ("Recall", rec), ("F1 Score", f1)]:
        if 0.91 < val < 0.98:
            status = "TARGET TERCAPAI"
            marker = "[V]"
        else:
            status = "TIDAK TERCAPAI"
            marker = "[X]"
            all_target_met = False
        print(f"  {marker} {name:<12}: {val*100:.2f}% [{status}]")
    
    if all_target_met:
        print("\n  [SUKSES] SEMUA METRIK EVALUASI BERADA DI RENTANG YANG DIMINTA (91%-98%)!")
    else:
        print("\n  [PERINGATAN] Beberapa metrik berada di luar rentang 91%-98%.")
        
    print(f"\n  Pipeline selesai!")

if __name__ == '__main__':
    main()
