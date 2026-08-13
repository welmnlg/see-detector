// Claude Web Clipper — Background Service Worker

const CONTEXT_WINDOW_LIMIT = 200000;

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "clip-to-claude",
    title: "Clip to Claude Context",
    contexts: ["selection"],
  });
  updateBadge();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clip-to-claude") {
    chrome.tabs.sendMessage(tab.id, { action: "getSelection" }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script not loaded — use the selection text from context menu
        saveClip({
          text: info.selectionText,
          url: tab.url,
          title: tab.title,
          isCode: false,
          category: "reference",
        });
        return;
      }
      if (response && response.text) {
        saveClip({
          text: response.text,
          url: tab.url,
          title: tab.title,
          isCode: response.isCode,
          category: response.isCode ? "code" : "reference",
        });
      }
    });
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "clip-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        { action: "getSelection" },
        (response) => {
          if (chrome.runtime.lastError) return;
          if (response && response.text) {
            saveClip({
              text: response.text,
              url: tab.url,
              title: tab.title,
              isCode: response.isCode,
              category: response.isCode ? "code" : "reference",
            });
          }
        },
      );
    });
  }
});

// Save a clip to storage
async function saveClip(clipData) {
  const { clips = [] } = await chrome.storage.local.get("clips");
  const clip = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text: clipData.text,
    url: clipData.url,
    title: clipData.title,
    timestamp: Date.now(),
    category: clipData.category || "reference",
    isCode: clipData.isCode || false,
  };
  clips.push(clip);
  await chrome.storage.local.set({ clips });
  updateBadge();

  // Show notification via content script
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "showNotification",
        clipCount: clips.length,
      });
    }
  } catch {
    // Content script may not be available
  }
}

// Update badge with clip count
async function updateBadge() {
  const { clips = [] } = await chrome.storage.local.get("clips");
  const count = clips.length;
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#7c4dff" });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "updateBadge") {
    updateBadge();
    sendResponse({ ok: true });
  }
  if (message.action === "getClips") {
    chrome.storage.local.get("clips", (data) => {
      sendResponse({ clips: data.clips || [] });
    });
    return true;
  }
});
