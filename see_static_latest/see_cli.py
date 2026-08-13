#!/usr/bin/env python3
"""
see_cli.py — SEE Vulnerability Analyzer (CLI)
"""
import sys, os, json, argparse, re
from pathlib import Path
from datetime import datetime

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from see_engine import (
    analyze_crx, analyze_extension_dir, analyze_folder,
    CATEGORY_LABELS, CATEGORY_WEIGHTS
)

RED    = '\033[91m'; YELLOW = '\033[93m'; GREEN  = '\033[92m'
CYAN   = '\033[96m'; BOLD   = '\033[1m';  DIM    = '\033[2m'
BLUE   = '\033[94m'; MAGENTA= '\033[95m'; RESET  = '\033[0m'

LEVEL_COLOR = {'HIGH': RED, 'MEDIUM': YELLOW, 'LOW': GREEN}
LEVEL_SYM   = {'HIGH': '🔴', 'MEDIUM': '🟡', 'LOW': '🟢'}

SENSITIVE_PERMS = {
    'cookies','downloads','history','tabs','activeTab','webRequest',
    'webRequestBlocking','declarativeNetRequest','clipboardRead','clipboardWrite',
    'nativeMessaging','management','debugger','pageCapture','identity','storage'
}

def c(text, color): return f"{color}{text}{RESET}"
def header(title, width=66, col=CYAN):
    bar = '─' * width
    print(f"\n{col}{bar}{RESET}")
    print(f"{col}  {title}{RESET}")
    print(f"{col}{bar}{RESET}")

def subheader(title, col=BLUE):
    print(f"\n{col}{BOLD}▌ {title}{RESET}")
    print(f"{col}{'─'*50}{RESET}")

def row(key, val, key_w=38, val_color=None):
    k = f"  {key:<{key_w}}"
    v = f"{val_color}{val}{RESET}" if val_color else str(val)
    print(f"{DIM}{k}{RESET} {v}")

def flag_row(key, val, true_col=YELLOW, false_col=GREEN,
             true_sym='⚠', false_sym='✓', suffix=''):
    col  = true_col if val else false_col
    sym  = true_sym if val else false_sym
    text = ('Ya' if val else 'Tidak') + (f' {suffix}' if suffix and val else '')
    row(key, f"{sym} {text}", val_color=col)


def print_header():
    print(c("="*66, CYAN))
    print(c("  SEE Vulnerability Analyzer — Static Analysis Tool", BOLD+CYAN))
    print(c("  Stealth Extension Exfiltration Detection  v2.0", CYAN))
    print(c("="*66, CYAN))


