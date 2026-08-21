const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  titleFromFilename,
  scanImages,
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

  const captions = {
    '01-marina.PNG': { caption: 'Learning at the Marina', description: 'A first lesson beside the dock.' }
  };

  assert.deepEqual(scanImages(dir, 'assets/slideshow', captions), [
    {
      src: 'assets/slideshow/01-marina.PNG',
      title: 'Learning at the Marina',
      description: 'A first lesson beside the dock.',
      alt: 'Youth sailing: Learning at the Marina'
    },
    { src: 'assets/slideshow/02-keelboat.webp', title: 'Keelboat', description: '', alt: 'Youth sailing: Keelboat' },
    { src: 'assets/slideshow/03-zests.jpg', title: 'Zests', description: '', alt: 'Youth sailing: Zests' }
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

test('generateManifest loads caption metadata beside the slideshow images', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hoofers-captions-'));
  const outputFile = path.join(dir, 'manifest.js');
  fs.writeFileSync(path.join(dir, '01-lake.jpg'), 'fixture');
  fs.writeFileSync(path.join(dir, 'captions.json'), JSON.stringify({
    '01-lake.jpg': {
      caption: 'Finding the Wind',
      description: 'A young sailor practices reading the breeze.'
    }
  }));

  const result = generateManifest({ imageDir: dir, publicBase: 'assets/slideshow', outputFile });

  assert.match(result.content, /"title": "Finding the Wind"/);
  assert.match(result.content, /"description": "A young sailor practices reading the breeze\."/);
});

test('generateManifest reports the captions file when its JSON is invalid', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hoofers-invalid-captions-'));
  const outputFile = path.join(dir, 'manifest.js');
  fs.writeFileSync(path.join(dir, '01-lake.jpg'), 'fixture');
  fs.writeFileSync(path.join(dir, 'captions.json'), '{ invalid json');

  assert.throws(
    () => generateManifest({ imageDir: dir, publicBase: 'assets/slideshow', outputFile }),
    /Invalid slideshow captions JSON .*captions\.json/
  );
});

test('caption metadata provides editable text for every slideshow image', () => {
  const captionsPath = 'assets/slideshow/captions.json';
  assert.equal(fs.existsSync(captionsPath), true, 'captions.json should exist');
  const captions = JSON.parse(fs.readFileSync(captionsPath, 'utf8'));
  const images = scanImages('assets/slideshow', 'assets/slideshow');

  for (const image of images) {
    const fileName = path.basename(image.src);
    assert.equal(typeof captions[fileName]?.caption, 'string', `${fileName} needs a caption`);
    assert.equal(typeof captions[fileName]?.description, 'string', `${fileName} needs a description`);
  }
});

test('committed slideshow manifest is current for its images and captions', () => {
  const result = generateManifest({ check: true });
  assert.equal(result.current, true);
});
