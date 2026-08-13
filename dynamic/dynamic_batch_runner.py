#!/usr/bin/env python3
"""
dynamic_batch_runner.py — Batch Dynamic Analysis for SEE Detection
===================================================================
Menjalankan pengujian dinamis secara batch pada banyak ekstensi.

Fitur:
  - Incremental save ke CSV (crash-proof)
  - Resume support (skip ekstensi yang sudah diuji)
  - Timeout per ekstensi (kill jika hang)
  - Progress tracking
  - Hanya menguji ekstensi dengan skor statis tinggi (opsional via --min-score)
  - Logging ke file

Usage:
  # Uji semua ekstensi di folder:
  python dynamic_batch_runner.py --input /path/to/extracted/vulnerable --output dynamic_results.csv

  # Uji hanya ekstensi dengan skor statis >= 40 (gunakan hasil triage):
  python dynamic_batch_runner.py --input /path/to/extracted/vulnerable --output dynamic_results.csv --triage /path/to/see_incremental.csv --min-score 40

  # Resume dari CSV sebelumnya:
  python dynamic_batch_runner.py --input /path/to/extracted/vulnerable --output dynamic_results.csv --resume

Requirements:
  pip install playwright flask tqdm
  playwright install chromium
  playwright install-deps
"""

import argparse
import csv
import json
import os
import sys
import time
import signal
import traceback
from datetime import datetime
from pathlib import Path
from multiprocessing import Process, Queue
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from sandbox_runner import DynamicSandbox
except ImportError:
    print("ERROR: sandbox_runner.py not found in the same directory.")
    sys.exit(1)

try:
    from browser_version_manager import load_browser_manifest, BROWSERS_DIR
except ImportError:
    print("WARNING: browser_version_manager.py not found. Multi-version testing disabled.")
    def load_browser_manifest(browsers_dir=None):
        return {"chrome": [], "edge": []}
    BROWSERS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "browsers")


