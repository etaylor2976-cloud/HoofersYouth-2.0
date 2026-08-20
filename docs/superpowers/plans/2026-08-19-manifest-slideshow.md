# Manifest-Driven Homepage Slideshow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage gallery mosaic with a manual, accessible slideshow generated from every supported image in `assets/slideshow/`.

**Architecture:** A dependency-free Node generator scans the slideshow folder and writes a deterministic classic-script manifest. The existing Home entry script consumes that global manifest, builds the slides, and owns manual navigation, while the HTML supplies a stable accessible shell and the shared stylesheet preserves the current visual language.

**Tech Stack:** Static HTML, CSS, classic browser JavaScript, Node.js CommonJS scripts, `node:test`, and PowerShell file-copy commands.

**Spec:** `docs/superpowers/specs/2026-08-19-manifest-slideshow-design.md`

## Global Constraints

- Keep the site frontend-only with no backend or hosting-specific directory listing.
- Read slideshow content only from `assets/slideshow/`.
- Support `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif` case-insensitively.
- Sort by filename; numeric prefixes such as `01-` control display order.
- Do not autoplay.
- Preserve manual previous, next, indicator, and left/right keyboard navigation with wraparound.
- Treat a missing or malformed manifest as empty; hide navigation for zero or one image.
- Preserve the seafoam section, white organic frame, navy typography, coral controls, responsive layout, and reduced-motion behavior.
- Preserve the existing Home and Contact route architecture and unrelated working-tree changes.

---

## File Structure

- Create `scripts/generate-slideshow-manifest.js`: scan, normalize, render, write, and check the generated manifest.
- Create `tests/slideshow-manifest.test.js`: generator behavior and committed-manifest freshness.
- Create `assets/slideshow/`: authoritative slideshow image directory.
- Create `js/slideshow-manifest.js`: generated classic script exposing `globalThis.HoofersSlideshowImages`.
- Create `README.md`: image-drop and manifest-refresh instructions.
- Modify `index.html`: replace the mosaic with the slideshow shell and load the manifest before `js/home.js`.
- Modify `js/home.js`: normalize image data, build slides, and initialize manual controls.
- Modify `styles.css`: replace mosaic selectors with slideshow presentation and responsive controls.
- Modify `tests/homepage.test.js`: assert the slideshow contract and removal of hard-coded gallery cards.
- Modify `tests/interactions.test.js`: exercise slideshow state, controls, keyboard wraparound, and zero/one-image modes.
- Modify `tests/routes.test.js`: update the exact Home script-order contract.

---

### Task 1: Build the deterministic manifest generator

**Files:**
- Create: `scripts/generate-slideshow-manifest.js`
- Create: `tests/slideshow-manifest.test.js`

**Interfaces:**
- Consumes: a filesystem directory and public base path.
- Produces: `titleFromFilename(fileName) -> string`, `scanImages(imageDir, publicBase) -> Array<{src,title,alt}>`, `renderManifest(images) -> string`, and `generateManifest(options) -> {changed,current,content}`.

- [ ] **Step 1: Write failing generator unit tests**

Create `tests/slideshow-manifest.test.js` with temporary directories and literal expectations:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  titleFromFilename,
  scanImages,
  renderManifest,
  generateManifest
} = require('../scripts/generate-slideshow-manifest.js');

test('titleFromFilename removes ordering prefixes and humanizes filenames', () => {
  assert.equal(titleFromFilename('01-tong-family-marina.jpg'), 'Tong Family Marina');
  assert.equal(titleFromFilename('12_windsurfing-fun.WEBP'), 'Windsurfing Fun');
});

