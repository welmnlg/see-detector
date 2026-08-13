(() => {
  'use strict';

  const core = globalThis.CapsuleCore;
  const $ = (selector) => document.querySelector(selector);
  const state = {
    capsules: [],
    query: '',
    activeFolder: '',
    editingId: null,
    activeTab: null,
    pageState: null,
    statusMode: 'checking'
  };

  function setStatus(message, mode = 'info') {
    state.statusMode = mode;
    $('#status').textContent = message;
  }

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    state.activeTab = tab || null;
    return state.activeTab;
  }

  function sendToActiveTab(message) {
    return new Promise((resolve) => {
      if (!state.activeTab?.id) return resolve({ ok: false, error: 'No active tab' });
      chrome.tabs.sendMessage(state.activeTab.id, message, (response) => {
        if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
        else resolve(response || { ok: false, error: 'No response' });
      });
    });
  }

  async function getPageState() {
    const response = await sendToActiveTab({ type: 'CC_GET_PAGE_STATE' });
    state.pageState = response.ok ? response : null;
    renderPageStatus();
    return response;
  }

  function renderPageStatus() {
    if (!state.pageState) {
      setStatus('Click a text field on the page first, then paste a capsule here.', 'needs-field');
      render();
      return;
    }
    if (state.pageState.hasEditable) {
      setStatus('Ready. Choose one capsule below, or paste the selected folder context.', 'ready');
      render();
      return;
    }
    setStatus('No text field is focused. Click a chat box, doc, email, or form field first.', 'needs-field');
    render();
  }

  async function loadCapsules() {
    const stored = await chrome.storage.local.get([core.STORAGE_KEY]);
    if (!Array.isArray(stored[core.STORAGE_KEY])) {
      state.capsules = core.DEFAULT_CAPSULES.map(core.normalizeCapsule);
      await saveAll();
    } else {
      state.capsules = stored[core.STORAGE_KEY].map(core.normalizeCapsule).filter((capsule) => capsule.body);
    }
    state.capsules = core.sortCapsules(state.capsules);
    state.activeFolder = core.folderNames(state.capsules)[0] || core.DEFAULT_FOLDER;
    render();
  }

  async function saveAll() {
    state.capsules = core.sortCapsules(state.capsules.map(core.normalizeCapsule).filter((capsule) => capsule.body));
    await chrome.storage.local.set({ [core.STORAGE_KEY]: state.capsules });
  }

  function visibleCapsules() {
    return state.capsules.filter((capsule) => {
      const folderMatch = !state.activeFolder || capsule.folder === state.activeFolder;
      return folderMatch && core.matchesQuery(capsule, state.query);
    });
  }

  function renderFolderFilter() {
    const folders = core.folderNames(state.capsules);
    const filter = $('#folderFilter');
    filter.innerHTML = '';
    for (const folder of folders) {
      const option = document.createElement('option');
      option.value = folder;
      option.textContent = folder;
      filter.append(option);
    }
    if (!folders.includes(state.activeFolder)) state.activeFolder = folders[0] || core.DEFAULT_FOLDER;
    if (!folders.length) {
      const option = document.createElement('option');
      option.value = core.DEFAULT_FOLDER;
      option.textContent = core.DEFAULT_FOLDER;
      filter.append(option);
    }
    filter.value = state.activeFolder;

    const datalist = $('#folderOptions');
    datalist.innerHTML = '';
    for (const folder of folders) {
      const option = document.createElement('option');
      option.value = folder;
      datalist.append(option);
    }
  }

  function render() {
    renderFolderFilter();
    const capsules = visibleCapsules();
    const list = $('#folderList');
    const canPaste = Boolean(state.pageState?.hasEditable);
    $('#count').textContent = `${capsules.length}/${state.capsules.length}`;
    $('#useFolderText').textContent = state.activeFolder ? `Paste ${state.activeFolder} context` : 'Paste folder context';
    $('#useFolderLabel').textContent = canPaste ? 'Ready' : 'Focus field first';
    $('#useFolder').disabled = !canPaste || !state.activeFolder || !state.capsules.some((capsule) => capsule.folder === state.activeFolder);
    list.innerHTML = '';

    if (!capsules.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = state.query ? 'No matching capsules. Clear search or add a new one.' : 'No capsules in this folder yet. Add one below or clip selected text.';
      list.append(empty);
      return;
    }

    for (const capsule of capsules) {
      const row = document.createElement('article');
      row.className = 'capsule-row';
      row.innerHTML = `
        <div class="capsule-copy">
          <strong></strong>
          <span></span>
          <div class="capsule-meta"></div>
        </div>
        <div class="capsule-actions">
          <button class="use-child" type="button" aria-label="Paste capsule">Paste</button>
          <button class="edit-child" type="button" title="Edit capsule">✎</button>
          <button class="delete-child" type="button" title="Delete capsule">×</button>
        </div>`;
      row.querySelector('strong').textContent = capsule.title;
      row.querySelector('.capsule-copy span').textContent = capsule.body.replace(/\s+/g, ' ').slice(0, 128);
      const meta = row.querySelector('.capsule-meta');
      const folderPill = document.createElement('span');
      folderPill.className = 'meta-pill';
      folderPill.textContent = capsule.folder;
      meta.append(folderPill);
      for (const tag of (capsule.tags || []).slice(0, 2)) {
        const tagPill = document.createElement('span');
        tagPill.className = 'meta-pill';
        tagPill.textContent = tag;
        meta.append(tagPill);
      }
      row.querySelector('.use-child').disabled = !canPaste;
      row.querySelector('.use-child').addEventListener('click', () => insertCapsule(capsule));
      row.querySelector('.edit-child').addEventListener('click', () => editCapsule(capsule));
      row.querySelector('.delete-child').addEventListener('click', () => deleteCapsule(capsule.id));
      list.append(row);
    }
  }

  async function insertText(text) {
    const response = await sendToActiveTab({ type: 'CC_INSERT_TEXT', text });
    if (response.ok) window.close();
    else setStatus('Click a text field on the page first, then try Paste again.', 'needs-field');
  }

  async function insertCapsule(capsule) {
    await insertText(core.formatForInsert(capsule));
  }

  async function insertFolder(folder) {
    const text = core.formatFolderForInsert(folder, state.capsules);
    if (!text) {
      setStatus('This folder has no saved context yet.', 'info');
      return;
    }
    await insertText(text);
  }

  function editCapsule(capsule) {
    state.editingId = capsule.id;
    $('#composePanel').open = true;
    $('#formTitle').textContent = 'Edit capsule';
    $('#capsuleFolder').value = capsule.folder;
    $('#capsuleTitle').value = capsule.title;
    $('#capsuleBody').value = capsule.body;
    $('#capsuleTags').value = (capsule.tags || []).join(', ');
    $('#capsuleFolder').focus();
    setStatus('Editing saved context. Save to update it.', 'info');
  }

  async function deleteCapsule(id) {
    state.capsules = state.capsules.filter((capsule) => capsule.id !== id);
    await saveAll();
    if (!core.folderNames(state.capsules).includes(state.activeFolder)) state.activeFolder = core.folderNames(state.capsules)[0] || core.DEFAULT_FOLDER;
    render();
    setStatus('Capsule deleted locally.', 'info');
  }

  function resetForm() {
    state.editingId = null;
    $('#formTitle').textContent = 'New capsule';
    $('#capsuleFolder').value = state.activeFolder || core.DEFAULT_FOLDER;
    $('#capsuleTitle').value = '';
    $('#capsuleBody').value = '';
    $('#capsuleTags').value = '';
  }

  async function saveFromForm() {
    const folder = core.cleanFolder($('#capsuleFolder').value || state.activeFolder);
    const title = $('#capsuleTitle').value.trim();
    const body = $('#capsuleBody').value.trim();
    const tags = $('#capsuleTags').value.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (!folder || !title || !body) {
      setStatus('Folder, name, and context text are required.', 'info');
      return;
    }
    if (state.editingId) {
      state.capsules = state.capsules.map((capsule) => capsule.id === state.editingId
        ? core.normalizeCapsule({ ...capsule, folder, title, body, tags, updatedAt: core.now() })
        : capsule);
      setStatus('Capsule updated.', 'ready');
    } else {
      state.capsules.unshift(core.normalizeCapsule({ id: core.uid(), folder, title, body, tags, updatedAt: core.now() }));
      setStatus('Capsule saved locally.', 'ready');
    }
    state.activeFolder = folder;
    await saveAll();
    resetForm();
    render();
  }

  async function saveSelection() {
    const response = await getPageState();
    const text = response.selectedText || '';
    if (!text) {
      setStatus('Select text on the page first, then clip it into a capsule.', 'info');
      return;
    }
    state.editingId = null;
    $('#composePanel').open = true;
    $('#formTitle').textContent = 'New capsule';
    $('#capsuleFolder').value = state.activeFolder || core.DEFAULT_FOLDER;
    $('#capsuleTitle').value = response.title ? response.title.slice(0, 38) : 'Selected context';
    $('#capsuleBody').value = text;
    $('#capsuleTags').value = 'clipped';
    $('#capsuleTitle').focus();
    setStatus('Selection clipped. Name it and save.', 'info');
  }

  async function openPalette() {
    const response = await sendToActiveTab({ type: 'CC_OPEN_PALETTE' });
    if (response.ok) window.close();
    else setStatus('Click a text field first, then use the in-page palette.', 'needs-field');
  }

  async function useActiveFolder() {
    if (!state.activeFolder) return;
    await insertFolder(state.activeFolder);
  }

  async function init() {
    setStatus('Checking the current page.', 'checking');
    await getActiveTab();
    await loadCapsules();
    await getPageState();
    $('#folderFilter').addEventListener('change', () => {
      state.activeFolder = $('#folderFilter').value;
      $('#capsuleFolder').value = state.activeFolder;
      render();
    });
    $('#search').addEventListener('input', () => {
      state.query = $('#search').value;
      render();
    });
    $('#useFolder').addEventListener('click', useActiveFolder);
    $('#useSelection').addEventListener('click', saveSelection);
    $('#openPalette').addEventListener('click', openPalette);
    $('#saveCapsule').addEventListener('click', saveFromForm);
    $('#resetForm').addEventListener('click', resetForm);
    resetForm();
  }

  init().catch(() => setStatus('Could not start Capsule on this page.', 'needs-field'));
})();
