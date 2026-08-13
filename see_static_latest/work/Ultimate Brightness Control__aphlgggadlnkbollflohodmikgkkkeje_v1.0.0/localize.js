(function localizePage() {
  document.documentElement.lang = chrome.i18n.getUILanguage();

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const message = chrome.i18n.getMessage(element.dataset.i18n);

    if (message) {
      element.textContent = message;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const message = chrome.i18n.getMessage(element.dataset.i18nPlaceholder);

    if (message) {
      element.setAttribute("placeholder", message);
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const message = chrome.i18n.getMessage(element.dataset.i18nTitle);

    if (message) {
      element.setAttribute("title", message);
    }
  });

  if (document.title) {
    const localizedTitle = chrome.i18n.getMessage(document.title);
    if (localizedTitle) {
      document.title = localizedTitle;
    }
  }
})();
