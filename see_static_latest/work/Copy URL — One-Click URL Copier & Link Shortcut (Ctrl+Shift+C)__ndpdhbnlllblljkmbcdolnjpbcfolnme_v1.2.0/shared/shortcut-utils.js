'use strict';

const DEFAULT_SHORTCUT = {
  ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, key: 'C'
};

function formatShortcut(shortcut) {
  const parts = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('Cmd');
  parts.push(formatKey(shortcut.key));
  return parts.join('+');
}

function formatModifiers(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  if (e.metaKey) parts.push('Cmd');
  return parts.join('+');
}

function formatKey(key) {
  const names = {
    ' ': 'Space',
    'ArrowUp': '\u2191',
    'ArrowDown': '\u2193',
    'ArrowLeft': '\u2190',
    'ArrowRight': '\u2192',
    'Enter': '\u21B5',
    'Backspace': '\u232B',
    'Delete': 'Del',
    'Escape': 'Esc'
  };
  return names[key] || (key.length === 1 ? key.toUpperCase() : key);
}

function createRecordHandler(callbacks) {
  return function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      callbacks.onModifiersOnly(formatModifiers(e) + '\u2026');
      return;
    }

    if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
      callbacks.onNoModifier();
      return;
    }

    const shortcut = {
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      key: e.key.length === 1 ? e.key.toUpperCase() : e.key
    };

    callbacks.onCapture(shortcut, formatShortcut(shortcut));
  };
}
