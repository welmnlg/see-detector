#!/usr/bin/env python3
"""
see_traffic_batch.py — Batch SEE Dynamic Traffic Analysis
=========================================================
Runs see_traffic_runner.py across many extensions with:
  - Configurable worker count
  - Resume support (skip already-analyzed extensions)
  - Per-extension CSV append (crash-proof)
  - CRX auto-detection and extraction
  - Progress reporting

Usage:
  python see_traffic_batch.py --input /path/to/extensions --output results.csv --workers 2 --resume
  python see_traffic_batch.py --input /path/to/crx_files --output results.csv --format crx --workers 1
  python see_traffic_batch.py --setup-profile --profile ./test_browser_profile
"""

import argparse
import csv
import json
import os
import sys
import time
import shutil
import struct
import tempfile
import traceback
import zipfile
import io
from datetime import datetime
from pathlib import Path
from multiprocessing import Process, Queue
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# Import the runner
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from see_traffic_runner import SEETrafficRunner
except ImportError:
    print("ERROR: see_traffic_runner.py not found in the same directory.")
    sys.exit(1)

CSV_FIELDS = [
    "extension_id",
    "extension_name",
    "timestamp",
    "scenario",
    "source",
    "origin",
    "method",
    "url",
    "domain",
    "resource_type",
    "post_data_preview",
    "request_headers_json",
    "is_extension_initiated",
    "is_unauthorized_domain",
    "initiator_url",
    "frame_url",
    "host_permissions",
    "content_script_matches",
    "evidence_summary",
]

def extract_crx(crx_path, dest_dir):
    with open(crx_path, 'rb') as f:
        data = f.read()
    
    if data.startswith(b'Cr24'):
        version = struct.unpack('<I', data[4:8])[0]
        if version == 2:
            pubkey_len, sig_len = struct.unpack('<II', data[8:16])
            zip_start = 16 + pubkey_len + sig_len
            zip_data = data[zip_start:]
        elif version == 3:
            header_len = struct.unpack('<I', data[8:12])[0]
            zip_start = 12 + header_len
            zip_data = data[zip_start:]
        else:
            zip_data = data
    else:
        zip_data = data

    # Try extracting as zip directly first, if failing, use the parsed zip_data
    try:
        with zipfile.ZipFile(crx_path) as z:
            z.extractall(dest_dir)
            return True
    except zipfile.BadZipFile:
        pass
    
    try:
        with zipfile.ZipFile(io.BytesIO(zip_data)) as z:
            z.extractall(dest_dir)
            return True
    except zipfile.BadZipFile:
        return False
    except Exception as e:
        return False

def discover_extensions(input_dir, fmt='auto'):
    extensions = []
    input_path = Path(input_dir)
    
    if not input_path.exists():
        return extensions
        
    for item in input_path.iterdir():
        if fmt in ('folder', 'auto') and item.is_dir():
            if (item / 'manifest.json').exists():
                extensions.append({"path": str(item), "type": "folder", "id": item.name})
        if fmt in ('crx', 'auto') and item.is_file() and item.suffix.lower() == '.crx':
            extensions.append({"path": str(item), "type": "crx", "id": item.stem})
            
    return extensions

def load_done_ids(csv_path):
    done_ids = set()
    if os.path.exists(csv_path):
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames and "extension_id" in reader.fieldnames:
                for row in reader:
                    done_ids.add(row["extension_id"])
    return done_ids

def _run_single_in_process(ext_dir, profile_dir, timeout, local_file, result_queue):
    try:
        runner = SEETrafficRunner(
            ext_dir=ext_dir,
            user_profile_dir=profile_dir,
            timeout_per_scenario=timeout,
            local_file_path=local_file
        )
        result = runner.run_analysis()
        result_queue.put(result)
    except Exception as e:
        error_msg = f"Crash in process: {str(e)}\n{traceback.format_exc()}"
        result_queue.put({
            "extension_id": os.path.basename(ext_dir),
            "extension_name": "Error",
            "captured_traffic": [],
            "host_permissions": "[]",
            "content_script_matches": "[]",
            "error": error_msg
        })

