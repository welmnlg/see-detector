# =============================================================================
# static_analyzer.py
# Orkestrator Pipeline Analisis Statis Ekstensi Browser
#
# Pipeline:
#   1. Parse manifest.json  → manifest_features
#   2. Scan file JavaScript → js_features + js_analysis
#   3. Gabungkan fitur      → combined_features
#   4. Klasifikasi SEE      → categories
#   5. Hitung risk score    → score, level, level_id, level_color
#   6. Bangun hasil akhir   → result dict
# =============================================================================

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extractor import manifest_parser
from analyzer import js_scanner, see_classifier


def analyze_extension(ext_dir):
    """
    Menjalankan pipeline analisis statis lengkap untuk satu ekstensi.

    Args:
        ext_dir (str): Path ke direktori ekstensi yang sudah diekstrak.

    Returns:
        result (dict): Dictionary berisi:
            - extension_id  : nama direktori ekstensi
            - features      : semua fitur gabungan (manifest + JS)
            - metadata      : SEE categories, risk score, risk level,
                              detail breakdown, external URLs
            - error (opt.)  : pesan error jika direktori tidak valid
    """
    ext_dir = os.path.abspath(ext_dir)

    if not os.path.exists(ext_dir) or not os.path.isdir(ext_dir):
        return {"error": f"Directory not found: {ext_dir}"}

    # 1. Parse Manifest
    manifest_features = manifest_parser.parse_manifest(ext_dir)

    # 2. Scan JavaScript
    js_features, js_analysis = js_scanner.scan_js_files(ext_dir)

    # 3. Gabungkan semua fitur
    combined_features = {**manifest_features, **js_features}

    # 4. Klasifikasi SEE Categories
    categories = see_classifier.classify_see_categories(combined_features, js_analysis)

    # 5. Hitung Risk Score
    score, level, level_id, level_color, breakdown = see_classifier.calculate_risk_score(
        categories, combined_features
    )

    # 6. Update composite features untuk ML dataset
    combined_features['see_category_count'] = len(categories)
    combined_features['risk_score']          = score

    # 7. Bangun hasil akhir
    result = {
        'extension_id': os.path.basename(ext_dir),
        'features':     combined_features,
        'metadata': {
            # ── SEE Classification ──────────────────────────────────────
            'see_categories':     categories,
            'see_categories_str': ','.join(categories) if categories else 'NONE',

            # ── Risk Scoring ─────────────────────────────────────────────
            'risk_score':         score,
            'risk_level':         level,           # "HIGH" / "MEDIUM" / "LOW"
            'risk_level_id':      level_id,        # "RENTAN" / "MENENGAH" / "AMAN"
            'risk_level_color':   level_color,     # "merah" / "kuning" / "hijau"
            'risk_breakdown':     breakdown,       # skor per kategori

            # ── Informational ─────────────────────────────────────────────
            'external_urls':      list(js_analysis['external_urls_found']),

            # ── Combo Flags (untuk laporan detail) ────────────────────────
            'combo_flags': {
                'cookie_exfiltration':      js_analysis.get('has_cookie_exfiltration_pattern', False),
                'periodic_exfiltration':    js_analysis.get('has_periodic_exfiltration', False),
                'data_packaging':           js_analysis.get('has_data_packaging', False),
                'clipboard_exfiltration':   js_analysis.get('has_clipboard_exfiltration_pattern', False),
                'history_exfiltration':     js_analysis.get('has_history_exfiltration_pattern', False),
                'credential_harvesting':    js_analysis.get('has_credential_harvesting_pattern', False),
            },
        }
    }

    return result


def print_analysis_report(result):
    """
    Mencetak laporan analisis statis ke terminal dengan format yang mudah dibaca.

    Args:
        result (dict): Output dari analyze_extension().
    """
    if 'error' in result:
        print(f"[ERROR] {result['error']}")
        return

    meta  = result['metadata']
    ext   = result['extension_id']
    score = meta['risk_score']
    level = meta['risk_level_id']
    color = meta['risk_level_color'].upper()

    # Simbol level
    symbols = {'RENTAN': '🔴', 'MENENGAH': '🟡', 'AMAN': '🟢'}
    sym = symbols.get(level, '⚪')

    print(f"\n{'='*65}")
    print(f"  ANALISIS STATIS SEE — {ext}")
    print(f"{'='*65}")

    # Risk Level
    print(f"  Risk Level  : {sym} {level} ({color})")
    print(f"  Risk Score  : {score} / 100+")

    # SEE Categories
    cats = meta['see_categories']
    if cats:
        print(f"  Kategori    : {', '.join(cats)}")
    else:
        print(f"  Kategori    : Tidak ada SEE terdeteksi")

    # Score breakdown
    if meta['risk_breakdown']:
        print(f"\n  Rincian Skor:")
        for k, v in meta['risk_breakdown'].items():
            print(f"    {k:<30} +{v}")

    # Combo flags
    active_combos = [k for k, v in meta['combo_flags'].items() if v]
    if active_combos:
        print(f"\n  Pola Eksfiltrasi Terkonfirmasi:")
        for combo in active_combos:
            print(f"    ✓ {combo.replace('_', ' ').title()}")

    # External URLs
    if meta['external_urls']:
        print(f"\n  URL Eksternal Ditemukan:")
        for url in meta['external_urls'][:5]:  # tampilkan max 5
            print(f"    → {url}")
        if len(meta['external_urls']) > 5:
            print(f"    ... +{len(meta['external_urls']) - 5} URL lainnya")

    print(f"{'='*65}\n")


if __name__ == "__main__":
    from config import settings
    import json

    test_dir = os.path.join(settings.EXTRACTED_DIR, 'vulnerable')
    if os.path.exists(test_dir):
        for item in sorted(os.listdir(test_dir)):
            ext_path = os.path.join(test_dir, item)
            if os.path.isdir(ext_path):
                result = analyze_extension(ext_path)
                print_analysis_report(result)
    else:
        print(f"[INFO] Test directory not found: {test_dir}")
        print("[INFO] Jalankan dengan: python static_analyzer.py <path_ke_ekstensi>")
        if len(sys.argv) > 1:
            result = analyze_extension(sys.argv[1])
            print_analysis_report(result)
            print("\nJSON Output:")
            print(json.dumps(result['metadata'], indent=2, default=str))