def print_result(r: dict, verbose: bool = False):
    if 'error' in r:
        print(c(f"\n  ✗ ERROR: {r['error']}", RED))
        return

    level  = r.get('level', 'LOW')
    lcolor = LEVEL_COLOR.get(level, RESET)
    sym    = LEVEL_SYM.get(level, '❔')
    F      = r.get('features', {})

    # ── HEADER EKSTENSI ────────────────────────────────────────────────────
    name = r.get('name') or r.get('extension_id', 'Unknown')
    ver  = f"  v{r['version']}" if r.get('version') else ''
    print(f"\n{BOLD}{'═'*66}{RESET}")
    print(f"{BOLD}  {name}{ver}{RESET}")
    print(f"  {DIM}ID: {r.get('extension_id')}  |  Dianalisis: {r.get('analyzed_at')}{RESET}")
    print(f"{'═'*66}")

    # Risk
    print(f"\n  {BOLD}Risk Level{RESET}  {lcolor}{sym} {r.get('level_id','?')} (Score: {r.get('score',0)}){RESET}")

    # SEE Categories
    cats = r.get('categories', [])
    if cats:
        cat_str = '  '.join(
            c(f"[{x}] {CATEGORY_LABELS.get(x,x)}", RED) for x in cats
        )
        print(f"  {BOLD}SEE Kategori{RESET}  {cat_str}")
    else:
        print(f"  {BOLD}SEE Kategori{RESET}  {c('✓ Tidak ada SEE terdeteksi', GREEN)}")

    # Breakdown skor
    bd = r.get('breakdown', {})
    if bd:
        print(f"\n  {DIM}{'Rincian skor:':38}{'Poin':>5}{RESET}")
        for k, v in bd.items():
            label = CATEGORY_LABELS.get(k, k.replace('_',' ').title())
            bar   = c('█' * min(v, 20), lcolor)
            print(f"  {label:<38} {bar} {lcolor}+{v}{RESET}")

    # Combo flags
    combos = [k for k, v in r.get('combo_flags', {}).items() if v]
    if combos:
        print(f"\n  {BOLD}Pola Eksfiltrasi Terkonfirmasi:{RESET}")
        for k in combos:
            print(f"    {c('✓', YELLOW)} {k.replace('_',' ').title()}")

    # ══ BLOK 1: MANIFEST JSON ══════════════════════════════════════════════
    header("① MANIFEST JSON Analysis", col=BLUE)

    subheader("Informasi Dasar", col=BLUE)
    row("Manifest Version",   F.get('manifest_version', '?'))
    row("Nama Ekstensi",      r.get('name') or '-')
    row("Versi",              r.get('version') or '-')
    has_upd = F.get('has_update_url', False)
    flag_row("Update URL (bypass CWS)",  has_upd,
             true_col=RED, true_sym='⚠', false_sym='✓')

    subheader("Permissions", col=BLUE)
    perms_list = F.get('_permissions_list', [])
    row("Jumlah Total Permissions",  F.get('permissions_count', 0))
    row("Permissions Sensitif",
        F.get('sensitive_permissions_count', 0),
        val_color=RED if F.get('sensitive_permissions_count',0) > 3 else
                  (YELLOW if F.get('sensitive_permissions_count',0) > 0 else GREEN))
    if perms_list:
        print(f"\n  {'Permission':<30} {'Sensitif?'}")
        print(f"  {'─'*42}")
        for p in sorted(perms_list):
            is_s = p in SENSITIVE_PERMS
            sym2 = c(f"⚠ YA  ({p})", RED) if is_s else c(f"✓ Tidak  ({p})", DIM)
            print(f"  {sym2}")

    host_list = F.get('_host_permissions_list', [])
    row("\nHost Permissions (domain akses)",
        F.get('host_permissions_count', 0),
        val_color=YELLOW if F.get('has_host_permissions') else GREEN)
    if host_list:
        for hp in host_list[:8]:
            print(f"      {c(hp, YELLOW)}")
        if len(host_list) > 8:
            print(f"      {DIM}... +{len(host_list)-8} domain lainnya{RESET}")

    subheader("Content Scripts", col=BLUE)
    cs_raw = r.get('content_scripts', [])
    flag_row("Ada Content Scripts",         F.get('has_content_scripts', False))
    row("Jumlah Blok Content Scripts",  F.get('content_script_count', 0))
    flag_row("Wildcard Match (<all_urls>)", F.get('has_wildcard_cs_match', False))
    flag_row("file:// Match Pattern",       F.get('has_file_match_pattern', False))
    flag_row("all_frames: true",            F.get('has_all_frames', False))
    run_map = {1:'document_start', 2:'document_end', 3:'document_idle', 0:'-'}
    row("run_at", run_map.get(F.get('content_script_run_at', 0), '-'))
    if cs_raw:
        print(f"\n  {DIM}Detail blok content_scripts:{RESET}")
        for i, cs in enumerate(cs_raw, 1):
            matches = cs.get('matches', [])
            js_files = cs.get('js', [])
            print(f"    [{i}] matches: {c(', '.join(matches), YELLOW)}")
            if js_files:
                print(f"        js:      {', '.join(js_files)}")
            if cs.get('run_at'):
                print(f"        run_at:  {cs['run_at']}")

    subheader("Background & Network Rules", col=BLUE)
    flag_row("Service Worker (MV3)",      F.get('has_service_worker', False))
    flag_row("Background Page (MV2)",     F.get('has_background_page', False))
    flag_row("DNR Rules File",            F.get('has_dnr_rules_file', False))
    flag_row("DNR Redirect Rules",        F.get('has_redirect_rules', False),
             true_col=RED, true_sym='🚨')
    row("Jumlah DNR Rules",          F.get('dnr_rule_count', 0))
    flag_row("Web Accessible Resources",  F.get('has_web_accessible_resources', False))
    flag_row("Externally Connectable",    F.get('has_externally_connectable', False))
    flag_row("CSP Custom Declaration",    F.get('has_csp_declaration', False))

    # ══ BLOK 2: JAVASCRIPT ANALYSIS ═══════════════════════════════════════
    header("② JAVASCRIPT Analysis", col=MAGENTA)

    subheader("Statistik File JS", col=MAGENTA)
    row("Jumlah File JS",         F.get('js_file_count', 0))
    row("Total Ukuran JS",        f"{F.get('total_js_size_bytes',0):,} bytes")
    row("Sensitive APIs Ditemukan", F.get('sensitive_api_count', 0),
        val_color=RED if F.get('sensitive_api_count',0) > 2 else
                 (YELLOW if F.get('sensitive_api_count',0) > 0 else GREEN))

    subheader("HTTP / Network Calls", col=MAGENTA)
    total_http = F.get('http_api_total_count', 0)
    row("Total HTTP API Calls",   total_http,
        val_color=YELLOW if total_http > 0 else GREEN)
    row("  fetch() calls",        F.get('fetch_api_count', 0))
    row("  XMLHttpRequest",       F.get('xhr_api_count', 0))
    flag_row("  WebSocket",       F.get('has_websocket', False))
    flag_row("  sendBeacon()",    F.get('has_sendBeacon', False))
    row("URL Eksternal (JS)",     F.get('external_domain_count', 0),
        val_color=YELLOW if F.get('external_domain_count',0) > 0 else GREEN)

    fetch_calls = r.get('fetch_calls', [])
    if fetch_calls and verbose:
        print(f"\n  {DIM}Detail HTTP calls:{RESET}")
        for fc in fetch_calls[:15]:
            url_str = c(fc.get('url_hint','?'), RED if 'http' in fc.get('url_hint','') else DIM)
            print(f"    {c(fc['method'],CYAN):<10} {fc['file']}:{fc['line']}  →  {url_str}")
        if len(fetch_calls) > 15:
            print(f"    {DIM}... +{len(fetch_calls)-15} calls lainnya{RESET}")

    ext_urls = r.get('external_urls', [])
    if ext_urls:
        print(f"\n  {DIM}URL/domain eksternal:{RESET}")
        for u in ext_urls[:10]:
            print(f"    {c(u, YELLOW)}")
        if len(ext_urls) > 10:
            print(f"    {DIM}... +{len(ext_urls)-10} lainnya{RESET}")

    subheader("Cookie Exfiltration (CE)", col=MAGENTA)
    flag_row("cookies.getAll()",       F.get('has_cookies_getAll', False))
    flag_row("cookies.get()",          F.get('has_cookies_get', False))
    flag_row("document.cookie",        F.get('has_document_cookie', False))

    subheader("Form / Credential Harvesting (FH)", col=MAGENTA)
    flag_row("querySelector(password)", F.get('has_password_field_access', False))
    flag_row("addEventListener(submit)", F.get('has_form_submit_intercept', False))
    flag_row("input.value read",        F.get('has_input_value_read', False))
    flag_row("autocomplete intercept",  F.get('has_autofill_intercept', False))

    subheader("Clipboard Exfiltration (CLE)", col=MAGENTA)
    flag_row("clipboard.readText()",  F.get('has_clipboard_readText', False))
    flag_row("clipboard.read()",      F.get('has_clipboard_read', False))
    flag_row("paste event listener",  F.get('has_clipboard_paste_event', False))
    flag_row("clipboard.writeText()", F.get('has_clipboard_writeText', False))

    subheader("History Exfiltration (HE)", col=MAGENTA)
    flag_row("history.search()",   F.get('has_history_search', False))
    flag_row("history.getVisits()", F.get('has_history_getVisits', False))
    flag_row("topSites.get()",     F.get('has_history_getTopSites', False))

    subheader("User Profiling (UProf)", col=MAGENTA)
    flag_row("addEventListener(scroll)",  F.get('has_scroll_listener', False))
    flag_row("addEventListener(click)",   F.get('has_click_listener', False))
    flag_row("addEventListener(keydown)", F.get('has_keydown_listener', False))
    flag_row("addEventListener(input)",   F.get('has_input_listener', False))
    flag_row("runtime.sendMessage()",     F.get('has_runtime_sendMessage', False))

    subheader("HTTP Hijacking (HH)", col=MAGENTA)
    flag_row("declarativeNetRequest (JS)", F.get('has_declarativeNetRequest_js', False),
             true_col=RED, true_sym='🚨')
    flag_row("tabs.update({url:})",        F.get('has_tabs_update_url', False),
             true_col=RED, true_sym='🚨')
    flag_row("redirect pattern (JS)",      F.get('has_redirect_in_js', False))

    subheader("Download Manipulation (UDown)", col=MAGENTA)
    flag_row("downloads.onCreated()",  F.get('has_downloads_onCreated', False))
    flag_row("downloads.cancel()",     F.get('has_downloads_cancel', False))
    flag_row("downloads.download()",   F.get('has_downloads_download', False))
    flag_row("tabs.create()",          F.get('has_tabs_create', False))

    subheader("Local File Access & Data Packaging (LF)", col=MAGENTA)
    flag_row("file:// URI in JS",  F.get('has_file_uri_access', False))
    flag_row("new FormData()",     F.get('has_formdata', False))
    flag_row("new Blob()",         F.get('has_blob', False))
    flag_row(".arrayBuffer()",     F.get('has_arraybuffer', False))

    subheader("Obfuscation", col=MAGENTA)
    flag_row("eval() / new Function()", F.get('has_eval_or_function', False),
             true_col=RED, true_sym='🚨')
    flag_row("btoa() base64",           F.get('has_btoa', False), true_col=YELLOW)
    flag_row("JSON.stringify()",        F.get('has_json_stringify', False),
             true_col=DIM, true_sym='ℹ', false_sym='✓')

    # ── TEMUAN JS DETAIL (verbose) ────────────────────────────────────────
    if verbose:
        findings = r.get('findings', [])
        if findings:
            header("③ TEMUAN DETAIL KODE JS", col=CYAN)
            prev_file = None
            for fd in findings:
                if fd['file'] != prev_file:
                    print(f"\n  {c(fd['file'], CYAN)}")
                    prev_file = fd['file']
                cat_col = RED if fd['category'] not in ('Obfuscation',) else YELLOW
                _cat_label = f"[{fd['category']}]"
                print(f"    Baris {fd['line']:<5} "
                      f"{c(_cat_label, cat_col):<20} "
                      f"{fd['pattern']}")
                # tampilkan context
                for ctx_ln in fd.get('context', []):
                    marker = c('►', RED) if ctx_ln['ln'] == fd['line'] else ' '
                    print(f"          {marker} {DIM}{ctx_ln['ln']:4}│{RESET} {ctx_ln['text']}")

    print(f"\n{'─'*66}")


