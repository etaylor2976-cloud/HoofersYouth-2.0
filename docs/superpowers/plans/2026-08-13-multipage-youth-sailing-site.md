# Multipage Youth Sailing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing youth sailing homepage into a seven-route static site with Programs, About, FAQ, Contact, Login, and Sign up pages that share the current visual system.

**Architecture:** Use one `index.html` per route folder, with the root `styles.css` and `script.js` shared by every page. Nested pages reference shared assets using `../`, use real relative folder links for navigation, and initialize only the JavaScript behaviors present on their page.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner

## Global Constraints

- Routes are exactly `/`, `/programs/`, `/about/`, `/faq/`, `/contact/`, `/login/`, and `/signup/`.
- Preserve the existing homepage and the committed Beginner, Advanced, and Windsurfing program names.
- Login, signup, and contact are front-end demonstrations only; no data is sent, persisted, or authenticated.
- Reuse deep navy, seafoam, coral, sunny yellow, organic shapes, Manrope display typography, DM Sans body typography, and accessible image placeholders.
- Every page includes skip navigation, semantic landmarks, logical headings, visible focus states, touch-friendly controls, and reduced-motion support.
- No network requests, browser storage, cookies, authentication tokens, new dependencies, or individual program-detail routes.
- Work directly on `main`, as previously authorized by the user.

---

## File Map

- `index.html` — homepage content and root-relative navigation
- `programs/index.html` — program overview, comparison, session rhythm, preparation, and contact CTA
- `about/index.html` — mission, teaching approach, safety culture, history, and instructor values
- `faq/index.html` — FAQ search, categories, disclosure controls, count, and empty state
- `contact/index.html` — contact information and demo inquiry form
- `login/index.html` — demo login form and signup link
- `signup/index.html` — demo account-creation form and login link
- `styles.css` — shared shell, interior page, FAQ, form, auth, responsive, and state styling
- `script.js` — shared menu, disclosures, filtering, password visibility, validation, and reveal initialization
- `tests/routes.test.js` — route, asset path, navigation, page-content, and page-hook contracts
- `tests/forms.test.js` — pure validation and password-state unit tests
- `tests/interactions.test.js` — existing menu/disclosure tests plus FAQ-filter behavior

### Task 1: Shared Site Shell and Real Navigation

**Files:**
- Modify: `index.html`
- Create: `programs/index.html`
- Create: `about/index.html`
- Create: `faq/index.html`
- Create: `contact/index.html`
- Modify: `login/index.html`
- Modify: `signup/index.html`
- Create: `tests/routes.test.js`

**Interfaces:**
- Consumes: root `styles.css`, root `script.js`, existing `.site-header`, `.primary-nav`, `.site-footer`, and `.brand` classes
- Produces: seven route documents; `#menu-toggle`; `#primary-nav`; `aria-current="page"`; public links `../programs/`, `../about/`, `../faq/`, `../contact/`; account links `../login/`, `../signup/`

- [ ] **Step 1: Write the failing route and navigation tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const routes = {
  home: 'index.html', programs: 'programs/index.html', about: 'about/index.html',
  faq: 'faq/index.html', contact: 'contact/index.html', login: 'login/index.html', signup: 'signup/index.html'
};

test('all seven route documents exist', () => {
  Object.values(routes).forEach((file) => assert.equal(fs.existsSync(file), true, file));
});

test('nested pages load shared root assets and identify the active page', () => {
  Object.entries(routes).filter(([name]) => name !== 'home').forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /href="\.\.\/styles\.css"/);
    assert.match(html, /src="\.\.\/script\.js"/);
    assert.match(html, new RegExp(`aria-current="page"[^>]*>${name === 'signup' ? 'Sign up' : name[0].toUpperCase() + name.slice(1)}`, 'i'));
  });
});

