#!/usr/bin/env python3
"""
batch_logger.py — Batch Network Traffic Logger for Multiple Extensions (V2)
=============================================================================
Runs network_logger_v2.py on a folder of extensions with parallel workers.
All results are combined into one CSV for easy analysis.

Usage:
    python batch_logger.py --input <folder> --output all_traffic.csv --workers 2 --timeout 180

    # Dengan browser profile (anti-sandbox, pre-logged-in):
    python batch_logger.py --input <folder> --output all_traffic.csv --workers 2 --timeout 300 --profile test_browser_profile

    # Resume from previous run (skips already-processed extensions):
    python batch_logger.py --input <folder> --output all_traffic.csv --workers 2 --timeout 300 --resume
"""

import argparse
import csv
import json
import os
import sys
import time
import traceback
from datetime import datetime, timedelta
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed

# Ensure we can import from the same directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from network_logger_v2 import NetworkLogger, CSV_FIELDS
    print("[INFO] Menggunakan network_logger_v2 (enhanced)")
except ImportError:
    from network_logger import NetworkLogger, CSV_FIELDS
    print("[INFO] Menggunakan network_logger (original)")


def discover_extensions(input_path):
    """Find all valid extension directories under input_path."""
    extensions = []
    input_path = Path(input_path)
    if not input_path.exists():
        print(f"ERROR: Input path does not exist: {input_path}")
        return []

    for entry in sorted(input_path.iterdir()):
        if entry.is_dir():
            manifest = entry / "manifest.json"
            if manifest.exists():
                extensions.append(str(entry))
    return extensions


def get_already_processed(csv_path):
    """Read existing CSV and return set of already-processed extension IDs."""
    done = set()
    if not os.path.exists(csv_path):
        return done
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                eid = row.get("extension_id", "")
                if eid:
                    done.add(eid)
    except Exception:
        pass
    return done


def run_single_extension(ext_dir, timeout, output_csv, profile_dir=None):
    """Worker function: run NetworkLogger on one extension and save to CSV."""
    try:
        logger = NetworkLogger(ext_dir, timeout=timeout, output_csv=output_csv, profile_dir=profile_dir)
        traffic = logger.run()
        logger.save_csv()
        summary = logger.get_summary()
        return {
            "status": "ok",
            "ext_id": summary["extension_id"],
            "ext_name": summary["extension_name"],
            "total_requests": summary["total_requests"],
            "ext_initiated": summary["extension_initiated"],
            "canary_hits": summary["canary_hits"],
            "post_requests": summary["post_requests"],
            "ext_domains": summary["ext_contacted_domains"],
        }
    except Exception as e:
        return {
            "status": "error",
            "ext_id": os.path.basename(ext_dir),
            "ext_name": "?",
            "error": f"{type(e).__name__}: {e}",
            "total_requests": 0,
            "ext_initiated": 0,
            "canary_hits": 0,
            "post_requests": 0,
            "ext_domains": [],
        }


