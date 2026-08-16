const test = require('node:test');
const assert = require('node:assert/strict');
const { setMenuState } = require('../js/common.js');
const { initHome } = require('../js/home.js');

function fakeElement() {
  const attrs = new Map();
  const listeners = new Map();
  return {
    hidden: false,
    classList: {
      values: new Set(),
      toggle(name, on) {
        if (on) this.values.add(name);
        else this.values.delete(name);
      }
    },
    listeners,
    addEventListener(name, handler) { listeners.set(name, handler); },
    querySelectorAll() { return []; },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name); }
  };
}

test('setMenuState keeps the mobile menu and aria state synchronized', () => {
  const toggle = fakeElement();
  const nav = fakeElement();

  setMenuState(toggle, nav, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(nav.classList.values.has('is-open'), true);

  setMenuState(toggle, nav, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(nav.classList.values.has('is-open'), false);
});

test('initHome lets keyboard users close the mobile menu with Escape', () => {
  const toggle = fakeElement();
  const nav = fakeElement();
  toggle.setAttribute('aria-expanded', 'true');
  nav.classList.toggle('is-open', true);
  const documentListeners = new Map();
  const documentRef = {
    documentElement: fakeElement(),
    querySelector(selector) { return selector === '#menu-toggle' ? toggle : nav; },
    querySelectorAll() { return []; },
    addEventListener(name, handler) { documentListeners.set(name, handler); },
    getElementById() { return null; }
  };
  const windowRef = { matchMedia: () => ({ matches: true }) };

  initHome(documentRef, windowRef);
  documentListeners.get('keydown')({ key: 'Escape' });

  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(nav.classList.values.has('is-open'), false);
});

test('initHome wires homepage FAQ disclosures', () => {
  const button = fakeElement();
  const panel = fakeElement();
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'faq-panel');
  const documentRef = {
    documentElement: fakeElement(),
    querySelector(selector) {
      if (selector === '#menu-toggle' || selector === '#primary-nav') return null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-faq-button]') return [button];
      if (selector === '[data-reveal]') return [];
      return [];
    },
    getElementById(id) { return id === 'faq-panel' ? panel : null; },
    addEventListener() {}
  };
  const windowRef = { matchMedia: () => ({ matches: true }) };

  initHome(documentRef, windowRef);
  button.listeners.get('click')();

  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(panel.hidden, false);
});
