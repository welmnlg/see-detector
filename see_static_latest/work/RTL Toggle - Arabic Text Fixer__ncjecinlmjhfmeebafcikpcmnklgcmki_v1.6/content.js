// ─── RTL Toggle · Content Script ──────────────────────────────────────────
'use strict';

// ── State ──────────────────────────────────────────────────────────────────
let isPickerActive   = false;
let hoveredElement   = null;
let tooltipEl        = null;
let floatingBtn      = null;
let lastRightClicked = null;   // tracks the element under right-click
let selectionTimer   = null;
let currentLang      = (navigator.language || 'en').split('-')[0].toLowerCase();

// Feedback strings per language
const FB = {
  en: { rtl: '✅ Converted → RTL', ltr: '✅ Converted → LTR',
        notice: '🎯 Picker Mode ON — click any text box • ESC to cancel',
        cancelled: '⬆️ Choose from menu to convert element',
        floatBtn: '🔄 RTL' },
  ar: { rtl: '✅ تم التحويل → RTL', ltr: '✅ تم التحويل → LTR',
        notice: '🎯 وضع التحويل مفعّل — انقر على أي مربع نص • ESC للإلغاء',
        cancelled: '⬆️ اختر من القائمة لتحويل العنصر',
        floatBtn: '🔄 RTL' },
  he: { rtl: '✅ הומר → RTL', ltr: '✅ הומר → LTR',
        notice: '🎯 מצב בחירה פעיל — לחץ על תיבת טקסט • ESC לביטול',
        cancelled: '⬆️ בחר מהתפריט להמרת האלמנט',
        floatBtn: '🔄 RTL' },
  fa: { rtl: '✅ تبدیل شد → RTL', ltr: '✅ تبدیل شد → LTR',
        notice: '🎯 حالت انتخاب فعال — روی هر کادر متنی کلیک کنید • ESC برای لغو',
        cancelled: '⬆️ از منو برای تبدیل عنصر انتخاب کنید',
        floatBtn: '🔄 RTL' },
  ur: { rtl: '✅ تبدیل ہوا → RTL', ltr: '✅ تبدیل ہوا → LTR',
        notice: '🎯 پکر موڈ فعال — کسی بھی ٹیکسٹ باکس پر کلک کریں • ESC منسوخ کریں',
        cancelled: '⬆️ عنصر تبدیل کرنے کے لیے مینو سے منتخب کریں',
        floatBtn: '🔄 RTL' },
};
function t(key) { return (FB[currentLang] || FB.en)[key]; }

// ══════════════════════════════════════════════════════════════════════════
//  CORE: toggle direction on any element
// ══════════════════════════════════════════════════════════════════════════
function isOwnUI(el) {
  if (!el) return false;
  return el.id === 'rtl-switcher-tooltip'   ||
         el.id === 'rtl-switcher-notice'    ||
         el.id === 'rtl-float-btn'          ||
         el.closest?.('#rtl-float-btn');
}

