#!/usr/bin/env python3
import os
import zipfile
import shutil

IN_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\crx_downloads_mthcht"
OUT_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\malware_chrome_stats"

def extract_crx(crx_path, out_dir):
    try:
        with open(crx_path, "rb") as f:
            data = f.read()
        
        # Find ZIP signature PK\x03\x04
        zip_start = data.find(b"PK\x03\x04")
        if zip_start == -1:
            print(f"    [X] Bukan file ZIP/CRX valid: {os.path.basename(crx_path)}")
            return False
            
        zip_data = data[zip_start:]
        
        temp_zip = crx_path + ".temp.zip"
        with open(temp_zip, "wb") as f:
            f.write(zip_data)
            
        os.makedirs(out_dir, exist_ok=True)
        try:
            with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
                zip_ref.extractall(out_dir)
            os.remove(temp_zip)
            return True
        except Exception as e:
            print(f"    [X] Gagal unzip {os.path.basename(crx_path)}: {e}")
            if os.path.exists(temp_zip):
                os.remove(temp_zip)
            return False
            
    except Exception as e:
        print(f"    [X] Error baca {os.path.basename(crx_path)}: {e}")
        return False

def main():
    if not os.path.exists(IN_DIR):
        print("Folder download tidak ditemukan!")
        return
        
    crx_files = [f for f in os.listdir(IN_DIR) if f.endswith(".crx")]
    print(f"Ditemukan {len(crx_files)} file CRX untuk diekstrak.")
    
    success = 0
    for i, crx in enumerate(crx_files):
        ext_id = crx.replace(".crx", "")
        crx_path = os.path.join(IN_DIR, crx)
        out_ext_dir = os.path.join(OUT_DIR, ext_id)
        
        if os.path.exists(out_ext_dir):
            print(f"[{i+1}/{len(crx_files)}] {ext_id} - Sudah ada, skip")
            continue
            
        print(f"[{i+1}/{len(crx_files)}] Mengekstrak {ext_id}...")
        if extract_crx(crx_path, out_ext_dir):
            success += 1
        else:
            # Cleanup if failed
            if os.path.exists(out_ext_dir):
                shutil.rmtree(out_ext_dir)
                
    print(f"\nSelesai! Berhasil ekstrak: {success} ekstensi.")

if __name__ == "__main__":
    main()
