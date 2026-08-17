(() => {
const common = typeof module !== 'undefined' && module.exports
  ? require('./common.js')
  : globalThis.HoofersCommon;

function initAbout(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initAbout());
}

if (typeof module !== 'undefined') module.exports = { initAbout };
})();
