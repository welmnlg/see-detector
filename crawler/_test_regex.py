import json, re, os
import sys

path = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\see\bookmarks\data1.json"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Chrome extension ID is 32 characters long, using letters a-p.
ids = set(re.findall(r'"([a-p]{32})"', content))
print(f"Found {len(ids)} unique IDs matching [a-p]{{32}}.")
for i, ext_id in enumerate(list(ids)[:30]):
    print(f" {i+1}: {ext_id}")
