import os
import json
import time
import shutil
import tempfile
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

from .cdp_monitor import CDPMonitor

class DynamicSandbox:
    """
    Dynamic Analysis Sandbox for Chrome Extension SEE Attack Detection.
    
    Uses Playwright to load extensions in a real Chromium browser, simulate
    user behavior matching ALL 6 SEE attack categories, and capture network
    traffic to detect unauthorized data exfiltration.
    
    Simulated scenarios (based on Lim et al. 2025, Listings 2-6):
      1. UProf (User Profiling)  — scroll, click, mouse movement
      2. UReq  (User Request)    — typing into forms, pressing Enter
      3. LF    (Local Files)     — navigate to file:// URL
      4. CE    (Cookie Exfil)    — inject cookies before browsing
      5. HH    (HTTP Hijacking)  — detect page redirects
      6. UDown (Unauthorized DL) — trigger download, monitor interception
    """
    
    def __init__(self, ext_dir):
        self.ext_dir = os.path.abspath(ext_dir)
        self.manifest_path = os.path.join(self.ext_dir, 'manifest.json')
        self.host_permissions = self._get_host_permissions()
        
    def _get_host_permissions(self):
        perms = []
        if not os.path.exists(self.manifest_path):
            return perms
        try:
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
                
            # Both V2 and V3 might have permissions that are actually hosts
            raw_perms = manifest.get('permissions', []) + manifest.get('host_permissions', [])
            for p in raw_perms:
                if isinstance(p, str) and ('://' in p or p == '<all_urls>'):
                    perms.append(p)
        except Exception:
            pass
        return perms

    def _is_unauthorized_domain(self, domain):
        if "<all_urls>" in self.host_permissions:
            return False
            
        for perm in self.host_permissions:
            perm_domain = urlparse(perm).netloc
            if perm_domain and (domain == perm_domain or (perm_domain.startswith("*.") and domain.endswith(perm_domain[2:]))):
                return False
        return True

    def _is_valid_extension(self):
        """Pre-check to prevent Chrome from showing 'Failed to load extension' popup."""
        if not os.path.exists(self.manifest_path):
            return False
        # If manifest is completely empty or missing, skip
        if os.path.getsize(self.manifest_path) < 2:
            return False
        return True

    def run_analysis(self, target_urls=None):
        """
        Runs the full dynamic analysis pipeline on the extension.
        """
        # 1. PRE-CHECK: Skip if extension structure is invalid
        if not self._is_valid_extension():
            print(f"Skipping {self.ext_dir}: Invalid or missing manifest.json")
            return {
                'outbound_request_count': 0, 'unauthorized_domain_count': 0,
                'sends_user_data': False, 'has_periodic_sync': False,
                'is_sw_initiated': False, 'is_cs_initiated': False,
                'see_behavior_detected': False, 'cookies_stolen': False,
                'redirect_detected': False, 'download_hijacked': False,
                'captured_requests': []
            }
            
        if target_urls is None:
            target_urls = [
                "https://example.com", 
                "https://en.wikipedia.org/wiki/Main_Page",
                "https://news.ycombinator.com"
            ]
            
        user_data_dir = tempfile.mkdtemp()
        
        dynamic_features = {
            'outbound_request_count': 0, 'unauthorized_domain_count': 0,
            'sends_user_data': False, 'has_periodic_sync': False,
            'is_sw_initiated': False, 'is_cs_initiated': False,
            'see_behavior_detected': False, 'cookies_stolen': False,
            'redirect_detected': False, 'download_hijacked': False,
            'captured_requests': []
        }
        
        try:
            with sync_playwright() as p:
                # Launch Chromium with extension loaded
                # Added timeout=15000 to prevent infinite hang if OS dialogue popup appears
                context = p.chromium.launch_persistent_context(
                    user_data_dir,
                    headless=False,
                    timeout=15000,
                    args=[
                        f"--disable-extensions-except={self.ext_dir}",
                        f"--load-extension={self.ext_dir}",
                        "--no-first-run",
                        "--no-default-browser-check",
                        "--suppress-message-center-popups"
                    ],
                )
                
                # Automatically dismiss any browser-level alert dialogs
                context.on("dialog", lambda dialog: dialog.accept())
                
                # Wait for extension to load
                time.sleep(2) 
                extension_id = None
                
                if context.service_workers:
                    sw = context.service_workers[0]
                    extension_id = sw.url.split("/")[2]
                elif context.background_pages:
                    bg = context.background_pages[0]
                    extension_id = bg.url.split("/")[2]
                    
                # Open a page
                page = context.new_page()
                
                # ===========================================================
                # NETWORK INTERCEPTION (captures ALL extension traffic)
                # ===========================================================
                all_requests = []
                request_timestamps = []  # For periodic sync detection
                
                def handle_request(req):
                    is_sw = False
                    frame_url = None
                    is_cs = False
                    try:
                        frame = req.frame
                        if frame:
                            frame_url = frame.url
                            # Content script requests come from the page's frame
                            # but are initiated by extension code
                            if frame_url and not frame_url.startswith('chrome-extension://'):
                                is_cs = True
                    except Exception:
                        is_sw = True  # SW requests throw frame error
                        
                    url = req.url
                    if url.startswith("data:") or url.startswith("chrome-extension://"):
                        return
                    
                    # Safe post_data extraction (handles binary data)
                    post_data = None
                    try:
                        post_data = req.post_data
                    except Exception:
                        try:
                            post_data = str(req.post_data_buffer)
                        except Exception:
                            post_data = "[binary data]"
                        
                    req_data = {
                        "url": url,
                        "method": req.method,
                        "domain": urlparse(url).netloc,
                        "post_data": post_data,
                        "is_sw_initiated": is_sw,
                        "is_cs_initiated": is_cs,
                        "frame_url": frame_url,
                        "timestamp": time.time()
                    }
                    all_requests.append(req_data)
                    request_timestamps.append(time.time())
                    
                context.on("request", handle_request)
                
                # ===========================================================
                # SCENARIO 6: DOWNLOAD MONITORING (UDown - Listing 6)
                # Monitor if extension intercepts/replaces downloads
                # ===========================================================
                download_events = []
                
                def handle_download(download):
                    download_events.append({
                        "url": download.url,
                        "suggested_filename": download.suggested_filename,
                        "timestamp": time.time()
                    })
                    download.cancel()  # Don't actually save files
                    
                page.on("download", handle_download)
                
                # ===========================================================
                # SCENARIO 4: COOKIE INJECTION (CE - Listing 4)
                # Inject dummy cookies BEFORE browsing so cookie-stealing
                # extensions have data to exfiltrate
                # ===========================================================
                try:
                    context.add_cookies([
                        {
                            "name": "session_id",
                            "value": "DUMMY_SESSION_abc123",
                            "domain": ".example.com",
                            "path": "/"
                        },
                        {
                            "name": "auth_token",
                            "value": "DUMMY_TOKEN_xyz789",
                            "domain": ".example.com",
                            "path": "/"
                        },
                        {
                            "name": "user_prefs",
                            "value": "lang=en&theme=dark",
                            "domain": ".wikipedia.org",
                            "path": "/"
                        }
                    ])
                except Exception as e:
                    print(f"Cookie injection warning: {e}")
                
                # ===========================================================
                # MAIN BROWSING LOOP
                # ===========================================================
                for url in target_urls:
                    try:
                        page.goto(url, wait_until="load", timeout=30000)
                        navigated_url = page.url  # Store for redirect detection
                        
                        # -------------------------------------------------------
                        # SCENARIO 1: SCROLL & CLICK (UProf - Listing 2a)
                        # -------------------------------------------------------
                        page.evaluate("window.scrollBy(0, 1000)")
                        time.sleep(0.5)
                        page.evaluate("window.scrollBy(0, -500)")
                        time.sleep(0.5)
                        
                        # Simulate mouse movement (triggers mousemove listeners)
                        try:
                            page.mouse.move(100, 200)
                            page.mouse.move(300, 400)
                        except Exception:
                            pass
                        
                        # Random clicks on page elements
                        try:
                            page.evaluate("""() => {
                                const elements = document.querySelectorAll('p, div, a, button, span, h1, h2, h3');
                                if(elements.length > 0) {
                                    for(let i = 0; i < Math.min(3, elements.length); i++) {
                                        const idx = Math.floor(Math.random() * elements.length);
                                        const el = elements[idx];
                                        el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
                                    }
                                }
                            }""")
                        except Exception:
                            pass
                            
                        # -------------------------------------------------------
                        # SCENARIO 2: KEYBOARD & FORMS (UReq - Keylogging)
                        # -------------------------------------------------------
                        try:
                            inputs = page.locator(
                                "input[type='text'], input[type='password'], "
                                "input[type='search'], input[type='email'], textarea"
                            ).all()
                            if inputs:
                                inputs[0].fill("test_dynamic_analysis_input", timeout=2000)
                                inputs[0].press("Enter", timeout=2000)
                        except Exception:
                            pass
                        
                        # Simulate keyboard events on the page body (keyloggers)
                        try:
                            page.evaluate("""() => {
                                const keys = ['a', 'b', 'c', 'Enter', 'Tab'];
                                keys.forEach(key => {
                                    document.dispatchEvent(new KeyboardEvent('keydown', {key: key, bubbles: true}));
                                    document.dispatchEvent(new KeyboardEvent('keyup', {key: key, bubbles: true}));
                                });
                            }""")
                        except Exception:
                            pass
                            
                        # -------------------------------------------------------
                        # SCENARIO 3: TRIGGER DOWNLOAD (UDown - Listing 6)
                        # -------------------------------------------------------
                        try:
                            page.evaluate("""() => {
                                const a = document.createElement('a');
                                a.href = 'data:text/plain;charset=utf-8,TestDownloadContent';
                                a.download = 'test_document.txt';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }""")
                        except Exception:
                            pass
                            
                        # -------------------------------------------------------
                        # SCENARIO 5: REDIRECT DETECTION (HH - Listing 5)
                        # Compare current URL with intended URL
                        # -------------------------------------------------------
                        time.sleep(2)  # Wait for potential redirects
                        current_url = page.url
                        intended_domain = urlparse(url).netloc
                        current_domain = urlparse(current_url).netloc
                        
                        if intended_domain and current_domain:
                            if intended_domain != current_domain:
                                dynamic_features['redirect_detected'] = True
                        
                        # Wait for SEE exfiltration (extensions use timers)
                        time.sleep(14) 
                        
                    except Exception as e:
                        print(f"Error navigating to {url}: {e}")
                        
                # ===========================================================
                # SCENARIO 3: LOCAL FILES (LF - Listing 3)
                # Navigate to a local HTML file to trigger file:// extensions
                # ===========================================================
                try:
                    fd, temp_path = tempfile.mkstemp(suffix=".html")
                    with os.fdopen(fd, 'w') as f:
                        f.write("<html><body><h1>Local File Test</h1>"
                                "<p>This is a local file for SEE testing.</p>"
                                "</body></html>")
                        
                    temp_path_fwd = temp_path.replace('\\', '/')
                    local_url = "file:///" + temp_path_fwd
                    page.goto(local_url, wait_until="load", timeout=10000)
                    time.sleep(5)
                    
                    # Clean up temp file
                    try:
                        os.unlink(temp_path)
                    except Exception:
                        pass
                except Exception as e:
                    print(f"Error testing local file: {e}")
                
                context.close()
                
                # ===========================================================
                # ANALYSIS OF CAPTURED DATA
                # ===========================================================
                
                # Filter extension-initiated requests (from Service Worker)
                ext_requests = [r for r in all_requests if r["is_sw_initiated"]]
                dynamic_features['outbound_request_count'] = len(ext_requests)
                
                # Also count content-script initiated requests
                cs_requests = [r for r in all_requests if r["is_cs_initiated"]]
                
                unauthorized_domains = set()
                
                for req in ext_requests:
                    domain = req['domain']
                    dynamic_features['captured_requests'].append(req)
                    dynamic_features['is_sw_initiated'] = True
                        
                    if self._is_unauthorized_domain(domain):
                        unauthorized_domains.add(domain)
                        
                    post_data = req.get('post_data') or ''
                    if isinstance(post_data, str):
                        post_lower = post_data.lower()
                        # Check for user interaction data keywords
                        if any(k in post_lower for k in [
                            'scroll', 'click', 'url', 'href', 'title', 'mouse',
                            'keydown', 'keypress', 'navigation', 'cookie',
                            'session', 'token', 'password', 'input',
                            'collectclick', 'collectscroll'
                        ]):
                            dynamic_features['sends_user_data'] = True
                            
                        # Check for cookie data in exfiltrated payload
                        if any(k in post_lower for k in [
                            'session_id', 'auth_token', 'dummy_session',
                            'dummy_token', 'cookie', 'document.cookie'
                        ]):
                            dynamic_features['cookies_stolen'] = True
                            
                for req in cs_requests:
                    dynamic_features['is_cs_initiated'] = True
                    domain = req['domain']
                    if self._is_unauthorized_domain(domain):
                        unauthorized_domains.add(domain)
                    
                dynamic_features['unauthorized_domain_count'] = len(unauthorized_domains)
                
                # Detect periodic sync pattern (multiple requests at regular intervals)
                if len(request_timestamps) >= 3:
                    # Check if requests are evenly spaced (within 2s tolerance)
                    intervals = [request_timestamps[i+1] - request_timestamps[i] 
                                for i in range(len(request_timestamps)-1)]
                    if len(intervals) >= 2:
                        avg_interval = sum(intervals) / len(intervals)
                        if avg_interval > 1.0:  # At least 1 second apart
                            variance = sum((i - avg_interval)**2 for i in intervals) / len(intervals)
                            if variance < 4.0:  # Low variance = periodic
                                dynamic_features['has_periodic_sync'] = True
                
                # Check download hijacking
                if len(download_events) > 1:
                    # If extension triggered additional downloads beyond our test
                    dynamic_features['download_hijacked'] = True
                
                # Strong SEE Detection Logic
                if dynamic_features['unauthorized_domain_count'] > 0 and (
                    dynamic_features['is_sw_initiated'] or dynamic_features['is_cs_initiated']
                ):
                    dynamic_features['see_behavior_detected'] = True
                    
                # Also flag if cookies were stolen
                if dynamic_features['cookies_stolen']:
                    dynamic_features['see_behavior_detected'] = True
                    
                # Also flag if redirect was detected
                if dynamic_features['redirect_detected']:
                    dynamic_features['see_behavior_detected'] = True
                    
        finally:
            try:
                shutil.rmtree(user_data_dir, ignore_errors=True)
            except Exception:
                pass
                
        return dynamic_features

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        ext_path = sys.argv[1]
        print(f"Running dynamic analysis on {ext_path}...")
        sandbox = DynamicSandbox(ext_path)
        results = sandbox.run_analysis()
        # Print without captured_requests for readability
        display = {k: v for k, v in results.items() if k != 'captured_requests'}
        print(json.dumps(display, indent=2))
        print(f"\nTotal captured requests: {len(results['captured_requests'])}")
    else:
        print("Usage: python sandbox_runner.py <path_to_unpacked_extension>")
