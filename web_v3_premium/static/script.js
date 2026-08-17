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
    
    // Mapping Tooltip untuk Insights
    const tooltipMap = {
        "Skor Risiko Obfuscation": "Skor tambahan jika ekstensi mencoba menyembunyikan kode jahatnya (misal: pakai eval atau btoa).",
        "Domain Tak Dikenal": "Jumlah koneksi internet ke server yang tidak didaftarkan secara resmi di manifest ekstensi.",
        "Indikasi Leakage (URL/Data)": "Percobaan membocorkan data sensitif (seperti riwayat atau cookie) melalui URL atau Body HTTP.",
        "Izin Sensitif": "Jumlah akses krusial yang diminta (seperti akses ke tab, cookie, atau unduhan).",
        "Total HTTP Request": "Jumlah total tembakan jaringan yang dilakukan ekstensi saat diuji."
    };

    // Mapping Info untuk Behavior Categories
    const catTooltipMap = {
        "UReq": "Unauthorized HTTP Request: Ekstensi diam-diam mengirim data ke internet tanpa izin jaringan yang sah.",
        "UProf": "User Profiling: Ekstensi ketahuan merekam aktivitas ketikan, klik, atau gulir layar (Keylogging/Tracking).",
        "LF": "Local File Access: Ekstensi mengakses, membaca, atau mengemas file lokal Anda.",
        "CE": "Cookie Exfiltration: Ekstensi terbukti mencuri sesi login (Cookies) Anda.",
        "HH": "HTTP Hijacking: Ekstensi membelokkan atau membajak arah situs web yang Anda kunjungi.",
        "UDown": "Unauthorized Download: Ekstensi mengunduh file berbahaya secara paksa ke komputer Anda.",
        "CLE": "Clipboard Exfiltration: Ekstensi membaca teks yang baru saja Anda Copy/Salin.",
        "HE": "History Exfiltration: Ekstensi mencuri daftar riwayat penjelajahan browser Anda.",
        "FH": "Form Harvesting: Ekstensi menyadap kolom password atau formulir yang Anda ketik.",
        "URL": "URL Profiling Detected: Ekstensi ketahuan mengirimkan informasi situs yang sedang Anda kunjungi ke server pelacak.",
        "DOM": "DOM Scraping Detected: Ekstensi menyedot dan mencuri isi konten halaman web Anda.",
        "Sensitive": "Sensitive Data Leak: Ekstensi ketahuan membocorkan data rahasia (seperti kata sandi/cookie) lewat jaringan.",
        "Data": "Data sent to Telemetry/Tracker: Data aktivitas Anda dikirimkan ke server analitik/pelacakan.",
        "Base64": "Base64 Payload Obfuscation: Ekstensi menyembunyikan data curiannya dengan sandi rahasia sebelum dikirim."
    };

    // Fungsi global pembantu untuk menampilkan kotak info Behavior/Kategori
    window.showTagInfo = function(code, containerId) {
        const box = document.getElementById(containerId);
        const text = catTooltipMap[code] || "Informasi mendetail mengenai perilaku ini.";
        box.innerHTML = `<div class="term-line info" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-left: 3px solid #38bdf8;">${text}</div>`;
        box.style.display = 'block';
    };

    // Insights
    const insightList = document.getElementById('insight-list');
    let insightHtml = '';
    for(const [key, val] of Object.entries(data.insights)) {
        let displayKey = key;
        if (key === "Danger Multiplier Score") {
            displayKey = "Skor Risiko Obfuscation";
        }
        
        const tooltipText = tooltipMap[displayKey] || "Indikator fitur Machine Learning.";
        const tooltipHtml = `<span class="info-tooltip">?<span class="tooltip-text">${tooltipText}</span></span>`;
        
        insightHtml += `<li><span>${displayKey} ${tooltipHtml}</span> <strong>${val}</strong></li>`;
    }
    insightList.innerHTML = insightHtml;
    
    // Behavior Tags (Dynamic)
    const tagsDiv = document.getElementById('behavior-tags');
    let tagsHtml = '';
    if(data.behaviors && data.behaviors.length > 0) {
        data.behaviors.forEach(b => {
            const shortCode = b.split(' ')[0]; // Ambil kode depan seperti "URL", "Sensitive"
            tagsHtml += `<span class="tag" style="cursor:pointer;" onclick="showTagInfo('${shortCode}', 'behavior-info-box')"><i class="fa-solid fa-bug"></i> ${b}</span>`;
        });
    } else {
        tagsHtml += `<span class="tag safe"><i class="fa-solid fa-check"></i> Tidak Ada Aktivitas SEE Ditemukan</span>`;
    }
    tagsHtml += `<div id="behavior-info-box" style="display:none; width: 100%; animation: fadeIn 0.3s;"></div>`;
    tagsDiv.innerHTML = tagsHtml;
    
    // ML Features - DIHAPUS SESUAI PERMINTAAN USER
    const mlBody = document.getElementById('ml-features-body');
    if(mlBody) mlBody.innerHTML = '';
    
    // Static Analysis Tab
    if (data.static_analysis) {
        const stat = data.static_analysis;
        
        const perms = stat.permissions_list || [];
        let permsHtml = perms.length > 0 ? 
            perms.map(p => `<span>${p}</span>`).join('') : '<span style="color:#64748b;">(Kosong)</span>';
        
        const hostPerms = stat.host_permissions_list || [];
        let hostPermsHtml = hostPerms.length > 0 ? 
            hostPerms.map(p => `<span>${escapeHTML(p)}</span>`).join('') : '<span style="color:#64748b;">(Tidak ada akses host/URL)</span>';
            
        let csDetail = '';
        if (stat.content_script_count > 0) {
            if (stat.has_wildcard_cs_match) {
                csDetail = '<span style="color:#ef4444;">(Holistik: Menyadap SEMUA situs web secara membabi buta)</span>';
            } else {
                csDetail = '<span style="color:#4ade80;">(Spesifik: Hanya menyadap situs tertentu)</span>';
            }
        } else {
            csDetail = '<span style="color:#64748b;">(Tidak ada)</span>';
        }
        
        let dnrDetail = stat.dnr_rule_count > 0 ? `<span style="color:#fbbf24;">(Mengandung aturan pemblokiran/pengalihan jaringan)</span>` : '<span style="color:#64748b;">(Kosong)</span>';

        // Sensitive permissions logic
        const SENSITIVE_PERMISSIONS = ["cookies", "downloads", "history", "bookmarks", "tabs", "activeTab", "topSites", "webRequest", "webRequestBlocking", "declarativeNetRequest", "declarativeNetRequestWithHostAccess", "clipboardRead", "clipboardWrite", "nativeMessaging", "management", "debugger", "pageCapture", "tabCapture", "desktopCapture", "storage", "identity"];
        const sensPermsList = perms.filter(p => SENSITIVE_PERMISSIONS.includes(p));
        let sensPermsHtml = sensPermsList.length > 0 ? 
            sensPermsList.map(p => `<span>${p}</span>`).join('') : '<span style="color:#64748b;">(Kosong)</span>';

        document.getElementById('static-basic').innerHTML = `
            <li>
                Total Permissions: <span>${stat.permissions_count}</span>
                <button class="btn-detail" onclick="document.getElementById('det-perm').classList.toggle('open')">Lihat Detail</button>
                <div id="det-perm" class="static-detail-box">${permsHtml}</div>
            </li>
            <li>
                Sensitive Permissions: <span>${stat.sensitive_perms_count}</span>
                <button class="btn-detail" onclick="document.getElementById('det-sens').classList.toggle('open')">Lihat Detail</button>
                <div id="det-sens" class="static-detail-box">${sensPermsHtml}</div>
            </li>
            <li>
                Host Permissions: <span>${stat.host_permissions_count}</span>
                <button class="btn-detail" onclick="document.getElementById('det-host').classList.toggle('open')">Lihat Detail</button>
                <div id="det-host" class="static-detail-box">${hostPermsHtml}</div>
            </li>
            <li>
                Content Scripts: <span>${stat.content_script_count}</span>
                <div class="static-detail-box open" style="background:transparent; padding:0; margin-top:2px;">${csDetail}</div>
            </li>
            <li>
                DNR Rules: <span>${stat.dnr_rule_count}</span>
                <div class="static-detail-box open" style="background:transparent; padding:0; margin-top:2px;">${dnrDetail}</div>
            </li>
        `;
        
        const catDiv = document.getElementById('static-categories');
        let catHtml = '';
        if(stat.categories && stat.categories.length > 0) {
            stat.categories.forEach(c => {
                catHtml += `<span class="tag" style="cursor:pointer;" onclick="showTagInfo('${c}', 'static-cat-info')"><i class="fa-solid fa-tag"></i> ${c}</span>`;
            });
        } else {
            catHtml += `<span class="tag safe">Tidak Ada Kategori Terdeteksi</span>`;
        }
        // Tambahkan peringatan beda statis dan dinamis
        catHtml += `<div id="static-cat-info" style="display:none; width: 100%; animation: fadeIn 0.3s;"></div>`;
        catHtml += `<p style="font-size: 0.75rem; color: #94a3b8; margin-top: 10px; font-style: italic;">*Kategori Statis adalah niat kode yang terbaca sebelum dijalankan (Berbeda dengan Ikhtisar Dinamis).</p>`;
        catDiv.innerHTML = catHtml;
        
        const findDiv = document.getElementById('static-findings');
        let findingsHtml = '';
        if(stat.findings && stat.findings.length > 0) {
            stat.findings.forEach(f => {
                let fHtml = `<div class="term-line warn" style="margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">
                    <strong>[AST] Pola '${escapeHTML(f.pattern)}'</strong> pada file <code>${escapeHTML(f.file)}</code> (Baris ${f.line})
                `;
                if (f.matched_text) {
                    fHtml += `<br><span style="color:#cbd5e1; font-family:monospace; margin-left: 15px;">&gt; ${escapeHTML(f.matched_text)}</span>`;
                }
                fHtml += `</div>`;
                findingsHtml += fHtml;
            });
        } else {
            findingsHtml = `<div class="term-line success">[AST] Tidak ada API sensitif yang dipanggil.</div>`;
        }
        findDiv.innerHTML = findingsHtml;
    }
    
    // Dynamic Analysis Interactive Table
    const logsBody = document.getElementById('logs-body');
    let logsHtml = '';
    if(data.dynamic_logs && data.dynamic_logs.length > 0) {
        data.dynamic_logs.forEach((log, idx) => {
            const method = log.method || 'GET';
            const authStatus = log.is_unauth ? '<span style="color:#f87171">[UNAUTHORIZED DOMAIN]</span>' : '<span style="color:#4ade80">[AUTHORIZED]</span>';
            
            const payloadStr = log.post_data ? escapeHTML(log.post_data) : '{ Tidak ada Payload }';
            const headersStr = log.headers ? escapeHTML(log.headers) : '{}';
            
            logsHtml += `
                <tr class="main-row" onclick="toggleRow(${idx})">
                    <td><span class="method-badge method-${method}">${method}</span></td>
                    <td>${escapeHTML(log.domain || 'N/A')}</td>
                    <td>${escapeHTML(log.source || 'Unknown')}</td>
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
        logsHtml = `<tr><td colspan="4" style="text-align: center;">Tidak ada lalu lintas dinamis terekam.</td></tr>`;
    }
    logsBody.innerHTML = logsHtml;
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
