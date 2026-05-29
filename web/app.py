import os
import sys
import json
import joblib
import pandas as pd
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, render_template

# Ensure we can import from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from extractor.crx_extractor import extract_crx_or_zip
from analyzer.static_analyzer import analyze_extension
from dynamic.sandbox_runner import DynamicSandbox

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['EXTRACT_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'extracted')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max limit

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['EXTRACT_FOLDER'], exist_ok=True)

# Load the trained model globally
MODEL_PATH = os.path.join(settings.MODELS_DIR, 'rf_see_model.pkl')
try:
    model_data = joblib.load(MODEL_PATH)
    model = model_data['model']
    feature_names = model_data['feature_names']
    print(f"Loaded ML model successfully. Expected {len(feature_names)} features.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    feature_names = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if model is None:
        return jsonify({"error": "ML Model not loaded on server."}), 500
        
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not (file.filename.endswith('.crx') or file.filename.endswith('.zip')):
        return jsonify({"error": "Hanya file .crx atau .zip yang didukung"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    try:
        # 1. Extract File
        success, ext_dir = extract_crx_or_zip(filepath, app.config['EXTRACT_FOLDER'])
        if not success:
            return jsonify({"error": f"Failed to extract extension: {ext_dir}"}), 500
            
        # 2. Static Analysis
        static_result = analyze_extension(ext_dir)
        if 'error' in static_result:
            return jsonify({"error": f"Static analysis error: {static_result['error']}"}), 500
            
        features_dict = static_result['features']
        
        # 3. Dynamic Analysis
        sandbox = DynamicSandbox(ext_dir)
        dynamic_features = sandbox.run_analysis(target_urls=["https://example.com"])
        features_dict.update({
            'outbound_request_count': dynamic_features.get('outbound_request_count', 0),
            'unauthorized_domain_count': dynamic_features.get('unauthorized_domain_count', 0),
            'sends_user_data': dynamic_features.get('sends_user_data', False),
            'has_periodic_sync': dynamic_features.get('has_periodic_sync', False),
            'is_sw_initiated': dynamic_features.get('is_sw_initiated', False),
            'is_cs_initiated': dynamic_features.get('is_cs_initiated', False),
            'see_behavior_detected': dynamic_features.get('see_behavior_detected', False),
            'cookies_stolen': dynamic_features.get('cookies_stolen', False),
            'redirect_detected': dynamic_features.get('redirect_detected', False),
            'download_hijacked': dynamic_features.get('download_hijacked', False)
        })
        
        # 4. Prepare Features for ML
        # Create a single-row DataFrame with exact columns expected by the model
        df = pd.DataFrame([features_dict])
        
        # Ensure all columns exist, fill missing with 0
        for col in feature_names:
            if col not in df.columns:
                df[col] = 0
                
        # Reorder columns to match model expectations exactly
        X_input = df[feature_names]
        X_input = X_input.fillna(0) # Final safety catch
        
        # 5. Prediction
        prediction = model.predict(X_input)[0]
        prob = model.predict_proba(X_input)[0]
        vulnerability_score = prob[1] * 100 # Probability of class 1
        
        status = "MALICIOUS" if prediction == 1 else "SAFE"
        
        # 6. Gather Insightful Features
        top_insights = {
            "Total HTTP APIs": features_dict.get("http_api_total_count", 0),
            "Unauthorized Domains": features_dict.get("unauthorized_domain_count", 0),
            "Sensitive Permissions": features_dict.get("sensitive_permissions_count", 0),
            "Holistic Match Pattern (*://*/*)": "Yes" if features_dict.get("has_holistic_match_pattern") else "No",
            "Periodic Exfiltration (setInterval)": "Yes" if features_dict.get("has_setInterval") else "No"
        }
        
        response_data = {
            "status": status,
            "score": round(vulnerability_score, 2),
            "see_categories": static_result['metadata'].get('see_categories_str', ''),
            "insights": top_insights,
            "dynamic_logs": dynamic_features.get("captured_requests", [])
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
        
if __name__ == '__main__':
    print("Mulai server Flask di http://localhost:5000")
    app.run(debug=True, port=5000)
