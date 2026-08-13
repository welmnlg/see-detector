'use strict';

const stepWelcome = document.getElementById('step-welcome');
const stepShortcut = document.getElementById('step-shortcut');
const stepDone = document.getElementById('step-done');

const btnGetStarted = document.getElementById('btn-get-started');
const btnConfirm = document.getElementById('btn-confirm-shortcut');
const btnUseDefault = document.getElementById('btn-use-default');
const btnStartUsing = document.getElementById('btn-start-using');
const btnTryHere = document.getElementById('btn-try-here');
const recorderDisplay = document.getElementById('recorder-display');
const recorderHint = document.getElementById('recorder-hint');
const finalLabel = document.getElementById('final-shortcut-label');
const finalKeycaps = document.getElementById('final-keycaps');
const fallbackNote = document.getElementById('fallback-note');
const tryHint = document.getElementById('try-hint');
const trySuccess = document.getElementById('try-success');
const dots = document.querySelectorAll('.onboarding__dot');

let capturedShortcut = null;
let recordHandler = null;
let savedShortcut = DEFAULT_SHORTCUT;
let tryHandler = null;

// Guard: if already onboarded, close tab
chrome.storage.local.get(['onboarded'], (result) => {
  if (result.onboarded === true) {
    window.close();
  }
});

// --- Step navigation ---

function goToStep(stepNumber) {
  [stepWelcome, stepShortcut, stepDone].forEach((s) =>
    s.classList.remove('onboarding__step--active')
  );

  dots.forEach((dot, i) => {
    dot.classList.remove('onboarding__dot--active', 'onboarding__dot--completed');
    if (i + 1 < stepNumber) dot.classList.add('onboarding__dot--completed');
    if (i + 1 === stepNumber) dot.classList.add('onboarding__dot--active');
  });

  const target = [stepWelcome, stepShortcut, stepDone][stepNumber - 1];
  requestAnimationFrame(() => {
    target.classList.add('onboarding__step--active');
  });

  if (stepNumber === 2) startListening();
  if (stepNumber === 3) {
    stopListening();
    startTryListening();
  } else {
    stopTryListening();
  }
}

// --- Shortcut recording ---

function startListening() {
  recorderDisplay.textContent = 'Press a key combo\u2026';
  recorderDisplay.classList.remove('onboarding__recorder-display--captured');
  btnConfirm.disabled = true;
  capturedShortcut = null;

  recordHandler = createRecordHandler({
    onModifiersOnly(text) {
      recorderDisplay.textContent = text;
    },
    onNoModifier() {
      recorderDisplay.textContent = 'Add a modifier (Ctrl, Shift, Alt)';
      recorderHint.textContent = 'You need at least one modifier key';
    },
    onCapture(shortcut, displayText) {
      capturedShortcut = shortcut;
      recorderDisplay.textContent = displayText;
      recorderDisplay.classList.add('onboarding__recorder-display--captured');
      btnConfirm.disabled = false;
      recorderHint.textContent = 'Press a different combo to change, or confirm below';
    }
  });

  document.addEventListener('keydown', recordHandler);
}

function stopListening() {
  if (recordHandler) {
    document.removeEventListener('keydown', recordHandler);
    recordHandler = null;
  }
}

// --- Save and complete ---

function isDefaultShortcut(s) {
  return (
    s.ctrlKey === DEFAULT_SHORTCUT.ctrlKey &&
    s.shiftKey === DEFAULT_SHORTCUT.shiftKey &&
    s.altKey === DEFAULT_SHORTCUT.altKey &&
    s.metaKey === DEFAULT_SHORTCUT.metaKey &&
    s.key.toUpperCase() === DEFAULT_SHORTCUT.key.toUpperCase()
  );
}

function renderKeycaps(shortcut) {
  const keys = [];
  if (shortcut.ctrlKey) keys.push('Ctrl');
  if (shortcut.shiftKey) keys.push('Shift');
  if (shortcut.altKey) keys.push('Alt');
  if (shortcut.metaKey) keys.push('Cmd');
  keys.push(formatKey(shortcut.key));

  finalKeycaps.textContent = '';
  keys.forEach((label, i) => {
    if (i > 0) {
      const plus = document.createElement('span');
      plus.className = 'onboarding__kbd-plus';
      plus.textContent = '+';
      finalKeycaps.appendChild(plus);
    }
    const kbd = document.createElement('kbd');
    kbd.className = 'onboarding__kbd';
    kbd.textContent = label;
    finalKeycaps.appendChild(kbd);
  });
}

function saveShortcutAndProceed(shortcut) {
  chrome.storage.local.set({ shortcut });
  savedShortcut = shortcut;
  finalLabel.textContent = formatShortcut(shortcut);
  renderKeycaps(shortcut);
  fallbackNote.hidden = isDefaultShortcut(shortcut);
  goToStep(3);
}

function matchesShortcut(e, s) {
  return (
    e.ctrlKey === s.ctrlKey &&
    e.shiftKey === s.shiftKey &&
    e.altKey === s.altKey &&
    e.metaKey === s.metaKey &&
    e.key.toUpperCase() === s.key.toUpperCase()
  );
}

function startTryListening() {
  stopTryListening();
  tryHandler = (e) => {
    const match = matchesShortcut(e, savedShortcut) ||
      (!isDefaultShortcut(savedShortcut) && matchesShortcut(e, DEFAULT_SHORTCUT));
    if (!match) return;

    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(window.location.href).catch(() => {});
    showPreviewToast();
    revealTrySuccess();
  };
  document.addEventListener('keydown', tryHandler, true);
}

function stopTryListening() {
  if (tryHandler) {
    document.removeEventListener('keydown', tryHandler, true);
    tryHandler = null;
  }
}

function revealTrySuccess() {
  if (tryHint) tryHint.hidden = true;
  if (trySuccess) trySuccess.hidden = false;
}

// Fallback path: background sends this when default Ctrl+Shift+C is pressed
// on the onboarding page (chrome.commands intercepts before our keydown fires).
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'onboarding-try') {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    showPreviewToast();
    revealTrySuccess();
  }
});

function showPreviewToast() {
  const existing = document.querySelector('.onboarding__preview-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'onboarding__preview-toast';
  toast.textContent = 'URL copied!';
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('onboarding__preview-toast--visible');
  });

  setTimeout(() => {
    toast.classList.add('onboarding__preview-toast--hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 1500);
}

function completeOnboarding() {
  chrome.storage.local.set({ onboarded: true }, () => {
    window.close();
  });
}

// --- Button handlers ---

btnGetStarted.addEventListener('click', () => goToStep(2));

btnConfirm.addEventListener('click', () => {
  if (capturedShortcut) saveShortcutAndProceed(capturedShortcut);
});

btnUseDefault.addEventListener('click', () => {
  saveShortcutAndProceed(DEFAULT_SHORTCUT);
});

btnStartUsing.addEventListener('click', completeOnboarding);

btnTryHere.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).catch(() => {});
  showPreviewToast();
});
