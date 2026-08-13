import os
import json
import time
from playwright.sync_api import sync_playwright

ext_id = "illemhbijpiebjfilfmgebahaakajkpe"
cookies_file = "chrome_stats_cookies.json"

print(f"Testing Chrome-Stats download for {ext_id} using Playwright...")

with open(cookies_file, "r") as f:
    cookies = json.load(f)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=False)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    context.add_cookies(cookies)
    
    page = context.new_page()
    
    # Go to the extension details page to trigger Cloudflare clearance if needed
    print(f"Navigating to https://chrome-stats.com/d/{ext_id} ...")
    try:
        page.goto(f"https://chrome-stats.com/d/{ext_id}", timeout=15000)
        page.wait_for_load_state("networkidle", timeout=10000)
    except Exception as e:
        print(f"Navigation error (might just be timeout): {e}")

    # Give a few seconds to see if Cloudflare challenge appears
    time.sleep(5)
    
    # Try to grab the version from the page
    version = ""
    try:
        # Looking for the version text. Usually it's in a specific element on the page.
        # We can just extract all text and look for it, or use the API directly now that CF is cleared.
        pass
    except Exception:
        pass

    # Now let's try the API endpoint with Playwright (which shares the context/cookies)
    print("Fetching API...")
    api_response = page.request.get(f"https://chrome-stats.com/api/ext?id={ext_id}")
    if api_response.ok:
        data = api_response.json()
        version = data.get("version")
        print(f"API Success! Version: {version}")
        
        # Now trigger download
        dl_url = f"https://chrome-stats.com/api/download-link?id={ext_id}&type=CRX&version={version}&versionCode={version}"
        print(f"Requesting download link: {dl_url}")
        dl_resp = page.request.get(dl_url)
        if dl_resp.ok:
            try:
                dl_data = dl_resp.json()
                print("Download Link Data:")
                print(json.dumps(dl_data, indent=2))
                
                # If there's a URL in the response, we can download the actual file
                actual_url = dl_data.get("url")
                if actual_url:
                    print("Attempting to download CRX...")
                    # Playwright expects to handle downloads via the page, but we can also just use page.request.get
                    crx_resp = page.request.get(actual_url)
                    if crx_resp.ok:
                        os.makedirs("test_downloads", exist_ok=True)
                        filepath = os.path.join("test_downloads", f"{ext_id}.crx")
                        with open(filepath, "wb") as f:
                            f.write(crx_resp.body())
                        print(f"SUCCESS! Saved to {filepath}")
                    else:
                        print("Failed to download CRX file.")
            except Exception as e:
                print(f"Failed to parse download link JSON: {e}")
                print(dl_resp.text()[:200])
        else:
            print(f"Download Link API Failed: {dl_resp.status}")
    else:
        print(f"API Failed: {api_response.status}")
        print("We might still be blocked by Cloudflare.")
        page.screenshot(path="cloudflare_block.png")
        print("Saved screenshot to cloudflare_block.png")

    time.sleep(3)
    browser.close()
