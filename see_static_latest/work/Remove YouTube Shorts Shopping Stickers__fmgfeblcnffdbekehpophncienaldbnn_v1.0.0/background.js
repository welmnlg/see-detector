chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== 'STICKER_BLOCKED' || !sender.tab) return;
  chrome.action.setBadgeText({ text: '✓', tabId: sender.tab.id });
  chrome.action.setBadgeBackgroundColor({ color: '#3ecf6e', tabId: sender.tab.id });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});
