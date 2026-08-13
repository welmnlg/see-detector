import csv, os

triage_csv = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\dynamic\see_triage_results.csv"
source_dir = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\malware_chrome_stats"
target_dir = r"E:\Kuliah\Skripsi\Semhas\extension\see-detector\data\extracted\see_malware_filtered"

os.makedirs(target_dir, exist_ok=True)

count = 0
with open(triage_csv, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row["see_vulnerable"] == "True":
            ext_id = row["extension_id"]
            src = os.path.join(source_dir, ext_id)
            dst = os.path.join(target_dir, ext_id)
            if os.path.exists(src) and not os.path.exists(dst):
                # Directory junction (tanpa admin, tanpa duplikasi data)
                os.system(f'mklink /J "{dst}" "{src}" >nul 2>&1')
                count += 1

existing = len([d for d in os.listdir(target_dir) if os.path.isdir(os.path.join(target_dir, d))])
print(f"Junctions dibuat: {count}")
print(f"Total di folder filtered: {existing}")
print(f"Folder: {target_dir}")
