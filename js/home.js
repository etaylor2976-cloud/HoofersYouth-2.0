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

function initHome(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initFaqDisclosures(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initHome());
}

const api = { setFaqState, initFaqDisclosures, initHome };
if (typeof module !== 'undefined') module.exports = api;
})();
