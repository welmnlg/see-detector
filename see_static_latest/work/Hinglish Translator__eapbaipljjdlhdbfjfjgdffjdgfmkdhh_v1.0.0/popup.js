document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleKeyBtn = document.getElementById('toggleKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const keyStatus = document.getElementById('keyStatus');
  const modelSelect = document.getElementById('modelSelect');
  const modelHint = document.getElementById('modelHint');
  const translateBtn = document.getElementById('translateBtn');
  const restoreBtn = document.getElementById('restoreBtn');
  const progress = document.getElementById('progress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  const MODEL_HINTS = {
    'gemini-2.5-flash': 'Latest & smartest flash model',
    'gemini-2.5-pro': 'Most capable — best translations, slower',
    'gemini-2.0-flash': 'Good balance of speed and quality',
    'gemini-2.0-flash-lite': 'Fastest responses, lighter quality',
    'gemini-1.5-pro': 'High quality, legacy model',
    'gemini-1.5-flash': 'Quick legacy model',
    'gemini-1.5-flash-8b': 'Lightweight, lowest cost'
  };

  chrome.storage.local.get(['geminiApiKey', 'geminiModel'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
      showStatus('API key loaded', 'success');
    }
    if (result.geminiModel) {
      modelSelect.value = result.geminiModel;
    }
    modelHint.textContent = MODEL_HINTS[modelSelect.value] || '';
  });

  modelSelect.addEventListener('change', () => {
    const model = modelSelect.value;
    chrome.storage.local.set({ geminiModel: model });
    modelHint.textContent = MODEL_HINTS[model] || '';
  });

  toggleKeyBtn.addEventListener('click', () => {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
  });

  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      showStatus('Please enter a valid API key', 'error');
      return;
    }
    chrome.storage.local.set({ geminiApiKey: key, geminiModel: modelSelect.value }, () => {
      showStatus('API key & model saved!', 'success');
    });
  });

  translateBtn.addEventListener('click', async () => {
    const { geminiApiKey } = await chrome.storage.local.get(['geminiApiKey']);
    if (!geminiApiKey) {
      showStatus('Please save your Gemini API key first', 'error');
      return;
    }

    translateBtn.disabled = true;
    restoreBtn.disabled = true;
    showProgress('Starting translation...');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }).catch(() => {});

      chrome.tabs.sendMessage(tab.id, { action: 'translate' }, (response) => {
        if (chrome.runtime.lastError) {
          hideProgress();
          showStatus('Could not connect to page. Try refreshing.', 'error');
          translateBtn.disabled = false;
          restoreBtn.disabled = false;
          return;
        }
        if (response?.status === 'started') {
          pollProgress(tab.id);
        }
      });
    } catch (err) {
      hideProgress();
      showStatus('Error: ' + err.message, 'error');
      translateBtn.disabled = false;
      restoreBtn.disabled = false;
    }
  });

  restoreBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'restore' }, (response) => {
        if (chrome.runtime.lastError) {
          showStatus('Could not connect to page. Try refreshing.', 'error');
          return;
        }
        if (response?.status === 'restored') {
          showStatus('Original text restored!', 'success');
        }
      });
    } catch (err) {
      showStatus('Error: ' + err.message, 'error');
    }
  });

  function pollProgress(tabId) {
    const interval = setInterval(() => {
      chrome.tabs.sendMessage(tabId, { action: 'getProgress' }, (response) => {
        if (chrome.runtime.lastError) {
          clearInterval(interval);
          hideProgress();
          translateBtn.disabled = false;
          restoreBtn.disabled = false;
          return;
        }

        if (response) {
          updateProgress(response.percent, response.message);

          if (response.done) {
            clearInterval(interval);
            setTimeout(() => {
              hideProgress();
              translateBtn.disabled = false;
              restoreBtn.disabled = false;
              if (response.error) {
                showStatus('Translation failed: ' + response.error, 'error');
              } else {
                showStatus('Translation complete!', 'success');
              }
            }, 500);
          }
        }
      });
    }, 800);
  }

  function showStatus(msg, type) {
    keyStatus.textContent = msg;
    keyStatus.className = `status ${type}`;
    keyStatus.classList.remove('hidden');
    setTimeout(() => keyStatus.classList.add('hidden'), 4000);
  }

  function showProgress(msg) {
    progress.classList.remove('hidden');
    progressText.textContent = msg;
    progressFill.style.width = '0%';
  }

  function updateProgress(percent, msg) {
    progressFill.style.width = percent + '%';
    progressText.textContent = msg;
  }

  function hideProgress() {
    progress.classList.add('hidden');
  }
});
