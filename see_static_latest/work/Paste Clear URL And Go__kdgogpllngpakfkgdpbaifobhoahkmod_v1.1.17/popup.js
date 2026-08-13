const api = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', async () => {
  const preview = document.getElementById('preview');
  const title = document.getElementById('title');
  const btns = ['current', 'new', 'incognito'].map(id => document.getElementById(id));

  const { version } = api.runtime.getManifest();
  title.textContent = `Paste Clear URL And Go v ${version}`;

  const { keepId = true } = await api.storage.sync.get('keepId');

  let stripped = null;
  try {
    stripped = stripUrl(await navigator.clipboard.readText(), keepId);
  } catch {}

  if (!stripped) {
    preview.textContent = 'No valid URL in clipboard.';
    preview.classList.add('error');
    return;
  }

  preview.textContent = stripped;
  btns.forEach(b => (b.disabled = false));

  document.getElementById('current').addEventListener('click', async () => {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    await api.tabs.update(tab.id, { url: stripped });
    window.close();
  });

  document.getElementById('new').addEventListener('click', async () => {
    await api.tabs.create({ url: stripped });
    window.close();
  });

  document.getElementById('incognito').addEventListener('click', async () => {
    try {
      await api.windows.create({ url: stripped, incognito: true });
    } catch (e) {
      preview.textContent = e.message;
      preview.classList.add('error');
      return;
    }
    window.close();
  });

  document.getElementById('settings').addEventListener('click', e => {
    e.preventDefault();
    api.tabs.create({ url: api.runtime.getURL('options.html') });
    window.close();
  });
});