test('scanImages filters supported files and sorts them by filename', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hoofers-slides-'));
  for (const name of ['03-zests.jpg', 'notes.txt', '01-marina.PNG', '02-keelboat.webp']) {
    fs.writeFileSync(path.join(dir, name), 'fixture');
  }
  fs.mkdirSync(path.join(dir, 'nested'));

  assert.deepEqual(scanImages(dir, 'assets/slideshow'), [
    { src: 'assets/slideshow/01-marina.PNG', title: 'Marina', alt: 'Youth sailing: Marina' },
    { src: 'assets/slideshow/02-keelboat.webp', title: 'Keelboat', alt: 'Youth sailing: Keelboat' },
    { src: 'assets/slideshow/03-zests.jpg', title: 'Zests', alt: 'Youth sailing: Zests' }
  ]);
});

test('generateManifest check mode detects stale output without overwriting it', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hoofers-manifest-'));
  const outputFile = path.join(dir, 'manifest.js');
  fs.writeFileSync(path.join(dir, '01-lake.jpg'), 'fixture');
  fs.writeFileSync(outputFile, 'stale');

  const result = generateManifest({ imageDir: dir, publicBase: 'assets/slideshow', outputFile, check: true });

  assert.equal(result.current, false);
  assert.equal(fs.readFileSync(outputFile, 'utf8'), 'stale');
  assert.match(result.content, /globalThis\.HoofersSlideshowImages/);
});
```

- [ ] **Step 2: Run the generator tests and verify RED**

Run: `node --test tests/slideshow-manifest.test.js`

Expected: FAIL because `scripts/generate-slideshow-manifest.js` does not exist.

- [ ] **Step 3: Implement the generator**

Create `scripts/generate-slideshow-manifest.js` with:

```js
const fs = require('node:fs');
const path = require('node:path');

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function titleFromFilename(fileName) {
  return path.basename(fileName, path.extname(fileName))
    .replace(/^\d+[\s_-]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function scanImages(imageDir, publicBase = 'assets/slideshow') {
  if (!fs.existsSync(imageDir)) return [];
  return fs.readdirSync(imageDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'base', numeric: true }))
    .map((name) => {
      const title = titleFromFilename(name);
      return { src: `${publicBase}/${name}`, title, alt: `Youth sailing: ${title}` };
    });
}

function renderManifest(images) {
  return `(() => {\n  globalThis.HoofersSlideshowImages = ${JSON.stringify(images, null, 2)};\n})();\n`;
}

function generateManifest({
  imageDir = path.resolve('assets/slideshow'),
  publicBase = 'assets/slideshow',
  outputFile = path.resolve('js/slideshow-manifest.js'),
  check = false
} = {}) {
  const content = renderManifest(scanImages(imageDir, publicBase));
  const current = fs.existsSync(outputFile) && fs.readFileSync(outputFile, 'utf8') === content;
  if (!check && !current) fs.writeFileSync(outputFile, content);
  return { changed: !current && !check, current, content };
}

if (require.main === module) {
  const check = process.argv.includes('--check');
  const result = generateManifest({ check });
  if (check && !result.current) {
    console.error('Slideshow manifest is out of date. Run node scripts/generate-slideshow-manifest.js');
    process.exitCode = 1;
  }
}

module.exports = { SUPPORTED_EXTENSIONS, titleFromFilename, scanImages, renderManifest, generateManifest };
```

- [ ] **Step 4: Run the generator tests and verify GREEN**

Run: `node --test tests/slideshow-manifest.test.js`

Expected: all three tests PASS with no warnings.

- [ ] **Step 5: Commit the generator slice**

```text
git add scripts/generate-slideshow-manifest.js tests/slideshow-manifest.test.js
git commit -m "feat: add slideshow manifest generator"
```

---

### Task 2: Seed the slideshow folder and enforce manifest freshness

**Files:**
- Create: `assets/slideshow/01-the-tong-family-marina.jpg`
- Create: `assets/slideshow/02-keelboat.jpg`
- Create: `assets/slideshow/03-zests.jpg`
- Create: `js/slideshow-manifest.js`
- Create: `README.md`
- Modify: `tests/slideshow-manifest.test.js`
- Modify: `tests/routes.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 1's `scanImages`, `renderManifest`, and generator CLI.
- Produces: `globalThis.HoofersSlideshowImages` before `js/home.js` executes.

