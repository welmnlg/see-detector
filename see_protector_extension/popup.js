document.addEventListener('DOMContentLoaded', () => {
    renderHistory();

    document.getElementById('btn-clear-history').addEventListener('click', () => {
        if(confirm("Apakah Anda yakin ingin menghapus semua riwayat analisis?")) {
            chrome.storage.local.set({ analysis_history: [] }, () => {
                renderHistory();
            });
        }
    });

    // Setting Server API
    const serverSelect = document.getElementById('server-select');
    chrome.storage.local.get(['apiUrl'], function(res) {
        if (res.apiUrl) {
            serverSelect.value = res.apiUrl;
        }
    });

    serverSelect.addEventListener('change', function() {
        chrome.storage.local.set({ apiUrl: serverSelect.value });
    });
});

function renderHistory() {
    chrome.storage.local.get({ analysis_history: [] }, (data) => {
        const listDiv = document.getElementById('history-list');
        const history = data.analysis_history;

        if (!history || history.length === 0) {
            listDiv.innerHTML = `<p style="font-size:0.8rem; color:#64748b; text-align:center; margin-top:20px;">Belum ada riwayat analisis.</p>`;
            return;
        }

        listDiv.innerHTML = '';
        history.forEach(item => {
            const statusClass = item.status === 'MALICIOUS' ? 'badge-malicious' : 'badge-safe';
            const statusText = item.status === 'MALICIOUS' ? 'Rentan (Bahaya)' : 'Aman';
            const scoreText = item.score ? ` (${item.score}%)` : '';

            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            itemDiv.innerHTML = `
                <h4>${item.name}</h4>
                <div class="meta">
                    <span>${item.time}</span>
                    <span class="${statusClass}">${statusText}${scoreText}</span>
                </div>
                <div style="font-size:0.7rem; color:#64748b; margin-top:3px;">ID: ${item.id}</div>
            `;
            listDiv.appendChild(itemDiv);
        });
    });
}
