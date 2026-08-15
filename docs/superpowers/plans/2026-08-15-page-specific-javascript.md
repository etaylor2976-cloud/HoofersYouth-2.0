# Page-Specific JavaScript Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic root `script.js` into shared site behavior and one focused JavaScript entry file for each HTML route without changing existing behavior.

**Architecture:** A browser/CommonJS-compatible `js/common.js` exposes mobile-navigation and reveal-animation helpers through `HoofersCommon` and `module.exports`. Each route loads `common.js` followed by exactly one page entry file, which initializes shared behavior and owns only that route's interactions.

**Tech Stack:** HTML5, browser JavaScript, CommonJS compatibility for Node.js, Node built-in test runner (`node --test`)

## Global Constraints

- Preserve all current page content, styling, form fields, validation rules, visual behavior, and demo-only submission behavior.
- Do not add backend requests, dependencies, bundlers, or a package manager requirement.
- Keep direct static-file browser use and the existing Node test runner working.
- Missing optional DOM hooks must remain harmless no-ops.
- Preserve the user's existing uncommitted `index.html` gallery-caption change.
- Every route must load `js/common.js` first and then exactly its matching page entry file with `defer`.
- Remove the root `script.js` only after all routes and tests use the new files.

---

### Task 1: Shared Site Runtime

**Files:**
- Create: `js/common.js`
- Create: `tests/common.test.js`

**Interfaces:**
- Consumes: DOM-like `documentRef` and `windowRef` objects.
- Produces: `HoofersCommon` and CommonJS exports containing `setMenuState(toggle, nav, expanded)`, `initNavigation(documentRef)`, `initReveal(documentRef, windowRef)`, and `initCommon(documentRef, windowRef)`.

- [ ] **Step 1: Write failing shared-runtime tests**

Create `tests/common.test.js` with focused tests that import `../js/common.js`, verify `setMenuState` synchronizes `aria-expanded` and `is-open`, verify Escape closes the menu through `initNavigation`, and verify `initReveal` immediately reveals items when reduced motion is preferred.

```js
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

test('initReveal reveals immediately for reduced motion', () => {
  const item = { classList: { add(name) { this.value = name; } } };
  const documentRef = { querySelectorAll() { return [item]; }, documentElement: { classList: { add() {} } } };
  const windowRef = { matchMedia() { return { matches: true }; } };
  initReveal(documentRef, windowRef);
  assert.equal(item.classList.value, 'is-visible');
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/common.test.js`

Expected: FAIL because `js/common.js` does not exist.

- [ ] **Step 3: Implement the shared runtime**

Move the current navigation and reveal logic from `script.js` into `js/common.js`. Define the four exported functions from the Interfaces block. Attach the API in browsers with `globalThis.HoofersCommon = api`; assign the same API to `module.exports` when CommonJS is available. Do not register `DOMContentLoaded` in this file because each page entry owns its initialization.

```js
function initCommon(documentRef = document, windowRef = window) {
  initNavigation(documentRef);
  initReveal(documentRef, windowRef);
}

const api = { setMenuState, initNavigation, initReveal, initCommon };
if (typeof globalThis !== 'undefined') globalThis.HoofersCommon = api;
if (typeof module !== 'undefined') module.exports = api;
```

- [ ] **Step 4: Run the shared tests and full baseline suite**

Run: `node --test tests/common.test.js`

Expected: PASS.

Run: `node --test tests/*.test.js`

Expected: all existing tests still PASS because `script.js` has not been removed yet.

- [ ] **Step 5: Commit the shared runtime**

```powershell
git add -- js/common.js tests/common.test.js
git commit -m "refactor: extract shared site javascript"
```

---

### Task 2: Homepage and FAQ Entries

**Files:**
- Create: `js/home.js`
- Create: `js/faq.js`
- Create: `tests/faq.test.js`
- Modify: `tests/interactions.test.js`

**Interfaces:**
- Consumes: `HoofersCommon.initCommon(documentRef, windowRef)` in browsers and `require('./common.js')` in Node.
- Produces from `home.js`: `setFaqState(button, panel, expanded)`, `initFaqDisclosures(documentRef)`, and `initHome(documentRef, windowRef)`.
- Produces from `faq.js`: `setFaqState(button, panel, expanded)`, `initFaqDisclosures(documentRef)`, `filterFaqItems(items, query)`, `initFaqFilter(documentRef)`, and `initFaqPage(documentRef, windowRef)`.

