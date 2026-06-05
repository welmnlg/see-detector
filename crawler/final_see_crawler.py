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
    print(f"  Workers    : {num_workers} (Selenium)")
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
    
    # Setup File
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
                row['has_critical'] = (row['has_critical'] == 'True')
                final_results.append(row)
                csv_ids.add(row['id'])
                
    if os.path.exists(processed_ids_file):
        with open(processed_ids_file, 'r', encoding='utf-8') as f:
            for line in f:
                processed_ids.add(line.strip())
                
    # Auto-recovery: Jika CRX ada tapi tidak di CSV, berarti terputus sebelum Selenium selesai
    recovered_count = 0
    for ext_id in list(processed_ids):
        if ext_id not in csv_ids:
            if ext_id in permission_map:
                first_perm = permission_map[ext_id][0]
                crx_check_path = os.path.join(output_dir, first_perm, f"{ext_id}.crx")
                if os.path.exists(crx_check_path):
                    processed_ids.remove(ext_id)
                    recovered_count += 1
                    
    if recovered_count > 0:
        print(f"[*] AUTO-RECOVERY: Ditemukan {recovered_count} ekstensi terputus yang akan diproses ulang!")
                
    pending_ids = list(all_unique_ids - processed_ids)
    skipped_count = len(all_unique_ids) - len(pending_ids)
    
    if skipped_count > 0:
        print(f"[*] Melewati {skipped_count} ekstensi yang sudah diproses.")
        
    if not pending_ids:
        print("[*] Semua ekstensi sudah selesai diproses!")
        return

    file_lock = threading.Lock()

    def mark_rejected(ext_id):
        with file_lock:
            with open(processed_ids_file, 'a', encoding='utf-8') as f:
                f.write(f"{ext_id}\n")

    def save_result(result_dict):
        with file_lock:
            # Tulis ke processed_ids
            with open(processed_ids_file, 'a', encoding='utf-8') as f:
                f.write(f"{result_dict['id']}\n")
                
            final_results.append(result_dict)
            file_exists = os.path.isfile(csv_path)
            with open(csv_path, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=["id", "first_found_by_permission", "all_permissions", "has_critical", "critical_reasons", "crx_path"])
                if not file_exists:
                    writer.writeheader()
                writer.writerow(result_dict)
            
            # Update Markdown
            critical_count = sum(1 for r in final_results if r['has_critical'])
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write("# Laporan Ekstensi SEE (Realtime Update)\n\n")
                f.write(f"**Tanggal Update:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")
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

    def print_progress(stage, completed_count, total_count, latest_ext_id=""):
        bar_len = 30
        filled_len = int(round(bar_len * completed_count / float(total_count))) if total_count > 0 else 0
        percents = round(100.0 * completed_count / float(total_count), 1) if total_count > 0 else 100
        bar = '=' * filled_len + '-' * (bar_len - filled_len)
        sys.stdout.write("\033[K") 
        sys.stdout.write(f"\r[{stage}] [{bar}] {percents}% ({completed_count}/{total_count}) | Last: {latest_ext_id[:10]}...")
        sys.stdout.flush()

    # ════════════════════════════════════════════════════════════════════════
    # TAHAP 1: DOWNLOAD & FILTER MANIFEST (CEPAT)
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n[TAHAP 1] Mendownload dan memfilter manifest ekstensi...")
    passed_extensions = []
    
    def download_task(ext_id):
        first_perm = permission_map[ext_id][0]
        perm_out_dir = os.path.join(output_dir, first_perm)
        os.makedirs(perm_out_dir, exist_ok=True)
        crx_output_path = os.path.join(perm_out_dir, f"{ext_id}")
        crx_path = crx_output_path + ".crx"
        
        # Jika file CRX sudah ada, berarti ekstensi ini SEBELUMNYA sudah berhasil didownload
        # dan LOLOS filter (karena yang gagal filternya di-os.remove()). Jadi kita bisa langsung skip!
        if os.path.exists(crx_path):
            return ext_id, crx_path
            
        success, fpath, reason = download_and_check_manifest(ext_id, crx_output_path)
        if success:
            return ext_id, fpath
        else:
            return ext_id, None

    dl_total = len(pending_ids)
    dl_completed = 0
    print_progress("Download", dl_completed, dl_total)

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_task, ext_id): ext_id for ext_id in pending_ids}
        for future in as_completed(futures):
            ext_id = futures[future]
            _, fpath = future.result()
            
            if fpath: # Lolos filter
                passed_extensions.append((ext_id, fpath))
            else: # Gagal filter, langsung tandai sebagai processed agar tidak diulang
                mark_rejected(ext_id)
                
            dl_completed += 1
            print_progress("Download", dl_completed, dl_total, ext_id)
            
    print(f"\n[*] Tahap 1 Selesai. {len(passed_extensions)} ekstensi lolos filter dan masuk ke Tahap 2.")

    if not passed_extensions:
        print("[*] Tidak ada ekstensi yang perlu di-crawl di Tahap 2.")
        return

    # ════════════════════════════════════════════════════════════════════════
    # TAHAP 2: SELENIUM CHROME-STATS CRAWL
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n[TAHAP 2] Mengecek informasi Critical via Chrome-Stats...")
    print(f"[*] Membuka {num_workers} Browser Chrome di latar belakang...")
    driver_queue = queue.Queue()
    all_drivers = []
    
    for i in range(num_workers):
        options = uc.ChromeOptions()
        options.add_argument(f'--window-position=-2000,{-2000 + (i*100)}')
        try:
            driver = uc.Chrome(options=options, version_main=148)
            driver.set_page_load_timeout(60)
            driver.minimize_window()
            driver_queue.put(driver)
            all_drivers.append(driver)
        except Exception as e:
            print(f"Gagal membuka browser worker {i+1}: {e}")
            
    if driver_queue.empty():
        print("[-] Gagal membuka semua browser. Berhenti.")
        return

    print(f"[*] Berhasil membuka {driver_queue.qsize()} browser. Memulai eksekusi Selenium...")

    def selenium_task(ext_id, fpath):
        driver = driver_queue.get()
        try:
            url = f"https://chrome-stats.com/d/{ext_id}"
            try:
                driver.get(url)
            except Exception:
                driver.execute_script("window.stop();")
                time.sleep(2)
                
            wait_time = 0
            while "Just a moment..." in driver.page_source and wait_time < 30:
                time.sleep(1)
                wait_time += 1
                
            html = driver.page_source
            if "Just a moment..." in html:
                has_critical, critical_reasons = False, ["Timeout Cloudflare"]
            else:
                has_critical, critical_reasons = extract_critical_reasons(html)
                
            result_dict = {
                "id": ext_id,
                "first_found_by_permission": permission_map[ext_id][0],
                "all_permissions": "; ".join(permission_map[ext_id]),
                "crx_path": fpath,
                "has_critical": has_critical,
                "critical_reasons": " | ".join(critical_reasons)
            }
            return result_dict
        finally:
            driver_queue.put(driver)

    sel_total = len(passed_extensions)
    sel_completed = 0
    print_progress("Selenium", sel_completed, sel_total)

    try:
        with ThreadPoolExecutor(max_workers=driver_queue.qsize()) as executor:
            futures = {executor.submit(selenium_task, ext_id, fpath): ext_id for ext_id, fpath in passed_extensions}
            for future in as_completed(futures):
                ext_id = futures[future]
                result_dict = future.result()
                
                # Simpan REALTIME ke CSV per ekstensi
                save_result(result_dict)
                
                sel_completed += 1
                print_progress("Selenium", sel_completed, sel_total, ext_id)
                
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
    parser.add_argument("--input", required=True, help="Path ke direktori JSON")
    parser.add_argument("--output", required=True, help="Direktori penyimpanan")
    parser.add_argument("--workers", type=int, default=1, help="Jumlah worker Selenium")
    args = parser.parse_args()
    
    process_directory(args.input, args.output, args.workers)
