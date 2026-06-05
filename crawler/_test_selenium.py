import time
import sys
import io
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("Mempersiapkan Undetected ChromeDriver (Headless)...")

options = uc.ChromeOptions()
options.add_argument('--headless=new')
# options.add_argument('--window-size=1920,1080')

try:
    driver = uc.Chrome(options=options, version_main=148)
    print("Browser terbuka. Mengunjungi Chrome Stats...")
    
    driver.get("https://chrome-stats.com/d/fkhhachafhebmohpmjlocpdlmffplnpf")
    
    # Tunggu sebentar untuk Cloudflare JS challenge selesai
    time.sleep(5)
    
    html = driver.page_source
    
    if "Just a moment..." in html:
        print("Gagal: Masih terblokir Cloudflare di mode Headless.")
    else:
        print("Berhasil menembus Cloudflare!")
        if "Critical" in html:
            print("Kata 'Critical' ditemukan di halaman!")
        else:
            print("Kata 'Critical' TIDAK ditemukan (Ekstensi aman).")
            
    driver.quit()
    
except Exception as e:
    print(f"Error: {e}")
