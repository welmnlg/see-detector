#!/usr/bin/env python3
"""
build_dataset.py — Merge Static + Dynamic Results into ML-ready Dataset
========================================================================
Menggabungkan hasil analisis statis (dari see_batch.py) dan hasil analisis
dinamis (dari dynamic_batch_runner.py) menjadi satu dataset CSV siap ML.

Output: CSV dengan 71+ fitur statis + fitur dinamis + label.

Label ditentukan dari hasil pengujian dinamis:
  - VULNERABLE: see_behavior_detected == True
  - BENIGN: see_behavior_detected == False (dan tidak ada error)

Usage:
  python build_dataset.py \
      --static see_incremental.csv \
      --dynamic dynamic_results.csv \
      --output final_dataset.csv

  # Bisa pakai beberapa file statis (merge):
  python build_dataset.py \
      --static hasil_triage/see_incremental_1.csv hasil_triage/see_incremental_2.csv \
      --dynamic dynamic_results.csv \
      --output final_dataset.csv
"""

import argparse
import csv
import os
import sys
from collections import OrderedDict
from datetime import datetime


def load_csv_as_dict(csv_path, key_field="extension_id"):
    """Load CSV into dict keyed by key_field. Returns (dict, fieldnames)."""
    data = OrderedDict()
    fieldnames = []
    if not os.path.exists(csv_path):
        print(f"  Warning: File not found: {csv_path}")
        return data, fieldnames

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        for row in reader:
            key = row.get(key_field, "").strip()
            if key:
                data[key] = row
    return data, fieldnames


def normalize_bool(val):
    """Convert various representations to 0/1."""
    if isinstance(val, bool):
        return 1 if val else 0
    if isinstance(val, (int, float)):
        return 1 if val else 0
    s = str(val).strip().lower()
    return 1 if s in ("true", "1", "yes") else 0


def safe_float(val, default=0.0):
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def safe_int(val, default=0):
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default


# ── Static feature columns (from see_batch.py CSV) ───────────────────

STATIC_FEATURES = [
    # Numeric
    "risk_score",
    "permissions_count",
    "sensitive_perms_count",
    "js_file_count",
    "total_js_size_bytes",
    "http_api_total",
    "external_domains",
    "fetch_api_count",
    "obfuscation_score",
    "taint_flow_count",
    # Boolean (will be 0/1)
    "has_cookies_getAll",
    "has_document_cookie",
    "has_password_field_access",
    "has_form_submit_intercept",
    "has_clipboard_readText",
    "has_history_search",
    "has_eval_or_function",
    "has_websocket",
    "has_sendBeacon",
    "has_service_worker",
    "has_content_scripts",
    "has_wildcard_cs_match",
    "has_redirect_rules",
    "has_tabs_update_url",
    # Combo flags (boolean)
    "cookie_exfiltration",
    "credential_harvesting",
    "clipboard_exfiltration",
    "history_exfiltration",
    "data_packaging",
    "active_tab_hijacking",
]

STATIC_BOOL_COLS = [
    "has_cookies_getAll", "has_document_cookie", "has_password_field_access",
    "has_form_submit_intercept", "has_clipboard_readText", "has_history_search",
    "has_eval_or_function", "has_websocket", "has_sendBeacon",
    "has_service_worker", "has_content_scripts", "has_wildcard_cs_match",
    "has_redirect_rules", "has_tabs_update_url",
    "cookie_exfiltration", "credential_harvesting", "clipboard_exfiltration",
    "history_exfiltration", "data_packaging", "active_tab_hijacking",
]

STATIC_NUMERIC_COLS = [
    "risk_score", "permissions_count", "sensitive_perms_count",
    "js_file_count", "total_js_size_bytes", "http_api_total",
    "external_domains", "fetch_api_count", "obfuscation_score",
    "taint_flow_count",
]

# ── Dynamic feature columns ──────────────────────────────────────────

DYNAMIC_FEATURES = [
    "s1_download_hijack",
    "s1_extra_downloads",
    "s2_cookie_theft",
    "s2_canary_count",
    "s2_hardware_access",
    "s3_traffic_redirect",
    "s3_unexpected_nav_count",
    "s3_injected_elements",
    "total_outbound_requests",
    "unauthorized_domain_count",
    "suspicious_domain_count",
    "see_behavior_detected",
]

DYNAMIC_BOOL_COLS = [
    "s1_download_hijack", "s2_cookie_theft", "s2_hardware_access",
    "s3_traffic_redirect", "see_behavior_detected",
]

DYNAMIC_NUMERIC_COLS = [
    "s1_extra_downloads", "s2_canary_count",
    "s3_unexpected_nav_count", "s3_injected_elements",
    "total_outbound_requests", "unauthorized_domain_count",
    "suspicious_domain_count",
]

# ── Output columns ───────────────────────────────────────────────────

OUTPUT_FIELDS = (
    ["extension_id", "extension_name"]
    + STATIC_FEATURES
    + DYNAMIC_FEATURES
    + ["label", "label_detail"]
)


def find_matching_key(static_key, dynamic_data):
    """Try to match static extension_id to dynamic extension_id/dir."""
    # Direct match
    if static_key in dynamic_data:
        return static_key

    # Static key might be directory name like "Name__extid_vVersion"
    # Dynamic key might be just the extension ID
    for dkey in dynamic_data:
        if dkey in static_key or static_key in dkey:
            return dkey
        # Extract 32-char ID from both
        import re
        static_ids = re.findall(r'[a-p]{32}', static_key)
        dynamic_ids = re.findall(r'[a-p]{32}', dkey)
        if static_ids and dynamic_ids and static_ids[0] == dynamic_ids[0]:
            return dkey

    return None


