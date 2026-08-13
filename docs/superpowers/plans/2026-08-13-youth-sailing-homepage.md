# Youth Sailing Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, accessible youth sailing homepage whose primary action is “Explore programs.”

**Architecture:** Keep the existing dependency-free static structure. `index.html` owns semantic content, `styles.css` owns the complete visual system and responsive layout, and `script.js` adds only mobile navigation, FAQ disclosure state, and progressive reveal behavior.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner

## Global Constraints

- This phase covers only the responsive homepage; supporting pages are deferred.
- Use the approved bold youth-forward direction: deep navy, seafoam, coral, sunny yellow, modern organic shapes, and confident typography.
- Use clearly labeled image placeholders that can be replaced without restructuring the page.
- Primary call to action copy is exactly “Explore programs.”
- Support small phones through wide desktop screens without horizontal scrolling.
- Respect `prefers-reduced-motion` and keep all controls keyboard accessible.

---

### Task 1: Semantic Homepage Content

**Files:**
- Modify: `index.html`
- Create: `tests/homepage.test.js`

**Interfaces:**
- Consumes: none
- Produces: stable IDs `programs`, `why-sailing`, `gallery`, and `faq`; menu controls `#menu-toggle` and `#primary-nav`; FAQ buttons with `data-faq-button`; panels with matching IDs; reveal targets with `data-reveal`

- [ ] **Step 1: Write the failing structure test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

test('homepage contains its core sections and primary action', () => {
  for (const id of ['programs', 'why-sailing', 'gallery', 'faq']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, />Explore programs</);
  assert.match(html, /Your best summer starts here/);
});

test('homepage exposes accessible interactive hooks', () => {
  assert.match(html, /id="menu-toggle"[^>]*aria-expanded="false"/);
  assert.match(html, /id="primary-nav"/);
  assert.match(html, /data-faq-button/);
  assert.match(html, /aria-controls=/);
});
```

- [ ] **Step 2: Run the structure test and verify failure**

Run: `node --test tests/homepage.test.js`

Expected: FAIL because the blank homepage contains none of the required sections.

- [ ] **Step 3: Implement the complete semantic page**

Build `index.html` with this exact section order and contract:

```html
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="#top" aria-label="Hoofers Youth Sailing home">Hoofers <span>Youth Sailing</span></a>
    <button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>
    <nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">
      <a href="#programs">Programs</a><a href="#why-sailing">Why sailing</a><a href="#faq">Families</a>
      <a class="button button-small" href="#programs">Explore programs</a>
    </nav>
  </header>
  <main id="main-content">
    <section id="top" class="hero" aria-labelledby="hero-title">
      <div><p class="eyebrow">Sail. Grow. Belong.</p><h1 id="hero-title">Your best summer starts here.</h1><p>Build confidence, independence, and friendships on the water.</p><a class="button" href="#programs">Explore programs</a></div>
      <div class="image-placeholder hero-image" role="img" aria-label="Placeholder for young sailors working together on Lake Mendota">Youth sailing photo</div>
    </section>
    <section id="programs" class="section programs" aria-labelledby="programs-title">
      <h2 id="programs-title">A place for every young sailor</h2>
      <article><h3>Discover</h3><p>Ages 8–10 · First-time sailors</p></article><article><h3>Develop</h3><p>Ages 11–13 · Growing skills</p></article><article><h3>Lead</h3><p>Ages 14–17 · Advanced and racing</p></article>
    </section>
    <section id="why-sailing" class="section confidence" aria-labelledby="confidence-title"><h2 id="confidence-title">Confidence comes with every tack</h2><ul><li>Safety first</li><li>Qualified instruction</li><li>Teamwork</li><li>Skill growth</li></ul></section>
    <section id="gallery" class="section gallery" aria-labelledby="gallery-title"><h2 id="gallery-title">Life on the lake</h2><div class="image-placeholder" role="img" aria-label="Placeholder for a beginner sailor learning boat controls">Learning the ropes</div><div class="image-placeholder" role="img" aria-label="Placeholder for a youth sailing crew laughing together">Finding your crew</div><div class="image-placeholder" role="img" aria-label="Placeholder for sailboats racing across Lake Mendota">Chasing the wind</div></section>
    <section class="section testimonial" aria-label="Parent testimonial"><blockquote>“Our sailor came home more confident every single week.”</blockquote><p>— Parent of a Junior Crew sailor</p></section>
    <section id="faq" class="section faq" aria-labelledby="faq-title"><h2 id="faq-title">Good to know before you go</h2><button data-faq-button aria-expanded="false" aria-controls="faq-experience">Does my child need sailing experience?</button><div id="faq-experience" hidden>No. Discover programs are designed for first-time sailors.</div><button data-faq-button aria-expanded="false" aria-controls="faq-safety">How do you keep sailors safe?</button><div id="faq-safety" hidden>Life jackets, trained instructors, and weather-aware plans are standard.</div><button data-faq-button aria-expanded="false" aria-controls="faq-bring">What should sailors bring?</button><div id="faq-bring" hidden>Bring sun protection, a water bottle, secure footwear, and clothes that can get wet.</div></section>
    <section class="final-cta" aria-labelledby="cta-title"><h2 id="cta-title">Ready to find their crew?</h2><a class="button" href="#programs">Explore programs</a></section>
  </main>
  <footer class="site-footer"><p><strong>Hoofers Youth Sailing</strong><br>Lake Mendota · Madison, Wisconsin</p><nav aria-label="Footer navigation"><a href="#programs">Programs</a><a href="#why-sailing">Why sailing</a><a href="#faq">Families</a></nav></footer>
  <script src="script.js"></script>
