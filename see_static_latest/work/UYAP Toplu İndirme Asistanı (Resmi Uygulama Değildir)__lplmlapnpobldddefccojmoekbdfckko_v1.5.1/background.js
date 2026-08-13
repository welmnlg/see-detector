// UYAP Toplu İndirme Asistanı (Resmî Uygulama Değildir)
//
// Bu uzantı UYAP sayfasında evrakları açarak indirmeyi tetikler.
// İndirilen dosyaların klasör/yol ve adlandırması Chrome Downloads API ile yapılır.

const PLAN_TTL_MS = 20 * 60 * 1000; // 20 dk (emniyet)
let activePlan = null; // { items:[basePathNoExt], i, createdAt, root, sourceTabId }

function now() { return Date.now(); }
function fresh(p) {
  return p && (now() - p.createdAt) <= PLAN_TTL_MS && Array.isArray(p.items) && p.items.length > 0;
}

function setPlan(sourceTabId, items, rootLabel) {
  activePlan = {
    items: items || [],
    i: 0,
    createdAt: now(),
    root: rootLabel || "",
    sourceTabId: typeof sourceTabId === "number" ? sourceTabId : null,
    downloadIds: [],
    canceled: false
  };
}

function clearPlan() { activePlan = null; }

function notifyProgress() {
  try {
    if (!fresh(activePlan)) return;
    if (typeof activePlan.sourceTabId !== "number") return;

    chrome.tabs.sendMessage(activePlan.sourceTabId, {
      action: "download_progress",
      index: activePlan.i,
      total: activePlan.items.length
    });
  } catch (_) {}
}

function notifyComplete() {
  try {
    if (!fresh(activePlan)) return;
    if (typeof activePlan.sourceTabId !== "number") return;

    chrome.tabs.sendMessage(activePlan.sourceTabId, {
      action: "download_complete",
      total: activePlan.items.length
    });

    notifySystem("UYAP İndirici", `İndirme tamamlandı: ${activePlan.items.length} dosya için indirme tetiklendi.`);

  } catch (_) {}
}


function notifySystem(title, message) {
  try {
    chrome.notifications.create("", {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: title,
      message: message
    });
  } catch (_) {}
}

function notifyCanceled(done, total) {
  try {
    if (fresh(activePlan) && typeof activePlan.sourceTabId === "number") {
      chrome.tabs.sendMessage(activePlan.sourceTabId, {
        action: "download_canceled",
        done: done,
        total: total
      });
    }
  } catch (_) {}
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "download-uyap-files",
    title: "Bu Klasördeki Dosyaları İndir",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "download-uyap-files") {
    chrome.tabs.sendMessage(tab.id, { action: "trigger_download" });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  try {
    if (msg && msg.action === "set_download_plan") {
      const tabId = sender?.tab?.id ?? msg.tabId;
      setPlan(tabId, msg.items || [], msg.rootLabel || "");
      sendResponse({ ok: true });
      return true;
    }
    if (msg && msg.action === "cancel_download_plan") {
      if (fresh(activePlan)) {
        const done = activePlan.i;
        const total = activePlan.items.length;
        activePlan.canceled = true;
        // Aktif indirmeleri mümkünse iptal et
        const ids = Array.isArray(activePlan.downloadIds) ? activePlan.downloadIds.slice() : [];
        ids.forEach((id) => {
          try { chrome.downloads.cancel(id); } catch (_) {}
        });
        notifyCanceled(done, total);
        notifySystem("UYAP İndirici", `İndirme durduruldu: ${done}/${total}`);
        clearPlan();
      }
      sendResponse({ ok: true });
      return true;
    }
    if (msg && msg.action === "clear_download_plan") {
      clearPlan();
      sendResponse({ ok: true });
      return true;
    }
  } catch (e) {
    sendResponse({ ok: false, error: String(e) });
    return true;
  }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  try {
    // Plan yoksa: dokunma
    if (!fresh(activePlan)) { suggest(); return; }
    if (activePlan && activePlan.canceled) { suggest(); return; }

    // Sadece UYAP indirmelerine müdahale et (yanlışlıkla başka indirmeyi rename etmeyelim)
    const url = String(downloadItem.url || "");
    if (!url.includes(".uyap.gov.tr")) { suggest(); return; }

    if (activePlan.i >= activePlan.items.length) { suggest(); return; }

    try { if (fresh(activePlan)) activePlan.downloadIds.push(downloadItem.id); } catch (_) {}

    // Planned base path (no ext): "Root/Sub/Name"
    let basePath = activePlan.items[activePlan.i];
    activePlan.i += 1;

    // Extension: default filename'dan alınır (en güvenilir)
    let ext = "";
    const def = downloadItem.filename || "";
    const m = def.match(/(\.[a-z0-9]+)$/i);
    if (m) ext = m[1];

    let finalPath = basePath;
    if (ext && !finalPath.toLowerCase().endsWith(ext.toLowerCase())) {
      finalPath = finalPath + ext;
    }

    suggest({ filename: finalPath, conflictAction: "uniquify" });

    // Content tarafına: "1 indirme başladı" sinyali (sonraki evrağa geçsin)
    notifyProgress();

    // Bittiğinde otomatik temizle
    if (activePlan.i >= activePlan.items.length) {
      notifyComplete();
      setTimeout(() => clearPlan(), 2000);
    }

  } catch (_) {
    try { suggest(); } catch (_) {}
  }
});
