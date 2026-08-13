// ISOLATED world: storageから設定を読み込み、datasetで注入し、injected.jsを挿入

function applySettings(sendKey) {
  document.documentElement.dataset.sendKey = sendKey;
}

// 設定読み込み → dataset に反映
chrome.storage.sync.get({ sendKey: 'shift', googleSearch: false, searchQueryLength: 100 }, (data) => {
  applySettings(data.sendKey);
  document.documentElement.dataset.googleSearch = data.googleSearch;
  document.documentElement.dataset.searchQueryLength = data.searchQueryLength;
});

// ポップアップからの設定変更をリアルタイム反映
chrome.storage.onChanged.addListener((changes) => {
  if (changes.sendKey) {
    applySettings(changes.sendKey.newValue);
  }
  if (changes.googleSearch) {
    document.documentElement.dataset.googleSearch = changes.googleSearch.newValue;
  }
  if (changes.searchQueryLength) {
    document.documentElement.dataset.searchQueryLength = changes.searchQueryLength.newValue;
  }
});

// injected.jsからのGoogle検索リクエストをbackgroundに転送
window.addEventListener('googleSearchRequest', (e) => {
  chrome.runtime.sendMessage({ type: 'googleSearch', query: e.detail.query });
});

// injected.js を MAIN world に挿入
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);