def generate_markdown_report(result, output_path):
    """Generate a human-readable Markdown report for one extension."""
    r = result
    lines = []
    a = lines.append

    see = r.get('see_behavior_detected', False)
    verdict = '🚨 VULNERABLE — SEE Behavior Detected' if see else '✅ CLEAN — No SEE Behavior'

    a(f"# Dynamic Analysis Report: {r.get('extension_name', 'Unknown')}")
    a(f"")
    a(f"| Field | Value |")
    a(f"|-------|-------|")
    a(f"| Extension ID | `{r.get('extension_id', '')}` |")
    a(f"| Name | {r.get('extension_name', '')} |")
    a(f"| Directory | `{r.get('extension_dir', '')}` |")
    a(f"| Analyzed At | {r.get('analyzed_at', '')} |")
    a(f"| Duration | {r.get('analysis_duration_sec', 0)} seconds |")
    a(f"| **Verdict** | **{verdict}** |")
    a(f"")

    # Manifest Info
    mi = r.get('manifest_info', {})
    if mi:
        a(f"## Manifest Info")
        a(f"- **Manifest Version**: {mi.get('manifest_version', '?')}")
        a(f"- **Permissions**: {', '.join(mi.get('permissions', [])) or 'none'}")
        a(f"- **Host Permissions**: {', '.join(mi.get('host_permissions', [])) or 'none'}")
        a(f"- **Has Service Worker**: {mi.get('has_service_worker', False)}")
        for i, cs in enumerate(mi.get('content_scripts', [])):
            a(f"- **Content Script {i+1}**: matches={cs.get('matches', [])}, js={cs.get('js', [])}")
        a(f"")

    # Scenario Results
    a(f"## Scenario Results")
    a(f"")
    a(f"### S1: Download Hijacking")
    a(f"- **Detected**: {'🚨 YES' if r.get('s1_download_hijack') else '✅ NO'}")
    a(f"- **Extra Downloads**: {r.get('s1_extra_downloads', 0)}")
    for ev in r.get('s1_evidence', []):
        a(f"- Evidence: {ev}")
    a(f"")

    a(f"### S2: Cookie Theft / Hardware Access")
    a(f"- **Cookie Theft Detected**: {'🚨 YES' if r.get('s2_cookie_theft') else '✅ NO'}")
    a(f"- **Hardware Access Detected**: {'🚨 YES' if r.get('s2_hardware_access') else '✅ NO'}")
    for ct in r.get('s2_canary_found_in_traffic', []):
        a(f"- 🍪 Canary `{ct.get('canary_value', '')}` found in request to `{ct.get('domain', '')}`")
    for ev in r.get('s2_evidence', []):
        a(f"- Evidence: {ev}")
    a(f"")

    a(f"### S3: Traffic Redirect")
    a(f"- **Redirect Detected**: {'🚨 YES' if r.get('s3_traffic_redirect') else '✅ NO'}")
    a(f"- **Injected Elements**: {r.get('s3_injected_elements', 0)}")
    for nav in r.get('s3_unexpected_navigations', []):
        a(f"- 🔀 Redirect: `{nav.get('intended', '')}` → `{nav.get('actual', '')}`")
    for ev in r.get('s3_evidence', []):
        a(f"- Evidence: {ev}")
    a(f"")

    # Network Summary
    a(f"## Network Activity Summary")
    a(f"- **Total Outbound Requests**: {r.get('total_outbound_requests', 0)}")
    unauth = r.get('unauthorized_domains', [])
    susp = r.get('suspicious_domains', [])
    a(f"- **Unauthorized Domains** ({len(unauth)}): {', '.join(unauth) if unauth else 'none'}")
    a(f"- **Suspicious Domains** ({len(susp)}): {', '.join(susp) if susp else 'none'}")
    a(f"")

    # Scenario Timeline
    tl = r.get('scenario_timeline', [])
    if tl:
        a(f"## Scenario Timeline")
        a(f"| Scenario | Duration |")
        a(f"|----------|----------|")
        for t in tl:
            a(f"| {t.get('scenario', '')} | {t.get('duration_sec', 0)}s |")
        a(f"")

    # Captured Requests (detailed network log)
    reqs = r.get('captured_requests', [])
    if reqs:
        a(f"## Captured Network Requests ({len(reqs)} total)")
        a(f"")
        a(f"| # | Time | Method | Domain | URL (truncated) | Type | SW | CS | Unauth | Suspicious |")
        a(f"|---|------|--------|--------|-----------------|------|----|----|--------|------------|")
        for i, req in enumerate(reqs[:100]):  # Cap at 100 rows in markdown
            url_short = req.get('url', '')[:80]
            a(f"| {i+1} | {req.get('timestamp_readable','')} | {req.get('method','')} | `{req.get('domain','')}` | `{url_short}` | {req.get('resource_type','')} | {'✓' if req.get('is_sw') else ''} | {'✓' if req.get('is_cs') else ''} | {'⚠️' if req.get('is_unauthorized') else ''} | {'🚨' if req.get('is_suspicious') else ''} |")
        if len(reqs) > 100:
            a(f"")
            a(f"*... and {len(reqs) - 100} more requests (see JSON for full list)*")
        a(f"")

        # Requests with POST data (potential exfiltration)
        post_reqs = [req for req in reqs if req.get('post_data')]
        if post_reqs:
            a(f"### Requests with POST Data ({len(post_reqs)})")
            a(f"")
            for req in post_reqs[:20]:
                a(f"#### `{req.get('method','')}` → `{req.get('domain','')}`")
                a(f"- URL: `{req.get('url', '')[:200]}`")
                a(f"- Time: {req.get('timestamp_readable', '')}")
                a(f"- Initiator: {'Service Worker' if req.get('is_sw') else 'Content Script' if req.get('is_cs') else 'Page'}")
                a(f"- POST Data:")
                a(f"```")
                a(f"{(req.get('post_data', '') or '')[:500]}")
                a(f"```")
                a(f"")

    # Console Logs
    logs = r.get('console_logs', [])
    if logs:
        a(f"## Console Logs ({len(logs)} entries)")
        a(f"")
        for log in logs[:50]:
            a(f"- `[{log.get('timestamp','')}] [{log.get('type','').upper()}]` {log.get('text', '')[:200]}")
        if len(logs) > 50:
            a(f"- *... and {len(logs) - 50} more entries*")
        a(f"")

    # Download Events
    dls = r.get('download_events', [])
    if dls:
        a(f"## Download Events ({len(dls)})")
        for dl in dls:
            a(f"- URL: `{dl.get('url', '')[:200]}`")
            a(f"  Filename: `{dl.get('filename', '')}`")
        a(f"")

    # Error
    if r.get('error'):
        a(f"## ⚠️ Error")
        a(f"```")
        a(f"{r.get('error', '')}")
        a(f"```")

    # Write
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