function toggleDirection(el) {
  if (!el || el === document.body || el === document.documentElement || isOwnUI(el)) return;

  const computed = window.getComputedStyle(el);
  const cur      = el.style.direction || computed.direction;
  const newDir   = cur === 'rtl' ? 'ltr' : 'rtl';
  const isRTL    = newDir === 'rtl';

  // ── 1. Core direction & alignment ────────────────────────────────────
  el.style.setProperty('direction',  newDir,  'important');
  el.style.setProperty('text-align', isRTL ? 'right' : 'left', 'important');

  // ── 2. Fix margins that block visual shift ────────────────────────────
  //   margin-left:auto  pushes element right  → kills RTL centering feel
  //   margin-right:auto pushes element left   → same problem
  const ml = computed.marginLeft;
  const mr = computed.marginRight;
  if (isRTL) {
    // Convert "margin: 0 auto" pattern → right-align the block
    if (ml === 'auto' || mr === 'auto') {
      el.style.setProperty('margin-left',  '0',    'important');
      el.style.setProperty('margin-right', 'auto', 'important');
    }
  } else {
    if (ml === 'auto' || mr === 'auto') {
      el.style.setProperty('margin-left',  'auto', 'important');
      el.style.setProperty('margin-right', '0',    'important');
    }
  }

  // ── 3. Flex / Grid containers: flip justify-content & align-items ────
  const display = computed.display;
  if (display === 'flex' || display === 'inline-flex') {
    const jc = computed.justifyContent;
    // flip start↔end / left↔right
    const flipMap = {
      'flex-start': 'flex-end', 'flex-end': 'flex-start',
      'start': 'end',           'end': 'start',
      'left': 'right',          'right': 'left'
    };
    if (flipMap[jc]) el.style.setProperty('justify-content', flipMap[jc], 'important');
  }
  if (display === 'grid' || display === 'inline-grid') {
    const jc = computed.justifyItems;
    const flipMap = { 'start':'end','end':'start','left':'right','right':'left' };
    if (flipMap[jc]) el.style.setProperty('justify-items', flipMap[jc], 'important');
  }

  // ── 4. Float ──────────────────────────────────────────────────────────
  const fl = computed.float;
  if (fl === 'left')  el.style.setProperty('float', 'right', 'important');
  if (fl === 'right') el.style.setProperty('float', 'left',  'important');

  // ── 5. position:absolute with left/right offsets ──────────────────────
  if (computed.position === 'absolute' || computed.position === 'fixed') {
    const left  = computed.left;
    const right = computed.right;
    // Only swap when one side is set and the other is auto
    if (left !== 'auto' && right === 'auto') {
      el.style.setProperty('right', left,   'important');
      el.style.setProperty('left',  'auto', 'important');
    } else if (right !== 'auto' && left === 'auto') {
      el.style.setProperty('left',  right,  'important');
      el.style.setProperty('right', 'auto', 'important');
    }
  }

  // ── 6. padding-left / padding-right swap (optional, for visual balance) ─
  // Only swap when they differ significantly (asymmetric padding)
  const pl = parseFloat(computed.paddingLeft)  || 0;
  const pr = parseFloat(computed.paddingRight) || 0;
  if (Math.abs(pl - pr) > 4) {
    el.style.setProperty('padding-left',  pr + 'px', 'important');
    el.style.setProperty('padding-right', pl + 'px', 'important');
  }

  // ── 7. border-radius: flip left↔right corners ─────────────────────────
  const tl = computed.borderTopLeftRadius;
  const tr = computed.borderTopRightRadius;
  const bl = computed.borderBottomLeftRadius;
  const br = computed.borderBottomRightRadius;
  const asymmetric = (tl !== tr) || (bl !== br);
  if (asymmetric) {
    el.style.setProperty('border-top-left-radius',     tr, 'important');
    el.style.setProperty('border-top-right-radius',    tl, 'important');
    el.style.setProperty('border-bottom-left-radius',  br, 'important');
    el.style.setProperty('border-bottom-right-radius', bl, 'important');
  }

  // ── 8. Inline transform: translateX flip ─────────────────────────────
  const transform = computed.transform;
  if (transform && transform !== 'none') {
    // If element has translateX(50%) centering pattern, flip it
    const match = el.style.transform?.match(/translateX\(([^)]+)\)/);
    if (match) {
      const val = match[1];
      const flipped = val.startsWith('-') ? val.slice(1) : '-' + val;
      el.style.setProperty('transform',
        el.style.transform.replace(/translateX\([^)]+\)/, `translateX(${flipped})`),
        'important');
    }
  }

  // ── 9. unicode-bidi — ensure bidi algorithm respects our direction ─────
  el.style.setProperty('unicode-bidi', 'isolate', 'important');

  // ── 10. Save snapshot for reset ───────────────────────────────────────
  el.setAttribute('data-rtl-modified', newDir);
  showFeedback(el, newDir);
}

function showFeedback(el, dir) {
  const fb = document.createElement('div');
  fb.className   = 'rtl-switcher-feedback';
  fb.textContent = dir === 'rtl' ? t('rtl') : t('ltr');
  document.body.appendChild(fb);
  const r = el.getBoundingClientRect();
  fb.style.left = (r.left + window.scrollX + r.width / 2 - 60) + 'px';
  fb.style.top  = (r.top  + window.scrollY - 38) + 'px';
  setTimeout(() => fb.remove(), 1600);
}

// ══════════════════════════════════════════════════════════════════════════
//  FEATURE 1 — CONTEXT MENU
//  The background sends a message; we act on the last right-clicked element
//  OR the element containing the current selection.
// ══════════════════════════════════════════════════════════════════════════

// Track which element was under the mouse when right-click was pressed
// Also: if picker is active, right-click cancels it (natural UX)
document.addEventListener('contextmenu', e => {
  lastRightClicked = e.target;
  if (isPickerActive) {
    deactivatePicker();
    // Show a quick hint so the user knows picker was cancelled
    const hint = document.createElement('div');
    hint.className = 'rtl-switcher-feedback';
    hint.style.cssText = 'position:fixed!important;top:50px!important;left:50%!important;transform:translateX(-50%)!important;';
    hint.textContent = t('cancelled');
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 1800);
  }
}, true);

function getSelectionContainer() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const node = sel.getRangeAt(0).commonAncestorContainer;
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

// ══════════════════════════════════════════════════════════════════════════
//  FEATURE 2 — FLOATING BUTTON ON TEXT SELECTION
// ══════════════════════════════════════════════════════════════════════════
function removeFloatingBtn() {
  if (floatingBtn) { floatingBtn.remove(); floatingBtn = null; }
}

function createFloatingBtn(x, y) {
  removeFloatingBtn();

  floatingBtn = document.createElement('button');
  floatingBtn.id          = 'rtl-float-btn';
  floatingBtn.textContent = t('floatBtn');
  floatingBtn.title       = 'تحويل اتجاه النص المحدد';

  // Position just above the selection end-point
  floatingBtn.style.cssText = `
    position: fixed !important;
    left: ${Math.min(x, window.innerWidth - 90)}px !important;
    top:  ${Math.max(y - 44, 6)}px !important;
    z-index: 2147483647 !important;
  `;

  floatingBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    const container = getSelectionContainer();
    if (container) toggleDirection(container);
    window.getSelection()?.removeAllRanges();
    removeFloatingBtn();
  });

  document.body.appendChild(floatingBtn);
}

