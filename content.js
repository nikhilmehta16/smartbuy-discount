// Adds a "-15% ₹X" badge next to every standalone price like "₹15,069".
const PRICE_RE = /^₹\s?([\d,]+(?:\.\d+)?)$/;
const BADGE = 'sb-discount-badge';
let pct = 15;

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

function badgeFor(el) {
  const m = el.textContent.trim().match(PRICE_RE);
  if (!m) return;
  const price = parseFloat(m[1].replace(/,/g, ''));
  let b = el.nextElementSibling;
  if (!b || !b.classList.contains(BADGE)) {
    b = document.createElement('span');
    b.className = BADGE;
    el.after(b);
  }
  const text = `-${pct}% ${fmt(price * (1 - pct / 100))}`;
  if (b.textContent !== text) b.textContent = text;
}

function scan(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const els = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const p = n.parentElement;
    if (p && !p.classList.contains(BADGE) && n.textContent.includes('₹')) els.add(p);
  }
  els.forEach(badgeFor);
}

let queued = false;
const schedule = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; scan(); });
};

chrome.storage.sync.get({ pct: 15 }, (v) => {
  pct = v.pct;
  scan();
  new MutationObserver(schedule).observe(document.body, {
    childList: true, subtree: true, characterData: true,
  });
});

chrome.storage.onChanged.addListener((c) => {
  if (c.pct) { pct = c.pct.newValue; scan(); }
});
