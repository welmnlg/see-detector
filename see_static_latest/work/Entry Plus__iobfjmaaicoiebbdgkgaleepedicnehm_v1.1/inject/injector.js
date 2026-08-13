(function () {
  'use strict';
  
  if (typeof chrome === 'undefined' || !chrome.runtime?.getURL) return;
  
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject/value_changer.js');
  script.type = 'text/javascript';
  script.addEventListener('load', () => script.remove());
  (document.head || document.documentElement).appendChild(script);
})();
