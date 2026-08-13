import os
import sys
import json
import shutil
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
    except Exception as e:
        return None

src_dir = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\benign'
dst_dir = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\benign_100'

os.makedirs(dst_dir, exist_ok=True)
ext_dirs = [d for d in os.listdir(src_dir) if os.path.isdir(os.path.join(src_dir, d))]

existing = len([d for d in os.listdir(dst_dir) if os.path.isdir(os.path.join(dst_dir, d))])
target = 100
needed = target - existing

print(f"Need {needed} more extensions. Total available: {len(ext_dirs)}")

added = 0
for ext_name in tqdm(ext_dirs):
    if added >= needed:
        break
        
    ext_path = os.path.join(src_dir, ext_name)
    dst_path = os.path.join(dst_dir, ext_name)
    
    if os.path.exists(dst_path):
        continue
        
    # Pre-filter using just the manifest (Super Fast)
    info = get_manifest_info(ext_path)
    if not info:
        continue
        
    if not info['has_host_permissions'] or info['sensitive_permissions_count'] > 2:
        continue
        
    # If it passes the fast filter, run the full heavy analyzer to ensure no SEE categories exist
    result = static_analyzer.analyze_extension(ext_path)
    if 'error' in result:
        continue
        
    metadata = result['metadata']
    if metadata.get('see_categories_str', '') == '' or metadata.get('see_categories_str') == 'None':
        shutil.copytree(ext_path, dst_path)
        added += 1
        print(f"\nAdded {ext_name} ({added}/{needed})")

print(f"\nSuccessfully added {added} extensions. Total in benign_100 is now {existing + added}.")
