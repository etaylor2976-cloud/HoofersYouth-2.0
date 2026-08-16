const common = typeof module !== 'undefined' && module.exports
  ? require('./common.js')
  : globalThis.HoofersCommon;

function initPrograms(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initPrograms());
}

if (typeof module !== 'undefined') module.exports = { initPrograms };
