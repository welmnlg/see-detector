"""
SEE Extension Crawler & Downloader v2
=======================================
Mencari, mendownload, dan mengecek label Critical pada ekstensi Chrome
yang memenuhi kriteria SEE (Stealth Extension Exfiltration).

Alur kerja:
  1. Cari ekstensi per-permission via Chrome Stats API
  2. Deduplikasi hasil pencarian
  3. Download CRX langsung dari Google CRX server
  4. Cek halaman overview untuk label "Critical"
  5. Generate laporan CSV + Markdown
"""

import os
import sys
import io
import json
import time
import csv
import re
import argparse
import requests
from datetime import datetime, timezone
from pathlib import Path

# Fix Windows encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# -- Konfigurasi -------------------------------------------------------

API_BASE = "https://chrome-stats.com/api"
API_KEY = "4611d1b1-3ada-4950-8acf-21963f6c892f"
HEADERS = {
    "content-type": "application/json",
    "x-api-key": API_KEY
}

# Cookies untuk Chrome Stats download API
COOKIES = {
    "auth": "s%3Av2%3Af15ac02b-a39d-4144-a37e-624bae7df902.teKDJl4lIHtrt%2FOC5Z1p%2BgYBqgOv1BFRh%2Fj42N09f1k",
    "cf_clearance": "4_vjhthNw5LozN0kB6zKxHW6__3OCKyiYK0PTcj4.HM-1780464699-1.2.1.1-dPr4CqlwHAnSmNywn4FxtAoFCDyWnpryr7UVDEsS7R4.m4V7axkxOkH8MRyIWv_PZ8h.uZbsCBNiM.MucKW8H6w5m1n4o0vgUA85UXR1IzHWexUUBD4CIgn2dDDdTYxpunUYXrfA27V4Y1uPxdqG5C_tFn.pO53pq0lrZ6DdTnUxPKDvmXMEnT3fDR.lh7qQSpIIc6B6SQrybu8iwH55odz5yuHJ9pEIqkPlTmeBqBSXKq3u30RAa7F6308ISwhJnMCUG5EP2A.Q7MLGg75usip3IAYb4HiTzXVr_2wXhjedbsLr05ntHgCPyq4vHSxffegBK.ctj1LBa1c9YIJ_XaeJfXDOpEVd3KX1YqsyrojPwLjUs6b3nAQDUQ8u3opXcPMPCzaN3mplTd_byr8j31b2c1BpyhCMKEcm_dthYUI",
    "_ga": "GA1.1.1645539605.1766504830",
}

# Google CRX download URL (fallback)
GOOGLE_CRX_URL = (
    "https://clients2.google.com/service/update2/crx"
    "?response=redirect&os=win&arch=x64&os_arch=x86_64"
    "&nacl_arch=x86-64&prod=chromecrx&prodchannel="
    "&prodversion=125.0.6422.112&lang=en&acceptformat=crx3"
    "&x=id%3D{ext_id}%26installsource%3Dondemand%26uc"
)

# 35 permissions (32 dari paper + cookies, activeTab, storage)
PERMISSIONS = [
    "accessibilityFeatures.read", "accessibilityFeatures.modify",
    "bookmarks", "clipboardRead", "clipboardWrite",
    "contentSettings", "debugger",
    "declarativeNetRequest", "declarativeNetRequestFeedback",
    "desktopCapture", "downloads", "downloads.open", "downloads.ui",
    "favicon", "geolocation", "history",
    "identity", "identity.email", "management",
    "nativeMessaging", "pageCapture", "privacy", "proxy",
    "readingList", "system.storage",
    "tabCapture", "tabGroups", "tabs", "topSites",
    "ttsEngine", "webAuthenticationProxy", "webNavigation",
    # Tambahan dari user
    "cookies", "activeTab", "storage",
]

PAGE_SIZE = 25
REQUEST_DELAY = 2.0  # detik antar request
MAX_RETRIES = 5      # max retry saat 429


def _api_request_with_retry(method, url, **kwargs):
    """Melakukan HTTP request dengan retry otomatis saat rate limited (429)."""
    for attempt in range(MAX_RETRIES):
        try:
            if method == "POST":
                r = requests.post(url, **kwargs)
            else:
                r = requests.get(url, **kwargs)

            if r.status_code == 429:
                wait = min(5 * (2 ** attempt), 60)  # 5s, 10s, 20s, 40s, 60s
                print(f"    [429] Rate limited. Menunggu {wait}s (retry {attempt+1}/{MAX_RETRIES})...")
                time.sleep(wait)
                continue

            r.raise_for_status()
            return r
        except requests.exceptions.HTTPError as e:
            if "429" in str(e):
                wait = min(5 * (2 ** attempt), 60)
                print(f"    [429] Rate limited. Menunggu {wait}s (retry {attempt+1}/{MAX_RETRIES})...")
                time.sleep(wait)
                continue
            raise
    return None


