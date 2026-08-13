"""
see_engine.py
=============
Self-contained analysis engine untuk SEE (Stealth Extension Exfiltration).
Tidak bergantung pada settings/config eksternal — semua konfigurasi inline.

Pipeline:
  1. Ekstrak .crx / .zip  →  folder sementara
  2. Parse manifest.json  →  manifest_features
  3. Scan semua .js       →  js_features + js_analysis
  4. Klasifikasi SEE      →  categories (UReq, UProf, LF, CE, HH, UDown,
                                          CLE, HE, FH)
  5. Hitung risk score    →  score + level (RENTAN / MENENGAH / AMAN)
  6. Susun laporan detail →  dict hasil lengkap
"""

import os, re, json, zipfile, shutil, tempfile
from pathlib import Path
from datetime import datetime

# ─── Konfigurasi ─────────────────────────────────────────────────────────────

SENSITIVE_PERMISSIONS = [
    "cookies", "downloads", "history", "bookmarks", "tabs",
    "activeTab", "topSites", "webRequest", "webRequestBlocking",
    "declarativeNetRequest", "declarativeNetRequestWithHostAccess",
    "clipboardRead", "clipboardWrite", "nativeMessaging",
    "management", "debugger", "pageCapture", "tabCapture",
    "desktopCapture", "storage", "identity",
]

HOLISTIC_PATTERNS = [
    "<all_urls>", "*://*/*", "http://*/*", "https://*/*",
    "ftp://*/*", "*://*/"
]

HTTP_APIS = [
    r'\bfetch\s*\(',
    r'\bnew\s+XMLHttpRequest\b',
    r'\baxios\s*[\.\(]',
    r'\$\.ajax\s*\(',
    r'\$\.post\s*\(',
    r'\$\.get\s*\(',
    r'\$\.getJSON\s*\(',
    r'\.open\s*\(\s*["\'](?:GET|POST|PUT|DELETE|PATCH)',
    r'\.exec\s*\(',
    r'\bjsonp\b',
    r'\blocation\.(?:href|replace|assign)\s*=',
    r'\bnavigator\.sendBeacon\s*\(',
    r'\bnew\s+WebSocket\s*\(',
]

CATEGORY_WEIGHTS = {
    'FH': 40, 'CE': 35, 'CLE': 30, 'HE': 25, 'LF': 25,
    'UProf': 20, 'UDown': 20, 'HH': 20, 'UReq': 10,
}
OBFUSCATION_BONUS = 10

CATEGORY_LABELS = {
    'UReq':  'Unauthorized HTTP Request',
    'UProf': 'User Profiling',
    'LF':    'Local File Access',
    'CE':    'Cookie Exfiltration',
    'HH':    'HTTP Hijacking',
    'UDown': 'Unauthorized Download',
    'CLE':   'Clipboard Exfiltration',
    'HE':    'History Exfiltration',
    'FH':    'Form/Credential Harvesting',
}

# ─── Step 1: Ekstrak CRX/ZIP ─────────────────────────────────────────────────

def extract_extension(file_path: str, output_dir: str) -> tuple[bool, str]:
    """
    Ekstrak file .crx atau .zip ke output_dir/<nama_file>.
    Untuk .crx: cari ZIP signature PK\\x03\\x04, skip CRX header.
    Untuk .zip: langsung ekstrak.
    Returns (success, extracted_path_or_error_msg)
    """
    fp   = Path(file_path)
    odir = Path(output_dir)
    odir.mkdir(parents=True, exist_ok=True)
    ext_dir = odir / fp.stem
    if ext_dir.exists():
        shutil.rmtree(ext_dir)
    ext_dir.mkdir(parents=True)

    try:
        with open(fp, 'rb') as f:
            data = f.read()
        zip_start = data.find(b'PK\x03\x04')
        if zip_start == -1:
            raise ValueError("Tidak ditemukan ZIP signature yang valid di file ini.")
        tmp = ext_dir / '_tmp.zip'
        tmp.write_bytes(data[zip_start:])
        with zipfile.ZipFile(tmp, 'r') as z:
            z.extractall(ext_dir)
        tmp.unlink()
        return True, str(ext_dir)
    except Exception as e:
        if ext_dir.exists():
            shutil.rmtree(ext_dir)
        return False, str(e)


# ─── Step 2: Parse Manifest ──────────────────────────────────────────────────

