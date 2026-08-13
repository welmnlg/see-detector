#!/usr/bin/env python3
"""
network_logger_v2.py — Enhanced Network Traffic Logger for Chrome Extensions (V2)
==================================================================================
Versi upgrade dari network_logger.py dengan fitur-fitur tambahan:
  - 12 skenario pengujian (naik dari 5)
  - Anti-sandbox evasion (fake cookies, warmup browsing)
  - DOM MutationObserver (deteksi elemen yang di-inject ekstensi)
  - Enhanced CDP monitoring (Service Worker + console API calls)
  - Idle observation phase (30 detik observasi background)
  - Persistent browser profile support
  - Endpoint collection dan analisis

Backward-compatible dengan batch_logger.py: kelas NetworkLogger, run(), save_csv(), get_summary().

Usage:
    python network_logger_v2.py <path_to_extension> [--timeout 300] [--output traffic_log.csv] [--profile <profile_dir>]
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
    print("ERROR: playwright belum terinstall. Jalankan: pip install playwright && playwright install chromium")
    sys.exit(1)

# ─── Canary Data ──────────────────────────────────────────────────────
# Data "umpan" yang di-inject ke browser. Jika muncul di request keluar,
# berarti ekstensi melakukan exfiltration data pengguna.

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

# ─── Anti-Sandbox Cookies ────────────────────────────────────────────
# Cookie palsu untuk meniru browsing history normal, agar malware yang
# punya sandbox detection tidak mengenali environment ini sebagai sandbox.

ANTI_SANDBOX_COOKIES = [
    {"name": "NID", "value": "511=abc123", "domain": ".google.com", "path": "/"},
    {"name": "SID", "value": "g.a000xyz", "domain": ".google.com", "path": "/"},
    {"name": "PREF", "value": "tz=Asia.Jakarta", "domain": ".youtube.com", "path": "/"},
    {"name": "li_at", "value": "AQEDATfake123", "domain": ".linkedin.com", "path": "/"},
]

# ─── Test Scenarios (12 skenario) ────────────────────────────────────
# Setiap skenario mengunjungi URL dan menjalankan aksi tertentu untuk
# memicu perilaku berbahaya dari ekstensi.

SCENARIOS = [
    # --- Live Sites First ---
    {
        "name": "linkedin",
        "url": "https://www.linkedin.com/feed/",
        "description": "LinkedIn - target scraper",
        "actions": ["scroll", "click_links_generic"],
    },
    {
        "name": "facebook",
        "url": "https://www.facebook.com/",
        "description": "Facebook - target session hijacker",
        "actions": ["scroll", "wait_long"],
    },
    {
        "name": "tiktok",
        "url": "https://www.tiktok.com/",
        "description": "TikTok - target session hijacker",
        "actions": ["scroll", "wait_long"],
    },
    {
        "name": "gmail",
        "url": "https://mail.google.com/mail/u/0/",
        "description": "Gmail - target session hijacker",
        "actions": ["scroll", "wait_long"],
    },
    # --- Honeypot ---
    {
        "name": "honeypot_http",
        "url": "http://chocoffee.biz.id/",
        "description": "HTTP honeypot dengan login form & download",
        "actions": ["inject_cookie", "inject_login", "fill_form", "copy_paste_fake_data", "scroll", "inject_download", "click_download"],
    },
    # --- File Access ---
    {
        "name": "file_download",
        "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "description": "Download PDF - monitor intersepsi file",
        "actions": ["wait_long"],
    },
    {
        "name": "local_file",
        "url": "about:blank",
        "description": "Simulasi file lokal via data URI",
        "actions": ["open_local_file"],
    },
    # --- Login Pages ---
    {
        "name": "login_heroku",
        "url": "https://the-internet.herokuapp.com/login",
        "description": "Halaman login test nyata",
        "actions": ["fill_real_login", "scroll"],
    },
    # --- Form Testing ---
    {
        "name": "httpbin_form",
        "url": "https://httpbin.org/forms/post",
        "description": "HTTPBin form testing",
        "actions": ["fill_httpbin", "scroll"],
    },
]

# Konfigurasi capture response body
MAX_RESPONSE_BODY = 2000  # karakter
BODY_CAPTURE_TYPES = {"document", "xhr", "fetch", "script", "other"}

# Kolom CSV — backward-compatible (kolom baru ditambahkan di akhir)
CSV_FIELDS = [
    "extension_id", "extension_name", "manifest_version",
    "timestamp", "visited_page", "scenario",
    "request_url", "request_method", "request_domain", "resource_type",
    "request_headers", "post_data",
    "response_status", "response_headers", "response_body_preview",
    "is_from_extension", "frame_url",
    "contains_canary", "canary_found",
    # --- Kolom baru V2 (backward-compatible, ditambah di akhir) ---
    "dom_injected_elements",   # JSON list elemen yang di-inject ekstensi ke DOM
    "api_calls_detected",      # JSON list Chrome API calls yang terdeteksi via CDP
]


class NetworkLogger:
    """Logger trafik jaringan komprehensif untuk satu ekstensi Chrome.

    Antarmuka publik (backward-compatible dengan batch_logger.py):
        - run()         → Jalankan browser, eksekusi skenario, tangkap trafik
        - save_csv()    → Simpan trafik ke CSV
        - get_summary() → Kembalikan ringkasan dict
    """

    def __init__(self, ext_dir, timeout=180, output_csv=None, profile_dir=None):
        self.ext_dir = os.path.abspath(ext_dir)
        self.manifest_path = os.path.join(self.ext_dir, "manifest.json")
        self.manifest = self._load_manifest()
        self.timeout = timeout
        self.output_csv = output_csv
        self.profile_dir = profile_dir  # Jika di-set, gunakan profil persisten

        # Metadata ekstensi
        self.ext_id = self._get_ext_id()
        self.ext_name = self._get_ext_name()
        self.manifest_version = self.manifest.get("manifest_version", "?")

        # State saat runtime
        self.traffic_log = []
        self.current_scenario = "setup"
        self.current_visited_url = ""

        # Storage untuk fitur V2
        self.dom_injections_per_scenario = {}  # {scenario_name: [injected_elements]}
        self.api_calls_detected = []           # Console-based API call detections
        self._temp_local_file = None           # Path file HTML lokal sementara

    # ── Helper Methods ────────────────────────────────────────────────

    def _load_manifest(self):
        """Muat manifest.json ekstensi. Menangani BOM dan error encoding."""
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
        """Ekstrak ID ekstensi dari nama direktori."""
        import re
        dirname = os.path.basename(self.ext_dir)
        if re.match(r"^[a-p]{32}$", dirname):
            return dirname
        parts = dirname.split("__")
        if len(parts) >= 2:
            return parts[-1].split("_v")[0] if "_v" in parts[-1] else parts[-1]
        return dirname

    def _get_ext_name(self):
        """Ambil nama ekstensi dari manifest (dengan fallback)."""
        name = self.manifest.get("name", "")
        if name.startswith("__MSG_"):
            name = self.manifest.get("short_name", name)
        return name or os.path.basename(self.ext_dir)

    def _check_canary(self, text):
        """Periksa apakah teks mengandung data canary. Return (bool, list_found)."""
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

    def _prepare_user_data_dir(self):
        """Siapkan direktori data pengguna. Jika profile_dir di-set, salin isinya."""
        if self.profile_dir and os.path.isdir(self.profile_dir):
            # Salin profil ke lokasi sementara agar tidak merusak profil asli
            user_data_dir = tempfile.mkdtemp(prefix="see_netlog_")
            print(f"    [PROFIL] Menyalin profil dari {self.profile_dir}...")
            for item in os.listdir(self.profile_dir):
                s = os.path.join(self.profile_dir, item)
                d = os.path.join(user_data_dir, item)
                try:
                    if os.path.isdir(s):
                        shutil.copytree(s, d)
                    else:
                        shutil.copy2(s, d)
                except Exception:
                    pass
            print(f"    [PROFIL] Profil berhasil disalin ke {user_data_dir}")
        else:
            user_data_dir = tempfile.mkdtemp(prefix="see_netlog_")
        return user_data_dir

    def _create_temp_local_file(self):
        """Buat file HTML sementara berisi konten sensitif palsu.
        Digunakan untuk menguji ekstensi yang memantau akses file lokal."""
        content = """<!DOCTYPE html>
