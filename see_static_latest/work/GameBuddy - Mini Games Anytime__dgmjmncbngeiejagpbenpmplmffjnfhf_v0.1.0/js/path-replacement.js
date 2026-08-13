// Path replacement script for game iframes
// This script must be loaded before any game scripts

(function() {
  'use strict';
  
  // Wait for baseUrl to be set by the parent script
  // If not set, try to get it from chrome.runtime
  let baseUrl = window.__gameResourceBase;
  if (!baseUrl) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        // Use correct path: overlay/games-overlay/games/
        baseUrl = `chrome-extension://${chrome.runtime.id}/overlay/games-overlay/games/`;
        window.__gameResourceBase = baseUrl;
      } else {
        // Fallback: wait a bit for parent to set it
        const checkInterval = setInterval(() => {
          if (window.__gameResourceBase) {
            baseUrl = window.__gameResourceBase;
            clearInterval(checkInterval);
            initPathReplacement();
          }
        }, 50);
        setTimeout(() => clearInterval(checkInterval), 2000);
        return; // Exit early, will be called again when baseUrl is set
      }
    } catch (e) {
      // If chrome.runtime is not available, wait for parent to set it
      const checkInterval = setInterval(() => {
        if (window.__gameResourceBase) {
          baseUrl = window.__gameResourceBase;
          clearInterval(checkInterval);
          initPathReplacement();
        }
      }, 50);
      setTimeout(() => clearInterval(checkInterval), 2000);
      return;
    }
  }
  
  function initPathReplacement() {
    const baseUrl = window.__gameResourceBase;
    if (!baseUrl) {
      return;
    }
  
  // Helper function to replace /releases/ paths and relative paths in URLs
  function replaceReleasesPath(url) {
    if (typeof url === 'string') {
      if (url.startsWith('/releases/')) {
        return baseUrl + url.substring('/releases/'.length);
      }
      if (url.startsWith('./releases/')) {
        return baseUrl + url.substring('./releases/'.length);
      }
      if (url.startsWith('../')) {
        return baseUrl + url.substring('../'.length);
      }
      if (url.startsWith('./')) {
        return baseUrl + url.substring('./'.length);
      }
    }
    return url;
  }
  
  // Helper function to convert any URL to absolute chrome-extension URL
  function convertToAbsoluteUrl(url) {
    if (!url || typeof url !== 'string') {
      return url;
    }
    
    if (url.startsWith('http://') || url.startsWith('https://') || 
        url.startsWith('chrome-extension://') || url.startsWith('data:') || 
        url.startsWith('blob:')) {
      return url;
    }
    
    try {
      new URL(url);
      return url;
    } catch (e) {
      // Not absolute, need to convert
    }
    
    if (url.startsWith('/releases/')) {
      return baseUrl + url.substring('/releases/'.length);
    }
    if (url.startsWith('./releases/')) {
      return baseUrl + url.substring('./releases/'.length);
    }
    if (url.startsWith('../')) {
      let cleanPath = url.replace(/^(\.\.\/)+/, '');
      return baseUrl + cleanPath;
    }
    if (url.startsWith('./')) {
      return baseUrl + url.substring('./'.length);
    }
    if (url.startsWith('/')) {
      return baseUrl + url.substring(1);
    }
    
    return baseUrl + url;
  }
  
  // Set getGameResource
  window.getGameResource = function(relativePath) {
    if (relativePath.startsWith('http') || relativePath.startsWith('chrome-extension')) {
      return relativePath;
    }
    const cleanPath = relativePath.replace(/^\.\.?\//, '');
    return baseUrl + cleanPath;
  };
  
  // Override fetch
  if (!window.__originalFetch) {
    window.__originalFetch = window.fetch;
  }
  const originalFetch = window.__originalFetch;
  
  window.fetch = function(input, init) {
    try {
      if (typeof input === 'string') {
        const originalUrl = input;
        
        // If already absolute URL, use it directly
        if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://') || 
            originalUrl.startsWith('chrome-extension://') || originalUrl.startsWith('data:') || 
            originalUrl.startsWith('blob:')) {
          // Verify it's a valid URL
          try {
            const testUrl = new URL(originalUrl);
            if (testUrl.protocol === 'chrome-extension:' || 
                testUrl.protocol === 'http:' || 
                testUrl.protocol === 'https:' ||
                testUrl.protocol === 'data:' ||
                testUrl.protocol === 'blob:') {
              return originalFetch.call(this, originalUrl, init);
            }
          } catch (e) {
            // Invalid URL, try to fix it
            console.warn('[path-replacement] Invalid absolute URL, trying to fix:', originalUrl);
          }
        }
        
        // Only convert relative URLs if baseUrl is available
        if (!baseUrl) {
          console.warn('[path-replacement] baseUrl not available, using original URL:', originalUrl);
          return originalFetch.call(this, input, init);
        }
        
        let newUrl = convertToAbsoluteUrl(input);
        
        try {
          const testUrl = new URL(newUrl);
          if (testUrl.protocol === 'chrome-extension:' || 
              testUrl.protocol === 'http:' || 
              testUrl.protocol === 'https:' ||
              testUrl.protocol === 'data:' ||
              testUrl.protocol === 'blob:') {
            return originalFetch.call(this, newUrl, init);
          }
        } catch (e) {
          // If conversion failed, try to construct from baseUrl
          if (baseUrl) {
            let cleanPath = originalUrl.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
            newUrl = baseUrl + cleanPath;
            try {
              const testUrl2 = new URL(newUrl);
              if (testUrl2.protocol === 'chrome-extension:' || 
                  testUrl2.protocol === 'http:' || 
                  testUrl2.protocol === 'https:') {
                return originalFetch.call(this, newUrl, init);
              }
            } catch (e2) {
              // Still invalid, use original
              console.error('[path-replacement] Failed to construct valid URL from baseUrl:', baseUrl, 'path:', cleanPath);
            }
          }
        }
      }
      return originalFetch.call(this, input, init);
    } catch (error) {
      console.error('[path-replacement] Error in fetch override:', error);
      return originalFetch.call(this, input, init);
    }
  };
  }
  
  // Initialize immediately if baseUrl is already set
  if (baseUrl) {
    initPathReplacement();
  } else {
    // Otherwise, wait for it to be set
    const checkInterval = setInterval(() => {
      if (window.__gameResourceBase) {
        clearInterval(checkInterval);
        initPathReplacement();
      }
    }, 50);
    setTimeout(() => clearInterval(checkInterval), 2000);
  }
})();

