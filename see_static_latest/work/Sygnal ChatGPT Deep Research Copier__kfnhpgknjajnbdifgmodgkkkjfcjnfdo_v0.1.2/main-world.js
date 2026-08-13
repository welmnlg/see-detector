/**
 * Main world script for extracting citation URLs from React fiber tree.
 * Runs in the web-sandbox frame's MAIN world (via manifest "world": "MAIN").
 *
 * The actual content lives in a child about:blank iframe. Since both frames
 * are same-origin, this script can access the child frame's DOM and React fiber.
 *
 * Communication: postMessage from child frame content script → this script → postMessage back.
 */
(function () {
  function extractCitations(doc) {
    var citations = [];
    var seen = {};
    var sups = doc.querySelectorAll('sup[data-citation-index]');

    for (var i = 0; i < sups.length; i++) {
      var sup = sups[i];
      var index = parseInt(sup.getAttribute('data-citation-index'));
      if (isNaN(index) || seen[index]) continue;
      seen[index] = true;

      var fiberKey = Object.keys(sup).find(function (k) {
        return k.indexOf('__reactFiber') === 0;
      });
      if (!fiberKey) continue;

      var fiber = sup[fiberKey];
      var url = null;
      var title = null;

      for (var d = 0; d < 10 && fiber; d++) {
        var item = fiber.memoizedProps && fiber.memoizedProps.item;
        if (item && item.url) {
          url = item.url.replace(/#:~:text=.*$/, '');
          title = (item.reference && item.reference.title) || item.attribution || '';
          break;
        }
        fiber = fiber.return;
      }

      if (url) {
        citations.push({ number: index, text: title || url, url: url });
      }
    }

    citations.sort(function (a, b) { return a.number - b.number; });
    return citations;
  }

  // Listen for requests from child frames (content script in about:blank)
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'DR_EXTRACT_CITATIONS_FIBER') {
      // Try extracting from all child frames (same-origin access)
      var citations = [];
      for (var i = 0; i < window.frames.length; i++) {
        try {
          var childDoc = window.frames[i].document;
          citations = extractCitations(childDoc);
          if (citations.length > 0) break;
        } catch (e) {
          // Cross-origin child, skip
        }
      }

      // Also try current document as fallback
      if (citations.length === 0) {
        citations = extractCitations(document);
      }

      // Send results back to the requesting frame
      event.source.postMessage({
        type: 'DR_CITATIONS_FIBER_RESULT',
        citations: citations
      }, '*');
    }
  });

  // Also support same-frame DOM event (for when script runs in the content frame)
  document.addEventListener('dr-extract-citations', function () {
    var citations = extractCitations(document);
    document.dispatchEvent(
      new CustomEvent('dr-citations-result', { detail: JSON.stringify(citations) })
    );
  });
})();
