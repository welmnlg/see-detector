const checkbox = document.getElementById('birdLogo');
const colorPicker = document.getElementById('bgColorPicker');
const resetBtn = document.getElementById('resetColor');
const premiumCheckbox = document.getElementById('hidePremium');
const DEFAULT_COLOR = "#121F2C";

// 1. Ayarları Yükle ve Arayüze Yansıt
chrome.storage.sync.get(['useBirdLogo', 'customColor', 'hidePremium'], (data) => {
  if (checkbox) checkbox.checked = data.useBirdLogo !== false;
  if (colorPicker) colorPicker.value = data.customColor || DEFAULT_COLOR;
  if (premiumCheckbox) premiumCheckbox.checked = data.hidePremium || false;
});

// 2. Logo Ayarı Değişimi
if (checkbox) {
  checkbox.addEventListener('change', () => {
    chrome.storage.sync.set({ useBirdLogo: checkbox.checked });
  });
}

// 3. Renk Ayarı Değişimi
if (colorPicker) {
  colorPicker.addEventListener('input', () => {
    chrome.storage.sync.set({ customColor: colorPicker.value });
  });
}

// 4. Sıfırlama Butonu
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    colorPicker.value = DEFAULT_COLOR;
    chrome.storage.sync.set({ customColor: DEFAULT_COLOR });
  });
}

// 5. Premium Gizleme Ayarı Değişimi
if (premiumCheckbox) {
  premiumCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ hidePremium: premiumCheckbox.checked });
  });
}