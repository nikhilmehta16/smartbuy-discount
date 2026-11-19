const input = document.getElementById('pct');
chrome.storage.sync.get({ pct: 15 }, (v) => (input.value = v.pct));
input.addEventListener('input', () => {
  const pct = parseFloat(input.value);
  if (pct >= 0 && pct <= 100) chrome.storage.sync.set({ pct });
});
