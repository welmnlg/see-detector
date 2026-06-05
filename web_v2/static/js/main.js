document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // File Input Logic
    const fileInput = document.getElementById('file-input');
    const btnBrowse = document.getElementById('btn-browse');
    const btnAnalyzeFile = document.getElementById('btn-analyze-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const uploadArea = document.getElementById('upload-area');

    btnBrowse.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            fileNameDisplay.textContent = file.name;
            fileNameDisplay.style.display = 'inline-block';
            btnAnalyzeFile.disabled = false;
        } else {
            fileNameDisplay.style.display = 'none';
            btnAnalyzeFile.disabled = true;
        }
    });

    // Drag and Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--text-primary)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--gray-border)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--gray-border)';
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            
            const file = fileInput.files[0];
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext === 'crx' || ext === 'zip') {
                fileNameDisplay.textContent = file.name;
                fileNameDisplay.style.display = 'inline-block';
                btnAnalyzeFile.disabled = false;
            } else {
                alert("Hanya format .crx dan .zip yang didukung!");
                fileInput.value = '';
                fileNameDisplay.style.display = 'none';
                btnAnalyzeFile.disabled = true;
            }
        }
    });

    // Analyze Functions
    const inputSection = document.getElementById('input-section');
    const loadingSection = document.getElementById('loading-section');
    const resultSection = document.getElementById('result-section');
    const errorSection = document.getElementById('error-section');

    const btnAnalyzeUrl = document.getElementById('btn-analyze-url');
    const urlInput = document.getElementById('url-input');

    const resultHeader = document.querySelector('.result-header');
    const resultStatusTitle = document.getElementById('result-status-title');
    const resultScore = document.getElementById('result-score');
    const resultDesc = document.getElementById('result-description');
    const insightList = document.getElementById('insight-list');

    const processList = document.getElementById('process-list');
    let stepInterval;
    const steps = [
        "Mengunduh / Mengekstrak File Ekstensi",
        "Memindai Konfigurasi Struktural (Manifest)",
        "Memindai Pola Kode JavaScript (Regex)",
        "Menjalankan Peramban Chromium (Sandbox)",
        "Menyadap Jalur Komunikasi Jaringan (CDP)",
        "Mengevaluasi Fitur pada Model Random Forest"
    ];

    function startProcessSimulation() {
        processList.innerHTML = '';
        steps.forEach((step, index) => {
            const tr = document.createElement('tr');
            tr.className = 'process-item';
            tr.id = `step-${index}`;
            tr.innerHTML = `<td>${step}</td><td class="status-icon">⏳ Menunggu</td>`;
            processList.appendChild(tr);
        });

        let currentStep = 0;
        if (stepInterval) clearInterval(stepInterval);
        
        stepInterval = setInterval(() => {
            if (currentStep > 0) {
                const prev = document.getElementById(`step-${currentStep-1}`);
                if (prev) {
                    prev.className = 'process-item done';
                    prev.querySelector('.status-icon').textContent = '✅ Selesai';
                }
            }
            if (currentStep < steps.length) {
                const curr = document.getElementById(`step-${currentStep}`);
                if (curr) {
                    curr.className = 'process-item active';
                    curr.querySelector('.status-icon').textContent = '⚙️ Proses';
                }
                currentStep++;
            }
        }, 3500);
    }

    function showLoading() {
        inputSection.style.display = 'none';
        errorSection.style.display = 'none';
        resultSection.style.display = 'none';
        loadingSection.style.display = 'block';
        startProcessSimulation();
    }

    function showError(message) {
        if (stepInterval) clearInterval(stepInterval);
        loadingSection.style.display = 'none';
        errorSection.style.display = 'block';
        document.getElementById('error-message').textContent = message;
    }

    function showResult(data) {
        if (stepInterval) clearInterval(stepInterval);
        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';

        // Clear classes
        resultHeader.className = 'result-header';
        
        // Populate UI
        resultScore.textContent = data.score;
        document.getElementById('result-score-circle').style.setProperty('--score', data.score);
        
        if (data.status === "MALICIOUS") {
            resultHeader.classList.add('malicious');
            resultStatusTitle.textContent = "RENTAN SEE (MALICIOUS)";
            resultDesc.textContent = `Terdeteksi ancaman: ${data.see_categories || 'Stealth Extension Exfiltration'}`;
        } else {
            if (data.score < 50 && data.score > 10) { // Menyesuaikan batas aman karena sekarang berbasis keyakinan
                resultHeader.classList.add('safe');
                resultStatusTitle.textContent = "AMAN (SAFE)";
                resultDesc.textContent = "Tidak terdeteksi pola Stealth Extension Exfiltration.";
            } else {
                resultHeader.classList.add('safe');
                resultStatusTitle.textContent = "AMAN (SAFE)";
                resultDesc.textContent = "Tidak terdeteksi pola Stealth Extension Exfiltration.";
            }
        }

        // Populate insights
        insightList.innerHTML = '';
        for (const [key, value] of Object.entries(data.insights)) {
            const li = document.createElement('li');
            li.className = 'insight-item';
            
            const spanKey = document.createElement('span');
            spanKey.className = 'insight-key';
            spanKey.textContent = key;
            
            const spanValue = document.createElement('span');
            spanValue.className = 'insight-value';
            spanValue.textContent = value;
            
            li.appendChild(spanKey);
            li.appendChild(spanValue);
            insightList.appendChild(li);
        }

        // Populate network logs
        const networkLogsContainer = document.getElementById('network-logs-container');
        const networkList = document.getElementById('network-list');
        networkList.innerHTML = '';
        
        // Memaksa kontainer selalu tampil agar layout 2 kolom tetap konsisten
        networkLogsContainer.style.display = 'block';
        
        if (data.dynamic_logs && data.dynamic_logs.length > 0) {
            // Show up to 10 logs max to avoid clutter
            const logsToShow = data.dynamic_logs.slice(0, 10);
            logsToShow.forEach(log => {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                const logStr = typeof log === 'object' ? (log.url || JSON.stringify(log)) : String(log);
                td.textContent = logStr;
                tr.appendChild(td);
                networkList.appendChild(tr);
            });
            
            if (data.dynamic_logs.length > 10) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.textContent = `... dan ${data.dynamic_logs.length - 10} permintaan lainnya yang berhasil ditangkap oleh Sandbox.`;
                td.style.color = 'var(--gray-text)';
                td.style.fontStyle = 'italic';
                tr.appendChild(td);
                networkList.appendChild(tr);
            }
        } else {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = "Tidak ada aktivitas jaringan yang terdeteksi.";
            td.style.color = 'var(--gray-text)';
            td.style.fontStyle = 'italic';
            tr.appendChild(td);
            networkList.appendChild(tr);
        }
    }

    // Analyze File Request
    btnAnalyzeFile.addEventListener('click', async () => {
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        showLoading();

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || "Gagal menganalisis file.");
            }

            showResult(data);
        } catch (error) {
            showError(error.message);
        }
    });

    // Analyze URL Request
    btnAnalyzeUrl.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            alert("Harap masukkan tautan URL Chrome Web Store!");
            return;
        }

        showLoading();

        try {
            const response = await fetch('/api/analyze_url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || "Gagal menganalisis URL.");
            }

            showResult(data);
        } catch (error) {
            showError(error.message);
        }
    });

    // Retry buttons
    document.getElementById('btn-analyze-new').addEventListener('click', () => {
        resultSection.style.display = 'none';
        inputSection.style.display = 'block';
        urlInput.value = '';
        fileInput.value = '';
        fileNameDisplay.style.display = 'none';
        btnAnalyzeFile.disabled = true;
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        errorSection.style.display = 'none';
        inputSection.style.display = 'block';
    });
});
