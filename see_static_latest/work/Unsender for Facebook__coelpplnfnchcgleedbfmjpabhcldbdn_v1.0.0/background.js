// Background script to handle real mouse clicks via Chrome DevTools Protocol

let debuggerAttached = {};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'realClick') {
    const tabId = sender.tab.id;
    const { x, y } = msg;

    performRealClick(tabId, x, y)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true;
  }
});

async function performRealClick(tabId, x, y) {
  if (!debuggerAttached[tabId]) {
    await chrome.debugger.attach({ tabId }, '1.3');
    debuggerAttached[tabId] = true;

    chrome.tabs.onRemoved.addListener(function listener(id) {
      if (id === tabId) {
        delete debuggerAttached[tabId];
        chrome.tabs.onRemoved.removeListener(listener);
      }
    });
  }

  await chrome.debugger.sendCommand({ tabId }, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount: 1
  });

  await chrome.debugger.sendCommand({ tabId }, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount: 1
  });
}

chrome.debugger.onDetach.addListener((source) => {
  if (source.tabId) {
    delete debuggerAttached[source.tabId];
  }
});
