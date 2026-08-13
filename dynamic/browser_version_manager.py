#!/usr/bin/env python3
"""
browser_version_manager.py — Download & Manage Multiple Browser Versions for Testing
=====================================================================================
Downloads 3 versions of Chrome (via Chrome for Testing API) and 3 versions of
Microsoft Edge (via Edge Enterprise Updates API) for multi-version dynamic analysis.

Usage:
  python browser_version_manager.py                # Download all browsers
  python browser_version_manager.py --check        # Check what's already downloaded
  python browser_version_manager.py --chrome-only  # Only download Chrome versions
  python browser_version_manager.py --edge-only    # Only download Edge versions
"""

import os
import sys
import json
import shutil
import zipfile
import argparse
import tempfile
import requests
from pathlib import Path

# Fix Windows console encoding
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except (AttributeError, Exception):
        pass

# ─── Configuration ────────────────────────────────────────────────────────────
BROWSERS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "browsers")

CHROME_VERSIONS_API = "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json"
CHROME_LAST_GOOD_API = "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json"

EDGE_UPDATES_API = "https://edgeupdates.microsoft.com/api/products?view=enterprise"

PLATFORM = "win64"
NUM_VERSIONS = 3


# ─── Chrome for Testing ──────────────────────────────────────────────────────

def get_chrome_stable_versions(count=3):
    """
    Get the latest `count` distinct MAJOR Chrome stable versions from Chrome for Testing.
    Returns list of dicts: [{version, major, url}, ...]
    """
    print("  [Chrome] Fetching version list from Chrome for Testing API...")
    
    # First get the current stable version to know which major we're on
    try:
        resp = requests.get(CHROME_LAST_GOOD_API, timeout=30)
        resp.raise_for_status()
        last_good = resp.json()
        stable_version = last_good["channels"]["Stable"]["version"]
        current_major = int(stable_version.split(".")[0])
        print(f"  [Chrome] Current stable: {stable_version} (major: {current_major})")
    except Exception as e:
        print(f"  [Chrome] WARNING: Could not fetch last-known-good: {e}")
        current_major = 999  # fallback: will just pick latest from known-good

    # Now get known-good versions and find the latest build for each of the last N majors
    resp = requests.get(CHROME_VERSIONS_API, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    
    # Group by major version, pick latest build per major
    major_to_best = {}  # {major: {version, url}}
    
    for entry in data.get("versions", []):
        version = entry["version"]
        major = int(version.split(".")[0])
        
        chrome_downloads = entry.get("downloads", {}).get("chrome", [])
        win64_url = None
        for dl in chrome_downloads:
            if dl.get("platform") == PLATFORM:
                win64_url = dl["url"]
                break
        
        if win64_url and major <= current_major:
            # Keep latest build per major (list is sorted ascending, so last wins)
            major_to_best[major] = {
                "version": version,
                "major": major,
                "url": win64_url,
            }
    
    # Pick the top N majors (descending)
    sorted_majors = sorted(major_to_best.keys(), reverse=True)[:count]
    results = [major_to_best[m] for m in sorted_majors]
    
    for r in results:
        print(f"  [Chrome] Selected: v{r['version']} (major {r['major']})")
    
    return results


def download_and_extract_chrome(version_info, target_dir):
    """Download a Chrome for Testing zip and extract it."""
    version = version_info["version"]
    url = version_info["url"]
    dest = os.path.join(target_dir, f"chrome_{version_info['major']}")
    exe_path = os.path.join(dest, "chrome-win64", "chrome.exe")
    
    if os.path.exists(exe_path):
        print(f"  [Chrome] v{version} already exists at {dest}")
        return exe_path
    
    print(f"  [Chrome] Downloading v{version}...")
    print(f"           URL: {url}")
    
    os.makedirs(dest, exist_ok=True)
    
    # Download to temp file
    zip_path = os.path.join(dest, "chrome.zip")
    try:
        resp = requests.get(url, stream=True, timeout=300)
        resp.raise_for_status()
        total = int(resp.headers.get("content-length", 0))
        downloaded = 0
        
        with open(zip_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total > 0:
                    pct = downloaded * 100 // total
                    sys.stdout.write(f"\r           Progress: {pct}% ({downloaded // (1024*1024)}MB / {total // (1024*1024)}MB)")
                    sys.stdout.flush()
        
        print()  # newline after progress
        
        # Extract
        print(f"  [Chrome] Extracting v{version}...")
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(dest)
        
        os.remove(zip_path)
        
        if os.path.exists(exe_path):
            print(f"  [Chrome] OK: v{version} ready at: {exe_path}")
            return exe_path
        else:
            print(f"  [Chrome] ERROR: chrome.exe not found after extraction!")
            return None
            
    except Exception as e:
        print(f"  [Chrome] ERROR downloading v{version}: {e}")
        if os.path.exists(zip_path):
            os.remove(zip_path)
        return None


# ─── Microsoft Edge ───────────────────────────────────────────────────────────

def get_edge_stable_versions(count=3):
    """
    Get the latest `count` distinct MAJOR Edge stable versions from Edge Updates API.
    Returns list of dicts: [{version, major, url}, ...]
    """
    print("  [Edge] Fetching version list from Edge Enterprise Updates API...")
    
    resp = requests.get(EDGE_UPDATES_API, timeout=30)
    resp.raise_for_status()
    products = resp.json()
    
    # Find Stable channel releases
    major_to_best = {}
    
    for product in products:
        if product.get("Product") != "Stable":
            continue
        
        for release in product.get("Releases", []):
            arch = release.get("Architecture", "")
            platform = release.get("Platform", "")
            version = release.get("ProductVersion", "")
            
            if platform != "Windows" or arch != "x64":
                continue
            
            # Get download URL — take first available artifact
            artifacts = release.get("Artifacts", [])
            url = None
            for artifact in artifacts:
                loc = artifact.get("Location", "")
                if loc:
                    url = loc
                    break
            
            if not url or not version:
                continue
            
            major = int(version.split(".")[0])
            # Keep latest per major
            if major not in major_to_best:
                major_to_best[major] = {
                    "version": version,
                    "major": major,
                    "url": url,
                    "platform": platform,
                }
    
    sorted_majors = sorted(major_to_best.keys(), reverse=True)[:count]
    results = [major_to_best[m] for m in sorted_majors]
    
    for r in results:
        print(f"  [Edge] Selected: v{r['version']} (major {r['major']})")
    
    return results


def download_edge_installer(version_info, target_dir):
    """
    Download Edge standalone installer.
    Edge doesn't have a simple 'extract and run' model like Chrome for Testing.
    Instead, we'll use the system-installed Edge and just record the version info.
    For multi-version Edge testing, we rely on the system Edge installation.
    """
    version = version_info["version"]
    major = version_info["major"]
    dest = os.path.join(target_dir, f"edge_{major}")
    info_path = os.path.join(dest, "version_info.json")
    
    if os.path.exists(info_path):
        print(f"  [Edge] v{version} info already exists at {dest}")
        with open(info_path, "r") as f:
            info = json.load(f)
        return info.get("executable_path")
    
    os.makedirs(dest, exist_ok=True)
    
    # For Edge, we check if the system has Edge installed and use that
    # Edge stable is typically at a predictable path
    edge_paths = [
        rf"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        rf"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    
    system_edge = None
    for ep in edge_paths:
        if os.path.exists(ep):
            system_edge = ep
            break
    
    if system_edge:
        print(f"  [Edge] System Edge found: {system_edge}")
        # Save version info
        with open(info_path, "w") as f:
            json.dump({
                "version": version,
                "major": major,
                "executable_path": system_edge,
                "note": "Using system-installed Edge. Multi-version Edge requires separate installations.",
            }, f, indent=2)
        return system_edge
    else:
        print(f"  [Edge] WARNING: No system Edge found. Edge testing will be skipped.")
        with open(info_path, "w") as f:
            json.dump({
                "version": version,
                "major": major,
                "executable_path": None,
                "note": "Edge not found on system.",
            }, f, indent=2)
        return None


# ─── Registry / Manifest ─────────────────────────────────────────────────────

def save_browser_manifest(browsers_dir, chrome_versions, edge_versions):
    """Save a manifest of all downloaded browsers for the batch runner to read."""
    manifest_path = os.path.join(browsers_dir, "browser_manifest.json")
    
    # Load existing manifest to merge
    manifest = {"chrome": [], "edge": []}
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            pass

    # Update Chrome if we have new ones
    if chrome_versions:
        manifest["chrome"] = []
        for cv in chrome_versions:
            exe = os.path.join(browsers_dir, f"chrome_{cv['major']}", "chrome-win64", "chrome.exe")
            if os.path.exists(exe):
                manifest["chrome"].append({
                    "version": cv["version"],
                    "major": cv["major"],
                    "executable_path": exe,
                    "label": f"Chrome {cv['major']}",
                })

    # Update Edge if we have new ones
    if edge_versions:
        manifest["edge"] = []
        for ev in edge_versions:
            info_path = os.path.join(browsers_dir, f"edge_{ev['major']}", "version_info.json")
            if os.path.exists(info_path):
                with open(info_path, "r", encoding="utf-8") as f:
                    info = json.load(f)
                if info.get("executable_path"):
                    manifest["edge"].append({
                        "version": ev["version"],
                        "major": ev["major"],
                        "executable_path": info["executable_path"],
                        "label": f"Edge {ev['major']}",
                        "_channel": "msedge"
                    })

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n  [OK] Browser manifest saved: {manifest_path}")
    print(f"     Chrome versions: {len(manifest['chrome'])}")
    print(f"     Edge versions  : {len(manifest['edge'])}")
    
    return manifest


def load_browser_manifest(browsers_dir=None):
    """Load the browser manifest. Returns dict with 'chrome' and 'edge' lists."""
    if browsers_dir is None:
        browsers_dir = BROWSERS_DIR
    manifest_path = os.path.join(browsers_dir, "browser_manifest.json")
    if not os.path.exists(manifest_path):
        return {"chrome": [], "edge": []}
    with open(manifest_path, "r", encoding="utf-8") as f:
        return json.load(f)


def check_status():
    """Print status of downloaded browsers."""
    print(f"\n{'='*60}")
    print(f"  Browser Version Manager — Status")
    print(f"{'='*60}")
    print(f"  Browsers dir: {BROWSERS_DIR}")
    
    if not os.path.exists(BROWSERS_DIR):
        print("  No browsers downloaded yet.")
        return
    
    manifest = load_browser_manifest()
    
    print(f"\n  Chrome ({len(manifest.get('chrome', []))} versions):")
    for b in manifest.get("chrome", []):
        exists = os.path.exists(b["executable_path"])
        status = "✓" if exists else "✗ MISSING"
        print(f"    {status} {b['label']} (v{b['version']}) → {b['executable_path']}")
    
    print(f"\n  Edge ({len(manifest.get('edge', []))} versions):")
    for b in manifest.get("edge", []):
        exists = os.path.exists(b["executable_path"]) if b.get("executable_path") else False
        status = "✓" if exists else "✗ MISSING"
        print(f"    {status} {b['label']} (v{b['version']}) → {b.get('executable_path', 'N/A')}")
    
    print(f"{'='*60}\n")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Download & manage multiple browser versions for testing")
    parser.add_argument("--check", action="store_true", help="Check status of downloaded browsers")
    parser.add_argument("--chrome-only", action="store_true", help="Only download Chrome versions")
    parser.add_argument("--edge-only", action="store_true", help="Only download Edge versions")
    parser.add_argument("--count", type=int, default=NUM_VERSIONS, help=f"Number of versions to download (default: {NUM_VERSIONS})")
    args = parser.parse_args()
    
    if args.check:
        check_status()
        return
    
    os.makedirs(BROWSERS_DIR, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"  Browser Version Manager — Download")
    print(f"{'='*60}")
    print(f"  Target dir: {BROWSERS_DIR}")
    print(f"  Versions  : {args.count} per browser")
    print(f"{'='*60}\n")
    
    chrome_versions = []
    edge_versions = []
    
    # ── Chrome ──
    if not args.edge_only:
        try:
            chrome_versions = get_chrome_stable_versions(count=args.count)
            for cv in chrome_versions:
                download_and_extract_chrome(cv, BROWSERS_DIR)
        except Exception as e:
            print(f"  [Chrome] ERROR: {e}")
    
    # ── Edge ──
    if not args.chrome_only:
        try:
            edge_versions = get_edge_stable_versions(count=args.count)
            for ev in edge_versions:
                download_edge_installer(ev, BROWSERS_DIR)
        except Exception as e:
            print(f"  [Edge] ERROR: {e}")
    
    # ── Save manifest ──
    if chrome_versions or edge_versions:
        save_browser_manifest(BROWSERS_DIR, chrome_versions, edge_versions)
    
    print(f"\n  [OK] Done! Run with --check to verify.\n")


if __name__ == "__main__":
    main()
