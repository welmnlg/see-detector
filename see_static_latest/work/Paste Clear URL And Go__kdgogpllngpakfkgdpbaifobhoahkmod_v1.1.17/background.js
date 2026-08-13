const api = typeof browser !== 'undefined' ? browser : chrome;

function stripUrl(raw, keepId) {
  let url;
  try { url = new URL(raw.trim()); } catch { return null; }
  if (!keepId) { url.search = ''; return url.href; }
  let idKey = null, idVal = null;
  for (const [k, v] of url.searchParams) {
    if (k.toLowerCase() === 'id') { idKey = k; idVal = v; break; }
  }
  url.search = '';
  if (idKey !== null) url.searchParams.set(idKey, idVal);
  return url.href;
}

async function copyToClipboard(tabId, text, message) {
  await api.scripting.executeScript({
    target: { tabId },
    func: (value, chipMessage) => {
      navigator.clipboard.writeText(value).then(() => {
        const chip = document.createElement('div');
        chip.textContent = chipMessage;
        Object.assign(chip.style, {
          position:     'fixed',
          top:          '14px',
          left:         '50%',
          transform:    'translateX(-50%)',
          background:   '#323232',
          color:        '#fff',
          padding:      '6px 18px',
          borderRadius: '20px',
          fontSize:     '13px',
          fontFamily:   'sans-serif',
          zIndex:       '2147483647',
          boxShadow:    '0 2px 8px rgba(0,0,0,0.35)',
          opacity:      '1',
          transition:   'opacity 0.4s ease',
          pointerEvents:'none'
        });
        document.body.appendChild(chip);
        setTimeout(() => {
          chip.style.opacity = '0';
          setTimeout(() => chip.remove(), 400);
        }, 1800);
      });
    },
    args: [text, message]
  });
}

async function getLastContextLinkText(tabId, frameId) {
  try {
    const message = { type: 'getLastContextLinkText' };
    if (Number.isInteger(frameId)) {
      return await api.tabs.sendMessage(tabId, message, { frameId });
    }
    return await api.tabs.sendMessage(tabId, message);
  } catch {
    return '';
  }
}

api.runtime.onInstalled.addListener(() => {
  for (const item of [
    { id: 'current',   title: 'Open clean link in current tab' },
    { id: 'new',       title: 'Open clean link in new tab' },
    { id: 'incognito', title: 'Open clean link in new incognito tab' },
    { id: 'sep1',      type: 'separator' },
    { id: 'copy',      title: 'Copy clean URL' },
    { id: 'copyText',  title: 'Copy link text' },
    { id: 'sep2',      type: 'separator' },
    { id: 'settings',  title: 'Settings' }
  ]) {
    api.contextMenus.create({ ...item, contexts: ['link'] });
  }
});

api.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'settings') {
    api.tabs.create({ url: api.runtime.getURL('options.html') });
    return;
  }
  const { keepId = true } = await api.storage.sync.get('keepId');
  const url = stripUrl(info.linkUrl, keepId);
  if (!url) return;
  if (info.menuItemId === 'copy') {
    await copyToClipboard(tab.id, url, 'URL copied');
    return;
  }
  if (info.menuItemId === 'copyText') {
    const linkText = await getLastContextLinkText(tab.id, info.frameId);
    await copyToClipboard(tab.id, linkText, 'Link text copied');
    return;
  }
  if (info.menuItemId === 'current') api.tabs.update(tab.id, { url });
  else if (info.menuItemId === 'new') api.tabs.create({ url, windowId: tab.windowId, index: tab.index + 1 });
  else if (info.menuItemId === 'incognito') api.windows.create({ url, incognito: true });
});
