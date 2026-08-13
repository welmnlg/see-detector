// inject.js — Runs in the PAGE context to read Shopify globals
(function () {
  'use strict';

  function gather() {
    const data = {
      isShopify: false,
      shop: null,
      themeId: null,
      themeName: null,
      themeRole: null,
      pageType: null,
      resourceId: null,
      resourceHandle: null,
      blogHandle: null,
      pathname: window.location.pathname,
      href: window.location.href,
    };

    // Check for Shopify global
    if (typeof window.Shopify === 'undefined') {
      window.postMessage({ type: 'SHOPIFY_DEV_TOOLS_DATA', payload: data }, '*');
      return;
    }

    data.isShopify = true;
    const S = window.Shopify;

    // Store domain
    data.shop = S.shop || null;

    // Theme info
    if (S.theme) {
      data.themeId = S.theme.id || null;
      data.themeName = S.theme.name || null;
      data.themeRole = S.theme.role || null;
    }

    // Page type & resource IDs from ShopifyAnalytics
    const meta = window.ShopifyAnalytics && window.ShopifyAnalytics.meta;
    if (meta) {
      data.pageType = meta.page && meta.page.pageType ? meta.page.pageType : null;
      if (meta.product) data.resourceId = meta.product.id || null;
      if (meta.page) {
        if (meta.page.resourceId) data.resourceId = meta.page.resourceId;
        if (meta.page.resourceType) data.pageType = data.pageType || meta.page.resourceType;
      }
    }

    // Fallback page type detection from URL path
    if (!data.pageType) {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        data.pageType = 'home';
      } else if (/^\/products\//.test(path)) {
        data.pageType = 'product';
      } else if (/^\/collections\//.test(path)) {
        data.pageType = 'collection';
      } else if (/^\/blogs\/[^/]+\/[^/]+/.test(path)) {
        data.pageType = 'article';
      } else if (/^\/blogs\//.test(path)) {
        data.pageType = 'blog';
      } else if (/^\/pages\//.test(path)) {
        data.pageType = 'page';
      } else {
        data.pageType = 'other';
      }
    }

    // Extract handle from URL
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      if (['products', 'collections', 'pages'].includes(pathParts[0])) {
        data.resourceHandle = pathParts[1];
      } else if (pathParts[0] === 'blogs') {
        data.blogHandle = pathParts[1];
        if (pathParts.length >= 3) {
          data.resourceHandle = pathParts[2]; // article handle
        }
      }
    }

    // Try to get resource ID from meta tags if not found
    if (!data.resourceId) {
      try {
        // Check for product/resource ID in page source JSON
        const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
        for (const tag of scriptTags) {
          try {
            const json = JSON.parse(tag.textContent);
            if (json['@type'] === 'Product' && json.productID) {
              data.resourceId = json.productID;
            }
          } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
    }

    // Try to get resource ID from __st (Shopify tracking) object
    if (!data.resourceId && window.__st) {
      if (window.__st.rid) data.resourceId = window.__st.rid;
    }

    window.postMessage({ type: 'SHOPIFY_DEV_TOOLS_DATA', payload: data }, '*');
  }

  // Small delay to ensure Shopify globals are loaded
  if (document.readyState === 'complete') {
    setTimeout(gather, 100);
  } else {
    window.addEventListener('load', () => setTimeout(gather, 100));
  }
})();