- [ ] **Step 1: Add failing freshness and route-order tests**

Append to `tests/slideshow-manifest.test.js`:

```js
test('committed slideshow manifest matches the image directory', () => {
  const expected = renderManifest(scanImages('assets/slideshow', 'assets/slideshow'));
  assert.equal(fs.readFileSync('js/slideshow-manifest.js', 'utf8'), expected);
});
```

Change Home in `tests/routes.test.js`:

```js
home: ['js/common.js', 'js/slideshow-manifest.js', 'js/home.js'],
```

- [ ] **Step 2: Run the affected tests and verify RED**

Run: `node --test tests/slideshow-manifest.test.js tests/routes.test.js`

Expected: FAIL because the image directory, generated manifest, and Home script tag are absent.

- [ ] **Step 3: Seed the authoritative image directory**

Run these PowerShell commands from the repository root:

```powershell
New-Item -ItemType Directory -Path assets\slideshow -Force
Copy-Item -LiteralPath assets\TFM-September-2019.jpg -Destination assets\slideshow\01-the-tong-family-marina.jpg
Copy-Item -LiteralPath assets\keelboat.jpg -Destination assets\slideshow\02-keelboat.jpg
Copy-Item -LiteralPath assets\zests.jpg -Destination assets\slideshow\03-zests.jpg
node scripts\generate-slideshow-manifest.js
```

- [ ] **Step 4: Load the manifest before the Home entry script**

Update the bottom of `index.html` to:

```html
<script src="js/common.js" defer></script>
<script src="js/slideshow-manifest.js" defer></script>
<script src="js/home.js" defer></script>
```

- [ ] **Step 5: Document the image-drop workflow**

Create `README.md` containing:

```markdown
# Hoofers Youth Sailing

## Updating the homepage slideshow

1. Copy supported `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` images into `assets/slideshow/`.
2. Prefix filenames with numbers to control order, for example `04-summer-racing.jpg`.
3. Run `node scripts/generate-slideshow-manifest.js`.
4. Commit the image and regenerated `js/slideshow-manifest.js` together.

The filename after the numeric prefix becomes the visible slide title.
```

- [ ] **Step 6: Run the affected tests and verify GREEN**

Run: `node --test tests/slideshow-manifest.test.js tests/routes.test.js`

Expected: generator, freshness, route order, and classic shared-scope tests PASS.

- [ ] **Step 7: Commit the seeded manifest slice**

```text
git add assets/slideshow js/slideshow-manifest.js README.md index.html tests/slideshow-manifest.test.js tests/routes.test.js
git commit -m "feat: seed generated slideshow manifest"
```

---

### Task 3: Implement the manual slideshow runtime

**Files:**
- Modify: `js/home.js`
- Modify: `tests/interactions.test.js`

**Interfaces:**
- Consumes: `globalThis.HoofersSlideshowImages` and the `data-slideshow-*` hooks added in Task 4.
- Produces: `normalizeSlideshowImages(value)`, `wrapSlideIndex(index, count)`, `createSlideshowController(count, onChange)`, and `initSlideshow(documentRef, imageData)` exported through the existing CommonJS API.

- [ ] **Step 1: Write failing state and navigation tests**

Update the import in `tests/interactions.test.js` and add:

