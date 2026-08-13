chrome.runtime.connect({ name: 'sidepanel' });

const textarea = document.getElementById('links-textarea');
const clearButton = document.getElementById('clear-button');
const copyButton = document.getElementById('copy-button');
const licenseInput = document.getElementById('license-input');
const activateButton = document.getElementById('activate-button');
const licenseForm = document.getElementById('license-form');
const activatedMessage = document.getElementById('activated-message');
const limitMessage = document.getElementById('limit-message');

const PREMIUM_KEY = 'LC-NOTE-PREMIUM-2024';

function checkPremiumStatus() {
  chrome.storage.local.get('isPremium', (data) => {
    if (data.isPremium) {
      licenseForm.classList.add('hidden');
      activatedMessage.classList.remove('hidden');
      limitMessage.classList.add('hidden'); // Hide limit message for premium users
    } else {
      licenseForm.classList.remove('hidden');
      activatedMessage.classList.add('hidden');
    }
  });
}

function updateTextarea() {
  chrome.storage.local.get(['links', 'isPremium'], (data) => {
    const links = data.links || [];
    const hasLinks = links.length > 0;
    const isPremium = !!data.isPremium;

    textarea.value = links.join('\n');
    copyButton.disabled = !hasLinks;

    if (hasLinks) {
      textarea.scrollTop = textarea.scrollHeight;
    }

    // Show limit message only for free users at the limit
    if (!isPremium && links.length >= 3) {
      limitMessage.classList.remove('hidden');
    } else {
      limitMessage.classList.add('hidden');
    }
  });
}

// --- Event Listeners ---

activateButton.addEventListener('click', () => {
  if (licenseInput.value.trim() === PREMIUM_KEY) {
    chrome.storage.local.set({ isPremium: true }, () => {
      alert('プレミアム版が認証されました！ありがとうございます！');
      checkPremiumStatus();
      updateTextarea(); // Re-check limits display
    });
  } else {
    alert('無効なライセンスキーです。');
    licenseInput.value = '';
  }
});

clearButton.addEventListener('click', () => {
  chrome.storage.local.remove('links');
});

copyButton.addEventListener('click', () => {
  if (!copyButton.disabled) {
    navigator.clipboard.writeText(textarea.value).then(() => {
        // Briefly change button text to "Copied!"
        const originalText = copyButton.textContent;
        copyButton.textContent = 'コピーしました！';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && ('links' in changes || 'isPremium' in changes)) {
    updateTextarea();
    checkPremiumStatus();
  }
});

// --- Initial Load ---
checkPremiumStatus();
updateTextarea();
