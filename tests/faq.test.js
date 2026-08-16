const test = require('node:test');
const assert = require('node:assert/strict');
const { setFaqState, filterFaqItems, initFaqFilter } = require('../js/faq.js');

function fakeElement() {
  const attrs = new Map();
  return {
    hidden: false,
    listeners: new Map(),
    addEventListener(name, handler) { this.listeners.set(name, handler); },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name); }
  };
}

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
  const items = [makeItem('beginner experience eligibility'), makeItem('weather cancellation'), makeItem('life jacket safety')];
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
  const items = [{ dataset: { searchText: 'weather cancellation' }, hidden: false }, { dataset: { searchText: 'life jacket safety' }, hidden: false }];
  const documentRef = { querySelector(selector) { return { '#faq-search': search, '#faq-results': results, '#faq-empty': empty }[selector]; }, querySelectorAll() { return items; } };
  initFaqFilter(documentRef);
  search.value = 'not-a-match';
  listeners.get('input')();
  assert.equal(results.textContent, 'Showing 0 questions');
  assert.equal(empty.hidden, false);
});
