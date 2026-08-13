// Configuratie: Dark Mode Kleuren
const colors = {
  bg: '#202124',
  text: '#e8eaed',
  hover: '#3c4043',
  accent: '#8ab4f8'
};

// Maak de balk aan
const bar = document.createElement('div');
bar.style.cssText = `
  position: fixed; top: -60px; left: 0; width: 100%; height: 40px;
  background: ${colors.bg}; border-bottom: 1px solid #000; z-index: 2147483647;
  display: flex; align-items: center; padding: 0 15px; transition: top 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-family: 'Segoe UI', Roboto, sans-serif;
`;

// De onzichtbare trigger-zone
const trigger = document.createElement('div');
trigger.style.cssText = `
  position: fixed; top: 0; left: 0; width: 100%; height: 12px;
  z-index: 2147483646; background: transparent;
`;

document.body.appendChild(bar);
document.body.appendChild(trigger);

// Functie om de favicon URL op te halen
function getFavicon(url) {
  return `https://www.google.com/s2/favicons?sz=32&domain=${new URL(url).hostname}`;
}

// Haal bladwijzers op
chrome.runtime.sendMessage({ type: "GET_BOOKMARKS" }, (response) => {
  if (response && response.bookmarks) {
    response.bookmarks.forEach(bm => {
      if (bm.url) {
        const linkWrapper = document.createElement('a');
        linkWrapper.href = bm.url;
        linkWrapper.style.cssText = `
          display: flex; align-items: center; margin-right: 18px; 
          color: ${colors.text}; text-decoration: none; font-size: 13px; 
          padding: 4px 8px; border-radius: 4px; transition: background 0.1s;
          white-space: nowrap;
        `;

        // Favicon toevoegen
        const img = document.createElement('img');
        img.src = getFavicon(bm.url);
        img.style.cssText = "width: 16px; height: 16px; margin-right: 8px;";

        const text = document.createElement('span');
        text.textContent = bm.title.substring(0, 25);

        linkWrapper.appendChild(img);
        linkWrapper.appendChild(text);

        linkWrapper.onmouseover = () => linkWrapper.style.backgroundColor = colors.hover;
        linkWrapper.onmouseout = () => linkWrapper.style.backgroundColor = 'transparent';

        bar.appendChild(linkWrapper);
      }
    });
  }
});

// Interactie
trigger.onmouseenter = () => bar.style.top = '0';
bar.onmouseleave = () => bar.style.top = '-60px';