function setMenuState(toggle, nav, expanded) {
  toggle.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
}

function setFaqState(button, panel, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function filterFaqItems(items, query) {
  const normalized = String(query || '').trim().toLowerCase();
  let visible = 0;

  items.forEach((item) => {
    const matches = !normalized || item.dataset.searchText.toLowerCase().includes(normalized);
    item.hidden = !matches;
    if (matches) visible += 1;
  });

  return visible;
}

function setPasswordVisibility(input, button, visible) {
  input.type = visible ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(visible));
  button.textContent = visible ? 'Hide password' : 'Show password';
}

function validateField(field, form) {
  if (field.type === 'checkbox' && field.required && !field.checked) {
    return field.name === 'terms' ? 'Please accept the terms to continue.' : 'This field is required.';
  }

  const value = String(field.value || '').trim();
  if (field.required && !value) return 'This field is required.';

  if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Enter a valid email address.';
  }

  if (value && field.type === 'password' && field.minLength > 0 && value.length < field.minLength) {
    return `Use at least ${field.minLength} characters.`;
  }

  if (value && field.dataset.match && form && form.elements[field.dataset.match]) {
    if (value !== form.elements[field.dataset.match].value) return 'Passwords must match.';
  }

  return '';
}

function validateForm(form) {
  const fields = [...form.querySelectorAll('[data-validate]')];
  let firstInvalid = null;

  fields.forEach((field) => {
    const message = validateField(field, form);
    const describedBy = field.getAttribute('aria-describedby');
    const error = describedBy ? form.ownerDocument.getElementById(describedBy.split(' ')[0]) : null;
    if (error) error.textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (message && !firstInvalid) firstInvalid = field;
  });

  return { valid: firstInvalid === null, firstInvalid };
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

function initPasswordToggles(documentRef) {
  documentRef.querySelectorAll('[data-password-toggle]').forEach((button) => {
    const input = documentRef.getElementById(button.getAttribute('aria-controls'));
    if (!input) return;
    button.addEventListener('click', () => {
      setPasswordVisibility(input, button, input.type === 'password');
    });
  });
}

function initDemoForms(documentRef) {
  documentRef.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = validateForm(form);
      const status = form.querySelector('[data-form-status]');
      if (!status) return;
      status.classList.remove('is-error', 'is-success');

      if (!result.valid) {
        status.textContent = 'Please correct the highlighted fields.';
        status.classList.add('is-error');
        if (typeof result.firstInvalid.focus === 'function') result.firstInvalid.focus();
        return;
      }

      status.textContent = form.dataset.successMessage;
      status.classList.add('is-success');
    });
  });
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

  initFaqFilter(documentRef);
  initPasswordToggles(documentRef);
  initDemoForms(documentRef);

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
  module.exports = {
    setMenuState,
    setFaqState,
    filterFaqItems,
    setPasswordVisibility,
    validateField,
    validateForm,
    initFaqFilter,
    initPasswordToggles,
    initDemoForms,
    initHomepage
  };
}
