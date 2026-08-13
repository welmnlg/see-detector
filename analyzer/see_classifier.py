# =============================================================================
# see_classifier.py
# SEE Category Classifier + Risk Scoring
#
# Mengklasifikasikan ekstensi ke dalam kategori SEE berdasarkan fitur
# analisis statis dan menghitung risk score untuk output laporan.
#
# ORIGINAL (Lim et al. 2025):
#   UReq  - Unauthorized HTTP Request
#   UProf - User Profiling
#   LF    - Local File Access
#   CE    - Cookie Exfiltration
#   HH    - HTTP Hijacking
#   UDown - Unauthorized Download
#
# EXTENDED (Penelitian ini):
#   CLE   - Clipboard Exfiltration
#   HE    - History Exfiltration
#   FH    - Form/Credential Harvesting
# =============================================================================

# Risk weight per kategori SEE (digunakan untuk kalkulasi risk_score)
CATEGORY_WEIGHTS = {
    'FH':    40,   # Form/Credential Harvesting — langsung mengancam kredensial
    'CE':    35,   # Cookie Exfiltration        — data sesi sensitif
    'CLE':   30,   # Clipboard Exfiltration     — data sensitif tak terstruktur
    'HE':    25,   # History Exfiltration       — profil aktivitas pengguna
    'LF':    25,   # Local File Access          — akses filesystem
    'UProf': 20,   # User Profiling             — pemantauan perilaku
    'UDown': 20,   # Unauthorized Download      — manipulasi download
    'HH':    20,   # HTTP Hijacking             — pengalihan traffic
    'UReq':  10,   # Unauthorized Request       — request keluar tanpa izin
}

# Bonus obfuscation weight
OBFUSCATION_WEIGHT = 10

# Risk level thresholds
RISK_THRESHOLDS = {
    'HIGH':   61,   # >= 61  → Merah  (Rentan/Berbahaya)
    'MEDIUM': 31,   # 31-60  → Kuning (Menengah/Waspada)
    'LOW':    0,    # 0-30   → Hijau  (Rendah/Aman)
}


def classify_see_categories(features, js_analysis):
    """
    Mengklasifikasikan ekstensi browser ke dalam kategori SEE berdasarkan
    hasil analisis statis (fitur dan js_analysis metadata).

    Args:
        features    (dict): Output dari js_scanner.scan_js_files() + manifest_parser.
        js_analysis (dict): Metadata analisis JS dari js_scanner.scan_js_files().

    Returns:
        categories (list[str]): Daftar kategori SEE yang terdeteksi.
            Contoh: ['CE', 'CLE', 'FH']
            Kosong ([]) jika tidak ada kategori yang terdeteksi.

    Note:
        Fungsi ini HANYA menghasilkan metadata SEE categories.
        TIDAK digunakan sebagai label ML — label ML ditentukan secara terpisah
        di dataset_builder berdasarkan kategori yang ditemukan.
    """
    categories = []

    # =========================================================================
    # UReq (Unauthorized Request)
    # Kondisi: Ada HTTP API (fetch/XHR) DAN tidak ada host_permissions
    #          ATAU ada HTTP API + match_pattern_scope holistic (semua URL)
    # =========================================================================
    if features.get('http_api_total_count', 0) > 0 and not features.get('has_host_permissions', False):
        categories.append('UReq')
    elif (features.get('http_api_total_count', 0) > 0
          and features.get('match_pattern_scope', 0) == 3
          and 'UReq' not in categories):
        categories.append('UReq')

    # =========================================================================
    # UProf (User Profiling)
    # Kondisi: Ada event listener pengguna (scroll/click/keydown/input)
    #          DAN ada mekanisme relay data (sendMessage atau HTTP export)
    # =========================================================================
    has_user_event = (
        js_analysis.get('has_scroll_listener')
        or js_analysis.get('has_click_listener')
        or js_analysis.get('has_keydown_listener')
        or js_analysis.get('has_input_listener')
    )
    has_data_relay = (
        features.get('has_runtime_sendMessage')
        or features.get('http_api_total_count', 0) > 0
    )
    if has_user_event and has_data_relay:
        categories.append('UProf')
    elif (js_analysis.get('has_periodic_exfiltration')
          and (features.get('has_runtime_sendMessage') or features.get('has_onMessage_listener'))):
        categories.append('UProf')

    # =========================================================================
    # LF (Local File Access)
    # Kondisi: Ada akses file:// di kode JS atau content_scripts match pattern
    #          ATAU ada data packaging (FormData/Blob/arrayBuffer) + HTTP export
    # =========================================================================
    has_file_access = (
        js_analysis.get('has_file_uri_access')
        or features.get('has_file_match_pattern', False)
    )
    has_packaging = (
        features.get('has_formdata')
        or features.get('has_blob')
        or features.get('has_arraybuffer')
    )
    if has_file_access:
        categories.append('LF')
    elif has_file_access and has_packaging and features.get('http_api_total_count', 0) > 0:
        if 'LF' not in categories:
            categories.append('LF')

    # =========================================================================
    # CE (Cookie Exfiltration)
    # Kondisi: Ada cookies API (getAll/get/document.cookie) + HTTP export
    #          ATAU ada cookies permission + HTTP export (tanpa API call eksplisit)
    # =========================================================================
    has_cookies_api = (
        features.get('has_cookies_getAll')
        or features.get('has_cookies_get')
        or features.get('has_document_cookie')
    )
    if has_cookies_api and features.get('http_api_total_count', 0) > 0:
        categories.append('CE')
    elif features.get('has_cookies_permission', False) and features.get('http_api_total_count', 0) > 0:
        categories.append('CE')
    elif js_analysis.get('has_cookie_exfiltration_pattern') and 'CE' not in categories:
        categories.append('CE')

    # =========================================================================
    # HH (HTTP Hijacking)
    # Kondisi: Ada declarativeNetRequest permission + redirect rules di JSON
    #          ATAU ada declarativeNetRequest di JS + pola redirect
    # =========================================================================
    has_dnr_perm      = features.get('has_declarativeNetRequest_permission', False)
    has_redirect_rules = features.get('has_redirect_rules', False)
    has_dnr_js        = features.get('has_declarativeNetRequest_js', False)
    has_redirect_js   = js_analysis.get('has_redirect_in_js', False)

    if has_dnr_perm and has_redirect_rules:
        categories.append('HH')
    elif has_dnr_perm and (has_dnr_js or has_redirect_js):
        categories.append('HH')
    elif has_dnr_perm:
        categories.append('HH')

    # =========================================================================
    # UDown (Unauthorized Download)
    # Kondisi: Ada downloads permission + manipulasi download
    #          (onDeterminingFilename, onCreated, cancel, download)
    # =========================================================================
    has_downloads_perm  = features.get('has_downloads_permission', False)
    has_download_manip  = js_analysis.get('has_download_manipulation', False)
    has_cancel          = features.get('has_downloads_cancel', False)
    has_tabs_create     = features.get('has_tabs_create', False)

    if has_downloads_perm and has_download_manip:
        categories.append('UDown')
    elif has_downloads_perm and has_cancel:
        categories.append('UDown')
    elif has_downloads_perm and has_tabs_create and features.get('http_api_total_count', 0) > 0:
        categories.append('UDown')

    # =========================================================================
    # CLE (Clipboard Exfiltration) — EXTENDED
    # Kondisi: Ada akses clipboard API (readText/read) atau paste event listener
    #          DAN ada HTTP export atau sendMessage
    # =========================================================================
    has_clipboard_access = (
        features.get('has_clipboard_readText')
        or features.get('has_clipboard_read')
        or features.get('has_clipboard_paste_event')
    )
    has_export = (
        features.get('http_api_total_count', 0) > 0
        or features.get('has_runtime_sendMessage')
    )
    if has_clipboard_access and has_export:
        categories.append('CLE')
    elif js_analysis.get('has_clipboard_exfiltration_pattern') and 'CLE' not in categories:
        categories.append('CLE')

    # =========================================================================
    # HE (History Exfiltration) — EXTENDED
    # Kondisi: Ada history API (search/getVisits/topSites)
    #          DAN ada HTTP export atau sendMessage
    # =========================================================================
    has_history_api = (
        features.get('has_history_search')
        or features.get('has_history_getVisits')
        or features.get('has_history_getTopSites')
    )
    if has_history_api and has_export:
        categories.append('HE')
    elif js_analysis.get('has_history_exfiltration_pattern') and 'HE' not in categories:
        categories.append('HE')

    # =========================================================================
    # FH (Form/Credential Harvesting) — EXTENDED
    # Kondisi: Ada akses ke field password atau intercept form submit
    #          DAN ada mekanisme pengiriman data (sendMessage atau HTTP export)
    # =========================================================================
    has_credential_access = (
        features.get('has_password_field_access')
        or features.get('has_form_submit_intercept')
    )
    if has_credential_access and has_export:
        categories.append('FH')
    elif js_analysis.get('has_credential_harvesting_pattern') and 'FH' not in categories:
        categories.append('FH')

    return categories


