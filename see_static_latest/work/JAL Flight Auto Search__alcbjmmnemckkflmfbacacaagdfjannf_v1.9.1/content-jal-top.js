// content-jal-top.js

/**
 * 空港コードマップ
 * JALトップページが解釈する3レターコードに変換します。
 */
const AIRPORT_MAP = {
  "東京(羽田)": "HND", "羽田": "HND",
  "東京(成田)": "NRT", "成田": "NRT",
  "大阪(伊丹)": "ITM", "伊丹": "ITM",
  "大阪(関西)": "KIX", "関空": "KIX",
  "大阪(神戸)": "UKB", "神戸": "UKB",
  "札幌(新千歳)": "CTS", "新千歳": "CTS",
  "沖縄(那覇)": "OKA", "那覇": "OKA",
  "福岡": "FUK", "中部": "NGO", "小松": "KMQ"
  // 必要に応じて追加
};

// メッセージ受信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXECUTE_TOP_PAGE_SEARCH") {
    console.log("JAL Extension: Starting search...", request.data);
    performSearch(request.data);
    sendResponse({ status: "ok" });
  }
});

function performSearch(data) {
  try {
    // 1. データの整形
    const depCode = AIRPORT_MAP[data.departure] || data.departure;
    const arrCode = AIRPORT_MAP[data.arrival] || data.arrival;
    
    // 日付形式: YYYYMMDD (入力) -> YYYYMMDD (JAL URLパラメータ用)
    // ※入力が YYYY/MM/DD の場合は変換が必要ですが、JSON仕様では YYYYMMDD と仮定
    const dateStr = data.date.replace(/[^0-9]/g, ''); 

    // クラス・割引コード（拡張機能からの指定があれば使用、なければデフォルト）
    // payloadに "classType" や "fareType" がある場合の拡張性
    // JALパラメータ仕様 (推定):
    // Cls: 1(普通席), 2(クラスJ), 3(ファースト)
    // Fare: 具体的な運賃コードが必要だが、指定なしなら全運賃表示
    const seatClass = data.classCode || "1"; // デフォルト: 普通席

    // 2. 検索用URLの生成
    // JALの国内線予約エンジンのダイレクトURLパターンを使用
    // 片道(OneWay), 大人1名(ADT=1) 固定
    
    // Base URL for domestic booking
    const baseURL = "https://booking.jal.co.jp/jl/dom-bkg/upsell/outbound";
    
    // パラメータ構築
    // ADT: 大人人数
    // CHD: 小人人数
    // Date: 搭乗日 (YYYYMMDD)
    // Dep: 出発地コード
    // Arr: 到着地コード
    // DOM/INT: DOM (Domestic)
    const searchUrl = `${baseURL}?ADT=1&CHD=0&INF=0&Date=${dateStr}&Dep=${depCode}&Arr=${arrCode}`;

    console.log("Redirecting to search results:", searchUrl);

    // 3. UIへのフィードバックと遷移
    // ユーザーに動作中であることを伝えるオーバーレイを表示
    showOverlay(`
      <div style="text-align:center; font-family:sans-serif;">
        <h3>自動検索を実行中...</h3>
        <p>${data.departure} → ${data.arrival}</p>
        <p>日付: ${data.date}</p>
        <p>条件: 片道 / 1名</p>
      </div>
    `);

    // 少し待ってから遷移（ユーザーが認識できるように）
    setTimeout(() => {
      window.location.href = searchUrl;
    }, 800);

  } catch (e) {
    console.error("Search failed:", e);
    alert("検索パラメータの生成に失敗しました。");
  }
}

// 画面上にステータスを表示するヘルパー
function showOverlay(htmlContent) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(255, 255, 255, 0.9); z-index: 99999;
    display: flex; justify-content: center; align-items: center;
  `;
  overlay.innerHTML = htmlContent;
  document.body.appendChild(overlay);
}