let rightClickedElement = null;
let rightClickedLi = null;
let lastContextInfo = { x: 0, y: 0, t: 0 };

let leftClickedLi = null;
let lastLeftClickInfo = { x: 0, y: 0, t: 0 };

function __uyapLabelElForLi(li) {
  if (!li) return null;
  const candidates = [
    ":scope > a",
    ":scope > div > a",
    ":scope > span",
    ":scope > div > span",
    ":scope > div > label",
    ":scope > label"
  ];
  for (const sel of candidates) {
    const el = li.querySelector(sel);
    if (!el) continue;
    const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (txt && txt.length >= 1) return el;
  }
  return null;
}

function __uyapLiDepth(li) {
  // depth = number of ancestor <li> (deeper nodes are more specific)
  let d = 0;
  try {
    let p = li && li.parentElement ? li.parentElement : null;
    while (p) {
      if (p.tagName && p.tagName.toLowerCase() === "li") d++;
      p = p.parentElement;
    }
  } catch (_) {}
  return d;
}




function __uyapFindTreeScopeForEvent(event) {
  // Try to narrow to UYAP's jsTree (prevents picking unrelated <li> on the page)
  try {
    const t = event && event.target && event.target.closest ? event.target : null;
    const jst = t ? (t.closest(".jstree") || t.closest("div.jstree") || t.closest("li").closest(".jstree")) : null;
    if (jst) {
      const ul = jst.querySelector("ul.jstree-container-ul") || jst.querySelector("ul");
      if (ul) return ul;
      return jst;
    }
    const ul2 = document.querySelector("ul.jstree-container-ul");
    if (ul2) return ul2;
  } catch (_) {}
  return document;
}

function __uyapFindTreeScopeFromNode(node) {
  try {
    if (node && node.closest) {
      const jst = node.closest(".jstree");
      if (jst) {
        const ul = jst.querySelector("ul.jstree-container-ul") || jst.querySelector("ul");
        if (ul) return ul;
        return jst;
      }
      const ulA = node.closest("ul.jstree-container-ul") || node.closest("ul");
      if (ulA) return ulA;
    }
  } catch (_) {}
  const ul2 = document.querySelector("ul.jstree-container-ul");
  return ul2 || document;
}



function __uyapFindLiByHitTest(x, y, scopeEl) {
  // Hit-test on label elements (not <li> containers) to avoid parents capturing children's vertical area.
  const scope = scopeEl || document;
  const lis = Array.from(scope.querySelectorAll("li"));
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  let bestDepth = -1;

  for (const li of lis) {
    const el = __uyapLabelElForLi(li);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (!rect || rect.width < 5 || rect.height < 5) continue;
    // Must be on-screen to reduce false positives
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

    // Prefer the item whose label row contains the click Y
    if (y >= rect.top && y <= rect.bottom) {
      // Prefer deeper indentation (larger rect.left) when clicking to the right;
      // Use distance from left as score (smaller is better). If x is left of item, penalize heavily.
      const score = (x >= rect.left) ? (x - rect.left) : (100000 + (rect.left - x));
      const depth = __uyapLiDepth(li);
      if (score < bestScore || (score === bestScore && depth > bestDepth)) {
        bestScore = score;
        bestDepth = depth;
        best = li;
      }
    }
  }

  if (best) return best;

  // Fallback: closest by vertical distance to label center (useful if the click lands on an overlay tooltip).
  let best2 = null;
  let bestDist = Number.POSITIVE_INFINITY;
  let bestDepth2 = -1;
  for (const li of lis) {
    const el = __uyapLabelElForLi(li);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (!rect || rect.width < 5 || rect.height < 5) continue;
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

    const cy = rect.top + rect.height / 2;
    const dist = Math.abs(y - cy);
    // small bias for deeper indentation if equal distance
    const bias = 1 / Math.max(1, rect.left + 1);
    const score = dist + bias;
    const depth2 = __uyapLiDepth(li);
    if (score < bestDist || (score === bestDist && depth2 > bestDepth2)) {
      bestDist = score;
      bestDepth2 = depth2;
      best2 = li;
    }
  }
  return best2;
}

