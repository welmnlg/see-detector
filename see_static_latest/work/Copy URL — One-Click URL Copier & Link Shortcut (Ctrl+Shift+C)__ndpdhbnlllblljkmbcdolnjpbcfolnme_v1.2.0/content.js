'use strict';

const DEFAULT_SHORTCUT = {
  ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, key: 'C'
};

let shortcut = DEFAULT_SHORTCUT;
let enabled = true;
let onboarded = false;

// Load initial state
chrome.storage.local.get(['shortcut', 'enabled', 'onboarded'], (result) => {
  if (result.shortcut) shortcut = result.shortcut;
  if (result.enabled !== undefined) enabled = result.enabled;
  if (result.onboarded !== undefined) onboarded = result.onboarded;
});

// Live-update when settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.shortcut?.newValue) shortcut = changes.shortcut.newValue;
  if (changes.enabled?.newValue !== undefined) enabled = changes.enabled.newValue;
  if (changes.onboarded?.newValue !== undefined) onboarded = changes.onboarded.newValue;
});

// Inject toast CSS once
let cssInjected = false;
function ensureToastCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .__ctrl-shift-c-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: #1F2937;
      color: #F9FAFB;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 2147483647;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    }
    .__ctrl-shift-c-toast--visible {
      opacity: 1;
      transform: translateY(0);
    }
    .__ctrl-shift-c-toast--hiding {
      opacity: 0;
      transform: translateY(-4px);
    }
  `;
  document.head.appendChild(style);
}

function showToast() {
  ensureToastCSS();

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
}

// Listen for the shortcut
document.addEventListener('keydown', (e) => {
  if (!enabled || !onboarded) return;
  if (!shortcut) return;

  const match =
    e.ctrlKey === shortcut.ctrlKey &&
    e.shiftKey === shortcut.shiftKey &&
    e.altKey === shortcut.altKey &&
    e.metaKey === shortcut.metaKey &&
    e.key.toUpperCase() === shortcut.key.toUpperCase();

  if (!match) return;

  e.preventDefault();
  e.stopPropagation();

  // Copy URL and show toast directly — no background roundtrip needed
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast();
  }).catch(() => {
    // Fallback: ask background to handle it
    chrome.runtime.sendMessage({ type: 'copy-url' });
  });
}, true);
