#!/usr/bin/env python3
"""
triage_see_criteria.py — Cek apakah ekstensi memenuhi kriteria rentan SEE
==========================================================================
Membaca manifest.json dari setiap ekstensi di folder malware_chrome_stats
dan mengecek kriteria SEE (Stealth Extension Exfiltration):

KRITERIA SEE:
  1. WAJIB punya content_scripts (bisa inject ke halaman web)
  2. TIDAK BOLEH punya host_permissions luas (<all_urls>, *://*/* dll)
     → Jika punya, berarti browser sudah beri peringatan ke user (bukan stealth)
  3. Punya manifest_version 3 (fokus penelitian MV3)

OUTPUT:
  - Ringkasan statistik
  - CSV file berisi daftar ekstensi + status SEE-nya
"""

import os
import json
import csv

INPUT_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\malware_chrome_stats"
OUTPUT_CSV = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\see_triage_results.csv"

BROAD_HOST_PATTERNS = [
    "<all_urls>",
    "*://*/*",
    "http://*/*",
    "https://*/*",
]

def load_manifest(ext_path):
    manifest_path = os.path.join(ext_path, "manifest.json")
    if not os.path.exists(manifest_path):
        return None
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            text = f.read()
            if text.startswith("\ufeff"):
                text = text[1:]
            return json.loads(text)
    except Exception:
        return None

def has_content_scripts(manifest):
    """Cek apakah ekstensi memiliki content_scripts."""
    cs = manifest.get("content_scripts", [])
    return len(cs) > 0

def get_content_script_matches(manifest):
    """Ambil daftar URL pattern dari content_scripts."""
    matches = []
    for cs in manifest.get("content_scripts", []):
        matches.extend(cs.get("matches", []))
    return matches

def has_broad_host_permissions(manifest):
    """Cek apakah ada host_permissions yang terlalu luas (bukan stealth)."""
    # Cek di host_permissions (MV3)
    host_perms = manifest.get("host_permissions", [])
    # Cek juga di permissions (MV2 style)
    perms = manifest.get("permissions", [])
    # Cek di optional_host_permissions juga
    opt_host = manifest.get("optional_host_permissions", [])
    
    all_perms = host_perms + perms + opt_host
    
    for p in all_perms:
        p_lower = str(p).lower().strip()
        for broad in BROAD_HOST_PATTERNS:
            if p_lower == broad.lower():
                return True
    return False

def get_permissions(manifest):
    """Ambil semua permissions."""
    return manifest.get("permissions", [])

def get_host_permissions(manifest):
    """Ambil host_permissions."""
    return manifest.get("host_permissions", [])

def has_background_script(manifest):
    """Cek apakah ada background/service_worker."""
    bg = manifest.get("background", {})
    if bg.get("service_worker"):
        return True
    if bg.get("scripts"):
        return True
    if bg.get("page"):
        return True
    return False

