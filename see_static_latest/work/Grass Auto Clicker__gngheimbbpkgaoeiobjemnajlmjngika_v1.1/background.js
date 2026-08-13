function handleToggle() {
  chrome.storage.local.get(['isRunning', 'interval', 'mode'], (data) => {
    const newState = !data.isRunning;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.storage.local.set({ isRunning: newState });
        
        if (newState) {
          chrome.storage.local.set({ targetTabId: tabs[0].id });
        }

        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggle",
          state: newState,
          interval: data.interval || 1000,
          mode: data.mode || "follow"
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_hotkey_pressed") {
    handleToggle();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => checkAndReset(tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') checkAndReset(tabId);
});

function checkAndReset(affectedTabId) {
  chrome.storage.local.get(['targetTabId', 'isRunning'], (data) => {
    if (data.isRunning && data.targetTabId === affectedTabId) {
      chrome.storage.local.set({ isRunning: false, targetTabId: null });
    }
  });
}