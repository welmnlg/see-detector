"""
Forensic Dynamic Analyzer v2 — SEE Detector
=============================================
PERBAIKAN KRITIS: Hanya menangkap request yang BENAR-BENAR berasal
dari kode ekstensi (Service Worker / Content Script), BUKAN request
dari halaman web yang dikunjungi.

Metode identifikasi:
  1. CDP Session pada Service Worker: Semua request yang keluar dari
     Service Worker ekstensi pasti berasal dari ekstensi.
  2. CDP Initiator Stack pada Page: Untuk content script, kita periksa
     apakah call stack (initiator) mengandung URL chrome-extension://<id>/
"""

import os
import sys
import json
import time
import shutil
import tempfile
import csv
import argparse
import concurrent.futures
from datetime import datetime, timezone
from urllib.parse import urlparse
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Konstanta Default ──────────────────────────────────────────────────

DUMMY_COOKIES = [
    {"name": "session_id",  "value": "FORENSIC_SESSION_a1b2c3d4e5", "domain": ".example.com",  "path": "/"},
    {"name": "auth_token",  "value": "FORENSIC_TOKEN_f6g7h8i9j0",  "domain": ".example.com",  "path": "/"},
    {"name": "user_prefs",  "value": "lang=en&theme=dark&uid=12345", "domain": ".wikipedia.org", "path": "/"},
    {"name": "csrf_token",  "value": "FORENSIC_CSRF_k1l2m3n4o5",  "domain": ".example.com",  "path": "/"},
]

COOKIE_MARKERS = [
    'forensic_session_a1b2c3d4e5', 'forensic_token_f6g7h8i9j0',
    'forensic_csrf_k1l2m3n4o5', 'lang=en&theme=dark&uid=12345',
]

USER_DATA_KEYWORDS = [
    'scroll', 'click', 'href', 'mouse', 'keydown',
    'keypress', 'clipboard', 'copy', 'paste', 'selection',
    'keystroke', 'visited', 'fingerprint', 'canvas', 'webgl',
    'collectclick', 'collectscroll',
]

TARGET_URLS = [
    "https://example.com",
    "https://en.wikipedia.org/wiki/Main_Page",
    "https://httpbin.org/html",
]


