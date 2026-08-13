function findChatInput() {
  return document.querySelector(
    'div[data-input="true"][contenteditable="true"][role="textbox"]'
  );
}

async function sendChat(text) {
  const input = findChatInput();
  if (!input) return;

  input.focus();
  input.innerHTML = "";
  document.execCommand("insertText", false, text);

  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      bubbles: true
    })
  );
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "SEND_CHAT") {
    sendChat(msg.text);
    sendResponse({ ok: true });
    return true;
  }
});
