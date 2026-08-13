#!/usr/bin/env python3
"""
Comprehensive Dynamic Analysis Report Generator
=================================================
Analyzes ALL 96 extensions across 3 browser versions, cross-references
with static analysis, and produces a detailed JSON + markdown report.
"""
import csv, json, os, glob, sys, traceback
from collections import defaultdict, Counter
from datetime import datetime

csv.field_size_limit(10**7)

REPORTS_DIR = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\dynamic_reports'
DYNAMIC_CSV = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\dynamic_results.csv'
STATIC_CSV = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\see_final_20260727_122252.csv'
OUTPUT_JSON = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\full_analysis_output.json'
OUTPUT_MD = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\laporan_analisis_dinamis.md'

# Domains that are part of our test scenarios (should NOT be flagged)
TEST_SCENARIO_DOMAINS = {
    'www.linkedin.com', 'linkedin.com', 'static.licdn.com', 'media.licdn.com',
    'platform.linkedin.com', 'px.ads.linkedin.com', 'px4.ads.linkedin.com',
    'www.facebook.com', 'facebook.com', 'web.facebook.com', 'static.xx.fbcdn.net',
    'scontent.xx.fbcdn.net', 'connect.facebook.net',
    'www.tiktok.com', 'tiktok.com', 'sf16-website-login.neutral.ttwstatic.com',
    'lf16-tiktok-web.ttwstatic.com',
    'mail.google.com', 'accounts.google.com', 'ssl.gstatic.com',
    'fonts.gstatic.com', 'www.gstatic.com', 'translate-pa.googleapis.com',
    'analytics.google.com', 'www.google.com', 'fonts.googleapis.com',
    'chocoffee.biz.id', 'www.chocoffee.biz.id',
    'the-internet.herokuapp.com',
    'www.w3.org', 'httpbin.org',
    'storage.googleapis.com',
    'static.whatsapp.net', 'web.whatsapp.com',
}

def is_test_domain(domain):
    """Check if domain is part of test scenario."""
    if not domain:
        return True
    if domain in TEST_SCENARIO_DOMAINS:
        return True
    # Check if it's a subdomain of a test domain
    for td in TEST_SCENARIO_DOMAINS:
        if domain.endswith('.' + td):
            return True
    # Chrome internal
    if domain.startswith('chrome-extension://') or not '.' in domain:
        return True
    return False

