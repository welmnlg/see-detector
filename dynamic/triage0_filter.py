import pandas as pd
import os

input_csv = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\malicious_extensions_detailed.csv"
output_csv = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\filtered_malicious.csv"

def filter_csv():
    print(f"Membaca {input_csv} ...")
    df = pd.read_csv(input_csv)
    
    total_awal = len(df)
    print(f"Total data awal: {total_awal}")
    
    # Filter 1: Hanya Google Chrome (biasanya "Google Chrome" atau "Chrome")
    # Kita lowercase untuk amannya
    df_chrome = df[df['store'].str.lower().str.contains('chrome', na=False)]
    
    total_chrome = len(df_chrome)
    print(f"Total ekstensi Chrome: {total_chrome}")
    
    # Karena kamu meminta SEMUA reason, kita tidak memfilter berdasarkan kolom reason.
    # Namun kita hanya butuh ID-nya yang unik.
    
    df_final = df_chrome.drop_duplicates(subset=['extension_id'])
    print(f"Total ID unik (Chrome saja): {len(df_final)}")
    
    df_final.to_csv(output_csv, index=False)
    print(f"Tersimpan di: {output_csv}")

if __name__ == "__main__":
    filter_csv()
