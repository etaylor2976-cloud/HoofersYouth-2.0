# CTA Sail Position Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anchor the yellow sail to the left side of the white mast in the homepage final CTA illustration.

**Architecture:** Keep the existing CSS illustration and add an explicit horizontal anchor only to the yellow `::before` sail. Preserve the shared sail geometry, coral right sail, mast, hull, rotation, and responsive scale.

**Tech Stack:** Static CSS, Node.js built-in test runner, headless Chrome

## Global Constraints

- Reposition only the yellow `.cta-sail::before` triangle.
- Preserve its existing size, color, and triangular shape.
- Keep the coral sail on the right side of the mast.
- Do not change the mast, hull, illustration rotation, final CTA layout, or responsive scaling.
- Preserve existing uncommitted homepage edits.

---

### Task 1: Anchor the Yellow Sail Left of the Mast

**Files:**
- Modify: `tests/homepage.test.js`
- Modify: `styles.css:196-199`

**Interfaces:**
- Consumes: `.cta-sail::before` as the yellow sail, `.cta-sail span` as the mast, and `.cta-sail::after` as the coral sail.
- Produces: A stable left-yellow/right-coral sail arrangement at every responsive scale.

- [ ] **Step 1: Write the failing regression test**

Add this test before the palette/responsive test in `tests/homepage.test.js`:

```js
test('final CTA positions the yellow sail left of the mast', () => {
  assert.match(css, /\.cta-sail::before\s*\{[^}]*left:\s*0/s);
  assert.match(css, /\.cta-sail span\s*\{[^}]*right:\s*50%/s);
  assert.match(css, /\.cta-sail::after\s*\{[^}]*right:\s*0[^}]*background:\s*var\(--coral\)/s);
});
```

- [ ] **Step 2: Run the focused test and verify the intended failure**

Run:

```powershell
node --test tests/homepage.test.js
```

Expected: the new test fails because the yellow `::before` sail has no explicit left anchor.

- [ ] **Step 3: Anchor the yellow sail**

Add this rule immediately after the shared sail rule in `styles.css`:

```css
.cta-sail::before { left: 0; }
```

Leave the existing `.cta-sail::after`, mast, hull, base transform, and narrow-width transform unchanged.

- [ ] **Step 4: Run focused and full automated verification**

Run:

```powershell
node --test tests/homepage.test.js
node --test
node --check script.js
git diff --check
```

Expected: all commands exit successfully and the full suite reports 26 passing tests.

- [ ] **Step 5: Verify the rendered illustration**

Serve the repository locally and inspect the final CTA at `1440x900` and `768x1000`. Confirm the yellow sail is fully left of the white mast, the coral sail remains right of it, neither sail is clipped, and responsive scaling is unchanged.

- [ ] **Step 6: Commit only the sail-position implementation**

```powershell
git add -- styles.css tests/homepage.test.js
git commit -m "fix: position CTA mainsail"
```

Do not stage `index.html`; it contains a pre-existing user change outside this task.
