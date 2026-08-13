import os
import sys
import time
import json
import tempfile
import argparse
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

def run_showcase(ext_path):
    print("="*60)
    print("🚨 SEE VULNERABILITY SHOWCASE (DYNAMIC FORENSIC) 🚨")
    print("="*60)
    print(f"[*] Target Extension : {os.path.basename(ext_path)}")
    print("[*] Skenario         : Local File Access (LF) & User Profiling (UProf)")
    
    # Buat file lokal rahasia palsu
    fd, temp_path = tempfile.mkstemp(suffix=".html")
    with os.fdopen(fd, 'w') as f:
        f.write(
            "<html><head><title>Dokumen Rahasia</title></head><body>"
            "<h1>Data Karyawan Internal</h1>"
            "<p>Nama: John Doe | Email: john@example.com</p>"
            "<p>SSN: 123-45-6789 | Password: SuperSecret123</p>"
            "</body></html>"
        )
    temp_fwd = temp_path.replace('\\', '/')
    local_url = f"file:///{temp_fwd}"
    print(f"[*] File Dummy Dibuat: {local_url}")

    with sync_playwright() as p:
        user_data_dir = tempfile.mkdtemp()
        try:
            print("[*] Meluncurkan Peramban Chromium dengan ekstensi terpasang...")
            context = p.chromium.launch_persistent_context(
                user_data_dir,
                headless=False, # Harus False agar ekstensi jalan
                args=[
                    f"--disable-extensions-except={ext_path}",
                    f"--load-extension={ext_path}",
                ],
                ignore_https_errors=True
            )
            
            page = context.new_page()
            
            # Setup network interception untuk mencetak request langsung ke terminal
            captured_requests = []
            
            def handle_request(route, request):
                # Kita hanya peduli pada request POST/GET ke luar (bukan request lokal/chrome-extension)
                if not request.url.startswith("chrome-extension://") and not request.url.startswith("file://"):
                    domain = urlparse(request.url).netloc
                    post_data = request.post_data
                    
                    if post_data and "john@example.com" in post_data:
                        print("\n" + "!"*60)
                        print("🔥 BUKTI EKSFILTRASI TERTANGKAP! 🔥")
                        print("!"*60)
                        print(f"Waktu   : {time.strftime('%H:%M:%S')}")
                        print(f"Domain  : {domain}")
                        print(f"URL     : {request.url}")
                        print(f"Method  : {request.method}")
                        print(f"Payload :")
                        try:
                            # Coba format JSON agar cantik di screenshot
                            parsed_json = json.loads(post_data)
                            print(json.dumps(parsed_json, indent=4))
                        except:
                            print(post_data)
                        print("!"*60 + "\n")
                        
                route.continue_()

            page.route("**/*", handle_request)
            
            print(f"[*] Mengakses file lokal (Skenario LF)...")
            page.goto(local_url, wait_until="load")
            
            print("[*] Menunggu 15 detik untuk memantau aktivitas background ekstensi...")
            for i in range(15):
                time.sleep(1)
                sys.stdout.write(f"\r[*] Memantau... {15-i} detik tersisa")
                sys.stdout.flush()
                
            print("\n\n[*] Selesai.")
            
        except Exception as e:
            print(f"[!] Error: {e}")
        finally:
            context.close()
            try:
                os.unlink(temp_path)
            except:
                pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script untuk Showcase Eksfiltrasi SEE")
    parser.add_argument("--ext", required=True, help="Path ke folder ekstensi target")
    args = parser.parse_args()
    
    ext_path = os.path.abspath(args.ext)
    if not os.path.exists(ext_path):
        print("Folder ekstensi tidak ditemukan!")
        sys.exit(1)
        
    run_showcase(ext_path)
