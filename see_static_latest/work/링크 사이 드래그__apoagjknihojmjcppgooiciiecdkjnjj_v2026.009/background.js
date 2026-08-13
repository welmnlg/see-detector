function updateUI(enabled) {
  chrome.action.setIcon({
    path: {
      "16":  enabled ? "icon16 on.png"  : "icon16 off.png",
      "48":  enabled ? "icon48 on.png"  : "icon48 off.png",
      "128": enabled ? "icon128 on.png" : "icon128 off.png"
    }
  });
}

async function initUI() {
  const { enabled } = await chrome.storage.sync.get({ enabled: true });
  updateUI(enabled);
}

chrome.runtime.onInstalled.addListener(initUI);
chrome.runtime.onStartup.addListener(initUI);

chrome.action.onClicked.addListener(async (tab) => {
  const { enabled } = await chrome.storage.sync.get({ enabled: true });
  const newState = !enabled;

  await chrome.storage.sync.set({ enabled: newState });
  updateUI(newState);

  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE", enabled: newState }).catch(() => {});
  }
});