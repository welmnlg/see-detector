import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
import warnings
warnings.filterwarnings('ignore')

def train_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    results_dir = os.path.join(base_dir, "Thesis_Pipeline", "results")
    dataset_path = os.path.join(results_dir, "final_dataset.csv")

    print("=== 4. PELATIHAN MACHINE LEARNING (Random Forest) ===")
    
    if not os.path.exists(dataset_path):
        print(f"Dataset tidak ditemukan: {dataset_path}")
        print("Silakan jalankan 03_merge_dataset.py terlebih dahulu.")
        return

    print("Memuat dataset...")
    df = pd.read_csv(dataset_path)
    
    # Separate features and metadata
    metadata_cols = ['extension_id', 'see_categories']
    y = df['label']
    
    # CRITICAL FIX: Prevent Data Leakage
    # has_host_permissions and host_permissions_count define the extension boundary, 
    # we drop them so the model learns behavioral logic instead of structural definition.
    leakage_cols = ['has_host_permissions', 'host_permissions_count']
    cols_to_drop = ['label'] + metadata_cols + leakage_cols
    X = df.drop(columns=cols_to_drop, errors='ignore')
    
    # Handle any missing values
    X = X.fillna(0)
    
    feature_names = X.columns.tolist()
    
    print(f"Fitur yang digunakan: {len(feature_names)}")
    print(f"Total Sampel: {len(X)} (Aman: {sum(y==0)}, Rentan: {sum(y==1)})")
    
    # Initialize Random Forest
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced')
    
    # Cross Validation 5-Fold
    print("\nMenjalankan 5-Fold Cross Validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(rf, X, y, cv=cv, scoring='accuracy', n_jobs=-1)
    
    print(f"Akurasi Rata-rata CV: {np.mean(scores)*100:.2f}% (+/- {np.std(scores)*100:.2f}%)")
    
    # Train final model on full dataset
    print("\nMelatih model final pada seluruh dataset...")
    rf.fit(X, y)
    
    # Save the model
    models_dir = os.path.join(base_dir, "Thesis_Pipeline", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'see_rf_model.pkl')
    features_path = os.path.join(models_dir, 'feature_names.pkl')
    
    joblib.dump(rf, model_path)
    joblib.dump(feature_names, features_path)
    
    print(f"Model berhasil disimpan di: {model_path}")
    print("\nLangkah 4 selesai. Silakan lanjut ke skrip 05_evaluate_model.py")

if __name__ == "__main__":
    train_model()
