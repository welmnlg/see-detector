import json
import os
import sys

# Paths
OUTPUT_DIR = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\output"
static_report_path = os.path.join(OUTPUT_DIR, "static_report_vulnerable.json")
dynamic_traffic_path = os.path.join(OUTPUT_DIR, "dynamic_report_active_traffic.json")

# Load data
with open(static_report_path, 'r', encoding='utf-8') as f:
    static_data = json.load(f)

with open(dynamic_traffic_path, 'r', encoding='utf-8') as f:
    dynamic_traffic = json.load(f)

# Build a lookup dictionary for static results
static_dict = {}
for ext in static_data.get("maximal_extensions", []):
    static_dict[ext["extension_id"]] = ext
for ext in static_data.get("minimal_extensions", []):
    static_dict[ext["extension_id"]] = ext

# Correlate with dynamic traffic
print("=== CORRELATION REPORT: STATIC (CRITERIA) vs DYNAMIC (ACTIVE TRAFFIC) ===")

total_active_traffic = len(dynamic_traffic["results"])
maximal_with_traffic = []
minimal_with_traffic = []

for dyn_ext in dynamic_traffic["results"]:
    ext_id = dyn_ext["extension_id"]
    if ext_id in static_dict:
        stat_ext = static_dict[ext_id]
        criteria = stat_ext["criteria"]
        
        entry = {
            "extension_id": ext_id,
            "static_criteria": criteria,
            "static_categories": stat_ext["see_categories"],
            "dynamic_outbound_requests": dyn_ext["dynamic_features"]["outbound_request_count"],
            "dynamic_unauthorized_domains": dyn_ext["dynamic_features"]["unauthorized_domain_count"],
            "dynamic_see_detected": dyn_ext["dynamic_features"]["see_behavior_detected"]
        }
        
        if criteria == "MAXIMAL":
            maximal_with_traffic.append(entry)
        else:
            minimal_with_traffic.append(entry)

print(f"Total vulnerable extensions with active dynamic traffic: {total_active_traffic}")
print(f"  - Met MAXIMAL static criteria: {len(maximal_with_traffic)}")
print(f"  - Met MINIMAL static criteria: {len(minimal_with_traffic)}")

print("\n--- Top 5 MAXIMAL extensions with highest outbound requests ---")
maximal_with_traffic.sort(key=lambda x: x["dynamic_outbound_requests"], reverse=True)
for ext in maximal_with_traffic[:5]:
    print(f"[{ext['extension_id']}]")
    print(f"   Static Categories: {ext['static_categories']}")
    print(f"   Dynamic Requests: {ext['dynamic_outbound_requests']} | Unauthorized: {ext['dynamic_unauthorized_domains']} | SEE Detected: {ext['dynamic_see_detected']}")

print("\n--- Top 5 MINIMAL extensions with highest outbound requests ---")
minimal_with_traffic.sort(key=lambda x: x["dynamic_outbound_requests"], reverse=True)
for ext in minimal_with_traffic[:5]:
    print(f"[{ext['extension_id']}]")
    print(f"   Static Categories: {ext['static_categories']}")
    print(f"   Dynamic Requests: {ext['dynamic_outbound_requests']} | Unauthorized: {ext['dynamic_unauthorized_domains']} | SEE Detected: {ext['dynamic_see_detected']}")
