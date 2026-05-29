import os
import sys
import pandas as pd
from tqdm import tqdm
import concurrent.futures

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
from analyzer import static_analyzer

def process_extension(args):
    """
    Worker function to process a single extension.
    Runs both static and dynamic analysis.
    """
    ext_name, directory, label, run_dynamic = args
    ext_path = os.path.join(directory, ext_name)
    
    # 1. Static Analysis
    result = static_analyzer.analyze_extension(ext_path)
    if 'error' in result:
        return None
        
    row = {
        'extension_id': result['extension_id'],
        'label': label,
        'see_categories': result['metadata']['see_categories_str']
    }
    row.update(result['features'])
    
    # 2. Dynamic Analysis
    if run_dynamic:
        try:
            from dynamic import DynamicSandbox
            sandbox = DynamicSandbox(ext_path)
            dyn_res = sandbox.run_analysis(target_urls=["https://example.com"])
            row['outbound_request_count'] = dyn_res.get('outbound_request_count', 0)
            row['unauthorized_domain_count'] = dyn_res.get('unauthorized_domain_count', 0)
            row['sends_user_data'] = dyn_res.get('sends_user_data', False)
            row['has_periodic_sync'] = dyn_res.get('has_periodic_sync', False)
            row['is_sw_initiated'] = dyn_res.get('is_sw_initiated', False)
            row['is_cs_initiated'] = dyn_res.get('is_cs_initiated', False)
            row['see_behavior_detected'] = dyn_res.get('see_behavior_detected', False)
            row['cookies_stolen'] = dyn_res.get('cookies_stolen', False)
            row['redirect_detected'] = dyn_res.get('redirect_detected', False)
            row['download_hijacked'] = dyn_res.get('download_hijacked', False)
        except Exception as e:
            # Fallback to defaults
            row['outbound_request_count'] = 0
            row['unauthorized_domain_count'] = 0
            row['sends_user_data'] = False
            row['has_periodic_sync'] = False
            row['is_sw_initiated'] = False
            row['is_cs_initiated'] = False
            row['see_behavior_detected'] = False
            row['cookies_stolen'] = False
            row['redirect_detected'] = False
            row['download_hijacked'] = False
    else:
        # Stub them with 0/False so the columns exist for ML
        row['outbound_request_count'] = 0
        row['unauthorized_domain_count'] = 0
        row['sends_user_data'] = False
        row['has_periodic_sync'] = False
        row['is_sw_initiated'] = False
        row['is_cs_initiated'] = False
        row['see_behavior_detected'] = False
        row['cookies_stolen'] = False
        row['redirect_detected'] = False
        row['download_hijacked'] = False
    
    return row

def extract_features_from_dir(directory, label, run_dynamic=False, workers=4):
    """
    Extracts features from all extension directories inside a given directory.
    Uses ProcessPoolExecutor to run Playwright instances in parallel.
    
    Args:
        workers: Number of parallel Chrome instances (default: 4)
    """
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return []
        
    ext_dirs = [d for d in os.listdir(directory) if os.path.isdir(os.path.join(directory, d))]
    
    # Prepare arguments for multiprocessing
    tasks = [(ext_name, directory, label, run_dynamic) for ext_name in ext_dirs]
    
    rows = []
    # Use ProcessPoolExecutor to isolate Playwright event loops in separate processes
    with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as executor:
        # Wrap executor.map with tqdm for progress bar
        results = list(tqdm(
            executor.map(process_extension, tasks), 
            total=len(tasks), 
            desc=f"Extracting label {label} ({workers} workers)"
        ))
        
        for r in results:
            if r is not None:
                rows.append(r)
                
    return rows

def build_dataset(workers=4):
    """
    Builds the complete dataset CSV.
    
    Args:
        workers: Number of parallel Chrome instances (default: 4)
    """
    print(f"Using {workers} parallel Chrome windows.")
    
    print("Extracting features from VULNERABLE extensions...")
    vuln_dir = os.path.join(settings.EXTRACTED_DIR, 'vulnerable')
    vuln_rows = extract_features_from_dir(vuln_dir, label=1, run_dynamic=True, workers=workers)
    
    print("Extracting features from BENIGN extensions...")
    benign_dir = os.path.join(settings.EXTRACTED_DIR, 'benign')
    benign_rows = extract_features_from_dir(benign_dir, label=0, run_dynamic=True, workers=workers)
    
    all_rows = vuln_rows + benign_rows
    
    if len(all_rows) == 0:
        print("No data extracted. Ensure you have extracted extensions in data/extracted/")
        return None
        
    df = pd.DataFrame(all_rows)
    
    # Save to CSV
    os.makedirs(settings.FEATURES_DIR, exist_ok=True)
    output_path = os.path.join(settings.FEATURES_DIR, 'dataset.csv')
    df.to_csv(output_path, index=False)
    
    print(f"Dataset successfully built with {len(df)} samples.")
    print(f"Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    build_dataset()
