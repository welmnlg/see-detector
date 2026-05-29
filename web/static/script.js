document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnReset = document.getElementById('btn-reset');

    const uploadSection = document.getElementById('upload-section');
    const loadingSection = document.getElementById('loading-section');
    const resultSection = document.getElementById('result-section');
    const terminalLogs = document.getElementById('terminal-logs');

    let selectedFile = null;

    // Drag & Drop Events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        if (file.name.endsWith('.crx') || file.name.endsWith('.zip')) {
            selectedFile = file;
            fileInfo.innerHTML = `<i class="fa-solid fa-file-zipper"></i> ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            btnAnalyze.disabled = false;
        } else {
            alert('Hanya file .crx atau .zip yang diizinkan!');
            selectedFile = null;
            fileInfo.innerText = '';
            btnAnalyze.disabled = true;
        }
    }

    // Fake Terminal Animation
    const fakeLogs = [
        "[SYSTEM] Unpacking extension archive...",
        "[STATIC] Parsing manifest.json...",
        "[STATIC] Analyzing Javascript AST...",
        "[DYNAMIC] Launching Playwright Chromium Sandbox...",
        "[DYNAMIC] Injecting dummy session cookies...",
        "[DYNAMIC] Monitoring background service worker...",
        "[DYNAMIC] Simulating user scroll and clicks...",
        "[DYNAMIC] Intercepting network requests...",
        "[ML] Extracting 81 hybrid features...",
        "[ML] Running Random Forest classifier..."
    ];
    let terminalInterval;

    function startTerminalAnimation() {
        terminalLogs.innerHTML = '<li>[SYSTEM] Initializing Sandbox Environment...</li>';
        let idx = 0;
        terminalInterval = setInterval(() => {
            if (idx < fakeLogs.length) {
                const li = document.createElement('li');
                li.innerText = fakeLogs[idx];
                terminalLogs.appendChild(li);
                // Auto scroll to bottom
                document.querySelector('.fake-terminal').scrollTop = document.querySelector('.fake-terminal').scrollHeight;
                idx++;
            } else {
                clearInterval(terminalInterval);
            }
        }, 2000); // Add a log every 2 seconds
    }

    // Analyze Button Click
    btnAnalyze.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI Changes
        uploadSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        startTerminalAnimation();

        // Prepare FormData
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            clearInterval(terminalInterval);

            if (!response.ok) {
                throw new Error(data.error || 'Server Error');
            }

            displayResults(data);

        } catch (error) {
            clearInterval(terminalInterval);
            alert('Terjadi kesalahan: ' + error.message);
            loadingSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
        }
    });

    function displayResults(data) {
        loadingSection.classList.add('hidden');
        resultSection.classList.remove('hidden');

        // Status Badge
        const statusBadge = document.getElementById('status-badge');
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        const scoreCircle = document.getElementById('score-circle');
        const scoreValue = document.getElementById('score-value');

        statusBadge.className = 'status-badge'; // reset
        scoreCircle.className = 'score-circle'; // reset
        
        statusText.innerText = data.status;
        scoreValue.innerText = data.score + '%';

        if (data.status === "MALICIOUS") {
            statusBadge.classList.add('status-malicious');
            statusIcon.className = 'fa-solid fa-skull-crossbones';
            scoreCircle.classList.add('score-malicious');
        } else {
            statusBadge.classList.add('status-safe');
            statusIcon.className = 'fa-solid fa-shield-check';
            scoreCircle.classList.add('score-safe');
        }

        // Insights List
        const insightsList = document.getElementById('insights-list');
        insightsList.innerHTML = '';
        for (const [key, value] of Object.entries(data.insights)) {
            const li = document.createElement('li');
            li.innerHTML = `<span>${key}</span> <strong>${value}</strong>`;
            insightsList.appendChild(li);
        }

        // SEE Categories
        const catBadge = document.getElementById('categories-badge');
        catBadge.innerHTML = '';
        if (data.see_categories) {
            const cats = data.see_categories.split(', ');
            cats.forEach(c => {
                const span = document.createElement('span');
                span.innerText = c;
                catBadge.appendChild(span);
            });
        } else {
            catBadge.innerHTML = '<span class="text-gray">None Detected</span>';
        }

        // Dynamic Logs Table
        const tbody = document.querySelector('#logs-table tbody');
        tbody.innerHTML = '';
        if (data.dynamic_logs && data.dynamic_logs.length > 0) {
            data.dynamic_logs.forEach(log => {
                const tr = document.createElement('tr');
                let payload = log.post_data ? log.post_data.substring(0, 50) + '...' : '-';
                tr.innerHTML = `
                    <td><span style="color: ${log.method==='POST'?'#ef4444':'#3b82f6'}">${log.method}</span></td>
                    <td>${log.domain}</td>
                    <td title="${log.post_data || ''}">${payload}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-gray">No network activity captured</td></tr>';
        }
    }

    btnReset.addEventListener('click', () => {
        selectedFile = null;
        fileInfo.innerText = '';
        btnAnalyze.disabled = true;
        fileInput.value = '';
        
        resultSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
    });
});
