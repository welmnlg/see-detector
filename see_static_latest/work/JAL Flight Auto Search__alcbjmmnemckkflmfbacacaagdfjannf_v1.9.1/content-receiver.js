// content-receiver.js
// ツール画面で動作。マーカー設置と通信の中継。

// 1. マーカー設置 (即時実行)
(function() {
    const markerId = "jal-flight-search-extension-installed";
    if (document.getElementById(markerId)) return;

    const marker = document.createElement("div");
    marker.id = markerId;
    marker.style.display = "none";
    marker.setAttribute("data-version", "1.0");
    
    const target = document.documentElement || document.body;
    if (target) {
        target.appendChild(marker);
    }
})();

// 2. メッセージ中継
window.addEventListener("message", (event) => {
    if (event.data && event.data.action === "SEARCH_JAL_FLIGHTS") {
        console.log("Extension Receiver: Forwarding data...", event.data);
        try {
            chrome.runtime.sendMessage(event.data);
        } catch (e) {
            console.error("Connection failed. Please reload the extension.", e);
        }
    }
});