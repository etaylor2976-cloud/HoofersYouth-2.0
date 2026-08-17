const test = require('node:test');
const assert = require('node:assert/strict');
const forms = require('../js/forms-common.js');
const contact = require('../js/contact.js');
const login = require('../js/login.js');
const signup = require('../js/signup.js');

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
  assert.equal(forms.validateField(field()), 'This field is required.');
  assert.equal(
    forms.validateField(field({ value: 'wrong', type: 'email', name: 'email' })),
    'Enter a valid email address.'
  );
  assert.equal(
    forms.validateField(field({ value: 'short', type: 'password', minLength: 8, name: 'password' })),
    'Use at least 8 characters.'
  );
  const form = { elements: { password: field({ value: 'sailing88' }) } };
  assert.equal(
    forms.validateField(field({ value: 'different', dataset: { match: 'password' }, name: 'passwordConfirm' }), form),
    'Passwords must match.'
  );
  assert.equal(
    forms.validateField(field({ type: 'checkbox', checked: false, name: 'terms' })),
    'Please accept the terms to continue.'
  );
  assert.equal(forms.validateField(field({ value: 'Valid Name' })), '');
});

test('setPasswordVisibility synchronizes input type and button state', () => {
  const input = { type: 'password' };
  const attrs = new Map();
  const button = {
    setAttribute(name, value) { attrs.set(name, String(value)); },
    textContent: ''
  };

  forms.setPasswordVisibility(input, button, true);
  assert.equal(input.type, 'text');
  assert.equal(attrs.get('aria-pressed'), 'true');
  assert.equal(button.textContent, 'Hide password');

  forms.setPasswordVisibility(input, button, false);
  assert.equal(input.type, 'password');
  assert.equal(attrs.get('aria-pressed'), 'false');
  assert.equal(button.textContent, 'Show password');
});

test('initPasswordToggles wires each password button to its input', () => {
  const listeners = new Map();
  const input = { type: 'password' };
  const attrs = new Map();
  const button = {
    getAttribute(name) { return name === 'aria-controls' ? 'password-input' : null; },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    addEventListener(name, handler) { listeners.set(name, handler); },
    textContent: 'Show password'
  };
  const documentRef = {
    querySelectorAll(selector) { return selector === '[data-password-toggle]' ? [button] : []; },
    getElementById(id) { return id === 'password-input' ? input : null; }
  };

  forms.initPasswordToggles(documentRef);
  listeners.get('click')();

  assert.equal(input.type, 'text');
  assert.equal(attrs.get('aria-pressed'), 'true');
  assert.equal(button.textContent, 'Hide password');
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

  const result = forms.validateForm(form);

  assert.equal(result.valid, false);
  assert.equal(result.firstInvalid, invalid);
  assert.equal(error.textContent, 'This field is required.');
  assert.equal(attrs.get('aria-invalid'), 'true');
});

test('initDemoForm prevents submission and announces demo success', () => {
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
  let prevented = false;

  forms.initDemoForm(form);
  listeners.get('submit')({ preventDefault() { prevented = true; } });

  assert.equal(prevented, true);
  assert.equal(status.textContent, 'Demo success.');
  assert.equal(status.classList.value, 'is-success');
});

test('route form initializers attach only their matching demo form', () => {
  const listeners = new Map();
  const form = {
    addEventListener(name, handler) { listeners.set(name, handler); }
  };
  const calls = [];
  const documentRef = {
    querySelector(selector) {
      calls.push(selector);
      return selector === '[data-form-kind="signup"]' ? form : null;
    },
    querySelectorAll() { return []; },
    getElementById() { return null; }
  };

  contact.initContactForm(documentRef);
  login.initLoginForm(documentRef);
  signup.initSignupForm(documentRef);

  assert.deepEqual(calls, [
    '[data-form-kind="contact"]',
    '[data-form-kind="login"]',
    '[data-form-kind="signup"]'
  ]);
  assert.equal(listeners.has('submit'), true);
});
