// ===== テキスト選択を監視して金額を検出 =====

let selectionTimeout = null;

document.addEventListener('mouseup', () => {
  clearTimeout(selectionTimeout);
  selectionTimeout = setTimeout(handleSelection, 200);
});

function handleSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text) return;

  // 数値として解釈できるか確認
  const cleaned = text.replace(/[,，、\s円¥\\]/g, '');
  const amount = parseFloat(cleaned);

  if (isNaN(amount) || amount <= 0) return;

  // サイドパネルに金額を送信
  chrome.runtime.sendMessage({
    type: 'SELECTED_AMOUNT',
    amount: amount,
    sourceText: text,
  });

  // 選択箇所にハイライトを一時的に表示
  showHighlight(selection);
}

function showHighlight(selection) {
  // 既存のハイライトを除去
  document.querySelectorAll('.warimodo-highlight').forEach(el => el.remove());

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const highlight = document.createElement('div');
  highlight.className = 'warimodo-highlight';
  highlight.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.bottom + 4}px;
    z-index: 999999;
  `;
  highlight.textContent = '✓ サイドパネルに送信';

  document.body.appendChild(highlight);

  setTimeout(() => {
    highlight.style.opacity = '0';
    setTimeout(() => highlight.remove(), 300);
  }, 1500);
}
