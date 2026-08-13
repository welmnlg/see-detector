// Runs in ISOLATED world — relays transcript messages from page to background
(function () {
  'use strict';

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== 'SP_TRANSCRIPT_FOUND') return;

    const payload = event.data.payload;

    // Validate payload has the expected shape
    if (typeof payload?.url !== 'string' || !payload.url.includes('sharepoint.com')) return;

    chrome.runtime.sendMessage({
      type: 'TRANSCRIPT_FOUND',
      payload
    });
  });
})();
