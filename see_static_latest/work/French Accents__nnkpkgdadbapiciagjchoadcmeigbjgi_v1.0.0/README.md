# French Accents Extension

A Chrome extension that allows you to type French accented characters easily, without switching to AZERTY keyboard layout.

## Features

### ✨ Typing Mode (New!)
A floating overlay keyboard appears automatically when you click on any input field. Simply click any accent button to type it directly into the active field!

**Features:**
- Automatically appears when you focus on input fields
- Click any accent button to type it instantly
- Draggable overlay - move it anywhere on the page
- Works with all input types: text inputs, textareas, and contenteditable elements
- Supports both lowercase and uppercase accented characters

### ⚙️ Settings
- Toggle typing mode on/off
- View all keyboard shortcuts

## Usage

### Typing Mode
1. Make sure typing mode is enabled (default: ON)
2. Click in any input field on any website
3. A floating overlay keyboard will appear in the bottom-right corner
4. Click any accent button to type it directly into the active field
5. Drag the overlay by its header to reposition it
6. Click the × button to close the overlay


## Available Accent Characters

The overlay keyboard includes all common French accents:

**Lowercase:** à, â, é, è, ê, ë, î, ï, ô, ù, û, ü, ç

**Uppercase:** À, Â, É, È, Ê, Ë, Î, Ï, Ô, Ù, Û, Ü, Ç

## Development

### Project Structure
- `manifest.json` - Extension configuration
- `content.js` - Content script for typing functionality
- `typing.js` - Typing utility functions
- `popup.html/js` - Extension popup interface
- `options.html/js/css` - Options page
- `background.js` - Background service worker

