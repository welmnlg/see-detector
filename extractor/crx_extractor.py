import os
import zipfile
import shutil
from pathlib import Path

def extract_crx_or_zip(file_path, output_dir):
    """
    Extracts a .crx or .zip file to the specified output directory.
    For .crx files, it skips the header and extracts the underlying ZIP archive.
    """
    file_path = Path(file_path)
    output_dir = Path(output_dir)

    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create a subfolder for this extension
    ext_dir = output_dir / file_path.stem
    
    # If already extracted, skip or overwrite? Let's overwrite for fresh state
    if ext_dir.exists():
        shutil.rmtree(ext_dir)
    ext_dir.mkdir(parents=True)

    try:
        with open(file_path, 'rb') as f:
            data = f.read()

        # Find the ZIP signature
        zip_start = data.find(b'PK\x03\x04')
        
        if zip_start == -1:
            raise ValueError(f"No valid ZIP signature found in {file_path}")

        # Write the ZIP portion to a temporary file
        temp_zip_path = ext_dir / 'temp.zip'
        with open(temp_zip_path, 'wb') as temp_zip:
            temp_zip.write(data[zip_start:])

        # Extract the ZIP
        with zipfile.ZipFile(temp_zip_path, 'r') as z:
            z.extractall(ext_dir)
            
        # Remove the temporary zip
        os.remove(temp_zip_path)
        
        return True, str(ext_dir)

    except Exception as e:
        print(f"Error extracting {file_path}: {e}")
        # Cleanup partial extraction if failed
        if ext_dir.exists():
            shutil.rmtree(ext_dir)
        return False, str(e)

def extract_batch(input_dir, output_dir):
    """
    Extracts all .crx and .zip files in the input directory.
    """
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    
    results = {}
    for file_path in input_dir.iterdir():
        if file_path.suffix.lower() in ['.crx', '.zip']:
            success, result_path_or_err = extract_crx_or_zip(file_path, output_dir)
            results[file_path.name] = {
                'success': success,
                'output': result_path_or_err
            }
            
    return results

if __name__ == "__main__":
    # Test script if run directly
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from config import settings
    
    print("Testing extraction on vulnerable dataset...")
    results = extract_batch(settings.RAW_VULNERABLE_DIR, os.path.join(settings.EXTRACTED_DIR, 'vulnerable'))
    for name, res in results.items():
        print(f"{name}: {'Success' if res['success'] else 'Failed'} - {res['output']}")
