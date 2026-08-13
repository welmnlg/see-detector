// ===================================================================
// 源泉割戻計算ロジック
// ===================================================================
// 端数処理ルール（国税通則法 第119条）:
//   - 源泉徴収税額: 1円未満切り捨て
//   - 所得税と復興特別所得税は合計税率で計算後、1円未満切り捨て
//   - 住民税は別途計算し、1円未満切り捨て
//
// 割戻（逆算）:
//   - 税引前 = floor(入金額 ÷ (1 - 合計税率))
//   - 合計源泉税額 = floor(税引前 × 合計国税率)
//   - 復興特別所得税 = 合計源泉税額のうち復興分（四捨五入的処理）
//   - 所得税 = 合計源泉税額 - 復興特別所得税
//   - 住民税（該当する場合）= floor(税引前 × 住民税率)
// ===================================================================

const TAX_CONFIG = {
  corporate: {
    label: "法人",
    types: {
      dividend_listed: {
        label: "配当（上場）",
        nationalRate: 0.15315, // 所得税15% + 復興0.315%
        residentRate: 0, // 法人は住民税の源泉なし
        incomeTaxBase: 0.15, // 所得税のベース税率
        reconstructionRatio: 315, // 復興税の按分用（分子）
        nationalRatioBase: 15315, // 合計国税率の按分用（分母）
        detail: "所得税15% + 復興特別所得税0.315%",
      },
      dividend_unlisted: {
        label: "配当（非上場）",
        nationalRate: 0.2042,
        residentRate: 0,
        incomeTaxBase: 0.2,
        reconstructionRatio: 42,
        nationalRatioBase: 2042,
        detail: "所得税20% + 復興特別所得税0.42%",
      },
      interest: {
        label: "利息",
        nationalRate: 0.15315,
        residentRate: 0,
        incomeTaxBase: 0.15,
        reconstructionRatio: 315,
        nationalRatioBase: 15315,
        detail: "所得税15% + 復興特別所得税0.315%",
      },
    },
  },
  individual: {
    label: "個人",
    types: {
      dividend_listed: {
        label: "配当（上場）",
        nationalRate: 0.15315,
        residentRate: 0.05,
        incomeTaxBase: 0.15,
        reconstructionRatio: 315,
        nationalRatioBase: 15315,
        detail: "所得税15% + 復興0.315% + 住民税5%",
      },
      dividend_unlisted: {
        label: "配当（非上場）",
        nationalRate: 0.2042,
        residentRate: 0, // 住民税は源泉徴収されない（要申告）
        incomeTaxBase: 0.2,
        reconstructionRatio: 42,
        nationalRatioBase: 2042,
        detail: "所得税20% + 復興特別所得税0.42%（住民税は別途申告）",
      },
      interest: {
        label: "利息",
        nationalRate: 0.15315,
        residentRate: 0.05,
        incomeTaxBase: 0.15,
        reconstructionRatio: 315,
        nationalRatioBase: 15315,
        detail: "所得税15% + 復興0.315% + 住民税5%",
      },
      fee: {
        label: "報酬",
        nationalRate: 0.1021,
        residentRate: 0,
        incomeTaxBase: 0.1,
        reconstructionRatio: 21,
        nationalRatioBase: 1021,
        detail: "原稿料・講演料・士業報酬等（法204①一）",
        tiered: true,
        highNationalRate: 0.2042,
        highIncomeTaxBase: 0.2,
        highReconstructionRatio: 42,
        highNationalRatioBase: 2042,
        threshold: 1000000,
      },
    },
  },
};

// ===== 状態 =====
let currentEntity = "corporate";
let currentType = "dividend_listed";
let currentMode = "reverse"; // 'reverse'(割戻) | 'forward'(順計算)
let history = [];
let lastResult = null;

// ===== DOM =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== ユーティリティ =====
function formatCurrency(num) {
  return Math.floor(num).toLocaleString("ja-JP") + "円";
}

function formatNumber(num) {
  return Math.floor(num).toLocaleString("ja-JP");
}

function parseAmount(str) {
  return parseFloat(str.replace(/[,，、\s円¥\\]/g, "")) || 0;
}

function getCurrentConfig() {
  return TAX_CONFIG[currentEntity].types[currentType];
}

// ===== 入力フォーマット =====
$("#net-input").addEventListener("input", (e) => {
  const raw = e.target.value.replace(/[^0-9]/g, "");
  if (raw) {
    e.target.value = parseInt(raw, 10).toLocaleString("ja-JP");
  }
});

