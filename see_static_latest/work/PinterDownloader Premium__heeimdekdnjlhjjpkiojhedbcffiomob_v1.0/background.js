// 다운로드 처리를 위한 백그라운드 서비스 워커
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download") {
    const { url, filename } = request;
    
    chrome.downloads.download({
      url: url,
      filename: `PinterDownloader/${filename}`,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        try { sendResponse({ status: "error", message: chrome.runtime.lastError.message }); } catch(e) {}
      } else {
        try { sendResponse({ status: "success", downloadId: downloadId }); } catch(e) {}
      }
    });
    return true; // 비동기 응답을 위해 true 반환
  }
});
