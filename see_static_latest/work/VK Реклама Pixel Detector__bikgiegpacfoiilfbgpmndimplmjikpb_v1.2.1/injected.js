/**
 * VK Ads Pixel Detector — injected.js
 * Запускается в MAIN world (контекст страницы), читает window._tmr
 * Общается с content.js через CustomEvent
 */
(function () {
  'use strict';

  function readTmr() {
    const data = [];
    try {
      if (window._tmr && Array.isArray(window._tmr)) {
        window._tmr.forEach(function (item) {
          if (item && item.id) {
            data.push({ id: String(item.id), type: item.type || 'unknown' });
          }
        });
      }
    } catch (e) {
      // silent
    }
    return data;
  }

  // Отправляем данные в ISOLATED world через CustomEvent
  function dispatch(payload) {
    document.dispatchEvent(
      new CustomEvent('__vkpd_tmr_response', { detail: JSON.stringify(payload) })
    );
  }

  // Слушаем запрос от content.js
  document.addEventListener('__vkpd_tmr_request', function () {
    dispatch(readTmr());
  }, { once: false });
})();
