// Runs in MAIN world — patches fetch and XHR to intercept transcript responses
(function () {
  'use strict';

  const MSG_TYPE = 'SP_TRANSCRIPT_FOUND';

  function isTranscriptApiUrl(url) {
    return (
      url.includes('sharepoint.com') &&
      url.includes('_api/v2.1/drives/') &&
      url.includes('/items/') &&
      url.includes('transcripts')
    );
  }

  function extractTranscripts(json) {
    const transcripts = json?.media?.transcripts;
    if (!Array.isArray(transcripts)) return;

    for (const transcript of transcripts) {
      if (transcript.temporaryDownloadUrl) {
        window.postMessage({
          type: MSG_TYPE,
          payload: {
            url: transcript.temporaryDownloadUrl,
            displayName: transcript.displayName || 'transcript.json',
            language: transcript.languageTag || '',
            size: transcript.size || 0,
            source: transcript.source || ''
          }
        }, window.location.origin);
      }
    }
  }

  // Patch fetch
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    if (isTranscriptApiUrl(url)) {
      try {
        const cloned = response.clone();
        const json = await cloned.json();
        extractTranscripts(json);
      } catch (_) {
        // Ignore parse errors
      }
    }

    return response;
  };

  // Patch XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._spInterceptUrl = typeof url === 'string' ? url : '';
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (isTranscriptApiUrl(this._spInterceptUrl)) {
      this.addEventListener('load', function () {
        try {
          const json = JSON.parse(this.responseText);
          extractTranscripts(json);
        } catch (_) {
          // Ignore parse errors
        }
      });
    }
    return originalSend.apply(this, args);
  };
})();
