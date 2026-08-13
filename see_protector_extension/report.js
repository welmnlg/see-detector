document.addEventListener('DOMContentLoaded', () => {
    // URL Backend VMware (Ubah IP ini jika VMware berjalan di IP berbeda)
    const BACKEND_URL = "http://127.0.0.1:5001/api/analyze_url";

    chrome.storage.local.get(["pending_analysis_id", "pending_analysis_name"], async (data) => {
        const extId = data.pending_analysis_id;
        const extName = data.pending_analysis_name;

        if (!extId) {
            showError("Tidak ada ekstensi yang sedang dianalisis.");
            return;
        }

        document.getElementById('loading-ext-name').textContent = extName;

        try {
            // Memanggil API Backend (Statis + Dinamis + ML)
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: extId }) // API web_v3_premium menerima URL/ID
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Gagal melakukan analisis.");
            }

            displayResult(extId, result);

        } catch (error) {
            showError(`Gagal menghubungi peladen VMware: ${error.message}`);
            setupErrorButtons(extId);
        }
    });
});

function displayResult(extId, data) {
    document.getElementById('loading-panel').classList.add('hidden');
    document.getElementById('result-panel').classList.remove('hidden');

    const statusCard = document.getElementById('status-card');
    const statusText = document.getElementById('final-status');
    const scoreText = document.getElementById('confidence-score');
    
    if (data.status === 'MALICIOUS') {
        statusCard.className = 'status-card status-malicious';
        statusText.textContent = 'RENTAN (SEE ATTACK DETECTED)';
    } else {
        statusCard.className = 'status-card status-safe';
        statusText.textContent = 'AMAN (SAFE)';
    }

    scoreText.textContent = `${data.score}%`;

    const insightList = document.getElementById('insight-list');
    insightList.innerHTML = '';
    for(const [key, val] of Object.entries(data.insights || {})) {
        insightList.innerHTML += `<li><span>${key}</span> <strong>${val}</strong></li>`;
    }

    // Tombol Aksi
    document.getElementById('btn-enable').addEventListener('click', () => {
        chrome.management.setEnabled(extId, true, () => {
            alert("Ekstensi telah diaktifkan.");
            window.close();
        });
    });

    document.getElementById('btn-uninstall').addEventListener('click', () => {
        chrome.management.uninstall(extId, { showConfirmDialog: true }, () => {
            if (chrome.runtime.lastError) {
                // Pengguna mungkin membatalkan uninstall
                console.log(chrome.runtime.lastError.message);
            } else {
                alert("Ekstensi berhasil dihapus.");
                window.close();
            }
        });
    });
}

function showError(msg) {
    document.getElementById('loading-panel').classList.add('hidden');
    document.getElementById('result-panel').classList.add('hidden');
    document.getElementById('error-panel').classList.remove('hidden');
    document.getElementById('error-message').textContent = msg;
}

function setupErrorButtons(extId) {
    document.getElementById('btn-err-enable').addEventListener('click', () => {
        chrome.management.setEnabled(extId, true, () => window.close());
    });
    document.getElementById('btn-err-uninstall').addEventListener('click', () => {
        chrome.management.uninstall(extId, { showConfirmDialog: true }, () => window.close());
    });
}