function __uyapFallbackSelectedLi() {
  const sels = [
    "a.jstree-clicked",
    "a.jstree-hovered",
    "li[aria-selected='true']",
    "li.selected",
    "li.active",
    ".ui-state-active",
    ".ui-state-hover"
  ];
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const li = el.closest ? el.closest("li") : null;
    if (li) return li;
  }
  return null;
}

function __uyapPickTreeLiFromContextEvent(event) {
  const direct = event?.target?.closest ? event.target.closest("li") : null;
  if (direct) {
    // If the click lands on whitespace (e.g. <ul> padding), direct may point to the parent folder.
    // Only trust "direct" when the click Y intersects the row label of that LI.
    const labelEl = __uyapLabelElForLi(direct);
    if (labelEl) {
      const r = labelEl.getBoundingClientRect();
      if (event.clientY >= r.top && event.clientY <= r.bottom) return direct;
    }
  }

  const scope = __uyapFindTreeScopeForEvent(event);
  const byHit = __uyapFindLiByHitTest(event.clientX, event.clientY, scope);
  if (byHit) return byHit;

  return null;
}


addEventListener("click", (event) => {
  // Record left-click selection as a fallback (users often left-click first, then use extension icon)
  if (!event || event.button !== 0) return;
  lastLeftClickInfo = { x: event.clientX, y: event.clientY, t: Date.now() };

  let li = null;
  try {
    const direct = event.target && event.target.closest ? event.target.closest("li") : null;
    if (direct) {
      // Only accept if click Y overlaps the label row of this li
      const label = __uyapLabelElForLi(direct);
      if (label) {
        const r = label.getBoundingClientRect();
        if (r && event.clientY >= r.top && event.clientY <= r.bottom) {
          li = direct;
        }
      }
    }
  } catch (_) {}

  if (!li) {
    try {
      const scope = __uyapFindTreeScopeForEvent(event);
      li = __uyapFindLiByHitTest(event.clientX, event.clientY, scope);
    } catch (_) {}
  }

  if (li) leftClickedLi = li;
}, true);

addEventListener("contextmenu", (event) => {
  rightClickedElement = event.target;
  lastContextInfo = { x: event.clientX, y: event.clientY, t: Date.now() };
  rightClickedLi = __uyapPickTreeLiFromContextEvent(event);
}, true);

// Download progress gate (advance to next click when background signals "download started")
let downloadWaiter = null;
let __uyapCancelRequested = false;
let __uyapCurrentTotal = 0;
let __uyapCurrentRoot = "";
let __uyapCurrentSpeed = "normal";

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "trigger_download") {
    (async () => { await processDownload(); })();
    return;
  }
  if (request.action === "download_progress") {
    if (downloadWaiter) {
      const r = downloadWaiter;
      downloadWaiter = null;
      r();
    }
    // UI progress
    updateStatusProgress(request.index, request.total);
    return;
  }
  if (request.action === "download_complete") {
    showStatusComplete(request.total);
    return;
  }
  if (request.action === "download_canceled") {
    showStatusCanceled(request.done, request.total);
    return;
  }
});


// ---------------- Hız Sınırı (Rate Limit) ----------------
// Amaç: UYAP tarafında "bot / anormal trafik" gibi algılanmayı azaltmak.
// Not: Bu beklemeler, UYAP yanıt süresini tahmin etmek için değil; sadece indirme tetiklerini yumuşatmak içindir.
const THROTTLE_EVERY_N = 10;  // Normal modda: her N dosyada bir ekstra mola
// Modlara göre aralıklar (ms)
const THROTTLE_PROFILES = {
  normal: { min: 2000, max: 4500, extraMin: 8000, extraMax: 15000 },
  fast:   { min: 0,    max: 0,    extraMin: 0,    extraMax: 0     }
};

const SPEED_MODE_KEY = "uyap_speed_mode"; // "normal" | "fast"
const DEFAULT_SPEED_MODE = "normal";

