import os
import sys
import json
import joblib
import pandas as pd
import re
import urllib.request
import urllib.error
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

def process_extension_analysis(filepath):
    """Common pipeline logic to analyze an extension file and return response data."""
    try:
        # 1. Extract File
        success, ext_dir = extract_crx_or_zip(filepath, app.config['EXTRACT_FOLDER'])
        if not success:
            return {"error": f"Gagal mengekstrak ekstensi: {ext_dir}", "code": 500}
            
        # 2. Static Analysis
        static_result = analyze_extension(ext_dir)
        if 'error' in static_result:
            return {"error": f"Kesalahan analisis statis: {static_result['error']}", "code": 500}
            
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
        df = pd.DataFrame([features_dict])
        
        # Ensure all columns exist, fill missing with 0
        for col in feature_names:
            if col not in df.columns:
                df[col] = 0
                
        # Reorder columns to match model expectations exactly
        X_input = df[feature_names]
        X_input = X_input.fillna(0)
        
        # 5. Prediction
        prediction = model.predict(X_input)[0]
        prob = model.predict_proba(X_input)[0]
        
        status = "MALICIOUS" if prediction == 1 else "SAFE"
        
        # Hitung skor keyakinan berdasarkan kelas yang diprediksi
        if status == "MALICIOUS":
            confidence_score = prob[1] * 100
        else:
            confidence_score = prob[0] * 100
        
        # Determine specific insights to show on UI
        top_insights = {
            "Total HTTP APIs": features_dict.get("http_api_total_count", 0),
            "Unauthorized Domains": features_dict.get("unauthorized_domain_count", 0),
            "Sensitive Permissions": features_dict.get("sensitive_permissions_count", 0),
            "Pola Pencocokan Holistik": "Ya" if features_dict.get("has_holistic_match_pattern") else "Tidak",
            "Mengekstraksi Cookie": "Ya" if features_dict.get("cookies_stolen") else "Tidak"
        }
        
        response_data = {
            "status": status,
            "score": round(confidence_score, 2),
            "see_categories": static_result['metadata'].get('see_categories_str', ''),
            "insights": top_insights,
            "dynamic_logs": dynamic_features.get("captured_requests", [])
        }
        return {"data": response_data, "code": 200}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Kesalahan internal peladen: {str(e)}", "code": 500}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/analyze', methods=['POST'])
def analyze():
    if model is None:
        return jsonify({"error": "Model ML tidak dimuat di peladen."}), 500
        
    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file yang diunggah"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Tidak ada file yang dipilih"}), 400
        
    if not (file.filename.endswith('.crx') or file.filename.endswith('.zip')):
        return jsonify({"error": "Hanya file .crx atau .zip yang didukung"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    result = process_extension_analysis(filepath)
    if "error" in result:
        return jsonify({"error": result["error"]}), result["code"]
    return jsonify(result["data"])


@app.route('/api/analyze_url', methods=['POST'])
def analyze_url():
    if model is None:
        return jsonify({"error": "Model ML tidak dimuat di peladen."}), 500
        
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "Tidak ada URL yang diberikan"}), 400
        
    url = data['url']
    
    # Extract extension ID using regex (32 lowercase letters a-z)
    match = re.search(r'/([a-z]{32})(?:/|\?|$)', url)
    if not match:
        return jsonify({"error": "Format URL tidak valid. Tidak dapat menemukan ID ekstensi (32 karakter)."}), 400
        
    ext_id = match.group(1)
    
    # Download the CRX from Chrome Web Store
    download_url = f"https://clients2.google.com/service/update2/crx?response=redirect&prodversion=114.0.5735.199&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc"
    
    filename = secure_filename(f"{ext_id}.crx")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    try:
        print(f"Mencoba mengunduh ekstensi {ext_id} dari CWS...")
        req = urllib.request.Request(
            download_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Berhasil diunduh ke {filepath}")
    except urllib.error.HTTPError as e:
        return jsonify({"error": f"Gagal mengunduh ekstensi. Ekstensi mungkin berbayar, memerlukan autentikasi, atau telah dihapus oleh Google. Kode Error: {e.code}"}), 400
    except Exception as e:
        return jsonify({"error": f"Gagal mengunduh ekstensi dari peladen Google: {str(e)}"}), 500
        
    # Process the downloaded file
    result = process_extension_analysis(filepath)
    if "error" in result:
        return jsonify({"error": result["error"]}), result["code"]
    return jsonify(result["data"])


if __name__ == '__main__':
    print("Mulai server Flask Web V2 di http://localhost:5001")
    app.run(debug=True, port=5001)
