# Confidence Section Youth Sailing Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the confidence-section placeholder with `assets/Youth_Sailing1.jpg` while preserving the organic frame and surrounding composition.

**Architecture:** Keep `.confidence-image` as the semantic organic cutout and render the photograph on an absolutely positioned `::before` layer extending 6% beyond every edge. Remove the generic placeholder class and content so the cutout's hidden overflow and irregular border radius cleanly mask the oversized photo.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner, headless Chrome

## Global Constraints

- Preserve the confidence-section layout, organic cutout, white border, rotation, shadow, and “Small crews. Big growth.” note.
- Use `assets/Youth_Sailing1.jpg` with centered cover cropping.
- Remove only the confidence placeholder graphics; keep all other placeholders unchanged.
- Do not add dependencies or change site interactions.

---

### Task 1: Add the Masked Confidence Photograph

**Files:**
- Modify: `tests/homepage.test.js`
- Modify: `index.html`
- Modify: `styles.css`
- Use: `assets/Youth_Sailing1.jpg`

**Interfaces:**
- Consumes: The existing `.confidence-image` cutout and `assets/Youth_Sailing1.jpg`.
- Produces: An accessible confidence-section image masked by the existing organic frame.

- [ ] **Step 1: Write the failing regression test**

Add this focused test to `tests/homepage.test.js`:

```js
test('confidence section uses the supplied Youth Sailing photograph', () => {
  assert.match(html, /class="confidence-image"[^>]+role="img"[^>]+aria-label="Young sailors learning together around a sailboat"/);
  assert.doesNotMatch(html, /class="image-placeholder confidence-image"/);
  assert.match(css, /\.confidence-image::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-6%[^}]*background:[^}]*url\("assets\/Youth_Sailing1\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.confidence-image\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/homepage.test.js`

Expected: FAIL because the confidence cutout still contains placeholder markup and no Youth Sailing background layer exists.

- [ ] **Step 3: Implement the semantic masked photograph**

Replace the confidence placeholder in `index.html` with:

```html
<div class="confidence-image" role="img" aria-label="Young sailors learning together around a sailboat"></div>
```

Update the `.confidence-image` rule to preserve its frame while adding `overflow: hidden` and removing placeholder-only alignment and padding. Add the image layer:

```css
.confidence-image { position: absolute; inset: 0; overflow: hidden; border: .6rem solid var(--white); border-radius: 45% 55% 47% 53% / 58% 44% 56% 42%; background-color: #79bdc6; transform: rotate(-2deg); }
.confidence-image::before { content: ""; position: absolute; inset: -6%; background: url("assets/Youth_Sailing1.jpg") center / cover no-repeat; }
```

- [ ] **Step 4: Verify the implementation**

Run: `node --test tests/homepage.test.js`

Expected: All homepage tests pass.

Run: `node --test tests/*.test.js`

Expected: All site tests pass with zero failures.

Run: `node --check script.js`

Expected: Exit code 0.

Run: `git diff --check`

Expected: Exit code 0 and no whitespace errors.

Render the homepage in Chrome at `1440x1200` and `768x1800`.

Expected: The photograph fills the complete confidence cutout at both widths, remains masked by the organic border, and does not obscure the note or section copy.

- [ ] **Step 5: Commit the implementation**

```bash
git add -- index.html styles.css tests/homepage.test.js
git commit -m "feat: add confidence section sailing photo"
```
