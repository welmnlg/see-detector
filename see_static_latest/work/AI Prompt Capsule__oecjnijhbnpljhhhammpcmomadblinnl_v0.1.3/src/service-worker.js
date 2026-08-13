importScripts('capsules.js');

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const core = globalThis.CapsuleCore;
  const stored = await chrome.storage.local.get([core.STORAGE_KEY]);
  if (!Array.isArray(stored[core.STORAGE_KEY])) {
    await chrome.storage.local.set({ [core.STORAGE_KEY]: core.DEFAULT_CAPSULES });
  }
  chrome.action.setBadgeText({ text: 'CTX' });
  chrome.action.setBadgeBackgroundColor({ color: '#2B0F3A' });
  await chrome.storage.local.set({ installReason: reason });
});
