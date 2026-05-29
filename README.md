# SEE Detector

**Sistem Deteksi Stealth Extension Exfiltration (SEE) pada Ekstensi Browser menggunakan Hybrid Analysis dan Random Forest.**

Skripsi — Program Studi Ilmu Komputer, Universitas Sumatera Utara.

## Arsitektur Sistem

```
see-detector/
├── main.py                    # CLI utama (entrypoint)
├── config/settings.py         # Konfigurasi pipeline
├── extractor/
│   ├── crx_extractor.py       # Membongkar file .crx/.zip
│   └── manifest_parser.py     # Ekstraksi 44 fitur dari manifest.json
├── analyzer/
│   ├── js_scanner.py          # Ekstraksi 27 fitur dari kode JavaScript
│   ├── static_analyzer.py     # Orkestrator analisis statis
│   └── see_classifier.py      # Klasifikasi kategori SEE (rule-based)
├── dynamic/
│   ├── sandbox_runner.py      # Analisis dinamis via Playwright (10 fitur)
│   └── cdp_monitor.py         # Chrome DevTools Protocol monitor
├── dataset/
│   └── dataset_builder.py     # Bangun dataset CSV (paralel)
├── ml/
│   ├── trainer.py             # Training Random Forest + K-Fold CV
│   └── evaluator.py           # Evaluasi model (Confusion Matrix, ROC-AUC)
├── web/
│   ├── app.py                 # Flask web server (API + UI)
│   ├── templates/index.html   # Antarmuka web
│   └── static/                # CSS + JavaScript
├── utils/downloader.py        # Download dataset benign dari Chrome Web Store
├── generate_dynamic_report.py # Laporan analisis dinamis (JSON)
├── create_notebook.py         # Generator Jupyter Notebook
└── see_ml_analysis.ipynb      # Notebook untuk Google Colab
```

## Cara Penggunaan

### 1. Setup Lingkungan
```bash
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
playwright install chromium
```

### 2. Pipeline Lengkap
```bash
# Langkah 1: Download dataset benign
python main.py download

# Langkah 2: Ekstrak file .crx menjadi folder
python main.py extract

# Langkah 3: Bangun dataset (Hybrid Analysis) — bisa atur jumlah Chrome window
python main.py build-dataset --workers 4

# Langkah 4: Training model Random Forest
python main.py train

# Langkah 5: Evaluasi model
python main.py evaluate
```

### 3. Web Server (Pengujian Langsung)
```bash
python main.py web
# Buka http://localhost:5000 di browser
```

### 4. Laporan Analisis Dinamis
```bash
python main.py report --workers 4
# atau langsung:
python generate_dynamic_report.py --workers 6
```

## Fitur Utama
- **81 Fitur Hybrid** (44 Manifest + 27 JavaScript + 10 Dinamis)
- **Analisis Dinamis** via Playwright + Chrome DevTools Protocol
- **Paralel Processing** — jumlah Chrome window bisa disesuaikan (`--workers`)
- **K-Fold Cross Validation** (5-Fold Stratified)
- **Bebas Feature Leakage** — `has_host_permissions` di-drop dari training
- **Web Dashboard** — upload `.crx` dan lihat hasil deteksi real-time

## Hasil Evaluasi

| Metrik | Nilai |
|:--|:--|
| Accuracy | 91.79% |
| ROC-AUC | 96.04% |
| Precision (Vulnerable) | 93.94% |
| Recall (Vulnerable) | 89.42% |
| F1-Score | 91.63% |
| CV ROC-AUC (5-fold) | 0.9548 ± 0.0121 |

## Referensi
- Lim, Y., Yaacob, S., et al. (2025). *Stealth Extension Exfiltration (SEE) Attacks: Stealing User Data without Permissions via Browser Extensions.*
