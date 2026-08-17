(() => {
const common = typeof module !== 'undefined' ? require('./common.js') : globalThis.HoofersCommon;
const forms = typeof module !== 'undefined' ? require('./forms-common.js') : globalThis.HoofersForms;

function initSignupForm(documentRef = document) {
  const form = documentRef.querySelector('[data-form-kind="signup"]');
  if (form) forms.initDemoForm(form);
  forms.initPasswordToggles(documentRef);
}

function initSignup(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initSignupForm(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initSignup());
}

if (typeof module !== 'undefined') module.exports = { initSignupForm, initSignup };
})();
