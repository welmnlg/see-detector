document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = "http://127.0.0.1:5002/api/analyze_url";

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    chrome.storage.local.get(["pending_analysis_id", "pending_analysis_name"], async (data) => {
        const extId = data.pending_analysis_id;
        const extName = data.pending_analysis_name;

        if (!extId) {
            showError("Tidak ada ekstensi yang sedang dianalisis.");
            return;
        }

        document.getElementById('loading-ext-name').textContent = extName;

        // Mulai simulasi log
        const simInterval = simulateRealtimeLogs();

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: extId })
            });

            const result = await response.json();
            clearInterval(simInterval);

            if (!response.ok) {
                throw new Error(result.error || "Gagal melakukan analisis.");
            }

            displayResult(extId, extName, result);

        } catch (error) {
            clearInterval(simInterval);
            let friendlyMsg = error.message;
            if (friendlyMsg.includes('Failed to fetch')) {
                friendlyMsg = "Gagal menghubungi peladen. Pastikan server Flask (app.py) di Port 5002 hidup.";
            }
            showError(`Kesalahan: ${friendlyMsg}`);
            setupErrorButtons(extId);
        }
    });
});

function simulateRealtimeLogs() {
    const term = document.getElementById('terminal-body');
    if (!term) return null;
    term.innerHTML = '';
    
    const logs = [
        {time: 0, text: "[INFO] Ekstensi berhasil ditahan (Client-Side Protection)...", class: "info"},
        {time: 2, text: "[OK] Ekstraksi berhasil. Memulai AST Parser & Manifest Analyzer...", class: "success"},
        {time: 5, text: "[INFO] Memindai permission, content_scripts...", class: "white"},
        {time: 8, text: "[OK] Analisis statis selesai. Menginisiasi Playwright Sandbox...", class: "success"},
        {time: 15, text: "[S1] Menjalankan Skenario HTTP Site (NeverSSL)...", class: "white"},
        {time: 25, text: "[S2] Menjalankan Skenario Login Form...", class: "white"},
        {time: 35, text: "[S3] Menjalankan Skenario Pencurian Data...", class: "white"},
        {time: 60, text: "[OK] Menunggu Sandbox selesai (ini memakan waktu 1-2 menit)...", class: "warn"},
        {time: 90, text: "[INFO] Masih menjalankan skenario dinamis...", class: "white"},
        {time: 130, text: "[OK] Menyusun fitur perilaku (X_input)...", class: "success"},
        {time: 135, text: "[INFO] Memuat Model ML V12...", class: "info"},
        {time: 140, text: "[OK] Prediksi selesai. Menunggu respons akhir server...", class: "success"}
    ];
    
    let timer = 0;
    const interval = setInterval(() => {
        timer++;
        const currentLog = logs.find(l => l.time === timer);
        if(currentLog) {
            const timeStr = new Date().toLocaleTimeString('id-ID', {hour12: false});
            term.innerHTML += `<div class="term-line ${currentLog.class}">[${timeStr}] ${currentLog.text}</div>`;
            term.scrollTop = term.scrollHeight; // Auto scroll
        }
    }, 1000);
    return interval;
}

