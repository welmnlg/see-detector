// Runs in the page's MAIN world at document_start (via manifest world: "MAIN").
// 1. Strips paste/copy/contextmenu blockers.
// 2. Listens for a CustomEvent from the isolated content script and sets the
//    target input's value in a way Angular/React will pick up.
(function () {
  const BLOCKED = ["paste", "copy", "cut", "contextmenu", "dragstart", "drop",
    "beforecopy", "beforecut", "beforepaste", "selectstart"];
  const ON_PROPS = ["onpaste", "oncopy", "oncut", "oncontextmenu",
    "ondragstart", "ondrop", "onselectstart"];

  for (const type of BLOCKED) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
    document.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }

  const origAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (typeof type === "string" && BLOCKED.includes(type.toLowerCase())) return;
    return origAdd.call(this, type, listener, options);
  };

  for (const prop of ON_PROPS) {
    const desc = { get: () => null, set: () => {}, configurable: true };
    try { Object.defineProperty(HTMLElement.prototype, prop, desc); } catch (_) {}
    try { Object.defineProperty(Document.prototype, prop, desc); } catch (_) {}
    try { Object.defineProperty(Window.prototype, prop, desc); } catch (_) {}
  }

  const origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (typeof name === "string" && ON_PROPS.includes(name.toLowerCase())) return;
    return origSetAttr.call(this, name, value);
  };

  const clean = (el) => {
    if (!(el instanceof Element)) return;
    for (const prop of ON_PROPS) {
      if (el.hasAttribute && el.hasAttribute(prop)) el.removeAttribute(prop);
    }
  };
  const walk = (root) => {
    clean(root);
    if (root && root.querySelectorAll) root.querySelectorAll("*").forEach(clean);
  };
  const observe = () => {
    walk(document.documentElement);
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes") clean(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.documentElement, {
      subtree: true, childList: true, attributes: true, attributeFilter: ON_PROPS,
    });
  };
  if (document.documentElement) observe();
  else document.addEventListener("readystatechange", observe, { once: true });

  // Set value in a way Angular (ng-model) and React pick up.
  function setValue(el, text) {
    if (!el) return;
    try {
      const proto = el.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(el, (el.value || "") + text);
    } catch (_) {
      el.value = (el.value || "") + text;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    try {
      if (window.angular) {
        const ngEl = window.angular.element(el);
        const ngModel = ngEl.controller && ngEl.controller("ngModel");
        const scope = ngEl.scope && ngEl.scope();
        if (ngModel) {
          ngModel.$setViewValue(el.value);
          if (ngModel.$render) ngModel.$render();
        }
        if (scope) {
          if (scope.$applyAsync) scope.$applyAsync();
          else if (scope.$apply && !scope.$$phase) scope.$apply();
        }
      }
    } catch (_) {}
  }

  // Bridge from the isolated-world content script.
  document.addEventListener("__enablePaste", (ev) => {
    const text = ev.detail && ev.detail.text;
    if (typeof text !== "string") return;
    const el = document.activeElement;
    setValue(el, text);
  });
})();
