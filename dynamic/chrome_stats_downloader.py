import os
import time
import pandas as pd
from playwright.sync_api import sync_playwright

CSV_PATH = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\filtered_malicious.csv"
OUTPUT_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\crx_downloads"
PROFILE_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\chrome_stats_profile"

def run_downloader():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Load IDs
    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        return
        
    df = pd.read_csv(CSV_PATH)
    ext_ids = df['extension_id'].tolist()
    print(f"Membaca {len(ext_ids)} ekstensi dari CSV.")
    
    with sync_playwright() as pw:
        print("\n" + "="*60)
        print("MEMBUKA BROWSER (SEMI-AUTOMATED MODE)")
        print("="*60)
        
        # Gunakan launch_persistent_context agar cookies/login tersimpan antar sesi!
        # Headless=False agar kamu bisa melihat dan login secara manual.
        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False,
            channel="chrome", # Menggunakan engine Google Chrome asli di komputermu
            args=["--disable-blink-features=AutomationControlled"] # Trik menghindari deteksi bot
        )
        
        page = context.pages[0] if context.pages else context.new_page()
        
        print("\n[AKSI DIBUTUHKAN]")
        print("1. Browser Chrome telah dibuka.")
        print("2. Halaman akan diarahkan ke https://chrome-stats.com/login")
        print("3. Silakan LOGIN ke akun kamu secara manual.")
        print("4. Jika ada tantangan Cloudflare (Just a moment...), selesaikan secara manual.")
        print("5. Setelah kamu berhasil login dan halaman terlihat normal, KEMBALI KE TERMINAL INI.")
        
        try:
            page.goto("https://chrome-stats.com/login", timeout=60000)
        except Exception:
            pass # Abaikan timeout, yang penting user bisa lihat browsernya
            
        input("\n[TEKAN ENTER DI SINI JIKA KAMU SUDAH SELESAI LOGIN & SIAP DOWNLOAD MASAL]...")
        print("\nBaik, memulai proses download massal...")
        
        sukses = 0
        gagal = 0
        
        for i, ext_id in enumerate(ext_ids):
            crx_path = os.path.join(OUTPUT_DIR, f"{ext_id}.crx")
            
            # Skip if already downloaded
            if os.path.exists(crx_path) and os.path.getsize(crx_path) > 0:
                print(f"[{i+1}/{len(ext_ids)}] {ext_id} - SUDAH ADA, SKIP.")
                continue
                
            print(f"[{i+1}/{len(ext_ids)}] Mencoba {ext_id} ...", end=" ")
            
            try:
                # Alur Triage Otomatis & Download:
                
                # Langkah 1: Kunjungi halaman detail ekstensi (bukan langsung /download)
                page.goto(f"https://chrome-stats.com/d/{ext_id}", timeout=30000)
                time.sleep(2) # Beri waktu render JavaScript
                
                # --- TRIAGE MANIFEST DARI DOM ---
                # Cek Content Scripts Matches
                cs_matches = []
                cs_dt = page.locator("dt:has-text('Content scripts matches:')")
                if cs_dt.count() > 0:
                    cs_dd = cs_dt.locator("~ dd").first
                    cs_matches = [t.strip() for t in cs_dd.locator("li").all_inner_texts() if t.strip()]
                
                # Cek Host Permissions
                host_perms = []
                hp_dt = page.locator("dt:has-text('Host permissions:')")
                if hp_dt.count() > 0:
                    hp_dd = hp_dt.locator("~ dd").first
                    host_perms = [t.strip() for t in hp_dd.locator("li").all_inner_texts() if t.strip()]
                    
                # Cek Permissions biasa
                perms = []
                p_dt = page.locator("dt:has-text('Permissions:')").first
                if p_dt.count() > 0:
                    p_dd = p_dt.locator("~ dd").first
                    perms = [t.strip() for t in p_dd.locator("li").all_inner_texts() if t.strip()]
                
                # LOGIKA SEE (Stealth Extension Exfiltration):
                # 1. Ekstensi SEE WAJIB memiliki Content Script untuk bisa mencuri data dari halaman web.
                if not cs_matches:
                    print("SKIP (Tidak ada Content Script - Bukan target SEE)")
                    continue
                
                # 2. Ekstensi SEE HARUS Stealth. 
                # Jika ia terang-terangan meminta Host Permission untuk SEMUA URL (<all_urls>, *://*/*), 
                # maka browser akan memberi peringatan besar ke user, sehingga ini BUKAN stealth.
                is_overt = False
                for hp in host_perms:
                    hp_lower = hp.lower()
                    if "<all_urls>" in hp_lower or "*://*/*" in hp_lower or "http://*/*" in hp_lower or "https://*/*" in hp_lower:
                        is_overt = True
                        break
                        
                if is_overt:
                    print("SKIP (Bukan Stealth - Memiliki Host Permission luas)")
                    continue
                    
                print(f"-> Ditemukan {len(cs_matches)} CS dan 0 Broad Host Perms. Melanjutkan download...")
                
                # --- PROSES DOWNLOAD ---
                # Navigasi ke halaman download
                page.goto(f"https://chrome-stats.com/d/{ext_id}/download", timeout=30000)
                time.sleep(2)
                
                # Cari tombol 'Download CRX file'
                btn_crx = page.locator("a:has-text('Download CRX file')")
                if btn_crx.count() == 0:
                    print("GAGAL (Tombol CRX tidak ditemukan)")
                    gagal += 1
                    continue
                
                # Klik tombol yang memicu navigasi ke halaman download-thank
                btn_crx.first.click()
                
                # Tunggu halaman download-thank terbuka dan tombol 'Download now' muncul
                page.wait_for_selector("a:has-text('Download now')", timeout=15000)
                time.sleep(1) # Jeda natural
                
                # Klik 'Download now' dan tangkap proses unduhannya
                with page.expect_download(timeout=60000) as download_info:
                    page.locator("a:has-text('Download now')").first.click()
                
                # Simpan file yang terunduh
                download = download_info.value
                download.save_as(crx_path)
                
                print("SUKSES \u2713")
                sukses += 1
                    
            except Exception as e:
                print(f"ERROR: {str(e)[:50]}")
                gagal += 1
                
            # Jeda agar tidak terkena limit / diblokir lagi
            time.sleep(2)

        print("\n" + "="*60)
        print("PROSES SELESAI")
        print(f"Total Sukses: {sukses}")
        print(f"Total Gagal : {gagal}")
        print("="*60)
        
        context.close()

if __name__ == "__main__":
    run_downloader()