def save_json(results, out_path):
    def default(o):
        if isinstance(o, set): return list(o)
        raise TypeError
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, default=default, ensure_ascii=False)
    print(c(f"\n  ✓ JSON tersimpan → {out_path}", GREEN))


def save_csv(results, out_path):
    import csv
    rows = []
    for r in results:
        if 'error' in r: continue
        rows.append({
            'extension_id':   r.get('extension_id',''),
            'name':           r.get('name',''),
            'version':        r.get('version',''),
            'risk_level':     r.get('level',''),
            'risk_level_id':  r.get('level_id',''),
            'risk_score':     r.get('score',0),
            'see_categories': ','.join(r.get('categories',[])),
            'permissions_count':      r.get('features',{}).get('permissions_count',0),
            'sensitive_perms_count':  r.get('features',{}).get('sensitive_permissions_count',0),
            'http_api_total':         r.get('features',{}).get('http_api_total_count',0),
            'external_domains':       r.get('features',{}).get('external_domain_count',0),
            'has_wildcard_cs':        r.get('features',{}).get('has_wildcard_cs_match',False),
            'analyzed_at':    r.get('analyzed_at',''),
        })
    if rows:
        with open(out_path, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=rows[0].keys())
            w.writeheader(); w.writerows(rows)
        print(c(f"\n  ✓ CSV tersimpan → {out_path}", GREEN))


