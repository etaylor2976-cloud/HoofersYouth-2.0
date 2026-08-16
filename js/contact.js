const common = typeof module !== 'undefined' ? require('./common.js') : globalThis.HoofersCommon;
const forms = typeof module !== 'undefined' ? require('./forms-common.js') : globalThis.HoofersForms;

function initContactForm(documentRef = document) {
  const form = documentRef.querySelector('[data-form-kind="contact"]');
  if (form) forms.initDemoForm(form);
}

function initContact(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initContactForm(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initContact());
}

if (typeof module !== 'undefined') module.exports = { initContactForm, initContact };
