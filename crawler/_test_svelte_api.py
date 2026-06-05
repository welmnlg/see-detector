import os
import sys
import json
import requests
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cookies yang Anda berikan sebelumnya
COOKIES = {
    "auth": "s%3Av2%3Af15ac02b-a39d-4144-a37e-624bae7df902.teKDJl4lIHtrt%2FOC5Z1p%2BgYBqgOv1BFRh%2Fj42N09f1k",
    "cf_clearance": "4_vjhthNw5LozN0kB6zKxHW6__3OCKyiYK0PTcj4.HM-1780464699-1.2.1.1-dPr4CqlwHAnSmNywn4FxtAoFCDyWnpryr7UVDEsS7R4.m4V7axkxOkH8MRyIWv_PZ8h.uZbsCBNiM.MucKW8H6w5m1n4o0vgUA85UXR1IzHWexUUBD4CIgn2dDDdTYxpunUYXrfA27V4Y1uPxdqG5C_tFn.pO53pq0lrZ6DdTnUxPKDvmXMEnT3fDR.lh7qQSpIIc6B6SQrybu8iwH55odz5yuHJ9pEIqkPlTmeBqBSXKq3u30RAa7F6308ISwhJnMCUG5EP2A.Q7MLGg75usip3IAYb4HiTzXVr_2wXhjedbsLr05ntHgCPyq4vHSxffegBK.ctj1LBa1c9YIJ_XaeJfXDOpEVd3KX1YqsyrojPwLjUs6b3nAQDUQ8u3opXcPMPCzaN3mplTd_byr8j31b2c1BpyhCMKEcm_dthYUI",
    "_ga": "GA1.1.1645539605.1766504830",
}

# Header umum agar tidak dikira bot
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://chrome-stats.com/chrome/advanced/extension-search"
}

# Base URL (tanpa parameter page)
BASE_URL = "https://chrome-stats.com/chrome/advanced/extension-search/__data.json?s=userCount&dir=desc&q=eyJvIjoiQU5EIiwiYyI6W3siYyI6Im1hbmlmZXN0Lm1hbmlmZXN0X3ZlcnNpb24iLCJvIjoiPSIsInYiOjN9LHsiYyI6Im1hbmlmZXN0Lmhvc3RfcGVybWlzc2lvbnMiLCJvIjoiTm90IGV4aXN0cyIsInYiOiIifSx7ImMiOiJtYW5pZmVzdC5oYXNfY29udGVudF9zY3JpcHRzIiwibyI6IkV4aXN0cyIsInYiOiIifSx7ImMiOiJyaXNrSW1wYWN0IiwibyI6Ij49IiwidiI6Mn0seyJjIjoib2Jzb2xldGUiLCJvIjoiTm90IGV4aXN0cyIsInYiOiIifSx7ImMiOiJtYW5pZmVzdC5wZXJtaXNzaW9ucyIsIm8iOiJDb250YWlucyIsInYiOiJjbGlwYm9hcmRXcml0ZSJ9XX0&col=name%2CuserCount%2Cauthor%2CratingValue%2CratingCount%2CcreationDate%2CobsoleteReason&x-sveltekit-invalidated=101"

out_dir = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\see\cookies"
os.makedirs(out_dir, exist_ok=True)

print("Mulai mengambil data dari SvelteKit internal endpoint...\n")

for page in [8, 9]:
    url = f"{BASE_URL}&page={page}"
    print(f"[*] Mengambil Halaman {page}...")
    
    try:
        r = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=30)
        
        if r.status_code == 200:
            content = r.text
            
            # Simpan file JSON
            filepath = os.path.join(out_dir, f"page_{page}.json")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Cek validitas
            is_valid = "https://chromewebstore.google.com/detail/" in content
            
            print(f"    [+] Berhasil! Disimpan di: {filepath}")
            print(f"    [?] Terdapat URL Chrome Web Store? : {'YA (Valid)' if is_valid else 'TIDAK (Mungkin Blocked/Limit)'}")
            
            if not is_valid:
                print(f"    [!] Preview Response: {content[:300]}...")
        else:
            print(f"    [-] Gagal HTTP {r.status_code}")
            print(f"    [-] Response: {r.text[:200]}")
            
    except Exception as e:
        print(f"    [-] Error: {e}")

print("\nSelesai!")
