#!/usr/bin/env python3
"""
sandbox_runner.py — Dynamic Analysis Sandbox for Chrome Extension SEE Detection
================================================================================
Versi yang diperbaiki untuk Ubuntu VM (VMware) + kompatibel Windows.

Menjalankan 3 skenario pengujian dinamis:
  S1: Download Hijacking — Apakah ekstensi membajak/mengganti unduhan?
  S2: Cookie Theft / Hardware Access — Apakah ekstensi mencuri cookie/akses hardware?
  S3: Traffic Redirect — Apakah ekstensi mengalihkan traffic ke situs pihak ketiga?

Requires:
  pip install playwright flask
  playwright install chromium
  playwright install-deps
"""

import os
import sys
import json
import time
import shutil
import signal
import tempfile
import subprocess
import traceback
from urllib.parse import urlparse
from datetime import datetime

# ---------------------------------------------------------------------------
# Playwright import
# ---------------------------------------------------------------------------
try:
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
except ImportError:
    print("ERROR: playwright belum terinstall. Jalankan: pip install playwright && playwright install chromium")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Konstanta
# ---------------------------------------------------------------------------
TRUSTED_DOMAINS = {
    "google.com", "www.google.com", "googleapis.com", "gstatic.com",
    "chrome.google.com", "chromewebstore.google.com",
    "facebook.com", "www.facebook.com",
    "youtube.com", "www.youtube.com",
    "twitter.com", "x.com",
    "github.com", "stackoverflow.com",
    "wikipedia.org", "en.wikipedia.org",
    "microsoft.com", "login.microsoftonline.com",
    "apple.com", "amazon.com",
    "cloudflare.com", "cdn.jsdelivr.net",
    "unpkg.com", "cdnjs.cloudflare.com",
    "127.0.0.1", "localhost",
}

GAMBLING_PATTERNS = [
    "slot", "casino", "bet", "poker", "judi", "togel",
    "lottery", "jackpot", "spin", "roulette",
]

AD_SUSPICIOUS_PATTERNS = [
    "popads", "propeller", "clickadu", "admaven",
    "trafficjunky", "exoclick", "juicyads",
]

SUSPICIOUS_TLDS = [".xyz", ".top", ".buzz", ".click", ".loan", ".work", ".gdn", ".stream", ".racing", ".win"]

# Constants for Live Honeypot Domains
LIVE_URLS = [
    "https://www.linkedin.com/feed/",
    "https://www.facebook.com/",
    "https://www.tiktok.com/",
    "https://mail.google.com/mail/u/0/"
]
HONEYPOT_URLS = [
    "http://chocoffee.biz.id/",
    "https://the-internet.herokuapp.com/login"
]
TEST_URLS = LIVE_URLS + HONEYPOT_URLS

TEST_DOMAINS = [
    "chocoffee.biz.id",
    "the-internet.herokuapp.com"
]

CANARY_COOKIES = [
    {"name": "session_id", "value": "xyz_canary_session_999", "domain": TEST_DOMAINS[0], "path": "/"},
    {"name": "auth_token", "value": "canary_auth_888", "domain": TEST_DOMAINS[0], "path": "/"},
    {"name": "secure_session", "value": "secure_canary_999", "domain": TEST_DOMAINS[1], "path": "/"},
    {"name": "secure_auth", "value": "secure_auth_888", "domain": TEST_DOMAINS[1], "path": "/"},
    {"name": "csrf_token",  "value": "CANARY_CSRF_i9j0k1l2", "domain": ".wikipedia.org", "path": "/"},
]

CANARY_VALUES = [c["value"] for c in CANARY_COOKIES]


