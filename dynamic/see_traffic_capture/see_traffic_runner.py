#!/usr/bin/env python3
"""
see_traffic_runner.py — SEE Dynamic Traffic Capture & Analysis Runner
=====================================================================
Captures ALL network traffic from a Chrome extension during 7 real-world
user browsing scenarios. Detects Stealth Extension Exfiltration (SEE)
attacks per Lim et al. methodology.

Key Features:
  - CDP + Playwright hybrid network interception
  - Detailed source attribution (Content Script / Service Worker / Extension Page)
  - 7 browsing scenarios with human-like mouse, scroll, and typing simulation
  - Auto-generates evidence summaries for each captured request

Usage:
  python see_traffic_runner.py --ext-dir /path/to/extension [--profile /path/to/profile]
"""

import os
import sys
import json
import time
import shutil
import tempfile
import traceback
import random
import re
import argparse
from urllib.parse import urlparse
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# Evidence pattern keywords for auto-labeling captured traffic
EVIDENCE_KEYWORDS = {
    "cookie_theft": ["cookie", "session_id", "auth_token", "csrf", "set-cookie", "sessionid", "getall"],
    "credential_theft": ["password", "passwd", "credential", "login", "username", "user_pass", "secret"],
    "user_profiling": ["click", "scroll", "keystroke", "mouse", "interaction", "focus", "cursor", "profiling", "engagement", "heatmap"],
    "dom_scraping": ["innerhtml", "textcontent", "document.body", "outerhtml", "queryselector", "dom", "layout"],
    "download_hijack": ["download", "hijack", "filename", "file_url", "cancel", "replace", "onCreated"],
    "local_file_access": ["file://", "local_file", "ssn", "credit_card", "secret", "confidential"],
    "http_redirect": ["redirect", "navigate", "location.href", "window.location", "declarativeNetRequest"],
    "audio_capture": ["microphone", "audio", "getusermedia", "stream", "record", "voice", "speech", "webrtc"],
}

# Well-known infrastructure domains (not suspicious by themselves)
INFRASTRUCTURE_DOMAINS = {
    "google.com", "googleapis.com", "gstatic.com", "googleusercontent.com",
    "google-analytics.com", "googletagmanager.com", "googlesyndication.com",
    "facebook.com", "fbcdn.net", "facebook.net", "fb.com", "fbsbx.com",
    "linkedin.com", "licdn.com",
    "cloudflare.com", "cdnjs.cloudflare.com", "cdn.jsdelivr.net",
    "unpkg.com", "bootstrapcdn.com",
    "youtube.com", "ytimg.com", "ggpht.com",
    "twitter.com", "twimg.com", "x.com",
    "microsoft.com", "msftauth.net", "live.com",
    "apple.com", "amazon.com", "amazonaws.com",
    "optimizely.com", "protechts.net",
    "highlightthis.net", "cookieyes.com", "3lift.com", "teads.tv", "rubiconproject.com",
    "stickyadstv.com", "33across.com", "bing.com", "doubleclick.net", "adnxs.com",
    "demdex.net", "trkn.us", "google.co.id", "criteo.com",
    "127.0.0.1", "localhost",
    # Scenario test domains
    "neverssl.com", "the-internet.herokuapp.com", "http.cat",
    "httpforever.com", "example.com", "iana.org", "webrtc.github.io",
}