class ForensicAnalyzer:
    """Menjalankan analisis forensik pada satu ekstensi, hanya menangkap traffic ekstensi."""

    def __init__(self, ext_dir):
        self.ext_dir = os.path.abspath(ext_dir)
        self.ext_name = os.path.basename(self.ext_dir)
        self.manifest_path = os.path.join(self.ext_dir, 'manifest.json')
        self.manifest = self._load_manifest()
        self.evidence = {
            "extension_id": self.ext_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "manifest_version": self.manifest.get("manifest_version", "N/A"),
            "declared_permissions": [],
            "declared_host_permissions": [],
            "extension_requests": [],         # HANYA request dari ekstensi
            "unauthorized_requests": [],
            "cookie_theft_evidence": [],
            "user_data_exfil_evidence": [],
            "redirect_evidence": [],
            "download_hijack_evidence": [],
            "local_file_access_evidence": [],
            "periodic_sync_evidence": [],
            "see_categories_proven": [],
            "verdict": "BELUM DIANALISIS",
        }
        self.host_permissions = self._get_host_permissions()

    def _load_manifest(self):
        if not os.path.exists(self.manifest_path):
            return {}
        try:
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}

    def _get_host_permissions(self):
        perms = []
        raw_perms = self.manifest.get('permissions', []) + self.manifest.get('host_permissions', [])
        for p in raw_perms:
            if isinstance(p, str) and ('://' in p or p == '<all_urls>'):
                perms.append(p)
        self.evidence["declared_permissions"] = self.manifest.get('permissions', [])
        self.evidence["declared_host_permissions"] = self.manifest.get('host_permissions', [])
        return perms

    def _is_unauthorized_domain(self, domain):
        if "<all_urls>" in self.host_permissions:
            return False
        for perm in self.host_permissions:
            try:
                perm_domain = urlparse(perm).netloc
                if perm_domain:
                    if domain == perm_domain:
                        return False
                    if perm_domain.startswith("*.") and domain.endswith(perm_domain[2:]):
                        return False
            except Exception:
                pass
        return True

    def _is_valid_extension(self):
        if not os.path.exists(self.manifest_path):
            return False
        if os.path.getsize(self.manifest_path) < 2:
            return False
        return True

    def run(self):
        """Menjalankan seluruh analisis forensik."""
        print(f"\n{'='*70}")
        print(f"  FORENSIC ANALYSIS v2: {self.ext_name}")
        print(f"{'='*70}")

        if not self._is_valid_extension():
            print(f"  [SKIP] Manifest.json tidak valid.")
            self.evidence["verdict"] = "SKIP — Manifest tidak valid"
            return self.evidence

        user_data_dir = tempfile.mkdtemp()

        # Request yang HANYA berasal dari ekstensi (via CDP)
        sw_requests = []        # Dari Service Worker
        cs_requests = []        # Dari Content Script (via initiator stack)
        request_timestamps = []
        download_events = []

        try:
            with sync_playwright() as p:
                print(f"  [1/8] Meluncurkan peramban Chromium...")
                context = p.chromium.launch_persistent_context(
                    user_data_dir,
                    headless=False,
                    timeout=20000,
                    args=[
                        f"--disable-extensions-except={self.ext_dir}",
                        f"--load-extension={self.ext_dir}",
                        "--no-first-run",
                        "--no-default-browser-check",
                        "--suppress-message-center-popups",
                    ],
                )
                context.on("dialog", lambda dialog: dialog.accept())
                time.sleep(3)

                # ── Identifikasi Extension ID ─────────────────────────
                extension_id = None
                if context.service_workers:
                    extension_id = context.service_workers[0].url.split("/")[2]
                elif context.background_pages:
                    extension_id = context.background_pages[0].url.split("/")[2]
                print(f"  [INFO] Extension ID: {extension_id or 'Tidak terdeteksi'}")

                if not extension_id:
                    print(f"  [WARN] Extension ID tidak terdeteksi. Tidak bisa membedakan traffic.")

                # ══════════════════════════════════════════════════════
                # METODE 1: CDP Session pada Service Worker
                # Menangkap SEMUA request yang keluar dari SW ekstensi
                # ══════════════════════════════════════════════════════
                sw_cdp = None
                print(f"  [2/8] Memasang penyadap CDP pada Service Worker...")
                if context.service_workers and extension_id:
                    sw = context.service_workers[0]
                    try:
                        sw_cdp = context.new_cdp_session(sw)
                        sw_cdp.send("Network.enable")

                        def on_sw_request(event):
                            request = event.get("request", {})
                            url = request.get("url", "")
                            # Abaikan request internal ekstensi itu sendiri
                            if url.startswith("chrome-extension://") or url.startswith("data:"):
                                return
                            req_data = {
                                "url": url,
                                "method": request.get("method", "GET"),
                                "domain": urlparse(url).netloc,
                                "post_data": request.get("postData"),
                                "source": "Service Worker",
                                "timestamp": time.time(),
                                "timestamp_readable": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                            }
                            sw_requests.append(req_data)
                            request_timestamps.append(time.time())

                        sw_cdp.on("Network.requestWillBeSent", on_sw_request)
                        print(f"        CDP SW listener aktif.")
                    except Exception as e:
                        print(f"        Gagal membuat CDP session pada SW: {e}")
                elif context.background_pages and extension_id:
                    # MV2: background page
                    bg = context.background_pages[0]
                    try:
                        sw_cdp = context.new_cdp_session(bg)
                        sw_cdp.send("Network.enable")

                        def on_bg_request(event):
                            request = event.get("request", {})
                            url = request.get("url", "")
                            if url.startswith("chrome-extension://") or url.startswith("data:"):
                                return
                            req_data = {
                                "url": url,
                                "method": request.get("method", "GET"),
                                "domain": urlparse(url).netloc,
                                "post_data": request.get("postData"),
                                "source": "Background Page",
                                "timestamp": time.time(),
                                "timestamp_readable": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                            }
                            sw_requests.append(req_data)
                            request_timestamps.append(time.time())

                        sw_cdp.on("Network.requestWillBeSent", on_bg_request)
                        print(f"        CDP Background Page listener aktif.")
                    except Exception as e:
                        print(f"        Gagal membuat CDP session pada BG: {e}")
                else:
                    print(f"        Tidak ada Service Worker / Background Page.")

                # ══════════════════════════════════════════════════════
                # METODE 2: CDP Session pada Page — filter by initiator
                # Menangkap request dari Content Script ekstensi
                # ══════════════════════════════════════════════════════
                page = context.new_page()
                page_cdp = None

                if extension_id:
                    print(f"  [3/8] Memasang penyadap CDP pada Page (filter initiator)...")
                    try:
                        page_cdp = context.new_cdp_session(page)
                        page_cdp.send("Network.enable")

                        def on_page_request(event):
                            request = event.get("request", {})
                            url = request.get("url", "")

                            if url.startswith("chrome-extension://") or url.startswith("data:"):
                                return

                            # Periksa apakah request ini diinisiasi oleh extension
                            initiator = event.get("initiator", {})
                            is_from_extension = False

                            # Cek 1: Initiator URL langsung
                            init_url = initiator.get("url", "")
                            if extension_id and f"chrome-extension://{extension_id}" in init_url:
                                is_from_extension = True
                            elif not extension_id and "chrome-extension://" in init_url:
                                is_from_extension = True

                            # Cek 2: Call stack frames
                            if not is_from_extension:
                                stack = initiator.get("stack", {})
                                call_frames = stack.get("callFrames", [])
                                for frame in call_frames:
                                    frame_url = frame.get("url", "")
                                    if extension_id and f"chrome-extension://{extension_id}" in frame_url:
                                        is_from_extension = True
                                        break
                                    elif not extension_id and "chrome-extension://" in frame_url:
                                        is_from_extension = True
                                        break

                                # Cek juga parent stack (async call stacks)
                                if not is_from_extension:
                                    parent = stack.get("parent", {})
                                    while parent and not is_from_extension:
                                        for frame in parent.get("callFrames", []):
                                            frame_url = frame.get("url", "")
                                            if extension_id and f"chrome-extension://{extension_id}" in frame_url:
                                                is_from_extension = True
                                                break
                                            elif not extension_id and "chrome-extension://" in frame_url:
                                                is_from_extension = True
                                                break
                                        parent = parent.get("parent")

                            if is_from_extension:
                                req_data = {
                                    "url": url,
                                    "method": request.get("method", "GET"),
                                    "domain": urlparse(url).netloc,
                                    "post_data": request.get("postData"),
                                    "source": "Content Script",
                                    "timestamp": time.time(),
                                    "timestamp_readable": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                                }
                                cs_requests.append(req_data)
                                request_timestamps.append(time.time())

                        page_cdp.on("Network.requestWillBeSent", on_page_request)
                        print(f"        CDP Page initiator listener aktif.")
                    except Exception as e:
                        print(f"        Gagal membuat CDP session pada Page: {e}")

                # ── DOWNLOAD MONITORING ───────────────────────────────
                def handle_download(download):
                    download_events.append({
                        "url": download.url,
                        "suggested_filename": download.suggested_filename,
                        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                    })
                    download.cancel()
                page.on("download", handle_download)

                # ── COOKIE INJECTION ──────────────────────────────────
                print(f"  [4/8] Menginjeksikan {len(DUMMY_COOKIES)} dummy cookies...")
                try:
                    context.add_cookies(DUMMY_COOKIES)
                except Exception as e:
                    print(f"        Peringatan: {e}")

                # ══════════════════════════════════════════════════════
                # MAIN BROWSING + SIMULASI SKENARIO
                # ══════════════════════════════════════════════════════
                for i, url in enumerate(TARGET_URLS):
                    print(f"  [5/8] Navigasi ke {url} ({i+1}/{len(TARGET_URLS)})...")
                    try:
                        page.goto(url, wait_until="load", timeout=30000)

                        # Skenario UProf
                        print(f"        Simulasi interaksi pengguna...")
                        page.evaluate("window.scrollBy(0, 1000)")
                        time.sleep(0.3)
                        page.evaluate("window.scrollBy(0, -500)")
                        time.sleep(0.3)

                        try:
                            page.mouse.move(100, 200)
                            page.mouse.move(300, 400)
                            page.mouse.click(200, 300)
                        except Exception:
                            pass

                        try:
                            page.evaluate("""() => {
                                const els = document.querySelectorAll('p, div, a, button, span, h1, h2, h3');
                                for(let i = 0; i < Math.min(5, els.length); i++) {
                                    const idx = Math.floor(Math.random() * els.length);
                                    const el = els[idx];
                                    
                                    // Cegah navigasi agar tidak memicu false positive redirect (HH)
                                    el.addEventListener('click', (e) => e.preventDefault(), {once: true});
                                    el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
                                }
                            }""")
                        except Exception:
                            pass

                        try:
                            page.evaluate("""() => {
                                document.dispatchEvent(new ClipboardEvent('copy', {bubbles: true}));
                                document.dispatchEvent(new ClipboardEvent('paste', {bubbles: true}));
                            }""")
                        except Exception:
                            pass

                        # Skenario UReq
                        try:
                            inputs = page.locator(
                                "input[type='text'], input[type='password'], "
                                "input[type='search'], input[type='email'], textarea"
                            ).all()
                            if inputs:
                                inputs[0].fill("forensic_test_sensitive_data", timeout=2000)
                                inputs[0].press("Enter", timeout=2000)
                        except Exception:
                            pass

                        try:
                            page.evaluate("""() => {
                                ['a','b','c','d','e','f','Enter','Tab','Backspace'].forEach(key => {
                                    document.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
                                    document.dispatchEvent(new KeyboardEvent('keyup', {key, bubbles: true}));
                                });
                            }""")
                        except Exception:
                            pass

                        # Skenario UDown
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

                        # Skenario HH (redirect detection)
                        time.sleep(2)
                        current_url = page.url
                        intended_domain = urlparse(url).netloc
                        current_domain = urlparse(current_url).netloc
                        if intended_domain and current_domain and intended_domain != current_domain:
                            self.evidence["redirect_evidence"].append({
                                "intended_url": url,
                                "intended_domain": intended_domain,
                                "actual_url": current_url,
                                "actual_domain": current_domain,
                                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                            })

                        print(f"        Menunggu 15 detik untuk eksfiltrasi...")
                        time.sleep(15)

                    except Exception as e:
                        print(f"        Error: {e}")

                # Skenario LF
                print(f"  [6/8] Menguji akses file lokal (file://)...")
                try:
                    fd, temp_path = tempfile.mkstemp(suffix=".html")
                    with os.fdopen(fd, 'w') as f:
                        f.write(
                            "<html><body>"
                            "<h1>FORENSIC LOCAL FILE TEST</h1>"
                            "<p>Nama: John Doe | Email: john@example.com</p>"
                            "<p>SSN: 123-45-6789 | Password: SuperSecret123</p>"
                            "</body></html>"
                        )
                    temp_fwd = temp_path.replace('\\', '/')
                    page.goto(f"file:///{temp_fwd}", wait_until="load", timeout=10000)
                    time.sleep(7)
                    try:
                        os.unlink(temp_path)
                    except Exception:
                        pass
                except Exception as e:
                    print(f"        Error uji file lokal: {e}")

                print(f"  [7/8] Menunggu 10 detik tambahan...")
                time.sleep(10)

                context.close()

            # ══════════════════════════════════════════════════════════
            # ANALISIS BUKTI — HANYA dari extension requests
            # ══════════════════════════════════════════════════════════
            all_ext_requests = sw_requests + cs_requests
            self.evidence["extension_requests"] = all_ext_requests

            print(f"  [8/8] Menganalisis traffic ekstensi...")
            print(f"        Request dari Service Worker  : {len(sw_requests)}")
            print(f"        Request dari Content Script   : {len(cs_requests)}")
            print(f"        Total request EKSTENSI        : {len(all_ext_requests)}")
            print(f"        (Request halaman web diabaikan)")

            unauthorized_domains = set()

            for req in all_ext_requests:
                domain = req["domain"]
                post_data = (req.get("post_data") or "")
                post_lower = post_data.lower() if isinstance(post_data, str) else ""

                # Cek Unauthorized Domain
                if self._is_unauthorized_domain(domain):
                    unauthorized_domains.add(domain)
                    self.evidence["unauthorized_requests"].append({
                        "url": req["url"],
                        "method": req["method"],
                        "domain": domain,
                        "post_data_preview": post_data[:500] if post_data else None,
                        "source": req["source"],
                        "timestamp": req.get("timestamp_readable", ""),
                    })

                # Cek Pencurian Cookie
                if any(marker in post_lower for marker in COOKIE_MARKERS):
                    self.evidence["cookie_theft_evidence"].append({
                        "url": req["url"],
                        "domain": domain,
                        "method": req["method"],
                        "post_data_contains_cookie": post_data[:800] if post_data else None,
                        "source": req["source"],
                        "timestamp": req.get("timestamp_readable", ""),
                    })

                # Cek Eksfiltrasi Data Pengguna
                if any(kw in post_lower for kw in USER_DATA_KEYWORDS):
                    matched = [kw for kw in USER_DATA_KEYWORDS if kw in post_lower]
                    self.evidence["user_data_exfil_evidence"].append({
                        "url": req["url"],
                        "domain": domain,
                        "method": req["method"],
                        "matched_keywords": matched,
                        "post_data_preview": post_data[:800] if post_data else None,
                        "source": req["source"],
                        "timestamp": req.get("timestamp_readable", ""),
                    })

            # Periodic Sync
            ext_timestamps = [r["timestamp"] for r in all_ext_requests]
            if len(ext_timestamps) >= 3:
                ext_timestamps.sort()
                intervals = [ext_timestamps[i+1] - ext_timestamps[i] for i in range(len(ext_timestamps)-1)]
                if len(intervals) >= 2:
                    avg = sum(intervals) / len(intervals)
                    if avg > 1.0:
                        variance = sum((iv - avg)**2 for iv in intervals) / len(intervals)
                        if variance < 4.0:
                            self.evidence["periodic_sync_evidence"].append({
                                "total_requests": len(ext_timestamps),
                                "avg_interval_seconds": round(avg, 2),
                                "variance": round(variance, 4),
                            })

            # Download Hijacking
            real_downloads = [d for d in download_events if "TestDownloadContent" not in d["url"]]
            if len(real_downloads) > 0:
                self.evidence["download_hijack_evidence"] = real_downloads

            # ── Tentukan Kategori SEE Terbukti ──
            if self.evidence["cookie_theft_evidence"]:
                self.evidence["see_categories_proven"].append("CE (Cookie Exfiltration)")
            if self.evidence["unauthorized_requests"]:
                self.evidence["see_categories_proven"].append("UReq (Unauthorized Request)")
            if self.evidence["user_data_exfil_evidence"]:
                self.evidence["see_categories_proven"].append("UProf (User Profiling)")
            if self.evidence["redirect_evidence"]:
                self.evidence["see_categories_proven"].append("HH (HTTP Hijacking)")
            if self.evidence["download_hijack_evidence"]:
                self.evidence["see_categories_proven"].append("UDown (Unauthorized Download)")
            if self.evidence["periodic_sync_evidence"]:
                self.evidence["see_categories_proven"].append("Periodic Sync")

            if self.evidence["see_categories_proven"]:
                self.evidence["verdict"] = "TERBUKTI RENTAN SEE"
            else:
                self.evidence["verdict"] = "TIDAK TERBUKTI (Tidak ada traffic ekstensi terdeteksi)"

            print(f"\n        ========================================")
            print(f"        Verdict: {self.evidence['verdict']}")
            if self.evidence["see_categories_proven"]:
                print(f"        Kategori: {', '.join(self.evidence['see_categories_proven'])}")
            print(f"        Unauthorized domains: {len(unauthorized_domains)}")
            print(f"        ========================================")

        except Exception as e:
            import traceback
            traceback.print_exc()
            self.evidence["verdict"] = f"ERROR — {str(e)}"
        finally:
            try:
                shutil.rmtree(user_data_dir, ignore_errors=True)
            except Exception:
                pass

        return self.evidence


