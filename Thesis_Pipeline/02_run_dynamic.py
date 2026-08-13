import os
import sys
import subprocess

def run_dynamic():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    aman_dir = os.path.join(base_dir, "data", "dataset", "aman_see")
    rentan_dir = os.path.join(base_dir, "data", "dataset", "rentan_see")
    output_dir = os.path.join(base_dir, "Thesis_Pipeline", "results")
    os.makedirs(output_dir, exist_ok=True)
    
    runner = os.path.join(base_dir, "dynamic", "see_traffic_capture", "see_traffic_batch.py")
    
    aman_out = os.path.join(output_dir, "aman_dynamic.csv")
    rentan_out = os.path.join(output_dir, "rentan_dynamic.csv")

    print("=== 2. EKSTRAKSI FITUR DINAMIS (TRAFFIC CAPTURE) ===")
    
    print(f"\nMemulai simulasi jaringan untuk ekstensi AMAN (Output: {aman_out})...")
    subprocess.run([
        sys.executable, runner,
        "--input", aman_dir,
        "--output", aman_out,
        "--workers", "2",
        "--resume"
    ], check=True)

    print(f"\nMemulai simulasi jaringan untuk ekstensi RENTAN (Output: {rentan_out})...")
    subprocess.run([
        sys.executable, runner,
        "--input", rentan_dir,
        "--output", rentan_out,
        "--workers", "2",
        "--resume"
    ], check=True)

    print("\nLangkah 2 selesai. Silakan lanjut ke skrip 03_merge_dataset.py")

if __name__ == "__main__":
    run_dynamic()
