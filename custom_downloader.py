import os
import re
import json
import struct
import zipfile
import io
import shutil
import requests
from tqdm import tqdm

# Cookies dari user
COOKIES = {
    "__cf_bm": "zdouNfvKBU0HZB_6LFnpTsEZhJXRBVowWB4Ux0WXZMk-1781026098.3760626-1.0.1.1-edKqbmrIy9M_XhbFAZ4yriNvP7lOUK5YHH.vevnk3VvUE7HD0utqWTA6wcB4mmY4wiMlPzF74gjNPP3JXUzSfW53FpNA4m6aVyyb4knlAVc.ezEDgPEUggCjjNPyG5Z2",
    "__Secure-1PAPISID": "-d3RvP9zrJrxVDvN/A0qWBRQ4VVGG19FKE",
    "__Secure-1PSID": "g.a000-wi_VfY0V3p9kEtO9xZMFO0a6jiSTWLgy9gnrQrm_0DOvHnteeVhGjmJPfgMZE00QtnM-QACgYKAXISAQwSFQHGX2Mi9aw57eC4Uc7u1IOzROh1DxoVAUF8yKqIGO8w3ZBH6me-URBF8V0J0076",
    "__Secure-3PAPISID": "-d3RvP9zrJrxVDvN/A0qWBRQ4VVGG19FKE",
    "__Secure-3PSID": "g.a000-wi_VfY0V3p9kEtO9xZMFO0a6jiSTWLgy9gnrQrm_0DOvHntTcKe4kDNGpCRavmTcwQG_gACgYKAcgSAQwSFQHGX2MicJ57UKaCtvQNsu_NILZSKxoVAUF8yKpmsFvVfuYZnSFEtGWRVNsT0076",
    "_ga": "GA1.1.870056845.1780624747",
    "_ga_WTH1ZY9YFQ": "GS2.1.s1781024301$o8$g1$t1781024406$j44$l0$h0"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

def extract_crx(crx_path, extract_path):
    try:
        with open(crx_path, 'rb') as f:
            magic = f.read(4)
            if magic != b'Cr24':
                # Mungkin ini ZIP murni
                f.seek(0)
                with zipfile.ZipFile(f) as zf:
                    zf.extractall(extract_path)
                return True
                
            version = struct.unpack('<I', f.read(4))[0]
            if version == 2:
                pub_key_len = struct.unpack('<I', f.read(4))[0]
                sig_len = struct.unpack('<I', f.read(4))[0]
                f.seek(pub_key_len + sig_len, 1)
            elif version == 3:
                header_size = struct.unpack('<I', f.read(4))[0]
                f.seek(header_size, 1)
            else:
                return False
                
            zip_data = f.read()
            with zipfile.ZipFile(io.BytesIO(zip_data)) as zf:
                zf.extractall(extract_path)
            return True
    except Exception as e:
        return False

def check_host_permissions(extract_path):
    manifest_path = os.path.join(extract_path, 'manifest.json')
    if not os.path.exists(manifest_path):
        return False
        
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Bersihkan komentar JS dari manifest
            content = '\n'.join([line for line in content.split('\n') if not line.strip().startswith('//')])
            manifest = json.loads(content)
            
        host_perms = []
        if 'host_permissions' in manifest:
            return len(manifest['host_permissions']) > 0
            
        if 'permissions' in manifest:
            perms = manifest['permissions']
            if isinstance(perms, list):
                host_perms = [p for p in perms if '://' in p or '<all_urls>' in p]
        
        return len(host_perms) > 0
    except Exception:
        return False

def main():
    base_dir = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector'
    data_dir = os.path.join(base_dir, 'data', 'aman')
    crx_temp_dir = os.path.join(base_dir, 'data', 'crx_temp')
    dst_dir = os.path.join(base_dir, 'data', 'extracted', 'benign_100')
    
    os.makedirs(crx_temp_dir, exist_ok=True)
    os.makedirs(dst_dir, exist_ok=True)

    # 1. Ekstrak ID dari file JSON
    print("Mencari Extension IDs dari file JSON...")
    regex = r'chromewebstore\.google\.com/detail/(?:[^/]+/)?([a-z]{32})'
    all_ids = set()
    
    for i in range(1, 8):
        file_path = os.path.join(data_dir, f'data{i}.json')
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = re.findall(regex, content)
                for m in matches:
                    all_ids.add(m)
                    
    print(f"Ditemukan {len(all_ids)} ID ekstensi unik!")

    # 2. Download dan verifikasi
    success_count = 0
    target_count = 100  # Target ambil 100 yang valid
    
    for ext_id in tqdm(list(all_ids), desc="Downloading"):
        if success_count >= target_count:
            print(f"\nBerhasil mencapai target {target_count} ekstensi aman dengan host_permissions!")
            break
            
        final_ext_path = os.path.join(dst_dir, ext_id)
        if os.path.exists(final_ext_path):
            success_count += 1
            continue

        url = f"https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&prodversion=114.0.5735.199&x=id%3D{ext_id}%26installsource%3Dondemand%26uc"
        
        crx_path = os.path.join(crx_temp_dir, f"{ext_id}.crx")
        extract_path = os.path.join(crx_temp_dir, ext_id)
        
        try:
            # Download CRX
            res = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=15)
            if res.status_code == 200:
                with open(crx_path, 'wb') as f:
                    f.write(res.content)
                    
                # Ekstrak
                os.makedirs(extract_path, exist_ok=True)
                if extract_crx(crx_path, extract_path):
                    # Cek manifest apakah punya host_permissions
                    if check_host_permissions(extract_path):
                        shutil.move(extract_path, final_ext_path)
                        success_count += 1
                    else:
                        shutil.rmtree(extract_path)
                else:
                    if os.path.exists(extract_path):
                        shutil.rmtree(extract_path)
                        
            # Hapus file crx sementara
            if os.path.exists(crx_path):
                os.remove(crx_path)
                
        except Exception as e:
            if os.path.exists(extract_path):
                shutil.rmtree(extract_path, ignore_errors=True)
            if os.path.exists(crx_path):
                os.remove(crx_path)
            continue

    print(f"Proses selesai. Berhasil mendapatkan {success_count} ekstensi.")

if __name__ == '__main__':
    main()
