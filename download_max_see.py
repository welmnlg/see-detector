import pandas as pd
import os
import zipfile
import io
import requests
import time

CSV_FILE = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\see_filtered_candidates.csv"
OUT_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\crx_downloads\max_see_candidates"
MAX_TEST = 100

def download_crx(ext_id, avail_cws, avail_edge, dest_file):
    if os.path.exists(dest_file):
        return True # Sudah ada

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    urls = []
    if avail_cws:
        urls.append(f"https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc")
    if avail_edge:
        urls.append(f"https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&prod=edgecrx&prodchannel=&x=id%3D{ext_id}%26installsource%3Dondemand%26uc")
    
    if not urls:
        urls.append(f"https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc")

    content = None
    for url in urls:
        try:
            r = requests.get(url, headers=headers, timeout=15)
            if r.status_code == 200:
                content = r.content
                break
        except:
            pass

    if not content:
        return False

    try:
        with open(dest_file, 'wb') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Write error: {e}")
        return False

def main():
    try:
        df = pd.read_csv(CSV_FILE)
    except FileNotFoundError:
        print(f"[X] File tidak ditemukan: {CSV_FILE}")
        return
        
    # Pastikan tipe datanya ditangani dengan benar baik boolean murni maupun string "True"
    max_see = df[df['Max_SEE_Vulnerable'].astype(str) == "True"]
    print(f"[*] Ditemukan {len(max_see)} ekstensi dengan Max_SEE_Vulnerable = True")
    
    if len(max_see) == 0:
        return
        
    os.makedirs(OUT_DIR, exist_ok=True)
    success = 0
    count = 1
    
    for _, row in max_see.iterrows():
        if MAX_TEST > 0 and count > MAX_TEST:
            break
            
        ext_id = row['Ext_ID']
        avail_cws = str(row['Available_Chrome']).strip().lower() == "true"
        avail_edge = str(row['Available_Edge']).strip().lower() == "true"
        
        print(f"[{count}/{min(MAX_TEST, len(max_see)) if MAX_TEST > 0 else len(max_see)}] Mendownload {ext_id}.crx...", end=" ")
        dest = os.path.join(OUT_DIR, f"{ext_id}.crx")
        if download_crx(ext_id, avail_cws, avail_edge, dest):
            print("SUKSES")
            success += 1
        else:
            print("GAGAL")
            
        count += 1
        time.sleep(0.5)
        
    print(f"\n[*] Selesai! Berhasil mengunduh {success} file .crx.")
    print(f"[*] Folder output: {OUT_DIR}")
    
if __name__ == '__main__':
    main()
