// Runs on sites.google.com pages
// Checks if the page HTML contains references that are not educational
// To block more sites, simply add new terms to the blockedTerms list below

const blockedTerms = [
  "1v1.lol",
  "1v1 lol",
  "not about:blank",
  "in about:blank",
  "launch about:blank",
  "pr0xy",
  "proxies",
  "FNAF 4",
  "cookie-clicker",
  "discord.gg",
  "dsc.gg",
  "unblocked game",
  "snake game",
  "champion island",
  "request a game",
  "moto x3m",
  "click to play",
  "emulatorjs",
];

(function () {
  const bodyText = document.body.innerHTML.toLowerCase();
  const blocked = blockedTerms.some(term => bodyText.includes(term));
  if (blocked) {
    chrome.runtime.sendMessage({ action: "closeTab" });
  }
})();