// Popup logic — displays captured transcripts and download history
(async function () {
  'use strict';

  const statusEl = document.getElementById('status');
  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');
  const transcriptsSection = document.getElementById('transcripts-section');
  const listEl = document.getElementById('transcript-list');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');

  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function showStatus(icon, text, type) {
    statusEl.hidden = false;
    statusIcon.textContent = icon;
    statusIcon.className = `status-icon status-icon-${type}`;
    statusText.textContent = text;
  }

  // ── Current page transcripts ──

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isStreamPage = tab?.url?.includes('sharepoint.com') && tab.url.includes('stream.aspx');

  if (isStreamPage) {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_TRANSCRIPTS',
      payload: { tabId: tab.id }
    });

    const transcripts = response?.transcripts || [];

    if (transcripts.length === 0) {
      showStatus('⏳', 'No transcripts found yet. Wait for the page to load the video, then reopen this popup.', 'waiting');
    } else {
      statusEl.hidden = true;
      transcriptsSection.hidden = false;

      for (const transcript of transcripts) {
        const li = document.createElement('li');
        const isDone = transcript.downloaded;
        li.className = isDone ? 'card-item card-item-done' : 'card-item';

        const icon = document.createElement('div');
        icon.className = isDone ? 'file-icon file-icon-done' : 'file-icon file-icon-transcript';
        icon.textContent = isDone ? '✓' : '📄';

        const info = document.createElement('div');
        info.className = 'card-info';

        const name = document.createElement('span');
        name.className = 'card-name';
        name.textContent = transcript.displayName.replace(/\.[^.]+$/, '');

        const meta = document.createElement('span');
        meta.className = 'card-meta';
        const parts = [];
        if (transcript.language) parts.push(transcript.language);
        if (transcript.size) parts.push(formatSize(transcript.size));
        if (transcript.source) parts.push(transcript.source);
        meta.textContent = parts.join(' · ');

        info.appendChild(name);
        info.appendChild(meta);

        const btn = document.createElement('button');
        if (isDone) {
          btn.className = 'btn-primary btn-primary-success';
          btn.textContent = '✓ Done';
          btn.disabled = true;
        } else {
          btn.className = 'btn-primary';
          btn.textContent = 'Download';
        }
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = 'Downloading…';
          btn.classList.add('btn-primary-loading');

          const result = await chrome.runtime.sendMessage({
            type: 'DOWNLOAD_TRANSCRIPT',
            payload: {
              url: transcript.url,
              filename: transcript.displayName.replace(/\.vtt$/i, '.txt')
            }
          });

          if (result?.success) {
            btn.textContent = '✓ Done';
            btn.className = 'btn-primary btn-primary-success';
            li.classList.add('card-item-done');
            icon.className = 'file-icon file-icon-done';
            icon.textContent = '✓';

            await chrome.runtime.sendMessage({
              type: 'DOWNLOAD_COMPLETE',
              payload: { tabId: tab.id, url: transcript.url, pageUrl: tab.url }
            });

            await renderHistory();
          } else {
            btn.textContent = 'Error';
            btn.className = 'btn-primary btn-primary-error';
            btn.disabled = false;
          }
        });

        li.appendChild(icon);
        li.appendChild(info);
        li.appendChild(btn);
        listEl.appendChild(li);
      }
    }
  } else {
    showStatus('🔍', 'Navigate to a Meeting Stream video to capture transcripts.', 'empty');
  }

  // ── Download history ──

  async function renderHistory() {
    const res = await chrome.runtime.sendMessage({ type: 'GET_HISTORY', payload: {} });
    const history = res?.history || [];

    historyList.innerHTML = '';

    if (history.length === 0) {
      historySection.hidden = true;
      return;
    }

    historySection.hidden = false;

    for (const entry of history) {
      const li = document.createElement('li');
      li.className = 'card-item';

      const icon = document.createElement('div');
      icon.className = 'file-icon file-icon-history';
      icon.textContent = '📋';

      const info = document.createElement('div');
      info.className = 'card-info';

      const name = document.createElement('span');
      name.className = 'card-name';
      name.textContent = entry.displayName.replace(/\.[^.]+$/, '');

      const meta = document.createElement('span');
      meta.className = 'card-meta';
      const parts = [formatDate(entry.downloadedAt)];
      if (entry.language) parts.push(entry.language);
      if (entry.size) parts.push(formatSize(entry.size));
      meta.textContent = parts.join(' · ');

      info.appendChild(name);
      info.appendChild(meta);

      li.appendChild(icon);
      li.appendChild(info);

      if (entry.pageUrl) {
        const link = document.createElement('a');
        link.className = 'btn-link';
        link.href = entry.pageUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Open ↗';
        link.title = 'Open original SharePoint page';
        li.appendChild(link);
      }

      historyList.appendChild(li);
    }
  }

  clearHistoryBtn.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY', payload: {} });
    await renderHistory();
  });

  await renderHistory();
})();
