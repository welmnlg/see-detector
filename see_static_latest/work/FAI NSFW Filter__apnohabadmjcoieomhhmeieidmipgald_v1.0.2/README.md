# FAI NSFW Filter

A Chrome extension that uses AI to detect and filter NSFW (Not Safe For Work) content in real-time.

## Features

- 🤖 **AI-Powered Detection** - Automatic NSFW content filtering
- ⚡ **Real-Time Processing** - Instant analysis as you browse
- 📊 **Smart Analytics** - Track blocked and scanned images
- 🔒 **Privacy First** - All processing happens locally in your browser
- 🌐 **Works Everywhere** - Compatible with all websites

## Installation Guide

### Install from Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store soon. This is the easiest installation method.

### Manual Installation (Developer Mode)

1. **Download the Extension**
   - Clone this repository or download as ZIP:
   ```bash
   git clone https://github.com/Falcons-ai/fai-nsfw-filter.git
   ```
   - If downloaded as ZIP, extract it to a folder

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → **More Tools** → **Extensions**

3. **Enable Developer Mode**
   - Toggle the **Developer mode** switch in the top-right corner

4. **Load the Extension**
   - Click **Load unpacked** button
   - Navigate to the `nsfw-filter-chrome` folder
   - Select the folder and click **Select**

5. **Verify Installation**
   - You should see "FAI NSFW Filter v1.0.0" in your extensions list
   - The extension icon will appear in your Chrome toolbar
   - Extension should show as "Enabled"

6. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "FAI NSFW Filter"
   - Click the pin icon to keep it visible

## Usage

### Basic Operation

1. **Click the Extension Icon**
   - Opens the popup interface with protection controls

2. **Toggle Protection**
   - Use the toggle switch to enable/disable filtering
   - Status will show "Active" or "Disabled"

3. **View Analytics**
   - **Blocked This Page** - Images blocked on current page
   - **Images Scanned** - Total images analyzed on current page
   - **Total Protected** - All-time blocked images across all sites
   - **Detection Rate** - Percentage of images detected as NSFW

### How It Works

- Extension automatically scans images on web pages
- AI analyzes each image for NSFW content
- Detected content is automatically blurred
- Statistics update in real-time
- Settings persist across sessions

## Troubleshooting

### Extension Not Working

1. **Refresh the page** after enabling the extension
2. **Check extension status** - Make sure toggle is "Active"
3. **Reload extension** - Go to `chrome://extensions/` and click reload
4. **Check permissions** - Ensure all required permissions are granted

### Images Not Being Detected

1. **Scroll the page** - Detection triggers on viewport visibility
2. **Wait for AI loading** - Initial model load takes a few seconds
3. **Check browser console** - Look for any error messages
4. **Try different websites** - Some sites may have specific image formats

### Statistics Not Updating

1. **Refresh the popup** - Close and reopen the extension popup
2. **Restart extension** - Go to `chrome://extensions/` and click reload
3. **Reinstall if needed** - Remove and reinstall extension

## Support

- **Issues:** Report bugs on [GitHub Issues](https://github.com/webnizam/fai-nsfw-filter/issues)
- **Feedback:** Share your experience at [Falcons AI](https://falcons.ai/)
- **Privacy:** Read our privacy policy at [Falcons AI](https://falcons.ai/)

## Acknowledgments

- Powered by ONNX Runtime
- Built with modern Chrome Extension APIs
- Inspired by community feedback for safer browsing

---

**Made with ❤️ by Falcons AI** | Protecting your browsing experience
