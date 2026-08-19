# Two-Route Site Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the static site to Home and Contact, keep Programs and FAQ as homepage sections, and replace account signup with a shared camp-signup alert.

**Architecture:** `index.html` and `contact/index.html` become the only route documents. `js/common.js` owns navigation, reveal behavior, and the shared camp-signup alert; `js/home.js` retains homepage FAQ disclosures; `js/forms-common.js` and `js/contact.js` retain contact-only validation. Removed routes, their scripts, their tests, and their exclusive styles are deleted together.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test runner, headless Chrome

**Spec:** `docs/superpowers/specs/2026-08-18-two-route-site-simplification-design.md`

## Global Constraints

- Keep only `index.html` and `contact/index.html` as route documents.
- Keep the existing homepage Programs and FAQ section content and layout.
- Remove About and Login everywhere.
- Keep “Sign up” only as a camp action; it must not navigate, submit, store data, or contact a backend.
- Use the exact alert message: `You’re signed up for camp! We’ll be in touch with next steps.`
- Keep the Contact form frontend-only and remove its “Account preview” topic.
- Do not deploy the site.
- Implement directly on `main`, as previously requested.

---

### Task 1: Collapse the Site to Home and Contact

**Files:**
- Modify: `tests/routes.test.js`
- Modify: `tests/common.test.js`
- Modify: `tests/homepage.test.js`
- Modify: `tests/forms.test.js`
- Delete: `tests/faq.test.js`
- Modify: `index.html`
- Modify: `contact/index.html`
- Modify: `js/common.js`
- Modify: `js/forms-common.js`
- Delete: `js/programs.js`
- Delete: `js/about.js`
- Delete: `js/faq.js`
- Delete: `js/login.js`
- Delete: `js/signup.js`
- Delete: `programs/index.html`
- Delete: `about/index.html`
- Delete: `faq/index.html`
- Delete: `login/index.html`
- Delete: `signup/index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `[data-camp-signup]` buttons, `window.alert`, `#programs`, `#faq`, the Home and Contact route documents, and the existing Contact form hooks.
- Produces: `CAMP_SIGNUP_MESSAGE: string`, `initCampSignup(documentRef, windowRef): void`, two valid route documents, valid section navigation, and contact-only form validation.

- [ ] **Step 1: Rewrite route tests for the two-route contract**

Replace the route declarations in `tests/routes.test.js` with:

```js
const routes = { home: 'index.html', contact: 'contact/index.html' };
const removedRouteNames = ['programs', 'about', 'faq', 'login', 'signup'];
const expectedScripts = {
  home: ['js/common.js', 'js/home.js'],
  contact: ['../js/common.js', '../js/forms-common.js', '../js/contact.js']
};
```

Replace deleted-page content tests with these contracts:

```js
test('only Home and Contact route documents remain', () => {
  Object.values(routes).forEach((file) => assert.equal(fs.existsSync(file), true, file));
  removedRouteNames.forEach((name) => {
    const file = path.join(name, 'index.html');
    assert.equal(fs.existsSync(file), false, file);
  });
});

test('remaining routes expose only valid primary navigation', () => {
  const home = fs.readFileSync(routes.home, 'utf8');
  const contact = fs.readFileSync(routes.contact, 'utf8');
  assert.match(home, /href="#programs"[^>]*>Programs</);
  assert.match(home, /href="#faq"[^>]*>FAQ</);
  assert.match(home, /href="contact\/"[^>]*>Contact</);
  assert.match(contact, /href="\.\.\/#programs"[^>]*>Programs</);
  assert.match(contact, /href="\.\.\/#faq"[^>]*>FAQ</);
  assert.match(contact, /href="\.\.\/contact\/"[^>]*aria-current="page"[^>]*>Contact</);
  for (const html of [home, contact]) {
    assert.doesNotMatch(html, />About</i);
    assert.doesNotMatch(html, />Login</i);
    assert.match(html, /data-camp-signup/);
  }
});

test('active source has no deleted route references', () => {
  const sourceFiles = [
    'index.html', 'contact/index.html', 'js/common.js', 'js/home.js',
    'js/forms-common.js', 'js/contact.js', 'styles.css'
  ];
  const deletedPath = /(?:\.\.\/)?(?:programs|about|faq|login|signup)\//i;
  sourceFiles.forEach((file) => assert.doesNotMatch(fs.readFileSync(file, 'utf8'), deletedPath, file));
});

test('Contact remains a frontend-only demo form', () => {
  const html = fs.readFileSync(routes.contact, 'utf8');
  assert.match(html, /data-demo-form/);
  assert.match(html, /data-form-status[^>]*aria-live="polite"/);
  assert.match(html, /This is a front-end demo/i);
  assert.match(html, /name="message"/);
  assert.doesNotMatch(html, /Account preview/i);
});
```

