(function () {
  const hostname = window.location.hostname;

  // extract root domain (last two labels) – IPs are left unchanged
  const rootDomain = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    ? hostname
    : hostname.split(".").length > 2
      ? hostname.split(".").slice(-2).join(".")
      : hostname;

  let volume = null;

  function applyVolume() {
    if (volume === null) return;
    document.querySelectorAll("audio, video").forEach((el) => {
      el.volume = volume;
    });
  }

  // Apply stored volume on page load –
  //   1. exact hostname   2. root domain (only when includeSubdomains is set)
  const keys = hostname === rootDomain ? [hostname] : [hostname, rootDomain];
  chrome.storage.local.get(keys, (result) => {
    const exact = result[hostname];
    const root  = hostname !== rootDomain ? result[rootDomain] : null;
    const entry = exact || (root && root.includeSubdomains !== false ? root : null);

    if (entry && typeof entry.volume === "number") {
      volume = entry.volume;
      applyVolume();
    }
  });

  // Catch dynamically injected <audio> / <video> (debounced)
  let timer;
  new MutationObserver(() => {
    if (volume === null) return;
    clearTimeout(timer);
    timer = setTimeout(applyVolume, 50);
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Live updates pushed from the popup slider
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type !== "SITE_VOLUME_SET") return;

    // accept the message if it targets this exact hostname OR
    // if it targets our root domain with subdomain sharing enabled
    if (
      msg.hostname === hostname ||
      (msg.hostname === rootDomain &&
        hostname !== rootDomain &&
        msg.includeSubdomains !== false)
    ) {
      volume = msg.volume;
      applyVolume();
    }
  });
})();
