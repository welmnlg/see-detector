"""
Report Generator: Dynamic Analysis Results for Vulnerable (SEE) Extensions.

This script re-runs dynamic analysis ONLY on vulnerable extensions to produce
two JSON reports:
  1. dynamic_report_all_vulnerable.json  — Full results for ALL vulnerable exts
  2. dynamic_report_active_traffic.json  — Only exts with real network traffic

IMPORTANT: This script uses the EXACT SAME DynamicSandbox from 
dynamic/sandbox_runner.py. It does NOT create any new analysis logic.
Chrome windows WILL appear (headless=False) just like dataset_builder.
"""
import os
import sys
import json
import concurrent.futures
from tqdm import tqdm

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
from dynamic.sandbox_runner import DynamicSandbox
from analyzer.static_analyzer import analyze_extension


def process_single_extension(args):
    """
    Worker function: runs static + dynamic analysis on a single extension.
    Uses the EXACT same DynamicSandbox class used in dataset_builder.py.
    """
    ext_name, extracted_vuln_dir = args
    ext_path = os.path.join(extracted_vuln_dir, ext_name)

    # --- Static analysis (metadata only, for SEE categories) ---
    static_result = analyze_extension(ext_path)
    see_categories = ""
    static_features = {}
    if 'metadata' in static_result:
        see_categories = static_result['metadata'].get('see_categories_str', '')
    if 'features' in static_result:
        static_features = static_result['features']

    # --- Dynamic analysis (uses DynamicSandbox from sandbox_runner.py) ---
    try:
        sandbox = DynamicSandbox(ext_path)
        dyn = sandbox.run_analysis(target_urls=["https://example.com"])
    except Exception as e:
        dyn = {
            'outbound_request_count': 0, 'unauthorized_domain_count': 0,
            'sends_user_data': False, 'has_periodic_sync': False,
            'is_sw_initiated': False, 'is_cs_initiated': False,
            'see_behavior_detected': False, 'cookies_stolen': False,
            'redirect_detected': False, 'download_hijacked': False,
            'captured_requests': []
        }

    entry = {
        "extension_id": ext_name,
        "see_categories": see_categories,
        "static_summary": {
            "http_api_total_count": static_features.get("http_api_total_count", 0),
            "external_domain_count": static_features.get("external_domain_count", 0),
            "sensitive_permissions_count": static_features.get("sensitive_permissions_count", 0),
            "has_holistic_match_pattern": static_features.get("has_holistic_match_pattern", False),
            "has_host_permissions": static_features.get("has_host_permissions", False),
            "permissions_count": static_features.get("permissions_count", 0),
        },
        "dynamic_features": {
            "outbound_request_count": dyn.get('outbound_request_count', 0),
            "unauthorized_domain_count": dyn.get('unauthorized_domain_count', 0),
            "sends_user_data": dyn.get('sends_user_data', False),
            "has_periodic_sync": dyn.get('has_periodic_sync', False),
            "is_sw_initiated": dyn.get('is_sw_initiated', False),
            "is_cs_initiated": dyn.get('is_cs_initiated', False),
            "see_behavior_detected": dyn.get('see_behavior_detected', False),
            "cookies_stolen": dyn.get('cookies_stolen', False),
            "redirect_detected": dyn.get('redirect_detected', False),
            "download_hijacked": dyn.get('download_hijacked', False),
        },
        "network_logs": [
            {
                "method": r.get("method"),
                "domain": r.get("domain"),
                "url": r.get("url"),
                "post_data": r.get("post_data"),
                "is_sw_initiated": r.get("is_sw_initiated"),
                "is_cs_initiated": r.get("is_cs_initiated"),
            }
            for r in dyn.get('captured_requests', [])
        ]
    }
    return entry


def generate_reports(workers=4):
    extracted_vuln_dir = os.path.join(settings.EXTRACTED_DIR, 'vulnerable')

    if not os.path.exists(extracted_vuln_dir):
        print(f"Vulnerable extensions directory not found: {extracted_vuln_dir}")
        return

    ext_dirs = [d for d in os.listdir(extracted_vuln_dir)
                if os.path.isdir(os.path.join(extracted_vuln_dir, d))]

    print(f"Found {len(ext_dirs)} vulnerable extensions.")
    print(f"Starting dynamic analysis ({workers} Chrome instances in parallel)...")
    print("Each extension opens a REAL Chrome window via Playwright.\n")

    tasks = [(name, extracted_vuln_dir) for name in ext_dirs]

    all_results = []
    active_results = []

    # Use ProcessPoolExecutor (same as dataset_builder.py) for parallel execution
    with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as executor:
        results = list(tqdm(
            executor.map(process_single_extension, tasks),
            total=len(tasks),
            desc="Dynamic Analysis (Parallel)"
        ))

    for entry in results:
        if entry is None:
            continue
        all_results.append(entry)
        if len(entry.get("network_logs", [])) > 0:
            active_results.append(entry)

    # Save reports
    output_dir = os.path.join(settings.BASE_DIR, 'output')
    os.makedirs(output_dir, exist_ok=True)

    report_all_path = os.path.join(output_dir, 'dynamic_report_all_vulnerable.json')
    report_active_path = os.path.join(output_dir, 'dynamic_report_active_traffic.json')

    with open(report_all_path, 'w', encoding='utf-8') as f:
        json.dump({
            "description": "Dynamic analysis results for ALL vulnerable SEE extensions",
            "analyzer_used": "dynamic.sandbox_runner.DynamicSandbox (same as dataset_builder)",
            "total_extensions": len(all_results),
            "total_with_traffic": len(active_results),
            "results": all_results
        }, f, indent=2, ensure_ascii=False, default=str)

    with open(report_active_path, 'w', encoding='utf-8') as f:
        json.dump({
            "description": "Only vulnerable extensions that had REAL outbound network traffic",
            "analyzer_used": "dynamic.sandbox_runner.DynamicSandbox (same as dataset_builder)",
            "total_extensions_with_traffic": len(active_results),
            "results": active_results
        }, f, indent=2, ensure_ascii=False, default=str)

    print(f"\n{'='*60}")
    print(f"REPORT 1 (ALL vulnerable):  {report_all_path}")
    print(f"  → {len(all_results)} extensions analyzed")
    print(f"\nREPORT 2 (ACTIVE traffic):  {report_active_path}")
    print(f"  → {len(active_results)} extensions had real network logs")
    print(f"{'='*60}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate dynamic analysis report")
    parser.add_argument('--workers', type=int, default=4,
                        help='Number of parallel Chrome windows (default: 4)')
    args = parser.parse_args()
    generate_reports(workers=args.workers)
