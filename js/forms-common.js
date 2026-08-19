(() => {
function validateField(field) {
  const value = String(field.value || '').trim();
  if (field.required && !value) return 'This field is required.';

  if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Enter a valid email address.';
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

function initDemoForm(form) {
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
}

const api = { validateField, validateForm, initDemoForm };
if (typeof globalThis !== 'undefined') globalThis.HoofersForms = api;
if (typeof module !== 'undefined') module.exports = api;
})();
