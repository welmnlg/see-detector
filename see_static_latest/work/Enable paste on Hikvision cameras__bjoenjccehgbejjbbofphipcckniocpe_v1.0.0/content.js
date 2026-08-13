// Runs in the isolated content-script world. Intercepts Cmd/Ctrl+V, reads the
// clipboard (works on http:// because of clipboardRead + execCommand fallback),
// and forwards the text to the page-world script via a CustomEvent.
document.addEventListener("keydown", async (e) => {
  const isPaste = (e.key === "v" || e.key === "V") && (e.metaKey || e.ctrlKey) && !e.altKey;
  if (!isPaste) return;
  const el = document.activeElement;
  if (!el) return;
  const tag = el.tagName;
  const isEditable = tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  if (!isEditable) return;

  let text = "";
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      text = await navigator.clipboard.readText();
    } else {
      // Insecure context (http://): fall back to execCommand('paste') via a
      // hidden textarea. Works in extension content scripts with clipboardRead.
      const ta = document.createElement("textarea");
      ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
      document.documentElement.appendChild(ta);
      ta.focus();
      const ok = document.execCommand("paste");
      text = ok ? ta.value : "";
      ta.remove();
      if (el.focus) el.focus();
    }
  } catch (err) {
    console.warn("[Enable Paste] clipboard read failed:", err);
    return;
  }
  if (!text) return;

  e.stopImmediatePropagation();
  e.preventDefault();

  document.dispatchEvent(new CustomEvent("__enablePaste", { detail: { text } }));
}, true);