</body>
```

Use realistic family-facing copy throughout. Give each placeholder `role="img"` and an `aria-label` describing the intended future photo.

- [ ] **Step 4: Run the structure test and verify success**

Run: `node --test tests/homepage.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the semantic page**

```bash
git add index.html tests/homepage.test.js
git commit -m "feat: add youth sailing homepage content"
```

### Task 2: Bold Youth-Forward Visual System

**Files:**
- Modify: `styles.css`
- Modify: `tests/homepage.test.js`

**Interfaces:**
- Consumes: class names and section IDs created in Task 1
- Produces: responsive layouts at `48rem` and `68rem`, visible focus treatment, placeholder compositions, reveal states `.reveal-ready` and `.is-visible`

- [ ] **Step 1: Add a failing stylesheet contract test**

```js
const css = fs.readFileSync('styles.css', 'utf8');

test('stylesheet defines the approved palette and responsive safeguards', () => {
  for (const token of ['--navy', '--seafoam', '--coral', '--sunny']) assert.match(css, new RegExp(token));
  assert.match(css, /@media\s*\(max-width:\s*48rem\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /overflow-x:\s*clip/);
});
```

- [ ] **Step 2: Run the test and verify the visual contract fails**

Run: `node --test tests/homepage.test.js`

Expected: FAIL because `styles.css` is empty.

- [ ] **Step 3: Implement the responsive visual system**

Define the exact palette and base tokens, then style every class created in Task 1:

```css
:root {
  --navy: #0b3558;
  --navy-deep: #082943;
  --seafoam: #dff4ed;
  --ocean: #197f8f;
  --coral: #ef6f5b;
  --sunny: #f5bd4f;
  --cream: #fffaf0;
  --ink: #102d3e;
  --white: #ffffff;
  --radius-lg: 2rem;
  --shadow: 0 1.25rem 3rem rgba(11, 53, 88, 0.14);
}

html { scroll-behavior: smooth; }
body { margin: 0; overflow-x: clip; background: var(--cream); color: var(--ink); }
*:focus-visible { outline: 3px solid var(--coral); outline-offset: 4px; }
```

Use a sticky navy-on-cream header; a two-column hero with organic CSS shapes; three program cards with distinct but coordinated accents; alternating confidence content; an asymmetric placeholder gallery; a navy testimonial band; compact FAQ rows; and a high-energy coral/seafoam final CTA. Use `clamp()` for major type and spacing. At `max-width: 68rem`, simplify grids; at `max-width: 48rem`, stack the hero and cards, collapse navigation, and preserve 44px touch targets. Hide motion and force visible content inside the reduced-motion query.

- [ ] **Step 4: Run the contract test and verify success**

