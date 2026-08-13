chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ai-prompt-helper',
    title: '⬡ AI Prompt Framework Helper',
    contexts: ['editable'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ai-prompt-helper' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'openFrameworkHelper' });
  }
});
