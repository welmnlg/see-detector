import os
import re
import json
import zipfile
import io
import csv
import requests
from bs4 import BeautifulSoup
import pandas as pd

FILE_1 = r"data\chrome-mal-ids-extension.xlsx"
FILE_2 = r"data\awesomelist-toborrm9-mal-extension.xlsx"
OUT_CSV = r"data\see_filtered_candidates.csv"

# Ubah menjadi 0 atau hapus untuk menjalankan semua ekstensi
MAX_TEST = 4000 

def extract_id(row_dict):
    """Mencari ID 32-karakter dari seluruh nilai pada baris Excel."""
    for val in row_dict.values():
        if isinstance(val, str):
            match = re.search(r'\b([a-p]{32})\b', val)
            if match:
                return match.group(1)
    return None

def check_cws(ext_id):
    """Cek ketersediaan di Chrome Web Store dan ambil nama."""
    url = f"https://chromewebstore.google.com/detail/{ext_id}"
    resp = requests.get(url, allow_redirects=True)
    if resp.status_code == 200 and "404" not in resp.url:
        soup = BeautifulSoup(resp.text, 'html.parser')
        title_tag = soup.find('title')
        if title_tag:
            title_text = title_tag.text.strip()
            if title_text == "Chrome Web Store":
                return False, None
            name = title_text.replace(" - Chrome Web Store", "").strip()
            return True, name
    return False, None

def check_edge(ext_id):
    """Cek ketersediaan di Microsoft Edge Add-ons berdasarkan ID."""
    url = f"https://microsoftedge.microsoft.com/addons/detail/{ext_id}"
    resp = requests.get(url, allow_redirects=True)
    if resp.status_code == 200:
        soup = BeautifulSoup(resp.text, 'html.parser')
        title_tag = soup.find('title')
        if title_tag:
            title_text = title_tag.text.strip()
            if title_text == "Microsoft Edge Add-ons":
                return False
            return True
    return False

def check_edge_by_name(name):
    """Mencari di Edge Add-ons melalui mesin pencari (DuckDuckGo) jika ID berbeda."""
    if not name: return False
    import urllib.parse
    # Kutip nama ekstensi agar pencarian lebih presisi
    q = urllib.parse.quote(f'site:microsoftedge.microsoft.com/addons/detail "{name}"')
    url = f"https://html.duckduckgo.com/html/?q={q}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            if 'microsoftedge.microsoft.com/addons/detail' in resp.text:
                return True
    except:
        pass
    return False

def check_firefox(name):
    """Cari di Firefox Add-ons berdasarkan nama."""
    if not name: return False
    url = f"https://addons.mozilla.org/api/v5/addons/search/?q={name}"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            for res in data.get("results", []):
                # Pencocokan nama tidak sensitif kapital
                if res.get("name", {}).get("en-US", "").lower() == name.lower():
                    return True
    except:
        pass
    return False

def download_and_parse_manifest(ext_id, avail_cws=True, avail_edge=False):
    """Mendownload CRX langsung ke memori (RAM) dan membaca manifest.json"""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    # Kumpulkan kandidat URL untuk dicoba
    urls_to_try = []
    if avail_cws:
        urls_to_try.append(f"https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc")
    if avail_edge:
        urls_to_try.append(f"https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&prod=edgecrx&prodchannel=&x=id%3D{ext_id}%26installsource%3Dondemand%26uc")
    
    # Jika CWS dan Edge False (misal mati tapi kita tetap mau iseng coba download)
    if not urls_to_try:
        urls_to_try.append(f"https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc")
        
    content = None
    for url in urls_to_try:
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code == 200:
                content = resp.content
                break
        except:
            pass
            
    if not content:
        return None
        
    # Melewati header CRX (biasanya diawali Cr24) untuk mencari awal ZIP (PK\x03\x04)
    zip_start = content.find(b'PK\x03\x04')
    if zip_start != -1:
        try:
            with zipfile.ZipFile(io.BytesIO(content[zip_start:])) as z:
                if 'manifest.json' in z.namelist():
                    return json.loads(z.read('manifest.json').decode('utf-8', errors='ignore'))
        except Exception as e:
            print(f"    [!] Gagal ekstrak manifest: {e}")
    return None

