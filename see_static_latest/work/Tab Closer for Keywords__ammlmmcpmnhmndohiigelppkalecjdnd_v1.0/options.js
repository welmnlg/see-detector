document.addEventListener('DOMContentLoaded', async () => {
  const { configJson } = await chrome.storage.sync.get('configJson');
  document.getElementById('jsonInput').value = configJson || '{"keywords": ["doodle"]}';
});

document.getElementById('saveButton').addEventListener('click', async () => {
  const jsonInput = document.getElementById('jsonInput').value;
  try {
    JSON.parse(jsonInput); // Validate
    await chrome.storage.sync.set({ configJson: jsonInput });
    const status = document.getElementById('status');
    status.textContent = 'Saved successfully!';
    setTimeout(() => { status.textContent = ''; }, 3000);
  } catch (e) {
    alert('Invalid JSON: ' + e.message);
  }
});