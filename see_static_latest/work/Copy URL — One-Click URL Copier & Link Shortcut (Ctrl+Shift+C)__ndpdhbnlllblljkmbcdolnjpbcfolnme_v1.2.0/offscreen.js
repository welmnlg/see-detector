'use strict';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'copy-to-clipboard' || message.target !== 'offscreen') return;

  const textarea = document.getElementById('clipboard-area');
  textarea.value = message.data;
  textarea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Offscreen clipboard copy failed:', err);
  }

  sendResponse();
  return true;
});