test('every route exposes complete primary navigation', () => {
  Object.values(routes).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    ['Home', 'Programs', 'About', 'FAQ', 'Contact', 'Login', 'Sign up'].forEach((label) => {
      assert.match(html, new RegExp(`>${label}<`, 'i'), `${file}: ${label}`);
    });
  });
});
```

- [ ] **Step 2: Run the route tests and verify failure**

Run: `node --test tests/routes.test.js`

Expected: FAIL because four public route files do not exist and the empty account folders have no documents.

- [ ] **Step 3: Build the shared page shell in all seven documents**

Use this exact nested-page asset and navigation contract; set the matching link's `aria-current="page"` on each page:

```html
<link rel="stylesheet" href="../styles.css">
<header class="site-header" data-header>
  <a class="brand" href="../" aria-label="Hoofers Youth Sailing home">Hoofers <small>Youth Sailing</small></a>
  <button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav"><span>Menu</span><i aria-hidden="true"></i></button>
  <nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">
    <a href="../">Home</a><a href="../programs/">Programs</a><a href="../about/">About</a>
    <a href="../faq/">FAQ</a><a href="../contact/">Contact</a>
    <a class="nav-login" href="../login/">Login</a><a class="button button-small" href="../signup/">Sign up</a>
  </nav>
</header>
<script src="../script.js"></script>
```

Use `styles.css` and `script.js` without `../` on the homepage. Update homepage section links so program cards go to `programs/`, the FAQ heading includes a link to `faq/`, the global public navigation uses folder routes, and the header includes Login and Sign up. Preserve the existing program names and card copy.

- [ ] **Step 4: Run the route and existing homepage tests**

Run: `node --test tests/routes.test.js tests/homepage.test.js`

Expected: all tests PASS.

- [ ] **Step 5: Commit the shared shell**

```bash
git add index.html programs/index.html about/index.html faq/index.html contact/index.html login/index.html signup/index.html tests/routes.test.js
git commit -m "feat: add multipage site shell"
```

### Task 2: Programs, About, and FAQ Content

**Files:**
- Modify: `programs/index.html`
- Modify: `about/index.html`
- Modify: `faq/index.html`
- Modify: `styles.css`
- Modify: `tests/routes.test.js`

**Interfaces:**
- Consumes: the shared shell from Task 1
- Produces: `.interior-hero`, `.program-detail-grid`, `.comparison-grid`, `.story-grid`, `.values-grid`, `#faq-search`, `[data-faq-item]`, `#faq-results`, and `#faq-empty`

- [ ] **Step 1: Add failing content and FAQ-hook tests**

```js
test('programs page covers all three offerings and family decision content', () => {
  const html = fs.readFileSync(routes.programs, 'utf8');
  ['Beginner', 'Advanced', 'Windsurfing', 'Ages 10–18', 'A typical session', 'Choose your program'].forEach((text) => assert.match(html, new RegExp(text, 'i')));
});

test('about page covers mission, safety, history, and instructor values', () => {
  const html = fs.readFileSync(routes.about, 'utf8');
  ['Our mission', 'How we teach', 'Safety', 'Since 1963', 'Patient', 'Prepared', 'Encouraging'].forEach((text) => assert.match(html, new RegExp(text, 'i')));
});

test('faq page exposes searchable categorized disclosures and empty state', () => {
  const html = fs.readFileSync(routes.faq, 'utf8');
  assert.match(html, /id="faq-search"/);
  assert.match(html, /id="faq-results"[^>]*aria-live="polite"/);
  assert.ok((html.match(/data-faq-item/g) || []).length >= 12);
  assert.match(html, /id="faq-empty"[^>]*hidden/);
  ['Eligibility', 'Safety', 'Weather', 'Equipment', 'Registration', 'Account'].forEach((text) => assert.match(html, new RegExp(text, 'i')));
});
```

- [ ] **Step 2: Run the content tests and verify failure**

Run: `node --test tests/routes.test.js`

Expected: FAIL because the shell pages do not yet include complete program, about, or FAQ content.

- [ ] **Step 3: Build the Programs page**

Add an interior hero titled “Find the right way onto the water.” Build three detailed program sections with these contracts:

```html
<article class="program-detail program-beginner"><p>Ages 10–18 · No experience needed</p><h2>Beginner Sailing</h2><ul><li>Boat parts and rigging</li><li>Steering and sail trim</li><li>Capsize confidence</li><li>On-water teamwork</li></ul></article>
<article class="program-detail program-advanced"><p>Ages 10–18 · Prior sailing experience</p><h2>Advanced Sailing</h2><ul><li>Advanced boat handling</li><li>Weather strategy</li><li>Racing fundamentals</li><li>Leadership on the water</li></ul></article>
<article class="program-detail program-windsurfing"><p>Ages 10–18 · Beginner friendly</p><h2>Windsurfing</h2><ul><li>Board balance</li><li>Rig control</li><li>Upwind and downwind travel</li><li>Safe independent practice</li></ul></article>
```