# ─── CSV Fields ───────────────────────────────────────────────────────

CSV_FIELDS = [
    "extension_id",
    "extension_name",
    "extension_dir",
    "browser_version",
    "analyzed_at",
    # Scenario 1
    "s1_download_hijack",
    "s1_extra_downloads",
    # Scenario 2
    "s2_cookie_theft",
    "s2_canary_count",
    "s2_hardware_access",
    # Scenario 3
    "s3_traffic_redirect",
    "s3_unexpected_nav_count",
    "s3_injected_elements",
    # Overall
    "see_behavior_detected",
    "total_outbound_requests",
    "unauthorized_domain_count",
    "unauthorized_domains",
    "suspicious_domain_count",
    "suspicious_domains",
    # Evidence summary
    "s1_evidence_summary",
    "s2_evidence_summary",
    "s3_evidence_summary",
    "error",
]


def result_to_csv_row(r):
    """Convert full result dict to flat CSV row."""
    return {
        "extension_id": r.get("extension_id", ""),
        "extension_name": r.get("extension_name", ""),
        "extension_dir": r.get("extension_dir", ""),
        "browser_version": r.get("browser_version", "default"),
        "analyzed_at": r.get("analyzed_at", ""),
        "s1_download_hijack": r.get("s1_download_hijack", False),
        "s1_extra_downloads": r.get("s1_extra_downloads", 0),
        "s2_cookie_theft": r.get("s2_cookie_theft", False),
        "s2_canary_count": len(r.get("s2_canary_found_in_traffic", [])),
        "s2_hardware_access": r.get("s2_hardware_access", False),
        "s3_traffic_redirect": r.get("s3_traffic_redirect", False),
        "s3_unexpected_nav_count": len(r.get("s3_unexpected_navigations", [])),
        "s3_injected_elements": r.get("s3_injected_elements", 0),
        "see_behavior_detected": r.get("see_behavior_detected", False),
        "total_outbound_requests": r.get("total_outbound_requests", 0),
        "unauthorized_domain_count": len(r.get("unauthorized_domains", [])),
        "unauthorized_domains": "; ".join(r.get("unauthorized_domains", [])),
        "suspicious_domain_count": len(r.get("suspicious_domains", [])),
        "suspicious_domains": "; ".join(r.get("suspicious_domains", [])),
        "s1_evidence_summary": " | ".join(r.get("s1_evidence", []))[:500],
        "s2_evidence_summary": " | ".join(r.get("s2_evidence", []))[:500],
        "s3_evidence_summary": " | ".join(r.get("s3_evidence", []))[:500],
        "error": r.get("error", ""),
    }


def _run_single_in_process(ext_dir, timeout, result_queue, executable_path=None, browser_channel=None, browser_label=None):
    """Run single analysis in a subprocess (so we can kill it on timeout)."""
    try:
        sandbox = DynamicSandbox(
            ext_dir,
            timeout_per_scenario=timeout,
            executable_path=executable_path,
            browser_channel=browser_channel,
            browser_label=browser_label,
        )
        result = sandbox.run_analysis()
        result_queue.put(result)
    except Exception as e:
        result_queue.put({
            "extension_id": os.path.basename(ext_dir),
            "extension_name": "",
            "extension_dir": os.path.basename(ext_dir),
            "browser_version": browser_label or "default",
            "analyzed_at": datetime.now().isoformat(),
            "s1_download_hijack": False,
            "s1_extra_downloads": 0,
            "s1_evidence": [],
            "s2_cookie_theft": False,
            "s2_canary_found_in_traffic": [],
            "s2_hardware_access": False,
            "s2_evidence": [],
            "s3_traffic_redirect": False,
            "s3_unexpected_navigations": [],
            "s3_injected_elements": 0,
            "s3_evidence": [],
            "see_behavior_detected": False,
            "total_outbound_requests": 0,
            "unauthorized_domains": [],
            "suspicious_domains": [],
            "error": f"Process error: {type(e).__name__}: {e}",
        })