def calculate_risk_score(categories, features):
    """
    Menghitung risk score dan menentukan risk level berdasarkan kategori SEE
    yang terdeteksi dan fitur tambahan (obfuscation).

    Args:
        categories (list[str]): Output dari classify_see_categories().
        features   (dict)     : Output dari js_scanner.scan_js_files().

    Returns:
        score      (int)  : Total risk score (0–100+, uncapped).
        level      (str)  : "HIGH", "MEDIUM", atau "LOW".
        level_id   (str)  : "RENTAN", "MENENGAH", atau "AMAN".
        level_color(str)  : "merah", "kuning", atau "hijau".
        breakdown  (dict) : Rincian skor per kategori + obfuscation bonus.
    """
    breakdown = {}
    score = 0

    for cat in categories:
        weight = CATEGORY_WEIGHTS.get(cat, 5)
        breakdown[cat] = weight
        score += weight

    # Bonus: obfuscation indicators menambah risiko
    if features.get('has_eval_or_function') or features.get('has_btoa'):
        breakdown['obfuscation_bonus'] = OBFUSCATION_WEIGHT
        score += OBFUSCATION_WEIGHT

    # Determine level
    if score >= RISK_THRESHOLDS['HIGH']:
        level      = 'HIGH'
        level_id   = 'RENTAN'
        level_color = 'merah'
    elif score >= RISK_THRESHOLDS['MEDIUM']:
        level      = 'MEDIUM'
        level_id   = 'MENENGAH'
        level_color = 'kuning'
    else:
        level      = 'LOW'
        level_id   = 'AMAN'
        level_color = 'hijau'

    return score, level, level_id, level_color, breakdown


def get_risk_summary(categories, features):
    """
    Wrapper convenience function: klasifikasi + scoring dalam satu panggilan.

    Returns:
        dict dengan keys:
            categories, score, level, level_id, level_color, breakdown
    """
    score, level, level_id, level_color, breakdown = calculate_risk_score(categories, features)
    return {
        'categories':   categories,
        'score':        score,
        'level':        level,
        'level_id':     level_id,
        'level_color':  level_color,
        'breakdown':    breakdown,
    }
