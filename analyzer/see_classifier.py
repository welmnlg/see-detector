def classify_see_categories(features, js_analysis):
    """
    Classifies a browser extension into SEE (Stealth Extension Exfiltration)
    attack categories based on static analysis features and JS analysis metadata.
    
    Based on Lim et al. (2025) Table 4 and PoC Listings 2-6:
    
    Categories:
      - UReq  : Unauthorized HTTP Request — extension makes outbound requests
                 without host_permissions
      - UProf : User Profiling — extension monitors scroll, click, keyboard events
                 and collects user interaction data
      - LF    : Local File Access — extension accesses local files via file:// and
                 packages them for exfiltration (FormData, Blob, arrayBuffer)
      - CE    : Cookie Exfiltration — extension reads cookies via browser.cookies API
                 or document.cookie and exports them via HTTP
      - HH    : HTTP Hijacking — extension uses declarativeNetRequest redirect rules
                 to redirect user navigation to attacker-controlled sites
      - UDown : Unauthorized Download — extension intercepts/cancels user downloads
                 and replaces them with malicious files
    
    Returns list of detected SEE categories as metadata.
    NOT used for ML classification — purely informational metadata.
    """
    categories = []

    # =========================================================================
    # UReq (Unauthorized Request) — Listing 2b line 12
    # Condition: Has HTTP APIs (fetch/XHR) AND no host_permissions
    # OR: Has HTTP APIs + holistic match pattern (can reach any page)
    # =========================================================================
    if features.get('http_api_total_count', 0) > 0 and not features.get('has_host_permissions', False):
        categories.append('UReq')
    elif features.get('http_api_total_count', 0) > 0 and features.get('match_pattern_scope', 0) == 3:
        if 'UReq' not in categories:
            categories.append('UReq')

    # =========================================================================
    # UProf (User Profiling) — Listing 2a
    # Condition: Has scroll/click/keydown event listeners
    #   AND (sendMessage for relaying data OR direct HTTP export)
    # Enhanced: Also detect setInterval + fetch combo (periodic exfiltration)
    # =========================================================================
    has_user_event = (
        js_analysis.get('has_scroll_listener') or
        js_analysis.get('has_click_listener') or
        js_analysis.get('has_keydown_listener') or
        js_analysis.get('has_input_listener')
    )
    has_data_relay = (
        features.get('has_runtime_sendMessage') or
        features.get('http_api_total_count', 0) > 0
    )
    if has_user_event and has_data_relay:
        categories.append('UProf')
    # Also flag if periodic exfiltration detected (setInterval + fetch)
    elif js_analysis.get('has_periodic_exfiltration'):
        if features.get('has_runtime_sendMessage') or features.get('has_onMessage_listener'):
            categories.append('UProf')

    # =========================================================================
    # LF (Local File Access) — Listing 3
    # Condition: file:// access in JS code OR file:// in content script matches
    #   Enhanced: Also check for data packaging APIs (FormData, Blob, arrayBuffer)
    #   which are used to prepare local files for exfiltration
    # =========================================================================
    has_file_access = (
        js_analysis.get('has_file_uri_access') or
        features.get('has_file_match_pattern', False)
    )
    has_packaging = (
        features.get('has_formdata') or
        features.get('has_blob') or
        features.get('has_arraybuffer')
    )
    if has_file_access:
        categories.append('LF')
    elif has_file_access and has_packaging and features.get('http_api_total_count', 0) > 0:
        # Strong LF: file access + data packaging + HTTP export
        if 'LF' not in categories:
            categories.append('LF')

    # =========================================================================
    # CE (Cookie Exfiltration) — Listing 4
    # Condition: Has cookies permission + cookies API call (getAll/get)
    #   OR: Has document.cookie access + HTTP export API
    #   Enhanced: Also detect combo pattern (cookies API + fetch in same file)
    # =========================================================================
    has_cookies_api = (
        features.get('has_cookies_getAll') or
        features.get('has_cookies_get') or
        features.get('has_document_cookie')
    )
    has_cookies_perm = features.get('has_cookies_permission', False)
    
    if has_cookies_api and features.get('http_api_total_count', 0) > 0:
        categories.append('CE')
    elif has_cookies_perm and features.get('http_api_total_count', 0) > 0:
        categories.append('CE')
    elif js_analysis.get('has_cookie_exfiltration_pattern'):
        if 'CE' not in categories:
            categories.append('CE')

    # =========================================================================
    # HH (HTTP Hijacking) — Listing 5
    # Condition: Has declarativeNetRequest permission + redirect rules in JSON
    #   OR: Has declarativeNetRequest in JS + redirect patterns
    # =========================================================================
    has_dnr_perm = features.get('has_declarativeNetRequest_permission', False)
    has_redirect_rules = features.get('has_redirect_rules', False)
    has_dnr_js = features.get('has_declarativeNetRequest_js', False)
    has_redirect_js = js_analysis.get('has_redirect_in_js', False)
    
    if has_dnr_perm and has_redirect_rules:
        categories.append('HH')
    elif has_dnr_perm and (has_dnr_js or has_redirect_js):
        categories.append('HH')
    elif has_dnr_perm:
        # Even without explicit redirect detection, DNR permission is suspicious
        categories.append('HH')

    # =========================================================================
    # UDown (Unauthorized Download) — Listing 6
    # Condition: Has downloads permission + download manipulation patterns
    #   (onDeterminingFilename, onCreated, cancel, download)
    #   Enhanced: Also check for tabs.create (used to redirect to malware URL)
    # =========================================================================
    has_downloads_perm = features.get('has_downloads_permission', False)
    has_download_manip = js_analysis.get('has_download_manipulation', False)
    has_cancel = features.get('has_downloads_cancel', False)
    has_tabs_create = features.get('has_tabs_create', False)
    
    if has_downloads_perm and has_download_manip:
        categories.append('UDown')
    elif has_downloads_perm and has_cancel:
        categories.append('UDown')
    elif has_downloads_perm and has_tabs_create and features.get('http_api_total_count', 0) > 0:
        # downloads + tabs.create + HTTP API is suspicious combination
        categories.append('UDown')

    return categories
