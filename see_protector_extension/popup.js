document.getElementById('btn-test').addEventListener('click', () => {
    chrome.storage.local.get(["pending_analysis_id"], (data) => {
        if (data.pending_analysis_id) {
            chrome.tabs.create({ url: chrome.runtime.getURL("report.html") });
        } else {
            alert("Belum ada ekstensi yang dianalisis sejauh ini.");
        }
    });
});
