"""
Report Generator: Static Analysis Results for Vulnerable (SEE) Extensions.

This script runs static analysis on all vulnerable extensions using parallel processing.
It categorizes extensions into:
  - Minimal Criteria: Extensions that show basic signs of SEE (1-2 categories, moderate APIs).
  - Maximal Criteria: Extensions that show extensive signs of SEE (3+ categories, high APIs, holistic patterns).

Usage:
    python generate_static_report.py --workers 4
"""
import os
import sys
import json
import argparse
import concurrent.futures
from tqdm import tqdm

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import settings
from analyzer.static_analyzer import analyze_extension

def process_single_static(args):
    """
    Worker function for parallel static analysis.
    """
    ext_name, extracted_vuln_dir = args
    ext_path = os.path.join(extracted_vuln_dir, ext_name)
    
    # Run static analysis
    result = analyze_extension(ext_path)
    if "error" in result:
        return None
        
    features = result.get('features', {})
    metadata = result.get('metadata', {})
    categories = metadata.get('see_categories', [])
    
    # Define minimal vs maximal criteria
    # Maximal criteria: 3+ categories OR (Holistic pattern + >50 HTTP APIs + >5 sensitive permissions)
    is_maximal = False
    
    cat_count = len(categories)
    http_count = features.get('http_api_total_count', 0)
    sens_perms = features.get('sensitive_permissions_count', 0)
    is_holistic = features.get('has_holistic_match_pattern', False)
    
    if cat_count >= 3:
        is_maximal = True
    elif is_holistic and http_count > 50 and sens_perms > 5:
        is_maximal = True
        
    entry = {
        "extension_id": ext_name,
        "see_categories": categories,
        "criteria": "MAXIMAL" if is_maximal else "MINIMAL",
        "findings": {
            "category_count": cat_count,
            "http_api_total_count": http_count,
            "sensitive_permissions_count": sens_perms,
            "has_holistic_match_pattern": is_holistic,
            "js_file_count": features.get('js_file_count', 0),
            "permissions_count": features.get('permissions_count', 0),
            "external_urls_found": len(metadata.get('external_urls', []))
        }
    }
    
    return entry

def generate_static_reports(workers=4):
    extracted_vuln_dir = os.path.join(settings.EXTRACTED_DIR, 'vulnerable')

    if not os.path.exists(extracted_vuln_dir):
        print(f"Vulnerable extensions directory not found: {extracted_vuln_dir}")
        return

    ext_dirs = [d for d in os.listdir(extracted_vuln_dir)
                if os.path.isdir(os.path.join(extracted_vuln_dir, d))]

    print(f"Found {len(ext_dirs)} vulnerable extensions.")
    print(f"Starting STATIC analysis ({workers} workers in parallel)...\n")

    tasks = [(name, extracted_vuln_dir) for name in ext_dirs]

    all_results = []
    minimal_results = []
    maximal_results = []

    # Use ProcessPoolExecutor for parallel execution
    with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as executor:
        results = list(tqdm(
            executor.map(process_single_static, tasks),
            total=len(tasks),
            desc="Static Analysis (Parallel)"
        ))

    for entry in results:
        if entry is None:
            continue
        all_results.append(entry)
        if entry["criteria"] == "MAXIMAL":
            maximal_results.append(entry)
        else:
            minimal_results.append(entry)

    # Save reports
    output_dir = os.path.join(settings.BASE_DIR, 'output')
    os.makedirs(output_dir, exist_ok=True)

    report_path = os.path.join(output_dir, 'static_report_vulnerable.json')

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            "description": "Static analysis results for vulnerable SEE extensions",
            "total_analyzed": len(all_results),
            "total_minimal_criteria": len(minimal_results),
            "total_maximal_criteria": len(maximal_results),
            "maximal_criteria_definition": ">= 3 SEE categories OR (Holistic Pattern + >50 HTTP APIs + >5 Sensitive Permissions)",
            "minimal_criteria_definition": "Extensions that do not meet the maximal threshold but exhibit basic SEE traits.",
            "maximal_extensions": maximal_results,
            "minimal_extensions": minimal_results
        }, f, indent=2, ensure_ascii=False, default=str)

    print(f"\n{'='*60}")
    print(f"STATIC REPORT GENERATED: {report_path}")
    print(f"  -> Total extensions analyzed: {len(all_results)}")
    print(f"  -> Minimal criteria met   : {len(minimal_results)}")
    print(f"  -> Maximal criteria met   : {len(maximal_results)}")
    print(f"{'='*60}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate static analysis report")
    parser.add_argument('--workers', type=int, default=4,
                        help='Number of parallel workers (default: 4)')
    args = parser.parse_args()
    generate_static_reports(workers=args.workers)
