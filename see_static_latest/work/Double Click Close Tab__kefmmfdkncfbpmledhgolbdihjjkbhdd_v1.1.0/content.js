(() => {
  const DOUBLE_CLICK_INTERVAL = 500; // ms — max gap between two clicks
  const MIN_CLICK_GAP = 50;          // ms — ignore impossibly fast repeats

  let clickCount = 0;
  let lastClickTime = 0;
  let sent = false;

  /**
   * Elements where a double-click has its own meaning
   * (text selection, button activation, link interaction, etc.)
   */
  function isInteractive(el) {
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
        tag === 'BUTTON' || tag === 'A' || tag === 'VIDEO' || tag === 'AUDIO') {
      return true;
    }
    if (el.isContentEditable) return true;
    if (el.closest('a, button, [contenteditable="true"], [role="button"], [role="link"], [role="textbox"]')) {
      return true;
    }
    return false;
  }

  document.addEventListener('mouseup', (e) => {
    // Left button only
    if (e.button !== 0) return;

    const now = Date.now();
    const gap = now - lastClickTime;

    // Too slow — reset counter
    if (gap > DOUBLE_CLICK_INTERVAL) {
      clickCount = 1;
      lastClickTime = now;
      return;
    }

    // Ignore sub-50ms repeats (OS-level bounce / accessibility repeat)
    if (gap < MIN_CLICK_GAP) return;

    clickCount++;
    lastClickTime = now;

    if (clickCount >= 2 && !sent) {
      // If the double-click selected text, the user was selecting — don't close
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        clickCount = 0;
        return;
      }

      // Skip interactive elements
      if (isInteractive(e.target)) {
        clickCount = 0;
        return;
      }

      sent = true;
      // Check enabled state before sending close request
      chrome.storage.sync.get({ enabled: true }, (data) => {
        if (data.enabled) {
          chrome.runtime.sendMessage({ action: 'closeTab' });
        }
      });

      // Cooldown so a triple-click doesn't fire twice
      setTimeout(() => {
        sent = false;
        clickCount = 0;
      }, 500);
    }
  });
})();