Follow with “A typical session,” a three-column “Choose your program” comparison, preparation notes, and a CTA linking to `../contact/`.

- [ ] **Step 4: Build the About page**

Add an interior hero titled “Growing capable kids on the water.” Include sections named “Our mission,” “How we teach,” “Safety is a daily practice,” and “On Lake Mendota since 1963.” Add two accessible editorial image placeholders and value cards titled Patient, Prepared, and Encouraging. Do not add fictional staff names, certifications, statistics, or awards.

- [ ] **Step 5: Build the FAQ page**

Create a search label and input, result count, six category sections, at least two questions per category, and an empty state. Each question uses this exact hook structure:

```html
<article class="faq-item" data-faq-item data-search-text="does my child need sailing experience beginner eligibility">
  <button data-faq-button type="button" aria-expanded="false" aria-controls="faq-experience"><span>Does my child need sailing experience?</span><i aria-hidden="true"></i></button>
  <div id="faq-experience" class="faq-panel" hidden><p>No. Beginner Sailing and Windsurfing welcome first-time sailors.</p></div>
</article>
```

Include a `<noscript>` message instructing visitors that all answers are available by expanding the questions in a JavaScript-enabled browser, while keeping question headings and category labels visible.

- [ ] **Step 6: Add shared interior-page styling**

Extend `styles.css` with `.page-main`, `.interior-hero`, `.interior-hero-copy`, `.interior-visual`, `.program-detail-grid`, `.program-detail`, `.comparison-grid`, `.story-grid`, `.values-grid`, `.faq-search`, `.faq-category`, `.faq-empty`, and `[hidden]` styles. Use the existing palette, `clamp()` typography, image-placeholder motif, `68rem` tablet breakpoint, and `48rem` stacked mobile breakpoint.

- [ ] **Step 7: Run route and homepage tests**

Run: `node --test tests/routes.test.js tests/homepage.test.js`

Expected: all tests PASS.

- [ ] **Step 8: Commit public content pages**

```bash
git add programs/index.html about/index.html faq/index.html styles.css tests/routes.test.js
git commit -m "feat: add programs about and faq pages"
```

### Task 3: Contact, Login, and Signup Forms

**Files:**
- Modify: `contact/index.html`
- Modify: `login/index.html`
- Modify: `signup/index.html`
- Modify: `styles.css`
- Modify: `tests/routes.test.js`

**Interfaces:**
- Consumes: shared shell and shared form styles
- Produces: forms with `[data-demo-form]`; fields carrying `data-validate`; error nodes named `<field-id>-error`; `[data-form-status]`; password controls carrying `[data-password-toggle]`

- [ ] **Step 1: Add failing route tests for form hooks**

```js
test('contact and account pages expose complete demo-form hooks', () => {
  for (const file of [routes.contact, routes.login, routes.signup]) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /data-demo-form/);
    assert.match(html, /data-form-status[^>]*aria-live="polite"/);
    assert.match(html, /This is a front-end demo/i);
  }
  assert.match(fs.readFileSync(routes.contact, 'utf8'), /name="message"/);
  assert.match(fs.readFileSync(routes.login, 'utf8'), /name="password"/);
  assert.match(fs.readFileSync(routes.signup, 'utf8'), /name="passwordConfirm"/);
});
```

- [ ] **Step 2: Run route tests and verify failure**

Run: `node --test tests/routes.test.js`

Expected: FAIL because the three form pages do not yet expose the required fields and status hooks.

- [ ] **Step 3: Build the Contact page**

Add a split layout titled “Let’s get your questions answered.” Include location “Lake Mendota · Madison, Wisconsin,” general email placeholder `youthsailing@example.org`, and weekday response note. Build fields `name`, `email`, `topic`, and `message`; use `required`, `type="email"`, `data-validate`, and error nodes such as `<p id="email-error" class="field-error"></p>`. Set `data-form-kind="contact"` and success copy “Thanks—your demo inquiry is complete. No message was sent.”

- [ ] **Step 4: Build the Login page**

