import "./_virtual_wxt-html-plugins-Cyikj0JH.js";
import { r as reactExports, a as React, j as jsxRuntimeExports, R as ReactDOM } from "./client-DziJnt8q.js";
import { h as $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c, i as $cc38e7bd3fc7b213$export$2bb74740c4e19def, j as $8ae05eaa5c114e9c$export$7f54fc3180508a52, k as $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c$1, m as $431fbd86ca7dc216$export$b204af158042fbac, n as $3ef42575df84b30b$export$9d1611c77c2fe928, o as $6a99195332edec8b$export$80f3e147d781571c, p as $e7801be82b4b2a53$export$4debdb1a3f0fa79e, q as $9bf71ea28793e738$export$2d6ec8fc375ceafa, r as tv, v as dataFocusVisibleClasses, w as hiddenInputClasses, x as groupDataFocusVisibleClasses, y as $18f2051aff69b9bf$export$43bb16f9c6d9e3f7, z as $507fabe10e71c6fb$export$8397ddfc504fdb9a, A as $f6c31cce2adf654f$export$45712eceda6fad21, B as $f6c31cce2adf654f$export$45712eceda6fad21$1, D as $3ef42575df84b30b$export$9d1611c77c2fe928$1, E as $458b0a5536c1a7cf$export$40bfa8c7b0832715, F as createContext2, H as useProviderContext, I as $ff5963eb1fccf552$export$e08e3b67e392101e, J as $6179b936705e76d3$export$ae780daf29e6d456, K as $f7dceffc5ad7768b$export$4e328f61c538687f, L as clsx, N as dataAttr, O as mergeRefs, Q as forwardRef, R as $c5a24bc478652b5f$export$5f3398f8733f90e2, S as $c5a24bc478652b5f$export$1005530eda016c13, T as $c5a24bc478652b5f$export$7475b2c64539e4cf, U as $c5a24bc478652b5f$export$fbdeaa6a76694f71, V as $507fabe10e71c6fb$export$98e20ec92f614cfe, W as $ef06256079686ba0$export$f8aeda7b10753fa1$1, X as $ae20dd8cbca75726$export$d6daf82dcd84e87c, Y as $bdb11010cef70236$export$f680877a34711e37, Z as $880e95eb8b93ba9a$export$ecf600387e221c37, _ as $ff5963eb1fccf552$export$e08e3b67e392101e$1, a0 as $507fabe10e71c6fb$export$b9b3dfddab17db27, a1 as $2f04cbc44ee30ce0$export$c826860796309d1b, a2 as $bdb11010cef70236$export$f680877a34711e37$1, a3 as $e6afbd83fe6ebbd2$export$4c014de7c8940b4c$1, a4 as $c87311424ea30a05$export$a11b0059900ceec8, a5 as $ea8dcbcb9ea1b556$export$bdc77b0c0a3a85d6, a6 as useDOMRef, a7 as filterDOMProps, a8 as $7af3f5b51489e0b5$export$253fe78d46329472, a9 as $d496c0a20b6e58ec$export$6c8a5aaad13c9852, aa as $7613b1592d41b092$export$6cd28814d92fa9c9, ab as mapPropsVariants, ac as objectToDeps, G as GenIcon, c as useCommonContext, ad as spinner_default, t as tabs_default, f as tab_item_base_default, d as button_default, C as CommonProvider } from "./iconBase-CZJdRvfA.js";
var safeAriaLabel = (...texts) => {
  let ariaLabel = " ";
  for (const text of texts) {
    if (typeof text === "string" && text.length > 0) {
      ariaLabel = text;
      break;
    }
  }
  return ariaLabel;
};
const $5b160d28a433310d$var$localeSymbol = /* @__PURE__ */ Symbol.for("react-aria.i18n.locale");
const $5b160d28a433310d$var$stringsSymbol = /* @__PURE__ */ Symbol.for("react-aria.i18n.strings");
let $5b160d28a433310d$var$cachedGlobalStrings = void 0;
class $5b160d28a433310d$export$c17fa47878dc55b6 {
  /** Returns a localized string for the given key and locale. */
  getStringForLocale(key, locale) {
    let strings = this.getStringsForLocale(locale);
    let string = strings[key];
    if (!string) throw new Error(`Could not find intl message ${key} in ${locale} locale`);
    return string;
  }
  /** Returns all localized strings for the given locale. */
  getStringsForLocale(locale) {
    let strings = this.strings[locale];
    if (!strings) {
      strings = $5b160d28a433310d$var$getStringsForLocale(locale, this.strings, this.defaultLocale);
      this.strings[locale] = strings;
    }
    return strings;
  }
  static getGlobalDictionaryForPackage(packageName) {
    if (typeof window === "undefined") return null;
    let locale = window[$5b160d28a433310d$var$localeSymbol];
    if ($5b160d28a433310d$var$cachedGlobalStrings === void 0) {
      let globalStrings = window[$5b160d28a433310d$var$stringsSymbol];
      if (!globalStrings) return null;
      $5b160d28a433310d$var$cachedGlobalStrings = {};
      for (let pkg in globalStrings) $5b160d28a433310d$var$cachedGlobalStrings[pkg] = new $5b160d28a433310d$export$c17fa47878dc55b6({
        [locale]: globalStrings[pkg]
      }, locale);
    }
    let dictionary = $5b160d28a433310d$var$cachedGlobalStrings === null || $5b160d28a433310d$var$cachedGlobalStrings === void 0 ? void 0 : $5b160d28a433310d$var$cachedGlobalStrings[packageName];
    if (!dictionary) throw new Error(`Strings for package "${packageName}" were not included by LocalizedStringProvider. Please add it to the list passed to createLocalizedStringDictionary.`);
    return dictionary;
  }
  constructor(messages, defaultLocale = "en-US") {
    this.strings = Object.fromEntries(Object.entries(messages).filter(([, v]) => v));
    this.defaultLocale = defaultLocale;
  }
}
function $5b160d28a433310d$var$getStringsForLocale(locale, strings, defaultLocale = "en-US") {
  if (strings[locale]) return strings[locale];
  let language = $5b160d28a433310d$var$getLanguage(locale);
  if (strings[language]) return strings[language];
  for (let key in strings) {
    if (key.startsWith(language + "-")) return strings[key];
  }
  return strings[defaultLocale];
}
function $5b160d28a433310d$var$getLanguage(locale) {
  if (Intl.Locale)
    return new Intl.Locale(locale).language;
  return locale.split("-")[0];
}
const $6db58dc88e78b024$var$pluralRulesCache = /* @__PURE__ */ new Map();
const $6db58dc88e78b024$var$numberFormatCache = /* @__PURE__ */ new Map();
class $6db58dc88e78b024$export$2f817fcdc4b89ae0 {
  /** Formats a localized string for the given key with the provided variables. */
  format(key, variables) {
    let message = this.strings.getStringForLocale(key, this.locale);
    return typeof message === "function" ? message(variables, this) : message;
  }
  plural(count, options, type = "cardinal") {
    let opt = options["=" + count];
    if (opt) return typeof opt === "function" ? opt() : opt;
    let key = this.locale + ":" + type;
    let pluralRules = $6db58dc88e78b024$var$pluralRulesCache.get(key);
    if (!pluralRules) {
      pluralRules = new Intl.PluralRules(this.locale, {
        type
      });
      $6db58dc88e78b024$var$pluralRulesCache.set(key, pluralRules);
    }
    let selected = pluralRules.select(count);
    opt = options[selected] || options.other;
    return typeof opt === "function" ? opt() : opt;
  }
  number(value) {
    let numberFormat = $6db58dc88e78b024$var$numberFormatCache.get(this.locale);
    if (!numberFormat) {
      numberFormat = new Intl.NumberFormat(this.locale);
      $6db58dc88e78b024$var$numberFormatCache.set(this.locale, numberFormat);
    }
    return numberFormat.format(value);
  }
  select(options, value) {
    let opt = options[value] || options.other;
    return typeof opt === "function" ? opt() : opt;
  }
  constructor(locale, strings) {
    this.locale = locale;
    this.strings = strings;
  }
}
function $5dc95899b306f630$export$c9058316764c140e(...refs) {
  if (refs.length === 1 && refs[0]) return refs[0];
  return (value) => {
    for (let ref of refs) {
      if (typeof ref === "function") ref(value);
      else if (ref != null) ref.current = value;
    }
  };
}
function $df56164dff5785e2$export$4338b53315abf666(forwardedRef) {
  const objRef = reactExports.useRef(null);
  return reactExports.useMemo(() => ({
    get current() {
      return objRef.current;
    },
    set current(value) {
      objRef.current = value;
      if (typeof forwardedRef === "function") forwardedRef(value);
      else if (forwardedRef) forwardedRef.current = value;
    }
  }), [
    forwardedRef
  ]);
}
function $4f58c5f72bcf79f7$export$496315a1608d9602$1(effect, dependencies) {
  const isInitialMount = reactExports.useRef(true);
  const lastDeps = reactExports.useRef(null);
  reactExports.useEffect(() => {
    isInitialMount.current = true;
    return () => {
      isInitialMount.current = false;
    };
  }, []);
  reactExports.useEffect(() => {
    if (isInitialMount.current) isInitialMount.current = false;
    else if (!lastDeps.current || dependencies.some((dep, i) => !Object.is(dep, lastDeps[i]))) effect();
    lastDeps.current = dependencies;
  }, dependencies);
}
let $ef06256079686ba0$var$descriptionId = 0;
const $ef06256079686ba0$var$descriptionNodes = /* @__PURE__ */ new Map();
function $ef06256079686ba0$export$f8aeda7b10753fa1(description) {
  let [id, setId] = reactExports.useState();
  $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c(() => {
    if (!description) return;
    let desc = $ef06256079686ba0$var$descriptionNodes.get(description);
    if (!desc) {
      let id2 = `react-aria-description-${$ef06256079686ba0$var$descriptionId++}`;
      setId(id2);
      let node = document.createElement("div");
      node.id = id2;
      node.style.display = "none";
      node.textContent = description;
      document.body.appendChild(node);
      desc = {
        refCount: 0,
        element: node
      };
      $ef06256079686ba0$var$descriptionNodes.set(description, desc);
    } else setId(desc.element.id);
    desc.refCount++;
    return () => {
      if (desc && --desc.refCount === 0) {
        desc.element.remove();
        $ef06256079686ba0$var$descriptionNodes.delete(description);
      }
    };
  }, [
    description
  ]);
  return {
    "aria-describedby": description ? id : void 0
  };
}
const $65484d02dcb7eb3e$var$DOMPropNames = /* @__PURE__ */ new Set([
  "id"
]);
const $65484d02dcb7eb3e$var$labelablePropNames = /* @__PURE__ */ new Set([
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-details"
]);
const $65484d02dcb7eb3e$var$linkPropNames = /* @__PURE__ */ new Set([
  "href",
  "hrefLang",
  "target",
  "rel",
  "download",
  "ping",
  "referrerPolicy"
]);
const $65484d02dcb7eb3e$var$propRe = /^(data-.*)$/;
function $65484d02dcb7eb3e$export$457c3d6518dd4c6f(props, opts = {}) {
  let { labelable, isLink, propNames } = opts;
  let filteredProps = {};
  for (const prop in props) if (Object.prototype.hasOwnProperty.call(props, prop) && ($65484d02dcb7eb3e$var$DOMPropNames.has(prop) || labelable && $65484d02dcb7eb3e$var$labelablePropNames.has(prop) || isLink && $65484d02dcb7eb3e$var$linkPropNames.has(prop) || (propNames === null || propNames === void 0 ? void 0 : propNames.has(prop)) || $65484d02dcb7eb3e$var$propRe.test(prop))) filteredProps[prop] = props[prop];
  return filteredProps;
}
function $4f58c5f72bcf79f7$export$496315a1608d9602(effect, dependencies) {
  const isInitialMount = reactExports.useRef(true);
  const lastDeps = reactExports.useRef(null);
  reactExports.useEffect(() => {
    isInitialMount.current = true;
    return () => {
      isInitialMount.current = false;
    };
  }, []);
  reactExports.useEffect(() => {
    if (isInitialMount.current) isInitialMount.current = false;
    else if (!lastDeps.current || dependencies.some((dep, i) => !Object.is(dep, lastDeps[i]))) effect();
    lastDeps.current = dependencies;
  }, dependencies);
}
function $62d8ded9296f3872$export$cfa2225e87938781(node, checkForOverflow) {
  let scrollableNode = node;
  if ($cc38e7bd3fc7b213$export$2bb74740c4e19def(scrollableNode, checkForOverflow)) scrollableNode = scrollableNode.parentElement;
  while (scrollableNode && !$cc38e7bd3fc7b213$export$2bb74740c4e19def(scrollableNode, checkForOverflow)) scrollableNode = scrollableNode.parentElement;
  return scrollableNode || document.scrollingElement || document.documentElement;
}
function $99facab73266f662$export$5add1d006293d136(ref, initialValue, onReset) {
  let resetValue = reactExports.useRef(initialValue);
  let handleReset = $8ae05eaa5c114e9c$export$7f54fc3180508a52(() => {
    if (onReset) onReset(resetValue.current);
  });
  reactExports.useEffect(() => {
    var _ref_current;
    let form2 = ref === null || ref === void 0 ? void 0 : (_ref_current = ref.current) === null || _ref_current === void 0 ? void 0 : _ref_current.form;
    form2 === null || form2 === void 0 ? void 0 : form2.addEventListener("reset", handleReset);
    return () => {
      form2 === null || form2 === void 0 ? void 0 : form2.removeEventListener("reset", handleReset);
    };
  }, [
    ref,
    handleReset
  ]);
}
class $8a9cb279dc87e130$export$905e7fc544a71f36 {
  isDefaultPrevented() {
    return this.nativeEvent.defaultPrevented;
  }
  preventDefault() {
    this.defaultPrevented = true;
    this.nativeEvent.preventDefault();
  }
  stopPropagation() {
    this.nativeEvent.stopPropagation();
    this.isPropagationStopped = () => true;
  }
  isPropagationStopped() {
    return false;
  }
  persist() {
  }
  constructor(type, nativeEvent) {
    this.nativeEvent = nativeEvent;
    this.target = nativeEvent.target;
    this.currentTarget = nativeEvent.currentTarget;
    this.relatedTarget = nativeEvent.relatedTarget;
    this.bubbles = nativeEvent.bubbles;
    this.cancelable = nativeEvent.cancelable;
    this.defaultPrevented = nativeEvent.defaultPrevented;
    this.eventPhase = nativeEvent.eventPhase;
    this.isTrusted = nativeEvent.isTrusted;
    this.timeStamp = nativeEvent.timeStamp;
    this.type = type;
  }
}
function $8a9cb279dc87e130$export$715c682d09d639cc(onBlur) {
  let stateRef = reactExports.useRef({
    isFocused: false,
    observer: null
  });
  $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c$1(() => {
    const state = stateRef.current;
    return () => {
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }
    };
  }, []);
  let dispatchBlur = $8ae05eaa5c114e9c$export$7f54fc3180508a52((e) => {
    onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
  });
  return reactExports.useCallback((e) => {
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
      stateRef.current.isFocused = true;
      let target = e.target;
      let onBlurHandler = (e2) => {
        stateRef.current.isFocused = false;
        if (target.disabled)
          dispatchBlur(new $8a9cb279dc87e130$export$905e7fc544a71f36("blur", e2));
        if (stateRef.current.observer) {
          stateRef.current.observer.disconnect();
          stateRef.current.observer = null;
        }
      };
      target.addEventListener("focusout", onBlurHandler, {
        once: true
      });
      stateRef.current.observer = new MutationObserver(() => {
        if (stateRef.current.isFocused && target.disabled) {
          var _stateRef_current_observer;
          (_stateRef_current_observer = stateRef.current.observer) === null || _stateRef_current_observer === void 0 ? void 0 : _stateRef_current_observer.disconnect();
          let relatedTargetEl = target === document.activeElement ? null : document.activeElement;
          target.dispatchEvent(new FocusEvent("blur", {
            relatedTarget: relatedTargetEl
          }));
          target.dispatchEvent(new FocusEvent("focusout", {
            bubbles: true,
            relatedTarget: relatedTargetEl
          }));
        }
      });
      stateRef.current.observer.observe(target, {
        attributes: true,
        attributeFilter: [
          "disabled"
        ]
      });
    }
  }, [
    dispatchBlur
  ]);
}
function $a1ea59d68270f0dd$export$f8168d8dd8fd66e6(props) {
  let { isDisabled, onFocus: onFocusProp, onBlur: onBlurProp, onFocusChange } = props;
  const onBlur = reactExports.useCallback((e) => {
    if (e.target === e.currentTarget) {
      if (onBlurProp) onBlurProp(e);
      if (onFocusChange) onFocusChange(false);
      return true;
    }
  }, [
    onBlurProp,
    onFocusChange
  ]);
  const onSyntheticFocus = $8a9cb279dc87e130$export$715c682d09d639cc(onBlur);
  const onFocus = reactExports.useCallback((e) => {
    const ownerDocument = $431fbd86ca7dc216$export$b204af158042fbac(e.target);
    if (e.target === e.currentTarget && ownerDocument.activeElement === e.target) {
      if (onFocusProp) onFocusProp(e);
      if (onFocusChange) onFocusChange(true);
      onSyntheticFocus(e);
    }
  }, [
    onFocusChange,
    onFocusProp,
    onSyntheticFocus
  ]);
  return {
    focusProps: {
      onFocus: !isDisabled && (onFocusProp || onFocusChange || onBlurProp) ? onFocus : void 0,
      onBlur: !isDisabled && (onBlurProp || onFocusChange) ? onBlur : void 0
    }
  };
}
function $9ab94262bd0047c7$export$420e68273165f4ec(props) {
  let { isDisabled, onBlurWithin, onFocusWithin, onFocusWithinChange } = props;
  let state = reactExports.useRef({
    isFocusWithin: false
  });
  let onBlur = reactExports.useCallback((e) => {
    if (state.current.isFocusWithin && !e.currentTarget.contains(e.relatedTarget)) {
      state.current.isFocusWithin = false;
      if (onBlurWithin) onBlurWithin(e);
      if (onFocusWithinChange) onFocusWithinChange(false);
    }
  }, [
    onBlurWithin,
    onFocusWithinChange,
    state
  ]);
  let onSyntheticFocus = $8a9cb279dc87e130$export$715c682d09d639cc(onBlur);
  let onFocus = reactExports.useCallback((e) => {
    if (!state.current.isFocusWithin && document.activeElement === e.target) {
      if (onFocusWithin) onFocusWithin(e);
      if (onFocusWithinChange) onFocusWithinChange(true);
      state.current.isFocusWithin = true;
      onSyntheticFocus(e);
    }
  }, [
    onFocusWithin,
    onFocusWithinChange,
    onSyntheticFocus
  ]);
  if (isDisabled) return {
    focusWithinProps: {
      // These should not have been null, that would conflict in mergeProps
      onFocus: void 0,
      onBlur: void 0
    }
  };
  return {
    focusWithinProps: {
      onFocus,
      onBlur
    }
  };
}
function $93925083ecbb358c$export$48d1ea6320830260(handler) {
  if (!handler) return void 0;
  let shouldStopPropagation = true;
  return (e) => {
    let event = {
      ...e,
      preventDefault() {
        e.preventDefault();
      },
      isDefaultPrevented() {
        return e.isDefaultPrevented();
      },
      stopPropagation() {
        if (shouldStopPropagation) console.error("stopPropagation is now the default behavior for events in React Spectrum. You can use continuePropagation() to revert this behavior.");
        else shouldStopPropagation = true;
      },
      continuePropagation() {
        shouldStopPropagation = false;
      },
      isPropagationStopped() {
        return shouldStopPropagation;
      }
    };
    handler(event);
    if (shouldStopPropagation) e.stopPropagation();
  };
}
function $46d819fcbaf35654$export$8f71654801c2f7cd(props) {
  return {
    keyboardProps: props.isDisabled ? {} : {
      onKeyDown: $93925083ecbb358c$export$48d1ea6320830260(props.onKeyDown),
      onKeyUp: $93925083ecbb358c$export$48d1ea6320830260(props.onKeyUp)
    }
  };
}
let $e6afbd83fe6ebbd2$var$FocusableContext = /* @__PURE__ */ React.createContext(null);
function $e6afbd83fe6ebbd2$var$useFocusableContext(ref) {
  let context = reactExports.useContext($e6afbd83fe6ebbd2$var$FocusableContext) || {};
  $e7801be82b4b2a53$export$4debdb1a3f0fa79e(context, ref);
  let { ref: _, ...otherProps } = context;
  return otherProps;
}
function $e6afbd83fe6ebbd2$export$4c014de7c8940b4c(props, domRef) {
  let { focusProps } = $a1ea59d68270f0dd$export$f8168d8dd8fd66e6(props);
  let { keyboardProps } = $46d819fcbaf35654$export$8f71654801c2f7cd(props);
  let interactions = $3ef42575df84b30b$export$9d1611c77c2fe928(focusProps, keyboardProps);
  let domProps = $e6afbd83fe6ebbd2$var$useFocusableContext(domRef);
  let interactionProps = props.isDisabled ? {} : domProps;
  let autoFocusRef = reactExports.useRef(props.autoFocus);
  reactExports.useEffect(() => {
    if (autoFocusRef.current && domRef.current) $6a99195332edec8b$export$80f3e147d781571c(domRef.current);
    autoFocusRef.current = false;
  }, [
    domRef
  ]);
  return {
    focusableProps: $3ef42575df84b30b$export$9d1611c77c2fe928({
      ...interactions,
      tabIndex: props.excludeFromTabOrder && !props.isDisabled ? -1 : void 0
    }, interactionProps)
  };
}
function $83013635b024ae3d$export$eac1895992b9f3d6(ref, options) {
  let isDisabled = options === null || options === void 0 ? void 0 : options.isDisabled;
  let [hasTabbableChild, setHasTabbableChild] = reactExports.useState(false);
  $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c$1(() => {
    if ((ref === null || ref === void 0 ? void 0 : ref.current) && !isDisabled) {
      let update = () => {
        if (ref.current) {
          let walker = $9bf71ea28793e738$export$2d6ec8fc375ceafa(ref.current, {
            tabbable: true
          });
          setHasTabbableChild(!!walker.nextNode());
        }
      };
      update();
      let observer = new MutationObserver(update);
      observer.observe(ref.current, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: [
          "tabIndex",
          "disabled"
        ]
      });
      return () => {
        observer.disconnect();
      };
    }
  });
  return isDisabled ? false : hasTabbableChild;
}
const $5c3e21d68f1c4674$var$styles = {
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap"
};
function $5c3e21d68f1c4674$export$a966af930f325cab(props = {}) {
  let { style, isFocusable } = props;
  let [isFocused, setFocused] = reactExports.useState(false);
  let { focusWithinProps } = $9ab94262bd0047c7$export$420e68273165f4ec({
    isDisabled: !isFocusable,
    onFocusWithinChange: (val) => setFocused(val)
  });
  let combinedStyles = reactExports.useMemo(() => {
    if (isFocused) return style;
    else if (style) return {
      ...$5c3e21d68f1c4674$var$styles,
      ...style
    };
    else return $5c3e21d68f1c4674$var$styles;
  }, [
    isFocused
  ]);
  return {
    visuallyHiddenProps: {
      ...focusWithinProps,
      style: combinedStyles
    }
  };
}
function $5c3e21d68f1c4674$export$439d29a4e110a164(props) {
  let { children, elementType: Element = "div", isFocusable, style, ...otherProps } = props;
  let { visuallyHiddenProps } = $5c3e21d68f1c4674$export$a966af930f325cab(props);
  return /* @__PURE__ */ React.createElement(Element, $3ef42575df84b30b$export$9d1611c77c2fe928(otherProps, visuallyHiddenProps), children);
}
var spacer = tv({
  base: "w-px h-px inline-block",
  variants: {
    isInline: {
      true: "inline-block",
      false: "block"
    }
  },
  defaultVariants: {
    isInline: false
  }
});
var table = tv({
  slots: {
    base: "flex flex-col relative gap-4",
    wrapper: [
      "p-4",
      "z-0",
      "flex",
      "flex-col",
      "relative",
      "justify-between",
      "gap-4",
      "shadow-small",
      "bg-content1",
      "overflow-auto"
    ],
    table: "min-w-full h-auto",
    thead: "[&>tr]:first:rounded-lg",
    tbody: "",
    tr: ["group/tr", "outline-none", ...dataFocusVisibleClasses],
    th: [
      "group/th",
      "px-3",
      "h-10",
      "text-start",
      "align-middle",
      "bg-default-100",
      "whitespace-nowrap",
      "text-foreground-500",
      "text-tiny",
      "font-semibold",
      "first:rounded-s-lg",
      "last:rounded-e-lg",
      "outline-none",
      "data-[sortable=true]:cursor-pointer",
      "data-[hover=true]:text-foreground-400",
      ...dataFocusVisibleClasses
    ],
    td: [
      "py-2",
      "px-3",
      "relative",
      "align-middle",
      "whitespace-normal",
      "text-small",
      "font-normal",
      "outline-none",
      "[&>*]:z-1",
      "[&>*]:relative",
      ...dataFocusVisibleClasses,
      "before:content-['']",
      "before:absolute",
      "before:z-0",
      "before:inset-0",
      "before:opacity-0",
      "data-[selected=true]:before:opacity-100",
      "group-data-[disabled=true]/tr:text-foreground-300",
      "group-data-[disabled=true]/tr:cursor-not-allowed"
    ],
    tfoot: "",
    sortIcon: [
      "ms-2",
      "mb-px",
      "opacity-0",
      "text-inherit",
      "inline-block",
      "transition-transform-opacity",
      "data-[visible=true]:opacity-100",
      "group-data-[hover=true]/th:opacity-100",
      "data-[direction=ascending]:rotate-180"
    ],
    emptyWrapper: "text-foreground-400 align-middle text-center h-40",
    loadingWrapper: "absolute inset-0 flex items-center justify-center"
  },
  variants: {
    color: {
      default: {
        td: "before:bg-default/60 data-[selected=true]:text-default-foreground"
      },
      primary: {
        td: "before:bg-primary/20 data-[selected=true]:text-primary"
      },
      secondary: {
        td: "before:bg-secondary/20 data-[selected=true]:text-secondary"
      },
      success: {
        td: "before:bg-success/20 data-[selected=true]:text-success-600 dark:data-[selected=true]:text-success"
      },
      warning: {
        td: "before:bg-warning/20 data-[selected=true]:text-warning-600 dark:data-[selected=true]:text-warning"
      },
      danger: {
        td: "before:bg-danger/20 data-[selected=true]:text-danger dark:data-[selected=true]:text-danger-500"
      }
    },
    layout: {
      auto: {
        table: "table-auto"
      },
      fixed: {
        table: "table-fixed"
      }
    },
    radius: {
      none: {
        wrapper: "rounded-none"
      },
      sm: {
        wrapper: "rounded-small"
      },
      md: {
        wrapper: "rounded-medium"
      },
      lg: {
        wrapper: "rounded-large"
      }
    },
    shadow: {
      none: {
        wrapper: "shadow-none"
      },
      sm: {
        wrapper: "shadow-small"
      },
      md: {
        wrapper: "shadow-medium"
      },
      lg: {
        wrapper: "shadow-large"
      }
    },
    hideHeader: {
      true: {
        thead: "hidden"
      }
    },
    isStriped: {
      true: {
        td: [
          "group-data-[odd=true]/tr:before:bg-default-100",
          "group-data-[odd=true]/tr:before:opacity-100",
          "group-data-[odd=true]/tr:before:-z-10"
        ]
      }
    },
    isCompact: {
      true: {
        td: "py-1"
      },
      false: {}
    },
    isHeaderSticky: {
      true: {
        thead: "sticky top-0 z-20 [&>tr]:first:shadow-small"
      }
    },
    isSelectable: {
      true: {
        tr: "cursor-default",
        td: [
          "group-aria-[selected=false]/tr:group-data-[hover=true]/tr:before:bg-default-100",
          "group-aria-[selected=false]/tr:group-data-[hover=true]/tr:before:opacity-70"
        ]
      }
    },
    isMultiSelectable: {
      true: {
        td: [
          "group-data-[first=true]/tr:first:before:rounded-ts-lg",
          "group-data-[first=true]/tr:last:before:rounded-te-lg",
          "group-data-[middle=true]/tr:before:rounded-none",
          "group-data-[last=true]/tr:first:before:rounded-bs-lg",
          "group-data-[last=true]/tr:last:before:rounded-be-lg"
        ]
      },
      false: {
        td: ["first:before:rounded-s-lg", "last:before:rounded-e-lg"]
      }
    },
    fullWidth: {
      true: {
        base: "w-full",
        wrapper: "w-full",
        table: "w-full"
      }
    },
    align: {
      start: {
        th: "text-start",
        td: "text-start"
      },
      center: {
        th: "text-center",
        td: "text-center"
      },
      end: {
        th: "text-end",
        td: "text-end"
      }
    }
  },
  defaultVariants: {
    layout: "auto",
    shadow: "sm",
    radius: "lg",
    color: "default",
    isCompact: false,
    hideHeader: false,
    isStriped: false,
    fullWidth: true,
    align: "start"
  },
  compoundVariants: [
    {
      isStriped: true,
      color: "default",
      class: {
        td: "group-data-[odd=true]/tr:data-[selected=true]/tr:before:bg-default/60"
      }
    },
    {
      isStriped: true,
      color: "primary",
      class: {
        td: "group-data-[odd=true]/tr:data-[selected=true]/tr:before:bg-primary/20"
      }
    },
    {
      isStriped: true,
      color: "secondary",
      class: {
        td: "group-data-[odd=true]/tr:data-[selected=true]/tr:before:bg-secondary/20"
      }
    },
    {
      isStriped: true,
      color: "success",
      class: {
        td: "group-data-[odd=true]/tr:data-[selected=true]/tr:before:bg-success/20"
      }
    },
    {
      isStriped: true,
      color: "warning",
      class: {
        td: "group-data-[odd=true]/tr:data-[selected=true]/tr:before:bg-warning/20"
      }
    },
    {
      isStriped: true,
      color: "danger",
      class: {
        td: "group-data-[odd=true]/tr:data-[selected=true]/tr:before:bg-danger/20"
      }
    }
  ]
});
var form = tv({
  base: "flex flex-col gap-2 items-start"
});
var checkbox = tv({
  slots: {
    base: "group relative max-w-fit inline-flex items-center justify-start cursor-pointer tap-highlight-transparent p-2 -m-2 select-none",
    wrapper: [
      "relative",
      "inline-flex",
      "items-center",
      "justify-center",
      "flex-shrink-0",
      "overflow-hidden",
      "before:content-['']",
      "before:absolute",
      "before:inset-0",
      "before:border-solid",
      "before:border-2",
      "before:box-border",
      "before:border-default",
      "after:content-['']",
      "after:absolute",
      "after:inset-0",
      "after:scale-50",
      "after:opacity-0",
      "after:origin-center",
      "group-data-[selected=true]:after:scale-100",
      "group-data-[selected=true]:after:opacity-100",
      "group-data-[hover=true]:before:bg-default-100",
      ...groupDataFocusVisibleClasses
    ],
    hiddenInput: hiddenInputClasses,
    icon: "z-10 w-4 h-3 opacity-0 group-data-[selected=true]:opacity-100 pointer-events-none",
    label: "relative text-foreground select-none"
  },
  variants: {
    color: {
      default: {
        wrapper: "after:bg-default after:text-default-foreground text-default-foreground"
      },
      primary: {
        wrapper: "after:bg-primary after:text-primary-foreground text-primary-foreground"
      },
      secondary: {
        wrapper: "after:bg-secondary after:text-secondary-foreground text-secondary-foreground"
      },
      success: {
        wrapper: "after:bg-success after:text-success-foreground text-success-foreground"
      },
      warning: {
        wrapper: "after:bg-warning after:text-warning-foreground text-warning-foreground"
      },
      danger: {
        wrapper: "after:bg-danger after:text-danger-foreground text-danger-foreground"
      }
    },
    size: {
      sm: {
        wrapper: [
          "w-4 h-4 me-2",
          "rounded-[calc(theme(borderRadius.medium)*0.5)]",
          "before:rounded-[calc(theme(borderRadius.medium)*0.5)]",
          "after:rounded-[calc(theme(borderRadius.medium)*0.5)]"
        ],
        label: "text-small",
        icon: "w-3 h-2"
      },
      md: {
        wrapper: [
          "w-5 h-5 me-2",
          "rounded-[calc(theme(borderRadius.medium)*0.6)]",
          "before:rounded-[calc(theme(borderRadius.medium)*0.6)]",
          "after:rounded-[calc(theme(borderRadius.medium)*0.6)]"
        ],
        label: "text-medium",
        icon: "w-4 h-3"
      },
      lg: {
        wrapper: [
          "w-6 h-6 me-2",
          "rounded-[calc(theme(borderRadius.medium)*0.7)]",
          "before:rounded-[calc(theme(borderRadius.medium)*0.7)]",
          "after:rounded-[calc(theme(borderRadius.medium)*0.7)]"
        ],
        label: "text-large",
        icon: "w-5 h-4"
      }
    },
    radius: {
      none: {
        wrapper: "rounded-none before:rounded-none after:rounded-none"
      },
      sm: {
        wrapper: [
          "rounded-[calc(theme(borderRadius.medium)*0.5)]",
          "before:rounded-[calc(theme(borderRadius.medium)*0.5)]",
          "after:rounded-[calc(theme(borderRadius.medium)*0.5)]"
        ]
      },
      md: {
        wrapper: [
          "rounded-[calc(theme(borderRadius.medium)*0.6)]",
          "before:rounded-[calc(theme(borderRadius.medium)*0.6)]",
          "after:rounded-[calc(theme(borderRadius.medium)*0.6)]"
        ]
      },
      lg: {
        wrapper: [
          "rounded-[calc(theme(borderRadius.medium)*0.7)]",
          "before:rounded-[calc(theme(borderRadius.medium)*0.7)]",
          "after:rounded-[calc(theme(borderRadius.medium)*0.7)]"
        ]
      },
      full: {
        wrapper: "rounded-full before:rounded-full after:rounded-full"
      }
    },
    lineThrough: {
      true: {
        label: [
          "inline-flex",
          "items-center",
          "justify-center",
          "before:content-['']",
          "before:absolute",
          "before:bg-foreground",
          "before:w-0",
          "before:h-0.5",
          "group-data-[selected=true]:opacity-60",
          "group-data-[selected=true]:before:w-full"
        ]
      }
    },
    isDisabled: {
      true: {
        base: "opacity-disabled pointer-events-none"
      }
    },
    isInvalid: {
      true: {
        wrapper: "before:border-danger",
        label: "text-danger"
      }
    },
    disableAnimation: {
      true: {
        wrapper: "transition-none",
        icon: "transition-none",
        label: "transition-none"
      },
      false: {
        wrapper: [
          "before:transition-colors",
          "group-data-[pressed=true]:scale-95",
          "transition-transform",
          "after:transition-transform-opacity",
          "after:!ease-linear",
          "after:!duration-200",
          "motion-reduce:transition-none"
        ],
        icon: "transition-opacity motion-reduce:transition-none",
        label: "transition-colors-opacity before:transition-width motion-reduce:transition-none"
      }
    }
  },
  defaultVariants: {
    color: "primary",
    size: "md",
    isDisabled: false,
    lineThrough: false
  }
});
tv({
  slots: {
    base: "relative flex flex-col gap-2",
    label: "relative text-medium text-foreground-500",
    wrapper: "flex flex-col flex-wrap gap-2 data-[orientation=horizontal]:flex-row",
    description: "text-small text-foreground-400",
    errorMessage: "text-small text-danger"
  },
  variants: {
    isRequired: {
      true: {
        label: "after:content-['*'] after:text-danger after:ml-0.5"
      }
    },
    isInvalid: {
      true: {
        description: "text-danger"
      }
    },
    disableAnimation: {
      true: {},
      false: {
        description: "transition-colors !duration-150 motion-reduce:transition-none"
      }
    }
  },
  defaultVariants: {
    isInvalid: false,
    isRequired: false
  }
});
const $fca6afa0e843324b$var$cache = /* @__PURE__ */ new WeakMap();
function $fca6afa0e843324b$var$getCachedDictionary(strings) {
  let dictionary = $fca6afa0e843324b$var$cache.get(strings);
  if (!dictionary) {
    dictionary = new $5b160d28a433310d$export$c17fa47878dc55b6(strings);
    $fca6afa0e843324b$var$cache.set(strings, dictionary);
  }
  return dictionary;
}
function $fca6afa0e843324b$export$87b761675e8eaa10(strings, packageName) {
  return packageName && $5b160d28a433310d$export$c17fa47878dc55b6.getGlobalDictionaryForPackage(packageName) || $fca6afa0e843324b$var$getCachedDictionary(strings);
}
function $fca6afa0e843324b$export$f12b703ca79dfbb1(strings, packageName) {
  let { locale } = $18f2051aff69b9bf$export$43bb16f9c6d9e3f7();
  let dictionary = $fca6afa0e843324b$export$87b761675e8eaa10(strings, packageName);
  return reactExports.useMemo(() => new $6db58dc88e78b024$export$2f817fcdc4b89ae0(locale, dictionary), [
    locale,
    dictionary
  ]);
}
let $325a3faab7a68acd$var$cache = /* @__PURE__ */ new Map();
function $325a3faab7a68acd$export$a16aca283550c30d(options) {
  let { locale } = $18f2051aff69b9bf$export$43bb16f9c6d9e3f7();
  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
  if ($325a3faab7a68acd$var$cache.has(cacheKey)) return $325a3faab7a68acd$var$cache.get(cacheKey);
  let formatter = new Intl.Collator(locale, options);
  $325a3faab7a68acd$var$cache.set(cacheKey, formatter);
  return formatter;
}
var ChevronDownIcon = ({ strokeWidth = 1.5, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "svg",
  {
    "aria-hidden": "true",
    fill: "none",
    focusable: "false",
    height: "1em",
    role: "presentation",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth,
    viewBox: "0 0 24 24",
    width: "1em",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m6 9 6 6 6-6" })
  }
);
var useSafeLayoutEffect = Boolean(globalThis == null ? void 0 : globalThis.document) ? reactExports.useLayoutEffect : reactExports.useEffect;
const $e5be200c675c3b3a$export$aca958c65c314e6c = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valueMissing: false,
  valid: true
};
const $e5be200c675c3b3a$var$CUSTOM_VALIDITY_STATE = {
  ...$e5be200c675c3b3a$export$aca958c65c314e6c,
  customError: true,
  valid: false
};
const $e5be200c675c3b3a$export$dad6ae84456c676a = {
  isInvalid: false,
  validationDetails: $e5be200c675c3b3a$export$aca958c65c314e6c,
  validationErrors: []
};
const $e5be200c675c3b3a$export$571b5131b7e65c11$1 = reactExports.createContext({});
const $e5be200c675c3b3a$export$a763b9476acd3eb = "__formValidationState" + Date.now();
function $e5be200c675c3b3a$export$fc1a364ae1f3ff10(props) {
  if (props[$e5be200c675c3b3a$export$a763b9476acd3eb]) {
    let { realtimeValidation, displayValidation, updateValidation, resetValidation, commitValidation } = props[$e5be200c675c3b3a$export$a763b9476acd3eb];
    return {
      realtimeValidation,
      displayValidation,
      updateValidation,
      resetValidation,
      commitValidation
    };
  }
  return $e5be200c675c3b3a$var$useFormValidationStateImpl(props);
}
function $e5be200c675c3b3a$var$useFormValidationStateImpl(props) {
  let { isInvalid, validationState, name, value, builtinValidation, validate, validationBehavior = "aria" } = props;
  if (validationState) isInvalid || (isInvalid = validationState === "invalid");
  let controlledError = isInvalid !== void 0 ? {
    isInvalid,
    validationErrors: [],
    validationDetails: $e5be200c675c3b3a$var$CUSTOM_VALIDITY_STATE
  } : null;
  let clientError = reactExports.useMemo(() => {
    if (!validate || value == null) return null;
    let validateErrors = $e5be200c675c3b3a$var$runValidate(validate, value);
    return $e5be200c675c3b3a$var$getValidationResult(validateErrors);
  }, [
    validate,
    value
  ]);
  if (builtinValidation === null || builtinValidation === void 0 ? void 0 : builtinValidation.validationDetails.valid) builtinValidation = void 0;
  let serverErrors = reactExports.useContext($e5be200c675c3b3a$export$571b5131b7e65c11$1);
  let serverErrorMessages = reactExports.useMemo(() => {
    if (name) return Array.isArray(name) ? name.flatMap((name2) => $e5be200c675c3b3a$var$asArray(serverErrors[name2])) : $e5be200c675c3b3a$var$asArray(serverErrors[name]);
    return [];
  }, [
    serverErrors,
    name
  ]);
  let [lastServerErrors, setLastServerErrors] = reactExports.useState(serverErrors);
  let [isServerErrorCleared, setServerErrorCleared] = reactExports.useState(false);
  if (serverErrors !== lastServerErrors) {
    setLastServerErrors(serverErrors);
    setServerErrorCleared(false);
  }
  let serverError = reactExports.useMemo(() => $e5be200c675c3b3a$var$getValidationResult(isServerErrorCleared ? [] : serverErrorMessages), [
    isServerErrorCleared,
    serverErrorMessages
  ]);
  let nextValidation = reactExports.useRef($e5be200c675c3b3a$export$dad6ae84456c676a);
  let [currentValidity, setCurrentValidity] = reactExports.useState($e5be200c675c3b3a$export$dad6ae84456c676a);
  let lastError = reactExports.useRef($e5be200c675c3b3a$export$dad6ae84456c676a);
  let commitValidation = () => {
    if (!commitQueued) return;
    setCommitQueued(false);
    let error = clientError || builtinValidation || nextValidation.current;
    if (!$e5be200c675c3b3a$var$isEqualValidation(error, lastError.current)) {
      lastError.current = error;
      setCurrentValidity(error);
    }
  };
  let [commitQueued, setCommitQueued] = reactExports.useState(false);
  reactExports.useEffect(commitValidation);
  let realtimeValidation = controlledError || serverError || clientError || builtinValidation || $e5be200c675c3b3a$export$dad6ae84456c676a;
  let displayValidation = validationBehavior === "native" ? controlledError || serverError || currentValidity : controlledError || serverError || clientError || builtinValidation || currentValidity;
  return {
    realtimeValidation,
    displayValidation,
    updateValidation(value2) {
      if (validationBehavior === "aria" && !$e5be200c675c3b3a$var$isEqualValidation(currentValidity, value2)) setCurrentValidity(value2);
      else nextValidation.current = value2;
    },
    resetValidation() {
      let error = $e5be200c675c3b3a$export$dad6ae84456c676a;
      if (!$e5be200c675c3b3a$var$isEqualValidation(error, lastError.current)) {
        lastError.current = error;
        setCurrentValidity(error);
      }
      if (validationBehavior === "native") setCommitQueued(false);
      setServerErrorCleared(true);
    },
    commitValidation() {
      if (validationBehavior === "native") setCommitQueued(true);
      setServerErrorCleared(true);
    }
  };
}
function $e5be200c675c3b3a$var$asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [
    v
  ];
}
function $e5be200c675c3b3a$var$runValidate(validate, value) {
  if (typeof validate === "function") {
    let e = validate(value);
    if (e && typeof e !== "boolean") return $e5be200c675c3b3a$var$asArray(e);
  }
  return [];
}
function $e5be200c675c3b3a$var$getValidationResult(errors) {
  return errors.length ? {
    isInvalid: true,
    validationErrors: errors,
    validationDetails: $e5be200c675c3b3a$var$CUSTOM_VALIDITY_STATE
  } : null;
}
function $e5be200c675c3b3a$var$isEqualValidation(a, b) {
  if (a === b) return true;
  return !!a && !!b && a.isInvalid === b.isInvalid && a.validationErrors.length === b.validationErrors.length && a.validationErrors.every((a2, i) => a2 === b.validationErrors[i]) && Object.entries(a.validationDetails).every(([k, v]) => b.validationDetails[k] === v);
}
function $e93e671b31057976$export$b8473d3665f3a75a(props, state, ref) {
  let { validationBehavior, focus } = props;
  $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c$1(() => {
    if (validationBehavior === "native" && (ref === null || ref === void 0 ? void 0 : ref.current) && !ref.current.disabled) {
      let errorMessage = state.realtimeValidation.isInvalid ? state.realtimeValidation.validationErrors.join(" ") || "Invalid value." : "";
      ref.current.setCustomValidity(errorMessage);
      if (!ref.current.hasAttribute("title")) ref.current.title = "";
      if (!state.realtimeValidation.isInvalid) state.updateValidation($e93e671b31057976$var$getNativeValidity(ref.current));
    }
  });
  let onReset = $8ae05eaa5c114e9c$export$7f54fc3180508a52(() => {
    state.resetValidation();
  });
  let onInvalid = $8ae05eaa5c114e9c$export$7f54fc3180508a52((e) => {
    var _ref_current;
    if (!state.displayValidation.isInvalid) state.commitValidation();
    let form2 = ref === null || ref === void 0 ? void 0 : (_ref_current = ref.current) === null || _ref_current === void 0 ? void 0 : _ref_current.form;
    if (!e.defaultPrevented && ref && form2 && $e93e671b31057976$var$getFirstInvalidInput(form2) === ref.current) {
      var _ref_current1;
      if (focus) focus();
      else (_ref_current1 = ref.current) === null || _ref_current1 === void 0 ? void 0 : _ref_current1.focus();
      $507fabe10e71c6fb$export$8397ddfc504fdb9a("keyboard");
    }
    e.preventDefault();
  });
  let onChange = $8ae05eaa5c114e9c$export$7f54fc3180508a52(() => {
    state.commitValidation();
  });
  reactExports.useEffect(() => {
    let input = ref === null || ref === void 0 ? void 0 : ref.current;
    if (!input) return;
    let form2 = input.form;
    input.addEventListener("invalid", onInvalid);
    input.addEventListener("change", onChange);
    form2 === null || form2 === void 0 ? void 0 : form2.addEventListener("reset", onReset);
    return () => {
      input.removeEventListener("invalid", onInvalid);
      input.removeEventListener("change", onChange);
      form2 === null || form2 === void 0 ? void 0 : form2.removeEventListener("reset", onReset);
    };
  }, [
    ref,
    onInvalid,
    onChange,
    onReset,
    validationBehavior
  ]);
}
function $e93e671b31057976$var$getValidity(input) {
  let validity = input.validity;
  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
    valid: validity.valid
  };
}
function $e93e671b31057976$var$getNativeValidity(input) {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: $e93e671b31057976$var$getValidity(input),
    validationErrors: input.validationMessage ? [
      input.validationMessage
    ] : []
  };
}
function $e93e671b31057976$var$getFirstInvalidInput(form2) {
  for (let i = 0; i < form2.elements.length; i++) {
    let element = form2.elements[i];
    if (!element.validity.valid) return element;
  }
  return null;
}
function $d2c8e2b0480f3f34$export$cbe85ee05b554577(props, state, ref) {
  let { isDisabled = false, isReadOnly = false, value, name, children, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, validationState = "valid", isInvalid } = props;
  let onChange = (e) => {
    e.stopPropagation();
    state.setSelected(e.target.checked);
  };
  let hasChildren = children != null;
  let hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel) console.warn("If you do not provide children, you must specify an aria-label for accessibility");
  let { pressProps, isPressed } = $f6c31cce2adf654f$export$45712eceda6fad21({
    isDisabled
  });
  let { pressProps: labelProps, isPressed: isLabelPressed } = $f6c31cce2adf654f$export$45712eceda6fad21({
    isDisabled: isDisabled || isReadOnly,
    onPress() {
      state.toggle();
    }
  });
  let { focusableProps } = $e6afbd83fe6ebbd2$export$4c014de7c8940b4c(props, ref);
  let interactions = $3ef42575df84b30b$export$9d1611c77c2fe928(pressProps, focusableProps);
  let domProps = $65484d02dcb7eb3e$export$457c3d6518dd4c6f(props, {
    labelable: true
  });
  $99facab73266f662$export$5add1d006293d136(ref, state.isSelected, state.setSelected);
  return {
    labelProps: $3ef42575df84b30b$export$9d1611c77c2fe928(labelProps, {
      onClick: (e) => e.preventDefault()
    }),
    inputProps: $3ef42575df84b30b$export$9d1611c77c2fe928(domProps, {
      "aria-invalid": isInvalid || validationState === "invalid" || void 0,
      "aria-errormessage": props["aria-errormessage"],
      "aria-controls": props["aria-controls"],
      "aria-readonly": isReadOnly || void 0,
      onChange,
      disabled: isDisabled,
      ...value == null ? {} : {
        value
      },
      name,
      type: "checkbox",
      ...interactions
    }),
    isSelected: state.isSelected,
    isPressed: isPressed || isLabelPressed,
    isDisabled,
    isReadOnly,
    isInvalid: isInvalid || validationState === "invalid"
  };
}
function $406796ff087fe49b$export$e375f10ce42261c5(props, state, inputRef) {
  let validationState = $e5be200c675c3b3a$export$fc1a364ae1f3ff10({
    ...props,
    value: state.isSelected
  });
  let { isInvalid, validationErrors, validationDetails } = validationState.displayValidation;
  let { labelProps, inputProps, isSelected, isPressed, isDisabled, isReadOnly } = $d2c8e2b0480f3f34$export$cbe85ee05b554577({
    ...props,
    isInvalid
  }, state, inputRef);
  $e93e671b31057976$export$b8473d3665f3a75a(props, validationState, inputRef);
  let { isIndeterminate, isRequired, validationBehavior = "aria" } = props;
  reactExports.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = !!isIndeterminate;
  });
  let { pressProps } = $f6c31cce2adf654f$export$45712eceda6fad21$1({
    isDisabled: isDisabled || isReadOnly,
    onPress() {
      let { [$e5be200c675c3b3a$export$a763b9476acd3eb]: groupValidationState } = props;
      let { commitValidation } = groupValidationState ? groupValidationState : validationState;
      commitValidation();
    }
  });
  return {
    labelProps: $3ef42575df84b30b$export$9d1611c77c2fe928$1(labelProps, pressProps),
    inputProps: {
      ...inputProps,
      checked: isSelected,
      "aria-required": isRequired && validationBehavior === "aria" || void 0,
      required: isRequired && validationBehavior === "native"
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    isInvalid,
    validationErrors,
    validationDetails
  };
}
const $1ae600c947479353$export$ec98120685d4f57d = /* @__PURE__ */ new WeakMap();
function $3017fa7ffdddec74$export$8042c6c013fd5226(props = {}) {
  let { isReadOnly } = props;
  let [isSelected, setSelected] = $458b0a5536c1a7cf$export$40bfa8c7b0832715(props.isSelected, props.defaultSelected || false, props.onChange);
  function updateSelected(value) {
    if (!isReadOnly) setSelected(value);
  }
  function toggleState() {
    if (!isReadOnly) setSelected(!isSelected);
  }
  return {
    isSelected,
    setSelected: updateSelected,
    toggle: toggleState
  };
}
function $fba3e38d5ca8983f$export$353b32fc6898d37d(props, state, inputRef) {
  const toggleState = $3017fa7ffdddec74$export$8042c6c013fd5226({
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isSelected: state.isSelected(props.value),
    onChange(isSelected) {
      if (isSelected) state.addValue(props.value);
      else state.removeValue(props.value);
      if (props.onChange) props.onChange(isSelected);
    }
  });
  let { name, descriptionId, errorMessageId, validationBehavior } = $1ae600c947479353$export$ec98120685d4f57d.get(state);
  var _props_validationBehavior;
  validationBehavior = (_props_validationBehavior = props.validationBehavior) !== null && _props_validationBehavior !== void 0 ? _props_validationBehavior : validationBehavior;
  let { realtimeValidation } = $e5be200c675c3b3a$export$fc1a364ae1f3ff10({
    ...props,
    value: toggleState.isSelected,
    // Server validation is handled at the group level.
    name: void 0,
    validationBehavior: "aria"
  });
  let nativeValidation = reactExports.useRef($e5be200c675c3b3a$export$dad6ae84456c676a);
  let updateValidation = () => {
    state.setInvalid(props.value, realtimeValidation.isInvalid ? realtimeValidation : nativeValidation.current);
  };
  reactExports.useEffect(updateValidation);
  let combinedRealtimeValidation = state.realtimeValidation.isInvalid ? state.realtimeValidation : realtimeValidation;
  let displayValidation = validationBehavior === "native" ? state.displayValidation : combinedRealtimeValidation;
  var _props_isRequired;
  let res = $406796ff087fe49b$export$e375f10ce42261c5({
    ...props,
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isDisabled: props.isDisabled || state.isDisabled,
    name: props.name || name,
    isRequired: (_props_isRequired = props.isRequired) !== null && _props_isRequired !== void 0 ? _props_isRequired : state.isRequired,
    validationBehavior,
    [$e5be200c675c3b3a$export$a763b9476acd3eb]: {
      realtimeValidation: combinedRealtimeValidation,
      displayValidation,
      resetValidation: state.resetValidation,
      commitValidation: state.commitValidation,
      updateValidation(v) {
        nativeValidation.current = v;
        updateValidation();
      }
    }
  }, toggleState, inputRef);
  return {
    ...res,
    inputProps: {
      ...res.inputProps,
      "aria-describedby": [
        props["aria-describedby"],
        state.isInvalid ? errorMessageId : null,
        descriptionId
      ].filter(Boolean).join(" ") || void 0
    }
  };
}
var DEFAULT_SLOT = /* @__PURE__ */ Symbol("default");
function useSlottedContext(context, slot) {
  let ctx = reactExports.useContext(context);
  if (slot === null) {
    return null;
  }
  if (ctx && typeof ctx === "object" && "slots" in ctx && ctx.slots) {
    let availableSlots = new Intl.ListFormat().format(Object.keys(ctx.slots).map((p) => `"${p}"`));
    if (!slot && !ctx.slots[DEFAULT_SLOT]) {
      throw new Error(`A slot prop is required. Valid slot names are ${availableSlots}.`);
    }
    let slotKey = slot || DEFAULT_SLOT;
    if (!ctx.slots[slotKey]) {
      throw new Error(`Invalid slot "${slot}". Valid slot names are ${availableSlots}.`);
    }
    return ctx.slots[slotKey];
  }
  return ctx;
}
function useContextProps(props, ref, context) {
  let ctx = useSlottedContext(context, props.slot) || {};
  let { ref: contextRef, ...contextProps } = ctx;
  let mergedRef = $df56164dff5785e2$export$4338b53315abf666(reactExports.useMemo(() => $5dc95899b306f630$export$c9058316764c140e(ref, contextRef), [ref, contextRef]));
  let mergedProps = $3ef42575df84b30b$export$9d1611c77c2fe928$1(contextProps, props);
  if ("style" in contextProps && contextProps.style && "style" in props && props.style) {
    if (typeof contextProps.style === "function" || typeof props.style === "function") {
      mergedProps.style = (renderProps) => {
        let contextStyle = typeof contextProps.style === "function" ? contextProps.style(renderProps) : contextProps.style;
        let defaultStyle = { ...renderProps.defaultStyle, ...contextStyle };
        let style = typeof props.style === "function" ? props.style({ ...renderProps, defaultStyle }) : props.style;
        return { ...defaultStyle, ...style };
      };
    } else {
      mergedProps.style = { ...contextProps.style, ...props.style };
    }
  }
  return [mergedProps, mergedRef];
}
const $e5be200c675c3b3a$export$571b5131b7e65c11 = reactExports.createContext({});
var FormContext = reactExports.createContext(null);
reactExports.forwardRef(function Form2(props, ref) {
  [props, ref] = useContextProps(props, ref, FormContext);
  let { validationErrors, validationBehavior = "native", children, className, ...domProps } = props;
  const styles = reactExports.useMemo(() => form({ className }), [className]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { noValidate: validationBehavior !== "native", ...domProps, ref, className: styles, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormContext.Provider, { value: { ...props, validationBehavior }, children: /* @__PURE__ */ jsxRuntimeExports.jsx($e5be200c675c3b3a$export$571b5131b7e65c11.Provider, { value: validationErrors != null ? validationErrors : {}, children }) }) });
});
var [CheckboxGroupProvider, useCheckboxGroupContext] = createContext2({
  name: "CheckboxGroupContext",
  strict: false
});
function CheckIcon(props) {
  const { isSelected, disableAnimation, ...otherProps } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { "aria-hidden": "true", role: "presentation", viewBox: "0 0 17 18", ...otherProps, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "polyline",
    {
      fill: "none",
      points: "1 9 7 14 15 4",
      stroke: "currentColor",
      strokeDasharray: 22,
      strokeDashoffset: isSelected ? 44 : 66,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      style: !disableAnimation && isSelected ? {
        transition: "stroke-dashoffset 250ms linear 0.2s"
      } : {}
    }
  ) });
}
function IndeterminateIcon(props) {
  const { isSelected, disableAnimation, ...otherProps } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { stroke: "currentColor", strokeWidth: 3, viewBox: "0 0 24 24", ...otherProps, children: /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", x2: "3", y1: "12", y2: "12" }) });
}
function CheckboxIcon(props) {
  const { isIndeterminate, ...otherProps } = props;
  const BaseIcon = isIndeterminate ? IndeterminateIcon : CheckIcon;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BaseIcon, { ...otherProps });
}
function useCallbackRef(fn, deps = []) {
  const ref = reactExports.useRef(fn);
  useSafeLayoutEffect(() => {
    ref.current = fn;
  });
  return reactExports.useCallback((...args) => {
    var _a;
    return (_a = ref.current) == null ? void 0 : _a.call(ref, ...args);
  }, deps);
}
function useCheckbox(props = {}) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const globalContext = useProviderContext();
  const groupContext = useCheckboxGroupContext();
  const { validationBehavior: formValidationBehavior } = useSlottedContext(FormContext) || {};
  const isInGroup = !!groupContext;
  const {
    as,
    ref,
    value = "",
    children,
    icon,
    name,
    isRequired,
    isReadOnly: isReadOnlyProp = false,
    autoFocus = false,
    isSelected: isSelectedProp,
    size = (_a = groupContext == null ? void 0 : groupContext.size) != null ? _a : "md",
    color = (_b = groupContext == null ? void 0 : groupContext.color) != null ? _b : "primary",
    radius = groupContext == null ? void 0 : groupContext.radius,
    lineThrough = (_c = groupContext == null ? void 0 : groupContext.lineThrough) != null ? _c : false,
    isDisabled: isDisabledProp = (_d = groupContext == null ? void 0 : groupContext.isDisabled) != null ? _d : false,
    disableAnimation = (_f = (_e = groupContext == null ? void 0 : groupContext.disableAnimation) != null ? _e : globalContext == null ? void 0 : globalContext.disableAnimation) != null ? _f : false,
    validationState,
    isInvalid: isInvalidProp = validationState ? validationState === "invalid" : (_g = groupContext == null ? void 0 : groupContext.isInvalid) != null ? _g : false,
    isIndeterminate = false,
    validationBehavior = isInGroup ? groupContext.validationBehavior : (_h = formValidationBehavior != null ? formValidationBehavior : globalContext == null ? void 0 : globalContext.validationBehavior) != null ? _h : "native",
    defaultSelected,
    classNames,
    className,
    onValueChange,
    validate,
    ...otherProps
  } = props;
  const Component = as || "label";
  const domRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  let onChange = props.onChange;
  if (isInGroup) {
    const dispatch = () => {
      groupContext.groupState.resetValidation();
    };
    onChange = $ff5963eb1fccf552$export$e08e3b67e392101e(dispatch, onChange);
  }
  const labelId = reactExports.useId();
  const ariaCheckboxProps = reactExports.useMemo(
    () => ({
      name,
      value,
      children,
      autoFocus,
      defaultSelected,
      isIndeterminate,
      isRequired,
      isInvalid: isInvalidProp,
      isSelected: isSelectedProp,
      isDisabled: isDisabledProp,
      isReadOnly: isReadOnlyProp,
      "aria-label": safeAriaLabel(otherProps["aria-label"], children),
      "aria-labelledby": otherProps["aria-labelledby"] || labelId,
      onChange: onValueChange
    }),
    [
      name,
      value,
      children,
      autoFocus,
      defaultSelected,
      isIndeterminate,
      isRequired,
      isInvalidProp,
      isSelectedProp,
      isDisabledProp,
      isReadOnlyProp,
      otherProps["aria-label"],
      otherProps["aria-labelledby"],
      labelId,
      onValueChange
    ]
  );
  const toggleState = $3017fa7ffdddec74$export$8042c6c013fd5226(ariaCheckboxProps);
  const validationProps = {
    isInvalid: isInvalidProp,
    isRequired,
    validate,
    validationState,
    validationBehavior
  };
  const {
    inputProps,
    isSelected,
    isDisabled,
    isReadOnly,
    isPressed,
    isInvalid: isAriaInvalid
  } = isInGroup ? $fba3e38d5ca8983f$export$353b32fc6898d37d(
    { ...ariaCheckboxProps, ...validationProps },
    groupContext.groupState,
    inputRef
  ) : $406796ff087fe49b$export$e375f10ce42261c5({ ...ariaCheckboxProps, ...validationProps }, toggleState, inputRef);
  const isInteractionDisabled = isDisabled || isReadOnly;
  const isInvalid = validationState === "invalid" || isInvalidProp || isAriaInvalid;
  const pressed = isInteractionDisabled ? false : isPressed;
  const { hoverProps, isHovered } = $6179b936705e76d3$export$ae780daf29e6d456({
    isDisabled: inputProps.disabled
  });
  const { focusProps, isFocused, isFocusVisible } = $f7dceffc5ad7768b$export$4e328f61c538687f({
    autoFocus: inputProps.autoFocus
  });
  const slots = reactExports.useMemo(
    () => checkbox({
      color,
      size,
      radius,
      isInvalid,
      lineThrough,
      isDisabled,
      disableAnimation
    }),
    [color, size, radius, isInvalid, lineThrough, isDisabled, disableAnimation]
  );
  useSafeLayoutEffect(() => {
    if (!inputRef.current)
      return;
    const isInputRefChecked = !!inputRef.current.checked;
    toggleState.setSelected(isInputRefChecked);
  }, [inputRef.current]);
  const onChangeProp = useCallbackRef(onChange);
  const handleCheckboxChange = reactExports.useCallback(
    (event) => {
      if (isReadOnly || isDisabled) {
        event.preventDefault();
        return;
      }
      onChangeProp == null ? void 0 : onChangeProp(event);
    },
    [isReadOnly, isDisabled, onChangeProp]
  );
  const baseStyles = clsx(classNames == null ? void 0 : classNames.base, className);
  const getBaseProps = reactExports.useCallback(() => {
    return {
      ref: domRef,
      className: slots.base({ class: baseStyles }),
      "data-disabled": dataAttr(isDisabled),
      "data-selected": dataAttr(isSelected || isIndeterminate),
      "data-invalid": dataAttr(isInvalid),
      "data-hover": dataAttr(isHovered),
      "data-focus": dataAttr(isFocused),
      "data-pressed": dataAttr(pressed),
      "data-readonly": dataAttr(inputProps.readOnly),
      "data-focus-visible": dataAttr(isFocusVisible),
      "data-indeterminate": dataAttr(isIndeterminate),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(hoverProps, otherProps)
    };
  }, [
    slots,
    baseStyles,
    isDisabled,
    isSelected,
    isIndeterminate,
    isInvalid,
    isHovered,
    isFocused,
    pressed,
    inputProps.readOnly,
    isFocusVisible,
    hoverProps,
    otherProps
  ]);
  const getWrapperProps = reactExports.useCallback(
    (props2 = {}) => {
      return {
        ...props2,
        "aria-hidden": true,
        className: clsx(slots.wrapper({ class: clsx(classNames == null ? void 0 : classNames.wrapper, props2 == null ? void 0 : props2.className) }))
      };
    },
    [slots, classNames == null ? void 0 : classNames.wrapper]
  );
  const getInputProps = reactExports.useCallback(() => {
    return {
      ref: mergeRefs(inputRef, ref),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(inputProps, focusProps),
      className: slots.hiddenInput({ class: classNames == null ? void 0 : classNames.hiddenInput }),
      onChange: $ff5963eb1fccf552$export$e08e3b67e392101e(inputProps.onChange, handleCheckboxChange)
    };
  }, [inputProps, focusProps, handleCheckboxChange, classNames == null ? void 0 : classNames.hiddenInput]);
  const getLabelProps = reactExports.useCallback(
    () => ({
      id: labelId,
      className: slots.label({ class: classNames == null ? void 0 : classNames.label })
    }),
    [slots, classNames == null ? void 0 : classNames.label, isDisabled, isSelected, isInvalid]
  );
  const getIconProps = reactExports.useCallback(
    () => ({
      isSelected,
      isIndeterminate,
      disableAnimation,
      className: slots.icon({ class: classNames == null ? void 0 : classNames.icon })
    }),
    [slots, classNames == null ? void 0 : classNames.icon, isSelected, isIndeterminate, disableAnimation]
  );
  return {
    Component,
    icon,
    children,
    isSelected,
    isDisabled,
    isInvalid,
    isFocused,
    isHovered,
    isFocusVisible,
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getLabelProps,
    getIconProps
  };
}
var Checkbox = forwardRef((props, ref) => {
  const {
    Component,
    children,
    icon = /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIcon, {}),
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getIconProps,
    getLabelProps
  } = useCheckbox({ ...props, ref });
  const clonedIcon = typeof icon === "function" ? icon(getIconProps()) : reactExports.cloneElement(icon, getIconProps());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Component, { ...getBaseProps(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...getInputProps() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { ...getWrapperProps(), children: clonedIcon }),
    children && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { ...getLabelProps(), children })
  ] });
});
Checkbox.displayName = "HeroUI.Checkbox";
var checkbox_default = Checkbox;
class $657e4dc4a6e88df0$export$8f5ed9ff9f511381 {
  getItemRect(key) {
    let container = this.ref.current;
    if (!container) return null;
    let item = key != null ? container.querySelector(`[data-key="${CSS.escape(key.toString())}"]`) : null;
    if (!item) return null;
    let containerRect = container.getBoundingClientRect();
    let itemRect = item.getBoundingClientRect();
    return {
      x: itemRect.left - containerRect.left + container.scrollLeft,
      y: itemRect.top - containerRect.top + container.scrollTop,
      width: itemRect.width,
      height: itemRect.height
    };
  }
  getContentSize() {
    let container = this.ref.current;
    var _container_scrollWidth, _container_scrollHeight;
    return {
      width: (_container_scrollWidth = container === null || container === void 0 ? void 0 : container.scrollWidth) !== null && _container_scrollWidth !== void 0 ? _container_scrollWidth : 0,
      height: (_container_scrollHeight = container === null || container === void 0 ? void 0 : container.scrollHeight) !== null && _container_scrollHeight !== void 0 ? _container_scrollHeight : 0
    };
  }
  getVisibleRect() {
    let container = this.ref.current;
    var _container_scrollLeft, _container_scrollTop, _container_offsetWidth, _container_offsetHeight;
    return {
      x: (_container_scrollLeft = container === null || container === void 0 ? void 0 : container.scrollLeft) !== null && _container_scrollLeft !== void 0 ? _container_scrollLeft : 0,
      y: (_container_scrollTop = container === null || container === void 0 ? void 0 : container.scrollTop) !== null && _container_scrollTop !== void 0 ? _container_scrollTop : 0,
      width: (_container_offsetWidth = container === null || container === void 0 ? void 0 : container.offsetWidth) !== null && _container_offsetWidth !== void 0 ? _container_offsetWidth : 0,
      height: (_container_offsetHeight = container === null || container === void 0 ? void 0 : container.offsetHeight) !== null && _container_offsetHeight !== void 0 ? _container_offsetHeight : 0
    };
  }
  constructor(ref) {
    this.ref = ref;
  }
}
const $2140fb2337097f2d$export$552312adfd451dab = /* @__PURE__ */ new WeakMap();
function $2140fb2337097f2d$var$normalizeKey(key) {
  if (typeof key === "string") return key.replace(/\s*/g, "");
  return "" + key;
}
function $2140fb2337097f2d$export$37cd4213f2ad742e(state, columnKey) {
  let gridId = $2140fb2337097f2d$export$552312adfd451dab.get(state);
  if (!gridId) throw new Error("Unknown grid");
  return `${gridId}-${$2140fb2337097f2d$var$normalizeKey(columnKey)}`;
}
function $2140fb2337097f2d$export$19baff3266315d44(state, rowKey, columnKey) {
  let gridId = $2140fb2337097f2d$export$552312adfd451dab.get(state);
  if (!gridId) throw new Error("Unknown grid");
  return `${gridId}-${$2140fb2337097f2d$var$normalizeKey(rowKey)}-${$2140fb2337097f2d$var$normalizeKey(columnKey)}`;
}
function $2140fb2337097f2d$export$85069b70317f543(state, rowKey) {
  return [
    ...state.collection.rowHeaderColumnKeys
  ].map((columnKey) => $2140fb2337097f2d$export$19baff3266315d44(state, rowKey, columnKey)).join(" ");
}
var $ce3de3ff2fd66848$exports = {};
$ce3de3ff2fd66848$exports = {
  "ascending": `تصاعدي`,
  "ascendingSort": (args) => `ترتيب حسب العمود ${args.columnName} بترتيب تصاعدي`,
  "columnSize": (args) => `${args.value} بالبكسل`,
  "descending": `تنازلي`,
  "descendingSort": (args) => `ترتيب حسب العمود ${args.columnName} بترتيب تنازلي`,
  "resizerDescription": `اضغط على مفتاح Enter لبدء تغيير الحجم`,
  "select": `تحديد`,
  "selectAll": `تحديد الكل`,
  "sortable": `عمود قابل للترتيب`
};
var $cb80dcce530985b9$exports = {};
$cb80dcce530985b9$exports = {
  "ascending": `възходящ`,
  "ascendingSort": (args) => `сортирано по колона ${args.columnName} във възходящ ред`,
  "columnSize": (args) => `${args.value} пиксела`,
  "descending": `низходящ`,
  "descendingSort": (args) => `сортирано по колона ${args.columnName} в низходящ ред`,
  "resizerDescription": `Натиснете „Enter“, за да започнете да преоразмерявате`,
  "select": `Изберете`,
  "selectAll": `Изберете всичко`,
  "sortable": `сортираща колона`
};
var $68ac86749db4c0fb$exports = {};
$68ac86749db4c0fb$exports = {
  "ascending": `vzestupně`,
  "ascendingSort": (args) => `řazeno vzestupně podle sloupce ${args.columnName}`,
  "columnSize": (args) => `${args.value} pixelů`,
  "descending": `sestupně`,
  "descendingSort": (args) => `řazeno sestupně podle sloupce ${args.columnName}`,
  "resizerDescription": `Stisknutím klávesy Enter začnete měnit velikost`,
  "select": `Vybrat`,
  "selectAll": `Vybrat vše`,
  "sortable": `sloupec s možností řazení`
};
var $9a6cbac08487e661$exports = {};
$9a6cbac08487e661$exports = {
  "ascending": `stigende`,
  "ascendingSort": (args) => `sorteret efter kolonne ${args.columnName} i stigende rækkefølge`,
  "columnSize": (args) => `${args.value} pixels`,
  "descending": `faldende`,
  "descendingSort": (args) => `sorteret efter kolonne ${args.columnName} i faldende rækkefølge`,
  "resizerDescription": `Tryk på Enter for at ændre størrelse`,
  "select": `Vælg`,
  "selectAll": `Vælg alle`,
  "sortable": `sorterbar kolonne`
};
var $c963661d89486e72$exports = {};
$c963661d89486e72$exports = {
  "ascending": `aufsteigend`,
  "ascendingSort": (args) => `sortiert nach Spalte ${args.columnName} in aufsteigender Reihenfolge`,
  "columnSize": (args) => `${args.value} Pixel`,
  "descending": `absteigend`,
  "descendingSort": (args) => `sortiert nach Spalte ${args.columnName} in absteigender Reihenfolge`,
  "resizerDescription": `Eingabetaste zum Starten der Größenänderung drücken`,
  "select": `Auswählen`,
  "selectAll": `Alles auswählen`,
  "sortable": `sortierbare Spalte`
};
var $ac03861c6e8605f4$exports = {};
$ac03861c6e8605f4$exports = {
  "ascending": `αύξουσα`,
  "ascendingSort": (args) => `διαλογή ανά στήλη ${args.columnName} σε αύξουσα σειρά`,
  "columnSize": (args) => `${args.value} pixel`,
  "descending": `φθίνουσα`,
  "descendingSort": (args) => `διαλογή ανά στήλη ${args.columnName} σε φθίνουσα σειρά`,
  "resizerDescription": `Πατήστε Enter για έναρξη της αλλαγής μεγέθους`,
  "select": `Επιλογή`,
  "selectAll": `Επιλογή όλων`,
  "sortable": `Στήλη διαλογής`
};
var $09e6b82e0d6e466a$exports = {};
$09e6b82e0d6e466a$exports = {
  "select": `Select`,
  "selectAll": `Select All`,
  "sortable": `sortable column`,
  "ascending": `ascending`,
  "descending": `descending`,
  "ascendingSort": (args) => `sorted by column ${args.columnName} in ascending order`,
  "descendingSort": (args) => `sorted by column ${args.columnName} in descending order`,
  "columnSize": (args) => `${args.value} pixels`,
  "resizerDescription": `Press Enter to start resizing`
};
var $8cc39eb66c2bf220$exports = {};
$8cc39eb66c2bf220$exports = {
  "ascending": `de subida`,
  "ascendingSort": (args) => `ordenado por columna ${args.columnName} en orden de subida`,
  "columnSize": (args) => `${args.value} píxeles`,
  "descending": `de bajada`,
  "descendingSort": (args) => `ordenado por columna ${args.columnName} en orden de bajada`,
  "resizerDescription": `Pulse Intro para empezar a redimensionar`,
  "select": `Seleccionar`,
  "selectAll": `Seleccionar todos`,
  "sortable": `columna ordenable`
};
var $4e11db3c25a38112$exports = {};
$4e11db3c25a38112$exports = {
  "ascending": `tõusev järjestus`,
  "ascendingSort": (args) => `sorditud veeru järgi ${args.columnName} tõusvas järjestuses`,
  "columnSize": (args) => `${args.value} pikslit`,
  "descending": `laskuv järjestus`,
  "descendingSort": (args) => `sorditud veeru järgi ${args.columnName} laskuvas järjestuses`,
  "resizerDescription": `Suuruse muutmise alustamiseks vajutage klahvi Enter`,
  "select": `Vali`,
  "selectAll": `Vali kõik`,
  "sortable": `sorditav veerg`
};
var $da1e751a92575e02$exports = {};
$da1e751a92575e02$exports = {
  "ascending": `nouseva`,
  "ascendingSort": (args) => `lajiteltu sarakkeen ${args.columnName} mukaan nousevassa järjestyksessä`,
  "columnSize": (args) => `${args.value} pikseliä`,
  "descending": `laskeva`,
  "descendingSort": (args) => `lajiteltu sarakkeen ${args.columnName} mukaan laskevassa järjestyksessä`,
  "resizerDescription": `Aloita koon muutos painamalla Enter-näppäintä`,
  "select": `Valitse`,
  "selectAll": `Valitse kaikki`,
  "sortable": `lajiteltava sarake`
};
var $1b5d6c6c47d55106$exports = {};
$1b5d6c6c47d55106$exports = {
  "ascending": `croissant`,
  "ascendingSort": (args) => `trié en fonction de la colonne ${args.columnName} par ordre croissant`,
  "columnSize": (args) => `${args.value} pixels`,
  "descending": `décroissant`,
  "descendingSort": (args) => `trié en fonction de la colonne ${args.columnName} par ordre décroissant`,
  "resizerDescription": `Appuyez sur Entrée pour commencer le redimensionnement.`,
  "select": `Sélectionner`,
  "selectAll": `Sélectionner tout`,
  "sortable": `colonne triable`
};
var $7c18ba27b86d3308$exports = {};
$7c18ba27b86d3308$exports = {
  "ascending": `עולה`,
  "ascendingSort": (args) => `מוין לפי עמודה ${args.columnName} בסדר עולה`,
  "columnSize": (args) => `${args.value} פיקסלים`,
  "descending": `יורד`,
  "descendingSort": (args) => `מוין לפי עמודה ${args.columnName} בסדר יורד`,
  "resizerDescription": `הקש Enter כדי לשנות את הגודל`,
  "select": `בחר`,
  "selectAll": `בחר הכול`,
  "sortable": `עמודה שניתן למיין`
};
var $2cb40998e20e8a46$exports = {};
$2cb40998e20e8a46$exports = {
  "ascending": `rastući`,
  "ascendingSort": (args) => `razvrstano po stupcima ${args.columnName} rastućem redoslijedom`,
  "columnSize": (args) => `${args.value} piksela`,
  "descending": `padajući`,
  "descendingSort": (args) => `razvrstano po stupcima ${args.columnName} padajućim redoslijedom`,
  "resizerDescription": `Pritisnite Enter da biste započeli promenu veličine`,
  "select": `Odaberite`,
  "selectAll": `Odaberite sve`,
  "sortable": `stupac koji se može razvrstati`
};
var $189e23eec1d6aa3a$exports = {};
$189e23eec1d6aa3a$exports = {
  "ascending": `növekvő`,
  "ascendingSort": (args) => `rendezve a(z) ${args.columnName} oszlop szerint, növekvő sorrendben`,
  "columnSize": (args) => `${args.value} képpont`,
  "descending": `csökkenő`,
  "descendingSort": (args) => `rendezve a(z) ${args.columnName} oszlop szerint, csökkenő sorrendben`,
  "resizerDescription": `Nyomja le az Enter billentyűt az átméretezés megkezdéséhez`,
  "select": `Kijelölés`,
  "selectAll": `Összes kijelölése`,
  "sortable": `rendezendő oszlop`
};
var $3c5ec8e4f015dfd0$exports = {};
$3c5ec8e4f015dfd0$exports = {
  "ascending": `crescente`,
  "ascendingSort": (args) => `in ordine crescente in base alla colonna ${args.columnName}`,
  "columnSize": (args) => `${args.value} pixel`,
  "descending": `decrescente`,
  "descendingSort": (args) => `in ordine decrescente in base alla colonna ${args.columnName}`,
  "resizerDescription": `Premi Invio per iniziare a ridimensionare`,
  "select": `Seleziona`,
  "selectAll": `Seleziona tutto`,
  "sortable": `colonna ordinabile`
};
var $d021d50e6b315ebb$exports = {};
$d021d50e6b315ebb$exports = {
  "ascending": `昇順`,
  "ascendingSort": (args) => `列 ${args.columnName} を昇順で並べ替え`,
  "columnSize": (args) => `${args.value} ピクセル`,
  "descending": `降順`,
  "descendingSort": (args) => `列 ${args.columnName} を降順で並べ替え`,
  "resizerDescription": `Enter キーを押してサイズ変更を開始`,
  "select": `選択`,
  "selectAll": `すべて選択`,
  "sortable": `並べ替え可能な列`
};
var $52535c35c24ec937$exports = {};
$52535c35c24ec937$exports = {
  "ascending": `오름차순`,
  "ascendingSort": (args) => `${args.columnName} 열을 기준으로 오름차순으로 정렬됨`,
  "columnSize": (args) => `${args.value} 픽셀`,
  "descending": `내림차순`,
  "descendingSort": (args) => `${args.columnName} 열을 기준으로 내림차순으로 정렬됨`,
  "resizerDescription": `크기 조정을 시작하려면 Enter를 누르세요.`,
  "select": `선택`,
  "selectAll": `모두 선택`,
  "sortable": `정렬 가능한 열`
};
var $b37ee03672edfd1d$exports = {};
$b37ee03672edfd1d$exports = {
  "ascending": `didėjančia tvarka`,
  "ascendingSort": (args) => `surikiuota pagal stulpelį ${args.columnName} didėjančia tvarka`,
  "columnSize": (args) => `${args.value} piks.`,
  "descending": `mažėjančia tvarka`,
  "descendingSort": (args) => `surikiuota pagal stulpelį ${args.columnName} mažėjančia tvarka`,
  "resizerDescription": `Paspauskite „Enter“, kad pradėtumėte keisti dydį`,
  "select": `Pasirinkti`,
  "selectAll": `Pasirinkti viską`,
  "sortable": `rikiuojamas stulpelis`
};
var $c7df6686b4189d56$exports = {};
$c7df6686b4189d56$exports = {
  "ascending": `augošā secībā`,
  "ascendingSort": (args) => `kārtots pēc kolonnas ${args.columnName} augošā secībā`,
  "columnSize": (args) => `${args.value} pikseļi`,
  "descending": `dilstošā secībā`,
  "descendingSort": (args) => `kārtots pēc kolonnas ${args.columnName} dilstošā secībā`,
  "resizerDescription": `Nospiediet Enter, lai sāktu izmēru mainīšanu`,
  "select": `Atlasīt`,
  "selectAll": `Atlasīt visu`,
  "sortable": `kārtojamā kolonna`
};
var $da07fe8ec87e6b68$exports = {};
$da07fe8ec87e6b68$exports = {
  "ascending": `stigende`,
  "ascendingSort": (args) => `sortert etter kolonne ${args.columnName} i stigende rekkefølge`,
  "columnSize": (args) => `${args.value} piksler`,
  "descending": `synkende`,
  "descendingSort": (args) => `sortert etter kolonne ${args.columnName} i synkende rekkefølge`,
  "resizerDescription": `Trykk på Enter for å starte størrelsesendring`,
  "select": `Velg`,
  "selectAll": `Velg alle`,
  "sortable": `kolonne som kan sorteres`
};
var $64b7e390f5791490$exports = {};
$64b7e390f5791490$exports = {
  "ascending": `oplopend`,
  "ascendingSort": (args) => `gesorteerd in oplopende volgorde in kolom ${args.columnName}`,
  "columnSize": (args) => `${args.value} pixels`,
  "descending": `aflopend`,
  "descendingSort": (args) => `gesorteerd in aflopende volgorde in kolom ${args.columnName}`,
  "resizerDescription": `Druk op Enter om het formaat te wijzigen`,
  "select": `Selecteren`,
  "selectAll": `Alles selecteren`,
  "sortable": `sorteerbare kolom`
};
var $2a03621e773f1678$exports = {};
$2a03621e773f1678$exports = {
  "ascending": `rosnąco`,
  "ascendingSort": (args) => `posortowano według kolumny ${args.columnName} w porządku rosnącym`,
  "columnSize": (args) => `Liczba pikseli: ${args.value}`,
  "descending": `malejąco`,
  "descendingSort": (args) => `posortowano według kolumny ${args.columnName} w porządku malejącym`,
  "resizerDescription": `Naciśnij Enter, aby rozpocząć zmienianie rozmiaru`,
  "select": `Zaznacz`,
  "selectAll": `Zaznacz wszystko`,
  "sortable": `kolumna z możliwością sortowania`
};
var $0a79c0aba9e5ecc6$exports = {};
$0a79c0aba9e5ecc6$exports = {
  "ascending": `crescente`,
  "ascendingSort": (args) => `classificado pela coluna ${args.columnName} em ordem crescente`,
  "columnSize": (args) => `${args.value} pixels`,
  "descending": `decrescente`,
  "descendingSort": (args) => `classificado pela coluna ${args.columnName} em ordem decrescente`,
  "resizerDescription": `Pressione Enter para começar a redimensionar`,
  "select": `Selecionar`,
  "selectAll": `Selecionar tudo`,
  "sortable": `coluna classificável`
};
var $de7b4d0f7dc86fc8$exports = {};
$de7b4d0f7dc86fc8$exports = {
  "ascending": `ascendente`,
  "ascendingSort": (args) => `Ordenar por coluna ${args.columnName} em ordem ascendente`,
  "columnSize": (args) => `${args.value} pixels`,
  "descending": `descendente`,
  "descendingSort": (args) => `Ordenar por coluna ${args.columnName} em ordem descendente`,
  "resizerDescription": `Prima Enter para iniciar o redimensionamento`,
  "select": `Selecionar`,
  "selectAll": `Selecionar tudo`,
  "sortable": `Coluna ordenável`
};
var $28ea7e849d77bd1c$exports = {};
$28ea7e849d77bd1c$exports = {
  "ascending": `crescătoare`,
  "ascendingSort": (args) => `sortate după coloana ${args.columnName} în ordine crescătoare`,
  "columnSize": (args) => `${args.value} pixeli`,
  "descending": `descrescătoare`,
  "descendingSort": (args) => `sortate după coloana ${args.columnName} în ordine descrescătoare`,
  "resizerDescription": `Apăsați pe Enter pentru a începe redimensionarea`,
  "select": `Selectare`,
  "selectAll": `Selectare totală`,
  "sortable": `coloană sortabilă`
};
var $9a09321cf046b187$exports = {};
$9a09321cf046b187$exports = {
  "ascending": `возрастание`,
  "ascendingSort": (args) => `сортировать столбец ${args.columnName} в порядке возрастания`,
  "columnSize": (args) => `${args.value} пикс.`,
  "descending": `убывание`,
  "descendingSort": (args) => `сортировать столбец ${args.columnName} в порядке убывания`,
  "resizerDescription": `Нажмите клавишу Enter для начала изменения размеров`,
  "select": `Выбрать`,
  "selectAll": `Выбрать все`,
  "sortable": `сортируемый столбец`
};
var $5afe469a63fcac7b$exports = {};
$5afe469a63fcac7b$exports = {
  "ascending": `vzostupne`,
  "ascendingSort": (args) => `zoradené zostupne podľa stĺpca ${args.columnName}`,
  "columnSize": (args) => `Počet pixelov: ${args.value}`,
  "descending": `zostupne`,
  "descendingSort": (args) => `zoradené zostupne podľa stĺpca ${args.columnName}`,
  "resizerDescription": `Stlačením klávesu Enter začnete zmenu veľkosti`,
  "select": `Vybrať`,
  "selectAll": `Vybrať všetko`,
  "sortable": `zoraditeľný stĺpec`
};
var $2956757ac31a7ce2$exports = {};
$2956757ac31a7ce2$exports = {
  "ascending": `naraščajoče`,
  "ascendingSort": (args) => `razvrščeno po stolpcu ${args.columnName} v naraščajočem vrstnem redu`,
  "columnSize": (args) => `${args.value} slikovnih pik`,
  "descending": `padajoče`,
  "descendingSort": (args) => `razvrščeno po stolpcu ${args.columnName} v padajočem vrstnem redu`,
  "resizerDescription": `Pritisnite tipko Enter da začnete spreminjati velikost`,
  "select": `Izberite`,
  "selectAll": `Izberite vse`,
  "sortable": `razvrstljivi stolpec`
};
var $cedee0e66b175529$exports = {};
$cedee0e66b175529$exports = {
  "ascending": `rastući`,
  "ascendingSort": (args) => `sortirano po kolonama ${args.columnName} rastućim redosledom`,
  "columnSize": (args) => `${args.value} piksela`,
  "descending": `padajući`,
  "descendingSort": (args) => `sortirano po kolonama ${args.columnName} padajućim redosledom`,
  "resizerDescription": `Pritisnite Enter da biste započeli promenu veličine`,
  "select": `Izaberite`,
  "selectAll": `Izaberite sve`,
  "sortable": `kolona koja se može sortirati`
};
var $6db19998ba4427da$exports = {};
$6db19998ba4427da$exports = {
  "ascending": `stigande`,
  "ascendingSort": (args) => `sorterat på kolumn ${args.columnName} i stigande ordning`,
  "columnSize": (args) => `${args.value} pixlar`,
  "descending": `fallande`,
  "descendingSort": (args) => `sorterat på kolumn ${args.columnName} i fallande ordning`,
  "resizerDescription": `Tryck på Retur för att börja ändra storlek`,
  "select": `Markera`,
  "selectAll": `Markera allt`,
  "sortable": `sorterbar kolumn`
};
var $166b7c9cc1adb1a1$exports = {};
$166b7c9cc1adb1a1$exports = {
  "ascending": `artan sırada`,
  "ascendingSort": (args) => `${args.columnName} sütuna göre artan düzende sırala`,
  "columnSize": (args) => `${args.value} piksel`,
  "descending": `azalan sırada`,
  "descendingSort": (args) => `${args.columnName} sütuna göre azalan düzende sırala`,
  "resizerDescription": `Yeniden boyutlandırmak için Enter'a basın`,
  "select": `Seç`,
  "selectAll": `Tümünü Seç`,
  "sortable": `Sıralanabilir sütun`
};
var $c7ab180b401e49ff$exports = {};
$c7ab180b401e49ff$exports = {
  "ascending": `висхідний`,
  "ascendingSort": (args) => `відсортовано за стовпцем ${args.columnName} у висхідному порядку`,
  "columnSize": (args) => `${args.value} пікс.`,
  "descending": `низхідний`,
  "descendingSort": (args) => `відсортовано за стовпцем ${args.columnName} у низхідному порядку`,
  "resizerDescription": `Натисніть Enter, щоб почати зміну розміру`,
  "select": `Вибрати`,
  "selectAll": `Вибрати все`,
  "sortable": `сортувальний стовпець`
};
var $1648ec00941567f3$exports = {};
$1648ec00941567f3$exports = {
  "ascending": `升序`,
  "ascendingSort": (args) => `按列 ${args.columnName} 升序排序`,
  "columnSize": (args) => `${args.value} 像素`,
  "descending": `降序`,
  "descendingSort": (args) => `按列 ${args.columnName} 降序排序`,
  "resizerDescription": `按“输入”键开始调整大小。`,
  "select": `选择`,
  "selectAll": `全选`,
  "sortable": `可排序的列`
};
var $b26f22384b3c1526$exports = {};
$b26f22384b3c1526$exports = {
  "ascending": `遞增`,
  "ascendingSort": (args) => `已依據「${args.columnName}」欄遞增排序`,
  "columnSize": (args) => `${args.value} 像素`,
  "descending": `遞減`,
  "descendingSort": (args) => `已依據「${args.columnName}」欄遞減排序`,
  "resizerDescription": `按 Enter 鍵以開始調整大小`,
  "select": `選取`,
  "selectAll": `全選`,
  "sortable": `可排序的欄`
};
var $7476b46781682bf5$exports = {};
$7476b46781682bf5$exports = {
  "ar-AE": $ce3de3ff2fd66848$exports,
  "bg-BG": $cb80dcce530985b9$exports,
  "cs-CZ": $68ac86749db4c0fb$exports,
  "da-DK": $9a6cbac08487e661$exports,
  "de-DE": $c963661d89486e72$exports,
  "el-GR": $ac03861c6e8605f4$exports,
  "en-US": $09e6b82e0d6e466a$exports,
  "es-ES": $8cc39eb66c2bf220$exports,
  "et-EE": $4e11db3c25a38112$exports,
  "fi-FI": $da1e751a92575e02$exports,
  "fr-FR": $1b5d6c6c47d55106$exports,
  "he-IL": $7c18ba27b86d3308$exports,
  "hr-HR": $2cb40998e20e8a46$exports,
  "hu-HU": $189e23eec1d6aa3a$exports,
  "it-IT": $3c5ec8e4f015dfd0$exports,
  "ja-JP": $d021d50e6b315ebb$exports,
  "ko-KR": $52535c35c24ec937$exports,
  "lt-LT": $b37ee03672edfd1d$exports,
  "lv-LV": $c7df6686b4189d56$exports,
  "nb-NO": $da07fe8ec87e6b68$exports,
  "nl-NL": $64b7e390f5791490$exports,
  "pl-PL": $2a03621e773f1678$exports,
  "pt-BR": $0a79c0aba9e5ecc6$exports,
  "pt-PT": $de7b4d0f7dc86fc8$exports,
  "ro-RO": $28ea7e849d77bd1c$exports,
  "ru-RU": $9a09321cf046b187$exports,
  "sk-SK": $5afe469a63fcac7b$exports,
  "sl-SI": $2956757ac31a7ce2$exports,
  "sr-SP": $cedee0e66b175529$exports,
  "sv-SE": $6db19998ba4427da$exports,
  "tr-TR": $166b7c9cc1adb1a1$exports,
  "uk-UA": $c7ab180b401e49ff$exports,
  "zh-CN": $1648ec00941567f3$exports,
  "zh-TW": $b26f22384b3c1526$exports
};
class $d1c300d9c497e402$export$de9feff04fda126e {
  isCell(node) {
    return node.type === "cell";
  }
  isRow(node) {
    return node.type === "row" || node.type === "item";
  }
  isDisabled(item) {
    var _item_props;
    return this.disabledBehavior === "all" && (((_item_props = item.props) === null || _item_props === void 0 ? void 0 : _item_props.isDisabled) || this.disabledKeys.has(item.key));
  }
  findPreviousKey(fromKey, pred) {
    let key = fromKey != null ? this.collection.getKeyBefore(fromKey) : this.collection.getLastKey();
    while (key != null) {
      let item = this.collection.getItem(key);
      if (!item) return null;
      if (!this.isDisabled(item) && (!pred || pred(item))) return key;
      key = this.collection.getKeyBefore(key);
    }
    return null;
  }
  findNextKey(fromKey, pred) {
    let key = fromKey != null ? this.collection.getKeyAfter(fromKey) : this.collection.getFirstKey();
    while (key != null) {
      let item = this.collection.getItem(key);
      if (!item) return null;
      if (!this.isDisabled(item) && (!pred || pred(item))) return key;
      key = this.collection.getKeyAfter(key);
      if (key == null) return null;
    }
    return null;
  }
  getKeyBelow(fromKey) {
    let key = fromKey;
    let startItem = this.collection.getItem(key);
    if (!startItem) return null;
    var _startItem_parentKey;
    if (this.isCell(startItem)) key = (_startItem_parentKey = startItem.parentKey) !== null && _startItem_parentKey !== void 0 ? _startItem_parentKey : null;
    if (key == null) return null;
    key = this.findNextKey(key, (item) => item.type === "item");
    if (key != null) {
      if (this.isCell(startItem)) {
        var _getNthItem;
        let item = this.collection.getItem(key);
        if (!item) return null;
        var _startItem_index, _getNthItem_key;
        return (_getNthItem_key = (_getNthItem = $c5a24bc478652b5f$export$5f3398f8733f90e2($c5a24bc478652b5f$export$1005530eda016c13(item, this.collection), (_startItem_index = startItem.index) !== null && _startItem_index !== void 0 ? _startItem_index : 0)) === null || _getNthItem === void 0 ? void 0 : _getNthItem.key) !== null && _getNthItem_key !== void 0 ? _getNthItem_key : null;
      }
      if (this.focusMode === "row") return key;
    }
    return null;
  }
  getKeyAbove(fromKey) {
    let key = fromKey;
    let startItem = this.collection.getItem(key);
    if (!startItem) return null;
    var _startItem_parentKey;
    if (this.isCell(startItem)) key = (_startItem_parentKey = startItem.parentKey) !== null && _startItem_parentKey !== void 0 ? _startItem_parentKey : null;
    if (key == null) return null;
    key = this.findPreviousKey(key, (item) => item.type === "item");
    if (key != null) {
      if (this.isCell(startItem)) {
        var _getNthItem;
        let item = this.collection.getItem(key);
        if (!item) return null;
        var _startItem_index;
        return ((_getNthItem = $c5a24bc478652b5f$export$5f3398f8733f90e2($c5a24bc478652b5f$export$1005530eda016c13(item, this.collection), (_startItem_index = startItem.index) !== null && _startItem_index !== void 0 ? _startItem_index : 0)) === null || _getNthItem === void 0 ? void 0 : _getNthItem.key) || null;
      }
      if (this.focusMode === "row") return key;
    }
    return null;
  }
  getKeyRightOf(key) {
    let item = this.collection.getItem(key);
    if (!item) return null;
    if (this.isRow(item)) {
      var _getLastItem, _getFirstItem;
      let children = $c5a24bc478652b5f$export$1005530eda016c13(item, this.collection);
      var _ref;
      return (_ref = this.direction === "rtl" ? (_getLastItem = $c5a24bc478652b5f$export$7475b2c64539e4cf(children)) === null || _getLastItem === void 0 ? void 0 : _getLastItem.key : (_getFirstItem = $c5a24bc478652b5f$export$fbdeaa6a76694f71(children)) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key) !== null && _ref !== void 0 ? _ref : null;
    }
    if (this.isCell(item) && item.parentKey != null) {
      let parent = this.collection.getItem(item.parentKey);
      if (!parent) return null;
      let children = $c5a24bc478652b5f$export$1005530eda016c13(parent, this.collection);
      var _ref1;
      let next = (_ref1 = this.direction === "rtl" ? $c5a24bc478652b5f$export$5f3398f8733f90e2(children, item.index - 1) : $c5a24bc478652b5f$export$5f3398f8733f90e2(children, item.index + 1)) !== null && _ref1 !== void 0 ? _ref1 : null;
      var _next_key;
      if (next) return (_next_key = next.key) !== null && _next_key !== void 0 ? _next_key : null;
      var _item_parentKey;
      if (this.focusMode === "row") return (_item_parentKey = item.parentKey) !== null && _item_parentKey !== void 0 ? _item_parentKey : null;
      var _ref2;
      return (_ref2 = this.direction === "rtl" ? this.getFirstKey(key) : this.getLastKey(key)) !== null && _ref2 !== void 0 ? _ref2 : null;
    }
    return null;
  }
  getKeyLeftOf(key) {
    let item = this.collection.getItem(key);
    if (!item) return null;
    if (this.isRow(item)) {
      var _getFirstItem, _getLastItem;
      let children = $c5a24bc478652b5f$export$1005530eda016c13(item, this.collection);
      var _ref;
      return (_ref = this.direction === "rtl" ? (_getFirstItem = $c5a24bc478652b5f$export$fbdeaa6a76694f71(children)) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key : (_getLastItem = $c5a24bc478652b5f$export$7475b2c64539e4cf(children)) === null || _getLastItem === void 0 ? void 0 : _getLastItem.key) !== null && _ref !== void 0 ? _ref : null;
    }
    if (this.isCell(item) && item.parentKey != null) {
      let parent = this.collection.getItem(item.parentKey);
      if (!parent) return null;
      let children = $c5a24bc478652b5f$export$1005530eda016c13(parent, this.collection);
      var _ref1;
      let prev = (_ref1 = this.direction === "rtl" ? $c5a24bc478652b5f$export$5f3398f8733f90e2(children, item.index + 1) : $c5a24bc478652b5f$export$5f3398f8733f90e2(children, item.index - 1)) !== null && _ref1 !== void 0 ? _ref1 : null;
      var _prev_key;
      if (prev) return (_prev_key = prev.key) !== null && _prev_key !== void 0 ? _prev_key : null;
      var _item_parentKey;
      if (this.focusMode === "row") return (_item_parentKey = item.parentKey) !== null && _item_parentKey !== void 0 ? _item_parentKey : null;
      var _ref2;
      return (_ref2 = this.direction === "rtl" ? this.getLastKey(key) : this.getFirstKey(key)) !== null && _ref2 !== void 0 ? _ref2 : null;
    }
    return null;
  }
  getFirstKey(fromKey, global) {
    let key = fromKey !== null && fromKey !== void 0 ? fromKey : null;
    let item;
    if (key != null) {
      item = this.collection.getItem(key);
      if (!item) return null;
      if (this.isCell(item) && !global && item.parentKey != null) {
        var _getFirstItem;
        let parent = this.collection.getItem(item.parentKey);
        if (!parent) return null;
        var _getFirstItem_key;
        return (_getFirstItem_key = (_getFirstItem = $c5a24bc478652b5f$export$fbdeaa6a76694f71($c5a24bc478652b5f$export$1005530eda016c13(parent, this.collection))) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key) !== null && _getFirstItem_key !== void 0 ? _getFirstItem_key : null;
      }
    }
    key = this.findNextKey(void 0, (item2) => item2.type === "item");
    if (key != null && (item && this.isCell(item) && global || this.focusMode === "cell")) {
      var _getFirstItem1;
      let item2 = this.collection.getItem(key);
      if (!item2) return null;
      var _getFirstItem_key1;
      key = (_getFirstItem_key1 = (_getFirstItem1 = $c5a24bc478652b5f$export$fbdeaa6a76694f71($c5a24bc478652b5f$export$1005530eda016c13(item2, this.collection))) === null || _getFirstItem1 === void 0 ? void 0 : _getFirstItem1.key) !== null && _getFirstItem_key1 !== void 0 ? _getFirstItem_key1 : null;
    }
    return key;
  }
  getLastKey(fromKey, global) {
    let key = fromKey !== null && fromKey !== void 0 ? fromKey : null;
    let item;
    if (key != null) {
      item = this.collection.getItem(key);
      if (!item) return null;
      if (this.isCell(item) && !global && item.parentKey != null) {
        var _getLastItem;
        let parent = this.collection.getItem(item.parentKey);
        if (!parent) return null;
        let children = $c5a24bc478652b5f$export$1005530eda016c13(parent, this.collection);
        var _getLastItem_key;
        return (_getLastItem_key = (_getLastItem = $c5a24bc478652b5f$export$7475b2c64539e4cf(children)) === null || _getLastItem === void 0 ? void 0 : _getLastItem.key) !== null && _getLastItem_key !== void 0 ? _getLastItem_key : null;
      }
    }
    key = this.findPreviousKey(void 0, (item2) => item2.type === "item");
    if (key != null && (item && this.isCell(item) && global || this.focusMode === "cell")) {
      var _getLastItem1;
      let item2 = this.collection.getItem(key);
      if (!item2) return null;
      let children = $c5a24bc478652b5f$export$1005530eda016c13(item2, this.collection);
      var _getLastItem_key1;
      key = (_getLastItem_key1 = (_getLastItem1 = $c5a24bc478652b5f$export$7475b2c64539e4cf(children)) === null || _getLastItem1 === void 0 ? void 0 : _getLastItem1.key) !== null && _getLastItem_key1 !== void 0 ? _getLastItem_key1 : null;
    }
    return key;
  }
  getKeyPageAbove(fromKey) {
    let key = fromKey;
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) return null;
    let pageY = Math.max(0, itemRect.y + itemRect.height - this.layoutDelegate.getVisibleRect().height);
    while (itemRect && itemRect.y > pageY && key != null) {
      var _this_getKeyAbove;
      key = (_this_getKeyAbove = this.getKeyAbove(key)) !== null && _this_getKeyAbove !== void 0 ? _this_getKeyAbove : null;
      if (key == null) break;
      itemRect = this.layoutDelegate.getItemRect(key);
    }
    return key;
  }
  getKeyPageBelow(fromKey) {
    let key = fromKey;
    let itemRect = this.layoutDelegate.getItemRect(key);
    if (!itemRect) return null;
    let pageHeight = this.layoutDelegate.getVisibleRect().height;
    let pageY = Math.min(this.layoutDelegate.getContentSize().height, itemRect.y + pageHeight);
    while (itemRect && itemRect.y + itemRect.height < pageY) {
      let nextKey = this.getKeyBelow(key);
      if (nextKey == null) break;
      itemRect = this.layoutDelegate.getItemRect(nextKey);
      key = nextKey;
    }
    return key;
  }
  getKeyForSearch(search, fromKey) {
    let key = fromKey !== null && fromKey !== void 0 ? fromKey : null;
    if (!this.collator) return null;
    let collection = this.collection;
    key = fromKey !== null && fromKey !== void 0 ? fromKey : this.getFirstKey();
    if (key == null) return null;
    let startItem = collection.getItem(key);
    if (!startItem) return null;
    var _startItem_parentKey;
    if (startItem.type === "cell") key = (_startItem_parentKey = startItem.parentKey) !== null && _startItem_parentKey !== void 0 ? _startItem_parentKey : null;
    let hasWrapped = false;
    while (key != null) {
      let item = collection.getItem(key);
      if (!item) return null;
      if (item.textValue) {
        let substring = item.textValue.slice(0, search.length);
        if (this.collator.compare(substring, search) === 0) {
          var _getFirstItem;
          var _getFirstItem_key;
          if (this.isRow(item) && this.focusMode === "cell") return (_getFirstItem_key = (_getFirstItem = $c5a24bc478652b5f$export$fbdeaa6a76694f71($c5a24bc478652b5f$export$1005530eda016c13(item, this.collection))) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key) !== null && _getFirstItem_key !== void 0 ? _getFirstItem_key : null;
          return item.key;
        }
      }
      key = this.findNextKey(key, (item2) => item2.type === "item");
      if (key == null && !hasWrapped) {
        key = this.getFirstKey();
        hasWrapped = true;
      }
    }
    return null;
  }
  constructor(options) {
    this.collection = options.collection;
    this.disabledKeys = options.disabledKeys;
    this.disabledBehavior = options.disabledBehavior || "all";
    this.direction = options.direction;
    this.collator = options.collator;
    if (!options.layout && !options.ref) throw new Error("Either a layout or a ref must be specified.");
    this.layoutDelegate = options.layoutDelegate || (options.layout ? new $d1c300d9c497e402$var$DeprecatedLayoutDelegate(options.layout) : new $657e4dc4a6e88df0$export$8f5ed9ff9f511381(options.ref));
    this.focusMode = options.focusMode || "row";
  }
}
class $d1c300d9c497e402$var$DeprecatedLayoutDelegate {
  getContentSize() {
    return this.layout.getContentSize();
  }
  getItemRect(key) {
    var _this_layout_getLayoutInfo;
    return ((_this_layout_getLayoutInfo = this.layout.getLayoutInfo(key)) === null || _this_layout_getLayoutInfo === void 0 ? void 0 : _this_layout_getLayoutInfo.rect) || null;
  }
  getVisibleRect() {
    return this.layout.virtualizer.visibleRect;
  }
  constructor(layout) {
    this.layout = layout;
  }
}
const $1af922eb41e03c8f$export$e6235c0d09b995d0 = /* @__PURE__ */ new WeakMap();
var $682989befd4f478d$exports = {};
$682989befd4f478d$exports = {
  "deselectedItem": (args) => `${args.item} غير المحدد`,
  "longPressToSelect": `اضغط مطولًا للدخول إلى وضع التحديد.`,
  "select": `تحديد`,
  "selectedAll": `جميع العناصر المحددة.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `لم يتم تحديد عناصر`,
    one: () => `${formatter.number(args.count)} عنصر محدد`,
    other: () => `${formatter.number(args.count)} عنصر محدد`
  })}.`,
  "selectedItem": (args) => `${args.item} المحدد`
};
var $f7fca02019afd941$exports = {};
$f7fca02019afd941$exports = {
  "deselectedItem": (args) => `${args.item} не е избран.`,
  "longPressToSelect": `Натиснете и задръжте за да влезете в избирателен режим.`,
  "select": `Изберете`,
  "selectedAll": `Всички елементи са избрани.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Няма избрани елементи`,
    one: () => `${formatter.number(args.count)} избран елемент`,
    other: () => `${formatter.number(args.count)} избрани елементи`
  })}.`,
  "selectedItem": (args) => `${args.item} избран.`
};
var $8f86f40be75387f1$exports = {};
$8f86f40be75387f1$exports = {
  "deselectedItem": (args) => `Položka ${args.item} není vybrána.`,
  "longPressToSelect": `Dlouhým stisknutím přejdete do režimu výběru.`,
  "select": `Vybrat`,
  "selectedAll": `Vybrány všechny položky.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nevybrány žádné položky`,
    one: () => `Vybrána ${formatter.number(args.count)} položka`,
    other: () => `Vybráno ${formatter.number(args.count)} položek`
  })}.`,
  "selectedItem": (args) => `Vybrána položka ${args.item}.`
};
var $db24ba43c8d652ee$exports = {};
$db24ba43c8d652ee$exports = {
  "deselectedItem": (args) => `${args.item} ikke valgt.`,
  "longPressToSelect": `Lav et langt tryk for at aktivere valgtilstand.`,
  "select": `Vælg`,
  "selectedAll": `Alle elementer valgt.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Ingen elementer valgt`,
    one: () => `${formatter.number(args.count)} element valgt`,
    other: () => `${formatter.number(args.count)} elementer valgt`
  })}.`,
  "selectedItem": (args) => `${args.item} valgt.`
};
var $f8f1e72c8b5447d6$exports = {};
$f8f1e72c8b5447d6$exports = {
  "deselectedItem": (args) => `${args.item} nicht ausgewählt.`,
  "longPressToSelect": `Gedrückt halten, um Auswahlmodus zu öffnen.`,
  "select": `Auswählen`,
  "selectedAll": `Alle Elemente ausgewählt.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Keine Elemente ausgewählt`,
    one: () => `${formatter.number(args.count)} Element ausgewählt`,
    other: () => `${formatter.number(args.count)} Elemente ausgewählt`
  })}.`,
  "selectedItem": (args) => `${args.item} ausgewählt.`
};
var $9a73ed2983c3ab0b$exports = {};
$9a73ed2983c3ab0b$exports = {
  "deselectedItem": (args) => `Δεν επιλέχθηκε το στοιχείο ${args.item}.`,
  "longPressToSelect": `Πατήστε παρατεταμένα για να μπείτε σε λειτουργία επιλογής.`,
  "select": `Επιλογή`,
  "selectedAll": `Επιλέχθηκαν όλα τα στοιχεία.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Δεν επιλέχθηκαν στοιχεία`,
    one: () => `Επιλέχθηκε ${formatter.number(args.count)} στοιχείο`,
    other: () => `Επιλέχθηκαν ${formatter.number(args.count)} στοιχεία`
  })}.`,
  "selectedItem": (args) => `Επιλέχθηκε το στοιχείο ${args.item}.`
};
var $583de0b3587601b9$exports = {};
$583de0b3587601b9$exports = {
  "deselectedItem": (args) => `${args.item} not selected.`,
  "select": `Select`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `No items selected`,
    one: () => `${formatter.number(args.count)} item selected`,
    other: () => `${formatter.number(args.count)} items selected`
  })}.`,
  "selectedAll": `All items selected.`,
  "selectedItem": (args) => `${args.item} selected.`,
  "longPressToSelect": `Long press to enter selection mode.`
};
var $147159c978043442$exports = {};
$147159c978043442$exports = {
  "deselectedItem": (args) => `${args.item} no seleccionado.`,
  "longPressToSelect": `Mantenga pulsado para abrir el modo de selección.`,
  "select": `Seleccionar`,
  "selectedAll": `Todos los elementos seleccionados.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Ningún elemento seleccionado`,
    one: () => `${formatter.number(args.count)} elemento seleccionado`,
    other: () => `${formatter.number(args.count)} elementos seleccionados`
  })}.`,
  "selectedItem": (args) => `${args.item} seleccionado.`
};
var $5cbb62c8a19173ac$exports = {};
$5cbb62c8a19173ac$exports = {
  "deselectedItem": (args) => `${args.item} pole valitud.`,
  "longPressToSelect": `Valikurežiimi sisenemiseks vajutage pikalt.`,
  "select": `Vali`,
  "selectedAll": `Kõik üksused valitud.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Üksusi pole valitud`,
    one: () => `${formatter.number(args.count)} üksus valitud`,
    other: () => `${formatter.number(args.count)} üksust valitud`
  })}.`,
  "selectedItem": (args) => `${args.item} valitud.`
};
var $a33d71dc804cc59e$exports = {};
$a33d71dc804cc59e$exports = {
  "deselectedItem": (args) => `Kohdetta ${args.item} ei valittu.`,
  "longPressToSelect": `Siirry valintatilaan painamalla pitkään.`,
  "select": `Valitse`,
  "selectedAll": `Kaikki kohteet valittu.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Ei yhtään kohdetta valittu`,
    one: () => `${formatter.number(args.count)} kohde valittu`,
    other: () => `${formatter.number(args.count)} kohdetta valittu`
  })}.`,
  "selectedItem": (args) => `${args.item} valittu.`
};
var $92d800447793d084$exports = {};
$92d800447793d084$exports = {
  "deselectedItem": (args) => `${args.item} non sélectionné.`,
  "longPressToSelect": `Appuyez de manière prolongée pour passer en mode de sélection.`,
  "select": `Sélectionner`,
  "selectedAll": `Tous les éléments sélectionnés.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Aucun élément sélectionné`,
    one: () => `${formatter.number(args.count)} élément sélectionné`,
    other: () => `${formatter.number(args.count)} éléments sélectionnés`
  })}.`,
  "selectedItem": (args) => `${args.item} sélectionné.`
};
var $fe732cdb32124ea8$exports = {};
$fe732cdb32124ea8$exports = {
  "deselectedItem": (args) => `${args.item} לא נבחר.`,
  "longPressToSelect": `הקשה ארוכה לכניסה למצב בחירה.`,
  "select": `בחר`,
  "selectedAll": `כל הפריטים נבחרו.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `לא נבחרו פריטים`,
    one: () => `פריט ${formatter.number(args.count)} נבחר`,
    other: () => `${formatter.number(args.count)} פריטים נבחרו`
  })}.`,
  "selectedItem": (args) => `${args.item} נבחר.`
};
var $e41234e934efb4f5$exports = {};
$e41234e934efb4f5$exports = {
  "deselectedItem": (args) => `Stavka ${args.item} nije odabrana.`,
  "longPressToSelect": `Dugo pritisnite za ulazak u način odabira.`,
  "select": `Odaberite`,
  "selectedAll": `Odabrane su sve stavke.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nije odabrana nijedna stavka`,
    one: () => `Odabrana je ${formatter.number(args.count)} stavka`,
    other: () => `Odabrano je ${formatter.number(args.count)} stavki`
  })}.`,
  "selectedItem": (args) => `Stavka ${args.item} je odabrana.`
};
var $1b0393182473bf9e$exports = {};
$1b0393182473bf9e$exports = {
  "deselectedItem": (args) => `${args.item} nincs kijelölve.`,
  "longPressToSelect": `Nyomja hosszan a kijelöléshez.`,
  "select": `Kijelölés`,
  "selectedAll": `Az összes elem kijelölve.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Egy elem sincs kijelölve`,
    one: () => `${formatter.number(args.count)} elem kijelölve`,
    other: () => `${formatter.number(args.count)} elem kijelölve`
  })}.`,
  "selectedItem": (args) => `${args.item} kijelölve.`
};
var $2eed782c1c110ce7$exports = {};
$2eed782c1c110ce7$exports = {
  "deselectedItem": (args) => `${args.item} non selezionato.`,
  "longPressToSelect": `Premi a lungo per passare alla modalità di selezione.`,
  "select": `Seleziona`,
  "selectedAll": `Tutti gli elementi selezionati.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nessun elemento selezionato`,
    one: () => `${formatter.number(args.count)} elemento selezionato`,
    other: () => `${formatter.number(args.count)} elementi selezionati`
  })}.`,
  "selectedItem": (args) => `${args.item} selezionato.`
};
var $8b5d459f86e9b23c$exports = {};
$8b5d459f86e9b23c$exports = {
  "deselectedItem": (args) => `${args.item} が選択されていません。`,
  "longPressToSelect": `長押しして選択モードを開きます。`,
  "select": `選択`,
  "selectedAll": `すべての項目を選択しました。`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `項目が選択されていません`,
    one: () => `${formatter.number(args.count)} 項目を選択しました`,
    other: () => `${formatter.number(args.count)} 項目を選択しました`
  })}。`,
  "selectedItem": (args) => `${args.item} を選択しました。`
};
var $1949c3ad17295fd4$exports = {};
$1949c3ad17295fd4$exports = {
  "deselectedItem": (args) => `${args.item}이(가) 선택되지 않았습니다.`,
  "longPressToSelect": `선택 모드로 들어가려면 길게 누르십시오.`,
  "select": `선택`,
  "selectedAll": `모든 항목이 선택되었습니다.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `선택된 항목이 없습니다`,
    one: () => `${formatter.number(args.count)}개 항목이 선택되었습니다`,
    other: () => `${formatter.number(args.count)}개 항목이 선택되었습니다`
  })}.`,
  "selectedItem": (args) => `${args.item}이(가) 선택되었습니다.`
};
var $f5e3df4dc8aa7b54$exports = {};
$f5e3df4dc8aa7b54$exports = {
  "deselectedItem": (args) => `${args.item} nepasirinkta.`,
  "longPressToSelect": `Norėdami įjungti pasirinkimo režimą, paspauskite ir palaikykite.`,
  "select": `Pasirinkti`,
  "selectedAll": `Pasirinkti visi elementai.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nepasirinktas nė vienas elementas`,
    one: () => `Pasirinktas ${formatter.number(args.count)} elementas`,
    other: () => `Pasirinkta elementų: ${formatter.number(args.count)}`
  })}.`,
  "selectedItem": (args) => `Pasirinkta: ${args.item}.`
};
var $9dd86690a5c2b2c5$exports = {};
$9dd86690a5c2b2c5$exports = {
  "deselectedItem": (args) => `Vienums ${args.item} nav atlasīts.`,
  "longPressToSelect": `Ilgi turiet nospiestu. lai ieslēgtu atlases režīmu.`,
  "select": `Atlasīt`,
  "selectedAll": `Atlasīti visi vienumi.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nav atlasīts neviens vienums`,
    one: () => `Atlasīto vienumu skaits: ${formatter.number(args.count)}`,
    other: () => `Atlasīto vienumu skaits: ${formatter.number(args.count)}`
  })}.`,
  "selectedItem": (args) => `Atlasīts vienums ${args.item}.`
};
var $843964c3bf9a7d24$exports = {};
$843964c3bf9a7d24$exports = {
  "deselectedItem": (args) => `${args.item} er ikke valgt.`,
  "longPressToSelect": `Bruk et langt trykk for å gå inn i valgmodus.`,
  "select": `Velg`,
  "selectedAll": `Alle elementer er valgt.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Ingen elementer er valgt`,
    one: () => `${formatter.number(args.count)} element er valgt`,
    other: () => `${formatter.number(args.count)} elementer er valgt`
  })}.`,
  "selectedItem": (args) => `${args.item} er valgt.`
};
var $73f50e845f9ef3b4$exports = {};
$73f50e845f9ef3b4$exports = {
  "deselectedItem": (args) => `${args.item} niet geselecteerd.`,
  "longPressToSelect": `Druk lang om de selectiemodus te openen.`,
  "select": `Selecteren`,
  "selectedAll": `Alle items geselecteerd.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Geen items geselecteerd`,
    one: () => `${formatter.number(args.count)} item geselecteerd`,
    other: () => `${formatter.number(args.count)} items geselecteerd`
  })}.`,
  "selectedItem": (args) => `${args.item} geselecteerd.`
};
var $87f92a7e077514b2$exports = {};
$87f92a7e077514b2$exports = {
  "deselectedItem": (args) => `Nie zaznaczono ${args.item}.`,
  "longPressToSelect": `Naciśnij i przytrzymaj, aby wejść do trybu wyboru.`,
  "select": `Zaznacz`,
  "selectedAll": `Wszystkie zaznaczone elementy.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nie zaznaczono żadnych elementów`,
    one: () => `${formatter.number(args.count)} zaznaczony element`,
    other: () => `${formatter.number(args.count)} zaznaczonych elementów`
  })}.`,
  "selectedItem": (args) => `Zaznaczono ${args.item}.`
};
var $c28c98d58ee9ff6f$exports = {};
$c28c98d58ee9ff6f$exports = {
  "deselectedItem": (args) => `${args.item} não selecionado.`,
  "longPressToSelect": `Mantenha pressionado para entrar no modo de seleção.`,
  "select": `Selecionar`,
  "selectedAll": `Todos os itens selecionados.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nenhum item selecionado`,
    one: () => `${formatter.number(args.count)} item selecionado`,
    other: () => `${formatter.number(args.count)} itens selecionados`
  })}.`,
  "selectedItem": (args) => `${args.item} selecionado.`
};
var $b6b1503b17b2254d$exports = {};
$b6b1503b17b2254d$exports = {
  "deselectedItem": (args) => `${args.item} não selecionado.`,
  "longPressToSelect": `Prima continuamente para entrar no modo de seleção.`,
  "select": `Selecionar`,
  "selectedAll": `Todos os itens selecionados.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nenhum item selecionado`,
    one: () => `${formatter.number(args.count)} item selecionado`,
    other: () => `${formatter.number(args.count)} itens selecionados`
  })}.`,
  "selectedItem": (args) => `${args.item} selecionado.`
};
var $8bdaeb71e50c3e1a$exports = {};
$8bdaeb71e50c3e1a$exports = {
  "deselectedItem": (args) => `${args.item} neselectat.`,
  "longPressToSelect": `Apăsați lung pentru a intra în modul de selectare.`,
  "select": `Selectare`,
  "selectedAll": `Toate elementele selectate.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Niciun element selectat`,
    one: () => `${formatter.number(args.count)} element selectat`,
    other: () => `${formatter.number(args.count)} elemente selectate`
  })}.`,
  "selectedItem": (args) => `${args.item} selectat.`
};
var $ec2b852dd7c3d1f2$exports = {};
$ec2b852dd7c3d1f2$exports = {
  "deselectedItem": (args) => `${args.item} не выбрано.`,
  "longPressToSelect": `Нажмите и удерживайте для входа в режим выбора.`,
  "select": `Выбрать`,
  "selectedAll": `Выбраны все элементы.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Нет выбранных элементов`,
    one: () => `${formatter.number(args.count)} элемент выбран`,
    other: () => `${formatter.number(args.count)} элементов выбрано`
  })}.`,
  "selectedItem": (args) => `${args.item} выбрано.`
};
var $79e6d900d6a4f82d$exports = {};
$79e6d900d6a4f82d$exports = {
  "deselectedItem": (args) => `Nevybraté položky: ${args.item}.`,
  "longPressToSelect": `Dlhším stlačením prejdite do režimu výberu.`,
  "select": `Vybrať`,
  "selectedAll": `Všetky vybraté položky.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Žiadne vybraté položky`,
    one: () => `${formatter.number(args.count)} vybratá položka`,
    other: () => `Počet vybratých položiek:${formatter.number(args.count)}`
  })}.`,
  "selectedItem": (args) => `Vybraté položky: ${args.item}.`
};
var $f4c1f0d5d4d03d80$exports = {};
$f4c1f0d5d4d03d80$exports = {
  "deselectedItem": (args) => `Element ${args.item} ni izbran.`,
  "longPressToSelect": `Za izbirni način pritisnite in dlje časa držite.`,
  "select": `Izberite`,
  "selectedAll": `Vsi elementi so izbrani.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Noben element ni izbran`,
    one: () => `${formatter.number(args.count)} element je izbran`,
    other: () => `${formatter.number(args.count)} elementov je izbranih`
  })}.`,
  "selectedItem": (args) => `Element ${args.item} je izbran.`
};
var $46252cd87269b10b$exports = {};
$46252cd87269b10b$exports = {
  "deselectedItem": (args) => `${args.item} nije izabrano.`,
  "longPressToSelect": `Dugo pritisnite za ulazak u režim biranja.`,
  "select": `Izaberite`,
  "selectedAll": `Izabrane su sve stavke.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Nije izabrana nijedna stavka`,
    one: () => `Izabrana je ${formatter.number(args.count)} stavka`,
    other: () => `Izabrano je ${formatter.number(args.count)} stavki`
  })}.`,
  "selectedItem": (args) => `${args.item} je izabrano.`
};
var $d4d5d8dab362555c$exports = {};
$d4d5d8dab362555c$exports = {
  "deselectedItem": (args) => `${args.item} ej markerat.`,
  "longPressToSelect": `Tryck länge när du vill öppna väljarläge.`,
  "select": `Markera`,
  "selectedAll": `Alla markerade objekt.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Inga markerade objekt`,
    one: () => `${formatter.number(args.count)} markerat objekt`,
    other: () => `${formatter.number(args.count)} markerade objekt`
  })}.`,
  "selectedItem": (args) => `${args.item} markerat.`
};
var $3d55d1f97c377e83$exports = {};
$3d55d1f97c377e83$exports = {
  "deselectedItem": (args) => `${args.item} seçilmedi.`,
  "longPressToSelect": `Seçim moduna girmek için uzun basın.`,
  "select": `Seç`,
  "selectedAll": `Tüm ögeler seçildi.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Hiçbir öge seçilmedi`,
    one: () => `${formatter.number(args.count)} öge seçildi`,
    other: () => `${formatter.number(args.count)} öge seçildi`
  })}.`,
  "selectedItem": (args) => `${args.item} seçildi.`
};
var $5368512f1c703a3f$exports = {};
$5368512f1c703a3f$exports = {
  "deselectedItem": (args) => `${args.item} не вибрано.`,
  "longPressToSelect": `Виконайте довге натиснення, щоб перейти в режим вибору.`,
  "select": `Вибрати`,
  "selectedAll": `Усі елементи вибрано.`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `Жодних елементів не вибрано`,
    one: () => `${formatter.number(args.count)} елемент вибрано`,
    other: () => `Вибрано елементів: ${formatter.number(args.count)}`
  })}.`,
  "selectedItem": (args) => `${args.item} вибрано.`
};
var $f1316b1074463583$exports = {};
$f1316b1074463583$exports = {
  "deselectedItem": (args) => `未选择 ${args.item}。`,
  "longPressToSelect": `长按以进入选择模式。`,
  "select": `选择`,
  "selectedAll": `已选择所有项目。`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `未选择项目`,
    one: () => `已选择 ${formatter.number(args.count)} 个项目`,
    other: () => `已选择 ${formatter.number(args.count)} 个项目`
  })}。`,
  "selectedItem": (args) => `已选择 ${args.item}。`
};
var $7e60654723031b6f$exports = {};
$7e60654723031b6f$exports = {
  "deselectedItem": (args) => `未選取「${args.item}」。`,
  "longPressToSelect": `長按以進入選擇模式。`,
  "select": `選取`,
  "selectedAll": `已選取所有項目。`,
  "selectedCount": (args, formatter) => `${formatter.plural(args.count, {
    "=0": `未選取任何項目`,
    one: () => `已選取 ${formatter.number(args.count)} 個項目`,
    other: () => `已選取 ${formatter.number(args.count)} 個項目`
  })}。`,
  "selectedItem": (args) => `已選取「${args.item}」。`
};
var $835c96616a7cb4f9$exports = {};
$835c96616a7cb4f9$exports = {
  "ar-AE": $682989befd4f478d$exports,
  "bg-BG": $f7fca02019afd941$exports,
  "cs-CZ": $8f86f40be75387f1$exports,
  "da-DK": $db24ba43c8d652ee$exports,
  "de-DE": $f8f1e72c8b5447d6$exports,
  "el-GR": $9a73ed2983c3ab0b$exports,
  "en-US": $583de0b3587601b9$exports,
  "es-ES": $147159c978043442$exports,
  "et-EE": $5cbb62c8a19173ac$exports,
  "fi-FI": $a33d71dc804cc59e$exports,
  "fr-FR": $92d800447793d084$exports,
  "he-IL": $fe732cdb32124ea8$exports,
  "hr-HR": $e41234e934efb4f5$exports,
  "hu-HU": $1b0393182473bf9e$exports,
  "it-IT": $2eed782c1c110ce7$exports,
  "ja-JP": $8b5d459f86e9b23c$exports,
  "ko-KR": $1949c3ad17295fd4$exports,
  "lt-LT": $f5e3df4dc8aa7b54$exports,
  "lv-LV": $9dd86690a5c2b2c5$exports,
  "nb-NO": $843964c3bf9a7d24$exports,
  "nl-NL": $73f50e845f9ef3b4$exports,
  "pl-PL": $87f92a7e077514b2$exports,
  "pt-BR": $c28c98d58ee9ff6f$exports,
  "pt-PT": $b6b1503b17b2254d$exports,
  "ro-RO": $8bdaeb71e50c3e1a$exports,
  "ru-RU": $ec2b852dd7c3d1f2$exports,
  "sk-SK": $79e6d900d6a4f82d$exports,
  "sl-SI": $f4c1f0d5d4d03d80$exports,
  "sr-SP": $46252cd87269b10b$exports,
  "sv-SE": $d4d5d8dab362555c$exports,
  "tr-TR": $3d55d1f97c377e83$exports,
  "uk-UA": $5368512f1c703a3f$exports,
  "zh-CN": $f1316b1074463583$exports,
  "zh-TW": $7e60654723031b6f$exports
};
const $319e236875307eab$var$LIVEREGION_TIMEOUT_DELAY = 7e3;
let $319e236875307eab$var$liveAnnouncer = null;
function $319e236875307eab$export$a9b970dcc4ae71a9(message, assertiveness = "assertive", timeout = $319e236875307eab$var$LIVEREGION_TIMEOUT_DELAY) {
  if (!$319e236875307eab$var$liveAnnouncer) {
    $319e236875307eab$var$liveAnnouncer = new $319e236875307eab$var$LiveAnnouncer();
    if (!(typeof IS_REACT_ACT_ENVIRONMENT === "boolean" ? IS_REACT_ACT_ENVIRONMENT : typeof jest !== "undefined")) setTimeout(() => {
      if ($319e236875307eab$var$liveAnnouncer === null || $319e236875307eab$var$liveAnnouncer === void 0 ? void 0 : $319e236875307eab$var$liveAnnouncer.isAttached()) $319e236875307eab$var$liveAnnouncer === null || $319e236875307eab$var$liveAnnouncer === void 0 ? void 0 : $319e236875307eab$var$liveAnnouncer.announce(message, assertiveness, timeout);
    }, 100);
    else $319e236875307eab$var$liveAnnouncer.announce(message, assertiveness, timeout);
  } else $319e236875307eab$var$liveAnnouncer.announce(message, assertiveness, timeout);
}
class $319e236875307eab$var$LiveAnnouncer {
  isAttached() {
    var _this_node;
    return (_this_node = this.node) === null || _this_node === void 0 ? void 0 : _this_node.isConnected;
  }
  createLog(ariaLive) {
    let node = document.createElement("div");
    node.setAttribute("role", "log");
    node.setAttribute("aria-live", ariaLive);
    node.setAttribute("aria-relevant", "additions");
    return node;
  }
  destroy() {
    if (!this.node) return;
    document.body.removeChild(this.node);
    this.node = null;
  }
  announce(message, assertiveness = "assertive", timeout = $319e236875307eab$var$LIVEREGION_TIMEOUT_DELAY) {
    var _this_assertiveLog, _this_politeLog;
    if (!this.node) return;
    let node = document.createElement("div");
    if (typeof message === "object") {
      node.setAttribute("role", "img");
      node.setAttribute("aria-labelledby", message["aria-labelledby"]);
    } else node.textContent = message;
    if (assertiveness === "assertive") (_this_assertiveLog = this.assertiveLog) === null || _this_assertiveLog === void 0 ? void 0 : _this_assertiveLog.appendChild(node);
    else (_this_politeLog = this.politeLog) === null || _this_politeLog === void 0 ? void 0 : _this_politeLog.appendChild(node);
    if (message !== "") setTimeout(() => {
      node.remove();
    }, timeout);
  }
  clear(assertiveness) {
    if (!this.node) return;
    if ((!assertiveness || assertiveness === "assertive") && this.assertiveLog) this.assertiveLog.innerHTML = "";
    if ((!assertiveness || assertiveness === "polite") && this.politeLog) this.politeLog.innerHTML = "";
  }
  constructor() {
    this.node = null;
    this.assertiveLog = null;
    this.politeLog = null;
    if (typeof document !== "undefined") {
      this.node = document.createElement("div");
      this.node.dataset.liveAnnouncer = "true";
      Object.assign(this.node.style, {
        border: 0,
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        width: "1px",
        whiteSpace: "nowrap"
      });
      this.assertiveLog = this.createLog("assertive");
      this.node.appendChild(this.assertiveLog);
      this.politeLog = this.createLog("polite");
      this.node.appendChild(this.politeLog);
      document.body.prepend(this.node);
    }
  }
}
function $parcel$interopDefault$5(a) {
  return a && a.__esModule ? a.default : a;
}
function $92599c3fd427b763$export$137e594ef3218a10(props, state) {
  let { getRowText = (key) => {
    var _state_collection_getTextValue, _state_collection, _state_collection_getItem;
    var _state_collection_getTextValue1;
    return (_state_collection_getTextValue1 = (_state_collection_getTextValue = (_state_collection = state.collection).getTextValue) === null || _state_collection_getTextValue === void 0 ? void 0 : _state_collection_getTextValue.call(_state_collection, key)) !== null && _state_collection_getTextValue1 !== void 0 ? _state_collection_getTextValue1 : (_state_collection_getItem = state.collection.getItem(key)) === null || _state_collection_getItem === void 0 ? void 0 : _state_collection_getItem.textValue;
  } } = props;
  let stringFormatter = $fca6afa0e843324b$export$f12b703ca79dfbb1($parcel$interopDefault$5($835c96616a7cb4f9$exports), "@react-aria/grid");
  let selection = state.selectionManager.rawSelection;
  let lastSelection = reactExports.useRef(selection);
  $4f58c5f72bcf79f7$export$496315a1608d9602(() => {
    var _lastSelection_current;
    if (!state.selectionManager.isFocused) {
      lastSelection.current = selection;
      return;
    }
    let addedKeys = $92599c3fd427b763$var$diffSelection(selection, lastSelection.current);
    let removedKeys = $92599c3fd427b763$var$diffSelection(lastSelection.current, selection);
    let isReplace = state.selectionManager.selectionBehavior === "replace";
    let messages = [];
    if (state.selectionManager.selectedKeys.size === 1 && isReplace) {
      if (state.collection.getItem(state.selectionManager.selectedKeys.keys().next().value)) {
        let currentSelectionText = getRowText(state.selectionManager.selectedKeys.keys().next().value);
        if (currentSelectionText) messages.push(stringFormatter.format("selectedItem", {
          item: currentSelectionText
        }));
      }
    } else if (addedKeys.size === 1 && removedKeys.size === 0) {
      let addedText = getRowText(addedKeys.keys().next().value);
      if (addedText) messages.push(stringFormatter.format("selectedItem", {
        item: addedText
      }));
    } else if (removedKeys.size === 1 && addedKeys.size === 0) {
      if (state.collection.getItem(removedKeys.keys().next().value)) {
        let removedText = getRowText(removedKeys.keys().next().value);
        if (removedText) messages.push(stringFormatter.format("deselectedItem", {
          item: removedText
        }));
      }
    }
    if (state.selectionManager.selectionMode === "multiple") {
      if (messages.length === 0 || selection === "all" || selection.size > 1 || lastSelection.current === "all" || ((_lastSelection_current = lastSelection.current) === null || _lastSelection_current === void 0 ? void 0 : _lastSelection_current.size) > 1) messages.push(selection === "all" ? stringFormatter.format("selectedAll") : stringFormatter.format("selectedCount", {
        count: selection.size
      }));
    }
    if (messages.length > 0) $319e236875307eab$export$a9b970dcc4ae71a9(messages.join(" "));
    lastSelection.current = selection;
  }, [
    selection
  ]);
}
function $92599c3fd427b763$var$diffSelection(a, b) {
  let res = /* @__PURE__ */ new Set();
  if (a === "all" || b === "all") return res;
  for (let key of a.keys()) if (!b.has(key)) res.add(key);
  return res;
}
function $parcel$interopDefault$4(a) {
  return a && a.__esModule ? a.default : a;
}
function $5b9b5b5723db6ae1$export$be42ebdab07ae4c2(props) {
  let stringFormatter = $fca6afa0e843324b$export$f12b703ca79dfbb1($parcel$interopDefault$4($835c96616a7cb4f9$exports), "@react-aria/grid");
  let modality = $507fabe10e71c6fb$export$98e20ec92f614cfe();
  let shouldLongPress = (modality === "pointer" || modality === "virtual" || modality == null) && typeof window !== "undefined" && "ontouchstart" in window;
  let interactionDescription = reactExports.useMemo(() => {
    let selectionMode = props.selectionManager.selectionMode;
    let selectionBehavior = props.selectionManager.selectionBehavior;
    let message;
    if (shouldLongPress) message = stringFormatter.format("longPressToSelect");
    return selectionBehavior === "replace" && selectionMode !== "none" && props.hasItemActions ? message : void 0;
  }, [
    props.selectionManager.selectionMode,
    props.selectionManager.selectionBehavior,
    props.hasItemActions,
    stringFormatter,
    shouldLongPress
  ]);
  let descriptionProps = $ef06256079686ba0$export$f8aeda7b10753fa1$1(interactionDescription);
  return descriptionProps;
}
function $83c6e2eafa584c67$export$f6b86a04e5d66d90(props, state, ref) {
  let { isVirtualized, keyboardDelegate, focusMode, scrollRef, getRowText, onRowAction, onCellAction } = props;
  let { selectionManager: manager } = state;
  if (!props["aria-label"] && !props["aria-labelledby"]) console.warn("An aria-label or aria-labelledby prop is required for accessibility.");
  let collator = $325a3faab7a68acd$export$a16aca283550c30d({
    usage: "search",
    sensitivity: "base"
  });
  let { direction } = $18f2051aff69b9bf$export$43bb16f9c6d9e3f7();
  let disabledBehavior = state.selectionManager.disabledBehavior;
  let delegate = reactExports.useMemo(() => keyboardDelegate || new $d1c300d9c497e402$export$de9feff04fda126e({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    disabledBehavior,
    ref,
    direction,
    collator,
    focusMode
  }), [
    keyboardDelegate,
    state.collection,
    state.disabledKeys,
    disabledBehavior,
    ref,
    direction,
    collator,
    focusMode
  ]);
  let { collectionProps } = $ae20dd8cbca75726$export$d6daf82dcd84e87c({
    ref,
    selectionManager: manager,
    keyboardDelegate: delegate,
    isVirtualized,
    scrollRef
  });
  let id = $bdb11010cef70236$export$f680877a34711e37(props.id);
  $1af922eb41e03c8f$export$e6235c0d09b995d0.set(state, {
    keyboardDelegate: delegate,
    actions: {
      onRowAction,
      onCellAction
    }
  });
  let descriptionProps = $5b9b5b5723db6ae1$export$be42ebdab07ae4c2({
    selectionManager: manager,
    hasItemActions: !!(onRowAction || onCellAction)
  });
  let domProps = $65484d02dcb7eb3e$export$457c3d6518dd4c6f(props, {
    labelable: true
  });
  let onFocus = reactExports.useCallback((e) => {
    if (manager.isFocused) {
      if (!e.currentTarget.contains(e.target)) manager.setFocused(false);
      return;
    }
    if (!e.currentTarget.contains(e.target)) return;
    manager.setFocused(true);
  }, [
    manager
  ]);
  let navDisabledHandlers = reactExports.useMemo(() => ({
    onBlur: collectionProps.onBlur,
    onFocus
  }), [
    onFocus,
    collectionProps.onBlur
  ]);
  let hasTabbableChild = $83013635b024ae3d$export$eac1895992b9f3d6(ref, {
    isDisabled: state.collection.size !== 0
  });
  let gridProps = $3ef42575df84b30b$export$9d1611c77c2fe928(
    domProps,
    {
      role: "grid",
      id,
      "aria-multiselectable": manager.selectionMode === "multiple" ? "true" : void 0
    },
    state.isKeyboardNavigationDisabled ? navDisabledHandlers : collectionProps,
    // If collection is empty, make sure the grid is tabbable unless there is a child tabbable element.
    state.collection.size === 0 && {
      tabIndex: hasTabbableChild ? -1 : 0
    } || void 0,
    descriptionProps
  );
  if (isVirtualized) {
    gridProps["aria-rowcount"] = state.collection.size;
    gridProps["aria-colcount"] = state.collection.columnCount;
  }
  $92599c3fd427b763$export$137e594ef3218a10({
    getRowText
  }, state);
  return {
    gridProps
  };
}
function $e45487f8ba1cbdbf$export$d3037f5d3f3e51bf() {
  return {
    rowGroupProps: {
      role: "rowgroup"
    }
  };
}
function $4159a7a9cbb0cc18$export$96357d5a73f686fa(props, state, ref) {
  var _node_props, _node_props1;
  let { node, isVirtualized, shouldSelectOnPressUp, onAction } = props;
  let { actions } = $1af922eb41e03c8f$export$e6235c0d09b995d0.get(state);
  let onRowAction = actions.onRowAction ? () => {
    var _actions_onRowAction;
    return (_actions_onRowAction = actions.onRowAction) === null || _actions_onRowAction === void 0 ? void 0 : _actions_onRowAction.call(actions, node.key);
  } : onAction;
  let { itemProps, ...states } = $880e95eb8b93ba9a$export$ecf600387e221c37({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized,
    shouldSelectOnPressUp,
    onAction: onRowAction || (node === null || node === void 0 ? void 0 : (_node_props = node.props) === null || _node_props === void 0 ? void 0 : _node_props.onAction) ? $ff5963eb1fccf552$export$e08e3b67e392101e$1(node === null || node === void 0 ? void 0 : (_node_props1 = node.props) === null || _node_props1 === void 0 ? void 0 : _node_props1.onAction, onRowAction) : void 0,
    isDisabled: state.collection.size === 0
  });
  let isSelected = state.selectionManager.isSelected(node.key);
  let rowProps = {
    role: "row",
    "aria-selected": state.selectionManager.selectionMode !== "none" ? isSelected : void 0,
    "aria-disabled": states.isDisabled || void 0,
    ...itemProps
  };
  if (isVirtualized) rowProps["aria-rowindex"] = node.index + 1;
  return {
    rowProps,
    ...states
  };
}
function $ab90dcbc1b5466d0$export$c7e10bfc0c59f67c(props, state, ref) {
  let { node, isVirtualized, focusMode = "child", shouldSelectOnPressUp, onAction } = props;
  let { direction } = $18f2051aff69b9bf$export$43bb16f9c6d9e3f7();
  let { keyboardDelegate, actions: { onCellAction } } = $1af922eb41e03c8f$export$e6235c0d09b995d0.get(state);
  let keyWhenFocused = reactExports.useRef(null);
  let focus = () => {
    if (ref.current) {
      let treeWalker = $9bf71ea28793e738$export$2d6ec8fc375ceafa(ref.current);
      if (focusMode === "child") {
        if (ref.current.contains(document.activeElement) && ref.current !== document.activeElement) return;
        let focusable = state.selectionManager.childFocusStrategy === "last" ? $ab90dcbc1b5466d0$var$last(treeWalker) : treeWalker.firstChild();
        if (focusable) {
          $6a99195332edec8b$export$80f3e147d781571c(focusable);
          return;
        }
      }
      if (keyWhenFocused.current != null && node.key !== keyWhenFocused.current || !ref.current.contains(document.activeElement)) $6a99195332edec8b$export$80f3e147d781571c(ref.current);
    }
  };
  let { itemProps, isPressed } = $880e95eb8b93ba9a$export$ecf600387e221c37({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized,
    focus,
    shouldSelectOnPressUp,
    onAction: onCellAction ? () => onCellAction(node.key) : onAction,
    isDisabled: state.collection.size === 0
  });
  let onKeyDownCapture = (e) => {
    if (!e.currentTarget.contains(e.target) || state.isKeyboardNavigationDisabled || !ref.current || !document.activeElement) return;
    let walker = $9bf71ea28793e738$export$2d6ec8fc375ceafa(ref.current);
    walker.currentNode = document.activeElement;
    switch (e.key) {
      case "ArrowLeft": {
        let focusable = direction === "rtl" ? walker.nextNode() : walker.previousNode();
        if (focusMode === "child" && focusable === ref.current) focusable = null;
        e.preventDefault();
        e.stopPropagation();
        if (focusable) {
          $6a99195332edec8b$export$80f3e147d781571c(focusable);
          $2f04cbc44ee30ce0$export$c826860796309d1b(focusable, {
            containingElement: $62d8ded9296f3872$export$cfa2225e87938781(ref.current)
          });
        } else {
          var _keyboardDelegate_getKeyLeftOf;
          let prev = (_keyboardDelegate_getKeyLeftOf = keyboardDelegate.getKeyLeftOf) === null || _keyboardDelegate_getKeyLeftOf === void 0 ? void 0 : _keyboardDelegate_getKeyLeftOf.call(keyboardDelegate, node.key);
          if (prev !== node.key) {
            var _ref_current_parentElement;
            (_ref_current_parentElement = ref.current.parentElement) === null || _ref_current_parentElement === void 0 ? void 0 : _ref_current_parentElement.dispatchEvent(new KeyboardEvent(e.nativeEvent.type, e.nativeEvent));
            break;
          }
          if (focusMode === "cell" && direction === "rtl") {
            $6a99195332edec8b$export$80f3e147d781571c(ref.current);
            $2f04cbc44ee30ce0$export$c826860796309d1b(ref.current, {
              containingElement: $62d8ded9296f3872$export$cfa2225e87938781(ref.current)
            });
          } else {
            walker.currentNode = ref.current;
            focusable = direction === "rtl" ? walker.firstChild() : $ab90dcbc1b5466d0$var$last(walker);
            if (focusable) {
              $6a99195332edec8b$export$80f3e147d781571c(focusable);
              $2f04cbc44ee30ce0$export$c826860796309d1b(focusable, {
                containingElement: $62d8ded9296f3872$export$cfa2225e87938781(ref.current)
              });
            }
          }
        }
        break;
      }
      case "ArrowRight": {
        let focusable = direction === "rtl" ? walker.previousNode() : walker.nextNode();
        if (focusMode === "child" && focusable === ref.current) focusable = null;
        e.preventDefault();
        e.stopPropagation();
        if (focusable) {
          $6a99195332edec8b$export$80f3e147d781571c(focusable);
          $2f04cbc44ee30ce0$export$c826860796309d1b(focusable, {
            containingElement: $62d8ded9296f3872$export$cfa2225e87938781(ref.current)
          });
        } else {
          var _keyboardDelegate_getKeyRightOf;
          let next = (_keyboardDelegate_getKeyRightOf = keyboardDelegate.getKeyRightOf) === null || _keyboardDelegate_getKeyRightOf === void 0 ? void 0 : _keyboardDelegate_getKeyRightOf.call(keyboardDelegate, node.key);
          if (next !== node.key) {
            var _ref_current_parentElement1;
            (_ref_current_parentElement1 = ref.current.parentElement) === null || _ref_current_parentElement1 === void 0 ? void 0 : _ref_current_parentElement1.dispatchEvent(new KeyboardEvent(e.nativeEvent.type, e.nativeEvent));
            break;
          }
          if (focusMode === "cell" && direction === "ltr") {
            $6a99195332edec8b$export$80f3e147d781571c(ref.current);
            $2f04cbc44ee30ce0$export$c826860796309d1b(ref.current, {
              containingElement: $62d8ded9296f3872$export$cfa2225e87938781(ref.current)
            });
          } else {
            walker.currentNode = ref.current;
            focusable = direction === "rtl" ? $ab90dcbc1b5466d0$var$last(walker) : walker.firstChild();
            if (focusable) {
              $6a99195332edec8b$export$80f3e147d781571c(focusable);
              $2f04cbc44ee30ce0$export$c826860796309d1b(focusable, {
                containingElement: $62d8ded9296f3872$export$cfa2225e87938781(ref.current)
              });
            }
          }
        }
        break;
      }
      case "ArrowUp":
      case "ArrowDown":
        if (!e.altKey && ref.current.contains(e.target)) {
          var _ref_current_parentElement2;
          e.stopPropagation();
          e.preventDefault();
          (_ref_current_parentElement2 = ref.current.parentElement) === null || _ref_current_parentElement2 === void 0 ? void 0 : _ref_current_parentElement2.dispatchEvent(new KeyboardEvent(e.nativeEvent.type, e.nativeEvent));
        }
        break;
    }
  };
  let onFocus = (e) => {
    keyWhenFocused.current = node.key;
    if (e.target !== ref.current) {
      if (!$507fabe10e71c6fb$export$b9b3dfddab17db27()) state.selectionManager.setFocusedKey(node.key);
      return;
    }
    requestAnimationFrame(() => {
      if (focusMode === "child" && document.activeElement === ref.current) focus();
    });
  };
  let gridCellProps = $3ef42575df84b30b$export$9d1611c77c2fe928(itemProps, {
    role: "gridcell",
    onKeyDownCapture,
    onFocus
  });
  var _node_colIndex;
  if (isVirtualized) gridCellProps["aria-colindex"] = ((_node_colIndex = node.colIndex) !== null && _node_colIndex !== void 0 ? _node_colIndex : node.index) + 1;
  if (shouldSelectOnPressUp && gridCellProps.tabIndex != null && gridCellProps.onPointerDown == null) gridCellProps.onPointerDown = (e) => {
    let el = e.currentTarget;
    let tabindex = el.getAttribute("tabindex");
    el.removeAttribute("tabindex");
    requestAnimationFrame(() => {
      if (tabindex != null) el.setAttribute("tabindex", tabindex);
    });
  };
  return {
    gridCellProps,
    isPressed
  };
}
function $ab90dcbc1b5466d0$var$last(walker) {
  let next = null;
  let last = null;
  do {
    last = walker.lastChild();
    if (last) next = last;
  } while (last);
  return next;
}
function $parcel$interopDefault$3(a) {
  return a && a.__esModule ? a.default : a;
}
function $7cb39d07f245a780$export$70e2eed1a92976ad(props, state) {
  let { key } = props;
  let manager = state.selectionManager;
  let checkboxId = $bdb11010cef70236$export$f680877a34711e37();
  let isDisabled = !state.selectionManager.canSelectItem(key);
  let isSelected = state.selectionManager.isSelected(key);
  let onChange = () => manager.toggleSelection(key);
  const stringFormatter = $fca6afa0e843324b$export$f12b703ca79dfbb1($parcel$interopDefault$3($835c96616a7cb4f9$exports), "@react-aria/grid");
  return {
    checkboxProps: {
      id: checkboxId,
      "aria-label": stringFormatter.format("select"),
      isSelected,
      isDisabled,
      onChange
    }
  };
}
class $0ba3c81c7f1caedd$export$da43f8f5cb04028d extends $d1c300d9c497e402$export$de9feff04fda126e {
  isCell(node) {
    return node.type === "cell" || node.type === "rowheader" || node.type === "column";
  }
  getKeyBelow(key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) return null;
    if (startItem.type === "column") {
      var _getNthItem;
      let child = $c5a24bc478652b5f$export$fbdeaa6a76694f71($c5a24bc478652b5f$export$1005530eda016c13(startItem, this.collection));
      if (child) return child.key;
      let firstKey = this.getFirstKey();
      if (firstKey == null) return null;
      let firstItem = this.collection.getItem(firstKey);
      if (!firstItem) return null;
      var _getNthItem_key;
      return (_getNthItem_key = (_getNthItem = $c5a24bc478652b5f$export$5f3398f8733f90e2($c5a24bc478652b5f$export$1005530eda016c13(firstItem, this.collection), startItem.index)) === null || _getNthItem === void 0 ? void 0 : _getNthItem.key) !== null && _getNthItem_key !== void 0 ? _getNthItem_key : null;
    }
    return super.getKeyBelow(key);
  }
  getKeyAbove(key) {
    let startItem = this.collection.getItem(key);
    if (!startItem) return null;
    if (startItem.type === "column") {
      let parent = startItem.parentKey != null ? this.collection.getItem(startItem.parentKey) : null;
      if (parent && parent.type === "column") return parent.key;
      return null;
    }
    let superKey = super.getKeyAbove(key);
    let superItem = superKey != null ? this.collection.getItem(superKey) : null;
    if (superItem && superItem.type !== "headerrow") return superKey;
    if (this.isCell(startItem)) return this.collection.columns[startItem.index].key;
    return this.collection.columns[0].key;
  }
  findNextColumnKey(column) {
    let key = this.findNextKey(column.key, (item) => item.type === "column");
    if (key != null) return key;
    let row = this.collection.headerRows[column.level];
    for (let item of $c5a24bc478652b5f$export$1005530eda016c13(row, this.collection)) {
      if (item.type === "column") return item.key;
    }
    return null;
  }
  findPreviousColumnKey(column) {
    let key = this.findPreviousKey(column.key, (item) => item.type === "column");
    if (key != null) return key;
    let row = this.collection.headerRows[column.level];
    let childNodes = [
      ...$c5a24bc478652b5f$export$1005530eda016c13(row, this.collection)
    ];
    for (let i = childNodes.length - 1; i >= 0; i--) {
      let item = childNodes[i];
      if (item.type === "column") return item.key;
    }
    return null;
  }
  getKeyRightOf(key) {
    let item = this.collection.getItem(key);
    if (!item) return null;
    if (item.type === "column") return this.direction === "rtl" ? this.findPreviousColumnKey(item) : this.findNextColumnKey(item);
    return super.getKeyRightOf(key);
  }
  getKeyLeftOf(key) {
    let item = this.collection.getItem(key);
    if (!item) return null;
    if (item.type === "column") return this.direction === "rtl" ? this.findNextColumnKey(item) : this.findPreviousColumnKey(item);
    return super.getKeyLeftOf(key);
  }
  getKeyForSearch(search, fromKey) {
    if (!this.collator) return null;
    let collection = this.collection;
    let key = fromKey !== null && fromKey !== void 0 ? fromKey : this.getFirstKey();
    if (key == null) return null;
    let startItem = collection.getItem(key);
    var _startItem_parentKey;
    if ((startItem === null || startItem === void 0 ? void 0 : startItem.type) === "cell") key = (_startItem_parentKey = startItem.parentKey) !== null && _startItem_parentKey !== void 0 ? _startItem_parentKey : null;
    let hasWrapped = false;
    while (key != null) {
      let item = collection.getItem(key);
      if (!item) return null;
      for (let cell of $c5a24bc478652b5f$export$1005530eda016c13(item, this.collection)) {
        let column = collection.columns[cell.index];
        if (collection.rowHeaderColumnKeys.has(column.key) && cell.textValue) {
          let substring = cell.textValue.slice(0, search.length);
          if (this.collator.compare(substring, search) === 0) {
            let fromItem = fromKey != null ? collection.getItem(fromKey) : startItem;
            return (fromItem === null || fromItem === void 0 ? void 0 : fromItem.type) === "cell" ? cell.key : item.key;
          }
        }
      }
      key = this.getKeyBelow(key);
      if (key == null && !hasWrapped) {
        key = this.getFirstKey();
        hasWrapped = true;
      }
    }
    return null;
  }
}
let $f4e2df6bd15f8569$var$_tableNestedRows = false;
function $f4e2df6bd15f8569$export$1b00cb14a96194e6() {
  return $f4e2df6bd15f8569$var$_tableNestedRows;
}
function $parcel$interopDefault$2(a) {
  return a && a.__esModule ? a.default : a;
}
function $6e31608fbba75bab$export$25bceaac3c7e4dc7(props, state, ref) {
  let { keyboardDelegate, isVirtualized, layoutDelegate, layout } = props;
  let collator = $325a3faab7a68acd$export$a16aca283550c30d({
    usage: "search",
    sensitivity: "base"
  });
  let { direction } = $18f2051aff69b9bf$export$43bb16f9c6d9e3f7();
  let disabledBehavior = state.selectionManager.disabledBehavior;
  let delegate = reactExports.useMemo(() => keyboardDelegate || new $0ba3c81c7f1caedd$export$da43f8f5cb04028d({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    disabledBehavior,
    ref,
    direction,
    collator,
    layoutDelegate,
    layout
  }), [
    keyboardDelegate,
    state.collection,
    state.disabledKeys,
    disabledBehavior,
    ref,
    direction,
    collator,
    layoutDelegate,
    layout
  ]);
  let id = $bdb11010cef70236$export$f680877a34711e37$1(props.id);
  $2140fb2337097f2d$export$552312adfd451dab.set(state, id);
  let { gridProps } = $83c6e2eafa584c67$export$f6b86a04e5d66d90({
    ...props,
    id,
    keyboardDelegate: delegate
  }, state, ref);
  if (isVirtualized) gridProps["aria-rowcount"] = state.collection.size + state.collection.headerRows.length;
  if ($f4e2df6bd15f8569$export$1b00cb14a96194e6() && "expandedKeys" in state) gridProps.role = "treegrid";
  let { column, direction: sortDirection } = state.sortDescriptor || {};
  let stringFormatter = $fca6afa0e843324b$export$f12b703ca79dfbb1($parcel$interopDefault$2($7476b46781682bf5$exports), "@react-aria/table");
  let sortDescription = reactExports.useMemo(() => {
    var _state_collection_columns_find;
    var _state_collection_columns_find_textValue;
    let columnName = (_state_collection_columns_find_textValue = (_state_collection_columns_find = state.collection.columns.find((c) => c.key === column)) === null || _state_collection_columns_find === void 0 ? void 0 : _state_collection_columns_find.textValue) !== null && _state_collection_columns_find_textValue !== void 0 ? _state_collection_columns_find_textValue : "";
    return sortDirection && column ? stringFormatter.format(`${sortDirection}Sort`, {
      columnName
    }) : void 0;
  }, [
    sortDirection,
    column,
    state.collection.columns
  ]);
  let descriptionProps = $ef06256079686ba0$export$f8aeda7b10753fa1(sortDescription);
  $4f58c5f72bcf79f7$export$496315a1608d9602$1(() => {
    if (sortDescription) $319e236875307eab$export$a9b970dcc4ae71a9(sortDescription, "assertive", 500);
  }, [
    sortDescription
  ]);
  return {
    gridProps: $3ef42575df84b30b$export$9d1611c77c2fe928$1(gridProps, descriptionProps, {
      // merge sort description with long press information
      "aria-describedby": [
        descriptionProps["aria-describedby"],
        gridProps["aria-describedby"]
      ].filter(Boolean).join(" ")
    })
  };
}
function $parcel$interopDefault$1(a) {
  return a && a.__esModule ? a.default : a;
}
function $f329116d8ad0aba0$export$9514819a8c81e960(props, state, ref) {
  var _state_sortDescriptor, _state_sortDescriptor1;
  let { node } = props;
  let allowsSorting = node.props.allowsSorting;
  let { gridCellProps } = $ab90dcbc1b5466d0$export$c7e10bfc0c59f67c({
    ...props,
    focusMode: "child"
  }, state, ref);
  let isSelectionCellDisabled = node.props.isSelectionCell && state.selectionManager.selectionMode === "single";
  let { pressProps } = $f6c31cce2adf654f$export$45712eceda6fad21$1({
    isDisabled: !allowsSorting || isSelectionCellDisabled,
    onPress() {
      state.sort(node.key);
    },
    ref
  });
  let { focusableProps } = $e6afbd83fe6ebbd2$export$4c014de7c8940b4c$1({}, ref);
  let ariaSort = void 0;
  let isSortedColumn = ((_state_sortDescriptor = state.sortDescriptor) === null || _state_sortDescriptor === void 0 ? void 0 : _state_sortDescriptor.column) === node.key;
  let sortDirection = (_state_sortDescriptor1 = state.sortDescriptor) === null || _state_sortDescriptor1 === void 0 ? void 0 : _state_sortDescriptor1.direction;
  if (node.props.allowsSorting && !$c87311424ea30a05$export$a11b0059900ceec8()) ariaSort = isSortedColumn ? sortDirection : "none";
  let stringFormatter = $fca6afa0e843324b$export$f12b703ca79dfbb1($parcel$interopDefault$1($7476b46781682bf5$exports), "@react-aria/table");
  let sortDescription;
  if (allowsSorting) {
    sortDescription = `${stringFormatter.format("sortable")}`;
    if (isSortedColumn && sortDirection && $c87311424ea30a05$export$a11b0059900ceec8()) sortDescription = `${sortDescription}, ${stringFormatter.format(sortDirection)}`;
  }
  let descriptionProps = $ef06256079686ba0$export$f8aeda7b10753fa1(sortDescription);
  let shouldDisableFocus = state.collection.size === 0;
  reactExports.useEffect(() => {
    if (shouldDisableFocus && state.selectionManager.focusedKey === node.key) state.selectionManager.setFocusedKey(null);
  }, [
    shouldDisableFocus,
    state.selectionManager,
    node.key
  ]);
  return {
    columnHeaderProps: {
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        gridCellProps,
        pressProps,
        focusableProps,
        descriptionProps,
        // If the table is empty, make all column headers untabbable
        shouldDisableFocus ? {
          tabIndex: -1
        } : null
      ),
      role: "columnheader",
      id: $2140fb2337097f2d$export$37cd4213f2ad742e(state, node.key),
      "aria-colspan": node.colspan && node.colspan > 1 ? node.colspan : void 0,
      "aria-sort": ariaSort
    }
  };
}
const $b2db214c022798eb$var$EXPANSION_KEYS = {
  expand: {
    ltr: "ArrowRight",
    rtl: "ArrowLeft"
  },
  "collapse": {
    ltr: "ArrowLeft",
    rtl: "ArrowRight"
  }
};
function $b2db214c022798eb$export$7f2f6ae19e707aa5(props, state, ref) {
  let { node, isVirtualized } = props;
  let { rowProps, ...states } = $4159a7a9cbb0cc18$export$96357d5a73f686fa(props, state, ref);
  let { direction } = $18f2051aff69b9bf$export$43bb16f9c6d9e3f7();
  if (isVirtualized && !($f4e2df6bd15f8569$export$1b00cb14a96194e6() && "expandedKeys" in state)) rowProps["aria-rowindex"] = node.index + 1 + state.collection.headerRows.length;
  else delete rowProps["aria-rowindex"];
  let treeGridRowProps = {};
  if ($f4e2df6bd15f8569$export$1b00cb14a96194e6() && "expandedKeys" in state) {
    let treeNode = state.keyMap.get(node.key);
    if (treeNode != null) {
      var _treeNode_props, _treeNode_props_children, _treeNode_props1, _getLastItem, _state_keyMap_get, _getLastItem1;
      let hasChildRows = ((_treeNode_props = treeNode.props) === null || _treeNode_props === void 0 ? void 0 : _treeNode_props.UNSTABLE_childItems) || ((_treeNode_props1 = treeNode.props) === null || _treeNode_props1 === void 0 ? void 0 : (_treeNode_props_children = _treeNode_props1.children) === null || _treeNode_props_children === void 0 ? void 0 : _treeNode_props_children.length) > state.userColumnCount;
      var _treeNode_indexOfType, _state_keyMap_get_childNodes, _getLastItem_indexOfType, _getLastItem_indexOfType1;
      treeGridRowProps = {
        onKeyDown: (e) => {
          if (e.key === $b2db214c022798eb$var$EXPANSION_KEYS["expand"][direction] && state.selectionManager.focusedKey === treeNode.key && hasChildRows && state.expandedKeys !== "all" && !state.expandedKeys.has(treeNode.key)) {
            state.toggleKey(treeNode.key);
            e.stopPropagation();
          } else if (e.key === $b2db214c022798eb$var$EXPANSION_KEYS["collapse"][direction] && state.selectionManager.focusedKey === treeNode.key && hasChildRows && (state.expandedKeys === "all" || state.expandedKeys.has(treeNode.key))) {
            state.toggleKey(treeNode.key);
            e.stopPropagation();
          }
        },
        "aria-expanded": hasChildRows ? state.expandedKeys === "all" || state.expandedKeys.has(node.key) : void 0,
        "aria-level": treeNode.level,
        "aria-posinset": ((_treeNode_indexOfType = treeNode.indexOfType) !== null && _treeNode_indexOfType !== void 0 ? _treeNode_indexOfType : 0) + 1,
        "aria-setsize": treeNode.level > 1 ? ((_getLastItem_indexOfType = (_getLastItem = $c5a24bc478652b5f$export$7475b2c64539e4cf((_state_keyMap_get_childNodes = (_state_keyMap_get = state.keyMap.get(treeNode.parentKey)) === null || _state_keyMap_get === void 0 ? void 0 : _state_keyMap_get.childNodes) !== null && _state_keyMap_get_childNodes !== void 0 ? _state_keyMap_get_childNodes : [])) === null || _getLastItem === void 0 ? void 0 : _getLastItem.indexOfType) !== null && _getLastItem_indexOfType !== void 0 ? _getLastItem_indexOfType : 0) + 1 : ((_getLastItem_indexOfType1 = (_getLastItem1 = $c5a24bc478652b5f$export$7475b2c64539e4cf(state.collection.body.childNodes)) === null || _getLastItem1 === void 0 ? void 0 : _getLastItem1.indexOfType) !== null && _getLastItem_indexOfType1 !== void 0 ? _getLastItem_indexOfType1 : 0) + 1
      };
    }
  }
  let syntheticLinkProps = $ea8dcbcb9ea1b556$export$bdc77b0c0a3a85d6(node.props);
  let linkProps = states.hasAction ? syntheticLinkProps : {};
  return {
    rowProps: {
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(rowProps, treeGridRowProps, linkProps),
      "aria-labelledby": $2140fb2337097f2d$export$85069b70317f543(state, node.key)
    },
    ...states
  };
}
function $f917ee10f4c32dab$export$1b95a7d2d517b841(props, state, ref) {
  let { node, isVirtualized } = props;
  let rowProps = {
    role: "row"
  };
  if (isVirtualized && !($f4e2df6bd15f8569$export$1b00cb14a96194e6() && "expandedKeys" in state)) rowProps["aria-rowindex"] = node.index + 1;
  return {
    rowProps
  };
}
function $7713593715703b24$export$49571c903d73624c(props, state, ref) {
  var _props_node_column;
  let { gridCellProps, isPressed } = $ab90dcbc1b5466d0$export$c7e10bfc0c59f67c(props, state, ref);
  let columnKey = (_props_node_column = props.node.column) === null || _props_node_column === void 0 ? void 0 : _props_node_column.key;
  if (columnKey != null && state.collection.rowHeaderColumnKeys.has(columnKey)) {
    gridCellProps.role = "rowheader";
    gridCellProps.id = $2140fb2337097f2d$export$19baff3266315d44(state, props.node.parentKey, columnKey);
  }
  return {
    gridCellProps,
    isPressed
  };
}
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $2a795c53a101c542$export$16ea7f650bd7c1bb(props, state) {
  let { key } = props;
  const { checkboxProps } = $7cb39d07f245a780$export$70e2eed1a92976ad(props, state);
  return {
    checkboxProps: {
      ...checkboxProps,
      "aria-labelledby": `${checkboxProps.id} ${$2140fb2337097f2d$export$85069b70317f543(state, key)}`
    }
  };
}
function $2a795c53a101c542$export$1003db6a7e384b99(state) {
  let { isEmpty, isSelectAll, selectionMode } = state.selectionManager;
  const stringFormatter = $fca6afa0e843324b$export$f12b703ca79dfbb1($parcel$interopDefault($7476b46781682bf5$exports), "@react-aria/table");
  return {
    checkboxProps: {
      "aria-label": stringFormatter.format(selectionMode === "single" ? "select" : "selectAll"),
      isSelected: isSelectAll,
      isDisabled: selectionMode !== "multiple" || state.collection.size === 0,
      isIndeterminate: !isEmpty && !isSelectAll,
      onChange: () => state.selectionManager.toggleSelectAll()
    }
  };
}
function $0047e6c294ea075f$export$6fb1613bd7b28198() {
  return $e45487f8ba1cbdbf$export$d3037f5d3f3e51bf();
}
var TableSelectAllCheckbox = forwardRef((props, ref) => {
  var _a, _b;
  const {
    as,
    className,
    node,
    slots,
    state,
    selectionMode,
    color,
    checkboxesProps,
    disableAnimation,
    classNames,
    ...otherProps
  } = props;
  const Component = as || "th";
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const { columnHeaderProps } = $f329116d8ad0aba0$export$9514819a8c81e960({ node }, state, domRef);
  const { isFocusVisible, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f();
  const { checkboxProps } = $2a795c53a101c542$export$1003db6a7e384b99(state);
  const thStyles = clsx(classNames == null ? void 0 : classNames.th, className, (_a = node.props) == null ? void 0 : _a.className);
  const isSingleSelectionMode = selectionMode === "single";
  const { onChange, ...otherCheckboxProps } = checkboxProps;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      ref: domRef,
      "data-focus-visible": dataAttr(isFocusVisible),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        columnHeaderProps,
        focusProps,
        filterDOMProps(node.props, {
          enabled: shouldFilterDOMProps
        }),
        filterDOMProps(otherProps, {
          enabled: shouldFilterDOMProps
        })
      ),
      className: (_b = slots.th) == null ? void 0 : _b.call(slots, { class: thStyles }),
      children: isSingleSelectionMode ? /* @__PURE__ */ jsxRuntimeExports.jsx($5c3e21d68f1c4674$export$439d29a4e110a164, { children: checkboxProps["aria-label"] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        checkbox_default,
        {
          color,
          disableAnimation,
          onValueChange: onChange,
          ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(checkboxesProps, otherCheckboxProps)
        }
      )
    }
  );
});
TableSelectAllCheckbox.displayName = "HeroUI.TableSelectAllCheckbox";
var table_select_all_checkbox_default = TableSelectAllCheckbox;
function $62967d126f3aa823$export$4007ac09ff9c68ed(props) {
  let { collection, focusMode } = props;
  let selectionState = props.UNSAFE_selectionState || $7af3f5b51489e0b5$export$253fe78d46329472(props);
  let disabledKeys = reactExports.useMemo(() => props.disabledKeys ? new Set(props.disabledKeys) : /* @__PURE__ */ new Set(), [
    props.disabledKeys
  ]);
  let setFocusedKey = selectionState.setFocusedKey;
  selectionState.setFocusedKey = (key, child) => {
    if (focusMode === "cell" && key != null) {
      let item = collection.getItem(key);
      if ((item === null || item === void 0 ? void 0 : item.type) === "item") {
        var _getLastItem, _getFirstItem;
        let children = $c5a24bc478652b5f$export$1005530eda016c13(item, collection);
        var _getLastItem_key, _getFirstItem_key;
        if (child === "last") key = (_getLastItem_key = (_getLastItem = $c5a24bc478652b5f$export$7475b2c64539e4cf(children)) === null || _getLastItem === void 0 ? void 0 : _getLastItem.key) !== null && _getLastItem_key !== void 0 ? _getLastItem_key : null;
        else key = (_getFirstItem_key = (_getFirstItem = $c5a24bc478652b5f$export$fbdeaa6a76694f71(children)) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key) !== null && _getFirstItem_key !== void 0 ? _getFirstItem_key : null;
      }
    }
    setFocusedKey(key, child);
  };
  let selectionManager = reactExports.useMemo(() => new $d496c0a20b6e58ec$export$6c8a5aaad13c9852(collection, selectionState), [
    collection,
    selectionState
  ]);
  const cachedCollection = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (selectionState.focusedKey != null && cachedCollection.current && !collection.getItem(selectionState.focusedKey)) {
      const node = cachedCollection.current.getItem(selectionState.focusedKey);
      const parentNode = (node === null || node === void 0 ? void 0 : node.parentKey) != null && (node.type === "cell" || node.type === "rowheader" || node.type === "column") ? cachedCollection.current.getItem(node.parentKey) : node;
      if (!parentNode) {
        selectionState.setFocusedKey(null);
        return;
      }
      const cachedRows = cachedCollection.current.rows;
      const rows = collection.rows;
      const diff = cachedRows.length - rows.length;
      let index = Math.min(diff > 1 ? Math.max(parentNode.index - diff + 1, 0) : parentNode.index, rows.length - 1);
      let newRow = null;
      while (index >= 0) {
        if (!selectionManager.isDisabled(rows[index].key) && rows[index].type !== "headerrow") {
          newRow = rows[index];
          break;
        }
        if (index < rows.length - 1) index++;
        else {
          if (index > parentNode.index) index = parentNode.index;
          index--;
        }
      }
      if (newRow) {
        const childNodes = newRow.hasChildNodes ? [
          ...$c5a24bc478652b5f$export$1005530eda016c13(newRow, collection)
        ] : [];
        const keyToFocus = newRow.hasChildNodes && parentNode !== node && node && node.index < childNodes.length ? childNodes[node.index].key : newRow.key;
        selectionState.setFocusedKey(keyToFocus);
      } else selectionState.setFocusedKey(null);
    }
    cachedCollection.current = collection;
  }, [
    collection,
    selectionManager,
    selectionState,
    selectionState.focusedKey
  ]);
  return {
    collection,
    disabledKeys,
    isKeyboardNavigationDisabled: false,
    selectionManager
  };
}
class $16805b1b18093c5f$export$de3fdf6493c353d {
  *[Symbol.iterator]() {
    yield* [
      ...this.rows
    ];
  }
  get size() {
    return [
      ...this.rows
    ].length;
  }
  getKeys() {
    return this.keyMap.keys();
  }
  getKeyBefore(key) {
    let node = this.keyMap.get(key);
    var _node_prevKey;
    return node ? (_node_prevKey = node.prevKey) !== null && _node_prevKey !== void 0 ? _node_prevKey : null : null;
  }
  getKeyAfter(key) {
    let node = this.keyMap.get(key);
    var _node_nextKey;
    return node ? (_node_nextKey = node.nextKey) !== null && _node_nextKey !== void 0 ? _node_nextKey : null : null;
  }
  getFirstKey() {
    var _;
    return (_ = [
      ...this.rows
    ][0]) === null || _ === void 0 ? void 0 : _.key;
  }
  getLastKey() {
    var _rows_;
    let rows = [
      ...this.rows
    ];
    return (_rows_ = rows[rows.length - 1]) === null || _rows_ === void 0 ? void 0 : _rows_.key;
  }
  getItem(key) {
    var _this_keyMap_get;
    return (_this_keyMap_get = this.keyMap.get(key)) !== null && _this_keyMap_get !== void 0 ? _this_keyMap_get : null;
  }
  at(idx) {
    const keys = [
      ...this.getKeys()
    ];
    return this.getItem(keys[idx]);
  }
  getChildren(key) {
    let node = this.keyMap.get(key);
    return (node === null || node === void 0 ? void 0 : node.childNodes) || [];
  }
  constructor(opts) {
    this.keyMap = /* @__PURE__ */ new Map();
    this.keyMap = /* @__PURE__ */ new Map();
    this.columnCount = opts === null || opts === void 0 ? void 0 : opts.columnCount;
    this.rows = [];
    let visit = (node) => {
      let prevNode = this.keyMap.get(node.key);
      if (opts.visitNode) node = opts.visitNode(node);
      this.keyMap.set(node.key, node);
      let childKeys = /* @__PURE__ */ new Set();
      let last2 = null;
      for (let child of node.childNodes) {
        if (child.type === "cell" && child.parentKey == null)
          child.parentKey = node.key;
        childKeys.add(child.key);
        if (last2) {
          last2.nextKey = child.key;
          child.prevKey = last2.key;
        } else child.prevKey = null;
        visit(child);
        last2 = child;
      }
      if (last2) last2.nextKey = null;
      if (prevNode) {
        for (let child of prevNode.childNodes) if (!childKeys.has(child.key)) remove(child);
      }
    };
    let remove = (node) => {
      this.keyMap.delete(node.key);
      for (let child of node.childNodes) if (this.keyMap.get(child.key) === child) remove(child);
    };
    let last = null;
    for (let [i, node] of opts.items.entries()) {
      var _node_level, _node_key, _node_type, _node_value, _node_textValue, _node_index;
      let rowNode = {
        ...node,
        level: (_node_level = node.level) !== null && _node_level !== void 0 ? _node_level : 0,
        key: (_node_key = node.key) !== null && _node_key !== void 0 ? _node_key : "row-" + i,
        type: (_node_type = node.type) !== null && _node_type !== void 0 ? _node_type : "row",
        value: (_node_value = node.value) !== null && _node_value !== void 0 ? _node_value : null,
        hasChildNodes: true,
        childNodes: [
          ...node.childNodes
        ],
        rendered: node.rendered,
        textValue: (_node_textValue = node.textValue) !== null && _node_textValue !== void 0 ? _node_textValue : "",
        index: (_node_index = node.index) !== null && _node_index !== void 0 ? _node_index : i
      };
      if (last) {
        last.nextKey = rowNode.key;
        rowNode.prevKey = last.key;
      } else rowNode.prevKey = null;
      this.rows.push(rowNode);
      visit(rowNode);
      last = rowNode;
    }
    if (last) last.nextKey = null;
  }
}
const $788781baa30117fa$var$ROW_HEADER_COLUMN_KEY = "row-header-column-" + Math.random().toString(36).slice(2);
let $788781baa30117fa$var$ROW_HEADER_COLUMN_KEY_DRAG = "row-header-column-" + Math.random().toString(36).slice(2);
while ($788781baa30117fa$var$ROW_HEADER_COLUMN_KEY === $788781baa30117fa$var$ROW_HEADER_COLUMN_KEY_DRAG) $788781baa30117fa$var$ROW_HEADER_COLUMN_KEY_DRAG = "row-header-column-" + Math.random().toString(36).slice(2);
function $788781baa30117fa$export$7c127db850d4e81e(keyMap, columnNodes) {
  if (columnNodes.length === 0) return [];
  let columns = [];
  let seen = /* @__PURE__ */ new Map();
  for (let column of columnNodes) {
    let parentKey = column.parentKey;
    let col = [
      column
    ];
    while (parentKey) {
      let parent = keyMap.get(parentKey);
      if (!parent) break;
      if (seen.has(parent)) {
        var _parent;
        var _colspan;
        (_colspan = (_parent = parent).colspan) !== null && _colspan !== void 0 ? _colspan : _parent.colspan = 0;
        parent.colspan++;
        let { column: column2, index } = seen.get(parent);
        if (index > col.length) break;
        for (let i2 = index; i2 < col.length; i2++) column2.splice(i2, 0, null);
        for (let i2 = col.length; i2 < column2.length; i2++)
          if (column2[i2] && seen.has(column2[i2])) seen.get(column2[i2]).index = i2;
      } else {
        parent.colspan = 1;
        col.push(parent);
        seen.set(parent, {
          column: col,
          index: col.length - 1
        });
      }
      parentKey = parent.parentKey;
    }
    columns.push(col);
    column.index = columns.length - 1;
  }
  let maxLength = Math.max(...columns.map((c) => c.length));
  let headerRows = Array(maxLength).fill(0).map(() => []);
  let colIndex = 0;
  for (let column of columns) {
    let i2 = maxLength - 1;
    for (let item of column) {
      if (item) {
        let row = headerRows[i2];
        let rowLength = row.reduce((p, c) => {
          var _c_colspan;
          return p + ((_c_colspan = c.colspan) !== null && _c_colspan !== void 0 ? _c_colspan : 1);
        }, 0);
        if (rowLength < colIndex) {
          let placeholder = {
            type: "placeholder",
            key: "placeholder-" + item.key,
            colspan: colIndex - rowLength,
            index: rowLength,
            value: null,
            rendered: null,
            level: i2,
            hasChildNodes: false,
            childNodes: [],
            textValue: ""
          };
          if (row.length > 0) {
            row[row.length - 1].nextKey = placeholder.key;
            placeholder.prevKey = row[row.length - 1].key;
          }
          row.push(placeholder);
        }
        if (row.length > 0) {
          row[row.length - 1].nextKey = item.key;
          item.prevKey = row[row.length - 1].key;
        }
        item.level = i2;
        item.colIndex = colIndex;
        row.push(item);
      }
      i2--;
    }
    colIndex++;
  }
  let i = 0;
  for (let row of headerRows) {
    let rowLength = row.reduce((p, c) => {
      var _c_colspan;
      return p + ((_c_colspan = c.colspan) !== null && _c_colspan !== void 0 ? _c_colspan : 1);
    }, 0);
    if (rowLength < columnNodes.length) {
      let placeholder = {
        type: "placeholder",
        key: "placeholder-" + row[row.length - 1].key,
        colspan: columnNodes.length - rowLength,
        index: rowLength,
        value: null,
        rendered: null,
        level: i,
        hasChildNodes: false,
        childNodes: [],
        textValue: "",
        prevKey: row[row.length - 1].key
      };
      row.push(placeholder);
    }
    i++;
  }
  return headerRows.map((childNodes, index) => {
    let row = {
      type: "headerrow",
      key: "headerrow-" + index,
      index,
      value: null,
      rendered: null,
      level: 0,
      hasChildNodes: true,
      childNodes,
      textValue: ""
    };
    return row;
  });
}
class $788781baa30117fa$export$596e1b2e2cf93690 extends $16805b1b18093c5f$export$de3fdf6493c353d {
  *[Symbol.iterator]() {
    yield* this.body.childNodes;
  }
  get size() {
    return this._size;
  }
  getKeys() {
    return this.keyMap.keys();
  }
  getKeyBefore(key) {
    let node = this.keyMap.get(key);
    var _node_prevKey;
    return (_node_prevKey = node === null || node === void 0 ? void 0 : node.prevKey) !== null && _node_prevKey !== void 0 ? _node_prevKey : null;
  }
  getKeyAfter(key) {
    let node = this.keyMap.get(key);
    var _node_nextKey;
    return (_node_nextKey = node === null || node === void 0 ? void 0 : node.nextKey) !== null && _node_nextKey !== void 0 ? _node_nextKey : null;
  }
  getFirstKey() {
    var _getFirstItem;
    var _getFirstItem_key;
    return (_getFirstItem_key = (_getFirstItem = $c5a24bc478652b5f$export$fbdeaa6a76694f71(this.body.childNodes)) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key) !== null && _getFirstItem_key !== void 0 ? _getFirstItem_key : null;
  }
  getLastKey() {
    var _getLastItem;
    var _getLastItem_key;
    return (_getLastItem_key = (_getLastItem = $c5a24bc478652b5f$export$7475b2c64539e4cf(this.body.childNodes)) === null || _getLastItem === void 0 ? void 0 : _getLastItem.key) !== null && _getLastItem_key !== void 0 ? _getLastItem_key : null;
  }
  getItem(key) {
    var _this_keyMap_get;
    return (_this_keyMap_get = this.keyMap.get(key)) !== null && _this_keyMap_get !== void 0 ? _this_keyMap_get : null;
  }
  at(idx) {
    const keys = [
      ...this.getKeys()
    ];
    return this.getItem(keys[idx]);
  }
  getChildren(key) {
    if (key === this.body.key) return this.body.childNodes;
    return super.getChildren(key);
  }
  getTextValue(key) {
    let row = this.getItem(key);
    if (!row) return "";
    if (row.textValue) return row.textValue;
    let rowHeaderColumnKeys = this.rowHeaderColumnKeys;
    if (rowHeaderColumnKeys) {
      let text = [];
      for (let cell of row.childNodes) {
        let column = this.columns[cell.index];
        if (rowHeaderColumnKeys.has(column.key) && cell.textValue) text.push(cell.textValue);
        if (text.length === rowHeaderColumnKeys.size) break;
      }
      return text.join(" ");
    }
    return "";
  }
  constructor(nodes, prev, opts) {
    let rowHeaderColumnKeys = /* @__PURE__ */ new Set();
    let body = null;
    let columns = [];
    if (opts === null || opts === void 0 ? void 0 : opts.showSelectionCheckboxes) {
      let rowHeaderColumn = {
        type: "column",
        key: $788781baa30117fa$var$ROW_HEADER_COLUMN_KEY,
        value: null,
        textValue: "",
        level: 0,
        index: (opts === null || opts === void 0 ? void 0 : opts.showDragButtons) ? 1 : 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: [],
        props: {
          isSelectionCell: true
        }
      };
      columns.unshift(rowHeaderColumn);
    }
    if (opts === null || opts === void 0 ? void 0 : opts.showDragButtons) {
      let rowHeaderColumn = {
        type: "column",
        key: $788781baa30117fa$var$ROW_HEADER_COLUMN_KEY_DRAG,
        value: null,
        textValue: "",
        level: 0,
        index: 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: [],
        props: {
          isDragButtonCell: true
        }
      };
      columns.unshift(rowHeaderColumn);
    }
    let rows = [];
    let columnKeyMap = /* @__PURE__ */ new Map();
    let visit = (node) => {
      switch (node.type) {
        case "body":
          body = node;
          break;
        case "column":
          columnKeyMap.set(node.key, node);
          if (!node.hasChildNodes) {
            columns.push(node);
            if (node.props.isRowHeader) rowHeaderColumnKeys.add(node.key);
          }
          break;
        case "item":
          rows.push(node);
          return;
      }
      for (let child of node.childNodes) visit(child);
    };
    for (let node of nodes) visit(node);
    let headerRows = $788781baa30117fa$export$7c127db850d4e81e(columnKeyMap, columns);
    headerRows.forEach((row, i) => rows.splice(i, 0, row));
    super({
      columnCount: columns.length,
      items: rows,
      visitNode: (node) => {
        node.column = columns[node.index];
        return node;
      }
    }), this._size = 0;
    this.columns = columns;
    this.rowHeaderColumnKeys = rowHeaderColumnKeys;
    this.body = body;
    this.headerRows = headerRows;
    this._size = [
      ...body.childNodes
    ].length;
    if (this.rowHeaderColumnKeys.size === 0) {
      let col = this.columns.find((column) => {
        var _column_props, _column_props1;
        return !((_column_props = column.props) === null || _column_props === void 0 ? void 0 : _column_props.isDragButtonCell) && !((_column_props1 = column.props) === null || _column_props1 === void 0 ? void 0 : _column_props1.isSelectionCell);
      });
      if (col) this.rowHeaderColumnKeys.add(col.key);
    }
  }
}
const $4a0dd036d492cee4$var$OPPOSITE_SORT_DIRECTION = {
  ascending: "descending",
  descending: "ascending"
};
function $4a0dd036d492cee4$export$907bcc6c48325fd6(props) {
  let [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = reactExports.useState(false);
  let { selectionMode = "none", showSelectionCheckboxes, showDragButtons } = props;
  let context = reactExports.useMemo(() => ({
    showSelectionCheckboxes: showSelectionCheckboxes && selectionMode !== "none",
    showDragButtons,
    selectionMode,
    columns: []
  }), [
    props.children,
    showSelectionCheckboxes,
    selectionMode,
    showDragButtons
  ]);
  let collection = $7613b1592d41b092$export$6cd28814d92fa9c9(props, reactExports.useCallback((nodes) => new $788781baa30117fa$export$596e1b2e2cf93690(nodes, null, context), [
    context
  ]), context);
  let { disabledKeys, selectionManager } = $62967d126f3aa823$export$4007ac09ff9c68ed({
    ...props,
    collection,
    disabledBehavior: props.disabledBehavior || "selection"
  });
  var _props_sortDescriptor;
  return {
    collection,
    disabledKeys,
    selectionManager,
    showSelectionCheckboxes: props.showSelectionCheckboxes || false,
    sortDescriptor: (_props_sortDescriptor = props.sortDescriptor) !== null && _props_sortDescriptor !== void 0 ? _props_sortDescriptor : null,
    isKeyboardNavigationDisabled: collection.size === 0 || isKeyboardNavigationDisabled,
    setKeyboardNavigationDisabled,
    sort(columnKey, direction) {
      var _props_sortDescriptor2, _props_onSortChange;
      (_props_onSortChange = props.onSortChange) === null || _props_onSortChange === void 0 ? void 0 : _props_onSortChange.call(props, {
        column: columnKey,
        direction: direction !== null && direction !== void 0 ? direction : ((_props_sortDescriptor2 = props.sortDescriptor) === null || _props_sortDescriptor2 === void 0 ? void 0 : _props_sortDescriptor2.column) === columnKey ? $4a0dd036d492cee4$var$OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction] : "ascending"
      });
    }
  };
}
function $312ae3b56a94a86e$var$TableHeader(props) {
  return null;
}
$312ae3b56a94a86e$var$TableHeader.getCollectionNode = function* getCollectionNode(props, context) {
  let { children, columns } = props;
  context.columns = [];
  if (typeof children === "function") {
    if (!columns) throw new Error("props.children was a function but props.columns is missing");
    for (let column of columns) yield {
      type: "column",
      value: column,
      renderer: children
    };
  } else {
    let columns2 = [];
    React.Children.forEach(children, (column) => {
      columns2.push({
        type: "column",
        element: column
      });
    });
    yield* columns2;
  }
};
let $312ae3b56a94a86e$export$f850895b287ef28e = $312ae3b56a94a86e$var$TableHeader;
function $4ae5314bf50db1a3$var$TableBody(props) {
  return null;
}
$4ae5314bf50db1a3$var$TableBody.getCollectionNode = function* getCollectionNode2(props) {
  let { children, items } = props;
  yield {
    type: "body",
    hasChildNodes: true,
    props,
    *childNodes() {
      if (typeof children === "function") {
        if (!items) throw new Error("props.children was a function but props.items is missing");
        for (let item of items) yield {
          type: "item",
          value: item,
          renderer: children
        };
      } else {
        let items2 = [];
        React.Children.forEach(children, (item) => {
          items2.push({
            type: "item",
            element: item
          });
        });
        yield* items2;
      }
    }
  };
};
let $4ae5314bf50db1a3$export$76ccd210b9029917 = $4ae5314bf50db1a3$var$TableBody;
function $1cd244557c2f97d5$var$Column(props) {
  return null;
}
$1cd244557c2f97d5$var$Column.getCollectionNode = function* getCollectionNode3(props, context) {
  let { title, children, childColumns } = props;
  let rendered = title || children;
  let textValue = props.textValue || (typeof rendered === "string" ? rendered : "") || props["aria-label"];
  let fullNodes = yield {
    type: "column",
    hasChildNodes: !!childColumns || !!title && React.Children.count(children) > 0,
    rendered,
    textValue,
    props,
    *childNodes() {
      if (childColumns) for (let child of childColumns) yield {
        type: "column",
        value: child
      };
      else if (title) {
        let childColumns2 = [];
        React.Children.forEach(children, (child) => {
          childColumns2.push({
            type: "column",
            element: child
          });
        });
        yield* childColumns2;
      }
    },
    shouldInvalidate(newContext) {
      updateContext(newContext);
      return false;
    }
  };
  let updateContext = (context2) => {
    for (let node of fullNodes) if (!node.hasChildNodes) context2.columns.push(node);
  };
  updateContext(context);
};
let $1cd244557c2f97d5$export$816b5d811295e6bc = $1cd244557c2f97d5$var$Column;
function $70d70eb16ea48428$var$Row(props) {
  return null;
}
$70d70eb16ea48428$var$Row.getCollectionNode = function* getCollectionNode4(props, context) {
  let { children, textValue, UNSTABLE_childItems } = props;
  yield {
    type: "item",
    props,
    textValue,
    "aria-label": props["aria-label"],
    hasChildNodes: true,
    *childNodes() {
      if (context.showDragButtons) yield {
        type: "cell",
        key: "header-drag",
        props: {
          isDragButtonCell: true
        }
      };
      if (context.showSelectionCheckboxes && context.selectionMode !== "none") yield {
        type: "cell",
        key: "header",
        props: {
          isSelectionCell: true
        }
      };
      if (typeof children === "function") {
        for (let column of context.columns) yield {
          type: "cell",
          element: children(column.key),
          key: column.key
          // this is combined with the row key by CollectionBuilder
        };
        if (UNSTABLE_childItems) for (let child of UNSTABLE_childItems)
          yield {
            type: "item",
            value: child
          };
      } else {
        let cells = [];
        let childRows = [];
        React.Children.forEach(children, (node) => {
          if (node.type === $70d70eb16ea48428$var$Row) {
            if (cells.length < context.columns.length) throw new Error("All of a Row's child Cells must be positioned before any child Rows.");
            childRows.push({
              type: "item",
              element: node
            });
          } else cells.push({
            type: "cell",
            element: node
          });
        });
        if (cells.length !== context.columns.length) throw new Error(`Cell count must match column count. Found ${cells.length} cells and ${context.columns.length} columns.`);
        yield* cells;
        yield* childRows;
      }
    },
    shouldInvalidate(newContext) {
      return newContext.columns.length !== context.columns.length || newContext.columns.some((c, i) => c.key !== context.columns[i].key) || newContext.showSelectionCheckboxes !== context.showSelectionCheckboxes || newContext.showDragButtons !== context.showDragButtons || newContext.selectionMode !== context.selectionMode;
    }
  };
};
let $70d70eb16ea48428$export$b59bdbef9ce70de2 = $70d70eb16ea48428$var$Row;
function $941d1d9a6a28982a$var$Cell(props) {
  return null;
}
$941d1d9a6a28982a$var$Cell.getCollectionNode = function* getCollectionNode5(props) {
  let { children } = props;
  let textValue = props.textValue || (typeof children === "string" ? children : "") || props["aria-label"] || "";
  yield {
    type: "cell",
    props,
    rendered: children,
    textValue,
    "aria-label": props["aria-label"],
    hasChildNodes: false
  };
};
let $941d1d9a6a28982a$export$f6f0c3fe4ec306ea = $941d1d9a6a28982a$var$Cell;
function useTable(originalProps) {
  var _a;
  const globalContext = useProviderContext();
  const [props, variantProps] = mapPropsVariants(originalProps, table.variantKeys);
  const {
    ref,
    as,
    baseRef,
    children,
    className,
    classNames,
    removeWrapper = false,
    disableAnimation = (_a = globalContext == null ? void 0 : globalContext.disableAnimation) != null ? _a : false,
    isKeyboardNavigationDisabled = false,
    selectionMode = "none",
    topContentPlacement = "inside",
    bottomContentPlacement = "inside",
    selectionBehavior = selectionMode === "none" ? null : "toggle",
    disabledBehavior = "selection",
    showSelectionCheckboxes = selectionMode === "multiple" && selectionBehavior !== "replace",
    BaseComponent = "div",
    checkboxesProps,
    topContent,
    bottomContent,
    onRowAction,
    onCellAction,
    ...otherProps
  } = props;
  const Component = as || "table";
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const domBaseRef = useDOMRef(baseRef);
  const state = $4a0dd036d492cee4$export$907bcc6c48325fd6({
    ...originalProps,
    children,
    showSelectionCheckboxes
  });
  if (isKeyboardNavigationDisabled && !state.isKeyboardNavigationDisabled) {
    state.setKeyboardNavigationDisabled(true);
  }
  const { collection } = state;
  const { layout, ...otherOriginalProps } = originalProps;
  const { gridProps } = $6e31608fbba75bab$export$25bceaac3c7e4dc7({ ...otherOriginalProps }, state, domRef);
  const isSelectable = selectionMode !== "none";
  const isMultiSelectable = selectionMode === "multiple";
  const slots = reactExports.useMemo(
    () => table({
      ...variantProps,
      isSelectable,
      isMultiSelectable
    }),
    [objectToDeps(variantProps), isSelectable, isMultiSelectable]
  );
  const baseStyles = clsx(classNames == null ? void 0 : classNames.base, className);
  const values = reactExports.useMemo(
    () => {
      var _a2;
      return {
        state,
        slots,
        isSelectable,
        collection,
        classNames,
        color: originalProps == null ? void 0 : originalProps.color,
        disableAnimation,
        checkboxesProps,
        isHeaderSticky: (_a2 = originalProps == null ? void 0 : originalProps.isHeaderSticky) != null ? _a2 : false,
        selectionMode,
        selectionBehavior,
        disabledBehavior,
        showSelectionCheckboxes,
        onRowAction,
        onCellAction
      };
    },
    [
      slots,
      state,
      collection,
      isSelectable,
      classNames,
      selectionMode,
      selectionBehavior,
      checkboxesProps,
      disabledBehavior,
      disableAnimation,
      showSelectionCheckboxes,
      originalProps == null ? void 0 : originalProps.color,
      originalProps == null ? void 0 : originalProps.isHeaderSticky,
      onRowAction,
      onCellAction
    ]
  );
  const getBaseProps = reactExports.useCallback(
    (props2) => ({
      ...props2,
      ref: domBaseRef,
      className: slots.base({ class: clsx(baseStyles, props2 == null ? void 0 : props2.className) })
    }),
    [baseStyles, slots]
  );
  const getWrapperProps = reactExports.useCallback(
    (props2) => ({
      ...props2,
      ref: domBaseRef,
      className: slots.wrapper({ class: clsx(classNames == null ? void 0 : classNames.wrapper, props2 == null ? void 0 : props2.className) })
    }),
    [classNames == null ? void 0 : classNames.wrapper, slots]
  );
  const getTableProps = reactExports.useCallback(
    (props2) => ({
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        gridProps,
        filterDOMProps(otherProps, {
          enabled: shouldFilterDOMProps
        }),
        props2
      ),
      onKeyDownCapture: void 0,
      ref: domRef,
      className: slots.table({ class: clsx(classNames == null ? void 0 : classNames.table, props2 == null ? void 0 : props2.className) })
    }),
    [classNames == null ? void 0 : classNames.table, shouldFilterDOMProps, slots, gridProps, otherProps]
  );
  return {
    BaseComponent,
    Component,
    children,
    state,
    collection,
    values,
    topContent,
    bottomContent,
    removeWrapper,
    topContentPlacement,
    bottomContentPlacement,
    getBaseProps,
    getWrapperProps,
    getTableProps
  };
}
var TableCell$1 = forwardRef((props, ref) => {
  var _a, _b, _c;
  const { as, className, node, rowKey, slots, state, classNames, ...otherProps } = props;
  const Component = as || "td";
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const { gridCellProps } = $7713593715703b24$export$49571c903d73624c({ node }, state, domRef);
  const tdStyles = clsx(classNames == null ? void 0 : classNames.td, className, (_a = node.props) == null ? void 0 : _a.className);
  const { isFocusVisible, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f();
  const isRowSelected = state.selectionManager.isSelected(rowKey);
  const cell = reactExports.useMemo(() => {
    const cellType = typeof node.rendered;
    return cellType !== "object" && cellType !== "function" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: node.rendered }) : node.rendered;
  }, [node.rendered]);
  const columnProps = ((_b = node.column) == null ? void 0 : _b.props) || {};
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      ref: domRef,
      "data-focus-visible": dataAttr(isFocusVisible),
      "data-selected": dataAttr(isRowSelected),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        gridCellProps,
        focusProps,
        filterDOMProps(node.props, {
          enabled: shouldFilterDOMProps
        }),
        otherProps
      ),
      className: (_c = slots.td) == null ? void 0 : _c.call(slots, { align: columnProps.align, class: tdStyles }),
      children: cell
    }
  );
});
TableCell$1.displayName = "HeroUI.TableCell";
var table_cell_default$1 = TableCell$1;
var TableCheckboxCell = forwardRef((props, ref) => {
  var _a, _b;
  const {
    as,
    className,
    node,
    rowKey,
    slots,
    state,
    color,
    disableAnimation,
    checkboxesProps,
    selectionMode,
    classNames,
    ...otherProps
  } = props;
  const Component = as || "td";
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const { gridCellProps } = $7713593715703b24$export$49571c903d73624c({ node }, state, domRef);
  const { isFocusVisible, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f();
  const { checkboxProps } = $2a795c53a101c542$export$16ea7f650bd7c1bb({ key: (node == null ? void 0 : node.parentKey) || node.key }, state);
  const tdStyles = clsx(classNames == null ? void 0 : classNames.td, className, (_a = node.props) == null ? void 0 : _a.className);
  const isSingleSelectionMode = selectionMode === "single";
  const { onChange, ...otherCheckboxProps } = checkboxProps;
  const isRowSelected = state.selectionManager.isSelected(rowKey);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      ref: domRef,
      "data-focus-visible": dataAttr(isFocusVisible),
      "data-selected": dataAttr(isRowSelected),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        gridCellProps,
        focusProps,
        filterDOMProps(node.props, {
          enabled: shouldFilterDOMProps
        }),
        otherProps
      ),
      className: (_b = slots.td) == null ? void 0 : _b.call(slots, { class: tdStyles }),
      children: isSingleSelectionMode ? /* @__PURE__ */ jsxRuntimeExports.jsx($5c3e21d68f1c4674$export$439d29a4e110a164, { children: checkboxProps["aria-label"] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        checkbox_default,
        {
          color,
          disableAnimation,
          onValueChange: onChange,
          ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(checkboxesProps, otherCheckboxProps)
        }
      )
    }
  );
});
TableCheckboxCell.displayName = "HeroUI.TableCheckboxCell";
var table_checkbox_cell_default = TableCheckboxCell;
var TableRow$1 = forwardRef((props, ref) => {
  var _a, _b;
  const { as, className, children, node, slots, state, isSelectable, classNames, ...otherProps } = props;
  const Component = as || ((props == null ? void 0 : props.href) ? "a" : "tr");
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const { rowProps } = $b2db214c022798eb$export$7f2f6ae19e707aa5({ node }, state, domRef);
  const trStyles = clsx(classNames == null ? void 0 : classNames.tr, className, (_a = node.props) == null ? void 0 : _a.className);
  const { isFocusVisible, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f();
  const isDisabled = state.disabledKeys.has(node.key);
  const isSelected = state.selectionManager.isSelected(node.key);
  const { isHovered, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled });
  const { isFirst, isLast, isMiddle, isOdd } = reactExports.useMemo(() => {
    const isFirst2 = node.key === state.collection.getFirstKey();
    const isLast2 = node.key === state.collection.getLastKey();
    const isMiddle2 = !isFirst2 && !isLast2;
    const isOdd2 = (node == null ? void 0 : node.index) ? (node.index + 1) % 2 === 0 : false;
    return {
      isFirst: isFirst2,
      isLast: isLast2,
      isMiddle: isMiddle2,
      isOdd: isOdd2
    };
  }, [node, state.collection]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      ref: domRef,
      "data-disabled": dataAttr(isDisabled),
      "data-first": dataAttr(isFirst),
      "data-focus-visible": dataAttr(isFocusVisible),
      "data-hover": dataAttr(isHovered),
      "data-last": dataAttr(isLast),
      "data-middle": dataAttr(isMiddle),
      "data-odd": dataAttr(isOdd),
      "data-selected": dataAttr(isSelected),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        rowProps,
        focusProps,
        isSelectable ? hoverProps : {},
        filterDOMProps(node.props, {
          enabled: shouldFilterDOMProps
        }),
        otherProps
      ),
      className: (_b = slots.tr) == null ? void 0 : _b.call(slots, { class: trStyles }),
      children
    }
  );
});
TableRow$1.displayName = "HeroUI.TableRow";
var table_row_default$1 = TableRow$1;
var TableBody$1 = forwardRef((props, ref) => {
  var _a;
  const {
    as,
    className,
    slots,
    state,
    collection,
    isSelectable,
    color,
    disableAnimation,
    checkboxesProps,
    selectionMode,
    classNames,
    ...otherProps
  } = props;
  const Component = as || "tbody";
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const { rowGroupProps } = $0047e6c294ea075f$export$6fb1613bd7b28198();
  const tbodyStyles = clsx(classNames == null ? void 0 : classNames.tbody, className);
  const bodyProps = collection == null ? void 0 : collection.body.props;
  const isLoading = (bodyProps == null ? void 0 : bodyProps.isLoading) || (bodyProps == null ? void 0 : bodyProps.loadingState) === "loading" || (bodyProps == null ? void 0 : bodyProps.loadingState) === "loadingMore";
  const renderRows = reactExports.useMemo(() => {
    return [...collection.body.childNodes].map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      table_row_default$1,
      {
        classNames,
        isSelectable,
        node: row,
        slots,
        state,
        children: [...row.childNodes].map(
          (cell) => cell.props.isSelectionCell ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            table_checkbox_cell_default,
            {
              checkboxesProps,
              classNames,
              color,
              disableAnimation,
              node: cell,
              rowKey: row.key,
              selectionMode,
              slots,
              state
            },
            cell.key
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            table_cell_default$1,
            {
              classNames,
              node: cell,
              rowKey: row.key,
              slots,
              state
            },
            cell.key
          )
        )
      },
      row.key
    ));
  }, [collection.body.childNodes, classNames, isSelectable, slots, state]);
  let emptyContent;
  let loadingContent;
  if (collection.size === 0 && bodyProps.emptyContent) {
    emptyContent = /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { role: "row", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "td",
      {
        className: slots == null ? void 0 : slots.emptyWrapper({ class: classNames == null ? void 0 : classNames.emptyWrapper }),
        colSpan: collection.columnCount,
        role: "gridcell",
        children: !isLoading && bodyProps.emptyContent
      }
    ) });
  }
  if (isLoading && bodyProps.loadingContent) {
    loadingContent = /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { role: "row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "td",
        {
          className: slots == null ? void 0 : slots.loadingWrapper({ class: classNames == null ? void 0 : classNames.loadingWrapper }),
          colSpan: collection.columnCount,
          role: "gridcell",
          children: bodyProps.loadingContent
        }
      ),
      !emptyContent && collection.size === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: slots == null ? void 0 : slots.emptyWrapper({ class: classNames == null ? void 0 : classNames.emptyWrapper }) }) : null
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Component,
    {
      ref: domRef,
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        rowGroupProps,
        filterDOMProps(bodyProps, {
          enabled: shouldFilterDOMProps
        }),
        otherProps
      ),
      className: (_a = slots.tbody) == null ? void 0 : _a.call(slots, { class: tbodyStyles }),
      "data-empty": dataAttr(collection.size === 0),
      "data-loading": dataAttr(isLoading),
      children: [
        renderRows,
        loadingContent,
        emptyContent
      ]
    }
  );
});
TableBody$1.displayName = "HeroUI.TableBody";
var table_body_default$1 = TableBody$1;
var TableColumnHeader = forwardRef((props, ref) => {
  var _a, _b, _c, _d, _e;
  const { as, className, state, node, slots, classNames, ...otherProps } = props;
  const Component = as || "th";
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const { columnHeaderProps } = $f329116d8ad0aba0$export$9514819a8c81e960({ node }, state, domRef);
  const thStyles = clsx(classNames == null ? void 0 : classNames.th, className, (_a = node.props) == null ? void 0 : _a.className);
  const { isFocusVisible, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f();
  const { isHovered, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({});
  const { hideHeader, align, ...columnProps } = node.props;
  const allowsSorting = columnProps.allowsSorting;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Component,
    {
      ref: domRef,
      colSpan: node.colspan,
      "data-focus-visible": dataAttr(isFocusVisible),
      "data-hover": dataAttr(isHovered),
      "data-sortable": dataAttr(allowsSorting),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        columnHeaderProps,
        focusProps,
        filterDOMProps(columnProps, {
          enabled: shouldFilterDOMProps
        }),
        allowsSorting ? hoverProps : {},
        otherProps
      ),
      className: (_b = slots.th) == null ? void 0 : _b.call(slots, { align, class: thStyles }),
      children: [
        hideHeader ? /* @__PURE__ */ jsxRuntimeExports.jsx($5c3e21d68f1c4674$export$439d29a4e110a164, { children: node.rendered }) : node.rendered,
        allowsSorting && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ChevronDownIcon,
          {
            "aria-hidden": "true",
            className: (_c = slots.sortIcon) == null ? void 0 : _c.call(slots, { class: classNames == null ? void 0 : classNames.sortIcon }),
            "data-direction": (_d = state.sortDescriptor) == null ? void 0 : _d.direction,
            "data-visible": dataAttr(((_e = state.sortDescriptor) == null ? void 0 : _e.column) === node.key),
            strokeWidth: 3
          }
        )
      ]
    }
  );
});
TableColumnHeader.displayName = "HeroUI.TableColumnHeader";
var table_column_header_default = TableColumnHeader;
var TableHeaderRow = forwardRef((props, ref) => {
  var _a, _b;
  const { as, className, children, node, slots, classNames, state, ...otherProps } = props;
  const Component = as || "tr";
  const shouldFilterDOMProps = typeof Component === "string";
  const domRef = useDOMRef(ref);
  const { rowProps } = $f917ee10f4c32dab$export$1b95a7d2d517b841({ node }, state);
  const trStyles = clsx(classNames == null ? void 0 : classNames.tr, className, (_a = node.props) == null ? void 0 : _a.className);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      ref: domRef,
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(
        rowProps,
        filterDOMProps(node.props, {
          enabled: shouldFilterDOMProps
        }),
        otherProps
      ),
      className: (_b = slots.tr) == null ? void 0 : _b.call(slots, { class: trStyles }),
      children
    }
  );
});
TableHeaderRow.displayName = "HeroUI.TableHeaderRow";
var table_header_row_default = TableHeaderRow;
var TableRowGroup = forwardRef((props, ref) => {
  var _a;
  const { as, className, children, slots, classNames, ...otherProps } = props;
  const Component = as || "thead";
  const domRef = useDOMRef(ref);
  const { rowGroupProps } = $0047e6c294ea075f$export$6fb1613bd7b28198();
  const theadStyles = clsx(classNames == null ? void 0 : classNames.thead, className);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      ref: domRef,
      className: (_a = slots.thead) == null ? void 0 : _a.call(slots, { class: theadStyles }),
      ...$3ef42575df84b30b$export$9d1611c77c2fe928$1(rowGroupProps, otherProps),
      children
    }
  );
});
TableRowGroup.displayName = "HeroUI.TableRowGroup";
var table_row_group_default = TableRowGroup;
var spacing = {
  px: "1px",
  0: "0px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem"
};
var getMargin = (value) => {
  var _a;
  return (_a = spacing[value]) != null ? _a : value;
};
function useSpacer(originalProps) {
  const [props, variantProps] = mapPropsVariants(originalProps, spacer.variantKeys);
  const { as, className, x = 1, y = 1, ...otherProps } = props;
  const Component = as || "span";
  const styles = reactExports.useMemo(
    () => spacer({
      ...variantProps,
      className
    }),
    [objectToDeps(variantProps), className]
  );
  const marginLeft = getMargin(x);
  const marginTop = getMargin(y);
  const getSpacerProps = (props2 = {}) => ({
    ...props2,
    ...otherProps,
    "aria-hidden": dataAttr(true),
    className: clsx(styles, props2.className),
    style: {
      ...props2.style,
      ...otherProps.style,
      marginLeft,
      marginTop
    }
  });
  return { Component, getSpacerProps };
}
var Spacer = forwardRef((props, ref) => {
  const { Component, getSpacerProps } = useSpacer({ ...props });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Component, { ref, ...getSpacerProps() });
});
Spacer.displayName = "HeroUI.Spacer";
var spacer_default = Spacer;
var Table = forwardRef((props, ref) => {
  const {
    BaseComponent,
    Component,
    collection,
    values,
    topContent,
    topContentPlacement,
    bottomContentPlacement,
    bottomContent,
    removeWrapper,
    getBaseProps,
    getWrapperProps,
    getTableProps
  } = useTable({
    ...props,
    ref
  });
  const Wrapper = reactExports.useCallback(
    ({ children }) => {
      if (removeWrapper) {
        return children;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BaseComponent, { ...getWrapperProps(), children });
    },
    [removeWrapper, getWrapperProps]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ...getBaseProps(), children: [
    topContentPlacement === "outside" && topContent,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Wrapper, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      topContentPlacement === "inside" && topContent,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Component, { ...getTableProps(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(table_row_group_default, { classNames: values.classNames, slots: values.slots, children: [
          collection.headerRows.map((headerRow) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            table_header_row_default,
            {
              classNames: values.classNames,
              node: headerRow,
              slots: values.slots,
              state: values.state,
              children: [...headerRow.childNodes].map(
                (column) => {
                  var _a;
                  return ((_a = column == null ? void 0 : column.props) == null ? void 0 : _a.isSelectionCell) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    table_select_all_checkbox_default,
                    {
                      checkboxesProps: values.checkboxesProps,
                      classNames: values.classNames,
                      color: values.color,
                      disableAnimation: values.disableAnimation,
                      node: column,
                      selectionMode: values.selectionMode,
                      slots: values.slots,
                      state: values.state
                    },
                    column == null ? void 0 : column.key
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    table_column_header_default,
                    {
                      classNames: values.classNames,
                      node: column,
                      slots: values.slots,
                      state: values.state
                    },
                    column == null ? void 0 : column.key
                  );
                }
              )
            },
            headerRow == null ? void 0 : headerRow.key
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(spacer_default, { as: "tr", tabIndex: -1, y: 1 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          table_body_default$1,
          {
            checkboxesProps: values.checkboxesProps,
            classNames: values.classNames,
            collection: values.collection,
            color: values.color,
            disableAnimation: values.disableAnimation,
            isSelectable: values.isSelectable,
            selectionMode: values.selectionMode,
            slots: values.slots,
            state: values.state
          }
        )
      ] }),
      bottomContentPlacement === "inside" && bottomContent
    ] }) }),
    bottomContentPlacement === "outside" && bottomContent
  ] });
});
Table.displayName = "HeroUI.Table";
var table_default = Table;
var TableRow = $70d70eb16ea48428$export$b59bdbef9ce70de2;
var table_row_default = TableRow;
var TableBody = $4ae5314bf50db1a3$export$76ccd210b9029917;
var table_body_default = TableBody;
var TableCell = $941d1d9a6a28982a$export$f6f0c3fe4ec306ea;
var table_cell_default = TableCell;
var TableColumn = $1cd244557c2f97d5$export$816b5d811295e6bc;
var table_column_default = TableColumn;
var TableHeader = $312ae3b56a94a86e$export$f850895b287ef28e;
var table_header_default = TableHeader;
const paySecurity = "/assets/pay-security-BET0uPBP.jpeg";
function AiOutlineCheck(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 1024 1024" }, "child": [{ "tag": "path", "attr": { "d": "M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" }, "child": [] }] })(props);
}
function FaCheck(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" }, "child": [] }] })(props);
}
function FaLock(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 448 512" }, "child": [{ "tag": "path", "attr": { "d": "M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z" }, "child": [] }] })(props);
}
function Upgrade() {
  const { isLoggedIn, subConfig, userData, isSubscriptionUrlLoading } = useCommonContext();
  const [currentVariantId, setCurrentVariantId] = reactExports.useState();
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const currentVariant = subConfig?.variants?.find(
    (item) => item.id === currentVariantId
  );
  reactExports.useEffect(() => {
    if (!subConfig) return;
    const defaultVariant = subConfig?.variants?.find(
      (variant) => variant.is_default
    );
    const selectedVariant = defaultVariant || subConfig?.variants?.[0];
    if (!selectedVariant) {
      setIsLoading(false);
      return;
    }
    setCurrentVariantId(`${selectedVariant.id}`);
    setIsLoading(false);
  }, [subConfig]);
  function handleSubscriptionClick() {
    if (!currentVariant) return;
    if (!isLoggedIn) {
      alert("Please Sign in first.");
      chrome.runtime.sendMessage({
        action: "signInWithGoogle",
        payload: {
          nextUrl: currentVariant.url
        }
      });
      return;
    }
    const email = userData?.email ?? "";
    const checkoutLink = currentVariant.url.replace("{email}", email);
    chrome.runtime.sendMessage({
      action: "openUrl",
      payload: { url: checkoutLink }
    });
  }
  if (isSubscriptionUrlLoading || isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-[100px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(spinner_default, { label: "Loading...", size: "lg", color: "default" }) }) });
  }
  const d = currentVariant?.display;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(table_default, { "aria-label": "Feature comparison", removeWrapper: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(table_header_default, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(table_column_default, { children: "Feature" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(table_column_default, { children: "Free" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(table_column_default, { children: "Pro" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(table_body_default, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(table_row_default, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(table_cell_default, { className: "!px-2 !py-1 text-xs", children: "Download Videos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(table_cell_default, { className: "!px-2 !py-1 text-xs", children: "20 times per day" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(table_cell_default, { className: "!px-2 !py-1 text-xs", children: "Unlimited" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(table_row_default, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(table_cell_default, { className: "!px-2 !py-1 text-xs", children: "Feature 2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(table_cell_default, { className: "!px-2 !py-1 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiOutlineCheck, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(table_cell_default, { className: "!px-2 !py-1 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiOutlineCheck, {}) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      tabs_default,
      {
        "aria-label": "Plan period",
        radius: "sm",
        size: "sm",
        selectedKey: currentVariantId,
        onSelectionChange: (key) => setCurrentVariantId(`${key}`),
        children: subConfig?.variants?.map((variant) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          tab_item_base_default,
          {
            title: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              variant.name,
              variant.display?.discount_percent != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-red-500 text-white font-bold text-[10px] leading-none rounded-full px-1.5 py-0.5", children: [
                "-",
                variant.display.discount_percent,
                "%"
              ] })
            ] })
          },
          variant.id
        ))
      }
    ) }),
    currentVariant && d && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 flex-wrap justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-4xl text-stone-950", children: d.headline }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base text-[#929292] ml-1", children: d.period_suffix })
        ] }),
        d.strikethrough && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-sm text-[#929292]", children: d.strikethrough })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#929292] text-center", children: d.billing_label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-500 font-bold flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FaCheck, { className: "inline" }),
        " 7-day money-back guarantee"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        button_default,
        {
          color: "primary",
          radius: "lg",
          fullWidth: true,
          className: "cta-shimmer transition-transform duration-150 hover:scale-[1.03] active:!scale-95 shadow-md hover:shadow-lg",
          onPress: handleSubscriptionClick,
          children: "Subscribe"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-gray-500 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FaLock, { className: "inline text-xs" }),
        " We use ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-stone-950", children: "Paypal" }),
        " ",
        "and ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-stone-950", children: "Paddle" }),
        " to process purchases and do not know your card details. No Paypal account is needed."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: paySecurity, alt: "", className: "text-center" })
    ] })
  ] });
}
function App() {
  reactExports.useEffect(() => {
    document.title = "Upgrade Your Plan";
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full min-h-screen bg-background p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-6 text-center", children: "Upgrade" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommonProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upgrade, {}) })
  ] }) });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
