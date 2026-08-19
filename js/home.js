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

function setCourseTabState(tabs, documentRef, activeTab) {
  tabs.forEach((tab) => {
    const selected = tab === activeTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = documentRef.getElementById(tab.getAttribute('aria-controls'));
    if (panel) panel.hidden = !selected;
  });
}

function initCourseTabs(documentRef) {
  const tabs = Array.from(documentRef.querySelectorAll('[data-program-tab]'));
  if (!tabs.length) return;

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setCourseTabState(tabs, documentRef, tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      setCourseTabState(tabs, documentRef, nextTab);
      nextTab.focus();
    });
  });
}

function initHome(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initCourseTabs(documentRef);
  initFaqDisclosures(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initHome());
}

const api = { setFaqState, initFaqDisclosures, setCourseTabState, initCourseTabs, initHome };
if (typeof module !== 'undefined') module.exports = api;
})();