Add a focused auth layout titled “Welcome back, sailor.” Include email, password, show-password button, remember-me checkbox, a visibly labeled future password-recovery link using `href="../contact/"`, a Sign up route, demo notice, and status region. Set `data-form-kind="login"` and success copy “Demo login complete. No account session was created.”

- [ ] **Step 5: Build the Signup page**

Add a matching layout titled “Create your family account.” Include parent or guardian name, email, password, password confirmation, show-password controls, required terms checkbox, Login route, demo notice, and status region. Use `data-match="password"`, `minlength="8"`, and `data-form-kind="signup"`. Success copy is “Demo signup complete. No account or credentials were stored.”

- [ ] **Step 6: Add form and auth styling**

Extend `styles.css` with `.contact-layout`, `.contact-details`, `.form-card`, `.field`, `.field-row`, `.field-error`, `.form-status`, `.form-status.is-error`, `.form-status.is-success`, `.password-wrap`, `.password-toggle`, `.check-field`, `.auth-page`, `.auth-layout`, `.auth-visual`, `.auth-card`, and `.demo-note`. Error text uses a dark red with sufficient contrast; success uses navy on seafoam. Stack all two-column fields and page splits at `48rem`.

- [ ] **Step 7: Run route and homepage tests**

Run: `node --test tests/routes.test.js tests/homepage.test.js`

Expected: all tests PASS.

- [ ] **Step 8: Commit the form pages**

```bash
git add contact/index.html login/index.html signup/index.html styles.css tests/routes.test.js
git commit -m "feat: add themed contact and account forms"
```

### Task 4: FAQ Filtering and Demo Form Behavior

**Files:**
- Modify: `script.js`
- Modify: `tests/interactions.test.js`
- Create: `tests/forms.test.js`

**Interfaces:**
- Consumes: Task 2 FAQ hooks and Task 3 form hooks
- Produces: `filterFaqItems(items, query) -> number`; `validateField(field, form) -> string`; `validateForm(form) -> { valid: boolean, firstInvalid: HTMLElement|null }`; `setPasswordVisibility(input, button, visible) -> void`; `initFaqFilter(documentRef) -> void`; `initDemoForms(documentRef) -> void`; `initPasswordToggles(documentRef) -> void`

- [ ] **Step 1: Add failing pure validation tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateField, setPasswordVisibility } = require('../script.js');

function field(overrides = {}) {
  return { value: '', checked: false, required: true, type: 'text', dataset: {}, name: 'name', minLength: -1, ...overrides };
}

test('validateField reports required, email, password length, match, and consent errors', () => {
  assert.equal(validateField(field()), 'This field is required.');
  assert.equal(validateField(field({ value: 'wrong', type: 'email', name: 'email' })), 'Enter a valid email address.');
  assert.equal(validateField(field({ value: 'short', type: 'password', minLength: 8, name: 'password' })), 'Use at least 8 characters.');
  const form = { elements: { password: field({ value: 'sailing88' }) } };
  assert.equal(validateField(field({ value: 'different', dataset: { match: 'password' }, name: 'passwordConfirm' }), form), 'Passwords must match.');
  assert.equal(validateField(field({ type: 'checkbox', checked: false, name: 'terms' })), 'Please accept the terms to continue.');
});

test('setPasswordVisibility synchronizes input type and button state', () => {
  const input = { type: 'password' };
  const attrs = new Map();
  const button = { setAttribute(name, value) { attrs.set(name, String(value)); }, textContent: '' };
  setPasswordVisibility(input, button, true);
  assert.equal(input.type, 'text');
  assert.equal(attrs.get('aria-pressed'), 'true');
  assert.equal(button.textContent, 'Hide password');
});
```

Append this failing FAQ-filter test to `tests/interactions.test.js`:

```js
const { filterFaqItems } = require('../script.js');

test('filterFaqItems hides nonmatches and returns the visible count', () => {
  const makeItem = (text) => ({ dataset: { searchText: text }, hidden: false });
  const items = [makeItem('beginner experience eligibility'), makeItem('weather cancellation'), makeItem('life jacket safety')];
  assert.equal(filterFaqItems(items, 'weather'), 1);
  assert.deepEqual(items.map((item) => item.hidden), [true, false, true]);
  assert.equal(filterFaqItems(items, ''), 3);
});
```

- [ ] **Step 2: Run interaction and form tests and verify failure**

Run: `node --test tests/interactions.test.js tests/forms.test.js`

Expected: FAIL because FAQ filtering and form helper functions are not implemented.

- [ ] **Step 3: Implement the pure helper functions**

```js
function filterFaqItems(items, query) {
  const normalized = query.trim().toLowerCase();
  let visible = 0;
  items.forEach((item) => {
    const matches = !normalized || item.dataset.searchText.toLowerCase().includes(normalized);
    item.hidden = !matches;
    if (matches) visible += 1;
  });
  return visible;
}