// ===== 法人/個人タブ =====
$$(".entity-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".entity-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentEntity = tab.dataset.entity;
    renderTypeButtons();
    updateRateDisplay();
  });
});

// ===== 計算モード切替 =====
$$(".mode-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".mode-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentMode = tab.dataset.mode;
    updateModeUI();
  });
});

function updateModeUI() {
  const isForward = currentMode === "forward";

  $("#page-title").textContent = isForward ? "源泉徴収計算" : "源泉割戻計算";
  $("#page-subtitle").textContent = isForward
    ? "税引前金額から手取りを計算"
    : "手取り額から税引前を逆算";

  $("#input-label").innerHTML = isForward
    ? '税引前金額 <span class="unit">円</span>'
    : '手取り金額 <span class="unit">円</span>';

  $("#calc-btn").textContent = isForward ? "順計算" : "割戻計算";

  // 入力値があれば保持して再計算
  const amount = parseAmount($("#net-input").value);
  if (amount > 0) {
    const result = isForward ? junkeisanCalc(amount) : warimodoCalc(amount);
    displayResult(result);
    addToHistory(result);
  }
}

// ===== 区分ボタン =====
function renderTypeButtons() {
  const types = TAX_CONFIG[currentEntity].types;
  const container = $("#type-buttons");
  container.innerHTML = "";

  const keys = Object.keys(types);
  keys.forEach((key, i) => {
    const btn = document.createElement("button");
    btn.className = "type-tab" + (i === 0 ? " active" : "");
    btn.dataset.type = key;
    btn.textContent = types[key].label;
    btn.addEventListener("click", () => {
      $$("#type-buttons .type-tab").forEach((t) =>
        t.classList.remove("active"),
      );
      btn.classList.add("active");
      currentType = key;
      updateRateDisplay();
    });
    container.appendChild(btn);
  });

  currentType = keys[0];
}

function updateRateDisplay() {
  const config = getCurrentConfig();
  const totalRate = config.nationalRate + config.residentRate;

  if (config.tiered) {
    const highTotalRate = config.highNationalRate + config.residentRate;
    $("#tax-rate-display").textContent =
      `源泉徴収税率: ${(totalRate * 100).toFixed(2)}%（${formatNumber(config.threshold)}円超: ${(highTotalRate * 100).toFixed(2)}%）`;
  } else {
    $("#tax-rate-display").textContent =
      `源泉徴収税率: ${(totalRate * 100).toFixed(3)}%`;
  }
  $("#tax-detail-display").textContent = config.detail;

  // エンティティバッジ更新
  $("#entity-status").textContent = TAX_CONFIG[currentEntity].label;
  $("#entity-status").className = "entity-status " + currentEntity;
}

// ===== 復興税按分ヘルパー =====
// 国税合計から復興特別所得税を按分（0.5超で切上、0.5以下で切捨）
function splitReconstructionTax(nationalTax, ratio, ratioBase) {
  const reconRaw = (nationalTax * ratio) / ratioBase;
  return reconRaw - Math.floor(reconRaw) > 0.5
    ? Math.ceil(reconRaw)
    : Math.floor(reconRaw);
}

// ===== 順計算: 税額計算ヘルパー =====
// 税引前金額から税額を算出（2段階報酬にも対応）
function calcTaxFromGross(grossAmount, config) {
  if (config.tiered && grossAmount > config.threshold) {
    // 2段階: 100万以下分 + 100万超分
    const lowNational = Math.floor(config.threshold * config.nationalRate);
    const highNational = Math.floor(
      (grossAmount - config.threshold) * config.highNationalRate,
    );
    const lowRecon = splitReconstructionTax(
      lowNational,
      config.reconstructionRatio,
      config.nationalRatioBase,
    );
    const highRecon = splitReconstructionTax(
      highNational,
      config.highReconstructionRatio,
      config.highNationalRatioBase,
    );
    const nationalTax = lowNational + highNational;
    const reconstructionTax = lowRecon + highRecon;
    const incomeTax = nationalTax - reconstructionTax;
    return {
      nationalTax,
      incomeTax,
      reconstructionTax,
      tieredDetail: {
        lowNational,
        highNational,
        lowIncomeTax: lowNational - lowRecon,
        highIncomeTax: highNational - highRecon,
        lowRecon,
        highRecon,
      },
    };
  }

  // 通常（1段階）
  const nationalTax = Math.floor(grossAmount * config.nationalRate);
  const reconstructionTax = splitReconstructionTax(
    nationalTax,
    config.reconstructionRatio,
    config.nationalRatioBase,
  );
  const incomeTax = nationalTax - reconstructionTax;
  return { nationalTax, incomeTax, reconstructionTax, tieredDetail: null };
}

