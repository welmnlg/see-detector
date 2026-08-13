/**
 * VK Ads Pixel Detector — background.js
 * Service Worker: управляет иконкой, badge и хранением истории
 */

'use strict';

const HISTORY_KEY = 'scan_history';
const MAX_HISTORY = 10;

/**
 * Обновить иконку и badge для вкладки
 */
async function updateTabIcon(tabId, detected, pixelCount) {
  try {
    // Badge
    await chrome.action.setBadgeText({
      tabId,
      text: detected ? String(pixelCount) : ''
    });

    await chrome.action.setBadgeBackgroundColor({
      tabId,
      color: detected ? '#00C853' : '#9E9E9E'
    });

    // Иконка (зелёная или серая)
    const suffix = detected ? 'green' : 'gray';
    await chrome.action.setIcon({
      tabId,
      path: {
        16: `icons/icon16_${suffix}.png`,
        48: `icons/icon48_${suffix}.png`,
        128: `icons/icon128_${suffix}.png`
      }
    });

    // Title
    await chrome.action.setTitle({
      tabId,
      title: detected
        ? `VK Ads Pixel Detector: найдено ${pixelCount} пиксел${pixelCount === 1 ? 'ь' : 'ей'}`
        : 'VK Ads Pixel Detector: пиксель не найден'
    });
  } catch (e) {
    // Вкладка могла закрыться
  }
}

/**
 * Сохранить запись в историю
 */
async function saveToHistory(entry) {
  try {
    const stored = await chrome.storage.local.get(HISTORY_KEY);
    let history = stored[HISTORY_KEY] || [];

    history.unshift({
      url: entry.url,
      timestamp: entry.timestamp,
      detected: entry.detected,
      pixelIds: entry.pixelIds || []
    });

    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }

    await chrome.storage.local.set({ [HISTORY_KEY]: history });
  } catch (e) {
    console.error('[VKPixelDetector] saveToHistory error:', e);
  }
}

/**
 * Сохранить последний результат по tabId
 */
async function saveTabResult(tabId, result) {
  try {
    const key = `tab_result_${tabId}`;
    await chrome.storage.session.set({ [key]: result });
  } catch (e) {
    // session storage может быть недоступен
    try {
      await chrome.storage.local.set({ [`tab_result_${tabId}`]: result });
    } catch (_) {}
  }
}

/**
 * Получить последний результат по tabId
 */
async function getTabResult(tabId) {
  try {
    const key = `tab_result_${tabId}`;
    const stored = await chrome.storage.session.get(key);
    return stored[key] || null;
  } catch (e) {
    try {
      const stored = await chrome.storage.local.get(`tab_result_${tabId}`);
      return stored[`tab_result_${tabId}`] || null;
    } catch (_) {
      return null;
    }
  }
}

/**
 * Обработка сообщений
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pixelDetected') {
    const result = message.data;
    const tabId = sender.tab?.id;

    (async () => {
      if (tabId) {
        const pixelCount = result.pixelIds?.length || (result.detected ? 1 : 0);
        await updateTabIcon(tabId, result.detected, pixelCount);
        await saveTabResult(tabId, result);
      }

      // saveHistory: true — только при явном запросе пользователя (кнопка "Проверить")
      // автосканирование при загрузке страницы НЕ пишет в историю
      if (message.saveHistory) {
        await saveToHistory(result);
      }

      sendResponse({ success: true });
    })();

    return true; // держим канал открытым для async sendResponse
  }

  if (message.action === 'getTabResult') {
    const tabId = message.tabId;
    getTabResult(tabId).then(result => {
      sendResponse({ success: true, data: result });
    });
    return true;
  }

  if (message.action === 'getHistory') {
    chrome.storage.local.get(HISTORY_KEY).then(stored => {
      sendResponse({ success: true, data: stored[HISTORY_KEY] || [] });
    });
    return true;
  }

  if (message.action === 'clearHistory') {
    chrome.storage.local.remove(HISTORY_KEY).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

/**
 * Сбрасываем иконку при смене вкладки/обновлении страницы
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    updateTabIcon(tabId, false, 0);
  }
});