document.addEventListener('mouseup', e => {
  if (isOwnUI(e.target)) return;

  clearTimeout(selectionTimer);
  selectionTimer = setTimeout(() => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
      createFloatingBtn(e.clientX, e.clientY);
    } else {
      removeFloatingBtn();
    }
  }, 120);   // small delay so selection is finalised
});

// Hide button when user clicks elsewhere or starts new selection
document.addEventListener('mousedown', e => {
  if (!isOwnUI(e.target)) removeFloatingBtn();
}, true);

document.addEventListener('selectionchange', () => {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
    // Only remove if not caused by our own button click
    clearTimeout(selectionTimer);
    selectionTimer = setTimeout(removeFloatingBtn, 200);
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  FEATURE 3 — PICKER MODE (existing, unchanged)
// ══════════════════════════════════════════════════════════════════════════
function createTooltip() {
  tooltipEl = document.createElement('div');
  tooltipEl.id        = 'rtl-switcher-tooltip';
  tooltipEl.innerHTML = '🖱️ انقر لتحويل الاتجاه';
  document.body.appendChild(tooltipEl);
}

function highlightElement(el) {
  if (hoveredElement && hoveredElement !== el) unhighlightElement(hoveredElement);
  if (el && !isOwnUI(el) && el !== document.body) {
    el.classList.add('rtl-switcher-highlight');
    hoveredElement = el;
  }
}
function unhighlightElement(el) { el?.classList.remove('rtl-switcher-highlight'); }

function onMouseMove(e) {
  if (!isPickerActive) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  highlightElement(el);
  if (tooltipEl) {
    tooltipEl.style.left    = (e.clientX + 15) + 'px';
    tooltipEl.style.top     = (e.clientY - 42) + 'px';
    tooltipEl.style.display = 'block';
  }
}

function onPickerClick(e) {
  if (!isPickerActive) return;
  e.preventDefault(); e.stopPropagation();
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!isOwnUI(el)) { toggleDirection(el); unhighlightElement(el); }
}

function onKeyDown(e) {
  if (e.key === 'Escape' && isPickerActive) deactivatePicker();
}

function activatePicker() {
  isPickerActive = true;
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click',     onPickerClick, true);
  document.addEventListener('keydown',   onKeyDown,     true);
  if (!tooltipEl) createTooltip();

  const notice     = document.createElement('div');
  notice.id        = 'rtl-switcher-notice';
  notice.textContent = t('notice');
  document.body.appendChild(notice);
  setTimeout(() => notice.style.opacity = '0', 2500);
  setTimeout(() => notice.remove(), 3000);
}

function deactivatePicker() {
  isPickerActive = false;
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', onMouseMove, true);
  document.removeEventListener('click',     onPickerClick, true);
  document.removeEventListener('keydown',   onKeyDown,     true);
  if (hoveredElement) unhighlightElement(hoveredElement);
  hoveredElement = null;
  if (tooltipEl) { tooltipEl.style.display = 'none'; }
}

// ══════════════════════════════════════════════════════════════════════════
//  MESSAGE LISTENER  (from popup + background)
// ══════════════════════════════════════════════════════════════════════════
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  switch (msg.action) {

    case 'activatePicker':
      if (isPickerActive) { deactivatePicker(); sendResponse({ status: 'deactivated' }); }
      else                { activatePicker();   sendResponse({ status: 'activated'   }); }
      break;

    // From context menu — toggle element under right-click cursor
    case 'toggleAtContextTarget':
      if (lastRightClicked) toggleDirection(lastRightClicked);
      sendResponse({ status: 'ok' });
      break;

    // From context menu — toggle container of selected text
    case 'toggleAtSelection': {
      const container = getSelectionContainer();
      if (container) toggleDirection(container);
      sendResponse({ status: 'ok' });
      break;
    }

    case 'resetAll':
      document.querySelectorAll('[data-rtl-modified]').forEach(el => {
        // Remove all properties we may have set with !important
        const props = [
          'direction', 'text-align',
          'margin-left', 'margin-right',
          'padding-left', 'padding-right',
          'justify-content', 'justify-items',
          'float',
          'left', 'right',
          'border-top-left-radius', 'border-top-right-radius',
          'border-bottom-left-radius', 'border-bottom-right-radius',
          'transform', 'unicode-bidi'
        ];
        props.forEach(p => el.style.removeProperty(p));
        el.removeAttribute('data-rtl-modified');
      });
      sendResponse({ status: 'reset' });
      break;

    case 'getStatus':
      sendResponse({ active: isPickerActive });
      break;

    case 'setLang':
      if (msg.lang && FB[msg.lang]) currentLang = msg.lang;
      sendResponse({ status: 'ok' });
      break;
  }
  return true;
});
