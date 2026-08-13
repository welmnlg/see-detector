# Allow Paste

Allow Paste is a Chrome extension that re-enables cut, copy, and paste on websites that try to block those actions.

## What it does

- Stops common `copy`, `cut`, `paste`, `contextmenu`, `selectstart`, and clipboard shortcut handlers before site scripts can block them.
- Removes inline clipboard-blocking attributes such as `onpaste` and `oncopy` when they appear in the DOM.
- Forces text selection back on for pages that disable it with CSS.
- Lets you disable the behavior for a specific site from the extension popup.

## Load it in Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this folder.

## Notes

- Chrome does not allow extensions to inject scripts into internal pages like `chrome://`, the Chrome Web Store, or some extension pages.
- If you disable the extension on a site and want that page's original protections fully restored, refresh the tab.
