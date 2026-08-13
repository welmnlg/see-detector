import os
import json
import shutil

ROOT = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector"
DATASET_RENTAN = os.path.join(ROOT, "data", "dataset", "rentan_see")
DATASET_AMAN = os.path.join(ROOT, "data", "dataset", "aman_see")

# Target Rentan
RENTAN_TARGETS = [
    "cnmbailpgmdagpofalkeoeooefdkjfdl__Wallet_Highlighter_Crypto",
    "godbhdaglfpokldmpchpidnbmlojkbga__BonsaiDash",
    "dnneokphfalflgkbijimhkhnfdnbiknh__Chill",
    "hmccfhejfgfjkmmmmhmlnhkoidinlaab__JustDone_AI_Writing_Assistant",
    "hpmbkijccnhmgigogmjfifhannhbmfkm__WeScrape",
    "okfhhlbflgmnjaenclbikcgbieenpmmb__Ascendion_VisitE"
]

EXTRACTED_DIR = os.path.join(ROOT, "Testing", "extracted_extensions")

def prepare_rentan():
    os.makedirs(DATASET_RENTAN, exist_ok=True)
    count = 0
    for target in RENTAN_TARGETS:
        src = os.path.join(EXTRACTED_DIR, target)
        dst = os.path.join(DATASET_RENTAN, target)
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copytree(src, dst)
            count += 1
        elif os.path.exists(dst):
            count += 1
            
    # Copy PoCs
    for ver in ["v4", "v5", "v6"]:
        poc_dir = os.path.join(ROOT, "..", f"see-poc-{ver}")
        if os.path.exists(poc_dir):
            for item in os.listdir(poc_dir):
                if item.startswith("poc") and os.path.isdir(os.path.join(poc_dir, item)):
                    dst = os.path.join(DATASET_RENTAN, f"{ver}_{item}")
                    if not os.path.exists(dst):
                        shutil.copytree(os.path.join(poc_dir, item), dst)
                    count += 1
    print(f"[+] Total Ekstensi Rentan (Public + PoC) disiapkan: {count}")

def filter_aman():
    aman_source = os.path.join(ROOT, "data", "extracted", "aman")
    safe_candidates = []
    
    for item in os.listdir(aman_source):
        item_path = os.path.join(aman_source, item)
        if not os.path.isdir(item_path): continue
        
        manifest_path = os.path.join(item_path, "manifest.json")
        if not os.path.exists(manifest_path): continue
            
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
        except:
            continue
            
        # Check holistic content script
        has_holistic_cs = False
        if "content_scripts" in manifest:
            for cs in manifest["content_scripts"]:
                for match in cs.get("matches", []):
                    if match in ["<all_urls>", "*://*/*", "http://*/*", "https://*/*"]:
                        has_holistic_cs = True
                        break
                        
        if not has_holistic_cs: continue
        
        # Check host permissions (must be NONE or just the same wildcard)
        host_perms = manifest.get("host_permissions", [])
        if "permissions" in manifest and isinstance(manifest["permissions"], list):
            host_perms.extend([p for p in manifest["permissions"] if "://" in p or "<all_urls>" in p])
            
        # Filter out if they have specific external domains
        suspicious_hosts = [h for h in host_perms if h not in ["<all_urls>", "*://*/*", "http://*/*", "https://*/*"]]
        
        if len(suspicious_hosts) == 0:
            safe_candidates.append(item)

    print(f"\n[+] Ditemukan {len(safe_candidates)} Ekstensi Aman dengan Content Script Holistik tanpa External Host Permission:")
    for idx, c in enumerate(safe_candidates[:10], 1): # Show top 10
        print(f"  {idx}. {c}")

if __name__ == "__main__":
    prepare_rentan()
    filter_aman()