def main():
    parser = argparse.ArgumentParser(
        description="Build ML Dataset — Merge Static + Dynamic Results",
    )
    parser.add_argument("--static", nargs="+", required=True,
                        help="Path(s) ke CSV hasil analisis statis (bisa >1 file)")
    parser.add_argument("--dynamic", required=True,
                        help="Path ke CSV hasil analisis dinamis")
    parser.add_argument("--output", default="final_dataset.csv",
                        help="Output CSV siap ML")
    parser.add_argument("--include-no-dynamic", action="store_true",
                        help="Sertakan ekstensi yang hanya punya data statis (label: UNKNOWN)")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  Build ML Dataset — Merge Static + Dynamic")
    print(f"{'='*60}")

    # ── Load static data ─────────────────────────────────────────────
    static_data = OrderedDict()
    for spath in args.static:
        data, _ = load_csv_as_dict(spath)
        print(f"  Static: {spath} → {len(data)} ekstensi")
        static_data.update(data)

    print(f"  Total static (merged): {len(static_data)}")

    # ── Load dynamic data ────────────────────────────────────────────
    dynamic_data, _ = load_csv_as_dict(args.dynamic)

    # Also try keying by extension_dir
    dynamic_by_dir = {}
    with open(args.dynamic, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            edir = row.get("extension_dir", "").strip()
            if edir:
                dynamic_by_dir[edir] = row

    print(f"  Dynamic: {args.dynamic} → {len(dynamic_data)} ekstensi")

    # ── Merge ────────────────────────────────────────────────────────
    merged_rows = []
    matched = 0
    unmatched_static = 0

    for skey, srow in static_data.items():
        # Find matching dynamic result
        dkey = find_matching_key(skey, dynamic_data)
        drow = dynamic_data.get(dkey) if dkey else None

        # Also try by directory name
        if not drow:
            dkey = find_matching_key(skey, dynamic_by_dir)
            drow = dynamic_by_dir.get(dkey) if dkey else None

        if not drow and not args.include_no_dynamic:
            unmatched_static += 1
            continue

        out = OrderedDict()
        out["extension_id"] = skey
        out["extension_name"] = srow.get("name", "")

        # Static features
        for col in STATIC_FEATURES:
            if col in STATIC_BOOL_COLS:
                out[col] = normalize_bool(srow.get(col, 0))
            else:
                out[col] = safe_float(srow.get(col, 0))

        # Dynamic features
        if drow:
            matched += 1
            for col in DYNAMIC_FEATURES:
                if col in DYNAMIC_BOOL_COLS:
                    out[col] = normalize_bool(drow.get(col, 0))
                else:
                    out[col] = safe_int(drow.get(col, 0))

            # Label
            see_detected = normalize_bool(drow.get("see_behavior_detected", 0))
            has_error = bool(drow.get("error", "").strip())

            if see_detected:
                out["label"] = "VULNERABLE"
                # Detail: which scenario(s)
                scenarios = []
                if normalize_bool(drow.get("s1_download_hijack", 0)):
                    scenarios.append("S1_DOWNLOAD_HIJACK")
                if normalize_bool(drow.get("s2_cookie_theft", 0)):
                    scenarios.append("S2_COOKIE_THEFT")
                if normalize_bool(drow.get("s3_traffic_redirect", 0)):
                    scenarios.append("S3_TRAFFIC_REDIRECT")
                if not scenarios:
                    scenarios.append("UNAUTHORIZED_TRAFFIC")
                out["label_detail"] = ";".join(scenarios)
            elif has_error:
                out["label"] = "ERROR"
                out["label_detail"] = drow.get("error", "")[:100]
            else:
                out["label"] = "BENIGN"
                out["label_detail"] = ""
        else:
            # No dynamic data
            for col in DYNAMIC_FEATURES:
                out[col] = 0
            out["label"] = "UNKNOWN"
            out["label_detail"] = "no_dynamic_data"

        merged_rows.append(out)

    # ── Write output ─────────────────────────────────────────────────
    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in merged_rows:
            writer.writerow(row)

    # ── Summary ──────────────────────────────────────────────────────
    label_counts = {}
    for row in merged_rows:
        lbl = row.get("label", "UNKNOWN")
        label_counts[lbl] = label_counts.get(lbl, 0) + 1

    print(f"\n{'─'*60}")
    print(f"  HASIL MERGE")
    print(f"{'─'*60}")
    print(f"  Total records   : {len(merged_rows)}")
    print(f"  Matched (S+D)   : {matched}")
    print(f"  Unmatched static: {unmatched_static}")
    print(f"{'─'*60}")
    print(f"  DISTRIBUSI LABEL:")
    for lbl, cnt in sorted(label_counts.items()):
        icon = {"VULNERABLE": "🚨", "BENIGN": "✅", "ERROR": "⚠️", "UNKNOWN": "❓"}.get(lbl, "")
        print(f"    {icon} {lbl:15s}: {cnt}")
    print(f"{'─'*60}")
    print(f"  📄 Output: {os.path.abspath(args.output)}")
    print(f"  📊 Fitur : {len(STATIC_FEATURES)} statis + {len(DYNAMIC_FEATURES)} dinamis = {len(STATIC_FEATURES)+len(DYNAMIC_FEATURES)} total")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
