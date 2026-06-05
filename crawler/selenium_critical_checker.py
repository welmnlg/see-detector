import os
import sys
import io
import time
import csv
import re
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_critical_reasons(html):
    critical_reasons = []

    # 1. Cari dari data JSON embedded
    pattern = r'severity:"Critical",description:"([^"]+)"'
    matches = re.findall(pattern, html)
    for desc in matches:
        if not desc.startswith("*"):
            critical_reasons.append(desc)

    # 2. Cari dari HTML langsung jika pola di atas tidak ketemu
    if not critical_reasons:
        pattern2 = r'text-bg-dark[^>]*>.*?Critical.*?</span>.*?<span[^>]*>(.*?)</span>'
        matches2 = re.findall(pattern2, html, re.DOTALL)
        for desc in matches2:
            clean = re.sub(r'<[^>]+>', '', desc).strip()
            if clean and not clean.startswith("*"):
                critical_reasons.append(clean)
                
    return len(critical_reasons) > 0, critical_reasons

def process_results(csv_path):
    print(f"\n{'='*60}")
    print(f"  SELENIUM CRITICAL CHECKER (Cloudflare Bypass)")
    print(f"  CSV Path : {csv_path}")
    print(f"{'='*60}\n")
    
    # 1. Baca data dari CSV
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)
            
    # Cari yang butuh dicek ulang (status 403 atau kosong)
    to_check = [r for r in rows if r['critical_reasons'] == 'HTTP 403']
    
    if not to_check:
        print("Tidak ada ekstensi yang perlu dicek ulang (semua sudah valid).")
        return
        
    print(f"[*] Ditemukan {len(to_check)} ekstensi yang diblokir Cloudflare sebelumnya. Memulai pengecekan...")
    
    # 2. Setup Undetected ChromeDriver
    print("\n[*] Membuka Browser Chrome (Window disembunyikan di luar layar)...")
    options = uc.ChromeOptions()
    # Pindahkan posisi window jauh ke luar monitor agar tidak mengganggu
    options.add_argument('--window-position=-2000,0')
    
    try:
        driver = uc.Chrome(options=options, version_main=148)
    except Exception as e:
        print(f"Gagal membuka browser: {e}")
        return
        
    # Minimalkan browser
    driver.minimize_window()
    
    # 3. Looping pengecekan
    try:
        for i, row in enumerate(to_check):
            ext_id = row['id']
            url = f"https://chrome-stats.com/d/{ext_id}"
            
            print(f"[{i+1}/{len(to_check)}] Mengecek ID: {ext_id}...", end=" ", flush=True)
            
            driver.get(url)
            
            # Tunggu Cloudflare Bypass
            wait_time = 0
            while "Just a moment..." in driver.page_source and wait_time < 30:
                time.sleep(1)
                wait_time += 1
                
            html = driver.page_source
            if "Just a moment..." in html:
                print("GAGAL (Timeout Cloudflare)")
                continue
                
            has_critical, reasons = extract_critical_reasons(html)
            
            if has_critical:
                print(f"CRITICAL! ({len(reasons)} alasan)")
                row['has_critical'] = 'True'
                row['critical_reasons'] = " | ".join(reasons)
            else:
                print("AMAN")
                row['has_critical'] = 'False'
                row['critical_reasons'] = ""
                
            # Random delay biar aman
            time.sleep(2)
            
    finally:
        print("\n[*] Menutup browser...")
        driver.quit()
        
    # 4. Simpan kembali ke CSV
    print("\n[*] Menyimpan hasil update ke CSV...")
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print("[+] Selesai!")

if __name__ == "__main__":
    target_csv = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\crawled_local\local_crawler_results.csv"
    process_results(target_csv)
