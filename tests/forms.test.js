const test = require('node:test');
const assert = require('node:assert/strict');
const forms = require('../js/forms-common.js');
const contact = require('../js/contact.js');

function field(overrides = {}) {
  return {
    value: '',
    required: true,
    type: 'text',
    name: 'name',
    ...overrides
  };
}

test('validateField reports required and email errors and accepts valid text', () => {
  assert.equal(forms.validateField(field()), 'This field is required.');
  assert.equal(
    forms.validateField(field({ value: 'wrong', type: 'email', name: 'email' })),
    'Enter a valid email address.'
  );
  assert.equal(forms.validateField(field({ value: 'Valid Name' })), '');
});

test('validateForm writes errors and returns the first invalid field', () => {
  const error = { textContent: '' };
  const attrs = new Map([['aria-describedby', 'name-error']]);
  const invalid = field({
    getAttribute(name) { return attrs.get(name); },
    setAttribute(name, value) { attrs.set(name, String(value)); }
  });
  const form = {
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

test('Contact initializer attaches only the Contact demo form', () => {
  const calls = [];
  const form = { addEventListener() {} };
  const documentRef = {
    querySelector(selector) {
      calls.push(selector);
      return selector === '[data-form-kind="contact"]' ? form : null;
    }
  };

  contact.initContactForm(documentRef);

  assert.deepEqual(calls, ['[data-form-kind="contact"]']);
});
