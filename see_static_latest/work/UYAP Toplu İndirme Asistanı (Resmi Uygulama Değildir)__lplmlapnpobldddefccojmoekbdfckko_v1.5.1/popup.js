document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('downloadBtn');
  const speedToggle = document.getElementById('speedToggle');
  const speedSummary = document.getElementById('speedSummary');

  const KEY = "uyap_speed_mode"; // "normal" | "fast"
  const DEFAULT_MODE = "normal";

  function renderSummary(mode) {
    if (!speedSummary) return;
    if (mode === "fast") {
      speedSummary.textContent =
        "FAST modu açık: Gecikme uygulanmaz. Çok hızlı indirme tetikleyebilir; yoğun kullanımda riskli olabilir.";
    } else {
      speedSummary.textContent =
        "Normal mod: İndirmeler arasında rastgele 2–4,5 sn bekleme + her 10 dosyada 8–15 sn mola uygulanır.";
    }
  }

  // Load setting
  chrome.storage.sync.get({ [KEY]: DEFAULT_MODE }, (data) => {
    const mode = data[KEY] || DEFAULT_MODE;
    if (speedToggle) speedToggle.checked = (mode === "fast");
    renderSummary(mode);
  });

  // Save on toggle
  if (speedToggle) {
    speedToggle.addEventListener("change", () => {
      const mode = speedToggle.checked ? "fast" : "normal";
      chrome.storage.sync.set({ [KEY]: mode }, () => renderSummary(mode));
    });
  }

  // Download button
  downloadBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "trigger_download" });
      window.close();
    });
  });
});
