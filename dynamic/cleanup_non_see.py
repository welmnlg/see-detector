#!/usr/bin/env python3
"""
cleanup_non_see.py — Hapus ekstensi yang TIDAK memenuhi kriteria rentan SEE
============================================================================
Kriteria SEE (Stealth Extension Exfiltration):
  1. WAJIB Manifest V3
  2. WAJIB punya content_scripts
  3. TIDAK BOLEH punya broad host_permissions (<all_urls>, *://*/* dll)
     → Jika punya, browser sudah beri peringatan ke user (bukan stealth)

Ekstensi yang TIDAK memenuhi ketiga kriteria di atas akan DIHAPUS dari folder.

Usage:
    python cleanup_non_see.py                    # Dry run (preview only)
    python cleanup_non_see.py --confirm          # Hapus beneran
"""

import os
import json
import shutil
import argparse

TARGET_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\malware_chrome_stats"

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

def check_see_criteria(manifest):
    """Return (is_see, reason_if_not)"""
    if manifest is None:
        return False, "NO_MANIFEST"
    
    mv = manifest.get("manifest_version", 0)
    if mv != 3:
        return False, f"MV{mv}_BUKAN_MV3"
    
    # Cek content_scripts
    cs = manifest.get("content_scripts", [])
    if len(cs) == 0:
        return False, "TIDAK_ADA_CONTENT_SCRIPT"
    
    # Cek broad host permissions
    host_perms = manifest.get("host_permissions", [])
    perms = manifest.get("permissions", [])
    opt_host = manifest.get("optional_host_permissions", [])
    all_perms = host_perms + perms + opt_host
    
    for p in all_perms:
        p_lower = str(p).lower().strip()
        for broad in BROAD_HOST_PATTERNS:
            if p_lower == broad.lower():
                return False, f"BROAD_HOST_PERM:{p}"
    
    return True, "OK"

def main():
    parser = argparse.ArgumentParser(description="Hapus ekstensi non-SEE dari folder")
    parser.add_argument("--confirm", action="store_true", help="Benar-benar hapus (tanpa flag ini = dry run)")
    args = parser.parse_args()
    
    ext_dirs = sorted([
        d for d in os.listdir(TARGET_DIR) 
        if os.path.isdir(os.path.join(TARGET_DIR, d))
    ])
    
    print("=" * 65)
    print("  CLEANUP: Hapus Ekstensi Non-SEE dari malware_chrome_stats")
    print("=" * 65)
    print(f"  Folder : {TARGET_DIR}")
    print(f"  Total  : {len(ext_dirs)} ekstensi")
    print(f"  Mode   : {'[!] HAPUS BENERAN' if args.confirm else '[*] DRY RUN (preview only)'}")
    print("=" * 65)
    
    keep = []
    remove = []
    reasons = {}
    
    for ext_id in ext_dirs:
        ext_path = os.path.join(TARGET_DIR, ext_id)
        manifest = load_manifest(ext_path)
        is_see, reason = check_see_criteria(manifest)
        
        if is_see:
            keep.append(ext_id)
        else:
            remove.append(ext_id)
            reasons[ext_id] = reason
    
    # Ringkasan alasan penghapusan
    reason_counts = {}
    for r in reasons.values():
        key = r.split(":")[0]
        reason_counts[key] = reason_counts.get(key, 0) + 1
    
    print(f"\n  --- HASIL SELEKSI ---")
    print(f"  [v] Lolos SEE (TETAP)    : {len(keep)}")
    print(f"  [x] Tidak lolos (HAPUS)   : {len(remove)}")
    print(f"\n  --- ALASAN PENGHAPUSAN ---")
    for reason, count in sorted(reason_counts.items(), key=lambda x: -x[1]):
        print(f"    {reason}: {count} ekstensi")
    
    # Tampilkan contoh yang akan dihapus
    print(f"\n  --- CONTOH YANG AKAN DIHAPUS (10 pertama) ---")
    for ext_id in remove[:10]:
        manifest = load_manifest(os.path.join(TARGET_DIR, ext_id))
        name = ""
        if manifest:
            name = manifest.get("name", "")[:50]
        print(f"    {ext_id} | {reasons[ext_id]} | {name}")
    
    # Tampilkan contoh yang TETAP
    print(f"\n  --- CONTOH YANG TETAP (5 pertama) ---")
    for ext_id in keep[:5]:
        manifest = load_manifest(os.path.join(TARGET_DIR, ext_id))
        name = manifest.get("name", "")[:50] if manifest else ""
        cs_matches = []
        for cs in manifest.get("content_scripts", []):
            cs_matches.extend(cs.get("matches", []))
        print(f"    {ext_id} | {name}")
        print(f"      CS matches: {cs_matches[:3]}")
    
    if not args.confirm:
        print(f"\n  [!] Ini hanya DRY RUN. Tidak ada yang dihapus.")
        print(f"  Untuk menghapus, jalankan ulang dengan flag --confirm:")
        print(f"    python cleanup_non_see.py --confirm")
        return
    
    # HAPUS BENERAN
    print(f"\n  Menghapus {len(remove)} folder ekstensi...")
    deleted = 0
    errors = 0
    for i, ext_id in enumerate(remove):
        ext_path = os.path.join(TARGET_DIR, ext_id)
        try:
            shutil.rmtree(ext_path)
            deleted += 1
        except Exception as e:
            print(f"    [ERROR] Gagal hapus {ext_id}: {e}")
            errors += 1
        
        if (i + 1) % 50 == 0:
            print(f"    ...{i+1}/{len(remove)} selesai")
    
    remaining = len([d for d in os.listdir(TARGET_DIR) if os.path.isdir(os.path.join(TARGET_DIR, d))])
    
    print(f"\n  {'='*55}")
    print(f"  SELESAI!")
    print(f"  Dihapus : {deleted} ekstensi")
    print(f"  Error   : {errors}")
    print(f"  Tersisa : {remaining} ekstensi (siap analisis statis)")
    print(f"  {'='*55}")

if __name__ == "__main__":
    main()