Retain the script-order, shared-global-scope, stylesheet, and active-page tests, adapting them to the two-entry `routes` object and the Home/Contact labels.

- [ ] **Step 2: Add failing tests for camp signup and homepage action mapping**

In `tests/common.test.js`, import `CAMP_SIGNUP_MESSAGE` and `initCampSignup`, then add:

```js
test('initCampSignup alerts the approved message from every signup action', () => {
  const listeners = [];
  const buttons = [
    { addEventListener(name, handler) { listeners.push([name, handler]); } },
    { addEventListener(name, handler) { listeners.push([name, handler]); } }
  ];
  const alerts = [];
  const documentRef = {
    querySelectorAll(selector) { return selector === '[data-camp-signup]' ? buttons : []; }
  };
  initCampSignup(documentRef, { alert(message) { alerts.push(message); } });
  listeners.forEach(([, handler]) => handler());
  assert.deepEqual(alerts, [CAMP_SIGNUP_MESSAGE, CAMP_SIGNUP_MESSAGE]);
  assert.equal(CAMP_SIGNUP_MESSAGE, 'You’re signed up for camp! We’ll be in touch with next steps.');
});
```

In `tests/homepage.test.js`, add:

```js
test('homepage keeps Programs and FAQ as sections without deleted page links', () => {
  assert.match(html, /href="#programs"[^>]*>Explore programs/);
  assert.match(html, /href="#programs"[^>]*>Programs</);
  assert.match(html, /href="#faq"[^>]*>FAQ</);
  assert.equal((html.match(/data-camp-signup/g) || []).length, 4);
  assert.equal((html.match(/>Sign up for camp\s*</g) || []).length, 3);
  assert.doesNotMatch(html, /See all frequently asked questions/i);
  assert.doesNotMatch(html, /href="(?:programs|about|faq|login|signup)\//i);
});
```

- [ ] **Step 3: Run the focused tests and verify the intended failures**

Run `node --test tests/routes.test.js tests/common.test.js tests/homepage.test.js`.

Expected: failures show the five route documents still exist, deleted route links remain, `initCampSignup` is undefined, and program cards still navigate to `programs/`.

- [ ] **Step 4: Implement the shared camp-signup behavior**

Add this to `js/common.js`:

```js
const CAMP_SIGNUP_MESSAGE = 'You’re signed up for camp! We’ll be in touch with next steps.';

function initCampSignup(documentRef, windowRef) {
  documentRef.querySelectorAll('[data-camp-signup]').forEach((button) => {
    button.addEventListener('click', () => windowRef.alert(CAMP_SIGNUP_MESSAGE));
  });
}
```

Call it from `initCommon`, update navigation’s clickable selector to `a, button[data-camp-signup]`, and export:

```js
const api = { CAMP_SIGNUP_MESSAGE, setMenuState, initNavigation, initReveal, initCampSignup, initCommon };
```

- [ ] **Step 5: Remap Home navigation and actions**