function getSpeedMode() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get({ [SPEED_MODE_KEY]: DEFAULT_SPEED_MODE }, (data) => {
        const mode = (data && data[SPEED_MODE_KEY]) ? data[SPEED_MODE_KEY] : DEFAULT_SPEED_MODE;
        resolve(mode === "fast" ? "fast" : "normal");
      });
    } catch (_) {
      resolve(DEFAULT_SPEED_MODE);
    }
  });
}
function randInt(min, max) {
  const a = Math.max(0, Number(min) || 0);
  const b = Math.max(a, Number(max) || 0);
  return Math.floor(a + Math.random() * (b - a + 1));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleWait(i, total, mode) {
  const key = (mode === "fast") ? "fast" : "normal";
  const p = THROTTLE_PROFILES[key];
  const base = randInt(p.min, p.max);
  if (base > 0) await sleep(base);

  // Her N dosyada bir ekstra mola
  if (THROTTLE_EVERY_N > 0 && (i + 1) % THROTTLE_EVERY_N === 0 && (i + 1) < total) {
    const extra = randInt(p.extraMin, p.extraMax);
    if (extra > 0) await sleep(extra);
  }
}


// ---------------- UI: Onay Modal + İlerleme ----------------
let __uyapModalRoot = null;
let __uyapStatusRoot = null;

function ensureUiStyles() {
  if (document.getElementById("uyap-ext-style")) return;

  const style = document.createElement("style");
  style.id = "uyap-ext-style";
  style.textContent = `
    .uyap-ext-overlay{
      position: fixed; inset: 0;
      background: rgba(0,0,0,.35);
      display: flex; align-items: center; justify-content: center;
      z-index: 2147483647;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    .uyap-ext-modal{
      width: min(920px, 96vw);
      max-height: min(82vh, 820px);
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      overflow: hidden;
      display: flex; flex-direction: column;
    }
    .uyap-ext-header{
      padding: 14px 16px;
      border-bottom: 1px solid #eee;
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px;
    }
    .uyap-ext-title{
      font-size: 16px; font-weight: 800; color: #111;
    }
    .uyap-ext-badge{
      font-size: 11px;
      background: #f1f3f5;
      border: 1px solid #e9ecef;
      padding: 6px 8px;
      border-radius: 999px;
      color:#444;
      white-space: nowrap;
    }
    .uyap-ext-body{
      padding: 14px 16px;
      overflow: auto;
      flex: 1 1 auto;
    }
    .uyap-ext-section{
      margin: 0 0 12px 0;
      padding: 10px 12px;
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 10px;
    }
    .uyap-ext-kv{
      font-size: 13px;
      line-height: 1.35;
      color: #222;
    }
    .uyap-ext-kv strong{ font-weight: 800; }
    .uyap-ext-pre{
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 12px;
      line-height: 1.35;
      color: #222;
    }
    .uyap-ext-footer{
      border-top: 1px solid #eee;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #fff;
      position: sticky;
      bottom: 0;
    }
    .uyap-ext-summary{
      font-size: 12px;
      color: #222;
      line-height: 1.25;
    }
    .uyap-ext-summary .muted{ color:#666; }
    .uyap-ext-actions{
      display: flex;
      gap: 10px;
      flex: 0 0 auto;
    }
    .uyap-ext-btn{
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      font-weight: 800;
      cursor: pointer;
      font-size: 13px;
    }
    .uyap-ext-btn-cancel{
      background: #e9ecef;
      color: #222;
    }
    .uyap-ext-btn-ok{
      background: #3949ab;
      color: #fff;
    }

    /* Status toast */
    .uyap-ext-status{
      position: fixed;
      right: 14px;
      bottom: 14px;
      z-index: 2147483647;
      width: min(420px, 92vw);
      background: rgba(255,255,255,.96);
      border: 1px solid #e9ecef;
      border-radius: 14px;
      box-shadow: 0 16px 40px rgba(0,0,0,.18);
      padding: 12px 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    .uyap-ext-status .row{
      display:flex; align-items:center; justify-content:space-between; gap: 10px;
    }
    .uyap-ext-stop{
      border: 1px solid #e0e0e0;
      background: #fff;
      border-radius: 999px;
      padding: 6px 10px;
      font-weight: 800;
      cursor: pointer;
      font-size: 11px;
      color: #c0392b;
    }
    .uyap-ext-stop:disabled{
      opacity: .55;
      cursor: default;
      color: #777;
    }
    .uyap-ext-status .h{
      font-weight: 900; font-size: 13px; color:#111;
    }
    .uyap-ext-status .p{
      font-size: 12px; color:#333; margin-top: 6px; line-height: 1.25;
    }
    .uyap-ext-status .small{
      font-size: 11px; color:#666;
    }
  `;
  document.head.appendChild(style);
}

function showStatusStart(rootLabel, total, speedMode) {
  ensureUiStyles();
  if (__uyapStatusRoot) __uyapStatusRoot.remove();

  const div = document.createElement("div");
  div.className = "uyap-ext-status";
  div.innerHTML = `
    <div class="row">
      <div class="h">⬇️ İndirme başladı</div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="small" id="uyapStatusCounter">0 / ${total}</div>
        <button class="uyap-ext-stop" id="uyapStopBtn" title="İndirmeyi durdur">Durdur</button>
      </div>
    </div>
    <div class="p">
      <div><strong>Klasör:</strong> ${escapeHtml(rootLabel)}</div>
      <div><strong>Hız:</strong> ${speedMode === "fast" ? "FAST (gecikmesiz)" : "Normal (önerilen)"}</div>
      <div class="small" style="margin-top:6px;">Lütfen işlem bitene kadar sekmeyi kapatmayın.</div>
    </div>
  `;
  document.body.appendChild(div);
  __uyapStatusRoot = div;
  const stopBtn = div.querySelector("#uyapStopBtn");
  if (stopBtn) {
    stopBtn.addEventListener("click", async () => {
      try {
        stopBtn.disabled = true;
        stopBtn.textContent = "Durduruluyor…";
        __uyapCancelRequested = true;
        // Eğer bir "download started" bekleniyorsa, döngünün devam edip iptal kontrolü yapabilmesi için serbest bırak.
        if (downloadWaiter) {
          const r = downloadWaiter;
          downloadWaiter = null;
          r();
        }
        chrome.runtime.sendMessage({ action: "cancel_download_plan" });
      } catch (e) {
        console.error(e);
      }
    });
  }

}

function updateStatusProgress(index, total) {
  if (!__uyapStatusRoot) return;
  const c = __uyapStatusRoot.querySelector("#uyapStatusCounter");
  if (c) c.textContent = `${Math.min(index, total)} / ${total}`;
}

function showStatusComplete(total) {
  if (!__uyapStatusRoot) return;
  const title = __uyapStatusRoot.querySelector(".h");
  const c = __uyapStatusRoot.querySelector("#uyapStatusCounter");
  if (title) title.textContent = "✅ İndirme tamamlandı";
  if (c) c.textContent = `${total} / ${total}`;

  

  const btn = __uyapStatusRoot.querySelector("#uyapStopBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Tamamlandı";
  }
const p = __uyapStatusRoot.querySelector(".p");
  if (p) {
    const done = document.createElement("div");
    done.className = "small";
    done.style.marginTop = "8px";
    done.textContent = `Toplam ${total} dosya için indirme tetiklendi. (Tarayıcı indirme listesinden kontrol edebilirsiniz.)`;
    p.appendChild(done);
  }

  setTimeout(() => {
    if (__uyapStatusRoot) { __uyapStatusRoot.remove(); __uyapStatusRoot = null; }
  }, 9000);
}


function showStatusCanceled(done, total) {
  if (!__uyapStatusRoot) return;
  const title = __uyapStatusRoot.querySelector(".h");
  const c = __uyapStatusRoot.querySelector("#uyapStatusCounter");
  if (title) title.textContent = "⛔ İndirme durduruldu";
  if (c) c.textContent = `${done} / ${total}`;

  const btn = __uyapStatusRoot.querySelector("#uyapStopBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Durduruldu";
  }

  const p = __uyapStatusRoot.querySelector(".p");
  if (p) {
    const info = document.createElement("div");
    info.className = "small";
    info.style.marginTop = "8px";
    info.textContent = `İndirme planı iptal edildi. (Tarayıcı indirme listesinden kontrol edebilirsiniz.)`;
    p.appendChild(info);
  }

  setTimeout(() => {
    if (__uyapStatusRoot) { __uyapStatusRoot.remove(); __uyapStatusRoot = null; }
  }, 9000);
}


function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function showConfirmModal({ rootLabel, rootRaw, selectedLabel, total, speedMode, previewText }) {
  ensureUiStyles();

  return new Promise((resolve) => {
    if (__uyapModalRoot) __uyapModalRoot.remove();

    const overlay = document.createElement("div");
    overlay.className = "uyap-ext-overlay";

    overlay.innerHTML = `
      <div class="uyap-ext-modal" role="dialog" aria-modal="true">
        <div class="uyap-ext-header">
          <div class="uyap-ext-title">Toplu İndirme Onayı</div>
          <div class="uyap-ext-badge">Resmî değildir • UYAP/Adalet Bakanlığı ile bağlantısı yoktur</div>
        </div>

        <div class="uyap-ext-body">
          <div class="uyap-ext-section">
            <div class="uyap-ext-kv">
              <div><strong>Seçilen Klasör:</strong> ${escapeHtml(rootLabel)}</div>
              <div><strong>Tespit Edilen Dosya Sayısı:</strong> ${total}</div>
            </div>
          </div>

          <div class="uyap-ext-section">
            <div class="uyap-ext-kv">
              <strong>İndirme Stratejisi</strong><br/>
              • Klasörler yalnızca gerektiği kadar ve bir kez açılır (gereksiz aç/kapa yok).<br/>
              • Downloads altında kök klasör oluşturulur; alt klasör yapısı korunur.<br/>
              • Dosyalar UYAP’ta görünen adlarla kaydedilir; uzantı (.pdf/.udf vb.) otomatik korunur.<br/>
              • Bir sonraki evrağa geçmeden önce “indirme başladı” sinyali beklenir.<br/>
            </div>
          </div>

          <div class="uyap-ext-section">
            <div class="uyap-ext-kv"><strong>Oluşturulacak Yapı (Ön İzleme)</strong></div>
            <div class="uyap-ext-pre" style="margin-top:8px;">${escapeHtml(previewText || "")}</div>
          </div>

          <div class="uyap-ext-section">
            <div class="uyap-ext-kv">
              <strong>Seçim Bilgisi</strong><br/>
              • Sağ tıklanan satır: "${escapeHtml(selectedLabel)}"<br/>
              • Kök klasör (ham): "${escapeHtml(rootRaw || "(boş)")}"<br/>
              • Hız modu: <strong>${speedMode === "fast" ? "FAST (gecikmesiz)" : "Normal (önerilen)"}</strong>
            </div>
          </div>
        </div>

        <div class="uyap-ext-footer">
          <div class="uyap-ext-summary">
            <div><strong>${total}</strong> dosya • <strong>${speedMode === "fast" ? "FAST" : "Normal"}</strong></div>
            <div class="muted">Bu satır hep görünür (kaydırma olsa bile).</div>
          </div>
          <div class="uyap-ext-actions">
            <button class="uyap-ext-btn uyap-ext-btn-cancel" id="uyapModalCancel">İptal</button>
            <button class="uyap-ext-btn uyap-ext-btn-ok" id="uyapModalOk">Başlat</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    __uyapModalRoot = overlay;

    const cleanup = () => {
      if (__uyapModalRoot) { __uyapModalRoot.remove(); __uyapModalRoot = null; }
    };

    overlay.addEventListener("click", (e) => {
      // overlay click outside modal closes as cancel
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });

    overlay.querySelector("#uyapModalCancel").addEventListener("click", () => {
      cleanup();
      resolve(false);
    });
    overlay.querySelector("#uyapModalOk").addEventListener("click", () => {
      cleanup();
      resolve(true);
    });

    document.addEventListener("keydown", function esc(ev) {
      if (ev.key === "Escape") {
        document.removeEventListener("keydown", esc);
        cleanup();
        resolve(false);
      }
    });
  });
}


// ---------------- Helpers ----------------
function sanitizeSegment(name) {
  if (!name) return "untitled";
  let s = String(name).trim();
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\//g, "_");     // 2025/85785 -> 2025_85785
  s = s.replace(/:/g, "-");
  s = s.replace(/[\\?%*\|"<>]/g, "_");
  s = s.replace(/[.\s]+$/g, "");
  if (s.length > 140) s = s.slice(0, 140) + "…";
  return s || "untitled";
}

function closestLi(el) { return el ? el.closest("li") : null; }

// -------- Robust label extraction ----------
function labelFromRightClick(li) {
  let node = rightClickedElement;
  while (node && node !== li) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const txt = (node.textContent || "").replace(/\s+/g, " ").trim();
      if (txt && txt.length >= 2 && txt.length <= 220) return txt;
    }
    node = node.parentElement;
  }
  return "";
}

function getOwnLabelText(li) {
  if (!li) return "";

  const candidates = [
    ":scope > a",
    ":scope > div > a",
    ":scope > span",
    ":scope > div",
    ":scope > label"
  ];
  for (const sel of candidates) {
    const el = li.querySelector(sel);
    if (el) {
      const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (txt && txt.length >= 2) return txt;
    }
  }

  const rc = labelFromRightClick(li);
  if (rc) return rc;

  const clone = li.cloneNode(true);
  clone.querySelectorAll("ul, ol").forEach((n) => n.remove());
  clone.querySelectorAll("img, svg, i, ins, button, input").forEach((n) => n.remove());
  const txt = (clone.textContent || "").replace(/\s+/g, " ").trim();
  return txt;
}

// -------- Folder / file detection ----------
function hasDirectChildLis(li) {
  return !!(li.querySelector(":scope > ul > li") ||
            li.querySelector(":scope > div > ul > li") ||
            li.querySelector(":scope > ol > li"));
}
function hasExpanderControl(li) {
  if (!li) return false;
  const sel = [
    ":scope > .jstree-ocl",
    ":scope > i.jstree-ocl",
    ":scope > span.jstree-ocl",
    ":scope > ins.jstree-icon",
    ":scope > i.jstree-icon",
    ":scope > span.hitarea",
    ":scope > div.hitarea",
    ":scope [aria-expanded]",
    ":scope [role='button']"
  ];
  return sel.some(s => !!li.querySelector(s));
}
function isFolderLi(li) {
  if (!li) return false;
  if (hasDirectChildLis(li)) return true;
  if (hasExpanderControl(li)) return true;
  const cls = (li.className || "").toLowerCase();
  if (cls.includes("folder")) return true;
  return false;
}
function isFileLi(li) { return !isFolderLi(li); }

function findExpander(li) {
  const selectors = [
    ":scope > .jstree-ocl",
    ":scope > i.jstree-ocl",
    ":scope > span.jstree-ocl",
    ":scope > ins.jstree-icon",
    ":scope > i.jstree-icon",
    ":scope > span.hitarea",
    ":scope > div.hitarea",
    ":scope [role='button']",
    ":scope [aria-expanded]"
  ];
  for (const s of selectors) {
    const el = li.querySelector(s);
    if (el) return el;
  }
  return null;
}

function getChildContainer(li) {
  return li.querySelector(":scope > ul, :scope > div > ul, :scope > ol");
}

function isOpenFolder(li) {
  if (!isFolderLi(li)) return true;

  const aria = li.getAttribute("aria-expanded");
  if (aria === "true") return true;

  const ul = getChildContainer(li);
  if (ul) {
    const st = window.getComputedStyle(ul);
    if (st && st.display !== "none") return true;
  }

  // If it has direct children, treat as open
  if (hasDirectChildLis(li)) return true;

  const cls = (li.className || "").toLowerCase();
  if (cls.includes("open") || cls.includes("expanded")) return true;

  return false;
}

// -------- MutationObserver wait (no short fixed delays) ----------
function waitForCondition(conditionFn, rootNode, safetyTimeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    try { if (conditionFn()) return resolve(true); } catch (_) {}

    let done = false;
    const obs = new MutationObserver(() => {
      if (done) return;
      try {
        if (conditionFn()) {
          done = true;
          obs.disconnect();
          resolve(true);
        }
      } catch (_) {}
    });

    obs.observe(rootNode || document.body, { childList: true, subtree: true, attributes: true });

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      obs.disconnect();
      reject(new Error("UYAP ağacında beklenen DOM güncellemesi gelmedi (emniyet zaman aşımı)."));
    }, safetyTimeoutMs);

    const _resolve = resolve;
    resolve = (v) => { clearTimeout(timer); _resolve(v); };
  });
}

async function ensureExpanded(li) {
  if (!li || !isFolderLi(li)) return true;
  if (isOpenFolder(li)) return true;

  const exp = findExpander(li);
  if (!exp) return true;

  // Request expansion
  exp.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));

  // Wait until the node is open OR its child container becomes visible/exists
  await waitForCondition(() => {
    if (isOpenFolder(li)) return true;
    const ul = getChildContainer(li);
    if (!ul) return false;
    const st = window.getComputedStyle(ul);
    return st && st.display !== "none";
  }, li);

  return true;
}

function getDirectChildLis(folderLi) {
  const ul = getChildContainer(folderLi);
  if (!ul) return [];
  return Array.from(ul.children || []).filter(n => n && n.tagName === "LI");
}

// -------- Targeted traversal (minimal UI movement) ----------
async function scanFolderDFS(folderLi, pathSegments, results, visited) {
  if (!folderLi || visited.has(folderLi)) return;
  visited.add(folderLi);

  // Ensure this folder is expanded before reading children
  await ensureExpanded(folderLi);

  // Children might still arrive asynchronously; wait until container exists & visible (already ensured),
  // then read direct children. If none, it's an empty folder.
  const children = getDirectChildLis(folderLi);

  for (const child of children) {
    if (!child || child.tagName !== "LI") continue;

    // Determine label
    const raw = getOwnLabelText(child);
    const seg = sanitizeSegment(raw);

    if (isFolderLi(child)) {
      // Recurse into subfolder
      await scanFolderDFS(child, [...pathSegments, seg], results, visited);
    } else {
      // File node
      const basePathNoExt = [...pathSegments, seg].join("/");
      const clickable = clickableForFile(child);
      results.items.push(basePathNoExt);
      results.clickables.push(clickable);
    }
  }
}

// Root selection logic
function getRootFolderLi(selectedLi) {
  if (!selectedLi) return null;
  // DÜZELTME 2: Leaf ise Parent'a gitmeyi İPTAL ETTİK.
  // if (isFileLi(selectedLi)) { ... } bloğu kaldırıldı.
  return selectedLi;
}

function previewLines(items) {
  const max = 10;
  const head = items.slice(0, max).map(p => `- ${p}.<uzantı>`);
  const more = items.length > max ? `\n… (${items.length - max} dosya daha)` : "";
  return head.join("\n") + more;
}

function buildConfirmMessage(rootLabel, rootRaw, selectedLi, items, speedMode) {
  const strategy =
    "İndirme Stratejisi (Hedefli Gezinme):\n" +
    "1) Klasörler tek tek ve yalnızca gerektiği kadar açılır (gereksiz aç/kapa yok).\n" +
    "2) Downloads altında kök klasör oluşturulur; alt klasör yapısı korunur.\n" +
    "3) Dosyalar UYAP’ta görünen adlarla kaydedilir; uzantı otomatik korunur.\n" +
    "4) Her evrak için bir sonraki tıklamaya, önceki indirmenin başladığı sinyali gelince geçilir.\n" +
    "5) Hız modu popup’tan seçilir: Normal (önerilen) / FAST (gecikmesiz).\n";

  const output =
    "\nOluşturulacak Yapı (Ön İzleme):\n" +
    `Downloads/${rootLabel}/ ...\n` +
    previewLines(items);

  const diagnostics =
    "\nSeçim Bilgisi:\n" +
    `- Sağ tıklanan satır: "${sanitizeSegment(getOwnLabelText(selectedLi))}"\n` +
    `- Kök klasör (ham): "${rootRaw || '(boş)'}"\n` +
    `- Kök klasör (kayıt): "${rootLabel}"\n` +
    `- Dosya sayısı: ${items.length}\n` +
    `- Hız modu: ${speedMode === "fast" ? "FAST (gecikmesiz)" : "Normal (önerilen)"}\n`;

  const note =
    "\nNot: Bu eklenti resmî değildir ve UYAP/Adalet Bakanlığı ile bağlantısı yoktur.\n";

  return (
    `Seçilen Klasör: "${rootLabel}"\n` +
    `Tespit Edilen Dosya Sayısı: ${items.length}\n\n` +
    strategy +
    output +
    diagnostics +
    note +
    "\nİndirmeyi başlatmak istiyor musunuz?"
  );
}

function clickableForFile(li) {
  return (
    li.querySelector(":scope span.file") ||
    li.querySelector(":scope a") ||
    li.querySelector(":scope span") ||
    li
  );
}

function waitDownloadStarted() {
  if (__uyapCancelRequested) return Promise.reject(new Error("İptal edildi"));
  return new Promise((resolve, reject) => {
    downloadWaiter = resolve;
    // Safety timeout only
    setTimeout(() => {
      if (downloadWaiter) {
        downloadWaiter = null;
        reject(new Error("İndirme tetiklenemedi (emniyet zaman aşımı)."));
      }
    }, 300000);
  });
}

async function processDownload() {
  __uyapCancelRequested = false;

  // DÜZELTME 1: Sol tık / sağ tık seçiminde "freshness" engelini kaldırdık; son 60 sn içindeki tıklamalar kabul ediliyor.
  // const ctxFresh = lastContextInfo && lastContextInfo.t && (Date.now() - lastContextInfo.t < 120000);
  // Eski kodda burası "if (!ctxFresh) alert..." diyerek sol tıkla yapılan veya biraz bekleyen seçimleri engelliyordu.
  // Bu kontrolü kaldırdık.

  let selectedLi = null;
  // Öncelik: En taze tıklama (Sağ veya Sol). Hiç yoksa kullanıcı uyarılır.
  const now = Date.now();
  
  if (rightClickedLi && lastContextInfo && (now - lastContextInfo.t < 60000)) { // 1 dk tolerans
      selectedLi = rightClickedLi;
  } else if (leftClickedLi && lastLeftClickInfo && (now - lastLeftClickInfo.t < 60000)) { // 1 dk tolerans
      selectedLi = leftClickedLi;
  } 
  if (!selectedLi) {
    alert("Hata: Seçim algılanamadı. Lütfen indirmek istediğiniz klasör/evrak ismine sağ tıklayın (veya sol tıklayıp seçin), sonra eklentiyi çalıştırın.");
    return;
  }

  const rootFolderLi = getRootFolderLi(selectedLi);
  if (!rootFolderLi) {
    alert("Hata: Kök klasör bulunamadı.");
    return;
  }

  // Determine root label
  const rootRaw = getOwnLabelText(rootFolderLi);
  const rootLabel = sanitizeSegment(rootRaw);

  const results = { items: [], clickables: [] };
  const visited = new Set();

  // DÜZELTME 2 (Devamı): Tekil dosya ise tarama yapma, direkt ekle.
  if (isFileLi(rootFolderLi)) {
      const clickable = clickableForFile(rootFolderLi);
      results.items.push(rootLabel); // Tek dosya adı
      results.clickables.push(clickable);
  } else {
      // Klasör ise eskisi gibi tara
      try {
        await scanFolderDFS(rootFolderLi, [rootLabel], results, visited);
      } catch (e) {
        console.error("scan error", e);
      }
  }

  if (!results.items.length) {
    alert("Seçilen klasör altında indirilebilir evrak bulunamadı. (Klasörler hedefli şekilde açılmaya çalışıldı.)");
    return;
  }

  const speedMode = await getSpeedMode();
  __uyapCurrentTotal = results.items.length;
  __uyapCurrentRoot = rootLabel;
  __uyapCurrentSpeed = speedMode;

  // Modal: uzun listelerde bile alttaki özet satırı hep görünür.
  const previewText = `Downloads/${rootLabel}/ ...\n\n` + previewLines(results.items);
  const selectedLabel = sanitizeSegment(getOwnLabelText(selectedLi));
  const ok = await showConfirmModal({ rootLabel, rootRaw, selectedLabel, total: results.items.length, speedMode, previewText });
  if (!ok) return;

  // Send plan to background (renaming + folder structure)
  await new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "set_download_plan", items: results.items, rootLabel }, () => resolve());
  });


  

  // Sağ altta durum paneli (toast)
  showStatusStart(rootLabel, results.clickables.length, speedMode);
// Trigger downloads in the same order as plan items.
// Bir sonraki evrağa geçmeden önce: (1) indirme başladı sinyali, (2) hız sınırı beklemesi.
for (let i = 0; i < results.clickables.length; i++) {
    if (__uyapCancelRequested) break;
    const el = results.clickables[i];
    try {
      el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));
      await waitDownloadStarted();          // delay değil: browser "indirme başladı" dediğinde ilerler
      if (__uyapCancelRequested) break;
      await throttleWait(i, results.clickables.length, speedMode); // güvenli hız sınırı (rastgele aralık + periyodik mola)
    } catch (e) {
      console.error("download step error", e);
      // devam
    }
  }

  chrome.runtime.sendMessage({ action: "clear_download_plan" });
}