<html>
<head><title>Personal Banking Statement - CONFIDENTIAL</title></head>
<body>
<h1>Bank Statement - John Doe</h1>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
<tr><th>Date</th><th>Description</th><th>Amount</th><th>Balance</th></tr>
<tr><td>2026-07-01</td><td>Salary Deposit</td><td>+$5,250.00</td><td>$12,450.00</td></tr>
<tr><td>2026-07-03</td><td>Amazon Purchase</td><td>-$129.99</td><td>$12,320.01</td></tr>
<tr><td>2026-07-05</td><td>Wire Transfer - Savings</td><td>-$2,000.00</td><td>$10,320.01</td></tr>
</table>
<h2>Saved Passwords</h2>
<pre>
gmail.com       : johndoe@gmail.com / MyS3cureP@ss!2026
bankofamerica   : john.doe.123 / B@nk!ng_Passw0rd
coinbase.com    : jdoe_crypto / Crypt0_Tr@d3r_99
</pre>
<h2>Credit Card Information</h2>
<p>Card: 4532-XXXX-XXXX-7891 | Exp: 12/28 | CVV: 321</p>
<p>Account: canary_admin_user | Token: CANARY_SESSION_XYZ999</p>
</body>
</html>"""
        # Buat file sementara dengan ekstensi .html
        fd, filepath = tempfile.mkstemp(prefix="see_bankstmt_", suffix=".html")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
        self._temp_local_file = filepath
        return filepath

    def _cleanup_temp_files(self):
        """Hapus file sementara yang dibuat selama pengujian."""
        if self._temp_local_file and os.path.exists(self._temp_local_file):
            try:
                os.remove(self._temp_local_file)
            except Exception:
                pass

    # ── DOM Mutation Observer ─────────────────────────────────────────

    def _inject_dom_observer(self, page):
        """Inject MutationObserver ke halaman untuk mendeteksi elemen yang
        ditambahkan oleh ekstensi (img, script, iframe, link, object, embed)."""
        try:
            page.evaluate("""
                window.__ext_injected_elements = [];
                const observer = new MutationObserver(mutations => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === 1) {
                                const tag = node.tagName.toLowerCase();
                                if (['img', 'script', 'iframe', 'link', 'object', 'embed'].includes(tag)) {
                                    const src = node.src || node.href || node.data || '';
                                    if (src && !src.startsWith('data:') && !src.startsWith('chrome-extension://')) {
                                        window.__ext_injected_elements.push({
                                            tag: tag,
                                            src: src,
                                            timestamp: new Date().toISOString()
                                        });
                                    }
                                }
                            }
                        }
                    }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
            """)
        except Exception:
            pass

    def _collect_dom_injections(self, page):
        """Kumpulkan elemen yang di-inject oleh ekstensi ke dalam DOM."""
        try:
            injections = page.evaluate("window.__ext_injected_elements || []")
            return injections
        except Exception:
            return []

    # ── Enhanced CDP Monitoring ───────────────────────────────────────

    def _setup_enhanced_cdp(self, page_obj, ext_initiated_urls):
        """Setup CDP session dengan monitoring enhanced:
        - Network requests dari ekstensi (callstack analysis)
        - Console API calls (deteksi C2 URLs)
        - Runtime events
        """
        try:
            cdp = page_obj.context.new_cdp_session(page_obj)
            cdp.send("Network.enable")
            cdp.send("Runtime.enable")

            # Monitor request dari ekstensi via analisis callstack
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

            # Monitor console messages dari ekstensi (sering mengungkap C2 URLs)
            def on_console(event):
                try:
                    args = event.get("args", [])
                    for arg in args:
                        msg = arg.get("value", "")
                        if msg and isinstance(msg, str):
                            msg_lower = msg.lower()
                            # Deteksi kata kunci terkait komunikasi jaringan
                            keywords = ["http", "fetch", "send", "post", "upload",
                                        "websocket", "exfil", "beacon", "ajax"]
                            if any(kw in msg_lower for kw in keywords):
                                self.api_calls_detected.append({
                                    "type": "console_api",
                                    "message": str(msg)[:500],
                                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                                    "scenario": self.current_scenario,
                                })
                except Exception:
                    pass

            cdp.on("Runtime.consoleAPICalled", on_console)

        except Exception:
            pass

    # ── Anti-Sandbox Evasion ──────────────────────────────────────────

    def _apply_anti_sandbox(self, context):
        """Terapkan teknik anti-sandbox agar malware tidak mendeteksi
        bahwa ini adalah environment analisis otomatis."""

        # Langkah 1: Tambahkan cookie palsu untuk simulasi riwayat browsing
        print("    [ANTI-SANDBOX] Menambahkan fake browsing cookies...")
        for cookie in ANTI_SANDBOX_COOKIES:
            try:
                context.add_cookies([cookie])
            except Exception:
                pass

        # Langkah 2: Buka beberapa tab untuk simulasi browsing history
        print("    [ANTI-SANDBOX] Melakukan warmup browsing...")
        warmup_urls = ["https://www.google.com", "https://www.youtube.com"]
        for warmup_url in warmup_urls:
            try:
                wp = context.new_page()
                wp.goto(warmup_url, timeout=10000)
                time.sleep(2)
                wp.close()
            except Exception:
                pass

    # ── Main Run ──────────────────────────────────────────────────────

    def run(self):
        """Luncurkan browser, jalankan skenario, tangkap trafik jaringan.
        Mengembalikan list traffic_log."""
        if not self.manifest:
            print(f"  ⚠ Tidak ada manifest.json yang valid di {self.ext_dir}")
            return []

        # Siapkan direktori data pengguna (dengan dukungan persistent profile)
        user_data_dir = self._prepare_user_data_dir()
        ext_initiated_urls = set()

        try:
            with sync_playwright() as pw:
                try:
                    context = pw.chromium.launch_persistent_context(
                        user_data_dir,
                        headless=False,
                        channel="chrome",  # WAJIB SAMA dengan setup_test_profile agar cookies bisa di-decrypt di Windows
                        timeout=30000,
                        args=[
                            f"--disable-extensions-except={self.ext_dir}",
                            f"--load-extension={self.ext_dir}",
                            "--no-first-run",
                            "--no-default-browser-check",
                            "--disable-popup-blocking",
                            "--suppress-message-center-popups",
                            "--disable-component-update",
                            "--disable-blink-features=AutomationControlled",
                            "--disable-features=PrivateNetworkAccessPermissionPrompt,BlockInsecurePrivateNetworkRequests",
                        ],
                        ignore_default_args=["--enable-automation"],
                    )
                except Exception as e:
                    print(f"  [WARN] Gagal launch channel='chrome', mencoba default Chromium: {e}")
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
                            "--disable-blink-features=AutomationControlled",
                            "--disable-features=PrivateNetworkAccessPermissionPrompt,BlockInsecurePrivateNetworkRequests",
                        ],
                        ignore_default_args=["--enable-automation"],
                    )
                # Otomatis terima dialog (alert, confirm, prompt)
                context.on("dialog", lambda d: d.accept())

                # ── Anti-Sandbox: inject fake data sebelum skenario ───
                self._apply_anti_sandbox(context)

                # ── CDP: lacak request yang diinisiasi ekstensi ────────
                def attach_cdp(page_obj):
                    self._setup_enhanced_cdp(page_obj, ext_initiated_urls)

                # ── Response handler (penangkap utama) ────────────────
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

                        # Apakah diinisiasi oleh ekstensi?
                        is_ext = url in ext_initiated_urls
                        frame_url = ""
                        try:
                            if req.frame:
                                frame_url = req.frame.url or ""
                                if frame_url.startswith("chrome-extension://"):
                                    is_ext = True
                        except Exception:
                            pass

                        # Detail response
                        resp_status = response.status
                        resp_hdrs = {}
                        try:
                            resp_hdrs = dict(response.headers)
                        except Exception:
                            pass

                        # Preview response body (hanya untuk tipe yang relevan)
                        resp_body = ""
                        if resource_type in BODY_CAPTURE_TYPES:
                            try:
                                raw_body = response.body()
                                resp_body = raw_body.decode("utf-8", errors="replace")[:MAX_RESPONSE_BODY]
                            except Exception:
                                resp_body = ""

                        # Cek canary
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
                            # Kolom V2 — akan diisi "" untuk request biasa
                            "dom_injected_elements": "",
                            "api_calls_detected": "",
                        })
                    except Exception:
                        pass

                # ── Handler request gagal ─────────────────────────────
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
                            # Kolom V2
                            "dom_injected_elements": "",
                            "api_calls_detected": "",
                        })
                    except Exception:
                        pass

                # ── Pasang event handler ──────────────────────────────
                context.on("response", on_response)
                context.on("requestfailed", on_request_failed)

                # Tunggu ekstensi selesai dimuat
                self.current_scenario = "extension_init"
                time.sleep(3)

                # Siapkan halaman utama
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

                # ── Jalankan skenario pengujian ───────────────────────
                time_per_scenario = max(10, self.timeout // len(SCENARIOS))

                for i, sc in enumerate(SCENARIOS):
                    self.current_scenario = sc["name"]
                    self.current_visited_url = sc["url"]
                    print(f"    [{i+1}/{len(SCENARIOS)}] {sc['name']} -> {sc['url']}")

                    try:
                        page.goto(sc["url"], timeout=15000)
                        page.wait_for_load_state("load", timeout=5000)
                    except PWTimeout:
                        print(f"         Timeout saat memuat halaman, melanjutkan...")
                    except Exception as e:
                        print(f"         Gagal memuat halaman: {type(e).__name__}")
                        continue

                    # Inject DOM MutationObserver setelah halaman dimuat
                    self._inject_dom_observer(page)

                    # Jalankan aksi-aksi untuk skenario ini
                    for action in sc["actions"]:
                        try:
                            self._do_action(page, action)
                        except Exception:
                            pass

                    # Periode observasi per skenario
                    print(f"         Mengobservasi selama {time_per_scenario} detik...")
                    time.sleep(time_per_scenario)

                    # Kumpulkan elemen yang di-inject oleh ekstensi ke DOM
                    injected = self._collect_dom_injections(page)
                    if injected:
                        self.dom_injections_per_scenario[sc["name"]] = injected
                        print(f"         [DOM] Terdeteksi {len(injected)} elemen yang di-inject!")
                        # Tambahkan entri khusus ke traffic_log untuk setiap injeksi DOM
                        for inj in injected:
                            src_url = inj.get("src", "")
                            src_domain = ""
                            try:
                                src_domain = urlparse(src_url).netloc
                            except Exception:
                                pass
                            self.traffic_log.append({
                                "extension_id": self.ext_id,
                                "extension_name": self.ext_name,
                                "manifest_version": self.manifest_version,
                                "timestamp": inj.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]),
                                "visited_page": self.current_visited_url,
                                "scenario": self.current_scenario,
                                "request_url": src_url[:2000],
                                "request_method": "DOM_INJECT",
                                "request_domain": src_domain,
                                "resource_type": f"dom_{inj.get('tag', 'unknown')}",
                                "request_headers": "",
                                "post_data": "",
                                "response_status": "INJECTED",
                                "response_headers": "",
                                "response_body_preview": "",
                                "is_from_extension": True,
                                "frame_url": self.current_visited_url,
                                "contains_canary": False,
                                "canary_found": "",
                                "dom_injected_elements": json.dumps([inj], ensure_ascii=False),
                                "api_calls_detected": "",
                            })

                # ── Fase observasi idle ───────────────────────────────
                # Banyak malware yang aktif setelah pengguna berhenti berinteraksi
                self.current_scenario = "idle_observation"
                self.current_visited_url = "about:blank"
                print(f"    [IDLE] Mengobservasi aktivitas background selama 30 detik...")
                try:
                    page.goto("about:blank")
                except Exception:
                    pass
                time.sleep(30)

                # Tambahkan API calls yang terdeteksi ke entri terakhir jika ada
                if self.api_calls_detected:
                    print(f"    [CDP] Terdeteksi {len(self.api_calls_detected)} console API calls mencurigakan")
                    # Buat satu entri ringkasan untuk API calls
                    self.traffic_log.append({
                        "extension_id": self.ext_id,
                        "extension_name": self.ext_name,
                        "manifest_version": self.manifest_version,
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
                        "visited_page": "about:blank",
                        "scenario": "api_call_summary",
                        "request_url": "",
                        "request_method": "CDP_CONSOLE",
                        "request_domain": "",
                        "resource_type": "console_api",
                        "request_headers": "",
                        "post_data": "",
                        "response_status": "DETECTED",
                        "response_headers": "",
                        "response_body_preview": "",
                        "is_from_extension": True,
                        "frame_url": "",
                        "contains_canary": False,
                        "canary_found": "",
                        "dom_injected_elements": "",
                        "api_calls_detected": json.dumps(self.api_calls_detected, ensure_ascii=False)[:5000],
                    })

                # Tutup browser
                try:
                    context.close()
                except Exception:
                    pass

        except Exception as e:
            print(f"  [ERROR] FATAL: {type(e).__name__}: {e}")
            traceback.print_exc()
        finally:
            # Bersihkan file sementara
            self._cleanup_temp_files()
            try:
                shutil.rmtree(user_data_dir, ignore_errors=True)
            except Exception:
                pass

        return self.traffic_log

    # ── Scenario Actions ──────────────────────────────────────────────

    def _do_action(self, page, action):
        """Jalankan aksi individual. Mendukung aksi asli + aksi baru V2."""

        if action == "inject_cookie":
            # Menanamkan cookie sesi palsu untuk memancing eksfiltrasi
            try:
                page.context.add_cookies([
                    {
                        "name": "session_token",
                        "value": "ADMIN_SECRET_123_CANARY",
                        "url": page.url
                    }
                ])
                time.sleep(1)
            except Exception:
                pass

        elif action == "copy_paste_fake_data":
            # Simulasi block teks dan copy password
            try:
                page.evaluate("""
                    const div = document.createElement('div');
                    div.id = 'canary-copy-container';
                    div.textContent = 'Password: canary_P@ssw0rd_Secret!';
                    div.style.cssText = 'position:fixed;top:0;left:0;opacity:0.1;z-index:9999;';
                    document.body.appendChild(div);
                    
                    const range = document.createRange();
                    range.selectNode(div);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                    document.execCommand('copy');
                """)
                time.sleep(2)
            except Exception:
                pass

        elif action == "inject_login":
            # Inject form login honeypot ke halaman
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
            # Isi form honeypot dengan data canary
            try:
                page.fill("#hp-user", CANARY_FORM_DATA["username"])
                time.sleep(0.5)
                page.fill("#hp-email", CANARY_FORM_DATA["email"])
                time.sleep(0.5)
                page.fill("#hp-pass", CANARY_FORM_DATA["password"])
                time.sleep(2)  # Beri waktu ekstensi untuk membaca DOM
                page.click("#hp-submit")
                time.sleep(2)
            except Exception:
                pass

        elif action == "fill_real_login":
            # Isi form login nyata (Heroku test app) dengan data canary
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
            # Isi form HTTPBin dengan data canary
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
            # Scroll halaman secara perlahan (simulasi pengguna membaca)
            for _ in range(4):
                try:
                    page.evaluate("window.scrollBy(0, 300)")
                    time.sleep(0.8)
                except Exception:
                    pass

        elif action == "click_links":
            # Klik link Wikipedia (link dengan prefix /wiki/)
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

        elif action == "click_links_generic":
            # Klik link generik di halaman mana pun (2-3 link pertama yang visible)
            try:
                links = page.evaluate("""
                    (() => {
                        const all = document.querySelectorAll('a[href]');
                        const visible = [];
                        for (const a of all) {
                            if (visible.length >= 5) break;
                            const rect = a.getBoundingClientRect();
                            const href = a.getAttribute('href') || '';
                            // Filter: hanya link yang terlihat dan bukan anchor/javascript
                            if (rect.width > 0 && rect.height > 0
                                && !href.startsWith('#')
                                && !href.startsWith('javascript:')
                                && !href.startsWith('mailto:')
                                && href.length > 1) {
                                visible.push(href);
                            }
                        }
                        return visible;
                    })()
                """)
                clicked = 0
                for href in links[:3]:
                    try:
                        # Gunakan selector berdasarkan href
                        link_el = page.query_selector(f"a[href='{href}']")
                        if link_el:
                            link_el.click()
                            time.sleep(3)
                            page.go_back()
                            time.sleep(1)
                            clicked += 1
                    except Exception:
                        pass
                    if clicked >= 2:
                        break
            except Exception:
                pass

        elif action == "inject_download":
            # Inject link download umpan ke halaman
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
            # Klik link download umpan
            try:
                page.click("#bait-download")
                time.sleep(3)
            except Exception:
                pass

        elif action == "wait_long":
            # Tunggu lama — memberi waktu malware untuk aktif
            print(f"         [WAIT] Menunggu 15 detik (memberi waktu malware aktif)...")
            time.sleep(15)

        elif action == "open_local_file":
            # Buat file HTML lokal berisi konten sensitif palsu, lalu navigasi
            # ke file tersebut via file:// protocol. Menguji ekstensi yang
            # memantau akses file lokal.
            try:
                filepath = self._create_temp_local_file()
                file_url = f"file:///{filepath.replace(os.sep, '/')}"
                print(f"         [LOCAL] Membuka file lokal: {filepath}")
                page.goto(file_url, timeout=15000)
                time.sleep(5)  # Beri waktu ekstensi membaca konten lokal
            except Exception as e:
                print(f"         [LOCAL] Gagal membuka file lokal: {type(e).__name__}")

    # ── CSV Output ────────────────────────────────────────────────────

    def save_csv(self, filepath=None):
        """Simpan trafik yang tertangkap ke CSV. Buat header jika file baru.

        Logic filter:
          - Simpan jika diinisiasi ekstensi (is_from_extension)
          - ATAU mengandung data canary (contains_canary)
          - ATAU merupakan injeksi DOM (request_method == 'DOM_INJECT')
          - ATAU merupakan ringkasan API calls (request_method == 'CDP_CONSOLE')
        """
        filepath = filepath or self.output_csv
        if not filepath:
            filepath = f"traffic_{self.ext_id}.csv"
        if not self.traffic_log:
            print(f"  [INFO] Tidak ada trafik yang tertangkap untuk {self.ext_name}.")
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
                # LOGIC FILTER: simpan hanya yang relevan
                is_relevant = (
                    entry.get("is_from_extension")
                    or entry.get("contains_canary")
                    or entry.get("request_method") == "DOM_INJECT"
                    or entry.get("request_method") == "CDP_CONSOLE"
                )
                if not is_relevant:
                    continue

                # Sanitasi semua nilai string agar tidak merusak CSV
                clean = {}
                for k, v in entry.items():
                    if isinstance(v, str):
                        # Ganti newlines/tabs/null bytes dengan spasi
                        v = v.replace("\r\n", " ").replace("\n", " ").replace("\r", " ")
                        v = v.replace("\x00", "")
                    clean[k] = v
                writer.writerow(clean)
                saved_count += 1

        noise_count = len(self.traffic_log) - saved_count
        print(f"  [SAVED] {saved_count} baris request relevan -> {filepath} "
              f"(Difilter {noise_count} request noise)")
        return filepath

    # ── Summary ───────────────────────────────────────────────────────

    def get_summary(self):
        """Kembalikan dict ringkasan temuan. Backward-compatible + field baru V2."""
        total = len(self.traffic_log)
        ext_reqs = [r for r in self.traffic_log if r.get("is_from_extension")]
        canary_hits = [r for r in self.traffic_log if r.get("contains_canary")]
        failed = [r for r in self.traffic_log if str(r.get("response_status", "")).startswith("FAILED")]
        post_reqs = [r for r in self.traffic_log if r.get("request_method") == "POST"]
        dom_injects = [r for r in self.traffic_log if r.get("request_method") == "DOM_INJECT"]

        unique_domains = set(r.get("request_domain", "") for r in self.traffic_log if r.get("request_domain"))
        ext_domains = set(r.get("request_domain", "") for r in ext_reqs if r.get("request_domain"))

        return {
            # Backward-compatible fields
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
            # Field baru V2
            "dom_injections": len(dom_injects),
            "dom_injection_details": [
                {"url": d["request_url"][:150], "type": d["resource_type"], "scenario": d["scenario"]}
                for d in dom_injects
            ],
            "api_calls_detected": len(self.api_calls_detected),
            "scenarios_run": len(SCENARIOS),
        }

    # ── Endpoint Collection (V2) ──────────────────────────────────────

    def get_all_endpoints(self):
        """Ekstrak semua endpoint/domain unik yang dihubungi, dikelompokkan
        berdasarkan sumber asal request."""
        endpoints = {
            "from_extension": set(),
            "from_dom_injection": set(),
            "canary_leaked_to": set(),
            "all_domains": set(),
        }

        for entry in self.traffic_log:
            domain = entry.get("request_domain", "")
            if domain:
                endpoints["all_domains"].add(domain)

            # Request yang diinisiasi ekstensi
            if entry.get("is_from_extension"):
                req_url = entry.get("request_url", "")
                if req_url:
                    endpoints["from_extension"].add(req_url[:200])

            # Injeksi DOM
            if entry.get("request_method") == "DOM_INJECT" and domain:
                endpoints["from_dom_injection"].add(domain)

            # Domain tujuan kebocoran data canary
            # Kecualikan domain test yang memang digunakan untuk pengujian
            if entry.get("contains_canary"):
                test_domains = {
                    "the-internet.herokuapp.com",
                    "httpbin.org",
                    "chocoffee.biz.id",
                    "pingmee.biz.id",
                }
                if domain and domain not in test_domains:
                    endpoints["canary_leaked_to"].add(domain)

        # Konversi set ke sorted list
        return {k: sorted(v) for k, v in endpoints.items()}


# ── CLI ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Network Traffic Logger V2 untuk Ekstensi Chrome (Enhanced)"
    )
    parser.add_argument("extension", help="Path ke direktori ekstensi yang di-unpack")
    parser.add_argument("--timeout", type=int, default=300,
                        help="Total waktu observasi dalam detik (default: 300)")
    parser.add_argument("--output", default=None,
                        help="Path file CSV output")
    parser.add_argument("--profile", default=None,
                        help="Path ke profil browser persisten (sudah login)")
    args = parser.parse_args()

    logger = NetworkLogger(
        args.extension,
        timeout=args.timeout,
        output_csv=args.output,
        profile_dir=args.profile,
    )

    print(f"\n{'='*70}")
    print(f"  NETWORK TRAFFIC LOGGER V2 (Enhanced)")
    print(f"{'='*70}")
    print(f"  Ekstensi    : {logger.ext_name}")
    print(f"  ID          : {logger.ext_id}")
    print(f"  Manifest    : v{logger.manifest_version}")
    print(f"  Timeout     : {args.timeout}s ({args.timeout // len(SCENARIOS)}s per skenario)")
    print(f"  Skenario    : {len(SCENARIOS)}")
    print(f"  Profil      : {args.profile or '(sementara)'}")
    print(f"{'='*70}\n")
    print(f"  Fitur V2 aktif:")
    print(f"    ✓ Anti-sandbox evasion (fake cookies + warmup browsing)")
    print(f"    ✓ DOM MutationObserver (deteksi injeksi elemen)")
    print(f"    ✓ Enhanced CDP monitoring (console API + Service Worker)")
    print(f"    ✓ Idle observation phase (30 detik)")
    print(f"    ✓ 12 skenario pengujian (high-value targets, file access, dll)")
    if args.profile:
        print(f"    ✓ Persistent profile: {args.profile}")
    print(f"{'='*70}\n")

    traffic = logger.run()
    csv_path = logger.save_csv()
    summary = logger.get_summary()
    endpoints = logger.get_all_endpoints()

    print(f"\n{'='*70}")
    print(f"  RINGKASAN HASIL ANALISIS")
    print(f"{'─'*70}")
    print(f"  Total request tertangkap       : {summary['total_requests']}")
    print(f"  Diinisiasi ekstensi            : {summary['extension_initiated']}")
    print(f"  Request POST                   : {summary['post_requests']}")
    print(f"  Request gagal                  : {summary['failed_requests']}")
    print(f"  Domain unik dihubungi          : {summary['unique_domains']}")
    print(f"  Data canary dalam trafik       : {summary['canary_hits']}")
    print(f"  Injeksi DOM terdeteksi         : {summary['dom_injections']}")
    print(f"  Console API calls terdeteksi   : {summary['api_calls_detected']}")
    print(f"  Skenario dijalankan            : {summary['scenarios_run']}")

    if summary["canary_hits"] > 0:
        print(f"\n  [!] DATA CANARY DITEMUKAN DALAM TRAFIK KELUAR:")
        for h in summary["canary_details"]:
            print(f"     -> {h['method']} {h['url']}")
            print(f"       Canary: {h['canary']}")

    if summary["dom_injections"] > 0:
        print(f"\n  [!] INJEKSI DOM TERDETEKSI:")
        for d in summary["dom_injection_details"]:
            print(f"     -> [{d['type']}] {d['url']} (skenario: {d['scenario']})")

    if summary["ext_contacted_domains"]:
        print(f"\n  Domain yang dihubungi ekstensi:")
        for d in summary["ext_contacted_domains"]:
            print(f"     - {d}")

    # Tampilkan endpoint analysis
    if endpoints["canary_leaked_to"]:
        print(f"\n  ⚠️  DOMAIN TUJUAN KEBOCORAN CANARY:")
        for d in endpoints["canary_leaked_to"]:
            print(f"     🚨 {d}")

    if endpoints["from_dom_injection"]:
        print(f"\n  Domain dari injeksi DOM:")
        for d in endpoints["from_dom_injection"]:
            print(f"     💉 {d}")

    print(f"\n  📄 Output CSV : {csv_path}")
    print(f"  📊 Total domain unik : {len(endpoints['all_domains'])}")
    print(f"{'='*70}")