def generate_markdown_report(evidence, output_path):
    """Menghasilkan laporan forensik dalam format Markdown."""
    lines = []
    ext_id = evidence["extension_id"]

    lines.append(f"# Laporan Forensik: `{ext_id}`\n")
    lines.append(f"| Field | Nilai |")
    lines.append(f"|---|---|")
    lines.append(f"| **Waktu Analisis** | {evidence['timestamp']} |")
    lines.append(f"| **Manifest Version** | {evidence['manifest_version']} |")
    lines.append(f"| **Permissions** | {', '.join(str(x) for x in evidence['declared_permissions']) or 'Tidak ada'} |")
    lines.append(f"| **Host Permissions** | {', '.join(str(x) for x in evidence['declared_host_permissions']) or 'Tidak ada'} |")
    lines.append(f"| **Total Request DARI EKSTENSI** | {len(evidence['extension_requests'])} |")
    lines.append(f"| **Verdict** | **{evidence['verdict']}** |")
    lines.append(f"| **Kategori SEE Terbukti** | {', '.join(evidence['see_categories_proven']) or '—'} |\n")

    # ── Cookie Theft ──
    lines.append(f"## 1. Bukti Pencurian Cookie (CE)")
    if evidence["cookie_theft_evidence"]:
        lines.append(f"**TERBUKTI** — {len(evidence['cookie_theft_evidence'])} bukti.\n")
        for i, ev in enumerate(evidence["cookie_theft_evidence"], 1):
            lines.append(f"### Bukti CE-{i}")
            lines.append(f"- **URL Tujuan:** `{ev['url']}`")
            lines.append(f"- **Domain:** `{ev['domain']}`")
            lines.append(f"- **Method:** `{ev['method']}`")
            lines.append(f"- **Sumber:** {ev['source']}")
            lines.append(f"- **Waktu:** {ev['timestamp']}")
            if ev.get('post_data_contains_cookie'):
                lines.append(f"- **Isi Payload:**\n```\n{ev['post_data_contains_cookie']}\n```\n")
    else:
        lines.append(f"Tidak ditemukan bukti.\n")

    # ── Unauthorized Requests ──
    lines.append(f"## 2. Bukti Permintaan Tidak Sah (UReq)")
    if evidence["unauthorized_requests"]:
        lines.append(f"**TERBUKTI** — {len(evidence['unauthorized_requests'])} permintaan ke domain unauthorized.\n")
        for i, ev in enumerate(evidence["unauthorized_requests"][:15], 1):
            lines.append(f"### Bukti UReq-{i}")
            lines.append(f"- **URL:** `{ev['url']}`")
            lines.append(f"- **Domain Unauthorized:** `{ev['domain']}`")
            lines.append(f"- **Method:** `{ev['method']}`")
            lines.append(f"- **Sumber:** {ev['source']}")
            lines.append(f"- **Waktu:** {ev['timestamp']}")
            if ev.get('post_data_preview'):
                lines.append(f"- **Payload:**\n```\n{ev['post_data_preview']}\n```")
            lines.append(f"")
        if len(evidence["unauthorized_requests"]) > 15:
            lines.append(f"_...dan {len(evidence['unauthorized_requests'])-15} lainnya._\n")
    else:
        lines.append(f"Tidak ditemukan bukti.\n")

    # ── User Profiling ──
    lines.append(f"## 3. Bukti Eksfiltrasi Data Pengguna (UProf)")
    if evidence["user_data_exfil_evidence"]:
        lines.append(f"**TERBUKTI** — {len(evidence['user_data_exfil_evidence'])} bukti.\n")
        for i, ev in enumerate(evidence["user_data_exfil_evidence"][:10], 1):
            lines.append(f"### Bukti UProf-{i}")
            lines.append(f"- **URL:** `{ev['url']}`")
            lines.append(f"- **Keywords:** {', '.join(ev['matched_keywords'])}")
            lines.append(f"- **Sumber:** {ev['source']}")
            lines.append(f"- **Waktu:** {ev['timestamp']}")
            if ev.get('post_data_preview'):
                lines.append(f"- **Payload:**\n```\n{ev['post_data_preview']}\n```")
            lines.append(f"")
    else:
        lines.append(f"Tidak ditemukan bukti.\n")

    # ── Redirect ──
    lines.append(f"## 4. Bukti Pengalihan HTTP (HH)")
    if evidence["redirect_evidence"]:
        lines.append(f"**TERBUKTI** — {len(evidence['redirect_evidence'])} pengalihan.\n")
        for i, ev in enumerate(evidence["redirect_evidence"], 1):
            lines.append(f"- Intended: `{ev['intended_domain']}` → Actual: `{ev['actual_domain']}` ({ev['timestamp']})")
        lines.append(f"")
    else:
        lines.append(f"Tidak ditemukan bukti.\n")

    # ── Download Hijacking ──
    lines.append(f"## 5. Bukti Pembajakan Unduhan (UDown)")
    if evidence["download_hijack_evidence"]:
        lines.append(f"**TERBUKTI** — {len(evidence['download_hijack_evidence'])} unduhan.\n")
        for ev in evidence["download_hijack_evidence"]:
            lines.append(f"- `{ev['url']}` → `{ev['suggested_filename']}` ({ev['timestamp']})")
        lines.append(f"")
    else:
        lines.append(f"Tidak ditemukan bukti.\n")

    # ── Periodic Sync ──
    lines.append(f"## 6. Bukti Sinkronisasi Periodik")
    if evidence["periodic_sync_evidence"]:
        for ev in evidence["periodic_sync_evidence"]:
            lines.append(f"**TERDETEKSI** — {ev['total_requests']} request, interval {ev['avg_interval_seconds']}s, varians {ev['variance']}\n")
    else:
        lines.append(f"Tidak ditemukan.\n")

    lines.append(f"---\n*Laporan oleh Forensic Dynamic Analyzer v2 — SEE Detector*")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))


