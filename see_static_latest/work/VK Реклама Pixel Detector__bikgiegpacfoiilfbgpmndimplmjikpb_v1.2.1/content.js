/**
 * VK Ads Pixel Detector — content.js (v1.1 — CSP-safe)
 * ISOLATED world. Детектирует пиксель Top.Mail.Ru / VK Рекламы.
 *
 * ИСПРАВЛЕНИЯ v1.1:
 * - Убрана инжекция inline <script> (нарушала CSP сайтов → ошибки в консоли)
 * - window._tmr читается через injected.js (MAIN world) + CustomEvent bridge
 * - Защита от двойной инициализации
 * - Исправлен regex для извлечения ID (более точный паттерн)
 * - Исправлен MutationObserver (не срабатывает на собственные узлы)
 * - Guard от chrome.runtime errors при невалидном extension context
 */

(function () {
  'use strict';

  // Защита от двойной инициализации (повторный вызов content script)
  if (window.__vkpd_initialized) return;
  window.__vkpd_initialized = true;

  const TMR_SCRIPT_SRC  = 'top-fwz1.mail.ru';
  const TMR_COUNTER_URL = 'top-fwz1.mail.ru/counter';

  let lastResult = null;

  // ── 1. DOM-сканирование ────────────────────────────────────────────────────

  function scanDOM() {
    const found = [];

    // <script src="...top-fwz1.mail.ru...">
    document.querySelectorAll('script[src]').forEach(script => {
      if (script.src && script.src.includes(TMR_SCRIPT_SRC)) {
        found.push({ type: 'script_src', source: script.src, id: null });
      }
    });

    // inline <script> содержащий top-fwz1.mail.ru
    document.querySelectorAll('script:not([src])').forEach(script => {
      const text = script.textContent || '';
      if (!text.includes(TMR_SCRIPT_SRC)) return;

      // id: "3264298" / "id": "3264298" / id: 3264298
      const match = text.match(/\bid\b\s*:\s*["']?(\d{4,12})["']?/);
      found.push({
        type: 'inline_script',
        source: 'inline <script>',
        id: match ? match[1] : null
      });
    });

    // <noscript> с img top-fwz1.mail.ru/counter
    document.querySelectorAll('noscript').forEach(ns => {
      const content = ns.textContent || ns.innerHTML || '';
      if (!content.includes(TMR_COUNTER_URL)) return;
      const idMatch = content.match(/[?;&]id=(\d{4,12})/);
      found.push({
        type: 'noscript_img',
        source: 'noscript fallback img',
        id: idMatch ? idMatch[1] : null
      });
    });

    // <img src="...top-fwz1.mail.ru/counter...">
    document.querySelectorAll('img[src]').forEach(img => {
      if (!img.src || !img.src.includes(TMR_COUNTER_URL)) return;
      const idMatch = img.src.match(/[?;&]id=(\d{4,12})/);
      found.push({
        type: 'img_pixel',
        source: img.src,
        id: idMatch ? idMatch[1] : null
      });
    });

    return found;
  }

  // ── 2. Чтение window._tmr через MAIN world (CustomEvent bridge) ────────────

  function getTmrFromMainWorld() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        document.removeEventListener('__vkpd_tmr_response', handler);
        resolve([]);
      }, 800);

      function handler(event) {
        clearTimeout(timeout);
        document.removeEventListener('__vkpd_tmr_response', handler);
        try {
          const data = JSON.parse(event.detail || '[]');
          resolve(Array.isArray(data) ? data : []);
        } catch {
          resolve([]);
        }
      }

      document.addEventListener('__vkpd_tmr_response', handler);
      // Посылаем запрос в injected.js (MAIN world)
      document.dispatchEvent(new CustomEvent('__vkpd_tmr_request'));
    });
  }

  // ── 3. Основное сканирование ───────────────────────────────────────────────

  async function performScan() {
    const timestamp = new Date().toISOString();
    const url = window.location.href;

    const domResults = scanDOM();
    const tmrItems   = await getTmrFromMainWorld();

    const allIds = new Set();
    domResults.forEach(item => { if (item.id) allIds.add(item.id); });
    tmrItems.forEach(item => { if (item.id) allIds.add(item.id); });

    const pixelIds = Array.from(allIds);
    const detected = domResults.length > 0 || tmrItems.length > 0;

    const result = { detected, pixelIds, domResults, tmrItems, url, timestamp };
    lastResult = result;
    return result;
  }

  // ── 4. Отправка в background ───────────────────────────────────────────────

  // @param saveHistory — true только при явном сканировании пользователем
  function sendToBackground(result, saveHistory = false) {
    try {
      chrome.runtime.sendMessage({ action: 'pixelDetected', data: result, saveHistory })
        .catch(() => {});
    } catch (e) {
      // Extension context invalidated — расширение обновилось без перезагрузки страницы
    }
  }

  // ── 5. MutationObserver ────────────────────────────────────────────────────

  let rescanTimer = null;

  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let needRescan = false;

      outer:
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue; // только Element
          const name = node.nodeName;
          if (name === 'SCRIPT' || name === 'NOSCRIPT') {
            needRescan = true;
            break outer;
          }
          if (name === 'IMG' && node.src && node.src.includes(TMR_SCRIPT_SRC)) {
            needRescan = true;
            break outer;
          }
        }
      }

      if (!needRescan) return;
      clearTimeout(rescanTimer);
      rescanTimer = setTimeout(async () => {
        const result = await performScan();
        sendToBackground(result);
      }, 600);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // ── 6. Слушатели от popup/background ──────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scanPage') {
      performScan()
        .then(result => {
          // Явный запрос пользователя — обновляем иконку, НЕ дублируем saveHistory здесь.
          // saveHistory: true передаётся напрямую в background через pixelDetected,
          // и только после его завершения возвращаем ответ в popup — исключаем race condition.
          sendToBackground(result, true);
          // Даём background время записать историю до того, как popup вызовет loadHistory
          setTimeout(() => sendResponse({ success: true, data: result }), 150);
        })
        .catch(err  => sendResponse({ success: false, error: String(err) }));
      return true; // async
    }

    if (message.action === 'getLastResult') {
      sendResponse({ success: true, data: lastResult });
      return false;
    }
  });

  // ── 7. Инициализация ───────────────────────────────────────────────────────

  async function init() {
    if (document.readyState === 'loading') {
      await new Promise(resolve =>
        document.addEventListener('DOMContentLoaded', resolve, { once: true })
      );
    }

    // Пауза: даём injected.js время выполниться в MAIN world
    await new Promise(resolve => setTimeout(resolve, 150));

    const result = await performScan();
    sendToBackground(result);
    setupMutationObserver();
  }

  init();
})();
