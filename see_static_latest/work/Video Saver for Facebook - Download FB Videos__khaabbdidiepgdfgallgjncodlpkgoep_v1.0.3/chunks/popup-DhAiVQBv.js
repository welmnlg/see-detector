import "./_virtual_wxt-html-plugins-Cyikj0JH.js";
import { r as reactExports, a as React, j as jsxRuntimeExports, R as ReactDOM } from "./client-DziJnt8q.js";
import { $ as $b5e257d569688ac6$export$535bd6ca7f90a273, M as MotionConfigContext, u as useConstant, l as loadExternalIsValidProp, P as ProviderContext, a as $ea8dcbcb9ea1b556$export$323e4fc2fa4753fb, b as MotionGlobalConfig, c as useCommonContext, G as GenIcon, d as button_default, s as supabase, e as PROFILE_TAB, t as tabs_default, f as tab_item_base_default, g as MAIN_TAB, C as CommonProvider } from "./iconBase-CZJdRvfA.js";
const $148a7a147e38ea7f$var$RTL_SCRIPTS = /* @__PURE__ */ new Set([
  "Arab",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr"
]);
const $148a7a147e38ea7f$var$RTL_LANGS = /* @__PURE__ */ new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi"
]);
function $148a7a147e38ea7f$export$702d680b21cbd764(localeString) {
  if (Intl.Locale) {
    let locale = new Intl.Locale(localeString).maximize();
    let textInfo = typeof locale.getTextInfo === "function" ? locale.getTextInfo() : locale.textInfo;
    if (textInfo) return textInfo.direction === "rtl";
    if (locale.script) return $148a7a147e38ea7f$var$RTL_SCRIPTS.has(locale.script);
  }
  let lang = localeString.split("-")[0];
  return $148a7a147e38ea7f$var$RTL_LANGS.has(lang);
}
const $1e5a04cdaf7d1af8$var$localeSymbol = /* @__PURE__ */ Symbol.for("react-aria.i18n.locale");
function $1e5a04cdaf7d1af8$export$f09106e7c6677ec5() {
  let locale = typeof window !== "undefined" && window[$1e5a04cdaf7d1af8$var$localeSymbol] || typeof navigator !== "undefined" && (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([
      locale
    ]);
  } catch {
    locale = "en-US";
  }
  return {
    locale,
    direction: $148a7a147e38ea7f$export$702d680b21cbd764(locale) ? "rtl" : "ltr"
  };
}
let $1e5a04cdaf7d1af8$var$currentLocale = $1e5a04cdaf7d1af8$export$f09106e7c6677ec5();
let $1e5a04cdaf7d1af8$var$listeners = /* @__PURE__ */ new Set();
function $1e5a04cdaf7d1af8$var$updateLocale() {
  $1e5a04cdaf7d1af8$var$currentLocale = $1e5a04cdaf7d1af8$export$f09106e7c6677ec5();
  for (let listener of $1e5a04cdaf7d1af8$var$listeners) listener($1e5a04cdaf7d1af8$var$currentLocale);
}
function $1e5a04cdaf7d1af8$export$188ec29ebc2bdc3a() {
  let isSSR = $b5e257d569688ac6$export$535bd6ca7f90a273();
  let [defaultLocale, setDefaultLocale] = reactExports.useState($1e5a04cdaf7d1af8$var$currentLocale);
  reactExports.useEffect(() => {
    if ($1e5a04cdaf7d1af8$var$listeners.size === 0) window.addEventListener("languagechange", $1e5a04cdaf7d1af8$var$updateLocale);
    $1e5a04cdaf7d1af8$var$listeners.add(setDefaultLocale);
    return () => {
      $1e5a04cdaf7d1af8$var$listeners.delete(setDefaultLocale);
      if ($1e5a04cdaf7d1af8$var$listeners.size === 0) window.removeEventListener("languagechange", $1e5a04cdaf7d1af8$var$updateLocale);
    };
  }, []);
  if (isSSR) return {
    locale: "en-US",
    direction: "ltr"
  };
  return defaultLocale;
}
const $18f2051aff69b9bf$var$I18nContext = /* @__PURE__ */ React.createContext(null);
function $18f2051aff69b9bf$export$a54013f0d02a8f82(props) {
  let { locale, children } = props;
  let defaultLocale = $1e5a04cdaf7d1af8$export$188ec29ebc2bdc3a();
  let value = React.useMemo(() => {
    if (!locale) return defaultLocale;
    return {
      locale,
      direction: $148a7a147e38ea7f$export$702d680b21cbd764(locale) ? "rtl" : "ltr"
    };
  }, [
    defaultLocale,
    locale
  ]);
  return /* @__PURE__ */ React.createElement($18f2051aff69b9bf$var$I18nContext.Provider, {
    value
  }, children);
}
const $f57aed4a881a3485$var$Context = /* @__PURE__ */ React.createContext(null);
function $f57aed4a881a3485$export$178405afcd8c5eb(props) {
  let { children } = props;
  let parent = reactExports.useContext($f57aed4a881a3485$var$Context);
  let [modalCount, setModalCount] = reactExports.useState(0);
  let context = reactExports.useMemo(() => ({
    parent,
    modalCount,
    addModal() {
      setModalCount((count) => count + 1);
      if (parent) parent.addModal();
    },
    removeModal() {
      setModalCount((count) => count - 1);
      if (parent) parent.removeModal();
    }
  }), [
    parent,
    modalCount
  ]);
  return /* @__PURE__ */ React.createElement($f57aed4a881a3485$var$Context.Provider, {
    value: context
  }, children);
}
function $f57aed4a881a3485$export$d9aaed4c3ece1bc0() {
  let context = reactExports.useContext($f57aed4a881a3485$var$Context);
  return {
    modalProviderProps: {
      "aria-hidden": context && context.modalCount > 0 ? true : void 0
    }
  };
}
function $f57aed4a881a3485$var$OverlayContainerDOM(props) {
  let { modalProviderProps } = $f57aed4a881a3485$export$d9aaed4c3ece1bc0();
  return /* @__PURE__ */ React.createElement("div", {
    "data-overlay-container": true,
    ...props,
    ...modalProviderProps
  });
}
function $f57aed4a881a3485$export$bf688221f59024e5(props) {
  return /* @__PURE__ */ React.createElement($f57aed4a881a3485$export$178405afcd8c5eb, null, /* @__PURE__ */ React.createElement($f57aed4a881a3485$var$OverlayContainerDOM, props));
}
function MotionConfig({ children, isValidProp, ...config }) {
  isValidProp && loadExternalIsValidProp(isValidProp);
  config = { ...reactExports.useContext(MotionConfigContext), ...config };
  config.isStatic = useConstant(() => config.isStatic);
  const context = reactExports.useMemo(() => config, [JSON.stringify(config.transition), config.transformPagePoint, config.reducedMotion]);
  return jsxRuntimeExports.jsx(MotionConfigContext.Provider, { value: context, children });
}
var HeroUIProvider = ({
  children,
  navigate,
  disableAnimation,
  useHref,
  disableRipple = false,
  skipFramerMotionAnimations = disableAnimation,
  reducedMotion = "never",
  validationBehavior,
  locale = "en-US",
  defaultDates,
  createCalendar,
  ...otherProps
}) => {
  let contents = children;
  if (navigate) {
    contents = /* @__PURE__ */ jsxRuntimeExports.jsx($ea8dcbcb9ea1b556$export$323e4fc2fa4753fb, { navigate, useHref, children: contents });
  }
  const context = reactExports.useMemo(() => {
    if (disableAnimation && skipFramerMotionAnimations) {
      MotionGlobalConfig.skipAnimations = true;
    }
    return {
      createCalendar,
      defaultDates,
      disableAnimation,
      disableRipple,
      validationBehavior
    };
  }, [
    createCalendar,
    defaultDates == null ? void 0 : defaultDates.maxDate,
    defaultDates == null ? void 0 : defaultDates.minDate,
    disableAnimation,
    disableRipple,
    validationBehavior
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProviderContext, { value: context, children: /* @__PURE__ */ jsxRuntimeExports.jsx($18f2051aff69b9bf$export$a54013f0d02a8f82, { locale, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MotionConfig, { reducedMotion, children: /* @__PURE__ */ jsxRuntimeExports.jsx($f57aed4a881a3485$export$bf688221f59024e5, { ...otherProps, children: contents }) }) }) });
};
function disableConsoleLogInProduction() {
  {
    console.log = function() {
    };
  }
}
const EXT_PREFIX = "https://chromewebstore.google.com/detail";
function ExtensionPromotion() {
  const { promotionConfig } = useCommonContext();
  const extensions = promotionConfig?.main || [];
  const moreLink = promotionConfig?.moreLink || "";
  const displayCount = promotionConfig?.displayCount || 2;
  const displayedExtensions = reactExports.useMemo(() => {
    if (extensions.length <= displayCount) {
      return extensions;
    }
    const shuffled = [...extensions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, displayCount);
  }, [extensions, displayCount]);
  const handleExtensionClick = (item) => {
    if (item.id) {
      window.open(`${EXT_PREFIX}/${item.id}`, "_blank");
    }
  };
  if (!extensions.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 opacity-60 hover:opacity-100 transition-opacity", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-600", children: "Recommended Extensions" }),
      moreLink && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "text-xs text-blue-500 hover:text-blue-700 hover:underline",
          onClick: () => window.open(moreLink, "_blank"),
          children: "More →"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: displayedExtensions.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "bg-white border border-gray-200 rounded-lg p-2.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer",
        onClick: () => handleExtensionClick(item),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: item.image,
              className: "w-9 h-9 rounded-md flex-shrink-0",
              alt: item.name
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium text-gray-900 leading-snug", children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 leading-snug", children: item.description })
          ] })
        ] })
      },
      item.id
    )) })
  ] });
}
function Main() {
  const [isOpening, setIsOpening] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-800", children: "How it works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold", children: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 pt-0.5", children: "Browse Facebook and find any video or reel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold", children: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 pt-0.5", children: "Click the download button that appears near the video" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold", children: "3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 pt-0.5", children: "Video is saved to your device automatically" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: "https://youtu.be/tI6X8aGApdE",
        target: "_blank",
        rel: "noopener noreferrer",
        className: "block text-center text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-4 no-underline font-medium transition-colors",
        children: "Watch Demo Video"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExtensionPromotion, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-[12px] text-gray-500", children: [
      "Questions or feedback?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "mailto:help@lazytechstudio.com",
          className: "text-blue-600 hover:text-blue-800 underline",
          children: "help@lazytechstudio.com"
        }
      )
    ] })
  ] });
}
function FaGoogle(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 488 512" }, "child": [{ "tag": "path", "attr": { "d": "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" }, "child": [] }] })(props);
}
function Profile() {
  const { userData, isLoggedIn, isPaid, subConfig, isSubscriptionUrlLoading } = useCommonContext();
  const email = userData?.email;
  const name = userData?.user_metadata.full_name;
  function handleManageSubscriptionClick() {
    chrome.tabs.create({
      url: subConfig.management_url,
      active: true
    });
  }
  async function handleLogoutClick() {
    await supabase.auth.signOut();
    window.close();
  }
  function handleSignIn() {
    chrome.runtime.sendMessage({
      action: "signInWithGoogle"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 space-y-4", children: [
    isLoggedIn ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Account information:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "User Email: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "User Name: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "User Plan:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: isPaid ? "Pro" : "Free" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          button_default,
          {
            color: "primary",
            fullWidth: true,
            onClick: handleManageSubscriptionClick,
            isLoading: isSubscriptionUrlLoading,
            children: "Manage Subscriptions"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          button_default,
          {
            color: "danger",
            variant: "flat",
            onPress: handleLogoutClick,
            fullWidth: true,
            children: "Logout"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(button_default, { color: "primary", fullWidth: true, onPress: handleSignIn, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FaGoogle, { className: "text-2xl" }),
      "Sign in with Google"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center", children: [
      "If you need a refund or encounter any issues while using our services, you can contact us directly via email",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold select-all", children: "help@lazytechstudio.com" }),
      "."
    ] })
  ] });
}
const icon = "/assets/icon-wW047EYz.png";
const Popup = () => {
  const {
    userData,
    // isPaid,
    currentRoute,
    setCurrentRoute,
    isLoggedIn,
    isLoading,
    isPaymentLoading
  } = useCommonContext();
  const avator = userData?.user_metadata.avatar_url;
  function handleSignIn() {
    chrome.runtime.sendMessage({
      action: "signInWithGoogle"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-2 pb-2 bg-[#fbfbfd] flex gap-4 justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "h1",
        {
          className: "flex-none text-base font-medium flex gap-2 items-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: icon, alt: "", className: "w-[24px] h-[24px]" }),
            chrome.i18n.getMessage("extensionNameInExt")
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "text-[12px] leading-[14px] flex gap-1 items-center min-w-0",
          children: isLoggedIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setCurrentRoute(PROFILE_TAB),
              className: "rounded-full p-0 border-0 cursor-pointer hover:opacity-80 transition-opacity",
              "aria-label": "Go to Profile",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: avator,
                  alt: "",
                  className: "w-[16px] h-[16px] rounded-full"
                }
              )
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSignIn, children: "Not Signed In" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        tabs_default,
        {
          size: "sm",
          radius: "full",
          selectedKey: currentRoute,
          onSelectionChange: (key) => setCurrentRoute(`${key}`),
          color: "primary",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(tab_item_base_default, { title: "Home" }, MAIN_TAB),
            /* @__PURE__ */ jsxRuntimeExports.jsx(tab_item_base_default, { title: "Profile" }, PROFILE_TAB)
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        currentRoute === MAIN_TAB && /* @__PURE__ */ jsxRuntimeExports.jsx(Main, {}),
        currentRoute === PROFILE_TAB && /* @__PURE__ */ jsxRuntimeExports.jsx(Profile, {})
      ] })
    ] })
  ] });
};
disableConsoleLogInProduction();
function App() {
  const manifest = chrome.runtime.getManifest();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CommonProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeroUIProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[420px] min-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Popup, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-1 text-center text-gray-300", children: [
      "V",
      manifest.version
    ] })
  ] }) }) });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