def main():
    print("="*60)
    print(" SEE Candidate Filter & Validator ".center(60))
    print("="*60)
    
    print("[*] Membaca file Excel...")
    try:
        df1 = pd.read_excel(FILE_1)
        # Filter df1 (chrome-mal-ids-extension.xlsx) khusus STILL-ACTIVE = '1' dan DATE-ADD >= 2026
        df1_cols = [c.upper() for c in df1.columns]
        df1.columns = df1_cols
        
        if 'STILL-ACTIVE' in df1.columns and 'DATE-ADD' in df1.columns:
            df1['STILL-ACTIVE_STR'] = df1['STILL-ACTIVE'].astype(str).str.strip()
            df1['DATE-ADD_P'] = pd.to_datetime(df1['DATE-ADD'], errors='coerce')
            
            df1 = df1[(df1['STILL-ACTIVE_STR'] == '1') & (df1['DATE-ADD_P'].dt.year >= 2026)]
            
            # Hapus kolom temp
            df1 = df1.drop(columns=['STILL-ACTIVE_STR', 'DATE-ADD_P'])
            print(f"[*] Terfilter {len(df1)} ekstensi dari file pertama (STILL-ACTIVE=1, >=2026).")
            
        df2 = pd.read_excel(FILE_2)
    except Exception as e:
        print(f"[X] Gagal membaca Excel: {e}")
        print("    Pastikan library openpyxl sudah terinstall (pip install openpyxl)")
        return

    # MENGGABUNGKAN DAN MENGHILANGKAN DUPLIKAT (Deduplikasi)
    raw_master = {}
    for df in [df1, df2]:
        for _, row in df.iterrows():
            d = row.dropna().to_dict()
            ext_id = extract_id(d)
            if ext_id:
                if ext_id not in raw_master:
                    raw_master[ext_id] = d
                else:
                    raw_master[ext_id].update(d)
                    
    # MEMBERSihkan KOLOM DAN MENERAPKAN LOGIKA SOURCE/ARTICLE
    master = {}
    for ext_id, data in raw_master.items():
        source = str(data.get('SOURCE', ''))
        article = str(data.get('ARTICLE', ''))
        meta_link = str(data.get('metadata_link', ''))
        
        if source == 'nan': source = ''
        if article == 'nan': article = ''
        if meta_link == 'nan': meta_link = ''
        
        # Fallback ke metadata_link jika merujuk ke toborrm9/malicious_extension_sentry
        if 'toborrm9' in source.lower() or 'malicious_extension_sentry' in source.lower():
            if meta_link: source = meta_link
                
        if 'toborrm9' in article.lower() or 'malicious_extension_sentry' in article.lower():
            if meta_link: article = meta_link
            
        ext_name = str(data.get('EXTID-NAME', data.get('browser_extension', '')))
        if ext_name == 'nan': ext_name = ''
            
        master[ext_id] = {
            'Extension_Name': ext_name,
            'DATE-DIS': str(data.get('DATE-DIS', '')).replace(' 00:00:00', ''),
            'DATE-ADD': str(data.get('DATE-ADD', '')).replace(' 00:00:00', ''),
            'Source': source,
            'Article': article,
            'Metadata_Comment': str(data.get('metadata_comment', '')).replace('nan', ''),
            'Reported_Mal': str(data.get('REPORTED-MAL', '')).replace('nan', ''),
            'Notes': str(data.get('NOTES', '')).replace('nan', ''),
            'Threat-Type': str(data.get('THREAT-TYPE', '')).replace('nan', ''),
            'Browser': str(data.get('BROWSER', '')).replace('nan', ''),
            'Still-Active': str(data.get('STILL-ACTIVE', '')).replace('nan', '')
        }
                    
    print(f"[*] Total ekstensi unik (setelah digabung): {len(master)}")
    
    # CEK RESUMABILITY
    processed = set()
    if os.path.exists(OUT_CSV):
        with open(OUT_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if 'Ext_ID' in row:
                    processed.add(row['Ext_ID'])
    print(f"[*] Sudah diproses sebelumnya: {len(processed)}")
    
    # MENENTUKAN KOLOM OUTPUT
    fieldnames = ['Ext_ID', 'Extension_Name', 'DATE-DIS', 'DATE-ADD', 'Source', 'Article', 
                  'Metadata_Comment', 'Reported_Mal', 'Notes', 'Threat-Type', 'Browser', 'Still-Active'] + [
        'Available_Chrome', 'Available_Edge', 'Available_Firefox',
        'Manifest_Version', 'Has_Content_Scripts', 'Content_Script_Matches',
        'Has_Host_Permissions', 'Host_Permissions_List', 'Max_SEE_Vulnerable'
    ]
    
    mode = 'a' if processed else 'w'
    with open(OUT_CSV, mode, newline='', encoding='utf-8', errors='ignore') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not processed:
            writer.writeheader()
            
        count = 0
        for ext_id, data in master.items():
            if ext_id in processed:
                continue
                
            if count >= MAX_TEST:
                print(f"\n[*] Uji coba selesai untuk {MAX_TEST} ekstensi pertama.")
                print(f"[*] Hasil disimpan di: {OUT_CSV}")
                break
                
            print(f"\n[{count+1}/{MAX_TEST}] Mengecek ID: {ext_id}")
            
            avail_cws, name = check_cws(ext_id)
            avail_edge = check_edge(ext_id)
            
            # Jika berdasarkan ID tidak ketemu di Edge, kita coba cari berdasarkan nama
            if not avail_edge and name:
                avail_edge = check_edge_by_name(name)
                
            avail_ff = check_firefox(name) if name else False
            
            print(f"  - Live di Chrome: {avail_cws} | Edge: {avail_edge} | Firefox: {avail_ff}")
            
            row = {'Ext_ID': ext_id}
            row.update(data)
            
            # Jika ada nama dari CWS, timpa nama aslinya agar lebih akurat
            if avail_cws and name:
                row['Extension_Name'] = name
            
            row['Available_Chrome'] = avail_cws
            row['Available_Edge'] = avail_edge
            row['Available_Firefox'] = avail_ff
            row['Manifest_Version'] = ""
            row['Has_Content_Scripts'] = False
            row['Content_Script_Matches'] = ""
            row['Has_Host_Permissions'] = False
            row['Host_Permissions_List'] = ""
            row['Max_SEE_Vulnerable'] = False
            
            # Jika tersedia, coba download untuk cek manifest
            manifest = None
            if avail_cws or avail_edge or avail_ff:
                manifest = download_and_parse_manifest(ext_id, avail_cws, avail_edge)
                if manifest:
                    mv = manifest.get('manifest_version', 2)
                    row['Manifest_Version'] = mv
                    
                    content_scripts = manifest.get('content_scripts', [])
                    row['Has_Content_Scripts'] = len(content_scripts) > 0
                    
                    # Cek URL match dari content script
                    matches = []
                    for cs in content_scripts:
                        matches.extend(cs.get('matches', []))
                    row['Content_Script_Matches'] = ", ".join(matches)
                    
                    # Cek Host permissions
                    host_perms = manifest.get('host_permissions', [])
                    if not isinstance(host_perms, list):
                        host_perms = []
                    row['Host_Permissions_List'] = ", ".join(host_perms)
                    row['Has_Host_Permissions'] = len(host_perms) > 0
                    
                    # Syarat Maksimal SEE: MV3 + Punya Content Script + Host Permissions KOSONG
                    row['Max_SEE_Vulnerable'] = (mv == 3) and row['Has_Content_Scripts'] and (not row['Has_Host_Permissions'])
                    
                    print(f"  - MV{mv} | SEE Maksimal (Tanpa Host Perm): {row['Max_SEE_Vulnerable']}")
                else:
                    row['Manifest_Version'] = "Error_Download"
                    print("  - [!] Gagal mengunduh/ekstrak manifest")
            else:
                row['Manifest_Version'] = "Not_Live"
                
            writer.writerow(row)
            f.flush() # Pastikan langsung tertulis ke disk (resume safe)
            count += 1

if __name__ == "__main__":
    main()