def parse_manifest(ext_dir: str) -> dict:
    manifest_path = Path(ext_dir) / 'manifest.json'
    features = {
        'manifest_version': 0, 'permissions_count': 0,
        'has_host_permissions': False, 'host_permissions_count': 0,
        'has_content_scripts': False, 'has_holistic_match_pattern': False,
        'match_pattern_scope': 0, 'has_service_worker': False,
        'has_background_page': False, 'sensitive_permissions_count': 0,
        'has_web_accessible_resources': False, 'has_externally_connectable': False,
        'has_csp_declaration': False, 'has_update_url': False,
        'content_script_count': 0, 'has_file_match_pattern': False,
        'has_all_frames': False, 'content_script_run_at': 0,
        'has_dnr_rules_file': False, 'has_redirect_rules': False,
        'dnr_rule_count': 0, 'has_optional_host_permissions': False,
        'optional_permissions_count': 0,
        # raw data untuk laporan
        '_permissions_list': [],
        '_host_permissions_list': [],
        '_extension_name': '',
        '_extension_version': '',
        '_extension_description': '',
    }
    for p in SENSITIVE_PERMISSIONS:
        features[f'has_{p}_permission'] = False

    if not manifest_path.exists():
        return features
    try:
        with open(manifest_path, 'r', encoding='utf-8', errors='ignore') as f:
            m = json.load(f)

        features['manifest_version']      = m.get('manifest_version', 0)
        features['_extension_name']       = m.get('name', '')
        features['_extension_version']    = m.get('version', '')
        features['_extension_description']= m.get('description', '')

        # permissions
        perms = m.get('permissions', [])
        if isinstance(perms, list):
            features['permissions_count'] = len(perms)
            features['_permissions_list'] = perms
            for p in perms:
                if p in SENSITIVE_PERMISSIONS:
                    features[f'has_{p}_permission'] = True
                    features['sensitive_permissions_count'] += 1

        opt_perms = m.get('optional_permissions', [])
        if isinstance(opt_perms, list):
            features['optional_permissions_count'] = len(opt_perms)
            for p in opt_perms:
                if p in SENSITIVE_PERMISSIONS:
                    features[f'has_{p}_permission'] = True
                    features['sensitive_permissions_count'] += 1

        # host_permissions field (MV3 explicit)
        hp = m.get('host_permissions', [])
        if isinstance(hp, list) and hp:
            features['has_host_permissions']     = True
            features['host_permissions_count']   = len(hp)
            features['_host_permissions_list']   = hp

        # MV2: URL patterns inside 'permissions' also count as host permissions
        # (e.g. "http://*/*", "https://*/*", "<all_urls>" inside permissions[])
        url_perm_patterns = [p for p in features.get('_permissions_list', [])
                             if p.startswith('http') or p.startswith('https')
                             or p.startswith('ftp') or p.startswith('file')
                             or p in HOLISTIC_PATTERNS or p == '<all_urls>']
        if url_perm_patterns:
            features['has_host_permissions'] = True
            features['host_permissions_count'] = features['host_permissions_count'] + len(url_perm_patterns)
            features['_host_permissions_list'] = features['_host_permissions_list'] + url_perm_patterns

        opt_hp = m.get('optional_host_permissions', [])
        if isinstance(opt_hp, list) and opt_hp:
            features['has_optional_host_permissions'] = True

        # content_scripts
        cs = m.get('content_scripts', [])
        if isinstance(cs, list) and cs:
            features['has_content_scripts']   = True
            features['content_script_count']  = len(cs)
            highest = 0
            for script in cs:
                for match in script.get('matches', []):
                    if match.startswith('file://'):
                        features['has_file_match_pattern'] = True
                    if match in HOLISTIC_PATTERNS or match == '<all_urls>':
                        highest = max(highest, 3)
                        features['has_holistic_match_pattern'] = True
                        features['has_wildcard_cs_match'] = True
                    elif '*://*/*' in match or 'http://*/*' in match or 'https://*/*' in match:
                        highest = max(highest, 3)
                        features['has_holistic_match_pattern'] = True
                        features['has_wildcard_cs_match'] = True
                    elif '*' in match:
                        highest = max(highest, 2)
                    else:
                        highest = max(highest, 1)
                if script.get('all_frames'):
                    features['has_all_frames'] = True
                run_at = script.get('run_at', 'document_idle')
                rt_map = {'document_start': 1, 'document_end': 2, 'document_idle': 3}
                features['content_script_run_at'] = max(
                    features['content_script_run_at'], rt_map.get(run_at, 0))
            features['match_pattern_scope'] = highest

        # background
        bg = m.get('background', {})
        if isinstance(bg, dict):
            if 'service_worker' in bg: features['has_service_worker']  = True
            if 'page' in bg or 'scripts' in bg: features['has_background_page'] = True

        # DNR
        dnr = m.get('declarative_net_request', {})
        if isinstance(dnr, dict):
            rr = dnr.get('rule_resources', [])
            if isinstance(rr, list) and rr:
                features['has_dnr_rules_file'] = True
                for res in rr:
                    rp = res.get('path', '')
                    if rp:
                        full = Path(ext_dir) / rp
                        if full.exists():
                            try:
                                rules = json.loads(full.read_text('utf-8'))
                                if isinstance(rules, list):
                                    features['dnr_rule_count'] += len(rules)
                                    for rule in rules:
                                        if isinstance(rule.get('action'), dict):
                                            if rule['action'].get('type') == 'redirect':
                                                features['has_redirect_rules'] = True
                            except Exception:
                                pass

        if m.get('web_accessible_resources'):  features['has_web_accessible_resources'] = True
        if 'externally_connectable' in m:       features['has_externally_connectable']   = True
        if 'content_security_policy' in m:      features['has_csp_declaration']          = True
        if 'update_url' in m:                   features['has_update_url']               = True

    except Exception:
        pass
    return features


