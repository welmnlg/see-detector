// Ayarları sayfaya uygulayan ana fonksiyon
function applyAllSettings() {
  chrome.storage.sync.get(['useBirdLogo', 'customColor', 'hidePremium'], (data) => {
    const root = document.documentElement;
    
    // Logo Sınıfı
    if (data.useBirdLogo !== false) {
      root.classList.add('show-bird-logo');
    } else {
      root.classList.remove('show-bird-logo');
    }

    // Renk Değişkeni
    const userColor = data.customColor || "#121F2C";
    root.style.setProperty('--user-bg-color', userColor);

    // Premium Sınıfı
    if (data.hidePremium) {
      root.classList.add('hide-premium-elements');
    } else {
      root.classList.remove('hide-premium-elements');
    }
  });
}

// Sayfa ilk açıldığında çalıştır
applyAllSettings();

// AYARLAR DEĞİŞTİĞİ ANDA YENİLEMESİZ GÜNCELLEME
chrome.storage.onChanged.addListener((changes) => {
  const root = document.documentElement;

  if (changes.hidePremium) {
    if (changes.hidePremium.newValue) {
      root.classList.add('hide-premium-elements');
    } else {
      root.classList.remove('hide-premium-elements');
    }
  }

  if (changes.customColor) {
    root.style.setProperty('--user-bg-color', changes.customColor.newValue);
  }

  if (changes.useBirdLogo) {
    if (changes.useBirdLogo.newValue !== false) {
      root.classList.add('show-bird-logo');
    } else {
      root.classList.remove('show-bird-logo');
    }
  }
});