```js
const {
  initHome,
  initCourseTabs,
  normalizeSlideshowImages,
  wrapSlideIndex,
  createSlideshowController
} = require('../js/home.js');

test('slideshow image normalization rejects malformed manifest entries', () => {
  assert.deepEqual(normalizeSlideshowImages(null), []);
  assert.deepEqual(normalizeSlideshowImages([
    { src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' },
    { src: '', title: 'Missing' },
    null
  ]), [{ src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' }]);
});

test('slideshow controller wraps manual navigation and reports each selection', () => {
  const changes = [];
  const controller = createSlideshowController(3, (index) => changes.push(index));

  controller.previous();
  controller.next();
  controller.goTo(2);
  controller.next();

  assert.equal(controller.index, 0);
  assert.deepEqual(changes, [2, 0, 2, 0]);
  assert.equal(wrapSlideIndex(-1, 3), 2);
  assert.equal(wrapSlideIndex(3, 3), 0);
});

test('slideshow controller ignores navigation when no images exist', () => {
  const changes = [];
  const controller = createSlideshowController(0, (index) => changes.push(index));
  controller.next();
  controller.previous();
  assert.equal(controller.index, 0);
  assert.deepEqual(changes, []);
});
```

- [ ] **Step 2: Run the interaction tests and verify RED**

Run: `node --test tests/interactions.test.js`

Expected: FAIL because the slideshow functions are not exported.

- [ ] **Step 3: Implement pure slideshow state helpers**

Add to `js/home.js`:

```js
function normalizeSlideshowImages(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((image) => image && typeof image.src === 'string' && image.src &&
    typeof image.title === 'string' && image.title && typeof image.alt === 'string' && image.alt);
}

function wrapSlideIndex(index, count) {
  return count > 0 ? (index % count + count) % count : 0;
}

function createSlideshowController(count, onChange) {
  let index = 0;
  const select = (nextIndex) => {
    if (count < 1) return;
    index = wrapSlideIndex(nextIndex, count);
    onChange(index);
  };
  return {
    get index() { return index; },
    next() { select(index + 1); },
    previous() { select(index - 1); },
    goTo(nextIndex) { select(nextIndex); }
  };
}
```

- [ ] **Step 4: Implement DOM initialization and event wiring**

Implement `initSlideshow(documentRef, imageData)` so it:

```js
function initSlideshow(documentRef, imageData = globalThis.HoofersSlideshowImages) {
  const root = documentRef.querySelector('[data-slideshow]');
  if (!root) return;
  const images = normalizeSlideshowImages(imageData);
  const viewport = root.querySelector('[data-slideshow-viewport]');
  const previous = root.querySelector('[data-slide-previous]');
  const next = root.querySelector('[data-slide-next]');
  const indicators = root.querySelector('[data-slide-indicators]');
  const status = root.querySelector('[data-slide-status]');
  const empty = root.querySelector('[data-slideshow-empty]');
  const controls = root.querySelector('[data-slideshow-controls]');

  empty.hidden = images.length > 0;
  viewport.hidden = images.length === 0;
  controls.hidden = images.length < 2;
  if (!images.length) return;

  const slides = images.map((image) => createSlide(documentRef, viewport, image));
  const dots = images.map((image, index) => createIndicator(documentRef, indicators, image, index));
  const render = (index) => {
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== index; });
    dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false'));
    status.textContent = `${index + 1} of ${images.length}`;
  };
  const controller = createSlideshowController(images.length, render);
  previous.addEventListener('click', () => controller.previous());
  next.addEventListener('click', () => controller.next());
  dots.forEach((dot, index) => dot.addEventListener('click', () => controller.goTo(index)));
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') controller.previous();
    else controller.next();
  });
  render(0);
}
```

Define these focused helpers directly above `initSlideshow`:

```js
function createSlide(documentRef, viewport, image) {
  const slide = documentRef.createElement('figure');
  const photo = documentRef.createElement('img');
  const caption = documentRef.createElement('figcaption');
  slide.className = 'slideshow-slide';
  photo.setAttribute('src', image.src);
  photo.setAttribute('alt', image.alt);
  photo.setAttribute('loading', 'lazy');
  caption.textContent = image.title;
  slide.append(photo, caption);
  viewport.append(slide);
  return slide;
}

function createIndicator(documentRef, indicators, image, index) {
  const button = documentRef.createElement('button');
  button.className = 'slideshow-indicator';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', `Show slide ${index + 1}: ${image.title}`);
  indicators.append(button);
  return button;
}
```

