document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ext-name').textContent = chrome.i18n.getMessage('extName');
  document.getElementById('toggle-label-text').textContent = chrome.i18n.getMessage('toggleLabel');
  document.getElementById('footer-text').textContent = chrome.i18n.getMessage('footerText');

  const toggle = document.getElementById('toggle');
  const row = document.getElementById('toggle-row');

  function applyState(enabled) {
    toggle.checked = enabled;
    row.classList.toggle('active', enabled);
  }

  chrome.storage.local.get({ enabled: true }, ({ enabled }) => applyState(enabled));

  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: toggle.checked });
    applyState(toggle.checked);
  });
});
