// content-jal-dom.js
// 修正版: 長崎・鹿児島の空港コード追加、自動入力はタブごとに1回のみ実行

// =========================================================
//  設定・ID定義
// =========================================================
const FARE_ID_MAP = {
    "株主割引": "JS_domTk_LB-discount-sh",
    "JALカード割引": "JS_domTk_LB-discount-kip",     
    "当日シニア割引": "JS_domTk_LB-discount-gsf",    
    "障がい者割引": "JS_domTk_LB-discount-challenged",
    "介護帰省割引": "JS_domTk_LB-discount-care",
    "スカイメイト": "JS_domTk_LB-discount-smf",      
    "JALカードスカイメイト": "JS_domTk_LB-discount-smf"
};

const AIRPORT_MAP = {
    "東京(羽田)": "HND", "羽田": "HND",
    "東京(成田)": "NRT", "成田": "NRT",
    "大阪(伊丹)": "ITM", "伊丹": "ITM",
    "大阪(関西)": "KIX", "関西": "KIX", "関空": "KIX",
    "大阪(神戸)": "UKB", "神戸": "UKB",
    "札幌(新千歳)": "CTS", "新千歳": "CTS", "札幌": "CTS",
    "沖縄(那覇)": "OKA", "那覇": "OKA", "沖縄": "OKA",
    "福岡": "FUK",
    "名古屋(中部)": "NGO", "中部": "NGO",
    "名古屋(小牧)": "NKM", "小牧": "NKM",
    "隠岐": "OKI", "出雲": "IZO",
    "長崎": "NGS",   // ★追加
    "鹿児島": "KOJ",  // ★追加
    "札幌(丘珠)": "OKD", "丘珠": "OKD" // ★追加
};

const ONEWAY_ID = "LB_search-route-switch-02";

// =========================================================
//  起動処理 (1回のみ実行の制御)
// =========================================================
(function init() {
    // URLハッシュから対象インデックスを取得 (#jal_ext_index=1 など)
    const hash = window.location.hash;
    let targetIndex = 0; 
    if (hash && hash.includes("jal_ext_index=")) {
        const match = hash.match(/jal_ext_index=(\d+)/);
        if (match) targetIndex = parseInt(match[1], 10);
    }

    // ★重要: このタブですでに実行済みかチェック
    // sessionStorage はタブを閉じると消えますが、リロードでは消えません。
    const sessionKey = `jal_auto_run_completed_${targetIndex}`;
    
    if (sessionStorage.getItem(sessionKey)) {
        console.log(`[Info] Index ${targetIndex} already executed in this tab. Skipping.`);
        return; // すでに実行済みなら何もしないで終了
    }

    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["pendingJalSearchData"], (result) => {
            if (result.pendingJalSearchData && Array.isArray(result.pendingJalSearchData)) {
                const flights = result.pendingJalSearchData;
                if (flights[targetIndex]) {
                    
                    // ★実行済みフラグをセット (これで次回以降のリロードでは動かない)
                    sessionStorage.setItem(sessionKey, "true");
                    
                    console.log(`★ Starting JAL Search for Index [${targetIndex}]`);
                    // ページの読み込み安定を待ってから開始
                    setTimeout(() => executeSearchSequence(flights[targetIndex]), 1500);
                }
            }
        });
    }
})();

// =========================================================
//  自動操作ロジック
// =========================================================
async function executeSearchSequence(data) {
  try {
    // 1. 片道
    const onewayLabel = document.querySelector(`label[for="${ONEWAY_ID}"]`);
    const onewayInput = document.getElementById(ONEWAY_ID);
    if (onewayLabel) safeClick(onewayLabel);
    else if (onewayInput) safeClick(onewayInput);
    else await clickElementByText("片道");
    await wait(800);

    // 2. 出発地
    const depInput = document.getElementById("JS_domTk_departureAirport");
    if (depInput) {
        const depCode = resolveAirportCode(data.departure);
        await clearAndInput(depInput, depCode);
        await tryCloseAirportModal();
    }

    // 3. 到着地
    const arrInput = document.getElementById("JS_domTk_arrivalAirport");
    if (arrInput) {
        const arrCode = resolveAirportCode(data.arrival);
        await clearAndInput(arrInput, arrCode);
        await tryCloseAirportModal();
    }

    // 4. 日付
    const dateTrigger = document.getElementById("JS_domTk_domLbDepDate");
    if (dateTrigger) {
        safeClick(dateTrigger);
        await wait(1000);
        // カレンダー月めくり対応
        const dateClicked = await clickDateWithPagination(data.date);
        if (dateClicked) {
            await wait(500);
            await clickConfirmButton(); 
        } else {
            updateHiddenDate(data.date);
        }
        await wait(800);
    }

    // 5. クラス
    if (data.seatClass === "ファーストクラス") {
        const classTrigger = document.getElementById("JS_domTk_domLbSeatCls");
        if (classTrigger) {
            safeClick(classTrigger);
            await wait(1000);
            let success = await clickElementByExactText("ファーストクラス");
            if (!success) {
                const targetLabel = document.querySelector('label[for="JS_domTk_LB-class-first"]');
                if (targetLabel) safeClick(targetLabel);
            }
            await wait(500);
            await clickConfirmButton(); 
            await wait(600);
        }
    }

    // 6. 運賃種別
    if (data.fareCategory) {
        const fareTrigger = document.getElementById("JS_domTk_domLbDiscountType");
        if (fareTrigger) {
            safeClick(fareTrigger);
            await wait(1000); 

            let searchTarget = data.fareCategory;
            if (searchTarget.includes("スカイメイト")) searchTarget = "スカイメイト";

            let success = await trySelectFareById(searchTarget);

            if (!success && searchTarget === "スカイメイト") {
                success = await clickElementByExactText("スカイメイト/JALカードスカイメイト");
            }

            if (!success) {
                await trySelectFareById("株主割引");
            }
            await wait(500);
            await clickConfirmButton();
            await wait(600);
        }
    }

    // 7. 検索実行
    const searchBtn = document.getElementById("JS_domTk_submitBtn") || 
                      document.querySelector('button[type="submit"].btn-search');
    
    await tryCloseAirportModal();
    
    if (searchBtn) {
        safeClick(searchBtn);
    } else {
        await clickElementByText("検索する");
    }

  } catch (e) {
    console.error("JAL Automation Error:", e);
  }
}


