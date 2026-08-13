'use strict';

const RESTRICTED_SCHEMES = [
  'chrome:', 'chrome-extension:', 'chrome-untrusted:',
  'devtools:', 'edge:', 'about:', 'data:', 'view-source:'
];
const OFFSCREEN_PATH = 'offscreen.html';
const UNINSTALL_URL = 'https://forms.gle/etAeGnCtw5zEgQNs9';
const DEFAULT_SHORTCUT = {
  ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, key: 'C'
};

// --- Install: set defaults + open onboarding ---
chrome.runtime.onInstalled.addListener((details) => {
  chrome.runtime.setUninstallURL(UNINSTALL_URL);

  chrome.storage.local.get(['enabled', 'shortcut', 'onboarded'], (result) => {
    const defaults = {};
    if (result.enabled === undefined) defaults.enabled = true;
    if (!result.shortcut) defaults.shortcut = DEFAULT_SHORTCUT;
    if (Object.keys(defaults).length > 0) {
      chrome.storage.local.set(defaults);
    }

    if (details.reason === 'install' && result.onboarded !== true) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('onboarding/onboarding.html')
      });
    }

    // Existing users on update: don't force onboarding
    if (details.reason === 'update' && result.onboarded === undefined) {
      chrome.storage.local.set({ onboarded: true });
    }
  });
});

// --- Commands API handler (default shortcut) ---
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'copy-url') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const onboardingUrl = chrome.runtime.getURL('onboarding/onboarding.html');
  if (tab?.url?.startsWith(onboardingUrl)) {
    chrome.tabs.sendMessage(tab.id, { type: 'onboarding-try' }).catch(() => {});
    return;
  }

  copyTabUrl();
});

// --- Message handler (from content script custom shortcut) ---
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'copy-url') {
    copyTabUrl().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'copy-to-clipboard' && message.target === 'offscreen') {
    return;
  }
});

// --- Core copy logic ---
async function copyTabUrl() {
  const { enabled, onboarded } = await chrome.storage.local.get(['enabled', 'onboarded']);
  if (!enabled || onboarded !== true) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  const url = tab.url;

  if (isRestricted(url)) {
    await copyViaOffscreen(url);
    showBadgeFeedback();
  } else {
    await copyViaInjection(tab.id, url);
  }
}

// --- Primary: inject into active tab ---
async function copyViaInjection(tabId, url) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content/toast.css']
    });

    await chrome.scripting.executeScript({
      target: { tabId },
      func: copyAndShowToast,
      args: [url]
    });
  } catch (err) {
    console.warn('Injection failed, falling back to offscreen:', err);
    await copyViaOffscreen(url);
    showBadgeFeedback();
  }
}

// Serialized and injected into the page — cannot reference outer scope
function copyAndShowToast(url) {
  navigator.clipboard.writeText(url).then(() => {
    const existing = document.querySelector('.__ctrl-shift-c-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = '__ctrl-shift-c-toast';
    toast.textContent = 'URL copied!';
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('__ctrl-shift-c-toast--visible');
    });

    setTimeout(() => {
      toast.classList.add('__ctrl-shift-c-toast--hiding');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 1500);
  });
}

// --- Fallback: offscreen document ---
async function copyViaOffscreen(url) {
  await ensureOffscreenDocument();

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'copy-to-clipboard', target: 'offscreen', data: url },
      () => resolve()
    );
  });
}

let creatingOffscreen = null;

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_PATH);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (contexts.length > 0) return;

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: OFFSCREEN_PATH,
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: 'Copy tab URL to clipboard on restricted pages'
    });
    await creatingOffscreen;
    creatingOffscreen = null;
  }
}

// --- Helpers ---
function isRestricted(url) {
  return RESTRICTED_SCHEMES.some((scheme) => url.startsWith(scheme));
}

function showBadgeFeedback() {
  chrome.action.setBadgeText({ text: '\u2713' });
  chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500);
}
