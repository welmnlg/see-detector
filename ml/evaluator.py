import os
import sys
import pandas as pd
import joblib
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

def evaluate_model_inline(model, X_test, y_test):
    """
    Helper function to evaluate a model inline during training.
    """
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    if len(set(y_test)) > 1: # Only calculate AUC if both classes exist in test set
        print(f"ROC-AUC:  {roc_auc_score(y_test, y_prob):.4f}")
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Benign (0)', 'Vulnerable (1)']))

def full_evaluation():
    """
    Loads the saved model and evaluates it on the test set.
    """
    from ml.trainer import load_data
    
    model_path = os.path.join(settings.MODELS_DIR, 'rf_see_model.pkl')
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}")
        return
        
    print("Loading model and dataset...")
    saved_data = joblib.load(model_path)
    model = saved_data['model']
    
    X, y, metadata, _ = load_data()
    
    from sklearn.model_selection import train_test_split
    _, X_test, _, y_test = train_test_split(
        X, y, 
        test_size=settings.TEST_SIZE, 
        random_state=settings.RANDOM_STATE, 
        stratify=y
    )
    
    print("--- Full Evaluation Results ---")
    evaluate_model_inline(model, X_test, y_test)
    
    # Feature Importance
    importances = model.feature_importances_
    feature_names = saved_data['feature_names']
    
    feature_importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importances
    }).sort_values('Importance', ascending=False)
    
    print("\nTop 10 Most Important Features:")
    print(feature_importance_df.head(10).to_string(index=False))

if __name__ == "__main__":
    full_evaluation()