import threading
traffic_lock = threading.Lock()

def _save_network_traffic(evidence, output_dir):
    """Menyimpan detail traffic network ke CSV global."""
    csv_path = os.path.join(output_dir, "forensic_network_traffic.csv")
    ext_id = evidence["extension_id"]
    requests = evidence.get("extension_requests", [])
    
    if not requests:
        return
        
    file_exists = os.path.isfile(csv_path)
    
    with traffic_lock:
        with open(csv_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["extension_id", "timestamp", "source", "method", "url", "domain", "post_data_preview", "is_unauthorized", "is_cookie_theft", "is_exfiltration"])
            
            # Helper list of URLs for quick lookup
            unauth_urls = {r["url"] for r in evidence.get("unauthorized_requests", [])}
            cookie_urls = {r["url"] for r in evidence.get("cookie_theft_evidence", [])}
            exfil_urls = {r["url"] for r in evidence.get("user_data_exfil_evidence", [])}
            
            for req in requests:
                url = req.get("url", "")
                post_data = req.get("post_data") or ""
                preview = post_data[:500].replace('\n', ' ').replace('\r', '') if post_data else ""
                
                is_unauth = "Yes" if url in unauth_urls else "No"
                is_cookie = "Yes" if url in cookie_urls else "No"
                is_exfil = "Yes" if url in exfil_urls else "No"
                
                writer.writerow([
                    ext_id,
                    req.get("timestamp_readable", ""),
                    req.get("source", ""),
                    req.get("method", ""),
                    url,
                    req.get("domain", ""),
                    preview,
                    is_unauth,
                    is_cookie,
                    is_exfil
                ])

