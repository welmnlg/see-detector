// Ad Blocker & Pop Up Blocker Free - content.js
let blockedCount = 0;
window.blockingEnabled = true;

const adKeywords = [
  "ad", "ads", "advert", "advertisement", "banner", "sponsor", "sponsored",
  "popup", "pop-up", "overlay", "promo", "promotion", "modal", "interstitial",
  "adsense", "adslot", "ad-slot", "ad-unit", "adcontainer", "ad-container",
  "dfp", "gpt", "prebid", "outbrain", "taboola", "revcontent"
];

const safeClasses = ["header", "nav", "navigation", "menu", "footer", "content", "main", "article"];

function isSafeElement(el) {
  const idClass = (el.id + " " + el.className).toLowerCase();
  return safeClasses.some(s => idClass.includes(s));
}

function isAdElement(el) {
  if (!el || !el.tagName) return false;
  if (isSafeElement(el)) return false;

  const idClass = (el.id + " " + el.className).toLowerCase();
  for (let kw of adKeywords) {
    if (idClass.includes(kw)) return true;
  }

  if (el.tagName === "IFRAME") {
    const src = el.src || "";
    if (src && !src.includes(location.hostname) &&
        (src.includes("ad") || src.includes("banner") || src.includes("doubleclick") ||
         src.includes("googlesyndication") || src.includes("adservice"))) {
      return true;
    }
  }

  try {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if ((style.position === "fixed" || style.position === "sticky") &&
        rect.width > 100 && rect.height > 50 &&
        (rect.bottom > window.innerHeight * 0.7 || rect.top < 10)) {
      const zIndex = parseInt(style.zIndex) || 0;
      if (zIndex > 100) return true;
    }
  } catch (e) {}

  return false;
}

function removeAd(el) {
  try {
    el.style.display = "none";
    el.remove();
    blockedCount++;
    chrome.storage.local.set({ blockedAds: blockedCount });
  } catch (e) {}
}

function scanDOM(node) {
  if (!node || !window.blockingEnabled) return;
  try {
    const elements = node.querySelectorAll("*");
    elements.forEach(el => {
      if (isAdElement(el)) removeAd(el);
    });
  } catch (e) {}
}

const observer = new MutationObserver(mutations => {
  if (!window.blockingEnabled) return;
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        if (isAdElement(node)) removeAd(node);
        else scanDOM(node);
      }
    });
  });
});

function init() {
  if (document.body) {
    scanDOM(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      scanDOM(document.body);
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

init();
