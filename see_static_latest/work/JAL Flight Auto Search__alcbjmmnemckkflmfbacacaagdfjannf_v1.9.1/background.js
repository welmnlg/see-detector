// background.js
// メッセージを受け取り、データを保存して、JALのタブを開く

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // ツールからの検索リクエストを受信
    if (request.action === "SEARCH_JAL_FLIGHTS") {
        console.log("Background: Received search request", request.payload);

        // 配列化して統一
        const flights = Array.isArray(request.payload) ? request.payload : [request.payload];

        // 1. データをStorageに保存 (JAL側のスクリプトがこれを読み取る)
        chrome.storage.local.set({ "pendingJalSearchData": flights }, () => {
            console.log("Data saved to storage. Opening tabs...");

            // 2. データの件数分だけタブを開く
            flights.forEach((_, index) => {
                // 一気に開くとブラウザに負荷がかかるので少しずらす
                setTimeout(() => {
                    // URLハッシュ(#jal_ext_index=番号)で、どのデータを担当するか指定
                    chrome.tabs.create({ 
                        url: `https://www.jal.co.jp/jp/ja/dom/#jal_ext_index=${index}` 
                    });
                }, index * 500);
            });
        });
    }
});