def _analyze_single_task(ext_path, output_dir):
    """Helper function untuk menjalankan satu task dalam thread."""
    try:
        analyzer = ForensicAnalyzer(ext_path)
        evidence = analyzer.run()
        report_path = os.path.join(output_dir, f"{evidence['extension_id']}_forensic.md")
        generate_markdown_report(evidence, report_path)
        
        # Simpan detail network traffic
        _save_network_traffic(evidence, output_dir)
        
        return {
            "extension_id": evidence["extension_id"],
            "verdict": evidence["verdict"],
            "categories_proven": ", ".join(evidence["see_categories_proven"]),
            "total_ext_requests": len(evidence["extension_requests"]),
            "unauthorized_count": len(evidence["unauthorized_requests"]),
            "cookie_theft": len(evidence["cookie_theft_evidence"]),
            "user_data_exfil": len(evidence["user_data_exfil_evidence"]),
            "redirect": len(evidence["redirect_evidence"]),
            "download_hijack": len(evidence["download_hijack_evidence"]),
        }
    except Exception as e:
        print(f"Error pada {ext_path}: {e}")
        return None

def run_batch_forensics(vulnerable_dir, output_dir, workers=1):
    """Menjalankan batch forensik pada semua ekstensi vulnerable secara konkuren dengan progress bar."""
    os.makedirs(output_dir, exist_ok=True)

    ext_dirs = sorted([
        os.path.join(vulnerable_dir, d)
        for d in os.listdir(vulnerable_dir)
        if os.path.isdir(os.path.join(vulnerable_dir, d))
    ])

    print(f"\n{'#'*70}")
    print(f"  FORENSIC BATCH ANALYSIS v2")
    print(f"  Total Ekstensi: {len(ext_dirs)}")
    print(f"  Output Dir    : {output_dir}")
    print(f"  Workers       : {workers}")
    print(f"{'#'*70}\n")

    # 1. Skip ekstensi yang sudah diforensik (resume capability)
    pending_ext_dirs = []
    for ext_path in ext_dirs:
        ext_id = os.path.basename(ext_path)
        report_file = os.path.join(output_dir, f"{ext_id}_forensic.md")
        if os.path.exists(report_file):
            # Skip if report already exists
            continue
        pending_ext_dirs.append(ext_path)
        
    skipped_count = len(ext_dirs) - len(pending_ext_dirs)
    if skipped_count > 0:
        print(f"[*] Melewati {skipped_count} ekstensi yang sudah di-forensik sebelumnya.")
        
    if not pending_ext_dirs:
        print("[*] Semua ekstensi di direktori ini sudah selesai di-forensik!")
        return []

    print(f"[*] Sisa ekstensi yang akan di-forensik: {len(pending_ext_dirs)}")
    all_results = []
    
    total = len(pending_ext_dirs)
    completed = 0
    
    def print_progress(completed_count, total_count, latest_ext_id=""):
        # Simple progress bar
        bar_len = 30
        filled_len = int(round(bar_len * completed_count / float(total_count)))
        percents = round(100.0 * completed_count / float(total_count), 1)
        bar = '=' * filled_len + '-' * (bar_len - filled_len)
        sys.stdout.write(f"\r[Progress] [{bar}] {percents}% ({completed_count}/{total_count}) | Last: {latest_ext_id[:10]}...")
        sys.stdout.flush()

    print_progress(0, total)

    if workers == 1:
        # Eksekusi sekuensial
        for i, ext_path in enumerate(pending_ext_dirs):
            res = _analyze_single_task(ext_path, output_dir)
            if res:
                all_results.append(res)
            completed += 1
            print_progress(completed, total, os.path.basename(ext_path))
    else:
        # Eksekusi konkuren (paralel)
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(_analyze_single_task, ext_path, output_dir): ext_path for ext_path in pending_ext_dirs}
            
            for future in concurrent.futures.as_completed(futures):
                ext_path = futures[future]
                res = future.result()
                if res:
                    all_results.append(res)
                completed += 1
                print_progress(completed, total, os.path.basename(ext_path))

    print("\n") # New line after progress bar finishes

    # Tambahkan hasil baru ke CSV existing atau buat CSV baru
    csv_path = os.path.join(output_dir, "forensic_summary.csv")
    if all_results:
        file_exists = os.path.isfile(csv_path)
        with open(csv_path, 'a' if file_exists else 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=all_results[0].keys())
            if not file_exists:
                writer.writeheader()
            writer.writerows(all_results)
            
        proven = [r for r in all_results if "TERBUKTI" in r["verdict"]]
        print(f"\n{'='*70}")
        print(f"  SESI INI SELESAI — Terbukti rentan (sesi ini): {len(proven)}/{len(all_results)}")
        print(f"  CSV: {csv_path}")
        print(f"{'='*70}\n")

    return all_results