# ─── Step 3: Scan JS Files ───────────────────────────────────────────────────

def scan_js_files(ext_dir: str) -> tuple[dict, dict]:
    ext_path = Path(ext_dir)

    features = {
        'js_file_count': 0, 'total_js_size_bytes': 0,
        'fetch_api_count': 0, 'xhr_api_count': 0, 'http_api_total_count': 0,
        'has_external_url_in_js': False, 'external_domain_count': 0,
        'has_runtime_sendMessage': False, 'has_onMessage_listener': False,
        'has_eval_or_function': False, 'has_websocket': False, 'has_sendBeacon': False,
        # CE
        'has_cookies_getAll': False, 'has_cookies_get': False, 'has_document_cookie': False,
        # LF
        'has_formdata': False, 'has_blob': False, 'has_arraybuffer': False,
        # timer
        'has_setInterval': False, 'has_setTimeout': False,
        # serialization
        'has_json_stringify': False, 'has_btoa': False,
        # UDown
        'has_downloads_onCreated': False, 'has_downloads_cancel': False, 'has_downloads_download': False,
        'has_tabs_create': False,
        'has_tabs_update_url': False,  # tabs.update({url:...}) = active tab hijacking
        # HH
        'has_declarativeNetRequest_js': False,
        # CLE
        'has_clipboard_readText': False, 'has_clipboard_read': False,
        'has_clipboard_paste_event': False, 'has_clipboard_writeText': False,
        # HE
        'has_history_search': False, 'has_history_getVisits': False, 'has_history_getTopSites': False,
        # FH
        'has_password_field_access': False, 'has_form_submit_intercept': False,
        'has_input_value_read': False, 'has_autofill_intercept': False,
        # composite
        'sensitive_api_count': 0, 'see_category_count': 0, 'risk_score': 0,
    }

    js_analysis = {
        'has_scroll_listener': False, 'has_click_listener': False,
        'has_keydown_listener': False, 'has_input_listener': False,
        'has_file_uri_access': False, 'has_data_packaging': False,
        'has_cookie_exfiltration_pattern': False, 'has_periodic_exfiltration': False,
        'has_redirect_in_js': False, 'has_download_manipulation': False,
        'has_active_tab_hijack': False,   # tabs.update({url:}) ditemukan
        'has_clipboard_exfiltration_pattern': False,
        'has_history_exfiltration_pattern': False,
        'has_credential_harvesting_pattern': False,
        'external_urls_found': set(),
        '_js_findings': [],          # list of {file,line,pattern,category,context,matched_text}
        '_fetch_calls':  [],           # list of {file,line,method,url_hint,context}
    }

    # compile patterns once
    P = {
        'url':          re.compile(r'https?://[^\s"\'<>]+'),
        'file_uri':     re.compile(r'file:///'),
        'sendMsg':      re.compile(r'\b(chrome|browser)\.runtime\.sendMessage\b'),
        'onMsg':        re.compile(r'\b(chrome|browser)\.runtime\.onMessage\.addListener\b'),
        'eval':         re.compile(r'\beval\s*\(|\bnew\s+Function\s*\('),
        'scroll':       re.compile(r"addEventListener\s*\(\s*['\"]scroll['\"]"),
        'click':        re.compile(r"addEventListener\s*\(\s*['\"]click['\"]"),
        'keydown':      re.compile(r"addEventListener\s*\(\s*['\"]key(?:down|press|up)['\"]"),
        'input':        re.compile(r"addEventListener\s*\(\s*['\"](?:input|change)['\"]"),
        'ck_getAll':    re.compile(r'\b(chrome|browser)\.cookies\.getAll\b'),
        'ck_get':       re.compile(r'\b(chrome|browser)\.cookies\.get\b(?!All)'),
        'doc_cookie':   re.compile(r'\bdocument\.cookie\b'),
        'formdata':     re.compile(r'\bnew\s+FormData\s*\('),
        'blob':         re.compile(r'\bnew\s+Blob\s*\('),
        'arraybuf':     re.compile(r'\.arrayBuffer\s*\('),
        'setInterval':  re.compile(r'\bsetInterval\s*\('),
        'setTimeout':   re.compile(r'\bsetTimeout\s*\('),
        'json_str':     re.compile(r'\bJSON\.stringify\s*\('),
        'btoa':         re.compile(r'\bbtoa\s*\('),
        'dl_created':   re.compile(r'\bdownloads\.onCreated\.addListener\b'),
        'dl_determin':  re.compile(r'\bdownloads\.onDeterminingFilename\.addListener\b'),
        'dl_cancel':    re.compile(r'\bdownloads\.cancel\s*\('),
        'dl_download':  re.compile(r'\bdownloads\.download\s*\('),
        'tabs_create':  re.compile(r'\b(chrome|browser)\.tabs\.create\s*\('),
        'tabs_update_url': re.compile(r'\b(chrome|browser)\.tabs\.update\s*\([^)]*[{,]\s*url\s*:'),
        'dnr':          re.compile(r'\bdeclarativeNetRequest\b'),
        'redirect':     re.compile(r'["\']redirect["\']'),
        'clip_read':    re.compile(r'navigator\.clipboard\.readText\s*\('),
        'clip_read2':   re.compile(r'navigator\.clipboard\.read\s*\('),
        'clip_paste':   re.compile(r"addEventListener\s*\(\s*['\"]paste['\"]"),
        'clip_data':    re.compile(r'clipboardData\.getData\s*\('),
        'clip_write':   re.compile(r'navigator\.clipboard\.writeText\s*\('),
        'hist_search':  re.compile(r'\b(chrome|browser)\.history\.search\s*\('),
        'hist_visits':  re.compile(r'\b(chrome|browser)\.history\.getVisits\s*\('),
        'hist_top':     re.compile(r'\b(chrome|browser)\.topSites\.get\s*\('),
        'hist_any':     re.compile(r'\b(chrome|browser)\.history\.'),
        'pwd_field':    re.compile(r"querySelector(?:All)?\s*\(\s*['\"][^'\"]*(?:type\s*=\s*['\"]?password|\[type=['\"]?password)[^'\"]*['\"]"),
        'pwd_attr':     re.compile(r"input\[type=['\"]?password['\"]?\]"),
        'form_submit':  re.compile(r"addEventListener\s*\(\s*['\"]submit['\"]"),
        'input_val':    re.compile(r'\.value\b'),
        'autofill':     re.compile(r'autocomplete\s*=\s*["\'](?:off|new-password)["\']'),
    }
    http_regexes = [(i, re.compile(p)) for i, p in enumerate(HTTP_APIS)]

    def get_context(src_lines, lineno, window=4):
        start = max(0, lineno - 1 - window)
        end   = min(len(src_lines), lineno + window)
        return [{'ln': i+1, 'text': src_lines[i]} for i in range(start, end)]

    def lineof_with_ctx(pat, src_lines, window=4):
        for i, l in enumerate(src_lines):
            if pat.search(l):
                ln = i + 1
                return ln, get_context(src_lines, ln, window), l.strip()
        return 0, [], ''

    def record(js_analysis, fname, lineno, pattern_name, category,
               ctx=None, matched_text=''):
        js_analysis['_js_findings'].append({
            'file': fname, 'line': lineno,
            'pattern': pattern_name, 'category': category,
            'context': ctx or [], 'matched_text': matched_text
        })

    for root, _, files in os.walk(ext_path):
        for fname in files:
            if not fname.endswith('.js'):
                continue
            features['js_file_count'] += 1
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, ext_dir).replace(os.sep, '/')
            try:
                features['total_js_size_bytes'] += os.path.getsize(fpath)
                content = open(fpath, 'r', encoding='utf-8', errors='ignore').read()
                lines   = content.splitlines()

                # helper: find first line number of pattern match
                def lineof(pat):
                    for i, l in enumerate(lines, 1):
                        if pat.search(l):
                            return i
                    return 0

                # HTTP APIs + collect fetch_calls detail
                for idx, pat in http_regexes:
                    for lno, raw_line in enumerate(lines, 1):
                        if pat.search(raw_line):
                            features['http_api_total_count'] += 1
                            if idx == 0:  features['fetch_api_count'] += 1
                            elif idx == 1: features['xhr_api_count'] += 1
                            elif idx == 12: features['has_websocket'] = True
                            elif idx == 11: features['has_sendBeacon'] = True
                            method_map = {0:'fetch', 1:'XHR', 11:'sendBeacon', 12:'WebSocket'}
                            method = method_map.get(idx, 'HTTP')
                            ctx_blk = get_context(lines, lno, window=4)
                            ctx_text = ' '.join(c['text'] for c in ctx_blk)
                            url_hints = re.findall(r"https?://[^\s'\"<>\\]+", ctx_text)
                            js_analysis['_fetch_calls'].append({
                                'file':     rel,
                                'line':     lno,
                                'method':   method,
                                'url_hint': url_hints[0] if url_hints else '(URL tidak terdeteksi di context)',
                                'context':  ctx_blk,
                                'raw_line': raw_line.strip(),
                            })

                # URLs
                for url in P['url'].findall(content):
                    if not url.startswith(('http://localhost','http://127.0.0.1')):
                        js_analysis['external_urls_found'].add(url)
                        features['has_external_url_in_js'] = True

                # message passing
                if P['sendMsg'].search(content):
                    features['has_runtime_sendMessage'] = True
                    _ln_sendMsg, _ctx_sendMsg, _mt_sendMsg = lineof_with_ctx(P['sendMsg'], lines)
                    record(js_analysis, rel, _ln_sendMsg, 'runtime.sendMessage', 'UProf', _ctx_sendMsg, _mt_sendMsg)
                if P['onMsg'].search(content):
                    features['has_onMessage_listener'] = True

                # obfuscation
                if P['eval'].search(content):
                    features['has_eval_or_function'] = True
                    _ln_eval, _ctx_eval, _mt_eval = lineof_with_ctx(P['eval'], lines)
                    record(js_analysis, rel, _ln_eval, 'eval/new Function', 'Obfuscation', _ctx_eval, _mt_eval)

                # event listeners
                if P['scroll'].search(content):
                    js_analysis['has_scroll_listener'] = True
                    _ln_scroll, _ctx_scroll, _mt_scroll = lineof_with_ctx(P['scroll'], lines)
                    record(js_analysis, rel, _ln_scroll, "addEventListener('scroll')", 'UProf', _ctx_scroll, _mt_scroll)
                if P['click'].search(content):
                    js_analysis['has_click_listener'] = True
                    _ln_click, _ctx_click, _mt_click = lineof_with_ctx(P['click'], lines)
                    record(js_analysis, rel, _ln_click, "addEventListener('click')", 'UProf', _ctx_click, _mt_click)
                if P['keydown'].search(content):
                    js_analysis['has_keydown_listener'] = True
                    _ln_keydown, _ctx_keydown, _mt_keydown = lineof_with_ctx(P['keydown'], lines)
                    record(js_analysis, rel, _ln_keydown, "addEventListener('keydown')", 'UProf', _ctx_keydown, _mt_keydown)
                if P['input'].search(content):
                    js_analysis['has_input_listener'] = True
                    _ln_input, _ctx_input, _mt_input = lineof_with_ctx(P['input'], lines)
                    record(js_analysis, rel, _ln_input, "addEventListener('input')", 'UProf', _ctx_input, _mt_input)

                # file URI
                if P['file_uri'].search(content):
                    js_analysis['has_file_uri_access'] = True
                    _ln_file_uri, _ctx_file_uri, _mt_file_uri = lineof_with_ctx(P['file_uri'], lines)
                    record(js_analysis, rel, _ln_file_uri, 'file:// URI access', 'LF', _ctx_file_uri, _mt_file_uri)

                # cookies
                if P['ck_getAll'].search(content):
                    features['has_cookies_getAll'] = True
                    _ln_ck_getAll, _ctx_ck_getAll, _mt_ck_getAll = lineof_with_ctx(P['ck_getAll'], lines)
                    record(js_analysis, rel, _ln_ck_getAll, 'cookies.getAll()', 'CE', _ctx_ck_getAll, _mt_ck_getAll)
                if P['ck_get'].search(content):
                    features['has_cookies_get'] = True
                    _ln_ck_get, _ctx_ck_get, _mt_ck_get = lineof_with_ctx(P['ck_get'], lines)
                    record(js_analysis, rel, _ln_ck_get, 'cookies.get()', 'CE', _ctx_ck_get, _mt_ck_get)
                if P['doc_cookie'].search(content):
                    features['has_document_cookie'] = True
                    _ln_doc_cookie, _ctx_doc_cookie, _mt_doc_cookie = lineof_with_ctx(P['doc_cookie'], lines)
                    record(js_analysis, rel, _ln_doc_cookie, 'document.cookie', 'CE', _ctx_doc_cookie, _mt_doc_cookie)

                # data packaging
                if P['formdata'].search(content):
                    features['has_formdata'] = True
                    _ln_formdata, _ctx_formdata, _mt_formdata = lineof_with_ctx(P['formdata'], lines)
                    record(js_analysis, rel, _ln_formdata, 'new FormData()', 'LF', _ctx_formdata, _mt_formdata)
                if P['blob'].search(content):
                    features['has_blob'] = True
                    _ln_blob, _ctx_blob, _mt_blob = lineof_with_ctx(P['blob'], lines)
                    record(js_analysis, rel, _ln_blob, 'new Blob()', 'LF', _ctx_blob, _mt_blob)
                if P['arraybuf'].search(content):
                    features['has_arraybuffer'] = True
                    _ln_arraybuf, _ctx_arraybuf, _mt_arraybuf = lineof_with_ctx(P['arraybuf'], lines)
                    record(js_analysis, rel, _ln_arraybuf, '.arrayBuffer()', 'LF', _ctx_arraybuf, _mt_arraybuf)

                # timer
                if P['setInterval'].search(content):
                    features['has_setInterval'] = True
                if P['setTimeout'].search(content):
                    features['has_setTimeout'] = True

                # serialization
                if P['json_str'].search(content):
                    features['has_json_stringify'] = True
                if P['btoa'].search(content):
                    features['has_btoa'] = True
                    _ln_btoa, _ctx_btoa, _mt_btoa = lineof_with_ctx(P['btoa'], lines)
                    record(js_analysis, rel, _ln_btoa, 'btoa() base64 encoding', 'Obfuscation', _ctx_btoa, _mt_btoa)

                # downloads
                if P['dl_created'].search(content) or P['dl_determin'].search(content):
                    features['has_downloads_onCreated'] = True
                    js_analysis['has_download_manipulation'] = True
                    _ln_dl_created, _ctx_dl_created, _mt_dl_created = lineof_with_ctx(P['dl_created'], lines)
                    record(js_analysis, rel, _ln_dl_created, 'downloads.onCreated.addListener', 'UDown', _ctx_dl_created, _mt_dl_created)
                if P['dl_cancel'].search(content):
                    features['has_downloads_cancel'] = True
                    js_analysis['has_download_manipulation'] = True
                    _ln_dl_cancel, _ctx_dl_cancel, _mt_dl_cancel = lineof_with_ctx(P['dl_cancel'], lines)
                    record(js_analysis, rel, _ln_dl_cancel, 'downloads.cancel()', 'UDown', _ctx_dl_cancel, _mt_dl_cancel)
                if P['dl_download'].search(content):
                    features['has_downloads_download'] = True
                if P['tabs_create'].search(content):
                    features['has_tabs_create'] = True
                    _ln_tabs_create, _ctx_tabs_create, _mt_tabs_create = lineof_with_ctx(P['tabs_create'], lines)
                    record(js_analysis, rel, _ln_tabs_create, 'tabs.create()', 'UDown', _ctx_tabs_create, _mt_tabs_create)
                if P['tabs_update_url'].search(content):
                    features['has_tabs_update_url'] = True
                    js_analysis['has_active_tab_hijack'] = True
                    _ln_tabs_update_url, _ctx_tabs_update_url, _mt_tabs_update_url = lineof_with_ctx(P['tabs_update_url'], lines)
                    record(js_analysis, rel, _ln_tabs_update_url, 'tabs.update({url:...}) — active tab hijack', 'HH', _ctx_tabs_update_url, _mt_tabs_update_url)

                # HH
                if P['dnr'].search(content):
                    features['has_declarativeNetRequest_js'] = True
                    _ln_dnr, _ctx_dnr, _mt_dnr = lineof_with_ctx(P['dnr'], lines)
                    record(js_analysis, rel, _ln_dnr, 'declarativeNetRequest in JS', 'HH', _ctx_dnr, _mt_dnr)
                if P['redirect'].search(content):
                    js_analysis['has_redirect_in_js'] = True

                # CLE
                if P['clip_read'].search(content):
                    features['has_clipboard_readText'] = True
                    _ln_clip_read, _ctx_clip_read, _mt_clip_read = lineof_with_ctx(P['clip_read'], lines)
                    record(js_analysis, rel, _ln_clip_read, 'clipboard.readText()', 'CLE', _ctx_clip_read, _mt_clip_read)
                if P['clip_read2'].search(content):
                    features['has_clipboard_read'] = True
                    _ln_clip_read2, _ctx_clip_read2, _mt_clip_read2 = lineof_with_ctx(P['clip_read2'], lines)
                    record(js_analysis, rel, _ln_clip_read2, 'clipboard.read()', 'CLE', _ctx_clip_read2, _mt_clip_read2)
                if P['clip_paste'].search(content) or P['clip_data'].search(content):
                    features['has_clipboard_paste_event'] = True
                    _ln_clip_paste, _ctx_clip_paste, _mt_clip_paste = lineof_with_ctx(P['clip_paste'], lines)
                    record(js_analysis, rel, _ln_clip_paste, "addEventListener('paste')", 'CLE', _ctx_clip_paste, _mt_clip_paste)
                if P['clip_write'].search(content):
                    features['has_clipboard_writeText'] = True

                # HE
                if P['hist_search'].search(content):
                    features['has_history_search'] = True
                    _ln_hist_search, _ctx_hist_search, _mt_hist_search = lineof_with_ctx(P['hist_search'], lines)
                    record(js_analysis, rel, _ln_hist_search, 'history.search()', 'HE', _ctx_hist_search, _mt_hist_search)
                if P['hist_visits'].search(content):
                    features['has_history_getVisits'] = True
                    _ln_hist_visits, _ctx_hist_visits, _mt_hist_visits = lineof_with_ctx(P['hist_visits'], lines)
                    record(js_analysis, rel, _ln_hist_visits, 'history.getVisits()', 'HE', _ctx_hist_visits, _mt_hist_visits)
                if P['hist_top'].search(content):
                    features['has_history_getTopSites'] = True
                    _ln_hist_top, _ctx_hist_top, _mt_hist_top = lineof_with_ctx(P['hist_top'], lines)
                    record(js_analysis, rel, _ln_hist_top, 'topSites.get()', 'HE', _ctx_hist_top, _mt_hist_top)

                # FH
                if P['pwd_field'].search(content) or P['pwd_attr'].search(content):
                    features['has_password_field_access'] = True
                    _ln_pwd_field, _ctx_pwd_field, _mt_pwd_field = lineof_with_ctx(P['pwd_field'], lines)
                    record(js_analysis, rel, _ln_pwd_field, "querySelector('input[type=password]')", 'FH', _ctx_pwd_field, _mt_pwd_field)
                if P['form_submit'].search(content):
                    features['has_form_submit_intercept'] = True
                    _ln_form_submit, _ctx_form_submit, _mt_form_submit = lineof_with_ctx(P['form_submit'], lines)
                    record(js_analysis, rel, _ln_form_submit, "addEventListener('submit')", 'FH', _ctx_form_submit, _mt_form_submit)
                if P['input_val'].search(content):
                    features['has_input_value_read'] = True
                if P['autofill'].search(content):
                    features['has_autofill_intercept'] = True

                # ── Combo detections ──
                has_http = features['http_api_total_count'] > 0

                if (P['ck_getAll'].search(content) or P['doc_cookie'].search(content)) and has_http:
                    js_analysis['has_cookie_exfiltration_pattern'] = True
                if P['setInterval'].search(content) and has_http:
                    js_analysis['has_periodic_exfiltration'] = True
                if (P['formdata'].search(content) or P['blob'].search(content)) and has_http:
                    js_analysis['has_data_packaging'] = True
                if (P['clip_read'].search(content) or P['clip_read2'].search(content)
                        or P['clip_paste'].search(content) or P['clip_data'].search(content)) and has_http:
                    js_analysis['has_clipboard_exfiltration_pattern'] = True
                if P['hist_any'].search(content) and P['json_str'].search(content) and has_http:
                    js_analysis['has_history_exfiltration_pattern'] = True
                if (P['pwd_field'].search(content) or P['pwd_attr'].search(content)):
                    if P['sendMsg'].search(content) or has_http:
                        js_analysis['has_credential_harvesting_pattern'] = True

            except Exception as e:
                print(f"  [WARN] Gagal membaca {fpath}: {e}")

    features['external_domain_count'] = len({
        u.split('/')[2] for u in js_analysis['external_urls_found']
        if len(u.split('/')) > 2
    })

    sensitive_flags = [
        'has_cookies_getAll','has_cookies_get','has_document_cookie',
        'has_clipboard_readText','has_clipboard_read','has_clipboard_paste_event',
        'has_history_search','has_history_getVisits','has_history_getTopSites',
        'has_password_field_access','has_form_submit_intercept',
        'has_downloads_onCreated','has_downloads_cancel','has_declarativeNetRequest_js',
    ]
    features['sensitive_api_count'] = sum(1 for k in sensitive_flags if features.get(k))

    return features, js_analysis


