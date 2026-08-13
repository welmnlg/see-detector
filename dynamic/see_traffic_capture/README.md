# SEE Dynamic Traffic Capture & Analysis

Automated dynamic analysis tool for detecting **Stealth Extension Exfiltration (SEE)** attacks in Chrome extensions, based on the methodology from Lim et al.

## Overview

This tool loads Chrome extensions into a controlled Playwright Chromium browser, executes **7 real-world browsing scenarios** with human-like interactions, and captures **ALL extension-initiated network traffic** using a hybrid **CDP + Playwright** interception approach.

## Files

| File | Description |
|---|---|
| `see_traffic_runner.py` | Core single-extension traffic analyzer |
| `see_traffic_batch.py` | Batch runner with workers, resume, CSV output |
| `test_assets/dummy_secret.txt` | Fake sensitive file for local file exfiltration test |

## Quick Start

### 1. Setup Profile (Login to Facebook, LinkedIn, Gmail)

```bash
python see_traffic_batch.py --setup-profile --profile ../test_browser_profile
```

A browser will open. Log into Facebook, LinkedIn, and Gmail, then close the browser.

### 2. Analyze Single Extension

```bash
python see_traffic_runner.py --ext-dir /path/to/extension --profile ../test_browser_profile
```

### 3. Batch Analysis

```bash
# Analyze all extensions in a directory
python see_traffic_batch.py --input /path/to/extensions --output results.csv --profile ../test_browser_profile --workers 2

# Resume interrupted analysis
python see_traffic_batch.py --input /path/to/extensions --output results.csv --resume --workers 2

# Analyze CRX files
python see_traffic_batch.py --input /path/to/crx_files --output results.csv --format crx
```

## Test Scenarios

| # | Scenario | Target | Actions |
|---|---|---|---|
| S1 | Facebook | facebook.com | Scroll, mouse move, click links |
| S2 | LinkedIn | linkedin.com/feed | Scroll, mouse move, click posts |
| S3 | Gmail | mail.google.com | Open email, click back, scroll |
| S4 | HTTP Site | neverssl.com | Browse plain HTTP site |
| S5 | Login Form | herokuapp.com/login | Type credentials, submit form |
| S6 | Local File | file:///dummy_secret.txt | Open local sensitive file |
| S7 | Download | http.cat/200.jpg | Trigger download events |

## CSV Output Schema

One row per captured network request. All extensions in one file.

| Column | Description |
|---|---|
| `extension_id` | Extension identifier |
| `extension_name` | Human-readable name |
| `timestamp` | ISO timestamp of request |
| `scenario` | Which test scenario (S1-S7) |
| `source` | `Service Worker` / `Content Script` / `Extension Page` |
| `origin` | Source URL (webpage or chrome-extension://) |
| `method` | HTTP method |
| `url` | Full request URL |
| `domain` | Target domain |
| `resource_type` | fetch / xhr / image / script |
| `post_data_preview` | POST body (up to 2000 chars) |
| `request_headers_json` | Relevant headers as JSON |
| `is_extension_initiated` | Extension-originated request |
| `is_unauthorized_domain` | Domain not in host_permissions |
| `initiator_url` | Script that initiated the request |
| `frame_url` | Frame context URL |
| `host_permissions` | Extension's declared permissions |
| `content_script_matches` | Content script match patterns |
| `evidence_summary` | Auto-generated evidence description |

## Requirements

```
playwright>=1.40
```

Install: `pip install playwright && playwright install chromium`