function displayResult(extId, extName, data) {
    document.getElementById('loading-panel').classList.add('hidden');
    document.getElementById('result-panel').classList.remove('hidden');

    const statusCard = document.getElementById('status-card');
    const statusText = document.getElementById('final-status');
    const scoreText = document.getElementById('confidence-score');
    
    let isMalicious = data.status === 'MALICIOUS';

    if (isMalicious) {
        statusCard.className = 'status-card status-malicious';
        statusText.textContent = 'RENTAN (SEE ATTACK DETECTED)';
        document.getElementById('mitigation-box').classList.remove('hidden');
        document.getElementById('mitigation-text').innerHTML = `
            <strong>Segera Hapus Ekstensi!</strong><br>
            Ekstensi ini terbukti mencoba mencuri data secara diam-diam. Jika Anda sempat menggunakannya, segera ganti *password* Anda.
        `;
    } else {
        statusCard.className = 'status-card status-safe';
        statusText.textContent = 'AMAN (SAFE)';
        document.getElementById('mitigation-box').classList.remove('hidden');
        document.getElementById('mitigation-text').innerHTML = `
            Tidak ditemukan perilaku pencurian data (SEE) pada ekstensi ini. Anda bebas menggunakannya.
        `;
    }

    scoreText.textContent = `${data.score}%`;

    // --- TAB RINGKASAN (TERJEMAHAN ISTILAH ML) ---
    const insightList = document.getElementById('insight-list');
    insightList.innerHTML = '';
    
    // Kamus Terjemahan agar user awam paham
    const terminologyMap = {
        "Total HTTP Request": "Total Akses Jaringan (Network)",
        "Domain Tak Dikenal": "Koneksi ke Server Asing (Unauth)",
        "Izin Sensitif": "Akses Data Privasi/Krusial",
        "Indikasi Leakage (URL/Data)": "Percobaan Membocorkan Data",
        "Danger Multiplier Score": "Skor Risiko Bahaya Keseluruhan"
    };

    for(const [key, val] of Object.entries(data.insights || {})) {
        const friendlyName = terminologyMap[key] || key;
        insightList.innerHTML += `<li><span>${friendlyName}</span> <strong>${val}</strong></li>`;
    }

    // --- TAB STATIS ---
    const staticList = document.getElementById('static-list');
    const statData = data.static_analysis || {};
    staticList.innerHTML = `
        <li><span>Total Izin (Permissions)</span> <strong>${statData.permissions_count || 0}</strong></li>
        <li><span>Izin Sangat Sensitif</span> <strong>${statData.sensitive_perms_count || 0}</strong></li>
        <li><span>Izin Akses Host (URL)</span> <strong>${statData.host_permissions_count || 0}</strong></li>
        <li><span>Jumlah Content Scripts</span> <strong>${statData.content_script_count || 0}</strong></li>
        <li><span>Aturan Pemblokiran (DNR)</span> <strong>${statData.dnr_rule_count || 0}</strong></li>
    `;

    // --- TAB DINAMIS ---
    const dynamicList = document.getElementById('dynamic-list');
    const mlData = data.ml_features || {};
    dynamicList.innerHTML = `
        <li><span>Request via Content Script</span> <strong>${mlData.dyn_cs_reqs || 0}</strong></li>
        <li><span>Request via Service Worker</span> <strong>${mlData.dyn_sw_reqs || 0}</strong></li>
        <li><span>Total Domain Unik</span> <strong>${mlData.dyn_unique_domains || 0}</strong></li>
        <li><span>Request POST (Kirim Data)</span> <strong>${mlData.dyn_post_reqs || 0}</strong></li>
    `;
    
    const behBox = document.getElementById('dynamic-behaviors');
    behBox.innerHTML = '';
    const behaviors = data.behaviors || [];
    if (behaviors.length > 0) {
        behaviors.forEach(b => {
            behBox.innerHTML += `<span class="behavior-badge">${b}</span>`;
        });
    } else {
        behBox.innerHTML = `<span style="font-size:0.85rem; color:#4ade80;">Tidak ada perilaku aneh terdeteksi.</span>`;
    }
    
    // --- RENDER DYNAMIC LOGS (HTTP REQUESTS) ---
    const logsContainer = document.getElementById('dynamic-logs-container');
    logsContainer.innerHTML = '';
    const dynLogs = data.dynamic_logs || [];
    
    if (dynLogs.length === 0) {
        logsContainer.innerHTML = `<p style="font-size:0.8rem; color:#94a3b8;">Tidak ada aktivitas jaringan yang terekam.</p>`;
    } else {
        dynLogs.forEach((log, index) => {
            const methodClass = log.method === 'POST' ? 'method-post' : 'method-get';
            const unauthClass = log.is_unauth ? 'log-unauth' : '';
            
            const logItem = document.createElement('div');
            logItem.className = `log-item ${unauthClass}`;
            
            // Header (bisa diklik)
            const header = document.createElement('div');
            header.className = 'log-header';
            header.innerHTML = `
                <span class="log-method ${methodClass}">${log.method}</span>
                <span class="log-url" title="${log.url}">${log.url}</span>
                <span style="font-size: 0.7rem; color: #94a3b8;">▼</span>
            `;
            
            // Body (tersembunyi secara default)
            const body = document.createElement('div');
            body.className = 'log-body';
            
            let evidenceHtml = log.evidence ? `<div class="log-section"><strong>Bukti Temuan:</strong><br>${log.evidence}</div>` : '';
            let postDataHtml = log.post_data ? `<div class="log-section"><strong>Isi/Body (POST):</strong><br>${log.post_data}</div>` : '';
            
            body.innerHTML = `
                <div class="log-section"><strong>Sumber:</strong> ${log.source || 'Unknown'}</div>
                ${evidenceHtml}
                ${postDataHtml}
                <div class="log-section" style="word-break: break-all;"><strong>Full URL:</strong><br>${log.url}</div>
            `;
            
            // Toggle Logic
            header.addEventListener('click', () => {
                body.classList.toggle('open');
                const arrow = header.querySelector('span:last-child');
                arrow.textContent = body.classList.contains('open') ? '▲' : '▼';
            });
            
            logItem.appendChild(header);
            logItem.appendChild(body);
            logsContainer.appendChild(logItem);
        });
    }

    // --- SIMPAN KE HISTORY ---
    saveToHistory(extId, extName, isMalicious ? "MALICIOUS" : "SAFE", data.score);

    // --- TOMBOL AKSI ---
    document.getElementById('btn-enable').onclick = () => {
        chrome.management.setEnabled(extId, true, () => {
            alert("Ekstensi diaktifkan.");
            window.close();
        });
    };

    document.getElementById('btn-uninstall').onclick = () => {
        chrome.management.uninstall(extId, { showConfirmDialog: true }, () => {
            if (!chrome.runtime.lastError) {
                alert("Ekstensi dihapus.");
                window.close();
            }
        });
    };
}

function saveToHistory(extId, extName, status, score) {
    chrome.storage.local.get({ analysis_history: [] }, (data) => {
        let history = data.analysis_history;
        
        // Hapus history lama untuk ID yang sama jika ada
        history = history.filter(item => item.id !== extId);
        
        // Tambahkan di paling atas (index 0)
        history.unshift({
            id: extId,
            name: extName || "Ekstensi Lokal",
            status: status,
            score: score,
            time: new Date().toLocaleString('id-ID')
        });

        // Batasi history maksimal 20 item
        if (history.length > 20) {
            history.pop();
        }

        chrome.storage.local.set({ analysis_history: history });
    });
}

function showError(msg) {
    document.getElementById('loading-panel').classList.add('hidden');
    document.getElementById('error-panel').classList.remove('hidden');
    document.getElementById('error-message').textContent = msg;
}

function setupErrorButtons(extId) {
    document.getElementById('btn-err-retry').onclick = () => window.close();
    document.getElementById('btn-err-uninstall').onclick = () => {
        chrome.management.uninstall(extId, { showConfirmDialog: true }, () => window.close());
    };
}