# ─── Step 4 + 5: Classify + Score ────────────────────────────────────────────

def classify_and_score(features: dict, js_analysis: dict) -> dict:
    categories = []
    F, J = features, js_analysis

    # UReq — HTTP call tanpa explicit host/network permission
    # has_host_permissions = berasal dari field host_permissions[] atau URL pattern di permissions[]
    # match_pattern_scope=3 (dari content_scripts.matches) BUKAN host permission, jadi tetap bisa UReq
    has_http = F.get('http_api_total_count', 0) > 0
    has_net_perm = F.get('has_host_permissions') or F.get('has_webRequest_permission')
    if has_http and not has_net_perm:
        categories.append('UReq')
    elif has_http and has_net_perm and F.get('external_domain_count', 0) > 0:
        # Punya host permission tapi masih kirim ke domain eksternal — tetap catat
        pass  # tidak UReq jika memang punya explicit izin

    # UProf
    has_event = J.get('has_scroll_listener') or J.get('has_click_listener') \
                or J.get('has_keydown_listener') or J.get('has_input_listener')
    has_relay = F.get('has_runtime_sendMessage') or F.get('http_api_total_count', 0) > 0
    if has_event and has_relay:
        categories.append('UProf')
    elif J.get('has_periodic_exfiltration') and (F.get('has_runtime_sendMessage') or F.get('has_onMessage_listener')):
        categories.append('UProf')

    # LF
    has_file = J.get('has_file_uri_access') or F.get('has_file_match_pattern')
    if has_file:
        categories.append('LF')

    # CE
    has_ck = F.get('has_cookies_getAll') or F.get('has_cookies_get') or F.get('has_document_cookie')
    if has_ck and F.get('http_api_total_count', 0) > 0:
        categories.append('CE')
    elif F.get('has_cookies_permission') and F.get('http_api_total_count', 0) > 0:
        categories.append('CE')
    elif J.get('has_cookie_exfiltration_pattern') and 'CE' not in categories:
        categories.append('CE')

    # HH — HTTP Hijacking
    # Sumber 1: declarativeNetRequest dengan redirect rules
    # Sumber 2: chrome.tabs.update({url:...}) = active tab hijacking via JS
    dnr_perm = F.get('has_declarativeNetRequest_permission') or F.get('has_declarativeNetRequestWithHostAccess_permission')
    tab_perm  = F.get('has_tabs_permission')   # butuh tabs permission untuk tabs.update
    added_hh  = False
    if dnr_perm and F.get('has_redirect_rules'):
        categories.append('HH'); added_hh = True
    elif dnr_perm and (F.get('has_declarativeNetRequest_js') or J.get('has_redirect_in_js')):
        categories.append('HH'); added_hh = True
    elif dnr_perm:
        categories.append('HH'); added_hh = True
    # tabs.update({url:}) — aktif mengganti URL tab = hijack
    if not added_hh and J.get('has_active_tab_hijack'):
        categories.append('HH'); added_hh = True
    elif added_hh is False and F.get('has_tabs_update_url') and F.get('http_api_total_count', 0) > 0:
        categories.append('HH')

    # UDown
    dl_perm = F.get('has_downloads_permission')
    if dl_perm and J.get('has_download_manipulation'):
        categories.append('UDown')
    elif dl_perm and F.get('has_downloads_cancel'):
        categories.append('UDown')
    elif dl_perm and F.get('has_tabs_create') and F.get('http_api_total_count', 0) > 0:
        categories.append('UDown')

    # CLE
    has_clip = F.get('has_clipboard_readText') or F.get('has_clipboard_read') or F.get('has_clipboard_paste_event')
    has_export = F.get('http_api_total_count', 0) > 0 or F.get('has_runtime_sendMessage')
    if has_clip and has_export:
        categories.append('CLE')
    elif J.get('has_clipboard_exfiltration_pattern') and 'CLE' not in categories:
        categories.append('CLE')

    # HE
    has_hist = F.get('has_history_search') or F.get('has_history_getVisits') or F.get('has_history_getTopSites')
    if has_hist and has_export:
        categories.append('HE')
    elif J.get('has_history_exfiltration_pattern') and 'HE' not in categories:
        categories.append('HE')

    # FH
    has_cred = F.get('has_password_field_access') or F.get('has_form_submit_intercept')
    if has_cred and has_export:
        categories.append('FH')
    elif J.get('has_credential_harvesting_pattern') and 'FH' not in categories:
        categories.append('FH')

    # Scoring
    score     = sum(CATEGORY_WEIGHTS.get(c, 5) for c in categories)
    breakdown = {c: CATEGORY_WEIGHTS.get(c, 5) for c in categories}
    if F.get('has_eval_or_function') or F.get('has_btoa'):
        score += OBFUSCATION_BONUS
        breakdown['obfuscation_bonus'] = OBFUSCATION_BONUS

    if   score >= 61: level, level_id, color = 'HIGH',   'RENTAN',   'red'
    elif score >= 31: level, level_id, color = 'MEDIUM', 'MENENGAH', 'yellow'
    else:             level, level_id, color = 'LOW',    'AMAN',     'green'

    return {
        'categories':   categories,
        'score':        score,
        'level':        level,
        'level_id':     level_id,
        'level_color':  color,
        'breakdown':    breakdown,
    }


