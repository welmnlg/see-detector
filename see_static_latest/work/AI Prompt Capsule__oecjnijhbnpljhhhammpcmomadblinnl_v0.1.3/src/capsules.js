(() => {
  'use strict';

  const STORAGE_KEY = 'contextCapsules';
  const DEFAULT_FOLDER = 'General';

  function uid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `capsule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function now() {
    return Date.now();
  }

  const DEFAULT_CAPSULES = [
    {
      id: 'default-product-baseline',
      folder: 'Product',
      title: 'Basics',
      body: 'Product: [name]\nUser: [who]\nPromise: [change]\nStatus: [version / price / limits]\nAvoid: [unsafe claims]',
      tags: ['product'],
      updatedAt: 3
    },
    {
      id: 'default-project-brief',
      folder: 'Work',
      title: 'Brief',
      body: 'Goal: [result]\nAudience: [reader]\nRules: [time / format / tone]\nFiles: [links]\nNext: [task]',
      tags: ['work'],
      updatedAt: 2
    },
    {
      id: 'default-output-rule',
      folder: 'Rules',
      title: 'Style',
      body: 'Make it usable. Keep praise low. Split facts from guesses. Ask one question if blocked.',
      tags: ['style'],
      updatedAt: 1
    }
  ];

  function cleanFolder(value) {
    const folder = String(value || '').trim().replace(/\s+/g, ' ').slice(0, 48);
    return folder || DEFAULT_FOLDER;
  }

  function parseTags(value) {
    if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8);
    return String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
  }

  function normalizeCapsule(input) {
    const capsule = input || {};
    return {
      id: String(capsule.id || uid()),
      folder: cleanFolder(capsule.folder || capsule.group || capsule.category || DEFAULT_FOLDER),
      title: String(capsule.title || capsule.name || 'Untitled').trim().slice(0, 80),
      body: String(capsule.body || '').trim(),
      tags: parseTags(capsule.tags),
      updatedAt: Number(capsule.updatedAt || now())
    };
  }

  function sortCapsules(capsules) {
    return [...capsules].sort((a, b) => {
      const folderCompare = cleanFolder(a.folder).localeCompare(cleanFolder(b.folder));
      if (folderCompare !== 0) return folderCompare;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  function folderNames(capsules) {
    const score = new Map();
    for (const capsule of capsules) {
      const folder = cleanFolder(capsule.folder);
      score.set(folder, Math.max(score.get(folder) || 0, capsule.updatedAt || 0));
    }
    return [...score.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([folder]) => folder);
  }

  function capsulesInFolder(capsules, folder) {
    const target = cleanFolder(folder);
    return sortCapsules(capsules.filter((capsule) => cleanFolder(capsule.folder) === target));
  }

  function groupByFolder(capsules) {
    return folderNames(capsules).map((folder) => ({ folder, capsules: capsulesInFolder(capsules, folder) }));
  }

  function matchesQuery(capsule, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    const haystack = `${capsule.folder}\n${capsule.title}\n${capsule.body}\n${(capsule.tags || []).join(' ')}`.toLowerCase();
    return q.split(/\s+/).every((token) => haystack.includes(token));
  }

  function formatForInsert(capsule) {
    const title = capsule.title ? `## ${capsule.title}\n` : '';
    return `${title}${capsule.body}`.trim();
  }

  function formatFolderForInsert(folder, capsules) {
    const usable = capsulesInFolder(capsules, folder).filter((capsule) => capsule.body);
    if (!usable.length) return '';
    return `# ${cleanFolder(folder)}\n\n${usable.map(formatForInsert).join('\n\n---\n\n')}`.trim();
  }

  globalThis.CapsuleCore = {
    STORAGE_KEY,
    DEFAULT_FOLDER,
    DEFAULT_CAPSULES,
    uid,
    now,
    cleanFolder,
    normalizeCapsule,
    sortCapsules,
    folderNames,
    capsulesInFolder,
    groupByFolder,
    matchesQuery,
    formatForInsert,
    formatFolderForInsert
  };
})();