def search_extensions_by_permission(permission):
    """Mencari ekstensi yang memiliki permission tertentu."""
    all_items = []
    page = 1
    total = 0

    while True:
        body = {
            "sorting": "userCount",
            "sortDirection": "desc",
            "index": "extension",
            "page": page,
            "fields": {
                "operator": "AND",
                "conditions": [
                    {"column": "manifest.manifest_version", "operator": "=", "value": 3},
                    {"column": "manifest.host_permissions", "operator": "Not exists", "value": ""},
                    {"column": "manifest.has_content_scripts", "operator": "Exists", "value": ""},
                    {"column": "riskImpact", "operator": ">=", "value": 2},
                    {"column": "obsolete", "operator": "Not exists", "value": ""},
                    {"column": "manifest.permissions", "operator": "Contains", "value": permission}
                ]
            }
        }

        r = _api_request_with_retry(
            "POST", f"{API_BASE}/chrome/advanced-search",
            headers=HEADERS, json=body, timeout=30
        )

        if r is None:
            print(f"    [ERROR] Gagal setelah {MAX_RETRIES} retry pada halaman {page}")
            break

        data = r.json()
        items = data.get("items", [])
        total = data.get("total", 0)
        all_items.extend(items)

        if len(all_items) >= total or len(items) == 0:
            break

        page += 1
        time.sleep(REQUEST_DELAY)

    return all_items, total