def load_static_data():
    """Load static analysis CSV into dict keyed by extension_id."""
    static = {}
    with open(STATIC_CSV, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            static[row['extension_id']] = row
    return static

def load_dynamic_csv():
    """Load dynamic results CSV."""
    with open(DYNAMIC_CSV, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def analyze_json_report(json_path):
    """Analyze a single JSON report file for extension-specific traffic."""
    try:
        with open(json_path, encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return None
    
    captured = data.get('captured_requests', [])
    
    # Extension-originated requests (from service worker or content script)
    ext_requests = [r for r in captured if r.get('is_sw') or r.get('is_cs')]
    
    # Extension requests to NON-test domains (truly suspicious)
    ext_external = []
    for r in ext_requests:
        domain = r.get('domain', '')
        if not is_test_domain(domain):
            ext_external.append({
                'method': r.get('method'),
                'domain': domain,
                'url': r.get('url', '')[:300],
                'resource_type': r.get('resource_type'),
                'post_data': str(r.get('post_data', ''))[:500] if r.get('post_data') else None,
                'is_sw': r.get('is_sw', False),
                'is_cs': r.get('is_cs', False),
                'timestamp': r.get('timestamp_readable', ''),
            })
    
    # All POST requests (regardless of origin)
    post_requests = []
    for r in captured:
        if r.get('method') == 'POST' and r.get('post_data'):
            domain = r.get('domain', '')
            if not is_test_domain(domain) and (r.get('is_sw') or r.get('is_cs')):
                post_requests.append({
                    'domain': domain,
                    'url': r.get('url', '')[:300],
                    'post_data': str(r.get('post_data', ''))[:500],
                    'is_sw': r.get('is_sw', False),
                    'is_cs': r.get('is_cs', False),
                })
    
    return {
        'total_requests': len(captured),
        'extension_requests': len(ext_requests),
        'extension_external_requests': ext_external,
        'extension_post_to_external': post_requests,
        'ext_external_domains': list(set(r['domain'] for r in ext_external)),
        'scenario_timeline': data.get('scenario_timeline', []),
        'analysis_duration': data.get('analysis_duration_sec', 0),
        'unauthorized_domains': data.get('unauthorized_domains', []),
        'suspicious_domains': data.get('suspicious_domains', []),
        's3_unexpected_navigations': data.get('s3_unexpected_navigations', []),
    }

def main():
    print("=" * 70)
    print("  COMPREHENSIVE DYNAMIC ANALYSIS REPORT GENERATOR")
    print("=" * 70)
    
    # Load data
    print("\n[1/4] Loading static analysis data...")
    static_data = load_static_data()
    print(f"  Loaded {len(static_data)} extensions from static CSV")
    
    print("\n[2/4] Loading dynamic CSV data...")
    dyn_rows = load_dynamic_csv()
    print(f"  Loaded {len(dyn_rows)} test runs")
    
    # Group dynamic rows by extension
    ext_groups = defaultdict(list)
    for r in dyn_rows:
        ext_groups[r['extension_id']].append(r)
    
    print(f"\n[3/4] Analyzing {len(glob.glob(os.path.join(REPORTS_DIR, '*.json')))} JSON reports...")
    
    # Build comprehensive analysis per extension
    all_extensions = {}
    global_ext_external_domains = Counter()
    global_post_external = []
    
    for idx, (ext_id, runs) in enumerate(sorted(ext_groups.items())):
        if (idx + 1) % 10 == 0:
            print(f"  Processing {idx+1}/{len(ext_groups)}...")
        
        static = static_data.get(ext_id, {})
        
        ext_result = {
            'extension_id': ext_id,
            'extension_name': static.get('name', runs[0].get('extension_name', 'Unknown')),
            'static_analysis': {
                'risk_level': static.get('risk_level', 'N/A'),
                'risk_score': static.get('risk_score', 'N/A'),
                'see_categories': static.get('see_categories', ''),
                'permissions': static.get('permissions_list', ''),
                'external_domains': static.get('external_domains_list', ''),
                'obfuscation_level': static.get('obfuscation_level', ''),
                'cookie_exfiltration': static.get('cookie_exfiltration', ''),
                'credential_harvesting': static.get('credential_harvesting', ''),
                'taint_flow_count': static.get('taint_flow_count', ''),
            },
            'browser_versions': {},
            'cross_version_summary': {},
        }
        
        all_see = True
        any_see = False
        all_s1 = False
        all_s2 = False
        all_s3 = False
        
        for run in runs:
            bv = run['browser_version']
            
            # Find corresponding JSON report
            ext_safe = ext_id[:80]
            bv_safe = bv.replace(' ', '_').replace('/', '_')
            json_path = os.path.join(REPORTS_DIR, f"{ext_safe}_{bv_safe}.json")
            
            json_analysis = None
            if os.path.exists(json_path):
                json_analysis = analyze_json_report(json_path)
            
            see = run.get('see_behavior_detected', '').lower() == 'true'
            s1 = run.get('s1_download_hijack', '').lower() == 'true'
            s2 = run.get('s2_cookie_theft', '').lower() == 'true'
            s3 = run.get('s3_traffic_redirect', '').lower() == 'true'
            error = run.get('error', '')
            
            if see: any_see = True
            if not see: all_see = False
            if s1: all_s1 = True
            if s2: all_s2 = True
            if s3: all_s3 = True
            
            version_result = {
                'see_detected': see,
                's1_download_hijack': s1,
                's2_cookie_theft': s2,
                's3_traffic_redirect': s3,
                'total_outbound_requests': int(run.get('total_outbound_requests', 0)),
                'unauthorized_domains': run.get('unauthorized_domains', ''),
                'suspicious_domains': run.get('suspicious_domains', ''),
                's3_evidence': run.get('s3_evidence_summary', ''),
                'error': error,
            }
            
            if json_analysis:
                version_result['total_captured_requests'] = json_analysis['total_requests']
                version_result['extension_originated_requests'] = json_analysis['extension_requests']
                version_result['extension_external_requests'] = json_analysis['extension_external_requests']
                version_result['extension_post_to_external'] = json_analysis['extension_post_to_external']
                version_result['ext_external_domains'] = json_analysis['ext_external_domains']
                version_result['analysis_duration_sec'] = json_analysis['analysis_duration']
                
                # Track global stats
                for d in json_analysis['ext_external_domains']:
                    global_ext_external_domains[d] += 1
                for p in json_analysis['extension_post_to_external']:
                    global_post_external.append({
                        'extension_id': ext_id,
                        'extension_name': ext_result['extension_name'],
                        'browser_version': bv,
                        **p
                    })
            
            ext_result['browser_versions'][bv] = version_result
        
        # Cross-version summary
        ext_result['cross_version_summary'] = {
            'detected_in_all_versions': all_see,
            'detected_in_any_version': any_see,
            'any_s1': all_s1,
            'any_s2': all_s2,
            'any_s3': all_s3,
            'versions_tested': len(runs),
            'versions_detected': sum(1 for r in runs if r.get('see_behavior_detected','').lower() == 'true'),
        }
        
        all_extensions[ext_id] = ext_result
    
    # Build global summary
    summary = {
        'total_extensions': len(all_extensions),
        'total_test_runs': len(dyn_rows),
        'total_see_detected_runs': sum(1 for r in dyn_rows if r.get('see_behavior_detected','').lower()=='true'),
        'total_errors': sum(1 for r in dyn_rows if r.get('error','').strip()),
        'extensions_detected_all_versions': sum(1 for e in all_extensions.values() if e['cross_version_summary']['detected_in_all_versions']),
        'extensions_detected_some_versions': sum(1 for e in all_extensions.values() if e['cross_version_summary']['detected_in_any_version'] and not e['cross_version_summary']['detected_in_all_versions']),
        'extensions_with_s1': sum(1 for e in all_extensions.values() if e['cross_version_summary']['any_s1']),
        'extensions_with_s2': sum(1 for e in all_extensions.values() if e['cross_version_summary']['any_s2']),
        'extensions_with_s3': sum(1 for e in all_extensions.values() if e['cross_version_summary']['any_s3']),
        'top_extension_external_domains': global_ext_external_domains.most_common(30),
        'extensions_with_post_to_external': len(set(p['extension_id'] for p in global_post_external)),
        'post_to_external_details': global_post_external,
    }
    
    output = {
        'generated_at': datetime.now().isoformat(),
        'summary': summary,
        'extensions': all_extensions,
    }
    
    print(f"\n[4/4] Writing output...")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, default=str, ensure_ascii=False)
    print(f"  JSON saved to: {OUTPUT_JSON}")
    
    # Generate Markdown Report
    generate_markdown(output)
    print(f"  Markdown saved to: {OUTPUT_MD}")
    
    # Print summary
    print("\n" + "=" * 70)
    print("  SUMMARY")
    print("=" * 70)
    print(f"  Total extensions tested: {summary['total_extensions']}")
    print(f"  Total test runs: {summary['total_test_runs']}")
    print(f"  SEE detected runs: {summary['total_see_detected_runs']}")
    print(f"  Errors/Timeouts: {summary['total_errors']}")
    print(f"  Detected in ALL versions: {summary['extensions_detected_all_versions']}")
    print(f"  Detected in SOME versions: {summary['extensions_detected_some_versions']}")
    print(f"  S1 (Download Hijack): {summary['extensions_with_s1']} extensions")
    print(f"  S2 (Cookie Theft): {summary['extensions_with_s2']} extensions")
    print(f"  S3 (Traffic Redirect): {summary['extensions_with_s3']} extensions")
    print(f"  Extensions with POST to external: {summary['extensions_with_post_to_external']}")
    print(f"\n  Top extension-external domains:")
    for d, c in summary['top_extension_external_domains'][:15]:
        print(f"    {d}: {c}")
    print("=" * 70)


def generate_markdown(output):
    """Generate comprehensive markdown report."""
    summary = output['summary']
    extensions = output['extensions']
    
    lines = []
    lines.append("# Laporan Komprehensif Analisis Dinamis Ekstensi Browser")
    lines.append(f"\n**Generated:** {output['generated_at']}")
    lines.append("")
    
    # ── RINGKASAN GLOBAL ──
    lines.append("## 1. Ringkasan Global")
    lines.append("")
    lines.append("| Metrik | Nilai |")
    lines.append("|--------|-------|")
    lines.append(f"| Total Ekstensi Diuji | {summary['total_extensions']} |")
    lines.append(f"| Total Sesi Pengujian | {summary['total_test_runs']} |")
    lines.append(f"| SEE Terdeteksi (sesi) | {summary['total_see_detected_runs']} |")
    lines.append(f"| Error/Timeout | {summary['total_errors']} |")
    lines.append(f"| Terdeteksi di SEMUA Versi | {summary['extensions_detected_all_versions']} |")
    lines.append(f"| Terdeteksi di SEBAGIAN Versi | {summary['extensions_detected_some_versions']} |")
    lines.append(f"| S1 Download Hijack | {summary['extensions_with_s1']} ekstensi |")
    lines.append(f"| S2 Cookie Theft | {summary['extensions_with_s2']} ekstensi |")
    lines.append(f"| S3 Traffic Redirect | {summary['extensions_with_s3']} ekstensi |")
    lines.append(f"| POST ke Domain External | {summary['extensions_with_post_to_external']} ekstensi |")
    lines.append("")
    
    # ── SKENARIO PENGUJIAN ──
    lines.append("## 2. Skenario Pengujian")
    lines.append("")
    lines.append("Setiap ekstensi diuji pada **3 versi browser** (Chrome 149, 150, 151) dengan skenario:")
    lines.append("")
    lines.append("| Skenario | Deskripsi | Situs yang Dikunjungi |")
    lines.append("|----------|-----------|----------------------|")
    lines.append("| S1: Download Hijack | Menguji apakah ekstensi mencegat/mengganti file unduhan | LinkedIn, Facebook, TikTok, Gmail, Chocoffee, Herokuapp |")
    lines.append("| S2: Cookie Theft | Menguji apakah ekstensi mencuri cookie/sesi login | LinkedIn, Facebook, TikTok, Gmail, Chocoffee, Herokuapp |")
    lines.append("| S3: Traffic Redirect | Menguji apakah ekstensi mengalihkan lalu lintas | LinkedIn, Facebook, TikTok, Gmail, Chocoffee, Herokuapp |")
    lines.append("")
    
    # ── TOP EXTERNAL DOMAINS ──
    lines.append("## 3. Domain Eksternal yang Dihubungi Ekstensi")
    lines.append("")
    lines.append("Domain berikut dihubungi secara diam-diam oleh ekstensi (melalui Service Worker/Content Script) dan **bukan** bagian dari situs skenario pengujian:")
    lines.append("")
    lines.append("| # | Domain | Jumlah Ekstensi |")
    lines.append("|---|--------|-----------------|")
    for i, (d, c) in enumerate(summary['top_extension_external_domains'][:30], 1):
        lines.append(f"| {i} | `{d}` | {c} |")
    lines.append("")
    
    # ── POST DATA KE EXTERNAL ──
    if summary['post_to_external_details']:
        lines.append("## 4. Ekstensi yang Mengirim POST Data ke Server Eksternal")
        lines.append("")
        lines.append("Berikut adalah ekstensi yang **terbukti mengirimkan data (POST)** ke domain di luar skenario pengujian:")
        lines.append("")
        for p in summary['post_to_external_details']:
            lines.append(f"### Ekstensi: `{p['extension_id']}` ({p.get('extension_name', 'N/A')})")
            lines.append(f"- **Browser:** {p.get('browser_version', '?')}")
            lines.append(f"- **Domain Tujuan:** `{p.get('domain', '?')}`")
            lines.append(f"- **URL:** `{p.get('url', '?')}`")
            lines.append(f"- **Asal:** {'Service Worker' if p.get('is_sw') else 'Content Script'}")
            pd = p.get('post_data', '')
            if pd:
                lines.append(f"- **Data yang Dikirim:**")
                lines.append(f"```")
                lines.append(f"{pd[:500]}")
                lines.append(f"```")
            lines.append("")
    else:
        lines.append("## 4. POST Data ke Server Eksternal")
        lines.append("")
        lines.append("**Tidak ditemukan** ekstensi yang mengirimkan POST data ke domain di luar skenario pengujian.")
        lines.append("")
    
    # ── DETAIL PER EKSTENSI ──
    lines.append("## 5. Detail Analisis Per Ekstensi")
    lines.append("")
    
    for idx, (ext_id, ext) in enumerate(sorted(extensions.items()), 1):
        name = ext['extension_name']
        static = ext['static_analysis']
        cross = ext['cross_version_summary']
        
        lines.append(f"### {idx}. `{ext_id}`")
        lines.append(f"**Nama:** {name}")
        lines.append("")
        
        # Static info
        lines.append("#### Analisis Statis")
        lines.append(f"- **Risk Level:** {static['risk_level']}")
        lines.append(f"- **Risk Score:** {static['risk_score']}")
        lines.append(f"- **SEE Categories:** {static['see_categories']}")
        lines.append(f"- **Obfuscation:** {static['obfuscation_level']}")
        lines.append(f"- **Cookie Exfiltration:** {static['cookie_exfiltration']}")
        lines.append(f"- **Credential Harvesting:** {static['credential_harvesting']}")
        lines.append(f"- **Taint Flow Count:** {static['taint_flow_count']}")
        lines.append("")
        
        # Dynamic per version
        lines.append("#### Hasil Dinamis Per Versi Browser")
        lines.append("")
        lines.append("| Metrik | " + " | ".join(sorted(ext['browser_versions'].keys())) + " |")
        lines.append("|--------|" + "|".join(["-----"] * len(ext['browser_versions'])) + "|")
        
        versions = sorted(ext['browser_versions'].keys())
        
        def row(label, key, fmt=None):
            vals = []
            for v in versions:
                val = ext['browser_versions'][v].get(key, 'N/A')
                if fmt == 'bool':
                    val = '🚨 YES' if val else '✅ NO'
                elif fmt == 'int':
                    val = str(val)
                vals.append(str(val))
            return f"| {label} | " + " | ".join(vals) + " |"
        
        lines.append(row("SEE Detected", "see_detected", "bool"))
        lines.append(row("S1 Download Hijack", "s1_download_hijack", "bool"))
        lines.append(row("S2 Cookie Theft", "s2_cookie_theft", "bool"))
        lines.append(row("S3 Traffic Redirect", "s3_traffic_redirect", "bool"))
        lines.append(row("Total Outbound Req", "total_outbound_requests", "int"))
        lines.append(row("Extension Requests", "extension_originated_requests", "int"))
        lines.append(row("Duration (sec)", "analysis_duration_sec", "int"))
        lines.append("")
        
        # Show extension external requests if any
        has_external = False
        for v in versions:
            vdata = ext['browser_versions'][v]
            ext_ext = vdata.get('extension_external_requests', [])
            if ext_ext:
                has_external = True
                break
        
        if has_external:
            lines.append("#### Aktivitas Ekstensi ke Domain Non-Skenario")
            lines.append("")
            for v in versions:
                vdata = ext['browser_versions'][v]
                ext_ext = vdata.get('extension_external_requests', [])
                if ext_ext:
                    lines.append(f"**{v}:** {len(ext_ext)} request ke domain eksternal")
                    for r in ext_ext[:10]:
                        src = "SW" if r.get('is_sw') else "CS"
                        lines.append(f"- `{r['method']}` → `{r['domain']}` [{src}]")
                        if r.get('post_data'):
                            lines.append(f"  - Data: `{r['post_data'][:200]}`")
            lines.append("")
        
        # S3 evidence
        has_s3_evidence = False
        for v in versions:
            vdata = ext['browser_versions'][v]
            s3e = vdata.get('s3_evidence', '')
            if s3e and s3e.strip():
                has_s3_evidence = True
                break
        
        if has_s3_evidence:
            lines.append("#### Bukti S3 Traffic Redirect")
            for v in versions:
                vdata = ext['browser_versions'][v]
                s3e = vdata.get('s3_evidence', '')
                if s3e and s3e.strip():
                    lines.append(f"- **{v}:** {s3e[:300]}")
            lines.append("")
        
        # Errors
        has_error = False
        for v in versions:
            vdata = ext['browser_versions'][v]
            err = vdata.get('error', '')
            if err and err.strip():
                has_error = True
                break
        
        if has_error:
            lines.append("#### Errors")
            for v in versions:
                vdata = ext['browser_versions'][v]
                err = vdata.get('error', '')
                if err and err.strip():
                    lines.append(f"- **{v}:** `{err}`")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


if __name__ == '__main__':
    main()