// ===== 割戻: 税引前金額逆算ヘルパー =====
// 手取りから税引前を逆算（2段階報酬にも対応）
function calcGrossFromNet(netAmount, config) {
  if (config.tiered) {
    const boundaryNet =
      config.threshold - Math.floor(config.threshold * config.nationalRate);

    if (netAmount <= boundaryNet) {
      return Math.floor(netAmount / (1 - config.nationalRate));
    }

    // 100万超: 超過分を高税率で逆算
    const excessNet = netAmount - boundaryNet;
    const excessGross = Math.floor(excessNet / (1 - config.highNationalRate));
    const gross = config.threshold + excessGross;

    // 検算して不足なら+1
    const tax = calcTaxFromGross(gross, config);
    const checkNet = gross - tax.nationalTax;
    if (checkNet < netAmount) {
      return gross + 1;
    }
    return gross;
  }

  const totalRate = config.nationalRate + config.residentRate;
  return Math.floor(netAmount / (1 - totalRate));
}

// ===== 割戻計算（コア） =====
function warimodoCalc(netAmount) {
  const config = getCurrentConfig();
  const totalRate = config.nationalRate + config.residentRate;

  const gross = calcGrossFromNet(netAmount, config);
  const tax = calcTaxFromGross(gross, config);

  const residentTax =
    config.residentRate > 0 ? Math.floor(gross * config.residentRate) : 0;
  const totalTax = tax.nationalTax + residentTax;
  const checkNet = gross - totalTax;

  return {
    mode: "reverse",
    entity: currentEntity,
    entityLabel: TAX_CONFIG[currentEntity].label,
    typeKey: currentType,
    typeLabel: config.label,
    totalRate,
    detail: config.detail,
    netAmount,
    gross,
    nationalTax: tax.nationalTax,
    incomeTax: tax.incomeTax,
    reconstructionTax: tax.reconstructionTax,
    residentTax,
    totalTax,
    checkNet,
    hasResidentTax: config.residentRate > 0,
    incomeTaxBaseRate: config.incomeTaxBase,
    tieredDetail: tax.tieredDetail,
    reconstructionRateDisplay: (
      (config.reconstructionRatio / config.nationalRatioBase) *
      config.nationalRate *
      100
    ).toFixed(3),
  };
}

// ===== 順計算（コア）: 税引前 → 手取り =====
function junkeisanCalc(grossAmount) {
  const config = getCurrentConfig();
  const totalRate = config.nationalRate + config.residentRate;

  const tax = calcTaxFromGross(grossAmount, config);

  const residentTax =
    config.residentRate > 0 ? Math.floor(grossAmount * config.residentRate) : 0;
  const totalTax = tax.nationalTax + residentTax;
  const netAmount = grossAmount - totalTax;

  // 検算: 手取りから逆算した税引前 ≒ 入力した税引前
  const checkGross = calcGrossFromNet(netAmount, config);

  return {
    mode: "forward",
    entity: currentEntity,
    entityLabel: TAX_CONFIG[currentEntity].label,
    typeKey: currentType,
    typeLabel: config.label,
    totalRate,
    detail: config.detail,
    netAmount,
    gross: grossAmount,
    nationalTax: tax.nationalTax,
    incomeTax: tax.incomeTax,
    reconstructionTax: tax.reconstructionTax,
    residentTax,
    totalTax,
    checkGross,
    hasResidentTax: config.residentRate > 0,
    incomeTaxBaseRate: config.incomeTaxBase,
    tieredDetail: tax.tieredDetail,
    reconstructionRateDisplay: (
      (config.reconstructionRatio / config.nationalRatioBase) *
      config.nationalRate *
      100
    ).toFixed(3),
  };
}