def download_crx(ext_id, version, output_path):
    """Download ekstensi dari Chrome Stats API (dengan cookies), fallback ke Google CRX."""

    # Metode 1: Chrome Stats API (CRX lalu ZIP)
    for dl_type in ["CRX", "ZIP"]:
        try:
            url = f"{API_BASE}/download-link?id={ext_id}&type={dl_type}&version={version}&versionCode={version}"
            r = requests.get(url, headers={"x-api-key": API_KEY}, cookies=COOKIES, timeout=60, stream=True)

            if r.status_code == 200 and int(r.headers.get('content-length', len(r.content))) > 100:
                suffix = ".crx" if dl_type == "CRX" else ".zip"
                file_path = output_path + suffix
                with open(file_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                fsize = os.path.getsize(file_path)
                if fsize > 100:
                    return True, file_path, fsize
                else:
                    os.remove(file_path)
        except Exception:
            continue

    # Metode 2: Google CRX direct (fallback)
    try:
        url = GOOGLE_CRX_URL.format(ext_id=ext_id)
        r = requests.get(url, timeout=60, allow_redirects=True, stream=True)
        if r.status_code == 200:
            file_path = output_path + ".crx"
            with open(file_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            fsize = os.path.getsize(file_path)
            if fsize > 100:
                return True, file_path, fsize
            else:
                os.remove(file_path)
    except Exception as e:
        pass

    return False, None, 0


def check_critical_label(ext_id):
    """
    Cek halaman overview ekstensi untuk label Critical.
    Mengembalikan (has_critical, critical_reasons).
    """
    try:
        overview_url = f"https://chrome-stats.com/d/{ext_id}"
        r = requests.get(overview_url, timeout=30, headers={"x-api-key": API_KEY})
        r.raise_for_status()

        html = r.text
        critical_reasons = []

        # Cari dari data JSON embedded di halaman
        # Format: severity:"Critical",description:"..."
        pattern = r'severity:"Critical",description:"([^"]+)"'
        matches = re.findall(pattern, html)
        for desc in matches:
            if not desc.startswith("*"):  # Abaikan yang di-mask
                critical_reasons.append(desc)

        # Juga cek dari HTML langsung (badge text-bg-dark dengan text Critical)
        if not critical_reasons:
            pattern2 = r'text-bg-dark[^>]*>.*?Critical.*?</span>.*?<span[^>]*>(.*?)</span>'
            matches2 = re.findall(pattern2, html, re.DOTALL)
            for desc in matches2:
                clean = re.sub(r'<[^>]+>', '', desc).strip()
                if clean and not clean.startswith("*"):
                    critical_reasons.append(clean)

        has_critical = len(critical_reasons) > 0
        return has_critical, critical_reasons

    except Exception as e:
        return None, [f"Error: {e}"]


def run_crawler(output_base_dir):
    """Menjalankan seluruh proses crawling."""
    os.makedirs(output_base_dir, exist_ok=True)

    seen_ids = set()
    all_extensions = []
    permission_map = {}
    critical_extensions = []

    print(f"\n{'#'*70}")
    print(f"  SEE EXTENSION CRAWLER v2")
    print(f"  Permissions: {len(PERMISSIONS)}")
    print(f"  Output: {output_base_dir}")
    print(f"{'#'*70}\n")

    # == FASE 1: PENCARIAN ==============================================
    print("=" * 60)
    print("  FASE 1: PENCARIAN EKSTENSI PER PERMISSION")
    print("=" * 60)

    for i, perm in enumerate(PERMISSIONS):
        print(f"\n  [{i+1}/{len(PERMISSIONS)}] Permission: {perm}")

        items, total = search_extensions_by_permission(perm)

        if total == 0:
            print(f"    Tidak ditemukan ekstensi. Lewatkan.")
            time.sleep(REQUEST_DELAY)
            continue

        new_count = 0
        for item in items:
            ext_id = item.get("id")
            if not ext_id:
                continue

            if ext_id not in permission_map:
                permission_map[ext_id] = []
            permission_map[ext_id].append(perm)

            if ext_id in seen_ids:
                continue
            seen_ids.add(ext_id)
            new_count += 1

            all_extensions.append({
                "id": ext_id,
                "name": item.get("name", "Unknown"),
                "version": item.get("version", "1.0.0"),
                "userCount": item.get("userCount", 0),
                "author": item.get("author", ""),
                "riskImpact": item.get("riskImpact", 0),
                "riskLikelihood": item.get("riskLikelihood", 0),
                "permissions": item.get("manifest.permissions", []),
                "first_found_by": perm,
            })

        print(f"    Total: {total}, Baru (unik): {new_count}, Duplikat: {len(items) - new_count}")
        time.sleep(REQUEST_DELAY)

    print(f"\n  >> Total ekstensi unik ditemukan: {len(all_extensions)}")

    if not all_extensions:
        print("  Tidak ada ekstensi ditemukan. Selesai.")
        return

    # Simpan daftar lengkap sebelum download (backup)
    manifest_path = os.path.join(output_base_dir, "all_extensions.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump({
            "total": len(all_extensions),
            "permission_map": permission_map,
            "extensions": all_extensions
        }, f, indent=2, ensure_ascii=False)
    print(f"  >> Daftar ekstensi disimpan: {manifest_path}")

    # == FASE 2: DOWNLOAD ===============================================
    print(f"\n{'='*60}")
    print(f"  FASE 2: DOWNLOAD CRX ({len(all_extensions)} ekstensi)")
    print(f"{'='*60}")

    download_results = []
    success_count = 0

    for i, ext in enumerate(all_extensions):
        ext_id = ext["id"]
        ext_name = ext["name"]
        version = ext["version"]
        first_perm = ext["first_found_by"]

        # Folder per-permission
        perm_dir = os.path.join(output_base_dir, first_perm)
        os.makedirs(perm_dir, exist_ok=True)

        # Nama file aman
        safe_name = "".join(
            c if c.isalnum() or c in (' ', '-', '_') else ''
            for c in ext_name
        ).strip()[:80]
        file_base = f"{safe_name}__{ext_id}_v{version}"
        output_path = os.path.join(perm_dir, file_base)

        print(f"\n  [{i+1}/{len(all_extensions)}] {ext_name}")
        print(f"    ID: {ext_id} | v{version} | Users: {ext['userCount']:,}")

        # Cek sudah ada
        existing = [f for f in [output_path + ".crx", output_path + ".zip"] if os.path.exists(f)]
        if existing:
            print(f"    [SKIP] Sudah ada.")
            download_results.append({"id": ext_id, "success": True, "type": "existing"})
            success_count += 1
            continue

        ok, fpath, fsize = download_crx(ext_id, version, output_path)

        if ok:
            print(f"    [OK] {fsize/1024:.1f} KB")
            download_results.append({"id": ext_id, "success": True, "type": "CRX"})
            success_count += 1
        else:
            print(f"    [GAGAL] {fpath}")
            download_results.append({"id": ext_id, "success": False, "type": None})

        time.sleep(0.5)

    print(f"\n  >> Download selesai: {success_count}/{len(all_extensions)} berhasil")

    # == FASE 3: CEK LABEL CRITICAL =====================================
    print(f"\n{'='*60}")
    print(f"  FASE 3: CEK LABEL CRITICAL ({len(all_extensions)} ekstensi)")
    print(f"{'='*60}")

    for i, ext in enumerate(all_extensions):
        ext_id = ext["id"]
        print(f"  [{i+1}/{len(all_extensions)}] {ext['name']}...", end=" ", flush=True)

        has_critical, reasons = check_critical_label(ext_id)

        if has_critical:
            print(f"CRITICAL! ({len(reasons)} alasan)")
            critical_extensions.append(ext)
            ext["has_critical_label"] = True
            ext["critical_reasons"] = reasons
        elif has_critical is False:
            print("tidak ada")
            ext["has_critical_label"] = False
            ext["critical_reasons"] = []
        else:
            print("gagal cek")
            ext["has_critical_label"] = None
            ext["critical_reasons"] = reasons

        time.sleep(0.5)

    print(f"\n  >> Label Critical: {len(critical_extensions)}/{len(all_extensions)}")

    # == FASE 4: GENERATE LAPORAN =======================================
    print(f"\n{'='*60}")
    print(f"  FASE 4: GENERATE LAPORAN")
    print(f"{'='*60}")

    # -- CSV --
    csv_path = os.path.join(output_base_dir, "crawler_results.csv")
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id", "name", "version", "userCount", "author",
            "riskImpact", "riskLikelihood", "first_found_by",
            "all_matching_permissions", "has_critical_label",
            "critical_reasons", "download_success"
        ])
        writer.writeheader()
        for ext in all_extensions:
            dl = next((d for d in download_results if d["id"] == ext["id"]), {})
            writer.writerow({
                "id": ext["id"],
                "name": ext["name"],
                "version": ext["version"],
                "userCount": ext["userCount"],
                "author": ext["author"],
                "riskImpact": ext["riskImpact"],
                "riskLikelihood": ext["riskLikelihood"],
                "first_found_by": ext["first_found_by"],
                "all_matching_permissions": "; ".join(permission_map.get(ext["id"], [])),
                "has_critical_label": ext.get("has_critical_label"),
                "critical_reasons": " | ".join(ext.get("critical_reasons", [])),
                "download_success": dl.get("success", False),
            })
    print(f"  CSV: {csv_path}")

    # -- Markdown Critical Report --
    md_path = os.path.join(output_base_dir, "critical_extensions_report.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(f"# Laporan Ekstensi dengan Label Critical\n\n")
        f.write(f"**Tanggal:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n\n")
        f.write(f"**Total ekstensi ditemukan:** {len(all_extensions)}\n\n")
        f.write(f"**Download berhasil:** {success_count}\n\n")
        f.write(f"**Ekstensi dengan label Critical:** {len(critical_extensions)}\n\n")

        if critical_extensions:
            f.write(f"## Daftar Ekstensi Critical\n\n")
            f.write(f"| No | Nama | ID | Users | Risk | Permissions | Alasan Critical |\n")
            f.write(f"|---|---|---|---|---|---|---|\n")
            for i, ext in enumerate(critical_extensions, 1):
                perms = "; ".join(permission_map.get(ext["id"], []))
                reasons = " / ".join(ext.get("critical_reasons", []))[:200]
                f.write(f"| {i} | {ext['name']} | `{ext['id']}` | {ext['userCount']:,} | {ext['riskImpact']} | {perms} | {reasons} |\n")
        else:
            f.write("Tidak ada ekstensi yang memiliki label Critical.\n")

        f.write(f"\n---\n\n## Statistik Per Permission\n\n")
        f.write(f"| Permission | Jumlah Ekstensi |\n")
        f.write(f"|---|---|\n")
        perm_counts = {}
        for ext_id, perms in permission_map.items():
            for p in perms:
                perm_counts[p] = perm_counts.get(p, 0) + 1
        for p, c in sorted(perm_counts.items(), key=lambda x: x[1], reverse=True):
            f.write(f"| {p} | {c} |\n")

    print(f"  Critical Report: {md_path}")

    # -- Ringkasan --
    print(f"\n{'#'*70}")
    print(f"  RINGKASAN CRAWLING SELESAI")
    print(f"  Total ekstensi unik     : {len(all_extensions)}")
    print(f"  Download berhasil       : {success_count}")
    print(f"  Label Critical          : {len(critical_extensions)}")
    print(f"  Output                  : {output_base_dir}")
    print(f"{'#'*70}\n")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    parser = argparse.ArgumentParser(description="SEE Extension Crawler & Downloader")
    parser.add_argument(
        "--outdir", type=str,
        default=os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data", "raw", "crawled_see"
        ),
        help="Direktori output (default: data/raw/crawled_see/)"
    )
    args = parser.parse_args()

    run_crawler(args.outdir)