def main():
    parser = argparse.ArgumentParser(description="Batch Network Traffic Logger")
    parser.add_argument("--input", required=True, help="Folder containing unpacked extensions")
    parser.add_argument("--output", default="all_traffic.csv", help="Output CSV file (default: all_traffic.csv)")
    parser.add_argument("--workers", type=int, default=1, help="Number of parallel workers (default: 1)")
    parser.add_argument("--timeout", type=int, default=180, help="Timeout per extension in seconds (default: 180)")
    parser.add_argument("--resume", action="store_true", help="Skip already-processed extensions")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of extensions to process (0 = no limit)")
    parser.add_argument("--summary", default="batch_summary.csv", help="Summary CSV (1 row per extension)")
    parser.add_argument("--profile", default=None, help="Path to persistent browser profile (pre-logged-in, anti-sandbox)")
    args = parser.parse_args()

    # Discover extensions
    all_extensions = discover_extensions(args.input)
    if not all_extensions:
        print("No extensions found with manifest.json. Check your --input path.")
        return

    # Resume support
    skip_ids = set()
    if args.resume:
        skip_ids = get_already_processed(args.output)
        if skip_ids:
            print(f"Resume mode: skipping {len(skip_ids)} already-processed extensions.")

    # Filter out already done
    todo = []
    for ext in all_extensions:
        ext_id = os.path.basename(ext)
        if ext_id not in skip_ids:
            todo.append(ext)

    if args.limit > 0:
        todo = todo[:args.limit]

    total = len(todo)
    if total == 0:
        print("All extensions already processed. Nothing to do.")
        return

    # Print header
    print(f"\n{'='*70}")
    print(f"  BATCH NETWORK TRAFFIC LOGGER")
    print(f"{'='*70}")
    print(f"  Input folder  : {os.path.abspath(args.input)}")
    print(f"  Total found   : {len(all_extensions)} extensions")
    print(f"  To process    : {total} extensions")
    print(f"  Workers       : {args.workers}")
    print(f"  Timeout/ext   : {args.timeout}s")
    print(f"  Profile       : {args.profile or '(none - clean browser)'}")
    print(f"  Output CSV    : {os.path.abspath(args.output)}")
    print(f"  Summary CSV   : {os.path.abspath(args.summary)}")
    est_time = total * args.timeout // max(args.workers, 1)
    print(f"  Est. time     : ~{timedelta(seconds=est_time)}")
    print(f"{'─'*70}\n")

    start_time = time.time()
    results = []
    completed = 0
    canary_total = 0

    if args.workers <= 1:
        # Sequential mode (simpler, easier to debug)
        for i, ext_dir in enumerate(todo):
            ext_name = os.path.basename(ext_dir)
            print(f"\n  [{i+1}/{total}] {ext_name}")
            print(f"         Starting analysis... (timeout: {args.timeout}s)")

            result = run_single_extension(ext_dir, args.timeout, args.output, args.profile)
            results.append(result)
            completed += 1

            status_icon = "✅" if result["status"] == "ok" else "❌"
            canary_icon = "🚨" if result["canary_hits"] > 0 else "·"
            canary_total += result["canary_hits"]

            print(f"         {status_icon} Requests: {result['total_requests']} | "
                  f"Ext-init: {result['ext_initiated']} | "
                  f"POST: {result['post_requests']} | "
                  f"Canary: {canary_icon}{result['canary_hits']}")
            if result.get("ext_domains"):
                print(f"         Ext domains: {', '.join(result['ext_domains'][:5])}")
            if result.get("error"):
                print(f"         Error: {result['error']}")

            elapsed = time.time() - start_time
            avg = elapsed / completed
            remaining = avg * (total - completed)
            print(f"         ETA: {timedelta(seconds=int(remaining))} | "
                  f"Canary hits so far: {canary_total}")
    else:
        # Parallel mode
        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = {}
            for ext_dir in todo:
                future = executor.submit(run_single_extension, ext_dir, args.timeout, args.output, args.profile)
                futures[future] = ext_dir

            for future in as_completed(futures):
                ext_dir = futures[future]
                ext_name = os.path.basename(ext_dir)
                completed += 1
                try:
                    result = future.result()
                except Exception as e:
                    result = {
                        "status": "error",
                        "ext_id": ext_name,
                        "ext_name": "?",
                        "error": str(e),
                        "total_requests": 0,
                        "ext_initiated": 0,
                        "canary_hits": 0,
                        "post_requests": 0,
                        "ext_domains": [],
                    }
                results.append(result)
                canary_total += result["canary_hits"]

                status_icon = "✅" if result["status"] == "ok" else "❌"
                canary_icon = "🚨" if result["canary_hits"] > 0 else "·"
                print(f"  [{completed}/{total}] {ext_name} "
                      f"{status_icon} Req:{result['total_requests']} "
                      f"Ext:{result['ext_initiated']} "
                      f"POST:{result['post_requests']} "
                      f"Canary:{canary_icon}{result['canary_hits']}")

    # ── Save summary CSV ──────────────────────────────────────────────
    summary_fields = [
        "extension_id", "extension_name", "status",
        "total_requests", "ext_initiated", "canary_hits",
        "post_requests", "ext_domains", "error",
    ]
    with open(args.summary, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=summary_fields, extrasaction="ignore")
        writer.writeheader()
        for r in results:
            row = dict(r)
            row["ext_domains"] = "; ".join(r.get("ext_domains", []))
            row["error"] = r.get("error", "")
            writer.writerow(row)

    # ── Final report ──────────────────────────────────────────────────
    elapsed = time.time() - start_time
    ok_count = sum(1 for r in results if r["status"] == "ok")
    err_count = sum(1 for r in results if r["status"] == "error")

    print(f"\n{'='*70}")
    print(f"  BATCH ANALYSIS COMPLETE")
    print(f"{'─'*70}")
    print(f"  Total processed     : {completed}")
    print(f"  Successful          : {ok_count}")
    print(f"  Errors              : {err_count}")
    print(f"  🚨 Canary hits total: {canary_total}")
    print(f"  Total time          : {timedelta(seconds=int(elapsed))}")
    print(f"  Avg time/ext        : {elapsed/max(completed,1):.1f}s")
    print(f"{'─'*70}")
    print(f"  📄 Full traffic CSV : {os.path.abspath(args.output)}")
    print(f"  📊 Summary CSV      : {os.path.abspath(args.summary)}")
    print(f"{'='*70}")

    # Highlight extensions with canary hits
    canary_exts = [r for r in results if r["canary_hits"] > 0]
    if canary_exts:
        print(f"\n  ⚠️  EXTENSIONS WITH CANARY DATA IN TRAFFIC:")
        for r in canary_exts:
            print(f"     🚨 {r['ext_name']} ({r['ext_id']}) — {r['canary_hits']} canary hits")
    else:
        print(f"\n  ✅ No canary data exfiltration detected in any extension.")


if __name__ == "__main__":
    main()
