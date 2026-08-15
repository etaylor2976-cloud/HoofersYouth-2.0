function setMenuState(toggle, nav, expanded) {
  toggle.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
}

function initNavigation(documentRef) {
  const toggle = documentRef.querySelector('#menu-toggle');
  const nav = documentRef.querySelector('#primary-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    setMenuState(toggle, nav, expanded);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(toggle, nav, false));
  });

  documentRef.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenuState(toggle, nav, false);
      if (typeof toggle.focus === 'function') toggle.focus();
    }
  });
}

function initReveal(documentRef, windowRef) {
  const revealItems = [...documentRef.querySelectorAll('[data-reveal]')];
  const prefersReducedMotion = windowRef.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in windowRef)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  documentRef.documentElement.classList.add('reveal-ready');
  const observer = new windowRef.IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}

function initCommon(documentRef = document, windowRef = window) {
  initNavigation(documentRef);
  initReveal(documentRef, windowRef);
}

const api = { setMenuState, initNavigation, initReveal, initCommon };
if (typeof globalThis !== 'undefined') globalThis.HoofersCommon = api;
if (typeof module !== 'undefined') module.exports = api;
