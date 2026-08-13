async function getGasUrl() {
  const managed = await chrome.storage.managed.get("gasUrl");
  if (managed.gasUrl) return managed.gasUrl;
  const local = await chrome.storage.local.get("gasUrl");
  return local.gasUrl || null;
}

async function checkStatus() {
  try {
    const url = await getGasUrl();
    const data = await chrome.storage.local.get(["grade", "studentId"]);
    
    if (!url || !data.grade || !data.studentId) return;

    // 現在のアクティブなタブ名を取得（なければ「サイトなし」）
    // ※全て閉じている場合は取得できませんが、エラーにならないよう配慮
    let currentTitle = "サイトなし";
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (activeTab) currentTitle = activeTab.title;
    } catch (e) {
      // タブがない場合のエラーは無視
    }

    const params = `?grade=${encodeURIComponent(data.grade)}&id=${encodeURIComponent(data.studentId)}&title=${encodeURIComponent(currentTitle)}`;
    const response = await fetch(url + params);
    const result = await response.json();
    
    // ==========================================
    //  分岐処理
    // ==========================================

    if (result.appStatus === "閉じる") {
      // パターン：閉じる (全タブ削除 = ブラウザ終了)
      await performForceClose();
    } 
    else {
      // パターン：ロック または 通常
      const tabs = await chrome.tabs.query({});
      for (const t of tabs) {
        if (t.url && t.url.startsWith("http")) {
          chrome.tabs.sendMessage(t.id, { status: result.appStatus }).catch(() => {});
        }
      }
    }
    
    await chrome.storage.local.set({ "currentStatus": result.appStatus });

  } catch (error) {
    console.log("通信エラー: ", error);
  }
}

// 変更点：「閉じる」実行関数
// blocked.html を出さずに、全てのタブを削除してブラウザを落とす
async function performForceClose() {
  const allTabs = await chrome.tabs.query({});
  const allTabIds = allTabs.map(t => t.id);

  if (allTabIds.length > 0) {
    // 全てのタブを削除（これによりChromeウィンドウが閉じます）
    await chrome.tabs.remove(allTabIds);
  }
}

// 定期チェック (20秒ごと)
setInterval(checkStatus, 20000);

// ブラウザ起動時にも即座にチェックを走らせる（重要）
// これがないと、Chromeを開いた瞬間に古い「閉じる」ステータスで即死してしまい、
// 「通常」に戻すための通信を行う隙がなくなってしまいます。
checkStatus();

// タブ更新時の即時ガード
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // ステータス取得
  const data = await chrome.storage.local.get("currentStatus");
    
  // 「閉じる」モード中は、タブが開かれた瞬間に消す
  if (data.currentStatus === "閉じる") {
      // URLチェックなどをせず、問答無用で閉じる
      chrome.tabs.remove(tabId).catch(() => {});
  }
  // 「ロック」モード中は開いた瞬間に黒画面指令
  else if (data.currentStatus === "ロック" && changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { status: "ロック" }).catch(() => {});
  }
});