/**
 * VK Ads Pixel Detector — popup.js
 * Fixes:
 *  1. chrome.runtime.lastError всегда очищается во всех колбэках
 *  2. Таймаут на каждый запрос к background/content — попап не "висит"
 *  3. DOMContentLoaded гарантирует готовность DOM до любых манипуляций
 *  4. Инициализация показывает нейтральный статус вместо "Сканирование..."
 */

'use strict';

let currentResult = null;
let currentTab    = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * chrome.runtime.sendMessage с таймаутом.
 * Без таймаута закрытый/спящий service worker роняет попап.
 */
function sendMessageWithTimeout(msg, timeoutMs = 3000) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try {
      chrome.runtime.sendMessage(msg, response => {
        clearTimeout(timer);
        // Обязательно читаем lastError — иначе Chrome бросает исключение в консоль
        void chrome.runtime.lastError;
        resolve(response ?? null);
      });
    } catch (e) {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

/**
 * chrome.tabs.sendMessage с таймаутом.
 */
function sendTabMessageWithTimeout(tabId, msg, timeoutMs = 3000) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try {
      chrome.tabs.sendMessage(tabId, msg, response => {
        clearTimeout(timer);
        void chrome.runtime.lastError;
        resolve(response ?? null);
      });
    } catch (e) {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}

function formatUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== '/' ? u.pathname : '');
  } catch {
    return url;
  }
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts;
  }
}

function typeLabel(type) {
  const map = {
    script_src:    'script[src]',
    inline_script: 'inline script',
    noscript_img:  'noscript img',
    img_pixel:     'img pixel',
    tmr_var:       '_tmr var'
  };
  return map[type] || type;
}

// ─── DOM refs (инициализируем внутри init, после DOMContentLoaded) ────────────

let statusCard, statusDot, statusText, statusUrl;
let pixelSection, pixelCount, pixelList;
let detailsSection, detailsContent, detailsList, toggleDetails;
let historyList;
let btnScan, btnExport, btnClearHistory;

function initDomRefs() {
  statusCard      = document.getElementById('statusCard');
  statusDot       = document.getElementById('statusDot');
  statusText      = document.getElementById('statusText');
  statusUrl       = document.getElementById('statusUrl');
  pixelSection    = document.getElementById('pixelSection');
  pixelCount      = document.getElementById('pixelCount');
  pixelList       = document.getElementById('pixelList');
  detailsSection  = document.getElementById('detailsSection');
  detailsContent  = document.getElementById('detailsContent');
  detailsList     = document.getElementById('detailsList');
  toggleDetails   = document.getElementById('toggleDetails');
  historyList     = document.getElementById('historyList');
  btnScan         = document.getElementById('btnScan');
  btnExport       = document.getElementById('btnExport');
  btnClearHistory = document.getElementById('btnClearHistory');
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderStatus(result) {
  statusCard.className = 'status-card ' + (result.detected ? 'found' : 'not-found');
  statusDot.className  = 'status-dot '  + (result.detected ? 'found' : 'not-found');
  statusText.textContent = result.detected
    ? '✓ Пиксель VK Ads обнаружен'
    : '✗ Пиксель не найден';
  statusUrl.textContent = formatUrl(result.url || '');
}

function renderPixels(result) {
  const ids = result.pixelIds || [];
  if (ids.length > 0) {
    pixelSection.style.display = 'block';
    pixelCount.textContent = ids.length;
    pixelList.innerHTML = '';
    ids.forEach(id => {
      const item = document.createElement('div');
      item.className = 'pixel-item';

      const idEl = document.createElement('span');
      idEl.className = 'pixel-id';
      idEl.textContent = `ID: ${id}`;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'pixel-copy';
      copyBtn.textContent = 'Копировать';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(id).then(() => showToast(`ID ${id} скопирован`));
      });

      item.appendChild(idEl);
      item.appendChild(copyBtn);
      pixelList.appendChild(item);
    });
  } else {
    pixelSection.style.display = 'none';
  }
}

function renderDetails(result) {
  const domResults = result.domResults || [];
  const tmrItems   = result.tmrItems   || [];

  const allDetails = [
    ...domResults.map(d => ({ ...d })),
    ...tmrItems.map(t => ({ type: 'tmr_var', source: `_tmr item: id=${t.id}`, id: t.id }))
  ];

  if (allDetails.length > 0) {
    detailsSection.style.display = 'block';
    detailsList.innerHTML = '';
    allDetails.forEach(d => {
      const row = document.createElement('div');
      row.className = 'detail-row';

      const typeEl = document.createElement('span');
      typeEl.className = 'detail-type';
      typeEl.textContent = typeLabel(d.type);

      const srcEl = document.createElement('span');
      srcEl.className = 'detail-source';
      srcEl.textContent = d.source || '';
      srcEl.title = d.source || '';

      row.appendChild(typeEl);
      row.appendChild(srcEl);
      detailsList.appendChild(row);
    });
  } else {
    detailsSection.style.display = 'none';
  }
}

function renderExportBtn(result) {
  btnExport.style.display =
    (result.detected || (result.pixelIds && result.pixelIds.length > 0))
      ? 'flex' : 'none';
}