function setPasswordVisibility(input, button, visible) {
  input.type = visible ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(visible));
  button.textContent = visible ? 'Hide password' : 'Show password';
}
```

Implement `validateField` with this precedence: unchecked required checkbox; blank required value; invalid email; password shorter than `minLength`; mismatched `data-match`; otherwise empty string. Implement `validateForm` by iterating `[data-validate]`, writing each message into the element named by `aria-describedby`, synchronizing `aria-invalid`, and returning the first invalid field.

- [ ] **Step 4: Implement component initializers**

`initFaqFilter(documentRef)` binds `input` on `#faq-search`, calls `filterFaqItems`, writes “Showing N questions” into `#faq-results`, and toggles `#faq-empty` when N is zero. `initPasswordToggles(documentRef)` resolves each button's `aria-controls` input and toggles its visibility. `initDemoForms(documentRef)` prevents submission, runs `validateForm`, focuses `firstInvalid` on failure, and writes the form's `data-success-message` on success without resetting, storing, or sending values.

Call all three from `initHomepage` after existing menu and disclosure setup. Export every pure function needed by the tests.

- [ ] **Step 5: Run all JavaScript tests**

Run: `node --test tests/interactions.test.js tests/forms.test.js`

Expected: all tests PASS.

- [ ] **Step 6: Run the complete test suite**

Run: `node --test tests/*.test.js`

Expected: all tests PASS with zero failures.

- [ ] **Step 7: Commit the behaviors**

```bash
git add script.js tests/interactions.test.js tests/forms.test.js
git commit -m "feat: add faq filtering and demo form behavior"
```

### Task 5: Final Cross-Page Validation

**Files:**
- Modify only when validation exposes a tested defect: `index.html`, `programs/index.html`, `about/index.html`, `faq/index.html`, `contact/index.html`, `login/index.html`, `signup/index.html`, `styles.css`, `script.js`, `tests/*.test.js`

**Interfaces:**
- Consumes: all seven completed routes
- Produces: validated static multipage source on `main`

- [ ] **Step 1: Run the full automated suite**

Run: `node --test tests/*.test.js`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Verify JavaScript syntax**

Run: `node --check script.js`

Expected: exit code 0 with no output.

- [ ] **Step 3: Verify every relative internal target exists**

Run this read-only Node script:

```powershell
node -e "const fs=require('fs'),path=require('path');const pages=['index.html','programs/index.html','about/index.html','faq/index.html','contact/index.html','login/index.html','signup/index.html'];const broken=[];for(const page of pages){const html=fs.readFileSync(page,'utf8');for(const [,href] of html.matchAll(/href=\"([^\"]+)\"/g)){if(/^(https?:|mailto:|#)/.test(href))continue;const clean=href.split('#')[0];let target=path.resolve(path.dirname(page),clean);if(clean.endsWith('/'))target=path.join(target,'index.html');if(!fs.existsSync(target))broken.push(page+' -> '+href);}}if(broken.length){console.error(broken.join('\n'));process.exit(1)}console.log('7 pages checked; 0 broken internal links')"
```

Expected: `7 pages checked; 0 broken internal links`.

- [ ] **Step 4: Audit forbidden scope and incomplete source**

Run: `rg -n "TODO|TBD|lorem ipsum|fetch\(|localStorage|sessionStorage|document\.cookie|href=[\"']#[\"']" index.html programs about faq contact login signup styles.css script.js`

Expected: no matches.

- [ ] **Step 5: Check repository cleanliness and scope**

Run: `git diff --check; git status --short`

Expected: no whitespace errors and only intentional validation fixes, if any.

- [ ] **Step 6: Commit validation fixes if needed**

```bash
git add index.html programs about faq contact login signup styles.css script.js tests
git commit -m "fix: complete multipage site validation"
```

Skip this commit when validation requires no changes.