Run: `node --test tests/homepage.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the visual system**

```bash
git add styles.css tests/homepage.test.js
git commit -m "feat: style bold youth sailing homepage"
```

### Task 3: Accessible Menu, FAQ, and Progressive Reveal

**Files:**
- Modify: `script.js`
- Create: `tests/interactions.test.js`

**Interfaces:**
- Consumes: `#menu-toggle`, `#primary-nav`, `[data-faq-button]`, matching FAQ panels, and `[data-reveal]`
- Produces: `setMenuState(toggle, nav, expanded)`, `setFaqState(button, panel, expanded)`, and `initHomepage(documentRef, windowRef)`

- [ ] **Step 1: Write failing unit tests for state helpers**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { setMenuState, setFaqState } = require('../script.js');

function fakeElement() {
  const attrs = new Map();
  return {
    hidden: false,
    classList: { values: new Set(), toggle(name, on) { on ? this.values.add(name) : this.values.delete(name); } },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name); }
  };
}

test('setMenuState synchronizes aria and open class', () => {
  const toggle = fakeElement(); const nav = fakeElement();
  setMenuState(toggle, nav, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(nav.classList.values.has('is-open'), true);
});

test('setFaqState synchronizes aria and panel visibility', () => {
  const button = fakeElement(); const panel = fakeElement();
  setFaqState(button, panel, false);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.hidden, true);
});
```

- [ ] **Step 2: Run the interaction tests and verify failure**

Run: `node --test tests/interactions.test.js`

Expected: FAIL because the exported state helpers do not exist.

- [ ] **Step 3: Implement behavior with dependency-free helpers**

```js
function setMenuState(toggle, nav, expanded) {
  toggle.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
}

function setFaqState(button, panel, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
}

function initHomepage(documentRef = document, windowRef = window) {
  const toggle = documentRef.querySelector('#menu-toggle');
  const nav = documentRef.querySelector('#primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => setMenuState(toggle, nav, toggle.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuState(toggle, nav, false)));
  }
  documentRef.querySelectorAll('[data-faq-button]').forEach((button) => {
    const panel = documentRef.getElementById(button.getAttribute('aria-controls'));
    if (panel) button.addEventListener('click', () => setFaqState(button, panel, button.getAttribute('aria-expanded') !== 'true'));
  });
  const revealItems = [...documentRef.querySelectorAll('[data-reveal]')];
  if (windowRef.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in windowRef)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    documentRef.documentElement.classList.add('reveal-ready');
    const observer = new windowRef.IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initHomepage());
}
if (typeof module !== 'undefined') module.exports = { setMenuState, setFaqState, initHomepage };
```

Inside `initHomepage`, guard every optional element, use `matchMedia('(prefers-reduced-motion: reduce)')`, and fall back to immediately adding `is-visible` when `IntersectionObserver` is unavailable.

- [ ] **Step 4: Run all tests and verify success**

Run: `node --test tests/*.test.js`

Expected: all tests PASS.

- [ ] **Step 5: Commit the interactions**

```bash
git add script.js tests/interactions.test.js
git commit -m "feat: add accessible homepage interactions"
```

### Task 4: Final Validation and Scope Check

**Files:**
- Modify only if validation exposes a defect: `index.html`, `styles.css`, `script.js`, `tests/*.test.js`

**Interfaces:**
- Consumes: complete homepage from Tasks 1–3
- Produces: a validated homepage with no supporting-page implementation

- [ ] **Step 1: Run the complete automated suite**

Run: `node --test tests/*.test.js`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Check JavaScript syntax independently**

Run: `node --check script.js`

Expected: no output and exit code 0.

- [ ] **Step 3: Run a focused source audit**

Run: `rg -n "TODO|TBD|href=[\"']#?[\"']|lorem ipsum|overflow-x:\s*auto" index.html styles.css script.js`

Expected: no matches.

- [ ] **Step 4: Confirm repository scope**

Run: `git status --short`

Expected: only intentional homepage, test, and plan changes; no program-detail or supporting-page implementation.

- [ ] **Step 5: Commit any validation fixes**

```bash
git add index.html styles.css script.js tests
git commit -m "fix: complete homepage validation"
```

Skip this commit when validation requires no changes.
