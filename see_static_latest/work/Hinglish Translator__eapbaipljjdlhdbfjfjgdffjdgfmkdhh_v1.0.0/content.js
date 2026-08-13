(() => {
  if (window.__hinglishTranslatorLoaded) return;
  window.__hinglishTranslatorLoaded = true;

  const BATCH_SIZE = 15;
  const originalTexts = new Map();
  let translationProgress = { percent: 0, message: 'Idle', done: true, error: null };

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED',
    'SVG', 'MATH', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'SELECT'
  ]);

  function getTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        if (node.textContent.trim().length < 2) return NodeFilter.FILTER_REJECT;

        let parent = node.parentElement;
        while (parent) {
          if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
          parent = parent.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }
    return nodes;
  }

  function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  async function translateBatch(texts, apiKey, model) {
    const numbered = texts.map((t, i) => `[${i}] ${t}`).join('\n');
    const prompt = `You are a Hinglish translator. Convert the following English/Hindi text into natural Hinglish (Hindi words written in Roman/Latin script mixed with English).

Rules:
- Keep proper nouns, brand names, technical terms, URLs, and numbers as-is
- Use natural Hinglish that young Indians would use casually
- Keep the same tone and meaning
- Return ONLY the translations in the exact same numbered format
- Do NOT add explanations or extra text

Input:
${numbered}

Output:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const results = new Array(texts.length).fill(null);
    const lines = rawOutput.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (idx >= 0 && idx < texts.length) {
          results[idx] = match[2].trim();
        }
      }
    }

    return results.map((r, i) => r || texts[i]);
  }

  async function startTranslation() {
    translationProgress = { percent: 0, message: 'Scanning page...', done: false, error: null };

    try {
      const { geminiApiKey, geminiModel } = await chrome.storage.local.get(['geminiApiKey', 'geminiModel']);
      if (!geminiApiKey) {
        throw new Error('API key not found');
      }
      const model = geminiModel || 'gemini-2.0-flash';

      const textNodes = getTextNodes(document.body);
      if (textNodes.length === 0) {
        translationProgress = { percent: 100, message: 'No translatable text found', done: true, error: null };
        return;
      }

      const textsToTranslate = [];
      const nodeIndices = [];
      for (let i = 0; i < textNodes.length; i++) {
        const text = textNodes[i].textContent.trim();
        if (text.length >= 2) {
          if (!originalTexts.has(textNodes[i])) {
            originalTexts.set(textNodes[i], textNodes[i].textContent);
          }
          textsToTranslate.push(text);
          nodeIndices.push(i);
        }
      }

      const batches = chunkArray(
        textsToTranslate.map((text, i) => ({ text, nodeIdx: nodeIndices[i] })),
        BATCH_SIZE
      );

      const totalBatches = batches.length;
      translationProgress.message = `Translating 0/${totalBatches} batches...`;

      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const batchTexts = batch.map(item => item.text);

        const translated = await translateBatch(batchTexts, geminiApiKey, model);

        for (let j = 0; j < batch.length; j++) {
          const node = textNodes[batch[j].nodeIdx];
          if (node && translated[j]) {
            const original = node.textContent;
            const trimmed = original.trim();
            const leading = original.substring(0, original.indexOf(trimmed));
            const trailing = original.substring(original.indexOf(trimmed) + trimmed.length);
            node.textContent = leading + translated[j] + trailing;
          }
        }

        const percent = Math.round(((b + 1) / totalBatches) * 100);
        translationProgress.percent = percent;
        translationProgress.message = `Translating ${b + 1}/${totalBatches} batches...`;
      }

      translationProgress = { percent: 100, message: 'Done!', done: true, error: null };
    } catch (err) {
      translationProgress = { percent: 0, message: err.message, done: true, error: err.message };
    }
  }

  function restoreOriginal() {
    for (const [node, text] of originalTexts) {
      if (node.parentElement) {
        node.textContent = text;
      }
    }
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'translate') {
      startTranslation();
      sendResponse({ status: 'started' });
    } else if (msg.action === 'restore') {
      restoreOriginal();
      sendResponse({ status: 'restored' });
    } else if (msg.action === 'getProgress') {
      sendResponse({ ...translationProgress });
    }
    return true;
  });
})();
