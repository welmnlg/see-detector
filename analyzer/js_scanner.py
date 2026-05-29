import os
import re
from pathlib import Path
import sys

# Add parent directory to path to import settings
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

def scan_js_files(ext_dir):
    """
    Scans all JS files in the extension directory for HTTP APIs,
    URLs, and other patterns relevant to SEE attack detection.
    
    Based on ALL 6 PoC listings from Lim et al. (2025):
      - Listing 2: User Profiling (UProf) — scroll/click/sendMessage/setInterval
      - Listing 3: Local File Access (LF) — fetch file://, arrayBuffer, FormData, Blob
      - Listing 4: Cookie Exfiltration (CE) — cookies.getAll, document.cookie
      - Listing 5: HTTP Hijacking (HH) — declarativeNetRequest in JS
      - Listing 6: Unauthorized Download (UDown) — downloads.onCreated, downloads.cancel, tabs.create
    
    Returns:
        features (dict): Numeric/boolean features used as ML input.
        js_analysis (dict): Detailed analysis metadata for SEE classification.
    """
    ext_path = Path(ext_dir)
    
    # =========================================================================
    # FEATURES: These become columns in the ML dataset
    # =========================================================================
    features = {
        # --- Basic Metrics ---
        'js_file_count': 0,
        'total_js_size_bytes': 0,
        
        # --- HTTP Request APIs (Lim et al. Table 1) ---
        'fetch_api_count': 0,
        'xhr_api_count': 0,
        'http_api_total_count': 0,
        'has_external_url_in_js': False,
        'external_domain_count': 0,
        
        # --- Message Passing (Listing 2 - UProf) ---
        'has_runtime_sendMessage': False,
        'has_onMessage_listener': False,
        
        # --- Code Obfuscation Indicators ---
        'has_eval_or_function': False,
        
        # --- Advanced Network APIs ---
        'has_websocket': False,
        'has_sendBeacon': False,
        
        # --- Cookie Access APIs (Listing 4 - CE) ---
        'has_cookies_getAll': False,         # browser.cookies.getAll()
        'has_cookies_get': False,            # browser.cookies.get()
        'has_document_cookie': False,        # document.cookie access
        
        # --- Data Packaging APIs (Listing 3 - LF) ---
        'has_formdata': False,               # new FormData()
        'has_blob': False,                   # new Blob()
        'has_arraybuffer': False,            # .arrayBuffer()
        
        # --- Periodic Sync / Timer (Listing 2b - exfiltration timer) ---
        'has_setInterval': False,            # setInterval() for periodic data export
        'has_setTimeout': False,             # setTimeout() for delayed export
        
        # --- Data Serialization ---
        'has_json_stringify': False,          # JSON.stringify() for data packaging
        'has_btoa': False,                   # btoa() base64 encoding (data obfuscation)
        
        # --- Download Manipulation (Listing 6 - UDown) ---
        'has_downloads_onCreated': False,     # downloads.onCreated.addListener
        'has_downloads_cancel': False,        # downloads.cancel()
        'has_downloads_download': False,      # downloads.download()
        
        # --- Tab/Navigation Manipulation (Listing 6 - UDown) ---
        'has_tabs_create': False,            # tabs.create({url: malware})
        
        # --- DeclarativeNetRequest in JS (Listing 5 - HH) ---
        'has_declarativeNetRequest_js': False, # updateDynamicRules etc. in JS
    }
    
    # =========================================================================
    # JS_ANALYSIS: Detailed metadata for SEE category classification
    # =========================================================================
    js_analysis = {
        'has_scroll_listener': False,
        'has_click_listener': False,
        'has_keydown_listener': False,        # NEW: keylogger detection
        'has_input_listener': False,           # NEW: form input interception
        'has_file_uri_access': False,
        'has_download_manipulation': False,
        'has_cookie_exfiltration_pattern': False,  # NEW: cookies.getAll + fetch combo
        'has_periodic_exfiltration': False,         # NEW: setInterval + fetch combo
        'has_data_packaging': False,                # NEW: FormData/Blob + fetch combo
        'has_redirect_in_js': False,                # NEW: redirect patterns in JS
        'external_urls_found': set()
    }

    # =========================================================================
    # REGEX PATTERNS
    # =========================================================================
    
    # --- URLs ---
    url_pattern = re.compile(r'https?://[^\s"\'\>]+')
    file_uri_pattern = re.compile(r'file:///?')
    
    # --- Message Passing (Listing 2) ---
    sendMessage_pattern = re.compile(r'\b(chrome|browser)\.runtime\.sendMessage\b')
    onMessage_pattern = re.compile(r'\b(chrome|browser)\.runtime\.onMessage\.addListener\b')
    
    # --- Code Obfuscation ---
    eval_pattern = re.compile(r'\beval\s*\(|\bnew\s+Function\s*\(')
    
    # --- Event Listeners (Listing 2 - UProf + UReq) ---
    scroll_pattern = re.compile(r'addEventListener\s*\(\s*[\'"]scroll[\'"]')
    click_pattern = re.compile(r'addEventListener\s*\(\s*[\'"]click[\'"]')
    keydown_pattern = re.compile(r'addEventListener\s*\(\s*[\'"]key(?:down|press|up)[\'"]')
    input_pattern = re.compile(r'addEventListener\s*\(\s*[\'"](?:input|change)[\'"]')
    
    # --- Cookie APIs (Listing 4 - CE) ---
    cookies_getAll_pattern = re.compile(r'\b(chrome|browser)\.cookies\.getAll\b')
    cookies_get_pattern = re.compile(r'\b(chrome|browser)\.cookies\.get\b(?!All)')
    document_cookie_pattern = re.compile(r'\bdocument\.cookie\b')
    
    # --- Data Packaging (Listing 3 - LF) ---
    formdata_pattern = re.compile(r'\bnew\s+FormData\s*\(')
    blob_pattern = re.compile(r'\bnew\s+Blob\s*\(')
    arraybuffer_pattern = re.compile(r'\.arrayBuffer\s*\(')
    
    # --- Periodic Sync (Listing 2b) ---
    setInterval_pattern = re.compile(r'\bsetInterval\s*\(')
    setTimeout_pattern = re.compile(r'\bsetTimeout\s*\(')
    
    # --- Data Serialization ---
    json_stringify_pattern = re.compile(r'\bJSON\.stringify\s*\(')
    btoa_pattern = re.compile(r'\bbtoa\s*\(')
    
    # --- Download Manipulation (Listing 6 - UDown) ---
    downloads_onCreated_pattern = re.compile(r'\bdownloads\.onCreated\.addListener\b')
    downloads_onDetermining_pattern = re.compile(r'\bdownloads\.onDeterminingFilename\.addListener\b')
    downloads_cancel_pattern = re.compile(r'\bdownloads\.cancel\s*\(')
    downloads_download_pattern = re.compile(r'\bdownloads\.download\s*\(')
    
    # --- Tab/Navigation (Listing 6) ---
    tabs_create_pattern = re.compile(r'\b(chrome|browser)\.tabs\.create\s*\(')
    
    # --- DeclarativeNetRequest in JS (Listing 5 - HH) ---
    dnr_js_pattern = re.compile(r'\bdeclarativeNetRequest\b')
    redirect_js_pattern = re.compile(r'["\']redirect["\']')
    
    # --- Pre-compile HTTP API patterns (Lim et al. Table 1) ---
    http_regexes = [(name, re.compile(pattern)) for name, pattern in zip(
        ['fetch', 'xhr', 'axios', 'ajax', 'post', 'get', 'getJSON', 'open', 'exec', 'jsonp', 'loc', 'beacon', 'ws'],
        settings.HTTP_APIS
    )]

    # =========================================================================
    # SCAN ALL JS FILES
    # =========================================================================
    for root, dirs, files in os.walk(ext_path):
        for file in files:
            if file.endswith('.js'):
                features['js_file_count'] += 1
                filepath = os.path.join(root, file)
                try:
                    size = os.path.getsize(filepath)
                    features['total_js_size_bytes'] += size
                    
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                        # === HTTP APIs (Lim et al. Table 1) ===
                        for name, pattern in http_regexes:
                            matches = len(pattern.findall(content))
                            if matches > 0:
                                features['http_api_total_count'] += matches
                                if name == 'fetch':
                                    features['fetch_api_count'] += matches
                                elif name == 'xhr':
                                    features['xhr_api_count'] += matches
                                elif name == 'ws':
                                    features['has_websocket'] = True
                                elif name == 'beacon':
                                    features['has_sendBeacon'] = True
                                    
                        # === External URLs ===
                        urls = url_pattern.findall(content)
                        for url in urls:
                            if not url.startswith('http://localhost') and not url.startswith('http://127.0.0.1'):
                                js_analysis['external_urls_found'].add(url)
                                features['has_external_url_in_js'] = True
                                
                        # === Message Passing (Listing 2 - UProf) ===
                        if sendMessage_pattern.search(content):
                            features['has_runtime_sendMessage'] = True
                        if onMessage_pattern.search(content):
                            features['has_onMessage_listener'] = True
                            
                        # === Code Obfuscation ===
                        if eval_pattern.search(content):
                            features['has_eval_or_function'] = True
                            
                        # === Event Listeners (Listing 2 - UProf / UReq) ===
                        if scroll_pattern.search(content):
                            js_analysis['has_scroll_listener'] = True
                        if click_pattern.search(content):
                            js_analysis['has_click_listener'] = True
                        if keydown_pattern.search(content):
                            js_analysis['has_keydown_listener'] = True
                        if input_pattern.search(content):
                            js_analysis['has_input_listener'] = True
                            
                        # === File URI (Listing 3 - LF) ===
                        if file_uri_pattern.search(content):
                            js_analysis['has_file_uri_access'] = True
                            
                        # === Cookie APIs (Listing 4 - CE) ===
                        if cookies_getAll_pattern.search(content):
                            features['has_cookies_getAll'] = True
                        if cookies_get_pattern.search(content):
                            features['has_cookies_get'] = True
                        if document_cookie_pattern.search(content):
                            features['has_document_cookie'] = True
                            
                        # === Data Packaging (Listing 3 - LF) ===
                        if formdata_pattern.search(content):
                            features['has_formdata'] = True
                        if blob_pattern.search(content):
                            features['has_blob'] = True
                        if arraybuffer_pattern.search(content):
                            features['has_arraybuffer'] = True
                            
                        # === Periodic Sync (Listing 2b) ===
                        if setInterval_pattern.search(content):
                            features['has_setInterval'] = True
                        if setTimeout_pattern.search(content):
                            features['has_setTimeout'] = True
                            
                        # === Data Serialization ===
                        if json_stringify_pattern.search(content):
                            features['has_json_stringify'] = True
                        if btoa_pattern.search(content):
                            features['has_btoa'] = True
                            
                        # === Download Manipulation (Listing 6 - UDown) ===
                        if downloads_onCreated_pattern.search(content) or downloads_onDetermining_pattern.search(content):
                            js_analysis['has_download_manipulation'] = True
                            features['has_downloads_onCreated'] = True
                        if downloads_cancel_pattern.search(content):
                            features['has_downloads_cancel'] = True
                            js_analysis['has_download_manipulation'] = True
                        if downloads_download_pattern.search(content):
                            features['has_downloads_download'] = True
                            
                        # === Tab/Navigation (Listing 6 - UDown) ===
                        if tabs_create_pattern.search(content):
                            features['has_tabs_create'] = True
                            
                        # === DeclarativeNetRequest in JS (Listing 5 - HH) ===
                        if dnr_js_pattern.search(content):
                            features['has_declarativeNetRequest_js'] = True
                        if redirect_js_pattern.search(content):
                            js_analysis['has_redirect_in_js'] = True
                            
                        # === Combo Detections (Cross-pattern analysis) ===
                        # Cookie exfil pattern: cookies API + any HTTP export
                        if (cookies_getAll_pattern.search(content) or document_cookie_pattern.search(content)):
                            if features['http_api_total_count'] > 0:
                                js_analysis['has_cookie_exfiltration_pattern'] = True
                                
                        # Periodic exfil pattern: setInterval + fetch/XHR
                        if setInterval_pattern.search(content):
                            if features['fetch_api_count'] > 0 or features['xhr_api_count'] > 0:
                                js_analysis['has_periodic_exfiltration'] = True
                                
                        # Data packaging pattern: FormData/Blob + fetch
                        if (formdata_pattern.search(content) or blob_pattern.search(content)):
                            if features['fetch_api_count'] > 0:
                                js_analysis['has_data_packaging'] = True
                            
                except Exception as e:
                    print(f"Error reading JS file {filepath}: {e}")

    # Compute derived features
    features['external_domain_count'] = len(set(
        [u.split('/')[2] for u in js_analysis['external_urls_found'] if len(u.split('/')) > 2]
    ))

    return features, js_analysis

if __name__ == "__main__":
    from config import settings
    import json
    test_dir = os.path.join(settings.EXTRACTED_DIR, 'vulnerable')
    if os.path.exists(test_dir):
        for item in sorted(os.listdir(test_dir)):
            ext_path = os.path.join(test_dir, item)
            if os.path.isdir(ext_path):
                print(f"\n{'='*60}")
                print(f"Scanning: {item}")
                print(f"{'='*60}")
                feats, analysis = scan_js_files(ext_path)
                # Only print non-zero/True features
                print("Features:")
                for k, v in feats.items():
                    if v and v != 0:
                        print(f"  {k}: {v}")
                print("Analysis:")
                for k, v in analysis.items():
                    if v and k != 'external_urls_found':
                        print(f"  {k}: {v}")