# ─── Step 6: Full Pipeline ────────────────────────────────────────────────────

def analyze_extension_dir(ext_dir: str) -> dict:
    """Analisis direktori ekstensi yang sudah diekstrak."""
    ext_dir = os.path.abspath(ext_dir)
    if not os.path.isdir(ext_dir):
        return {'error': f'Direktori tidak ditemukan: {ext_dir}'}

    mf            = parse_manifest(ext_dir)
    jf, ja        = scan_js_files(ext_dir)
    combined      = {**mf, **jf}
    risk          = classify_and_score(combined, ja)

    combined['see_category_count'] = len(risk['categories'])
    combined['risk_score']         = risk['score']

    return {
        'extension_id':    os.path.basename(ext_dir),
        'ext_dir':         ext_dir,
        'analyzed_at':     datetime.now().isoformat(timespec='seconds'),
        'name':            mf.get('_extension_name', ''),
        'version':         mf.get('_extension_version', ''),
        'description':     mf.get('_extension_description', ''),
        'features':        combined,
        'findings':        ja.get('_js_findings', []),
        'fetch_calls':     ja.get('_fetch_calls', []),
        'content_scripts': mf.get('_content_scripts_raw', []),
        'external_urls':   sorted(ja['external_urls_found']),
        'combo_flags': {
            'cookie_exfiltration':    ja.get('has_cookie_exfiltration_pattern', False),
            'periodic_exfiltration':  ja.get('has_periodic_exfiltration', False),
            'data_packaging':         ja.get('has_data_packaging', False),
            'clipboard_exfiltration': ja.get('has_clipboard_exfiltration_pattern', False),
            'history_exfiltration':   ja.get('has_history_exfiltration_pattern', False),
            'credential_harvesting':  ja.get('has_credential_harvesting_pattern', False),
            'active_tab_hijacking':   ja.get('has_active_tab_hijack', False),
        },
        **risk,
    }


