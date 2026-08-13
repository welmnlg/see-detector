(() => {
  'use strict';

  if (window.__CapsuleMounted) return;
  window.__CapsuleMounted = true;

  const core = globalThis.CapsuleCore;
  const state = {
    capsules: [],
    activeEditable: null,
    activeFolder: '',
    query: '',
    expanded: {},
    open: false
  };

  function editableFrom(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node.closest?.('textarea,input,[contenteditable=""],[contenteditable="true"],[role="textbox"]');
    if (!el) return null;
    if (el.matches('input') && !/^(text|search|email|url|tel|password|number)$/i.test(el.type || 'text')) return null;
    return el;
  }

  function selectedText() {
    return String(window.getSelection?.() || '').trim();
  }

  function textFromEditable(el) {
    if (!el) return '';
    if ('value' in el) return el.value || '';
    return el.innerText || el.textContent || '';
  }

  function setNativeValue(el, value) {
    const prototype = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
  }

  function insertText(el, text) {
    if (!el) return false;
    const insert = String(text || '').trim();
    if (!insert) return false;
    el.focus();

    if ('value' in el) {
      const start = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
      const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : start;
      const prefix = el.value.slice(0, start);
      const suffix = el.value.slice(end);
      const spacerBefore = prefix && !/\s$/.test(prefix) ? '\n\n' : '';
      const spacerAfter = suffix && !/^\s/.test(suffix) ? '\n\n' : '';
      const next = `${prefix}${spacerBefore}${insert}${spacerAfter}${suffix}`;
      setNativeValue(el, next);
      const position = prefix.length + spacerBefore.length + insert.length + spacerAfter.length;
      el.setSelectionRange?.(position, position);
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: insert }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    const spacer = textFromEditable(el).trim() ? '\n\n' : '';
    const payload = `${spacer}${insert}`;
    let usedCommand = false;
    try {
      usedCommand = document.execCommand?.('insertText', false, payload) || false;
    } catch (_) {
      usedCommand = false;
    }
    if (!usedCommand) {
      const selection = window.getSelection();
      const textNode = document.createTextNode(payload);
      if (selection && selection.rangeCount && el.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(textNode);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        el.append(textNode);
      }
    }
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: insert }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  async function loadCapsules() {
    const stored = await chrome.storage.local.get([core.STORAGE_KEY]);
    const list = Array.isArray(stored[core.STORAGE_KEY]) ? stored[core.STORAGE_KEY] : core.DEFAULT_CAPSULES;
    state.capsules = core.sortCapsules(list.map(core.normalizeCapsule).filter((capsule) => capsule.body));
    if (!state.activeFolder) state.activeFolder = core.folderNames(state.capsules)[0] || '';
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[core.STORAGE_KEY]) return;
    const list = Array.isArray(changes[core.STORAGE_KEY].newValue) ? changes[core.STORAGE_KEY].newValue : [];
    state.capsules = core.sortCapsules(list.map(core.normalizeCapsule).filter((capsule) => capsule.body));
    if (!core.folderNames(state.capsules).includes(state.activeFolder)) state.activeFolder = core.folderNames(state.capsules)[0] || '';
    renderPalette();
  });

  function installUi() {
    const host = document.createElement('div');
    host.id = 'context-capsule-root';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        *, *::before, *::after { box-sizing: border-box; }
        .dock { position: fixed; right: 18px; bottom: 18px; z-index: 2147483646; font-family: "Avenir Next", "Nunito Sans", "Segoe UI Variable", sans-serif; color: #18141a; pointer-events: none; }
        button, input, select { font: inherit; }
        .pill, .palette { pointer-events: auto; }
        .pill { min-height: 40px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(43,15,58,.14); border-radius: 999px; background: rgba(248,249,246,.92); color: #2b0f3a; box-shadow: 0 18px 46px rgba(28,16,36,.17), inset 0 1px 0 rgba(255,255,255,.82); backdrop-filter: blur(18px); padding: 7px 12px; font-weight: 900; font-size: 12px; cursor: pointer; opacity: .78; transition: opacity 160ms ease, transform 160ms ease; }
        .pill:hover { opacity: 1; transform: translateY(-1px); }
        .mark { width: 20px; height: 20px; border-radius: 7px; background: linear-gradient(145deg, #2b0f3a, #402048); position: relative; box-shadow: 0 8px 16px rgba(43,15,58,.24); }
        .mark::before, .mark::after { content: ""; position: absolute; left: 5px; right: 5px; height: 2px; border-radius: 999px; background: #f3eef4; }
        .mark::before { top: 7px; } .mark::after { top: 12px; background: #bfa7c8; }
        kbd { border: 1px solid rgba(43,15,58,.14); border-radius: 7px; padding: 2px 5px; background: rgba(255,255,255,.58); font-size: 10px; font-family: inherit; color: #6d6470; }
        .palette { width: min(490px, calc(100vw - 28px)); max-height: min(620px, calc(100vh - 88px)); display: none; margin-bottom: 10px; border: 1px solid rgba(43,15,58,.14); border-radius: 28px; background: radial-gradient(circle at 18% -10%, rgba(191,167,200,.26), transparent 36%), rgba(248,249,246,.97); box-shadow: 0 30px 86px rgba(28,16,36,.24), inset 0 1px 0 rgba(255,255,255,.84); backdrop-filter: blur(24px); overflow: hidden; }
        .palette.open { display: block; animation: rise 170ms cubic-bezier(.2,.8,.2,1); }
        .palette.open ~ .pill { display: none; }
        @keyframes rise { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .top { display: grid; grid-template-columns: 34px 1fr 94px 34px; gap: 8px; align-items: center; padding: 12px 12px 8px; }
        .brand { width: 34px; height: 34px; border-radius: 13px; background: linear-gradient(145deg, #2b0f3a, #402048); position: relative; }
        .brand::before, .brand::after { content: ""; position: absolute; left: 9px; right: 9px; height: 3px; border-radius: 999px; background: #f3eef4; }
        .brand::before { top: 12px; } .brand::after { top: 19px; background: #bfa7c8; }
        .folder-select { min-height: 42px; width: 100%; border: 1px solid rgba(43,15,58,.13); border-radius: 17px; background: rgba(255,255,255,.70); color: #18141a; padding: 0 12px; font-weight: 900; outline: none; cursor: pointer; }
        .all, .close, .folder-use, .toggle, .capsule-use { border: 0; cursor: pointer; font-weight: 950; }
        .all { min-height: 42px; border-radius: 999px; background: #2b0f3a; color: #f3eef4; box-shadow: 0 12px 24px rgba(43,15,58,.18); font-size: 11px; }
        .close { width: 34px; height: 34px; border-radius: 12px; background: rgba(43,15,58,.08); color: #2b0f3a; font-size: 18px; }
        .palette-note { margin: 0 14px 9px; color: #6d6470; font-size: 12px; line-height: 1.35; }
        .search { padding: 0 12px 10px; }
        .search input { width: 100%; min-height: 40px; border: 1px solid rgba(43,15,58,.11); border-radius: 16px; background: rgba(255,255,255,.62); color: #18141a; outline: none; padding: 0 12px; font-size: 14px; box-shadow: inset 0 1px 0 rgba(255,255,255,.70); }
        .search input::placeholder { color: #8a818d; }
        .search input:focus, .folder-select:focus { border-color: rgba(43,15,58,.34); box-shadow: 0 0 0 4px rgba(191,167,200,.20); }
        .list { max-height: 466px; overflow: auto; display: grid; gap: 9px; padding: 0 12px 12px; }
        .folder-card { border: 1px solid rgba(43,15,58,.10); border-radius: 21px; background: rgba(255,255,255,.58); overflow: hidden; }
        .folder-head { display: grid; grid-template-columns: 28px 1fr 50px 34px; gap: 8px; align-items: center; padding: 9px; }
        .folder-icon { width: 28px; height: 22px; border-radius: 8px 8px 7px 7px; background: linear-gradient(145deg, rgba(43,15,58,.18), rgba(191,167,200,.34)); position: relative; }
        .folder-icon::before { content: ""; position: absolute; left: 3px; top: -4px; width: 13px; height: 7px; border-radius: 5px 5px 0 0; background: rgba(43,15,58,.20); }
        .folder-title { min-width: 0; }
        .folder-title strong { display: block; color: #18141a; font-size: 13px; letter-spacing: -.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .folder-title span { display: inline-grid; place-items: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: rgba(43,15,58,.08); color: #2b0f3a; font-size: 10px; font-weight: 900; margin-top: 3px; }
        .folder-use { min-height: 32px; border-radius: 999px; background: rgba(43,15,58,.10); color: #2b0f3a; }
        .toggle { width: 34px; height: 32px; border-radius: 12px; background: rgba(43,15,58,.07); color: #2b0f3a; font-size: 16px; }
        .children { display: grid; gap: 7px; padding: 0 9px 9px; }
        .child { display: grid; grid-template-columns: 1fr 64px; gap: 8px; align-items: center; border: 1px solid rgba(43,15,58,.08); border-radius: 16px; background: rgba(248,249,246,.72); padding: 9px; }
        .child strong { display: block; color: #18141a; font-size: 12px; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .capsule-use { min-height: 32px; border-radius: 999px; background: #2b0f3a; color: #f3eef4; }
        .empty { padding: 22px 16px 26px; color: #6d6470; font-size: 12px; text-align: center; border: 1px dashed rgba(43,15,58,.16); border-radius: 20px; }
      </style>
      <div class="dock">
        <section id="palette" class="palette" aria-live="polite">
          <div class="top">
            <div class="brand" aria-hidden="true"></div>
            <select id="folderSelect" class="folder-select" aria-label="Folder"></select>
            <button id="useFolder" class="all" type="button" aria-label="Paste folder">Paste folder</button>
            <button id="close" class="close" type="button" aria-label="Close">×</button>
          </div>
          <p class="palette-note">Choose one capsule, or paste the whole selected folder into the focused field.</p>
          <div class="search"><input id="search" type="search" placeholder="Search saved context" autocomplete="off" aria-label="Search" /></div>
          <div id="list" class="list"></div>
        </section>
        <button id="pill" class="pill" type="button"><span class="mark"></span><span>AI Capsule</span><kbd>⌘K</kbd></button>
      </div>`;
    document.documentElement.append(host);
    return {
      host,
      shadow,
      palette: shadow.getElementById('palette'),
      pill: shadow.getElementById('pill'),
      search: shadow.getElementById('search'),
      list: shadow.getElementById('list'),
      close: shadow.getElementById('close'),
      folderSelect: shadow.getElementById('folderSelect'),
      useFolder: shadow.getElementById('useFolder')
    };
  }

  const ui = installUi();

  function visibleCapsules() {
    return state.capsules.filter((capsule) => {
      const inFolder = !state.activeFolder || capsule.folder === state.activeFolder;
      return inFolder && core.matchesQuery(capsule, state.query);
    });
  }

  function visibleGroups() {
    return core.groupByFolder(visibleCapsules());
  }

  function renderFolderSelect() {
    const folders = core.folderNames(state.capsules);
    ui.folderSelect.innerHTML = '';
    for (const folder of folders) {
      const option = document.createElement('option');
      option.value = folder;
      option.textContent = folder;
      ui.folderSelect.append(option);
    }
    if (!folders.includes(state.activeFolder)) state.activeFolder = folders[0] || '';
    ui.folderSelect.value = state.activeFolder;
    ui.useFolder.disabled = !state.activeFolder;
  }

  function renderPalette() {
    renderFolderSelect();
    const groups = visibleGroups();
    ui.list.innerHTML = '';
    if (!groups.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'None';
      ui.list.append(empty);
      return;
    }

    for (const group of groups) {
      const isOpen = state.expanded[group.folder] !== false;
      const card = document.createElement('section');
      card.className = 'folder-card';
      card.innerHTML = `
        <div class="folder-head">
          <div class="folder-icon" aria-hidden="true"></div>
          <div class="folder-title"><strong></strong><span></span></div>
          <button class="folder-use" type="button" aria-label="Paste folder">Folder</button>
          <button class="toggle" type="button" aria-label="Open">${isOpen ? '⌃' : '⌄'}</button>
        </div>
        <div class="children"></div>`;
      card.querySelector('.folder-title strong').textContent = group.folder;
      card.querySelector('.folder-title span').textContent = String(group.capsules.length);
      card.querySelector('.folder-use').addEventListener('click', () => insertFolder(group.folder));
      card.querySelector('.toggle').addEventListener('click', () => {
        state.expanded[group.folder] = !isOpen;
        renderPalette();
      });
      const children = card.querySelector('.children');
      children.style.display = isOpen ? 'grid' : 'none';
      for (const capsule of group.capsules) {
        const row = document.createElement('article');
        row.className = 'child';
        row.innerHTML = `<div><strong></strong></div><button class="capsule-use" type="button" aria-label="Paste capsule">Paste</button>`;
        row.querySelector('strong').textContent = capsule.title;
        row.querySelector('.capsule-use').addEventListener('click', () => insertCapsule(capsule));
        row.addEventListener('dblclick', () => insertCapsule(capsule));
        children.append(row);
      }
      ui.list.append(card);
    }
  }

  function openPalette() {
    if (!state.activeEditable) {
      const active = editableFrom(document.activeElement);
      if (active) state.activeEditable = active;
    }
    state.open = true;
    ui.palette.classList.add('open');
    renderPalette();
    window.setTimeout(() => ui.search.focus(), 0);
  }

  function closePalette() {
    state.open = false;
    ui.palette.classList.remove('open');
    state.query = '';
    ui.search.value = '';
    state.activeEditable?.focus?.();
  }

  function insertPayload(text) {
    const editable = state.activeEditable || editableFrom(document.activeElement);
    if (!editable) return false;
    state.activeEditable = editable;
    const ok = insertText(editable, text);
    closePalette();
    return ok;
  }

  function insertCapsule(capsule) {
    return insertPayload(core.formatForInsert(capsule));
  }

  function insertFolder(folder) {
    return insertPayload(core.formatFolderForInsert(folder, state.capsules));
  }

  ui.pill.addEventListener('click', openPalette);
  ui.close.addEventListener('click', closePalette);
  ui.folderSelect.addEventListener('change', () => {
    state.activeFolder = ui.folderSelect.value;
    renderPalette();
  });
  ui.useFolder.addEventListener('click', () => {
    if (state.activeFolder) insertFolder(state.activeFolder);
  });
  ui.search.addEventListener('input', () => {
    state.query = ui.search.value;
    renderPalette();
  });
  ui.search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const capsules = visibleCapsules();
      if (state.query && capsules[0]) insertCapsule(capsules[0]);
      else if (state.activeFolder) insertFolder(state.activeFolder);
    } else if (event.key === 'Escape') {
      closePalette();
    }
  });

  document.addEventListener('focusin', (event) => {
    const editable = editableFrom(event.target);
    if (editable) state.activeEditable = editable;
  }, true);

  document.addEventListener('keydown', (event) => {
    const isShortcut = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'k';
    if (!isShortcut) return;
    const editable = editableFrom(document.activeElement) || state.activeEditable;
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    state.activeEditable = editable;
    if (state.open) closePalette(); else openPalette();
  }, true);

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message.type !== 'string') return false;
    if (message.type === 'CC_GET_PAGE_STATE') {
      const editable = state.activeEditable || editableFrom(document.activeElement);
      sendResponse({
        ok: true,
        hasEditable: Boolean(editable),
        selectedText: selectedText(),
        folders: core.folderNames(state.capsules),
        title: document.title
      });
      return true;
    }
    if (message.type === 'CC_INSERT_TEXT') {
      const editable = state.activeEditable || editableFrom(document.activeElement);
      if (!editable) {
        sendResponse({ ok: false, error: 'Click' });
        return true;
      }
      state.activeEditable = editable;
      const ok = insertText(editable, message.text || '');
      sendResponse({ ok });
      return true;
    }
    if (message.type === 'CC_OPEN_PALETTE') {
      openPalette();
      sendResponse({ ok: true });
      return true;
    }
    return false;
  });

  loadCapsules().then(renderPalette).catch(() => {});
})();
