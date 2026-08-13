import { LLMClient } from '../lib/api.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CAPTURE_AND_TRANSLATE") {
        handleCaptureAndTranslate(request.area, sender.tab.id);
    } else if (request.action === "REQUEST_START_SELECTION") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                sendStartSelection(tabs[0].id);
            }
            sendResponse({ ok: true });
        });
        return true; // keep channel open for async sendResponse
    }
    return true;
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "capture_area_context",
        title: "Capture & Translate",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "capture_area_context") {
        if (tab && tab.id) {
            sendStartSelection(tab.id);
        }
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "capture_area") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                sendStartSelection(tabs[0].id);
            }
        });
    }
});

async function sendStartSelection(tabId) {
    try {
        await chrome.tabs.sendMessage(tabId, { action: "START_SELECTION" });
        chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});
    } catch (err) {
        try {
            await chrome.scripting.insertCSS({
                target: { tabId },
                files: ["content/styles.css"]
            });
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ["content/content.js"]
            });
            await chrome.tabs.sendMessage(tabId, { action: "START_SELECTION" });
            chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});
        } catch (injectErr) {
            console.log("Cannot script this tab", injectErr);
            chrome.action.setBadgeText({ tabId, text: "!" }).catch(() => {});
            chrome.action.setBadgeBackgroundColor({ tabId, color: "#EF4444" }).catch(() => {});
        }
    }
}

function sendToTab(tabId, message) {
    chrome.tabs.sendMessage(tabId, message).catch(() => {});
}

async function handleCaptureAndTranslate(area, tabId) {
    try {
        // 1. Capture screen (fails on chrome://, edge://, extensions, etc.)
        let dataUrl;
        try {
            dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
        } catch (captureErr) {
            sendToTab(tabId, { action: "SHOW_ERROR", message: "Cannot capture this page (e.g. New Tab or chrome://). Open a normal website and try again." });
            return;
        }

        // 2. Crop Image
        const croppedDataUrl = await cropImage(dataUrl, area);

        // 3. Get Credentials (include modelName and targetLang so language choice is applied)
        const storage = await chrome.storage.sync.get(['provider', 'apiKey', 'modelName', 'targetLang']);
        if (!storage.apiKey) {
            sendToTab(tabId, { action: "SHOW_ERROR", message: "API Key not configured. Please open extension settings." });
            return;
        }
        const provider = storage.provider || 'gemini';
        const modelName = storage.modelName || 'gemini-2.0-flash';
        const targetLang = storage.targetLang || 'Vietnamese';

        // 4. Call API (or Mock)
        let result;
        if (storage.apiKey === "TEST") {
            // Mock Mode
            await new Promise(r => setTimeout(r, 1000)); // Simulate delay
            result = {
                original: "This is a test sentence extracted from the image for testing purposes.",
                translated: `[${targetLang}] Đây là một câu kiểm tra được trích xuất từ hình ảnh cho mục đích thử nghiệm.`
            };
        } else {
            const client = new LLMClient(provider, storage.apiKey, modelName, targetLang);
            result = await client.translateImage(croppedDataUrl);
        }

        // 5. Send Result to Content Script
        sendToTab(tabId, { action: "SHOW_RESULT", data: result });

    } catch (err) {
        console.error(err);
        sendToTab(tabId, { action: "SHOW_ERROR", message: err.message });
    }
}

async function cropImage(dataUrl, area) {
    // Use OffscreenCanvas to crop
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    // Adjust for pixel ratio if needed. 
    // captureVisibleTab returns the actual pixel resolution.
    // The 'area' from content script is in CSS pixels.
    // We need to scale the area coordinates by devicePixelRatio.

    const scale = area.devicePixelRatio || 1;

    const rawX = area.x * scale;
    const rawY = area.y * scale;
    const rawW = area.width * scale;
    const rawH = area.height * scale;

    const x = Math.max(0, Math.floor(rawX));
    const y = Math.max(0, Math.floor(rawY));
    const w = Math.max(1, Math.floor(rawW));
    const h = Math.max(1, Math.floor(rawH));

    if (x >= bitmap.width || y >= bitmap.height) {
        throw new Error("Selection is outside the captured area.");
    }

    const clampedW = Math.min(w, bitmap.width - x);
    const clampedH = Math.min(h, bitmap.height - y);

    const canvas = new OffscreenCanvas(clampedW, clampedH);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bitmap, x, y, clampedW, clampedH, 0, 0, clampedW, clampedH);

    const blobCropped = await canvas.convertToBlob({ type: 'image/png' });

    // Convert blob back to base64
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blobCropped);
    });
}