def main():
    ext_dirs = [d for d in os.listdir(INPUT_DIR) if os.path.isdir(os.path.join(INPUT_DIR, d))]
    print(f"Total ekstensi di malware_chrome_stats: {len(ext_dirs)}")
    
    results = []
    
    # Counters
    no_manifest = 0
    mv2_count = 0
    mv3_count = 0
    has_cs = 0
    has_broad_hp = 0
    has_bg = 0
    
    see_vulnerable = 0      # MV3 + Content Script + Tidak ada Broad HP
    see_vulnerable_mv2 = 0  # MV2 + Content Script + Tidak ada Broad HP
    see_all = 0             # Semua MV + Content Script + Tidak ada Broad HP
    
    for ext_id in sorted(ext_dirs):
        ext_path = os.path.join(INPUT_DIR, ext_id)
        manifest = load_manifest(ext_path)
        
        if not manifest:
            no_manifest += 1
            results.append({
                "extension_id": ext_id,
                "status": "NO_MANIFEST",
                "manifest_version": "",
                "has_content_scripts": False,
                "has_broad_host_perms": False,
                "has_background": False,
                "see_vulnerable": False,
                "permissions": "",
                "host_permissions": "",
                "cs_matches": "",
                "name": "",
            })
            continue
        
        mv = manifest.get("manifest_version", "?")
        name = manifest.get("name", "")
        if name.startswith("__MSG_"):
            name = manifest.get("short_name", name)
        
        cs = has_content_scripts(manifest)
        broad_hp = has_broad_host_permissions(manifest)
        bg = has_background_script(manifest)
        cs_matches = get_content_script_matches(manifest)
        perms = get_permissions(manifest)
        host_perms = get_host_permissions(manifest)
        
        if mv == 2:
            mv2_count += 1
        elif mv == 3:
            mv3_count += 1
        
        if cs:
            has_cs += 1
        if broad_hp:
            has_broad_hp += 1
        if bg:
            has_bg += 1
        
        # Kriteria SEE: Punya CS + TIDAK punya Broad HP
        is_see = cs and not broad_hp
        if is_see:
            see_all += 1
            if mv == 3:
                see_vulnerable += 1
            elif mv == 2:
                see_vulnerable_mv2 += 1
        
        results.append({
            "extension_id": ext_id,
            "status": "OK",
            "manifest_version": mv,
            "has_content_scripts": cs,
            "has_broad_host_perms": broad_hp,
            "has_background": bg,
            "see_vulnerable": is_see,
            "permissions": "; ".join(str(p) for p in perms),
            "host_permissions": "; ".join(str(p) for p in host_perms),
            "cs_matches": "; ".join(cs_matches[:5]),  # Limit 5
            "name": name[:100],
        })
    
    # Print report
    print(f"\n{'='*65}")
    print(f"  HASIL TRIAGE SEE CRITERIA")
    print(f"{'='*65}")
    print(f"\n  Total ekstensi             : {len(ext_dirs)}")
    print(f"  Tanpa manifest.json        : {no_manifest}")
    print(f"  Manifest V2                : {mv2_count}")
    print(f"  Manifest V3                : {mv3_count}")
    print(f"\n  --- Fitur ---")
    print(f"  Punya Content Script       : {has_cs} ({has_cs*100//len(ext_dirs)}%)")
    print(f"  Punya Broad Host Perm      : {has_broad_hp} ({has_broad_hp*100//len(ext_dirs)}%)")
    print(f"  Punya Background/SW        : {has_bg} ({has_bg*100//len(ext_dirs)}%)")
    print(f"\n  --- KRITERIA SEE (Content Script + TANPA Broad Host Perm) ---")
    print(f"  Rentan SEE (MV3 saja)      : {see_vulnerable}")
    print(f"  Rentan SEE (MV2 saja)      : {see_vulnerable_mv2}")
    print(f"  Rentan SEE (Semua MV)      : {see_all}")
    print(f"  TIDAK rentan SEE           : {len(ext_dirs) - see_all - no_manifest}")
    
    # Breakdown yang TIDAK rentan
    no_cs = len(ext_dirs) - no_manifest - has_cs
    cs_but_broad = has_cs - see_all
    print(f"\n  --- ALASAN TIDAK RENTAN ---")
    print(f"  Tidak punya Content Script : {no_cs}")
    print(f"  Punya CS tapi Broad HP     : {cs_but_broad} (bukan stealth)")
    print(f"  Tanpa manifest             : {no_manifest}")
    
    # Save CSV
    fieldnames = ["extension_id", "name", "status", "manifest_version", 
                  "has_content_scripts", "has_broad_host_perms", "has_background",
                  "see_vulnerable", "permissions", "host_permissions", "cs_matches"]
    
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    
    print(f"\n  CSV tersimpan: {OUTPUT_CSV}")
    
    # Print sample of SEE-vulnerable ones
    see_exts = [r for r in results if r["see_vulnerable"]]
    if see_exts:
        print(f"\n{'='*65}")
        print(f"  CONTOH EKSTENSI RENTAN SEE (5 pertama)")
        print(f"{'='*65}")
        for r in see_exts[:5]:
            print(f"\n  ID   : {r['extension_id']}")
            print(f"  Nama : {r['name']}")
            print(f"  MV   : {r['manifest_version']}")
            print(f"  CS   : {r['cs_matches']}")
            print(f"  Perms: {r['permissions'][:100]}")

if __name__ == "__main__":
    main()