In `index.html`, replace the header navigation with Home, `#programs`, `#faq`, `contact/`, and:

```html
<button class="button button-small" type="button" data-camp-signup>Sign up</button>
```

Replace each program-card link with:

```html
<button type="button" data-camp-signup>Sign up for camp <span aria-hidden="true">→</span></button>
```

Remove the standalone FAQ-page link, change the final “Explore programs” destination to `#programs`, and replace footer navigation with Home, `#programs`, `#faq`, and `contact/` links.

- [ ] **Step 6: Remap Contact navigation and remove the account topic**

In `contact/index.html`, replace header navigation with Home, `../#programs`, `../#faq`, Contact, and:

```html
<button class="button button-small" type="button" data-camp-signup>Sign up</button>
```

Remove `<option>Account preview</option>` and replace footer navigation with Home, `../#programs`, `../#faq`, and `../contact/` links.

- [ ] **Step 7: Delete removed routes, scripts, and standalone FAQ tests**

Delete with the patch tool:

```text
programs/index.html
about/index.html
faq/index.html
login/index.html
signup/index.html
js/programs.js
js/about.js
js/faq.js
js/login.js
js/signup.js
tests/faq.test.js
```

- [ ] **Step 8: Reduce shared form code and tests to Contact-only behavior**

In `js/forms-common.js`, delete password visibility/toggle functions, password-length validation, password-match validation, and account-consent messaging. Export only:

```js
const api = { validateField, validateForm, initDemoForm };
```

In `tests/forms.test.js`, remove Login/Signup imports and password/account tests. Keep required, invalid-email, valid-text, form-validation, and demo-submit tests. Replace the route initializer test with:

```js
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
```

- [ ] **Step 9: Remove styles exclusive to deleted pages**

In `styles.css`:

- Rename `Contact and account forms` to `Contact form`.
- Keep `.contact-details h1` and `.form-card` while removing their grouped Auth selectors.
- Delete password, account-consent, and every `.auth-*`/`.signup-image` rule plus responsive overrides.
- Delete `.nav-login`.
- In the interior-page block, retain `[hidden]`, `.primary-nav`, current-page rules, `.page-main`, and responsive `.site-header`/`.primary-nav` rules used by Home and Contact.
- Delete interior hero, standalone Programs/About/FAQ components, and their responsive overrides.
- Change the homepage program action rule to:

```css
.program-card > a, .program-card > button { position: relative; z-index: 2; display: inline-flex; gap: .8rem; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; font-size: .85rem; font-weight: 800; text-decoration: underline; text-underline-offset: .3rem; }
```

Add to `tests/homepage.test.js`:

```js
test('stylesheet no longer contains deleted page-only components', () => {
  for (const selector of ['.nav-login', '.auth-page', '.interior-hero', '.program-detail', '.faq-search-card']) {
    assert.doesNotMatch(css, new RegExp(selector.replace('.', '\\.')));
  }
});
```

- [ ] **Step 10: Run focused and full automated verification**

Run:

```powershell
node --test tests/routes.test.js tests/common.test.js tests/homepage.test.js tests/forms.test.js
node --test
rg -n "(?:programs|about|faq|login|signup)/" index.html contact js styles.css
git diff --check
```

Expected: all tests pass; `rg` exits 1 with no deleted route-path matches in active source; `git diff --check` exits successfully.

- [ ] **Step 11: Verify both remaining routes visually**

Serve the repository locally and inspect Home and Contact at desktop and mobile widths. Confirm the homepage retains Programs and FAQ, navigation contains no dead destinations, camp signup buttons fit the theme and card layout, Contact retains its form layout without “Account preview,” and mobile navigation works on both routes.

- [ ] **Step 12: Commit the implementation**

```powershell
git add -- index.html contact/index.html styles.css js tests
git add -u -- programs about faq login signup
git commit -m "refactor: simplify site to Home and Contact"
```
