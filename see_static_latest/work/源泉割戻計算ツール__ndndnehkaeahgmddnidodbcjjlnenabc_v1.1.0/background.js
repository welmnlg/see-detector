// サイドパネルをアクションクリックで開く
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 右クリックメニューに「割戻計算」を追加
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "warimodo-calc",
    title: "選択した金額を割戻計算",
    contexts: ["selection"],
  });
});

// 右クリックメニューからの計算
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "warimodo-calc" && info.selectionText) {
    const amount = parseFloat(info.selectionText.replace(/[,，、\s円¥]/g, ""));
    if (!isNaN(amount) && amount > 0) {
      // サイドパネルを開いて金額を送信
      chrome.sidePanel.open({ tabId: tab.id }).then(() => {
        // 少し待ってからメッセージ送信（パネルの読み込みを待つ）
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: "SELECTED_AMOUNT",
            amount: amount,
          });
        }, 500);
      });
    }
  }
});

// コンテンツスクリプトからのメッセージをサイドパネルに中継
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SELECTED_AMOUNT") {
    // そのまま全リスナーに転送（サイドパネルが受け取る）
    chrome.runtime.sendMessage(message).catch(() => {
      // サイドパネルが未起動の場合は無視
    });
  }
});
