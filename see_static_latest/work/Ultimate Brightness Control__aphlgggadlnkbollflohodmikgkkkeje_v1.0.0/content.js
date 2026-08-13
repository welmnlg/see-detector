const STORAGE_KEYS = [
  "brightness",
  "globalBrightness",
  "siteSettings",
  "globalDisabled",
  "disabledSites",
];

const overlay = createOverlay();
const hostname = BrightnessSettings.getHostnameFromUrl(window.location.href);
let settings = BrightnessSettings.normalizeStoredSettings({});

function createOverlay() {
  const element = document.createElement("div");
  element.id = "ultimate-brightness-overlay";
  element.setAttribute("aria-hidden", "true");
  element.style.cssText = [
    "position: fixed !important",
    "inset: 0 !important",
    "width: 100vw !important",
    "height: 100vh !important",
    "pointer-events: none !important",
    "z-index: 2147483647 !important",
    "background: rgba(0, 0, 0, 0) !important",
    "transition: background-color 0.15s ease-out !important",
  ].join(";");
  return element;
}

function readStorage() {
  chrome.storage.local.get(STORAGE_KEYS, (result) => {
    settings = BrightnessSettings.normalizeStoredSettings(result);
    applyOverlay();
  });
}

function isTopFrame() {
  try {
    return window.top === window;
  } catch (error) {
    return false;
  }
}

function isThisFrameFullscreen() {
  if (document.fullscreenElement) return true;
  if (isTopFrame()) return false;
  try {
    const topFullscreen = window.top.document.fullscreenElement;
    if (topFullscreen && topFullscreen.tagName === "IFRAME") {
      return topFullscreen.contentWindow === window;
    }
  } catch (e) {}
  return false;
}

function shouldShowOverlay(effect) {
  if (effect.disabled) return false;
  return isTopFrame() || isThisFrameFullscreen();
}

function getOverlayParent() {
  return document.fullscreenElement || document.documentElement || document.body;
}

function ensureOverlayParent() {
  const targetParent = getOverlayParent();
  if (!targetParent) return;
  if (overlay.parentElement !== targetParent) {
    targetParent.appendChild(overlay);
  }
}

function applyOverlay() {
  ensureOverlayParent();

  const effect = BrightnessSettings.getEffectiveSettings({
    hostname,
    settings,
  });

  if (!shouldShowOverlay(effect)) {
    overlay.style.setProperty("background", "rgba(0,0,0,0)", "important");
    return;
  }

  if (effect.brightness > 100) {
    // Boost mode: white overlay simulates brightness increase
    // 100 → opacity 0, 200 → opacity 0.5
    const opacity = Math.min((effect.brightness - 100) / 200, 0.5);
    overlay.style.setProperty("background", `rgba(255,255,255,${opacity.toFixed(3)})`, "important");
  } else {
    // Dim mode: black overlay
    const opacity = Math.min((100 - effect.brightness) / 100, 0.9);
    overlay.style.setProperty("background", `rgba(0,0,0,${Math.max(opacity, 0).toFixed(3)})`, "important");
  }
}

document.addEventListener("fullscreenchange", () => {
  applyOverlay();
});

if (isTopFrame()) {
  document.addEventListener("fullscreenchange", () => {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage("__ubc_fullscreenchange__", "*");
      } catch (e) {}
    });
  });
}

window.addEventListener("message", (event) => {
  if (event.data === "__ubc_fullscreenchange__") {
    applyOverlay();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (!Object.keys(changes).some((key) => STORAGE_KEYS.includes(key))) return;
  readStorage();
});

function safeInit() {
  if (typeof BrightnessSettings === "undefined") {
    setTimeout(safeInit, 50);
    return;
  }
  ensureOverlayParent();
  readStorage();
}

safeInit();
