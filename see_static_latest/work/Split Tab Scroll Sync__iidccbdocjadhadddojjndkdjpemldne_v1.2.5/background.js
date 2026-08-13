const syncGroups = new Map();

// 전역 상태 (storage 권한 없이 메모리에서 관리)
let syncEnabled = false;
let syncMode = 'smart';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCROLL_EVENT') {
    handleScrollEvent(message, sender.tab.id);
  } else if (message.type === 'TOGGLE_SYNC') {
    toggleSync(message.enabled);
  } else if (message.type === 'SET_SYNC_MODE') {
    setSyncMode(message.mode);
  } else if (message.type === 'GET_SPLIT_TABS') {
    getSplitTabs(sender.tab.windowId, sendResponse);
    return true;
  } else if (message.type === 'GET_SYNC_STATE') {
    sendResponse({ syncEnabled, syncMode });
    return true;
  }
});

function handleScrollEvent(message, tabId) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const currentTab = tabs.find(tab => tab.id === tabId);
    if (!currentTab) return;

    const splitTabs = tabs.filter(tab =>
      tab.id !== tabId &&
      tab.windowId === currentTab.windowId &&
      !tab.discarded
    );

    splitTabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SYNC_SCROLL',
        viewportInfo: message.viewportInfo
      }).catch(() => {});
    });
  });
}

function toggleSync(enabled) {
  syncEnabled = enabled;

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SYNC_ENABLED_CHANGED',
        enabled: enabled
      }).catch(() => {});
    });
  });
}

function setSyncMode(mode) {
  syncMode = mode;

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SYNC_MODE_CHANGED',
        mode: mode
      }).catch(() => {});
    });
  });
}

function getSplitTabs(windowId, sendResponse) {
  chrome.tabs.query({ windowId: windowId }, (tabs) => {
    const activeTabs = tabs.filter(tab => !tab.discarded);
    sendResponse({ tabs: activeTabs, count: activeTabs.length });
  });
}
