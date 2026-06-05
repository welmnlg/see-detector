import os
import sys
import csv
import queue
import threading
import argparse
import time
import re
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

import undetected_chromedriver as uc

# Kata kunci yang mencurigakan
KEYWORDS = [
    "hijack", "redirect", "cookies", "exfiltration", "data", "access", 
    "download", "spam", "ads", "collects", "post", "server", "malware", "malicious"
]

def extract_cons_from_html(html):
    """Mengekstrak daftar Cons dari HTML menggunakan regex."""
    cons_list = []
    # Mencari blok "Cons </div> <ul> ... </ul>"
    match = re.search(r'Cons\s*</div>\s*<ul[^>]*>(.*?)</ul>', html, re.IGNORECASE | re.DOTALL)
    if match:
        ul_content = match.group(1)
        # Mencari semua <li> di dalam <ul>
        li_items = re.findall(r'<li[^>]*>(.*?)</li>', ul_content, re.IGNORECASE | re.DOTALL)
        for li in li_items:
            # Hapus tag HTML internal (seperti komentar <!--[-->)
            clean_text = re.sub(r'<[^>]+>', '', li).strip()
            if clean_text:
                cons_list.append(clean_text)
    return cons_list

def process_single_extension(ext_id, driver_queue):
    driver = driver_queue.get()
    try:
        url = f"https://chrome-stats.com/d/{ext_id}"
        try:
            driver.get(url)
        except Exception as e:
            # Jika timeout atau error koneksi saat load, coba hentikan pemuatan halaman dan lanjut
            driver.execute_script("window.stop();")
            time.sleep(2)
        
        wait_time = 0
        # Tunggu Cloudflare selesai loading
        while "Just a moment..." in driver.page_source and wait_time < 30:
            time.sleep(1)
            wait_time += 1
            
        html = driver.page_source
        if "Just a moment..." in html:
            return {"id": ext_id, "status": "Error: Timeout Cloudflare", "cons": []}
            
        cons = extract_cons_from_html(html)
        return {"id": ext_id, "status": "Success", "cons": cons}
        
    except Exception as e:
        return {"id": ext_id, "status": f"Error: {str(e)[:100]}", "cons": []}
    finally:
        driver_queue.put(driver)