function renderResult(result) {
  if (!result) return;
  currentResult = result;
  renderStatus(result);
  renderPixels(result);
  renderDetails(result);
  renderExportBtn(result);
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    historyList.innerHTML = '<div class="empty-state">История пуста</div>';
    return;
  }
  historyList.innerHTML = '';
  history.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';

    const urlEl = document.createElement('span');
    urlEl.className = 'history-url';
    urlEl.textContent = formatUrl(item.url || '');
    urlEl.title = item.url || '';

    const meta = document.createElement('div');
    meta.className = 'history-meta';

    const statusEl = document.createElement('span');
    statusEl.className = 'history-status ' + (item.detected ? 'found' : 'not-found');
    statusEl.textContent = item.detected
      ? `✓ ${item.pixelIds?.length || 1} пикс.`
      : '✗';

    const timeEl = document.createElement('span');
    timeEl.className = 'history-time';
    timeEl.textContent = formatTime(item.timestamp);

    meta.appendChild(statusEl);
    meta.appendChild(timeEl);
    el.appendChild(urlEl);
    el.appendChild(meta);
    historyList.appendChild(el);
  });
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportCSV(history) {
  const rows = [['URL', 'Timestamp', 'Detected', 'Pixel IDs']];
  (history || []).forEach(item => {
    rows.push([
      item.url || '',
      item.timestamp || '',
      item.detected ? 'yes' : 'no',
      (item.pixelIds || []).join(' | ')
    ]);
  });
  if (currentResult) {
    const alreadyIn = (history || []).some(h => h.timestamp === currentResult.timestamp);
    if (!alreadyIn) {
      rows.push([
        currentResult.url || '',
        currentResult.timestamp || '',
        currentResult.detected ? 'yes' : 'no',
        (currentResult.pixelIds || []).join(' | ')
      ]);
    }
  }
  const csvContent = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vk_pixel_detector_${new Date().toISOString().slice(0, 10)}.csv`;
  link.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 100));
  link.click();
  showToast('CSV экспортирован');
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

async function triggerScan() {
  if (!currentTab) return;

  btnScan.disabled = true;
  const icon = btnScan.querySelector('svg');
  if (icon) icon.classList.add('spinning');
  statusText.textContent = 'Сканирование...';
  statusDot.className = 'status-dot';

  const response = await sendTabMessageWithTimeout(
    currentTab.id, { action: 'scanPage' }, 5000
  );

  if (response?.success && response.data) {
    renderResult(response.data);
    await loadHistory();
  } else {
    statusText.textContent = 'Нет данных со страницы';
    statusDot.className = 'status-dot not-found';
  }

  if (icon) icon.classList.remove('spinning');
  btnScan.disabled = false;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function loadHistory() {
  const response = await sendMessageWithTimeout({ action: 'getHistory' });
  renderHistory(response?.data || []);
  return response?.data || [];
}

async function init() {
  initDomRefs();

  // Сразу показываем нейтральный статус — попап виден пользователю
  statusText.textContent = 'Ожидание данных...';
  statusDot.className = 'status-dot';

  // Получить текущую вкладку.
  // currentWindow: true ненадёжно в Vivaldi (боковые панели, tab stacks),
  // поэтому используем lastFocusedWindow как фолбек.
  let tab = null;
  try {
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length) {
      tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    }
    tab = tabs[0] ?? null;
  } catch (e) {}
  currentTab = tab;

  if (tab?.url) {
    statusUrl.textContent = formatUrl(tab.url);
  }

  // Расширение недоступно на системных страницах
  const restrictedUrl = tab?.url && (
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('chrome-extension://') ||
    tab.url.startsWith('edge://') ||
    tab.url.startsWith('vivaldi://') ||
    tab.url.startsWith('about:')
  );

  if (restrictedUrl) {
    statusText.textContent = 'Недоступно на этой странице';
    statusDot.className = 'status-dot not-found';
    btnScan.disabled = true;
    await loadHistory();
    return;
  }

  // Загрузить последний результат из background
  if (tab?.id) {
    const bgRes = await sendMessageWithTimeout({ action: 'getTabResult', tabId: tab.id });

    if (bgRes?.data) {
      renderResult(bgRes.data);
    } else {
      // Попробовать запросить у content script
      const csRes = await sendTabMessageWithTimeout(tab.id, { action: 'getLastResult' });
      if (csRes?.data) {
        renderResult(csRes.data);
      } else {
        // Данных нет — подсказать пользователю
        statusText.textContent = 'Нажмите «Проверить страницу»';
        statusDot.className = 'status-dot not-found';
      }
    }
  }

  await loadHistory();

  // ─── Event listeners ──────────────────────────────────────────────────────

  btnScan.addEventListener('click', triggerScan);

  btnExport.addEventListener('click', async () => {
    const history = await loadHistory();
    exportCSV(history);
  });

  btnClearHistory.addEventListener('click', async () => {
    await sendMessageWithTimeout({ action: 'clearHistory' });
    renderHistory([]);
    showToast('История очищена');
  });

  toggleDetails.addEventListener('click', () => {
    const isOpen = detailsContent.style.display !== 'none';
    detailsContent.style.display = isOpen ? 'none' : 'flex';
    toggleDetails.classList.toggle('open', !isOpen);
  });
}

// Гарантируем, что DOM полностью готов перед стартом
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