- [ ] **Step 1: Write failing page-specific FAQ tests**

Move the FAQ disclosure assertion out of `tests/interactions.test.js` into `tests/faq.test.js`, importing FAQ-page helpers from `../js/faq.js`. Update the homepage-interaction import to `../js/home.js` and verify `initHome` wires homepage disclosures. Keep the existing fake-element style and the existing filter/result-count assertions.

```js
const { setFaqState, filterFaqItems, initFaqFilter } = require('../js/faq.js');

test('filterFaqItems hides nonmatches and returns the visible count', () => {
  const makeItem = (text) => ({ dataset: { searchText: text }, hidden: false });
  const items = [makeItem('beginner eligibility'), makeItem('weather cancellation')];
  assert.equal(filterFaqItems(items, 'weather'), 1);
  assert.deepEqual(items.map((item) => item.hidden), [true, false]);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/interactions.test.js tests/faq.test.js`

Expected: FAIL because `js/home.js` and `js/faq.js` do not exist.

- [ ] **Step 3: Implement homepage and FAQ entries**

Move homepage disclosure behavior into `home.js`. Move FAQ disclosure and search behavior into `faq.js`. Each file must resolve the shared API with this pattern and export its own API for tests:

```js
const common = typeof module !== 'undefined' && module.exports
  ? require('./common.js')
  : globalThis.HoofersCommon;

function initHome(documentRef = document, windowRef = window) {
  common.initCommon(documentRef, windowRef);
  initFaqDisclosures(documentRef);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initHome());
}
```

`initFaqPage` must call `common.initCommon`, `initFaqDisclosures`, and `initFaqFilter`. Preserve current ARIA, hidden-state, normalized search, result-count, and empty-state behavior exactly.

- [ ] **Step 4: Run the focused tests**

Run: `node --test tests/interactions.test.js tests/faq.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the homepage and FAQ entries**

```powershell
git add -- js/home.js js/faq.js tests/interactions.test.js tests/faq.test.js
git commit -m "refactor: isolate home and faq javascript"
```

---

### Task 3: Contact and Account Entries

**Files:**
- Create: `js/contact.js`
- Create: `js/login.js`
- Create: `js/signup.js`
- Modify: `tests/forms.test.js`

**Interfaces:**
- Consumes: `HoofersCommon.initCommon(documentRef, windowRef)` in browsers and `require('./common.js')` in Node.
- Produces from `contact.js`: `validateField(field, form)`, `validateForm(form)`, `initContactForm(documentRef)`, and `initContact(documentRef, windowRef)`.
- Produces from `login.js`: `setPasswordVisibility(input, button, visible)`, `validateField(field, form)`, `validateForm(form)`, `initPasswordToggles(documentRef)`, `initLoginForm(documentRef)`, and `initLogin(documentRef, windowRef)`.
- Produces from `signup.js`: `setPasswordVisibility(input, button, visible)`, `validateField(field, form)`, `validateForm(form)`, `initPasswordToggles(documentRef)`, `initSignupForm(documentRef)`, and `initSignup(documentRef, windowRef)`.

- [ ] **Step 1: Write failing page-specific form tests**

Change `tests/forms.test.js` to import each route's functions from its matching file. Test contact required/email validation through `contact.js`, login password visibility and demo submission through `login.js`, and signup password matching/terms validation through `signup.js`.

```js
const contact = require('../js/contact.js');
const login = require('../js/login.js');
const signup = require('../js/signup.js');

