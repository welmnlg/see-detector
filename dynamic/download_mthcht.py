#!/usr/bin/env python3
import os
import sys
import csv
import time
import requests

INPUT_CSV = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\mthcht_new_ids.csv"
OUT_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\crx_downloads_mthcht"

def download_crx(ext_id, output_dir):
    url = f"https://clients2.google.com/service/update2/crx?response=redirect&prodversion=114.0.5735.199&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    try:
        r = requests.get(url, headers=headers, stream=True, timeout=15)
        if r.status_code == 200:
            content = r.content
            if len(content) < 1000:
                print(f"    [X] Gagal download {ext_id} (file terlalu kecil, mungkin sudah dihapus CWS)")
                return False
            out_path = os.path.join(output_dir, f"{ext_id}.crx")
            with open(out_path, "wb") as f:
                f.write(content)
            print(f"    [OK] Downloaded {ext_id} ({len(content)//1024} KB)")
            return True
        else:
            print(f"    [X] HTTP {r.status_code} untuk {ext_id}")
            return False
    except Exception as e:
        print(f"    [X] Error download {ext_id}: {e}")
        return False

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    ids_to_download = []
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ids_to_download.append(row["extension_id"])
            
    print(f"Mulai download {len(ids_to_download)} ekstensi baru dari CWS...")
    
    success = 0
    failed = 0
    
    for i, ext_id in enumerate(ids_to_download):
        print(f"[{i+1}/{len(ids_to_download)}] {ext_id}")
        if os.path.exists(os.path.join(OUT_DIR, f"{ext_id}.crx")):
            print(f"    [-] Sudah ada, skip")
            success += 1
            continue
            
        if download_crx(ext_id, OUT_DIR):
            success += 1
        else:
            failed += 1
            
        time.sleep(1) # Jeda agar tidak diblokir CWS
        
    print(f"\nSelesai! Berhasil: {success}, Gagal: {failed}")

if __name__ == "__main__":
    main()
