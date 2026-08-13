chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && changeInfo.url.includes('chzzk.naver.com/video/')) {
        const match = changeInfo.url.match(/\/video\/(\d+)/);
        if (match) {
            const videoNo = match[1];
            chrome.tabs.sendMessage(tabId, {
                action: 'VIDEO_CHANGED',
                videoNo: videoNo
            }).catch(() => {
            });
        }
    }
});