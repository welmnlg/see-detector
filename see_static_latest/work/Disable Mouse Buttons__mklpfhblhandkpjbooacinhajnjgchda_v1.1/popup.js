document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = {
    disableSide: document.getElementById('disableSide'),
    disableMiddle: document.getElementById('disableMiddle'),
    disableScroll: document.getElementById('disableScroll')
  };

  // Load saved settings
  chrome.storage.sync.get(['disableSide', 'disableMiddle', 'disableScroll'], (result) => {
    // Default values: Side=true, Middle=true, Scroll=false
    // If key doesn't exist (undefined), use default
    checkboxes.disableSide.checked = result.disableSide !== false; // Default true
    checkboxes.disableMiddle.checked = result.disableMiddle !== false; // Default true
    checkboxes.disableScroll.checked = result.disableScroll === true; // Default false
  });

  // Save settings on change
  Object.keys(checkboxes).forEach(key => {
    checkboxes[key].addEventListener('change', (e) => {
      const setting = {};
      setting[key] = e.target.checked;
      chrome.storage.sync.set(setting);
    });
  });
});