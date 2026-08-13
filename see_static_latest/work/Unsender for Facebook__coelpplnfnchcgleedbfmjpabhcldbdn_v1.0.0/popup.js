const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const minDelayInput = document.getElementById('minDelay');
const maxDelayInput = document.getElementById('maxDelay');

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

startBtn.addEventListener('click', async () => {
  const minDelay = parseFloat(minDelayInput.value) || 3;
  const maxDelay = parseFloat(maxDelayInput.value) || 7;

  if (minDelay < 1 || maxDelay < 1 || minDelay > maxDelay) {
    status.textContent = 'Invalid delay values.';
    return;
  }

  const tab = await getCurrentTab();

  if (!tab.url || !(tab.url.includes('facebook.com/messages') || tab.url.includes('messenger.com'))) {
    status.textContent = 'Open a Facebook Messenger chat first!';
    return;
  }

  // Inject content script if not already loaded
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (e) {
    console.log('Script injection:', e.message);
  }

  // Small delay to let script initialize
  await new Promise(r => setTimeout(r, 300));

  // Send start message
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'start',
      minDelay: minDelay * 1000,
      maxDelay: maxDelay * 1000
    });
    console.log('Response:', response);
  } catch (e) {
    status.textContent = 'Error: ' + e.message;
    console.error(e);
    return;
  }

  startBtn.style.display = 'none';
  stopBtn.style.display = 'block';
  status.textContent = 'Running... check the Facebook tab (open DevTools console for logs).';
});

stopBtn.addEventListener('click', async () => {
  const tab = await getCurrentTab();
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
  } catch (e) {
    console.error(e);
  }

  startBtn.style.display = 'block';
  stopBtn.style.display = 'none';
  status.textContent = 'Stopped.';
});