Call `initSlideshow(documentRef)` inside `initHome`, and export all new helpers in the existing `api` object.

- [ ] **Step 5: Run interaction and syntax checks and verify GREEN**

Run:

```text
node --test tests/interactions.test.js
node --check js/home.js
```

Expected: all interaction tests PASS and the script syntax check exits 0.

- [ ] **Step 6: Commit the runtime slice**

```text
git add js/home.js tests/interactions.test.js
git commit -m "feat: add manual slideshow controls"
```

---

### Task 4: Replace the gallery mosaic with the responsive slideshow UI

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/homepage.test.js`
- Modify: `tests/interactions.test.js`

**Interfaces:**
- Consumes: Task 3's exact `data-slideshow-*` selectors.
- Produces: the accessible slideshow shell and presentation consumed by `initSlideshow`.

- [ ] **Step 1: Replace the old gallery assertions with failing slideshow contract tests**

In `tests/homepage.test.js`, replace the three per-image gallery tests with:

```js
test('homepage gallery exposes one accessible manual slideshow shell', () => {
  const gallery = html.match(/<section id="gallery"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(gallery, /data-slideshow[^>]+tabindex="0"/);
  assert.match(gallery, /data-slideshow-viewport/);
  assert.match(gallery, /data-slide-previous[^>]+aria-label="Previous photo"/);
  assert.match(gallery, /data-slide-next[^>]+aria-label="Next photo"/);
  assert.match(gallery, /data-slide-indicators/);
  assert.match(gallery, /data-slide-status[^>]+aria-live="polite"/);
  assert.match(gallery, /data-slideshow-empty[^>]+hidden[^>]*>Photos coming soon\.<\/p>/);
  assert.doesNotMatch(gallery, /gallery-grid|gallery-one|gallery-two|gallery-three/);
});

test('stylesheet replaces the mosaic with a responsive framed slideshow', () => {
  assert.match(css, /\.slideshow\s*\{[^}]*max-width:\s*85rem/s);
  assert.match(css, /\.slideshow-viewport\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9[^}]*border:\s*\.5rem solid var\(--white\)/s);
  assert.match(css, /\.slideshow-control/);
  assert.match(css, /\.slideshow-indicator\[aria-current="true"\]/);
  assert.doesNotMatch(css, /\.gallery-grid|\.gallery-one|\.gallery-two|\.gallery-three/);
});
```

- [ ] **Step 2: Add failing DOM-mode tests**

Add these self-contained DOM doubles to `tests/interactions.test.js`:

```js
function fakeNode(tagName = 'div') {
  const attrs = new Map();
  const listeners = new Map();
  const selectorMap = new Map();
  return {
    tagName,
    hidden: false,
    className: '',
    textContent: '',
    children: [],
    listeners,
    register(selector, node) { selectorMap.set(selector, node); },
    querySelector(selector) { return selectorMap.get(selector) || null; },
    append(...nodes) { this.children.push(...nodes); },
    addEventListener(name, handler) { listeners.set(name, handler); },
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.get(name); }
  };
}

function slideshowFixture() {
  const root = fakeNode();
  const viewport = fakeNode();
  const previous = fakeNode('button');
  const next = fakeNode('button');
  const indicators = fakeNode();
  const status = fakeNode('p');
  const empty = fakeNode('p');
  const controls = fakeNode();
  root.register('[data-slideshow-viewport]', viewport);
  root.register('[data-slide-previous]', previous);
  root.register('[data-slide-next]', next);
  root.register('[data-slide-indicators]', indicators);
  root.register('[data-slide-status]', status);
  root.register('[data-slideshow-empty]', empty);
  root.register('[data-slideshow-controls]', controls);
  const documentRef = {
    querySelector(selector) { return selector === '[data-slideshow]' ? root : null; },
    createElement(tagName) { return fakeNode(tagName); }
  };
  return { documentRef, root, viewport, previous, next, indicators, status, empty, controls };
}
```

Add these cases that call `initSlideshow`:

```js
test('empty slideshow shows its fallback and hides viewport and controls', () => {
  const fixture = slideshowFixture();
  initSlideshow(fixture.documentRef, []);
  assert.equal(fixture.empty.hidden, false);
  assert.equal(fixture.viewport.hidden, true);
  assert.equal(fixture.controls.hidden, true);
});

