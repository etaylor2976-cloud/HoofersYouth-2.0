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
