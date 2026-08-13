import json

filepath = r'E:\Kuliah\Skripsi\Semhas\extension\see-detector\see_ml_analysis.ipynb'
with open(filepath, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Update first cell text
nb['cells'][0]['source'] = [
    "# Analisis Machine Learning: Stealth Extension Exfiltration (SEE)\n",
    "\n",
    "Notebook ini memuat _pipeline_ Machine Learning untuk mendeteksi ancaman SEE pada ekstensi browser. Model ini dilatih menggunakan **26 Fitur Final (Statis & Dinamis)**.\n",
    "\n",
    "*(Jika dijalankan di Google Colab, pastikan Anda telah mengunggah file `dataset_selected.csv` ke dalam *root* Google Colab Anda)*"
]

# Update data loading cell
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        if "pd.read_csv('dataset.csv')" in source:
            cell['source'] = [
                "# Memuat dataset hasil ekstraksi Hybrid Analysis (26 Fitur Final)\n",
                "try:\n",
                "    df = pd.read_csv('dataset_selected.csv')\n",
                "except FileNotFoundError:\n",
                "    df = pd.read_csv('data/features/dataset_selected.csv')\n",
                "\n",
                "print(f\"Total ekstensi dalam dataset: {len(df)}\")\n",
                "print(\"\\nDistribusi Kelas Awal (0 = Benign, 1 = Vulnerable):\")\n",
                "print(df['label'].value_counts())\n",
                "\n",
                "df.head()"
            ]

# Ubah visualisasi top 15 menjadi 26 agar semua fiturnya terlihat
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        if "head(15)" in source:
            cell['source'] = [
                "importances = best_model.feature_importances_\n",
                "feature_names = X.columns\n",
                "\n",
                "# Mengurutkan fitur berdasarkan kepentingannya\n",
                "feature_df = pd.DataFrame({'Fitur': feature_names, 'Kepentingan': importances})\n",
                "feature_df = feature_df.sort_values(by='Kepentingan', ascending=False)\n",
                "\n",
                "plt.figure(figsize=(10, 10))\n",
                "sns.barplot(x='Kepentingan', y='Fitur', data=feature_df, palette='viridis')\n",
                "plt.title('26 Fitur Final Berpengaruh (Feature Importance)')\n",
                "plt.xlabel('Bobot Kepentingan')\n",
                "plt.ylabel('Nama Fitur')\n",
                "plt.tight_layout()\n",
                "plt.show()"
            ]

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print('Jupyter Notebook Updated!')
