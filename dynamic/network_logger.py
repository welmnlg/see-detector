#!/usr/bin/env python3
"""
network_logger.py — Comprehensive Network Traffic Logger for Chrome Extensions
================================================================================
Captures ALL network requests AND responses made during extension execution.
Outputs detailed CSV with one row per request for manual analysis.

Usage:
    python network_logger.py <path_to_extension> [--timeout 180] [--output traffic_log.csv]
"""

import os
import sys
import csv
import json
import time
import shutil
import tempfile
import traceback
from urllib.parse import urlparse
from datetime import datetime

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
except ImportError:
    print("ERROR: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)

# ─── Canary Data ──────────────────────────────────────────────────────
# These are "bait" values injected into the browser. If any of these
# appear in outbound requests, it means the extension is exfiltrating.

CANARY_COOKIES = [
    {"name": "session_id", "value": "CANARY_SESSION_XYZ999", "domain": "chocoffee.biz.id", "path": "/"},
    {"name": "auth_token", "value": "CANARY_AUTH_ABC888", "domain": "chocoffee.biz.id", "path": "/"},
    {"name": "secure_sess", "value": "CANARY_SECURE_DEF777", "domain": "pingmee.biz.id", "path": "/"},
    {"name": "csrf_token", "value": "CANARY_CSRF_GHI666", "domain": "pingmee.biz.id", "path": "/"},
]
CANARY_VALUES = [c["value"] for c in CANARY_COOKIES]

CANARY_FORM_DATA = {
    "username": "canary_admin_user",
    "password": "canary_P@ssw0rd_Secret!",
    "email": "canary_test@honeypot.com",
}
CANARY_FORM_VALUES = list(CANARY_FORM_DATA.values())

# ─── Test Scenarios ───────────────────────────────────────────────────
# Each scenario visits a URL and performs actions to trigger extension behavior.

SCENARIOS = [
    {
        "name": "honeypot_http",
        "url": "http://chocoffee.biz.id/",
        "description": "HTTP honeypot with injected login form & download link",
        "actions": ["inject_login", "fill_form", "scroll", "inject_download", "click_download"],
    },
    {
        "name": "honeypot_https",
        "url": "https://pingmee.biz.id/",
        "description": "HTTPS honeypot with injected login form & download link",
        "actions": ["inject_login", "fill_form", "scroll", "inject_download", "click_download"],
    },
    {
        "name": "login_test_page",
        "url": "https://the-internet.herokuapp.com/login",
        "description": "Real login test page (Heroku test app)",
        "actions": ["fill_real_login", "scroll"],
    },
    {
        "name": "wikipedia",
        "url": "https://en.wikipedia.org/wiki/Main_Page",
        "description": "Popular site — Wikipedia Main Page",
        "actions": ["scroll", "click_links"],
    },
    {
        "name": "httpbin_form",
        "url": "https://httpbin.org/forms/post",
        "description": "HTTPBin form testing service",
        "actions": ["fill_httpbin", "scroll"],
    },
]

# Response body capture config
MAX_RESPONSE_BODY = 2000  # chars
BODY_CAPTURE_TYPES = {"document", "xhr", "fetch", "script", "other"}

# CSV column order
CSV_FIELDS = [
    "extension_id", "extension_name", "manifest_version",
    "timestamp", "visited_page", "scenario",
    "request_url", "request_method", "request_domain", "resource_type",
    "request_headers", "post_data",
    "response_status", "response_headers", "response_body_preview",
    "is_from_extension", "frame_url",
    "contains_canary", "canary_found",
]


class NetworkLogger:
    """Comprehensive network traffic logger for a single Chrome extension."""

    def __init__(self, ext_dir, timeout=180, output_csv=None):
        self.ext_dir = os.path.abspath(ext_dir)
        self.manifest_path = os.path.join(self.ext_dir, "manifest.json")
        self.manifest = self._load_manifest()
        self.timeout = timeout
        self.output_csv = output_csv

        # Extension metadata
        self.ext_id = self._get_ext_id()
        self.ext_name = self._get_ext_name()
        self.manifest_version = self.manifest.get("manifest_version", "?")

        # Runtime state
        self.traffic_log = []
        self.current_scenario = "setup"
        self.current_visited_url = ""

    # ── Helpers ────────────────────────────────────────────────────────

    def _load_manifest(self):
        if not os.path.exists(self.manifest_path):
            return {}
        try:
            with open(self.manifest_path, "r", encoding="utf-8") as f:
                text = f.read()
                if text.startswith("\ufeff"):
                    text = text[1:]
                return json.loads(text)
        except Exception:
            return {}

    def _get_ext_id(self):
        import re
        dirname = os.path.basename(self.ext_dir)
        if re.match(r"^[a-p]{32}$", dirname):
            return dirname
        parts = dirname.split("__")
        if len(parts) >= 2:
            return parts[-1].split("_v")[0] if "_v" in parts[-1] else parts[-1]
        return dirname

    def _get_ext_name(self):
        name = self.manifest.get("name", "")
        if name.startswith("__MSG_"):
            name = self.manifest.get("short_name", name)
        return name or os.path.basename(self.ext_dir)

    def _check_canary(self, text):
        """Return (bool, list_of_found_canary_strings)."""
        if not text:
            return False, []
        t = text.lower()
        found = []
        for cv in CANARY_VALUES:
            if cv.lower() in t:
                found.append(f"cookie:{cv}")
        for key, val in CANARY_FORM_DATA.items():
            if val.lower() in t:
                found.append(f"form:{key}={val}")
        return bool(found), found

    # ── Main Run ──────────────────────────────────────────────────────

    def run(self):
        """Launch browser, run scenarios, capture traffic. Returns traffic_log list."""
        if not self.manifest:
            print(f"  ⚠ No valid manifest.json in {self.ext_dir}")
            return []

        user_data_dir = tempfile.mkdtemp(prefix="see_netlog_")
        ext_initiated_urls = set()

        try:
            with sync_playwright() as pw:
                context = pw.chromium.launch_persistent_context(
                    user_data_dir,
                    headless=False,
                    timeout=30000,
                    args=[
                        f"--disable-extensions-except={self.ext_dir}",
                        f"--load-extension={self.ext_dir}",
                        "--no-first-run",
                        "--no-default-browser-check",
                        "--disable-popup-blocking",
                        "--suppress-message-center-popups",
                        "--disable-component-update",
                    ],
                    ignore_default_args=["--enable-automation"],
                )
                context.on("dialog", lambda d: d.accept())

                # ── CDP: track extension-initiated requests ───────────
                def attach_cdp(page_obj):
                    try:
                        cdp = page_obj.context.new_cdp_session(page_obj)
                        cdp.send("Network.enable")

                        def on_cdp_req(event):
                            try:
                                url = event.get("request", {}).get("url", "")
                                init = event.get("initiator", {})
                                is_ext = False
                                stack = init.get("stack", {})
                                while stack:
                                    for cf in stack.get("callFrames", []):
                                        if "chrome-extension://" in cf.get("url", ""):
                                            is_ext = True
                                            break
                                    if is_ext:
                                        break
                                    stack = stack.get("parent", {})
                                if not is_ext and init.get("type") == "script":
                                    if "chrome-extension://" in init.get("url", ""):
                                        is_ext = True
                                if is_ext and url:
                                    ext_initiated_urls.add(url)
                            except Exception:
                                pass

                        cdp.on("Network.requestWillBeSent", on_cdp_req)
                    except Exception:
                        pass

                # ── Response handler (primary capture) ────────────────
                def on_response(response):
                    try:
                        req = response.request
                        url = req.url
                        if url.startswith(("data:", "chrome://", "chrome-extension://")):
                            return

                        method = req.method
                        resource_type = req.resource_type
                        domain = urlparse(url).netloc

                        # Post data
                        post_data = ""
                        try:
                            pd = req.post_data
                            post_data = pd[:2000] if pd else ""
                        except Exception:
                            try:
                                raw = req.post_data_buffer
                                post_data = raw.decode("utf-8", errors="replace")[:2000] if raw else ""
                            except Exception:
                                pass

                        # Request headers
                        req_hdrs = {}
                        try:
                            req_hdrs = dict(req.headers)
                        except Exception:
                            pass

                        # Extension-initiated?
                        is_ext = url in ext_initiated_urls
                        frame_url = ""
                        try:
                            if req.frame:
                                frame_url = req.frame.url or ""
                                if frame_url.startswith("chrome-extension://"):
                                    is_ext = True
                        except Exception:
                            pass

                        # Response details
                        resp_status = response.status
                        resp_hdrs = {}
                        try:
                            resp_hdrs = dict(response.headers)
                        except Exception:
                            pass

                        # Response body preview (only for relevant types)
                        resp_body = ""
                        if resource_type in BODY_CAPTURE_TYPES:
                            try:
                                raw_body = response.body()
                                resp_body = raw_body.decode("utf-8", errors="replace")[:MAX_RESPONSE_BODY]
                            except Exception:
                                resp_body = ""

                        # Canary check
                        check_str = f"{url} {post_data} {json.dumps(req_hdrs)}"
                        has_canary, canary_list = self._check_canary(check_str)

                        self.traffic_log.append({
                            "extension_id": self.ext_id,
                            "extension_name": self.ext_name,
                            "manifest_version": self.manifest_version,
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                            "visited_page": self.current_visited_url,
                            "scenario": self.current_scenario,
                            "request_url": url[:2000],
                            "request_method": method,
                            "request_domain": domain,
                            "resource_type": resource_type,
                            "request_headers": json.dumps(req_hdrs, ensure_ascii=False)[:3000],
                            "post_data": post_data,
                            "response_status": resp_status,
                            "response_headers": json.dumps(resp_hdrs, ensure_ascii=False)[:3000],
                            "response_body_preview": resp_body,
                            "is_from_extension": is_ext,
                            "frame_url": frame_url[:500],
                            "contains_canary": has_canary,
                            "canary_found": "; ".join(canary_list),
                        })
                    except Exception:
                        pass

                # ── Failed request handler ────────────────────────────
                def on_request_failed(req):
                    try:
                        url = req.url
                        if url.startswith(("data:", "chrome://", "chrome-extension://")):
                            return
                        domain = urlparse(url).netloc
                        post_data = ""
                        try:
                            pd = req.post_data
                            post_data = pd[:2000] if pd else ""
                        except Exception:
                            pass
                        req_hdrs = {}
                        try:
                            req_hdrs = dict(req.headers)
                        except Exception:
                            pass
                        is_ext = url in ext_initiated_urls
                        frame_url = ""
                        try:
                            if req.frame:
                                frame_url = req.frame.url or ""
                                if frame_url.startswith("chrome-extension://"):
                                    is_ext = True
                        except Exception:
                            pass
                        failure = ""
                        try:
                            failure = req.failure
                        except Exception:
                            pass

                        check_str = f"{url} {post_data}"
                        has_canary, canary_list = self._check_canary(check_str)

                        self.traffic_log.append({
                            "extension_id": self.ext_id,
                            "extension_name": self.ext_name,
                            "manifest_version": self.manifest_version,
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                            "visited_page": self.current_visited_url,
                            "scenario": self.current_scenario,
                            "request_url": url[:2000],
                            "request_method": req.method,
                            "request_domain": domain,
                            "resource_type": req.resource_type,
                            "request_headers": json.dumps(req_hdrs, ensure_ascii=False)[:3000],
                            "post_data": post_data,
                            "response_status": f"FAILED:{failure}",
                            "response_headers": "",
                            "response_body_preview": "",
                            "is_from_extension": is_ext,
                            "frame_url": frame_url[:500],
                            "contains_canary": has_canary,
                            "canary_found": "; ".join(canary_list),
                        })
                    except Exception:
                        pass

                # ── Wire up event handlers ────────────────────────────
                context.on("response", on_response)
                context.on("requestfailed", on_request_failed)

                # Wait for extension to load
                self.current_scenario = "extension_init"
                time.sleep(3)

                # Prepare page
                context.on("page", lambda np: attach_cdp(np))
                page = context.new_page()
                attach_cdp(page)

                # Inject canary cookies
                self.current_scenario = "cookie_injection"
                for cookie in CANARY_COOKIES:
                    try:
                        context.add_cookies([cookie])
                    except Exception:
                        pass

                # ── Run through scenarios ─────────────────────────────
                time_per_scenario = max(10, self.timeout // len(SCENARIOS))

                for i, sc in enumerate(SCENARIOS):
                    self.current_scenario = sc["name"]
                    self.current_visited_url = sc["url"]
                    print(f"    [{i+1}/{len(SCENARIOS)}] {sc['name']} -> {sc['url']}")

                    try:
                        page.goto(sc["url"], timeout=30000)
                        page.wait_for_load_state("networkidle", timeout=15000)
                    except PWTimeout:
                        print(f"         Page load timeout, continuing...")
                    except Exception as e:
                        print(f"         Could not load page: {type(e).__name__}")
                        continue

                    for action in sc["actions"]:
                        try:
                            self._do_action(page, action)
                        except Exception:
                            pass

                    # Observation period per scenario
                    print(f"         Observing for {time_per_scenario}s...")
                    time.sleep(time_per_scenario)

                # Close browser
                try:
                    context.close()
                except Exception:
                    pass

        except Exception as e:
            print(f"  [ERROR] FATAL: {type(e).__name__}: {e}")
            traceback.print_exc()
        finally:
            try:
                shutil.rmtree(user_data_dir, ignore_errors=True)
            except Exception:
                pass

        return self.traffic_log

    # ── Scenario Actions ──────────────────────────────────────────────

    def _do_action(self, page, action):
        if action == "inject_login":
            page.evaluate("""
                const form = document.createElement('form');
                form.id = 'honeypot-login';
                form.action = '#';
                form.method = 'POST';
                form.innerHTML = `
                    <h2 style="margin-bottom:15px">Sign In</h2>
                    <input type="text" name="username" id="hp-user"
                           placeholder="Username" autocomplete="username"
                           style="display:block;width:100%;padding:10px;margin:8px 0;border:1px solid #ccc;border-radius:4px" />
                    <input type="email" name="email" id="hp-email"
                           placeholder="Email" autocomplete="email"
                           style="display:block;width:100%;padding:10px;margin:8px 0;border:1px solid #ccc;border-radius:4px" />
                    <input type="password" name="password" id="hp-pass"
                           placeholder="Password" autocomplete="current-password"
                           style="display:block;width:100%;padding:10px;margin:8px 0;border:1px solid #ccc;border-radius:4px" />
                    <input type="hidden" name="csrf" value="CANARY_CSRF_TOKEN_12345" />
                    <button type="submit" id="hp-submit"
                            style="width:100%;padding:12px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:16px">
                        Sign In
                    </button>
                `;
                form.style.cssText = 'max-width:400px;margin:20px auto;padding:25px;border:1px solid #ddd;border-radius:8px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.1)';
                document.body.prepend(form);
                form.addEventListener('submit', e => e.preventDefault());
            """)
            time.sleep(1)

        elif action == "fill_form":
            try:
                page.fill("#hp-user", CANARY_FORM_DATA["username"])
                time.sleep(0.5)
                page.fill("#hp-email", CANARY_FORM_DATA["email"])
                time.sleep(0.5)
                page.fill("#hp-pass", CANARY_FORM_DATA["password"])
                time.sleep(2)  # Give extension time to read the DOM
                page.click("#hp-submit")
                time.sleep(2)
            except Exception:
                pass

        elif action == "fill_real_login":
            try:
                page.fill("#username", CANARY_FORM_DATA["username"])
                time.sleep(0.5)
                page.fill("#password", CANARY_FORM_DATA["password"])
                time.sleep(2)
                page.click("button[type='submit']")
                time.sleep(2)
            except Exception:
                pass

        elif action == "fill_httpbin":
            try:
                inputs = page.query_selector_all("input[type='text'], input[type='email'], input[type='tel']")
                for inp in inputs[:3]:
                    try:
                        inp.fill(CANARY_FORM_DATA["username"])
                    except Exception:
                        pass
                time.sleep(1)
            except Exception:
                pass

        elif action == "scroll":
            for _ in range(4):
                try:
                    page.evaluate("window.scrollBy(0, 300)")
                    time.sleep(0.8)
                except Exception:
                    pass

        elif action == "click_links":
            try:
                links = page.query_selector_all("a[href^='/wiki/']")
                for link in links[:2]:
                    try:
                        link.click()
                        time.sleep(3)
                        page.go_back()
                        time.sleep(1)
                    except Exception:
                        break
            except Exception:
                pass

        elif action == "inject_download":
            page.evaluate("""
                const a = document.createElement('a');
                a.id = 'bait-download';
                a.href = 'data:text/plain;charset=utf-8,CANARY_DOWNLOAD_FILE_CONTENT_SECRET';
                a.download = 'important_document.pdf';
                a.textContent = '📥 Download Important Document';
                a.style.cssText = 'display:block;padding:15px;background:#28a745;color:white;text-decoration:none;text-align:center;border-radius:5px;margin:15px auto;max-width:300px;font-weight:bold';
                document.body.prepend(a);
            """)
            time.sleep(1)

        elif action == "click_download":
            try:
                page.click("#bait-download")
                time.sleep(3)
            except Exception:
                pass

    # ── CSV Output ────────────────────────────────────────────────────

    def save_csv(self, filepath=None):
        """Append captured traffic to CSV. Creates header if file is new."""
        filepath = filepath or self.output_csv
        if not filepath:
            filepath = f"traffic_{self.ext_id}.csv"
        if not self.traffic_log:
            print(f"  [INFO] No traffic captured for {self.ext_name}.")
            return filepath

        file_exists = os.path.exists(filepath) and os.path.getsize(filepath) > 0
        with open(filepath, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f, fieldnames=CSV_FIELDS, extrasaction="ignore",
                quoting=csv.QUOTE_ALL, escapechar="\\"
            )
            if not file_exists:
                writer.writeheader()
            
            saved_count = 0
            for entry in self.traffic_log:
                # FILTERING LOGIC: Only save if it's from the extension OR contains canary data
                if not (entry.get("is_from_extension") or entry.get("contains_canary")):
                    continue
                    
                # Sanitize all string values to prevent CSV errors
                clean = {}
                for k, v in entry.items():
                    if isinstance(v, str):
                        # Replace newlines/tabs/null bytes with spaces
                        v = v.replace("\r\n", " ").replace("\n", " ").replace("\r", " ")
                        v = v.replace("\x00", "")
                    clean[k] = v
                writer.writerow(clean)
                saved_count += 1

        print(f"  [SAVED] {saved_count} relevant request rows -> {filepath} (Filtered {len(self.traffic_log) - saved_count} noise requests)")
        return filepath

    def get_summary(self):
        """Return a summary dict of findings."""
        total = len(self.traffic_log)
        ext_reqs = [r for r in self.traffic_log if r.get("is_from_extension")]
        canary_hits = [r for r in self.traffic_log if r.get("contains_canary")]
        failed = [r for r in self.traffic_log if str(r.get("response_status", "")).startswith("FAILED")]
        post_reqs = [r for r in self.traffic_log if r.get("request_method") == "POST"]

        unique_domains = set(r.get("request_domain", "") for r in self.traffic_log if r.get("request_domain"))
        ext_domains = set(r.get("request_domain", "") for r in ext_reqs if r.get("request_domain"))

        return {
            "extension_id": self.ext_id,
            "extension_name": self.ext_name,
            "manifest_version": self.manifest_version,
            "total_requests": total,
            "extension_initiated": len(ext_reqs),
            "canary_hits": len(canary_hits),
            "post_requests": len(post_reqs),
            "failed_requests": len(failed),
            "unique_domains": len(unique_domains),
            "ext_contacted_domains": sorted(ext_domains),
            "canary_details": [
                {"url": h["request_url"][:150], "method": h["request_method"], "canary": h["canary_found"]}
                for h in canary_hits
            ],
        }


# ── CLI ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Network Traffic Logger for Chrome Extensions")
    parser.add_argument("extension", help="Path to unpacked extension directory")
    parser.add_argument("--timeout", type=int, default=180, help="Total observation time in seconds (default: 180)")
    parser.add_argument("--output", default=None, help="Output CSV file path")
    args = parser.parse_args()

    logger = NetworkLogger(args.extension, timeout=args.timeout, output_csv=args.output)

    print(f"\n{'='*65}")
    print(f"  NETWORK TRAFFIC LOGGER")
    print(f"  Extension : {logger.ext_name}")
    print(f"  ID        : {logger.ext_id}")
    print(f"  Manifest  : v{logger.manifest_version}")
    print(f"  Timeout   : {args.timeout}s ({args.timeout // len(SCENARIOS)}s per scenario)")
    print(f"  Scenarios : {len(SCENARIOS)}")
    print(f"{'='*65}\n")

    traffic = logger.run()
    csv_path = logger.save_csv()
    summary = logger.get_summary()

    print(f"\n{'='*65}")
    print(f"  RESULTS SUMMARY")
    print(f"  Total requests captured     : {summary['total_requests']}")
    print(f"  Extension-initiated         : {summary['extension_initiated']}")
    print(f"  POST requests               : {summary['post_requests']}")
    print(f"  Failed requests             : {summary['failed_requests']}")
    print(f"  Unique domains contacted    : {summary['unique_domains']}")
    print(f"  Canary data in traffic      : {summary['canary_hits']}")
    if summary["canary_hits"] > 0:
        print(f"  [!] CANARY DATA FOUND IN OUTBOUND TRAFFIC:")
        for h in summary["canary_details"]:
            print(f"     -> {h['method']} {h['url']}")
            print(f"       Canary: {h['canary']}")
    if summary["ext_contacted_domains"]:
        print(f"\n  Domains contacted by extension:")
        for d in summary["ext_contacted_domains"]:
            print(f"     - {d}")
    print(f"\n  CSV output: {csv_path}")
    print(f"{'='*65}")
