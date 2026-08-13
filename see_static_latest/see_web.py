#!/usr/bin/env python3
"""
see_web.py — SEE Vulnerability Analyzer (Web Version)
======================================================
Jalankan:
  pip install flask
  python see_web.py

Buka browser ke: http://127.0.0.1:5002
"""

import os, sys, json, tempfile, shutil
from pathlib import Path
from datetime import datetime
from flask import (Flask, request, render_template, jsonify,
                   redirect, url_for, flash, send_file)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from see_engine import (
    analyze_crx, analyze_extension_dir, analyze_folder,
    CATEGORY_LABELS, CATEGORY_WEIGHTS
)

app = Flask(__name__, template_folder='template')
app.secret_key = 'see_analyzer_secret_key_2025'

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
WORK_FOLDER   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'work')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(WORK_FOLDER,   exist_ok=True)

ALLOWED_EXTENSIONS = {'.crx', '.zip'}

def allowed_file(filename):
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    mode = request.form.get('mode', 'single')
    results = []

    if mode == 'single':
        if 'file' not in request.files:
            flash('Tidak ada file yang dipilih.', 'error')
            return redirect(url_for('index'))
        f = request.files['file']
        if f.filename == '':
            flash('Nama file kosong.', 'error')
            return redirect(url_for('index'))
        if not allowed_file(f.filename):
            flash('Hanya file .crx atau .zip yang didukung.', 'error')
            return redirect(url_for('index'))

        save_path = os.path.join(UPLOAD_FOLDER, f.filename)
        f.save(save_path)
        result = analyze_crx(save_path, WORK_FOLDER)
        results = [result]

    elif mode == 'batch':
        files = request.files.getlist('files')
        if not files:
            flash('Tidak ada file yang dipilih untuk batch.', 'error')
            return redirect(url_for('index'))
        for f in files:
            if f.filename and allowed_file(f.filename):
                sp = os.path.join(UPLOAD_FOLDER, f.filename)
                f.save(sp)
                r = analyze_crx(sp, WORK_FOLDER)
                results.append(r)

    if not results:
        flash('Tidak ada ekstensi yang berhasil dianalisis.', 'error')
        return redirect(url_for('index'))

    # Tambahkan ext_folder_id (basename) agar client tidak perlu kirim full path
    # Server nanti resolve sendiri dari WORK_FOLDER
    for r in results:
        if 'ext_dir' in r and 'error' not in r:
            r['ext_folder_id'] = os.path.basename(r['ext_dir'])

    valid  = [r for r in results if 'error' not in r]
    summary = {
        'total':  len(results),
        'high':   sum(1 for r in valid if r.get('level') == 'HIGH'),
        'medium': sum(1 for r in valid if r.get('level') == 'MEDIUM'),
        'low':    sum(1 for r in valid if r.get('level') == 'LOW'),
        'error':  len(results) - len(valid),
    }

    return render_template('result.html',
        results=results,
        summary=summary,
        category_labels=CATEGORY_LABELS,
        work_folder=WORK_FOLDER,
        now=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )


@app.route('/api/file-content', methods=['GET'])
def api_file_content():
    """Return konten file JS — gunakan ext_folder_id (basename folder di work/) + rel path."""
    ext_folder_id = request.args.get('ext_folder_id', '')
    rel_path      = request.args.get('path', '')

    if not ext_folder_id or not rel_path:
        return jsonify({'error': 'Parameter ext_folder_id dan path wajib diisi'}), 400

    # Resolve absolute path di server — aman dari path traversal
    ext_dir_abs = os.path.normpath(os.path.join(WORK_FOLDER, ext_folder_id))

    # Pastikan masih dalam WORK_FOLDER (path traversal guard)
    if not ext_dir_abs.startswith(os.path.normpath(WORK_FOLDER)):
        return jsonify({'error': 'ext_folder_id tidak valid'}), 403

    # rel_path: normalize semua bentuk separator (/, \, %5C, %5c) ke os.sep
    rel_path_clean = rel_path.replace('%5C', '/').replace('%5c', '/')
    rel_path_clean = rel_path_clean.replace('\\\\', '/').replace('\\', '/')
    rel_path_clean = rel_path_clean.replace('/', os.sep).lstrip(os.sep)
    full = os.path.normpath(os.path.join(ext_dir_abs, rel_path_clean))

    # Path traversal guard kedua: pastikan full masih di dalam ext_dir
    if not full.startswith(ext_dir_abs):
        return jsonify({'error': 'Path file tidak valid'}), 403

    if not os.path.isfile(full):
        candidates = []

        # kandidat 1: basename normal
        fname = os.path.basename(rel_path_clean)
        if fname:
            candidates.append(fname)

        # kandidat 2: jika path terkirim tanpa separator folder
        # contoh: assetschunk-DAqDmtyJ.js -> chunk-DAqDmtyJ.js
        raw_name = rel_path.replace('\\', '/').split('/')[-1]
        common_dirs = ['assets', 'js', 'src', 'dist', 'static']
        for d in common_dirs:
            if raw_name.lower().startswith(d.lower()) and len(raw_name) > len(d):
                guess = raw_name[len(d):].lstrip('_-.\\/')
                if guess and guess not in candidates:
                    candidates.append(guess)

        found = None
        for root, dirs, files in os.walk(ext_dir_abs):
            for cand in candidates:
                if cand in files:
                    found = os.path.join(root, cand)
                    break
            if found:
                break

        if found:
            full = found
        else:
            return jsonify({'error': f'File tidak ditemukan: {rel_path} (dicari di {ext_dir_abs})'}), 404

    try:
        content = open(full, 'r', encoding='utf-8', errors='replace').read()
        return jsonify({'content': content, 'path': rel_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    """REST API endpoint — untuk integrasi programatik."""
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file'}), 400
    f = request.files['file']
    if not allowed_file(f.filename):
        return jsonify({'error': 'Format tidak didukung. Gunakan .crx atau .zip'}), 400

    sp = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(sp)
    result = analyze_crx(sp, WORK_FOLDER)

    def clean(obj):
        if isinstance(obj, set):  return list(obj)
        if isinstance(obj, dict): return {k: clean(v) for k, v in obj.items()}
        if isinstance(obj, list): return [clean(i) for i in obj]
        return obj

    return jsonify(clean(result))


if __name__ == '__main__':
    print("=" * 60)
    print("  SEE Vulnerability Analyzer — Web Interface")
    print("  Buka browser: http://127.0.0.1:5002")
    print("=" * 60)
    app.run(debug=True, host='127.0.0.1', port=5002)
