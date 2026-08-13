# SEE Dynamic Traffic Analysis Script — Implementation Plan

## Goal

Build a comprehensive dynamic analysis automation script that:
1. Tests Chrome extensions against **7 real-world user browsing scenarios**
2. Captures **ALL network traffic** originating from extensions (content scripts, service workers, or injected page scripts)
3. Records every unauthorized/external network request as evidence of potential SEE (Stealth Extension Exfiltration) behavior
4. Outputs a **single unified CSV** with one row per captured network request, across all tested extensions
5. Works for both our custom PoC extensions AND any extension matching SEE criteria from the Lim et al. paper

## User Review Required

> [!IMPORTANT]
> **User Profile Path**: The script will use a persistent Chrome user profile directory (with Facebook, LinkedIn, Gmail already logged in). Please confirm the path to your existing profile. The existing scripts reference `see-detector/dynamic/test_browser_profile/` — is this where your logged-in profile is stored?

> [!IMPORTANT]
> **Local .txt File for Scenario 6**: The script needs a local `.txt` file to test local file exfiltration. I'll create a dummy file at `see-detector/dynamic/see_traffic_capture/test_assets/dummy_secret.txt` containing fake sensitive data (passwords, SSNs). Is this acceptable?

> [!IMPORTANT]
> **HTTP Website for Scenario 4**: The existing scripts use `http://chocoffee.biz.id/` as an HTTP-only honeypot. Should I use this same site, or do you have a different HTTP site preference?

> [!IMPORTANT]
> **Login Form for Scenario 5**: The existing scripts use `https://the-internet.herokuapp.com/login` as a dummy login form target. Should I use this, or do you prefer a different test login page?

## Open Questions

> [!NOTE]
> **Download Test Target (Scenario 7)**: For triggering download hijack detection, I plan to:
> - Navigate to a page with downloadable images (e.g., `https://http.cat/200.jpg`)
> - Also inject a hidden download anchor with a bait `.txt` file
> Is this sufficient, or should I also test with Ctrl+S / right-click save?

> [!NOTE]
> **Browser Executable**: Should the script use the default Playwright Chromium, or your system's installed Chrome (`chrome.exe`)? Using your system Chrome would be more realistic but Playwright Chromium is more controllable.

---

## Proposed Changes

### Component 1: New Script Directory

All new files will be created inside a **new subdirectory** to avoid modifying any existing scripts:

```
see-detector/dynamic/see_traffic_capture/
├── see_traffic_runner.py        # [NEW] Core single-extension traffic analyzer
├── see_traffic_batch.py         # [NEW] Batch runner with workers, resume, CSV
├── test_assets/
│   └── dummy_secret.txt         # [NEW] Fake sensitive local file for Scenario 6
└── README.md                    # [NEW] Usage documentation
```

---

### Component 2: Core Traffic Runner

#### [NEW] `see_traffic_runner.py`

The heart of the system. Analyzes **one extension** by loading it into a Playwright Chromium browser, executing 7 user scenarios, and capturing every network request.

