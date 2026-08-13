import os
import sys
import shutil

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from analyzer import static_analyzer

dst_dir = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\benign_100'

if os.path.exists(dst_dir):
    ext_dirs = [d for d in os.listdir(dst_dir) if os.path.isdir(os.path.join(dst_dir, d))]
    
    removed = 0
    for ext_name in ext_dirs:
        ext_path = os.path.join(dst_dir, ext_name)
        result = static_analyzer.analyze_extension(ext_path)
        
        if 'error' in result:
            shutil.rmtree(ext_path)
            removed += 1
            continue
            
        features = result['features']
        if not features.get('has_host_permissions', False):
            print(f"Removing {ext_name} (No host_permissions)")
            shutil.rmtree(ext_path)
            removed += 1
            
    print(f"Removed {removed} invalid extensions from benign_100.")
else:
    print("Directory does not exist.")
