const options = document.querySelectorAll('.option');
const radios = document.querySelectorAll('input[name="sendKey"]');
const saved = document.getElementById('saved');
const googleSearchToggle = document.getElementById('googleSearch');
const searchQueryLengthInput = document.getElementById('searchQueryLength');
const searchLengthRow = document.getElementById('searchLengthRow');

function updateSelected(value) {
  options.forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.value === value);
  });
}

function showToast() {
  saved.classList.add('show');
  setTimeout(() => saved.classList.remove('show'), 1200);
}

// 設定を読み込み
chrome.storage.sync.get({ sendKey: 'shift', googleSearch: false, searchQueryLength: 100 }, (data) => {
  const radio = document.querySelector(`input[value="${data.sendKey}"]`);
  if (radio) radio.checked = true;
  updateSelected(data.sendKey);

  googleSearchToggle.checked = data.googleSearch;
  searchQueryLengthInput.value = data.searchQueryLength;
  searchLengthRow.style.display = data.googleSearch ? 'flex' : 'none';
});

// 送信キー変更時に保存
radios.forEach(radio => {
  radio.addEventListener('change', () => {
    chrome.storage.sync.set({ sendKey: radio.value });
    updateSelected(radio.value);
    showToast();
  });
});

// Google検索トグル
googleSearchToggle.addEventListener('change', () => {
  const enabled = googleSearchToggle.checked;
  chrome.storage.sync.set({ googleSearch: enabled });
  searchLengthRow.style.display = enabled ? 'flex' : 'none';
  showToast();
});

// 検索文字数変更
searchQueryLengthInput.addEventListener('change', () => {
  const val = Math.max(10, Math.min(500, parseInt(searchQueryLengthInput.value) || 100));
  searchQueryLengthInput.value = val;
  chrome.storage.sync.set({ searchQueryLength: val });
  showToast();
});
