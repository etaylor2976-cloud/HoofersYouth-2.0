const test = require('node:test');
const assert = require('node:assert/strict');
const { setMenuState, initNavigation, initReveal } = require('../js/common.js');

test('setMenuState synchronizes mobile navigation state', () => {
  const attrs = new Map();
  const toggle = { setAttribute(name, value) { attrs.set(name, String(value)); } };
  const classes = new Set();
  const nav = { classList: { toggle(name, on) { on ? classes.add(name) : classes.delete(name); } } };
  setMenuState(toggle, nav, true);
  assert.equal(attrs.get('aria-expanded'), 'true');
  assert.equal(classes.has('is-open'), true);
});

test('initNavigation closes an expanded menu on Escape and restores focus', () => {
  const listeners = {};
  const attrs = new Map([['aria-expanded', 'true']]);
  const toggle = {
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name); },
    addEventListener(name, callback) { listeners.toggle = callback; },
    focus() { this.focused = true; }
  };
  const classes = new Set(['is-open']);
  const nav = {
    classList: { toggle(name, on) { on ? classes.add(name) : classes.delete(name); } },
    querySelectorAll() { return []; }
  };
  const documentRef = {
    querySelector(selector) { return selector === '#menu-toggle' ? toggle : nav; },
    addEventListener(name, callback) { listeners.document = callback; }
  };

  initNavigation(documentRef);
  listeners.document({ key: 'Escape' });
  assert.equal(attrs.get('aria-expanded'), 'false');
  assert.equal(classes.has('is-open'), false);
  assert.equal(toggle.focused, true);
});

test('initReveal reveals immediately for reduced motion', () => {
  const item = { classList: { add(name) { this.value = name; } } };
  const documentRef = { querySelectorAll() { return [item]; }, documentElement: { classList: { add() {} } } };
  const windowRef = { matchMedia() { return { matches: true }; } };
  initReveal(documentRef, windowRef);
  assert.equal(item.classList.value, 'is-visible');
});
