function setMenuState(toggle, nav, expanded) {
  toggle.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
}

function setFaqState(button, panel, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function initHomepage(documentRef = document, windowRef = window) {
  const toggle = documentRef.querySelector('#menu-toggle');
  const nav = documentRef.querySelector('#primary-nav');

  if (toggle && nav) {
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

  documentRef.querySelectorAll('[data-faq-button]').forEach((button) => {
    const panel = documentRef.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      setFaqState(button, panel, expanded);
    });
  });

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

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initHomepage());
}

if (typeof module !== 'undefined') {
  module.exports = { setMenuState, setFaqState, initHomepage };
}
