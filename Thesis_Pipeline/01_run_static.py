import os
import sys
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dataset.dataset_builder import extract_features_from_dir

def run_static():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    aman_dir = os.path.join(base_dir, "data", "dataset", "aman_see")
    rentan_dir = os.path.join(base_dir, "data", "dataset", "rentan_see")
    output_dir = os.path.join(base_dir, "Thesis_Pipeline", "results")
    os.makedirs(output_dir, exist_ok=True)

    print("=== 1. EKSTRAKSI FITUR STATIS ===")
    print(f"Memindai direktori AMAN: {aman_dir}")
    aman_static = extract_features_from_dir(aman_dir, label=0, run_dynamic=False, workers=4)
    df_aman = pd.DataFrame(aman_static)
    aman_out = os.path.join(output_dir, "aman_static.csv")
    df_aman.to_csv(aman_out, index=False)
    print(f"Selesai! Tersimpan di {aman_out}")

    print(f"\nMemindai direktori RENTAN: {rentan_dir}")
    rentan_static = extract_features_from_dir(rentan_dir, label=1, run_dynamic=False, workers=4)
    df_rentan = pd.DataFrame(rentan_static)
    rentan_out = os.path.join(output_dir, "rentan_static.csv")
    df_rentan.to_csv(rentan_out, index=False)
    print(f"Selesai! Tersimpan di {rentan_out}")
    print("\nLangkah 1 selesai. Silakan lanjut ke skrip 02_run_dynamic.py")

if __name__ == "__main__":
    import multiprocessing as mp
    mp.freeze_support()
    run_static()
