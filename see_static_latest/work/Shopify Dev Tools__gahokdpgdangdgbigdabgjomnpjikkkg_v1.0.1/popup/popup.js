// popup.js — Extension popup logic
(function () {
  'use strict';

  let data = null; // Shopify data from content script

  // ── Helpers ──

  function getMyShopifyDomain() {
    // Prefer Shopify.shop (always myshopify domain)
    if (data && data.shop) return data.shop;
    // Fallback: extract from current URL if on myshopify.com
    try {
      const url = new URL(data.href);
      if (url.hostname.endsWith('.myshopify.com')) return url.hostname;
      return url.hostname; // custom domain — admin URLs still need myshopify domain
    } catch (e) {
      return null;
    }
  }

  function getThemeId() {
    if (!data) return null;
    // First check URL param
    try {
      const url = new URL(data.href);
      const paramId = url.searchParams.get('preview_theme_id');
      if (paramId) return paramId;
    } catch (e) { /* ignore */ }
    return data.themeId || null;
  }

  function getPreviewUrl() {
    if (!data) return null;
    const themeId = getThemeId();
    if (!themeId) return data.href;
    try {
      const url = new URL(data.href);
      url.searchParams.set('preview_theme_id', themeId);
      return url.toString();
    } catch (e) {
      return data.href;
    }
  }

  function getAdminBase() {
    const shop = getMyShopifyDomain();
    if (!shop) return null;
    // Ensure it's the myshopify domain for admin URLs
    const domain = shop.includes('.myshopify.com') ? shop : shop;
    return `https://${domain}/admin`;
  }

  function getCustomizerUrl() {
    const base = getAdminBase();
    const themeId = getThemeId();
    if (!base || !themeId) return null;
    return `${base}/themes/${themeId}/editor`;
  }

  function getAdminUrl() {
    const base = getAdminBase();
    if (!base) return null;
    const themeId = getThemeId();

    if (!data) return base;

    const pageType = (data.pageType || '').toLowerCase();
    const resourceId = data.resourceId;

    switch (pageType) {
      case 'product':
        return resourceId ? `${base}/products/${resourceId}` : base;
      case 'collection':
        return resourceId ? `${base}/collections/${resourceId}` : base;
      case 'article':
        return resourceId ? `${base}/articles/${resourceId}` : base;
      case 'page':
        return resourceId ? `${base}/pages/${resourceId}` : base;
      case 'blog':
        return resourceId ? `${base}/blogs/${resourceId}` : base;
      case 'home':
        return themeId ? `${base}/themes/${themeId}/editor` : base;
      default:
        return base;
    }
  }

  function getPageCustomizerUrl() {
    const custUrl = getCustomizerUrl();
    if (!custUrl || !data) return custUrl;

    const pageType = (data.pageType || '').toLowerCase();
    const handle = data.resourceHandle;
    const blogHandle = data.blogHandle;

    switch (pageType) {
      case 'product':
        return handle ? `${custUrl}?previewPath=/products/${handle}` : custUrl;
      case 'collection':
        return handle ? `${custUrl}?previewPath=/collections/${handle}` : custUrl;
      case 'page':
        return handle ? `${custUrl}?previewPath=/pages/${handle}` : custUrl;
      case 'blog':
        return blogHandle ? `${custUrl}?previewPath=/blogs/${blogHandle}` : custUrl;
      case 'article':
        if (blogHandle && handle) {
          return `${custUrl}?previewPath=/blogs/${blogHandle}/${handle}`;
        }
        return custUrl;
      default:
        return custUrl;
    }
  }

  function generateChangelog() {
    const themeId = getThemeId();
    const themeName = (data && data.themeName) || 'Unknown';
    const previewUrl = getPreviewUrl();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return [
      `Theme: ${themeName} (ID: ${themeId || 'N/A'})`,
      `Preview: ${previewUrl || 'N/A'}`,
    ].join('\n');
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  }

  function flashSuccess(btn) {
    const feedback = btn.querySelector('.btn-feedback');
    btn.classList.add('success');
    if (feedback) feedback.classList.remove('hidden');
    setTimeout(() => {
      btn.classList.remove('success');
      if (feedback) feedback.classList.add('hidden');
    }, 1200);
  }

  // ── UI Update ──

  function updateUI() {
    const errorEl = document.getElementById('error-state');
    const actionsEl = document.getElementById('actions');
    const infoEl = document.getElementById('store-info');

    if (!data || !data.isShopify) {
      errorEl.classList.remove('hidden');
      actionsEl.classList.add('hidden');
      infoEl.classList.add('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    actionsEl.classList.remove('hidden');
    infoEl.classList.remove('hidden');

    document.getElementById('store-name').textContent = data.shop || '—';
    document.getElementById('theme-name').textContent = data.themeName || '—';
    document.getElementById('theme-id').textContent = getThemeId() || '—';

    // Disable buttons that need missing data
    const themeId = getThemeId();
    document.getElementById('btn-copy-customizer').disabled = !themeId;
    document.getElementById('btn-open-customizer').disabled = !themeId;
    document.getElementById('btn-open-edit-code').disabled = !themeId;
    document.getElementById('btn-open-page-customizer').disabled = !themeId;
    document.getElementById('btn-copy-theme-name').disabled = !data.themeName;
  }

  // ── Button Handlers ──

  function bindButtons() {
    document.getElementById('btn-copy-preview').addEventListener('click', async function () {
      const url = getPreviewUrl();
      if (url && await copyText(url)) flashSuccess(this);
    });

    document.getElementById('btn-copy-theme-name').addEventListener('click', async function () {
      if (data && data.themeName && await copyText(data.themeName)) flashSuccess(this);
    });

    document.getElementById('btn-copy-customizer').addEventListener('click', async function () {
      const url = getCustomizerUrl();
      if (url && await copyText(url)) flashSuccess(this);
    });

    document.getElementById('btn-open-customizer').addEventListener('click', function () {
      const url = getCustomizerUrl();
      if (url) chrome.tabs.create({ url });
    });

    document.getElementById('btn-open-admin').addEventListener('click', function () {
      const url = getAdminUrl();
      if (url) chrome.tabs.create({ url });
    });

    document.getElementById('btn-open-edit-code').addEventListener('click', function () {
      const base = getAdminBase();
      const themeId = getThemeId();
      if (base && themeId) chrome.tabs.create({ url: `${base}/themes/${themeId}` });
    });

    document.getElementById('btn-open-page-customizer').addEventListener('click', function () {
      const url = getPageCustomizerUrl();
      if (url) chrome.tabs.create({ url });
    });

    document.getElementById('btn-changelog').addEventListener('click', async function () {
      const text = generateChangelog();
      if (await copyText(text)) flashSuccess(this);
    });
  }

  // ── On-demand injection for custom domains (activeTab + scripting) ──

  function injectAndRetry(tabId) {
    // Step 1: Inject inject.js in MAIN world so it can read window.Shopify
    chrome.scripting.executeScript(
      { target: { tabId: tabId }, files: ['content/inject.js'], world: 'MAIN' },
      () => {
        if (chrome.runtime.lastError) {
          // Cannot inject — likely a restricted page (chrome://, etc.)
          data = { isShopify: false };
          updateUI();
          return;
        }
        // Step 2: Inject content.js in ISOLATED world (message bridge)
        chrome.scripting.executeScript(
          { target: { tabId: tabId }, files: ['content/content.js'] },
          () => {
            if (chrome.runtime.lastError) {
              data = { isShopify: false };
              updateUI();
              return;
            }
            // Step 3: Wait for inject.js to gather data and content.js to receive it, then request
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { type: 'GET_SHOPIFY_DATA' }, (resp) => {
                if (chrome.runtime.lastError || !resp) {
                  data = { isShopify: false };
                } else {
                  data = resp;
                }
                updateUI();
              });
            }, 600);
          }
        );
      }
    );
  }

  // ── Init ──

  async function init() {
    bindButtons();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        data = { isShopify: false };
        updateUI();
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'GET_SHOPIFY_DATA' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded (custom domain) — inject via scripting API
          injectAndRetry(tab.id);
          return;
        }
        data = response || { isShopify: false };
        updateUI();
      });
    } catch (err) {
      data = { isShopify: false };
      updateUI();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
