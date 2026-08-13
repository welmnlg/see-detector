// Service Worker — handles transcript storage, badge, and downloads

const handlers = {
  TRANSCRIPT_FOUND: async (payload, sender) => {
    const tabId = sender.tab.id;
    const pageUrl = sender.tab.url || '';
    const result = await chrome.storage.session.get(['transcripts']);
    const transcripts = result.transcripts || {};

    if (!transcripts[tabId]) {
      transcripts[tabId] = [];
    }

    const existing = transcripts[tabId].find(t => t.url === payload.url);
    if (existing) {
      // Re-intercepted — reset downloaded state so user can download again
      existing.downloaded = false;
      existing.capturedAt = Date.now();
    } else {
      transcripts[tabId].push({
        url: payload.url,
        displayName: payload.displayName,
        language: payload.language,
        size: payload.size,
        source: payload.source,
        pageUrl,
        capturedAt: Date.now()
      });
    }

    await chrome.storage.session.set({ transcripts });
    const pending = transcripts[tabId].filter(t => !t.downloaded).length;
    await chrome.action.setBadgeText({ text: pending > 0 ? String(pending) : '', tabId });
    await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId });

    return { success: true };
  },

  GET_TRANSCRIPTS: async (payload) => {
    const result = await chrome.storage.session.get(['transcripts']);
    const transcripts = result.transcripts || {};
    return { success: true, transcripts: transcripts[payload.tabId] || [] };
  },

  DOWNLOAD_TRANSCRIPT: async (payload) => {
    const response = await fetch(payload.url);
    const text = await response.text();
    const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    const downloadId = await chrome.downloads.download({
      url: dataUrl,
      filename: payload.filename || 'transcript.txt',
      saveAs: true
    });
    return { success: true, downloadId };
  },

  DOWNLOAD_COMPLETE: async (payload) => {
    const tabId = payload.tabId;
    const url = payload.url;
    const result = await chrome.storage.session.get(['transcripts']);
    const transcripts = result.transcripts || {};

    // Mark as downloaded (don't remove)
    let downloaded = null;
    if (transcripts[tabId]) {
      const entry = transcripts[tabId].find(t => t.url === url);
      if (entry) {
        downloaded = { ...entry };
        entry.downloaded = true;
      }
      const pending = transcripts[tabId].filter(t => !t.downloaded).length;

      await chrome.storage.session.set({ transcripts });
      await chrome.action.setBadgeText({ text: pending > 0 ? String(pending) : '', tabId });
    }

    // Save to persistent history
    if (downloaded) {
      const histResult = await chrome.storage.local.get(['history']);
      const history = histResult.history || [];
      history.unshift({
        displayName: downloaded.displayName,
        language: downloaded.language,
        size: downloaded.size,
        source: downloaded.source,
        pageUrl: downloaded.pageUrl || payload.pageUrl || '',
        downloadedAt: Date.now()
      });
      // Keep last 50 entries
      if (history.length > 50) history.length = 50;
      await chrome.storage.local.set({ history });
    }

    return { success: true };
  },

  GET_HISTORY: async () => {
    const result = await chrome.storage.local.get(['history']);
    return { success: true, history: result.history || [] };
  },

  CLEAR_HISTORY: async () => {
    await chrome.storage.local.remove('history');
    return { success: true };
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = handlers[message.type];
  if (handler) {
    handler(message.payload, sender)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const result = await chrome.storage.session.get(['transcripts']);
  const transcripts = result.transcripts || {};
  if (transcripts[tabId]) {
    delete transcripts[tabId];
    await chrome.storage.session.set({ transcripts });
  }
});

// Clear transcripts when tab navigates away from stream.aspx
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url && !changeInfo.url.includes('stream.aspx')) {
    const result = await chrome.storage.session.get(['transcripts']);
    const transcripts = result.transcripts || {};
    if (transcripts[tabId]) {
      delete transcripts[tabId];
      await chrome.storage.session.set({ transcripts });
      await chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});