def run_single_task(ext_info, profile_dir, timeout, local_file, hard_timeout):
    ext_dir = ext_info["path"]
    temp_dir = None
    
    if ext_info["type"] == "crx":
        temp_dir = tempfile.mkdtemp(prefix="see_ext_")
        success = extract_crx(ext_dir, temp_dir)
        if not success:
            shutil.rmtree(temp_dir, ignore_errors=True)
            return {
                "extension_id": ext_info["id"],
                "extension_name": "Extraction Error",
                "captured_traffic": [],
                "host_permissions": [],
                "content_script_matches": [],
                "error": "Failed to extract CRX"
            }
        ext_dir = temp_dir

    result_queue = Queue()
    proc = Process(
        target=_run_single_in_process, 
        args=(ext_dir, profile_dir, timeout, local_file, result_queue)
    )
    
    start_time = time.time()
    proc.start()
    
    import queue
    result = None
    try:
        # Read from queue first to prevent deadlock if pipe buffer is full
        result = result_queue.get(timeout=hard_timeout)
        proc.join(timeout=5)
    except queue.Empty:
        if proc.is_alive():
            proc.kill()
            proc.join()
            result = {
                "extension_id": ext_info["id"],
                "extension_name": "Timeout",
                "captured_traffic": [],
                "host_permissions": [],
                "content_script_matches": [],
                "error": "Process killed after hard timeout"
            }
        else:
            result = {
                "extension_id": ext_info["id"],
                "extension_name": "Unknown Error",
                "captured_traffic": [],
                "host_permissions": [],
                "content_script_matches": [],
                "error": "Process finished but returned no result"
            }
            
    if result:
        result["extension_id"] = ext_info["id"] # Enforce ID from discovery
        result["duration"] = time.time() - start_time
    
    if temp_dir:
        shutil.rmtree(temp_dir, ignore_errors=True)
        
    return result

def append_to_csv(csv_path, result, csv_lock):
    with csv_lock:
        file_exists = os.path.exists(csv_path)
        with open(csv_path, 'a', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
            if not file_exists:
                writer.writeheader()
                
            for traffic in result.get("captured_traffic", []):
                row = {
                    "extension_id": result.get("extension_id", ""),
                    "extension_name": result.get("extension_name", ""),
                    "host_permissions": json.dumps(result.get("host_permissions", [])),
                    "content_script_matches": json.dumps(result.get("content_script_matches", [])),
                }
                
                for field in CSV_FIELDS:
                    if field not in row:
                        if field in traffic:
                            val = traffic[field]
                            if isinstance(val, (dict, list)):
                                row[field] = json.dumps(val)
                            else:
                                row[field] = val
                        else:
                            row[field] = ""
                            
                writer.writerow(row)

def setup_profile(profile_dir):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright is not installed. Please install it with 'pip install playwright'.")
        return
        
    print(f"Setting up profile at: {profile_dir}")
    print("Please follow these steps:")
    print("1. Log into Facebook (https://www.facebook.com)")
    print("2. Log into LinkedIn (https://www.linkedin.com)")
    print("3. Log into Gmail (https://mail.google.com)")
    print("4. Close the browser window when finished.")
    
    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=False,
            channel="chrome",
            ignore_default_args=["--enable-automation"],
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--disable-extensions',
                '--disable-dev-shm-usage',
                '--no-first-run'
            ]
        )
        # Tab 1: Facebook
        page1 = browser.pages[0] if browser.pages else browser.new_page()
        try:
            page1.goto("https://www.facebook.com", timeout=10000, wait_until="commit")
        except Exception as e:
            print(f"[!] Info Tab 1 (Facebook): {e}")
        
        # Tab 2: LinkedIn
        page2 = browser.new_page()
        try:
            page2.goto("https://www.linkedin.com/login", timeout=10000, wait_until="commit")
        except Exception as e:
            print(f"[!] Info Tab 2 (LinkedIn): {e}")
        
        # Tab 3: Gmail / Google Account
        page3 = browser.new_page()
        try:
            page3.goto("https://mail.google.com", timeout=10000, wait_until="commit")
        except Exception as e:
            print(f"[!] Info Tab 3 (Gmail): {e}")
        
        # Kembalikan fokus ke tab ketiga (Gmail) atau pertama jika diinginkan
        try:
            page3.bring_to_front()
        except Exception:
            pass
        
        print("\n[*] Jika halaman tidak terload akibat sinyal/DNS sementara, Anda bisa Refresh langsung di dalam browser.")
        print("Waiting for browser to be closed...")
        try:
            while len(browser.pages) > 0:
                time.sleep(1)
        except Exception:
            pass
            
    print("Profile setup complete.")

