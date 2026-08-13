import os
import pandas as pd

def build_dataset():
    # User's specified files
    dyn_aman = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\dynamic_analysis_results\aman_dynamic_traffic2.csv"
    dyn_rentan = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\dynamic_analysis_results\rentan_dynamic_traffic2.csv"
    
    stat_1 = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\static_analysis_reports2\see_report_20260811_225256.csv"
    stat_2 = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Testing\static_analysis_reports2\see_report_20260811_225134.csv"
    
    output_csv = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\Thesis_Pipeline\results\final_dataset.csv"
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    
    # 1. Parse Static Data
    print("[*] Parsing Static Analysis Reports...")
    df_stat1 = pd.read_csv(stat_1)
    df_stat2 = pd.read_csv(stat_2)
    df_static = pd.concat([df_stat1, df_stat2]).drop_duplicates(subset=['extension_id'])
    
    static_dict = {}
    for _, row in df_static.iterrows():
        ext_id = str(row['extension_id'])
        static_dict[ext_id] = {
            "permissions_count": row.get('permissions_count', 0),
            "sensitive_perms_count": row.get('sensitive_perms_count', 0),
            "http_api_total": row.get('http_api_total', 0),
            "external_domains": row.get('external_domains', 0),
            "has_wildcard_cs": 1 if str(row.get('has_wildcard_cs')).lower() == 'true' else 0,
            "see_categories": row.get('see_categories', '')
        }
        
    # 2. Parse Dynamic Data
    print("[*] Parsing Dynamic Analysis Reports...")
    
    # Combine and label dynamic traffic data
    df_dyn_aman = pd.read_csv(dyn_aman)
    df_dyn_aman['label'] = 0
    df_dyn_rentan = pd.read_csv(dyn_rentan)
    df_dyn_rentan['label'] = 1
    
    df_dyn = pd.concat([df_dyn_aman, df_dyn_rentan])
    
    dynamic_dict = {}
    for ext_id, group in df_dyn.groupby('extension_id'):
        ext_id = str(ext_id)
        # In case the group has mixed labels (should not happen, but take max)
        label = group['label'].max()
        
        total_unauth = group['is_unauthorized_domain'].astype(str).str.lower().eq('true').sum()
        total_reqs = len(group)
        cs_calls = group['source'].astype(str).str.contains('Content Script', case=False, na=False).sum()
        suspicious_payload = group['post_data_preview'].astype(str).str.contains(r'token|password|base64|document.location', case=False, na=False, regex=True).sum()
        
        ratio = round(total_unauth / total_reqs, 4) if total_reqs > 0 else 0
        
        dynamic_dict[ext_id] = {
            "label": label,
            "total_unauthorized_requests": total_unauth,
            "ratio_unauth_vs_total_traffic": ratio,
            "content_script_network_calls": cs_calls,
            "is_suspicious_payload": suspicious_payload
        }

    # 3. Build Final Dataset
    print("[*] Merging Datasets...")
    dataset = []
    
    # We will build dataset for all extensions found in dynamic analysis, since that's our ground truth for execution
    # Wait, some extensions might not generate any traffic. We should build for ALL extensions found in static analysis
    
    for ext_id, stat_feats in static_dict.items():
        dyn_feats = dynamic_dict.get(ext_id, {
            "label": 0, # Default to 0 if no traffic, we'll fix this below
            "total_unauthorized_requests": 0,
            "ratio_unauth_vs_total_traffic": 0,
            "content_script_network_calls": 0,
            "is_suspicious_payload": 0
        })
        
        # Determine true label from the folder it was in (from extension_id string check as fallback)
        label = dyn_feats.get("label")
        if ext_id not in dynamic_dict:
            if 'trojan' in ext_id.lower() or 'poc' in ext_id.lower():
                label = 1
            else:
                label = 0
                
        row = {
            "extension_id": ext_id,
            "see_categories": stat_feats["see_categories"],
            "permissions_count": stat_feats["permissions_count"],
            "sensitive_perms_count": stat_feats["sensitive_perms_count"],
            "http_api_total": stat_feats["http_api_total"],
            "external_domains": stat_feats["external_domains"],
            "has_wildcard_cs": stat_feats["has_wildcard_cs"],
            "total_unauthorized_requests": dyn_feats["total_unauthorized_requests"],
            "ratio_unauth_vs_total_traffic": dyn_feats["ratio_unauth_vs_total_traffic"],
            "content_script_network_calls": dyn_feats["content_script_network_calls"],
            "is_suspicious_payload": dyn_feats["is_suspicious_payload"],
            "label": label
        }
        dataset.append(row)
        
    df_final = pd.DataFrame(dataset)
    df_final.to_csv(output_csv, index=False)
    print(f"[OK] Saved {len(dataset)} records to {output_csv}")

if __name__ == "__main__":
    build_dataset()
