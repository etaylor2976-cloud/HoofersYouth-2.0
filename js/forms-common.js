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

function initPasswordToggles(documentRef = document) {
  documentRef.querySelectorAll('[data-password-toggle]').forEach((button) => {
    const input = documentRef.getElementById(button.getAttribute('aria-controls'));
    if (!input) return;
    button.addEventListener('click', () => {
      setPasswordVisibility(input, button, input.type === 'password');
    });
  });
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

const api = { validateField, validateForm, setPasswordVisibility, initPasswordToggles, initDemoForm };
if (typeof globalThis !== 'undefined') globalThis.HoofersForms = api;
if (typeof module !== 'undefined') module.exports = api;
