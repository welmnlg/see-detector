# Hinglish Translator - Chrome Extension

A Chrome extension that translates any web page text into **Hinglish** (Hindi written in Roman script mixed with English) using the **Google Gemini API**.

## Setup

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key

### 2. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `WebTranslationHinglish` folder
5. The extension icon will appear in your toolbar

### 3. Configure

1. Click the extension icon in the toolbar
2. Paste your Gemini API key
3. Click **Save Key**

## Usage

1. Navigate to any web page
2. Click the extension icon
3. Click **Translate to Hinglish**
4. Wait for the translation to complete (progress bar shown)
5. To revert, click **Restore Original**

## How It Works

- The extension scans the page for visible text nodes
- Text is sent in batches to the Gemini API for translation
- Translated Hinglish text replaces the original on the page
- Original text is preserved in memory so you can restore it anytime

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome Extension Manifest V3 config |
| `popup.html/css/js` | Extension popup UI |
| `content.js` | Content script that handles DOM text extraction and replacement |
| `background.js` | Service worker |
| `icons/` | Extension icons |

## Notes

- The extension skips `<code>`, `<pre>`, `<script>`, `<style>`, and other non-translatable elements
- Proper nouns, brand names, URLs, and numbers are preserved
- Translation quality depends on the Gemini model's understanding of Hinglish
