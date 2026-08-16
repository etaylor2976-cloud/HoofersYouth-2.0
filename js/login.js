const common = typeof module !== 'undefined' ? require('./common.js') : globalThis.HoofersCommon;
const forms = typeof module !== 'undefined' ? require('./forms-common.js') : globalThis.HoofersForms;

function initLoginForm(documentRef = document) {
  const form = documentRef.querySelector('[data-form-kind="login"]');
  if (form) forms.initDemoForm(form);
  forms.initPasswordToggles(documentRef);
}

function initLogin(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initLoginForm(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initLogin());
}

if (typeof module !== 'undefined') module.exports = { initLoginForm, initLogin };
