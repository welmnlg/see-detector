'use strict';

// Uses globals from shared/shortcut-utils.js:
//   DEFAULT_SHORTCUT, formatShortcut, createRecordHandler

const setupNeeded = document.getElementById('setup-needed');
const popupMain = document.getElementById('popup-main');
const openOnboardingBtn = document.getElementById('open-onboarding-btn');

const toggle = document.getElementById('toggle-shortcut');
const statusText = document.getElementById('status-text');
const shortcutDisplay = document.getElementById('shortcut-display');
const copyBtn = document.getElementById('copy-now-btn');
const changeShortcutBtn = document.getElementById('change-shortcut-btn');
const resetShortcutBtn = document.getElementById('reset-shortcut-btn');
const recorderEl = document.getElementById('shortcut-recorder');
const recorderDisplay = document.getElementById('recorder-display');
const cancelRecordBtn = document.getElementById('cancel-record-btn');

let currentShortcut = DEFAULT_SHORTCUT;
let recordHandler = null;

// --- Initialize ---
chrome.storage.local.get(['enabled', 'shortcut', 'onboarded'], (result) => {
  if (result.onboarded !== true) {
    setupNeeded.hidden = false;
    popupMain.hidden = true;
    return;
  }

  const isEnabled = result.enabled !== false;
  currentShortcut = result.shortcut || DEFAULT_SHORTCUT;

  toggle.checked = isEnabled;
  updateUI(isEnabled, currentShortcut);
});

// --- Setup needed: open onboarding ---
openOnboardingBtn.addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('onboarding/onboarding.html')
  });
  window.close();
});

// --- Toggle ---
toggle.addEventListener('change', () => {
  const isEnabled = toggle.checked;
  chrome.storage.local.set({ enabled: isEnabled });
  updateUI(isEnabled, currentShortcut);
});

// --- Manual copy ---
copyBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  try {
    await navigator.clipboard.writeText(tab.url);
    showCopiedFeedback();
  } catch {
    chrome.runtime.sendMessage({ type: 'copy-url' });
    showCopiedFeedback();
  }
});

// --- Shortcut recorder ---
changeShortcutBtn.addEventListener('click', startRecording);
cancelRecordBtn.addEventListener('click', stopRecording);

function startRecording() {
  recorderEl.hidden = false;
  changeShortcutBtn.hidden = true;
  resetShortcutBtn.hidden = true;
  recorderDisplay.textContent = 'Press a key combo\u2026';
  recorderDisplay.classList.remove('popup__recorder-input--captured');

  recordHandler = createRecordHandler({
    onModifiersOnly(text) {
      recorderDisplay.textContent = text;
    },
    onNoModifier() {
      recorderDisplay.textContent = 'Add a modifier (Ctrl, Shift, Alt)';
    },
    onCapture(shortcut, displayText) {
      currentShortcut = shortcut;
      chrome.storage.local.set({ shortcut });
      recorderDisplay.textContent = displayText;
      recorderDisplay.classList.add('popup__recorder-input--captured');
      updateUI(toggle.checked, shortcut);
      setTimeout(() => stopRecording(), 600);
    }
  });

  document.addEventListener('keydown', recordHandler);
}

function stopRecording() {
  recorderEl.hidden = true;
  changeShortcutBtn.hidden = false;
  updateResetVisibility();

  if (recordHandler) {
    document.removeEventListener('keydown', recordHandler);
    recordHandler = null;
  }
}

// --- Reset ---
resetShortcutBtn.addEventListener('click', () => {
  currentShortcut = DEFAULT_SHORTCUT;
  chrome.storage.local.set({ shortcut: DEFAULT_SHORTCUT });
  updateUI(toggle.checked, DEFAULT_SHORTCUT);
});

// --- UI updates ---
function updateUI(isEnabled, shortcut) {
  const label = formatShortcut(shortcut);
  shortcutDisplay.textContent = label;

  if (isEnabled) {
    statusText.textContent = `Press ${label} to copy URL`;
    statusText.classList.remove('popup__status--disabled');
  } else {
    statusText.textContent = 'Shortcut disabled';
    statusText.classList.add('popup__status--disabled');
  }

  updateResetVisibility();
}

function updateResetVisibility() {
  const isDefault =
    currentShortcut.ctrlKey === DEFAULT_SHORTCUT.ctrlKey &&
    currentShortcut.shiftKey === DEFAULT_SHORTCUT.shiftKey &&
    currentShortcut.altKey === DEFAULT_SHORTCUT.altKey &&
    currentShortcut.metaKey === DEFAULT_SHORTCUT.metaKey &&
    currentShortcut.key.toUpperCase() === DEFAULT_SHORTCUT.key.toUpperCase();

  resetShortcutBtn.hidden = isDefault;
}

function showCopiedFeedback() {
  copyBtn.textContent = 'Copied!';
  copyBtn.classList.add('popup__copy-btn--copied');

  setTimeout(() => {
    copyBtn.textContent = 'Copy Current URL';
    copyBtn.classList.remove('popup__copy-btn--copied');
  }, 1500);
}
