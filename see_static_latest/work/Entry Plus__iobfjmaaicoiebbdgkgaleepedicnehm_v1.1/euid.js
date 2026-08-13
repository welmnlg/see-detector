(function() {
  'use strict';
  
  if (!/^https:\/\/playentry\.org\/(project|iframe|noframe|ws)\//.test(location.href)) return;

  function getUserid() {
    const id =
      JSON.parse(document.querySelector("#__NEXT_DATA__")?.textContent || "{}")
        ?.props?.pageProps?.initialState?.common?.user?.id ?? 0;
    
    console.log(id);
    
    return id || null;
  }

  let retryCount = 0;
  const MAX_RETRY_DELAY = 1000;

  async function initEuid() {
    const userid = getUserid();
    if (!userid) {
      const delay = Math.min(100 * Math.pow(1.5, retryCount), MAX_RETRY_DELAY);
      retryCount++;
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => setTimeout(initEuid, delay), { timeout: delay });
      } else {
        setTimeout(initEuid, delay);
      }
      return;
    }

    const { registerFeature } = window.EntryPlus || {};
    if (!registerFeature) {
      const delay = Math.min(100 * Math.pow(1.5, retryCount), MAX_RETRY_DELAY);
      retryCount++;
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => setTimeout(initEuid, delay), { timeout: delay });
      } else {
        setTimeout(initEuid, delay);
      }
      return;
    }

    retryCount = 0;
    registerFeature('euid', '?uuid', userid);
    console.log('%c Entry Plus %c EUID %c ' + '활성화 됨', 'background: black; color: white; border-radius: 5px 0px 0px 5px;', 'background: #32D27D; color: white; border-radius: 0px 5px 5px 0px;', '')
  }

  initEuid();
})();
