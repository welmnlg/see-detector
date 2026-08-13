(function () {
  'use strict';

  const MOVE_THRESHOLD = 2;   // px — selection 생성 시작 임계값
  const CLASS_NAME = 'ds-selectable';

  let enabled = true;
  let startX = 0, startY = 0;
  let wasDragged = false;
  let needCreateSelection = false;
  let currentAnchor = null;
  let styleEl = null;

  // ── 초기화: !important 스타일 시트 주입 ──
  function ensureStyle() {
    if (styleEl) return;
    styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    styleEl.sheet.insertRule(
      `.${CLASS_NAME}{-webkit-user-select:text!important;user-select:text!important;outline-width:0!important;}`,
      0
    );
  }

  function clearAnchor() {
    if (currentAnchor) {
      currentAnchor.classList.remove(CLASS_NAME);
      currentAnchor = null;
    }
  }

  function getRangeFromPoint(x, y) {
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (!p) return null;
      const r = document.createRange();
      r.setStart(p.offsetNode, p.offset);
      return r;
    }
    return document.caretRangeFromPoint(x, y);
  }

  // ── dragstart: 항상 차단 ──
  function onDragStart(e) {
    e.preventDefault();
  }

  // ── mousedown: 예약만, selection은 아직 생성 안 함 ──
  function onMouseDown(e) {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    wasDragged = false;
    needCreateSelection = false;
    clearAnchor();

    const anchor = e.target.closest('a');
    if (!anchor) return;

    ensureStyle();
    anchor.classList.add(CLASS_NAME);
    currentAnchor = anchor;
    needCreateSelection = true;  // mousemove에서 생성하도록 예약
  }

  // ── mousemove: 첫 이동 시 selection 생성, 이후 끝점 연장 ──
  function onMouseMove(e) {
    if (e.buttons !== 1) return;
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

if (needCreateSelection && (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD)) {
  needCreateSelection = false;
  wasDragged = true;
  const anchorRange = getRangeFromPoint(startX, startY);
  if (anchorRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(anchorRange);
    const focusRange = getRangeFromPoint(e.clientX, e.clientY);
    if (focusRange) {
      sel.extend(focusRange.startContainer, focusRange.startOffset);
    }
  }
}

    if (wasDragged) {
      const range = getRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        window.getSelection().extend(range.startContainer, range.startOffset);
      }
    }
  }

  // ── mouseup: 정리 ──
  function onMouseUp(e) {
    if (window.getSelection().type !== 'Range') {
      clearAnchor();
    }
    needCreateSelection = false;
  }

  // ── click: 드래그 후 링크 이동 차단 ──
  function onClickCapture(e) {
    if (wasDragged && e.target.closest('a')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    wasDragged = false;
  }

  function attachListeners() {
  detachListeners(); // ← 이 한 줄 추가. 중복 방지
    document.addEventListener('dragstart',  onDragStart,    true);
    document.addEventListener('mousedown',  onMouseDown,    true);
    document.addEventListener('mousemove',  onMouseMove,    true);
    document.addEventListener('mouseup',    onMouseUp,      true);
    document.addEventListener('click',      onClickCapture, true);
  }

function detachListeners() {
  document.removeEventListener('dragstart',  onDragStart,    true);
  document.removeEventListener('mousedown',  onMouseDown,    true);
  document.removeEventListener('mousemove',  onMouseMove,    true);
  document.removeEventListener('mouseup',    onMouseUp,      true);
  document.removeEventListener('click',      onClickCapture, true);
  clearAnchor();
  wasDragged = false;
  needCreateSelection = false;
}

  // ── 토글 수신 ──
  chrome.storage.sync.get({ enabled: true }, (result) => {
    enabled = result.enabled;
    if (enabled) attachListeners();
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE') {
      enabled = msg.enabled;
      enabled ? attachListeners() : detachListeners();
    }
  });

})();