if __name__ == "__main__":
    from config import settings
    
    parser = argparse.ArgumentParser(description="SEE Detector - Forensic Dynamic Analyzer")
    parser.add_argument("target", help="Path direktori 1 ekstensi, ATAU path direktori berisi banyak ekstensi")
    parser.add_argument("--workers", type=int, default=1, help="Jumlah worker bersamaan (default: 1)")
    parser.add_argument("--outdir", type=str, default=os.path.join(settings.DATA_DIR, 'forensic_reports'), help="Direktori output laporan")
    
    args = parser.parse_args()

    target_path = os.path.abspath(args.target)
    
    if not os.path.exists(target_path):
        print(f"Error: Target path {target_path} tidak ditemukan.")
        sys.exit(1)

    # Deteksi apakah target adalah 1 ekstensi atau direktori berisi banyak ekstensi
    if os.path.isfile(os.path.join(target_path, "manifest.json")):
        print(f"Mode: Analisis tunggal pada {target_path}")
        analyzer = ForensicAnalyzer(target_path)
        evidence = analyzer.run()
        os.makedirs(args.outdir, exist_ok=True)
        report_path = os.path.join(args.outdir, f"{evidence['extension_id']}_forensic.md")
        generate_markdown_report(evidence, report_path)
        print(f"\nLaporan: {report_path}")
    else:
        # Cek apakah direktori ini punya sub-direktori
        subdirs = [d for d in os.listdir(target_path) if os.path.isdir(os.path.join(target_path, d))]
        if len(subdirs) > 0:
            print(f"Mode: Batch pada {target_path} ({len(subdirs)} ekstensi, {args.workers} workers)")
            run_batch_forensics(target_path, args.outdir, workers=args.workers)
        else:
            print(f"Error: Tidak ada ekstensi yang ditemukan di dalam direktori {target_path}")