def analyze_crx(file_path: str, work_dir: str = None) -> dict:
    """Ekstrak + analisis file .crx atau .zip dalam satu panggilan."""
    if work_dir is None:
        work_dir = tempfile.mkdtemp(prefix='see_analysis_')
    ok, result = extract_extension(file_path, work_dir)
    if not ok:
        return {'error': f'Gagal mengekstrak: {result}', 'file': file_path}
    return analyze_extension_dir(result)


def analyze_folder(folder_path: str, work_dir: str = None) -> list[dict]:
    """
    Analisis semua .crx/.zip dalam sebuah folder SEKALIGUS.
    Juga mendukung jika folder_path sudah berisi sub-folder ekstensi (sudah diekstrak).
    """
    fp = Path(folder_path)
    results = []

    # Cek apakah ada file .crx/.zip
    crx_files = list(fp.glob('*.crx')) + list(fp.glob('*.zip'))
    # Cek apakah ada sub-folder (sudah diekstrak)
    subdirs   = [d for d in fp.iterdir() if d.is_dir() and (d / 'manifest.json').exists()]

    if crx_files:
        wd = work_dir or tempfile.mkdtemp(prefix='see_batch_')
        for f in sorted(crx_files):
            results.append(analyze_crx(str(f), wd))
    elif subdirs:
        for d in sorted(subdirs):
            results.append(analyze_extension_dir(str(d)))
    else:
        results.append({'error': f'Tidak ditemukan file .crx/.zip atau sub-folder ekstensi di: {folder_path}'})

    return results
