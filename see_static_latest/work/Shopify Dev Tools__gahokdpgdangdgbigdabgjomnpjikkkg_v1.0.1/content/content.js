// content.js — Content script bridge between page and extension
(function () {
  'use strict';

  let shopifyData = null;

  // Listen for data from inject.js
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'SHOPIFY_DEV_TOOLS_DATA') {
      shopifyData = event.data.payload;
    }
  });

  // Inject the page-context script
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/inject.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_SHOPIFY_DATA') {
      if (shopifyData) {
        sendResponse(shopifyData);
      } else {
        // Re-inject and wait briefly
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('content/inject.js');
        s.onload = () => s.remove();
        (document.head || document.documentElement).appendChild(s);

        // Wait for response
        const timeout = setTimeout(() => {
          sendResponse({ isShopify: false });
        }, 2000);

        const handler = (event) => {
          if (event.source !== window) return;
          if (event.data && event.data.type === 'SHOPIFY_DEV_TOOLS_DATA') {
            clearTimeout(timeout);
            window.removeEventListener('message', handler);
            shopifyData = event.data.payload;
            sendResponse(shopifyData);
          }
        };
        window.addEventListener('message', handler);
      }
      return true; // async response
    }
  });
})();
