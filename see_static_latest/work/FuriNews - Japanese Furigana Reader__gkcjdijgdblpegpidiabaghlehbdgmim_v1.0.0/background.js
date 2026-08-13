"use strict";
(() => {
  // src/background.ts
  chrome.runtime.onInstalled.addListener((details) => {
    console.log("[Furigana] Extension installed:", details.reason);
    if (details.reason === "install") {
      chrome.storage.local.set({
        globalEnabled: true,
        autoProcess: false
        // 默认不自动处理，需要用户手动启用
      });
    }
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[Furigana Background] Received message:", message, "from:", sender);
    switch (message.type) {
      case "GET_TAB_ID":
        if (sender.tab?.id) {
          sendResponse({ tabId: sender.tab.id });
        } else {
          sendResponse({ error: "No tab ID available" });
        }
        break;
      case "INJECT_SCRIPT":
        if (message.tabId) {
          chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ["content_script.js"]
          }).then(() => {
            sendResponse({ success: true });
          }).catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
          return true;
        }
        break;
      default:
        sendResponse({ error: "Unknown message type" });
    }
    return false;
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      const japaneseNewsSites = [
        "nhk.or.jp",
        "asahi.com",
        "yomiuri.co.jp",
        "mainichi.jp",
        "nikkei.com",
        "sankei.com",
        "tokyo-np.co.jp",
        "chunichi.co.jp",
        "news.yahoo.co.jp"
      ];
      const isJapaneseNewsSite = japaneseNewsSites.some(
        (site) => tab.url?.includes(site)
      );
      if (isJapaneseNewsSite) {
        console.log("[Furigana Background] Japanese news site detected:", tab.url);
      }
    }
  });
  chrome.commands?.onCommand.addListener((command) => {
    console.log("[Furigana Background] Command received:", command);
    if (command === "toggle-furigana") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_ENABLED" });
        }
      });
    }
  });
  console.log("[Furigana Background] Service worker started");
})();
//# sourceMappingURL=background.js.map
