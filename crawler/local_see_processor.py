"""
Local SEE Processor
====================
Memproses file JSON hasil pencarian manual pengguna.
1. Mengekstrak ID ekstensi dari URL chrome web store di file JSON.
2. Mendownload CRX langsung dari Google (tanpa API).
3. Mengecek manifest.json di dalam CRX secara lokal untuk memastikan
   memiliki `content_scripts` dan TIDAK memiliki `host_permissions`.
4. Mengecek label Critical melalui Chrome Stats overview (dengan cookies).
5. Membuat laporan akhir.
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
import zipfile
from datetime import datetime, timezone

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Konfigurasi
COOKIES = {
    "auth": "s%3Av2%3Af15ac02b-a39d-4144-a37e-624bae7df902.teKDJl4lIHtrt%2FOC5Z1p%2BgYBqgOv1BFRh%2Fj42N09f1k",
    "cf_clearance": "4_vjhthNw5LozN0kB6zKxHW6__3OCKyiYK0PTcj4.HM-1780464699-1.2.1.1-dPr4CqlwHAnSmNywn4FxtAoFCDyWnpryr7UVDEsS7R4.m4V7axkxOkH8MRyIWv_PZ8h.uZbsCBNiM.MucKW8H6w5m1n4o0vgUA85UXR1IzHWexUUBD4CIgn2dDDdTYxpunUYXrfA27V4Y1uPxdqG5C_tFn.pO53pq0lrZ6DdTnUxPKDvmXMEnT3fDR.lh7qQSpIIc6B6SQrybu8iwH55odz5yuHJ9pEIqkPlTmeBqBSXKq3u30RAa7F6308ISwhJnMCUG5EP2A.Q7MLGg75usip3IAYb4HiTzXVr_2wXhjedbsLr05ntHgCPyq4vHSxffegBK.ctj1LBa1c9YIJ_XaeJfXDOpEVd3KX1YqsyrojPwLjUs6b3nAQDUQ8u3opXcPMPCzaN3mplTd_byr8j31b2c1BpyhCMKEcm_dthYUI",
    "_ga": "GA1.1.1645539605.1766504830",
}

GOOGLE_CRX_URL = (
    "https://clients2.google.com/service/update2/crx"
    "?response=redirect&os=win&arch=x64&os_arch=x86_64"
    "&nacl_arch=x86-64&prod=chromecrx&prodchannel="
    "&prodversion=125.0.6422.112&lang=en&acceptformat=crx3"
    "&x=id%3D{ext_id}%26installsource%3Dondemand%26uc"
)

def extract_ids_from_json(filepath):
    """Mengekstrak ID ekstensi (32 huruf) dari URL Chrome Web Store di JSON."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    urls = re.findall(r'chromewebstore\.google\.com/detail/[^/]+/([a-p]{32})', content)
    urls2 = re.findall(r'chromewebstore\.google\.com/detail/([a-p]{32})', content)
    return set(urls + urls2)