// ===== 税額内訳HTML生成 =====
function buildTaxBreakdownHTML(result, config) {
  if (result.tieredDetail) {
    const d = result.tieredDetail;
    const lowReconPct = (
      (config.nationalRate - config.incomeTaxBase) *
      100
    ).toFixed(2);
    const highReconPct = (
      (config.highNationalRate - config.highIncomeTaxBase) *
      100
    ).toFixed(2);
    return `
      <div class="result-row section-header">
        <span>所得税+復興税（${formatNumber(config.threshold)}円以下分）</span>
        <span id="national-tax-low" class="negative">${formatCurrency(d.lowNational)}</span>
      </div>
      <div class="result-row sub-detail">
        <span>所得税（${(config.incomeTaxBase * 100).toFixed(0)}%）</span>
        <span>${formatCurrency(d.lowIncomeTax)}</span>
      </div>
      <div class="result-row sub-detail">
        <span>復興特別所得税（${lowReconPct}%）</span>
        <span>${formatCurrency(d.lowRecon)}</span>
      </div>
      <div class="result-row section-header">
        <span>所得税+復興税（${formatNumber(config.threshold)}円超分）</span>
        <span id="national-tax-high" class="negative">${formatCurrency(d.highNational)}</span>
      </div>
      <div class="result-row sub-detail">
        <span>所得税（${(config.highIncomeTaxBase * 100).toFixed(0)}%）</span>
        <span>${formatCurrency(d.highIncomeTax)}</span>
      </div>
      <div class="result-row sub-detail">
        <span>復興特別所得税（${highReconPct}%）</span>
        <span>${formatCurrency(d.highRecon)}</span>
      </div>
    `;
  }

  // 通常の1段表示
  const reconPct = ((config.nationalRate - config.incomeTaxBase) * 100).toFixed(
    3,
  );
  return `
    <div class="result-row section-header">
      <span>所得税+復興特別所得税</span>
      <span id="national-tax" class="negative">${formatCurrency(result.nationalTax)}</span>
    </div>
    <div class="result-row sub-detail">
      <span>所得税（${(result.incomeTaxBaseRate * 100).toFixed(0)}%）</span>
      <span>${formatCurrency(result.incomeTax)}</span>
    </div>
    <div class="result-row sub-detail">
      <span>復興特別所得税（${reconPct}%）</span>
      <span>${formatCurrency(result.reconstructionTax)}</span>
    </div>
  `;
}

// ===== 結果表示 =====
function displayResult(result) {
  lastResult = result;
  const isForward = result.mode === "forward";

  // プライマリ結果（計算で求めた値）
  $("#result-primary-label").textContent = isForward
    ? "手取り金額（税引後）"
    : "税引前金額（割戻後）";
  $("#gross-result").textContent = isForward
    ? formatCurrency(result.netAmount)
    : formatCurrency(result.gross);

  // 入力値エコー
  $("#input-echo-label").textContent = isForward ? "税引前金額" : "手取り金額";
  $("#net-display").textContent = isForward
    ? formatCurrency(result.gross)
    : formatCurrency(result.netAmount);

  // 税額内訳を動的生成
  const config = getCurrentConfig();
  $("#tax-breakdown-area").innerHTML = buildTaxBreakdownHTML(result, config);

  // 住民税
  if (result.hasResidentTax) {
    $("#resident-tax-row").style.display = "flex";
    $("#resident-tax-detail").textContent = formatCurrency(result.residentTax);
  } else {
    $("#resident-tax-row").style.display = "none";
  }

  // 合計
  $("#total-tax").textContent = formatCurrency(result.totalTax);

  // 検算
  if (isForward) {
    $("#check-label").textContent = "検算（手取りから逆算した税引前）";
    $("#check-amount").textContent = formatCurrency(result.checkGross);
    const diff = result.checkGross - result.gross;
    if (diff === 0) {
      $("#check-status").textContent = "✓ 一致";
      $("#check-status").className = "check-ok";
    } else {
      $("#check-status").textContent = `差額 ${diff}円（端数処理による）`;
      $("#check-status").className = "check-warn";
    }
  } else {
    $("#check-label").textContent = "検算（税引前 - 税額）";
    $("#check-amount").textContent = formatCurrency(result.checkNet);
    const diff = result.checkNet - result.netAmount;
    if (diff === 0) {
      $("#check-status").textContent = "✓ 一致";
      $("#check-status").className = "check-ok";
    } else {
      $("#check-status").textContent = `差額 ${diff}円（端数処理による）`;
      $("#check-status").className = "check-warn";
    }
  }

  $(".result-section").style.display = "block";
}

// ===== クリップボード =====
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = "✓";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove("copied");
    }, 1200);
  });
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = "コピー済！";
    setTimeout(() => {
      btn.textContent = original;
    }, 1200);
  });
}

$("#copy-gross").addEventListener("click", function () {
  const val = $("#gross-result").textContent.replace(/[円,]/g, "");
  copyToClipboard(val, this);
});

$("#copy-tax").addEventListener("click", function () {
  if (!lastResult) return;
  copyText(String(lastResult.totalTax), this);
});

$("#copy-national").addEventListener("click", function () {
  if (!lastResult) return;
  copyText(String(lastResult.nationalTax), this);
});

