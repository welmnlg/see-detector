import io
import sys
from curl_cffi import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("Menguji akses dengan curl_cffi (Chrome impersonation)...")

url = "https://chrome-stats.com/d/fkhhachafhebmohpmjlocpdlmffplnpf"

COOKIES = {
    "auth": "s%3Av2%3Af15ac02b-a39d-4144-a37e-624bae7df902.teKDJl4lIHtrt%2FOC5Z1p%2BgYBqgOv1BFRh%2Fj42N09f1k",
    "cf_clearance": "4_vjhthNw5LozN0kB6zKxHW6__3OCKyiYK0PTcj4.HM-1780464699-1.2.1.1-dPr4CqlwHAnSmNywn4FxtAoFCDyWnpryr7UVDEsS7R4.m4V7axkxOkH8MRyIWv_PZ8h.uZbsCBNiM.MucKW8H6w5m1n4o0vgUA85UXR1IzHWexUUBD4CIgn2dDDdTYxpunUYXrfA27V4Y1uPxdqG5C_tFn.pO53pq0lrZ6DdTnUxPKDvmXMEnT3fDR.lh7qQSpIIc6B6SQrybu8iwH55odz5yuHJ9pEIqkPlTmeBqBSXKq3u30RAa7F6308ISwhJnMCUG5EP2A.Q7MLGg75usip3IAYb4HiTzXVr_2wXhjedbsLr05ntHgCPyq4vHSxffegBK.ctj1LBa1c9YIJ_XaeJfXDOpEVd3KX1YqsyrojPwLjUs6b3nAQDUQ8u3opXcPMPCzaN3mplTd_byr8j31b2c1BpyhCMKEcm_dthYUI",
    "_ga": "GA1.1.1645539605.1766504830",
}

try:
    # Gunakan impersonate='chrome' agar TLS fingerprint persis seperti Google Chrome asli
    # dan kirimkan cookies yang sudah di-solve
    r = requests.get(url, impersonate="chrome120", cookies=COOKIES, timeout=30)
    
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        if "Just a moment..." in r.text:
            print("Gagal: Masih terkena Cloudflare challenge.")
        else:
            print("Berhasil! Halaman berhasil dimuat tanpa blokir Cloudflare.")
    else:
        print(f"Gagal dengan status {r.status_code}")
except Exception as e:
    print(f"Error: {e}")