**Architecture** (duplicated & modified from [`sandbox_runner.py`](file:///e:/Kuliah/Skripsi/Semhas/extension/see-detector/dynamic/sandbox_runner.py)):

```python
class SEETrafficRunner:
    def __init__(self, ext_dir, user_profile_dir, timeout_per_scenario=45):
        ...
    
    def run_analysis(self) -> dict:
        """Returns {extension_id, extension_name, manifest_info, captured_traffic: [...], error}"""
    
    # ── 7 Scenarios ──
    def _scenario_facebook(self, page, context)      # S1
    def _scenario_linkedin(self, page, context)       # S2
    def _scenario_gmail(self, page, context)           # S3
    def _scenario_http_site(self, page, context)       # S4
    def _scenario_login_form(self, page, context)      # S5
    def _scenario_local_file(self, page, context)      # S6
    def _scenario_download_test(self, page, context)   # S7
```

**Key Design Decisions:**

1. **CDP-based network interception** (same pattern as `sandbox_runner.py`):
   - `Network.requestWillBeSent` — captures ALL requests with full initiator call stacks
   - `Debugger.enable` with `setAsyncCallStackDepth: 32` — traces async fetch/sendBeacon origins
   - Walk the full call stack to determine if request originated from `chrome-extension://` context

2. **Source Attribution** (critical improvement over existing scripts):
   For each captured request, determine the **exact source chain**:
   
   | Source Label | How Detected |
   |---|---|
   | `Content Script (direct)` | CDP initiator stack contains `chrome-extension://` AND Playwright `frame.url` is a normal webpage (not extension page) |
   | `Service Worker (direct)` | Playwright request has no associated frame (frameless = SW) |
   | `Content Script → Service Worker` | CDP shows extension initiator, request is frameless, AND we detect a preceding `chrome.runtime.sendMessage` in console/runtime logs |
   | `Injected Page Script` | CDP initiator shows webpage URL but request goes to unauthorized domain AND extension's content script injected code into page |

3. **Origin Attribution**:
   - If source is Content Script: origin = the webpage URL where the CS is injected (e.g., `https://www.facebook.com/`)
   - If source is Service Worker: origin = `chrome-extension://<extension-id>/`
   - Both are captured from CDP `initiator` object and Playwright `frame.url`

4. **Traffic Filtering**:
   - Capture ALL requests but **flag** those going to domains outside the extension's declared `host_permissions`
   - Also flag requests to domains outside the test scenario's expected domains
   - Keep ALL traffic in the output (let the researcher decide what's suspicious)

5. **User Simulation** (per scenario):

   | Scenario | Target | Actions |
   |---|---|---|
   | S1: Facebook | `https://www.facebook.com/` | Navigate → wait 3s → slow scroll (3 increments of 300px with 1s delays) → move mouse across page → click 2-3 elements → find & click a hyperlink → wait 5s |
   | S2: LinkedIn | `https://www.linkedin.com/feed/` | Navigate → wait 3s → slow scroll → move mouse → click post elements → wait 5s |
   | S3: Gmail | `https://mail.google.com/mail/u/0/` | Navigate → wait 3s → click first email in inbox → wait 2s → click back → scroll slowly → wait 5s |
   | S4: HTTP Site | `http://chocoffee.biz.id/` (or similar) | Navigate → scroll → click → wait 5s |
   | S5: Login Form | `https://the-internet.herokuapp.com/login` | Navigate → fill username (`admin_test`) → fill password (`S3cureP@ss!`) → click submit → wait 5s |
   | S6: Local File | `file:///path/to/dummy_secret.txt` | Navigate → wait 5s → scroll |
   | S7: Download | Navigate to image URL → click download link → also inject bait anchor → click it → wait 5s |

6. **Extension Loading**:
   - Accept both **folder paths** (unpacked extensions) and **CRX files**
   - If CRX: auto-extract to temp directory using the existing `crx_extractor` module, then load as folder
   - Load via Playwright `launch_persistent_context` with `--load-extension=<dir>` flags
   - Copy user profile to temp dir (for logged-in sessions) with cache exclusion for speed

**Output per extension** (returned as dict):
```python
{
    "extension_id": "abc123...",
    "extension_name": "CookieManager Pro",
    "manifest_version": 3,
    "permissions": ["cookies", "activeTab", "storage"],
    "host_permissions": ["http://*/*", "https://*/*"],
    "content_script_matches": ["<all_urls>"],
    "has_service_worker": True,
    "analyzed_at": "2026-08-04T18:00:00",
    "analysis_duration_sec": 120.5,
    "captured_traffic": [
        {
            "timestamp": "2026-08-04T18:01:23.456",
            "scenario": "S1_Facebook",
            "source": "Service Worker (direct)",
            "origin": "chrome-extension://abc123.../",
            "method": "POST",
            "url": "https://see-serv-production.up.railway.app/webhook",
            "domain": "see-serv-production.up.railway.app",
            "resource_type": "fetch",
            "post_data_preview": "{\"extension\":\"ce\",\"poc\":\"CookieManager Pro\",...}",
            "request_headers": {"Content-Type": "application/json", ...},
            "is_unauthorized_domain": True,
            "is_extension_initiated": True,
            "initiator_url": "chrome-extension://abc123.../worker.js",
            "frame_url": null,
            "evidence_summary": "POST to external domain see-serv-production.up.railway.app with JSON payload containing cookies data"
        },
        ...
    ],
    "error": ""
}
```

---

### Component 3: Batch Runner

#### [NEW] `see_traffic_batch.py`

Orchestrates batch execution across many extensions. Duplicated & modified from [`dynamic_batch_runner.py`](file:///e:/Kuliah/Skripsi/Semhas/extension/see-detector/dynamic/dynamic_batch_runner.py).

**CLI Arguments:**
```
python see_traffic_batch.py \
    --input /path/to/extensions/           # Directory of extensions (folders or CRX files)
    --output see_traffic_results.csv       # Single unified CSV output
    --profile /path/to/user_profile/       # Chrome profile with logged-in sessions
    --workers 2                            # Number of parallel workers (default: 1)
    --timeout 300                          # Per-extension timeout in seconds (default: 300)
    --resume                               # Skip extensions already in output CSV
    --limit 0                              # Limit number of extensions (0 = all)
    --format crx|folder|auto               # Input format (auto-detect by default)
```

**Key Features:**

1. **Per-extension CSV writing**: After each extension completes, immediately append all its traffic rows to the CSV using a thread lock. This prevents data loss if the batch crashes.

2. **Resume logic**: Read existing CSV, collect all unique `extension_id` values into a set, skip any extension whose ID is already present.

3. **Worker isolation**: Each worker runs in an isolated `multiprocessing.Process` with a hard timeout. If a Playwright instance hangs, the process is killed without affecting other workers.

4. **CRX auto-extraction**: If `--format crx` or auto-detected as CRX, extract to a temp folder before analysis. Clean up after completion.

5. **Progress reporting**: Print live progress (`[15/100] Analyzing: CookieManager Pro...`) to stdout.

---

### Component 4: CSV Output Schema

**Single CSV file** with one row per captured network request. All extensions' traffic is in the same file.

| Column | Description | Example |
|---|---|---|
| `extension_id` | Chrome extension ID or directory name | `cgmbjgjmnlaeiopdodhiclgpflpanmje` |
| `extension_name` | Human-readable extension name from manifest | `CookieManager Pro` |
| `timestamp` | ISO timestamp of the request | `2026-08-04T18:01:23.456` |
| `scenario` | Which test scenario triggered this | `S1_Facebook` |
| `source` | Detailed source attribution | `Service Worker (direct)` / `Content Script (direct)` / `Content Script → Service Worker` |
| `origin` | Where the request originated from | `chrome-extension://abc123.../` or `https://www.facebook.com/` |
| `method` | HTTP method | `POST` |
| `url` | Full request URL | `https://see-serv-production.up.railway.app/webhook` |
| `domain` | Extracted domain from URL | `see-serv-production.up.railway.app` |
| `resource_type` | Request resource type | `fetch` / `xhr` / `image` / `script` |
| `post_data_preview` | First 2000 chars of POST body (if applicable) | `{"extension":"ce","cookies":[...]}` |
| `request_headers_json` | Key request headers as JSON string | `{"Content-Type":"application/json"}` |
| `is_extension_initiated` | Whether the request was initiated by extension code | `True` |
| `is_unauthorized_domain` | Domain not in extension's host_permissions | `True` |
| `initiator_url` | Script URL that initiated the request (from CDP stack) | `chrome-extension://abc123/worker.js` |
| `frame_url` | URL of the frame context (null for SW) | `https://www.facebook.com/` |
| `host_permissions` | Extension's declared host_permissions | `["http://*/*","https://*/*"]` |
| `content_script_matches` | Extension's content_script match patterns | `["<all_urls>"]` |
| `evidence_summary` | Auto-generated evidence description | `POST to unauthorized domain with JSON payload containing user cookies` |

---

### Component 5: Test Assets

#### [NEW] `test_assets/dummy_secret.txt`

A fake sensitive file for Scenario 6 (local file exfiltration test):
```
CONFIDENTIAL - Personal Information
SSN: 123-45-6789
Credit Card: 4111-1111-1111-1111
Password: MySecretPassword123!
Bank Account: 9876543210
Email: john.doe@example.com
```

---

## Verification Plan

### Automated Tests
1. **Single extension test**: Run `see_traffic_runner.py` against one of our PoC extensions (e.g., `ext1-ce` CookieManager Pro) and verify the CSV output captures the webhook traffic to Railway server
2. **Batch test**: Run `see_traffic_batch.py` against all 9 PoC extensions in `see-poc-v3/` and verify:
   - All 9 extensions appear in the CSV
   - Network traffic to `see-serv-production.up.railway.app` is captured with correct source attribution
   - Resume works (run again, should skip all 9)
3. **CRX test**: Test with a `.crx` file to verify auto-extraction works

### Manual Verification
- Open the output CSV in a spreadsheet application
- Verify columns are correctly populated
- Confirm source attribution is accurate (Content Script vs Service Worker)
- Confirm post_data_preview shows actual exfiltrated data
- Confirm evidence_summary is meaningful and useful for thesis

### Commands
```bash
# Single extension test
python see_traffic_runner.py --ext-dir "E:/Kuliah/Skripsi/Semhas/extension/see-poc-v3/ext1-ce" --profile "E:/Kuliah/Skripsi/Semhas/extension/see-detector/dynamic/test_browser_profile"

# Batch test (all PoC extensions)
python see_traffic_batch.py --input "E:/Kuliah/Skripsi/Semhas/extension/see-poc-v3" --output see_traffic_results.csv --profile "E:/Kuliah/Skripsi/Semhas/extension/see-detector/dynamic/test_browser_profile" --workers 2 --resume

# Resume test
python see_traffic_batch.py --input "E:/Kuliah/Skripsi/Semhas/extension/see-poc-v3" --output see_traffic_results.csv --resume
```