test('single-image slideshow renders its image without navigation controls', () => {
  const fixture = slideshowFixture();
  initSlideshow(fixture.documentRef, [
    { src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' }
  ]);
  assert.equal(fixture.viewport.hidden, false);
  assert.equal(fixture.controls.hidden, true);
  assert.equal(fixture.status.textContent, '1 of 1');
  assert.equal(fixture.viewport.children[0].children[0].getAttribute('src'), 'assets/slideshow/01-lake.jpg');
});

test('slideshow buttons and arrow keys select and wrap visible slides', () => {
  const fixture = slideshowFixture();
  initSlideshow(fixture.documentRef, [
    { src: 'assets/slideshow/01-lake.jpg', title: 'Lake', alt: 'Youth sailing: Lake' },
    { src: 'assets/slideshow/02-crew.jpg', title: 'Crew', alt: 'Youth sailing: Crew' }
  ]);

  fixture.next.listeners.get('click')();
  assert.equal(fixture.status.textContent, '2 of 2');
  assert.equal(fixture.viewport.children[0].hidden, true);
  assert.equal(fixture.viewport.children[1].hidden, false);

  let prevented = false;
  fixture.root.listeners.get('keydown')({ key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(fixture.status.textContent, '1 of 2');

  fixture.indicators.children[1].listeners.get('click')();
  assert.equal(fixture.status.textContent, '2 of 2');
});
```

- [ ] **Step 3: Run homepage and interaction tests and verify RED**

Run: `node --test tests/homepage.test.js tests/interactions.test.js`

Expected: FAIL because the old mosaic markup and styles remain and the slideshow shell is absent.

- [ ] **Step 4: Replace the gallery markup**

Replace `.gallery-grid` in `index.html` with:

```html
<div class="slideshow" data-slideshow tabindex="0" aria-label="Youth sailing photo slideshow">
  <div class="slideshow-viewport" data-slideshow-viewport></div>
  <p class="slideshow-empty" data-slideshow-empty hidden>Photos coming soon.</p>
  <div class="slideshow-controls" data-slideshow-controls>
    <button class="slideshow-control" type="button" data-slide-previous aria-label="Previous photo"><span aria-hidden="true">←</span></button>
    <div class="slideshow-indicators" data-slide-indicators aria-label="Choose a photo"></div>
    <p class="slideshow-status" data-slide-status aria-live="polite"></p>
    <button class="slideshow-control" type="button" data-slide-next aria-label="Next photo"><span aria-hidden="true">→</span></button>
  </div>
</div>
```

- [ ] **Step 5: Replace mosaic CSS with slideshow CSS**

Remove `.gallery-grid`, `.gallery-image`, `.gallery-one`, `.gallery-two`, `.gallery-three`, and their mobile overrides. Add scoped styles with these key declarations:

```css
.slideshow { max-width: 85rem; margin: 0 auto; }
.slideshow-viewport { position: relative; overflow: hidden; aspect-ratio: 16 / 9; border: .5rem solid var(--white); border-radius: 2.5rem 8rem 2.5rem 2.5rem; background: #81c6cf; box-shadow: 0 .8rem 2rem rgba(11,53,88,.08); }
.slideshow-slide { position: absolute; inset: 0; margin: 0; }
.slideshow-slide[hidden] { display: none; }
.slideshow-slide img { width: 100%; height: 100%; object-fit: cover; }
.slideshow-slide figcaption { position: absolute; right: 1.5rem; bottom: 1.5rem; left: 1.5rem; padding: 1rem 1.2rem; border-radius: 1rem; background: rgba(0,55,92,.82); color: var(--white); font-family: var(--font-display); font-weight: 800; }
.slideshow-controls { display: grid; grid-template-columns: auto 1fr auto auto; gap: 1rem; align-items: center; margin-top: 1.25rem; }
.slideshow-control { display: grid; width: 3.25rem; height: 3.25rem; place-items: center; border: 0; border-radius: 50%; background: var(--coral); color: var(--white); cursor: pointer; font-size: 1.25rem; }
.slideshow-indicators { display: flex; justify-content: center; gap: .55rem; }
.slideshow-indicator { width: .75rem; height: .75rem; padding: 0; border: 2px solid var(--navy); border-radius: 50%; background: transparent; cursor: pointer; }
.slideshow-indicator[aria-current="true"] { background: var(--navy); transform: scale(1.2); }
.slideshow-status { margin: 0; color: var(--navy); font-size: .8rem; font-weight: 800; }
.slideshow-empty { margin: 0; padding: 6rem 1rem; border: .5rem solid var(--white); border-radius: 2.5rem; background: rgba(255,255,255,.35); color: var(--navy); text-align: center; font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; }
```

Inside the existing `@media (max-width: 48rem)` block, set `.slideshow-viewport { aspect-ratio: 4 / 3; border-radius: 2rem 4rem 2rem 2rem; }`, `.slideshow-controls { grid-template-columns: auto 1fr auto; }`, move `.slideshow-status` to a full-width centered row, and keep each control at least `3rem` square.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `node --test tests/homepage.test.js tests/interactions.test.js tests/routes.test.js tests/slideshow-manifest.test.js`

Expected: slideshow markup, presentation, generator, route order, and interaction tests PASS.

- [ ] **Step 7: Commit the complete slideshow UI**

```text
git add index.html styles.css js/home.js tests/homepage.test.js tests/interactions.test.js
git commit -m "feat: replace gallery with manual slideshow"
```

---

### Task 5: Perform final verification and cleanup

**Files:**
- Verify: all modified and created files from Tasks 1-4.

**Interfaces:**
- Consumes: the completed generator, manifest, slideshow runtime, markup, and styles.
- Produces: a clean `main` worktree with verified slideshow behavior and documentation.

- [ ] **Step 1: Verify manifest freshness**

Run: `node scripts/generate-slideshow-manifest.js --check`

Expected: exit 0 with no stale-manifest message.

- [ ] **Step 2: Verify all JavaScript syntax**

Run:

```text
node --check scripts/generate-slideshow-manifest.js
node --check js/common.js
node --check js/slideshow-manifest.js
node --check js/home.js
node --check js/forms-common.js
node --check js/contact.js
```

Expected: every command exits 0.

- [ ] **Step 3: Run the complete automated suite**

Run: `node --test`

Expected: all tests PASS with zero failures, cancellations, or skipped tests.

- [ ] **Step 4: Check formatting and stale selectors**

Run:

```text
git diff --check
rg -n "gallery-grid|gallery-one|gallery-two|gallery-three" index.html styles.css js tests
```

Expected: `git diff --check` exits 0 and `rg` finds only intentional negative assertions, if any.

- [ ] **Step 5: Review the final diff and working tree**

Run:

```text
git diff --stat HEAD~3..HEAD
git status --short --branch
```

Expected: only slideshow-related files are changed or newly committed; no unrelated work is present.

- [ ] **Step 6: Create a verification commit only if cleanup changed files**

If Step 4 required a real cleanup edit, run:

```text
git add -- README.md index.html styles.css js/home.js js/slideshow-manifest.js scripts/generate-slideshow-manifest.js tests/homepage.test.js tests/interactions.test.js tests/routes.test.js tests/slideshow-manifest.test.js assets/slideshow
git commit -m "test: verify generated slideshow"
```

Otherwise, do not create an empty commit.