class DynamicSandbox:
    """
    Dynamic Analysis Sandbox — 3 Skenario SEE Attack Detection.
    """

    def __init__(self, ext_dir, timeout_per_scenario=60, executable_path=None, browser_channel=None, browser_label=None):
        self.ext_dir = os.path.abspath(ext_dir)
        self.manifest_path = os.path.join(self.ext_dir, "manifest.json")
        self.manifest = self._load_manifest()
        self.host_permissions = self._get_host_permissions()
        self.timeout = timeout_per_scenario
        self.executable_path = executable_path  # e.g. path to chrome.exe or msedge.exe
        self.browser_channel = browser_channel  # e.g. 'msedge', 'chrome', or None
        self.browser_label = browser_label or "default"  # e.g. 'Chrome 130', 'Edge 128'

    # ── Helpers ────────────────────────────────────────────────────────

    def _load_manifest(self):
        if not os.path.exists(self.manifest_path):
            return {}
        try:
            with open(self.manifest_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _get_host_permissions(self):
        perms = []
        raw = self.manifest.get("permissions", []) + self.manifest.get("host_permissions", [])
        for p in raw:
            if isinstance(p, str) and ("://" in p or p == "<all_urls>"):
                perms.append(p)
        return perms

    def _is_unauthorized_domain(self, domain):
        if not domain:
            return False
        if "<all_urls>" in self.host_permissions:
            return False
        # Strip port
        host = domain.split(":")[0]
        if host in TRUSTED_DOMAINS:
            return False
        for perm in self.host_permissions:
            try:
                perm_host = urlparse(perm).netloc.split(":")[0]
                if perm_host and (host == perm_host or
                                  (perm_host.startswith("*.") and host.endswith(perm_host[1:]))):
                    return False
            except Exception:
                pass
        return True

    def _is_suspicious_domain(self, domain):
        """Check if domain matches gambling/ad/suspicious patterns."""
        d = domain.lower()
        for p in GAMBLING_PATTERNS + AD_SUSPICIOUS_PATTERNS:
            if p in d:
                return True
        for tld in SUSPICIOUS_TLDS:
            if d.endswith(tld):
                return True
        return False

    def _is_valid_extension(self):
        if not os.path.exists(self.manifest_path):
            return False
        if os.path.getsize(self.manifest_path) < 2:
            return False
        if not self.manifest:
            return False
        return True

    def _get_extension_name(self):
        name = self.manifest.get("name", "")
        if name.startswith("__MSG_"):
            name = self.manifest.get("short_name", name)
        return name or os.path.basename(self.ext_dir)

    def _get_extension_id_from_dir(self):
        """Try to extract extension ID from directory name."""
        dirname = os.path.basename(self.ext_dir)
        # Format: "Name__extensionid_vVersion" or just "extensionid"
        parts = dirname.split("__")
        if len(parts) >= 2:
            id_part = parts[-1].split("_v")[0] if "_v" in parts[-1] else parts[-1]
            return id_part
        # Check if dirname itself is a 32-char extension ID
        import re
        if re.match(r'^[a-p]{32}$', dirname):
            return dirname
        return dirname

    # ── Main Analysis ─────────────────────────────────────────────────

    def run_analysis(self):
        """Runs all 3 dynamic analysis scenarios. Returns structured results."""

        if not self._is_valid_extension():
            return self._empty_result("Invalid or missing manifest.json")

        ext_id = self._get_extension_id_from_dir()
        ext_name = self._get_extension_name()

        analysis_start = time.time()

        # Manifest info for report
        manifest_info = {
            "manifest_version": self.manifest.get("manifest_version", "?"),
            "permissions": self.manifest.get("permissions", []),
            "host_permissions": self.manifest.get("host_permissions", []),
            "content_scripts": [
                {"matches": cs.get("matches", []), "js": cs.get("js", [])}
                for cs in self.manifest.get("content_scripts", [])
            ],
            "has_service_worker": bool(self.manifest.get("background", {}).get("service_worker")),
        }

        result = {
            "extension_id": ext_id,
            "extension_name": ext_name,
            "extension_dir": os.path.basename(self.ext_dir),
            "browser_version": self.browser_label,
            "analyzed_at": datetime.now().isoformat(),
            "manifest_info": manifest_info,

            # Global network capture
            "total_outbound_requests": 0,
            "unauthorized_domains": [],
            "suspicious_domains": [],

            # Scenario 1: Download Hijacking
            "s1_download_hijack": False,
            "s1_extra_downloads": 0,
            "s1_evidence": [],

            # Scenario 2: Cookie Theft / Hardware Access
            "s2_cookie_theft": False,
            "s2_canary_found_in_traffic": [],
            "s2_hardware_access": False,
            "s2_evidence": [],

            # Scenario 3: Traffic Redirect
            "s3_traffic_redirect": False,
            "s3_unexpected_navigations": [],
            "s3_injected_elements": 0,
            "s3_evidence": [],

            # Overall
            "see_behavior_detected": False,
            "error": "",

            # ── DETAILED LOGS (untuk analisis manual) ──
            "captured_requests": [],      # Semua network request yang ditangkap
            "console_logs": [],           # Console messages dari browser
            "download_events": [],        # Semua download events
            "scenario_timeline": [],      # Timeline per skenario (start/end/duration)
            "analysis_duration_sec": 0,   # Total durasi analisis
        }

        base_profile = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_browser_profile")
        user_data_dir = tempfile.mkdtemp(prefix="see_sandbox_")
        
        if os.path.exists(base_profile):
            try:
                # Copy everything from base_profile to user_data_dir to inherit cookies/logins
                shutil.rmtree(user_data_dir)
                # Ignore large cache folders to prevent slow startup times with 6 workers (Disk I/O bottleneck)
                ignore_patterns = shutil.ignore_patterns(
                    "Cache", "Code Cache", "GPUCache", "CacheStorage", "DawnCache", 
                    "Network Action Predictor", "OptimizationGuidePredictorModels"
                )
                shutil.copytree(base_profile, user_data_dir, ignore=ignore_patterns)
            except Exception as e:
                pass

        all_requests = []
        download_events = []

        try:
            with sync_playwright() as p:
                # Build launch kwargs — support custom executable_path / channel
                launch_kwargs = {
                    "headless": False,
                    "timeout": 20000,
                    "args": [
                        f"--disable-extensions-except={self.ext_dir}",
                        f"--load-extension={self.ext_dir}",
                        "--no-first-run",
                        "--no-default-browser-check",
                        "--disable-popup-blocking",
                        "--suppress-message-center-popups",
                        "--disable-component-update",
                        "--disable-background-networking",
                        "--disable-features=PrivateNetworkAccessPermissionPrompt,BlockInsecurePrivateNetworkRequests",
                    ],
                    "ignore_default_args": ["--enable-automation"],
                }
                if self.executable_path:
                    launch_kwargs["executable_path"] = self.executable_path
                elif self.browser_channel:
                    launch_kwargs["channel"] = self.browser_channel

                # Launch Chromium/Edge with extension
                context = p.chromium.launch_persistent_context(
                    user_data_dir,
                    **launch_kwargs,
                )

                # Auto-dismiss dialogs
                context.on("dialog", lambda d: d.accept())

                # Track extension-initiated URLs via CDP
                ext_initiated_urls = set()

                def attach_cdp_to_page(p):
                    try:
                        cdp = p.context.new_cdp_session(p)
                        cdp.send("Network.enable")
                        cdp.send("Debugger.enable")
                        cdp.send("Debugger.setAsyncCallStackDepth", {"maxDepth": 32})
                        
                        def on_req_will_be_sent(event):
                            try:
                                url = event.get("request", {}).get("url")
                                initiator = event.get("initiator", {})
                                is_ext = False
                                
                                # Check call stack
                                stack = initiator.get("stack", {})
                                while stack:
                                    for f in stack.get("callFrames", []):
                                        if "chrome-extension://" in f.get("url", ""):
                                            is_ext = True
                                            break
                                    if is_ext:
                                        break
                                    stack = stack.get("parent", {})
                                
                                # Check fallback initiator url
                                if not is_ext and initiator.get("type") == "script":
                                    if "chrome-extension://" in initiator.get("url", ""):
                                        is_ext = True
                                        
                                if is_ext and url:
                                    ext_initiated_urls.add(url)
                            except Exception:
                                pass

                        cdp.on("Network.requestWillBeSent", on_req_will_be_sent)
                    except Exception as e:
                        pass

                # Global request capture (detailed)
                def on_request(req):
                    url = req.url
                    if url.startswith("data:") or url.startswith("chrome://"):
                        return

                    # Capture chrome-extension:// requests too for logging
                    is_ext_internal = url.startswith("chrome-extension://")

                    post_data = None
                    try:
                        post_data = req.post_data
                    except Exception:
                        try:
                            raw = req.post_data_buffer
                            post_data = raw.decode("utf-8", errors="replace") if raw else None
                        except Exception:
                            post_data = "[binary]"

                    is_sw = False
                    is_cs = False
                    frame_url = None
                    try:
                        frame = req.frame
                        if frame:
                            frame_url = frame.url
                            # A request is from a content script if the CDP captured it as extension-initiated
                            # OR if the frame itself is a chrome-extension page
                            if url in ext_initiated_urls:
                                is_cs = True
                            elif frame_url.startswith("chrome-extension://"):
                                is_cs = True # Actually this might be a background page, but it's extension traffic
                    except Exception:
                        is_sw = True # Service workers have no frame

                    # Capture headers
                    headers = {}
                    try:
                        headers = req.headers
                    except Exception:
                        pass

                    req_entry = {
                        "url": url,
                        "method": req.method,
                        "resource_type": req.resource_type,
                        "domain": urlparse(url).netloc,
                        "post_data": post_data,
                        "headers": dict(headers) if headers else {},
                        "is_sw": is_sw,
                        "is_cs": is_cs,
                        "is_ext_internal": is_ext_internal,
                        "frame_url": frame_url,
                        "timestamp": time.time(),
                        "timestamp_readable": datetime.now().strftime("%H:%M:%S.%f")[:-3],
                    }
                    all_requests.append(req_entry)

                # Console log capture
                console_logs = []
                def on_console(msg):
                    console_logs.append({
                        "type": msg.type,
                        "text": msg.text[:500],
                        "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3],
                    })

                context.on("request", on_request)

                # Wait for extension to load
                time.sleep(3)

                # Attach console & CDP listener to all new pages
                def on_page_created(new_page):
                    try:
                        new_page.on("console", on_console)
                        attach_cdp_to_page(new_page)
                    except Exception:
                        pass
                context.on("page", on_page_created)

                page = context.new_page()
                attach_cdp_to_page(page)

                # ─── SCENARIO 2 SETUP: Inject canary cookies FIRST ────────
                try:
                    for cookie in CANARY_COOKIES:
                        context.add_cookies([cookie])
                except Exception as e:
                    result["s2_evidence"].append(f"Cookie injection warning: {e}")

                # Attach console listener to main page
                page.on("console", on_console)

                # ─── SCENARIO 1: Download Hijacking ───────────────────────
                s1_start = time.time()
                try:
                    self._run_s1_download_hijack(page, context, download_events, result)
                except Exception as e:
                    result["s1_evidence"].append(f"S1 error: {e}")
                result["scenario_timeline"].append({"scenario": "S1_Download_Hijack", "duration_sec": round(time.time() - s1_start, 1)})

                # ─── SCENARIO 2: Cookie Theft ─────────────────────────────
                s2_start = time.time()
                try:
                    self._run_s2_cookie_theft(page, context, all_requests, result)
                except Exception as e:
                    result["s2_evidence"].append(f"S2 error: {e}")
                result["scenario_timeline"].append({"scenario": "S2_Cookie_Theft", "duration_sec": round(time.time() - s2_start, 1)})

                # ─── SCENARIO 3: Traffic Redirect ─────────────────────────
                s3_start = time.time()
                try:
                    self._run_s3_traffic_redirect(page, context, result)
                except Exception as e:
                    result["s3_evidence"].append(f"S3 error: {e}")
                result["scenario_timeline"].append({"scenario": "S3_Traffic_Redirect", "duration_sec": round(time.time() - s3_start, 1)})

                # Close browser
                try:
                    context.close()
                except Exception:
                    pass

            # ─── POST-ANALYSIS: Analyze captured traffic ──────────────
            self._analyze_traffic(all_requests, download_events, result)

            # ─── ATTACH DETAILED LOGS ─────────────────────────────────
            # Filter out extension-internal requests for cleaner log,
            # but keep ALL requests in captured_requests for full transparency
            result["captured_requests"] = [
                {
                    "url": r["url"][:500],
                    "method": r["method"],
                    "resource_type": r.get("resource_type", ""),
                    "domain": r["domain"],
                    "post_data": (r["post_data"][:1000] if r.get("post_data") else None),
                    "is_sw": r["is_sw"],
                    "is_cs": r["is_cs"],
                    "is_ext_internal": r.get("is_ext_internal", False),
                    "frame_url": (r.get("frame_url", "") or "")[:200],
                    "timestamp_readable": r.get("timestamp_readable", ""),
                    "is_unauthorized": self._is_unauthorized_domain(r["domain"]),
                    "is_suspicious": self._is_suspicious_domain(r["domain"]),
                }
                for r in all_requests
                if not r.get("is_ext_internal", False)  # skip chrome-extension:// noise
            ]
            result["console_logs"] = console_logs[:200]  # cap at 200 entries
            result["download_events"] = download_events
            result["analysis_duration_sec"] = round(time.time() - analysis_start, 1)

        except PWTimeout as e:
            result["error"] = f"Playwright timeout: {e}"
        except Exception as e:
            result["error"] = f"Runtime error: {type(e).__name__}: {e}"
        finally:
            try:
                shutil.rmtree(user_data_dir, ignore_errors=True)
            except Exception:
                pass

        return result

    # ── Scenario 1: Download Hijacking ────────────────────────────────

    def _run_s1_download_hijack(self, page, context, download_events, result):
        """Test if extension hijacks/replaces downloads."""

        for url in TEST_URLS:
            try:
                page.goto(url, timeout=self.timeout * 1000)
                page.wait_for_load_state("load", timeout=5000)
                
                # Only inject download bait on honeypot sites
                if url in HONEYPOT_URLS:
                    page.evaluate("""
                        const a = document.createElement('a');
                        a.id = 'bait-download';
                        a.href = 'data:text/plain;charset=utf-8,TestDownloadCanaryData';
                        a.download = 'safe_document.txt';
                        a.textContent = 'Download Secure Document';
                        document.body.prepend(a);
                    """)
                    try:
                        page.click("#bait-download")
                        time.sleep(3)
                    except Exception:
                        pass
                else:
                    # Live sites: just scroll and wait
                    page.evaluate("window.scrollBy(0, 500)")
                    time.sleep(5)
            except Exception:
                continue
        captured_downloads = []
        def on_download(download):
            captured_downloads.append({
                "url": download.url,
                "filename": download.suggested_filename,
                "timestamp": time.time(),
            })
            download_events.append(captured_downloads[-1])
            try:
                download.cancel()
            except Exception:
                pass

        page.on("download", on_download)

        # Check results
        if len(captured_downloads) > 1:
            result["s1_download_hijack"] = True
            result["s1_extra_downloads"] = len(captured_downloads) - 1
            result["s1_evidence"].append(
                f"Multiple downloads triggered: {json.dumps(captured_downloads, default=str)}"
            )
        elif len(captured_downloads) == 1:
            dl = captured_downloads[0]
            if dl.get("filename") != "safe_document.txt":
                result["s1_download_hijack"] = True
                result["s1_evidence"].append(
                    f"Download filename changed: expected 'safe_document.txt', got '{dl.get('filename')}'"
                )

        result["s1_extra_downloads"] = max(0, len(captured_downloads) - 1)

    # ── Scenario 2: Cookie Theft ──────────────────────────────────────

    def _run_s2_cookie_theft(self, page, context, all_requests, result):
        """Test if extension steals cookies or accesses hardware."""

        for url in TEST_URLS:
            try:
                page.goto(url, timeout=self.timeout * 1000)
                page.wait_for_load_state("load", timeout=5000)

                if url in HONEYPOT_URLS:
                    # 1. Inject a fake login form
                    page.evaluate("""
                        const form = document.createElement('form');
                        form.id = 'honeypot-login';
                        form.innerHTML = `
                            <input type="text" name="username" id="hp-user" />
                            <input type="password" name="password" id="hp-pass" />
                            <button type="submit" id="hp-submit">Login</button>
                        `;
                        document.body.prepend(form);
                        form.addEventListener('submit', (e) => e.preventDefault());
                    """)

                    # 2. Simulate user interaction
                    try:
                        page.fill("#hp-user", "admin_canary")
                        page.fill("#hp-pass", "super_secret_password_123")
                        page.click("#hp-submit")
                    except Exception:
                        pass
                
                # 3. Trigger DOM changes and wait for exfiltration
                page.evaluate("window.scrollBy(0, 500)")
                time.sleep(3 if url in HONEYPOT_URLS else 5)
            except Exception:
                continue

        # Check traffic for canary cookie values
        for req in all_requests:
            post = str(req.get("post_data", "") or "")
            url_str = str(req.get("url", ""))
            combined = (post + url_str).lower()

            for canary in CANARY_VALUES:
                if canary.lower() in combined:
                    result["s2_cookie_theft"] = True
                    result["s2_canary_found_in_traffic"].append({
                        "canary_value": canary,
                        "found_in_url": req["url"][:200],
                        "domain": req["domain"],
                    })
                    result["s2_evidence"].append(
                        f"Canary cookie '{canary}' found in request to {req['domain']}"
                    )

    # ── Scenario 3: Traffic Redirect ──────────────────────────────────

    def _run_s3_traffic_redirect(self, page, context, result):
        """Test if extension redirects traffic to third-party sites."""

        for url in TEST_URLS:
            try:
                page.goto(url, timeout=self.timeout * 1000)
                page.wait_for_load_state("load", timeout=5000)
                
                # Observe page
                time.sleep(4)
                
                current_url = page.url
                if not current_url.startswith(url):
                    result["s3_traffic_redirect"] = True
                    result["s3_unexpected_navigations"].append({
                        "intended": url,
                        "actual": current_url,
                        "redirected_to_domain": urlparse(current_url).netloc,
                    })
                    result["s3_evidence"].append(f"Redirect detected: {url} → {current_url}")
            except Exception:
                continue

    # ── Post-Analysis: Traffic Analysis ───────────────────────────────

    def _analyze_traffic(self, all_requests, download_events, result):
        """Analyze all captured network traffic after scenarios complete."""
        unauthorized = set()
        suspicious = set()

        ext_requests = [r for r in all_requests if r.get("is_sw") or r.get("is_cs")]
        result["total_outbound_requests"] = len(ext_requests)

        for req in ext_requests:
            domain = req.get("domain", "")
            if not domain:
                continue

            if self._is_unauthorized_domain(domain):
                unauthorized.add(domain)

            if self._is_suspicious_domain(domain):
                suspicious.add(domain)

        result["unauthorized_domains"] = sorted(unauthorized)
        result["suspicious_domains"] = sorted(suspicious)

        # Determine overall SEE behavior
        if result["s1_download_hijack"]:
            result["see_behavior_detected"] = True
        if result["s2_cookie_theft"]:
            result["see_behavior_detected"] = True
        if result["s3_traffic_redirect"]:
            result["see_behavior_detected"] = True
        if len(unauthorized) > 0 and len(ext_requests) > 0:
            result["see_behavior_detected"] = True
        if len(suspicious) > 0:
            result["see_behavior_detected"] = True

    # ── Mock Server Management ────────────────────────────────────────

    # Mock server methods removed as we now use a live domain honeypot

    # ── Empty Result ──────────────────────────────────────────────────

    def _empty_result(self, error_msg=""):
        return {
            "extension_id": self._get_extension_id_from_dir(),
            "extension_name": self._get_extension_name(),
            "extension_dir": os.path.basename(self.ext_dir),
            "browser_version": self.browser_label,
            "analyzed_at": datetime.now().isoformat(),
            "total_outbound_requests": 0,
            "unauthorized_domains": [],
            "suspicious_domains": [],
            "s1_download_hijack": False,
            "s1_extra_downloads": 0,
            "s1_evidence": [],
            "s2_cookie_theft": False,
            "s2_canary_found_in_traffic": [],
            "s2_hardware_access": False,
            "s2_evidence": [],
            "s3_traffic_redirect": False,
            "s3_unexpected_navigations": [],
            "s3_injected_elements": 0,
            "s3_evidence": [],
            "see_behavior_detected": False,
            "error": error_msg,
        }


# ── CLI ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) > 1:
        ext_path = sys.argv[1]
        timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 60
        print(f"Running dynamic analysis on: {ext_path}")
        print(f"Timeout per scenario: {timeout}s")
        sandbox = DynamicSandbox(ext_path, timeout_per_scenario=timeout)
        results = sandbox.run_analysis()
        # Print summary
        print(f"\n{'='*50}")
        print(f"Extension: {results['extension_name']}")
        print(f"S1 Download Hijack : {results['s1_download_hijack']}")
        print(f"S2 Cookie Theft    : {results['s2_cookie_theft']}")
        print(f"S3 Traffic Redirect: {results['s3_traffic_redirect']}")
        print(f"SEE Detected       : {results['see_behavior_detected']}")
        print(f"Unauthorized Domains: {results['unauthorized_domains']}")
        print(f"Suspicious Domains : {results['suspicious_domains']}")
        print(f"Total Ext Requests : {results['total_outbound_requests']}")
        if results["error"]:
            print(f"Error: {results['error']}")
        print(f"{'='*50}")
        # Full JSON
        print(json.dumps(results, indent=2, default=str))
    else:
        print("Usage: python sandbox_runner.py <path_to_unpacked_extension> [timeout_seconds]")
