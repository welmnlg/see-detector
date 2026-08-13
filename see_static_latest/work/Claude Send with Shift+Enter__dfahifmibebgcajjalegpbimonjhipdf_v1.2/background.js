let googleSearchTabId = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'googleSearch') return;

  const url = 'https://www.google.com/search?q=' + encodeURIComponent(msg.query);

  if (googleSearchTabId !== null) {
    // 既存タブを再利用
    chrome.tabs.update(googleSearchTabId, { url }, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        // タブが閉じられていた場合は新規作成
        googleSearchTabId = null;
        openNewTab(url);
      }
    });
  } else {
    openNewTab(url);
  }
});

function openNewTab(url, senderTabId) {
  chrome.tabs.create({ url, active: false }, (tab) => {
    googleSearchTabId = tab.id;
  });
}

// タブが閉じられたらIDをクリア
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === googleSearchTabId) {
    googleSearchTabId = null;
  }
});
