import os
import zipfile
import subprocess
import shutil

crx_dir = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\crx_downloads"
extract_dir = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\malware_chrome_stats"
python_exec = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\.venv\Scripts\python.exe"
batch_logger_script = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\batch_logger.py"

def setup_dirs():
    os.makedirs(extract_dir, exist_ok=True)

def extract_crx(crx_path, dest_dir):
    try:
        with zipfile.ZipFile(crx_path, 'r') as z:
            z.extractall(dest_dir)
        return True
    except zipfile.BadZipFile:
        # Chrome extensions sometimes have a magic header that confuses standard zip tools.
        # We can strip the header manually.
        try:
            with open(crx_path, 'rb') as f:
                data = f.read()
            
            # Find the start of the zip file (PK\x03\x04)
            zip_start = data.find(b'PK\x03\x04')
            if zip_start != -1:
                temp_zip = crx_path + ".temp.zip"
                with open(temp_zip, 'wb') as f:
                    f.write(data[zip_start:])
                
                with zipfile.ZipFile(temp_zip, 'r') as z:
                    z.extractall(dest_dir)
                os.remove(temp_zip)
                return True
        except Exception as e:
            print(f"Failed to strip header and extract {crx_path}: {e}")
    except Exception as e:
        print(f"Failed to extract {crx_path}: {e}")
    return False

def main():
    import time
    setup_dirs()
    
    failed_ids = set()  # Simpan ID yang gagal agar tidak dicoba berulang
    
    print("Mulai memantau folder CRX. Tekan Ctrl+C untuk berhenti.")
    
    while True:
        # 1. Get all CRX files
        crx_files = [f for f in os.listdir(crx_dir) if f.endswith('.crx')]
        
        extracted_count = 0
        # 2. Extract them to the destination directory
        for crx_file in crx_files:
            ext_id = crx_file.replace('.crx', '')
            ext_path = os.path.join(extract_dir, ext_id)
            
            # Skip jika sudah pernah gagal
            if ext_id in failed_ids:
                continue
            
            # Skip if already extracted
            if os.path.exists(ext_path) and len(os.listdir(ext_path)) > 0:
                continue
            
            crx_path = os.path.join(crx_dir, crx_file)
            
            # Skip file kosong atau terlalu kecil (download gagal/corrupt)
            file_size = os.path.getsize(crx_path)
            if file_size < 100:
                print(f"[SKIP] {ext_id} — file terlalu kecil ({file_size} bytes), kemungkinan download gagal.")
                failed_ids.add(ext_id)
                continue
                
            print(f"\n[NEW] Menemukan file baru, mengekstrak {ext_id} ({file_size:,} bytes)...")
            os.makedirs(ext_path, exist_ok=True)
            
            if extract_crx(crx_path, ext_path):
                extracted_count += 1
            else:
                print(f"Gagal ekstrak {ext_id}, membersihkan sisa file...")
                failed_ids.add(ext_id)
                shutil.rmtree(ext_path, ignore_errors=True)
                
        # 3. Jika ada yang baru diekstrak, jalankan Batch Logger
        if extracted_count > 0:
            print(f"\nMenjalankan Dynamic Analysis V2 untuk ekstensi baru...")
            output_csv = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\malware_stats_traffic_v2.csv"
            summary_csv = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\malware_stats_summary_v2.csv"
            
            # Kita gunakan --resume agar ekstensi yang SUDAH PERNAH diuji tidak diuji ulang.
            # Timeout dinaikkan menjadi 300s (5 menit) agar malware punya waktu untuk aktif.
            cmd = [
                python_exec, batch_logger_script,
                "--input", extract_dir,
                "--output", output_csv,
                "--summary", summary_csv,
                "--workers", "3",
                "--timeout", "300",
                "--resume"
            ]
            
            # Jika ada profile, tambahkan flag --profile
            profile_dir = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\test_browser_profile"
            if os.path.exists(profile_dir):
                cmd.extend(["--profile", profile_dir])
                print(f"  Menggunakan browser profile: {profile_dir}")
            else:
                print(f"  [WARN] Profile belum dibuat. Jalankan setup_test_profile.py dulu untuk hasil optimal.")
            
            subprocess.run(cmd)
            print("\nSelesai menguji batch ini. Menunggu file CRX baru dari downloader...\n")
            
        time.sleep(5) # Cek folder setiap 5 detik

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nDihentikan oleh pengguna.")
