// ─── RTL Toggle · Background Service Worker ───────────────────────────────

function buildMenus() {
  chrome.contextMenus.removeAll(() => {

    chrome.contextMenus.create({
      id: 'rtl-picker',
      title: chrome.i18n.getMessage('ctxPicker'),
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rtl-sep1',
      type: 'separator',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rtl-toggle-element',
      title: chrome.i18n.getMessage('ctxToggleElement'),
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rtl-toggle-selection',
      title: chrome.i18n.getMessage('ctxToggleSelection'),
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'rtl-sep2',
      type: 'separator',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'rtl-reset',
      title: chrome.i18n.getMessage('ctxReset'),
      contexts: ['all']
    });
  });
}

chrome.runtime.onInstalled.addListener(buildMenus);
chrome.runtime.onStartup.addListener(buildMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === 'rtl-picker')           chrome.tabs.sendMessage(tab.id, { action: 'activatePicker' });
  else if (info.menuItemId === 'rtl-toggle-element')   chrome.tabs.sendMessage(tab.id, { action: 'toggleAtContextTarget' });
  else if (info.menuItemId === 'rtl-toggle-selection') chrome.tabs.sendMessage(tab.id, { action: 'toggleAtSelection' });
  else if (info.menuItemId === 'rtl-reset')            chrome.tabs.sendMessage(tab.id, { action: 'resetAll' });
});
