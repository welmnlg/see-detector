# 🧹 Unsender for Facebook

**Automatically unsend all your sent messages in any Facebook Messenger conversation with one click.**

Scroll through your entire chat history and remove every message you've ever sent — safely, one at a time, with randomized delays to avoid rate limits.

---

## ✨ Features

- **One-click unsend** — Start the process and walk away
- **Full chat history** — Automatically scrolls through the entire conversation to find all your messages
- **Smart detection** — Only targets messages you sent (never touches the other person's messages)
- **Randomized delays** — Configurable min/max delay between unsends to mimic human behavior
- **Multi-language support** — Works with Facebook in English, French, German, Spanish, Italian, Dutch, Turkish, Russian, and Arabic
- **Real click simulation** — Uses Chrome DevTools Protocol for reliable interactions
- **Live overlay** — See real-time progress directly on the Facebook page
- **Lightweight** — No external dependencies, no background network requests

---

## 📦 Installation

### From Chrome Web Store

> Coming soon.

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the folder containing the extension files
6. The extension icon will appear in your Chrome toolbar

---

## 🚀 How to Use

1. **Open Facebook Messenger** — Go to [facebook.com/messages](https://www.facebook.com/messages) or [messenger.com](https://www.messenger.com)
2. **Open a conversation** — Click on the chat you want to unsend messages from
3. **Click the extension icon** in the Chrome toolbar
4. **Set your delay** — Adjust the minimum and maximum delay between unsends (default: 3-7 seconds)
5. **Click "Start Unsending"** — The extension will begin scrolling through your messages and unsending them one by one
6. **Monitor progress** — A floating overlay on the page shows how many messages have been removed
7. **Stop anytime** — Click "Stop" in the popup to halt the process

---

## 📸 Screenshots

> Screenshots coming soon.

---

## 🔒 Privacy & Security

- **No data collection** — The extension does not collect, store, or transmit any personal data
- **Runs entirely locally** — All processing happens in your browser; no external servers are contacted
- **No analytics or tracking** — Zero telemetry of any kind
- **Open source** — The full source code is available for review
- **Minimal permissions** — Only requests the permissions strictly necessary for operation (active tab, scripting, debugger)

---

## ❓ FAQ

**Q: Will this unsend messages for both sides of the conversation?**
A: Yes. It uses Facebook's "Unsend" feature, which removes the message for everyone in the conversation.

**Q: Does it work on Messenger.com?**
A: Yes, it works on both facebook.com/messages and messenger.com.

**Q: Why does the extension need the "debugger" permission?**
A: Facebook blocks synthetic click events. The debugger permission allows the extension to send real mouse events via Chrome DevTools Protocol when standard clicks are intercepted.

**Q: Can I get rate-limited or banned?**
A: Facebook may temporarily restrict your account if you unsend too many messages too quickly. Use higher delay values (5-10 seconds) to reduce this risk. The extension uses randomized timing to help avoid detection.

**Q: What languages are supported?**
A: The extension recognizes unsend/remove buttons in English, French, German, Spanish, Italian, Dutch, Turkish, Russian, and Arabic.

**Q: Does it work in group chats?**
A: Yes, it works in both individual and group conversations.

**Q: Why did it stop before finishing?**
A: The extension stops after 30 consecutive failures or 15 empty scroll attempts. This usually means all reachable messages have been processed.

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## ⚠️ Disclaimer

This extension is provided as-is for personal use. Using automated tools to interact with Facebook may violate Facebook's [Terms of Service](https://www.facebook.com/terms.php). Use at your own risk. The authors are not responsible for any account restrictions, bans, or other consequences resulting from the use of this extension.

Facebook may impose rate limits on message unsending. If you experience issues, try increasing the delay between unsends. The extension makes a best-effort attempt to unsend messages but cannot guarantee 100% success due to Facebook's dynamic interface.
