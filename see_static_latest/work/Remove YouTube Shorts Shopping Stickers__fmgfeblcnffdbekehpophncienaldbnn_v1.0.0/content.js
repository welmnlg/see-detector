const AD_SELECTORS = [
  '.ytOverlayProductStickerHost',
  'yt-product-sticker-view-model',
  'ytd-reel-shopping-shelf-renderer',
  'ytd-action-companion-ad-renderer',
  'ytd-overlay-ad-renderer',
  'ytd-ad-slot-renderer',
  'ytd-promoted-sparkles-web-renderer',
  'ytd-promoted-video-renderer',
  'ytd-compact-promoted-video-renderer',
  'yt-mealbar-promo-renderer',
  'ytd-banner-promo-renderer',
  'ytd-statement-banner-renderer',
  '#player-ads',
  '.ytp-ad-overlay-container',
  '.ytp-ad-text-overlay',
  '.ytp-ad-image-overlay',
];

const STICKER_SELECTORS = new Set([
  '.ytOverlayProductStickerHost',
  'yt-product-sticker-view-model',
  'ytd-reel-shopping-shelf-renderer',
]);

let enabled = true;

function isSticker(el) {
  return [...STICKER_SELECTORS].some(s => el.matches(s));
}

function removeAds(root = document) {
  AD_SELECTORS.forEach(selector => {
    root.querySelectorAll(selector).forEach(el => {
      if (isSticker(el)) chrome.runtime.sendMessage({ type: 'STICKER_BLOCKED' });
      el.remove();
    });
  });
}

const observer = new MutationObserver(mutations => {
  if (!enabled) return;
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (AD_SELECTORS.some(s => node.matches(s))) {
        if (isSticker(node)) chrome.runtime.sendMessage({ type: 'STICKER_BLOCKED' });
        node.remove();
      } else {
        removeAds(node);
      }
    }
  }
});

chrome.storage.local.get({ enabled: true }, ({ enabled: storedEnabled }) => {
  enabled = storedEnabled;
  if (enabled) {
    removeAds();
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !('enabled' in changes)) return;
  enabled = changes.enabled.newValue;
  if (enabled) {
    removeAds();
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
});
