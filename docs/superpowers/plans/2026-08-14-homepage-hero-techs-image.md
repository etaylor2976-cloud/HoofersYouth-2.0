# Homepage Hero Techs Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero placeholder with the supplied `assets/Techs.jpg` photograph while preserving the existing responsive frame and decorative composition.

**Architecture:** Keep the current `.hero-image` element as the framed visual container and place a semantic `<img>` inside it. Absolutely anchor the photograph to the container's four edges so its height resolves against the frame even though the frame uses `min-height`, then crop it with `object-fit: cover`.

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
- Produces: A semantic hero `<img>` with responsive cover cropping inside the existing frame.

- [ ] **Step 1: Write the failing test**

Replace the placeholder-only expectation with a focused hero photograph test:

```js
test('homepage hero uses the supplied Techs photograph', () => {
  assert.match(html, /<img[^>]+class="hero-photo"[^>]+src="assets\/Techs\.jpg"[^>]+alt="Young sailors aboard a Tech sailboat on Lake Mendota"/);
  assert.doesNotMatch(html, /class="image-placeholder hero-image"/);
  assert.match(css, /\.hero-photo\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/s);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/homepage.test.js`

Expected: FAIL because `.hero-photo` is not absolutely anchored to the frame, allowing its percentage height to remain unresolved.

- [ ] **Step 3: Add the semantic photograph**

Replace the top placeholder markup in `index.html` with:

```html
<div class="hero-image">
  <img class="hero-photo" src="assets/Techs.jpg" alt="Young sailors aboard a Tech sailboat on Lake Mendota">
</div>
```

Add this focused rule beside `.hero-image` in `styles.css`:

```css
.hero-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
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

- [ ] **Step 5: Commit the implementation**

```bash
git add -- assets/Techs.jpg index.html styles.css tests/homepage.test.js
git commit -m "feat: add Techs photo to homepage hero"
```
