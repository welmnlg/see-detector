// Tab Handling (Input)
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

// Result Tab Handling (Thesis Edition)
const resTabBtns = document.querySelectorAll('.res-tab-btn');
const resTabContents = document.querySelectorAll('.res-tab-content');

resTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        resTabBtns.forEach(b => b.classList.remove('active'));
        resTabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});


// File Drop Handling
const fileInput = document.getElementById('ext-file');
const fileDropArea = document.querySelector('.file-drop-area');
const fileInfo = document.getElementById('file-info');
const fileNameSpan = document.getElementById('file-name');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
['dragenter', 'dragover'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, () => fileDropArea.classList.add('dragover'), false);
});
['dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, () => fileDropArea.classList.remove('dragover'), false);
});
fileDropArea.addEventListener('drop', (e) => {
    handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length) {
        fileNameSpan.textContent = files[0].name;
        fileDropArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        fileInput.files = dataTransfer.files;
    }
}

// Form Submission
document.getElementById('url-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('ext-url').value;
    if(!url) return;
    
    // Attempt to parse ID from URL
    let ext_id = '';
    try {
        const parts = url.split('/');
        ext_id = parts[parts.length - 1].split('?')[0];
    } catch(e) {}
    
    showLoading();
    document.getElementById('loading-ext-name').innerText = "Menganalisis: Sedang memuat nama...";
    
    // Fetch name in parallel (fire and forget promise, updates UI when done)
    if(ext_id) {
        const fd = new FormData();
        fd.append('ext_id', ext_id);
        fetch('/api/ext_name', {method: 'POST', body: fd})
            .then(r => r.json())
            .then(d => {
                if(d.name) document.getElementById('loading-ext-name').innerText = `Menganalisis: ${d.name}`;
            }).catch(e => console.log(e));
    }
    
    const simInterval = simulateRealtimeLogs();
    
    try {
        const res = await fetch('/api/analyze_url', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url})
        });
        const data = await res.json();
        clearInterval(simInterval);
        if(!res.ok) throw new Error(data.error || 'Server error');
        showResult(data);
    } catch(err) {
        clearInterval(simInterval);
        alert("Error: " + err.message);
        resetUI();
    }
});

document.getElementById('file-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if(!file) return;
    
    showLoading();
    document.getElementById('loading-ext-name').innerText = `Menganalisis: ${file.name}`;
    
    const simInterval = simulateRealtimeLogs();
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        clearInterval(simInterval);
        if(!res.ok) throw new Error(data.error || 'Server error');
        showResult(data);
    } catch(err) {
        clearInterval(simInterval);
        alert("Error: " + err.message);
        resetUI();
    }
});

function showLoading() {
    document.querySelector('.input-section').classList.add('hidden');
    document.getElementById('result-panel').classList.add('hidden');
    document.getElementById('loading-panel').classList.remove('hidden');
    document.getElementById('terminal-body').innerHTML = ''; // reset logs
}

