// background.js

const BACKEND_URL = "http://127.0.0.1:5002/api/analyze_url";

chrome.management.onInstalled.addListener((info) => {
    // Hindari memblokir ekstensi ini sendiri atau Chrome Apps
    if (info.id === chrome.runtime.id || info.type !== "extension") {
        return;
    }

    console.log(`[SEE Protector] Ekstensi baru terdeteksi: ${info.name} (${info.id})`);

    // 1. Segera nonaktifkan ekstensi
    chrome.management.setEnabled(info.id, false, () => {
        console.log(`[SEE Protector] Ekstensi ${info.name} berhasil ditahan.`);

        // 2. Simpan info untuk dibaca oleh report.js
        chrome.storage.local.set({
            "pending_analysis_id": info.id,
            "pending_analysis_name": info.name
        }, () => {
            // 3. Buka halaman laporan sebagai window popup terpisah
            // Window ini bersifat independen dan tidak akan di-kill oleh Chrome dalam 30 detik.
            // Tampilkan Notifikasi Desktop (Optional, tapi bagus agar user sadar)
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon128.png",
                title: "SEE Protector",
                message: `Menahan ekstensi ${info.name} untuk analisis ML...`
            });
            chrome.windows.create({
                url: chrome.runtime.getURL("report.html"),
                type: "popup",
                width: 480,
                height: 650,
                focused: true
            });
        });
    });
});
