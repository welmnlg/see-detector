const DEFAULT_MENU_MODE = "preserveMenu";

document.addEventListener("DOMContentLoaded", async () => {
  applyI18n();

  const status = document.getElementById("status");
  const saved = await chrome.storage.local.get({ menuMode: DEFAULT_MENU_MODE });
  const current = saved.menuMode === "suppressFirst" || saved.menuMode === "preserveMenu"
    ? saved.menuMode
    : DEFAULT_MENU_MODE;
  document.querySelector(`input[name="menuMode"][value="${current}"]`).checked = true;

  document.querySelectorAll('input[name="menuMode"]').forEach((input) => {
    input.addEventListener("change", async () => {
      if (!input.checked) return;
      await chrome.storage.local.set({ menuMode: input.value });
      status.textContent = chrome.i18n.getMessage("optionsSaved") || "Saved.";
    });
  });
});

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const message = chrome.i18n.getMessage(el.dataset.i18n);
    if (message) el.textContent = message;
  });
}
