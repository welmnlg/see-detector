chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'DOWNLOAD_FILE') {
        chrome.downloads.download({
            url: msg.url,
            filename: msg.filename,
            saveAs: true // ★ 강제로 "다른 이름으로 저장" 창을 띄웁니다
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ downloadId: downloadId });
            }
        });
        return true; 
    }
});