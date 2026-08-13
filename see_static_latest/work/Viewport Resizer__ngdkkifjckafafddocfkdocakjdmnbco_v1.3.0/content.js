(function () {
  var el = null;
  var hideTimer = null;
  var removeTimer = null;

  function getOrCreate() {
    if (el) return el;
    el = document.createElement("div");
    el.id = "__vr-overlay";
    el.style.cssText = [
      "position:fixed",
      "bottom:8px",
      "right:8px",
      "background:rgba(100,100,100,0.75)",
      "color:#fff",
      "font:500 11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      "padding:4px 8px",
      "border-radius:4px",
      "z-index:2147483647",
      "pointer-events:none",
      "opacity:1",
      "transition:opacity 0.3s ease",
    ].join(";");
    document.body.appendChild(el);
    return el;
  }

  function show() {
    var overlay = getOrCreate();
    overlay.textContent = window.outerWidth + " \u00d7 " + window.outerHeight;
    overlay.style.opacity = "1";

    clearTimeout(hideTimer);
    clearTimeout(removeTimer);

    hideTimer = setTimeout(function () {
      overlay.style.opacity = "0";
    }, 1500);

    removeTimer = setTimeout(function () {
      if (el) {
        el.remove();
        el = null;
      }
    }, 1800);
  }

  window.addEventListener("resize", show);
})();
