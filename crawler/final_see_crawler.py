"""
Final SEE Crawler (All-in-One + Multi-Worker)
=============================================
1. Membaca semua file JSON dari direktori input.
2. Mendownload CRX & mengecek `content_scripts` & `host_permissions` secara lokal.
3. Mengecek label "Critical" di Chrome Stats via Selenium (Bypass Cloudflare).
4. Mendukung MULTI-WORKER (paralel) agar proses jauh lebih cepat!
5. Menghasilkan Laporan (CSV & Markdown).
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
import queue
import threading
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

import undetected_chromedriver as uc

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

GOOGLE_CRX_URL = (
    "https://clients2.google.com/service/update2/crx"
    "?response=redirect&os=win&arch=x64&os_arch=x86_64"
    "&nacl_arch=x86-64&prod=chromecrx&prodchannel="
    "&prodversion=125.0.6422.112&lang=en&acceptformat=crx3"
    "&x=id%3D{ext_id}%26installsource%3Dondemand%26uc"
)

# Kunci agar penulisan log print() antar thread tidak saling tumpang tindih
print_lock = threading.Lock()

def safe_print(*args, **kwargs):
    with print_lock:
        print(*args, **kwargs)

def extract_ids_from_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    urls = re.findall(r'chromewebstore\.google\.com/detail/[^/]+/([a-p]{32})', content)
    urls2 = re.findall(r'chromewebstore\.google\.com/detail/([a-p]{32})', content)
    return set(urls + urls2)

def download_and_check_manifest(ext_id, output_path):
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
                return False, None, "File terlalu kecil"
            
            with open(crx_path, 'rb') as f:
                data = f.read()
                
            zip_start = data.find(b'PK\x03\x04')
            if zip_start == -1:
                os.remove(crx_path)
                return False, None, "Bukan ZIP valid"
                
            zip_data = io.BytesIO(data[zip_start:])
            try:
                with zipfile.ZipFile(zip_data) as z:
                    if 'manifest.json' not in z.namelist():
                        os.remove(crx_path)
                        return False, None, "Tanpa manifest.json"
                        
                    manifest_content = z.read('manifest.json').decode('utf-8')
                    manifest_content = re.sub(r'//.*', '', manifest_content)
                    manifest_content = re.sub(r'/\*.*?\*/', '', manifest_content, flags=re.DOTALL)
                    
                    try:
                        manifest = json.loads(manifest_content, strict=False)
                        has_cs = 'content_scripts' in manifest and len(manifest['content_scripts']) > 0
                        has_hp = 'host_permissions' in manifest and len(manifest['host_permissions']) > 0
                    except Exception:
                        has_cs = bool(re.search(r'"content_scripts"\s*:\s*\[', manifest_content))
                        has_hp = bool(re.search(r'"host_permissions"\s*:\s*\[', manifest_content))
                    
                    if not has_cs:
                        os.remove(crx_path)
                        return False, None, "Tanpa content_scripts"
                    
                    if has_hp:
                        os.remove(crx_path)
                        return False, None, "Memiliki host_permissions"
                    
                    return True, crx_path, "Lolos"
            except Exception as e:
                os.remove(crx_path)
                return False, None, "Gagal parse ZIP"
        else:
            return False, None, f"HTTP {r.status_code}"
    except Exception as e:
        return False, None, "Error download"

def extract_critical_reasons(html):
    critical_reasons = []
    pattern = r'severity:"Critical",description:"([^"]+)"'
    matches = re.findall(pattern, html)
    for desc in matches:
        if not desc.startswith("*"):
            critical_reasons.append(desc)

    if not critical_reasons:
        pattern2 = r'text-bg-dark[^>]*>.*?Critical.*?</span>.*?<span[^>]*>(.*?)</span>'
        matches2 = re.findall(pattern2, html, re.DOTALL)
        for desc in matches2:
            clean = re.sub(r'<[^>]+>', '', desc).strip()
            if clean and not clean.startswith("*"):
                critical_reasons.append(clean)
                
    return len(critical_reasons) > 0, critical_reasons

def process_single_extension(ext_id, perm_map, output_dir, driver_queue):
    """Memproses satu ekstensi. Digunakan oleh ThreadPoolExecutor."""
    first_perm = perm_map[ext_id][0]
    all_perms_str = "; ".join(perm_map[ext_id])
    perm_out_dir = os.path.join(output_dir, first_perm)
    os.makedirs(perm_out_dir, exist_ok=True)
    crx_output_path = os.path.join(perm_out_dir, f"{ext_id}")
    
    # 1. Download & Cek Manifest
    success, fpath, reason = download_and_check_manifest(ext_id, crx_output_path)
    
    if not success:
        safe_print(f"[-] {ext_id} Ditolak: {reason}")
        return None
        
    # 2. Cek Critical pakai Selenium
    driver = driver_queue.get() # Ambil browser dari pool
    try:
        url = f"https://chrome-stats.com/d/{ext_id}"
        driver.get(url)
        
        wait_time = 0
        while "Just a moment..." in driver.page_source and wait_time < 30:
            time.sleep(1)
            wait_time += 1
            
        html = driver.page_source
        if "Just a moment..." in html:
            has_critical = False
            critical_reasons = ["Timeout Cloudflare"]
            status_text = "GAGAL (Timeout Cloudflare)"
        else:
            has_critical, reasons = extract_critical_reasons(html)
            critical_reasons = reasons
            status_text = f"CRITICAL ({len(reasons)} alasan)" if has_critical else "AMAN"
            
        safe_print(f"[+] {ext_id} Lolos Filter | Status: {status_text}")
        time.sleep(1) # Jeda kecil sebelum browser dipakai thread lain
        
        return {
            "id": ext_id,
            "first_found_by_permission": first_perm,
            "all_permissions": all_perms_str,
            "crx_path": fpath,
            "has_critical": has_critical,
            "critical_reasons": " | ".join(critical_reasons)
        }
    finally:
        driver_queue.put(driver) # Kembalikan browser ke pool

def process_directory(input_path, output_dir, num_workers):
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"  FINAL SEE CRAWLER (MULTI-WORKER + REALTIME SAVE)")
    print(f"  Input Path : {input_path}")
    print(f"  Output Dir : {output_dir}")
    print(f"  Workers    : {num_workers}")
    print(f"{'='*60}\n")
    
    # 1. Kumpulkan JSON
    permission_map = {}
    all_unique_ids = set()
    
    if os.path.isfile(input_path) and input_path.endswith('.json'):
        perm_name = os.path.basename(os.path.dirname(input_path))
        for ext_id in extract_ids_from_json(input_path):
            all_unique_ids.add(ext_id)
            permission_map[ext_id] = [perm_name]
    else:
        for root, dirs, files in os.walk(input_path):
            for file in files:
                if file.endswith('.json'):
                    perm_name = os.path.basename(root)
                    for ext_id in extract_ids_from_json(os.path.join(root, file)):
                        all_unique_ids.add(ext_id)
                        if ext_id not in permission_map:
                            permission_map[ext_id] = []
                        if perm_name not in permission_map[ext_id]:
                            permission_map[ext_id].append(perm_name)
    
    print(f"[*] Ditemukan {len(all_unique_ids)} ID ekstensi unik.")
    
    # 2. Cek ekstensi yang sudah diproses (Resume Capability & Auto-Recovery)
    processed_ids_file = os.path.join(output_dir, "processed_ids.txt")
    csv_path = os.path.join(output_dir, "crawler_results.csv")
    md_path = os.path.join(output_dir, "critical_report.md")
    
    processed_ids = set()
    csv_ids = set()
    final_results = []
    
    if os.path.exists(csv_path):
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert string 'True'/'False' back to boolean for consistency
                row['has_critical'] = (row['has_critical'] == 'True')
                final_results.append(row)
                csv_ids.add(row['id'])
                
    if os.path.exists(processed_ids_file):
        with open(processed_ids_file, 'r', encoding='utf-8') as f:
            for line in f:
                processed_ids.add(line.strip())
                
    # AUTO-RECOVERY LOGIC
    # Jika internet putus, ada ekstensi yg CRX-nya terdownload dan tercatat di processed_ids, 
    # tapi gagal masuk ke CSV. Kita harus memaksa crawler memproses ulang ID tersebut.
    recovered_count = 0
    for ext_id in list(processed_ids):
        if ext_id not in csv_ids:
            # Cek apakah CRX-nya ada di folder
            if ext_id in permission_map:
                first_perm = permission_map[ext_id][0]
                crx_check_path = os.path.join(output_dir, first_perm, f"{ext_id}.crx")
                if os.path.exists(crx_check_path):
                    # Ekstensi ini terputus di tengah jalan! Hapus dari processed agar diulang
                    processed_ids.remove(ext_id)
                    recovered_count += 1
                    
    if recovered_count > 0:
        print(f"[*] AUTO-RECOVERY: Ditemukan {recovered_count} ekstensi terputus yang CRX-nya sudah ada tapi gagal di-crawl. Akan diproses ulang!")
                
    pending_ids = all_unique_ids - processed_ids
    skipped_count = len(all_unique_ids) - len(pending_ids)
    
    if skipped_count > 0:
        print(f"[*] Melewati {skipped_count} ekstensi yang sudah berstatus FINAL (ditolak atau sukses).")
        
    if not pending_ids:
        print("[*] Semua ekstensi sudah selesai diproses!")
        return

    print(f"[*] Sisa ekstensi yang akan diproses: {len(pending_ids)}")

    # Inisialisasi Pool Browser
    print(f"\n[*] Membuka {num_workers} Browser Chrome di latar belakang...")
    driver_queue = queue.Queue()
    all_drivers = []
    
    for i in range(num_workers):
        options = uc.ChromeOptions()
        options.add_argument(f'--window-position=-2000,{-2000 + (i*100)}')
        try:
            driver = uc.Chrome(options=options, version_main=148)
            driver.minimize_window()
            driver_queue.put(driver)
            all_drivers.append(driver)
        except Exception as e:
            print(f"Gagal membuka browser worker {i+1}: {e}")
            
    if driver_queue.empty():
        print("Gagal membuka semua browser. Berhenti.")
        return

    actual_workers = driver_queue.qsize()
    print(f"[*] Berhasil membuka {actual_workers} browser. Memulai eksekusi paralel...\n")
    
    total = len(pending_ids)
    completed = 0
    
    # Mutex & Realtime Save setup
    file_lock = threading.Lock()
    
    # Pastikan file CSV punya header jika baru dibuat
    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["id", "first_found_by_permission", "all_permissions", "has_critical", "critical_reasons", "crx_path"])
            writer.writeheader()

    def update_markdown_report():
        # Regen markdown berdasarkan final_results yg sudah terkumpul
        critical_count = sum(1 for r in final_results if r['has_critical'])
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write("# Laporan Ekstensi SEE (Realtime Update)\n\n")
            f.write(f"**Tanggal Update:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")
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

    def mark_as_processed_and_save(ext_id, result_dict):
        with file_lock:
            # 1. Catat ID sebagai diproses
            with open(processed_ids_file, 'a', encoding='utf-8') as f:
                f.write(f"{ext_id}\n")
            
            # 2. Jika lolos filter (ada result_dict), simpan realtime ke CSV dan MD
            if result_dict:
                final_results.append(result_dict)
                with open(csv_path, 'a', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=["id", "first_found_by_permission", "all_permissions", "has_critical", "critical_reasons", "crx_path"])
                    writer.writerow(result_dict)
                
                # Update Markdown secara langsung
                update_markdown_report()

    def print_progress(completed_count, total_count, latest_ext_id=""):
        bar_len = 40
        filled_len = int(round(bar_len * completed_count / float(total_count)))
        percents = round(100.0 * completed_count / float(total_count), 1)
        bar = '=' * filled_len + '-' * (bar_len - filled_len)
        
        sys.stdout.write("\033[K") 
        sys.stdout.write(f"\r[Progress] [{bar}] {percents}% ({completed_count}/{total_count}) | Last: {latest_ext_id[:10]}...")
        sys.stdout.flush()

    print_progress(0, total)
    
    try:
        with ThreadPoolExecutor(max_workers=actual_workers) as executor:
            futures = {
                executor.submit(process_single_extension, ext_id, permission_map, output_dir, driver_queue): ext_id 
                for ext_id in pending_ids
            }
            
            for future in as_completed(futures):
                ext_id = futures[future]
                result = future.result()
                
                # Simpan REALTIME: jika gagal/tolak, result=None. Jika sukses, result=dict.
                mark_as_processed_and_save(ext_id, result)
                
                completed += 1
                print_progress(completed, total, ext_id)
                
    finally:
        print("\n\n[*] Menutup semua browser...")
        for d in all_drivers:
            try:
                d.quit()
            except:
                pass
        
        print(f"[*] Selesai! Semua data sudah tersimpan secara realtime.")
        print(f"  CSV : {csv_path}")
        print(f"  MD  : {md_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path ke direktori JSON atau file JSON tunggal")
    parser.add_argument("--output", required=True, help="Direktori penyimpanan CRX dan laporan")
    parser.add_argument("--workers", type=int, default=1, help="Jumlah worker (browser) yang dijalankan paralel")
    args = parser.parse_args()
    
    process_directory(args.input, args.output, args.workers)