def process_reviews(input_dir, output_dir, num_workers):
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"  REVIEW CRAWLER (MULTI-WORKER + REALTIME SAVE)")
    print(f"  Input Path : {input_path}")
    print(f"  Output Dir : {output_dir}")
    print(f"  Workers    : {num_workers}")
    print(f"{'='*60}\n")
    
    # 1. Kumpulkan semua ID Ekstensi (32 karakter) dari direktori input
    ext_ids = set()
    for root, dirs, files in os.walk(input_dir):
        for name in dirs + files:
            match = re.search(r'([a-p]{32})', name)
            if match:
                ext_ids.add(match.group(1))
                
    if not ext_ids:
        print("[-] Tidak ada file/folder dengan ID ekstensi (32 karakter a-p) yang ditemukan di input directory.")
        return
        
    print(f"[*] Ditemukan {len(ext_ids)} ID ekstensi unik untuk di-crawl review-nya.")
    
    # 2. Setup File Output & Cek Resume
    processed_ids_file = os.path.join(output_dir, "review_processed_ids.txt")
    csv_all = os.path.join(output_dir, "reviews_cons_all.csv")
    csv_suspicious = os.path.join(output_dir, "reviews_cons_suspicious.csv")
    
    processed_ids = set()
    if os.path.exists(processed_ids_file):
        with open(processed_ids_file, 'r', encoding='utf-8') as f:
            for line in f:
                processed_ids.add(line.strip())
                
    pending_ids = ext_ids - processed_ids
    skipped_count = len(ext_ids) - len(pending_ids)
    
    if skipped_count > 0:
        print(f"[*] Melewati {skipped_count} ekstensi yang sudah berstatus FINAL sebelumnya.")
        
    if not pending_ids:
        print("[*] Semua review ekstensi sudah selesai di-crawl!")
        return
        
    print(f"[*] Sisa ekstensi yang akan diproses: {len(pending_ids)}")
    
    # Inisialisasi Pool Browser
    print(f"\n[*] Membuka {num_workers} Browser Chrome di latar belakang...")
    driver_queue = queue.Queue()
    all_drivers = []
    
    for i in range(num_workers):
        options = uc.ChromeOptions()
        # Sebar posisi window agar tidak bertumpuk jika terjadi kebocoran
        options.add_argument(f'--window-position=-2000,{-2000 + (i*100)}')
        try:
            driver = uc.Chrome(options=options, version_main=148)
            driver.set_page_load_timeout(60) # Set timeout 60 detik agar tidak hang
            driver.minimize_window()
            driver_queue.put(driver)
            all_drivers.append(driver)
        except Exception as e:
            print(f"Gagal membuka browser worker {i+1}: {e}")
            
    if driver_queue.empty():
        print("[-] Gagal membuka semua browser. Berhenti.")
        return

    actual_workers = driver_queue.qsize()
    print(f"[*] Berhasil membuka {actual_workers} browser. Memulai pencarian review...\n")
    
    # Pastikan file CSV memiliki header jika baru dibuat
    if not os.path.exists(csv_all):
        with open(csv_all, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["ID", "Status", "Cons_Reviews"])
            
    if not os.path.exists(csv_suspicious):
        with open(csv_suspicious, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["ID", "Matched_Keywords", "Cons_Reviews"])
            
    file_lock = threading.Lock()
    
    def save_result(result):
        ext_id = result["id"]
        status = result["status"]
        cons = result["cons"]
        
        # Gabungkan list Cons menjadi satu string dipisahkan oleh " | "
        cons_str = " | ".join(cons) if cons else ""
        
        # Cek apakah ada kata kunci mencurigakan
        matched_keywords = set()
        if cons:
            cons_lower = cons_str.lower()
            for kw in KEYWORDS:
                if kw in cons_lower:
                    matched_keywords.add(kw)
                    
        with file_lock:
            # 1. Catat ID sebagai diproses (Resume Capability) HANYA JIKA TIDAK ERROR
            # Jika error (timeout browser), kita TIDAK masukkan ke processed_ids, 
            # agar ekstensi ini dicoba ulang saat script di-restart.
            if "Error" not in status:
                with open(processed_ids_file, 'a', encoding='utf-8') as f:
                    f.write(f"{ext_id}\n")
                
            # 2. Simpan ke CSV All Reviews
            with open(csv_all, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([ext_id, status, cons_str])
                
            # 3. Simpan ke CSV Suspicious (Hanya jika mengandung kata kunci)
            if matched_keywords:
                with open(csv_suspicious, 'a', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow([ext_id, ", ".join(matched_keywords), cons_str])
                    
    total = len(pending_ids)
    completed = 0
    
    def print_progress(completed_count, total_count, latest_id=""):
        bar_len = 40
        filled_len = int(round(bar_len * completed_count / float(total_count)))
        percents = round(100.0 * completed_count / float(total_count), 1)
        bar = '=' * filled_len + '-' * (bar_len - filled_len)
        sys.stdout.write("\033[K")
        sys.stdout.write(f"\r[Progress] [{bar}] {percents}% ({completed_count}/{total_count}) | Last: {latest_id[:10]}...")
        sys.stdout.flush()

    print_progress(0, total)
    
    try:
        with ThreadPoolExecutor(max_workers=actual_workers) as executor:
            futures = {executor.submit(process_single_extension, ext_id, driver_queue): ext_id for ext_id in pending_ids}
            for future in as_completed(futures):
                ext_id = futures[future]
                result = future.result()
                
                # Simpan REAL-TIME per ekstensi
                save_result(result)
                
                completed += 1
                print_progress(completed, total, ext_id)
    finally:
        print("\n\n[*] Menutup semua browser...")
        for d in all_drivers:
            try:
                d.quit()
            except:
                pass
                
    print(f"[*] Selesai! Semua data review sudah tersimpan secara realtime.")
    print(f"  CSV All        : {csv_all}")
    print(f"  CSV Suspicious : {csv_suspicious}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Direktori input yang berisi folder/file ekstensi (crawled_local)")
    parser.add_argument("--output", required=True, help="Direktori output penyimpanan CSV")
    parser.add_argument("--workers", type=int, default=1, help="Jumlah worker browser")
    args = parser.parse_args()
    
    input_path = os.path.abspath(args.input)
    output_path = os.path.abspath(args.output)
    
    process_reviews(input_path, output_path, args.workers)
