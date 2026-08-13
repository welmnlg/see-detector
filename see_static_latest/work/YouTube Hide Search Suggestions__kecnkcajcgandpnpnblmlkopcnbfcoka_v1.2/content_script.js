(() => {
  // Debounce function to prevent excessive calls
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const hideElement = (el) => {
    if (!el) return;
    el.classList.add('yt-hide-suggestions');
  };

  const selectors = [
    'ytd-searchbox-suggestions',
    'ytd-searchbox-suggestion',
    'ytm-suggestions',
    'tp-yt-paper-listbox[role="listbox"]'
  ];

  const tryHideSuggestions = () => {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(hideElement);
    });

    document.querySelectorAll('[role="listbox"]').forEach(el => {
      if (
        el.closest('ytd-searchbox') ||
        el.closest('ytd-masthead') ||
        el.closest('#search')
      ) {
        hideElement(el);
      }
    });
  };

  const applyHiding = (enabled) => {
    if (!enabled) {
      document.querySelectorAll('.yt-hide-suggestions').forEach(el => {
        el.classList.remove('yt-hide-suggestions');
      });
      return;
    }
    tryHideSuggestions();
  };

  chrome.storage.sync.get(['ytHideEnabled'], (res) => {
    const enabled = res.ytHideEnabled ?? true;
    if (enabled) {
      tryHideSuggestions();

      // Debounced version to prevent lag
      const debouncedHide = debounce(tryHideSuggestions, 150);

      const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
          if (m.addedNodes?.length) debouncedHide();
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

      // Track search bar interactions
      let hasInteracted = false;
      const trackSearchBar = () => {
        const searchInput = document.querySelector('#search input, input#search');
        if (!searchInput) {
          setTimeout(trackSearchBar, 500);
          return;
        }

        // Click event
        searchInput.addEventListener('click', () => {
          if (!hasInteracted && searchInput.value.length < 30) {
            hasInteracted = true;
            chrome.storage.sync.get(['hiddenCount'], (res) => {
              const currentCount = res.hiddenCount || 0;
              chrome.storage.sync.set({ hiddenCount: currentCount + 15 });
            });
          }
        });

        // Input event
        searchInput.addEventListener('input', () => {
          if (searchInput.value.length < 30) {
            chrome.storage.sync.get(['hiddenCount'], (res) => {
              const currentCount = res.hiddenCount || 0;
              chrome.storage.sync.set({ hiddenCount: currentCount + 15 });
            });
          }
        });
      };

      trackSearchBar();
    }
  });

  const css = document.createElement('style');
  css.textContent = `
    .yt-hide-suggestions {
      display: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(css);
})();