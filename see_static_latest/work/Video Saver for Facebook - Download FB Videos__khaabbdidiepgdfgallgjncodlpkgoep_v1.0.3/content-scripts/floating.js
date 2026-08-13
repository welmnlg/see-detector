var floating = (function() {
  "use strict";
  function defineContentScript(definition2) {
    return definition2;
  }
  function print$1(method, ...args) {
    return;
  }
  const logger$1 = {
    debug: (...args) => print$1(console.debug, ...args),
    log: (...args) => print$1(console.log, ...args),
    warn: (...args) => print$1(console.warn, ...args),
    error: (...args) => print$1(console.error, ...args)
  };
  const nullKey = /* @__PURE__ */ Symbol("null");
  let keyCounter = 0;
  class ManyKeysMap extends Map {
    constructor() {
      super();
      this._objectHashes = /* @__PURE__ */ new WeakMap();
      this._symbolHashes = /* @__PURE__ */ new Map();
      this._publicKeys = /* @__PURE__ */ new Map();
      const [pairs] = arguments;
      if (pairs === null || pairs === void 0) {
        return;
      }
      if (typeof pairs[Symbol.iterator] !== "function") {
        throw new TypeError(typeof pairs + " is not iterable (cannot read property Symbol(Symbol.iterator))");
      }
      for (const [keys, value] of pairs) {
        this.set(keys, value);
      }
    }
    _getPublicKeys(keys, create = false) {
      if (!Array.isArray(keys)) {
        throw new TypeError("The keys parameter must be an array");
      }
      const privateKey = this._getPrivateKey(keys, create);
      let publicKey;
      if (privateKey && this._publicKeys.has(privateKey)) {
        publicKey = this._publicKeys.get(privateKey);
      } else if (create) {
        publicKey = [...keys];
        this._publicKeys.set(privateKey, publicKey);
      }
      return { privateKey, publicKey };
    }
    _getPrivateKey(keys, create = false) {
      const privateKeys = [];
      for (let key of keys) {
        if (key === null) {
          key = nullKey;
        }
        const hashes = typeof key === "object" || typeof key === "function" ? "_objectHashes" : typeof key === "symbol" ? "_symbolHashes" : false;
        if (!hashes) {
          privateKeys.push(key);
        } else if (this[hashes].has(key)) {
          privateKeys.push(this[hashes].get(key));
        } else if (create) {
          const privateKey = `@@mkm-ref-${keyCounter++}@@`;
          this[hashes].set(key, privateKey);
          privateKeys.push(privateKey);
        } else {
          return false;
        }
      }
      return JSON.stringify(privateKeys);
    }
    set(keys, value) {
      const { publicKey } = this._getPublicKeys(keys, true);
      return super.set(publicKey, value);
    }
    get(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.get(publicKey);
    }
    has(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.has(publicKey);
    }
    delete(keys) {
      const { publicKey, privateKey } = this._getPublicKeys(keys);
      return Boolean(publicKey && super.delete(publicKey) && this._publicKeys.delete(privateKey));
    }
    clear() {
      super.clear();
      this._symbolHashes.clear();
      this._publicKeys.clear();
    }
    get [Symbol.toStringTag]() {
      return "ManyKeysMap";
    }
    get size() {
      return super.size;
    }
  }
  function isPlainObject(value) {
    if (value === null || typeof value !== "object") {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
      return false;
    }
    if (Symbol.iterator in value) {
      return false;
    }
    if (Symbol.toStringTag in value) {
      return Object.prototype.toString.call(value) === "[object Module]";
    }
    return true;
  }
  function _defu(baseObject, defaults, namespace = ".", merger) {
    if (!isPlainObject(defaults)) {
      return _defu(baseObject, {}, namespace, merger);
    }
    const object = Object.assign({}, defaults);
    for (const key in baseObject) {
      if (key === "__proto__" || key === "constructor") {
        continue;
      }
      const value = baseObject[key];
      if (value === null || value === void 0) {
        continue;
      }
      if (merger && merger(object, key, value, namespace)) {
        continue;
      }
      if (Array.isArray(value) && Array.isArray(object[key])) {
        object[key] = [...value, ...object[key]];
      } else if (isPlainObject(value) && isPlainObject(object[key])) {
        object[key] = _defu(
          value,
          object[key],
          (namespace ? `${namespace}.` : "") + key.toString(),
          merger
        );
      } else {
        object[key] = value;
      }
    }
    return object;
  }
  function createDefu(merger) {
    return (...arguments_) => (
      // eslint-disable-next-line unicorn/no-array-reduce
      arguments_.reduce((p2, c2) => _defu(p2, c2, "", merger), {})
    );
  }
  const defu = createDefu();
  const isExist = (element) => {
    return element !== null ? { isDetected: true, result: element } : { isDetected: false };
  };
  const isNotExist = (element) => {
    return element === null ? { isDetected: true, result: null } : { isDetected: false };
  };
  const getDefaultOptions = () => ({
    target: globalThis.document,
    unifyProcess: true,
    detector: isExist,
    observeConfigs: {
      childList: true,
      subtree: true,
      attributes: true
    },
    signal: void 0,
    customMatcher: void 0
  });
  const mergeOptions = (userSideOptions, defaultOptions) => {
    return defu(userSideOptions, defaultOptions);
  };
  const unifyCache = new ManyKeysMap();
  function createWaitElement(instanceOptions) {
    const { defaultOptions } = instanceOptions;
    return (selector, options) => {
      const {
        target,
        unifyProcess,
        observeConfigs,
        detector,
        signal,
        customMatcher
      } = mergeOptions(options, defaultOptions);
      const unifyPromiseKey = [
        selector,
        target,
        unifyProcess,
        observeConfigs,
        detector,
        signal,
        customMatcher
      ];
      const cachedPromise = unifyCache.get(unifyPromiseKey);
      if (unifyProcess && cachedPromise) {
        return cachedPromise;
      }
      const detectPromise = new Promise(
        // biome-ignore lint/suspicious/noAsyncPromiseExecutor: avoid nesting promise
        async (resolve, reject) => {
          if (signal?.aborted) {
            return reject(signal.reason);
          }
          const observer = new MutationObserver(
            async (mutations) => {
              for (const _2 of mutations) {
                if (signal?.aborted) {
                  observer.disconnect();
                  break;
                }
                const detectResult2 = await detectElement({
                  selector,
                  target,
                  detector,
                  customMatcher
                });
                if (detectResult2.isDetected) {
                  observer.disconnect();
                  resolve(detectResult2.result);
                  break;
                }
              }
            }
          );
          signal?.addEventListener(
            "abort",
            () => {
              observer.disconnect();
              return reject(signal.reason);
            },
            { once: true }
          );
          const detectResult = await detectElement({
            selector,
            target,
            detector,
            customMatcher
          });
          if (detectResult.isDetected) {
            return resolve(detectResult.result);
          }
          observer.observe(target, observeConfigs);
        }
      ).finally(() => {
        unifyCache.delete(unifyPromiseKey);
      });
      unifyCache.set(unifyPromiseKey, detectPromise);
      return detectPromise;
    };
  }
  async function detectElement({
    target,
    selector,
    detector,
    customMatcher
  }) {
    const element = customMatcher ? customMatcher(selector) : target.querySelector(selector);
    return await detector(element);
  }
  const waitElement = createWaitElement({
    defaultOptions: getDefaultOptions()
  });
  function applyPosition(root2, positionedElement, options) {
    if (options.position === "inline") return;
    if (options.zIndex != null) root2.style.zIndex = String(options.zIndex);
    root2.style.overflow = "visible";
    root2.style.position = "relative";
    root2.style.width = "0";
    root2.style.height = "0";
    root2.style.display = "block";
    if (positionedElement) if (options.position === "overlay") {
      positionedElement.style.position = "absolute";
      if (options.alignment?.startsWith("bottom-")) positionedElement.style.bottom = "0";
      else positionedElement.style.top = "0";
      if (options.alignment?.endsWith("-right")) positionedElement.style.right = "0";
      else positionedElement.style.left = "0";
    } else {
      positionedElement.style.position = "fixed";
      positionedElement.style.top = "0";
      positionedElement.style.bottom = "0";
      positionedElement.style.left = "0";
      positionedElement.style.right = "0";
    }
  }
  function getAnchor(options) {
    if (options.anchor == null) return document.body;
    let resolved = typeof options.anchor === "function" ? options.anchor() : options.anchor;
    if (typeof resolved === "string") if (resolved.startsWith("/")) return document.evaluate(resolved, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ?? void 0;
    else return document.querySelector(resolved) ?? void 0;
    return resolved ?? void 0;
  }
  function mountUi(root2, options) {
    const anchor = getAnchor(options);
    if (anchor == null) throw Error("Failed to mount content script UI: could not find anchor element");
    switch (options.append) {
      case void 0:
      case "last":
        anchor.append(root2);
        break;
      case "first":
        anchor.prepend(root2);
        break;
      case "replace":
        anchor.replaceWith(root2);
        break;
      case "after":
        anchor.parentElement?.insertBefore(root2, anchor.nextElementSibling);
        break;
      case "before":
        anchor.parentElement?.insertBefore(root2, anchor);
        break;
      default:
        options.append(anchor, root2);
    }
  }
  function createMountFunctions(baseFunctions, options) {
    let autoMountInstance;
    const stopAutoMount = () => {
      autoMountInstance?.stopAutoMount();
      autoMountInstance = void 0;
    };
    const mount = () => {
      baseFunctions.mount();
    };
    const unmount = baseFunctions.remove;
    const remove = () => {
      stopAutoMount();
      baseFunctions.remove();
    };
    const autoMount = (autoMountOptions) => {
      if (autoMountInstance) logger$1.warn("autoMount is already set.");
      autoMountInstance = autoMountUi({
        mount,
        unmount,
        stopAutoMount
      }, {
        ...options,
        ...autoMountOptions
      });
    };
    return {
      mount,
      remove,
      autoMount
    };
  }
  function autoMountUi(uiCallbacks, options) {
    const abortController = new AbortController();
    const EXPLICIT_STOP_REASON = "explicit_stop_auto_mount";
    const _stopAutoMount = () => {
      abortController.abort(EXPLICIT_STOP_REASON);
      options.onStop?.();
    };
    let resolvedAnchor = typeof options.anchor === "function" ? options.anchor() : options.anchor;
    if (resolvedAnchor instanceof Element) throw Error("autoMount and Element anchor option cannot be combined. Avoid passing `Element` directly or `() => Element` to the anchor.");
    async function observeElement(selector) {
      let isAnchorExist = !!getAnchor(options);
      if (isAnchorExist) uiCallbacks.mount();
      while (!abortController.signal.aborted) try {
        isAnchorExist = !!await waitElement(selector ?? "body", {
          customMatcher: () => getAnchor(options) ?? null,
          detector: isAnchorExist ? isNotExist : isExist,
          signal: abortController.signal
        });
        if (isAnchorExist) uiCallbacks.mount();
        else {
          uiCallbacks.unmount();
          if (options.once) uiCallbacks.stopAutoMount();
        }
      } catch (error) {
        if (abortController.signal.aborted && abortController.signal.reason === EXPLICIT_STOP_REASON) break;
        else throw error;
      }
    }
    observeElement(resolvedAnchor);
    return { stopAutoMount: _stopAutoMount };
  }
  const AT_RULE_BLOCKS = /(\s*@(property|font-face)[\s\S]*?{[\s\S]*?})/gm;
  function splitShadowRootCss(css) {
    return {
      documentCss: Array.from(css.matchAll(AT_RULE_BLOCKS), (m2) => m2[0]).join("").trim(),
      shadowCss: css.replace(AT_RULE_BLOCKS, "").trim()
    };
  }
  const browser$1 = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var isPotentialCustomElementName_1;
  var hasRequiredIsPotentialCustomElementName;
  function requireIsPotentialCustomElementName() {
    if (hasRequiredIsPotentialCustomElementName) return isPotentialCustomElementName_1;
    hasRequiredIsPotentialCustomElementName = 1;
    var regex2 = /^[a-z](?:[\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[\x2D\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
    var isPotentialCustomElementName2 = function(string) {
      return regex2.test(string);
    };
    isPotentialCustomElementName_1 = isPotentialCustomElementName2;
    return isPotentialCustomElementName_1;
  }
  var isPotentialCustomElementNameExports = requireIsPotentialCustomElementName();
  const isPotentialCustomElementName = /* @__PURE__ */ getDefaultExportFromCjs(isPotentialCustomElementNameExports);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e2) {
          reject(e2);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e2) {
          reject(e2);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };
  var ALLOWED_SHADOW_ELEMENTS = [
    "article",
    "aside",
    "blockquote",
    "body",
    "div",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "main",
    "nav",
    "p",
    "section",
    "span"
  ];
  function createIsolatedElement(options) {
    return __async(this, null, function* () {
      const { name, mode = "closed", css, isolateEvents = false } = options;
      if (!ALLOWED_SHADOW_ELEMENTS.includes(name) && !isPotentialCustomElementName(name)) {
        throw Error(
          `"${name}" cannot have a shadow root attached to it. It must be two words and kebab-case, with a few exceptions. See https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#elements_you_can_attach_a_shadow_to`
        );
      }
      const parentElement = document.createElement(name);
      const shadow = parentElement.attachShadow({ mode });
      const isolatedElement = document.createElement("html");
      const body = document.createElement("body");
      const head = document.createElement("head");
      if (css) {
        const style = document.createElement("style");
        if ("url" in css) {
          style.textContent = yield fetch(css.url).then((res) => res.text());
        } else {
          style.textContent = css.textContent;
        }
        head.appendChild(style);
      }
      isolatedElement.appendChild(head);
      isolatedElement.appendChild(body);
      shadow.appendChild(isolatedElement);
      if (isolateEvents) {
        const eventTypes = Array.isArray(isolateEvents) ? isolateEvents : ["keydown", "keyup", "keypress"];
        eventTypes.forEach((eventType) => {
          body.addEventListener(eventType, (e2) => e2.stopPropagation());
        });
      }
      return {
        parentElement,
        shadow,
        isolatedElement: body
      };
    });
  }
  async function createShadowRootUi(ctx, options) {
    const instanceId = Math.random().toString(36).substring(2, 15);
    const css = [];
    if (!options.inheritStyles) css.push(`/* WXT Shadow Root Reset */ :host{all:initial !important;}`);
    if (options.css) css.push(options.css);
    if (ctx.options?.cssInjectionMode === "ui") {
      const entryCss = await loadCss();
      css.push(entryCss.replaceAll(":root", ":host"));
    }
    const { shadowCss, documentCss } = splitShadowRootCss(css.join("\n").trim());
    const { isolatedElement: uiContainer, parentElement: shadowHost, shadow } = await createIsolatedElement({
      name: options.name,
      css: { textContent: shadowCss },
      mode: options.mode ?? "open",
      isolateEvents: options.isolateEvents
    });
    let mounted;
    const mount = () => {
      mountUi(shadowHost, options);
      applyPosition(shadowHost, shadow.querySelector("html"), options);
      if (documentCss && !document.querySelector(`style[wxt-shadow-root-document-styles="${instanceId}"]`)) {
        const style = document.createElement("style");
        style.textContent = documentCss;
        style.setAttribute("wxt-shadow-root-document-styles", instanceId);
        (document.head ?? document.body).append(style);
      }
      mounted = options.onMount(uiContainer, shadow, shadowHost);
    };
    const remove = () => {
      options.onRemove?.(mounted);
      shadowHost.remove();
      document.querySelector(`style[wxt-shadow-root-document-styles="${instanceId}"]`)?.remove();
      while (uiContainer.lastChild) uiContainer.removeChild(uiContainer.lastChild);
      mounted = void 0;
    };
    const mountFunctions = createMountFunctions({
      mount,
      remove
    }, options);
    ctx.onInvalidated(remove);
    return {
      shadow,
      shadowHost,
      uiContainer,
      ...mountFunctions,
      get mounted() {
        return mounted;
      }
    };
  }
  async function loadCss() {
    const url = browser.runtime.getURL(`/content-scripts/${"floating"}.css`);
    try {
      return await (await fetch(url)).text();
    } catch (err) {
      logger$1.warn(`Failed to load styles @ ${url}. Did you forget to import the stylesheet in your entrypoint?`, err);
      return "";
    }
  }
  var jsxRuntime = { exports: {} };
  var reactJsxRuntime_production_min = {};
  var react = { exports: {} };
  var react_production_min = {};
  var hasRequiredReact_production_min;
  function requireReact_production_min() {
    if (hasRequiredReact_production_min) return react_production_min;
    hasRequiredReact_production_min = 1;
    var l2 = /* @__PURE__ */ Symbol.for("react.element"), n2 = /* @__PURE__ */ Symbol.for("react.portal"), p2 = /* @__PURE__ */ Symbol.for("react.fragment"), q = /* @__PURE__ */ Symbol.for("react.strict_mode"), r = /* @__PURE__ */ Symbol.for("react.profiler"), t2 = /* @__PURE__ */ Symbol.for("react.provider"), u2 = /* @__PURE__ */ Symbol.for("react.context"), v2 = /* @__PURE__ */ Symbol.for("react.forward_ref"), w2 = /* @__PURE__ */ Symbol.for("react.suspense"), x = /* @__PURE__ */ Symbol.for("react.memo"), y = /* @__PURE__ */ Symbol.for("react.lazy"), z = Symbol.iterator;
    function A(a2) {
      if (null === a2 || "object" !== typeof a2) return null;
      a2 = z && a2[z] || a2["@@iterator"];
      return "function" === typeof a2 ? a2 : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } }, C2 = Object.assign, D2 = {};
    function E2(a2, b, e2) {
      this.props = a2;
      this.context = b;
      this.refs = D2;
      this.updater = e2 || B;
    }
    E2.prototype.isReactComponent = {};
    E2.prototype.setState = function(a2, b) {
      if ("object" !== typeof a2 && "function" !== typeof a2 && null != a2) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a2, b, "setState");
    };
    E2.prototype.forceUpdate = function(a2) {
      this.updater.enqueueForceUpdate(this, a2, "forceUpdate");
    };
    function F2() {
    }
    F2.prototype = E2.prototype;
    function G(a2, b, e2) {
      this.props = a2;
      this.context = b;
      this.refs = D2;
      this.updater = e2 || B;
    }
    var H2 = G.prototype = new F2();
    H2.constructor = G;
    C2(H2, E2.prototype);
    H2.isPureReactComponent = true;
    var I = Array.isArray, J = Object.prototype.hasOwnProperty, K = { current: null }, L2 = { key: true, ref: true, __self: true, __source: true };
    function M(a2, b, e2) {
      var d2, c2 = {}, k2 = null, h2 = null;
      if (null != b) for (d2 in void 0 !== b.ref && (h2 = b.ref), void 0 !== b.key && (k2 = "" + b.key), b) J.call(b, d2) && !L2.hasOwnProperty(d2) && (c2[d2] = b[d2]);
      var g2 = arguments.length - 2;
      if (1 === g2) c2.children = e2;
      else if (1 < g2) {
        for (var f2 = Array(g2), m2 = 0; m2 < g2; m2++) f2[m2] = arguments[m2 + 2];
        c2.children = f2;
      }
      if (a2 && a2.defaultProps) for (d2 in g2 = a2.defaultProps, g2) void 0 === c2[d2] && (c2[d2] = g2[d2]);
      return { $$typeof: l2, type: a2, key: k2, ref: h2, props: c2, _owner: K.current };
    }
    function N2(a2, b) {
      return { $$typeof: l2, type: a2.type, key: b, ref: a2.ref, props: a2.props, _owner: a2._owner };
    }
    function O(a2) {
      return "object" === typeof a2 && null !== a2 && a2.$$typeof === l2;
    }
    function escape(a2) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a2.replace(/[=:]/g, function(a3) {
        return b[a3];
      });
    }
    var P2 = /\/+/g;
    function Q2(a2, b) {
      return "object" === typeof a2 && null !== a2 && null != a2.key ? escape("" + a2.key) : b.toString(36);
    }
    function R(a2, b, e2, d2, c2) {
      var k2 = typeof a2;
      if ("undefined" === k2 || "boolean" === k2) a2 = null;
      var h2 = false;
      if (null === a2) h2 = true;
      else switch (k2) {
        case "string":
        case "number":
          h2 = true;
          break;
        case "object":
          switch (a2.$$typeof) {
            case l2:
            case n2:
              h2 = true;
          }
      }
      if (h2) return h2 = a2, c2 = c2(h2), a2 = "" === d2 ? "." + Q2(h2, 0) : d2, I(c2) ? (e2 = "", null != a2 && (e2 = a2.replace(P2, "$&/") + "/"), R(c2, b, e2, "", function(a3) {
        return a3;
      })) : null != c2 && (O(c2) && (c2 = N2(c2, e2 + (!c2.key || h2 && h2.key === c2.key ? "" : ("" + c2.key).replace(P2, "$&/") + "/") + a2)), b.push(c2)), 1;
      h2 = 0;
      d2 = "" === d2 ? "." : d2 + ":";
      if (I(a2)) for (var g2 = 0; g2 < a2.length; g2++) {
        k2 = a2[g2];
        var f2 = d2 + Q2(k2, g2);
        h2 += R(k2, b, e2, f2, c2);
      }
      else if (f2 = A(a2), "function" === typeof f2) for (a2 = f2.call(a2), g2 = 0; !(k2 = a2.next()).done; ) k2 = k2.value, f2 = d2 + Q2(k2, g2++), h2 += R(k2, b, e2, f2, c2);
      else if ("object" === k2) throw b = String(a2), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a2).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h2;
    }
    function S2(a2, b, e2) {
      if (null == a2) return a2;
      var d2 = [], c2 = 0;
      R(a2, d2, "", "", function(a3) {
        return b.call(e2, a3, c2++);
      });
      return d2;
    }
    function T(a2) {
      if (-1 === a2._status) {
        var b = a2._result;
        b = b();
        b.then(function(b2) {
          if (0 === a2._status || -1 === a2._status) a2._status = 1, a2._result = b2;
        }, function(b2) {
          if (0 === a2._status || -1 === a2._status) a2._status = 2, a2._result = b2;
        });
        -1 === a2._status && (a2._status = 0, a2._result = b);
      }
      if (1 === a2._status) return a2._result.default;
      throw a2._result;
    }
    var U = { current: null }, V2 = { transition: null }, W2 = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V2, ReactCurrentOwner: K };
    react_production_min.Children = { map: S2, forEach: function(a2, b, e2) {
      S2(a2, function() {
        b.apply(this, arguments);
      }, e2);
    }, count: function(a2) {
      var b = 0;
      S2(a2, function() {
        b++;
      });
      return b;
    }, toArray: function(a2) {
      return S2(a2, function(a3) {
        return a3;
      }) || [];
    }, only: function(a2) {
      if (!O(a2)) throw Error("React.Children.only expected to receive a single React element child.");
      return a2;
    } };
    react_production_min.Component = E2;
    react_production_min.Fragment = p2;
    react_production_min.Profiler = r;
    react_production_min.PureComponent = G;
    react_production_min.StrictMode = q;
    react_production_min.Suspense = w2;
    react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W2;
    react_production_min.cloneElement = function(a2, b, e2) {
      if (null === a2 || void 0 === a2) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a2 + ".");
      var d2 = C2({}, a2.props), c2 = a2.key, k2 = a2.ref, h2 = a2._owner;
      if (null != b) {
        void 0 !== b.ref && (k2 = b.ref, h2 = K.current);
        void 0 !== b.key && (c2 = "" + b.key);
        if (a2.type && a2.type.defaultProps) var g2 = a2.type.defaultProps;
        for (f2 in b) J.call(b, f2) && !L2.hasOwnProperty(f2) && (d2[f2] = void 0 === b[f2] && void 0 !== g2 ? g2[f2] : b[f2]);
      }
      var f2 = arguments.length - 2;
      if (1 === f2) d2.children = e2;
      else if (1 < f2) {
        g2 = Array(f2);
        for (var m2 = 0; m2 < f2; m2++) g2[m2] = arguments[m2 + 2];
        d2.children = g2;
      }
      return { $$typeof: l2, type: a2.type, key: c2, ref: k2, props: d2, _owner: h2 };
    };
    react_production_min.createContext = function(a2) {
      a2 = { $$typeof: u2, _currentValue: a2, _currentValue2: a2, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a2.Provider = { $$typeof: t2, _context: a2 };
      return a2.Consumer = a2;
    };
    react_production_min.createElement = M;
    react_production_min.createFactory = function(a2) {
      var b = M.bind(null, a2);
      b.type = a2;
      return b;
    };
    react_production_min.createRef = function() {
      return { current: null };
    };
    react_production_min.forwardRef = function(a2) {
      return { $$typeof: v2, render: a2 };
    };
    react_production_min.isValidElement = O;
    react_production_min.lazy = function(a2) {
      return { $$typeof: y, _payload: { _status: -1, _result: a2 }, _init: T };
    };
    react_production_min.memo = function(a2, b) {
      return { $$typeof: x, type: a2, compare: void 0 === b ? null : b };
    };
    react_production_min.startTransition = function(a2) {
      var b = V2.transition;
      V2.transition = {};
      try {
        a2();
      } finally {
        V2.transition = b;
      }
    };
    react_production_min.unstable_act = function() {
      throw Error("act(...) is not supported in production builds of React.");
    };
    react_production_min.useCallback = function(a2, b) {
      return U.current.useCallback(a2, b);
    };
    react_production_min.useContext = function(a2) {
      return U.current.useContext(a2);
    };
    react_production_min.useDebugValue = function() {
    };
    react_production_min.useDeferredValue = function(a2) {
      return U.current.useDeferredValue(a2);
    };
    react_production_min.useEffect = function(a2, b) {
      return U.current.useEffect(a2, b);
    };
    react_production_min.useId = function() {
      return U.current.useId();
    };
    react_production_min.useImperativeHandle = function(a2, b, e2) {
      return U.current.useImperativeHandle(a2, b, e2);
    };
    react_production_min.useInsertionEffect = function(a2, b) {
      return U.current.useInsertionEffect(a2, b);
    };
    react_production_min.useLayoutEffect = function(a2, b) {
      return U.current.useLayoutEffect(a2, b);
    };
    react_production_min.useMemo = function(a2, b) {
      return U.current.useMemo(a2, b);
    };
    react_production_min.useReducer = function(a2, b, e2) {
      return U.current.useReducer(a2, b, e2);
    };
    react_production_min.useRef = function(a2) {
      return U.current.useRef(a2);
    };
    react_production_min.useState = function(a2) {
      return U.current.useState(a2);
    };
    react_production_min.useSyncExternalStore = function(a2, b, e2) {
      return U.current.useSyncExternalStore(a2, b, e2);
    };
    react_production_min.useTransition = function() {
      return U.current.useTransition();
    };
    react_production_min.version = "18.2.0";
    return react_production_min;
  }
  var hasRequiredReact;
  function requireReact() {
    if (hasRequiredReact) return react.exports;
    hasRequiredReact = 1;
    {
      react.exports = requireReact_production_min();
    }
    return react.exports;
  }
  var hasRequiredReactJsxRuntime_production_min;
  function requireReactJsxRuntime_production_min() {
    if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
    hasRequiredReactJsxRuntime_production_min = 1;
    var f2 = requireReact(), k2 = /* @__PURE__ */ Symbol.for("react.element"), l2 = /* @__PURE__ */ Symbol.for("react.fragment"), m2 = Object.prototype.hasOwnProperty, n2 = f2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p2 = { key: true, ref: true, __self: true, __source: true };
    function q(c2, a2, g2) {
      var b, d2 = {}, e2 = null, h2 = null;
      void 0 !== g2 && (e2 = "" + g2);
      void 0 !== a2.key && (e2 = "" + a2.key);
      void 0 !== a2.ref && (h2 = a2.ref);
      for (b in a2) m2.call(a2, b) && !p2.hasOwnProperty(b) && (d2[b] = a2[b]);
      if (c2 && c2.defaultProps) for (b in a2 = c2.defaultProps, a2) void 0 === d2[b] && (d2[b] = a2[b]);
      return { $$typeof: k2, type: c2, key: e2, ref: h2, props: d2, _owner: n2.current };
    }
    reactJsxRuntime_production_min.Fragment = l2;
    reactJsxRuntime_production_min.jsx = q;
    reactJsxRuntime_production_min.jsxs = q;
    return reactJsxRuntime_production_min;
  }
  var hasRequiredJsxRuntime;
  function requireJsxRuntime() {
    if (hasRequiredJsxRuntime) return jsxRuntime.exports;
    hasRequiredJsxRuntime = 1;
    {
      jsxRuntime.exports = requireReactJsxRuntime_production_min();
    }
    return jsxRuntime.exports;
  }
  var jsxRuntimeExports = requireJsxRuntime();
  var reactExports = requireReact();
  const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
  var client = {};
  var reactDom = { exports: {} };
  var reactDom_production_min = {};
  var scheduler = { exports: {} };
  var scheduler_production_min = {};
  var hasRequiredScheduler_production_min;
  function requireScheduler_production_min() {
    if (hasRequiredScheduler_production_min) return scheduler_production_min;
    hasRequiredScheduler_production_min = 1;
    (function(exports$1) {
      function f2(a2, b) {
        var c2 = a2.length;
        a2.push(b);
        a: for (; 0 < c2; ) {
          var d2 = c2 - 1 >>> 1, e2 = a2[d2];
          if (0 < g2(e2, b)) a2[d2] = b, a2[c2] = e2, c2 = d2;
          else break a;
        }
      }
      function h2(a2) {
        return 0 === a2.length ? null : a2[0];
      }
      function k2(a2) {
        if (0 === a2.length) return null;
        var b = a2[0], c2 = a2.pop();
        if (c2 !== b) {
          a2[0] = c2;
          a: for (var d2 = 0, e2 = a2.length, w2 = e2 >>> 1; d2 < w2; ) {
            var m2 = 2 * (d2 + 1) - 1, C2 = a2[m2], n2 = m2 + 1, x = a2[n2];
            if (0 > g2(C2, c2)) n2 < e2 && 0 > g2(x, C2) ? (a2[d2] = x, a2[n2] = c2, d2 = n2) : (a2[d2] = C2, a2[m2] = c2, d2 = m2);
            else if (n2 < e2 && 0 > g2(x, c2)) a2[d2] = x, a2[n2] = c2, d2 = n2;
            else break a;
          }
        }
        return b;
      }
      function g2(a2, b) {
        var c2 = a2.sortIndex - b.sortIndex;
        return 0 !== c2 ? c2 : a2.id - b.id;
      }
      if ("object" === typeof performance && "function" === typeof performance.now) {
        var l2 = performance;
        exports$1.unstable_now = function() {
          return l2.now();
        };
      } else {
        var p2 = Date, q = p2.now();
        exports$1.unstable_now = function() {
          return p2.now() - q;
        };
      }
      var r = [], t2 = [], u2 = 1, v2 = null, y = 3, z = false, A = false, B = false, D2 = "function" === typeof setTimeout ? setTimeout : null, E2 = "function" === typeof clearTimeout ? clearTimeout : null, F2 = "undefined" !== typeof setImmediate ? setImmediate : null;
      "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function G(a2) {
        for (var b = h2(t2); null !== b; ) {
          if (null === b.callback) k2(t2);
          else if (b.startTime <= a2) k2(t2), b.sortIndex = b.expirationTime, f2(r, b);
          else break;
          b = h2(t2);
        }
      }
      function H2(a2) {
        B = false;
        G(a2);
        if (!A) if (null !== h2(r)) A = true, I(J);
        else {
          var b = h2(t2);
          null !== b && K(H2, b.startTime - a2);
        }
      }
      function J(a2, b) {
        A = false;
        B && (B = false, E2(L2), L2 = -1);
        z = true;
        var c2 = y;
        try {
          G(b);
          for (v2 = h2(r); null !== v2 && (!(v2.expirationTime > b) || a2 && !M()); ) {
            var d2 = v2.callback;
            if ("function" === typeof d2) {
              v2.callback = null;
              y = v2.priorityLevel;
              var e2 = d2(v2.expirationTime <= b);
              b = exports$1.unstable_now();
              "function" === typeof e2 ? v2.callback = e2 : v2 === h2(r) && k2(r);
              G(b);
            } else k2(r);
            v2 = h2(r);
          }
          if (null !== v2) var w2 = true;
          else {
            var m2 = h2(t2);
            null !== m2 && K(H2, m2.startTime - b);
            w2 = false;
          }
          return w2;
        } finally {
          v2 = null, y = c2, z = false;
        }
      }
      var N2 = false, O = null, L2 = -1, P2 = 5, Q2 = -1;
      function M() {
        return exports$1.unstable_now() - Q2 < P2 ? false : true;
      }
      function R() {
        if (null !== O) {
          var a2 = exports$1.unstable_now();
          Q2 = a2;
          var b = true;
          try {
            b = O(true, a2);
          } finally {
            b ? S2() : (N2 = false, O = null);
          }
        } else N2 = false;
      }
      var S2;
      if ("function" === typeof F2) S2 = function() {
        F2(R);
      };
      else if ("undefined" !== typeof MessageChannel) {
        var T = new MessageChannel(), U = T.port2;
        T.port1.onmessage = R;
        S2 = function() {
          U.postMessage(null);
        };
      } else S2 = function() {
        D2(R, 0);
      };
      function I(a2) {
        O = a2;
        N2 || (N2 = true, S2());
      }
      function K(a2, b) {
        L2 = D2(function() {
          a2(exports$1.unstable_now());
        }, b);
      }
      exports$1.unstable_IdlePriority = 5;
      exports$1.unstable_ImmediatePriority = 1;
      exports$1.unstable_LowPriority = 4;
      exports$1.unstable_NormalPriority = 3;
      exports$1.unstable_Profiling = null;
      exports$1.unstable_UserBlockingPriority = 2;
      exports$1.unstable_cancelCallback = function(a2) {
        a2.callback = null;
      };
      exports$1.unstable_continueExecution = function() {
        A || z || (A = true, I(J));
      };
      exports$1.unstable_forceFrameRate = function(a2) {
        0 > a2 || 125 < a2 ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P2 = 0 < a2 ? Math.floor(1e3 / a2) : 5;
      };
      exports$1.unstable_getCurrentPriorityLevel = function() {
        return y;
      };
      exports$1.unstable_getFirstCallbackNode = function() {
        return h2(r);
      };
      exports$1.unstable_next = function(a2) {
        switch (y) {
          case 1:
          case 2:
          case 3:
            var b = 3;
            break;
          default:
            b = y;
        }
        var c2 = y;
        y = b;
        try {
          return a2();
        } finally {
          y = c2;
        }
      };
      exports$1.unstable_pauseExecution = function() {
      };
      exports$1.unstable_requestPaint = function() {
      };
      exports$1.unstable_runWithPriority = function(a2, b) {
        switch (a2) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            a2 = 3;
        }
        var c2 = y;
        y = a2;
        try {
          return b();
        } finally {
          y = c2;
        }
      };
      exports$1.unstable_scheduleCallback = function(a2, b, c2) {
        var d2 = exports$1.unstable_now();
        "object" === typeof c2 && null !== c2 ? (c2 = c2.delay, c2 = "number" === typeof c2 && 0 < c2 ? d2 + c2 : d2) : c2 = d2;
        switch (a2) {
          case 1:
            var e2 = -1;
            break;
          case 2:
            e2 = 250;
            break;
          case 5:
            e2 = 1073741823;
            break;
          case 4:
            e2 = 1e4;
            break;
          default:
            e2 = 5e3;
        }
        e2 = c2 + e2;
        a2 = { id: u2++, callback: b, priorityLevel: a2, startTime: c2, expirationTime: e2, sortIndex: -1 };
        c2 > d2 ? (a2.sortIndex = c2, f2(t2, a2), null === h2(r) && a2 === h2(t2) && (B ? (E2(L2), L2 = -1) : B = true, K(H2, c2 - d2))) : (a2.sortIndex = e2, f2(r, a2), A || z || (A = true, I(J)));
        return a2;
      };
      exports$1.unstable_shouldYield = M;
      exports$1.unstable_wrapCallback = function(a2) {
        var b = y;
        return function() {
          var c2 = y;
          y = b;
          try {
            return a2.apply(this, arguments);
          } finally {
            y = c2;
          }
        };
      };
    })(scheduler_production_min);
    return scheduler_production_min;
  }
  var hasRequiredScheduler;
  function requireScheduler() {
    if (hasRequiredScheduler) return scheduler.exports;
    hasRequiredScheduler = 1;
    {
      scheduler.exports = requireScheduler_production_min();
    }
    return scheduler.exports;
  }
  var hasRequiredReactDom_production_min;
  function requireReactDom_production_min() {
    if (hasRequiredReactDom_production_min) return reactDom_production_min;
    hasRequiredReactDom_production_min = 1;
    var aa = requireReact(), ca = requireScheduler();
    function p2(a2) {
      for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a2, c2 = 1; c2 < arguments.length; c2++) b += "&args[]=" + encodeURIComponent(arguments[c2]);
      return "Minified React error #" + a2 + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    var da = /* @__PURE__ */ new Set(), ea = {};
    function fa(a2, b) {
      ha(a2, b);
      ha(a2 + "Capture", b);
    }
    function ha(a2, b) {
      ea[a2] = b;
      for (a2 = 0; a2 < b.length; a2++) da.add(b[a2]);
    }
    var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), ja = Object.prototype.hasOwnProperty, ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, la = {}, ma = {};
    function oa(a2) {
      if (ja.call(ma, a2)) return true;
      if (ja.call(la, a2)) return false;
      if (ka.test(a2)) return ma[a2] = true;
      la[a2] = true;
      return false;
    }
    function pa(a2, b, c2, d2) {
      if (null !== c2 && 0 === c2.type) return false;
      switch (typeof b) {
        case "function":
        case "symbol":
          return true;
        case "boolean":
          if (d2) return false;
          if (null !== c2) return !c2.acceptsBooleans;
          a2 = a2.toLowerCase().slice(0, 5);
          return "data-" !== a2 && "aria-" !== a2;
        default:
          return false;
      }
    }
    function qa(a2, b, c2, d2) {
      if (null === b || "undefined" === typeof b || pa(a2, b, c2, d2)) return true;
      if (d2) return false;
      if (null !== c2) switch (c2.type) {
        case 3:
          return !b;
        case 4:
          return false === b;
        case 5:
          return isNaN(b);
        case 6:
          return isNaN(b) || 1 > b;
      }
      return false;
    }
    function v2(a2, b, c2, d2, e2, f2, g2) {
      this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
      this.attributeName = d2;
      this.attributeNamespace = e2;
      this.mustUseProperty = c2;
      this.propertyName = a2;
      this.type = b;
      this.sanitizeURL = f2;
      this.removeEmptyString = g2;
    }
    var z = {};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a2) {
      z[a2] = new v2(a2, 0, false, a2, null, false, false);
    });
    [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a2) {
      var b = a2[0];
      z[b] = new v2(b, 1, false, a2[1], null, false, false);
    });
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a2) {
      z[a2] = new v2(a2, 2, false, a2.toLowerCase(), null, false, false);
    });
    ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a2) {
      z[a2] = new v2(a2, 2, false, a2, null, false, false);
    });
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a2) {
      z[a2] = new v2(a2, 3, false, a2.toLowerCase(), null, false, false);
    });
    ["checked", "multiple", "muted", "selected"].forEach(function(a2) {
      z[a2] = new v2(a2, 3, true, a2, null, false, false);
    });
    ["capture", "download"].forEach(function(a2) {
      z[a2] = new v2(a2, 4, false, a2, null, false, false);
    });
    ["cols", "rows", "size", "span"].forEach(function(a2) {
      z[a2] = new v2(a2, 6, false, a2, null, false, false);
    });
    ["rowSpan", "start"].forEach(function(a2) {
      z[a2] = new v2(a2, 5, false, a2.toLowerCase(), null, false, false);
    });
    var ra = /[\-:]([a-z])/g;
    function sa(a2) {
      return a2[1].toUpperCase();
    }
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a2) {
      var b = a2.replace(
        ra,
        sa
      );
      z[b] = new v2(b, 1, false, a2, null, false, false);
    });
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a2) {
      var b = a2.replace(ra, sa);
      z[b] = new v2(b, 1, false, a2, "http://www.w3.org/1999/xlink", false, false);
    });
    ["xml:base", "xml:lang", "xml:space"].forEach(function(a2) {
      var b = a2.replace(ra, sa);
      z[b] = new v2(b, 1, false, a2, "http://www.w3.org/XML/1998/namespace", false, false);
    });
    ["tabIndex", "crossOrigin"].forEach(function(a2) {
      z[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, false, false);
    });
    z.xlinkHref = new v2("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
    ["src", "href", "action", "formAction"].forEach(function(a2) {
      z[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, true, true);
    });
    function ta(a2, b, c2, d2) {
      var e2 = z.hasOwnProperty(b) ? z[b] : null;
      if (null !== e2 ? 0 !== e2.type : d2 || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c2, e2, d2) && (c2 = null), d2 || null === e2 ? oa(b) && (null === c2 ? a2.removeAttribute(b) : a2.setAttribute(b, "" + c2)) : e2.mustUseProperty ? a2[e2.propertyName] = null === c2 ? 3 === e2.type ? false : "" : c2 : (b = e2.attributeName, d2 = e2.attributeNamespace, null === c2 ? a2.removeAttribute(b) : (e2 = e2.type, c2 = 3 === e2 || 4 === e2 && true === c2 ? "" : "" + c2, d2 ? a2.setAttributeNS(d2, b, c2) : a2.setAttribute(b, c2)));
    }
    var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, va = /* @__PURE__ */ Symbol.for("react.element"), wa = /* @__PURE__ */ Symbol.for("react.portal"), ya = /* @__PURE__ */ Symbol.for("react.fragment"), za = /* @__PURE__ */ Symbol.for("react.strict_mode"), Aa = /* @__PURE__ */ Symbol.for("react.profiler"), Ba = /* @__PURE__ */ Symbol.for("react.provider"), Ca = /* @__PURE__ */ Symbol.for("react.context"), Da = /* @__PURE__ */ Symbol.for("react.forward_ref"), Ea = /* @__PURE__ */ Symbol.for("react.suspense"), Fa = /* @__PURE__ */ Symbol.for("react.suspense_list"), Ga = /* @__PURE__ */ Symbol.for("react.memo"), Ha = /* @__PURE__ */ Symbol.for("react.lazy");
    var Ia = /* @__PURE__ */ Symbol.for("react.offscreen");
    var Ja = Symbol.iterator;
    function Ka(a2) {
      if (null === a2 || "object" !== typeof a2) return null;
      a2 = Ja && a2[Ja] || a2["@@iterator"];
      return "function" === typeof a2 ? a2 : null;
    }
    var A = Object.assign, La;
    function Ma(a2) {
      if (void 0 === La) try {
        throw Error();
      } catch (c2) {
        var b = c2.stack.trim().match(/\n( *(at )?)/);
        La = b && b[1] || "";
      }
      return "\n" + La + a2;
    }
    var Na = false;
    function Oa(a2, b) {
      if (!a2 || Na) return "";
      Na = true;
      var c2 = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        if (b) if (b = function() {
          throw Error();
        }, Object.defineProperty(b.prototype, "props", { set: function() {
          throw Error();
        } }), "object" === typeof Reflect && Reflect.construct) {
          try {
            Reflect.construct(b, []);
          } catch (l2) {
            var d2 = l2;
          }
          Reflect.construct(a2, [], b);
        } else {
          try {
            b.call();
          } catch (l2) {
            d2 = l2;
          }
          a2.call(b.prototype);
        }
        else {
          try {
            throw Error();
          } catch (l2) {
            d2 = l2;
          }
          a2();
        }
      } catch (l2) {
        if (l2 && d2 && "string" === typeof l2.stack) {
          for (var e2 = l2.stack.split("\n"), f2 = d2.stack.split("\n"), g2 = e2.length - 1, h2 = f2.length - 1; 1 <= g2 && 0 <= h2 && e2[g2] !== f2[h2]; ) h2--;
          for (; 1 <= g2 && 0 <= h2; g2--, h2--) if (e2[g2] !== f2[h2]) {
            if (1 !== g2 || 1 !== h2) {
              do
                if (g2--, h2--, 0 > h2 || e2[g2] !== f2[h2]) {
                  var k2 = "\n" + e2[g2].replace(" at new ", " at ");
                  a2.displayName && k2.includes("<anonymous>") && (k2 = k2.replace("<anonymous>", a2.displayName));
                  return k2;
                }
              while (1 <= g2 && 0 <= h2);
            }
            break;
          }
        }
      } finally {
        Na = false, Error.prepareStackTrace = c2;
      }
      return (a2 = a2 ? a2.displayName || a2.name : "") ? Ma(a2) : "";
    }
    function Pa(a2) {
      switch (a2.tag) {
        case 5:
          return Ma(a2.type);
        case 16:
          return Ma("Lazy");
        case 13:
          return Ma("Suspense");
        case 19:
          return Ma("SuspenseList");
        case 0:
        case 2:
        case 15:
          return a2 = Oa(a2.type, false), a2;
        case 11:
          return a2 = Oa(a2.type.render, false), a2;
        case 1:
          return a2 = Oa(a2.type, true), a2;
        default:
          return "";
      }
    }
    function Qa(a2) {
      if (null == a2) return null;
      if ("function" === typeof a2) return a2.displayName || a2.name || null;
      if ("string" === typeof a2) return a2;
      switch (a2) {
        case ya:
          return "Fragment";
        case wa:
          return "Portal";
        case Aa:
          return "Profiler";
        case za:
          return "StrictMode";
        case Ea:
          return "Suspense";
        case Fa:
          return "SuspenseList";
      }
      if ("object" === typeof a2) switch (a2.$$typeof) {
        case Ca:
          return (a2.displayName || "Context") + ".Consumer";
        case Ba:
          return (a2._context.displayName || "Context") + ".Provider";
        case Da:
          var b = a2.render;
          a2 = a2.displayName;
          a2 || (a2 = b.displayName || b.name || "", a2 = "" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
          return a2;
        case Ga:
          return b = a2.displayName || null, null !== b ? b : Qa(a2.type) || "Memo";
        case Ha:
          b = a2._payload;
          a2 = a2._init;
          try {
            return Qa(a2(b));
          } catch (c2) {
          }
      }
      return null;
    }
    function Ra(a2) {
      var b = a2.type;
      switch (a2.tag) {
        case 24:
          return "Cache";
        case 9:
          return (b.displayName || "Context") + ".Consumer";
        case 10:
          return (b._context.displayName || "Context") + ".Provider";
        case 18:
          return "DehydratedFragment";
        case 11:
          return a2 = b.render, a2 = a2.displayName || a2.name || "", b.displayName || ("" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
        case 7:
          return "Fragment";
        case 5:
          return b;
        case 4:
          return "Portal";
        case 3:
          return "Root";
        case 6:
          return "Text";
        case 16:
          return Qa(b);
        case 8:
          return b === za ? "StrictMode" : "Mode";
        case 22:
          return "Offscreen";
        case 12:
          return "Profiler";
        case 21:
          return "Scope";
        case 13:
          return "Suspense";
        case 19:
          return "SuspenseList";
        case 25:
          return "TracingMarker";
        case 1:
        case 0:
        case 17:
        case 2:
        case 14:
        case 15:
          if ("function" === typeof b) return b.displayName || b.name || null;
          if ("string" === typeof b) return b;
      }
      return null;
    }
    function Sa(a2) {
      switch (typeof a2) {
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return a2;
        case "object":
          return a2;
        default:
          return "";
      }
    }
    function Ta(a2) {
      var b = a2.type;
      return (a2 = a2.nodeName) && "input" === a2.toLowerCase() && ("checkbox" === b || "radio" === b);
    }
    function Ua(a2) {
      var b = Ta(a2) ? "checked" : "value", c2 = Object.getOwnPropertyDescriptor(a2.constructor.prototype, b), d2 = "" + a2[b];
      if (!a2.hasOwnProperty(b) && "undefined" !== typeof c2 && "function" === typeof c2.get && "function" === typeof c2.set) {
        var e2 = c2.get, f2 = c2.set;
        Object.defineProperty(a2, b, { configurable: true, get: function() {
          return e2.call(this);
        }, set: function(a3) {
          d2 = "" + a3;
          f2.call(this, a3);
        } });
        Object.defineProperty(a2, b, { enumerable: c2.enumerable });
        return { getValue: function() {
          return d2;
        }, setValue: function(a3) {
          d2 = "" + a3;
        }, stopTracking: function() {
          a2._valueTracker = null;
          delete a2[b];
        } };
      }
    }
    function Va(a2) {
      a2._valueTracker || (a2._valueTracker = Ua(a2));
    }
    function Wa(a2) {
      if (!a2) return false;
      var b = a2._valueTracker;
      if (!b) return true;
      var c2 = b.getValue();
      var d2 = "";
      a2 && (d2 = Ta(a2) ? a2.checked ? "true" : "false" : a2.value);
      a2 = d2;
      return a2 !== c2 ? (b.setValue(a2), true) : false;
    }
    function Xa(a2) {
      a2 = a2 || ("undefined" !== typeof document ? document : void 0);
      if ("undefined" === typeof a2) return null;
      try {
        return a2.activeElement || a2.body;
      } catch (b) {
        return a2.body;
      }
    }
    function Ya(a2, b) {
      var c2 = b.checked;
      return A({}, b, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c2 ? c2 : a2._wrapperState.initialChecked });
    }
    function Za(a2, b) {
      var c2 = null == b.defaultValue ? "" : b.defaultValue, d2 = null != b.checked ? b.checked : b.defaultChecked;
      c2 = Sa(null != b.value ? b.value : c2);
      a2._wrapperState = { initialChecked: d2, initialValue: c2, controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value };
    }
    function ab(a2, b) {
      b = b.checked;
      null != b && ta(a2, "checked", b, false);
    }
    function bb(a2, b) {
      ab(a2, b);
      var c2 = Sa(b.value), d2 = b.type;
      if (null != c2) if ("number" === d2) {
        if (0 === c2 && "" === a2.value || a2.value != c2) a2.value = "" + c2;
      } else a2.value !== "" + c2 && (a2.value = "" + c2);
      else if ("submit" === d2 || "reset" === d2) {
        a2.removeAttribute("value");
        return;
      }
      b.hasOwnProperty("value") ? cb(a2, b.type, c2) : b.hasOwnProperty("defaultValue") && cb(a2, b.type, Sa(b.defaultValue));
      null == b.checked && null != b.defaultChecked && (a2.defaultChecked = !!b.defaultChecked);
    }
    function db(a2, b, c2) {
      if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
        var d2 = b.type;
        if (!("submit" !== d2 && "reset" !== d2 || void 0 !== b.value && null !== b.value)) return;
        b = "" + a2._wrapperState.initialValue;
        c2 || b === a2.value || (a2.value = b);
        a2.defaultValue = b;
      }
      c2 = a2.name;
      "" !== c2 && (a2.name = "");
      a2.defaultChecked = !!a2._wrapperState.initialChecked;
      "" !== c2 && (a2.name = c2);
    }
    function cb(a2, b, c2) {
      if ("number" !== b || Xa(a2.ownerDocument) !== a2) null == c2 ? a2.defaultValue = "" + a2._wrapperState.initialValue : a2.defaultValue !== "" + c2 && (a2.defaultValue = "" + c2);
    }
    var eb = Array.isArray;
    function fb(a2, b, c2, d2) {
      a2 = a2.options;
      if (b) {
        b = {};
        for (var e2 = 0; e2 < c2.length; e2++) b["$" + c2[e2]] = true;
        for (c2 = 0; c2 < a2.length; c2++) e2 = b.hasOwnProperty("$" + a2[c2].value), a2[c2].selected !== e2 && (a2[c2].selected = e2), e2 && d2 && (a2[c2].defaultSelected = true);
      } else {
        c2 = "" + Sa(c2);
        b = null;
        for (e2 = 0; e2 < a2.length; e2++) {
          if (a2[e2].value === c2) {
            a2[e2].selected = true;
            d2 && (a2[e2].defaultSelected = true);
            return;
          }
          null !== b || a2[e2].disabled || (b = a2[e2]);
        }
        null !== b && (b.selected = true);
      }
    }
    function gb(a2, b) {
      if (null != b.dangerouslySetInnerHTML) throw Error(p2(91));
      return A({}, b, { value: void 0, defaultValue: void 0, children: "" + a2._wrapperState.initialValue });
    }
    function hb(a2, b) {
      var c2 = b.value;
      if (null == c2) {
        c2 = b.children;
        b = b.defaultValue;
        if (null != c2) {
          if (null != b) throw Error(p2(92));
          if (eb(c2)) {
            if (1 < c2.length) throw Error(p2(93));
            c2 = c2[0];
          }
          b = c2;
        }
        null == b && (b = "");
        c2 = b;
      }
      a2._wrapperState = { initialValue: Sa(c2) };
    }
    function ib(a2, b) {
      var c2 = Sa(b.value), d2 = Sa(b.defaultValue);
      null != c2 && (c2 = "" + c2, c2 !== a2.value && (a2.value = c2), null == b.defaultValue && a2.defaultValue !== c2 && (a2.defaultValue = c2));
      null != d2 && (a2.defaultValue = "" + d2);
    }
    function jb(a2) {
      var b = a2.textContent;
      b === a2._wrapperState.initialValue && "" !== b && null !== b && (a2.value = b);
    }
    function kb(a2) {
      switch (a2) {
        case "svg":
          return "http://www.w3.org/2000/svg";
        case "math":
          return "http://www.w3.org/1998/Math/MathML";
        default:
          return "http://www.w3.org/1999/xhtml";
      }
    }
    function lb(a2, b) {
      return null == a2 || "http://www.w3.org/1999/xhtml" === a2 ? kb(b) : "http://www.w3.org/2000/svg" === a2 && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a2;
    }
    var mb, nb = (function(a2) {
      return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c2, d2, e2) {
        MSApp.execUnsafeLocalFunction(function() {
          return a2(b, c2, d2, e2);
        });
      } : a2;
    })(function(a2, b) {
      if ("http://www.w3.org/2000/svg" !== a2.namespaceURI || "innerHTML" in a2) a2.innerHTML = b;
      else {
        mb = mb || document.createElement("div");
        mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
        for (b = mb.firstChild; a2.firstChild; ) a2.removeChild(a2.firstChild);
        for (; b.firstChild; ) a2.appendChild(b.firstChild);
      }
    });
    function ob(a2, b) {
      if (b) {
        var c2 = a2.firstChild;
        if (c2 && c2 === a2.lastChild && 3 === c2.nodeType) {
          c2.nodeValue = b;
          return;
        }
      }
      a2.textContent = b;
    }
    var pb = {
      animationIterationCount: true,
      aspectRatio: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridArea: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    }, qb = ["Webkit", "ms", "Moz", "O"];
    Object.keys(pb).forEach(function(a2) {
      qb.forEach(function(b) {
        b = b + a2.charAt(0).toUpperCase() + a2.substring(1);
        pb[b] = pb[a2];
      });
    });
    function rb(a2, b, c2) {
      return null == b || "boolean" === typeof b || "" === b ? "" : c2 || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a2) && pb[a2] ? ("" + b).trim() : b + "px";
    }
    function sb(a2, b) {
      a2 = a2.style;
      for (var c2 in b) if (b.hasOwnProperty(c2)) {
        var d2 = 0 === c2.indexOf("--"), e2 = rb(c2, b[c2], d2);
        "float" === c2 && (c2 = "cssFloat");
        d2 ? a2.setProperty(c2, e2) : a2[c2] = e2;
      }
    }
    var tb = A({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
    function ub(a2, b) {
      if (b) {
        if (tb[a2] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p2(137, a2));
        if (null != b.dangerouslySetInnerHTML) {
          if (null != b.children) throw Error(p2(60));
          if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p2(61));
        }
        if (null != b.style && "object" !== typeof b.style) throw Error(p2(62));
      }
    }
    function vb(a2, b) {
      if (-1 === a2.indexOf("-")) return "string" === typeof b.is;
      switch (a2) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return false;
        default:
          return true;
      }
    }
    var wb = null;
    function xb(a2) {
      a2 = a2.target || a2.srcElement || window;
      a2.correspondingUseElement && (a2 = a2.correspondingUseElement);
      return 3 === a2.nodeType ? a2.parentNode : a2;
    }
    var yb = null, zb = null, Ab = null;
    function Bb(a2) {
      if (a2 = Cb(a2)) {
        if ("function" !== typeof yb) throw Error(p2(280));
        var b = a2.stateNode;
        b && (b = Db(b), yb(a2.stateNode, a2.type, b));
      }
    }
    function Eb(a2) {
      zb ? Ab ? Ab.push(a2) : Ab = [a2] : zb = a2;
    }
    function Fb() {
      if (zb) {
        var a2 = zb, b = Ab;
        Ab = zb = null;
        Bb(a2);
        if (b) for (a2 = 0; a2 < b.length; a2++) Bb(b[a2]);
      }
    }
    function Gb(a2, b) {
      return a2(b);
    }
    function Hb() {
    }
    var Ib = false;
    function Jb(a2, b, c2) {
      if (Ib) return a2(b, c2);
      Ib = true;
      try {
        return Gb(a2, b, c2);
      } finally {
        if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
      }
    }
    function Kb(a2, b) {
      var c2 = a2.stateNode;
      if (null === c2) return null;
      var d2 = Db(c2);
      if (null === d2) return null;
      c2 = d2[b];
      a: switch (b) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (d2 = !d2.disabled) || (a2 = a2.type, d2 = !("button" === a2 || "input" === a2 || "select" === a2 || "textarea" === a2));
          a2 = !d2;
          break a;
        default:
          a2 = false;
      }
      if (a2) return null;
      if (c2 && "function" !== typeof c2) throw Error(p2(231, b, typeof c2));
      return c2;
    }
    var Lb = false;
    if (ia) try {
      var Mb = {};
      Object.defineProperty(Mb, "passive", { get: function() {
        Lb = true;
      } });
      window.addEventListener("test", Mb, Mb);
      window.removeEventListener("test", Mb, Mb);
    } catch (a2) {
      Lb = false;
    }
    function Nb(a2, b, c2, d2, e2, f2, g2, h2, k2) {
      var l2 = Array.prototype.slice.call(arguments, 3);
      try {
        b.apply(c2, l2);
      } catch (m2) {
        this.onError(m2);
      }
    }
    var Ob = false, Pb = null, Qb = false, Rb = null, Sb = { onError: function(a2) {
      Ob = true;
      Pb = a2;
    } };
    function Tb(a2, b, c2, d2, e2, f2, g2, h2, k2) {
      Ob = false;
      Pb = null;
      Nb.apply(Sb, arguments);
    }
    function Ub(a2, b, c2, d2, e2, f2, g2, h2, k2) {
      Tb.apply(this, arguments);
      if (Ob) {
        if (Ob) {
          var l2 = Pb;
          Ob = false;
          Pb = null;
        } else throw Error(p2(198));
        Qb || (Qb = true, Rb = l2);
      }
    }
    function Vb(a2) {
      var b = a2, c2 = a2;
      if (a2.alternate) for (; b.return; ) b = b.return;
      else {
        a2 = b;
        do
          b = a2, 0 !== (b.flags & 4098) && (c2 = b.return), a2 = b.return;
        while (a2);
      }
      return 3 === b.tag ? c2 : null;
    }
    function Wb(a2) {
      if (13 === a2.tag) {
        var b = a2.memoizedState;
        null === b && (a2 = a2.alternate, null !== a2 && (b = a2.memoizedState));
        if (null !== b) return b.dehydrated;
      }
      return null;
    }
    function Xb(a2) {
      if (Vb(a2) !== a2) throw Error(p2(188));
    }
    function Yb(a2) {
      var b = a2.alternate;
      if (!b) {
        b = Vb(a2);
        if (null === b) throw Error(p2(188));
        return b !== a2 ? null : a2;
      }
      for (var c2 = a2, d2 = b; ; ) {
        var e2 = c2.return;
        if (null === e2) break;
        var f2 = e2.alternate;
        if (null === f2) {
          d2 = e2.return;
          if (null !== d2) {
            c2 = d2;
            continue;
          }
          break;
        }
        if (e2.child === f2.child) {
          for (f2 = e2.child; f2; ) {
            if (f2 === c2) return Xb(e2), a2;
            if (f2 === d2) return Xb(e2), b;
            f2 = f2.sibling;
          }
          throw Error(p2(188));
        }
        if (c2.return !== d2.return) c2 = e2, d2 = f2;
        else {
          for (var g2 = false, h2 = e2.child; h2; ) {
            if (h2 === c2) {
              g2 = true;
              c2 = e2;
              d2 = f2;
              break;
            }
            if (h2 === d2) {
              g2 = true;
              d2 = e2;
              c2 = f2;
              break;
            }
            h2 = h2.sibling;
          }
          if (!g2) {
            for (h2 = f2.child; h2; ) {
              if (h2 === c2) {
                g2 = true;
                c2 = f2;
                d2 = e2;
                break;
              }
              if (h2 === d2) {
                g2 = true;
                d2 = f2;
                c2 = e2;
                break;
              }
              h2 = h2.sibling;
            }
            if (!g2) throw Error(p2(189));
          }
        }
        if (c2.alternate !== d2) throw Error(p2(190));
      }
      if (3 !== c2.tag) throw Error(p2(188));
      return c2.stateNode.current === c2 ? a2 : b;
    }
    function Zb(a2) {
      a2 = Yb(a2);
      return null !== a2 ? $b(a2) : null;
    }
    function $b(a2) {
      if (5 === a2.tag || 6 === a2.tag) return a2;
      for (a2 = a2.child; null !== a2; ) {
        var b = $b(a2);
        if (null !== b) return b;
        a2 = a2.sibling;
      }
      return null;
    }
    var ac = ca.unstable_scheduleCallback, bc = ca.unstable_cancelCallback, cc = ca.unstable_shouldYield, dc = ca.unstable_requestPaint, B = ca.unstable_now, ec = ca.unstable_getCurrentPriorityLevel, fc = ca.unstable_ImmediatePriority, gc = ca.unstable_UserBlockingPriority, hc = ca.unstable_NormalPriority, ic = ca.unstable_LowPriority, jc = ca.unstable_IdlePriority, kc = null, lc = null;
    function mc(a2) {
      if (lc && "function" === typeof lc.onCommitFiberRoot) try {
        lc.onCommitFiberRoot(kc, a2, void 0, 128 === (a2.current.flags & 128));
      } catch (b) {
      }
    }
    var oc = Math.clz32 ? Math.clz32 : nc, pc = Math.log, qc = Math.LN2;
    function nc(a2) {
      a2 >>>= 0;
      return 0 === a2 ? 32 : 31 - (pc(a2) / qc | 0) | 0;
    }
    var rc = 64, sc = 4194304;
    function tc(a2) {
      switch (a2 & -a2) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return a2 & 4194240;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return a2 & 130023424;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 1073741824;
        default:
          return a2;
      }
    }
    function uc(a2, b) {
      var c2 = a2.pendingLanes;
      if (0 === c2) return 0;
      var d2 = 0, e2 = a2.suspendedLanes, f2 = a2.pingedLanes, g2 = c2 & 268435455;
      if (0 !== g2) {
        var h2 = g2 & ~e2;
        0 !== h2 ? d2 = tc(h2) : (f2 &= g2, 0 !== f2 && (d2 = tc(f2)));
      } else g2 = c2 & ~e2, 0 !== g2 ? d2 = tc(g2) : 0 !== f2 && (d2 = tc(f2));
      if (0 === d2) return 0;
      if (0 !== b && b !== d2 && 0 === (b & e2) && (e2 = d2 & -d2, f2 = b & -b, e2 >= f2 || 16 === e2 && 0 !== (f2 & 4194240))) return b;
      0 !== (d2 & 4) && (d2 |= c2 & 16);
      b = a2.entangledLanes;
      if (0 !== b) for (a2 = a2.entanglements, b &= d2; 0 < b; ) c2 = 31 - oc(b), e2 = 1 << c2, d2 |= a2[c2], b &= ~e2;
      return d2;
    }
    function vc(a2, b) {
      switch (a2) {
        case 1:
        case 2:
        case 4:
          return b + 250;
        case 8:
        case 16:
        case 32:
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return b + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return -1;
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function wc(a2, b) {
      for (var c2 = a2.suspendedLanes, d2 = a2.pingedLanes, e2 = a2.expirationTimes, f2 = a2.pendingLanes; 0 < f2; ) {
        var g2 = 31 - oc(f2), h2 = 1 << g2, k2 = e2[g2];
        if (-1 === k2) {
          if (0 === (h2 & c2) || 0 !== (h2 & d2)) e2[g2] = vc(h2, b);
        } else k2 <= b && (a2.expiredLanes |= h2);
        f2 &= ~h2;
      }
    }
    function xc(a2) {
      a2 = a2.pendingLanes & -1073741825;
      return 0 !== a2 ? a2 : a2 & 1073741824 ? 1073741824 : 0;
    }
    function yc() {
      var a2 = rc;
      rc <<= 1;
      0 === (rc & 4194240) && (rc = 64);
      return a2;
    }
    function zc(a2) {
      for (var b = [], c2 = 0; 31 > c2; c2++) b.push(a2);
      return b;
    }
    function Ac(a2, b, c2) {
      a2.pendingLanes |= b;
      536870912 !== b && (a2.suspendedLanes = 0, a2.pingedLanes = 0);
      a2 = a2.eventTimes;
      b = 31 - oc(b);
      a2[b] = c2;
    }
    function Bc(a2, b) {
      var c2 = a2.pendingLanes & ~b;
      a2.pendingLanes = b;
      a2.suspendedLanes = 0;
      a2.pingedLanes = 0;
      a2.expiredLanes &= b;
      a2.mutableReadLanes &= b;
      a2.entangledLanes &= b;
      b = a2.entanglements;
      var d2 = a2.eventTimes;
      for (a2 = a2.expirationTimes; 0 < c2; ) {
        var e2 = 31 - oc(c2), f2 = 1 << e2;
        b[e2] = 0;
        d2[e2] = -1;
        a2[e2] = -1;
        c2 &= ~f2;
      }
    }
    function Cc(a2, b) {
      var c2 = a2.entangledLanes |= b;
      for (a2 = a2.entanglements; c2; ) {
        var d2 = 31 - oc(c2), e2 = 1 << d2;
        e2 & b | a2[d2] & b && (a2[d2] |= b);
        c2 &= ~e2;
      }
    }
    var C2 = 0;
    function Dc(a2) {
      a2 &= -a2;
      return 1 < a2 ? 4 < a2 ? 0 !== (a2 & 268435455) ? 16 : 536870912 : 4 : 1;
    }
    var Ec, Fc, Gc, Hc, Ic, Jc = false, Kc = [], Lc = null, Mc = null, Nc = null, Oc = /* @__PURE__ */ new Map(), Pc = /* @__PURE__ */ new Map(), Qc = [], Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
    function Sc(a2, b) {
      switch (a2) {
        case "focusin":
        case "focusout":
          Lc = null;
          break;
        case "dragenter":
        case "dragleave":
          Mc = null;
          break;
        case "mouseover":
        case "mouseout":
          Nc = null;
          break;
        case "pointerover":
        case "pointerout":
          Oc.delete(b.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          Pc.delete(b.pointerId);
      }
    }
    function Tc(a2, b, c2, d2, e2, f2) {
      if (null === a2 || a2.nativeEvent !== f2) return a2 = { blockedOn: b, domEventName: c2, eventSystemFlags: d2, nativeEvent: f2, targetContainers: [e2] }, null !== b && (b = Cb(b), null !== b && Fc(b)), a2;
      a2.eventSystemFlags |= d2;
      b = a2.targetContainers;
      null !== e2 && -1 === b.indexOf(e2) && b.push(e2);
      return a2;
    }
    function Uc(a2, b, c2, d2, e2) {
      switch (b) {
        case "focusin":
          return Lc = Tc(Lc, a2, b, c2, d2, e2), true;
        case "dragenter":
          return Mc = Tc(Mc, a2, b, c2, d2, e2), true;
        case "mouseover":
          return Nc = Tc(Nc, a2, b, c2, d2, e2), true;
        case "pointerover":
          var f2 = e2.pointerId;
          Oc.set(f2, Tc(Oc.get(f2) || null, a2, b, c2, d2, e2));
          return true;
        case "gotpointercapture":
          return f2 = e2.pointerId, Pc.set(f2, Tc(Pc.get(f2) || null, a2, b, c2, d2, e2)), true;
      }
      return false;
    }
    function Vc(a2) {
      var b = Wc(a2.target);
      if (null !== b) {
        var c2 = Vb(b);
        if (null !== c2) {
          if (b = c2.tag, 13 === b) {
            if (b = Wb(c2), null !== b) {
              a2.blockedOn = b;
              Ic(a2.priority, function() {
                Gc(c2);
              });
              return;
            }
          } else if (3 === b && c2.stateNode.current.memoizedState.isDehydrated) {
            a2.blockedOn = 3 === c2.tag ? c2.stateNode.containerInfo : null;
            return;
          }
        }
      }
      a2.blockedOn = null;
    }
    function Xc(a2) {
      if (null !== a2.blockedOn) return false;
      for (var b = a2.targetContainers; 0 < b.length; ) {
        var c2 = Yc(a2.domEventName, a2.eventSystemFlags, b[0], a2.nativeEvent);
        if (null === c2) {
          c2 = a2.nativeEvent;
          var d2 = new c2.constructor(c2.type, c2);
          wb = d2;
          c2.target.dispatchEvent(d2);
          wb = null;
        } else return b = Cb(c2), null !== b && Fc(b), a2.blockedOn = c2, false;
        b.shift();
      }
      return true;
    }
    function Zc(a2, b, c2) {
      Xc(a2) && c2.delete(b);
    }
    function $c() {
      Jc = false;
      null !== Lc && Xc(Lc) && (Lc = null);
      null !== Mc && Xc(Mc) && (Mc = null);
      null !== Nc && Xc(Nc) && (Nc = null);
      Oc.forEach(Zc);
      Pc.forEach(Zc);
    }
    function ad(a2, b) {
      a2.blockedOn === b && (a2.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
    }
    function bd(a2) {
      function b(b2) {
        return ad(b2, a2);
      }
      if (0 < Kc.length) {
        ad(Kc[0], a2);
        for (var c2 = 1; c2 < Kc.length; c2++) {
          var d2 = Kc[c2];
          d2.blockedOn === a2 && (d2.blockedOn = null);
        }
      }
      null !== Lc && ad(Lc, a2);
      null !== Mc && ad(Mc, a2);
      null !== Nc && ad(Nc, a2);
      Oc.forEach(b);
      Pc.forEach(b);
      for (c2 = 0; c2 < Qc.length; c2++) d2 = Qc[c2], d2.blockedOn === a2 && (d2.blockedOn = null);
      for (; 0 < Qc.length && (c2 = Qc[0], null === c2.blockedOn); ) Vc(c2), null === c2.blockedOn && Qc.shift();
    }
    var cd = ua.ReactCurrentBatchConfig, dd = true;
    function ed(a2, b, c2, d2) {
      var e2 = C2, f2 = cd.transition;
      cd.transition = null;
      try {
        C2 = 1, fd(a2, b, c2, d2);
      } finally {
        C2 = e2, cd.transition = f2;
      }
    }
    function gd(a2, b, c2, d2) {
      var e2 = C2, f2 = cd.transition;
      cd.transition = null;
      try {
        C2 = 4, fd(a2, b, c2, d2);
      } finally {
        C2 = e2, cd.transition = f2;
      }
    }
    function fd(a2, b, c2, d2) {
      if (dd) {
        var e2 = Yc(a2, b, c2, d2);
        if (null === e2) hd(a2, b, d2, id, c2), Sc(a2, d2);
        else if (Uc(e2, a2, b, c2, d2)) d2.stopPropagation();
        else if (Sc(a2, d2), b & 4 && -1 < Rc.indexOf(a2)) {
          for (; null !== e2; ) {
            var f2 = Cb(e2);
            null !== f2 && Ec(f2);
            f2 = Yc(a2, b, c2, d2);
            null === f2 && hd(a2, b, d2, id, c2);
            if (f2 === e2) break;
            e2 = f2;
          }
          null !== e2 && d2.stopPropagation();
        } else hd(a2, b, d2, null, c2);
      }
    }
    var id = null;
    function Yc(a2, b, c2, d2) {
      id = null;
      a2 = xb(d2);
      a2 = Wc(a2);
      if (null !== a2) if (b = Vb(a2), null === b) a2 = null;
      else if (c2 = b.tag, 13 === c2) {
        a2 = Wb(b);
        if (null !== a2) return a2;
        a2 = null;
      } else if (3 === c2) {
        if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
        a2 = null;
      } else b !== a2 && (a2 = null);
      id = a2;
      return null;
    }
    function jd(a2) {
      switch (a2) {
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 1;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "toggle":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 4;
        case "message":
          switch (ec()) {
            case fc:
              return 1;
            case gc:
              return 4;
            case hc:
            case ic:
              return 16;
            case jc:
              return 536870912;
            default:
              return 16;
          }
        default:
          return 16;
      }
    }
    var kd = null, ld = null, md = null;
    function nd() {
      if (md) return md;
      var a2, b = ld, c2 = b.length, d2, e2 = "value" in kd ? kd.value : kd.textContent, f2 = e2.length;
      for (a2 = 0; a2 < c2 && b[a2] === e2[a2]; a2++) ;
      var g2 = c2 - a2;
      for (d2 = 1; d2 <= g2 && b[c2 - d2] === e2[f2 - d2]; d2++) ;
      return md = e2.slice(a2, 1 < d2 ? 1 - d2 : void 0);
    }
    function od(a2) {
      var b = a2.keyCode;
      "charCode" in a2 ? (a2 = a2.charCode, 0 === a2 && 13 === b && (a2 = 13)) : a2 = b;
      10 === a2 && (a2 = 13);
      return 32 <= a2 || 13 === a2 ? a2 : 0;
    }
    function pd() {
      return true;
    }
    function qd() {
      return false;
    }
    function rd(a2) {
      function b(b2, d2, e2, f2, g2) {
        this._reactName = b2;
        this._targetInst = e2;
        this.type = d2;
        this.nativeEvent = f2;
        this.target = g2;
        this.currentTarget = null;
        for (var c2 in a2) a2.hasOwnProperty(c2) && (b2 = a2[c2], this[c2] = b2 ? b2(f2) : f2[c2]);
        this.isDefaultPrevented = (null != f2.defaultPrevented ? f2.defaultPrevented : false === f2.returnValue) ? pd : qd;
        this.isPropagationStopped = qd;
        return this;
      }
      A(b.prototype, { preventDefault: function() {
        this.defaultPrevented = true;
        var a3 = this.nativeEvent;
        a3 && (a3.preventDefault ? a3.preventDefault() : "unknown" !== typeof a3.returnValue && (a3.returnValue = false), this.isDefaultPrevented = pd);
      }, stopPropagation: function() {
        var a3 = this.nativeEvent;
        a3 && (a3.stopPropagation ? a3.stopPropagation() : "unknown" !== typeof a3.cancelBubble && (a3.cancelBubble = true), this.isPropagationStopped = pd);
      }, persist: function() {
      }, isPersistent: pd });
      return b;
    }
    var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a2) {
      return a2.timeStamp || Date.now();
    }, defaultPrevented: 0, isTrusted: 0 }, td = rd(sd), ud = A({}, sd, { view: 0, detail: 0 }), vd = rd(ud), wd, xd, yd, Ad = A({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a2) {
      return void 0 === a2.relatedTarget ? a2.fromElement === a2.srcElement ? a2.toElement : a2.fromElement : a2.relatedTarget;
    }, movementX: function(a2) {
      if ("movementX" in a2) return a2.movementX;
      a2 !== yd && (yd && "mousemove" === a2.type ? (wd = a2.screenX - yd.screenX, xd = a2.screenY - yd.screenY) : xd = wd = 0, yd = a2);
      return wd;
    }, movementY: function(a2) {
      return "movementY" in a2 ? a2.movementY : xd;
    } }), Bd = rd(Ad), Cd = A({}, Ad, { dataTransfer: 0 }), Dd = rd(Cd), Ed = A({}, ud, { relatedTarget: 0 }), Fd = rd(Ed), Gd = A({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Hd = rd(Gd), Id = A({}, sd, { clipboardData: function(a2) {
      return "clipboardData" in a2 ? a2.clipboardData : window.clipboardData;
    } }), Jd = rd(Id), Kd = A({}, sd, { data: 0 }), Ld = rd(Kd), Md = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    }, Nd = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    }, Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function Pd(a2) {
      var b = this.nativeEvent;
      return b.getModifierState ? b.getModifierState(a2) : (a2 = Od[a2]) ? !!b[a2] : false;
    }
    function zd() {
      return Pd;
    }
    var Qd = A({}, ud, { key: function(a2) {
      if (a2.key) {
        var b = Md[a2.key] || a2.key;
        if ("Unidentified" !== b) return b;
      }
      return "keypress" === a2.type ? (a2 = od(a2), 13 === a2 ? "Enter" : String.fromCharCode(a2)) : "keydown" === a2.type || "keyup" === a2.type ? Nd[a2.keyCode] || "Unidentified" : "";
    }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a2) {
      return "keypress" === a2.type ? od(a2) : 0;
    }, keyCode: function(a2) {
      return "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
    }, which: function(a2) {
      return "keypress" === a2.type ? od(a2) : "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
    } }), Rd = rd(Qd), Sd = A({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Td = rd(Sd), Ud = A({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd }), Vd = rd(Ud), Wd = A({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Xd = rd(Wd), Yd = A({}, Ad, {
      deltaX: function(a2) {
        return "deltaX" in a2 ? a2.deltaX : "wheelDeltaX" in a2 ? -a2.wheelDeltaX : 0;
      },
      deltaY: function(a2) {
        return "deltaY" in a2 ? a2.deltaY : "wheelDeltaY" in a2 ? -a2.wheelDeltaY : "wheelDelta" in a2 ? -a2.wheelDelta : 0;
      },
      deltaZ: 0,
      deltaMode: 0
    }), Zd = rd(Yd), $d = [9, 13, 27, 32], ae = ia && "CompositionEvent" in window, be2 = null;
    ia && "documentMode" in document && (be2 = document.documentMode);
    var ce2 = ia && "TextEvent" in window && !be2, de2 = ia && (!ae || be2 && 8 < be2 && 11 >= be2), ee = String.fromCharCode(32), fe = false;
    function ge2(a2, b) {
      switch (a2) {
        case "keyup":
          return -1 !== $d.indexOf(b.keyCode);
        case "keydown":
          return 229 !== b.keyCode;
        case "keypress":
        case "mousedown":
        case "focusout":
          return true;
        default:
          return false;
      }
    }
    function he2(a2) {
      a2 = a2.detail;
      return "object" === typeof a2 && "data" in a2 ? a2.data : null;
    }
    var ie2 = false;
    function je(a2, b) {
      switch (a2) {
        case "compositionend":
          return he2(b);
        case "keypress":
          if (32 !== b.which) return null;
          fe = true;
          return ee;
        case "textInput":
          return a2 = b.data, a2 === ee && fe ? null : a2;
        default:
          return null;
      }
    }
    function ke2(a2, b) {
      if (ie2) return "compositionend" === a2 || !ae && ge2(a2, b) ? (a2 = nd(), md = ld = kd = null, ie2 = false, a2) : null;
      switch (a2) {
        case "paste":
          return null;
        case "keypress":
          if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
            if (b.char && 1 < b.char.length) return b.char;
            if (b.which) return String.fromCharCode(b.which);
          }
          return null;
        case "compositionend":
          return de2 && "ko" !== b.locale ? null : b.data;
        default:
          return null;
      }
    }
    var le2 = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
    function me2(a2) {
      var b = a2 && a2.nodeName && a2.nodeName.toLowerCase();
      return "input" === b ? !!le2[a2.type] : "textarea" === b ? true : false;
    }
    function ne(a2, b, c2, d2) {
      Eb(d2);
      b = oe(b, "onChange");
      0 < b.length && (c2 = new td("onChange", "change", null, c2, d2), a2.push({ event: c2, listeners: b }));
    }
    var pe = null, qe = null;
    function re2(a2) {
      se2(a2, 0);
    }
    function te(a2) {
      var b = ue(a2);
      if (Wa(b)) return a2;
    }
    function ve2(a2, b) {
      if ("change" === a2) return b;
    }
    var we2 = false;
    if (ia) {
      var xe;
      if (ia) {
        var ye = "oninput" in document;
        if (!ye) {
          var ze = document.createElement("div");
          ze.setAttribute("oninput", "return;");
          ye = "function" === typeof ze.oninput;
        }
        xe = ye;
      } else xe = false;
      we2 = xe && (!document.documentMode || 9 < document.documentMode);
    }
    function Ae2() {
      pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
    }
    function Be(a2) {
      if ("value" === a2.propertyName && te(qe)) {
        var b = [];
        ne(b, qe, a2, xb(a2));
        Jb(re2, b);
      }
    }
    function Ce2(a2, b, c2) {
      "focusin" === a2 ? (Ae2(), pe = b, qe = c2, pe.attachEvent("onpropertychange", Be)) : "focusout" === a2 && Ae2();
    }
    function De2(a2) {
      if ("selectionchange" === a2 || "keyup" === a2 || "keydown" === a2) return te(qe);
    }
    function Ee2(a2, b) {
      if ("click" === a2) return te(b);
    }
    function Fe2(a2, b) {
      if ("input" === a2 || "change" === a2) return te(b);
    }
    function Ge(a2, b) {
      return a2 === b && (0 !== a2 || 1 / a2 === 1 / b) || a2 !== a2 && b !== b;
    }
    var He = "function" === typeof Object.is ? Object.is : Ge;
    function Ie2(a2, b) {
      if (He(a2, b)) return true;
      if ("object" !== typeof a2 || null === a2 || "object" !== typeof b || null === b) return false;
      var c2 = Object.keys(a2), d2 = Object.keys(b);
      if (c2.length !== d2.length) return false;
      for (d2 = 0; d2 < c2.length; d2++) {
        var e2 = c2[d2];
        if (!ja.call(b, e2) || !He(a2[e2], b[e2])) return false;
      }
      return true;
    }
    function Je(a2) {
      for (; a2 && a2.firstChild; ) a2 = a2.firstChild;
      return a2;
    }
    function Ke(a2, b) {
      var c2 = Je(a2);
      a2 = 0;
      for (var d2; c2; ) {
        if (3 === c2.nodeType) {
          d2 = a2 + c2.textContent.length;
          if (a2 <= b && d2 >= b) return { node: c2, offset: b - a2 };
          a2 = d2;
        }
        a: {
          for (; c2; ) {
            if (c2.nextSibling) {
              c2 = c2.nextSibling;
              break a;
            }
            c2 = c2.parentNode;
          }
          c2 = void 0;
        }
        c2 = Je(c2);
      }
    }
    function Le(a2, b) {
      return a2 && b ? a2 === b ? true : a2 && 3 === a2.nodeType ? false : b && 3 === b.nodeType ? Le(a2, b.parentNode) : "contains" in a2 ? a2.contains(b) : a2.compareDocumentPosition ? !!(a2.compareDocumentPosition(b) & 16) : false : false;
    }
    function Me2() {
      for (var a2 = window, b = Xa(); b instanceof a2.HTMLIFrameElement; ) {
        try {
          var c2 = "string" === typeof b.contentWindow.location.href;
        } catch (d2) {
          c2 = false;
        }
        if (c2) a2 = b.contentWindow;
        else break;
        b = Xa(a2.document);
      }
      return b;
    }
    function Ne(a2) {
      var b = a2 && a2.nodeName && a2.nodeName.toLowerCase();
      return b && ("input" === b && ("text" === a2.type || "search" === a2.type || "tel" === a2.type || "url" === a2.type || "password" === a2.type) || "textarea" === b || "true" === a2.contentEditable);
    }
    function Oe2(a2) {
      var b = Me2(), c2 = a2.focusedElem, d2 = a2.selectionRange;
      if (b !== c2 && c2 && c2.ownerDocument && Le(c2.ownerDocument.documentElement, c2)) {
        if (null !== d2 && Ne(c2)) {
          if (b = d2.start, a2 = d2.end, void 0 === a2 && (a2 = b), "selectionStart" in c2) c2.selectionStart = b, c2.selectionEnd = Math.min(a2, c2.value.length);
          else if (a2 = (b = c2.ownerDocument || document) && b.defaultView || window, a2.getSelection) {
            a2 = a2.getSelection();
            var e2 = c2.textContent.length, f2 = Math.min(d2.start, e2);
            d2 = void 0 === d2.end ? f2 : Math.min(d2.end, e2);
            !a2.extend && f2 > d2 && (e2 = d2, d2 = f2, f2 = e2);
            e2 = Ke(c2, f2);
            var g2 = Ke(
              c2,
              d2
            );
            e2 && g2 && (1 !== a2.rangeCount || a2.anchorNode !== e2.node || a2.anchorOffset !== e2.offset || a2.focusNode !== g2.node || a2.focusOffset !== g2.offset) && (b = b.createRange(), b.setStart(e2.node, e2.offset), a2.removeAllRanges(), f2 > d2 ? (a2.addRange(b), a2.extend(g2.node, g2.offset)) : (b.setEnd(g2.node, g2.offset), a2.addRange(b)));
          }
        }
        b = [];
        for (a2 = c2; a2 = a2.parentNode; ) 1 === a2.nodeType && b.push({ element: a2, left: a2.scrollLeft, top: a2.scrollTop });
        "function" === typeof c2.focus && c2.focus();
        for (c2 = 0; c2 < b.length; c2++) a2 = b[c2], a2.element.scrollLeft = a2.left, a2.element.scrollTop = a2.top;
      }
    }
    var Pe2 = ia && "documentMode" in document && 11 >= document.documentMode, Qe = null, Re2 = null, Se2 = null, Te2 = false;
    function Ue(a2, b, c2) {
      var d2 = c2.window === c2 ? c2.document : 9 === c2.nodeType ? c2 : c2.ownerDocument;
      Te2 || null == Qe || Qe !== Xa(d2) || (d2 = Qe, "selectionStart" in d2 && Ne(d2) ? d2 = { start: d2.selectionStart, end: d2.selectionEnd } : (d2 = (d2.ownerDocument && d2.ownerDocument.defaultView || window).getSelection(), d2 = { anchorNode: d2.anchorNode, anchorOffset: d2.anchorOffset, focusNode: d2.focusNode, focusOffset: d2.focusOffset }), Se2 && Ie2(Se2, d2) || (Se2 = d2, d2 = oe(Re2, "onSelect"), 0 < d2.length && (b = new td("onSelect", "select", null, b, c2), a2.push({ event: b, listeners: d2 }), b.target = Qe)));
    }
    function Ve(a2, b) {
      var c2 = {};
      c2[a2.toLowerCase()] = b.toLowerCase();
      c2["Webkit" + a2] = "webkit" + b;
      c2["Moz" + a2] = "moz" + b;
      return c2;
    }
    var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") }, Xe = {}, Ye = {};
    ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
    function Ze(a2) {
      if (Xe[a2]) return Xe[a2];
      if (!We[a2]) return a2;
      var b = We[a2], c2;
      for (c2 in b) if (b.hasOwnProperty(c2) && c2 in Ye) return Xe[a2] = b[c2];
      return a2;
    }
    var $e = Ze("animationend"), af = Ze("animationiteration"), bf = Ze("animationstart"), cf = Ze("transitionend"), df = /* @__PURE__ */ new Map(), ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    function ff(a2, b) {
      df.set(a2, b);
      fa(b, [a2]);
    }
    for (var gf = 0; gf < ef.length; gf++) {
      var hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
      ff(jf, "on" + kf);
    }
    ff($e, "onAnimationEnd");
    ff(af, "onAnimationIteration");
    ff(bf, "onAnimationStart");
    ff("dblclick", "onDoubleClick");
    ff("focusin", "onFocus");
    ff("focusout", "onBlur");
    ff(cf, "onTransitionEnd");
    ha("onMouseEnter", ["mouseout", "mouseover"]);
    ha("onMouseLeave", ["mouseout", "mouseover"]);
    ha("onPointerEnter", ["pointerout", "pointerover"]);
    ha("onPointerLeave", ["pointerout", "pointerover"]);
    fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
    fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
    fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
    fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
    fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
    fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
    function nf(a2, b, c2) {
      var d2 = a2.type || "unknown-event";
      a2.currentTarget = c2;
      Ub(d2, b, void 0, a2);
      a2.currentTarget = null;
    }
    function se2(a2, b) {
      b = 0 !== (b & 4);
      for (var c2 = 0; c2 < a2.length; c2++) {
        var d2 = a2[c2], e2 = d2.event;
        d2 = d2.listeners;
        a: {
          var f2 = void 0;
          if (b) for (var g2 = d2.length - 1; 0 <= g2; g2--) {
            var h2 = d2[g2], k2 = h2.instance, l2 = h2.currentTarget;
            h2 = h2.listener;
            if (k2 !== f2 && e2.isPropagationStopped()) break a;
            nf(e2, h2, l2);
            f2 = k2;
          }
          else for (g2 = 0; g2 < d2.length; g2++) {
            h2 = d2[g2];
            k2 = h2.instance;
            l2 = h2.currentTarget;
            h2 = h2.listener;
            if (k2 !== f2 && e2.isPropagationStopped()) break a;
            nf(e2, h2, l2);
            f2 = k2;
          }
        }
      }
      if (Qb) throw a2 = Rb, Qb = false, Rb = null, a2;
    }
    function D2(a2, b) {
      var c2 = b[of];
      void 0 === c2 && (c2 = b[of] = /* @__PURE__ */ new Set());
      var d2 = a2 + "__bubble";
      c2.has(d2) || (pf(b, a2, 2, false), c2.add(d2));
    }
    function qf(a2, b, c2) {
      var d2 = 0;
      b && (d2 |= 4);
      pf(c2, a2, d2, b);
    }
    var rf = "_reactListening" + Math.random().toString(36).slice(2);
    function sf(a2) {
      if (!a2[rf]) {
        a2[rf] = true;
        da.forEach(function(b2) {
          "selectionchange" !== b2 && (mf.has(b2) || qf(b2, false, a2), qf(b2, true, a2));
        });
        var b = 9 === a2.nodeType ? a2 : a2.ownerDocument;
        null === b || b[rf] || (b[rf] = true, qf("selectionchange", false, b));
      }
    }
    function pf(a2, b, c2, d2) {
      switch (jd(b)) {
        case 1:
          var e2 = ed;
          break;
        case 4:
          e2 = gd;
          break;
        default:
          e2 = fd;
      }
      c2 = e2.bind(null, b, c2, a2);
      e2 = void 0;
      !Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e2 = true);
      d2 ? void 0 !== e2 ? a2.addEventListener(b, c2, { capture: true, passive: e2 }) : a2.addEventListener(b, c2, true) : void 0 !== e2 ? a2.addEventListener(b, c2, { passive: e2 }) : a2.addEventListener(b, c2, false);
    }
    function hd(a2, b, c2, d2, e2) {
      var f2 = d2;
      if (0 === (b & 1) && 0 === (b & 2) && null !== d2) a: for (; ; ) {
        if (null === d2) return;
        var g2 = d2.tag;
        if (3 === g2 || 4 === g2) {
          var h2 = d2.stateNode.containerInfo;
          if (h2 === e2 || 8 === h2.nodeType && h2.parentNode === e2) break;
          if (4 === g2) for (g2 = d2.return; null !== g2; ) {
            var k2 = g2.tag;
            if (3 === k2 || 4 === k2) {
              if (k2 = g2.stateNode.containerInfo, k2 === e2 || 8 === k2.nodeType && k2.parentNode === e2) return;
            }
            g2 = g2.return;
          }
          for (; null !== h2; ) {
            g2 = Wc(h2);
            if (null === g2) return;
            k2 = g2.tag;
            if (5 === k2 || 6 === k2) {
              d2 = f2 = g2;
              continue a;
            }
            h2 = h2.parentNode;
          }
        }
        d2 = d2.return;
      }
      Jb(function() {
        var d3 = f2, e3 = xb(c2), g3 = [];
        a: {
          var h3 = df.get(a2);
          if (void 0 !== h3) {
            var k3 = td, n2 = a2;
            switch (a2) {
              case "keypress":
                if (0 === od(c2)) break a;
              case "keydown":
              case "keyup":
                k3 = Rd;
                break;
              case "focusin":
                n2 = "focus";
                k3 = Fd;
                break;
              case "focusout":
                n2 = "blur";
                k3 = Fd;
                break;
              case "beforeblur":
              case "afterblur":
                k3 = Fd;
                break;
              case "click":
                if (2 === c2.button) break a;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                k3 = Bd;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                k3 = Dd;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                k3 = Vd;
                break;
              case $e:
              case af:
              case bf:
                k3 = Hd;
                break;
              case cf:
                k3 = Xd;
                break;
              case "scroll":
                k3 = vd;
                break;
              case "wheel":
                k3 = Zd;
                break;
              case "copy":
              case "cut":
              case "paste":
                k3 = Jd;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                k3 = Td;
            }
            var t2 = 0 !== (b & 4), J = !t2 && "scroll" === a2, x = t2 ? null !== h3 ? h3 + "Capture" : null : h3;
            t2 = [];
            for (var w2 = d3, u2; null !== w2; ) {
              u2 = w2;
              var F2 = u2.stateNode;
              5 === u2.tag && null !== F2 && (u2 = F2, null !== x && (F2 = Kb(w2, x), null != F2 && t2.push(tf(w2, F2, u2))));
              if (J) break;
              w2 = w2.return;
            }
            0 < t2.length && (h3 = new k3(h3, n2, null, c2, e3), g3.push({ event: h3, listeners: t2 }));
          }
        }
        if (0 === (b & 7)) {
          a: {
            h3 = "mouseover" === a2 || "pointerover" === a2;
            k3 = "mouseout" === a2 || "pointerout" === a2;
            if (h3 && c2 !== wb && (n2 = c2.relatedTarget || c2.fromElement) && (Wc(n2) || n2[uf])) break a;
            if (k3 || h3) {
              h3 = e3.window === e3 ? e3 : (h3 = e3.ownerDocument) ? h3.defaultView || h3.parentWindow : window;
              if (k3) {
                if (n2 = c2.relatedTarget || c2.toElement, k3 = d3, n2 = n2 ? Wc(n2) : null, null !== n2 && (J = Vb(n2), n2 !== J || 5 !== n2.tag && 6 !== n2.tag)) n2 = null;
              } else k3 = null, n2 = d3;
              if (k3 !== n2) {
                t2 = Bd;
                F2 = "onMouseLeave";
                x = "onMouseEnter";
                w2 = "mouse";
                if ("pointerout" === a2 || "pointerover" === a2) t2 = Td, F2 = "onPointerLeave", x = "onPointerEnter", w2 = "pointer";
                J = null == k3 ? h3 : ue(k3);
                u2 = null == n2 ? h3 : ue(n2);
                h3 = new t2(F2, w2 + "leave", k3, c2, e3);
                h3.target = J;
                h3.relatedTarget = u2;
                F2 = null;
                Wc(e3) === d3 && (t2 = new t2(x, w2 + "enter", n2, c2, e3), t2.target = u2, t2.relatedTarget = J, F2 = t2);
                J = F2;
                if (k3 && n2) b: {
                  t2 = k3;
                  x = n2;
                  w2 = 0;
                  for (u2 = t2; u2; u2 = vf(u2)) w2++;
                  u2 = 0;
                  for (F2 = x; F2; F2 = vf(F2)) u2++;
                  for (; 0 < w2 - u2; ) t2 = vf(t2), w2--;
                  for (; 0 < u2 - w2; ) x = vf(x), u2--;
                  for (; w2--; ) {
                    if (t2 === x || null !== x && t2 === x.alternate) break b;
                    t2 = vf(t2);
                    x = vf(x);
                  }
                  t2 = null;
                }
                else t2 = null;
                null !== k3 && wf(g3, h3, k3, t2, false);
                null !== n2 && null !== J && wf(g3, J, n2, t2, true);
              }
            }
          }
          a: {
            h3 = d3 ? ue(d3) : window;
            k3 = h3.nodeName && h3.nodeName.toLowerCase();
            if ("select" === k3 || "input" === k3 && "file" === h3.type) var na = ve2;
            else if (me2(h3)) if (we2) na = Fe2;
            else {
              na = De2;
              var xa = Ce2;
            }
            else (k3 = h3.nodeName) && "input" === k3.toLowerCase() && ("checkbox" === h3.type || "radio" === h3.type) && (na = Ee2);
            if (na && (na = na(a2, d3))) {
              ne(g3, na, c2, e3);
              break a;
            }
            xa && xa(a2, h3, d3);
            "focusout" === a2 && (xa = h3._wrapperState) && xa.controlled && "number" === h3.type && cb(h3, "number", h3.value);
          }
          xa = d3 ? ue(d3) : window;
          switch (a2) {
            case "focusin":
              if (me2(xa) || "true" === xa.contentEditable) Qe = xa, Re2 = d3, Se2 = null;
              break;
            case "focusout":
              Se2 = Re2 = Qe = null;
              break;
            case "mousedown":
              Te2 = true;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              Te2 = false;
              Ue(g3, c2, e3);
              break;
            case "selectionchange":
              if (Pe2) break;
            case "keydown":
            case "keyup":
              Ue(g3, c2, e3);
          }
          var $a;
          if (ae) b: {
            switch (a2) {
              case "compositionstart":
                var ba = "onCompositionStart";
                break b;
              case "compositionend":
                ba = "onCompositionEnd";
                break b;
              case "compositionupdate":
                ba = "onCompositionUpdate";
                break b;
            }
            ba = void 0;
          }
          else ie2 ? ge2(a2, c2) && (ba = "onCompositionEnd") : "keydown" === a2 && 229 === c2.keyCode && (ba = "onCompositionStart");
          ba && (de2 && "ko" !== c2.locale && (ie2 || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie2 && ($a = nd()) : (kd = e3, ld = "value" in kd ? kd.value : kd.textContent, ie2 = true)), xa = oe(d3, ba), 0 < xa.length && (ba = new Ld(ba, a2, null, c2, e3), g3.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he2(c2), null !== $a && (ba.data = $a))));
          if ($a = ce2 ? je(a2, c2) : ke2(a2, c2)) d3 = oe(d3, "onBeforeInput"), 0 < d3.length && (e3 = new Ld("onBeforeInput", "beforeinput", null, c2, e3), g3.push({ event: e3, listeners: d3 }), e3.data = $a);
        }
        se2(g3, b);
      });
    }
    function tf(a2, b, c2) {
      return { instance: a2, listener: b, currentTarget: c2 };
    }
    function oe(a2, b) {
      for (var c2 = b + "Capture", d2 = []; null !== a2; ) {
        var e2 = a2, f2 = e2.stateNode;
        5 === e2.tag && null !== f2 && (e2 = f2, f2 = Kb(a2, c2), null != f2 && d2.unshift(tf(a2, f2, e2)), f2 = Kb(a2, b), null != f2 && d2.push(tf(a2, f2, e2)));
        a2 = a2.return;
      }
      return d2;
    }
    function vf(a2) {
      if (null === a2) return null;
      do
        a2 = a2.return;
      while (a2 && 5 !== a2.tag);
      return a2 ? a2 : null;
    }
    function wf(a2, b, c2, d2, e2) {
      for (var f2 = b._reactName, g2 = []; null !== c2 && c2 !== d2; ) {
        var h2 = c2, k2 = h2.alternate, l2 = h2.stateNode;
        if (null !== k2 && k2 === d2) break;
        5 === h2.tag && null !== l2 && (h2 = l2, e2 ? (k2 = Kb(c2, f2), null != k2 && g2.unshift(tf(c2, k2, h2))) : e2 || (k2 = Kb(c2, f2), null != k2 && g2.push(tf(c2, k2, h2))));
        c2 = c2.return;
      }
      0 !== g2.length && a2.push({ event: b, listeners: g2 });
    }
    var xf = /\r\n?/g, yf = /\u0000|\uFFFD/g;
    function zf(a2) {
      return ("string" === typeof a2 ? a2 : "" + a2).replace(xf, "\n").replace(yf, "");
    }
    function Af(a2, b, c2) {
      b = zf(b);
      if (zf(a2) !== b && c2) throw Error(p2(425));
    }
    function Bf() {
    }
    var Cf = null, Df = null;
    function Ef(a2, b) {
      return "textarea" === a2 || "noscript" === a2 || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
    }
    var Ff = "function" === typeof setTimeout ? setTimeout : void 0, Gf = "function" === typeof clearTimeout ? clearTimeout : void 0, Hf = "function" === typeof Promise ? Promise : void 0, Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a2) {
      return Hf.resolve(null).then(a2).catch(If);
    } : Ff;
    function If(a2) {
      setTimeout(function() {
        throw a2;
      });
    }
    function Kf(a2, b) {
      var c2 = b, d2 = 0;
      do {
        var e2 = c2.nextSibling;
        a2.removeChild(c2);
        if (e2 && 8 === e2.nodeType) if (c2 = e2.data, "/$" === c2) {
          if (0 === d2) {
            a2.removeChild(e2);
            bd(b);
            return;
          }
          d2--;
        } else "$" !== c2 && "$?" !== c2 && "$!" !== c2 || d2++;
        c2 = e2;
      } while (c2);
      bd(b);
    }
    function Lf(a2) {
      for (; null != a2; a2 = a2.nextSibling) {
        var b = a2.nodeType;
        if (1 === b || 3 === b) break;
        if (8 === b) {
          b = a2.data;
          if ("$" === b || "$!" === b || "$?" === b) break;
          if ("/$" === b) return null;
        }
      }
      return a2;
    }
    function Mf(a2) {
      a2 = a2.previousSibling;
      for (var b = 0; a2; ) {
        if (8 === a2.nodeType) {
          var c2 = a2.data;
          if ("$" === c2 || "$!" === c2 || "$?" === c2) {
            if (0 === b) return a2;
            b--;
          } else "/$" === c2 && b++;
        }
        a2 = a2.previousSibling;
      }
      return null;
    }
    var Nf = Math.random().toString(36).slice(2), Of = "__reactFiber$" + Nf, Pf = "__reactProps$" + Nf, uf = "__reactContainer$" + Nf, of = "__reactEvents$" + Nf, Qf = "__reactListeners$" + Nf, Rf = "__reactHandles$" + Nf;
    function Wc(a2) {
      var b = a2[Of];
      if (b) return b;
      for (var c2 = a2.parentNode; c2; ) {
        if (b = c2[uf] || c2[Of]) {
          c2 = b.alternate;
          if (null !== b.child || null !== c2 && null !== c2.child) for (a2 = Mf(a2); null !== a2; ) {
            if (c2 = a2[Of]) return c2;
            a2 = Mf(a2);
          }
          return b;
        }
        a2 = c2;
        c2 = a2.parentNode;
      }
      return null;
    }
    function Cb(a2) {
      a2 = a2[Of] || a2[uf];
      return !a2 || 5 !== a2.tag && 6 !== a2.tag && 13 !== a2.tag && 3 !== a2.tag ? null : a2;
    }
    function ue(a2) {
      if (5 === a2.tag || 6 === a2.tag) return a2.stateNode;
      throw Error(p2(33));
    }
    function Db(a2) {
      return a2[Pf] || null;
    }
    var Sf = [], Tf = -1;
    function Uf(a2) {
      return { current: a2 };
    }
    function E2(a2) {
      0 > Tf || (a2.current = Sf[Tf], Sf[Tf] = null, Tf--);
    }
    function G(a2, b) {
      Tf++;
      Sf[Tf] = a2.current;
      a2.current = b;
    }
    var Vf = {}, H2 = Uf(Vf), Wf = Uf(false), Xf = Vf;
    function Yf(a2, b) {
      var c2 = a2.type.contextTypes;
      if (!c2) return Vf;
      var d2 = a2.stateNode;
      if (d2 && d2.__reactInternalMemoizedUnmaskedChildContext === b) return d2.__reactInternalMemoizedMaskedChildContext;
      var e2 = {}, f2;
      for (f2 in c2) e2[f2] = b[f2];
      d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = b, a2.__reactInternalMemoizedMaskedChildContext = e2);
      return e2;
    }
    function Zf(a2) {
      a2 = a2.childContextTypes;
      return null !== a2 && void 0 !== a2;
    }
    function $f() {
      E2(Wf);
      E2(H2);
    }
    function ag(a2, b, c2) {
      if (H2.current !== Vf) throw Error(p2(168));
      G(H2, b);
      G(Wf, c2);
    }
    function bg(a2, b, c2) {
      var d2 = a2.stateNode;
      b = b.childContextTypes;
      if ("function" !== typeof d2.getChildContext) return c2;
      d2 = d2.getChildContext();
      for (var e2 in d2) if (!(e2 in b)) throw Error(p2(108, Ra(a2) || "Unknown", e2));
      return A({}, c2, d2);
    }
    function cg(a2) {
      a2 = (a2 = a2.stateNode) && a2.__reactInternalMemoizedMergedChildContext || Vf;
      Xf = H2.current;
      G(H2, a2);
      G(Wf, Wf.current);
      return true;
    }
    function dg(a2, b, c2) {
      var d2 = a2.stateNode;
      if (!d2) throw Error(p2(169));
      c2 ? (a2 = bg(a2, b, Xf), d2.__reactInternalMemoizedMergedChildContext = a2, E2(Wf), E2(H2), G(H2, a2)) : E2(Wf);
      G(Wf, c2);
    }
    var eg = null, fg = false, gg = false;
    function hg(a2) {
      null === eg ? eg = [a2] : eg.push(a2);
    }
    function ig(a2) {
      fg = true;
      hg(a2);
    }
    function jg() {
      if (!gg && null !== eg) {
        gg = true;
        var a2 = 0, b = C2;
        try {
          var c2 = eg;
          for (C2 = 1; a2 < c2.length; a2++) {
            var d2 = c2[a2];
            do
              d2 = d2(true);
            while (null !== d2);
          }
          eg = null;
          fg = false;
        } catch (e2) {
          throw null !== eg && (eg = eg.slice(a2 + 1)), ac(fc, jg), e2;
        } finally {
          C2 = b, gg = false;
        }
      }
      return null;
    }
    var kg = [], lg = 0, mg = null, ng = 0, og = [], pg = 0, qg = null, rg = 1, sg = "";
    function tg(a2, b) {
      kg[lg++] = ng;
      kg[lg++] = mg;
      mg = a2;
      ng = b;
    }
    function ug(a2, b, c2) {
      og[pg++] = rg;
      og[pg++] = sg;
      og[pg++] = qg;
      qg = a2;
      var d2 = rg;
      a2 = sg;
      var e2 = 32 - oc(d2) - 1;
      d2 &= ~(1 << e2);
      c2 += 1;
      var f2 = 32 - oc(b) + e2;
      if (30 < f2) {
        var g2 = e2 - e2 % 5;
        f2 = (d2 & (1 << g2) - 1).toString(32);
        d2 >>= g2;
        e2 -= g2;
        rg = 1 << 32 - oc(b) + e2 | c2 << e2 | d2;
        sg = f2 + a2;
      } else rg = 1 << f2 | c2 << e2 | d2, sg = a2;
    }
    function vg(a2) {
      null !== a2.return && (tg(a2, 1), ug(a2, 1, 0));
    }
    function wg(a2) {
      for (; a2 === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
      for (; a2 === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
    }
    var xg = null, yg = null, I = false, zg = null;
    function Ag(a2, b) {
      var c2 = Bg(5, null, null, 0);
      c2.elementType = "DELETED";
      c2.stateNode = b;
      c2.return = a2;
      b = a2.deletions;
      null === b ? (a2.deletions = [c2], a2.flags |= 16) : b.push(c2);
    }
    function Cg(a2, b) {
      switch (a2.tag) {
        case 5:
          var c2 = a2.type;
          b = 1 !== b.nodeType || c2.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
          return null !== b ? (a2.stateNode = b, xg = a2, yg = Lf(b.firstChild), true) : false;
        case 6:
          return b = "" === a2.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a2.stateNode = b, xg = a2, yg = null, true) : false;
        case 13:
          return b = 8 !== b.nodeType ? null : b, null !== b ? (c2 = null !== qg ? { id: rg, overflow: sg } : null, a2.memoizedState = { dehydrated: b, treeContext: c2, retryLane: 1073741824 }, c2 = Bg(18, null, null, 0), c2.stateNode = b, c2.return = a2, a2.child = c2, xg = a2, yg = null, true) : false;
        default:
          return false;
      }
    }
    function Dg(a2) {
      return 0 !== (a2.mode & 1) && 0 === (a2.flags & 128);
    }
    function Eg(a2) {
      if (I) {
        var b = yg;
        if (b) {
          var c2 = b;
          if (!Cg(a2, b)) {
            if (Dg(a2)) throw Error(p2(418));
            b = Lf(c2.nextSibling);
            var d2 = xg;
            b && Cg(a2, b) ? Ag(d2, c2) : (a2.flags = a2.flags & -4097 | 2, I = false, xg = a2);
          }
        } else {
          if (Dg(a2)) throw Error(p2(418));
          a2.flags = a2.flags & -4097 | 2;
          I = false;
          xg = a2;
        }
      }
    }
    function Fg(a2) {
      for (a2 = a2.return; null !== a2 && 5 !== a2.tag && 3 !== a2.tag && 13 !== a2.tag; ) a2 = a2.return;
      xg = a2;
    }
    function Gg(a2) {
      if (a2 !== xg) return false;
      if (!I) return Fg(a2), I = true, false;
      var b;
      (b = 3 !== a2.tag) && !(b = 5 !== a2.tag) && (b = a2.type, b = "head" !== b && "body" !== b && !Ef(a2.type, a2.memoizedProps));
      if (b && (b = yg)) {
        if (Dg(a2)) throw Hg(), Error(p2(418));
        for (; b; ) Ag(a2, b), b = Lf(b.nextSibling);
      }
      Fg(a2);
      if (13 === a2.tag) {
        a2 = a2.memoizedState;
        a2 = null !== a2 ? a2.dehydrated : null;
        if (!a2) throw Error(p2(317));
        a: {
          a2 = a2.nextSibling;
          for (b = 0; a2; ) {
            if (8 === a2.nodeType) {
              var c2 = a2.data;
              if ("/$" === c2) {
                if (0 === b) {
                  yg = Lf(a2.nextSibling);
                  break a;
                }
                b--;
              } else "$" !== c2 && "$!" !== c2 && "$?" !== c2 || b++;
            }
            a2 = a2.nextSibling;
          }
          yg = null;
        }
      } else yg = xg ? Lf(a2.stateNode.nextSibling) : null;
      return true;
    }
    function Hg() {
      for (var a2 = yg; a2; ) a2 = Lf(a2.nextSibling);
    }
    function Ig() {
      yg = xg = null;
      I = false;
    }
    function Jg(a2) {
      null === zg ? zg = [a2] : zg.push(a2);
    }
    var Kg = ua.ReactCurrentBatchConfig;
    function Lg(a2, b) {
      if (a2 && a2.defaultProps) {
        b = A({}, b);
        a2 = a2.defaultProps;
        for (var c2 in a2) void 0 === b[c2] && (b[c2] = a2[c2]);
        return b;
      }
      return b;
    }
    var Mg = Uf(null), Ng = null, Og = null, Pg = null;
    function Qg() {
      Pg = Og = Ng = null;
    }
    function Rg(a2) {
      var b = Mg.current;
      E2(Mg);
      a2._currentValue = b;
    }
    function Sg(a2, b, c2) {
      for (; null !== a2; ) {
        var d2 = a2.alternate;
        (a2.childLanes & b) !== b ? (a2.childLanes |= b, null !== d2 && (d2.childLanes |= b)) : null !== d2 && (d2.childLanes & b) !== b && (d2.childLanes |= b);
        if (a2 === c2) break;
        a2 = a2.return;
      }
    }
    function Tg(a2, b) {
      Ng = a2;
      Pg = Og = null;
      a2 = a2.dependencies;
      null !== a2 && null !== a2.firstContext && (0 !== (a2.lanes & b) && (Ug = true), a2.firstContext = null);
    }
    function Vg(a2) {
      var b = a2._currentValue;
      if (Pg !== a2) if (a2 = { context: a2, memoizedValue: b, next: null }, null === Og) {
        if (null === Ng) throw Error(p2(308));
        Og = a2;
        Ng.dependencies = { lanes: 0, firstContext: a2 };
      } else Og = Og.next = a2;
      return b;
    }
    var Wg = null;
    function Xg(a2) {
      null === Wg ? Wg = [a2] : Wg.push(a2);
    }
    function Yg(a2, b, c2, d2) {
      var e2 = b.interleaved;
      null === e2 ? (c2.next = c2, Xg(b)) : (c2.next = e2.next, e2.next = c2);
      b.interleaved = c2;
      return Zg(a2, d2);
    }
    function Zg(a2, b) {
      a2.lanes |= b;
      var c2 = a2.alternate;
      null !== c2 && (c2.lanes |= b);
      c2 = a2;
      for (a2 = a2.return; null !== a2; ) a2.childLanes |= b, c2 = a2.alternate, null !== c2 && (c2.childLanes |= b), c2 = a2, a2 = a2.return;
      return 3 === c2.tag ? c2.stateNode : null;
    }
    var $g = false;
    function ah(a2) {
      a2.updateQueue = { baseState: a2.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
    }
    function bh(a2, b) {
      a2 = a2.updateQueue;
      b.updateQueue === a2 && (b.updateQueue = { baseState: a2.baseState, firstBaseUpdate: a2.firstBaseUpdate, lastBaseUpdate: a2.lastBaseUpdate, shared: a2.shared, effects: a2.effects });
    }
    function ch(a2, b) {
      return { eventTime: a2, lane: b, tag: 0, payload: null, callback: null, next: null };
    }
    function dh(a2, b, c2) {
      var d2 = a2.updateQueue;
      if (null === d2) return null;
      d2 = d2.shared;
      if (0 !== (K & 2)) {
        var e2 = d2.pending;
        null === e2 ? b.next = b : (b.next = e2.next, e2.next = b);
        d2.pending = b;
        return Zg(a2, c2);
      }
      e2 = d2.interleaved;
      null === e2 ? (b.next = b, Xg(d2)) : (b.next = e2.next, e2.next = b);
      d2.interleaved = b;
      return Zg(a2, c2);
    }
    function eh(a2, b, c2) {
      b = b.updateQueue;
      if (null !== b && (b = b.shared, 0 !== (c2 & 4194240))) {
        var d2 = b.lanes;
        d2 &= a2.pendingLanes;
        c2 |= d2;
        b.lanes = c2;
        Cc(a2, c2);
      }
    }
    function fh(a2, b) {
      var c2 = a2.updateQueue, d2 = a2.alternate;
      if (null !== d2 && (d2 = d2.updateQueue, c2 === d2)) {
        var e2 = null, f2 = null;
        c2 = c2.firstBaseUpdate;
        if (null !== c2) {
          do {
            var g2 = { eventTime: c2.eventTime, lane: c2.lane, tag: c2.tag, payload: c2.payload, callback: c2.callback, next: null };
            null === f2 ? e2 = f2 = g2 : f2 = f2.next = g2;
            c2 = c2.next;
          } while (null !== c2);
          null === f2 ? e2 = f2 = b : f2 = f2.next = b;
        } else e2 = f2 = b;
        c2 = { baseState: d2.baseState, firstBaseUpdate: e2, lastBaseUpdate: f2, shared: d2.shared, effects: d2.effects };
        a2.updateQueue = c2;
        return;
      }
      a2 = c2.lastBaseUpdate;
      null === a2 ? c2.firstBaseUpdate = b : a2.next = b;
      c2.lastBaseUpdate = b;
    }
    function gh(a2, b, c2, d2) {
      var e2 = a2.updateQueue;
      $g = false;
      var f2 = e2.firstBaseUpdate, g2 = e2.lastBaseUpdate, h2 = e2.shared.pending;
      if (null !== h2) {
        e2.shared.pending = null;
        var k2 = h2, l2 = k2.next;
        k2.next = null;
        null === g2 ? f2 = l2 : g2.next = l2;
        g2 = k2;
        var m2 = a2.alternate;
        null !== m2 && (m2 = m2.updateQueue, h2 = m2.lastBaseUpdate, h2 !== g2 && (null === h2 ? m2.firstBaseUpdate = l2 : h2.next = l2, m2.lastBaseUpdate = k2));
      }
      if (null !== f2) {
        var q = e2.baseState;
        g2 = 0;
        m2 = l2 = k2 = null;
        h2 = f2;
        do {
          var r = h2.lane, y = h2.eventTime;
          if ((d2 & r) === r) {
            null !== m2 && (m2 = m2.next = {
              eventTime: y,
              lane: 0,
              tag: h2.tag,
              payload: h2.payload,
              callback: h2.callback,
              next: null
            });
            a: {
              var n2 = a2, t2 = h2;
              r = b;
              y = c2;
              switch (t2.tag) {
                case 1:
                  n2 = t2.payload;
                  if ("function" === typeof n2) {
                    q = n2.call(y, q, r);
                    break a;
                  }
                  q = n2;
                  break a;
                case 3:
                  n2.flags = n2.flags & -65537 | 128;
                case 0:
                  n2 = t2.payload;
                  r = "function" === typeof n2 ? n2.call(y, q, r) : n2;
                  if (null === r || void 0 === r) break a;
                  q = A({}, q, r);
                  break a;
                case 2:
                  $g = true;
              }
            }
            null !== h2.callback && 0 !== h2.lane && (a2.flags |= 64, r = e2.effects, null === r ? e2.effects = [h2] : r.push(h2));
          } else y = { eventTime: y, lane: r, tag: h2.tag, payload: h2.payload, callback: h2.callback, next: null }, null === m2 ? (l2 = m2 = y, k2 = q) : m2 = m2.next = y, g2 |= r;
          h2 = h2.next;
          if (null === h2) if (h2 = e2.shared.pending, null === h2) break;
          else r = h2, h2 = r.next, r.next = null, e2.lastBaseUpdate = r, e2.shared.pending = null;
        } while (1);
        null === m2 && (k2 = q);
        e2.baseState = k2;
        e2.firstBaseUpdate = l2;
        e2.lastBaseUpdate = m2;
        b = e2.shared.interleaved;
        if (null !== b) {
          e2 = b;
          do
            g2 |= e2.lane, e2 = e2.next;
          while (e2 !== b);
        } else null === f2 && (e2.shared.lanes = 0);
        hh |= g2;
        a2.lanes = g2;
        a2.memoizedState = q;
      }
    }
    function ih(a2, b, c2) {
      a2 = b.effects;
      b.effects = null;
      if (null !== a2) for (b = 0; b < a2.length; b++) {
        var d2 = a2[b], e2 = d2.callback;
        if (null !== e2) {
          d2.callback = null;
          d2 = c2;
          if ("function" !== typeof e2) throw Error(p2(191, e2));
          e2.call(d2);
        }
      }
    }
    var jh = new aa.Component().refs;
    function kh(a2, b, c2, d2) {
      b = a2.memoizedState;
      c2 = c2(d2, b);
      c2 = null === c2 || void 0 === c2 ? b : A({}, b, c2);
      a2.memoizedState = c2;
      0 === a2.lanes && (a2.updateQueue.baseState = c2);
    }
    var nh = { isMounted: function(a2) {
      return (a2 = a2._reactInternals) ? Vb(a2) === a2 : false;
    }, enqueueSetState: function(a2, b, c2) {
      a2 = a2._reactInternals;
      var d2 = L2(), e2 = lh(a2), f2 = ch(d2, e2);
      f2.payload = b;
      void 0 !== c2 && null !== c2 && (f2.callback = c2);
      b = dh(a2, f2, e2);
      null !== b && (mh(b, a2, e2, d2), eh(b, a2, e2));
    }, enqueueReplaceState: function(a2, b, c2) {
      a2 = a2._reactInternals;
      var d2 = L2(), e2 = lh(a2), f2 = ch(d2, e2);
      f2.tag = 1;
      f2.payload = b;
      void 0 !== c2 && null !== c2 && (f2.callback = c2);
      b = dh(a2, f2, e2);
      null !== b && (mh(b, a2, e2, d2), eh(b, a2, e2));
    }, enqueueForceUpdate: function(a2, b) {
      a2 = a2._reactInternals;
      var c2 = L2(), d2 = lh(a2), e2 = ch(c2, d2);
      e2.tag = 2;
      void 0 !== b && null !== b && (e2.callback = b);
      b = dh(a2, e2, d2);
      null !== b && (mh(b, a2, d2, c2), eh(b, a2, d2));
    } };
    function oh(a2, b, c2, d2, e2, f2, g2) {
      a2 = a2.stateNode;
      return "function" === typeof a2.shouldComponentUpdate ? a2.shouldComponentUpdate(d2, f2, g2) : b.prototype && b.prototype.isPureReactComponent ? !Ie2(c2, d2) || !Ie2(e2, f2) : true;
    }
    function ph(a2, b, c2) {
      var d2 = false, e2 = Vf;
      var f2 = b.contextType;
      "object" === typeof f2 && null !== f2 ? f2 = Vg(f2) : (e2 = Zf(b) ? Xf : H2.current, d2 = b.contextTypes, f2 = (d2 = null !== d2 && void 0 !== d2) ? Yf(a2, e2) : Vf);
      b = new b(c2, f2);
      a2.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
      b.updater = nh;
      a2.stateNode = b;
      b._reactInternals = a2;
      d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = e2, a2.__reactInternalMemoizedMaskedChildContext = f2);
      return b;
    }
    function qh(a2, b, c2, d2) {
      a2 = b.state;
      "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c2, d2);
      "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c2, d2);
      b.state !== a2 && nh.enqueueReplaceState(b, b.state, null);
    }
    function rh(a2, b, c2, d2) {
      var e2 = a2.stateNode;
      e2.props = c2;
      e2.state = a2.memoizedState;
      e2.refs = jh;
      ah(a2);
      var f2 = b.contextType;
      "object" === typeof f2 && null !== f2 ? e2.context = Vg(f2) : (f2 = Zf(b) ? Xf : H2.current, e2.context = Yf(a2, f2));
      e2.state = a2.memoizedState;
      f2 = b.getDerivedStateFromProps;
      "function" === typeof f2 && (kh(a2, b, f2, c2), e2.state = a2.memoizedState);
      "function" === typeof b.getDerivedStateFromProps || "function" === typeof e2.getSnapshotBeforeUpdate || "function" !== typeof e2.UNSAFE_componentWillMount && "function" !== typeof e2.componentWillMount || (b = e2.state, "function" === typeof e2.componentWillMount && e2.componentWillMount(), "function" === typeof e2.UNSAFE_componentWillMount && e2.UNSAFE_componentWillMount(), b !== e2.state && nh.enqueueReplaceState(e2, e2.state, null), gh(a2, c2, e2, d2), e2.state = a2.memoizedState);
      "function" === typeof e2.componentDidMount && (a2.flags |= 4194308);
    }
    function sh(a2, b, c2) {
      a2 = c2.ref;
      if (null !== a2 && "function" !== typeof a2 && "object" !== typeof a2) {
        if (c2._owner) {
          c2 = c2._owner;
          if (c2) {
            if (1 !== c2.tag) throw Error(p2(309));
            var d2 = c2.stateNode;
          }
          if (!d2) throw Error(p2(147, a2));
          var e2 = d2, f2 = "" + a2;
          if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f2) return b.ref;
          b = function(a3) {
            var b2 = e2.refs;
            b2 === jh && (b2 = e2.refs = {});
            null === a3 ? delete b2[f2] : b2[f2] = a3;
          };
          b._stringRef = f2;
          return b;
        }
        if ("string" !== typeof a2) throw Error(p2(284));
        if (!c2._owner) throw Error(p2(290, a2));
      }
      return a2;
    }
    function th(a2, b) {
      a2 = Object.prototype.toString.call(b);
      throw Error(p2(31, "[object Object]" === a2 ? "object with keys {" + Object.keys(b).join(", ") + "}" : a2));
    }
    function uh(a2) {
      var b = a2._init;
      return b(a2._payload);
    }
    function vh(a2) {
      function b(b2, c3) {
        if (a2) {
          var d3 = b2.deletions;
          null === d3 ? (b2.deletions = [c3], b2.flags |= 16) : d3.push(c3);
        }
      }
      function c2(c3, d3) {
        if (!a2) return null;
        for (; null !== d3; ) b(c3, d3), d3 = d3.sibling;
        return null;
      }
      function d2(a3, b2) {
        for (a3 = /* @__PURE__ */ new Map(); null !== b2; ) null !== b2.key ? a3.set(b2.key, b2) : a3.set(b2.index, b2), b2 = b2.sibling;
        return a3;
      }
      function e2(a3, b2) {
        a3 = wh(a3, b2);
        a3.index = 0;
        a3.sibling = null;
        return a3;
      }
      function f2(b2, c3, d3) {
        b2.index = d3;
        if (!a2) return b2.flags |= 1048576, c3;
        d3 = b2.alternate;
        if (null !== d3) return d3 = d3.index, d3 < c3 ? (b2.flags |= 2, c3) : d3;
        b2.flags |= 2;
        return c3;
      }
      function g2(b2) {
        a2 && null === b2.alternate && (b2.flags |= 2);
        return b2;
      }
      function h2(a3, b2, c3, d3) {
        if (null === b2 || 6 !== b2.tag) return b2 = xh(c3, a3.mode, d3), b2.return = a3, b2;
        b2 = e2(b2, c3);
        b2.return = a3;
        return b2;
      }
      function k2(a3, b2, c3, d3) {
        var f3 = c3.type;
        if (f3 === ya) return m2(a3, b2, c3.props.children, d3, c3.key);
        if (null !== b2 && (b2.elementType === f3 || "object" === typeof f3 && null !== f3 && f3.$$typeof === Ha && uh(f3) === b2.type)) return d3 = e2(b2, c3.props), d3.ref = sh(a3, b2, c3), d3.return = a3, d3;
        d3 = yh(c3.type, c3.key, c3.props, null, a3.mode, d3);
        d3.ref = sh(a3, b2, c3);
        d3.return = a3;
        return d3;
      }
      function l2(a3, b2, c3, d3) {
        if (null === b2 || 4 !== b2.tag || b2.stateNode.containerInfo !== c3.containerInfo || b2.stateNode.implementation !== c3.implementation) return b2 = zh(c3, a3.mode, d3), b2.return = a3, b2;
        b2 = e2(b2, c3.children || []);
        b2.return = a3;
        return b2;
      }
      function m2(a3, b2, c3, d3, f3) {
        if (null === b2 || 7 !== b2.tag) return b2 = Ah(c3, a3.mode, d3, f3), b2.return = a3, b2;
        b2 = e2(b2, c3);
        b2.return = a3;
        return b2;
      }
      function q(a3, b2, c3) {
        if ("string" === typeof b2 && "" !== b2 || "number" === typeof b2) return b2 = xh("" + b2, a3.mode, c3), b2.return = a3, b2;
        if ("object" === typeof b2 && null !== b2) {
          switch (b2.$$typeof) {
            case va:
              return c3 = yh(b2.type, b2.key, b2.props, null, a3.mode, c3), c3.ref = sh(a3, null, b2), c3.return = a3, c3;
            case wa:
              return b2 = zh(b2, a3.mode, c3), b2.return = a3, b2;
            case Ha:
              var d3 = b2._init;
              return q(a3, d3(b2._payload), c3);
          }
          if (eb(b2) || Ka(b2)) return b2 = Ah(b2, a3.mode, c3, null), b2.return = a3, b2;
          th(a3, b2);
        }
        return null;
      }
      function r(a3, b2, c3, d3) {
        var e3 = null !== b2 ? b2.key : null;
        if ("string" === typeof c3 && "" !== c3 || "number" === typeof c3) return null !== e3 ? null : h2(a3, b2, "" + c3, d3);
        if ("object" === typeof c3 && null !== c3) {
          switch (c3.$$typeof) {
            case va:
              return c3.key === e3 ? k2(a3, b2, c3, d3) : null;
            case wa:
              return c3.key === e3 ? l2(a3, b2, c3, d3) : null;
            case Ha:
              return e3 = c3._init, r(
                a3,
                b2,
                e3(c3._payload),
                d3
              );
          }
          if (eb(c3) || Ka(c3)) return null !== e3 ? null : m2(a3, b2, c3, d3, null);
          th(a3, c3);
        }
        return null;
      }
      function y(a3, b2, c3, d3, e3) {
        if ("string" === typeof d3 && "" !== d3 || "number" === typeof d3) return a3 = a3.get(c3) || null, h2(b2, a3, "" + d3, e3);
        if ("object" === typeof d3 && null !== d3) {
          switch (d3.$$typeof) {
            case va:
              return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, k2(b2, a3, d3, e3);
            case wa:
              return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, l2(b2, a3, d3, e3);
            case Ha:
              var f3 = d3._init;
              return y(a3, b2, c3, f3(d3._payload), e3);
          }
          if (eb(d3) || Ka(d3)) return a3 = a3.get(c3) || null, m2(b2, a3, d3, e3, null);
          th(b2, d3);
        }
        return null;
      }
      function n2(e3, g3, h3, k3) {
        for (var l3 = null, m3 = null, u2 = g3, w2 = g3 = 0, x = null; null !== u2 && w2 < h3.length; w2++) {
          u2.index > w2 ? (x = u2, u2 = null) : x = u2.sibling;
          var n3 = r(e3, u2, h3[w2], k3);
          if (null === n3) {
            null === u2 && (u2 = x);
            break;
          }
          a2 && u2 && null === n3.alternate && b(e3, u2);
          g3 = f2(n3, g3, w2);
          null === m3 ? l3 = n3 : m3.sibling = n3;
          m3 = n3;
          u2 = x;
        }
        if (w2 === h3.length) return c2(e3, u2), I && tg(e3, w2), l3;
        if (null === u2) {
          for (; w2 < h3.length; w2++) u2 = q(e3, h3[w2], k3), null !== u2 && (g3 = f2(u2, g3, w2), null === m3 ? l3 = u2 : m3.sibling = u2, m3 = u2);
          I && tg(e3, w2);
          return l3;
        }
        for (u2 = d2(e3, u2); w2 < h3.length; w2++) x = y(u2, e3, w2, h3[w2], k3), null !== x && (a2 && null !== x.alternate && u2.delete(null === x.key ? w2 : x.key), g3 = f2(x, g3, w2), null === m3 ? l3 = x : m3.sibling = x, m3 = x);
        a2 && u2.forEach(function(a3) {
          return b(e3, a3);
        });
        I && tg(e3, w2);
        return l3;
      }
      function t2(e3, g3, h3, k3) {
        var l3 = Ka(h3);
        if ("function" !== typeof l3) throw Error(p2(150));
        h3 = l3.call(h3);
        if (null == h3) throw Error(p2(151));
        for (var u2 = l3 = null, m3 = g3, w2 = g3 = 0, x = null, n3 = h3.next(); null !== m3 && !n3.done; w2++, n3 = h3.next()) {
          m3.index > w2 ? (x = m3, m3 = null) : x = m3.sibling;
          var t3 = r(e3, m3, n3.value, k3);
          if (null === t3) {
            null === m3 && (m3 = x);
            break;
          }
          a2 && m3 && null === t3.alternate && b(e3, m3);
          g3 = f2(t3, g3, w2);
          null === u2 ? l3 = t3 : u2.sibling = t3;
          u2 = t3;
          m3 = x;
        }
        if (n3.done) return c2(
          e3,
          m3
        ), I && tg(e3, w2), l3;
        if (null === m3) {
          for (; !n3.done; w2++, n3 = h3.next()) n3 = q(e3, n3.value, k3), null !== n3 && (g3 = f2(n3, g3, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
          I && tg(e3, w2);
          return l3;
        }
        for (m3 = d2(e3, m3); !n3.done; w2++, n3 = h3.next()) n3 = y(m3, e3, w2, n3.value, k3), null !== n3 && (a2 && null !== n3.alternate && m3.delete(null === n3.key ? w2 : n3.key), g3 = f2(n3, g3, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
        a2 && m3.forEach(function(a3) {
          return b(e3, a3);
        });
        I && tg(e3, w2);
        return l3;
      }
      function J(a3, d3, f3, h3) {
        "object" === typeof f3 && null !== f3 && f3.type === ya && null === f3.key && (f3 = f3.props.children);
        if ("object" === typeof f3 && null !== f3) {
          switch (f3.$$typeof) {
            case va:
              a: {
                for (var k3 = f3.key, l3 = d3; null !== l3; ) {
                  if (l3.key === k3) {
                    k3 = f3.type;
                    if (k3 === ya) {
                      if (7 === l3.tag) {
                        c2(a3, l3.sibling);
                        d3 = e2(l3, f3.props.children);
                        d3.return = a3;
                        a3 = d3;
                        break a;
                      }
                    } else if (l3.elementType === k3 || "object" === typeof k3 && null !== k3 && k3.$$typeof === Ha && uh(k3) === l3.type) {
                      c2(a3, l3.sibling);
                      d3 = e2(l3, f3.props);
                      d3.ref = sh(a3, l3, f3);
                      d3.return = a3;
                      a3 = d3;
                      break a;
                    }
                    c2(a3, l3);
                    break;
                  } else b(a3, l3);
                  l3 = l3.sibling;
                }
                f3.type === ya ? (d3 = Ah(f3.props.children, a3.mode, h3, f3.key), d3.return = a3, a3 = d3) : (h3 = yh(f3.type, f3.key, f3.props, null, a3.mode, h3), h3.ref = sh(a3, d3, f3), h3.return = a3, a3 = h3);
              }
              return g2(a3);
            case wa:
              a: {
                for (l3 = f3.key; null !== d3; ) {
                  if (d3.key === l3) if (4 === d3.tag && d3.stateNode.containerInfo === f3.containerInfo && d3.stateNode.implementation === f3.implementation) {
                    c2(a3, d3.sibling);
                    d3 = e2(d3, f3.children || []);
                    d3.return = a3;
                    a3 = d3;
                    break a;
                  } else {
                    c2(a3, d3);
                    break;
                  }
                  else b(a3, d3);
                  d3 = d3.sibling;
                }
                d3 = zh(f3, a3.mode, h3);
                d3.return = a3;
                a3 = d3;
              }
              return g2(a3);
            case Ha:
              return l3 = f3._init, J(a3, d3, l3(f3._payload), h3);
          }
          if (eb(f3)) return n2(a3, d3, f3, h3);
          if (Ka(f3)) return t2(a3, d3, f3, h3);
          th(a3, f3);
        }
        return "string" === typeof f3 && "" !== f3 || "number" === typeof f3 ? (f3 = "" + f3, null !== d3 && 6 === d3.tag ? (c2(a3, d3.sibling), d3 = e2(d3, f3), d3.return = a3, a3 = d3) : (c2(a3, d3), d3 = xh(f3, a3.mode, h3), d3.return = a3, a3 = d3), g2(a3)) : c2(a3, d3);
      }
      return J;
    }
    var Bh = vh(true), Ch = vh(false), Dh = {}, Eh = Uf(Dh), Fh = Uf(Dh), Gh = Uf(Dh);
    function Hh(a2) {
      if (a2 === Dh) throw Error(p2(174));
      return a2;
    }
    function Ih(a2, b) {
      G(Gh, b);
      G(Fh, a2);
      G(Eh, Dh);
      a2 = b.nodeType;
      switch (a2) {
        case 9:
        case 11:
          b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
          break;
        default:
          a2 = 8 === a2 ? b.parentNode : b, b = a2.namespaceURI || null, a2 = a2.tagName, b = lb(b, a2);
      }
      E2(Eh);
      G(Eh, b);
    }
    function Jh() {
      E2(Eh);
      E2(Fh);
      E2(Gh);
    }
    function Kh(a2) {
      Hh(Gh.current);
      var b = Hh(Eh.current);
      var c2 = lb(b, a2.type);
      b !== c2 && (G(Fh, a2), G(Eh, c2));
    }
    function Lh(a2) {
      Fh.current === a2 && (E2(Eh), E2(Fh));
    }
    var M = Uf(0);
    function Mh(a2) {
      for (var b = a2; null !== b; ) {
        if (13 === b.tag) {
          var c2 = b.memoizedState;
          if (null !== c2 && (c2 = c2.dehydrated, null === c2 || "$?" === c2.data || "$!" === c2.data)) return b;
        } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
          if (0 !== (b.flags & 128)) return b;
        } else if (null !== b.child) {
          b.child.return = b;
          b = b.child;
          continue;
        }
        if (b === a2) break;
        for (; null === b.sibling; ) {
          if (null === b.return || b.return === a2) return null;
          b = b.return;
        }
        b.sibling.return = b.return;
        b = b.sibling;
      }
      return null;
    }
    var Nh = [];
    function Oh() {
      for (var a2 = 0; a2 < Nh.length; a2++) Nh[a2]._workInProgressVersionPrimary = null;
      Nh.length = 0;
    }
    var Ph = ua.ReactCurrentDispatcher, Qh = ua.ReactCurrentBatchConfig, Rh = 0, N2 = null, O = null, P2 = null, Sh = false, Th = false, Uh = 0, Vh = 0;
    function Q2() {
      throw Error(p2(321));
    }
    function Wh(a2, b) {
      if (null === b) return false;
      for (var c2 = 0; c2 < b.length && c2 < a2.length; c2++) if (!He(a2[c2], b[c2])) return false;
      return true;
    }
    function Xh(a2, b, c2, d2, e2, f2) {
      Rh = f2;
      N2 = b;
      b.memoizedState = null;
      b.updateQueue = null;
      b.lanes = 0;
      Ph.current = null === a2 || null === a2.memoizedState ? Yh : Zh;
      a2 = c2(d2, e2);
      if (Th) {
        f2 = 0;
        do {
          Th = false;
          Uh = 0;
          if (25 <= f2) throw Error(p2(301));
          f2 += 1;
          P2 = O = null;
          b.updateQueue = null;
          Ph.current = $h;
          a2 = c2(d2, e2);
        } while (Th);
      }
      Ph.current = ai;
      b = null !== O && null !== O.next;
      Rh = 0;
      P2 = O = N2 = null;
      Sh = false;
      if (b) throw Error(p2(300));
      return a2;
    }
    function bi() {
      var a2 = 0 !== Uh;
      Uh = 0;
      return a2;
    }
    function ci() {
      var a2 = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
      null === P2 ? N2.memoizedState = P2 = a2 : P2 = P2.next = a2;
      return P2;
    }
    function di() {
      if (null === O) {
        var a2 = N2.alternate;
        a2 = null !== a2 ? a2.memoizedState : null;
      } else a2 = O.next;
      var b = null === P2 ? N2.memoizedState : P2.next;
      if (null !== b) P2 = b, O = a2;
      else {
        if (null === a2) throw Error(p2(310));
        O = a2;
        a2 = { memoizedState: O.memoizedState, baseState: O.baseState, baseQueue: O.baseQueue, queue: O.queue, next: null };
        null === P2 ? N2.memoizedState = P2 = a2 : P2 = P2.next = a2;
      }
      return P2;
    }
    function ei(a2, b) {
      return "function" === typeof b ? b(a2) : b;
    }
    function fi(a2) {
      var b = di(), c2 = b.queue;
      if (null === c2) throw Error(p2(311));
      c2.lastRenderedReducer = a2;
      var d2 = O, e2 = d2.baseQueue, f2 = c2.pending;
      if (null !== f2) {
        if (null !== e2) {
          var g2 = e2.next;
          e2.next = f2.next;
          f2.next = g2;
        }
        d2.baseQueue = e2 = f2;
        c2.pending = null;
      }
      if (null !== e2) {
        f2 = e2.next;
        d2 = d2.baseState;
        var h2 = g2 = null, k2 = null, l2 = f2;
        do {
          var m2 = l2.lane;
          if ((Rh & m2) === m2) null !== k2 && (k2 = k2.next = { lane: 0, action: l2.action, hasEagerState: l2.hasEagerState, eagerState: l2.eagerState, next: null }), d2 = l2.hasEagerState ? l2.eagerState : a2(d2, l2.action);
          else {
            var q = {
              lane: m2,
              action: l2.action,
              hasEagerState: l2.hasEagerState,
              eagerState: l2.eagerState,
              next: null
            };
            null === k2 ? (h2 = k2 = q, g2 = d2) : k2 = k2.next = q;
            N2.lanes |= m2;
            hh |= m2;
          }
          l2 = l2.next;
        } while (null !== l2 && l2 !== f2);
        null === k2 ? g2 = d2 : k2.next = h2;
        He(d2, b.memoizedState) || (Ug = true);
        b.memoizedState = d2;
        b.baseState = g2;
        b.baseQueue = k2;
        c2.lastRenderedState = d2;
      }
      a2 = c2.interleaved;
      if (null !== a2) {
        e2 = a2;
        do
          f2 = e2.lane, N2.lanes |= f2, hh |= f2, e2 = e2.next;
        while (e2 !== a2);
      } else null === e2 && (c2.lanes = 0);
      return [b.memoizedState, c2.dispatch];
    }
    function gi(a2) {
      var b = di(), c2 = b.queue;
      if (null === c2) throw Error(p2(311));
      c2.lastRenderedReducer = a2;
      var d2 = c2.dispatch, e2 = c2.pending, f2 = b.memoizedState;
      if (null !== e2) {
        c2.pending = null;
        var g2 = e2 = e2.next;
        do
          f2 = a2(f2, g2.action), g2 = g2.next;
        while (g2 !== e2);
        He(f2, b.memoizedState) || (Ug = true);
        b.memoizedState = f2;
        null === b.baseQueue && (b.baseState = f2);
        c2.lastRenderedState = f2;
      }
      return [f2, d2];
    }
    function hi() {
    }
    function ii(a2, b) {
      var c2 = N2, d2 = di(), e2 = b(), f2 = !He(d2.memoizedState, e2);
      f2 && (d2.memoizedState = e2, Ug = true);
      d2 = d2.queue;
      ji(ki.bind(null, c2, d2, a2), [a2]);
      if (d2.getSnapshot !== b || f2 || null !== P2 && P2.memoizedState.tag & 1) {
        c2.flags |= 2048;
        li(9, mi.bind(null, c2, d2, e2, b), void 0, null);
        if (null === R) throw Error(p2(349));
        0 !== (Rh & 30) || ni(c2, b, e2);
      }
      return e2;
    }
    function ni(a2, b, c2) {
      a2.flags |= 16384;
      a2 = { getSnapshot: b, value: c2 };
      b = N2.updateQueue;
      null === b ? (b = { lastEffect: null, stores: null }, N2.updateQueue = b, b.stores = [a2]) : (c2 = b.stores, null === c2 ? b.stores = [a2] : c2.push(a2));
    }
    function mi(a2, b, c2, d2) {
      b.value = c2;
      b.getSnapshot = d2;
      oi(b) && pi(a2);
    }
    function ki(a2, b, c2) {
      return c2(function() {
        oi(b) && pi(a2);
      });
    }
    function oi(a2) {
      var b = a2.getSnapshot;
      a2 = a2.value;
      try {
        var c2 = b();
        return !He(a2, c2);
      } catch (d2) {
        return true;
      }
    }
    function pi(a2) {
      var b = Zg(a2, 1);
      null !== b && mh(b, a2, 1, -1);
    }
    function qi(a2) {
      var b = ci();
      "function" === typeof a2 && (a2 = a2());
      b.memoizedState = b.baseState = a2;
      a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ei, lastRenderedState: a2 };
      b.queue = a2;
      a2 = a2.dispatch = ri.bind(null, N2, a2);
      return [b.memoizedState, a2];
    }
    function li(a2, b, c2, d2) {
      a2 = { tag: a2, create: b, destroy: c2, deps: d2, next: null };
      b = N2.updateQueue;
      null === b ? (b = { lastEffect: null, stores: null }, N2.updateQueue = b, b.lastEffect = a2.next = a2) : (c2 = b.lastEffect, null === c2 ? b.lastEffect = a2.next = a2 : (d2 = c2.next, c2.next = a2, a2.next = d2, b.lastEffect = a2));
      return a2;
    }
    function si() {
      return di().memoizedState;
    }
    function ti(a2, b, c2, d2) {
      var e2 = ci();
      N2.flags |= a2;
      e2.memoizedState = li(1 | b, c2, void 0, void 0 === d2 ? null : d2);
    }
    function ui(a2, b, c2, d2) {
      var e2 = di();
      d2 = void 0 === d2 ? null : d2;
      var f2 = void 0;
      if (null !== O) {
        var g2 = O.memoizedState;
        f2 = g2.destroy;
        if (null !== d2 && Wh(d2, g2.deps)) {
          e2.memoizedState = li(b, c2, f2, d2);
          return;
        }
      }
      N2.flags |= a2;
      e2.memoizedState = li(1 | b, c2, f2, d2);
    }
    function vi(a2, b) {
      return ti(8390656, 8, a2, b);
    }
    function ji(a2, b) {
      return ui(2048, 8, a2, b);
    }
    function wi(a2, b) {
      return ui(4, 2, a2, b);
    }
    function xi(a2, b) {
      return ui(4, 4, a2, b);
    }
    function yi(a2, b) {
      if ("function" === typeof b) return a2 = a2(), b(a2), function() {
        b(null);
      };
      if (null !== b && void 0 !== b) return a2 = a2(), b.current = a2, function() {
        b.current = null;
      };
    }
    function zi(a2, b, c2) {
      c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
      return ui(4, 4, yi.bind(null, b, a2), c2);
    }
    function Ai() {
    }
    function Bi(a2, b) {
      var c2 = di();
      b = void 0 === b ? null : b;
      var d2 = c2.memoizedState;
      if (null !== d2 && null !== b && Wh(b, d2[1])) return d2[0];
      c2.memoizedState = [a2, b];
      return a2;
    }
    function Ci(a2, b) {
      var c2 = di();
      b = void 0 === b ? null : b;
      var d2 = c2.memoizedState;
      if (null !== d2 && null !== b && Wh(b, d2[1])) return d2[0];
      a2 = a2();
      c2.memoizedState = [a2, b];
      return a2;
    }
    function Di(a2, b, c2) {
      if (0 === (Rh & 21)) return a2.baseState && (a2.baseState = false, Ug = true), a2.memoizedState = c2;
      He(c2, b) || (c2 = yc(), N2.lanes |= c2, hh |= c2, a2.baseState = true);
      return b;
    }
    function Ei(a2, b) {
      var c2 = C2;
      C2 = 0 !== c2 && 4 > c2 ? c2 : 4;
      a2(true);
      var d2 = Qh.transition;
      Qh.transition = {};
      try {
        a2(false), b();
      } finally {
        C2 = c2, Qh.transition = d2;
      }
    }
    function Fi() {
      return di().memoizedState;
    }
    function Gi(a2, b, c2) {
      var d2 = lh(a2);
      c2 = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
      if (Hi(a2)) Ii(b, c2);
      else if (c2 = Yg(a2, b, c2, d2), null !== c2) {
        var e2 = L2();
        mh(c2, a2, d2, e2);
        Ji(c2, b, d2);
      }
    }
    function ri(a2, b, c2) {
      var d2 = lh(a2), e2 = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
      if (Hi(a2)) Ii(b, e2);
      else {
        var f2 = a2.alternate;
        if (0 === a2.lanes && (null === f2 || 0 === f2.lanes) && (f2 = b.lastRenderedReducer, null !== f2)) try {
          var g2 = b.lastRenderedState, h2 = f2(g2, c2);
          e2.hasEagerState = true;
          e2.eagerState = h2;
          if (He(h2, g2)) {
            var k2 = b.interleaved;
            null === k2 ? (e2.next = e2, Xg(b)) : (e2.next = k2.next, k2.next = e2);
            b.interleaved = e2;
            return;
          }
        } catch (l2) {
        } finally {
        }
        c2 = Yg(a2, b, e2, d2);
        null !== c2 && (e2 = L2(), mh(c2, a2, d2, e2), Ji(c2, b, d2));
      }
    }
    function Hi(a2) {
      var b = a2.alternate;
      return a2 === N2 || null !== b && b === N2;
    }
    function Ii(a2, b) {
      Th = Sh = true;
      var c2 = a2.pending;
      null === c2 ? b.next = b : (b.next = c2.next, c2.next = b);
      a2.pending = b;
    }
    function Ji(a2, b, c2) {
      if (0 !== (c2 & 4194240)) {
        var d2 = b.lanes;
        d2 &= a2.pendingLanes;
        c2 |= d2;
        b.lanes = c2;
        Cc(a2, c2);
      }
    }
    var ai = { readContext: Vg, useCallback: Q2, useContext: Q2, useEffect: Q2, useImperativeHandle: Q2, useInsertionEffect: Q2, useLayoutEffect: Q2, useMemo: Q2, useReducer: Q2, useRef: Q2, useState: Q2, useDebugValue: Q2, useDeferredValue: Q2, useTransition: Q2, useMutableSource: Q2, useSyncExternalStore: Q2, useId: Q2, unstable_isNewReconciler: false }, Yh = { readContext: Vg, useCallback: function(a2, b) {
      ci().memoizedState = [a2, void 0 === b ? null : b];
      return a2;
    }, useContext: Vg, useEffect: vi, useImperativeHandle: function(a2, b, c2) {
      c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
      return ti(
        4194308,
        4,
        yi.bind(null, b, a2),
        c2
      );
    }, useLayoutEffect: function(a2, b) {
      return ti(4194308, 4, a2, b);
    }, useInsertionEffect: function(a2, b) {
      return ti(4, 2, a2, b);
    }, useMemo: function(a2, b) {
      var c2 = ci();
      b = void 0 === b ? null : b;
      a2 = a2();
      c2.memoizedState = [a2, b];
      return a2;
    }, useReducer: function(a2, b, c2) {
      var d2 = ci();
      b = void 0 !== c2 ? c2(b) : b;
      d2.memoizedState = d2.baseState = b;
      a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a2, lastRenderedState: b };
      d2.queue = a2;
      a2 = a2.dispatch = Gi.bind(null, N2, a2);
      return [d2.memoizedState, a2];
    }, useRef: function(a2) {
      var b = ci();
      a2 = { current: a2 };
      return b.memoizedState = a2;
    }, useState: qi, useDebugValue: Ai, useDeferredValue: function(a2) {
      return ci().memoizedState = a2;
    }, useTransition: function() {
      var a2 = qi(false), b = a2[0];
      a2 = Ei.bind(null, a2[1]);
      ci().memoizedState = a2;
      return [b, a2];
    }, useMutableSource: function() {
    }, useSyncExternalStore: function(a2, b, c2) {
      var d2 = N2, e2 = ci();
      if (I) {
        if (void 0 === c2) throw Error(p2(407));
        c2 = c2();
      } else {
        c2 = b();
        if (null === R) throw Error(p2(349));
        0 !== (Rh & 30) || ni(d2, b, c2);
      }
      e2.memoizedState = c2;
      var f2 = { value: c2, getSnapshot: b };
      e2.queue = f2;
      vi(ki.bind(
        null,
        d2,
        f2,
        a2
      ), [a2]);
      d2.flags |= 2048;
      li(9, mi.bind(null, d2, f2, c2, b), void 0, null);
      return c2;
    }, useId: function() {
      var a2 = ci(), b = R.identifierPrefix;
      if (I) {
        var c2 = sg;
        var d2 = rg;
        c2 = (d2 & ~(1 << 32 - oc(d2) - 1)).toString(32) + c2;
        b = ":" + b + "R" + c2;
        c2 = Uh++;
        0 < c2 && (b += "H" + c2.toString(32));
        b += ":";
      } else c2 = Vh++, b = ":" + b + "r" + c2.toString(32) + ":";
      return a2.memoizedState = b;
    }, unstable_isNewReconciler: false }, Zh = {
      readContext: Vg,
      useCallback: Bi,
      useContext: Vg,
      useEffect: ji,
      useImperativeHandle: zi,
      useInsertionEffect: wi,
      useLayoutEffect: xi,
      useMemo: Ci,
      useReducer: fi,
      useRef: si,
      useState: function() {
        return fi(ei);
      },
      useDebugValue: Ai,
      useDeferredValue: function(a2) {
        var b = di();
        return Di(b, O.memoizedState, a2);
      },
      useTransition: function() {
        var a2 = fi(ei)[0], b = di().memoizedState;
        return [a2, b];
      },
      useMutableSource: hi,
      useSyncExternalStore: ii,
      useId: Fi,
      unstable_isNewReconciler: false
    }, $h = { readContext: Vg, useCallback: Bi, useContext: Vg, useEffect: ji, useImperativeHandle: zi, useInsertionEffect: wi, useLayoutEffect: xi, useMemo: Ci, useReducer: gi, useRef: si, useState: function() {
      return gi(ei);
    }, useDebugValue: Ai, useDeferredValue: function(a2) {
      var b = di();
      return null === O ? b.memoizedState = a2 : Di(b, O.memoizedState, a2);
    }, useTransition: function() {
      var a2 = gi(ei)[0], b = di().memoizedState;
      return [a2, b];
    }, useMutableSource: hi, useSyncExternalStore: ii, useId: Fi, unstable_isNewReconciler: false };
    function Ki(a2, b) {
      try {
        var c2 = "", d2 = b;
        do
          c2 += Pa(d2), d2 = d2.return;
        while (d2);
        var e2 = c2;
      } catch (f2) {
        e2 = "\nError generating stack: " + f2.message + "\n" + f2.stack;
      }
      return { value: a2, source: b, stack: e2, digest: null };
    }
    function Li(a2, b, c2) {
      return { value: a2, source: null, stack: null != c2 ? c2 : null, digest: null != b ? b : null };
    }
    function Mi(a2, b) {
      try {
        console.error(b.value);
      } catch (c2) {
        setTimeout(function() {
          throw c2;
        });
      }
    }
    var Ni = "function" === typeof WeakMap ? WeakMap : Map;
    function Oi(a2, b, c2) {
      c2 = ch(-1, c2);
      c2.tag = 3;
      c2.payload = { element: null };
      var d2 = b.value;
      c2.callback = function() {
        Pi || (Pi = true, Qi = d2);
        Mi(a2, b);
      };
      return c2;
    }
    function Ri(a2, b, c2) {
      c2 = ch(-1, c2);
      c2.tag = 3;
      var d2 = a2.type.getDerivedStateFromError;
      if ("function" === typeof d2) {
        var e2 = b.value;
        c2.payload = function() {
          return d2(e2);
        };
        c2.callback = function() {
          Mi(a2, b);
        };
      }
      var f2 = a2.stateNode;
      null !== f2 && "function" === typeof f2.componentDidCatch && (c2.callback = function() {
        Mi(a2, b);
        "function" !== typeof d2 && (null === Si ? Si = /* @__PURE__ */ new Set([this]) : Si.add(this));
        var c3 = b.stack;
        this.componentDidCatch(b.value, { componentStack: null !== c3 ? c3 : "" });
      });
      return c2;
    }
    function Ti(a2, b, c2) {
      var d2 = a2.pingCache;
      if (null === d2) {
        d2 = a2.pingCache = new Ni();
        var e2 = /* @__PURE__ */ new Set();
        d2.set(b, e2);
      } else e2 = d2.get(b), void 0 === e2 && (e2 = /* @__PURE__ */ new Set(), d2.set(b, e2));
      e2.has(c2) || (e2.add(c2), a2 = Ui.bind(null, a2, b, c2), b.then(a2, a2));
    }
    function Vi(a2) {
      do {
        var b;
        if (b = 13 === a2.tag) b = a2.memoizedState, b = null !== b ? null !== b.dehydrated ? true : false : true;
        if (b) return a2;
        a2 = a2.return;
      } while (null !== a2);
      return null;
    }
    function Wi(a2, b, c2, d2, e2) {
      if (0 === (a2.mode & 1)) return a2 === b ? a2.flags |= 65536 : (a2.flags |= 128, c2.flags |= 131072, c2.flags &= -52805, 1 === c2.tag && (null === c2.alternate ? c2.tag = 17 : (b = ch(-1, 1), b.tag = 2, dh(c2, b, 1))), c2.lanes |= 1), a2;
      a2.flags |= 65536;
      a2.lanes = e2;
      return a2;
    }
    var Xi = ua.ReactCurrentOwner, Ug = false;
    function Yi(a2, b, c2, d2) {
      b.child = null === a2 ? Ch(b, null, c2, d2) : Bh(b, a2.child, c2, d2);
    }
    function Zi(a2, b, c2, d2, e2) {
      c2 = c2.render;
      var f2 = b.ref;
      Tg(b, e2);
      d2 = Xh(a2, b, c2, d2, f2, e2);
      c2 = bi();
      if (null !== a2 && !Ug) return b.updateQueue = a2.updateQueue, b.flags &= -2053, a2.lanes &= ~e2, $i(a2, b, e2);
      I && c2 && vg(b);
      b.flags |= 1;
      Yi(a2, b, d2, e2);
      return b.child;
    }
    function aj(a2, b, c2, d2, e2) {
      if (null === a2) {
        var f2 = c2.type;
        if ("function" === typeof f2 && !bj(f2) && void 0 === f2.defaultProps && null === c2.compare && void 0 === c2.defaultProps) return b.tag = 15, b.type = f2, cj(a2, b, f2, d2, e2);
        a2 = yh(c2.type, null, d2, b, b.mode, e2);
        a2.ref = b.ref;
        a2.return = b;
        return b.child = a2;
      }
      f2 = a2.child;
      if (0 === (a2.lanes & e2)) {
        var g2 = f2.memoizedProps;
        c2 = c2.compare;
        c2 = null !== c2 ? c2 : Ie2;
        if (c2(g2, d2) && a2.ref === b.ref) return $i(a2, b, e2);
      }
      b.flags |= 1;
      a2 = wh(f2, d2);
      a2.ref = b.ref;
      a2.return = b;
      return b.child = a2;
    }
    function cj(a2, b, c2, d2, e2) {
      if (null !== a2) {
        var f2 = a2.memoizedProps;
        if (Ie2(f2, d2) && a2.ref === b.ref) if (Ug = false, b.pendingProps = d2 = f2, 0 !== (a2.lanes & e2)) 0 !== (a2.flags & 131072) && (Ug = true);
        else return b.lanes = a2.lanes, $i(a2, b, e2);
      }
      return dj(a2, b, c2, d2, e2);
    }
    function ej(a2, b, c2) {
      var d2 = b.pendingProps, e2 = d2.children, f2 = null !== a2 ? a2.memoizedState : null;
      if ("hidden" === d2.mode) if (0 === (b.mode & 1)) b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G(fj, gj), gj |= c2;
      else {
        if (0 === (c2 & 1073741824)) return a2 = null !== f2 ? f2.baseLanes | c2 : c2, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a2, cachePool: null, transitions: null }, b.updateQueue = null, G(fj, gj), gj |= a2, null;
        b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
        d2 = null !== f2 ? f2.baseLanes : c2;
        G(fj, gj);
        gj |= d2;
      }
      else null !== f2 ? (d2 = f2.baseLanes | c2, b.memoizedState = null) : d2 = c2, G(fj, gj), gj |= d2;
      Yi(a2, b, e2, c2);
      return b.child;
    }
    function hj(a2, b) {
      var c2 = b.ref;
      if (null === a2 && null !== c2 || null !== a2 && a2.ref !== c2) b.flags |= 512, b.flags |= 2097152;
    }
    function dj(a2, b, c2, d2, e2) {
      var f2 = Zf(c2) ? Xf : H2.current;
      f2 = Yf(b, f2);
      Tg(b, e2);
      c2 = Xh(a2, b, c2, d2, f2, e2);
      d2 = bi();
      if (null !== a2 && !Ug) return b.updateQueue = a2.updateQueue, b.flags &= -2053, a2.lanes &= ~e2, $i(a2, b, e2);
      I && d2 && vg(b);
      b.flags |= 1;
      Yi(a2, b, c2, e2);
      return b.child;
    }
    function ij(a2, b, c2, d2, e2) {
      if (Zf(c2)) {
        var f2 = true;
        cg(b);
      } else f2 = false;
      Tg(b, e2);
      if (null === b.stateNode) jj(a2, b), ph(b, c2, d2), rh(b, c2, d2, e2), d2 = true;
      else if (null === a2) {
        var g2 = b.stateNode, h2 = b.memoizedProps;
        g2.props = h2;
        var k2 = g2.context, l2 = c2.contextType;
        "object" === typeof l2 && null !== l2 ? l2 = Vg(l2) : (l2 = Zf(c2) ? Xf : H2.current, l2 = Yf(b, l2));
        var m2 = c2.getDerivedStateFromProps, q = "function" === typeof m2 || "function" === typeof g2.getSnapshotBeforeUpdate;
        q || "function" !== typeof g2.UNSAFE_componentWillReceiveProps && "function" !== typeof g2.componentWillReceiveProps || (h2 !== d2 || k2 !== l2) && qh(b, g2, d2, l2);
        $g = false;
        var r = b.memoizedState;
        g2.state = r;
        gh(b, d2, g2, e2);
        k2 = b.memoizedState;
        h2 !== d2 || r !== k2 || Wf.current || $g ? ("function" === typeof m2 && (kh(b, c2, m2, d2), k2 = b.memoizedState), (h2 = $g || oh(b, c2, h2, d2, r, k2, l2)) ? (q || "function" !== typeof g2.UNSAFE_componentWillMount && "function" !== typeof g2.componentWillMount || ("function" === typeof g2.componentWillMount && g2.componentWillMount(), "function" === typeof g2.UNSAFE_componentWillMount && g2.UNSAFE_componentWillMount()), "function" === typeof g2.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g2.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d2, b.memoizedState = k2), g2.props = d2, g2.state = k2, g2.context = l2, d2 = h2) : ("function" === typeof g2.componentDidMount && (b.flags |= 4194308), d2 = false);
      } else {
        g2 = b.stateNode;
        bh(a2, b);
        h2 = b.memoizedProps;
        l2 = b.type === b.elementType ? h2 : Lg(b.type, h2);
        g2.props = l2;
        q = b.pendingProps;
        r = g2.context;
        k2 = c2.contextType;
        "object" === typeof k2 && null !== k2 ? k2 = Vg(k2) : (k2 = Zf(c2) ? Xf : H2.current, k2 = Yf(b, k2));
        var y = c2.getDerivedStateFromProps;
        (m2 = "function" === typeof y || "function" === typeof g2.getSnapshotBeforeUpdate) || "function" !== typeof g2.UNSAFE_componentWillReceiveProps && "function" !== typeof g2.componentWillReceiveProps || (h2 !== q || r !== k2) && qh(b, g2, d2, k2);
        $g = false;
        r = b.memoizedState;
        g2.state = r;
        gh(b, d2, g2, e2);
        var n2 = b.memoizedState;
        h2 !== q || r !== n2 || Wf.current || $g ? ("function" === typeof y && (kh(b, c2, y, d2), n2 = b.memoizedState), (l2 = $g || oh(b, c2, l2, d2, r, n2, k2) || false) ? (m2 || "function" !== typeof g2.UNSAFE_componentWillUpdate && "function" !== typeof g2.componentWillUpdate || ("function" === typeof g2.componentWillUpdate && g2.componentWillUpdate(d2, n2, k2), "function" === typeof g2.UNSAFE_componentWillUpdate && g2.UNSAFE_componentWillUpdate(d2, n2, k2)), "function" === typeof g2.componentDidUpdate && (b.flags |= 4), "function" === typeof g2.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g2.componentDidUpdate || h2 === a2.memoizedProps && r === a2.memoizedState || (b.flags |= 4), "function" !== typeof g2.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r === a2.memoizedState || (b.flags |= 1024), b.memoizedProps = d2, b.memoizedState = n2), g2.props = d2, g2.state = n2, g2.context = k2, d2 = l2) : ("function" !== typeof g2.componentDidUpdate || h2 === a2.memoizedProps && r === a2.memoizedState || (b.flags |= 4), "function" !== typeof g2.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r === a2.memoizedState || (b.flags |= 1024), d2 = false);
      }
      return kj(a2, b, c2, d2, f2, e2);
    }
    function kj(a2, b, c2, d2, e2, f2) {
      hj(a2, b);
      var g2 = 0 !== (b.flags & 128);
      if (!d2 && !g2) return e2 && dg(b, c2, false), $i(a2, b, f2);
      d2 = b.stateNode;
      Xi.current = b;
      var h2 = g2 && "function" !== typeof c2.getDerivedStateFromError ? null : d2.render();
      b.flags |= 1;
      null !== a2 && g2 ? (b.child = Bh(b, a2.child, null, f2), b.child = Bh(b, null, h2, f2)) : Yi(a2, b, h2, f2);
      b.memoizedState = d2.state;
      e2 && dg(b, c2, true);
      return b.child;
    }
    function lj(a2) {
      var b = a2.stateNode;
      b.pendingContext ? ag(a2, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a2, b.context, false);
      Ih(a2, b.containerInfo);
    }
    function mj(a2, b, c2, d2, e2) {
      Ig();
      Jg(e2);
      b.flags |= 256;
      Yi(a2, b, c2, d2);
      return b.child;
    }
    var nj = { dehydrated: null, treeContext: null, retryLane: 0 };
    function oj(a2) {
      return { baseLanes: a2, cachePool: null, transitions: null };
    }
    function pj(a2, b, c2) {
      var d2 = b.pendingProps, e2 = M.current, f2 = false, g2 = 0 !== (b.flags & 128), h2;
      (h2 = g2) || (h2 = null !== a2 && null === a2.memoizedState ? false : 0 !== (e2 & 2));
      if (h2) f2 = true, b.flags &= -129;
      else if (null === a2 || null !== a2.memoizedState) e2 |= 1;
      G(M, e2 & 1);
      if (null === a2) {
        Eg(b);
        a2 = b.memoizedState;
        if (null !== a2 && (a2 = a2.dehydrated, null !== a2)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a2.data ? b.lanes = 8 : b.lanes = 1073741824, null;
        g2 = d2.children;
        a2 = d2.fallback;
        return f2 ? (d2 = b.mode, f2 = b.child, g2 = { mode: "hidden", children: g2 }, 0 === (d2 & 1) && null !== f2 ? (f2.childLanes = 0, f2.pendingProps = g2) : f2 = qj(g2, d2, 0, null), a2 = Ah(a2, d2, c2, null), f2.return = b, a2.return = b, f2.sibling = a2, b.child = f2, b.child.memoizedState = oj(c2), b.memoizedState = nj, a2) : rj(b, g2);
      }
      e2 = a2.memoizedState;
      if (null !== e2 && (h2 = e2.dehydrated, null !== h2)) return sj(a2, b, g2, d2, h2, e2, c2);
      if (f2) {
        f2 = d2.fallback;
        g2 = b.mode;
        e2 = a2.child;
        h2 = e2.sibling;
        var k2 = { mode: "hidden", children: d2.children };
        0 === (g2 & 1) && b.child !== e2 ? (d2 = b.child, d2.childLanes = 0, d2.pendingProps = k2, b.deletions = null) : (d2 = wh(e2, k2), d2.subtreeFlags = e2.subtreeFlags & 14680064);
        null !== h2 ? f2 = wh(h2, f2) : (f2 = Ah(f2, g2, c2, null), f2.flags |= 2);
        f2.return = b;
        d2.return = b;
        d2.sibling = f2;
        b.child = d2;
        d2 = f2;
        f2 = b.child;
        g2 = a2.child.memoizedState;
        g2 = null === g2 ? oj(c2) : { baseLanes: g2.baseLanes | c2, cachePool: null, transitions: g2.transitions };
        f2.memoizedState = g2;
        f2.childLanes = a2.childLanes & ~c2;
        b.memoizedState = nj;
        return d2;
      }
      f2 = a2.child;
      a2 = f2.sibling;
      d2 = wh(f2, { mode: "visible", children: d2.children });
      0 === (b.mode & 1) && (d2.lanes = c2);
      d2.return = b;
      d2.sibling = null;
      null !== a2 && (c2 = b.deletions, null === c2 ? (b.deletions = [a2], b.flags |= 16) : c2.push(a2));
      b.child = d2;
      b.memoizedState = null;
      return d2;
    }
    function rj(a2, b) {
      b = qj({ mode: "visible", children: b }, a2.mode, 0, null);
      b.return = a2;
      return a2.child = b;
    }
    function tj(a2, b, c2, d2) {
      null !== d2 && Jg(d2);
      Bh(b, a2.child, null, c2);
      a2 = rj(b, b.pendingProps.children);
      a2.flags |= 2;
      b.memoizedState = null;
      return a2;
    }
    function sj(a2, b, c2, d2, e2, f2, g2) {
      if (c2) {
        if (b.flags & 256) return b.flags &= -257, d2 = Li(Error(p2(422))), tj(a2, b, g2, d2);
        if (null !== b.memoizedState) return b.child = a2.child, b.flags |= 128, null;
        f2 = d2.fallback;
        e2 = b.mode;
        d2 = qj({ mode: "visible", children: d2.children }, e2, 0, null);
        f2 = Ah(f2, e2, g2, null);
        f2.flags |= 2;
        d2.return = b;
        f2.return = b;
        d2.sibling = f2;
        b.child = d2;
        0 !== (b.mode & 1) && Bh(b, a2.child, null, g2);
        b.child.memoizedState = oj(g2);
        b.memoizedState = nj;
        return f2;
      }
      if (0 === (b.mode & 1)) return tj(a2, b, g2, null);
      if ("$!" === e2.data) {
        d2 = e2.nextSibling && e2.nextSibling.dataset;
        if (d2) var h2 = d2.dgst;
        d2 = h2;
        f2 = Error(p2(419));
        d2 = Li(f2, d2, void 0);
        return tj(a2, b, g2, d2);
      }
      h2 = 0 !== (g2 & a2.childLanes);
      if (Ug || h2) {
        d2 = R;
        if (null !== d2) {
          switch (g2 & -g2) {
            case 4:
              e2 = 2;
              break;
            case 16:
              e2 = 8;
              break;
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
              e2 = 32;
              break;
            case 536870912:
              e2 = 268435456;
              break;
            default:
              e2 = 0;
          }
          e2 = 0 !== (e2 & (d2.suspendedLanes | g2)) ? 0 : e2;
          0 !== e2 && e2 !== f2.retryLane && (f2.retryLane = e2, Zg(a2, e2), mh(d2, a2, e2, -1));
        }
        uj();
        d2 = Li(Error(p2(421)));
        return tj(a2, b, g2, d2);
      }
      if ("$?" === e2.data) return b.flags |= 128, b.child = a2.child, b = vj.bind(null, a2), e2._reactRetry = b, null;
      a2 = f2.treeContext;
      yg = Lf(e2.nextSibling);
      xg = b;
      I = true;
      zg = null;
      null !== a2 && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a2.id, sg = a2.overflow, qg = b);
      b = rj(b, d2.children);
      b.flags |= 4096;
      return b;
    }
    function wj(a2, b, c2) {
      a2.lanes |= b;
      var d2 = a2.alternate;
      null !== d2 && (d2.lanes |= b);
      Sg(a2.return, b, c2);
    }
    function xj(a2, b, c2, d2, e2) {
      var f2 = a2.memoizedState;
      null === f2 ? a2.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d2, tail: c2, tailMode: e2 } : (f2.isBackwards = b, f2.rendering = null, f2.renderingStartTime = 0, f2.last = d2, f2.tail = c2, f2.tailMode = e2);
    }
    function yj(a2, b, c2) {
      var d2 = b.pendingProps, e2 = d2.revealOrder, f2 = d2.tail;
      Yi(a2, b, d2.children, c2);
      d2 = M.current;
      if (0 !== (d2 & 2)) d2 = d2 & 1 | 2, b.flags |= 128;
      else {
        if (null !== a2 && 0 !== (a2.flags & 128)) a: for (a2 = b.child; null !== a2; ) {
          if (13 === a2.tag) null !== a2.memoizedState && wj(a2, c2, b);
          else if (19 === a2.tag) wj(a2, c2, b);
          else if (null !== a2.child) {
            a2.child.return = a2;
            a2 = a2.child;
            continue;
          }
          if (a2 === b) break a;
          for (; null === a2.sibling; ) {
            if (null === a2.return || a2.return === b) break a;
            a2 = a2.return;
          }
          a2.sibling.return = a2.return;
          a2 = a2.sibling;
        }
        d2 &= 1;
      }
      G(M, d2);
      if (0 === (b.mode & 1)) b.memoizedState = null;
      else switch (e2) {
        case "forwards":
          c2 = b.child;
          for (e2 = null; null !== c2; ) a2 = c2.alternate, null !== a2 && null === Mh(a2) && (e2 = c2), c2 = c2.sibling;
          c2 = e2;
          null === c2 ? (e2 = b.child, b.child = null) : (e2 = c2.sibling, c2.sibling = null);
          xj(b, false, e2, c2, f2);
          break;
        case "backwards":
          c2 = null;
          e2 = b.child;
          for (b.child = null; null !== e2; ) {
            a2 = e2.alternate;
            if (null !== a2 && null === Mh(a2)) {
              b.child = e2;
              break;
            }
            a2 = e2.sibling;
            e2.sibling = c2;
            c2 = e2;
            e2 = a2;
          }
          xj(b, true, c2, null, f2);
          break;
        case "together":
          xj(b, false, null, null, void 0);
          break;
        default:
          b.memoizedState = null;
      }
      return b.child;
    }
    function jj(a2, b) {
      0 === (b.mode & 1) && null !== a2 && (a2.alternate = null, b.alternate = null, b.flags |= 2);
    }
    function $i(a2, b, c2) {
      null !== a2 && (b.dependencies = a2.dependencies);
      hh |= b.lanes;
      if (0 === (c2 & b.childLanes)) return null;
      if (null !== a2 && b.child !== a2.child) throw Error(p2(153));
      if (null !== b.child) {
        a2 = b.child;
        c2 = wh(a2, a2.pendingProps);
        b.child = c2;
        for (c2.return = b; null !== a2.sibling; ) a2 = a2.sibling, c2 = c2.sibling = wh(a2, a2.pendingProps), c2.return = b;
        c2.sibling = null;
      }
      return b.child;
    }
    function zj(a2, b, c2) {
      switch (b.tag) {
        case 3:
          lj(b);
          Ig();
          break;
        case 5:
          Kh(b);
          break;
        case 1:
          Zf(b.type) && cg(b);
          break;
        case 4:
          Ih(b, b.stateNode.containerInfo);
          break;
        case 10:
          var d2 = b.type._context, e2 = b.memoizedProps.value;
          G(Mg, d2._currentValue);
          d2._currentValue = e2;
          break;
        case 13:
          d2 = b.memoizedState;
          if (null !== d2) {
            if (null !== d2.dehydrated) return G(M, M.current & 1), b.flags |= 128, null;
            if (0 !== (c2 & b.child.childLanes)) return pj(a2, b, c2);
            G(M, M.current & 1);
            a2 = $i(a2, b, c2);
            return null !== a2 ? a2.sibling : null;
          }
          G(M, M.current & 1);
          break;
        case 19:
          d2 = 0 !== (c2 & b.childLanes);
          if (0 !== (a2.flags & 128)) {
            if (d2) return yj(a2, b, c2);
            b.flags |= 128;
          }
          e2 = b.memoizedState;
          null !== e2 && (e2.rendering = null, e2.tail = null, e2.lastEffect = null);
          G(M, M.current);
          if (d2) break;
          else return null;
        case 22:
        case 23:
          return b.lanes = 0, ej(a2, b, c2);
      }
      return $i(a2, b, c2);
    }
    var Aj, Bj, Cj, Dj;
    Aj = function(a2, b) {
      for (var c2 = b.child; null !== c2; ) {
        if (5 === c2.tag || 6 === c2.tag) a2.appendChild(c2.stateNode);
        else if (4 !== c2.tag && null !== c2.child) {
          c2.child.return = c2;
          c2 = c2.child;
          continue;
        }
        if (c2 === b) break;
        for (; null === c2.sibling; ) {
          if (null === c2.return || c2.return === b) return;
          c2 = c2.return;
        }
        c2.sibling.return = c2.return;
        c2 = c2.sibling;
      }
    };
    Bj = function() {
    };
    Cj = function(a2, b, c2, d2) {
      var e2 = a2.memoizedProps;
      if (e2 !== d2) {
        a2 = b.stateNode;
        Hh(Eh.current);
        var f2 = null;
        switch (c2) {
          case "input":
            e2 = Ya(a2, e2);
            d2 = Ya(a2, d2);
            f2 = [];
            break;
          case "select":
            e2 = A({}, e2, { value: void 0 });
            d2 = A({}, d2, { value: void 0 });
            f2 = [];
            break;
          case "textarea":
            e2 = gb(a2, e2);
            d2 = gb(a2, d2);
            f2 = [];
            break;
          default:
            "function" !== typeof e2.onClick && "function" === typeof d2.onClick && (a2.onclick = Bf);
        }
        ub(c2, d2);
        var g2;
        c2 = null;
        for (l2 in e2) if (!d2.hasOwnProperty(l2) && e2.hasOwnProperty(l2) && null != e2[l2]) if ("style" === l2) {
          var h2 = e2[l2];
          for (g2 in h2) h2.hasOwnProperty(g2) && (c2 || (c2 = {}), c2[g2] = "");
        } else "dangerouslySetInnerHTML" !== l2 && "children" !== l2 && "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && "autoFocus" !== l2 && (ea.hasOwnProperty(l2) ? f2 || (f2 = []) : (f2 = f2 || []).push(l2, null));
        for (l2 in d2) {
          var k2 = d2[l2];
          h2 = null != e2 ? e2[l2] : void 0;
          if (d2.hasOwnProperty(l2) && k2 !== h2 && (null != k2 || null != h2)) if ("style" === l2) if (h2) {
            for (g2 in h2) !h2.hasOwnProperty(g2) || k2 && k2.hasOwnProperty(g2) || (c2 || (c2 = {}), c2[g2] = "");
            for (g2 in k2) k2.hasOwnProperty(g2) && h2[g2] !== k2[g2] && (c2 || (c2 = {}), c2[g2] = k2[g2]);
          } else c2 || (f2 || (f2 = []), f2.push(
            l2,
            c2
          )), c2 = k2;
          else "dangerouslySetInnerHTML" === l2 ? (k2 = k2 ? k2.__html : void 0, h2 = h2 ? h2.__html : void 0, null != k2 && h2 !== k2 && (f2 = f2 || []).push(l2, k2)) : "children" === l2 ? "string" !== typeof k2 && "number" !== typeof k2 || (f2 = f2 || []).push(l2, "" + k2) : "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && (ea.hasOwnProperty(l2) ? (null != k2 && "onScroll" === l2 && D2("scroll", a2), f2 || h2 === k2 || (f2 = [])) : (f2 = f2 || []).push(l2, k2));
        }
        c2 && (f2 = f2 || []).push("style", c2);
        var l2 = f2;
        if (b.updateQueue = l2) b.flags |= 4;
      }
    };
    Dj = function(a2, b, c2, d2) {
      c2 !== d2 && (b.flags |= 4);
    };
    function Ej(a2, b) {
      if (!I) switch (a2.tailMode) {
        case "hidden":
          b = a2.tail;
          for (var c2 = null; null !== b; ) null !== b.alternate && (c2 = b), b = b.sibling;
          null === c2 ? a2.tail = null : c2.sibling = null;
          break;
        case "collapsed":
          c2 = a2.tail;
          for (var d2 = null; null !== c2; ) null !== c2.alternate && (d2 = c2), c2 = c2.sibling;
          null === d2 ? b || null === a2.tail ? a2.tail = null : a2.tail.sibling = null : d2.sibling = null;
      }
    }
    function S2(a2) {
      var b = null !== a2.alternate && a2.alternate.child === a2.child, c2 = 0, d2 = 0;
      if (b) for (var e2 = a2.child; null !== e2; ) c2 |= e2.lanes | e2.childLanes, d2 |= e2.subtreeFlags & 14680064, d2 |= e2.flags & 14680064, e2.return = a2, e2 = e2.sibling;
      else for (e2 = a2.child; null !== e2; ) c2 |= e2.lanes | e2.childLanes, d2 |= e2.subtreeFlags, d2 |= e2.flags, e2.return = a2, e2 = e2.sibling;
      a2.subtreeFlags |= d2;
      a2.childLanes = c2;
      return b;
    }
    function Fj(a2, b, c2) {
      var d2 = b.pendingProps;
      wg(b);
      switch (b.tag) {
        case 2:
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return S2(b), null;
        case 1:
          return Zf(b.type) && $f(), S2(b), null;
        case 3:
          d2 = b.stateNode;
          Jh();
          E2(Wf);
          E2(H2);
          Oh();
          d2.pendingContext && (d2.context = d2.pendingContext, d2.pendingContext = null);
          if (null === a2 || null === a2.child) Gg(b) ? b.flags |= 4 : null === a2 || a2.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Gj(zg), zg = null));
          Bj(a2, b);
          S2(b);
          return null;
        case 5:
          Lh(b);
          var e2 = Hh(Gh.current);
          c2 = b.type;
          if (null !== a2 && null != b.stateNode) Cj(a2, b, c2, d2, e2), a2.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
          else {
            if (!d2) {
              if (null === b.stateNode) throw Error(p2(166));
              S2(b);
              return null;
            }
            a2 = Hh(Eh.current);
            if (Gg(b)) {
              d2 = b.stateNode;
              c2 = b.type;
              var f2 = b.memoizedProps;
              d2[Of] = b;
              d2[Pf] = f2;
              a2 = 0 !== (b.mode & 1);
              switch (c2) {
                case "dialog":
                  D2("cancel", d2);
                  D2("close", d2);
                  break;
                case "iframe":
                case "object":
                case "embed":
                  D2("load", d2);
                  break;
                case "video":
                case "audio":
                  for (e2 = 0; e2 < lf.length; e2++) D2(lf[e2], d2);
                  break;
                case "source":
                  D2("error", d2);
                  break;
                case "img":
                case "image":
                case "link":
                  D2(
                    "error",
                    d2
                  );
                  D2("load", d2);
                  break;
                case "details":
                  D2("toggle", d2);
                  break;
                case "input":
                  Za(d2, f2);
                  D2("invalid", d2);
                  break;
                case "select":
                  d2._wrapperState = { wasMultiple: !!f2.multiple };
                  D2("invalid", d2);
                  break;
                case "textarea":
                  hb(d2, f2), D2("invalid", d2);
              }
              ub(c2, f2);
              e2 = null;
              for (var g2 in f2) if (f2.hasOwnProperty(g2)) {
                var h2 = f2[g2];
                "children" === g2 ? "string" === typeof h2 ? d2.textContent !== h2 && (true !== f2.suppressHydrationWarning && Af(d2.textContent, h2, a2), e2 = ["children", h2]) : "number" === typeof h2 && d2.textContent !== "" + h2 && (true !== f2.suppressHydrationWarning && Af(
                  d2.textContent,
                  h2,
                  a2
                ), e2 = ["children", "" + h2]) : ea.hasOwnProperty(g2) && null != h2 && "onScroll" === g2 && D2("scroll", d2);
              }
              switch (c2) {
                case "input":
                  Va(d2);
                  db(d2, f2, true);
                  break;
                case "textarea":
                  Va(d2);
                  jb(d2);
                  break;
                case "select":
                case "option":
                  break;
                default:
                  "function" === typeof f2.onClick && (d2.onclick = Bf);
              }
              d2 = e2;
              b.updateQueue = d2;
              null !== d2 && (b.flags |= 4);
            } else {
              g2 = 9 === e2.nodeType ? e2 : e2.ownerDocument;
              "http://www.w3.org/1999/xhtml" === a2 && (a2 = kb(c2));
              "http://www.w3.org/1999/xhtml" === a2 ? "script" === c2 ? (a2 = g2.createElement("div"), a2.innerHTML = "<script><\/script>", a2 = a2.removeChild(a2.firstChild)) : "string" === typeof d2.is ? a2 = g2.createElement(c2, { is: d2.is }) : (a2 = g2.createElement(c2), "select" === c2 && (g2 = a2, d2.multiple ? g2.multiple = true : d2.size && (g2.size = d2.size))) : a2 = g2.createElementNS(a2, c2);
              a2[Of] = b;
              a2[Pf] = d2;
              Aj(a2, b, false, false);
              b.stateNode = a2;
              a: {
                g2 = vb(c2, d2);
                switch (c2) {
                  case "dialog":
                    D2("cancel", a2);
                    D2("close", a2);
                    e2 = d2;
                    break;
                  case "iframe":
                  case "object":
                  case "embed":
                    D2("load", a2);
                    e2 = d2;
                    break;
                  case "video":
                  case "audio":
                    for (e2 = 0; e2 < lf.length; e2++) D2(lf[e2], a2);
                    e2 = d2;
                    break;
                  case "source":
                    D2("error", a2);
                    e2 = d2;
                    break;
                  case "img":
                  case "image":
                  case "link":
                    D2(
                      "error",
                      a2
                    );
                    D2("load", a2);
                    e2 = d2;
                    break;
                  case "details":
                    D2("toggle", a2);
                    e2 = d2;
                    break;
                  case "input":
                    Za(a2, d2);
                    e2 = Ya(a2, d2);
                    D2("invalid", a2);
                    break;
                  case "option":
                    e2 = d2;
                    break;
                  case "select":
                    a2._wrapperState = { wasMultiple: !!d2.multiple };
                    e2 = A({}, d2, { value: void 0 });
                    D2("invalid", a2);
                    break;
                  case "textarea":
                    hb(a2, d2);
                    e2 = gb(a2, d2);
                    D2("invalid", a2);
                    break;
                  default:
                    e2 = d2;
                }
                ub(c2, e2);
                h2 = e2;
                for (f2 in h2) if (h2.hasOwnProperty(f2)) {
                  var k2 = h2[f2];
                  "style" === f2 ? sb(a2, k2) : "dangerouslySetInnerHTML" === f2 ? (k2 = k2 ? k2.__html : void 0, null != k2 && nb(a2, k2)) : "children" === f2 ? "string" === typeof k2 ? ("textarea" !== c2 || "" !== k2) && ob(a2, k2) : "number" === typeof k2 && ob(a2, "" + k2) : "suppressContentEditableWarning" !== f2 && "suppressHydrationWarning" !== f2 && "autoFocus" !== f2 && (ea.hasOwnProperty(f2) ? null != k2 && "onScroll" === f2 && D2("scroll", a2) : null != k2 && ta(a2, f2, k2, g2));
                }
                switch (c2) {
                  case "input":
                    Va(a2);
                    db(a2, d2, false);
                    break;
                  case "textarea":
                    Va(a2);
                    jb(a2);
                    break;
                  case "option":
                    null != d2.value && a2.setAttribute("value", "" + Sa(d2.value));
                    break;
                  case "select":
                    a2.multiple = !!d2.multiple;
                    f2 = d2.value;
                    null != f2 ? fb(a2, !!d2.multiple, f2, false) : null != d2.defaultValue && fb(
                      a2,
                      !!d2.multiple,
                      d2.defaultValue,
                      true
                    );
                    break;
                  default:
                    "function" === typeof e2.onClick && (a2.onclick = Bf);
                }
                switch (c2) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    d2 = !!d2.autoFocus;
                    break a;
                  case "img":
                    d2 = true;
                    break a;
                  default:
                    d2 = false;
                }
              }
              d2 && (b.flags |= 4);
            }
            null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
          }
          S2(b);
          return null;
        case 6:
          if (a2 && null != b.stateNode) Dj(a2, b, a2.memoizedProps, d2);
          else {
            if ("string" !== typeof d2 && null === b.stateNode) throw Error(p2(166));
            c2 = Hh(Gh.current);
            Hh(Eh.current);
            if (Gg(b)) {
              d2 = b.stateNode;
              c2 = b.memoizedProps;
              d2[Of] = b;
              if (f2 = d2.nodeValue !== c2) {
                if (a2 = xg, null !== a2) switch (a2.tag) {
                  case 3:
                    Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                    break;
                  case 5:
                    true !== a2.memoizedProps.suppressHydrationWarning && Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                }
              }
              f2 && (b.flags |= 4);
            } else d2 = (9 === c2.nodeType ? c2 : c2.ownerDocument).createTextNode(d2), d2[Of] = b, b.stateNode = d2;
          }
          S2(b);
          return null;
        case 13:
          E2(M);
          d2 = b.memoizedState;
          if (null === a2 || null !== a2.memoizedState && null !== a2.memoizedState.dehydrated) {
            if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f2 = false;
            else if (f2 = Gg(b), null !== d2 && null !== d2.dehydrated) {
              if (null === a2) {
                if (!f2) throw Error(p2(318));
                f2 = b.memoizedState;
                f2 = null !== f2 ? f2.dehydrated : null;
                if (!f2) throw Error(p2(317));
                f2[Of] = b;
              } else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
              S2(b);
              f2 = false;
            } else null !== zg && (Gj(zg), zg = null), f2 = true;
            if (!f2) return b.flags & 65536 ? b : null;
          }
          if (0 !== (b.flags & 128)) return b.lanes = c2, b;
          d2 = null !== d2;
          d2 !== (null !== a2 && null !== a2.memoizedState) && d2 && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a2 || 0 !== (M.current & 1) ? 0 === T && (T = 3) : uj()));
          null !== b.updateQueue && (b.flags |= 4);
          S2(b);
          return null;
        case 4:
          return Jh(), Bj(a2, b), null === a2 && sf(b.stateNode.containerInfo), S2(b), null;
        case 10:
          return Rg(b.type._context), S2(b), null;
        case 17:
          return Zf(b.type) && $f(), S2(b), null;
        case 19:
          E2(M);
          f2 = b.memoizedState;
          if (null === f2) return S2(b), null;
          d2 = 0 !== (b.flags & 128);
          g2 = f2.rendering;
          if (null === g2) if (d2) Ej(f2, false);
          else {
            if (0 !== T || null !== a2 && 0 !== (a2.flags & 128)) for (a2 = b.child; null !== a2; ) {
              g2 = Mh(a2);
              if (null !== g2) {
                b.flags |= 128;
                Ej(f2, false);
                d2 = g2.updateQueue;
                null !== d2 && (b.updateQueue = d2, b.flags |= 4);
                b.subtreeFlags = 0;
                d2 = c2;
                for (c2 = b.child; null !== c2; ) f2 = c2, a2 = d2, f2.flags &= 14680066, g2 = f2.alternate, null === g2 ? (f2.childLanes = 0, f2.lanes = a2, f2.child = null, f2.subtreeFlags = 0, f2.memoizedProps = null, f2.memoizedState = null, f2.updateQueue = null, f2.dependencies = null, f2.stateNode = null) : (f2.childLanes = g2.childLanes, f2.lanes = g2.lanes, f2.child = g2.child, f2.subtreeFlags = 0, f2.deletions = null, f2.memoizedProps = g2.memoizedProps, f2.memoizedState = g2.memoizedState, f2.updateQueue = g2.updateQueue, f2.type = g2.type, a2 = g2.dependencies, f2.dependencies = null === a2 ? null : { lanes: a2.lanes, firstContext: a2.firstContext }), c2 = c2.sibling;
                G(M, M.current & 1 | 2);
                return b.child;
              }
              a2 = a2.sibling;
            }
            null !== f2.tail && B() > Hj && (b.flags |= 128, d2 = true, Ej(f2, false), b.lanes = 4194304);
          }
          else {
            if (!d2) if (a2 = Mh(g2), null !== a2) {
              if (b.flags |= 128, d2 = true, c2 = a2.updateQueue, null !== c2 && (b.updateQueue = c2, b.flags |= 4), Ej(f2, true), null === f2.tail && "hidden" === f2.tailMode && !g2.alternate && !I) return S2(b), null;
            } else 2 * B() - f2.renderingStartTime > Hj && 1073741824 !== c2 && (b.flags |= 128, d2 = true, Ej(f2, false), b.lanes = 4194304);
            f2.isBackwards ? (g2.sibling = b.child, b.child = g2) : (c2 = f2.last, null !== c2 ? c2.sibling = g2 : b.child = g2, f2.last = g2);
          }
          if (null !== f2.tail) return b = f2.tail, f2.rendering = b, f2.tail = b.sibling, f2.renderingStartTime = B(), b.sibling = null, c2 = M.current, G(M, d2 ? c2 & 1 | 2 : c2 & 1), b;
          S2(b);
          return null;
        case 22:
        case 23:
          return Ij(), d2 = null !== b.memoizedState, null !== a2 && null !== a2.memoizedState !== d2 && (b.flags |= 8192), d2 && 0 !== (b.mode & 1) ? 0 !== (gj & 1073741824) && (S2(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S2(b), null;
        case 24:
          return null;
        case 25:
          return null;
      }
      throw Error(p2(156, b.tag));
    }
    function Jj(a2, b) {
      wg(b);
      switch (b.tag) {
        case 1:
          return Zf(b.type) && $f(), a2 = b.flags, a2 & 65536 ? (b.flags = a2 & -65537 | 128, b) : null;
        case 3:
          return Jh(), E2(Wf), E2(H2), Oh(), a2 = b.flags, 0 !== (a2 & 65536) && 0 === (a2 & 128) ? (b.flags = a2 & -65537 | 128, b) : null;
        case 5:
          return Lh(b), null;
        case 13:
          E2(M);
          a2 = b.memoizedState;
          if (null !== a2 && null !== a2.dehydrated) {
            if (null === b.alternate) throw Error(p2(340));
            Ig();
          }
          a2 = b.flags;
          return a2 & 65536 ? (b.flags = a2 & -65537 | 128, b) : null;
        case 19:
          return E2(M), null;
        case 4:
          return Jh(), null;
        case 10:
          return Rg(b.type._context), null;
        case 22:
        case 23:
          return Ij(), null;
        case 24:
          return null;
        default:
          return null;
      }
    }
    var Kj = false, U = false, Lj = "function" === typeof WeakSet ? WeakSet : Set, V2 = null;
    function Mj(a2, b) {
      var c2 = a2.ref;
      if (null !== c2) if ("function" === typeof c2) try {
        c2(null);
      } catch (d2) {
        W2(a2, b, d2);
      }
      else c2.current = null;
    }
    function Nj(a2, b, c2) {
      try {
        c2();
      } catch (d2) {
        W2(a2, b, d2);
      }
    }
    var Oj = false;
    function Pj(a2, b) {
      Cf = dd;
      a2 = Me2();
      if (Ne(a2)) {
        if ("selectionStart" in a2) var c2 = { start: a2.selectionStart, end: a2.selectionEnd };
        else a: {
          c2 = (c2 = a2.ownerDocument) && c2.defaultView || window;
          var d2 = c2.getSelection && c2.getSelection();
          if (d2 && 0 !== d2.rangeCount) {
            c2 = d2.anchorNode;
            var e2 = d2.anchorOffset, f2 = d2.focusNode;
            d2 = d2.focusOffset;
            try {
              c2.nodeType, f2.nodeType;
            } catch (F2) {
              c2 = null;
              break a;
            }
            var g2 = 0, h2 = -1, k2 = -1, l2 = 0, m2 = 0, q = a2, r = null;
            b: for (; ; ) {
              for (var y; ; ) {
                q !== c2 || 0 !== e2 && 3 !== q.nodeType || (h2 = g2 + e2);
                q !== f2 || 0 !== d2 && 3 !== q.nodeType || (k2 = g2 + d2);
                3 === q.nodeType && (g2 += q.nodeValue.length);
                if (null === (y = q.firstChild)) break;
                r = q;
                q = y;
              }
              for (; ; ) {
                if (q === a2) break b;
                r === c2 && ++l2 === e2 && (h2 = g2);
                r === f2 && ++m2 === d2 && (k2 = g2);
                if (null !== (y = q.nextSibling)) break;
                q = r;
                r = q.parentNode;
              }
              q = y;
            }
            c2 = -1 === h2 || -1 === k2 ? null : { start: h2, end: k2 };
          } else c2 = null;
        }
        c2 = c2 || { start: 0, end: 0 };
      } else c2 = null;
      Df = { focusedElem: a2, selectionRange: c2 };
      dd = false;
      for (V2 = b; null !== V2; ) if (b = V2, a2 = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a2) a2.return = b, V2 = a2;
      else for (; null !== V2; ) {
        b = V2;
        try {
          var n2 = b.alternate;
          if (0 !== (b.flags & 1024)) switch (b.tag) {
            case 0:
            case 11:
            case 15:
              break;
            case 1:
              if (null !== n2) {
                var t2 = n2.memoizedProps, J = n2.memoizedState, x = b.stateNode, w2 = x.getSnapshotBeforeUpdate(b.elementType === b.type ? t2 : Lg(b.type, t2), J);
                x.__reactInternalSnapshotBeforeUpdate = w2;
              }
              break;
            case 3:
              var u2 = b.stateNode.containerInfo;
              1 === u2.nodeType ? u2.textContent = "" : 9 === u2.nodeType && u2.documentElement && u2.removeChild(u2.documentElement);
              break;
            case 5:
            case 6:
            case 4:
            case 17:
              break;
            default:
              throw Error(p2(163));
          }
        } catch (F2) {
          W2(b, b.return, F2);
        }
        a2 = b.sibling;
        if (null !== a2) {
          a2.return = b.return;
          V2 = a2;
          break;
        }
        V2 = b.return;
      }
      n2 = Oj;
      Oj = false;
      return n2;
    }
    function Qj(a2, b, c2) {
      var d2 = b.updateQueue;
      d2 = null !== d2 ? d2.lastEffect : null;
      if (null !== d2) {
        var e2 = d2 = d2.next;
        do {
          if ((e2.tag & a2) === a2) {
            var f2 = e2.destroy;
            e2.destroy = void 0;
            void 0 !== f2 && Nj(b, c2, f2);
          }
          e2 = e2.next;
        } while (e2 !== d2);
      }
    }
    function Rj(a2, b) {
      b = b.updateQueue;
      b = null !== b ? b.lastEffect : null;
      if (null !== b) {
        var c2 = b = b.next;
        do {
          if ((c2.tag & a2) === a2) {
            var d2 = c2.create;
            c2.destroy = d2();
          }
          c2 = c2.next;
        } while (c2 !== b);
      }
    }
    function Sj(a2) {
      var b = a2.ref;
      if (null !== b) {
        var c2 = a2.stateNode;
        switch (a2.tag) {
          case 5:
            a2 = c2;
            break;
          default:
            a2 = c2;
        }
        "function" === typeof b ? b(a2) : b.current = a2;
      }
    }
    function Tj(a2) {
      var b = a2.alternate;
      null !== b && (a2.alternate = null, Tj(b));
      a2.child = null;
      a2.deletions = null;
      a2.sibling = null;
      5 === a2.tag && (b = a2.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
      a2.stateNode = null;
      a2.return = null;
      a2.dependencies = null;
      a2.memoizedProps = null;
      a2.memoizedState = null;
      a2.pendingProps = null;
      a2.stateNode = null;
      a2.updateQueue = null;
    }
    function Uj(a2) {
      return 5 === a2.tag || 3 === a2.tag || 4 === a2.tag;
    }
    function Vj(a2) {
      a: for (; ; ) {
        for (; null === a2.sibling; ) {
          if (null === a2.return || Uj(a2.return)) return null;
          a2 = a2.return;
        }
        a2.sibling.return = a2.return;
        for (a2 = a2.sibling; 5 !== a2.tag && 6 !== a2.tag && 18 !== a2.tag; ) {
          if (a2.flags & 2) continue a;
          if (null === a2.child || 4 === a2.tag) continue a;
          else a2.child.return = a2, a2 = a2.child;
        }
        if (!(a2.flags & 2)) return a2.stateNode;
      }
    }
    function Wj(a2, b, c2) {
      var d2 = a2.tag;
      if (5 === d2 || 6 === d2) a2 = a2.stateNode, b ? 8 === c2.nodeType ? c2.parentNode.insertBefore(a2, b) : c2.insertBefore(a2, b) : (8 === c2.nodeType ? (b = c2.parentNode, b.insertBefore(a2, c2)) : (b = c2, b.appendChild(a2)), c2 = c2._reactRootContainer, null !== c2 && void 0 !== c2 || null !== b.onclick || (b.onclick = Bf));
      else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Wj(a2, b, c2), a2 = a2.sibling; null !== a2; ) Wj(a2, b, c2), a2 = a2.sibling;
    }
    function Xj(a2, b, c2) {
      var d2 = a2.tag;
      if (5 === d2 || 6 === d2) a2 = a2.stateNode, b ? c2.insertBefore(a2, b) : c2.appendChild(a2);
      else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Xj(a2, b, c2), a2 = a2.sibling; null !== a2; ) Xj(a2, b, c2), a2 = a2.sibling;
    }
    var X = null, Yj = false;
    function Zj(a2, b, c2) {
      for (c2 = c2.child; null !== c2; ) ak(a2, b, c2), c2 = c2.sibling;
    }
    function ak(a2, b, c2) {
      if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
        lc.onCommitFiberUnmount(kc, c2);
      } catch (h2) {
      }
      switch (c2.tag) {
        case 5:
          U || Mj(c2, b);
        case 6:
          var d2 = X, e2 = Yj;
          X = null;
          Zj(a2, b, c2);
          X = d2;
          Yj = e2;
          null !== X && (Yj ? (a2 = X, c2 = c2.stateNode, 8 === a2.nodeType ? a2.parentNode.removeChild(c2) : a2.removeChild(c2)) : X.removeChild(c2.stateNode));
          break;
        case 18:
          null !== X && (Yj ? (a2 = X, c2 = c2.stateNode, 8 === a2.nodeType ? Kf(a2.parentNode, c2) : 1 === a2.nodeType && Kf(a2, c2), bd(a2)) : Kf(X, c2.stateNode));
          break;
        case 4:
          d2 = X;
          e2 = Yj;
          X = c2.stateNode.containerInfo;
          Yj = true;
          Zj(a2, b, c2);
          X = d2;
          Yj = e2;
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          if (!U && (d2 = c2.updateQueue, null !== d2 && (d2 = d2.lastEffect, null !== d2))) {
            e2 = d2 = d2.next;
            do {
              var f2 = e2, g2 = f2.destroy;
              f2 = f2.tag;
              void 0 !== g2 && (0 !== (f2 & 2) ? Nj(c2, b, g2) : 0 !== (f2 & 4) && Nj(c2, b, g2));
              e2 = e2.next;
            } while (e2 !== d2);
          }
          Zj(a2, b, c2);
          break;
        case 1:
          if (!U && (Mj(c2, b), d2 = c2.stateNode, "function" === typeof d2.componentWillUnmount)) try {
            d2.props = c2.memoizedProps, d2.state = c2.memoizedState, d2.componentWillUnmount();
          } catch (h2) {
            W2(c2, b, h2);
          }
          Zj(a2, b, c2);
          break;
        case 21:
          Zj(a2, b, c2);
          break;
        case 22:
          c2.mode & 1 ? (U = (d2 = U) || null !== c2.memoizedState, Zj(a2, b, c2), U = d2) : Zj(a2, b, c2);
          break;
        default:
          Zj(a2, b, c2);
      }
    }
    function bk(a2) {
      var b = a2.updateQueue;
      if (null !== b) {
        a2.updateQueue = null;
        var c2 = a2.stateNode;
        null === c2 && (c2 = a2.stateNode = new Lj());
        b.forEach(function(b2) {
          var d2 = ck.bind(null, a2, b2);
          c2.has(b2) || (c2.add(b2), b2.then(d2, d2));
        });
      }
    }
    function dk(a2, b) {
      var c2 = b.deletions;
      if (null !== c2) for (var d2 = 0; d2 < c2.length; d2++) {
        var e2 = c2[d2];
        try {
          var f2 = a2, g2 = b, h2 = g2;
          a: for (; null !== h2; ) {
            switch (h2.tag) {
              case 5:
                X = h2.stateNode;
                Yj = false;
                break a;
              case 3:
                X = h2.stateNode.containerInfo;
                Yj = true;
                break a;
              case 4:
                X = h2.stateNode.containerInfo;
                Yj = true;
                break a;
            }
            h2 = h2.return;
          }
          if (null === X) throw Error(p2(160));
          ak(f2, g2, e2);
          X = null;
          Yj = false;
          var k2 = e2.alternate;
          null !== k2 && (k2.return = null);
          e2.return = null;
        } catch (l2) {
          W2(e2, b, l2);
        }
      }
      if (b.subtreeFlags & 12854) for (b = b.child; null !== b; ) ek(b, a2), b = b.sibling;
    }
    function ek(a2, b) {
      var c2 = a2.alternate, d2 = a2.flags;
      switch (a2.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          dk(b, a2);
          fk(a2);
          if (d2 & 4) {
            try {
              Qj(3, a2, a2.return), Rj(3, a2);
            } catch (t2) {
              W2(a2, a2.return, t2);
            }
            try {
              Qj(5, a2, a2.return);
            } catch (t2) {
              W2(a2, a2.return, t2);
            }
          }
          break;
        case 1:
          dk(b, a2);
          fk(a2);
          d2 & 512 && null !== c2 && Mj(c2, c2.return);
          break;
        case 5:
          dk(b, a2);
          fk(a2);
          d2 & 512 && null !== c2 && Mj(c2, c2.return);
          if (a2.flags & 32) {
            var e2 = a2.stateNode;
            try {
              ob(e2, "");
            } catch (t2) {
              W2(a2, a2.return, t2);
            }
          }
          if (d2 & 4 && (e2 = a2.stateNode, null != e2)) {
            var f2 = a2.memoizedProps, g2 = null !== c2 ? c2.memoizedProps : f2, h2 = a2.type, k2 = a2.updateQueue;
            a2.updateQueue = null;
            if (null !== k2) try {
              "input" === h2 && "radio" === f2.type && null != f2.name && ab(e2, f2);
              vb(h2, g2);
              var l2 = vb(h2, f2);
              for (g2 = 0; g2 < k2.length; g2 += 2) {
                var m2 = k2[g2], q = k2[g2 + 1];
                "style" === m2 ? sb(e2, q) : "dangerouslySetInnerHTML" === m2 ? nb(e2, q) : "children" === m2 ? ob(e2, q) : ta(e2, m2, q, l2);
              }
              switch (h2) {
                case "input":
                  bb(e2, f2);
                  break;
                case "textarea":
                  ib(e2, f2);
                  break;
                case "select":
                  var r = e2._wrapperState.wasMultiple;
                  e2._wrapperState.wasMultiple = !!f2.multiple;
                  var y = f2.value;
                  null != y ? fb(e2, !!f2.multiple, y, false) : r !== !!f2.multiple && (null != f2.defaultValue ? fb(
                    e2,
                    !!f2.multiple,
                    f2.defaultValue,
                    true
                  ) : fb(e2, !!f2.multiple, f2.multiple ? [] : "", false));
              }
              e2[Pf] = f2;
            } catch (t2) {
              W2(a2, a2.return, t2);
            }
          }
          break;
        case 6:
          dk(b, a2);
          fk(a2);
          if (d2 & 4) {
            if (null === a2.stateNode) throw Error(p2(162));
            e2 = a2.stateNode;
            f2 = a2.memoizedProps;
            try {
              e2.nodeValue = f2;
            } catch (t2) {
              W2(a2, a2.return, t2);
            }
          }
          break;
        case 3:
          dk(b, a2);
          fk(a2);
          if (d2 & 4 && null !== c2 && c2.memoizedState.isDehydrated) try {
            bd(b.containerInfo);
          } catch (t2) {
            W2(a2, a2.return, t2);
          }
          break;
        case 4:
          dk(b, a2);
          fk(a2);
          break;
        case 13:
          dk(b, a2);
          fk(a2);
          e2 = a2.child;
          e2.flags & 8192 && (f2 = null !== e2.memoizedState, e2.stateNode.isHidden = f2, !f2 || null !== e2.alternate && null !== e2.alternate.memoizedState || (gk = B()));
          d2 & 4 && bk(a2);
          break;
        case 22:
          m2 = null !== c2 && null !== c2.memoizedState;
          a2.mode & 1 ? (U = (l2 = U) || m2, dk(b, a2), U = l2) : dk(b, a2);
          fk(a2);
          if (d2 & 8192) {
            l2 = null !== a2.memoizedState;
            if ((a2.stateNode.isHidden = l2) && !m2 && 0 !== (a2.mode & 1)) for (V2 = a2, m2 = a2.child; null !== m2; ) {
              for (q = V2 = m2; null !== V2; ) {
                r = V2;
                y = r.child;
                switch (r.tag) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    Qj(4, r, r.return);
                    break;
                  case 1:
                    Mj(r, r.return);
                    var n2 = r.stateNode;
                    if ("function" === typeof n2.componentWillUnmount) {
                      d2 = r;
                      c2 = r.return;
                      try {
                        b = d2, n2.props = b.memoizedProps, n2.state = b.memoizedState, n2.componentWillUnmount();
                      } catch (t2) {
                        W2(d2, c2, t2);
                      }
                    }
                    break;
                  case 5:
                    Mj(r, r.return);
                    break;
                  case 22:
                    if (null !== r.memoizedState) {
                      hk(q);
                      continue;
                    }
                }
                null !== y ? (y.return = r, V2 = y) : hk(q);
              }
              m2 = m2.sibling;
            }
            a: for (m2 = null, q = a2; ; ) {
              if (5 === q.tag) {
                if (null === m2) {
                  m2 = q;
                  try {
                    e2 = q.stateNode, l2 ? (f2 = e2.style, "function" === typeof f2.setProperty ? f2.setProperty("display", "none", "important") : f2.display = "none") : (h2 = q.stateNode, k2 = q.memoizedProps.style, g2 = void 0 !== k2 && null !== k2 && k2.hasOwnProperty("display") ? k2.display : null, h2.style.display = rb("display", g2));
                  } catch (t2) {
                    W2(a2, a2.return, t2);
                  }
                }
              } else if (6 === q.tag) {
                if (null === m2) try {
                  q.stateNode.nodeValue = l2 ? "" : q.memoizedProps;
                } catch (t2) {
                  W2(a2, a2.return, t2);
                }
              } else if ((22 !== q.tag && 23 !== q.tag || null === q.memoizedState || q === a2) && null !== q.child) {
                q.child.return = q;
                q = q.child;
                continue;
              }
              if (q === a2) break a;
              for (; null === q.sibling; ) {
                if (null === q.return || q.return === a2) break a;
                m2 === q && (m2 = null);
                q = q.return;
              }
              m2 === q && (m2 = null);
              q.sibling.return = q.return;
              q = q.sibling;
            }
          }
          break;
        case 19:
          dk(b, a2);
          fk(a2);
          d2 & 4 && bk(a2);
          break;
        case 21:
          break;
        default:
          dk(
            b,
            a2
          ), fk(a2);
      }
    }
    function fk(a2) {
      var b = a2.flags;
      if (b & 2) {
        try {
          a: {
            for (var c2 = a2.return; null !== c2; ) {
              if (Uj(c2)) {
                var d2 = c2;
                break a;
              }
              c2 = c2.return;
            }
            throw Error(p2(160));
          }
          switch (d2.tag) {
            case 5:
              var e2 = d2.stateNode;
              d2.flags & 32 && (ob(e2, ""), d2.flags &= -33);
              var f2 = Vj(a2);
              Xj(a2, f2, e2);
              break;
            case 3:
            case 4:
              var g2 = d2.stateNode.containerInfo, h2 = Vj(a2);
              Wj(a2, h2, g2);
              break;
            default:
              throw Error(p2(161));
          }
        } catch (k2) {
          W2(a2, a2.return, k2);
        }
        a2.flags &= -3;
      }
      b & 4096 && (a2.flags &= -4097);
    }
    function ik(a2, b, c2) {
      V2 = a2;
      jk(a2);
    }
    function jk(a2, b, c2) {
      for (var d2 = 0 !== (a2.mode & 1); null !== V2; ) {
        var e2 = V2, f2 = e2.child;
        if (22 === e2.tag && d2) {
          var g2 = null !== e2.memoizedState || Kj;
          if (!g2) {
            var h2 = e2.alternate, k2 = null !== h2 && null !== h2.memoizedState || U;
            h2 = Kj;
            var l2 = U;
            Kj = g2;
            if ((U = k2) && !l2) for (V2 = e2; null !== V2; ) g2 = V2, k2 = g2.child, 22 === g2.tag && null !== g2.memoizedState ? kk(e2) : null !== k2 ? (k2.return = g2, V2 = k2) : kk(e2);
            for (; null !== f2; ) V2 = f2, jk(f2), f2 = f2.sibling;
            V2 = e2;
            Kj = h2;
            U = l2;
          }
          lk(a2);
        } else 0 !== (e2.subtreeFlags & 8772) && null !== f2 ? (f2.return = e2, V2 = f2) : lk(a2);
      }
    }
    function lk(a2) {
      for (; null !== V2; ) {
        var b = V2;
        if (0 !== (b.flags & 8772)) {
          var c2 = b.alternate;
          try {
            if (0 !== (b.flags & 8772)) switch (b.tag) {
              case 0:
              case 11:
              case 15:
                U || Rj(5, b);
                break;
              case 1:
                var d2 = b.stateNode;
                if (b.flags & 4 && !U) if (null === c2) d2.componentDidMount();
                else {
                  var e2 = b.elementType === b.type ? c2.memoizedProps : Lg(b.type, c2.memoizedProps);
                  d2.componentDidUpdate(e2, c2.memoizedState, d2.__reactInternalSnapshotBeforeUpdate);
                }
                var f2 = b.updateQueue;
                null !== f2 && ih(b, f2, d2);
                break;
              case 3:
                var g2 = b.updateQueue;
                if (null !== g2) {
                  c2 = null;
                  if (null !== b.child) switch (b.child.tag) {
                    case 5:
                      c2 = b.child.stateNode;
                      break;
                    case 1:
                      c2 = b.child.stateNode;
                  }
                  ih(b, g2, c2);
                }
                break;
              case 5:
                var h2 = b.stateNode;
                if (null === c2 && b.flags & 4) {
                  c2 = h2;
                  var k2 = b.memoizedProps;
                  switch (b.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      k2.autoFocus && c2.focus();
                      break;
                    case "img":
                      k2.src && (c2.src = k2.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (null === b.memoizedState) {
                  var l2 = b.alternate;
                  if (null !== l2) {
                    var m2 = l2.memoizedState;
                    if (null !== m2) {
                      var q = m2.dehydrated;
                      null !== q && bd(q);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(p2(163));
            }
            U || b.flags & 512 && Sj(b);
          } catch (r) {
            W2(b, b.return, r);
          }
        }
        if (b === a2) {
          V2 = null;
          break;
        }
        c2 = b.sibling;
        if (null !== c2) {
          c2.return = b.return;
          V2 = c2;
          break;
        }
        V2 = b.return;
      }
    }
    function hk(a2) {
      for (; null !== V2; ) {
        var b = V2;
        if (b === a2) {
          V2 = null;
          break;
        }
        var c2 = b.sibling;
        if (null !== c2) {
          c2.return = b.return;
          V2 = c2;
          break;
        }
        V2 = b.return;
      }
    }
    function kk(a2) {
      for (; null !== V2; ) {
        var b = V2;
        try {
          switch (b.tag) {
            case 0:
            case 11:
            case 15:
              var c2 = b.return;
              try {
                Rj(4, b);
              } catch (k2) {
                W2(b, c2, k2);
              }
              break;
            case 1:
              var d2 = b.stateNode;
              if ("function" === typeof d2.componentDidMount) {
                var e2 = b.return;
                try {
                  d2.componentDidMount();
                } catch (k2) {
                  W2(b, e2, k2);
                }
              }
              var f2 = b.return;
              try {
                Sj(b);
              } catch (k2) {
                W2(b, f2, k2);
              }
              break;
            case 5:
              var g2 = b.return;
              try {
                Sj(b);
              } catch (k2) {
                W2(b, g2, k2);
              }
          }
        } catch (k2) {
          W2(b, b.return, k2);
        }
        if (b === a2) {
          V2 = null;
          break;
        }
        var h2 = b.sibling;
        if (null !== h2) {
          h2.return = b.return;
          V2 = h2;
          break;
        }
        V2 = b.return;
      }
    }
    var mk = Math.ceil, nk = ua.ReactCurrentDispatcher, ok = ua.ReactCurrentOwner, pk = ua.ReactCurrentBatchConfig, K = 0, R = null, Y2 = null, Z2 = 0, gj = 0, fj = Uf(0), T = 0, qk = null, hh = 0, rk = 0, sk = 0, tk = null, uk = null, gk = 0, Hj = Infinity, vk = null, Pi = false, Qi = null, Si = null, wk = false, xk = null, yk = 0, zk = 0, Ak = null, Bk = -1, Ck = 0;
    function L2() {
      return 0 !== (K & 6) ? B() : -1 !== Bk ? Bk : Bk = B();
    }
    function lh(a2) {
      if (0 === (a2.mode & 1)) return 1;
      if (0 !== (K & 2) && 0 !== Z2) return Z2 & -Z2;
      if (null !== Kg.transition) return 0 === Ck && (Ck = yc()), Ck;
      a2 = C2;
      if (0 !== a2) return a2;
      a2 = window.event;
      a2 = void 0 === a2 ? 16 : jd(a2.type);
      return a2;
    }
    function mh(a2, b, c2, d2) {
      if (50 < zk) throw zk = 0, Ak = null, Error(p2(185));
      Ac(a2, c2, d2);
      if (0 === (K & 2) || a2 !== R) a2 === R && (0 === (K & 2) && (rk |= c2), 4 === T && Dk(a2, Z2)), Ek(a2, d2), 1 === c2 && 0 === K && 0 === (b.mode & 1) && (Hj = B() + 500, fg && jg());
    }
    function Ek(a2, b) {
      var c2 = a2.callbackNode;
      wc(a2, b);
      var d2 = uc(a2, a2 === R ? Z2 : 0);
      if (0 === d2) null !== c2 && bc(c2), a2.callbackNode = null, a2.callbackPriority = 0;
      else if (b = d2 & -d2, a2.callbackPriority !== b) {
        null != c2 && bc(c2);
        if (1 === b) 0 === a2.tag ? ig(Fk.bind(null, a2)) : hg(Fk.bind(null, a2)), Jf(function() {
          0 === (K & 6) && jg();
        }), c2 = null;
        else {
          switch (Dc(d2)) {
            case 1:
              c2 = fc;
              break;
            case 4:
              c2 = gc;
              break;
            case 16:
              c2 = hc;
              break;
            case 536870912:
              c2 = jc;
              break;
            default:
              c2 = hc;
          }
          c2 = Gk(c2, Hk.bind(null, a2));
        }
        a2.callbackPriority = b;
        a2.callbackNode = c2;
      }
    }
    function Hk(a2, b) {
      Bk = -1;
      Ck = 0;
      if (0 !== (K & 6)) throw Error(p2(327));
      var c2 = a2.callbackNode;
      if (Ik() && a2.callbackNode !== c2) return null;
      var d2 = uc(a2, a2 === R ? Z2 : 0);
      if (0 === d2) return null;
      if (0 !== (d2 & 30) || 0 !== (d2 & a2.expiredLanes) || b) b = Jk(a2, d2);
      else {
        b = d2;
        var e2 = K;
        K |= 2;
        var f2 = Kk();
        if (R !== a2 || Z2 !== b) vk = null, Hj = B() + 500, Lk(a2, b);
        do
          try {
            Mk();
            break;
          } catch (h2) {
            Nk(a2, h2);
          }
        while (1);
        Qg();
        nk.current = f2;
        K = e2;
        null !== Y2 ? b = 0 : (R = null, Z2 = 0, b = T);
      }
      if (0 !== b) {
        2 === b && (e2 = xc(a2), 0 !== e2 && (d2 = e2, b = Ok(a2, e2)));
        if (1 === b) throw c2 = qk, Lk(a2, 0), Dk(a2, d2), Ek(a2, B()), c2;
        if (6 === b) Dk(a2, d2);
        else {
          e2 = a2.current.alternate;
          if (0 === (d2 & 30) && !Pk(e2) && (b = Jk(a2, d2), 2 === b && (f2 = xc(a2), 0 !== f2 && (d2 = f2, b = Ok(a2, f2))), 1 === b)) throw c2 = qk, Lk(a2, 0), Dk(a2, d2), Ek(a2, B()), c2;
          a2.finishedWork = e2;
          a2.finishedLanes = d2;
          switch (b) {
            case 0:
            case 1:
              throw Error(p2(345));
            case 2:
              Qk(a2, uk, vk);
              break;
            case 3:
              Dk(a2, d2);
              if ((d2 & 130023424) === d2 && (b = gk + 500 - B(), 10 < b)) {
                if (0 !== uc(a2, 0)) break;
                e2 = a2.suspendedLanes;
                if ((e2 & d2) !== d2) {
                  L2();
                  a2.pingedLanes |= a2.suspendedLanes & e2;
                  break;
                }
                a2.timeoutHandle = Ff(Qk.bind(null, a2, uk, vk), b);
                break;
              }
              Qk(a2, uk, vk);
              break;
            case 4:
              Dk(a2, d2);
              if ((d2 & 4194240) === d2) break;
              b = a2.eventTimes;
              for (e2 = -1; 0 < d2; ) {
                var g2 = 31 - oc(d2);
                f2 = 1 << g2;
                g2 = b[g2];
                g2 > e2 && (e2 = g2);
                d2 &= ~f2;
              }
              d2 = e2;
              d2 = B() - d2;
              d2 = (120 > d2 ? 120 : 480 > d2 ? 480 : 1080 > d2 ? 1080 : 1920 > d2 ? 1920 : 3e3 > d2 ? 3e3 : 4320 > d2 ? 4320 : 1960 * mk(d2 / 1960)) - d2;
              if (10 < d2) {
                a2.timeoutHandle = Ff(Qk.bind(null, a2, uk, vk), d2);
                break;
              }
              Qk(a2, uk, vk);
              break;
            case 5:
              Qk(a2, uk, vk);
              break;
            default:
              throw Error(p2(329));
          }
        }
      }
      Ek(a2, B());
      return a2.callbackNode === c2 ? Hk.bind(null, a2) : null;
    }
    function Ok(a2, b) {
      var c2 = tk;
      a2.current.memoizedState.isDehydrated && (Lk(a2, b).flags |= 256);
      a2 = Jk(a2, b);
      2 !== a2 && (b = uk, uk = c2, null !== b && Gj(b));
      return a2;
    }
    function Gj(a2) {
      null === uk ? uk = a2 : uk.push.apply(uk, a2);
    }
    function Pk(a2) {
      for (var b = a2; ; ) {
        if (b.flags & 16384) {
          var c2 = b.updateQueue;
          if (null !== c2 && (c2 = c2.stores, null !== c2)) for (var d2 = 0; d2 < c2.length; d2++) {
            var e2 = c2[d2], f2 = e2.getSnapshot;
            e2 = e2.value;
            try {
              if (!He(f2(), e2)) return false;
            } catch (g2) {
              return false;
            }
          }
        }
        c2 = b.child;
        if (b.subtreeFlags & 16384 && null !== c2) c2.return = b, b = c2;
        else {
          if (b === a2) break;
          for (; null === b.sibling; ) {
            if (null === b.return || b.return === a2) return true;
            b = b.return;
          }
          b.sibling.return = b.return;
          b = b.sibling;
        }
      }
      return true;
    }
    function Dk(a2, b) {
      b &= ~sk;
      b &= ~rk;
      a2.suspendedLanes |= b;
      a2.pingedLanes &= ~b;
      for (a2 = a2.expirationTimes; 0 < b; ) {
        var c2 = 31 - oc(b), d2 = 1 << c2;
        a2[c2] = -1;
        b &= ~d2;
      }
    }
    function Fk(a2) {
      if (0 !== (K & 6)) throw Error(p2(327));
      Ik();
      var b = uc(a2, 0);
      if (0 === (b & 1)) return Ek(a2, B()), null;
      var c2 = Jk(a2, b);
      if (0 !== a2.tag && 2 === c2) {
        var d2 = xc(a2);
        0 !== d2 && (b = d2, c2 = Ok(a2, d2));
      }
      if (1 === c2) throw c2 = qk, Lk(a2, 0), Dk(a2, b), Ek(a2, B()), c2;
      if (6 === c2) throw Error(p2(345));
      a2.finishedWork = a2.current.alternate;
      a2.finishedLanes = b;
      Qk(a2, uk, vk);
      Ek(a2, B());
      return null;
    }
    function Rk(a2, b) {
      var c2 = K;
      K |= 1;
      try {
        return a2(b);
      } finally {
        K = c2, 0 === K && (Hj = B() + 500, fg && jg());
      }
    }
    function Sk(a2) {
      null !== xk && 0 === xk.tag && 0 === (K & 6) && Ik();
      var b = K;
      K |= 1;
      var c2 = pk.transition, d2 = C2;
      try {
        if (pk.transition = null, C2 = 1, a2) return a2();
      } finally {
        C2 = d2, pk.transition = c2, K = b, 0 === (K & 6) && jg();
      }
    }
    function Ij() {
      gj = fj.current;
      E2(fj);
    }
    function Lk(a2, b) {
      a2.finishedWork = null;
      a2.finishedLanes = 0;
      var c2 = a2.timeoutHandle;
      -1 !== c2 && (a2.timeoutHandle = -1, Gf(c2));
      if (null !== Y2) for (c2 = Y2.return; null !== c2; ) {
        var d2 = c2;
        wg(d2);
        switch (d2.tag) {
          case 1:
            d2 = d2.type.childContextTypes;
            null !== d2 && void 0 !== d2 && $f();
            break;
          case 3:
            Jh();
            E2(Wf);
            E2(H2);
            Oh();
            break;
          case 5:
            Lh(d2);
            break;
          case 4:
            Jh();
            break;
          case 13:
            E2(M);
            break;
          case 19:
            E2(M);
            break;
          case 10:
            Rg(d2.type._context);
            break;
          case 22:
          case 23:
            Ij();
        }
        c2 = c2.return;
      }
      R = a2;
      Y2 = a2 = wh(a2.current, null);
      Z2 = gj = b;
      T = 0;
      qk = null;
      sk = rk = hh = 0;
      uk = tk = null;
      if (null !== Wg) {
        for (b = 0; b < Wg.length; b++) if (c2 = Wg[b], d2 = c2.interleaved, null !== d2) {
          c2.interleaved = null;
          var e2 = d2.next, f2 = c2.pending;
          if (null !== f2) {
            var g2 = f2.next;
            f2.next = e2;
            d2.next = g2;
          }
          c2.pending = d2;
        }
        Wg = null;
      }
      return a2;
    }
    function Nk(a2, b) {
      do {
        var c2 = Y2;
        try {
          Qg();
          Ph.current = ai;
          if (Sh) {
            for (var d2 = N2.memoizedState; null !== d2; ) {
              var e2 = d2.queue;
              null !== e2 && (e2.pending = null);
              d2 = d2.next;
            }
            Sh = false;
          }
          Rh = 0;
          P2 = O = N2 = null;
          Th = false;
          Uh = 0;
          ok.current = null;
          if (null === c2 || null === c2.return) {
            T = 1;
            qk = b;
            Y2 = null;
            break;
          }
          a: {
            var f2 = a2, g2 = c2.return, h2 = c2, k2 = b;
            b = Z2;
            h2.flags |= 32768;
            if (null !== k2 && "object" === typeof k2 && "function" === typeof k2.then) {
              var l2 = k2, m2 = h2, q = m2.tag;
              if (0 === (m2.mode & 1) && (0 === q || 11 === q || 15 === q)) {
                var r = m2.alternate;
                r ? (m2.updateQueue = r.updateQueue, m2.memoizedState = r.memoizedState, m2.lanes = r.lanes) : (m2.updateQueue = null, m2.memoizedState = null);
              }
              var y = Vi(g2);
              if (null !== y) {
                y.flags &= -257;
                Wi(y, g2, h2, f2, b);
                y.mode & 1 && Ti(f2, l2, b);
                b = y;
                k2 = l2;
                var n2 = b.updateQueue;
                if (null === n2) {
                  var t2 = /* @__PURE__ */ new Set();
                  t2.add(k2);
                  b.updateQueue = t2;
                } else n2.add(k2);
                break a;
              } else {
                if (0 === (b & 1)) {
                  Ti(f2, l2, b);
                  uj();
                  break a;
                }
                k2 = Error(p2(426));
              }
            } else if (I && h2.mode & 1) {
              var J = Vi(g2);
              if (null !== J) {
                0 === (J.flags & 65536) && (J.flags |= 256);
                Wi(J, g2, h2, f2, b);
                Jg(Ki(k2, h2));
                break a;
              }
            }
            f2 = k2 = Ki(k2, h2);
            4 !== T && (T = 2);
            null === tk ? tk = [f2] : tk.push(f2);
            f2 = g2;
            do {
              switch (f2.tag) {
                case 3:
                  f2.flags |= 65536;
                  b &= -b;
                  f2.lanes |= b;
                  var x = Oi(f2, k2, b);
                  fh(f2, x);
                  break a;
                case 1:
                  h2 = k2;
                  var w2 = f2.type, u2 = f2.stateNode;
                  if (0 === (f2.flags & 128) && ("function" === typeof w2.getDerivedStateFromError || null !== u2 && "function" === typeof u2.componentDidCatch && (null === Si || !Si.has(u2)))) {
                    f2.flags |= 65536;
                    b &= -b;
                    f2.lanes |= b;
                    var F2 = Ri(f2, h2, b);
                    fh(f2, F2);
                    break a;
                  }
              }
              f2 = f2.return;
            } while (null !== f2);
          }
          Tk(c2);
        } catch (na) {
          b = na;
          Y2 === c2 && null !== c2 && (Y2 = c2 = c2.return);
          continue;
        }
        break;
      } while (1);
    }
    function Kk() {
      var a2 = nk.current;
      nk.current = ai;
      return null === a2 ? ai : a2;
    }
    function uj() {
      if (0 === T || 3 === T || 2 === T) T = 4;
      null === R || 0 === (hh & 268435455) && 0 === (rk & 268435455) || Dk(R, Z2);
    }
    function Jk(a2, b) {
      var c2 = K;
      K |= 2;
      var d2 = Kk();
      if (R !== a2 || Z2 !== b) vk = null, Lk(a2, b);
      do
        try {
          Uk();
          break;
        } catch (e2) {
          Nk(a2, e2);
        }
      while (1);
      Qg();
      K = c2;
      nk.current = d2;
      if (null !== Y2) throw Error(p2(261));
      R = null;
      Z2 = 0;
      return T;
    }
    function Uk() {
      for (; null !== Y2; ) Vk(Y2);
    }
    function Mk() {
      for (; null !== Y2 && !cc(); ) Vk(Y2);
    }
    function Vk(a2) {
      var b = Wk(a2.alternate, a2, gj);
      a2.memoizedProps = a2.pendingProps;
      null === b ? Tk(a2) : Y2 = b;
      ok.current = null;
    }
    function Tk(a2) {
      var b = a2;
      do {
        var c2 = b.alternate;
        a2 = b.return;
        if (0 === (b.flags & 32768)) {
          if (c2 = Fj(c2, b, gj), null !== c2) {
            Y2 = c2;
            return;
          }
        } else {
          c2 = Jj(c2, b);
          if (null !== c2) {
            c2.flags &= 32767;
            Y2 = c2;
            return;
          }
          if (null !== a2) a2.flags |= 32768, a2.subtreeFlags = 0, a2.deletions = null;
          else {
            T = 6;
            Y2 = null;
            return;
          }
        }
        b = b.sibling;
        if (null !== b) {
          Y2 = b;
          return;
        }
        Y2 = b = a2;
      } while (null !== b);
      0 === T && (T = 5);
    }
    function Qk(a2, b, c2) {
      var d2 = C2, e2 = pk.transition;
      try {
        pk.transition = null, C2 = 1, Xk(a2, b, c2, d2);
      } finally {
        pk.transition = e2, C2 = d2;
      }
      return null;
    }
    function Xk(a2, b, c2, d2) {
      do
        Ik();
      while (null !== xk);
      if (0 !== (K & 6)) throw Error(p2(327));
      c2 = a2.finishedWork;
      var e2 = a2.finishedLanes;
      if (null === c2) return null;
      a2.finishedWork = null;
      a2.finishedLanes = 0;
      if (c2 === a2.current) throw Error(p2(177));
      a2.callbackNode = null;
      a2.callbackPriority = 0;
      var f2 = c2.lanes | c2.childLanes;
      Bc(a2, f2);
      a2 === R && (Y2 = R = null, Z2 = 0);
      0 === (c2.subtreeFlags & 2064) && 0 === (c2.flags & 2064) || wk || (wk = true, Gk(hc, function() {
        Ik();
        return null;
      }));
      f2 = 0 !== (c2.flags & 15990);
      if (0 !== (c2.subtreeFlags & 15990) || f2) {
        f2 = pk.transition;
        pk.transition = null;
        var g2 = C2;
        C2 = 1;
        var h2 = K;
        K |= 4;
        ok.current = null;
        Pj(a2, c2);
        ek(c2, a2);
        Oe2(Df);
        dd = !!Cf;
        Df = Cf = null;
        a2.current = c2;
        ik(c2);
        dc();
        K = h2;
        C2 = g2;
        pk.transition = f2;
      } else a2.current = c2;
      wk && (wk = false, xk = a2, yk = e2);
      f2 = a2.pendingLanes;
      0 === f2 && (Si = null);
      mc(c2.stateNode);
      Ek(a2, B());
      if (null !== b) for (d2 = a2.onRecoverableError, c2 = 0; c2 < b.length; c2++) e2 = b[c2], d2(e2.value, { componentStack: e2.stack, digest: e2.digest });
      if (Pi) throw Pi = false, a2 = Qi, Qi = null, a2;
      0 !== (yk & 1) && 0 !== a2.tag && Ik();
      f2 = a2.pendingLanes;
      0 !== (f2 & 1) ? a2 === Ak ? zk++ : (zk = 0, Ak = a2) : zk = 0;
      jg();
      return null;
    }
    function Ik() {
      if (null !== xk) {
        var a2 = Dc(yk), b = pk.transition, c2 = C2;
        try {
          pk.transition = null;
          C2 = 16 > a2 ? 16 : a2;
          if (null === xk) var d2 = false;
          else {
            a2 = xk;
            xk = null;
            yk = 0;
            if (0 !== (K & 6)) throw Error(p2(331));
            var e2 = K;
            K |= 4;
            for (V2 = a2.current; null !== V2; ) {
              var f2 = V2, g2 = f2.child;
              if (0 !== (V2.flags & 16)) {
                var h2 = f2.deletions;
                if (null !== h2) {
                  for (var k2 = 0; k2 < h2.length; k2++) {
                    var l2 = h2[k2];
                    for (V2 = l2; null !== V2; ) {
                      var m2 = V2;
                      switch (m2.tag) {
                        case 0:
                        case 11:
                        case 15:
                          Qj(8, m2, f2);
                      }
                      var q = m2.child;
                      if (null !== q) q.return = m2, V2 = q;
                      else for (; null !== V2; ) {
                        m2 = V2;
                        var r = m2.sibling, y = m2.return;
                        Tj(m2);
                        if (m2 === l2) {
                          V2 = null;
                          break;
                        }
                        if (null !== r) {
                          r.return = y;
                          V2 = r;
                          break;
                        }
                        V2 = y;
                      }
                    }
                  }
                  var n2 = f2.alternate;
                  if (null !== n2) {
                    var t2 = n2.child;
                    if (null !== t2) {
                      n2.child = null;
                      do {
                        var J = t2.sibling;
                        t2.sibling = null;
                        t2 = J;
                      } while (null !== t2);
                    }
                  }
                  V2 = f2;
                }
              }
              if (0 !== (f2.subtreeFlags & 2064) && null !== g2) g2.return = f2, V2 = g2;
              else b: for (; null !== V2; ) {
                f2 = V2;
                if (0 !== (f2.flags & 2048)) switch (f2.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Qj(9, f2, f2.return);
                }
                var x = f2.sibling;
                if (null !== x) {
                  x.return = f2.return;
                  V2 = x;
                  break b;
                }
                V2 = f2.return;
              }
            }
            var w2 = a2.current;
            for (V2 = w2; null !== V2; ) {
              g2 = V2;
              var u2 = g2.child;
              if (0 !== (g2.subtreeFlags & 2064) && null !== u2) u2.return = g2, V2 = u2;
              else b: for (g2 = w2; null !== V2; ) {
                h2 = V2;
                if (0 !== (h2.flags & 2048)) try {
                  switch (h2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Rj(9, h2);
                  }
                } catch (na) {
                  W2(h2, h2.return, na);
                }
                if (h2 === g2) {
                  V2 = null;
                  break b;
                }
                var F2 = h2.sibling;
                if (null !== F2) {
                  F2.return = h2.return;
                  V2 = F2;
                  break b;
                }
                V2 = h2.return;
              }
            }
            K = e2;
            jg();
            if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
              lc.onPostCommitFiberRoot(kc, a2);
            } catch (na) {
            }
            d2 = true;
          }
          return d2;
        } finally {
          C2 = c2, pk.transition = b;
        }
      }
      return false;
    }
    function Yk(a2, b, c2) {
      b = Ki(c2, b);
      b = Oi(a2, b, 1);
      a2 = dh(a2, b, 1);
      b = L2();
      null !== a2 && (Ac(a2, 1, b), Ek(a2, b));
    }
    function W2(a2, b, c2) {
      if (3 === a2.tag) Yk(a2, a2, c2);
      else for (; null !== b; ) {
        if (3 === b.tag) {
          Yk(b, a2, c2);
          break;
        } else if (1 === b.tag) {
          var d2 = b.stateNode;
          if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d2.componentDidCatch && (null === Si || !Si.has(d2))) {
            a2 = Ki(c2, a2);
            a2 = Ri(b, a2, 1);
            b = dh(b, a2, 1);
            a2 = L2();
            null !== b && (Ac(b, 1, a2), Ek(b, a2));
            break;
          }
        }
        b = b.return;
      }
    }
    function Ui(a2, b, c2) {
      var d2 = a2.pingCache;
      null !== d2 && d2.delete(b);
      b = L2();
      a2.pingedLanes |= a2.suspendedLanes & c2;
      R === a2 && (Z2 & c2) === c2 && (4 === T || 3 === T && (Z2 & 130023424) === Z2 && 500 > B() - gk ? Lk(a2, 0) : sk |= c2);
      Ek(a2, b);
    }
    function Zk(a2, b) {
      0 === b && (0 === (a2.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
      var c2 = L2();
      a2 = Zg(a2, b);
      null !== a2 && (Ac(a2, b, c2), Ek(a2, c2));
    }
    function vj(a2) {
      var b = a2.memoizedState, c2 = 0;
      null !== b && (c2 = b.retryLane);
      Zk(a2, c2);
    }
    function ck(a2, b) {
      var c2 = 0;
      switch (a2.tag) {
        case 13:
          var d2 = a2.stateNode;
          var e2 = a2.memoizedState;
          null !== e2 && (c2 = e2.retryLane);
          break;
        case 19:
          d2 = a2.stateNode;
          break;
        default:
          throw Error(p2(314));
      }
      null !== d2 && d2.delete(b);
      Zk(a2, c2);
    }
    var Wk;
    Wk = function(a2, b, c2) {
      if (null !== a2) if (a2.memoizedProps !== b.pendingProps || Wf.current) Ug = true;
      else {
        if (0 === (a2.lanes & c2) && 0 === (b.flags & 128)) return Ug = false, zj(a2, b, c2);
        Ug = 0 !== (a2.flags & 131072) ? true : false;
      }
      else Ug = false, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
      b.lanes = 0;
      switch (b.tag) {
        case 2:
          var d2 = b.type;
          jj(a2, b);
          a2 = b.pendingProps;
          var e2 = Yf(b, H2.current);
          Tg(b, c2);
          e2 = Xh(null, b, d2, a2, e2, c2);
          var f2 = bi();
          b.flags |= 1;
          "object" === typeof e2 && null !== e2 && "function" === typeof e2.render && void 0 === e2.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d2) ? (f2 = true, cg(b)) : f2 = false, b.memoizedState = null !== e2.state && void 0 !== e2.state ? e2.state : null, ah(b), e2.updater = nh, b.stateNode = e2, e2._reactInternals = b, rh(b, d2, a2, c2), b = kj(null, b, d2, true, f2, c2)) : (b.tag = 0, I && f2 && vg(b), Yi(null, b, e2, c2), b = b.child);
          return b;
        case 16:
          d2 = b.elementType;
          a: {
            jj(a2, b);
            a2 = b.pendingProps;
            e2 = d2._init;
            d2 = e2(d2._payload);
            b.type = d2;
            e2 = b.tag = $k(d2);
            a2 = Lg(d2, a2);
            switch (e2) {
              case 0:
                b = dj(null, b, d2, a2, c2);
                break a;
              case 1:
                b = ij(null, b, d2, a2, c2);
                break a;
              case 11:
                b = Zi(null, b, d2, a2, c2);
                break a;
              case 14:
                b = aj(null, b, d2, Lg(d2.type, a2), c2);
                break a;
            }
            throw Error(p2(
              306,
              d2,
              ""
            ));
          }
          return b;
        case 0:
          return d2 = b.type, e2 = b.pendingProps, e2 = b.elementType === d2 ? e2 : Lg(d2, e2), dj(a2, b, d2, e2, c2);
        case 1:
          return d2 = b.type, e2 = b.pendingProps, e2 = b.elementType === d2 ? e2 : Lg(d2, e2), ij(a2, b, d2, e2, c2);
        case 3:
          a: {
            lj(b);
            if (null === a2) throw Error(p2(387));
            d2 = b.pendingProps;
            f2 = b.memoizedState;
            e2 = f2.element;
            bh(a2, b);
            gh(b, d2, null, c2);
            var g2 = b.memoizedState;
            d2 = g2.element;
            if (f2.isDehydrated) if (f2 = { element: d2, isDehydrated: false, cache: g2.cache, pendingSuspenseBoundaries: g2.pendingSuspenseBoundaries, transitions: g2.transitions }, b.updateQueue.baseState = f2, b.memoizedState = f2, b.flags & 256) {
              e2 = Ki(Error(p2(423)), b);
              b = mj(a2, b, d2, c2, e2);
              break a;
            } else if (d2 !== e2) {
              e2 = Ki(Error(p2(424)), b);
              b = mj(a2, b, d2, c2, e2);
              break a;
            } else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = true, zg = null, c2 = Ch(b, null, d2, c2), b.child = c2; c2; ) c2.flags = c2.flags & -3 | 4096, c2 = c2.sibling;
            else {
              Ig();
              if (d2 === e2) {
                b = $i(a2, b, c2);
                break a;
              }
              Yi(a2, b, d2, c2);
            }
            b = b.child;
          }
          return b;
        case 5:
          return Kh(b), null === a2 && Eg(b), d2 = b.type, e2 = b.pendingProps, f2 = null !== a2 ? a2.memoizedProps : null, g2 = e2.children, Ef(d2, e2) ? g2 = null : null !== f2 && Ef(d2, f2) && (b.flags |= 32), hj(a2, b), Yi(a2, b, g2, c2), b.child;
        case 6:
          return null === a2 && Eg(b), null;
        case 13:
          return pj(a2, b, c2);
        case 4:
          return Ih(b, b.stateNode.containerInfo), d2 = b.pendingProps, null === a2 ? b.child = Bh(b, null, d2, c2) : Yi(a2, b, d2, c2), b.child;
        case 11:
          return d2 = b.type, e2 = b.pendingProps, e2 = b.elementType === d2 ? e2 : Lg(d2, e2), Zi(a2, b, d2, e2, c2);
        case 7:
          return Yi(a2, b, b.pendingProps, c2), b.child;
        case 8:
          return Yi(a2, b, b.pendingProps.children, c2), b.child;
        case 12:
          return Yi(a2, b, b.pendingProps.children, c2), b.child;
        case 10:
          a: {
            d2 = b.type._context;
            e2 = b.pendingProps;
            f2 = b.memoizedProps;
            g2 = e2.value;
            G(Mg, d2._currentValue);
            d2._currentValue = g2;
            if (null !== f2) if (He(f2.value, g2)) {
              if (f2.children === e2.children && !Wf.current) {
                b = $i(a2, b, c2);
                break a;
              }
            } else for (f2 = b.child, null !== f2 && (f2.return = b); null !== f2; ) {
              var h2 = f2.dependencies;
              if (null !== h2) {
                g2 = f2.child;
                for (var k2 = h2.firstContext; null !== k2; ) {
                  if (k2.context === d2) {
                    if (1 === f2.tag) {
                      k2 = ch(-1, c2 & -c2);
                      k2.tag = 2;
                      var l2 = f2.updateQueue;
                      if (null !== l2) {
                        l2 = l2.shared;
                        var m2 = l2.pending;
                        null === m2 ? k2.next = k2 : (k2.next = m2.next, m2.next = k2);
                        l2.pending = k2;
                      }
                    }
                    f2.lanes |= c2;
                    k2 = f2.alternate;
                    null !== k2 && (k2.lanes |= c2);
                    Sg(
                      f2.return,
                      c2,
                      b
                    );
                    h2.lanes |= c2;
                    break;
                  }
                  k2 = k2.next;
                }
              } else if (10 === f2.tag) g2 = f2.type === b.type ? null : f2.child;
              else if (18 === f2.tag) {
                g2 = f2.return;
                if (null === g2) throw Error(p2(341));
                g2.lanes |= c2;
                h2 = g2.alternate;
                null !== h2 && (h2.lanes |= c2);
                Sg(g2, c2, b);
                g2 = f2.sibling;
              } else g2 = f2.child;
              if (null !== g2) g2.return = f2;
              else for (g2 = f2; null !== g2; ) {
                if (g2 === b) {
                  g2 = null;
                  break;
                }
                f2 = g2.sibling;
                if (null !== f2) {
                  f2.return = g2.return;
                  g2 = f2;
                  break;
                }
                g2 = g2.return;
              }
              f2 = g2;
            }
            Yi(a2, b, e2.children, c2);
            b = b.child;
          }
          return b;
        case 9:
          return e2 = b.type, d2 = b.pendingProps.children, Tg(b, c2), e2 = Vg(e2), d2 = d2(e2), b.flags |= 1, Yi(a2, b, d2, c2), b.child;
        case 14:
          return d2 = b.type, e2 = Lg(d2, b.pendingProps), e2 = Lg(d2.type, e2), aj(a2, b, d2, e2, c2);
        case 15:
          return cj(a2, b, b.type, b.pendingProps, c2);
        case 17:
          return d2 = b.type, e2 = b.pendingProps, e2 = b.elementType === d2 ? e2 : Lg(d2, e2), jj(a2, b), b.tag = 1, Zf(d2) ? (a2 = true, cg(b)) : a2 = false, Tg(b, c2), ph(b, d2, e2), rh(b, d2, e2, c2), kj(null, b, d2, true, a2, c2);
        case 19:
          return yj(a2, b, c2);
        case 22:
          return ej(a2, b, c2);
      }
      throw Error(p2(156, b.tag));
    };
    function Gk(a2, b) {
      return ac(a2, b);
    }
    function al(a2, b, c2, d2) {
      this.tag = a2;
      this.key = c2;
      this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
      this.index = 0;
      this.ref = null;
      this.pendingProps = b;
      this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
      this.mode = d2;
      this.subtreeFlags = this.flags = 0;
      this.deletions = null;
      this.childLanes = this.lanes = 0;
      this.alternate = null;
    }
    function Bg(a2, b, c2, d2) {
      return new al(a2, b, c2, d2);
    }
    function bj(a2) {
      a2 = a2.prototype;
      return !(!a2 || !a2.isReactComponent);
    }
    function $k(a2) {
      if ("function" === typeof a2) return bj(a2) ? 1 : 0;
      if (void 0 !== a2 && null !== a2) {
        a2 = a2.$$typeof;
        if (a2 === Da) return 11;
        if (a2 === Ga) return 14;
      }
      return 2;
    }
    function wh(a2, b) {
      var c2 = a2.alternate;
      null === c2 ? (c2 = Bg(a2.tag, b, a2.key, a2.mode), c2.elementType = a2.elementType, c2.type = a2.type, c2.stateNode = a2.stateNode, c2.alternate = a2, a2.alternate = c2) : (c2.pendingProps = b, c2.type = a2.type, c2.flags = 0, c2.subtreeFlags = 0, c2.deletions = null);
      c2.flags = a2.flags & 14680064;
      c2.childLanes = a2.childLanes;
      c2.lanes = a2.lanes;
      c2.child = a2.child;
      c2.memoizedProps = a2.memoizedProps;
      c2.memoizedState = a2.memoizedState;
      c2.updateQueue = a2.updateQueue;
      b = a2.dependencies;
      c2.dependencies = null === b ? null : { lanes: b.lanes, firstContext: b.firstContext };
      c2.sibling = a2.sibling;
      c2.index = a2.index;
      c2.ref = a2.ref;
      return c2;
    }
    function yh(a2, b, c2, d2, e2, f2) {
      var g2 = 2;
      d2 = a2;
      if ("function" === typeof a2) bj(a2) && (g2 = 1);
      else if ("string" === typeof a2) g2 = 5;
      else a: switch (a2) {
        case ya:
          return Ah(c2.children, e2, f2, b);
        case za:
          g2 = 8;
          e2 |= 8;
          break;
        case Aa:
          return a2 = Bg(12, c2, b, e2 | 2), a2.elementType = Aa, a2.lanes = f2, a2;
        case Ea:
          return a2 = Bg(13, c2, b, e2), a2.elementType = Ea, a2.lanes = f2, a2;
        case Fa:
          return a2 = Bg(19, c2, b, e2), a2.elementType = Fa, a2.lanes = f2, a2;
        case Ia:
          return qj(c2, e2, f2, b);
        default:
          if ("object" === typeof a2 && null !== a2) switch (a2.$$typeof) {
            case Ba:
              g2 = 10;
              break a;
            case Ca:
              g2 = 9;
              break a;
            case Da:
              g2 = 11;
              break a;
            case Ga:
              g2 = 14;
              break a;
            case Ha:
              g2 = 16;
              d2 = null;
              break a;
          }
          throw Error(p2(130, null == a2 ? a2 : typeof a2, ""));
      }
      b = Bg(g2, c2, b, e2);
      b.elementType = a2;
      b.type = d2;
      b.lanes = f2;
      return b;
    }
    function Ah(a2, b, c2, d2) {
      a2 = Bg(7, a2, d2, b);
      a2.lanes = c2;
      return a2;
    }
    function qj(a2, b, c2, d2) {
      a2 = Bg(22, a2, d2, b);
      a2.elementType = Ia;
      a2.lanes = c2;
      a2.stateNode = { isHidden: false };
      return a2;
    }
    function xh(a2, b, c2) {
      a2 = Bg(6, a2, null, b);
      a2.lanes = c2;
      return a2;
    }
    function zh(a2, b, c2) {
      b = Bg(4, null !== a2.children ? a2.children : [], a2.key, b);
      b.lanes = c2;
      b.stateNode = { containerInfo: a2.containerInfo, pendingChildren: null, implementation: a2.implementation };
      return b;
    }
    function bl(a2, b, c2, d2, e2) {
      this.tag = b;
      this.containerInfo = a2;
      this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
      this.timeoutHandle = -1;
      this.callbackNode = this.pendingContext = this.context = null;
      this.callbackPriority = 0;
      this.eventTimes = zc(0);
      this.expirationTimes = zc(-1);
      this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
      this.entanglements = zc(0);
      this.identifierPrefix = d2;
      this.onRecoverableError = e2;
      this.mutableSourceEagerHydrationData = null;
    }
    function cl(a2, b, c2, d2, e2, f2, g2, h2, k2) {
      a2 = new bl(a2, b, c2, h2, k2);
      1 === b ? (b = 1, true === f2 && (b |= 8)) : b = 0;
      f2 = Bg(3, null, null, b);
      a2.current = f2;
      f2.stateNode = a2;
      f2.memoizedState = { element: d2, isDehydrated: c2, cache: null, transitions: null, pendingSuspenseBoundaries: null };
      ah(f2);
      return a2;
    }
    function dl(a2, b, c2) {
      var d2 = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
      return { $$typeof: wa, key: null == d2 ? null : "" + d2, children: a2, containerInfo: b, implementation: c2 };
    }
    function el(a2) {
      if (!a2) return Vf;
      a2 = a2._reactInternals;
      a: {
        if (Vb(a2) !== a2 || 1 !== a2.tag) throw Error(p2(170));
        var b = a2;
        do {
          switch (b.tag) {
            case 3:
              b = b.stateNode.context;
              break a;
            case 1:
              if (Zf(b.type)) {
                b = b.stateNode.__reactInternalMemoizedMergedChildContext;
                break a;
              }
          }
          b = b.return;
        } while (null !== b);
        throw Error(p2(171));
      }
      if (1 === a2.tag) {
        var c2 = a2.type;
        if (Zf(c2)) return bg(a2, c2, b);
      }
      return b;
    }
    function fl(a2, b, c2, d2, e2, f2, g2, h2, k2) {
      a2 = cl(c2, d2, true, a2, e2, f2, g2, h2, k2);
      a2.context = el(null);
      c2 = a2.current;
      d2 = L2();
      e2 = lh(c2);
      f2 = ch(d2, e2);
      f2.callback = void 0 !== b && null !== b ? b : null;
      dh(c2, f2, e2);
      a2.current.lanes = e2;
      Ac(a2, e2, d2);
      Ek(a2, d2);
      return a2;
    }
    function gl(a2, b, c2, d2) {
      var e2 = b.current, f2 = L2(), g2 = lh(e2);
      c2 = el(c2);
      null === b.context ? b.context = c2 : b.pendingContext = c2;
      b = ch(f2, g2);
      b.payload = { element: a2 };
      d2 = void 0 === d2 ? null : d2;
      null !== d2 && (b.callback = d2);
      a2 = dh(e2, b, g2);
      null !== a2 && (mh(a2, e2, g2, f2), eh(a2, e2, g2));
      return g2;
    }
    function hl(a2) {
      a2 = a2.current;
      if (!a2.child) return null;
      switch (a2.child.tag) {
        case 5:
          return a2.child.stateNode;
        default:
          return a2.child.stateNode;
      }
    }
    function il(a2, b) {
      a2 = a2.memoizedState;
      if (null !== a2 && null !== a2.dehydrated) {
        var c2 = a2.retryLane;
        a2.retryLane = 0 !== c2 && c2 < b ? c2 : b;
      }
    }
    function jl(a2, b) {
      il(a2, b);
      (a2 = a2.alternate) && il(a2, b);
    }
    function kl() {
      return null;
    }
    var ll = "function" === typeof reportError ? reportError : function(a2) {
      console.error(a2);
    };
    function ml(a2) {
      this._internalRoot = a2;
    }
    nl.prototype.render = ml.prototype.render = function(a2) {
      var b = this._internalRoot;
      if (null === b) throw Error(p2(409));
      gl(a2, b, null, null);
    };
    nl.prototype.unmount = ml.prototype.unmount = function() {
      var a2 = this._internalRoot;
      if (null !== a2) {
        this._internalRoot = null;
        var b = a2.containerInfo;
        Sk(function() {
          gl(null, a2, null, null);
        });
        b[uf] = null;
      }
    };
    function nl(a2) {
      this._internalRoot = a2;
    }
    nl.prototype.unstable_scheduleHydration = function(a2) {
      if (a2) {
        var b = Hc();
        a2 = { blockedOn: null, target: a2, priority: b };
        for (var c2 = 0; c2 < Qc.length && 0 !== b && b < Qc[c2].priority; c2++) ;
        Qc.splice(c2, 0, a2);
        0 === c2 && Vc(a2);
      }
    };
    function ol(a2) {
      return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType);
    }
    function pl(a2) {
      return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType && (8 !== a2.nodeType || " react-mount-point-unstable " !== a2.nodeValue));
    }
    function ql() {
    }
    function rl(a2, b, c2, d2, e2) {
      if (e2) {
        if ("function" === typeof d2) {
          var f2 = d2;
          d2 = function() {
            var a3 = hl(g2);
            f2.call(a3);
          };
        }
        var g2 = fl(b, d2, a2, 0, null, false, false, "", ql);
        a2._reactRootContainer = g2;
        a2[uf] = g2.current;
        sf(8 === a2.nodeType ? a2.parentNode : a2);
        Sk();
        return g2;
      }
      for (; e2 = a2.lastChild; ) a2.removeChild(e2);
      if ("function" === typeof d2) {
        var h2 = d2;
        d2 = function() {
          var a3 = hl(k2);
          h2.call(a3);
        };
      }
      var k2 = cl(a2, 0, false, null, null, false, false, "", ql);
      a2._reactRootContainer = k2;
      a2[uf] = k2.current;
      sf(8 === a2.nodeType ? a2.parentNode : a2);
      Sk(function() {
        gl(b, k2, c2, d2);
      });
      return k2;
    }
    function sl(a2, b, c2, d2, e2) {
      var f2 = c2._reactRootContainer;
      if (f2) {
        var g2 = f2;
        if ("function" === typeof e2) {
          var h2 = e2;
          e2 = function() {
            var a3 = hl(g2);
            h2.call(a3);
          };
        }
        gl(b, g2, a2, e2);
      } else g2 = rl(c2, b, a2, e2, d2);
      return hl(g2);
    }
    Ec = function(a2) {
      switch (a2.tag) {
        case 3:
          var b = a2.stateNode;
          if (b.current.memoizedState.isDehydrated) {
            var c2 = tc(b.pendingLanes);
            0 !== c2 && (Cc(b, c2 | 1), Ek(b, B()), 0 === (K & 6) && (Hj = B() + 500, jg()));
          }
          break;
        case 13:
          Sk(function() {
            var b2 = Zg(a2, 1);
            if (null !== b2) {
              var c3 = L2();
              mh(b2, a2, 1, c3);
            }
          }), jl(a2, 1);
      }
    };
    Fc = function(a2) {
      if (13 === a2.tag) {
        var b = Zg(a2, 134217728);
        if (null !== b) {
          var c2 = L2();
          mh(b, a2, 134217728, c2);
        }
        jl(a2, 134217728);
      }
    };
    Gc = function(a2) {
      if (13 === a2.tag) {
        var b = lh(a2), c2 = Zg(a2, b);
        if (null !== c2) {
          var d2 = L2();
          mh(c2, a2, b, d2);
        }
        jl(a2, b);
      }
    };
    Hc = function() {
      return C2;
    };
    Ic = function(a2, b) {
      var c2 = C2;
      try {
        return C2 = a2, b();
      } finally {
        C2 = c2;
      }
    };
    yb = function(a2, b, c2) {
      switch (b) {
        case "input":
          bb(a2, c2);
          b = c2.name;
          if ("radio" === c2.type && null != b) {
            for (c2 = a2; c2.parentNode; ) c2 = c2.parentNode;
            c2 = c2.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');
            for (b = 0; b < c2.length; b++) {
              var d2 = c2[b];
              if (d2 !== a2 && d2.form === a2.form) {
                var e2 = Db(d2);
                if (!e2) throw Error(p2(90));
                Wa(d2);
                bb(d2, e2);
              }
            }
          }
          break;
        case "textarea":
          ib(a2, c2);
          break;
        case "select":
          b = c2.value, null != b && fb(a2, !!c2.multiple, b, false);
      }
    };
    Gb = Rk;
    Hb = Sk;
    var tl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Rk] }, ul = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.2.0", rendererPackageName: "react-dom" };
    var vl = { bundleType: ul.bundleType, version: ul.version, rendererPackageName: ul.rendererPackageName, rendererConfig: ul.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a2) {
      a2 = Zb(a2);
      return null === a2 ? null : a2.stateNode;
    }, findFiberByHostInstance: ul.findFiberByHostInstance || kl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.2.0-next-9e3b772b8-20220608" };
    if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
      var wl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!wl.isDisabled && wl.supportsFiber) try {
        kc = wl.inject(vl), lc = wl;
      } catch (a2) {
      }
    }
    reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = tl;
    reactDom_production_min.createPortal = function(a2, b) {
      var c2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
      if (!ol(b)) throw Error(p2(200));
      return dl(a2, b, null, c2);
    };
    reactDom_production_min.createRoot = function(a2, b) {
      if (!ol(a2)) throw Error(p2(299));
      var c2 = false, d2 = "", e2 = ll;
      null !== b && void 0 !== b && (true === b.unstable_strictMode && (c2 = true), void 0 !== b.identifierPrefix && (d2 = b.identifierPrefix), void 0 !== b.onRecoverableError && (e2 = b.onRecoverableError));
      b = cl(a2, 1, false, null, null, c2, false, d2, e2);
      a2[uf] = b.current;
      sf(8 === a2.nodeType ? a2.parentNode : a2);
      return new ml(b);
    };
    reactDom_production_min.findDOMNode = function(a2) {
      if (null == a2) return null;
      if (1 === a2.nodeType) return a2;
      var b = a2._reactInternals;
      if (void 0 === b) {
        if ("function" === typeof a2.render) throw Error(p2(188));
        a2 = Object.keys(a2).join(",");
        throw Error(p2(268, a2));
      }
      a2 = Zb(b);
      a2 = null === a2 ? null : a2.stateNode;
      return a2;
    };
    reactDom_production_min.flushSync = function(a2) {
      return Sk(a2);
    };
    reactDom_production_min.hydrate = function(a2, b, c2) {
      if (!pl(b)) throw Error(p2(200));
      return sl(null, a2, b, true, c2);
    };
    reactDom_production_min.hydrateRoot = function(a2, b, c2) {
      if (!ol(a2)) throw Error(p2(405));
      var d2 = null != c2 && c2.hydratedSources || null, e2 = false, f2 = "", g2 = ll;
      null !== c2 && void 0 !== c2 && (true === c2.unstable_strictMode && (e2 = true), void 0 !== c2.identifierPrefix && (f2 = c2.identifierPrefix), void 0 !== c2.onRecoverableError && (g2 = c2.onRecoverableError));
      b = fl(b, null, a2, 1, null != c2 ? c2 : null, e2, false, f2, g2);
      a2[uf] = b.current;
      sf(a2);
      if (d2) for (a2 = 0; a2 < d2.length; a2++) c2 = d2[a2], e2 = c2._getVersion, e2 = e2(c2._source), null == b.mutableSourceEagerHydrationData ? b.mutableSourceEagerHydrationData = [c2, e2] : b.mutableSourceEagerHydrationData.push(
        c2,
        e2
      );
      return new nl(b);
    };
    reactDom_production_min.render = function(a2, b, c2) {
      if (!pl(b)) throw Error(p2(200));
      return sl(null, a2, b, false, c2);
    };
    reactDom_production_min.unmountComponentAtNode = function(a2) {
      if (!pl(a2)) throw Error(p2(40));
      return a2._reactRootContainer ? (Sk(function() {
        sl(null, null, a2, false, function() {
          a2._reactRootContainer = null;
          a2[uf] = null;
        });
      }), true) : false;
    };
    reactDom_production_min.unstable_batchedUpdates = Rk;
    reactDom_production_min.unstable_renderSubtreeIntoContainer = function(a2, b, c2, d2) {
      if (!pl(c2)) throw Error(p2(200));
      if (null == a2 || void 0 === a2._reactInternals) throw Error(p2(38));
      return sl(a2, b, c2, false, d2);
    };
    reactDom_production_min.version = "18.2.0-next-9e3b772b8-20220608";
    return reactDom_production_min;
  }
  var hasRequiredReactDom;
  function requireReactDom() {
    if (hasRequiredReactDom) return reactDom.exports;
    hasRequiredReactDom = 1;
    function checkDCE() {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
        return;
      }
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
      } catch (err) {
        console.error(err);
      }
    }
    {
      checkDCE();
      reactDom.exports = requireReactDom_production_min();
    }
    return reactDom.exports;
  }
  var hasRequiredClient;
  function requireClient() {
    if (hasRequiredClient) return client;
    hasRequiredClient = 1;
    var m2 = requireReactDom();
    {
      client.createRoot = m2.createRoot;
      client.hydrateRoot = m2.hydrateRoot;
    }
    return client;
  }
  var clientExports = requireClient();
  const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(clientExports);
  function getIconsTree(data, names) {
    const icons = data.icons;
    const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
    const resolved = /* @__PURE__ */ Object.create(null);
    function resolve(name) {
      if (icons[name]) return resolved[name] = [];
      if (!(name in resolved)) {
        resolved[name] = null;
        const parent = aliases[name] && aliases[name].parent;
        const value = parent && resolve(parent);
        if (value) resolved[name] = [parent].concat(value);
      }
      return resolved[name];
    }
    Object.keys(icons).concat(Object.keys(aliases)).forEach(resolve);
    return resolved;
  }
  const defaultIconDimensions = Object.freeze({
    left: 0,
    top: 0,
    width: 16,
    height: 16
  });
  const defaultIconTransformations = Object.freeze({
    rotate: 0,
    vFlip: false,
    hFlip: false
  });
  const defaultIconProps = Object.freeze({
    ...defaultIconDimensions,
    ...defaultIconTransformations
  });
  const defaultExtendedIconProps = Object.freeze({
    ...defaultIconProps,
    body: "",
    hidden: false
  });
  function mergeIconTransformations(obj1, obj2) {
    const result2 = {};
    if (!obj1.hFlip !== !obj2.hFlip) result2.hFlip = true;
    if (!obj1.vFlip !== !obj2.vFlip) result2.vFlip = true;
    const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
    if (rotate) result2.rotate = rotate;
    return result2;
  }
  function mergeIconData(parent, child) {
    const result2 = mergeIconTransformations(parent, child);
    for (const key in defaultExtendedIconProps) if (key in defaultIconTransformations) {
      if (key in parent && !(key in result2)) result2[key] = defaultIconTransformations[key];
    } else if (key in child) result2[key] = child[key];
    else if (key in parent) result2[key] = parent[key];
    return result2;
  }
  function internalGetIconData(data, name, tree) {
    const icons = data.icons;
    const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
    let currentProps = {};
    function parse(name$1) {
      currentProps = mergeIconData(icons[name$1] || aliases[name$1], currentProps);
    }
    parse(name);
    tree.forEach(parse);
    return mergeIconData(data, currentProps);
  }
  function parseIconSet(data, callback) {
    const names = [];
    if (typeof data !== "object" || typeof data.icons !== "object") return names;
    if (data.not_found instanceof Array) data.not_found.forEach((name) => {
      callback(name, null);
      names.push(name);
    });
    const tree = getIconsTree(data);
    for (const name in tree) {
      const item = tree[name];
      if (item) {
        callback(name, internalGetIconData(data, name, item));
        names.push(name);
      }
    }
    return names;
  }
  const optionalPropertyDefaults = {
    provider: "",
    aliases: {},
    not_found: {},
    ...defaultIconDimensions
  };
  function checkOptionalProps(item, defaults) {
    for (const prop in defaults) if (prop in item && typeof item[prop] !== typeof defaults[prop]) return false;
    return true;
  }
  function quicklyValidateIconSet(obj) {
    if (typeof obj !== "object" || obj === null) return null;
    const data = obj;
    if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") return null;
    if (!checkOptionalProps(obj, optionalPropertyDefaults)) return null;
    const icons = data.icons;
    for (const name in icons) {
      const icon = icons[name];
      if (!name || typeof icon.body !== "string" || !checkOptionalProps(icon, defaultExtendedIconProps)) return null;
    }
    const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
    for (const name in aliases) {
      const icon = aliases[name];
      const parent = icon.parent;
      if (!name || typeof parent !== "string" || !icons[parent] && !aliases[parent] || !checkOptionalProps(icon, defaultExtendedIconProps)) return null;
    }
    return data;
  }
  const dataStorage = /* @__PURE__ */ Object.create(null);
  function newStorage(provider, prefix) {
    return {
      provider,
      prefix,
      icons: /* @__PURE__ */ Object.create(null),
      missing: /* @__PURE__ */ new Set()
    };
  }
  function getStorage(provider, prefix) {
    const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
    return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
  }
  function addIconSet(storage2, data) {
    if (!quicklyValidateIconSet(data)) return [];
    return parseIconSet(data, (name, icon) => {
      if (icon) storage2.icons[name] = icon;
      else storage2.missing.add(name);
    });
  }
  function addIconToStorage(storage2, name, icon) {
    try {
      if (typeof icon.body === "string") {
        storage2.icons[name] = { ...icon };
        return true;
      }
    } catch (err) {
    }
    return false;
  }
  const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
    const colonSeparated = value.split(":");
    if (value.slice(0, 1) === "@") {
      if (colonSeparated.length < 2 || colonSeparated.length > 3) return null;
      provider = colonSeparated.shift().slice(1);
    }
    if (colonSeparated.length > 3 || !colonSeparated.length) return null;
    if (colonSeparated.length > 1) {
      const name$1 = colonSeparated.pop();
      const prefix = colonSeparated.pop();
      const result2 = {
        provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
        prefix,
        name: name$1
      };
      return validate && !validateIconName(result2) ? null : result2;
    }
    const name = colonSeparated[0];
    const dashSeparated = name.split("-");
    if (dashSeparated.length > 1) {
      const result2 = {
        provider,
        prefix: dashSeparated.shift(),
        name: dashSeparated.join("-")
      };
      return validate && !validateIconName(result2) ? null : result2;
    }
    if (allowSimpleName && provider === "") {
      const result2 = {
        provider,
        prefix: "",
        name
      };
      return validate && !validateIconName(result2, allowSimpleName) ? null : result2;
    }
    return null;
  };
  const validateIconName = (icon, allowSimpleName) => {
    if (!icon) return false;
    return !!((allowSimpleName && icon.prefix === "" || !!icon.prefix) && !!icon.name);
  };
  let simpleNames = false;
  function allowSimpleNames(allow) {
    if (typeof allow === "boolean") simpleNames = allow;
    return simpleNames;
  }
  function getIconData(name) {
    const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
    if (icon) {
      const storage2 = getStorage(icon.provider, icon.prefix);
      const iconName = icon.name;
      return storage2.icons[iconName] || (storage2.missing.has(iconName) ? null : void 0);
    }
  }
  function addIcon(name, data) {
    const icon = stringToIcon(name, true, simpleNames);
    if (!icon) return false;
    const storage2 = getStorage(icon.provider, icon.prefix);
    if (data) return addIconToStorage(storage2, icon.name, data);
    else {
      storage2.missing.add(icon.name);
      return true;
    }
  }
  function addCollection(data, provider) {
    if (typeof data !== "object") return false;
    if (typeof provider !== "string") provider = data.provider || "";
    if (simpleNames && !provider && !data.prefix) {
      let added = false;
      if (quicklyValidateIconSet(data)) {
        data.prefix = "";
        parseIconSet(data, (name, icon) => {
          if (addIcon(name, icon)) added = true;
        });
      }
      return added;
    }
    const prefix = data.prefix;
    if (!validateIconName({
      prefix,
      name: "a"
    })) return false;
    const storage2 = getStorage(provider, prefix);
    return !!addIconSet(storage2, data);
  }
  const defaultIconSizeCustomisations = Object.freeze({
    width: null,
    height: null
  });
  const defaultIconCustomisations = Object.freeze({
    ...defaultIconSizeCustomisations,
    ...defaultIconTransformations
  });
  const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
  const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
  function calculateSize(size, ratio, precision) {
    if (ratio === 1) return size;
    precision = precision || 100;
    if (typeof size === "number") return Math.ceil(size * ratio * precision) / precision;
    if (typeof size !== "string") return size;
    const oldParts = size.split(unitsSplit);
    if (oldParts === null || !oldParts.length) return size;
    const newParts = [];
    let code = oldParts.shift();
    let isNumber = unitsTest.test(code);
    while (true) {
      if (isNumber) {
        const num = parseFloat(code);
        if (isNaN(num)) newParts.push(code);
        else newParts.push(Math.ceil(num * ratio * precision) / precision);
      } else newParts.push(code);
      code = oldParts.shift();
      if (code === void 0) return newParts.join("");
      isNumber = !isNumber;
    }
  }
  function splitSVGDefs(content, tag = "defs") {
    let defs = "";
    const index = content.indexOf("<" + tag);
    while (index >= 0) {
      const start = content.indexOf(">", index);
      const end = content.indexOf("</" + tag);
      if (start === -1 || end === -1) break;
      const endEnd = content.indexOf(">", end);
      if (endEnd === -1) break;
      defs += content.slice(start + 1, end).trim();
      content = content.slice(0, index).trim() + content.slice(endEnd + 1);
    }
    return {
      defs,
      content
    };
  }
  function mergeDefsAndContent(defs, content) {
    return defs ? "<defs>" + defs + "</defs>" + content : content;
  }
  function wrapSVGContent(body, start, end) {
    const split = splitSVGDefs(body);
    return mergeDefsAndContent(split.defs, start + split.content + end);
  }
  const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
  function iconToSVG(icon, customisations) {
    const fullIcon = {
      ...defaultIconProps,
      ...icon
    };
    const fullCustomisations = {
      ...defaultIconCustomisations,
      ...customisations
    };
    const box = {
      left: fullIcon.left,
      top: fullIcon.top,
      width: fullIcon.width,
      height: fullIcon.height
    };
    let body = fullIcon.body;
    [fullIcon, fullCustomisations].forEach((props) => {
      const transformations = [];
      const hFlip = props.hFlip;
      const vFlip = props.vFlip;
      let rotation = props.rotate;
      if (hFlip) if (vFlip) rotation += 2;
      else {
        transformations.push("translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")");
        transformations.push("scale(-1 1)");
        box.top = box.left = 0;
      }
      else if (vFlip) {
        transformations.push("translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")");
        transformations.push("scale(1 -1)");
        box.top = box.left = 0;
      }
      let tempValue;
      if (rotation < 0) rotation -= Math.floor(rotation / 4) * 4;
      rotation = rotation % 4;
      switch (rotation) {
        case 1:
          tempValue = box.height / 2 + box.top;
          transformations.unshift("rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")");
          break;
        case 2:
          transformations.unshift("rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")");
          break;
        case 3:
          tempValue = box.width / 2 + box.left;
          transformations.unshift("rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")");
          break;
      }
      if (rotation % 2 === 1) {
        if (box.left !== box.top) {
          tempValue = box.left;
          box.left = box.top;
          box.top = tempValue;
        }
        if (box.width !== box.height) {
          tempValue = box.width;
          box.width = box.height;
          box.height = tempValue;
        }
      }
      if (transformations.length) body = wrapSVGContent(body, '<g transform="' + transformations.join(" ") + '">', "</g>");
    });
    const customisationsWidth = fullCustomisations.width;
    const customisationsHeight = fullCustomisations.height;
    const boxWidth = box.width;
    const boxHeight = box.height;
    let width;
    let height;
    if (customisationsWidth === null) {
      height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
      width = calculateSize(height, boxWidth / boxHeight);
    } else {
      width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
      height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
    }
    const attributes = {};
    const setAttr = (prop, value) => {
      if (!isUnsetKeyword(value)) attributes[prop] = value.toString();
    };
    setAttr("width", width);
    setAttr("height", height);
    const viewBox = [
      box.left,
      box.top,
      boxWidth,
      boxHeight
    ];
    attributes.viewBox = viewBox.join(" ");
    return {
      attributes,
      viewBox,
      body
    };
  }
  const regex = /\sid="(\S+)"/g;
  const randomPrefix = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
  let counter = 0;
  function replaceIDs(body, prefix = randomPrefix) {
    const ids = [];
    let match;
    while (match = regex.exec(body)) ids.push(match[1]);
    if (!ids.length) return body;
    const suffix = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
    ids.forEach((id) => {
      const newID = typeof prefix === "function" ? prefix(id) : prefix + (counter++).toString();
      const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      body = body.replace(new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"), "$1" + newID + suffix + "$3");
    });
    body = body.replace(new RegExp(suffix, "g"), "");
    return body;
  }
  const storage$1 = /* @__PURE__ */ Object.create(null);
  function setAPIModule(provider, item) {
    storage$1[provider] = item;
  }
  function getAPIModule(provider) {
    return storage$1[provider] || storage$1[""];
  }
  function createAPIConfig(source) {
    let resources;
    if (typeof source.resources === "string") resources = [source.resources];
    else {
      resources = source.resources;
      if (!(resources instanceof Array) || !resources.length) return null;
    }
    const result2 = {
      resources,
      path: source.path || "/",
      maxURL: source.maxURL || 500,
      rotate: source.rotate || 750,
      timeout: source.timeout || 5e3,
      random: source.random === true,
      index: source.index || 0,
      dataAfterTimeout: source.dataAfterTimeout !== false
    };
    return result2;
  }
  const configStorage = /* @__PURE__ */ Object.create(null);
  const fallBackAPISources = ["https://api.simplesvg.com", "https://api.unisvg.com"];
  const fallBackAPI = [];
  while (fallBackAPISources.length > 0) if (fallBackAPISources.length === 1) fallBackAPI.push(fallBackAPISources.shift());
  else if (Math.random() > 0.5) fallBackAPI.push(fallBackAPISources.shift());
  else fallBackAPI.push(fallBackAPISources.pop());
  configStorage[""] = createAPIConfig({ resources: ["https://api.iconify.design"].concat(fallBackAPI) });
  function addAPIProvider(provider, customConfig) {
    const config = createAPIConfig(customConfig);
    if (config === null) return false;
    configStorage[provider] = config;
    return true;
  }
  function getAPIConfig(provider) {
    return configStorage[provider];
  }
  const detectFetch = () => {
    let callback;
    try {
      callback = fetch;
      if (typeof callback === "function") return callback;
    } catch (err) {
    }
  };
  let fetchModule = detectFetch();
  function calculateMaxLength(provider, prefix) {
    const config = getAPIConfig(provider);
    if (!config) return 0;
    let result2;
    if (!config.maxURL) result2 = 0;
    else {
      let maxHostLength = 0;
      config.resources.forEach((item) => {
        const host = item;
        maxHostLength = Math.max(maxHostLength, host.length);
      });
      const url = prefix + ".json?icons=";
      result2 = config.maxURL - maxHostLength - config.path.length - url.length;
    }
    return result2;
  }
  function shouldAbort(status) {
    return status === 404;
  }
  const prepare = (provider, prefix, icons) => {
    const results = [];
    const maxLength = calculateMaxLength(provider, prefix);
    const type = "icons";
    let item = {
      type,
      provider,
      prefix,
      icons: []
    };
    let length = 0;
    icons.forEach((name, index) => {
      length += name.length + 1;
      if (length >= maxLength && index > 0) {
        results.push(item);
        item = {
          type,
          provider,
          prefix,
          icons: []
        };
        length = name.length;
      }
      item.icons.push(name);
    });
    results.push(item);
    return results;
  };
  function getPath(provider) {
    if (typeof provider === "string") {
      const config = getAPIConfig(provider);
      if (config) return config.path;
    }
    return "/";
  }
  const send = (host, params, callback) => {
    if (!fetchModule) {
      callback("abort", 424);
      return;
    }
    let path = getPath(params.provider);
    switch (params.type) {
      case "icons": {
        const prefix = params.prefix;
        const icons = params.icons;
        const iconsList = icons.join(",");
        const urlParams = new URLSearchParams({ icons: iconsList });
        path += prefix + ".json?" + urlParams.toString();
        break;
      }
      case "custom": {
        const uri = params.uri;
        path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
        break;
      }
      default:
        callback("abort", 400);
        return;
    }
    let defaultError = 503;
    fetchModule(host + path).then((response) => {
      const status = response.status;
      if (status !== 200) {
        setTimeout(() => {
          callback(shouldAbort(status) ? "abort" : "next", status);
        });
        return;
      }
      defaultError = 501;
      return response.json();
    }).then((data) => {
      if (typeof data !== "object" || data === null) {
        setTimeout(() => {
          if (data === 404) callback("abort", data);
          else callback("next", defaultError);
        });
        return;
      }
      setTimeout(() => {
        callback("success", data);
      });
    }).catch(() => {
      callback("next", defaultError);
    });
  };
  const fetchAPIModule = {
    prepare,
    send
  };
  function removeCallback(storages, id) {
    storages.forEach((storage2) => {
      const items = storage2.loaderCallbacks;
      if (items) storage2.loaderCallbacks = items.filter((row) => row.id !== id);
    });
  }
  function updateCallbacks(storage2) {
    if (!storage2.pendingCallbacksFlag) {
      storage2.pendingCallbacksFlag = true;
      setTimeout(() => {
        storage2.pendingCallbacksFlag = false;
        const items = storage2.loaderCallbacks ? storage2.loaderCallbacks.slice(0) : [];
        if (!items.length) return;
        let hasPending = false;
        const provider = storage2.provider;
        const prefix = storage2.prefix;
        items.forEach((item) => {
          const icons = item.icons;
          const oldLength = icons.pending.length;
          icons.pending = icons.pending.filter((icon) => {
            if (icon.prefix !== prefix) return true;
            const name = icon.name;
            if (storage2.icons[name]) icons.loaded.push({
              provider,
              prefix,
              name
            });
            else if (storage2.missing.has(name)) icons.missing.push({
              provider,
              prefix,
              name
            });
            else {
              hasPending = true;
              return true;
            }
            return false;
          });
          if (icons.pending.length !== oldLength) {
            if (!hasPending) removeCallback([storage2], item.id);
            item.callback(icons.loaded.slice(0), icons.missing.slice(0), icons.pending.slice(0), item.abort);
          }
        });
      });
    }
  }
  let idCounter = 0;
  function storeCallback(callback, icons, pendingSources) {
    const id = idCounter++;
    const abort = removeCallback.bind(null, pendingSources, id);
    if (!icons.pending.length) return abort;
    const item = {
      id,
      icons,
      callback,
      abort
    };
    pendingSources.forEach((storage2) => {
      (storage2.loaderCallbacks || (storage2.loaderCallbacks = [])).push(item);
    });
    return abort;
  }
  function sortIcons(icons) {
    const result2 = {
      loaded: [],
      missing: [],
      pending: []
    };
    const storage2 = /* @__PURE__ */ Object.create(null);
    icons.sort((a2, b) => {
      if (a2.provider !== b.provider) return a2.provider.localeCompare(b.provider);
      if (a2.prefix !== b.prefix) return a2.prefix.localeCompare(b.prefix);
      return a2.name.localeCompare(b.name);
    });
    let lastIcon = {
      provider: "",
      prefix: "",
      name: ""
    };
    icons.forEach((icon) => {
      if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) return;
      lastIcon = icon;
      const provider = icon.provider;
      const prefix = icon.prefix;
      const name = icon.name;
      const providerStorage = storage2[provider] || (storage2[provider] = /* @__PURE__ */ Object.create(null));
      const localStorage = providerStorage[prefix] || (providerStorage[prefix] = getStorage(provider, prefix));
      let list;
      if (name in localStorage.icons) list = result2.loaded;
      else if (prefix === "" || localStorage.missing.has(name)) list = result2.missing;
      else list = result2.pending;
      const item = {
        provider,
        prefix,
        name
      };
      list.push(item);
    });
    return result2;
  }
  function listToIcons(list, validate = true, simpleNames2 = false) {
    const result2 = [];
    list.forEach((item) => {
      const icon = typeof item === "string" ? stringToIcon(item, validate, simpleNames2) : item;
      if (icon) result2.push(icon);
    });
    return result2;
  }
  const defaultConfig = {
    resources: [],
    index: 0,
    timeout: 2e3,
    rotate: 750,
    random: false,
    dataAfterTimeout: false
  };
  function sendQuery(config, payload, query, done) {
    const resourcesCount = config.resources.length;
    const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
    let resources;
    if (config.random) {
      let list = config.resources.slice(0);
      resources = [];
      while (list.length > 1) {
        const nextIndex = Math.floor(Math.random() * list.length);
        resources.push(list[nextIndex]);
        list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
      }
      resources = resources.concat(list);
    } else resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
    const startTime = Date.now();
    let status = "pending";
    let queriesSent = 0;
    let lastError;
    let timer = null;
    let queue = [];
    let doneCallbacks = [];
    if (typeof done === "function") doneCallbacks.push(done);
    function resetTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    function abort() {
      if (status === "pending") status = "aborted";
      resetTimer();
      queue.forEach((item) => {
        if (item.status === "pending") item.status = "aborted";
      });
      queue = [];
    }
    function subscribe(callback, overwrite) {
      if (overwrite) doneCallbacks = [];
      if (typeof callback === "function") doneCallbacks.push(callback);
    }
    function getQueryStatus() {
      return {
        startTime,
        payload,
        status,
        queriesSent,
        queriesPending: queue.length,
        subscribe,
        abort
      };
    }
    function failQuery() {
      status = "failed";
      doneCallbacks.forEach((callback) => {
        callback(void 0, lastError);
      });
    }
    function clearQueue() {
      queue.forEach((item) => {
        if (item.status === "pending") item.status = "aborted";
      });
      queue = [];
    }
    function moduleResponse(item, response, data) {
      const isError = response !== "success";
      queue = queue.filter((queued) => queued !== item);
      switch (status) {
        case "pending":
          break;
        case "failed":
          if (isError || !config.dataAfterTimeout) return;
          break;
        default:
          return;
      }
      if (response === "abort") {
        lastError = data;
        failQuery();
        return;
      }
      if (isError) {
        lastError = data;
        if (!queue.length) if (!resources.length) failQuery();
        else execNext();
        return;
      }
      resetTimer();
      clearQueue();
      if (!config.random) {
        const index = config.resources.indexOf(item.resource);
        if (index !== -1 && index !== config.index) config.index = index;
      }
      status = "completed";
      doneCallbacks.forEach((callback) => {
        callback(data);
      });
    }
    function execNext() {
      if (status !== "pending") return;
      resetTimer();
      const resource = resources.shift();
      if (resource === void 0) {
        if (queue.length) {
          timer = setTimeout(() => {
            resetTimer();
            if (status === "pending") {
              clearQueue();
              failQuery();
            }
          }, config.timeout);
          return;
        }
        failQuery();
        return;
      }
      const item = {
        status: "pending",
        resource,
        callback: (status$1, data) => {
          moduleResponse(item, status$1, data);
        }
      };
      queue.push(item);
      queriesSent++;
      timer = setTimeout(execNext, config.rotate);
      query(resource, payload, item.callback);
    }
    setTimeout(execNext);
    return getQueryStatus;
  }
  function initRedundancy(cfg) {
    const config = {
      ...defaultConfig,
      ...cfg
    };
    let queries = [];
    function cleanup() {
      queries = queries.filter((item) => item().status === "pending");
    }
    function query(payload, queryCallback, doneCallback) {
      const query$1 = sendQuery(config, payload, queryCallback, (data, error) => {
        cleanup();
        if (doneCallback) doneCallback(data, error);
      });
      queries.push(query$1);
      return query$1;
    }
    function find(callback) {
      return queries.find((value) => {
        return callback(value);
      }) || null;
    }
    const instance = {
      query,
      find,
      setIndex: (index) => {
        config.index = index;
      },
      getIndex: () => config.index,
      cleanup
    };
    return instance;
  }
  function emptyCallback$1() {
  }
  const redundancyCache = /* @__PURE__ */ Object.create(null);
  function getRedundancyCache(provider) {
    if (!redundancyCache[provider]) {
      const config = getAPIConfig(provider);
      if (!config) return;
      const redundancy = initRedundancy(config);
      const cachedReundancy = {
        config,
        redundancy
      };
      redundancyCache[provider] = cachedReundancy;
    }
    return redundancyCache[provider];
  }
  function sendAPIQuery(target, query, callback) {
    let redundancy;
    let send2;
    if (typeof target === "string") {
      const api = getAPIModule(target);
      if (!api) {
        callback(void 0, 424);
        return emptyCallback$1;
      }
      send2 = api.send;
      const cached = getRedundancyCache(target);
      if (cached) redundancy = cached.redundancy;
    } else {
      const config = createAPIConfig(target);
      if (config) {
        redundancy = initRedundancy(config);
        const moduleKey = target.resources ? target.resources[0] : "";
        const api = getAPIModule(moduleKey);
        if (api) send2 = api.send;
      }
    }
    if (!redundancy || !send2) {
      callback(void 0, 424);
      return emptyCallback$1;
    }
    return redundancy.query(query, send2, callback)().abort;
  }
  function emptyCallback() {
  }
  function loadedNewIcons(storage2) {
    if (!storage2.iconsLoaderFlag) {
      storage2.iconsLoaderFlag = true;
      setTimeout(() => {
        storage2.iconsLoaderFlag = false;
        updateCallbacks(storage2);
      });
    }
  }
  function checkIconNamesForAPI(icons) {
    const valid = [];
    const invalid = [];
    icons.forEach((name) => {
      (name.match(matchIconName) ? valid : invalid).push(name);
    });
    return {
      valid,
      invalid
    };
  }
  function parseLoaderResponse(storage2, icons, data) {
    function checkMissing() {
      const pending = storage2.pendingIcons;
      icons.forEach((name) => {
        if (pending) pending.delete(name);
        if (!storage2.icons[name]) storage2.missing.add(name);
      });
    }
    if (data && typeof data === "object") try {
      const parsed = addIconSet(storage2, data);
      if (!parsed.length) {
        checkMissing();
        return;
      }
    } catch (err) {
      console.error(err);
    }
    checkMissing();
    loadedNewIcons(storage2);
  }
  function parsePossiblyAsyncResponse(response, callback) {
    if (response instanceof Promise) response.then((data) => {
      callback(data);
    }).catch(() => {
      callback(null);
    });
    else callback(response);
  }
  function loadNewIcons(storage2, icons) {
    if (!storage2.iconsToLoad) storage2.iconsToLoad = icons;
    else storage2.iconsToLoad = storage2.iconsToLoad.concat(icons).sort();
    if (!storage2.iconsQueueFlag) {
      storage2.iconsQueueFlag = true;
      setTimeout(() => {
        storage2.iconsQueueFlag = false;
        const { provider, prefix } = storage2;
        const icons$1 = storage2.iconsToLoad;
        delete storage2.iconsToLoad;
        if (!icons$1 || !icons$1.length) return;
        const customIconLoader = storage2.loadIcon;
        if (storage2.loadIcons && (icons$1.length > 1 || !customIconLoader)) {
          parsePossiblyAsyncResponse(storage2.loadIcons(icons$1, prefix, provider), (data) => {
            parseLoaderResponse(storage2, icons$1, data);
          });
          return;
        }
        if (customIconLoader) {
          icons$1.forEach((name) => {
            const response = customIconLoader(name, prefix, provider);
            parsePossiblyAsyncResponse(response, (data) => {
              const iconSet = data ? {
                prefix,
                icons: { [name]: data }
              } : null;
              parseLoaderResponse(storage2, [name], iconSet);
            });
          });
          return;
        }
        const { valid, invalid } = checkIconNamesForAPI(icons$1);
        if (invalid.length) parseLoaderResponse(storage2, invalid, null);
        if (!valid.length) return;
        const api = prefix.match(matchIconName) ? getAPIModule(provider) : null;
        if (!api) {
          parseLoaderResponse(storage2, valid, null);
          return;
        }
        const params = api.prepare(provider, prefix, valid);
        params.forEach((item) => {
          sendAPIQuery(provider, item, (data) => {
            parseLoaderResponse(storage2, item.icons, data);
          });
        });
      });
    }
  }
  const loadIcons = (icons, callback) => {
    const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
    const sortedIcons = sortIcons(cleanedIcons);
    if (!sortedIcons.pending.length) {
      let callCallback = true;
      if (callback) setTimeout(() => {
        if (callCallback) callback(sortedIcons.loaded, sortedIcons.missing, sortedIcons.pending, emptyCallback);
      });
      return () => {
        callCallback = false;
      };
    }
    const newIcons = /* @__PURE__ */ Object.create(null);
    const sources = [];
    let lastProvider, lastPrefix;
    sortedIcons.pending.forEach((icon) => {
      const { provider, prefix } = icon;
      if (prefix === lastPrefix && provider === lastProvider) return;
      lastProvider = provider;
      lastPrefix = prefix;
      sources.push(getStorage(provider, prefix));
      const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
      if (!providerNewIcons[prefix]) providerNewIcons[prefix] = [];
    });
    sortedIcons.pending.forEach((icon) => {
      const { provider, prefix, name } = icon;
      const storage2 = getStorage(provider, prefix);
      const pendingQueue = storage2.pendingIcons || (storage2.pendingIcons = /* @__PURE__ */ new Set());
      if (!pendingQueue.has(name)) {
        pendingQueue.add(name);
        newIcons[provider][prefix].push(name);
      }
    });
    sources.forEach((storage2) => {
      const list = newIcons[storage2.provider][storage2.prefix];
      if (list.length) loadNewIcons(storage2, list);
    });
    return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
  };
  function mergeCustomisations(defaults, item) {
    const result2 = { ...defaults };
    for (const key in item) {
      const value = item[key];
      const valueType = typeof value;
      if (key in defaultIconSizeCustomisations) {
        if (value === null || value && (valueType === "string" || valueType === "number")) result2[key] = value;
      } else if (valueType === typeof result2[key]) result2[key] = key === "rotate" ? value % 4 : value;
    }
    return result2;
  }
  const separator = /[\s,]+/;
  function flipFromString(custom, flip) {
    flip.split(separator).forEach((str) => {
      const value = str.trim();
      switch (value) {
        case "horizontal":
          custom.hFlip = true;
          break;
        case "vertical":
          custom.vFlip = true;
          break;
      }
    });
  }
  function rotateFromString(value, defaultValue = 0) {
    const units = value.replace(/^-?[0-9.]*/, "");
    function cleanup(value$1) {
      while (value$1 < 0) value$1 += 4;
      return value$1 % 4;
    }
    if (units === "") {
      const num = parseInt(value);
      return isNaN(num) ? 0 : cleanup(num);
    } else if (units !== value) {
      let split = 0;
      switch (units) {
        case "%":
          split = 25;
          break;
        case "deg":
          split = 90;
      }
      if (split) {
        let num = parseFloat(value.slice(0, value.length - units.length));
        if (isNaN(num)) return 0;
        num = num / split;
        return num % 1 === 0 ? cleanup(num) : 0;
      }
    }
    return defaultValue;
  }
  function iconToHTML(body, attributes) {
    let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    for (const attr in attributes) renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
    return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
  }
  function encodeSVGforURL(svg) {
    return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
  }
  function svgToData(svg) {
    return "data:image/svg+xml," + encodeSVGforURL(svg);
  }
  function svgToURL(svg) {
    return 'url("' + svgToData(svg) + '")';
  }
  let policy;
  function createPolicy() {
    try {
      policy = window.trustedTypes.createPolicy("iconify", { createHTML: (s2) => s2 });
    } catch (err) {
      policy = null;
    }
  }
  function cleanUpInnerHTML(html) {
    if (policy === void 0) createPolicy();
    return policy ? policy.createHTML(html) : html;
  }
  const defaultExtendedIconCustomisations = {
    ...defaultIconCustomisations,
    inline: false
  };
  const svgDefaults = {
    "xmlns": "http://www.w3.org/2000/svg",
    "xmlnsXlink": "http://www.w3.org/1999/xlink",
    "aria-hidden": true,
    "role": "img"
  };
  const commonProps = {
    display: "inline-block"
  };
  const monotoneProps = {
    backgroundColor: "currentColor"
  };
  const coloredProps = {
    backgroundColor: "transparent"
  };
  const propsToAdd = {
    Image: "var(--svg)",
    Repeat: "no-repeat",
    Size: "100% 100%"
  };
  const propsToAddTo = {
    WebkitMask: monotoneProps,
    mask: monotoneProps,
    background: coloredProps
  };
  for (const prefix in propsToAddTo) {
    const list = propsToAddTo[prefix];
    for (const prop in propsToAdd) {
      list[prefix + prop] = propsToAdd[prop];
    }
  }
  const inlineDefaults = {
    ...defaultExtendedIconCustomisations,
    inline: true
  };
  function fixSize(value) {
    return value + (value.match(/^[-0-9.]+$/) ? "px" : "");
  }
  const render = (icon, props, name) => {
    const defaultProps = props.inline ? inlineDefaults : defaultExtendedIconCustomisations;
    const customisations = mergeCustomisations(defaultProps, props);
    const mode = props.mode || "svg";
    const style = {};
    const customStyle = props.style || {};
    const componentProps = {
      ...mode === "svg" ? svgDefaults : {}
    };
    if (name) {
      const iconName = stringToIcon(name, false, true);
      if (iconName) {
        const classNames = ["iconify"];
        const props2 = [
          "provider",
          "prefix"
        ];
        for (const prop of props2) {
          if (iconName[prop]) {
            classNames.push("iconify--" + iconName[prop]);
          }
        }
        componentProps.className = classNames.join(" ");
      }
    }
    for (let key in props) {
      const value = props[key];
      if (value === void 0) {
        continue;
      }
      switch (key) {
        // Properties to ignore
        case "icon":
        case "style":
        case "children":
        case "onLoad":
        case "mode":
        case "ssr":
        case "fallback":
          break;
        // Forward ref
        case "_ref":
          componentProps.ref = value;
          break;
        // Merge class names
        case "className":
          componentProps[key] = (componentProps[key] ? componentProps[key] + " " : "") + value;
          break;
        // Boolean attributes
        case "inline":
        case "hFlip":
        case "vFlip":
          customisations[key] = value === true || value === "true" || value === 1;
          break;
        // Flip as string: 'horizontal,vertical'
        case "flip":
          if (typeof value === "string") {
            flipFromString(customisations, value);
          }
          break;
        // Color: copy to style
        case "color":
          style.color = value;
          break;
        // Rotation as string
        case "rotate":
          if (typeof value === "string") {
            customisations[key] = rotateFromString(value);
          } else if (typeof value === "number") {
            customisations[key] = value;
          }
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          if (value !== true && value !== "true") {
            delete componentProps["aria-hidden"];
          }
          break;
        // Copy missing property if it does not exist in customisations
        default:
          if (defaultProps[key] === void 0) {
            componentProps[key] = value;
          }
      }
    }
    const item = iconToSVG(icon, customisations);
    const renderAttribs = item.attributes;
    if (customisations.inline) {
      style.verticalAlign = "-0.125em";
    }
    if (mode === "svg") {
      componentProps.style = {
        ...style,
        ...customStyle
      };
      Object.assign(componentProps, renderAttribs);
      let localCounter = 0;
      let id = props.id;
      if (typeof id === "string") {
        id = id.replace(/-/g, "_");
      }
      componentProps.dangerouslySetInnerHTML = {
        __html: cleanUpInnerHTML(replaceIDs(item.body, id ? () => id + "ID" + localCounter++ : "iconifyReact"))
      };
      return reactExports.createElement("svg", componentProps);
    }
    const { body, width, height } = icon;
    const useMask = mode === "mask" || (mode === "bg" ? false : body.indexOf("currentColor") !== -1);
    const html = iconToHTML(body, {
      ...renderAttribs,
      width: width + "",
      height: height + ""
    });
    componentProps.style = {
      ...style,
      "--svg": svgToURL(html),
      "width": fixSize(renderAttribs.width),
      "height": fixSize(renderAttribs.height),
      ...commonProps,
      ...useMask ? monotoneProps : coloredProps,
      ...customStyle
    };
    return reactExports.createElement("span", componentProps);
  };
  allowSimpleNames(true);
  setAPIModule("", fetchAPIModule);
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    const _window = window;
    if (_window.IconifyPreload !== void 0) {
      const preload = _window.IconifyPreload;
      const err = "Invalid IconifyPreload syntax.";
      if (typeof preload === "object" && preload !== null) {
        (preload instanceof Array ? preload : [preload]).forEach((item) => {
          try {
            if (
              // Check if item is an object and not null/array
              typeof item !== "object" || item === null || item instanceof Array || // Check for 'icons' and 'prefix'
              typeof item.icons !== "object" || typeof item.prefix !== "string" || // Add icon set
              !addCollection(item)
            ) {
              console.error(err);
            }
          } catch (e2) {
            console.error(err);
          }
        });
      }
    }
    if (_window.IconifyProviders !== void 0) {
      const providers = _window.IconifyProviders;
      if (typeof providers === "object" && providers !== null) {
        for (let key in providers) {
          const err = "IconifyProviders[" + key + "] is invalid.";
          try {
            const value = providers[key];
            if (typeof value !== "object" || !value || value.resources === void 0) {
              continue;
            }
            if (!addAPIProvider(key, value)) {
              console.error(err);
            }
          } catch (e2) {
            console.error(err);
          }
        }
      }
    }
  }
  function IconComponent(props) {
    const [mounted, setMounted] = reactExports.useState(!!props.ssr);
    const [abort, setAbort] = reactExports.useState({});
    function getInitialState(mounted2) {
      if (mounted2) {
        const name2 = props.icon;
        if (typeof name2 === "object") {
          return {
            name: "",
            data: name2
          };
        }
        const data2 = getIconData(name2);
        if (data2) {
          return {
            name: name2,
            data: data2
          };
        }
      }
      return {
        name: ""
      };
    }
    const [state, setState] = reactExports.useState(getInitialState(!!props.ssr));
    function cleanup() {
      const callback = abort.callback;
      if (callback) {
        callback();
        setAbort({});
      }
    }
    function changeState(newState) {
      if (JSON.stringify(state) !== JSON.stringify(newState)) {
        cleanup();
        setState(newState);
        return true;
      }
    }
    function updateState() {
      var _a;
      const name2 = props.icon;
      if (typeof name2 === "object") {
        changeState({
          name: "",
          data: name2
        });
        return;
      }
      const data2 = getIconData(name2);
      if (changeState({
        name: name2,
        data: data2
      })) {
        if (data2 === void 0) {
          const callback = loadIcons([name2], updateState);
          setAbort({
            callback
          });
        } else if (data2) {
          (_a = props.onLoad) === null || _a === void 0 ? void 0 : _a.call(props, name2);
        }
      }
    }
    reactExports.useEffect(() => {
      setMounted(true);
      return cleanup;
    }, []);
    reactExports.useEffect(() => {
      if (mounted) {
        updateState();
      }
    }, [props.icon, mounted]);
    const { name, data } = state;
    if (!data) {
      return props.children ? props.children : props.fallback ? props.fallback : reactExports.createElement("span", {});
    }
    return render({
      ...defaultIconProps,
      ...data
    }, props, name);
  }
  const Icon = reactExports.forwardRef((props, ref) => IconComponent({
    ...props,
    _ref: ref
  }));
  reactExports.forwardRef((props, ref) => IconComponent({
    inline: true,
    ...props,
    _ref: ref
  }));
  var classnames$1 = { exports: {} };
  var hasRequiredClassnames;
  function requireClassnames() {
    if (hasRequiredClassnames) return classnames$1.exports;
    hasRequiredClassnames = 1;
    (function(module) {
      (function() {
        var hasOwn = {}.hasOwnProperty;
        function classNames() {
          var classes = "";
          for (var i2 = 0; i2 < arguments.length; i2++) {
            var arg = arguments[i2];
            if (arg) {
              classes = appendClass(classes, parseValue(arg));
            }
          }
          return classes;
        }
        function parseValue(arg) {
          if (typeof arg === "string" || typeof arg === "number") {
            return arg;
          }
          if (typeof arg !== "object") {
            return "";
          }
          if (Array.isArray(arg)) {
            return classNames.apply(null, arg);
          }
          if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes("[native code]")) {
            return arg.toString();
          }
          var classes = "";
          for (var key in arg) {
            if (hasOwn.call(arg, key) && arg[key]) {
              classes = appendClass(classes, key);
            }
          }
          return classes;
        }
        function appendClass(value, newClass) {
          if (!newClass) {
            return value;
          }
          if (value) {
            return value + " " + newClass;
          }
          return value + newClass;
        }
        if (module.exports) {
          classNames.default = classNames;
          module.exports = classNames;
        } else {
          window.classNames = classNames;
        }
      })();
    })(classnames$1);
    return classnames$1.exports;
  }
  var classnamesExports = requireClassnames();
  const classnames = /* @__PURE__ */ getDefaultExportFromCjs(classnamesExports);
  class DownloadError extends Error {
    stage;
    constructor(stage, message) {
      super(message ?? stage);
      this.name = "DownloadError";
      this.stage = stage;
    }
  }
  const STAGE_MESSAGES = {
    AUTH_MISSING: "Couldn't read your Facebook session. Make sure you're logged in, then refresh the page.",
    GRAPHQL_FAILED: "Couldn't load the video info from Facebook. Please refresh the page and try again.",
    NO_VIDEO_ID: "Couldn't find a video here. Open the video, then try again.",
    NO_VIDEO: "No downloadable video was found for this post.",
    FETCH_FAILED: "The video link expired. Please refresh the page and try again.",
    MERGE_FAILED: "Failed to merge the audio and video. Please try again.",
    UNKNOWN: "Download failed. Please try again."
  };
  function getStageMessage(stage) {
    return STAGE_MESSAGES[stage] ?? STAGE_MESSAGES.UNKNOWN;
  }
  function isDownloadStage(value) {
    return typeof value === "string" && value in STAGE_MESSAGES;
  }
  function toDownloadError(err) {
    if (err instanceof DownloadError) return err;
    const message = err instanceof Error ? err.message : void 0;
    return new DownloadError("UNKNOWN", message);
  }
  function downloadErrorFromResponse(response) {
    const stage = isDownloadStage(response.stage) ? response.stage : "UNKNOWN";
    return new DownloadError(stage, response.error);
  }
  function extractVideoIdFromUrl(url) {
    const targetUrl = url || (typeof window !== "undefined" && window.location ? window.location.href : "");
    if (!targetUrl) {
      return null;
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return null;
    }
    const pathname = parsedUrl.pathname;
    if (/^\/watch\/?$/.test(pathname)) {
      const v2 = parsedUrl.searchParams.get("v");
      if (v2 && /^\d+$/.test(v2)) {
        return v2;
      }
    }
    const reelMatch = pathname.match(/^\/reel\/(\d+)\/?$/);
    if (reelMatch) {
      return reelMatch[1];
    }
    const videosMatch = pathname.match(/^\/[^/]+\/videos\/(?:[^/]+\/)?(\d+)\/?$/);
    if (videosMatch) {
      return videosMatch[1];
    }
    return null;
  }
  function getFbDtsg() {
    const dtsg = document.querySelector('input[name="fb_dtsg"]')?.value || /"DTSGInitialData".*?"token":"([^"]+)"/.exec(
      document.body.innerHTML
    )?.[1] || "";
    return dtsg;
  }
  function getUserId() {
    const userId = document.cookie.match(/c_user=(\d+)/)?.[1] || "0";
    return userId;
  }
  const QUALITY_LABELS = [240, 270, 360, 480, 540, 640, 720, 1080, 1440, 2160];
  async function getVideoResources(videoID) {
    const userId = getUserId();
    const av = userId;
    const fbDtsg = getFbDtsg();
    if (!fbDtsg) {
      throw new DownloadError(
        "AUTH_MISSING",
        "fb_dtsg not found in page context."
      );
    }
    const response = await fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded",
        "x-fb-friendly-name": "CometVideoHomeNewPermalinkHeroUnitQuery"
      },
      body: new URLSearchParams({
        av,
        __user: userId,
        fb_dtsg: fbDtsg,
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "CometVideoHomeNewPermalinkHeroUnitQuery",
        server_timestamps: "true",
        variables: JSON.stringify({
          videoID,
          videoIDStr: videoID
        }),
        doc_id: "25805785059115628"
      })
    });
    if (!response.ok) {
      throw new DownloadError(
        "GRAPHQL_FAILED",
        `Facebook GraphQL request failed: ${response.status} ${response.statusText}`
      );
    }
    const text = await response.text();
    const firstLine = text.split("\n")[0]?.trim();
    if (!firstLine) {
      throw new DownloadError(
        "GRAPHQL_FAILED",
        "Facebook GraphQL response is empty"
      );
    }
    let json;
    try {
      json = JSON.parse(firstLine);
    } catch {
      throw new DownloadError(
        "GRAPHQL_FAILED",
        "Failed to parse Facebook GraphQL response"
      );
    }
    const media = json?.data?.video?.story?.attachments?.[0]?.media;
    const audioAvailability = media?.audio_availability;
    const hasAudio = audioAvailability === "AVAILABLE";
    const dashPrefetch = json?.extensions?.all_video_dash_prefetch_representations?.[0];
    const videoId = dashPrefetch?.video_id;
    const representations = Array.isArray(dashPrefetch?.representations) ? dashPrefetch.representations : [];
    const videoCandidates = [];
    const audioList = [];
    for (const rep of representations) {
      if (rep?.mime_type?.startsWith("video/")) {
        videoCandidates.push({
          id: rep.representation_id,
          codecs: rep.codecs,
          bandwidth: rep.bandwidth,
          baseUrl: rep.base_url,
          width: rep.width,
          height: rep.height
        });
      } else if (rep?.mime_type?.startsWith("audio/")) {
        audioList.push({
          id: rep.representation_id,
          codecs: rep.codecs,
          bandwidth: rep.bandwidth,
          baseUrl: rep.base_url
        });
      }
    }
    const videoList = videoCandidates.sort((a2, b) => a2.bandwidth - b.bandwidth).map((video, index) => ({
      ...video,
      label: `${QUALITY_LABELS[index] ?? video.height}p`
    }));
    return {
      videoId,
      hasAudio,
      audioAvailability,
      videoList,
      audioList
    };
  }
  async function downloadBestVideo(videoId) {
    const resources = await getVideoResources(videoId);
    const bestVideo = resources.videoList[resources.videoList.length - 1];
    if (!bestVideo) {
      console.error("[downloadBestVideo] no video found");
      throw new DownloadError("NO_VIDEO", "No video found");
    }
    const bestAudio = resources.hasAudio && resources.audioList.length > 0 ? resources.audioList.reduce(
      (a2, b) => a2.bandwidth > b.bandwidth ? a2 : b
    ) : null;
    const filename = `${videoId}.mp4`;
    const response = await chrome.runtime.sendMessage({
      action: "mergeAndDownload",
      payload: {
        videoUrl: bestVideo.baseUrl,
        audioUrl: bestAudio?.baseUrl ?? null,
        filename
      }
    });
    if (response?.error) {
      console.error("[downloadBestVideo] error from response:", response.error);
      throw downloadErrorFromResponse(response);
    }
  }
  function getExtensionReviewUrl() {
    return `https://chromewebstore.google.com/detail/${chrome.runtime.id}/reviews`;
  }
  function ReviewModal({
    onRate,
    onDismiss
  }) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-6 right-6 z-[2147483647] w-[300px] rounded-xl border border-[#e4e6eb] bg-white p-5 font-sans text-sm text-[#1c1e21] shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-0.5 text-[15px] font-bold", children: chrome.i18n.getMessage("extensionName") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[13px] text-[#65676b]", children: "Enjoying the extension?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 leading-relaxed text-[#65676b]", children: [
        "Leave a 5-star review to keep using",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: chrome.i18n.getMessage("extensionNameInExt") }),
        " for free!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: getExtensionReviewUrl(),
            target: "_blank",
            rel: "noopener noreferrer",
            onClick: onRate,
            className: "block flex-1 cursor-pointer rounded-lg bg-primary px-3 py-2 text-center text-[13px] font-semibold text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary-600",
            children: "⭐ Rate 5 Stars"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onDismiss,
            className: "flex-1 cursor-pointer rounded-lg border-0 bg-primary-50 px-3 py-2 text-[13px] font-medium text-primary transition-colors duration-150 hover:bg-primary-100",
            children: "Maybe Later"
          }
        )
      ] })
    ] });
  }
  let e = { data: "" }, t = (t2) => {
    if ("object" == typeof window) {
      let e2 = (t2 ? t2.querySelector("#_goober") : window._goober) || Object.assign(document.createElement("style"), { innerHTML: " ", id: "_goober" });
      return e2.nonce = window.__nonce__, e2.parentNode || (t2 || document.head).appendChild(e2), e2.firstChild;
    }
    return t2 || e;
  }, a = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g, l$1 = /\/\*[^]*?\*\/|  +/g, n$1 = /\n+/g, o$1 = (e2, t2) => {
    let r = "", a2 = "", l2 = "";
    for (let n2 in e2) {
      let c2 = e2[n2];
      "@" == n2[0] ? "i" == n2[1] ? r = n2 + " " + c2 + ";" : a2 += "f" == n2[1] ? o$1(c2, n2) : n2 + "{" + o$1(c2, "k" == n2[1] ? "" : t2) + "}" : "object" == typeof c2 ? a2 += o$1(c2, t2 ? t2.replace(/([^,])+/g, (e3) => n2.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t3) => /&/.test(t3) ? t3.replace(/&/g, e3) : e3 ? e3 + " " + t3 : t3)) : n2) : null != c2 && (n2 = "-" == n2[1] ? n2 : n2.replace(/[A-Z]/g, "-$&").toLowerCase(), l2 += o$1.p ? o$1.p(n2, c2) : n2 + ":" + c2 + ";");
    }
    return r + (t2 && l2 ? t2 + "{" + l2 + "}" : l2) + a2;
  }, c = {}, i = (e2) => {
    if ("object" == typeof e2) {
      let t2 = "";
      for (let r in e2) t2 += r + i(e2[r]);
      return t2;
    }
    return e2;
  }, s = (e2, t2, r, s2, p2) => {
    let u2 = i(e2), d2 = c[u2] || (c[u2] = ((e3) => {
      let t3 = 0, r2 = 11;
      for (; t3 < e3.length; ) r2 = 101 * r2 + e3.charCodeAt(t3++) >>> 0;
      return "go" + r2;
    })(u2));
    if (!c[d2]) {
      let t3 = u2 !== e2 ? e2 : ((e3) => {
        let t4, r2, o2 = [{}];
        for (; t4 = a.exec(e3.replace(l$1, "")); ) t4[4] ? o2.shift() : t4[3] ? (r2 = t4[3].replace(n$1, " ").trim(), o2.unshift(o2[0][r2] = o2[0][r2] || {})) : o2[0][t4[1]] = t4[2].replace(n$1, " ").trim();
        return o2[0];
      })(e2);
      c[d2] = o$1(p2 ? { ["@keyframes " + d2]: t3 } : t3, r ? "" : "." + d2);
    }
    let f2 = r && c.g;
    return r && (c.g = c[d2]), ((e3, t3, r2, a2) => {
      a2 ? t3.data = t3.data.replace(a2, e3) : -1 === t3.data.indexOf(e3) && (t3.data = r2 ? e3 + t3.data : t3.data + e3);
    })(c[d2], t2, s2, f2), d2;
  }, p = (e2, t2, r) => e2.reduce((e3, a2, l2) => {
    let n2 = t2[l2];
    if (n2 && n2.call) {
      let e4 = n2(r), t3 = e4 && e4.props && e4.props.className || /^go/.test(e4) && e4;
      n2 = t3 ? "." + t3 : e4 && "object" == typeof e4 ? e4.props ? "" : o$1(e4, "") : false === e4 ? "" : e4;
    }
    return e3 + a2 + (null == n2 ? "" : n2);
  }, "");
  function u(e2) {
    let r = this || {}, a2 = e2.call ? e2(r.p) : e2;
    return s(a2.unshift ? a2.raw ? p(a2, [].slice.call(arguments, 1), r.p) : a2.reduce((e3, t2) => Object.assign(e3, t2 && t2.call ? t2(r.p) : t2), {}) : a2, t(r.target), r.g, r.o, r.k);
  }
  let d, f$1, g$1;
  u.bind({ g: 1 });
  let h$1 = u.bind({ k: 1 });
  function m(e2, t2, r, a2) {
    o$1.p = t2, d = e2, f$1 = r, g$1 = a2;
  }
  function w$1(e2, t2) {
    let r = this || {};
    return function() {
      let a2 = arguments;
      function l2(n2, o2) {
        let c2 = Object.assign({}, n2), i2 = c2.className || l2.className;
        r.p = Object.assign({ theme: f$1 && f$1() }, c2), r.o = /go\d/.test(i2), c2.className = u.apply(r, a2) + (i2 ? " " + i2 : "");
        let s2 = e2;
        return e2[0] && (s2 = c2.as || e2, delete c2.as), g$1 && s2[0] && g$1(c2), d(s2, c2);
      }
      return l2;
    };
  }
  var Z = (e2) => typeof e2 == "function", h = (e2, t2) => Z(e2) ? e2(t2) : e2;
  var W = /* @__PURE__ */ (() => {
    let e2 = 0;
    return () => (++e2).toString();
  })(), E = /* @__PURE__ */ (() => {
    let e2;
    return () => {
      if (e2 === void 0 && typeof window < "u") {
        let t2 = matchMedia("(prefers-reduced-motion: reduce)");
        e2 = !t2 || t2.matches;
      }
      return e2;
    };
  })();
  var re = 20, k = "default";
  var H = (e2, t2) => {
    let { toastLimit: o2 } = e2.settings;
    switch (t2.type) {
      case 0:
        return { ...e2, toasts: [t2.toast, ...e2.toasts].slice(0, o2) };
      case 1:
        return { ...e2, toasts: e2.toasts.map((r) => r.id === t2.toast.id ? { ...r, ...t2.toast } : r) };
      case 2:
        let { toast: s2 } = t2;
        return H(e2, { type: e2.toasts.find((r) => r.id === s2.id) ? 1 : 0, toast: s2 });
      case 3:
        let { toastId: a2 } = t2;
        return { ...e2, toasts: e2.toasts.map((r) => r.id === a2 || a2 === void 0 ? { ...r, dismissed: true, visible: false } : r) };
      case 4:
        return t2.toastId === void 0 ? { ...e2, toasts: [] } : { ...e2, toasts: e2.toasts.filter((r) => r.id !== t2.toastId) };
      case 5:
        return { ...e2, pausedAt: t2.time };
      case 6:
        let i2 = t2.time - (e2.pausedAt || 0);
        return { ...e2, pausedAt: void 0, toasts: e2.toasts.map((r) => ({ ...r, pauseDuration: r.pauseDuration + i2 })) };
    }
  }, v = [], j = { toasts: [], pausedAt: void 0, settings: { toastLimit: re } }, f = {}, Y = (e2, t2 = k) => {
    f[t2] = H(f[t2] || j, e2), v.forEach(([o2, s2]) => {
      o2 === t2 && s2(f[t2]);
    });
  }, _ = (e2) => Object.keys(f).forEach((t2) => Y(e2, t2)), Q = (e2) => Object.keys(f).find((t2) => f[t2].toasts.some((o2) => o2.id === e2)), S = (e2 = k) => (t2) => {
    Y(t2, e2);
  }, se = { blank: 4e3, error: 4e3, success: 2e3, loading: 1 / 0, custom: 4e3 }, V = (e2 = {}, t2 = k) => {
    let [o2, s2] = reactExports.useState(f[t2] || j), a2 = reactExports.useRef(f[t2]);
    reactExports.useEffect(() => (a2.current !== f[t2] && s2(f[t2]), v.push([t2, s2]), () => {
      let r = v.findIndex(([l2]) => l2 === t2);
      r > -1 && v.splice(r, 1);
    }), [t2]);
    let i2 = o2.toasts.map((r) => {
      var l2, g2, T;
      return { ...e2, ...e2[r.type], ...r, removeDelay: r.removeDelay || ((l2 = e2[r.type]) == null ? void 0 : l2.removeDelay) || (e2 == null ? void 0 : e2.removeDelay), duration: r.duration || ((g2 = e2[r.type]) == null ? void 0 : g2.duration) || (e2 == null ? void 0 : e2.duration) || se[r.type], style: { ...e2.style, ...(T = e2[r.type]) == null ? void 0 : T.style, ...r.style } };
    });
    return { ...o2, toasts: i2 };
  };
  var ie = (e2, t2 = "blank", o2) => ({ createdAt: Date.now(), visible: true, dismissed: false, type: t2, ariaProps: { role: "status", "aria-live": "polite" }, message: e2, pauseDuration: 0, ...o2, id: (o2 == null ? void 0 : o2.id) || W() }), P = (e2) => (t2, o2) => {
    let s2 = ie(t2, e2, o2);
    return S(s2.toasterId || Q(s2.id))({ type: 2, toast: s2 }), s2.id;
  }, n = (e2, t2) => P("blank")(e2, t2);
  n.error = P("error");
  n.success = P("success");
  n.loading = P("loading");
  n.custom = P("custom");
  n.dismiss = (e2, t2) => {
    let o2 = { type: 3, toastId: e2 };
    t2 ? S(t2)(o2) : _(o2);
  };
  n.dismissAll = (e2) => n.dismiss(void 0, e2);
  n.remove = (e2, t2) => {
    let o2 = { type: 4, toastId: e2 };
    t2 ? S(t2)(o2) : _(o2);
  };
  n.removeAll = (e2) => n.remove(void 0, e2);
  n.promise = (e2, t2, o2) => {
    let s2 = n.loading(t2.loading, { ...o2, ...o2 == null ? void 0 : o2.loading });
    return typeof e2 == "function" && (e2 = e2()), e2.then((a2) => {
      let i2 = t2.success ? h(t2.success, a2) : void 0;
      return i2 ? n.success(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.success }) : n.dismiss(s2), a2;
    }).catch((a2) => {
      let i2 = t2.error ? h(t2.error, a2) : void 0;
      i2 ? n.error(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.error }) : n.dismiss(s2);
    }), e2;
  };
  var ce = 1e3, w = (e2, t2 = "default") => {
    let { toasts: o2, pausedAt: s2 } = V(e2, t2), a2 = reactExports.useRef(/* @__PURE__ */ new Map()).current, i2 = reactExports.useCallback((c2, m2 = ce) => {
      if (a2.has(c2)) return;
      let p2 = setTimeout(() => {
        a2.delete(c2), r({ type: 4, toastId: c2 });
      }, m2);
      a2.set(c2, p2);
    }, []);
    reactExports.useEffect(() => {
      if (s2) return;
      let c2 = Date.now(), m2 = o2.map((p2) => {
        if (p2.duration === 1 / 0) return;
        let R = (p2.duration || 0) + p2.pauseDuration - (c2 - p2.createdAt);
        if (R < 0) {
          p2.visible && n.dismiss(p2.id);
          return;
        }
        return setTimeout(() => n.dismiss(p2.id, t2), R);
      });
      return () => {
        m2.forEach((p2) => p2 && clearTimeout(p2));
      };
    }, [o2, s2, t2]);
    let r = reactExports.useCallback(S(t2), [t2]), l2 = reactExports.useCallback(() => {
      r({ type: 5, time: Date.now() });
    }, [r]), g2 = reactExports.useCallback((c2, m2) => {
      r({ type: 1, toast: { id: c2, height: m2 } });
    }, [r]), T = reactExports.useCallback(() => {
      s2 && r({ type: 6, time: Date.now() });
    }, [s2, r]), d2 = reactExports.useCallback((c2, m2) => {
      let { reverseOrder: p2 = false, gutter: R = 8, defaultPosition: z } = m2 || {}, O = o2.filter((u2) => (u2.position || z) === (c2.position || z) && u2.height), K = O.findIndex((u2) => u2.id === c2.id), B = O.filter((u2, I) => I < K && u2.visible).length;
      return O.filter((u2) => u2.visible).slice(...p2 ? [B + 1] : [0, B]).reduce((u2, I) => u2 + (I.height || 0) + R, 0);
    }, [o2]);
    return reactExports.useEffect(() => {
      o2.forEach((c2) => {
        if (c2.dismissed) i2(c2.id, c2.removeDelay);
        else {
          let m2 = a2.get(c2.id);
          m2 && (clearTimeout(m2), a2.delete(c2.id));
        }
      });
    }, [o2, i2]), { toasts: o2, handlers: { updateHeight: g2, startPause: l2, endPause: T, calculateOffset: d2 } };
  };
  var de = h$1`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`, me = h$1`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`, le = h$1`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`, C = w$1("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${de} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${me} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${(e2) => e2.secondary || "#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${le} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`;
  var Te = h$1`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`, F = w$1("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${(e2) => e2.secondary || "#e0e0e0"};
  border-right-color: ${(e2) => e2.primary || "#616161"};
  animation: ${Te} 1s linear infinite;
`;
  var ge = h$1`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`, he = h$1`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`, L = w$1("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ge} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${he} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${(e2) => e2.secondary || "#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`;
  var be = w$1("div")`
  position: absolute;
`, Se = w$1("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`, Ae = h$1`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`, Pe = w$1("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ae} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`, $ = ({ toast: e2 }) => {
    let { icon: t2, type: o2, iconTheme: s2 } = e2;
    return t2 !== void 0 ? typeof t2 == "string" ? reactExports.createElement(Pe, null, t2) : t2 : o2 === "blank" ? null : reactExports.createElement(Se, null, reactExports.createElement(F, { ...s2 }), o2 !== "loading" && reactExports.createElement(be, null, o2 === "error" ? reactExports.createElement(C, { ...s2 }) : reactExports.createElement(L, { ...s2 })));
  };
  var Re = (e2) => `
0% {transform: translate3d(0,${e2 * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`, Ee = (e2) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e2 * -150}%,-1px) scale(.6); opacity:0;}
`, ve = "0%{opacity:0;} 100%{opacity:1;}", De = "0%{opacity:1;} 100%{opacity:0;}", Oe = w$1("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`, Ie = w$1("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`, ke = (e2, t2) => {
    let s2 = e2.includes("top") ? 1 : -1, [a2, i2] = E() ? [ve, De] : [Re(s2), Ee(s2)];
    return { animation: t2 ? `${h$1(a2)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards` : `${h$1(i2)} 0.4s forwards cubic-bezier(.06,.71,.55,1)` };
  }, N = reactExports.memo(({ toast: e2, position: t2, style: o2, children: s2 }) => {
    let a2 = e2.height ? ke(e2.position || t2 || "top-center", e2.visible) : { opacity: 0 }, i2 = reactExports.createElement($, { toast: e2 }), r = reactExports.createElement(Ie, { ...e2.ariaProps }, h(e2.message, e2));
    return reactExports.createElement(Oe, { className: e2.className, style: { ...a2, ...o2, ...e2.style } }, typeof s2 == "function" ? s2({ icon: i2, message: r }) : reactExports.createElement(reactExports.Fragment, null, i2, r));
  });
  m(reactExports.createElement);
  var we = ({ id: e2, className: t2, style: o2, onHeightUpdate: s2, children: a2 }) => {
    let i2 = reactExports.useCallback((r) => {
      if (r) {
        let l2 = () => {
          let g2 = r.getBoundingClientRect().height;
          s2(e2, g2);
        };
        l2(), new MutationObserver(l2).observe(r, { subtree: true, childList: true, characterData: true });
      }
    }, [e2, s2]);
    return reactExports.createElement("div", { ref: i2, className: t2, style: o2 }, a2);
  }, Me = (e2, t2) => {
    let o2 = e2.includes("top"), s2 = o2 ? { top: 0 } : { bottom: 0 }, a2 = e2.includes("center") ? { justifyContent: "center" } : e2.includes("right") ? { justifyContent: "flex-end" } : {};
    return { left: 0, right: 0, display: "flex", position: "absolute", transition: E() ? void 0 : "all 230ms cubic-bezier(.21,1.02,.73,1)", transform: `translateY(${t2 * (o2 ? 1 : -1)}px)`, ...s2, ...a2 };
  }, Ce = u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`, D = 16, Fe = ({ reverseOrder: e2, position: t2 = "top-center", toastOptions: o2, gutter: s2, children: a2, toasterId: i2, containerStyle: r, containerClassName: l2 }) => {
    let { toasts: g2, handlers: T } = w(o2, i2);
    return reactExports.createElement("div", { "data-rht-toaster": i2 || "", style: { position: "fixed", zIndex: 9999, top: D, left: D, right: D, bottom: D, pointerEvents: "none", ...r }, className: l2, onMouseEnter: T.startPause, onMouseLeave: T.endPause }, g2.map((d2) => {
      let c2 = d2.position || t2, m2 = T.calculateOffset(d2, { reverseOrder: e2, gutter: s2, defaultPosition: t2 }), p2 = Me(c2, m2);
      return reactExports.createElement(we, { id: d2.id, key: d2.id, onHeightUpdate: T.updateHeight, className: d2.visible ? Ce : "", style: p2 }, d2.type === "custom" ? h(d2.message, d2) : a2 ? a2(d2) : reactExports.createElement(N, { toast: d2, position: c2 }));
    }));
  };
  var zt = n;
  const TOAST_ID = "fb-download-error";
  function showDownloadError(message) {
    zt.error(message, { id: TOAST_ID, duration: 4500 });
  }
  function DownloadToaster() {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Fe, { position: "bottom-center", containerStyle: { zIndex: 2147483647 } });
  }
  const DOWNLOAD_COUNT_KEY = "fbdl_download_count";
  const REVIEW_PROMPTED_KEY = "fbdl_review_prompted";
  async function trackDownloadClick() {
    const result2 = await chrome.storage.local.get([
      DOWNLOAD_COUNT_KEY,
      REVIEW_PROMPTED_KEY
    ]);
    const count = (result2[DOWNLOAD_COUNT_KEY] ?? 0) + 1;
    const alreadyPrompted = result2[REVIEW_PROMPTED_KEY] ?? false;
    await chrome.storage.local.set({ [DOWNLOAD_COUNT_KEY]: count });
    return count === 2 && !alreadyPrompted;
  }
  function markReviewPrompted() {
    chrome.storage.local.set({ [REVIEW_PROMPTED_KEY]: true });
  }
  function FloatingVideoDownloader({
    anchorElement,
    videoUrlSelector
  }) {
    const [downloading, setDownloading] = reactExports.useState(false);
    const [fakeProgress, setFakeProgress] = reactExports.useState(0);
    const [hovered, setHovered] = reactExports.useState(false);
    const [hasBackdrop, setHasBackdrop] = reactExports.useState(false);
    const [showModal, setShowModal] = reactExports.useState(false);
    reactExports.useEffect(() => {
      const onEnter = () => setHovered(true);
      const onLeave = () => setHovered(false);
      anchorElement.addEventListener("mouseenter", onEnter);
      anchorElement.addEventListener("mouseleave", onLeave);
      const onFullscreenChange = () => {
        const fsEl = document.fullscreenElement;
        setHasBackdrop(
          !!fsEl && (fsEl === anchorElement || anchorElement.contains(fsEl) || fsEl.contains(anchorElement))
        );
      };
      document.addEventListener("fullscreenchange", onFullscreenChange);
      return () => {
        anchorElement.removeEventListener("mouseenter", onEnter);
        anchorElement.removeEventListener("mouseleave", onLeave);
        document.removeEventListener("fullscreenchange", onFullscreenChange);
      };
    }, [anchorElement]);
    reactExports.useEffect(() => {
      if (!downloading) {
        setFakeProgress(0);
        return;
      }
      const id = setInterval(() => {
        setFakeProgress((p2) => p2 >= 95 ? 95 : p2 + Math.random() * 12 + 3);
      }, 300);
      return () => clearInterval(id);
    }, [downloading]);
    const handleDownload = reactExports.useCallback(async () => {
      if (downloading) return;
      if (!videoUrlSelector) {
        console.warn("[FloatingDL] videoUrlSelector not provided");
        showDownloadError(getStageMessage("NO_VIDEO_ID"));
        return;
      }
      const linkEl = anchorElement.querySelector(videoUrlSelector);
      if (!linkEl?.href) {
        console.warn("[FloatingDL] videoUrlSelector element or href not found");
        showDownloadError(getStageMessage("NO_VIDEO_ID"));
        return;
      }
      const videoId = extractVideoIdFromUrl(linkEl.href);
      if (!videoId) {
        console.warn("[FloatingDL] videoId not found from", linkEl.href);
        showDownloadError(getStageMessage("NO_VIDEO_ID"));
        return;
      }
      const shouldShowModal = await trackDownloadClick();
      if (shouldShowModal) setShowModal(true);
      setDownloading(true);
      try {
        await downloadBestVideo(videoId);
      } catch (err) {
        const e2 = toDownloadError(err);
        console.error("[FloatingDL] download failed:", e2);
        showDownloadError(getStageMessage(e2.stage));
      } finally {
        setDownloading(false);
      }
    }, [anchorElement, videoUrlSelector, downloading]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      !hasBackdrop && hovered && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          "aria-label": "FloatingDL downloader",
          className: classnames(
            "absolute top-2 right-2 z-[2147483647]",
            "flex h-[38px] w-[38px] items-center justify-center",
            "cursor-pointer rounded-full border-0 p-0",
            "bg-primary/95 shadow-[0_6px_18px_rgba(0,0,0,0.28)]",
            "transition hover:scale-105 hover:bg-primary active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          ),
          disabled: downloading,
          title: downloading ? `${Math.round(fakeProgress)}%` : "Download video",
          type: "button",
          onClick: handleDownload,
          children: downloading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-bold leading-none text-white pointer-events-none", children: [
            Math.round(fakeProgress),
            "%"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              className: "pointer-events-none text-white",
              icon: "lucide:download",
              width: 20
            }
          )
        }
      ),
      showModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReviewModal,
        {
          onRate: () => {
            markReviewPrompted();
            setShowModal(false);
          },
          onDismiss: () => {
            markReviewPrompted();
            setShowModal(false);
          }
        }
      )
    ] });
  }
  const processFunction = (function_, options, proxy, unwrapped) => function(...arguments_) {
    const P2 = options.promiseModule;
    return new P2((resolve, reject) => {
      if (options.multiArgs) {
        arguments_.push((...result2) => {
          if (options.errorFirst) {
            if (result2[0]) {
              reject(result2);
            } else {
              result2.shift();
              resolve(result2);
            }
          } else {
            resolve(result2);
          }
        });
      } else if (options.errorFirst) {
        arguments_.push((error, result2) => {
          if (error) {
            reject(error);
          } else {
            resolve(result2);
          }
        });
      } else {
        arguments_.push(resolve);
      }
      const self = this === proxy ? unwrapped : this;
      Reflect.apply(function_, self, arguments_);
    });
  };
  const filterCache = /* @__PURE__ */ new WeakMap();
  function pify(input, options) {
    options = {
      exclude: [/.+(?:Sync|Stream)$/],
      errorFirst: true,
      promiseModule: Promise,
      ...options
    };
    const objectType = typeof input;
    if (!(input !== null && (objectType === "object" || objectType === "function"))) {
      throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${input === null ? "null" : objectType}\``);
    }
    const filter = (target, key) => {
      let cached = filterCache.get(target);
      if (!cached) {
        cached = {};
        filterCache.set(target, cached);
      }
      if (key in cached) {
        return cached[key];
      }
      const match = (pattern) => typeof pattern === "string" || typeof key === "symbol" ? key === pattern : pattern.test(key);
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
      const writableOrConfigurableOwn = descriptor === void 0 || descriptor.writable || descriptor.configurable;
      const included = options.include ? options.include.some((element) => match(element)) : !options.exclude.some((element) => match(element));
      const shouldFilter = included && writableOrConfigurableOwn;
      cached[key] = shouldFilter;
      return shouldFilter;
    };
    const cache = /* @__PURE__ */ new WeakMap();
    const proxy = new Proxy(input, {
      apply(target, thisArg, args) {
        const cached = cache.get(target);
        if (cached) {
          return Reflect.apply(cached, thisArg, args);
        }
        const pified = options.excludeMain ? target : processFunction(target, options, proxy, target);
        cache.set(target, pified);
        return Reflect.apply(pified, thisArg, args);
      },
      get(target, key) {
        const property = target[key];
        if (!filter(target, key) || property === Function.prototype[key]) {
          return property;
        }
        const cached = cache.get(property);
        if (cached) {
          return cached;
        }
        if (typeof property === "function") {
          const pified = processFunction(property, options, proxy, target);
          cache.set(property, pified);
          return pified;
        }
        return property;
      }
    });
    return proxy;
  }
  var l = () => {
    try {
      let e2 = (globalThis.navigator?.userAgent).match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if (e2[1] === "Chrome") return parseInt(e2[2]) < 100 || globalThis.chrome.runtime?.getManifest()?.manifest_version === 2;
    } catch {
      return false;
    }
    return false;
  };
  var o = class {
    #r;
    #t;
    get primaryClient() {
      return this.#t;
    }
    #e;
    get secondaryClient() {
      return this.#e;
    }
    #a;
    get area() {
      return this.#a;
    }
    get hasWebApi() {
      try {
        return typeof window < "u" && !!window.localStorage;
      } catch (e2) {
        return console.error(e2), false;
      }
    }
    #s = /* @__PURE__ */ new Map();
    #i;
    get copiedKeySet() {
      return this.#i;
    }
    isCopied = (e2) => this.hasWebApi && (this.allCopied || this.copiedKeySet.has(e2));
    #n = false;
    get allCopied() {
      return this.#n;
    }
    getExtStorageApi = () => globalThis.browser?.storage || globalThis.chrome?.storage;
    get hasExtensionApi() {
      try {
        return !!this.getExtStorageApi();
      } catch (e2) {
        return console.error(e2), false;
      }
    }
    isWatchSupported = () => this.hasExtensionApi;
    keyNamespace = "";
    isValidKey = (e2) => e2.startsWith(this.keyNamespace);
    getNamespacedKey = (e2) => `${this.keyNamespace}${e2}`;
    getUnnamespacedKey = (e2) => e2.slice(this.keyNamespace.length);
    serde = { serializer: JSON.stringify, deserializer: JSON.parse };
    constructor({ area: e2 = "sync", allCopied: t2 = false, copiedKeyList: s2 = [], serde: r = {} } = {}) {
      this.setCopiedKeySet(s2), this.#a = e2, this.#n = t2, this.serde = { ...this.serde, ...r };
      try {
        this.hasWebApi && (t2 || s2.length > 0) && (this.#e = window.localStorage);
      } catch {
      }
      try {
        this.hasExtensionApi && (this.#r = this.getExtStorageApi(), l() ? this.#t = pify(this.#r[this.area], { exclude: ["getBytesInUse"], errorFirst: false }) : this.#t = this.#r[this.area]);
      } catch {
      }
    }
    setCopiedKeySet(e2) {
      this.#i = new Set(e2);
    }
    rawGetAll = () => this.#t?.get();
    getAll = async () => {
      let e2 = await this.rawGetAll();
      return Object.entries(e2).filter(([t2]) => this.isValidKey(t2)).reduce((t2, [s2, r]) => (t2[this.getUnnamespacedKey(s2)] = r, t2), {});
    };
    copy = async (e2) => {
      let t2 = e2 === void 0;
      if (!t2 && !this.copiedKeySet.has(e2) || !this.allCopied || !this.hasExtensionApi) return false;
      let s2 = this.allCopied ? await this.rawGetAll() : await this.#t.get((t2 ? [...this.copiedKeySet] : [e2]).map(this.getNamespacedKey));
      if (!s2) return false;
      let r = false;
      for (let a2 in s2) {
        let i2 = s2[a2], n2 = this.#e?.getItem(a2);
        this.#e?.setItem(a2, i2), r ||= i2 !== n2;
      }
      return r;
    };
    rawGet = async (e2) => (await this.rawGetMany([e2]))[e2];
    rawGetMany = async (e2) => this.hasExtensionApi ? await this.#t.get(e2) : e2.filter(this.isCopied).reduce((t2, s2) => (t2[s2] = this.#e?.getItem(s2), t2), {});
    rawSet = async (e2, t2) => await this.rawSetMany({ [e2]: t2 });
    rawSetMany = async (e2) => (this.#e && Object.entries(e2).filter(([t2]) => this.isCopied(t2)).forEach(([t2, s2]) => this.#e.setItem(t2, s2)), this.hasExtensionApi && await this.#t.set(e2), null);
    clear = async (e2 = false) => {
      e2 && this.#e?.clear(), await this.#t.clear();
    };
    rawRemove = async (e2) => {
      await this.rawRemoveMany([e2]);
    };
    rawRemoveMany = async (e2) => {
      this.#e && e2.filter(this.isCopied).forEach((t2) => this.#e.removeItem(t2)), this.hasExtensionApi && await this.#t.remove(e2);
    };
    removeAll = async () => {
      let e2 = await this.getAll(), t2 = Object.keys(e2);
      await this.removeMany(t2);
    };
    watch = (e2) => {
      let t2 = this.isWatchSupported();
      return t2 && this.#o(e2), t2;
    };
    #o = (e2) => {
      for (let t2 in e2) {
        let s2 = this.getNamespacedKey(t2), r = this.#s.get(s2)?.callbackSet || /* @__PURE__ */ new Set();
        if (r.add(e2[t2]), r.size > 1) continue;
        let a2 = (i2, n2) => {
          if (n2 !== this.area || !i2[s2]) return;
          let h2 = this.#s.get(s2);
          if (!h2) throw new Error(`Storage comms does not exist for nsKey: ${s2}`);
          Promise.all([this.parseValue(i2[s2].newValue), this.parseValue(i2[s2].oldValue)]).then(([y, d2]) => {
            for (let p2 of h2.callbackSet) p2({ newValue: y, oldValue: d2 }, n2);
          });
        };
        this.#r.onChanged.addListener(a2), this.#s.set(s2, { callbackSet: r, listener: a2 });
      }
    };
    unwatch = (e2) => {
      let t2 = this.isWatchSupported();
      return t2 && this.#c(e2), t2;
    };
    #c(e2) {
      for (let t2 in e2) {
        let s2 = this.getNamespacedKey(t2), r = e2[t2], a2 = this.#s.get(s2);
        a2 && (a2.callbackSet.delete(r), a2.callbackSet.size === 0 && (this.#s.delete(s2), this.#r.onChanged.removeListener(a2.listener)));
      }
    }
    unwatchAll = () => this.#h();
    #h() {
      this.#s.forEach(({ listener: e2 }) => this.#r.onChanged.removeListener(e2)), this.#s.clear();
    }
    async getItem(e2) {
      return this.get(e2);
    }
    async getItems(e2) {
      return await this.getMany(e2);
    }
    async setItem(e2, t2) {
      await this.set(e2, t2);
    }
    async setItems(e2) {
      await await this.setMany(e2);
    }
    async removeItem(e2) {
      return this.remove(e2);
    }
    async removeItems(e2) {
      return await this.removeMany(e2);
    }
  }, g = class extends o {
    get = async (e2) => {
      let t2 = this.getNamespacedKey(e2), s2 = await this.rawGet(t2);
      return this.parseValue(s2);
    };
    getMany = async (e2) => {
      let t2 = e2.map(this.getNamespacedKey), s2 = await this.rawGetMany(t2), r = await Promise.all(Object.values(s2).map(this.parseValue));
      return Object.keys(s2).reduce((a2, i2, n2) => (a2[this.getUnnamespacedKey(i2)] = r[n2], a2), {});
    };
    set = async (e2, t2) => {
      let s2 = this.getNamespacedKey(e2), r = this.serde.serializer(t2);
      return this.rawSet(s2, r);
    };
    setMany = async (e2) => {
      let t2 = Object.entries(e2).reduce((s2, [r, a2]) => (s2[this.getNamespacedKey(r)] = this.serde.serializer(a2), s2), {});
      return await this.rawSetMany(t2);
    };
    remove = async (e2) => {
      let t2 = this.getNamespacedKey(e2);
      return this.rawRemove(t2);
    };
    removeMany = async (e2) => {
      let t2 = e2.map(this.getNamespacedKey);
      return await this.rawRemoveMany(t2);
    };
    setNamespace = (e2) => {
      this.keyNamespace = e2;
    };
    parseValue = async (e2) => {
      try {
        if (e2 !== void 0) return this.serde.deserializer(e2);
      } catch (t2) {
        console.error(t2);
      }
    };
  };
  const storage = new g({ area: "local" });
  const LOCAL_SELECTORS = {
    post: {
      selector: "div.x5yr21d.x10l6tqk.x13vifvy.xh8yej3",
      insertPosition: "beforeend"
    },
    reels: {
      selector: `div[role="main"]  div.x9f619.x78zum5.xdt5ytf.x2lah0s.xwib8y2`,
      insertPosition: "afterbegin"
    },
    watch: {
      selector: "._6x84 .xh8yej3 div.x5yr21d.x10l6tqk.x13vifvy.xh8yej3",
      videoUrlSelector: `span.xi81zsa a.xggy1nq[href*="watch"], span.xi81zsa a.xggy1nq[href*="reel"]`,
      parentSelector: "div.x78zum5.xdt5ytf.x1huibft.x1n6yrxt, div.x1jx94hy.x1obq294.x5a5i1n.xde0f50.x15x8krk.x78zum5.x6ikm8r.x10wlt62.x1n2onr6.xzueoph",
      insertPosition: "beforeend"
    },
    floating: {
      selector: "div.x1n2onr6.xh8yej3.xt7dq6l > div.x5yr21d.x10l6tqk.x13vifvy.xh8yej3",
      videoUrlSelector: "span.xuk3077.x78zum5.x14atkfc > a",
      insertPosition: "beforeend"
    }
  };
  async function getSelectorConfig(type) {
    {
      try {
        const customConfig = await storage.get(
          "customConfig"
        );
        const selectors = customConfig?.selectors || void 0;
        const remote = selectors?.[type];
        if (remote) {
          return remote;
        }
      } catch (error) {
      }
    }
    return LOCAL_SELECTORS[type];
  }
  function mapInsertPosition(pos) {
    switch (pos) {
      case "beforebegin":
        return "before";
      case "afterbegin":
        return "first";
      case "beforeend":
        return "last";
      case "afterend":
        return "after";
    }
  }
  let root = null;
  function mountDownloadToaster(ctx) {
    if (root) return;
    const host = document.createElement("div");
    host.className = "fb-download-toaster";
    document.body.appendChild(host);
    root = ReactDOM.createRoot(host);
    root.render(React.createElement(DownloadToaster));
    ctx.onInvalidated(() => {
      root?.unmount();
      root = null;
      host.remove();
    });
  }
  const definition = defineContentScript({
    matches: ["https://www.facebook.com/*"],
    cssInjectionMode: "ui",
    async main(ctx) {
      void mountDownloadToaster(ctx);
      let mounted = false;
      let ui = null;
      let anchorEl = null;
      const tryMount = async () => {
        if (mounted) {
          if (anchorEl && !document.contains(anchorEl)) {
            ui?.remove();
            ui = null;
            anchorEl = null;
            mounted = false;
          } else {
            return;
          }
        }
        const { selector, insertPosition, videoUrlSelector } = await getSelectorConfig("floating");
        if (!selector) return;
        const element = document.querySelector(selector);
        if (!element) return;
        mounted = true;
        anchorEl = element;
        ui = await createShadowRootUi(ctx, {
          name: "floating-downloader",
          position: "inline",
          anchor: element,
          append: mapInsertPosition(insertPosition),
          onMount(container) {
            const root2 = ReactDOM.createRoot(container);
            root2.render(
              React.createElement(FloatingVideoDownloader, {
                anchorElement: element,
                videoUrlSelector
              })
            );
            return root2;
          },
          onRemove(root2) {
            root2?.unmount();
          }
        });
        ui.mount();
      };
      await tryMount();
      const interval = setInterval(tryMount, 1e3);
      ctx.onInvalidated(() => {
        clearInterval(interval);
        if (ui) ui.remove();
      });
    }
  });
  var WxtLocationChangeEvent = class WxtLocationChangeEvent2 extends Event {
    static EVENT_NAME = getUniqueEventName("wxt:locationchange");
    constructor(newUrl, oldUrl) {
      super(WxtLocationChangeEvent2.EVENT_NAME, {});
      this.newUrl = newUrl;
      this.oldUrl = oldUrl;
    }
  };
  function getUniqueEventName(eventName) {
    return `${browser?.runtime?.id}:${"floating"}:${eventName}`;
  }
  function createLocationWatcher(ctx) {
    let interval;
    let oldUrl;
    return { run() {
      if (interval != null) return;
      oldUrl = new URL(location.href);
      interval = ctx.setInterval(() => {
        let newUrl = new URL(location.href);
        if (newUrl.href !== oldUrl.href) {
          window.dispatchEvent(new WxtLocationChangeEvent(newUrl, oldUrl));
          oldUrl = newUrl;
        }
      }, 1e3);
    } };
  }
  var ContentScriptContext = class ContentScriptContext2 {
    static SCRIPT_STARTED_MESSAGE_TYPE = getUniqueEventName("wxt:content-script-started");
    id;
    abortController;
    locationWatcher = createLocationWatcher(this);
    constructor(contentScriptName, options) {
      this.contentScriptName = contentScriptName;
      this.options = options;
      this.id = Math.random().toString(36).slice(2);
      this.abortController = new AbortController();
      this.stopOldScripts();
      this.listenForNewerScripts();
    }
    get signal() {
      return this.abortController.signal;
    }
    abort(reason) {
      return this.abortController.abort(reason);
    }
    get isInvalid() {
      if (browser.runtime?.id == null) this.notifyInvalidated();
      return this.signal.aborted;
    }
    get isValid() {
      return !this.isInvalid;
    }
    /**
    * Add a listener that is called when the content script's context is invalidated.
    *
    * @returns A function to remove the listener.
    *
    * @example
    * browser.runtime.onMessage.addListener(cb);
    * const removeInvalidatedListener = ctx.onInvalidated(() => {
    *   browser.runtime.onMessage.removeListener(cb);
    * })
    * // ...
    * removeInvalidatedListener();
    */
    onInvalidated(cb) {
      this.signal.addEventListener("abort", cb);
      return () => this.signal.removeEventListener("abort", cb);
    }
    /**
    * Return a promise that never resolves. Useful if you have an async function that shouldn't run
    * after the context is expired.
    *
    * @example
    * const getValueFromStorage = async () => {
    *   if (ctx.isInvalid) return ctx.block();
    *
    *   // ...
    * }
    */
    block() {
      return new Promise(() => {
      });
    }
    /**
    * Wrapper around `window.setInterval` that automatically clears the interval when invalidated.
    *
    * Intervals can be cleared by calling the normal `clearInterval` function.
    */
    setInterval(handler, timeout) {
      const id = setInterval(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearInterval(id));
      return id;
    }
    /**
    * Wrapper around `window.setTimeout` that automatically clears the interval when invalidated.
    *
    * Timeouts can be cleared by calling the normal `setTimeout` function.
    */
    setTimeout(handler, timeout) {
      const id = setTimeout(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearTimeout(id));
      return id;
    }
    /**
    * Wrapper around `window.requestAnimationFrame` that automatically cancels the request when
    * invalidated.
    *
    * Callbacks can be canceled by calling the normal `cancelAnimationFrame` function.
    */
    requestAnimationFrame(callback) {
      const id = requestAnimationFrame((...args) => {
        if (this.isValid) callback(...args);
      });
      this.onInvalidated(() => cancelAnimationFrame(id));
      return id;
    }
    /**
    * Wrapper around `window.requestIdleCallback` that automatically cancels the request when
    * invalidated.
    *
    * Callbacks can be canceled by calling the normal `cancelIdleCallback` function.
    */
    requestIdleCallback(callback, options) {
      const id = requestIdleCallback((...args) => {
        if (!this.signal.aborted) callback(...args);
      }, options);
      this.onInvalidated(() => cancelIdleCallback(id));
      return id;
    }
    addEventListener(target, type, handler, options) {
      if (type === "wxt:locationchange") {
        if (this.isValid) this.locationWatcher.run();
      }
      target.addEventListener?.(type.startsWith("wxt:") ? getUniqueEventName(type) : type, handler, {
        ...options,
        signal: this.signal
      });
    }
    /**
    * @internal
    * Abort the abort controller and execute all `onInvalidated` listeners.
    */
    notifyInvalidated() {
      this.abort("Content script context invalidated");
      logger$1.debug(`Content script "${this.contentScriptName}" context invalidated`);
    }
    stopOldScripts() {
      document.dispatchEvent(new CustomEvent(ContentScriptContext2.SCRIPT_STARTED_MESSAGE_TYPE, { detail: {
        contentScriptName: this.contentScriptName,
        messageId: this.id
      } }));
      window.postMessage({
        type: ContentScriptContext2.SCRIPT_STARTED_MESSAGE_TYPE,
        contentScriptName: this.contentScriptName,
        messageId: this.id
      }, "*");
    }
    verifyScriptStartedEvent(event) {
      const isSameContentScript = event.detail?.contentScriptName === this.contentScriptName;
      const isFromSelf = event.detail?.messageId === this.id;
      return isSameContentScript && !isFromSelf;
    }
    listenForNewerScripts() {
      const cb = (event) => {
        if (!(event instanceof CustomEvent) || !this.verifyScriptStartedEvent(event)) return;
        this.notifyInvalidated();
      };
      document.addEventListener(ContentScriptContext2.SCRIPT_STARTED_MESSAGE_TYPE, cb);
      this.onInvalidated(() => document.removeEventListener(ContentScriptContext2.SCRIPT_STARTED_MESSAGE_TYPE, cb));
    }
  };
  function initPlugins() {
  }
  function print(method, ...args) {
    return;
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  const result = (async () => {
    try {
      initPlugins();
      const { main, ...options } = definition;
      return await main(new ContentScriptContext("floating", options));
    } catch (err) {
      logger.error(`The content script "${"floating"}" crashed on startup!`, err);
      throw err;
    }
  })();
  return result;
})();
floating;