(() => {
  const DOUBLE_CLICK_INTERVAL = 400;
  const PASSTHROUGH_TIMEOUT = 800; // auto-reset passthrough state
  const DEFAULT_MENU_MODE = "preserveMenu";

  // States: "idle" | "waitingForSecond" | "passthrough"
  let state = "idle";
  let pendingTimer = null;
  let passthroughTimer = null;
  let preserveTimer = null;
  let lastRightClickAt = 0;
  let menuMode = DEFAULT_MENU_MODE;

  chrome.storage.local.get({ menuMode: DEFAULT_MENU_MODE }, (data) => {
    menuMode = normalizeMenuMode(data.menuMode);
    resetState();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes.menuMode) return;
    menuMode = normalizeMenuMode(changes.menuMode.newValue);
    resetState();
  });

  function normalizeMenuMode(value) {
    return value === "suppressFirst" || value === "preserveMenu" ? value : DEFAULT_MENU_MODE;
  }

  function resetState() {
    clearTimeout(pendingTimer);
    clearTimeout(passthroughTimer);
    clearTimeout(preserveTimer);
    pendingTimer = null;
    passthroughTimer = null;
    preserveTimer = null;
    lastRightClickAt = 0;
    state = "idle";
  }

  function closeCurrentTab() {
    chrome.runtime.sendMessage({ action: "closeTab" });
  }

  function handlePreserveMenuClick() {
    const now = Date.now();
    if (lastRightClickAt && now - lastRightClickAt <= DOUBLE_CLICK_INTERVAL) {
      resetState();
      closeCurrentTab();
      return;
    }

    lastRightClickAt = now;
    clearTimeout(preserveTimer);
    preserveTimer = setTimeout(() => {
      lastRightClickAt = 0;
      preserveTimer = null;
    }, DOUBLE_CLICK_INTERVAL);
  }

  document.addEventListener("mousedown", (e) => {
    if (!e.isTrusted) return;
    if (e.button !== 2) return;

    if (menuMode === "preserveMenu") {
      handlePreserveMenuClick();
      return;
    }

    if (state === "waitingForSecond") {
      // Double right-click detected — close tab
      clearTimeout(pendingTimer);
      pendingTimer = null;
      state = "idle";
      closeCurrentTab();
    } else if (state === "passthrough") {
      // This click shows context menu normally, handled in contextmenu listener
    } else {
      // First right-click — suppress context menu, wait for second
      state = "waitingForSecond";
      clearTimeout(pendingTimer);
      pendingTimer = setTimeout(() => {
        // Timeout expired — next right-click shows context menu normally
        state = "passthrough";
        pendingTimer = null;
        // Auto-reset passthrough so it doesn't stick forever
        passthroughTimer = setTimeout(() => {
          state = "idle";
          passthroughTimer = null;
        }, PASSTHROUGH_TIMEOUT);
      }, DOUBLE_CLICK_INTERVAL);
    }
  }, true);

  document.addEventListener("contextmenu", (e) => {
    if (!e.isTrusted) return;
    if (menuMode === "preserveMenu") return;

    if (state === "waitingForSecond") {
      // Suppress context menu while waiting for potential second click
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    } else if (state === "passthrough") {
      // Allow context menu, then reset to idle
      clearTimeout(passthroughTimer);
      passthroughTimer = null;
      state = "idle";
    }
    // In "idle" state, context menu shows normally
  }, true);
})();
