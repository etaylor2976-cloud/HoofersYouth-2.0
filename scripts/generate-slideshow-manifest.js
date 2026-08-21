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

function scanImages(imageDir, publicBase = 'assets/slideshow', captions = {}) {
  if (!fs.existsSync(imageDir)) return [];
  return fs.readdirSync(imageDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'base', numeric: true }))
    .map((name) => {
      const metadata = captions[name] && typeof captions[name] === 'object' ? captions[name] : {};
      const title = typeof metadata.caption === 'string' && metadata.caption.trim()
        ? metadata.caption.trim()
        : titleFromFilename(name);
      const description = typeof metadata.description === 'string' ? metadata.description.trim() : '';
      return { src: `${publicBase}/${name}`, title, description, alt: `Youth sailing: ${title}` };
    });
}

function renderManifest(images) {
  return `(() => {\n  globalThis.HoofersSlideshowImages = ${JSON.stringify(images, null, 2)};\n})();\n`;
}

function generateManifest({
  imageDir = path.resolve('assets/slideshow'),
  publicBase = 'assets/slideshow',
  captionsFile,
  outputFile = path.resolve('js/slideshow-manifest.js'),
  check = false
} = {}) {
  const metadataFile = captionsFile || path.join(imageDir, 'captions.json');
  let captions = {};
  if (fs.existsSync(metadataFile)) {
    try {
      captions = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    } catch (error) {
      throw new Error(`Invalid slideshow captions JSON in ${metadataFile}: ${error.message}`);
    }
  }
  const content = renderManifest(scanImages(imageDir, publicBase, captions));
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
