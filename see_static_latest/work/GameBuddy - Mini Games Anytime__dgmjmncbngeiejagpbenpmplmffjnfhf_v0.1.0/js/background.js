// MV3 background service worker: initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["gamesLiveState"], (result) => {
    if (result.gamesLiveState === undefined) {
      chrome.storage.local.set({ "gamesLiveState": "on" });
    }
  });
  
  // Initialize character parameters (similar to character-cheerup)
  const gmbdids = Array.from({ length: 1000 }, (v, k) => k + 1);
  const shuffled = [...gmbdids].sort(() => 0.5 - Math.random());
  const selectedGmbdids = shuffled.slice(0, 12);
  const gmbdParams = { 'addgmbd': 12, 'gmbdids': selectedGmbdids };
  chrome.storage.local.set({ 'gmbdParams': gmbdParams });
});

