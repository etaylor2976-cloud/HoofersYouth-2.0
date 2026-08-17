(() => {
const common = typeof module !== 'undefined' && module.exports
  ? require('./common.js')
  : globalThis.HoofersCommon;

function setFaqState(button, panel, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function initFaqDisclosures(documentRef) {
  documentRef.querySelectorAll('[data-faq-button]').forEach((button) => {
    const panel = documentRef.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      setFaqState(button, panel, expanded);
    });
  });
}

function filterFaqItems(items, query) {
  const normalized = String(query || '').trim().toLowerCase();
  let visible = 0;
  items.forEach((item) => {
    const searchText = String(item.dataset.searchText || '').toLowerCase();
    const matches = !normalized || searchText.includes(normalized);
    item.hidden = !matches;
    if (matches) visible += 1;
  });
  return visible;
}

function initFaqFilter(documentRef) {
  const search = documentRef.querySelector('#faq-search');
  const results = documentRef.querySelector('#faq-results');
  const empty = documentRef.querySelector('#faq-empty');
  if (!search || !results || !empty) return;
  const items = [...documentRef.querySelectorAll('[data-faq-item]')];
  const applyFilter = () => {
    const visible = filterFaqItems(items, search.value);
    results.textContent = `Showing ${visible} questions`;
    empty.hidden = visible !== 0;
  };
  search.addEventListener('input', applyFilter);
  applyFilter();
}

function initFaqPage(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initFaqDisclosures(documentRef);
  initFaqFilter(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initFaqPage());
}

const api = { setFaqState, initFaqDisclosures, filterFaqItems, initFaqFilter, initFaqPage };
if (typeof module !== 'undefined') module.exports = api;
})();