def download_and_check_manifest(ext_id, output_path):
    """
    Download CRX dari Google. 
    Buka file CRX (sebagai ZIP) di memori/disk dan baca manifest.json.
    Return (success, file_path, reason)
    """
    url = GOOGLE_CRX_URL.format(ext_id=ext_id)
    crx_path = output_path + ".crx"
    
    try:
        r = requests.get(url, timeout=30, allow_redirects=True, stream=True)
        if r.status_code == 200:
            with open(crx_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            fsize = os.path.getsize(crx_path)
            if fsize < 100:
                os.remove(crx_path)
                return False, None, "File terlalu kecil/gagal download"
            
            # Ekstrak manifest.json untuk mengecek host_permissions dan content_scripts
            with open(crx_path, 'rb') as f:
                data = f.read()
                
            # CRX v3 magic bytes 'Cr24'
            zip_start = data.find(b'PK\x03\x04')
            if zip_start == -1:
                os.remove(crx_path)
                return False, None, "Bukan file ZIP/CRX valid"
                
            zip_data = io.BytesIO(data[zip_start:])
            try:
                with zipfile.ZipFile(zip_data) as z:
                    if 'manifest.json' not in z.namelist():
                        os.remove(crx_path)
                        return False, None, "Tidak ada manifest.json"
                        
                    manifest_content = z.read('manifest.json').decode('utf-8')
                    # Hapus komentar // jika ada
                    manifest_content = re.sub(r'//.*', '', manifest_content)
                    manifest_content = re.sub(r'/\*.*?\*/', '', manifest_content, flags=re.DOTALL)
                    
                    try:
                        manifest = json.loads(manifest_content, strict=False)
                        has_content_scripts = 'content_scripts' in manifest and len(manifest['content_scripts']) > 0
                        has_host_permissions = 'host_permissions' in manifest and len(manifest['host_permissions']) > 0
                    except Exception as parse_e:
                        # Fallback kasar jika masih gagal parse (misal trailing comma)
                        has_content_scripts = bool(re.search(r'"content_scripts"\s*:\s*\[', manifest_content))
                        has_host_permissions = bool(re.search(r'"host_permissions"\s*:\s*\[', manifest_content))
                    
                    if not has_content_scripts:
                        os.remove(crx_path)
                        return False, None, "Tidak ada content_scripts"
                    
                    if has_host_permissions:
                        os.remove(crx_path)
                        return False, None, "Memiliki host_permissions"
                    
                    # Lolos semua filter
                    return True, crx_path, "Lolos Filter"
            except Exception as e:
                os.remove(crx_path)
                return False, None, f"Gagal parse manifest: {e}"
        else:
            return False, None, f"HTTP {r.status_code}"
    except Exception as e:
        return False, None, f"Error download: {e}"

def check_critical_label(ext_id):
    """Cek halaman overview ekstensi di Chrome Stats dengan Cookies."""
    try:
        overview_url = f"https://chrome-stats.com/d/{ext_id}"
        r = requests.get(overview_url, cookies=COOKIES, timeout=30)
        
        if r.status_code != 200:
            return False, [f"HTTP {r.status_code}"]

        html = r.text
        critical_reasons = []

        # Cari dari data JSON embedded di halaman
        pattern = r'severity:"Critical",description:"([^"]+)"'
        matches = re.findall(pattern, html)
        for desc in matches:
            if not desc.startswith("*"):  # Abaikan teks yang di-mask (****)
                critical_reasons.append(desc)

        # Cek dari elemen HTML langsung
        if not critical_reasons:
            pattern2 = r'text-bg-dark[^>]*>.*?Critical.*?</span>.*?<span[^>]*>(.*?)</span>'
            matches2 = re.findall(pattern2, html, re.DOTALL)
            for desc in matches2:
                clean = re.sub(r'<[^>]+>', '', desc).strip()
                if clean and not clean.startswith("*"):
                    critical_reasons.append(clean)

        return len(critical_reasons) > 0, critical_reasons

    except Exception as e:
        return False, [f"Error: {e}"]

def process_directory(input_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"  LOCAL SEE PROCESSOR")
    print(f"  Input JSON Path: {input_path}")
    print(f"  Output CRX Dir : {output_dir}")
    print(f"{'='*60}\n")
    
    # 1. Kumpulkan semua JSON dan Ekstrak ID
    permission_map = {}
    all_unique_ids = set()
    
    if os.path.isfile(input_path) and input_path.endswith('.json'):
        perm_name = os.path.basename(os.path.dirname(input_path))
        ids = extract_ids_from_json(input_path)
        for ext_id in ids:
            all_unique_ids.add(ext_id)
            permission_map[ext_id] = [perm_name]
    else:
        for root, dirs, files in os.walk(input_path):
            for file in files:
                if file.endswith('.json'):
                    perm_name = os.path.basename(root)
                    filepath = os.path.join(root, file)
                    
                    ids = extract_ids_from_json(filepath)
                    for ext_id in ids:
                        all_unique_ids.add(ext_id)
                        if ext_id not in permission_map:
                            permission_map[ext_id] = []
                        if perm_name not in permission_map[ext_id]:
                            permission_map[ext_id].append(perm_name)
    
    print(f"[*] Ditemukan {len(all_unique_ids)} ID ekstensi unik dari file JSON.")
    
    # 2. Proses setiap Ekstensi (Download + Cek Manifest + Cek Critical)
    final_results = []
    
    print("\n[*] Memulai Download dan Verifikasi...\n")
    
    for i, ext_id in enumerate(list(all_unique_ids)):
        first_perm = permission_map[ext_id][0]
        perm_out_dir = os.path.join(output_dir, first_perm)
        os.makedirs(perm_out_dir, exist_ok=True)
        
        crx_output_path = os.path.join(perm_out_dir, f"{ext_id}")
        
        print(f"[{i+1}/{len(all_unique_ids)}] ID: {ext_id}")
        
        # Download & Verifikasi
        success, fpath, reason = download_and_check_manifest(ext_id, crx_output_path)
        
        if not success:
            print(f"   [-] Ditolak: {reason}")
            continue
            
        print(f"   [+] Diterima (Manifest V3 SEE valid). CRX: {fpath}")
        
        # Cek Critical
        print(f"   [*] Cek label Critical...", end=" ", flush=True)
        has_critical, critical_reasons = check_critical_label(ext_id)
        if has_critical:
            print(f"YA ({len(critical_reasons)} alasan)")
        else:
            print("TIDAK")
            
        # Simpan hasil
        final_results.append({
            "id": ext_id,
            "first_found_by_permission": first_perm,
            "all_permissions": "; ".join(permission_map[ext_id]),
            "crx_path": fpath,
            "has_critical": has_critical,
            "critical_reasons": " | ".join(critical_reasons)
        })
        
        time.sleep(1.5)  # Delay agar tidak rate limit Chrome Stats
        
    # 3. Laporan
    print(f"\n{'='*60}")
    print(f"  GENERATE LAPORAN")
    print(f"{'='*60}")
    
    csv_path = os.path.join(output_dir, "local_crawler_results.csv")
    md_path = os.path.join(output_dir, "critical_extensions_report.md")
    
    critical_count = 0
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id", "first_found_by_permission", "all_permissions",
            "has_critical", "critical_reasons", "crx_path"
        ])
        writer.writeheader()
        for res in final_results:
            writer.writerow(res)
            if res["has_critical"]:
                critical_count += 1
                
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write("# Laporan Ekstensi SEE (Dari JSON Lokal)\n\n")
        f.write(f"**Tanggal:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")
        f.write(f"**Total ID di JSON:** {len(all_unique_ids)}\n")
        f.write(f"**Lolos Filter (Di-download):** {len(final_results)}\n")
        f.write(f"**Berlabel Critical:** {critical_count}\n\n")
        
        if critical_count > 0:
            f.write("## Daftar Ekstensi Critical\n\n")
            f.write("| No | ID | Permissions | Alasan Critical |\n")
            f.write("|---|---|---|---|\n")
            idx = 1
            for res in final_results:
                if res["has_critical"]:
                    f.write(f"| {idx} | `{res['id']}` | {res['all_permissions']} | {res['critical_reasons']} |\n")
                    idx += 1
        else:
            f.write("Tidak ada ekstensi berlabel Critical.\n")
            
    print(f"  CSV : {csv_path}")
    print(f"  MD  : {md_path}")
    print(f"  Selesai! {len(final_results)} ekstensi berhasil diproses.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Direktori berisi file JSON")
    parser.add_argument("--output", required=True, help="Direktori penyimpanan CRX dan laporan")
    args = parser.parse_args()
    
    process_directory(args.input, args.output)
