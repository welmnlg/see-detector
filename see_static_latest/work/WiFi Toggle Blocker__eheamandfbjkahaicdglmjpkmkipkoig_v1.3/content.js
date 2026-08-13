(function () {
  var overlay = null;
  var styleEl = null;
  var blockEvent = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  };

  var CSS =
    "#__fms_wifi_block__ {" +
    "  position: fixed !important;" +
    "  top: 0 !important;" +
    "  left: 0 !important;" +
    "  width: 100vw !important;" +
    "  height: 100vh !important;" +
    "  z-index: 2147483647 !important;" +
    "  background: #1a1a2e !important;" +
    "  background-color: #1a1a2e !important;" +
    "  opacity: 1 !important;" +
    "  display: flex !important;" +
    "  align-items: center !important;" +
    "  justify-content: center !important;" +
    "  text-align: center !important;" +
    "  font-family: 'Google Sans', 'Segoe UI', Arial, sans-serif !important;" +
    "  color: #fff !important;" +
    "  cursor: not-allowed !important;" +
    "  user-select: none !important;" +
    "  pointer-events: all !important;" +
    "  margin: 0 !important;" +
    "  padding: 0 !important;" +
    "  border: none !important;" +
    "  transform: none !important;" +
    "  filter: none !important;" +
    "  mix-blend-mode: normal !important;" +
    "  clip: auto !important;" +
    "  clip-path: none !important;" +
    "  visibility: visible !important;" +
    "}" +
    "#__fms_wifi_block__ * {" +
    "  opacity: 1 !important;" +
    "  visibility: visible !important;" +
    "}";

  function createOverlay() {
    if (overlay) return;

    // Inject stylesheet — more robust than inline styles
    styleEl = document.createElement("style");
    styleEl.textContent = CSS;
    (document.head || document.documentElement).appendChild(styleEl);

    overlay = document.createElement("div");
    overlay.id = "__fms_wifi_block__";
    overlay.innerHTML =
      '<div>' +
      '<div style="font-size:80px;margin-bottom:24px">&#128225;</div>' +
      '<div style="font-size:26px;font-weight:500;margin-bottom:16px">WiFi Connection Required</div>' +
      '<div style="font-size:15px;color:#aaa;line-height:1.6">' +
      "This Chromebook is not connected to the internet.<br>" +
      "Turn on WiFi and connect to the school network to continue." +
      "</div>" +
      '<div style="margin-top:32px;display:inline-block;padding:10px 28px;border-radius:24px;background:#e74c3c;font-size:14px;font-weight:600">Disconnected</div>' +
      "</div>";

    // Capture all input events at the document level before anything else sees them
    var events = [
      "keydown", "keyup", "keypress",
      "mousedown", "mouseup", "click", "dblclick", "contextmenu",
      "touchstart", "touchend", "touchmove",
      "pointerdown", "pointerup",
      "wheel", "scroll"
    ];
    for (var i = 0; i < events.length; i++) {
      document.addEventListener(events[i], blockEvent, true);
    }

    // Inject into page — try body first, fall back to documentElement
    var target = document.body || document.documentElement;
    if (target) {
      target.appendChild(overlay);
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        document.body.appendChild(overlay);
      });
    }
  }

  function removeOverlay() {
    if (!overlay) return;

    var events = [
      "keydown", "keyup", "keypress",
      "mousedown", "mouseup", "click", "dblclick", "contextmenu",
      "touchstart", "touchend", "touchmove",
      "pointerdown", "pointerup",
      "wheel", "scroll"
    ];
    for (var i = 0; i < events.length; i++) {
      document.removeEventListener(events[i], blockEvent, true);
    }

    overlay.remove();
    overlay = null;

    if (styleEl) {
      styleEl.remove();
      styleEl = null;
    }
  }

  function checkConnection() {
    if (!navigator.onLine) {
      createOverlay();
    } else {
      removeOverlay();
    }
  }

  // Check immediately
  checkConnection();

  // React to online/offline events
  window.addEventListener("online", checkConnection);
  window.addEventListener("offline", checkConnection);

  // Fallback: poll every 2 seconds in case events are missed
  setInterval(checkConnection, 2000);
})();
