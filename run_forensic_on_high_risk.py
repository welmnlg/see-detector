#!/usr/bin/env python3
import os
import csv
import subprocess
import concurrent.futures
import argparse

def get_latest_csv(static_dir):
    if not os.path.exists(static_dir):
        return None
    files = [f for f in os.listdir(static_dir) if f.endswith(".csv")]
    if not files:
        return None
    files.sort(key=lambda x: os.path.getmtime(os.path.join(static_dir, x)), reverse=True)
    return os.path.join(static_dir, files[0])

def run_forensic(ext_id, ext_path, out_dir):
    report_file = os.path.join(out_dir, f"{ext_id}_forensic.md")
    if os.path.exists(report_file):
        return f"Skip {ext_id} (Sudah diuji)"
        
    cmd = ["python", r"forensic\forensic_analyzer.py", ext_path, "--outdir", out_dir]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return f"Sukses menguji {ext_id}"
    except subprocess.CalledProcessError:
        return f"Gagal menguji {ext_id}"

def main():
    parser = argparse.ArgumentParser(description="Jalankan Forensik pada Ekstensi Berisiko")
    parser.add_argument("--static_dir", type=str, required=True, help="Folder hasil analisis statis (JSON & CSV)")
    parser.add_argument("--ext_dir", type=str, required=True, help="Folder berisi file ekstensi yang sudah diekstrak")
    parser.add_argument("--out_dir", type=str, required=True, help="Folder untuk menyimpan hasil forensik")
    parser.add_argument("--workers", type=int, default=6, help="Jumlah workers (default: 6)")
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)

    csv_path = get_latest_csv(args.static_dir)
    if not csv_path:
        print("[-] Belum ada file laporan statis CSV di folder tersebut.")
        return
        
    print(f"[*] Membaca laporan statis dari: {os.path.basename(csv_path)}")
    
    # Hanya fokus pada yang benar-benar HIGH / CRITICAL / MODERATE
    target_levels = ["MODERATE", "HIGH", "CRITICAL"]
    targets = []
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("risk_level") in target_levels:
                targets.append(row["extension_id"])
                
    print(f"[*] Ditemukan {len(targets)} ekstensi dengan risk level {', '.join(target_levels)}.")
    
    if not targets:
        print("[-] Tidak ada ekstensi yang perlu diuji.")
        return
        
    print(f"[*] Memulai pengujian forensik pada {len(targets)} ekstensi dengan {args.workers} workers...")
    
    success = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {}
        for ext_id in targets:
            ext_path = os.path.join(args.ext_dir, ext_id)
            if os.path.exists(ext_path):
                futures[executor.submit(run_forensic, ext_id, ext_path, args.out_dir)] = ext_id
            else:
                print(f"[-] Path ekstensi tidak ditemukan: {ext_path}")
                
        for i, future in enumerate(concurrent.futures.as_completed(futures)):
            ext_id = futures[future]
            result = future.result()
            print(f"  [{i+1}/{len(targets)}] {result}")
            if "Sukses" in result:
                success += 1
            
    print(f"\n[*] Selesai menguji ekstensi berisiko menengah-tinggi.")

if __name__ == "__main__":
    main()
