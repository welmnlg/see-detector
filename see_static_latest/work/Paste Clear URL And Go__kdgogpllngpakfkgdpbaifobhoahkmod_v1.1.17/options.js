const api = typeof browser !== 'undefined' ? browser : chrome;
const status = document.getElementById('status');

document.addEventListener('DOMContentLoaded', async () => {
  const { version } = api.runtime.getManifest();
  document.querySelector('h2').textContent = `Paste Clear URL And Go v ${version} — Settings`;
  const { keepId = true } = await api.storage.sync.get('keepId');
  document.getElementById('keepId').checked = keepId;
});

document.getElementById('keepId').addEventListener('change', async e => {
  await api.storage.sync.set({ keepId: e.target.checked });
  status.textContent = 'Saved.';
  setTimeout(() => (status.textContent = ''), 1500);
});