// --- ヘルパー関数 ---

function safeClick(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const isJsLink = element.tagName === 'A' && element.hasAttribute('href') && element.getAttribute('href').toLowerCase().startsWith('javascript:');
    let originalHref = null;
    if (isJsLink) {
        originalHref = element.getAttribute('href');
        element.removeAttribute('href'); 
    }
    element.click();
    if (isJsLink && originalHref) setTimeout(() => element.setAttribute('href', originalHref), 50);
}

async function clickElementByExactText(text) {
    const target = Array.from(document.querySelectorAll('label, button, a, span, div')).find(el => (el.innerText || "").trim() === text && isVisible(el));
    if (target) { safeClick(target); return true; }
    return false;
}

async function clickElementByText(text) {
    const target = Array.from(document.querySelectorAll('a, button, label, span, div')).find(el => el.innerText.includes(text) && isVisible(el));
    if (target) { safeClick(target); return true; }
    return false;
}

function isVisible(elem) {
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 確定ボタンを押す処理
async function clickConfirmButton() {
    const selectors = [
        'button.ui-button:not(.ui-dialog-titlebar-close)',
        '.ui-dialog-buttonpane button',
        'button[class*="confirm"]',
        'button[class*="submit"]'
    ];
    for (let sel of selectors) {
        const btns = document.querySelectorAll(sel);
        for (let btn of btns) {
            if (isVisible(btn) && (btn.innerText.includes("確定") || btn.innerText.includes("選択") || btn.innerText === "OK")) {
                safeClick(btn);
                return true;
            }
        }
    }
    const textBtns = Array.from(document.querySelectorAll('a, button, div[role="button"]'));
    const target = textBtns.find(el => isVisible(el) && el.innerText.trim() === "確定");
    if (target) { safeClick(target); return true; }
    return false;
}

async function tryCloseAirportModal() {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape', keyCode: 27 }));
    await wait(300);
    const closeSelectors = ['button.ui-dialog-titlebar-close', 'button.icon-close', 'a.close', '.ui-dialog button'];
    for (let sel of closeSelectors) {
        const btn = document.querySelector(sel);
        if (btn && isVisible(btn)) {
            safeClick(btn);
            await wait(300);
            return;
        }
    }
}

// カレンダー月めくり対応
async function clickDateWithPagination(yyyymmdd) {
    let dateEl = document.getElementById(yyyymmdd);
    if (dateEl && isVisible(dateEl)) {
        safeClick(dateEl);
        return true;
    }
    // 見つからない場合は翌月ボタンを最大12回押す
    for (let i = 0; i < 12; i++) {
        const nextBtns = Array.from(document.querySelectorAll('a, button, span'));
        const nextBtn = nextBtns.find(el => {
            return isVisible(el) && 
                   (el.innerText.includes("翌月") || el.className.includes("next") || el.className.includes("Next") || el.getAttribute("title") === "翌月");
        });

        if (nextBtn) {
            safeClick(nextBtn);
            await wait(800);
            dateEl = document.getElementById(yyyymmdd);
            if (dateEl && isVisible(dateEl)) {
                safeClick(dateEl);
                return true;
            }
        } else {
            break;
        }
    }
    return false;
}

function resolveAirportCode(text) {
    if (!text) return "";
    if (AIRPORT_MAP[text]) return AIRPORT_MAP[text];
    const match = text.match(/[（\(](.+?)[）\)]/);
    if (match && match[1]) {
        const inside = match[1]; 
        if (AIRPORT_MAP[inside]) return AIRPORT_MAP[inside];
        return inside;
    }
    return text;
}

async function clearAndInput(inputElement, text) {
    safeClick(inputElement);
    await wait(500);
    const container = inputElement.parentElement;
    const clearBtns = container.querySelectorAll('button, .delete-btn, .icon-close');
    for (let btn of clearBtns) {
        if (btn.offsetParent !== null) { 
            safeClick(btn);
            await wait(300);
            break; 
        }
    }
    setNativeValue(inputElement, "");
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(200);

    inputElement.focus();
    setNativeValue(inputElement, text); 
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(1500); 
    inputElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown', keyCode: 40 }));
    await wait(200);
    inputElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13 }));
    await wait(500);
}

async function trySelectFareById(fareName) {
    const targetId = FARE_ID_MAP[fareName];
    if (!targetId) return false;
    const inputEl = document.getElementById(targetId);
    if (inputEl) { safeClick(inputEl); return true; }
    const label = document.querySelector(`label[for="${targetId}"]`);
    if (label && isVisible(label)) { safeClick(label); return true; }
    return false;
}

function updateHiddenDate(rawDate) {
    document.querySelectorAll('input[type="hidden"]').forEach(el => {
        if (el.name && (el.name.includes("Date") || el.name.includes("date"))) el.value = rawDate;
    });
}

function setNativeValue(element, value) {
    let descriptor = Object.getOwnPropertyDescriptor(element, 'value');
    if (!descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    }
    const valueSetter = descriptor ? descriptor.set : null;
    if (valueSetter) valueSetter.call(element, value);
    else element.value = value;
}