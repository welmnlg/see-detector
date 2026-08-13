import os
import re
from pathlib import Path
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings


def scan_js_files(ext_dir):
    """
    Scans all JS files in the extension directory for HTTP APIs,
    URLs, and other patterns relevant to SEE attack detection.

    Based on ALL 6 PoC listings from Lim et al. (2025) +
    3 extended categories proposed in this research:

    ORIGINAL (Lim et al. 2025):
    - Listing 2 : User Profiling (UProf)      — scroll/click/sendMessage/setInterval
    - Listing 3 : Local File Access (LF)       — fetch file://, arrayBuffer, FormData, Blob
    - Listing 4 : Cookie Exfiltration (CE)     — cookies.getAll, document.cookie
    - Listing 5 : HTTP Hijacking (HH)          — declarativeNetRequest redirect in JS
    - Listing 6 : Unauthorized Download (UDown)— downloads.onCreated, cancel, tabs.create

    EXTENDED (This research):
    - Listing 7 : Clipboard Exfiltration (CLE) — navigator.clipboard.readText, paste event
    - Listing 8 : History Exfiltration (HE)    — chrome.history.search/getVisits
    - Listing 9 : Form/Credential Harvesting (FH)— password field listener, form submit intercept

    Returns:
        features (dict)    : Numeric/boolean features used as ML input.
        js_analysis (dict) : Detailed analysis metadata for SEE classification.
    """
    ext_path = Path(ext_dir)

    # =========================================================================
    # FEATURES — become columns in the ML dataset
    # =========================================================================
    features = {
        # --- Basic Metrics ---
        'js_file_count':                    0,
        'total_js_size_bytes':              0,

        # --- HTTP Request APIs (Lim et al. Table 1) ---
        'fetch_api_count':                  0,
        'xhr_api_count':                    0,
        'http_api_total_count':             0,
        'has_external_url_in_js':           False,
        'external_domain_count':            0,

        # --- Message Passing (Listing 2 - UProf) ---
        'has_runtime_sendMessage':          False,
        'has_onMessage_listener':           False,

        # --- Code Obfuscation Indicators ---
        'has_eval_or_function':             False,

        # --- Advanced Network APIs ---
        'has_websocket':                    False,
        'has_sendBeacon':                   False,

        # --- Cookie Access APIs (Listing 4 - CE) ---
        'has_cookies_getAll':               False,
        'has_cookies_get':                  False,
        'has_document_cookie':              False,

        # --- Data Packaging APIs (Listing 3 - LF) ---
        'has_formdata':                     False,
        'has_blob':                         False,
        'has_arraybuffer':                  False,

        # --- Periodic Sync / Timer (Listing 2b) ---
        'has_setInterval':                  False,
        'has_setTimeout':                   False,

        # --- Data Serialization ---
        'has_json_stringify':               False,
        'has_btoa':                         False,

        # --- Download Manipulation (Listing 6 - UDown) ---
        'has_downloads_onCreated':          False,
        'has_downloads_cancel':             False,
        'has_downloads_download':           False,

        # --- Tab/Navigation Manipulation (Listing 6 - UDown) ---
        'has_tabs_create':                  False,

        # --- DeclarativeNetRequest in JS (Listing 5 - HH) ---
        'has_declarativeNetRequest_js':     False,

        # ── EXTENDED: Clipboard Exfiltration (Listing 7 - CLE) ───────────────
        'has_clipboard_readText':           False,  # navigator.clipboard.readText()
        'has_clipboard_read':               False,  # navigator.clipboard.read()
        'has_clipboard_paste_event':        False,  # addEventListener('paste', ...)
        'has_clipboard_writeText':          False,  # navigator.clipboard.writeText() — suspicious write

        # ── EXTENDED: History Exfiltration (Listing 8 - HE) ─────────────────
        'has_history_search':               False,  # chrome.history.search()
        'has_history_getVisits':            False,  # chrome.history.getVisits()
        'has_history_getTopSites':          False,  # chrome.topSites.get()

        # ── EXTENDED: Form/Credential Harvesting (Listing 9 - FH) ───────────
        'has_password_field_access':        False,  # querySelector/All('input[type=password]')
        'has_form_submit_intercept':        False,  # addEventListener('submit', ...)
        'has_input_value_read':             False,  # .value on input field
        'has_autofill_intercept':           False,  # autocomplete='off' manipulation / autofill

        # ── Composite / Engineered Features (for ML) ─────────────────────────
        'sensitive_api_count':              0,      # total sensitive API calls detected
        'see_category_count':               0,      # filled by see_classifier after classification
        'risk_score':                       0,      # filled by see_classifier after scoring
    }

    # =========================================================================
    # JS_ANALYSIS — Detailed metadata for SEE category classification
    # =========================================================================
    js_analysis = {
        # UProf
        'has_scroll_listener':              False,
        'has_click_listener':               False,
        'has_keydown_listener':             False,
        'has_input_listener':               False,
        # LF
        'has_file_uri_access':              False,
        'has_data_packaging':               False,
        # CE
        'has_cookie_exfiltration_pattern':  False,
        # UProf/periodic
        'has_periodic_exfiltration':        False,
        # HH
        'has_redirect_in_js':               False,
        # UDown
        'has_download_manipulation':        False,

        # ── EXTENDED ─────────────────────────────────────────────────────────
        # CLE — clipboard exfiltration confirmed combo
        'has_clipboard_exfiltration_pattern': False,  # clipboard read + HTTP export
        # HE — history exfiltration confirmed combo
        'has_history_exfiltration_pattern':   False,  # history API + JSON.stringify + fetch
        # FH — credential harvesting confirmed combo
        'has_credential_harvesting_pattern':  False,  # password field + sendMessage/fetch

        'external_urls_found':              set(),
    }

    # =========================================================================
    # REGEX PATTERNS
    # =========================================================================

    # URLs
    url_pattern         = re.compile(r'https?://[^\s"\'\>]+')
    file_uri_pattern    = re.compile(r'file:///?')

    # Message Passing (Listing 2)
    sendMessage_pattern = re.compile(r'\b(chrome|browser)\.runtime\.sendMessage\b')
    onMessage_pattern   = re.compile(r'\b(chrome|browser)\.runtime\.onMessage\.addListener\b')

    # Code Obfuscation
    eval_pattern        = re.compile(r'\beval\s*\(|\bnew\s+Function\s*\(')

    # Event Listeners (Listing 2 - UProf)
    scroll_pattern      = re.compile(r'addEventListener\s*\(\s*[\'"]scroll[\'"]')
    click_pattern       = re.compile(r'addEventListener\s*\(\s*[\'"]click[\'"]')
    keydown_pattern     = re.compile(r'addEventListener\s*\(\s*[\'"]key(?:down|press|up)[\'"]')
    input_pattern       = re.compile(r'addEventListener\s*\(\s*[\'"](?:input|change)[\'"]')

    # Cookie APIs (Listing 4 - CE)
    cookies_getAll_pattern  = re.compile(r'\b(chrome|browser)\.cookies\.getAll\b')
    cookies_get_pattern     = re.compile(r'\b(chrome|browser)\.cookies\.get\b(?!All)')
    document_cookie_pattern = re.compile(r'\bdocument\.cookie\b')

    # Data Packaging (Listing 3 - LF)
    formdata_pattern    = re.compile(r'\bnew\s+FormData\s*\(')
    blob_pattern        = re.compile(r'\bnew\s+Blob\s*\(')
    arraybuffer_pattern = re.compile(r'\.arrayBuffer\s*\(')

    # Periodic Sync (Listing 2b)
    setInterval_pattern = re.compile(r'\bsetInterval\s*\(')
    setTimeout_pattern  = re.compile(r'\bsetTimeout\s*\(')

    # Data Serialization
    json_stringify_pattern = re.compile(r'\bJSON\.stringify\s*\(')
    btoa_pattern           = re.compile(r'\bbtoa\s*\(')

    # Download Manipulation (Listing 6 - UDown)
    downloads_onCreated_pattern     = re.compile(r'\bdownloads\.onCreated\.addListener\b')
    downloads_onDetermining_pattern = re.compile(r'\bdownloads\.onDeterminingFilename\.addListener\b')
    downloads_cancel_pattern        = re.compile(r'\bdownloads\.cancel\s*\(')
    downloads_download_pattern      = re.compile(r'\bdownloads\.download\s*\(')

    # Tab/Navigation (Listing 6)
    tabs_create_pattern = re.compile(r'\b(chrome|browser)\.tabs\.create\s*\(')

    # DeclarativeNetRequest in JS (Listing 5 - HH)
    dnr_js_pattern      = re.compile(r'\bdeclarativeNetRequest\b')
    redirect_js_pattern = re.compile(r'["\'"]redirect["\'"]')

    # ── EXTENDED: Clipboard (Listing 7 - CLE) ────────────────────────────────
    clipboard_readText_pattern  = re.compile(r'navigator\.clipboard\.readText\s*\(')
    clipboard_read_pattern      = re.compile(r'navigator\.clipboard\.read\s*\(')
    clipboard_paste_pattern     = re.compile(r'addEventListener\s*\(\s*[\'"]paste[\'"]')
    clipboard_writeText_pattern = re.compile(r'navigator\.clipboard\.writeText\s*\(')
    # Also detect clipboardData.getData in paste handler
    clipboardData_pattern       = re.compile(r'clipboardData\.getData\s*\(')

    # ── EXTENDED: History (Listing 8 - HE) ───────────────────────────────────
    history_search_pattern    = re.compile(r'\b(chrome|browser)\.history\.search\s*\(')
    history_getVisits_pattern = re.compile(r'\b(chrome|browser)\.history\.getVisits\s*\(')
    history_topSites_pattern  = re.compile(r'\b(chrome|browser)\.topSites\.get\s*\(')
    # Generic history API access
    history_api_pattern       = re.compile(r'\b(chrome|browser)\.history\.')

    # ── EXTENDED: Form/Credential Harvesting (Listing 9 - FH) ────────────────
    password_field_pattern   = re.compile(
        r'querySelector(?:All)?\s*\(\s*[\'"][^\'"]*(?:type\s*=\s*[\'"]?password|\[type=[\'"]?password)[^\'"]*[\'"]'
    )
    password_attr_pattern    = re.compile(r'input\[type=[\'"]?password[\'"]?\]')
    form_submit_pattern      = re.compile(r'addEventListener\s*\(\s*[\'"]submit[\'"]')
    input_value_pattern      = re.compile(r'\.value\b')
    autofill_pattern         = re.compile(r'autocomplete\s*=\s*[\'"](?:off|new-password)[\'"]')

    # Pre-compile HTTP API patterns (Lim et al. Table 1)
    http_regexes = [
        (name, re.compile(pattern))
        for name, pattern in zip(
            ['fetch', 'xhr', 'axios', 'ajax', 'post', 'get', 'getJSON',
             'open', 'exec', 'jsonp', 'loc', 'beacon', 'ws'],
            settings.HTTP_APIS
        )
    ]

    # =========================================================================
    # SCAN ALL JS FILES
    # =========================================================================
    for root, dirs, files in os.walk(ext_path):
        for file in files:
            if not file.endswith('.js'):
                continue

            features['js_file_count'] += 1
            filepath = os.path.join(root, file)

            try:
                size = os.path.getsize(filepath)
                features['total_js_size_bytes'] += size

                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                # === HTTP APIs ===
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
                for url in url_pattern.findall(content):
                    if not url.startswith('http://localhost') and not url.startswith('http://127.0.0.1'):
                        js_analysis['external_urls_found'].add(url)
                        features['has_external_url_in_js'] = True

                # === Message Passing (UProf) ===
                if sendMessage_pattern.search(content):
                    features['has_runtime_sendMessage'] = True
                if onMessage_pattern.search(content):
                    features['has_onMessage_listener'] = True

                # === Code Obfuscation ===
                if eval_pattern.search(content):
                    features['has_eval_or_function'] = True

                # === Event Listeners (UProf) ===
                if scroll_pattern.search(content):
                    js_analysis['has_scroll_listener'] = True
                if click_pattern.search(content):
                    js_analysis['has_click_listener'] = True
                if keydown_pattern.search(content):
                    js_analysis['has_keydown_listener'] = True
                if input_pattern.search(content):
                    js_analysis['has_input_listener'] = True

                # === File URI (LF) ===
                if file_uri_pattern.search(content):
                    js_analysis['has_file_uri_access'] = True

                # === Cookie APIs (CE) ===
                if cookies_getAll_pattern.search(content):
                    features['has_cookies_getAll'] = True
                if cookies_get_pattern.search(content):
                    features['has_cookies_get'] = True
                if document_cookie_pattern.search(content):
                    features['has_document_cookie'] = True

                # === Data Packaging (LF) ===
                if formdata_pattern.search(content):
                    features['has_formdata'] = True
                if blob_pattern.search(content):
                    features['has_blob'] = True
                if arraybuffer_pattern.search(content):
                    features['has_arraybuffer'] = True

                # === Periodic Sync ===
                if setInterval_pattern.search(content):
                    features['has_setInterval'] = True
                if setTimeout_pattern.search(content):
                    features['has_setTimeout'] = True

                # === Data Serialization ===
                if json_stringify_pattern.search(content):
                    features['has_json_stringify'] = True
                if btoa_pattern.search(content):
                    features['has_btoa'] = True

                # === Download Manipulation (UDown) ===
                if downloads_onCreated_pattern.search(content) or downloads_onDetermining_pattern.search(content):
                    js_analysis['has_download_manipulation'] = True
                    features['has_downloads_onCreated'] = True
                if downloads_cancel_pattern.search(content):
                    features['has_downloads_cancel'] = True
                    js_analysis['has_download_manipulation'] = True
                if downloads_download_pattern.search(content):
                    features['has_downloads_download'] = True

                # === Tab/Navigation (UDown) ===
                if tabs_create_pattern.search(content):
                    features['has_tabs_create'] = True

                # === DeclarativeNetRequest in JS (HH) ===
                if dnr_js_pattern.search(content):
                    features['has_declarativeNetRequest_js'] = True
                if redirect_js_pattern.search(content):
                    js_analysis['has_redirect_in_js'] = True

                # ── EXTENDED: Clipboard (CLE) ─────────────────────────────────
                if clipboard_readText_pattern.search(content):
                    features['has_clipboard_readText'] = True
                if clipboard_read_pattern.search(content):
                    features['has_clipboard_read'] = True
                if clipboard_paste_pattern.search(content) or clipboardData_pattern.search(content):
                    features['has_clipboard_paste_event'] = True
                if clipboard_writeText_pattern.search(content):
                    features['has_clipboard_writeText'] = True

                # ── EXTENDED: History (HE) ────────────────────────────────────
                if history_search_pattern.search(content):
                    features['has_history_search'] = True
                if history_getVisits_pattern.search(content):
                    features['has_history_getVisits'] = True
                if history_topSites_pattern.search(content):
                    features['has_history_getTopSites'] = True

                # ── EXTENDED: Form/Credential Harvesting (FH) ────────────────
                if password_field_pattern.search(content) or password_attr_pattern.search(content):
                    features['has_password_field_access'] = True
                if form_submit_pattern.search(content):
                    features['has_form_submit_intercept'] = True
                if input_value_pattern.search(content):
                    features['has_input_value_read'] = True
                if autofill_pattern.search(content):
                    features['has_autofill_intercept'] = True

                # ─── COMBO DETECTIONS (Cross-pattern) ────────────────────────
                has_http = (features['fetch_api_count'] > 0 or features['xhr_api_count'] > 0
                            or features['http_api_total_count'] > 0)

                # CE combo: cookies API + HTTP export
                if (cookies_getAll_pattern.search(content) or document_cookie_pattern.search(content)):
                    if has_http:
                        js_analysis['has_cookie_exfiltration_pattern'] = True

                # UProf periodic: setInterval + fetch/XHR
                if setInterval_pattern.search(content) and has_http:
                    js_analysis['has_periodic_exfiltration'] = True

                # LF data packaging: FormData/Blob + fetch
                if (formdata_pattern.search(content) or blob_pattern.search(content)) and has_http:
                    js_analysis['has_data_packaging'] = True

                # CLE combo: clipboard read + HTTP export
                if (clipboard_readText_pattern.search(content)
                        or clipboard_read_pattern.search(content)
                        or clipboard_paste_pattern.search(content)
                        or clipboardData_pattern.search(content)):
                    if has_http:
                        js_analysis['has_clipboard_exfiltration_pattern'] = True

                # HE combo: history API + JSON.stringify + HTTP export
                if history_api_pattern.search(content) and json_stringify_pattern.search(content) and has_http:
                    js_analysis['has_history_exfiltration_pattern'] = True

                # FH combo: password field access + sendMessage or HTTP export
                if (password_field_pattern.search(content) or password_attr_pattern.search(content)):
                    if sendMessage_pattern.search(content) or has_http:
                        js_analysis['has_credential_harvesting_pattern'] = True

            except Exception as e:
                print(f"Error reading JS file {filepath}: {e}")

    # Derived features
    features['external_domain_count'] = len(set(
        u.split('/')[2] for u in js_analysis['external_urls_found']
        if len(u.split('/')) > 2
    ))

    # sensitive_api_count: jumlah total API sensitif yang terdeteksi
    sensitive_flags = [
        'has_cookies_getAll', 'has_cookies_get', 'has_document_cookie',
        'has_clipboard_readText', 'has_clipboard_read', 'has_clipboard_paste_event',
        'has_history_search', 'has_history_getVisits', 'has_history_getTopSites',
        'has_password_field_access', 'has_form_submit_intercept',
        'has_downloads_onCreated', 'has_downloads_cancel',
        'has_declarativeNetRequest_js',
    ]
    features['sensitive_api_count'] = sum(1 for k in sensitive_flags if features.get(k))

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
                print("Features (non-zero/True):")
                for k, v in feats.items():
                    if v and v != 0:
                        print(f"  {k}: {v}")
                print("Analysis (True flags):")
                for k, v in analysis.items():
                    if v and k != 'external_urls_found':
                        print(f"  {k}: {v}")
