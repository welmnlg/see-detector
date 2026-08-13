document.addEventListener('DOMContentLoaded', loadSites);
document.getElementById('addBtn').addEventListener('click', addSite);

function addSite() {
  const input = document.getElementById('siteInput');
  const site = input.value.trim().toLowerCase();

  if (site) {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const sites = result.blockedSites || [];
      if (!sites.includes(site)) {
        sites.push(site);
        chrome.storage.sync.set({blockedSites: sites}, function() {
          addSiteToUI(site);
          input.value = '';
        });
      }
    });
  }
}

function loadSites() {
  chrome.storage.sync.get(['blockedSites'], function(result) {
    const sites = result.blockedSites || [];
    sites.forEach(addSiteToUI);
  });
}

function addSiteToUI(site) {
  const ul = document.getElementById('siteList');
  const li = document.createElement('li');
  li.innerHTML = `
    ${site} 
    <span class="remove-btn">✕</span>
  `;
  
  // delete item
  li.querySelector('.remove-btn').addEventListener('click', function() {
    removeSite(site, li);
  });
  
  ul.appendChild(li);
}

function removeSite(site, element) {
  chrome.storage.sync.get(['blockedSites'], function(result) {
    let sites = result.blockedSites || [];
    sites = sites.filter(s => s !== site);
    chrome.storage.sync.set({blockedSites: sites}, function() {
      element.remove();
    });
  });
}