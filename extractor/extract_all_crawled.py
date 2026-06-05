import os
import shutil
import zipfile
import io
import argparse
from pathlib import Path

import sys

def extract_crx_recursive(input_dir, output_dir):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    print(f"[*] Mencari file .crx di {input_path}...")
    crx_files = list(input_path.rglob('*.crx'))
    total_files = len(crx_files)
    
    if total_files == 0:
        print("[-] Tidak ada file .crx yang ditemukan.")
        return
        
    print(f"[*] Ditemukan {total_files} file .crx untuk diekstrak.\n")
    
    extracted_count = 0
    failed_count = 0
    skipped_count = 0
    
    def print_progress(completed_count, total_count, latest_id=""):
        bar_len = 40
        filled_len = int(round(bar_len * completed_count / float(total_count)))
        percents = round(100.0 * completed_count / float(total_count), 1)
        bar = '=' * filled_len + '-' * (bar_len - filled_len)
        sys.stdout.write("\033[K")
        sys.stdout.write(f"\r[Ekstrak] [{bar}] {percents}% ({completed_count}/{total_count}) | Last: {latest_id[:10]}...")
        sys.stdout.flush()
        
    print_progress(0, total_files)
    
    for idx, crx_file in enumerate(crx_files):
        ext_id = crx_file.stem
        ext_out_dir = output_path / ext_id
        
        # Cek apakah folder sudah ada dan ada isinya (manifest.json minimal)
        if ext_out_dir.exists() and (ext_out_dir / 'manifest.json').exists():
            skipped_count += 1
            print_progress(idx + 1, total_files, ext_id)
            continue
            
        # Jika ada tapi ga lengkap, hapus dulu
        if ext_out_dir.exists():
            shutil.rmtree(ext_out_dir)
            
        ext_out_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            with open(crx_file, 'rb') as f:
                data = f.read()
                
            zip_start = data.find(b'PK\x03\x04')
            if zip_start == -1:
                # Bukan ZIP
                failed_count += 1
                shutil.rmtree(ext_out_dir)
                print_progress(idx + 1, total_files, ext_id)
                continue
                
            temp_zip = ext_out_dir / 'temp.zip'
            with open(temp_zip, 'wb') as temp:
                temp.write(data[zip_start:])
                
            with zipfile.ZipFile(temp_zip, 'r') as z:
                z.extractall(ext_out_dir)
                
            os.remove(temp_zip)
            extracted_count += 1
            
        except Exception as e:
            failed_count += 1
            if ext_out_dir.exists():
                shutil.rmtree(ext_out_dir)
                
        print_progress(idx + 1, total_files, ext_id)
            
    print(f"\n\nSelesai! Berhasil: {extracted_count}, Dilewati: {skipped_count}, Gagal: {failed_count}")
    print(f"Folder hasil ekstrak: {output_path}")
    print(f"\nUntuk menjalankan forensic, jalankan perintah ini:")
    print(f".venv\\Scripts\\python.exe forensic\\forensic_analyzer.py \"{output_path}\"")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path ke direktori hasil crawler (.crx)")
    parser.add_argument("--output", required=True, help="Path output folder yang sudah diekstrak")
    args = parser.parse_args()
    
    extract_crx_recursive(args.input, args.output)