function simulateRealtimeLogs() {
    const term = document.getElementById('terminal-body');
    const logs = [
        {time: 0, text: "[INFO] Menerima ekstensi, mempersiapkan ekstraksi...", class: "info"},
        {time: 2, text: "[OK] Ekstraksi berhasil. Memulai AST Parser & Manifest Analyzer...", class: "success"},
        {time: 5, text: "[INFO] Memindai permission, content_scripts, dan mendeteksi pola kategori SEE...", class: "white"},
        {time: 8, text: "[OK] Analisis statis selesai. Menginisiasi Playwright Sandbox (Profile Injected)...", class: "success"},
        {time: 15, text: "[S1] Menjalankan Skenario Facebook. Mensimulasikan klik dan scroll...", class: "white"},
        {time: 35, text: "[S2] Menjalankan Skenario LinkedIn. Menginjeksi Canary Cookies...", class: "white"},
        {time: 55, text: "[S3] Menjalankan Skenario Gmail. Membuka inbox...", class: "white"},
        {time: 80, text: "[S4] Menjalankan Skenario HTTP Site (NeverSSL)...", class: "white"},
        {time: 90, text: "[S5] Menjalankan Skenario Login Form. Mengetik kredensial...", class: "white"},
        {time: 105, text: "[S6] Menjalankan Skenario Local File (Data Sensitif)...", class: "white"},
        {time: 115, text: "[S7] Menjalankan Skenario Download Test...", class: "white"},
        {time: 120, text: "[S8] Menjalankan Skenario WebRTC Microphone...", class: "white"},
        {time: 135, text: "[OK] Sandbox selesai. Menyusun fitur perilaku (X_input)...", class: "success"},
        {time: 140, text: "[INFO] Memuat Best Model (RandomForestClassifier)...", class: "info"},
        {time: 145, text: "[OK] Proses prediksi selesai. Mengirimkan hasil ke UI.", class: "success"},
        {time: 155, text: "[WAIT] Sedang menunggu respons final dari server... (Analisis ini berat, bersabarlah!)", class: "error"}
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

// Interactive Table Row Toggle
function toggleRow(id) {
    const detailRow = document.getElementById('detail-' + id);
    if(detailRow.classList.contains('open')) {
        detailRow.classList.remove('open');
    } else {
        detailRow.classList.add('open');
    }
}

function showResult(data) {
    document.getElementById('loading-panel').classList.add('hidden');
    document.getElementById('result-panel').classList.remove('hidden');
    
    // Switch to first tab
    resTabBtns[0].click();
    
    const statusCard = document.getElementById('status-card');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('final-status');
    const scoreText = document.getElementById('confidence-score');
    
    statusCard.className = 'glass-panel result-header';
    statusIcon.className = 'fa-solid';
    
    if (data.status === 'MALICIOUS') {
        statusCard.classList.add('status-malicious');
        statusIcon.classList.add('fa-triangle-exclamation');
        statusText.textContent = 'RENTAN SEE (VULNERABLE)';
    } else {
        statusCard.classList.add('status-safe');
        statusIcon.classList.add('fa-shield-check');
        statusText.textContent = 'AMAN (SAFE)';
    }
    scoreText.textContent = `${data.score}%`;
    
    // Insights
    const insightList = document.getElementById('insight-list');
    insightList.innerHTML = '';
    for(const [key, val] of Object.entries(data.insights)) {
        insightList.innerHTML += `<li><span>${key}</span> <strong>${val}</strong></li>`;
    }
    
    // Behavior Tags
    const tagsDiv = document.getElementById('behavior-tags');
    tagsDiv.innerHTML = '';
    if(data.behaviors && data.behaviors.length > 0) {
        data.behaviors.forEach(b => {
            tagsDiv.innerHTML += `<span class="tag"><i class="fa-solid fa-bug"></i> ${b}</span>`;
        });
    } else {
        tagsDiv.innerHTML += `<span class="tag safe"><i class="fa-solid fa-check"></i> Tidak Ada Aktivitas SEE Ditemukan</span>`;
    }
    
    // ML Features - DIHAPUS SESUAI PERMINTAAN USER
    const mlBody = document.getElementById('ml-features-body');
    if(mlBody) mlBody.innerHTML = '';
    
    // Static Analysis Tab
    if (data.static_analysis) {
        const stat = data.static_analysis;
        document.getElementById('static-basic').innerHTML = `
            <li>Total Permissions: <span>${stat.permissions_count}</span></li>
            <li>Sensitive Permissions: <span>${stat.sensitive_perms_count}</span></li>
            <li>Host Permissions: <span>${stat.host_permissions_count}</span></li>
            <li>Content Scripts: <span>${stat.content_script_count}</span></li>
            <li>DNR Rules: <span>${stat.dnr_rule_count}</span></li>
        `;
        
        const catDiv = document.getElementById('static-categories');
        catDiv.innerHTML = '';
        if(stat.categories && stat.categories.length > 0) {
            stat.categories.forEach(c => {
                catDiv.innerHTML += `<span class="tag"><i class="fa-solid fa-tag"></i> ${c}</span>`;
            });
        } else {
            catDiv.innerHTML = `<span class="tag safe">Tidak Ada Kategori Terdeteksi</span>`;
        }
        
        const findDiv = document.getElementById('static-findings');
        findDiv.innerHTML = '';
        if(stat.findings && stat.findings.length > 0) {
            stat.findings.forEach(f => {
                let findingHTML = `<div class="term-line warn" style="margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">
                    <strong>[AST] Pola '${escapeHTML(f.pattern)}'</strong> pada file <code>${escapeHTML(f.file)}</code> (Baris ${f.line})
                `;
                // Tampilkan potongan kode jika ada
                if (f.matched_text) {
                    findingHTML += `<br><span style="color:#cbd5e1; font-family:monospace; margin-left: 15px;">&gt; ${escapeHTML(f.matched_text)}</span>`;
                }
                findingHTML += `</div>`;
                findDiv.innerHTML += findingHTML;
            });
        } else {
            findDiv.innerHTML = `<div class="term-line success">[AST] Tidak ada API sensitif yang dipanggil.</div>`;
        }
    }
    
    // Dynamic Analysis Interactive Table
    const logsBody = document.getElementById('logs-body');
    logsBody.innerHTML = '';
    if(data.dynamic_logs && data.dynamic_logs.length > 0) {
        data.dynamic_logs.forEach((log, idx) => {
            const method = log.method || 'GET';
            const authStatus = log.is_unauth ? '<span style="color:#f87171">[UNAUTHORIZED DOMAIN]</span>' : '<span style="color:#4ade80">[AUTHORIZED]</span>';
            
            const payloadStr = log.post_data ? escapeHTML(log.post_data) : '{ Tidak ada Payload }';
            const headersStr = log.headers ? escapeHTML(log.headers) : '{}';
            
            logsBody.innerHTML += `
                <tr class="main-row" onclick="toggleRow(${idx})">
                    <td><span class="method-badge method-${method}">${method}</span></td>
                    <td>${log.domain || 'N/A'}</td>
                    <td>${log.source || 'Unknown'}</td>
                    <td>${authStatus}</td>
                </tr>
                <tr class="detail-row" id="detail-${idx}">
                    <td colspan="4">
                        <div class="detail-content">
                            <strong>Full URL:</strong> <span style="color: #38bdf8">${escapeHTML(log.url)}</span><br><br>
                            <strong>Request Headers:</strong>
                            <pre>${headersStr}</pre>
                            <strong>Payload (Raw):</strong>
                            <pre>${payloadStr}</pre>
                            <strong>Evidence Summary:</strong> <span style="color:#fbbf24">${escapeHTML(log.evidence)}</span>
                        </div>
                    </td>
                </tr>
            `;
        });
    } else {
        logsBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Tidak ada lalu lintas dinamis terekam.</td></tr>`;
    }
}

function resetUI() {
    document.getElementById('result-panel').classList.add('hidden');
    document.getElementById('loading-panel').classList.add('hidden');
    document.querySelector('.input-section').classList.remove('hidden');
    document.getElementById('url-form').reset();
    fileDropArea.style.display = 'flex';
    fileInfo.style.display = 'none';
}

function escapeHTML(str) {
    if(!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
