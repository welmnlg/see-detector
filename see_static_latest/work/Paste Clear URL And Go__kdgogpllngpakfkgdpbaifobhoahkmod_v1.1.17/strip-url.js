function stripUrl(raw, keepId) {
  let url;
  try { url = new URL(raw.trim()); } catch { return null; }
  if (!keepId) { url.search = ''; return url.href; }
  let idKey = null, idVal = null;
  for (const [k, v] of url.searchParams) {
    if (k.toLowerCase() === 'id') { idKey = k; idVal = v; break; }
  }
  url.search = '';
  if (idKey !== null) url.searchParams.set(idKey, idVal);
  return url.href;
}

if (typeof module !== 'undefined') module.exports = { stripUrl };
