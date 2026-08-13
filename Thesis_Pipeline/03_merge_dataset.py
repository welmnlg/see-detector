import os
import pandas as pd

def merge_datasets():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    results_dir = os.path.join(base_dir, "Thesis_Pipeline", "results")
    
    aman_static = os.path.join(results_dir, "aman_static.csv")
    rentan_static = os.path.join(results_dir, "rentan_static.csv")
    aman_dynamic = os.path.join(results_dir, "aman_dynamic.csv")
    rentan_dynamic = os.path.join(results_dir, "rentan_dynamic.csv")

    print("=== 3. MENGGABUNGKAN DATASET STATIS & DINAMIS ===")
    
    # 1. Load Data
    try:
        df_as = pd.read_csv(aman_static)
        df_rs = pd.read_csv(rentan_static)
        df_ad = pd.read_csv(aman_dynamic) if os.path.exists(aman_dynamic) else pd.DataFrame()
        df_rd = pd.read_csv(rentan_dynamic) if os.path.exists(rentan_dynamic) else pd.DataFrame()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Pastikan Anda sudah menjalankan 01_run_static.py dan 02_run_dynamic.py")
        return

    # Combine Static
    df_static = pd.concat([df_as, df_rs], ignore_index=True)
    print(f"Total baris statis: {len(df_static)} (Aman: {len(df_as)}, Rentan: {len(df_rs)})")

    # Group Dynamic by extension_id to get aggregated features
    # If dynamic was run, we extract boolean flags (if they ever happened) and counts
    df_dyn_agg = pd.DataFrame()
    if not df_ad.empty or not df_rd.empty:
        df_dynamic = pd.concat([df_ad, df_rd], ignore_index=True)
        if 'extension_id' in df_dynamic.columns:
            # Aggregate logic: max for booleans, sum for counts
            agg_funcs = {}
            for col in df_dynamic.columns:
                if col in ['extension_name', 'timestamp', 'url', 'domain', 'post_data_preview', 'request_headers_json', 'host_permissions', 'content_script_matches', 'evidence_summary', 'scenario', 'source', 'origin', 'method', 'resource_type', 'initiator_url', 'frame_url']:
                    continue
                if col == 'extension_id':
                    continue
                if df_dynamic[col].dtype == 'bool':
                    agg_funcs[col] = 'max'
                elif df_dynamic[col].dtype in ['int64', 'float64']:
                    agg_funcs[col] = 'sum'
                    
            if agg_funcs:
                df_dyn_agg = df_dynamic.groupby('extension_id').agg(agg_funcs).reset_index()

    # Merge Static and Dynamic
    if not df_dyn_agg.empty:
        df_final = pd.merge(df_static, df_dyn_agg, on='extension_id', how='left')
        # Fill NaN for dynamic features with 0 / False
        for col in df_dyn_agg.columns:
            if col != 'extension_id':
                if df_dyn_agg[col].dtype == 'bool':
                    df_final[col] = df_final[col].fillna(False)
                else:
                    df_final[col] = df_final[col].fillna(0)
    else:
        # Stub the dynamic columns so ML doesn't crash if dynamic wasn't run
        df_final = df_static.copy()
        df_final['outbound_request_count'] = 0
        df_final['unauthorized_domain_count'] = 0
        df_final['sends_user_data'] = False
        df_final['has_periodic_sync'] = False
        df_final['is_sw_initiated'] = False
        df_final['is_cs_initiated'] = False
        df_final['see_behavior_detected'] = False
        df_final['cookies_stolen'] = False
        df_final['redirect_detected'] = False
        df_final['download_hijacked'] = False

    output_dataset = os.path.join(results_dir, "final_dataset.csv")
    df_final.to_csv(output_dataset, index=False)
    print(f"\nBerhasil menggabungkan dataset. Tersimpan di: {output_dataset}")
    print(f"Total Sampel Dataset Final: {len(df_final)}")
    print("\nLangkah 3 selesai. Silakan lanjut ke skrip 04_train_model.py")

if __name__ == "__main__":
    merge_datasets()