def load_done_ids(csv_path):
    """Load (extension_id, browser_version) pairs that have already been processed."""
    done = set()
    if not os.path.exists(csv_path):
        return done
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                eid = row.get("extension_id", "").strip()
                edir = row.get("extension_dir", "").strip()
                bv = row.get("browser_version", "default").strip()
                if eid:
                    done.add((eid, bv))
                if edir:
                    done.add((edir, bv))
    except Exception as e:
        print(f"  Warning: Could not read resume file: {e}")
    return done


def load_triage_scores(triage_csv):
    """Load static triage scores from CSV. Returns dict: {extension_dir_name: score}."""
    scores = {}
    if not triage_csv or not os.path.exists(triage_csv):
        return scores
    try:
        with open(triage_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ext_id = row.get("extension_id", "").strip()
                try:
                    score = float(row.get("risk_score", 0))
                except (ValueError, TypeError):
                    score = 0
                if ext_id:
                    scores[ext_id] = score
    except Exception as e:
        print(f"  Warning: Could not read triage CSV: {e}")
    return scores


def discover_extensions(input_dir):
    """Find all valid extension directories."""
    extensions = []
    input_path = Path(input_dir)
    for d in sorted(input_path.iterdir()):
        if d.is_dir() and (d / "manifest.json").exists():
            extensions.append(d)
    return extensions


def _determine_browser_type(ext_dir):
    """
    Determine if extension is Chrome or Edge based on naming convention.
    Edge extensions typically have IDs that were downloaded from Edge store.
    Returns 'edge' or 'chrome'.
    """
    # Check if there's a marker file from the downloader
    marker = os.path.join(str(ext_dir), ".edge_extension")
    if os.path.exists(marker):
        return "edge"
    return "chrome"


# ─── Edge-only extension IDs (from CSV data) ─────────────────────────
# Extensions that are ONLY available on Edge, not Chrome
EDGE_ONLY_IDS = {"jjdhjfgoadphekgihokkigfghndfmffb"}


def main():
    parser = argparse.ArgumentParser(
        description="SEE Dynamic Batch Analyzer — Multi-Version 3 Scenario Testing",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Uji semua ekstensi dengan 3 versi browser:
  python dynamic_batch_runner.py --input ./vulnerable --output results.csv

  # Uji hanya yang skor statis >= 40:
  python dynamic_batch_runner.py --input ./vulnerable --output results.csv \\
      --triage see_incremental.csv --min-score 40

  # Resume setelah interrupt:
  python dynamic_batch_runner.py --input ./vulnerable --output results.csv --resume

  # Skip multi-version (gunakan default browser saja):
  python dynamic_batch_runner.py --input ./vulnerable --output results.csv --single-version
""",
    )
    parser.add_argument("--input", required=True, help="Folder berisi sub-folder ekstensi yang sudah diekstrak")
    parser.add_argument("--output", default="dynamic_results.csv", help="Output CSV file (default: dynamic_results.csv)")
    parser.add_argument("--json-output", default="", help="Optional: juga simpan full JSON per ekstensi ke folder ini")
    parser.add_argument("--triage", default="", help="Path ke CSV hasil triage statis (untuk filter by score)")
    parser.add_argument("--min-score", type=float, default=0, help="Minimum risk_score dari triage statis (default: 0 = semua)")
    parser.add_argument("--timeout", type=int, default=480, help="Timeout per ekstensi dalam detik (default: 480)")
    parser.add_argument("--resume", action="store_true", help="Skip ekstensi+versi yang sudah ada di output CSV")
    parser.add_argument("--limit", type=int, default=0, help="Limit jumlah ekstensi yang diuji (0 = semua)")
    parser.add_argument("--log", default="dynamic_batch.log", help="Log file path")
    parser.add_argument("--workers", type=int, default=1, help="Jumlah worker paralel (default: 1)")
    parser.add_argument("--single-version", action="store_true", help="Skip multi-version, gunakan default Playwright browser saja")
    args = parser.parse_args()

    # ── Discover extensions ──────────────────────────────────────────
    print(f"\n{'='*65}")
    print(f"  SEE Dynamic Batch Analyzer — Multi-Version 3 Scenario Testing")
    print(f"{'='*65}")

    all_extensions = discover_extensions(args.input)
    print(f"  Input folder  : {os.path.abspath(args.input)}")
    print(f"  Total ekstensi: {len(all_extensions)}")

    if not all_extensions:
        print("  ERROR: Tidak ada ekstensi ditemukan!")
        sys.exit(1)

    # ── Load browser manifest ────────────────────────────────────────
    manifest = load_browser_manifest()
    chrome_browsers = manifest.get("chrome", [])
    edge_browsers = manifest.get("edge", [])

    if args.single_version or (not chrome_browsers and not edge_browsers):
        if not args.single_version:
            print("  ⚠️  Tidak ada browser yang didownload. Gunakan default Playwright browser.")
            print("     Jalankan: python browser_version_manager.py  untuk download 3 versi Chrome & Edge")
        chrome_browsers = [{"label": "Playwright Default", "executable_path": None, "version": "default", "major": 0}]
        edge_browsers = [{"label": "System Edge", "executable_path": None, "version": "default", "major": 0, "_channel": "msedge"}]
    else:
        print(f"  🌐 Chrome versions: {len(chrome_browsers)} — {', '.join(b['label'] for b in chrome_browsers)}")
        print(f"  🌐 Edge versions  : {len(edge_browsers)} — {', '.join(b['label'] for b in edge_browsers)}")

    # ── Filter by triage score ───────────────────────────────────────
    triage_scores = {}
    if args.triage:
        triage_scores = load_triage_scores(args.triage)
        print(f"  Triage CSV    : {args.triage} ({len(triage_scores)} entries)")

    if args.min_score > 0 and triage_scores:
        before = len(all_extensions)
        filtered = []
        for ext in all_extensions:
            dirname = ext.name
            score = triage_scores.get(dirname, 0)
            if score == 0:
                for key, val in triage_scores.items():
                    if key in dirname or dirname in key:
                        score = val
                        break
            if score >= args.min_score:
                filtered.append(ext)
        all_extensions = filtered
        print(f"  Filter ≥{args.min_score}: {before} → {len(all_extensions)} ekstensi")

    # ── Apply limit ──────────────────────────────────────────────────
    if args.limit > 0:
        all_extensions = all_extensions[:args.limit]
        print(f"  Limit         : {args.limit}")

    if len(all_extensions) == 0:
        print("  Tidak ada ekstensi yang perlu diuji.")
        sys.exit(0)

    # ── Build task list: (ext_dir, browser_info) pairs ────────────────
    tasks = []
    for ext_dir in all_extensions:
        ext_name = ext_dir.name
        is_edge = ext_name in EDGE_ONLY_IDS

        if is_edge:
            # Edge-only extension → test with Edge browsers
            for browser in edge_browsers:
                tasks.append((ext_dir, browser, "edge"))
        else:
            # Chrome extension → test with Chrome browsers
            for browser in chrome_browsers:
                tasks.append((ext_dir, browser, "chrome"))

    # ── Resume: skip already done (ext_id + browser_version) ─────────
    if args.resume:
        done_pairs = load_done_ids(args.output)
        before = len(tasks)
        tasks = [
            (ext_dir, browser, btype) for (ext_dir, browser, btype) in tasks
            if (ext_dir.name, browser.get("label", "default")) not in done_pairs
        ]
        print(f"  Resume        : skip {before - len(tasks)} → sisa {len(tasks)} task")

    total = len(tasks)
    if total == 0:
        print("  Tidak ada task yang perlu diuji (semua sudah selesai).")
        sys.exit(0)

    num_ext = len(set(t[0].name for t in tasks))
    print(f"  Total tasks   : {total} ({num_ext} ekstensi × versi browser)")
    print(f"  Timeout/task  : {args.timeout}s")
    print(f"  Output CSV    : {args.output}")
    print(f"{'─'*65}")

    # ── Init CSV ─────────────────────────────────────────────────────
    csv_exists = os.path.exists(args.output) and os.path.getsize(args.output) > 10
    if not csv_exists:
        with open(args.output, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
            writer.writeheader()

    # Reports directory
    reports_dir = args.json_output if args.json_output else os.path.join(os.path.dirname(args.output) or ".", "dynamic_reports")
    os.makedirs(reports_dir, exist_ok=True)
    print(f"  📁 Reports dir: {os.path.abspath(reports_dir)}")

    # ── Log file ─────────────────────────────────────────────────────
    log_f = open(args.log, "a", encoding="utf-8")
    log_f.write(f"\n{'='*50}\nSession started: {datetime.now().isoformat()}\n")
    log_f.write(f"Total tasks: {total}, Timeout: {args.timeout}s, MinScore: {args.min_score}\n")

    # ── Main loop ────────────────────────────────────────────────────
    done = 0
    detected = 0
    errors = 0
    start_time = time.time()
    
    csv_lock = Lock()
    log_lock = Lock()

    def _worker_task(task_args):
        ext_dir, browser, btype = task_args
        ext_name = ext_dir.name[:35]
        browser_label = browser.get("label", "default")
        executable_path = browser.get("executable_path")
        browser_channel = browser.get("_channel")
        
        result_queue = Queue()
        proc = Process(
            target=_run_single_in_process,
            args=(str(ext_dir), args.timeout, result_queue),
            kwargs={
                "executable_path": executable_path,
                "browser_channel": browser_channel,
                "browser_label": browser_label,
            },
        )
        proc.start()
        
        result = None
        err_flag = True
        start_t = time.time()
        
        # Read from queue while process is alive to prevent pipe deadlock
        while proc.is_alive():
            try:
                result = result_queue.get(timeout=1)
                err_flag = False
                break
            except Exception:
                if time.time() - start_t > args.timeout + 30:
                    break
                    
        # Check one last time if process died right before we checked
        if err_flag and not proc.is_alive():
            try:
                result = result_queue.get(timeout=2)
                err_flag = False
            except Exception:
                pass

        if proc.is_alive():
            proc.terminate()
            proc.join(timeout=5)
            if proc.is_alive():
                proc.kill()
                proc.join(timeout=5)

            if err_flag:
                result = {
                    "extension_id": ext_dir.name,
                    "extension_name": "",
                    "extension_dir": ext_dir.name,
                    "browser_version": browser_label,
                    "analyzed_at": datetime.now().isoformat(),
                    "s1_download_hijack": False, "s1_extra_downloads": 0, "s1_evidence": [],
                    "s2_cookie_theft": False, "s2_canary_found_in_traffic": [],
                    "s2_hardware_access": False, "s2_evidence": [],
                    "s3_traffic_redirect": False, "s3_unexpected_navigations": [],
                    "s3_injected_elements": 0, "s3_evidence": [],
                    "see_behavior_detected": False,
                    "total_outbound_requests": 0,
                    "unauthorized_domains": [], "suspicious_domains": [],
                    "error": f"TIMEOUT after {args.timeout}s",
                }
        else:
            if err_flag:
                result = {
                    "extension_id": ext_dir.name,
                    "extension_name": "",
                    "extension_dir": ext_dir.name,
                    "browser_version": browser_label,
                    "analyzed_at": datetime.now().isoformat(),
                    "s1_download_hijack": False, "s1_extra_downloads": 0, "s1_evidence": [],
                    "s2_cookie_theft": False, "s2_canary_found_in_traffic": [],
                    "s2_hardware_access": False, "s2_evidence": [],
                    "s3_traffic_redirect": False, "s3_unexpected_navigations": [],
                    "s3_injected_elements": 0, "s3_evidence": [],
                    "see_behavior_detected": False,
                    "total_outbound_requests": 0,
                    "unauthorized_domains": [], "suspicious_domains": [],
                    "error": "Failed to get result from subprocess",
                }
                err_flag = True
                
        # Save JSON & MD
        ext_id_safe = result.get('extension_id', 'unknown').replace('/', '_').replace('\\', '_')[:80]
        bv_safe = browser_label.replace(' ', '_').replace('/', '_')
        
        json_path = os.path.join(reports_dir, f"{ext_id_safe}_{bv_safe}.json")
        try:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, default=str, ensure_ascii=False)
        except Exception:
            pass

        md_path = os.path.join(reports_dir, f"{ext_id_safe}_{bv_safe}_report.md")
        try:
            generate_markdown_report(result, md_path)
        except Exception:
            pass

        return result, ext_dir.name, browser_label, err_flag

    print(f"  🚀 Memulai eksekusi dengan {args.workers} worker...")
    
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        future_to_task = {executor.submit(_worker_task, t): t for t in tasks}
        
        for future in as_completed(future_to_task):
            done += 1
            try:
                result, ext_name_id, browser_label, err_flag = future.result()
            except Exception as exc:
                print(f"         ⚠️ Task exception: {exc}")
                errors += 1
                continue
                
            if err_flag or result.get("error"):
                errors += 1
                
            with csv_lock:
                row = result_to_csv_row(result)
                with open(args.output, "a", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
                    writer.writerow(row)
                    
            see = result.get("see_behavior_detected", False)
            err = result.get("error", "")
            if see:
                detected += 1

            s1 = "✓" if result.get("s1_download_hijack") else "✗"
            s2 = "✓" if result.get("s2_cookie_theft") else "✗"
            s3 = "✓" if result.get("s3_traffic_redirect") else "✗"
            unauth = len(result.get("unauthorized_domains", []))

            if see:
                status_icon = "🚨"
                status_text = "SEE DETECTED"
            elif err:
                status_icon = "⚠️"
                status_text = f"ERROR: {err[:60]}"
            else:
                status_icon = "✅"
                status_text = "CLEAN"

            elapsed = time.time() - start_time
            avg = elapsed / done if done > 1 else 0
            eta = avg * (total - done)
            eta_str = time.strftime("%H:%M:%S", time.gmtime(eta)) if eta > 0 else "??:??"

            with log_lock:
                print(f"\n  [{done:>3}/{total}] {ext_name_id[:35]} @ {browser_label}")
                print(f"         {status_icon} {status_text}")
                print(f"         S1:{s1}  S2:{s2}  S3:{s3}  Unauth:{unauth}")
                print(f"         ETA: {eta_str} | Detected: {detected}/{done} | Errors: {errors}")
                log_f.write(f"[{done}/{total}] {ext_name_id}@{browser_label} -> {status_text} | S1:{s1} S2:{s2} S3:{s3}\n")
                log_f.flush()

    # ── Summary ──────────────────────────────────────────────────────
    elapsed_total = time.time() - start_time
    print(f"\n{'='*65}")
    print(f"  RINGKASAN BATCH DYNAMIC ANALYSIS (Multi-Version)")
    print(f"{'─'*65}")
    print(f"  Total tasks diuji : {done}")
    print(f"  🚨 SEE Detected   : {detected}")
    print(f"  ✅ Clean           : {done - detected - errors}")
    print(f"  ⚠️  Errors/Timeout : {errors}")
    print(f"  Waktu total       : {time.strftime('%H:%M:%S', time.gmtime(elapsed_total))}")
    print(f"  Rata-rata/task    : {elapsed_total/max(done,1):.1f} detik")
    print(f"{'─'*65}")
    print(f"  📄 Output CSV     : {os.path.abspath(args.output)}")
    print(f"  📁 Reports folder : {os.path.abspath(reports_dir)}")
    print(f"  📋 Log            : {os.path.abspath(args.log)}")
    print(f"{'='*65}")

    log_f.write(f"\nDone: {done}, Detected: {detected}, Errors: {errors}, Time: {elapsed_total:.0f}s\n")
    log_f.close()


if __name__ == "__main__":
    main()