class SEETrafficRunner:
    def __init__(self, ext_dir, user_profile_dir=None, timeout_per_scenario=45, local_file_path=None):
        self.ext_dir = os.path.abspath(ext_dir)
        self.user_profile_dir = os.path.abspath(user_profile_dir) if user_profile_dir else None
        self.timeout = timeout_per_scenario
        
        # Determine local file path
        if local_file_path:
            self.local_file_path = os.path.abspath(local_file_path)
        else:
            # Create a dummy local file if none provided
            dummy_dir = os.path.join(tempfile.gettempdir(), "see_test_assets")
            os.makedirs(dummy_dir, exist_ok=True)
            self.local_file_path = os.path.join(dummy_dir, "dummy_secret.txt")
            if not os.path.exists(self.local_file_path):
                with open(self.local_file_path, "w", encoding="utf-8") as f:
                    f.write("CONFIDENTIAL: SSN=000-00-0000\nCREDIT_CARD=4111-1111-1111-1111\nPASSWORD=SecretPass123!")

        self.manifest = self._load_manifest()
        self.host_permissions = self._get_host_permissions()
        self.content_script_matches = self._get_content_script_matches()
        self.extension_name = self._get_extension_name()
        self.extension_id = self._get_extension_id()
        
        self._current_scenario = ""
        self._captured_traffic = []
        self._cdp_details = {}
        self._ext_initiated_urls = set()

    def _load_manifest(self):
        """Read manifest.json from self.ext_dir."""
        manifest_path = os.path.join(self.ext_dir, "manifest.json")
        try:
            if os.path.exists(manifest_path):
                with open(manifest_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading manifest: {e}")
        return {}

    def _get_host_permissions(self):
        """Extract all host permission patterns from manifest."""
        perms = []
        try:
            permissions = self.manifest.get("permissions", [])
            host_perms = self.manifest.get("host_permissions", [])
            
            for p in permissions + host_perms:
                if isinstance(p, str) and ("://" in p or p == "<all_urls>"):
                    perms.append(p)
        except Exception as e:
            print(f"Error extracting host permissions: {e}")
        return perms

    def _get_content_script_matches(self):
        """Extract all match patterns from manifest's content_scripts."""
        matches = []
        try:
            content_scripts = self.manifest.get("content_scripts", [])
            for script in content_scripts:
                script_matches = script.get("matches", [])
                for match in script_matches:
                    if match not in matches:
                        matches.append(match)
        except Exception as e:
            print(f"Error extracting content script matches: {e}")
        return matches

    def _get_extension_name(self):
        """Return manifest name."""
        name = self.manifest.get("name", "")
        if not name or name.startswith("__MSG_"):
            name = self.manifest.get("short_name", os.path.basename(self.ext_dir))
        return name

    def _get_extension_id(self):
        """Try to extract ID from dirname."""
        dirname = os.path.basename(self.ext_dir)
        
        # Check for 32-char lowercase a-p string
        match = re.search(r'[a-p]{32}', dirname)
        if match:
            return match.group(0)
            
        # Or look for "Name__extensionid_vVersion" pattern
        if "__" in dirname and "_v" in dirname:
            try:
                parts = dirname.split("__")
                if len(parts) > 1:
                    subparts = parts[1].split("_v")
                    if len(subparts) > 0 and len(subparts[0]) == 32:
                        return subparts[0]
            except Exception:
                pass
                
        return dirname

    def _is_unauthorized_domain(self, domain):
        """Check if domain is NOT covered by host_permissions."""
        if "<all_urls>" in self.host_permissions:
            return False
            
        for perm in self.host_permissions:
            if perm == "<all_urls>" or perm == "*://*/*":
                return False
                
        if not domain:
            return False
            
        # Strip port
        if ":" in domain:
            domain = domain.split(":")[0]
            
        for perm in self.host_permissions:
            try:
                perm_parsed = urlparse(perm.replace("*://", "http://"))
                perm_host = perm_parsed.hostname
                
                if not perm_host:
                    continue
                    
                if perm_host.startswith("*."):
                    base_domain = perm_host[2:]
                    if domain == base_domain or domain.endswith("." + base_domain):
                        return False
                elif domain == perm_host or perm_host == "*":
                    return False
            except Exception:
                pass
                
        return True

    def _is_infrastructure_domain(self, domain):
        """Check if domain is in INFRASTRUCTURE_DOMAINS set."""
        if not domain:
            return False
            
        # Strip port
        if ":" in domain:
            domain = domain.split(":")[0]
            
        for infra_domain in INFRASTRUCTURE_DOMAINS:
            if domain == infra_domain or domain.endswith("." + infra_domain):
                return True
                
        return False

    def _generate_evidence(self, entry):
        """Auto-generate a human-readable evidence summary string."""
        try:
            method = entry.get("method", "UNKNOWN")
            url = entry.get("url", "")
            domain = entry.get("domain", "")
            source = entry.get("source", "unknown")
            document_url = entry.get("document_url", "")
            post_data = str(entry.get("post_data_preview", "")).lower()
            url_lower = url.lower()
            
            parts = [f"{method} to {domain}"]
            
            if source == "Service Worker":
                parts.append("from extension service worker")
            elif source == "Content Script":
                parts.append(f"injected into page {document_url}")
            elif source == "Extension Page":
                parts.append("from extension page")
                
            if entry.get("is_unauthorized_domain"):
                parts.append("[UNAUTHORIZED DOMAIN]")
                
            found_labels = []
            for category, keywords in EVIDENCE_KEYWORDS.items():
                for kw in keywords:
                    if kw in url_lower or kw in post_data:
                        found_labels.append(category)
                        break
                        
            if found_labels:
                parts.append(f"Flags: {', '.join(found_labels)}")
                
            return "; ".join(parts)
        except Exception as e:
            return f"Evidence generation error: {str(e)}"

    def _human_scroll(self, page, total_distance=1500, steps=5):
        """Scroll page slowly in small increments."""
        try:
            for _ in range(steps):
                amount = random.randint(200, 400)
                page.evaluate(f"window.scrollBy(0, {amount})")
                time.sleep(random.uniform(0.8, 1.5))
        except Exception as e:
            print(f"    Scroll failed: {e}")

    def _human_mouse_move(self, page, positions=4):
        """Move mouse to random positions on the visible viewport."""
        try:
            for _ in range(positions):
                x = random.randint(100, 900)
                y = random.randint(100, 600)
                page.mouse.move(x, y, steps=15)
                time.sleep(random.uniform(0.3, 0.8))
        except Exception as e:
            print(f"    Mouse move failed: {e}")

    def _human_type(self, page, selector, text, delay_ms=80):
        """Type text into an input field with human-like delays."""
        try:
            page.click(selector)
            page.type(selector, text, delay=delay_ms)
        except Exception as e:
            print(f"    Type failed on {selector}: {e}")

    def _safe_click(self, page, selector, timeout=3000):
        """Try to click a selector. If it fails, silently continue."""
        try:
            page.click(selector, timeout=timeout)
            return True
        except Exception:
            return False

    def _safe_goto(self, page, url, timeout=None):
        """Navigate to URL with error handling."""
        if timeout is None:
            # Cap navigation timeout at 15s so scenarios fail fast if a domain hangs
            timeout = min(self.timeout * 1000, 15000)
        try:
            page.goto(url, timeout=timeout, wait_until="domcontentloaded")
            return True
        except Exception as e:
            err_msg = str(e).split('\n')[0]
            print(f"    Navigation failed to {url}: {err_msg}")
            return False

    def _attach_cdp(self, page):
        """Attach CDP session to a page for deep network interception."""
        try:
            cdp = page.context.new_cdp_session(page)
            cdp.send("Network.enable")
            cdp.send("Debugger.enable")
            cdp.send("Debugger.setAsyncCallStackDepth", {"maxDepth": 32})
            
            def on_request_will_be_sent(event):
                try:
                    req = event.get("request", {})
                    url = req.get("url", "")
                    if not url or url.startswith("data:") or url.startswith("chrome://"):
                        return
                        
                    initiator = event.get("initiator", {})
                    document_url = event.get("documentURL", "")
                    
                    is_extension_initiated = False
                    initiator_url = ""
                    
                    # Check initiator url
                    if "url" in initiator and "chrome-extension://" in initiator["url"]:
                        is_extension_initiated = True
                        initiator_url = initiator["url"]
                        
                    # Check call stack
                    stack = initiator.get("stack", {})
                    while stack:
                        for frame in stack.get("callFrames", []):
                            f_url = frame.get("url", "")
                            if "chrome-extension://" in f_url:
                                is_extension_initiated = True
                                initiator_url = f_url
                                break
                        if is_extension_initiated:
                            break
                        stack = stack.get("parent", {})
                        
                    if is_extension_initiated:
                        self._ext_initiated_urls.add(url)
                        
                    self._cdp_details[url] = {
                        "is_extension_initiated": is_extension_initiated,
                        "initiator_url": initiator_url,
                        "document_url": document_url,
                        "cdp_post_data": req.get("hasPostData", False),
                        "initiator_type": initiator.get("type", ""),
                    }
                except Exception as e:
                    print(f"    CDP interception error: {e}")
                    
            cdp.on("Network.requestWillBeSent", on_request_will_be_sent)
        except Exception as e:
            print(f"    Failed to attach CDP to page: {e}")

    def _handle_playwright_request(self, req):
        """Handle request event from Playwright context."""
        try:
            url = req.url
            if url.startswith("data:") or url.startswith("chrome://") or url.startswith("chrome-extension://"):
                return
                
            cdp_info = self._cdp_details.get(url, {})
            is_ext_initiated = cdp_info.get("is_extension_initiated", False) or (url in self._ext_initiated_urls)
            
            frame_url = ""
            is_sw = False
            try:
                if hasattr(req, "service_worker") and req.service_worker is not None:
                    is_sw = True
                else:
                    frame = req.frame
                    if frame:
                        frame_url = frame.url
                    else:
                        is_sw = True
            except Exception as e:
                err_str = str(e)
                if "Service Worker" in err_str or "service worker" in err_str:
                    is_sw = True
                elif "navigation request" in err_str or "before the frame is created" in err_str:
                    # Ignore navigation requests that are issued before frame creation unless flagged by CDP
                    pass
                else:
                    is_sw = True
            
            if frame_url.startswith("chrome-extension://"):
                is_ext_initiated = True
                
            parsed_url = urlparse(url)
            domain = parsed_url.hostname or ""
            
            if not is_ext_initiated and not is_sw:
                # If CDP didn't catch it and it's not a SW, it might be a content script request.
                # If it's going to an unauthorized domain and not an infrastructure domain, KEEP IT.
                if self._is_infrastructure_domain(domain) or not self._is_unauthorized_domain(domain):
                    return
                
            if is_sw and not is_ext_initiated:
                if self._is_infrastructure_domain(domain):
                    return
                    
            if is_sw:
                source = "Service Worker"
                origin = f"chrome-extension://{self.extension_id}/"
            elif is_ext_initiated and not frame_url.startswith("chrome-extension://"):
                source = "Content Script"
                origin = frame_url
            elif frame_url.startswith("chrome-extension://"):
                source = "Extension Page"
                origin = frame_url
            else:
                source = "Unknown Extension Context"
                origin = frame_url
                
            document_url = cdp_info.get("document_url", frame_url)
            
            post_data = ""
            try:
                post_data = req.post_data
                if not post_data:
                    raw = req.post_data_buffer
                    if raw:
                        post_data = raw.decode('utf-8', errors='replace')
            except Exception:
                pass
            if not post_data:
                post_data = ""
                
            headers = {}
            try:
                headers = dict(req.headers)
            except Exception:
                pass
            
            # Build relevant headers JSON for CSV
            relevant_headers = {}
            for hkey in ("content-type", "origin", "referer", "cookie"):
                if hkey in headers:
                    relevant_headers[hkey] = headers[hkey][:200]
            
            entry = {
                "timestamp": datetime.now().isoformat(timespec="milliseconds"),
                "scenario": self._current_scenario,
                "source": source,
                "origin": origin[:500] if origin else "",
                "method": req.method,
                "url": url[:2000],
                "domain": domain,
                "resource_type": req.resource_type,
                "post_data_preview": post_data[:2000] if post_data else "",
                "request_headers_json": json.dumps(relevant_headers),
                "is_extension_initiated": True,
                "is_unauthorized_domain": self._is_unauthorized_domain(domain),
                "initiator_url": cdp_info.get("initiator_url", ""),
                "frame_url": frame_url[:500] if frame_url else "",
                "document_url": document_url,
            }
            
            entry["evidence_summary"] = self._generate_evidence(entry)
            self._captured_traffic.append(entry)
            
        except Exception as e:
            print(f"    Request handling error: {e}")

    def _handle_websocket(self, ws):
        """Handle WebSocket connections."""
        try:
            url = ws.url
            parsed = urlparse(url)
            domain = parsed.hostname or ""
            
            # For websockets, we log all non-infrastructure ones, because it's highly likely to be the PoC
            if self._is_infrastructure_domain(domain):
                return
                
            entry = {
                "timestamp": datetime.now().isoformat(timespec="milliseconds"),
                "scenario": self._current_scenario,
                "source": "WebSocket (Suspected)",
                "origin": "",
                "method": "WEBSOCKET",
                "url": url[:2000],
                "domain": domain,
                "resource_type": "websocket",
                "post_data_preview": "",
                "request_headers_json": "{}",
                "is_extension_initiated": True,
                "is_unauthorized_domain": self._is_unauthorized_domain(domain),
                "initiator_url": "",
                "frame_url": "",
                "document_url": "",
            }
            entry["evidence_summary"] = self._generate_evidence(entry)
            self._captured_traffic.append(entry)
            
            # Also listen to sent frames
            def on_frame(frame):
                frame_entry = entry.copy()
                frame_entry["post_data_preview"] = (frame if isinstance(frame, str) else str(frame))[:2000]
                frame_entry["timestamp"] = datetime.now().isoformat(timespec="milliseconds")
                self._captured_traffic.append(frame_entry)
                
            ws.on("framesent", on_frame)
        except Exception as e:
            print(f"    WebSocket handling error: {e}")

    def run_analysis(self) -> dict:
        """Run all scenarios and capture traffic."""
        start_time = time.time()
        result = {
            "extension_id": self.extension_id,
            "extension_name": self.extension_name,
            "manifest_version": self.manifest.get("manifest_version", 0),
            "permissions": json.dumps(self.manifest.get("permissions", [])),
            "host_permissions": json.dumps(self.host_permissions),
            "content_script_matches": json.dumps(self.content_script_matches),
            "has_service_worker": "background" in self.manifest and "service_worker" in self.manifest["background"],
            "analyzed_at": datetime.now().isoformat(),
            "analysis_duration_sec": 0.0,
            "total_captured_requests": 0,
            "captured_traffic": [],
            "error": None,
        }
        
        if not self.manifest:
            result["error"] = "Manifest not found or invalid."
            return result
            
        temp_user_data_dir = tempfile.mkdtemp(prefix="see_profile_")
        
        if self.user_profile_dir and os.path.exists(self.user_profile_dir):
            try:
                ignore_patterns = shutil.ignore_patterns(
                    "Cache*", "Code Cache", "GPUCache", "CacheStorage", "DawnCache",
                    "Network Action Predictor", "OptimizationGuidePredictorModels"
                )
                shutil.copytree(self.user_profile_dir, temp_user_data_dir, dirs_exist_ok=True, ignore=ignore_patterns)
                
                # FORCE DEVELOPER MODE: System Chrome ignores --load-extension if Dev Mode is off
                pref_path = os.path.join(temp_user_data_dir, "Default", "Preferences")
                if os.path.exists(pref_path):
                    try:
                        with open(pref_path, "r", encoding="utf-8") as f:
                            prefs = json.load(f)
                        if "extensions" not in prefs: prefs["extensions"] = {}
                        if "ui" not in prefs["extensions"]: prefs["extensions"]["ui"] = {}
                        prefs["extensions"]["ui"]["developer_mode"] = True
                        with open(pref_path, "w", encoding="utf-8") as f:
                            json.dump(prefs, f)
                    except Exception as e:
                        print(f"Warning: Failed to force developer mode: {e}")
            except Exception as e:
                print(f"Error copying profile: {e}")
                
        context = None
        playwright_obj = None
        
        try:
            playwright_obj = sync_playwright().start()
            
            args = [
                f"--disable-extensions-except={self.ext_dir}",
                f"--load-extension={self.ext_dir}",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-popup-blocking",
                "--disable-component-update",
                "--disable-background-networking",
                "--disable-features=PrivateNetworkAccessPermissionPrompt,BlockInsecurePrivateNetworkRequests",
                "--disable-blink-features=AutomationControlled"
            ]
            
            context = playwright_obj.chromium.launch_persistent_context(
                temp_user_data_dir,
                headless=False,
                args=args,
                ignore_default_args=["--disable-extensions", "--enable-automation"]
            )
            
            context.on("dialog", lambda d: d.accept())
            context.on("request", self._handle_playwright_request)
            
            # Setup CDP for main page and WebSockets
            def on_page(p):
                self._attach_cdp(p)
                p.on("websocket", self._handle_websocket)
                
            context.on("page", on_page)
            
            page = context.new_page()
            on_page(page)
            
            scenarios = [
                self._scenario_facebook,
                self._scenario_linkedin,
                self._scenario_gmail,
                self._scenario_http_site,
                self._scenario_login_form,
                self._scenario_local_file,
                self._scenario_download_test,
                self._scenario_microphone
            ]
            
            for idx, scenario in enumerate(scenarios, 1):
                try:
                    scenario(page, context)
                except Exception as e:
                    print(f"Error in scenario S{idx}: {e}")
                    traceback.print_exc()
                time.sleep(2)
                
            result["total_captured_requests"] = len(self._captured_traffic)
            result["captured_traffic"] = self._captured_traffic
            
        except Exception as e:
            print(f"Analysis error: {e}")
            result["error"] = str(e)
            traceback.print_exc()
        finally:
            if context:
                try:
                    context.close()
                except:
                    pass
            if playwright_obj:
                try:
                    playwright_obj.stop()
                except:
                    pass
                    
            try:
                shutil.rmtree(temp_user_data_dir, ignore_errors=True)
            except:
                pass
                
            result["analysis_duration_sec"] = round(time.time() - start_time, 2)
            
        return result

    def _scenario_facebook(self, page, context):
        """S1: Facebook."""
        print("  [S1] Facebook scenario...")
        self._current_scenario = "S1_Facebook"
        if self._safe_goto(page, "https://www.facebook.com/"):
            time.sleep(3)
            self._human_scroll(page, total_distance=1200, steps=4)
            self._human_mouse_move(page, positions=3)
            try:
                links = page.query_selector_all("a[href]")
                for link in links:
                    if link.is_visible():
                        link.click(timeout=3000)
                        break
            except Exception:
                pass
            time.sleep(5)

    def _scenario_linkedin(self, page, context):
        """S2: LinkedIn - Test cookie theft."""
        self._current_scenario = "S2_Cookie_Theft"
        print("  [S2] LinkedIn scenario...")
        
        # Inject canary cookies first
        try:
            context.add_cookies([
                {"name": "session_id", "value": "sec_canary_123456789", "domain": ".linkedin.com", "path": "/"},
                {"name": "auth_token", "value": "auth_canary_987654321", "domain": ".linkedin.com", "path": "/"},
                {"name": "admin_session", "value": "admin_canary_abcdef", "domain": ".facebook.com", "path": "/"}
            ])
        except Exception as e:
            print(f"    Failed to inject canary cookies: {e}")
            
        try:
            self._safe_goto(page, "https://www.linkedin.com/", timeout=15000)
            self._human_scroll(page, total_distance=2000, steps=6)
        except Exception:
            pass
        self._human_mouse_move(page, positions=4)
        time.sleep(5)

    def _scenario_gmail(self, page, context):
        """S3: Gmail."""
        print("  [S3] Gmail scenario...")
        self._current_scenario = "S3_Gmail"
        if self._safe_goto(page, "https://mail.google.com/mail/u/0/"):
            time.sleep(4)
            try:
                for selector in ["tr.zA", "div[role='row']", "table.F tr"]:
                    if self._safe_click(page, selector):
                        time.sleep(3)
                        page.go_back()
                        break
            except Exception:
                pass
            self._human_scroll(page, total_distance=800, steps=3)
            time.sleep(5)

    def _scenario_http_site(self, page, context):
        """S4: HTTP Site."""
        print("  [S4] HTTP Site scenario...")
        self._current_scenario = "S4_HTTP_Site"
        success = self._safe_goto(page, "http://example.com/")
        if not success:
            time.sleep(2)
            try:
                page.goto("about:blank")
            except Exception:
                pass
            time.sleep(1)
            success = self._safe_goto(page, "http://neverssl.com/")
            
        time.sleep(3)
        self._human_scroll(page, total_distance=500, steps=2)
        self._human_mouse_move(page, positions=3)
        self._safe_click(page, "a")
        time.sleep(5)

    def _scenario_login_form(self, page, context):
        """S5: Login Form."""
        print("  [S5] Login Form scenario...")
        self._current_scenario = "S5_Login_Form"
        if self._safe_goto(page, "https://the-internet.herokuapp.com/login"):
            time.sleep(2)
            self._human_type(page, "#username", "admin_test_user", delay_ms=90)
            time.sleep(0.5)
            self._human_type(page, "#password", "S3cur3P@ssw0rd!2026", delay_ms=100)
            time.sleep(0.3)
            self._human_mouse_move(page, positions=2)
            
            for selector in ["button[type='submit']", "i.fa-sign-in", ".radius"]:
                if self._safe_click(page, selector):
                    break
            time.sleep(5)

    def _scenario_local_file(self, page, context):
        """S6: Local File."""
        print("  [S6] Local File scenario...")
        self._current_scenario = "S6_Local_File"
        file_url = "file:///" + self.local_file_path.replace("\\", "/").lstrip("/")
        if self._safe_goto(page, file_url):
            time.sleep(3)
            self._human_scroll(page, total_distance=300, steps=2)
            time.sleep(5)

    def _scenario_download_test(self, page, context):
        """S7: Download Test."""
        print("  [S7] Download Test scenario...")
        self._current_scenario = "S7_Download"
        if self._safe_goto(page, "https://http.cat/200.jpg"):
            time.sleep(2)
            try:
                page.evaluate('''
                const a = document.createElement('a');
                a.id = 'see-bait-download';
                a.href = 'data:text/plain;charset=utf-8,TestCanaryDownloadPayload';
                a.download = 'test_document.txt';
                a.textContent = 'Download Test File';
                a.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;padding:10px;background:#333;color:#fff;';
                document.body.appendChild(a);
                ''')
                self._safe_click(page, "#see-bait-download")
                time.sleep(3)
                
                page.evaluate('''
                const img = document.createElement('a');
                img.href = 'https://http.cat/200.jpg';
                img.download = 'cat_image.jpg';
                img.id = 'see-image-download';
                img.textContent = 'Save Image';
                document.body.appendChild(img);
                ''')
                self._safe_click(page, "#see-image-download")
            except Exception as e:
                print(f"    Download bait error: {e}")
            time.sleep(5)

    def _scenario_microphone(self, page, context):
        """S8: Microphone Usage Test."""
        print("  [S8] Microphone Usage scenario...")
        self._current_scenario = "S8_Microphone"
        target_url = "https://webrtc.github.io/samples/src/content/getusermedia/audio/"
        try:
            # Izinkan Playwright mengakses microphone HANYA saat skenario ini dipakai
            context.grant_permissions(["microphone"], origin="https://webrtc.github.io")
            if self._safe_goto(page, target_url):
                time.sleep(2)
                try:
                    self._safe_click(page, "button#getUserMediaButton")
                    page.evaluate("""
                        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                            navigator.mediaDevices.getUserMedia({ audio: true })
                              .then(stream => { window._testMicStream = stream; console.log('Mic active'); })
                              .catch(e => console.error('Mic error:', e));
                        }
                    """)
                except Exception as e:
                    print(f"    Mic activation error: {e}")
                time.sleep(5)
        except Exception as e:
            print(f"    Microphone scenario error: {e}")
        finally:
            # Off kan lagi izin microphonenya setelah skenario pengujian selesai
            try:
                context.clear_permissions()
                print("    [S8] Izin microphone telah dinonaktifkan (clear_permissions).")
            except Exception as e:
                print(f"    Could not clear permissions: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SEE Dynamic Traffic Capture & Analysis Runner")
    parser.add_argument("--ext-dir", required=True, help="Path to unpacked extension directory")
    parser.add_argument("--profile", help="Path to Chrome user profile")
    parser.add_argument("--timeout", type=int, default=45, help="Timeout per scenario in seconds")
    parser.add_argument("--local-file", help="Path to local test file")
    parser.add_argument("--output-json", help="Path to save JSON results")
    args = parser.parse_args()
    
    runner = SEETrafficRunner(

        ext_dir=args.ext_dir,
        user_profile_dir=args.profile,
        timeout_per_scenario=args.timeout,
        local_file_path=args.local_file
    )
    result = runner.run_analysis()
    
    if args.output_json:
        import json
        with open(args.output_json, 'w') as f:
            json.dump(result, f, indent=2)
    else:
        import pprint
        pprint.pprint(result)
