let dispatching = false;
let sendKey = document.documentElement.dataset.sendKey || 'shift';
let googleSearch = document.documentElement.dataset.googleSearch === 'true';
let searchQueryLength = parseInt(document.documentElement.dataset.searchQueryLength) || 100;

// dataset変更を監視してリアルタイム反映
new MutationObserver(() => {
  sendKey = document.documentElement.dataset.sendKey || 'shift';
  googleSearch = document.documentElement.dataset.googleSearch === 'true';
  searchQueryLength = parseInt(document.documentElement.dataset.searchQueryLength) || 100;
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-send-key', 'data-google-search', 'data-search-query-length']
});

// チャット入力欄（ProseMirror）
function isChatInput(el) {
  return el.closest('[data-testid="chat-input"], .ProseMirror');
}

// 編集フォームのtextarea
function isEditTextarea(el) {
  return el.tagName === 'TEXTAREA' && el.closest('form');
}

// 送信キーが押されたか判定
function isSendKey(e) {
  if (sendKey === 'shift') return e.shiftKey && !e.metaKey;
  if (sendKey === 'cmd') return e.metaKey && !e.shiftKey;
  return false;
}

// 改行キーが押されたか判定（送信キーの逆）
function isNewlineKey(e) {
  if (sendKey === 'shift') return !e.shiftKey && !e.metaKey;
  if (sendKey === 'cmd') return !e.metaKey;
  return false;
}

function sendMessage(el) {
  // Google検索（同じタブを再利用）
  if (googleSearch) {
    const text = isChatInput(el) ? el.textContent : el.value;
    const query = text.trim().slice(0, searchQueryLength);
    if (query) {
      window.dispatchEvent(new CustomEvent('googleSearchRequest', { detail: { query } }));
    }
  }

  if (isChatInput(el)) {
    const sendBtn = document.querySelector('button[aria-label="メッセージを送信"]');
    if (sendBtn && !sendBtn.disabled) sendBtn.click();
  } else {
    const form = el.closest('form');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && !submitBtn.disabled) submitBtn.click();
  }
}

function insertNewline(el) {
  if (isChatInput(el)) {
    dispatching = true;
    el.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', keyCode: 13,
      shiftKey: true, bubbles: true, cancelable: true
    }));
    dispatching = false;
  } else {
    // textareaは直接改行を挿入
    const start = el.selectionStart;
    el.value = el.value.slice(0, start) + '\n' + el.value.slice(el.selectionEnd);
    el.selectionStart = el.selectionEnd = start + 1;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Enterキーのイベント処理
['keydown', 'keyup', 'keypress'].forEach(type => {
  document.addEventListener(type, (e) => {
    if (dispatching) return;

    // Escキー: チャット入力にフォーカス
    if (e.key === 'Escape' && type === 'keydown') {
      const chatInput = document.querySelector('[data-testid="chat-input"], .ProseMirror');
      if (chatInput && document.activeElement !== chatInput) {
        chatInput.focus();
      }
      return;
    }

    if (e.key !== 'Enter') return;

    const el = e.target;
    const inChat = isChatInput(el);
    const inEdit = isEditTextarea(el);
    if (!inChat && !inEdit) return;

    if (e.isComposing) {
      e.stopImmediatePropagation();
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    if (type !== 'keydown') return;

    if (isSendKey(e)) {
      sendMessage(el);
    } else if (isNewlineKey(e)) {
      insertNewline(el);
    }
  }, true);
});

document.addEventListener('beforeinput', (e) => {
  if (!isChatInput(e.target)) return;
  if (e.inputType === 'insertParagraph') {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true);