test('signup validation rejects mismatched passwords', () => {
  const form = { elements: { password: field({ value: 'sailing88' }) } };
  const confirm = field({
    value: 'different',
    type: 'password',
    minLength: 8,
    dataset: { match: 'password' },
    name: 'passwordConfirm'
  });
  assert.equal(signup.validateField(confirm, form), 'Passwords must match.');
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/forms.test.js`

Expected: FAIL because the three page modules do not exist.

- [ ] **Step 3: Implement the contact entry**

Move the existing field/form validation behavior into `contact.js`. `initContactForm` must select only `[data-form-kind="contact"]`, prevent demo submission, show the existing success/error messages, and focus the first invalid field. `initContact` must call shared initialization and contact-form initialization.

- [ ] **Step 4: Implement the login entry**

Move validation, password visibility, and form submission behavior into `login.js`. `initLoginForm` must select only `[data-form-kind="login"]`. Preserve the current password label and `aria-pressed` changes.

- [ ] **Step 5: Implement the signup entry**

Move validation, password visibility, password-match validation, terms validation, and form submission behavior into `signup.js`. `initSignupForm` must select only `[data-form-kind="signup"]`.

Each of the three files must register its own `DOMContentLoaded` callback and export its named API through `module.exports`. Duplication of the small validation helpers is intentional so future backend submission logic is isolated by route.

- [ ] **Step 6: Run the focused tests**

Run: `node --test tests/forms.test.js`

Expected: PASS.

- [ ] **Step 7: Commit the form entries**

```powershell
git add -- js/contact.js js/login.js js/signup.js tests/forms.test.js
git commit -m "refactor: isolate contact and account javascript"
```

---

### Task 4: Static Page Entries and Route Wiring

**Files:**
- Create: `js/about.js`
- Create: `js/programs.js`
- Modify: `index.html`
- Modify: `about/index.html`
- Modify: `contact/index.html`
- Modify: `faq/index.html`
- Modify: `login/index.html`
- Modify: `programs/index.html`
- Modify: `signup/index.html`
- Modify: `tests/routes.test.js`
- Delete: `script.js`

**Interfaces:**
- Consumes: all APIs created in Tasks 1-3.
- Produces: two common-only entry functions, `initAbout(documentRef, windowRef)` and `initPrograms(documentRef, windowRef)`, plus complete HTML-to-script routing for all seven pages.

- [ ] **Step 1: Write the failing route-wiring test**

Replace the old shared-script assertion in `tests/routes.test.js` with a route-to-entry mapping. For every route, assert that `common.js` occurs before its page entry, both carry `defer`, and the HTML does not reference root `script.js`.

```js
const entries = {
  home: 'home', programs: 'programs', about: 'about', faq: 'faq',
  contact: 'contact', login: 'login', signup: 'signup'
};

test('every route loads common javascript followed by its page entry', () => {
  Object.entries(routes).forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    const prefix = name === 'home' ? 'js/' : '../js/';
    const commonIndex = html.indexOf(`src="${prefix}common.js" defer`);
    const pageIndex = html.indexOf(`src="${prefix}${entries[name]}.js" defer`);
    assert.ok(commonIndex >= 0, `${file}: common.js`);
    assert.ok(pageIndex > commonIndex, `${file}: ${entries[name]}.js after common.js`);
    assert.doesNotMatch(html, /src="(?:\.\.\/)?script\.js"/);
  });
});
```

- [ ] **Step 2: Run the route test and verify RED**

Run: `node --test tests/routes.test.js`

Expected: FAIL because the HTML pages still reference `script.js`.

- [ ] **Step 3: Create the static-page entries**

Create `about.js` and `programs.js`. Each resolves `common.js`, defines and exports its named initializer, calls `common.initCommon(documentRef, windowRef)`, and registers its own `DOMContentLoaded` callback.

- [ ] **Step 4: Update all HTML script tags**

On the homepage, replace the single script tag with deferred `js/common.js` then deferred `js/home.js`. On every nested page, replace it with deferred `../js/common.js` then deferred `../js/<route>.js`. Change no other HTML, including the user's gallery caption.

- [ ] **Step 5: Remove the monolithic script**

Delete `script.js` after confirming no HTML or test import references it:

```powershell
Get-ChildItem -Recurse -File -Include *.html,*.js | Select-String -Pattern "script\.js"
```

Expected: no matches other than a deliberate negative assertion in `tests/routes.test.js`.

- [ ] **Step 6: Run route and full-suite verification**

Run: `node --test tests/routes.test.js`

Expected: PASS.

Run: `node --test tests/*.test.js`

Expected: all tests PASS with no failures, errors, or warnings produced by the code under test.

- [ ] **Step 7: Commit route integration**

```powershell
git add -- index.html about/index.html contact/index.html faq/index.html login/index.html programs/index.html signup/index.html js/about.js js/programs.js tests/routes.test.js script.js
git commit -m "refactor: load page-specific javascript entries"
```
