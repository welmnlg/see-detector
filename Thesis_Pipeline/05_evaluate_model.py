import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

def evaluate_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    results_dir = os.path.join(base_dir, "Thesis_Pipeline", "results")
    models_dir = os.path.join(base_dir, "Thesis_Pipeline", "models")
    
    dataset_path = os.path.join(results_dir, "final_dataset.csv")
    model_path = os.path.join(models_dir, 'see_rf_model.pkl')
    features_path = os.path.join(models_dir, 'feature_names.pkl')

    print("=== 5. EVALUASI MODEL (METRIK & FEATURE IMPORTANCE) ===")
    
    if not os.path.exists(model_path):
        print(f"Model tidak ditemukan di: {model_path}")
        print("Pastikan Anda sudah menjalankan 04_train_model.py")
        return

    rf = joblib.load(model_path)
    feature_names = joblib.load(features_path)
    df = pd.read_csv(dataset_path)
    
    metadata_cols = ['extension_id', 'see_categories']
    y = df['label']
    
    leakage_cols = ['has_host_permissions', 'host_permissions_count']
    cols_to_drop = ['label'] + metadata_cols + leakage_cols
    X = df.drop(columns=cols_to_drop, errors='ignore')
    X = X.fillna(0)
    
    y_pred = rf.predict(X)
    
    # 1. Metrics
    print("\n--- METRIK EVALUASI ---")
    print(f"Accuracy: {accuracy_score(y, y_pred):.4f}")
    print(f"Precision: {precision_score(y, y_pred):.4f}")
    print(f"Recall: {recall_score(y, y_pred):.4f}")
    print(f"F1 Score: {f1_score(y, y_pred):.4f}")
    
    print("\n--- CONFUSION MATRIX ---")
    cm = confusion_matrix(y, y_pred)
    print(f"True Negative (Aman terdeteksi Aman): {cm[0][0]}")
    print(f"False Positive (Aman terdeteksi Rentan): {cm[0][1]}")
    print(f"False Negative (Rentan terdeteksi Aman): {cm[1][0]}")
    print(f"True Positive (Rentan terdeteksi Rentan): {cm[1][1]}")
    
    print("\n--- CLASSIFICATION REPORT ---")
    print(classification_report(y, y_pred, target_names=["Benign (0)", "Vulnerable (1)"]))

    # 2. Feature Importance
    print("\n--- TOP 15 FITUR PALING BERPENGARUH (FEATURE IMPORTANCE) ---")
    importances = rf.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    print(f"{'Rank':<5} | {'Nama Fitur':<35} | {'Importance':<15}")
    print("-" * 60)
    for i in range(min(15, len(feature_names))):
        print(f"{i+1:<5} | {feature_names[indices[i]]:<35} | {importances[indices[i]]:.4f}")
        
    print("\nEvaluasi selesai! Model siap digunakan untuk mendeteksi ekstensi SEE di masa depan.")

if __name__ == "__main__":
    evaluate_model()
