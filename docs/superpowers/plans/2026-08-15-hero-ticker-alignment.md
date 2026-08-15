# Hero Ticker Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the homepage ticker text horizontally and close the cream-colored gap at the left side of the angled hero/ticker seam.

**Architecture:** Keep the existing rotated ticker and center its oversized text row with a flex container. Pull the ticker upward over the seafoam hero and establish its stacking order so the hero background remains behind the rotated top edge.

**Tech Stack:** Static CSS, Node.js built-in test runner, headless Chrome

## Global Constraints

- Preserve the ticker's navy color, text, star separators, typography, and rotation.
- Do not change the hero image, hero content, ticker copy, or the section below the ticker.
- Apply the same treatment at desktop and narrow viewport widths.
- Preserve existing uncommitted homepage edits.

---

### Task 1: Center and Overlap the Homepage Ticker

**Files:**
- Modify: `tests/homepage.test.js`
- Modify: `styles.css:114-116`

**Interfaces:**
- Consumes: the existing `.hero`, `.ticker`, and `.ticker div` elements.
- Produces: a centered ticker row and an overlapping seafoam-to-navy boundary with no exposed cream gap.

- [ ] **Step 1: Write the failing regression test**

Add this test before the palette/responsive test in `tests/homepage.test.js`:

```js
test('ticker centers its text and overlaps the hero seam', () => {
  assert.match(css, /\.ticker\s*\{[^}]*position:\s*relative[^}]*z-index:\s*2[^}]*display:\s*flex[^}]*justify-content:\s*center[^}]*margin-top:\s*-1\.5rem/s);
  assert.match(css, /\.ticker div\s*\{[^}]*flex:\s*none[^}]*width:\s*max-content/s);
  assert.match(css, /\.ticker\s*\{[^}]*transform:\s*rotate\(-1deg\)\s*scale\(1\.02\)/s);
});
```

- [ ] **Step 2: Run the focused test and verify the intended failure**

Run:

```powershell
node --test tests/homepage.test.js
```

Expected: the new ticker test fails because `.ticker` is not a centered flex container and does not overlap the hero.

- [ ] **Step 3: Implement the centered overlap**

Change the ticker rules in `styles.css` to:

```css
.ticker { position: relative; z-index: 2; display: flex; justify-content: center; overflow: hidden; margin-top: -1.5rem; padding: 1rem 0; background: var(--navy); color: var(--white); font-family: var(--font-display); font-size: clamp(1rem, 1.7vw, 1.45rem); font-weight: 800; letter-spacing: -.03em; text-transform: uppercase; white-space: nowrap; transform: rotate(-1deg) scale(1.02); }
.ticker div { flex: none; width: max-content; }
```

Leave `.ticker span` unchanged.

- [ ] **Step 4: Run focused and full automated verification**

Run:

```powershell
node --test tests/homepage.test.js
node --test
node --check script.js
git diff --check
```

Expected: all commands exit successfully and the full suite reports 25 passing tests.

- [ ] **Step 5: Verify the rendered seam and centering**

Serve the repository locally and inspect the hero/ticker boundary at `1440x1200` and `768x1200`. Confirm the phrase row is horizontally centered, the rotated bar is preserved, the upper-left seam reveals seafoam rather than cream, and the next section is not obscured.

- [ ] **Step 6: Commit only the ticker implementation**

```powershell
git add -- styles.css tests/homepage.test.js
git commit -m "fix: align homepage ticker"
```

Do not stage `index.html`; it contains pre-existing user changes outside this task.