def main():
    parser = argparse.ArgumentParser(
        description='SEE Vulnerability Analyzer — Static Analysis Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Contoh penggunaan:
  python see_cli.py ekstensi.crx
  python see_cli.py ekstensi.crx --verbose
  python see_cli.py folder_crx/ --json --csv
  python see_cli.py folder_extracted/  # folder ekstensi sudah diekstrak
"""
    )
    parser.add_argument('target', help='File .crx/.zip ATAU folder berisi .crx/.zip ATAU folder ekstensi diekstrak')
    parser.add_argument('--json',    action='store_true', help='Simpan hasil ke JSON')
    parser.add_argument('--csv',     action='store_true', help='Simpan ringkasan ke CSV')
    parser.add_argument('--verbose', action='store_true', help='Tampilkan detail temuan + context kode JS')
    parser.add_argument('--outdir',  default='.', help='Direktori output (default: direktori saat ini)')
    args = parser.parse_args()

    print_header()
    target = Path(args.target)
    results = []

    if not target.exists():
        print(c(f"\n  ✗ ERROR: Target tidak ditemukan: {target}", RED))
        sys.exit(1)

    if target.is_file() and target.suffix.lower() in ('.crx', '.zip'):
        print(f"\n  Mode : {c('Analisis 1 File CRX/ZIP', CYAN)}")
        print(f"  Target: {target}")
        r = analyze_crx(str(target))
        results = [r]

    elif target.is_dir() and (target / 'manifest.json').exists():
        print(f"\n  Mode : {c('Analisis Direktori Ekstensi (sudah diekstrak)', CYAN)}")
        print(f"  Target: {target}")
        r = analyze_extension_dir(str(target))
        results = [r]

    elif target.is_dir():
        crx_count = len(list(target.glob('*.crx'))) + len(list(target.glob('*.zip')))
        sub_count = sum(1 for d in target.iterdir() if d.is_dir() and (d/'manifest.json').exists())
        total = crx_count + sub_count
        print(f"\n  Mode : {c('Analisis Batch Folder', CYAN)}")
        print(f"  Target: {target}")
        print(f"  Ditemukan: {total} ekstensi ({crx_count} file CRX/ZIP, {sub_count} folder ekstrak)")
        results = analyze_folder(str(target))
    else:
        print(c(f"\n  ✗ ERROR: Target tidak valid: {target}", RED))
        sys.exit(1)

    for r in results:
        print_result(r, verbose=args.verbose)

    # Ringkasan batch
    if len(results) > 1:
        valid  = [r for r in results if 'error' not in r]
        high   = sum(1 for r in valid if r.get('level') == 'HIGH')
        medium = sum(1 for r in valid if r.get('level') == 'MEDIUM')
        low    = sum(1 for r in valid if r.get('level') == 'LOW')
        print(f"\n{c('='*66, CYAN)}")
        print(f"{BOLD}  RINGKASAN BATCH  —  {len(valid)} ekstensi dianalisis{RESET}")
        print(f"  {c(f'🔴 RENTAN   : {high}', RED)}")
        print(f"  {c(f'🟡 MENENGAH : {medium}', YELLOW)}")
        print(f"  {c(f'🟢 AMAN     : {low}', GREEN)}")
        print(c('='*66, CYAN))

    os.makedirs(args.outdir, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    if args.json: save_json(results, os.path.join(args.outdir, f'see_report_{ts}.json'))
    if args.csv:  save_csv(results,  os.path.join(args.outdir, f'see_report_{ts}.csv'))


if __name__ == '__main__':
    main()
