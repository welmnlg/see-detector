#!/usr/bin/env python3
"""
setup_test_profile.py — Membuat Browser Profile untuk Dynamic Analysis
========================================================================
Script ini membuka browser Chrome/Chromium secara MANUAL agar kamu bisa:
1. Login ke akun-akun testing (Gmail, LinkedIn, Binance, dll)
2. Menyelesaikan Captcha/Cloudflare secara manual
3. Menyimpan semua cookies dan session ke sebuah profile permanen

Profile ini nantinya akan digunakan oleh network_logger_v2.py untuk
menjalankan pengujian dinamis dengan lingkungan yang lebih realistis
(anti-sandbox).

Usage:
    python setup_test_profile.py
"""

import os
import sys
import time

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERROR: Playwright belum terinstall.")
    print("Jalankan: pip install playwright && playwright install chromium")
    sys.exit(1)

PROFILE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "test_browser_profile"
)

SITES_TO_LOGIN = [
    ("Google/Gmail", "https://accounts.google.com/signin"),
    ("LinkedIn", "https://www.linkedin.com/login"),
    ("Facebook", "https://www.facebook.com/login"),
    ("Binance", "https://www.binance.com/en/login"),
    ("Amazon", "https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F"),
    ("TikTok", "https://www.tiktok.com/login"),
]


def main():
    os.makedirs(PROFILE_DIR, exist_ok=True)

    print("=" * 65)
    print("  SETUP BROWSER PROFILE UNTUK DYNAMIC ANALYSIS")
    print("=" * 65)
    print(f"\n  Profile akan disimpan di:")
    print(f"  {PROFILE_DIR}")
    print(f"\n  Situs yang perlu kamu login:")
    for i, (name, url) in enumerate(SITES_TO_LOGIN, 1):
        print(f"    {i}. {name}: {url}")

    print(f"\n  INSTRUKSI:")
    print(f"  1. Browser Chromium akan terbuka secara otomatis.")
    print(f"  2. Silakan LOGIN ke setiap akun testing kamu SATU PER SATU.")
    print(f"  3. Kamu juga boleh browsing normal (buka YouTube, Google, dll)")
    print(f"     agar browser memiliki history yang realistis.")
    print(f"  4. Setelah selesai, TUTUP BROWSER atau tekan Ctrl+C di terminal.")
    print(f"  5. Semua cookies dan session akan tersimpan otomatis.")
    print(f"\n  PENTING: Gunakan akun TESTING, bukan akun pribadi!")
    print("=" * 65)

    input("\n  Tekan ENTER untuk membuka browser...")

    with sync_playwright() as pw:
        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False,
            channel="chrome",  # Gunakan Chrome asli jika tersedia
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-first-run",
                "--no-default-browser-check",
            ],
            ignore_default_args=["--enable-automation"],
            viewport={"width": 1366, "height": 768},
        )

        # Buka tab untuk setiap situs login
        for name, url in SITES_TO_LOGIN:
            try:
                page = context.new_page()
                page.goto(url, timeout=30000)
                print(f"  [TAB] Membuka {name}...")
            except Exception as e:
                print(f"  [WARN] Gagal membuka {name}: {e}")

        print("\n  Browser sudah terbuka dengan semua tab login.")
        print("  Silakan login ke akun-akun testing kamu.")
        print("  Setelah selesai, TUTUP BROWSER untuk menyimpan profile.\n")

        # Tunggu sampai browser ditutup oleh user
        try:
            while True:
                # Cek apakah browser masih hidup
                try:
                    _ = context.pages
                    time.sleep(2)
                except Exception:
                    break
        except KeyboardInterrupt:
            print("\n  Dihentikan oleh user.")

        try:
            context.close()
        except Exception:
            pass

    print("\n" + "=" * 65)
    print("  PROFILE TERSIMPAN!")
    print(f"  Lokasi: {PROFILE_DIR}")
    print(f"\n  Profile ini akan digunakan oleh network_logger_v2.py")
    print(f"  dengan flag: --profile \"{PROFILE_DIR}\"")
    print("=" * 65)


if __name__ == "__main__":
    main()
