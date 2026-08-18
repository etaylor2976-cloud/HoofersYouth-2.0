# Keelboat Gallery Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the yellow second homepage gallery placeholder with the supplied keelboat photograph while preserving its caption and rounded mask.

**Architecture:** Keep `.gallery-two` as the semantic image container and render `assets/keelboat.jpg` through a clipped pseudo-element, following the existing `.gallery-one` pattern. Layer the unchanged caption component above the photograph and add a subtle bottom gradient without altering the remaining gallery card.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner, local browser preview

**Spec:** `docs/superpowers/specs/2026-08-18-keelboat-gallery-image-design.md`

## Global Constraints

- Frontend-only homepage change on `main`.
- Use `assets/keelboat.jpg`.
- Preserve the existing `<small>Photo placeholder</small>Finding your crew` caption markup and styling unchanged.
- Preserve the card's rounded mask, border, shadow, responsive layout, and reveal behavior.
- Do not alter the first or third gallery cards.
- Do not deploy the site.

---

### Task 1: Add the Keelboat Gallery Photograph

**Files:**
- Add: `assets/keelboat.jpg`
- Modify: `tests/homepage.test.js`
- Modify: `index.html:115`
- Modify: `styles.css:162`

**Interfaces:**
- Consumes: `assets/keelboat.jpg`, the `.gallery-two` card, and the existing `.placeholder-label` caption component.
- Produces: A masked `.gallery-two` photo card with an accurate accessible description and unchanged visible caption.

- [ ] **Step 1: Write the failing regression test**

Add this test after the first-gallery-card photograph test:

```js
test('second gallery card uses the supplied keelboat photograph', () => {
  assert.match(html, /class="gallery-image gallery-two"[^>]+role="img"[^>]+aria-label="Youth sailors aboard a keelboat at sunset on Lake Mendota"/);
  assert.doesNotMatch(html, /class="image-placeholder gallery-image gallery-two"/);
  assert.match(html, /<small>Photo placeholder<\/small>Finding your crew<\/span>/);
  assert.match(css, /\.gallery-two::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*url\("assets\/keelboat\.jpg"\)[^}]*center\s*\/\s*cover/s);
  assert.match(css, /\.gallery-two::after\s*\{[^}]*content:\s*""[^}]*linear-gradient\([^}]*transparent[^}]*rgba\(0,0,0,\.24\)/s);
  assert.match(css, /\.gallery-two\s*\{[^}]*position:\s*relative[^}]*display:\s*flex[^}]*overflow:\s*hidden[^}]*isolation:\s*isolate/s);
  assert.match(css, /\.gallery-two \.placeholder-label\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/s);
});
```

Update the general placeholder-count assertion from `>= 2` to `>= 1` because only the third gallery card remains a placeholder.

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run:

```powershell
node --test tests/homepage.test.js
```

Expected: the new keelboat test fails because `.gallery-two` still has placeholder markup, placeholder accessibility text, and no keelboat background rule.

- [ ] **Step 3: Replace the placeholder semantics while preserving the caption**

Change the second gallery card in `index.html` to:

```html
<div class="gallery-image gallery-two" role="img" aria-label="Youth sailors aboard a keelboat at sunset on Lake Mendota" data-reveal><span class="placeholder-label"><small>Photo placeholder</small>Finding your crew</span></div>
```

- [ ] **Step 4: Add the masked photograph, subtle gradient, and caption layering**

Replace the `.gallery-two` rule in `styles.css` with:

```css
.gallery-two { position: relative; display: flex; overflow: hidden; border-radius: 6rem 2.5rem 2.5rem 2.5rem; background-color: var(--sunny); isolation: isolate; }
.gallery-two::before { content: ""; position: absolute; z-index: -2; inset: 0; background: url("assets/keelboat.jpg") center / cover no-repeat; }
.gallery-two::after { content: ""; position: absolute; z-index: -1; inset: 45% 0 0; background: linear-gradient(to bottom, transparent, rgba(0,0,0,.24)); }
.gallery-two .placeholder-label { position: relative; z-index: 1; }
```

The existing `.gallery-image` rule continues to provide alignment, padding, border, and shadow. No caption CSS is changed.

- [ ] **Step 5: Run focused and full automated verification**

Run:

```powershell
node --test tests/homepage.test.js
node --test
git diff --check
```

Expected: all commands exit successfully and the full test suite reports no failures.

- [ ] **Step 6: Verify the rendered crop**

Serve the repository locally and inspect the gallery at desktop and narrow viewport widths. Confirm the photograph fills the rounded card, the sailors and keelboat remain recognizable, the caption format is unchanged and readable, the first gallery card remains intact, and the third card remains a placeholder.

- [ ] **Step 7: Commit the implementation**

```powershell
git add -- assets/keelboat.jpg index.html styles.css tests/homepage.test.js
git commit -m "feat: add keelboat gallery photo"
```
