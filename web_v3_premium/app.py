import os
import sys
import json
import joblib
import pandas as pd
import re
import html
import urllib.request
import urllib.error
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, render_template

# Ensure we can import from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from extractor.crx_extractor import extract_crx_or_zip
from see_static_latest.see_engine import analyze_extension_dir as analyze_extension
from dynamic.see_traffic_capture.see_traffic_runner import SEETrafficRunner as DynamicSandbox

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['EXTRACT_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'extracted')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max limit

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['EXTRACT_FOLDER'], exist_ok=True)

# Load the trained model globally (V12 Generalized)
THESIS_MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Thesis_Pipeline', 'models')
MODEL_PATH = os.path.join(THESIS_MODELS_DIR, 'see_rf_model_v12.pkl')
FEATURES_PATH = os.path.join(THESIS_MODELS_DIR, 'feature_names_v12.pkl')
try:
    model = joblib.load(MODEL_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    print(f"Loaded V12 Generalized ML model successfully. Expected {len(feature_names)} features.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    feature_names = []


# --- Behavioral Feature Extraction Functions (V12) ---
def is_reversed_b64(payload):
    p = str(payload).strip()
    if len(p) > 20 and p.startswith('==') and not ' ' in p:
        return 1
    if len(p) > 20 and p.startswith('91Hbs') and not ' ' in p:
        return 1
    return 0

def has_url_in_payload(payload):
    p = str(payload)
    if re.search(r'(https?://|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}', p, re.IGNORECASE):
        return 1
    return 0

def has_html_in_payload(payload):
    p = str(payload)
    if re.search(r'<html>|<body|<tbody|<div|<script|<iframe|<td', p, re.IGNORECASE):
        return 1
    return 0

def has_sensitive_in_payload(payload):
    p = str(payload)
    if re.search(r'cookie|token|password|session|username|document\.location|localStorage|keys|exfil|PIN|OTP|secret', p, re.IGNORECASE):
        return 1
    if re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', p):
        return 1
    return 0

def is_telemetry_leak(url, payload):
    u = str(url).lower()
    p = str(payload).lower()
    if re.search(r'(/track|/log|/collect|/metrics|/telemetry|/pixel)', u):
        if has_sensitive_in_payload(p) or has_url_in_payload(p):
            return 1
    return 0


def process_extension_analysis(filepath):
    """Pipeline logic to analyze an extension file and return response data using V12 model."""
    try:
        # 1. Extract File
        success, ext_dir = extract_crx_or_zip(filepath, app.config['EXTRACT_FOLDER'])
        if not success:
            return {"error": f"Gagal mengekstrak ekstensi: {ext_dir}", "code": 500}
            
        # 2. Static Analysis
        static_result = analyze_extension(ext_dir)
        if 'error' in static_result:
            return {"error": f"Kesalahan analisis statis: {static_result['error']}", "code": 500}
            
        s = static_result.get('features', {})
        categories_list = static_result.get('categories', [])
        cats_str = ', '.join(categories_list)
        cat_list = categories_list
        
        # 3. Dynamic Analysis
        profile_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dynamic', 'test_browser_profile')
        sandbox = DynamicSandbox(ext_dir, user_profile_dir=profile_dir)
        dynamic_features = sandbox.run_analysis()
        captured_reqs = dynamic_features.get("captured_traffic", [])
        
        n = len(captured_reqs)
        cs_calls = sum(1 for r in captured_reqs if 'Content Script' in str(r.get('source', '')))
        sw_calls = sum(1 for r in captured_reqs if 'Service Worker' in str(r.get('source', '')))
        post_calls = sum(1 for r in captured_reqs if str(r.get('method', '')).upper() == 'POST')
        unauth_calls = sum(1 for r in captured_reqs if str(r.get('is_unauthorized_domain', '')).lower() == 'true')
        
        unique_domains = len(set(r.get('domain') for r in captured_reqs if r.get('domain')))
        
        dyn_has_url = 0
        dyn_has_html = 0
        dyn_has_sens = 0
        dyn_obfs_b64 = 0
        telemetry_leaks = 0
        dom_scraping = 0
        
        for req in captured_reqs:
            pay = req.get('post_data_preview', '')
            dom = req.get('domain', '')
            url = req.get('url', '')
            dyn_has_url += has_url_in_payload(pay)
            dyn_has_html += has_html_in_payload(pay)
            dyn_has_sens += has_sensitive_in_payload(pay)
            dyn_obfs_b64 += is_reversed_b64(pay)
            telemetry_leaks += is_telemetry_leak(url, pay)
            
            # Simple check for dom scraping in evidence
            ev = str(req.get('evidence_summary', ''))
            if 'dom_scraping' in ev.lower():
                dom_scraping = 1
                
        d = {
            'dyn_total_reqs': n,
            'dyn_cs_reqs': cs_calls,
            'dyn_sw_reqs': sw_calls,
            'dyn_post_reqs': post_calls,
            'dyn_unauth_reqs': unauth_calls,
            'dyn_unique_domains': unique_domains,
            'dyn_payload_has_url': dyn_has_url,
            'dyn_payload_has_html': dyn_has_html,
            'dyn_payload_has_sensitive': dyn_has_sens,
            'dyn_telemetry_leak': telemetry_leaks,
            'dyn_obfs_b64': dyn_obfs_b64,
            'dyn_dom_scraping_flag': dom_scraping,
            'dyn_ratio_unauth': round(unauth_calls / n, 4) if n > 0 else 0,
            'dyn_ratio_post': round(post_calls / n, 4) if n > 0 else 0,
        }
        
        # Build features dict for prediction
        row = {}
        row['permissions_count'] = s.get('permissions_count', 0)
        row['sensitive_perms_count'] = s.get('sensitive_permissions_count', 0)
        row['has_wildcard_cs'] = 1 if s.get('has_wildcard_cs') else 0
        
        # Categories
        for feature in feature_names:
            if feature.startswith('cat_'):
                cat = feature.replace('cat_', '')
                row[feature] = 1 if cat in cat_list else 0
                
        row.update(d)
        row['has_any_traffic'] = 1 if d['dyn_total_reqs'] > 0 else 0
        row['cs_x_unauth_reqs'] = d['dyn_cs_reqs'] * d['dyn_unauth_reqs']
        
        total_suspicious_payloads = d['dyn_payload_has_sensitive'] + d['dyn_payload_has_html'] + d['dyn_telemetry_leak'] + d['dyn_obfs_b64']
        row['sens_perms_x_leakage'] = row['sensitive_perms_count'] * total_suspicious_payloads
        row['is_high_risk_dynamic'] = 1 if (total_suspicious_payloads > 0) else 0

        # 4. Prepare Features for ML
        df = pd.DataFrame([row])
        for col in feature_names:
            if col not in df.columns:
                df[col] = 0
                
        X_input = df[feature_names].fillna(0)
        
        # 5. Prediction
        prediction = model.predict(X_input)[0]
        prob = model.predict_proba(X_input)[0]
        
        status = "MALICIOUS" if prediction == 1 else "SAFE"
        confidence_score = prob[1] * 100 if status == "MALICIOUS" else prob[0] * 100
        
        # Determine specific insights to show on UI
        top_insights = {
            "Total HTTP Request": n,
            "Domain Tak Dikenal": unauth_calls,
            "Izin Sensitif": row['sensitive_perms_count'],
            "Indikasi Leakage (URL/Data)": total_suspicious_payloads,
            "Danger Multiplier Score": row['sens_perms_x_leakage']
        }
        
        # Extract behavioral evidence
        behaviors = []
        if dyn_has_url > 0: behaviors.append("URL Profiling Detected")
        if dyn_has_html > 0: behaviors.append("DOM Scraping Detected")
        if dyn_has_sens > 0: behaviors.append("Sensitive Data Leak")
        if telemetry_leaks > 0: behaviors.append("Data sent to Telemetry/Tracker")
        if dyn_obfs_b64 > 0: behaviors.append("Base64 Payload Obfuscation")
        
        # Ensure we send complete dynamic logs without heavy truncation for the detailed UI
        full_dynamic_logs = []
        for r in captured_reqs:
            full_dynamic_logs.append({
                "method": r.get('method', ''),
                "domain": r.get('domain', ''),
                "url": r.get('url', ''),
                "source": r.get('source', ''),
                "post_data": r.get('post_data_preview', ''),
                "headers": r.get('request_headers_json', '{}'),
                "evidence": r.get('evidence_summary', ''),
                "is_unauth": r.get('is_unauthorized_domain', False)
            })

        response_data = {
            "status": status,
            "score": round(confidence_score, 2),
            "see_categories": cats_str,
            "insights": top_insights,
            "behaviors": behaviors,
            "dynamic_logs": full_dynamic_logs, # Send all logs to UI
            "static_analysis": {
                "permissions_count": s.get('permissions_count', 0),
                "sensitive_perms_count": s.get('sensitive_permissions_count', 0),
                "has_content_scripts": s.get('has_content_scripts', False),
                "host_permissions_count": s.get('host_permissions_count', 0),
                "content_script_count": s.get('content_script_count', 0),
                "dnr_rule_count": s.get('dnr_rule_count', 0),
                "categories": categories_list,
                "findings": static_result.get('findings', [])
            },
            "ml_features": row # Send the exact row dict so UI can show the 30 ML features
        }
        return {"data": response_data, "code": 200}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Kesalahan internal peladen: {str(e)}", "code": 500}


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/ext_name', methods=['POST'])
def get_ext_name():
    data = request.form
    ext_id = data.get('ext_id', '').strip()
    
    if ext_id:
        # Fetch name from Chrome Web Store
        try:
            url = f'https://chromewebstore.google.com/detail/{ext_id}'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            html_content = urllib.request.urlopen(req, timeout=3).read().decode('utf-8')
            m = re.search(r'<title>(.*?)</title>', html_content, re.IGNORECASE)
            if m:
                name = m.group(1).replace('- Chrome Web Store', '').strip()
                name = html.unescape(name)
                return jsonify({'name': name})
        except Exception as e:
            pass
            
    # For uploaded files or if fetching failed, just return a generic name
    return jsonify({'name': 'Ekstensi (Lokal/ZIP)'})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    if model is None:
        return jsonify({"error": "Model ML V12 tidak dimuat di peladen."}), 500
        
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
        return jsonify({"error": "Model ML V12 tidak dimuat di peladen."}), 500
        
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "Tidak ada URL yang diberikan"}), 400
        
    url = data['url']
    
    match = re.search(r'/([a-z]{32})(?:/|\?|$)', url)
    if not match:
        match = re.search(r'^([a-z]{32})$', url) # fallback just in case it's an ID
    
    if not match:
        return jsonify({"error": "Format tidak valid. Masukkan URL CWS atau ID Ekstensi (32 karakter)."}), 400
        
    ext_id = match.group(1)
    
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
        return jsonify({"error": f"Gagal mengunduh. Ekstensi mungkin berbayar atau telah dihapus. Kode Error: {e.code}"}), 400
    except Exception as e:
        return jsonify({"error": f"Gagal mengunduh ekstensi: {str(e)}"}), 500
        
    result = process_extension_analysis(filepath)
    if "error" in result:
        return jsonify({"error": result["error"]}), result["code"]
    return jsonify(result["data"])


if __name__ == '__main__':
    print("Mulai server Web V3 Premium di http://0.0.0.0:5001 (Bisa diakses dari jaringan lokal/Host)")
    app.run(host='0.0.0.0', debug=True, use_reloader=False, port=5001)
