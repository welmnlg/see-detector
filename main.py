import argparse
import sys
import os

from extractor.crx_extractor import extract_batch
from dataset.dataset_builder import build_dataset
from utils.downloader import download_benign_dataset
from ml.trainer import train_model
from ml.evaluator import full_evaluation
from config import settings

def main():
    parser = argparse.ArgumentParser(description="SEE Detector Pipeline")
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Download benign dataset
    subparsers.add_parser('download', help='Download benign dataset from Chrome Web Store')
    
    # Extract extensions
    subparsers.add_parser('extract', help='Extract CRX files to directories')
    
    # Build dataset
    parser_build = subparsers.add_parser('build-dataset', help='Extract features and build CSV dataset')
    parser_build.add_argument('--workers', type=int, default=4,
                              help='Number of parallel Chrome windows (default: 4)')
    
    # Train
    subparsers.add_parser('train', help='Train the Random Forest model')
    
    # Evaluate
    subparsers.add_parser('evaluate', help='Evaluate the trained model')
    
    # Generate dynamic report
    parser_report = subparsers.add_parser('report', help='Generate dynamic analysis report for vulnerable extensions')
    parser_report.add_argument('--workers', type=int, default=4,
                               help='Number of parallel Chrome windows (default: 4)')
                               
    # Generate static report
    parser_static_report = subparsers.add_parser('static-report', help='Generate static analysis report for vulnerable extensions')
    parser_static_report.add_argument('--workers', type=int, default=4,
                               help='Number of parallel workers (default: 4)')
    
    # Run web server
    subparsers.add_parser('web', help='Start the Flask web server')
    
    args = parser.parse_args()
    
    if args.command == 'download':
        print("Downloading benign dataset...")
        download_benign_dataset()
        
    elif args.command == 'extract':
        print("Extracting vulnerable extensions...")
        extract_batch(settings.RAW_VULNERABLE_DIR, os.path.join(settings.EXTRACTED_DIR, 'vulnerable'))
        print("\nExtracting benign extensions...")
        extract_batch(settings.RAW_BENIGN_DIR, os.path.join(settings.EXTRACTED_DIR, 'benign'))
        print("Extraction complete.")
        
    elif args.command == 'build-dataset':
        print(f"Building dataset with {args.workers} parallel Chrome windows...")
        build_dataset(workers=args.workers)
        
    elif args.command == 'train':
        print("Starting training pipeline...")
        train_model()
        
    elif args.command == 'evaluate':
        print("Evaluating model...")
        full_evaluation()
        
    elif args.command == 'report':
        from generate_dynamic_report import generate_reports
        print(f"Generating dynamic report with {args.workers} parallel Chrome windows...")
        generate_reports(workers=args.workers)
        
    elif args.command == 'static-report':
        from generate_static_report import generate_static_reports
        print(f"Generating static report with {args.workers} parallel workers...")
        generate_static_reports(workers=args.workers)
        
    elif args.command == 'web':
        print("Starting Flask web server...")
        os.system(f'"{sys.executable}" web/app.py')
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
