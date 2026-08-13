document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-btn');
    const captureBtn = document.getElementById('capture-btn');
    const providerSelect = document.getElementById('provider');
    const apiKeyInput = document.getElementById('api-key');
    const modelNameInput = document.getElementById('model-name');
    const targetLangSelect = document.getElementById('target-lang');
    const statusMsg = document.getElementById('status-message');

    // Load Settings
    chrome.storage.sync.get(['provider', 'apiKey', 'modelName', 'targetLang'], (result) => {
        if (result.provider) providerSelect.value = result.provider;
        if (result.apiKey) apiKeyInput.value = result.apiKey;
        modelNameInput.value = result.modelName || 'gemini-2.0-flash';
        targetLangSelect.value = result.targetLang || 'Vietnamese';
    });

    // Save Settings
    saveBtn.addEventListener('click', () => {
        const provider = providerSelect.value;
        const apiKey = apiKeyInput.value.trim();
        const modelName = modelNameInput.value.trim() || 'gemini-2.0-flash';
        const targetLang = targetLangSelect.value;

        if (!apiKey) {
            showStatus('Please enter an API Key', 'error');
            return;
        }

        chrome.storage.sync.set({ provider, apiKey, modelName, targetLang }, () => {
            showStatus('Settings saved!', 'success');
            setTimeout(() => {
                statusMsg.classList.add('hidden');
            }, 2000);
        });
    });

    // Capture Action: ask background to start selection (background will inject content script if needed)
    captureBtn.addEventListener('click', () => {
        chrome.storage.sync.get(['apiKey'], (result) => {
            if (!result.apiKey) {
                showStatus('Please configure API Key in settings first', 'error');
                return;
            }
            chrome.runtime.sendMessage({ action: "REQUEST_START_SELECTION" }, (response) => {
                if (chrome.runtime.lastError) {
                    showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
                    return;
                }
                if (response && response.error) {
                    showStatus(response.error, 'error');
                    return;
                }
            });
            window.close();
        });
    });

    function showStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = `status ${type}`;
        statusMsg.classList.remove('hidden');
    }
});
