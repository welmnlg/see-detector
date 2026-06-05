import json, re, os
import sys

path = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\see\bookmarks\data1.json"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract IDs from the Chrome Web Store URLs in the JSON
urls = re.findall(r'chromewebstore\.google\.com/detail/[^/]+/([a-p]{32})', content)
# Also try the shorter format just in case
urls2 = re.findall(r'chromewebstore\.google\.com/detail/([a-p]{32})', content)

ids = set(urls + urls2)
print(f"Found {len(ids)} IDs from chromewebstore URLs.")
for i, ext_id in enumerate(ids):
    print(f" {i+1}: {ext_id}")
