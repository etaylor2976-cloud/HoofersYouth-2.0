# Homepage Hero Techs Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero placeholder with the supplied `assets/Techs.jpg` photograph while preserving the existing responsive frame and decorative composition.

**Architecture:** Keep `.hero-image` as the semantic organic cutout and paint `assets/Techs.jpg` on an absolutely positioned `::before` layer extending 6% beyond every edge. Set the layer's focal position to `60% center` so the image shifts left and the foreground sailors sit closer to the cutout's center.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner

## Global Constraints

- Preserve the existing hero layout, white frame, shadow, sun, sticker, and wave decorations.
- Change only the top homepage placeholder; all other image placeholders remain unchanged.
- Use `assets/Techs.jpg` and meaningful alternative text.
- Do not add dependencies or change site interactions.

---

### Task 1: Replace the Homepage Hero Placeholder

**Files:**
- Modify: `tests/homepage.test.js`
- Modify: `index.html`
- Modify: `styles.css`
- Use: `assets/Techs.jpg`

**Interfaces:**
- Consumes: The existing `.hero-image` framed container and `assets/Techs.jpg` image asset.
- Produces: An accessible masked cutout with an oversized background layer and responsive cover cropping.

- [ ] **Step 1: Write the failing test**

Replace the placeholder-only expectation with a focused hero photograph test:

```js
test('homepage hero uses the supplied Techs photograph', () => {
  assert.match(html, /class="hero-image"[^>]+role="img"[^>]+aria-label="Young sailors aboard Tech sailboats on Lake Mendota"/);
  assert.doesNotMatch(html, /class="hero-photo"/);
  assert.match(css, /\.hero-image::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-6%[^}]*background:[^}]*url\("assets\/Techs\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.hero-image::before\s*\{[^}]*background-position:\s*60%\s+center/s);
  assert.match(css, /\.hero-image\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/homepage.test.js`

Expected: FAIL because the masked background layer still uses its centered default crop rather than the approved `60% center` focal position.

- [ ] **Step 3: Add the semantic photograph**

Replace the nested image markup in `index.html` with:

```html
<div class="hero-image" role="img" aria-label="Young sailors aboard Tech sailboats on Lake Mendota"></div>
```

Replace `.hero-photo` with this focused layer beside `.hero-image` in `styles.css`:

```css
.hero-image::before { content: ""; position: absolute; inset: -6%; background: url("assets/Techs.jpg") center / cover no-repeat; }
```

Add the focal-position declaration to that rule:

```css
background-position: 60% center;
```

- [ ] **Step 4: Run verification**

Run: `node --test tests/homepage.test.js`

Expected: All homepage tests pass.

Run: `node --test tests/*.test.js`

Expected: All site tests pass with zero failures.

Run: `node --check script.js`

Expected: Exit code 0.

Run: `git diff --check`

Expected: Exit code 0 and no whitespace errors.

Render the homepage in Chrome at `1440x1000` and `768x1200`.

Expected: The photograph fills and is clipped by the complete organic cutout at both sizes, with the foreground sailors closer to the cutout's horizontal center.

- [ ] **Step 5: Commit the implementation**

```bash
git add -- assets/Techs.jpg index.html styles.css tests/homepage.test.js
git commit -m "feat: add Techs photo to homepage hero"
```
