chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle_panel' }, (response) => {
    if (chrome.runtime.lastError) {
      // Content script not ready, inject manually
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    }
  });
});
