import os
import sys
import shutil
from tqdm import tqdm

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from analyzer import static_analyzer

def select_benign(src_dir, dst_dir, target_count=100):
    if not os.path.exists(src_dir):
        print(f"Source directory not found: {src_dir}")
        return

    os.makedirs(dst_dir, exist_ok=True)
    ext_dirs = [d for d in os.listdir(src_dir) if os.path.isdir(os.path.join(src_dir, d))]
    
    print(f"Found {len(ext_dirs)} extensions in {src_dir}")
    
    selected = 0
    for ext_name in tqdm(ext_dirs):
        if selected >= target_count:
            break
            
        ext_path = os.path.join(src_dir, ext_name)
        dst_path = os.path.join(dst_dir, ext_name)
        
        # Skip if already copied
        if os.path.exists(dst_path):
            selected += 1
            continue
            
        # Run static analysis
        result = static_analyzer.analyze_extension(ext_path)
        
        if 'error' in result:
            continue
            
        features = result['features']
        metadata = result['metadata']
        
        # Criteria for "TRULY SAFE":
        # 1. No SEE categories detected statically
        # 2. Minimal sensitive permissions
        # 3. Use host_permissions (not relying heavily on activeTab without explicit domains)
        
        is_clean = (
            (metadata.get('see_categories_str', '') == '' or metadata.get('see_categories_str') == 'None') and
            features.get('sensitive_permissions_count', 0) <= 2 and
            features.get('has_host_permissions') == True
        )
        
        if is_clean:
            shutil.copytree(ext_path, dst_path)
            selected += 1

    print(f"\nSuccessfully selected and copied {selected} TRULY SAFE benign extensions to {dst_dir}")

if __name__ == "__main__":
    src = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\benign'
    dst = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\benign_100'
    select_benign(src, dst, target_count=100)
