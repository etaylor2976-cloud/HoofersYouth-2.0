const test = require('node:test');
const assert = require('node:assert/strict');
const { setMenuState } = require('../js/common.js');
const {
  initHome,
  initCourseTabs,
  normalizeSlideshowImages,
  wrapSlideIndex,
  createSlideshowController,
  initSlideshow
} = require('../js/home.js');

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

function fakeNode(tagName = 'div') {
  const attrs = new Map();
  const listeners = new Map();
  const selectorMap = new Map();
  return {
    tagName,
    hidden: false,
    className: '',
    textContent: '',
    children: [],
    listeners,
    register(selector, node) { selectorMap.set(selector, node); },
    querySelector(selector) { return selectorMap.get(selector) || null; },
    append(...nodes) { this.children.push(...nodes); },
    addEventListener(name, handler) { listeners.set(name, handler); },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name); }
  };
}

function slideshowFixture() {
  const root = fakeNode();
  const viewport = fakeNode();
  const previous = fakeNode('button');
  const next = fakeNode('button');
  const indicators = fakeNode();
  const status = fakeNode('p');
  const empty = fakeNode('p');
  const controls = fakeNode();
  root.register('[data-slideshow-viewport]', viewport);
  root.register('[data-slide-previous]', previous);
  root.register('[data-slide-next]', next);
  root.register('[data-slide-indicators]', indicators);
  root.register('[data-slide-status]', status);
  root.register('[data-slideshow-empty]', empty);
  root.register('[data-slideshow-controls]', controls);
  const documentRef = {
    querySelector(selector) { return selector === '[data-slideshow]' ? root : null; },
    createElement(elementName) { return fakeNode(elementName); }
  };
  return { documentRef, root, viewport, previous, next, indicators, status, empty, controls };
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

test('slideshow image normalization rejects malformed manifest entries', () => {
  assert.deepEqual(normalizeSlideshowImages(null), []);
  assert.deepEqual(normalizeSlideshowImages([
    { src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' },
    { src: '', title: 'Missing' },
    null
  ]), [{ src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' }]);
});

test('slideshow controller wraps manual navigation and reports each selection', () => {
  const changes = [];
  const controller = createSlideshowController(3, (index) => changes.push(index));

  controller.previous();
  controller.next();
  controller.goTo(2);
  controller.next();

  assert.equal(controller.index, 0);
  assert.deepEqual(changes, [2, 0, 2, 0]);
  assert.equal(wrapSlideIndex(-1, 3), 2);
  assert.equal(wrapSlideIndex(3, 3), 0);
});

test('slideshow controller ignores navigation when no images exist', () => {
  const changes = [];
  const controller = createSlideshowController(0, (index) => changes.push(index));
  controller.next();
  controller.previous();
  assert.equal(controller.index, 0);
  assert.deepEqual(changes, []);
});

test('empty slideshow shows its fallback and hides viewport and controls', () => {
  const fixture = slideshowFixture();
  initSlideshow(fixture.documentRef, []);
  assert.equal(fixture.empty.hidden, false);
  assert.equal(fixture.viewport.hidden, true);
  assert.equal(fixture.controls.hidden, true);
});

test('single-image slideshow renders its image without navigation controls', () => {
  const fixture = slideshowFixture();
  initSlideshow(fixture.documentRef, [
    { src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' }
  ]);
  assert.equal(fixture.viewport.hidden, false);
  assert.equal(fixture.controls.hidden, true);
  assert.equal(fixture.status.textContent, '1 of 1');
  assert.equal(fixture.viewport.children[0].children[0].getAttribute('src'), 'assets/slideshow/01-lake.jpg');
});

test('slideshow buttons and arrow keys select and wrap visible slides', () => {
  const fixture = slideshowFixture();
  initSlideshow(fixture.documentRef, [
    { src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' },
    { src: 'assets/slideshow/02-crew.jpg', title: 'Crew', alt: 'Youth sailing: Crew' }
  ]);

  fixture.next.listeners.get('click')();
  assert.equal(fixture.status.textContent, '2 of 2');
  assert.equal(fixture.viewport.children[0].hidden, true);
  assert.equal(fixture.viewport.children[1].hidden, false);

  let prevented = false;
  fixture.root.listeners.get('keydown')({ key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(fixture.status.textContent, '1 of 2');

  fixture.indicators.children[1].listeners.get('click')();
  assert.equal(fixture.status.textContent, '2 of 2');
});

test('initHome lets keyboard users close the mobile menu with Escape', () => {
  const toggle = fakeElement();
  const nav = fakeElement();
  toggle.setAttribute('aria-expanded', 'true');
  nav.classList.toggle('is-open', true);
  const documentListeners = new Map();
  const documentRef = {
    documentElement: fakeElement(),
    querySelector(selector) {
      if (selector === '#menu-toggle') return toggle;
      if (selector === '#primary-nav') return nav;
      return null;
    },
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
