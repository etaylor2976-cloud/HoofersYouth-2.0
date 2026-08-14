const test = require('node:test');
const assert = require('node:assert/strict');
const { validateField, validateForm, setPasswordVisibility, initDemoForms } = require('../script.js');

function field(overrides = {}) {
  return {
    value: '',
    checked: false,
    required: true,
    type: 'text',
    dataset: {},
    name: 'name',
    minLength: -1,
    ...overrides
  };
}

test('validateField reports required, email, password length, match, and consent errors', () => {
  assert.equal(validateField(field()), 'This field is required.');
  assert.equal(
    validateField(field({ value: 'wrong', type: 'email', name: 'email' })),
    'Enter a valid email address.'
  );
  assert.equal(
    validateField(field({ value: 'short', type: 'password', minLength: 8, name: 'password' })),
    'Use at least 8 characters.'
  );
  const form = { elements: { password: field({ value: 'sailing88' }) } };
  assert.equal(
    validateField(field({ value: 'different', dataset: { match: 'password' }, name: 'passwordConfirm' }), form),
    'Passwords must match.'
  );
  assert.equal(
    validateField(field({ type: 'checkbox', checked: false, name: 'terms' })),
    'Please accept the terms to continue.'
  );
  assert.equal(validateField(field({ value: 'Valid Name' })), '');
});

test('setPasswordVisibility synchronizes input type and button state', () => {
  const input = { type: 'password' };
  const attrs = new Map();
  const button = {
    setAttribute(name, value) { attrs.set(name, String(value)); },
    textContent: ''
  };

  setPasswordVisibility(input, button, true);
  assert.equal(input.type, 'text');
  assert.equal(attrs.get('aria-pressed'), 'true');
  assert.equal(button.textContent, 'Hide password');

  setPasswordVisibility(input, button, false);
  assert.equal(input.type, 'password');
  assert.equal(attrs.get('aria-pressed'), 'false');
  assert.equal(button.textContent, 'Show password');
});

test('validateForm writes errors and returns the first invalid field', () => {
  const error = { textContent: '' };
  const attrs = new Map([['aria-describedby', 'name-error']]);
  const invalid = field({
    getAttribute(name) { return attrs.get(name); },
    setAttribute(name, value) { attrs.set(name, String(value)); }
  });
  const form = {
    elements: { name: invalid },
    querySelectorAll() { return [invalid]; },
    ownerDocument: { getElementById() { return error; } }
  };

  const result = validateForm(form);

  assert.equal(result.valid, false);
  assert.equal(result.firstInvalid, invalid);
  assert.equal(error.textContent, 'This field is required.');
  assert.equal(attrs.get('aria-invalid'), 'true');
});

test('initDemoForms prevents submission and announces demo success', () => {
  const listeners = new Map();
  const status = { textContent: '', classList: { remove() {}, add(value) { this.value = value; } } };
  const valid = field({
    value: 'Parent Name',
    getAttribute() { return 'name-error'; },
    setAttribute() {}
  });
  const form = {
    dataset: { successMessage: 'Demo success.' },
    elements: { name: valid },
    ownerDocument: { getElementById() { return { textContent: '' }; } },
    querySelector(selector) { return selector === '[data-form-status]' ? status : null; },
    querySelectorAll() { return [valid]; },
    addEventListener(name, handler) { listeners.set(name, handler); }
  };
  const documentRef = { querySelectorAll() { return [form]; } };
  let prevented = false;

  initDemoForms(documentRef);
  listeners.get('submit')({ preventDefault() { prevented = true; } });

  assert.equal(prevented, true);
  assert.equal(status.textContent, 'Demo success.');
  assert.equal(status.classList.value, 'is-success');
});
