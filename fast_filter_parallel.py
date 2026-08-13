import os
import sys
import json
import shutil
from concurrent.futures import ProcessPoolExecutor, as_completed
from tqdm import tqdm

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from analyzer import static_analyzer

def get_manifest_info(ext_path):
    manifest_path = os.path.join(ext_path, 'manifest.json')
    if not os.path.exists(manifest_path):
        return None
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # simple clean of comments if any
            content = '\n'.join([line for line in content.split('\n') if not line.strip().startswith('//')])
            manifest = json.loads(content)
            
        host_perms = []
        if 'host_permissions' in manifest:
            host_perms = manifest['host_permissions']
        elif 'permissions' in manifest:
            perms = manifest['permissions']
            if isinstance(perms, list):
                host_perms = [p for p in perms if '://' in p or '<all_urls>' in p]
            
        has_host_perms = len(host_perms) > 0
        
        sensitive = ['cookies', 'activeTab', 'tabs', 'webRequest', 'webRequestBlocking', 'storage', 'downloads', 'scripting', 'clipboardRead', 'history', 'bookmarks']
        perms = manifest.get('permissions', [])
        sens_count = 0
        if isinstance(perms, list):
            sens_count = sum(1 for p in perms if p in sensitive)
            
        return {
            'has_host_permissions': has_host_perms,
            'sensitive_permissions_count': sens_count
        }
    except Exception:
        return None

def process_extension(args):
    ext_name, src_dir = args
    ext_path = os.path.join(src_dir, ext_name)
    
    # 1. Pre-filter Manifest (Super Cepat, menghemat waktu)
    info = get_manifest_info(ext_path)
    if not info:
        return None
        
    if not info['has_host_permissions']:
        return None
        
    # 2. Jika lolos pre-filter, jalankan Analisis Statis Mendalam
    result = static_analyzer.analyze_extension(ext_path)
    if 'error' in result:
        return None
        
    metadata = result['metadata']
    # 3. Pastikan tidak ada kategori SEE yang terdeteksi
    if metadata.get('see_categories_str', '') == '' or metadata.get('see_categories_str') == 'None':
        return ext_name
        
    return None

if __name__ == '__main__':
    src_dir = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\benign'
    dst_dir = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\benign_100'

    os.makedirs(dst_dir, exist_ok=True)
    ext_dirs = [d for d in os.listdir(src_dir) if os.path.isdir(os.path.join(src_dir, d))]

    existing = len([d for d in os.listdir(dst_dir) if os.path.isdir(os.path.join(dst_dir, d))])
    target = 100
    needed = target - existing

    if needed <= 0:
        print("Folder benign_100 sudah berisi 100 ekstensi atau lebih. Selesai!")
        sys.exit(0)

    print(f"Kekurangan: {needed} ekstensi. Total tersedia untuk dicek: {len(ext_dirs)}")
    print("Memulai proses penyaringan paralel dengan Multiprocessing...")
    
    # Buat daftar task
    tasks = [(ext_name, src_dir) for ext_name in ext_dirs if not os.path.exists(os.path.join(dst_dir, ext_name))]
    
    added = 0
    
    # Gunakan ProcessPoolExecutor untuk paralelisasi (worker)
    # Gunakan max_workers sebanyak CPU core yang tersedia
    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        # Submit semua task
        futures = {executor.submit(process_extension, task): task for task in tasks}
        
        # tqdm untuk progress bar dan estimasi waktu
        with tqdm(total=len(futures), desc="Memindai Ekstensi") as pbar:
            for future in as_completed(futures):
                pbar.update(1)
                ext_name = future.result()
                
                if ext_name:
                    # Sukses lolos semua kriteria
                    ext_path = os.path.join(src_dir, ext_name)
                    dst_path = os.path.join(dst_dir, ext_name)
                    
                    try:
                        shutil.copytree(ext_path, dst_path)
                        added += 1
                        # Update progress bar description
                        pbar.set_description(f"Berhasil ({added}/{needed})")
                        
                        if added >= needed:
                            print(f"\nTarget {needed} ekstensi telah tercapai! Menghentikan worker...")
                            # Cancel remaining futures
                            for f in futures:
                                f.cancel()
                            break
                    except Exception as e:
                        print(f"Error copying {ext_name}: {e}")

    print(f"\nSukses menambahkan {added} ekstensi baru. Total ekstensi di benign_100 sekarang adalah {existing + added}.")