def main():
    parser = argparse.ArgumentParser(description="Batch SEE Dynamic Traffic Analysis")
    parser.add_argument("--input", type=str, help="Input directory containing extensions")
    parser.add_argument("--output", type=str, default="see_traffic_results.csv", help="Output CSV path")
    parser.add_argument("--profile", type=str, default="../test_browser_profile", help="Path to Chrome user profile dir")
    parser.add_argument("--workers", type=int, default=1, help="Number of parallel workers")
    parser.add_argument("--timeout", type=int, default=300, help="Per-extension timeout in seconds")
    parser.add_argument("--resume", action="store_true", help="Skip already-analyzed extensions")
    parser.add_argument("--limit", type=int, default=0, help="Max extensions to analyze (0=all)")
    parser.add_argument("--format", choices=["folder", "crx", "auto"], default="auto", help="Extension format")
    parser.add_argument("--local-file", type=str, help="Path to local test file for scenario 6")
    parser.add_argument("--setup-profile", action="store_true", help="Launch profile setup mode")
    
    args = parser.parse_args()
    
    if args.setup_profile:
        setup_profile(args.profile)
        return
        
    if not args.input:
        parser.error("--input is required unless --setup-profile is used")
        
    print(f"Discovering extensions in {args.input} (format: {args.format})...")
    extensions = discover_extensions(args.input, args.format)
    print(f"Found {len(extensions)} extensions.")
    
    if args.resume:
        done_ids = load_done_ids(args.output)
        extensions = [ext for ext in extensions if ext["id"] not in done_ids]
        print(f"Skipping {len(done_ids)} already analyzed. {len(extensions)} remaining.")
        
    if args.limit > 0:
        extensions = extensions[:args.limit]
        print(f"Limiting to {args.limit} extensions.")
        
    if not extensions:
        print("No extensions to analyze. Exiting.")
        return
        
    csv_lock = Lock()
    if not os.path.exists(args.output):
        with open(args.output, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
            writer.writeheader()
            
    print(f"Starting analysis with {args.workers} workers...")
    start_time = time.time()
    
    completed = 0
    total = len(extensions)
    hard_timeout = args.timeout + 60
    
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {
            executor.submit(run_single_task, ext, args.profile, args.timeout, args.local_file, hard_timeout): ext 
            for ext in extensions
        }
        
        for future in as_completed(futures):
            ext = futures[future]
            completed += 1
            try:
                result = future.result()
                if "error" in result and result["error"] and not result["captured_traffic"]:
                    print(f"[{completed}/{total}] FAIL {result.get('extension_name', ext['id'])} | Error: {result['error'].split(chr(10))[0]} | {result.get('duration', 0):.1f}s")
                else:
                    traffic_count = len(result.get("captured_traffic", []))
                    print(f"[{completed}/{total}] OK {result.get('extension_name', '')[:30]} | {len(result.get('captured_traffic', []))} requests | {result.get('duration', 0):.1f}s")
                    
                append_to_csv(args.output, result, csv_lock)
            except Exception as e:
                print(f"[{completed}/{total}] FAIL {ext['id']} | Unexpected error: {e}")
                
    elapsed = time.time() - start_time
    print(f"\nAnalysis complete in {elapsed:.1f}s.")

if __name__ == "__main__":
    main()
