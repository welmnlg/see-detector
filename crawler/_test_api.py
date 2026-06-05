import os, sys, json, requests, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

API_BASE = "https://chrome-stats.com/api"
API_KEY = "4611d1b1-3ada-4950-8acf-21963f6c892f"

COOKIES = {
    "auth": "s%3Av2%3Af15ac02b-a39d-4144-a37e-624bae7df902.teKDJl4lIHtrt%2FOC5Z1p%2BgYBqgOv1BFRh%2Fj42N09f1k",
    "cf_clearance": "4_vjhthNw5LozN0kB6zKxHW6__3OCKyiYK0PTcj4.HM-1780464699-1.2.1.1-dPr4CqlwHAnSmNywn4FxtAoFCDyWnpryr7UVDEsS7R4.m4V7axkxOkH8MRyIWv_PZ8h.uZbsCBNiM.MucKW8H6w5m1n4o0vgUA85UXR1IzHWexUUBD4CIgn2dDDdTYxpunUYXrfA27V4Y1uPxdqG5C_tFn.pO53pq0lrZ6DdTnUxPKDvmXMEnT3fDR.lh7qQSpIIc6B6SQrybu8iwH55odz5yuHJ9pEIqkPlTmeBqBSXKq3u30RAa7F6308ISwhJnMCUG5EP2A.Q7MLGg75usip3IAYb4HiTzXVr_2wXhjedbsLr05ntHgCPyq4vHSxffegBK.ctj1LBa1c9YIJ_XaeJfXDOpEVd3KX1YqsyrojPwLjUs6b3nAQDUQ8u3opXcPMPCzaN3mplTd_byr8j31b2c1BpyhCMKEcm_dthYUI",
    "_ga": "GA1.1.1645539605.1766504830",
}

ext_id = "jdianbbpnakhcmfkcckaboohfgnngfcc"
version = "5.1.8"

# Test 1: Chrome Stats download with cookies
print("=== CHROME STATS DOWNLOAD WITH COOKIES ===")
for dl_type in ["CRX", "ZIP"]:
    url = f"{API_BASE}/download-link?id={ext_id}&type={dl_type}&version={version}&versionCode={version}"
    r = requests.get(url, headers={"x-api-key": API_KEY}, cookies=COOKIES, timeout=30)
    ct = r.headers.get("content-type", "")
    print(f"\n  {dl_type}: Status={r.status_code} | CT={ct} | Size={len(r.content)}")
    if "json" in ct and len(r.content) < 500:
        resp = r.json()
        print(f"  JSON: {json.dumps(resp)[:400]}")
        # If there's a URL
        for key in ["url", "downloadUrl", "link", "data"]:
            if key in resp and resp[key]:
                print(f"  Found '{key}': {str(resp[key])[:200]}")
                # Try to download from that URL
                file_r = requests.get(resp[key], timeout=60, stream=True)
                print(f"  File download: status={file_r.status_code}, size={len(file_r.content)}")
                if file_r.status_code == 200 and len(file_r.content) > 100:
                    print(f"  Magic bytes: {file_r.content[:4]}")
    elif r.status_code == 200 and len(r.content) > 100:
        print(f"  Got binary! Magic: {r.content[:4]}")

# Test 2: Overview with cookies
print("\n\n=== OVERVIEW WITH COOKIES ===")
r = requests.get(f"https://chrome-stats.com/d/{ext_id}", cookies=COOKIES, timeout=30)
print(f"Status: {r.status_code} | Size: {len(r.content)}")
has_critical = "Critical" in r.text
print(f"Has Critical: {has_critical}")
