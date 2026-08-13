(function () {
  const PATTERN = /Blocksi/gi;

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    const tag = parent.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return true;
    if (parent.closest("script, style, noscript")) return true;
    if (parent.isContentEditable) return true;
    return false;
  }

  function replaceInTextNode(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    if (shouldSkipTextNode(node)) return;
    const text = node.textContent;
    const next = text.replace(PATTERN, "bypass");
    if (next !== text) node.textContent = next;
  }

  function walkAndReplace(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const batch = [];
    let n;
    while ((n = walker.nextNode())) batch.push(n);
    batch.forEach(replaceInTextNode);
  }

  const observer = new MutationObserver((mutations) => {
    observer.disconnect();
    for (const m of mutations) {
      if (m.type === "characterData") {
        replaceInTextNode(m.target);
      } else if (m.type === "childList") {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) replaceInTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) walkAndReplace(node);
        });
      }
    }
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  });

  const root = document.body || document.documentElement;
  walkAndReplace(root);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
})();
