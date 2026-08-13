// Hertz Detector - Background Service Worker
// Single source of truth: which tab is being detected, latest frequency,
// pro mode state, and always-on behavior.

let activeTabId = null;
let latestFrequency = 0;
let latestPeaks = [];
let latestSpectrum = [];

// Pro mode state
let proEnabled = false;
let alwaysOn = false;

// Free-tier detection timer (10s auto-stop)
let detectionTimer = null;
let detectionStartTime = null;
let lastStopReason = null; // "time-limit" | null

const FREE_SECONDS_LIMIT = 10;

// --- Restore persisted state on startup ---

chrome.storage.local.get(["proEnabled", "alwaysOn"], (result) => {
  proEnabled = result.proEnabled || false;
  alwaysOn = result.alwaysOn || false;
});

// --- Timer helpers ---

function getRemainingSeconds() {
  if (!detectionStartTime) return FREE_SECONDS_LIMIT;
  const elapsed = (Date.now() - detectionStartTime) / 1000;
  return Math.max(0, Math.round(FREE_SECONDS_LIMIT - elapsed));
}

function clearFreeTimer() {
  if (detectionTimer) {
    clearTimeout(detectionTimer);
    detectionTimer = null;
  }
  detectionStartTime = null;
}

function startFreeTimer() {
  clearFreeTimer();
  detectionStartTime = Date.now();
  detectionTimer = setTimeout(() => {
    autoStopDetection("time-limit");
  }, FREE_SECONDS_LIMIT * 1000);
}

// --- Core state reset helper ---

function resetDetectionState() {
  activeTabId = null;
  latestFrequency = 0;
  latestPeaks = [];
  latestSpectrum = [];
  clearFreeTimer();
  chrome.action.setBadgeText({ text: "" });
}

// --- Auto-stop for free tier ---

function autoStopDetection(reason) {
  if (activeTabId != null) {
    chrome.tabs.sendMessage(activeTabId, { type: "stop-detecting" }).catch(() => {});
  }
  lastStopReason = reason;
  activeTabId = null;
  latestFrequency = 0;
  latestPeaks = [];
  latestSpectrum = [];
  clearFreeTimer();
  chrome.action.setBadgeText({ text: "" });
}

// --- Start detection on a tab (shared by manual start and always-on) ---

async function startDetectionOnTab(tabId, sendResponse) {
  // Stop the old tab if different
  if (activeTabId != null && activeTabId !== tabId) {
    chrome.tabs.sendMessage(activeTabId, { type: "stop-detecting" }).catch(() => {});
  }

  activeTabId = tabId;
  latestFrequency = 0;
  latestPeaks = [];
  latestSpectrum = [];
  lastStopReason = null;

  // Tell the content script to start
  chrome.tabs.sendMessage(tabId, { type: "start-detecting" }, () => {
    if (chrome.runtime.lastError) {
      resetDetectionState();
      if (sendResponse) {
        sendResponse({ ok: false, error: "Cannot access this page" });
      }
      return;
    }

    // Start auto-stop timer for free users
    if (!proEnabled) {
      startFreeTimer();
    }

    if (sendResponse) {
      sendResponse({ ok: true });
    }
  });
}

// --- Message handler ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "frequency-update") {
    const tabId = sender.tab?.id;
    if (tabId == null || tabId !== activeTabId) return false;

    latestFrequency = message.frequency;
    latestPeaks = message.peaks || [];
    latestSpectrum = message.spectrum || [];

    const display = latestFrequency > 0 ? Math.round(latestFrequency).toString() : "--";
    chrome.action.setBadgeText({ text: display });
    chrome.action.setBadgeBackgroundColor({ color: latestFrequency > 0 ? "#4CAF50" : "#666" });
    return false;
  }

  if (message.type === "get-status") {
    sendResponse({
      activeTabId,
      frequency: latestFrequency,
      peaks: latestPeaks,
      spectrum: latestSpectrum,
      proEnabled,
      alwaysOn,
      remainingSeconds: !proEnabled && activeTabId != null ? getRemainingSeconds() : null,
      lastStopReason,
    });
    return false;
  }

  if (message.type === "set-pro") {
    proEnabled = message.enabled;
    chrome.storage.local.set({ proEnabled });

    // If disabling pro, also disable always-on
    if (!proEnabled) {
      alwaysOn = false;
      chrome.storage.local.set({ alwaysOn: false });

      // If currently detecting, apply the free timer
      if (activeTabId != null) {
        startFreeTimer();
      }
    } else {
      // Enabling pro — clear any free timer
      clearFreeTimer();
    }

    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "set-always-on") {
    if (!proEnabled) {
      sendResponse({ ok: false, error: "Pro mode required" });
      return false;
    }

    alwaysOn = message.enabled;
    chrome.storage.local.set({ alwaysOn });

    if (alwaysOn) {
      // Start detecting on the current active tab immediately
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          startDetectionOnTab(tabs[0].id, null);
        }
      });
    } else {
      // Stop current detection when disabling always-on
      if (activeTabId != null) {
        chrome.tabs.sendMessage(activeTabId, { type: "stop-detecting" }).catch(() => {});
      }
      resetDetectionState();
    }

    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "start") {
    const newTabId = message.tabId;
    startDetectionOnTab(newTabId, sendResponse);
    return true; // async sendResponse
  }

  if (message.type === "stop") {
    if (activeTabId != null) {
      chrome.tabs.sendMessage(activeTabId, { type: "stop-detecting" }).catch(() => {});
    }
    resetDetectionState();
    lastStopReason = null;
    sendResponse({ ok: true });
    return false;
  }
});

// --- Always-On: follow active tab ---

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!alwaysOn || !proEnabled) return;

  const newTabId = activeInfo.tabId;
  if (newTabId === activeTabId) return;

  // Stop old tab
  if (activeTabId != null) {
    chrome.tabs.sendMessage(activeTabId, { type: "stop-detecting" }).catch(() => {});
  }

  // Start on new tab
  startDetectionOnTab(newTabId, null);
});

// --- Always-On: re-start after navigation ---

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!alwaysOn || !proEnabled) return;
  if (changeInfo.status !== "complete") return;

  // Only re-start if this is the currently active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id === tabId) {
      // Small delay to let content script initialize
      setTimeout(() => {
        startDetectionOnTab(tabId, null);
      }, 200);
    }
  });
});

// --- Clean up if the active tab is closed ---

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    resetDetectionState();
    lastStopReason = null;
  }
});
