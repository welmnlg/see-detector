import os
import sys

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extractor import manifest_parser
from analyzer import js_scanner, see_classifier

def analyze_extension(ext_dir):
    """
    Orchestrates the static analysis pipeline for a single extension.
    Returns a combined dictionary of all features and metadata.
    """
    ext_dir = os.path.abspath(ext_dir)
    
    if not os.path.exists(ext_dir) or not os.path.isdir(ext_dir):
        return {"error": f"Directory not found: {ext_dir}"}
        
    # 1. Parse Manifest
    manifest_features = manifest_parser.parse_manifest(ext_dir)
    
    # 2. Scan JavaScript
    js_features, js_analysis = js_scanner.scan_js_files(ext_dir)
    
    # 3. Combine Features
    combined_features = {**manifest_features, **js_features}
    
    # 4. Classify SEE Categories (Metadata)
    categories = see_classifier.classify_see_categories(combined_features, js_analysis)
    
    # 5. Build final result
    result = {
        'extension_id': os.path.basename(ext_dir),
        'features': combined_features,
        'metadata': {
            'see_categories': categories,
            'see_categories_str': ",".join(categories),
            'external_urls': list(js_analysis['external_urls_found'])
        }
    }
    
    return result

if __name__ == "__main__":
    from config import settings
    test_dir = os.path.join(settings.EXTRACTED_DIR, 'vulnerable')
    if os.path.exists(test_dir):
        for item in os.listdir(test_dir):
            ext_path = os.path.join(test_dir, item)
            if os.path.isdir(ext_path):
                print(f"Full Analysis of {item}:")
                result = analyze_extension(ext_path)
                import json
                print(json.dumps(result['metadata'], indent=2))
                break
