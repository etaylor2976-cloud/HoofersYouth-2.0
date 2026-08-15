# Tong Family Marina Gallery Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first homepage gallery placeholder with the supplied Tong Family Marina photograph while retaining its caption and organic mask.

**Architecture:** Keep the gallery card as the semantic image container and render `TFM-September-2019.jpg` through a clipped pseudo-element, matching the established hero and confidence-photo pattern. Layer the existing caption above the photograph and leave the remaining two placeholders unchanged.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner, headless Chrome

## Global Constraints

- Frontend-only homepage change.
- Use `assets/TFM-September-2019.jpg`.
- Preserve the existing Tong Family Marina caption.
- Do not alter the other two gallery placeholders, page structure, or navigation.

---

### Task 1: Add the Tong Family Marina Gallery Photograph

**Files:**
- Modify: `tests/homepage.test.js`
- Modify: `index.html:113`
- Modify: `styles.css:158-160`

**Interfaces:**
- Consumes: `assets/TFM-September-2019.jpg`, the `.gallery-one` card, and the existing `.placeholder-label` caption component.
- Produces: A masked `.gallery-one` photo card with an accessible description and readable caption.

- [ ] **Step 1: Write the failing regression test**

Add this test after the confidence-section photo test:

```js
test('first gallery card uses the supplied Tong Family Marina photograph', () => {
  assert.match(html, /class="gallery-image gallery-one"[^>]+role="img"[^>]+aria-label="The Tong Family Marina and Hoofer sailing fleet on Lake Mendota"/);
  assert.doesNotMatch(html, /class="image-placeholder gallery-image gallery-one"/);
  assert.match(html, /<small>The Tong Family Marina<\/small>Hoofer's has the second largest inland fleet\./);
  assert.match(css, /\.gallery-one::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-4%[^}]*background:[^}]*url\("assets\/TFM-September-2019\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.gallery-one\s*\{[^}]*display:\s*flex[^}]*overflow:\s*hidden[^}]*isolation:\s*isolate/s);
  assert.match(css, /\.gallery-one \.placeholder-label\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/s);
});
```

Update the remaining-placeholder assertion from `>= 3` to `>= 2`.

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run:

```powershell
node --test tests/homepage.test.js
```

Expected: the new gallery-photo test fails because `.gallery-one` still has placeholder markup and no TFM background rule.

- [ ] **Step 3: Replace the placeholder semantics while preserving the caption**

Change the first gallery card in `index.html` to:

```html
<div class="gallery-image gallery-one" role="img" aria-label="The Tong Family Marina and Hoofer sailing fleet on Lake Mendota" data-reveal><span class="placeholder-label"><small>The Tong Family Marina</small>Hoofer's has the second largest inland fleet.</span></div>
```

- [ ] **Step 4: Add the masked photo and caption layering**

Change the `.gallery-one` rules in `styles.css` to:

```css
.gallery-one { position: relative; display: flex; grid-row: 1 / 3; overflow: hidden; border-radius: 2.5rem 8rem 2.5rem 2.5rem; background-color: #81c6cf; isolation: isolate; }
.gallery-one::before { content: ""; position: absolute; z-index: -1; inset: -4%; background: url("assets/TFM-September-2019.jpg") center / cover no-repeat; }
.gallery-one .placeholder-label { position: relative; z-index: 1; }
```

Keep the existing narrow-width `.gallery-one` border-radius override unchanged.

- [ ] **Step 5: Run focused and full automated verification**

Run:

```powershell
node --test tests/homepage.test.js
node --test
node --check script.js
git diff --check
```

Expected: all commands exit successfully; the full suite reports 24 passing tests.

- [ ] **Step 6: Verify the rendered crop**

Serve the repository locally and inspect the gallery at `1440x1200` and `768x1800`. Confirm the marina image fills the existing cutout, the caption remains readable, the other two cards remain placeholders, and no error overlay appears.

- [ ] **Step 7: Commit the implementation**

```powershell
git add -- index.html styles.css tests/homepage.test.js
git commit -m "feat: add marina gallery photo"
```
