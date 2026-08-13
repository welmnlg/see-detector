// background.js

chrome.management.onInstalled.addListener((info) => {
    // Hindari memblokir ekstensi ini sendiri atau Chrome Apps
    if (info.id === chrome.runtime.id || info.type !== "extension") {
        return;
    }

    console.log(`[SEE Protector] Ekstensi baru terdeteksi: ${info.name} (${info.id})`);

    // Segera nonaktifkan ekstensi agar tidak berjalan
    chrome.management.setEnabled(info.id, false, () => {
        console.log(`[SEE Protector] Ekstensi ${info.name} berhasil ditahan.`);

        // Simpan info ekstensi ke storage
        chrome.storage.local.set({
            "pending_analysis_id": info.id,
            "pending_analysis_name": info.name
        }, () => {
            // Buka halaman laporan untuk memulai analisis
            chrome.tabs.create({ url: chrome.runtime.getURL("report.html") });
        });
    });
});
