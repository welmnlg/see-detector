// --- Icon & badge helpers ---

function updateIcon(enabled) {
  const suffix = enabled ? 'on' : 'off';
  chrome.action.setIcon({
    path: {
      16: `icons/icon-${suffix}-16.png`,
      48: `icons/icon-${suffix}-48.png`,
      128: `icons/icon-${suffix}-128.png`,
    },
  });
  chrome.action.setBadgeText({ text: enabled ? '' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#666' });
}

// Set correct icon on startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ enabled: true }, (data) => {
    updateIcon(data.enabled);
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get({ enabled: true }, (data) => {
    updateIcon(data.enabled);
  });
});

// --- Message handling ---

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'toggleEnabled') {
    updateIcon(message.enabled);
    return;
  }

  if (message.action === 'closeTab' && sender.tab) {
    // Check if enabled before closing
    chrome.storage.sync.get({ enabled: true }, (data) => {
      if (data.enabled) {
        chrome.tabs.remove(sender.tab.id);
      }
    });
  }
});
