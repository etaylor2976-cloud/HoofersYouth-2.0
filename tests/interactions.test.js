const test = require('node:test');
const assert = require('node:assert/strict');
const {
  setMenuState,
  setFaqState,
  initHomepage,
  filterFaqItems,
  initFaqFilter,
  initPasswordToggles
} = require('../script.js');

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

test('initHomepage lets keyboard users close the mobile menu with Escape', () => {
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

  initHomepage(documentRef, windowRef);
  documentListeners.get('keydown')({ key: 'Escape' });

  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(nav.classList.values.has('is-open'), false);
});

test('setFaqState keeps disclosure aria and visibility synchronized', () => {
  const button = fakeElement();
  const panel = fakeElement();

  setFaqState(button, panel, true);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(panel.hidden, false);

  setFaqState(button, panel, false);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.hidden, true);
});

test('filterFaqItems hides nonmatches and returns the visible count', () => {
  const makeItem = (text) => ({ dataset: { searchText: text }, hidden: false });
  const items = [
    makeItem('beginner experience eligibility'),
    makeItem('weather cancellation'),
    makeItem('life jacket safety')
  ];

  assert.equal(filterFaqItems(items, 'weather'), 1);
  assert.deepEqual(items.map((item) => item.hidden), [true, false, true]);
  assert.equal(filterFaqItems(items, ''), 3);
  assert.deepEqual(items.map((item) => item.hidden), [false, false, false]);
});

test('initFaqFilter updates count and empty state from search input', () => {
  const listeners = new Map();
  const search = { value: '', addEventListener(name, handler) { listeners.set(name, handler); } };
  const results = { textContent: '' };
  const empty = { hidden: true };
  const items = [
    { dataset: { searchText: 'weather cancellation' }, hidden: false },
    { dataset: { searchText: 'life jacket safety' }, hidden: false }
  ];
  const documentRef = {
    querySelector(selector) {
      return { '#faq-search': search, '#faq-results': results, '#faq-empty': empty }[selector];
    },
    querySelectorAll() { return items; }
  };

  initFaqFilter(documentRef);
  search.value = 'not-a-match';
  listeners.get('input')();

  assert.equal(results.textContent, 'Showing 0 questions');
  assert.equal(empty.hidden, false);
});

test('initPasswordToggles wires each control to its password input', () => {
  const listeners = new Map();
  const input = { type: 'password' };
  const attrs = new Map([['aria-controls', 'password']]);
  const button = {
    textContent: 'Show password',
    getAttribute(name) { return attrs.get(name); },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    addEventListener(name, handler) { listeners.set(name, handler); }
  };
  const documentRef = {
    querySelectorAll() { return [button]; },
    getElementById() { return input; }
  };

  initPasswordToggles(documentRef);
  listeners.get('click')();

  assert.equal(input.type, 'text');
  assert.equal(button.textContent, 'Hide password');
});
