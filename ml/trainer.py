import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score, StratifiedKFold
import warnings
warnings.filterwarnings('ignore')

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

def load_data():
    """Loads the dataset from CSV and returns X, y."""
    dataset_path = os.path.join(settings.FEATURES_DIR, 'dataset.csv')
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Run build-dataset first.")
        
    df = pd.read_csv(dataset_path)
    
    # Separate features and metadata
    metadata_cols = ['extension_id', 'see_categories']
    y = df['label']
    
    # CRITICAL FIX: Prevent Data Leakage
    # has_host_permissions and host_permissions_count are the definition of SEE, 
    # not behavioral observations. We must drop them to prevent the model from "cheating".
    leakage_cols = ['has_host_permissions', 'host_permissions_count']
    cols_to_drop = ['label'] + metadata_cols + leakage_cols
    X = df.drop(columns=cols_to_drop, errors='ignore')
    
    # Handle any missing values
    X = X.fillna(0)
    
    # Save feature names for later importance analysis
    feature_names = X.columns.tolist()
    
    return X, y, df[metadata_cols], feature_names

def train_model():
    """
    Trains the Random Forest model with StratifiedKFold CV.
    (SMOTE removed because dataset is naturally balanced).
    """
    print("Loading dataset...")
    try:
        X, y, metadata, feature_names = load_data()
    except FileNotFoundError as e:
        print(e)
        return
        
    print(f"Total dataset size: {len(X)}")
    print(f"Class distribution: \n{y.value_counts()}")
    
    # 1. Split Data (80/20 train/test split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=0.2, 
        random_state=settings.RANDOM_STATE, 
        stratify=y
    )
    
    print(f"\nTraining set size: {len(X_train)}")
    
    # 2. Model Training with GridSearchCV & StratifiedKFold
    print("\nTraining Random Forest model with Hyperparameter Tuning...")
    rf = RandomForestClassifier(random_state=settings.RANDOM_STATE, class_weight='balanced')
    
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5]
    }
    
    # Use 5-fold Stratified CV for robust evaluation and tuning
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=settings.RANDOM_STATE)
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=cv, scoring='roc_auc', n_jobs=-1)
    grid_search.fit(X_train, y_train)
    
    best_model = grid_search.best_estimator_
    print(f"Best parameters: {grid_search.best_params_}")
    
    # 3. K-Fold Cross Validation Evaluation on Training Set
    cv_scores = cross_val_score(best_model, X_train, y_train, cv=cv, scoring='roc_auc')
    print(f"\n--- Cross-Validation Results (Training Set) ---")
    print(f"CV ROC-AUC Scores (5-fold): {cv_scores}")
    print(f"Mean CV ROC-AUC: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    # 4. Save Model
    os.makedirs(settings.MODELS_DIR, exist_ok=True)
    model_path = os.path.join(settings.MODELS_DIR, 'rf_see_model.pkl')
    
    # Save model and feature names so we can use them later
    joblib.dump({
        'model': best_model,
        'feature_names': feature_names
    }, model_path)
    
    print(f"\nModel saved to: {model_path}")
    
    # 5. Quick Test Evaluation
    from ml.evaluator import evaluate_model_inline
    print("\n--- Test Set Evaluation ---")
    evaluate_model_inline(best_model, X_test, y_test)

if __name__ == "__main__":
    train_model()
