#!/usr/bin/env python3
"""Inspect JSON report structure and extract extension-originated requests."""
import json, os, glob
from collections import defaultdict, Counter

reports_dir = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\dynamic_reports'
json_files = glob.glob(os.path.join(reports_dir, '*.json'))
print(f'Total JSON files: {len(json_files)}')

# Sample one large file to understand structure
sample = None
for jf in json_files:
    if os.path.getsize(jf) > 100000:
        sample = jf
        break

if sample:
    print(f'Sample file: {os.path.basename(sample)} ({os.path.getsize(sample)} bytes)')
    with open(sample, encoding='utf-8') as f:
        data = json.load(f)
    print('Top keys:', list(data.keys()))
    cr = data.get('captured_requests', [])
    print(f'captured_requests count: {len(cr)}')
    if cr:
        print('Request entry keys:', list(cr[0].keys()))
        # Count extension-originated requests
        ext_reqs = [r for r in cr if r.get('is_sw') or r.get('is_cs')]
        print(f'Extension-originated requests: {len(ext_reqs)}')
        # Show extension requests
        for r in ext_reqs[:10]:
            method = r.get("method", "?")
            domain = r.get("domain", "?")
            url = r.get("url", "")[:120]
            print(f'  {method} {domain} {url}')
            pd = r.get('post_data')
            if pd:
                print(f'    POST_DATA: {str(pd)[:300]}')
    
    # Also check if there are extension requests to non-test domains
    test_domains = {
        'www.linkedin.com', 'linkedin.com', 'static.licdn.com', 'media.licdn.com',
        'platform.linkedin.com', 'px.ads.linkedin.com', 'px4.ads.linkedin.com',
        'www.facebook.com', 'facebook.com', 'web.facebook.com', 'static.xx.fbcdn.net',
        'www.tiktok.com', 'tiktok.com', 'sf16-website-login.neutral.ttwstatic.com',
        'mail.google.com', 'accounts.google.com',
        'chocoffee.biz.id', 'www.chocoffee.biz.id',
        'the-internet.herokuapp.com',
        'www.w3.org', 'httpbin.org',
    }
    
    ext_external = [r for r in ext_reqs if r.get('domain','') not in test_domains]
    print(f'\nExtension requests to NON-TEST domains: {len(ext_external)}')
    for r in ext_external[:10]:
        method = r.get("method", "?")
        domain = r.get("domain", "?")
        url = r.get("url", "")[:120]
        print(f'  {method} {domain} {url}')
        pd = r.get('post_data')
        if pd:
            print(f'    POST_DATA: {str(pd)[:300]}')
