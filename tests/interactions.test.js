const test = require('node:test');
const assert = require('node:assert/strict');
const { setMenuState } = require('../js/common.js');
const { initHome, initCourseTabs } = require('../js/home.js');

function fakeElement() {
  const attrs = new Map();
  const listeners = new Map();
  return {
    hidden: false,
    tabIndex: 0,
    focused: false,
    classList: {
      values: new Set(),
      toggle(name, on) {
        if (on) this.values.add(name);
        else this.values.delete(name);
      }
    },
    listeners,
    focus() { this.focused = true; },
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

test('course tabs switch the visible panel when clicked', () => {
  const morningTab = fakeElement();
  const afternoonTab = fakeElement();
  const morningPanel = fakeElement();
  const afternoonPanel = fakeElement();
  morningTab.setAttribute('aria-controls', 'morning-courses');
  afternoonTab.setAttribute('aria-controls', 'afternoon-courses');
  const panels = new Map([
    ['morning-courses', morningPanel],
    ['afternoon-courses', afternoonPanel]
  ]);
  const documentRef = {
    querySelectorAll(selector) { return selector === '[data-program-tab]' ? [morningTab, afternoonTab] : []; },
    getElementById(id) { return panels.get(id); }
  };

  initCourseTabs(documentRef);
  afternoonTab.listeners.get('click')();

  assert.equal(morningTab.getAttribute('aria-selected'), 'false');
  assert.equal(morningTab.tabIndex, -1);
  assert.equal(morningPanel.hidden, true);
  assert.equal(afternoonTab.getAttribute('aria-selected'), 'true');
  assert.equal(afternoonTab.tabIndex, 0);
  assert.equal(afternoonPanel.hidden, false);
});

test('course tabs support wrapping arrow-key navigation', () => {
  const morningTab = fakeElement();
  const afternoonTab = fakeElement();
  const dayCampTab = fakeElement();
  const panels = new Map();
  [morningTab, afternoonTab, dayCampTab].forEach((tab, index) => {
    const id = `panel-${index}`;
    tab.setAttribute('aria-controls', id);
    panels.set(id, fakeElement());
  });
  const documentRef = {
    querySelectorAll(selector) { return selector === '[data-program-tab]' ? [morningTab, afternoonTab, dayCampTab] : []; },
    getElementById(id) { return panels.get(id); }
  };

  initCourseTabs(documentRef);
  let prevented = false;
  morningTab.listeners.get('keydown')({ key: 'ArrowLeft', preventDefault() { prevented = true; } });

  assert.equal(prevented, true);
  assert.equal(dayCampTab.focused, true);
  assert.equal(dayCampTab.getAttribute('aria-selected'), 'true');
  assert.equal(panels.get('panel-2').hidden, false);
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
