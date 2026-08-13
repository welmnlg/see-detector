async function checkForKeywords() {
  const { configJson } = await chrome.storage.sync.get('configJson');
  let keywords = ['doodle']; // Default if no config

  if (configJson) {
    try {
      const config = JSON.parse(configJson);
      if (Array.isArray(config.keywords)) {
        keywords = config.keywords;
      }
    } catch (e) {
      console.error('Invalid JSON config:', e);
    }
  }

  const pageText = document.body.innerText.toLowerCase();
  const hasKeyword = keywords.some(keyword => pageText.includes(keyword.toLowerCase()));

  if (hasKeyword) {
    chrome.runtime.sendMessage({ action: 'closeTab' });
  }
}

checkForKeywords();