// Typing utility functions for French accents

// Enhanced accent mappings with multiple shortcut options
const typingShortcuts = {
  // Acute accents
  'alt+e': 'é',
  'ctrl+\'': 'é', // Alternative: Ctrl + apostrophe
  
  // Grave accents
  'alt+shift+e': 'è',
  'alt+a': 'à',
  'alt+u': 'ù',
  'ctrl+`': 'è', // Alternative: Ctrl + backtick
  
  // Circumflex
  'ctrl+shift+6': 'ê', // Ctrl + Shift + 6
  'ctrl+a': 'â',
  'ctrl+e': 'ê',
  'ctrl+i': 'î',
  'ctrl+o': 'ô',
  'ctrl+u': 'û',
  
  // Diaeresis
  'ctrl+shift+:': 'ë', // Ctrl + Shift + colon
  'ctrl+shift+e': 'ë',
  'ctrl+shift+i': 'ï',
  'ctrl+shift+u': 'ü',
  
  // Cedilla
  'alt+c': 'ç',
  'ctrl+,': 'ç', // Alternative: Ctrl + comma
};

// Convert key combination to shortcut string
function getShortcutString(event) {
  const parts = [];
  if (event.ctrlKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  if (event.metaKey) parts.push('meta');
  
  const key = event.key.toLowerCase();
  if (key.length === 1) {
    parts.push(key);
  } else {
    // Handle special keys
    const specialKeys = {
      'backquote': '`',
      'quote': "'",
      'comma': ',',
      'period': '.',
      'semicolon': ';',
      'slash': '/',
      'bracketleft': '[',
      'bracketright': ']',
      'backslash': '\\',
    };
    parts.push(specialKeys[key] || key);
  }
  
  return parts.join('+');
}

// Check if shortcut matches and return character
function getCharacterFromShortcut(shortcut) {
  return typingShortcuts[shortcut] || null;
}

// Functions are available globally in content script context

