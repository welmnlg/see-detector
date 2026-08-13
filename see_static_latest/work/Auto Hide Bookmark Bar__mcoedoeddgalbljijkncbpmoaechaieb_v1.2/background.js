chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_BOOKMARKS") {
    chrome.bookmarks.getTree((itemTree) => {
      // We pakken de eerste paar bladwijzers uit de 'Bladwijzerbalk'
      const mainBar = itemTree[0].children[0].children; 
      sendResponse({bookmarks: mainBar.slice(0, 15)}); // We tonen de eerste 15
    });
    return true; // Houdt het kanaal open voor het antwoord
  }
});