$("#copy-all").addEventListener("click", function () {
  if (!lastResult) return;
  const r = lastResult;
  const config = getCurrentConfig();
  const isForward = r.mode === "forward";
  const title = isForward ? "【源泉徴収計算結果】" : "【源泉割戻計算結果】";
  const direction = isForward
    ? "計算方向: 順計算（税引前→手取り）"
    : "計算方向: 割戻計算（手取り→税引前）";

  const lines = [
    title,
    direction,
    `区分: ${r.entityLabel} / ${r.typeLabel}`,
    `税引前金額: ${formatCurrency(r.gross)}`,
    `手取り金額: ${formatCurrency(r.netAmount)}`,
  ];

  if (r.tieredDetail) {
    const d = r.tieredDetail;
    lines.push(
      `所得税+復興税（${formatNumber(config.threshold)}円以下分）: ${formatCurrency(d.lowNational)}`,
      `  所得税: ${formatCurrency(d.lowIncomeTax)}`,
      `  復興特別所得税: ${formatCurrency(d.lowRecon)}`,
      `所得税+復興税（${formatNumber(config.threshold)}円超分）: ${formatCurrency(d.highNational)}`,
      `  所得税: ${formatCurrency(d.highIncomeTax)}`,
      `  復興特別所得税: ${formatCurrency(d.highRecon)}`,
    );
  } else {
    lines.push(
      `所得税+復興税: ${formatCurrency(r.nationalTax)}`,
      `  所得税: ${formatCurrency(r.incomeTax)}`,
      `  復興特別所得税: ${formatCurrency(r.reconstructionTax)}`,
    );
  }

  if (r.hasResidentTax) {
    lines.push(`住民税: ${formatCurrency(r.residentTax)}`);
  }
  lines.push(`源泉徴収合計: ${formatCurrency(r.totalTax)}`);

  copyText(lines.join("\n"), this);
});

// ===== 計算ボタン =====
$("#calc-btn").addEventListener("click", () => {
  const amount = parseAmount($("#net-input").value);
  if (amount <= 0) {
    alert(
      currentMode === "forward"
        ? "税引前金額を入力してください"
        : "手取り金額を入力してください",
    );
    return;
  }
  const result =
    currentMode === "forward" ? junkeisanCalc(amount) : warimodoCalc(amount);
  displayResult(result);
  addToHistory(result);
});

$("#net-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("#calc-btn").click();
});

// ===== 履歴 =====
function addToHistory(result) {
  history.unshift({
    mode: result.mode,
    entityLabel: result.entityLabel,
    typeLabel: result.typeLabel,
    netAmount: result.netAmount,
    gross: result.gross,
    totalTax: result.totalTax,
    timestamp: new Date().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
  if (history.length > 20) history.pop();
  renderHistory();
}

function renderHistory() {
  const list = $("#history-list");
  if (history.length === 0) {
    list.innerHTML = '<p class="empty-state">まだ計算履歴はありません</p>';
    $("#clear-history").style.display = "none";
    return;
  }
  $("#clear-history").style.display = "inline";
  list.innerHTML = history
    .map((item) => {
      const isForward = item.mode === "forward";
      const modeIcon = isForward ? "順" : "戻";
      const inputLabel = isForward ? "税引前" : "手取り";
      const inputAmount = isForward ? item.gross : item.netAmount;
      const outputAmount = isForward ? item.netAmount : item.gross;
      return `
    <div class="history-item">
      <div class="history-item-left">
        <span class="history-item-type"><span class="history-mode-badge${isForward ? " forward" : ""}">${modeIcon}</span> ${item.entityLabel}/${item.typeLabel} ${item.timestamp}</span>
        <span class="history-item-gross">${inputLabel} ${formatCurrency(inputAmount)}</span>
      </div>
      <div class="history-item-right">
        <span class="history-item-net">${formatCurrency(outputAmount)}</span>
        <span class="history-item-tax">税額 ${formatCurrency(item.totalTax)}</span>
      </div>
    </div>
  `;
    })
    .join("");
}

$("#clear-history").addEventListener("click", () => {
  history = [];
  renderHistory();
});

// ===== コンテンツスクリプトからの受信 =====
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SELECTED_AMOUNT" && message.amount > 0) {
    $("#net-input").value = formatNumber(message.amount);
    const result =
      currentMode === "forward"
        ? junkeisanCalc(message.amount)
        : warimodoCalc(message.amount);
    displayResult(result);
    addToHistory(result);
  }
});

// ===== 初期化 =====
renderTypeButtons();
updateRateDisplay();
