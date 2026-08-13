const api = typeof browser !== 'undefined' ? browser : chrome;

let lastContextLinkText = '';

document.addEventListener('contextmenu', (event) => {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  const link = target ? target.closest('a[href]') : null;
  lastContextLinkText = link && typeof link.innerText === 'string' ? link.innerText.trim() : '';
}, true);

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'getLastContextLinkText') {
    sendResponse(lastContextLinkText);
  }
});
