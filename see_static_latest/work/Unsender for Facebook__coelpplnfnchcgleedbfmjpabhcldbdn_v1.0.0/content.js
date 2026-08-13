(() => {
  if (window.__fbUnsendInjected) return;
  window.__fbUnsendInjected = true;
  window.__fbUnsendRunning = false;

  let unsendCount = 0;
  let overlay = null;

  function createOverlay() {
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'fb-unsend-overlay';
    overlay.innerHTML = `Unsending... <span class="count">0</span> removed`;
    document.body.appendChild(overlay);
  }

  function updateOverlay(count, text) {
    if (!overlay) return;
    overlay.innerHTML = `${text || 'Unsending...'} <span class="count">${count}</span> removed`;
  }

  function removeOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Send a real mouse click via Chrome DevTools Protocol (through background script)
  function realClick(x, y) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'realClick', x: Math.round(x), y: Math.round(y) }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[FB Unsend] realClick error:', chrome.runtime.lastError.message);
          resolve(false);
        } else {
          resolve(response?.success || false);
        }
      });
    });
  }

  function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Fire a realistic pointer + mouse event at the center of an element
  function fireMouseEvent(el, type, extra = {}) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const common = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      screenX: x + window.screenX,
      screenY: y + window.screenY,
      ...extra
    };
    el.dispatchEvent(new PointerEvent(type.replace('mouse', 'pointer'), { ...common, pointerId: 1, pointerType: 'mouse' }));
    el.dispatchEvent(new MouseEvent(type, common));
  }

  // Trigger React's internal hover/enter handlers by calling props directly
  function triggerReactHover(el) {
    const propsKey = Object.keys(el).find(k => k.startsWith('__reactProps$'));
    if (propsKey) {
      const props = el[propsKey];
      const fakeEvent = {
        type: 'pointerenter', target: el, currentTarget: el,
        preventDefault() {}, stopPropagation() {}, nativeEvent: new Event('pointerenter')
      };
      try { if (props.onPointerEnter) props.onPointerEnter(fakeEvent); } catch (e) {}
      try { if (props.onMouseEnter) props.onMouseEnter({ ...fakeEvent, type: 'mouseenter' }); } catch (e) {}
      try { if (props.onMouseOver) props.onMouseOver({ ...fakeEvent, type: 'mouseover' }); } catch (e) {}
      return true;
    }
    return false;
  }

  // Walk up from an element and trigger React hover on each ancestor
  async function triggerHoverChain(el, maxDepth = 10) {
    let current = el;
    for (let i = 0; i < maxDepth && current; i++) {
      triggerReactHover(current);
      fireMouseEvent(current, 'mouseover');
      fireMouseEvent(current, 'mousemove');
      current = current.parentElement;
    }
  }

  // Get the scrollable chat container
  function getScrollContainer() {
    // Try role="main" first, then fall back to broader search
    const main = document.querySelector('[role="main"]');
    const root = main || document.body;
    let best = null;
    let bestHeight = 0;
    root.querySelectorAll('div').forEach(div => {
      const cs = getComputedStyle(div);
      const canScroll = cs.overflowY === 'auto' || cs.overflowY === 'scroll';
      if (canScroll && div.scrollHeight > div.clientHeight && div.clientHeight > bestHeight && div.clientHeight > 200) {
        bestHeight = div.clientHeight;
        best = div;
      }
    });
    return best;
  }

  // Get all message rows — Facebook uses role="row" for both sidebar and chat
  function getMessageRows() {
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return [];

    // Get role="row" elements inside the scroll container only (excludes sidebar)
    let rows = Array.from(scrollContainer.querySelectorAll('[role="row"]'));

    // Filter out non-message rows:
    // - Sidebar items are typically all the same height (72px)
    // - Empty/spacer rows (h < 10)
    // - Date separator rows (no actual message content)
    rows = rows.filter(r => {
      const h = r.getBoundingClientRect().height;
      if (h < 10) return false; // spacers
      // Must contain message text (div[dir] or div with text)
      const hasContent = r.querySelector('div[dir="auto"]') || r.querySelector('span');
      return hasContent;
    });

    return rows;
  }

  // Check if a row is YOUR message — Facebook shows "You sent" or "You replied" text
  function isYourMessage(row) {
    // Primary: look for "You sent", "You replied", "You:" prefixed accessibility text
    const spans = row.querySelectorAll('span');
    for (const span of spans) {
      const text = span.textContent.trim().toLowerCase();
      if (text === 'you sent' || text === 'you replied' || text === 'you sent a sticker.' ||
          text.startsWith('you sent') || text.startsWith('you replied')) {
        return true;
      }
    }
    return false;
  }

  // Find the actual hoverable message bubble inside a row
  function findMessageBubble(row) {
    const candidates = [];
    row.querySelectorAll('div, span').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10 || rect.width > 600) return;

      const cs = getComputedStyle(el);
      const hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
      const hasRadius = cs.borderRadius && cs.borderRadius !== '0px';
      const hasText = el.textContent?.trim().length > 0;

      if (hasBg && hasRadius && rect.width > 30 && rect.height > 15) {
        candidates.push({ el, area: rect.width * rect.height, priority: 1 });
      } else if (hasText && rect.height >= 20 && !hasBg) {
        candidates.push({ el, area: rect.width * rect.height, priority: 2 });
      }
    });

    candidates.sort((a, b) => a.priority - b.priority || a.area - b.area);

    if (candidates.length > 0) {
      return candidates[0].el;
    }

    return row;
  }

  // Find "Unsend" / "Remove" option in any visible menu/dialog
  function findUnsendOption() {
    const unsendTexts = [
      'unsend', 'remove', 'unsend message',
      'annuler l\'envoi', 'supprimer', 'zurückrufen', 'entfernen',
      'cancelar envío', 'cancelar envio', 'retirar', 'geri al',
      'ongedaan maken', 'verwijderen',
      'отменить отправку', 'удалить',
      'إلغاء الإرسال', 'إزالة'
    ];

    // Check clickable elements
    const clickables = document.querySelectorAll(
      '[role="dialog"] button, [role="dialog"] [role="button"], ' +
      '[role="menu"] [role="menuitem"], [role="listbox"] [role="option"], ' +
      '[role="dialog"] [role="menuitem"], ' +
      'button, [role="button"], [role="menuitem"]'
    );

    for (const el of clickables) {
      const text = el.textContent.trim().toLowerCase();
      if (unsendTexts.includes(text)) {
        return el;
      }
    }

    // Search all spans as fallback
    for (const span of document.querySelectorAll('span')) {
      const text = span.textContent.trim().toLowerCase();
      if (unsendTexts.includes(text)) {
        const parent = span.closest('button, [role="button"], [role="menuitem"], div[tabindex]') || span;
        return parent;
      }
    }

    return null;
  }

  async function closeAnyPopup() {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
    await sleep(200);
    document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
    await sleep(400);
  }

  // Find the "More" button that appears on hover (aria-label="More", 28x28 svg button)
  function findMoreButton() {
    // Facebook uses aria-label="More" on the button/svg
    const candidates = document.querySelectorAll('[aria-label="More"], [aria-label="Plus"], [aria-label="Mehr"], [aria-label="Altro"], [aria-label="Más"]');
    for (const el of candidates) {
      const btn = el.closest('[role="button"]') || el;
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.width <= 40 && rect.height <= 40 && btn.querySelector('svg')) {
        return btn;
      }
    }
    return null;
  }

  // Find the VISIBLE unsend confirmation dialog
  function findUnsendDialog() {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    for (const d of dialogs) {
      const rect = d.getBoundingClientRect();
      if (rect.height > 0 && d.textContent?.includes('unsend')) {
        return d;
      }
    }
    // Fallback: any visible dialog
    for (const d of dialogs) {
      if (d.getBoundingClientRect().height > 0) return d;
    }
    return null;
  }

  // Handle the Facebook unsend confirmation dialog
  async function handleUnsendDialog() {
    await sleep(500);
    const dialog = findUnsendDialog();
    if (!dialog) {
      return false;
    }

    // "Unsend for everyone" is pre-selected, so go straight to clicking "Remove"
    // Find the Remove span with cursor=pointer (there are 2 Remove spans - one disabled, one enabled)
    const removeTexts = ['remove', 'supprimer', 'entfernen', 'eliminar', 'إزالة', 'rimuovi', 'verwijderen'];

    // Search ALL spans on the page (not just dialog, since dialog detection can be tricky)
    const allSpans = document.querySelectorAll('span');
    for (const span of allSpans) {
      const text = span.textContent.trim().toLowerCase();
      if (!removeTexts.includes(text)) continue;

      const rect = span.getBoundingClientRect();
      const cursor = getComputedStyle(span).cursor;
      if (rect.width === 0 || cursor !== 'pointer') continue;

      // Found a visible, clickable "Remove" span — find its role="button" ancestor
      let btn = span.closest('[role="button"]');
      if (btn && getComputedStyle(btn).cursor === 'pointer') {
        btn.click();
        await sleep(500);
        if (!findUnsendDialog()) return true;
      }

      // Try clicking the span itself and each parent
      let el = span;
      for (let i = 0; i < 6; i++) {
        el.click();
        await sleep(200);
        if (!findUnsendDialog()) return true;
        el = el.parentElement;
        if (!el) break;
      }

      // Fallback: CDP real click at the button coordinates
      await realClick(rect.left + rect.width / 2, rect.top + rect.height / 2);
      await sleep(500);
      if (!findUnsendDialog()) return true;
    }

    return false;
  }

  async function tryUnsendMessage(row) {
    const bubble = findMessageBubble(row);
    if (!bubble) {
      return 'skip';
    }

    // Scroll into view
    bubble.scrollIntoView({ behavior: 'instant', block: 'center' });
    await sleep(400);

    // Strategy 1: Trigger React hover on bubble and ancestors
    await triggerHoverChain(bubble);
    await sleep(600);

    let moreBtn = findMoreButton();

    // Strategy 2: Try triggering on row and its descendants
    if (!moreBtn) {
      await triggerHoverChain(row);
      await sleep(400);

      let el = bubble;
      while (el && el !== row) {
        triggerReactHover(el);
        await sleep(100);
        moreBtn = findMoreButton();
        if (moreBtn) break;
        el = el.parentElement;
      }
    }

    if (!moreBtn) {
      moreBtn = findMoreButton();
    }

    if (moreBtn) {
      moreBtn.click();
      await sleep(800);

      // Find "Unsend" / "Remove" option in the action menu
      const unsendBtn = findUnsendOption();
      if (unsendBtn) {
        unsendBtn.click();
        await sleep(1000);

        // Handle the "Who do you want to unsend for?" dialog
        const confirmed = await handleUnsendDialog();
        if (confirmed) {
          await sleep(500);
          return 'success';
        }

        // Fallback: maybe no dialog (direct unsend)
        return 'success';
      }
      await closeAnyPopup();
      return 'not_yours';
    }

    return 'fail';
  }

  async function startUnsending(minDelay, maxDelay) {
    window.__fbUnsendRunning = true;
    unsendCount = 0;
    createOverlay();

    const scrollContainer = getScrollContainer();

    if (!scrollContainer) {
      console.error('[FB Unsend] No scrollable chat container found. Are you in a Messenger conversation?');
      updateOverlay(0, 'Error: no chat found!');
      window.__fbUnsendRunning = false;
      return;
    }

    // Detect scroll direction
    const isReversed = getComputedStyle(scrollContainer).flexDirection === 'column-reverse';

    // Scroll to bottom first (most recent messages) — repeat to ensure we're truly at the bottom
    for (let i = 0; i < 3; i++) {
      const sc = getScrollContainer();
      if (sc) {
        sc.scrollTop = isReversed ? 0 : sc.scrollHeight;
      }
      await sleep(800);
    }
    await sleep(500);

    let consecutiveFails = 0;
    let emptyScrollStreak = 0;
    const maxEmptyScrollStreak = 15;
    let reachedTopCount = 0;

    // Helper: wait for new messages to load after scrolling
    async function waitForNewContent(prevRowCount, maxWaitMs = 6000) {
      const pollInterval = 500;
      let waited = 0;
      while (waited < maxWaitMs) {
        await sleep(pollInterval);
        waited += pollInterval;
        const currentRows = getMessageRows();
        if (currentRows.length !== prevRowCount) {
          return true;
        }
      }
      return false;
    }

    // Helper: check if we're at the oldest messages (top of chat)
    function isAtTop(sc) {
      if (isReversed) {
        const maxNeg = -(sc.scrollHeight - sc.clientHeight);
        return sc.scrollTop <= maxNeg + 5;
      }
      return sc.scrollTop <= 1;
    }

    // Helper: scroll up one step and wait for content
    async function scrollUpAndWait() {
      const sc = getScrollContainer();
      if (!sc) { return false; }

      const reversed = getComputedStyle(sc).flexDirection === 'column-reverse';
      const prevRowCount = getMessageRows().length;
      const prevScrollTop = sc.scrollTop;
      const scrollStep = sc.clientHeight * 1.5;

      let newScrollTop;
      if (reversed) {
        const minScroll = -(sc.scrollHeight - sc.clientHeight);
        newScrollTop = Math.max(minScroll, sc.scrollTop - scrollStep);
      } else {
        newScrollTop = Math.max(0, sc.scrollTop - scrollStep);
      }

      updateOverlay(unsendCount, 'Scrolling up...');

      if (isAtTop(sc)) {
        sc.scrollTop = reversed ? sc.scrollTop + 200 : sc.scrollTop - 200;
        await sleep(500);
        sc.scrollTop = prevScrollTop;
        await sleep(3000);
        reachedTopCount++;

        const loaded = await waitForNewContent(prevRowCount, 6000);
        return loaded;
      }

      sc.scrollTop = newScrollTop;

      const loaded = await waitForNewContent(prevRowCount, 6000);

      if (isAtTop(sc)) {
        await sleep(3000);
        reachedTopCount++;
      }

      return loaded;
    }

    // Helper: check if there are any of YOUR untried messages in current view
    function findYourUntriedMessages() {
      const rows = getMessageRows();
      return rows.filter(r => !r.dataset.fbTried && isYourMessage(r));
    }

    while (window.__fbUnsendRunning) {
      let yourMessages = findYourUntriedMessages();

      if (yourMessages.length === 0) {
        const allRows = getMessageRows();
        const untriedRows = allRows.filter(r => !r.dataset.fbTried);

        if (untriedRows.length === 0 && allRows.length > 0) {
          const loaded = await scrollUpAndWait();
          yourMessages = findYourUntriedMessages();

          if (yourMessages.length === 0) {
            emptyScrollStreak++;

            if (reachedTopCount >= 3 || emptyScrollStreak >= maxEmptyScrollStreak) {
              updateOverlay(unsendCount, 'Done!');
              break;
            }
            continue;
          }
        } else if (allRows.length === 0) {
          const loaded = await scrollUpAndWait();
          if (!loaded) {
            emptyScrollStreak++;
            if (emptyScrollStreak >= maxEmptyScrollStreak) {
              updateOverlay(unsendCount, 'Done!');
              break;
            }
          }
          continue;
        } else {
          untriedRows.forEach(r => { r.dataset.fbTried = 'true'; });
          continue;
        }
      }

      emptyScrollStreak = 0;

      let didUnsend = false;
      for (let i = yourMessages.length - 1; i >= 0 && window.__fbUnsendRunning; i--) {
        const row = yourMessages[i];

        const result = await tryUnsendMessage(row);

        if (result === 'success') {
          unsendCount++;
          consecutiveFails = 0;
          didUnsend = true;
          updateOverlay(unsendCount, 'Unsending...');

          const delay = randomDelay(minDelay, maxDelay);
          updateOverlay(unsendCount, `Waiting ${Math.round(delay / 1000)}s...`);
          await sleep(delay);
          break;
        } else {
          row.dataset.fbTried = 'true';
          consecutiveFails++;
          await sleep(500);
        }
      }

      if (!didUnsend) {
        await scrollUpAndWait();
      }

      if (consecutiveFails >= 30) {
        updateOverlay(unsendCount, 'Stopped (too many fails)');
        break;
      }
    }

    window.__fbUnsendRunning = false;
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'start' && !window.__fbUnsendRunning) {
      startUnsending(msg.minDelay || 3000, msg.maxDelay || 7000);
      sendResponse({ status: 'started' });
    } else if (msg.action === 'stop') {
      window.__fbUnsendRunning = false;
      updateOverlay(unsendCount, 'Stopped.');
      setTimeout(removeOverlay, 3000);
      sendResponse({ status: 'stopped' });
    }
  });
})();
