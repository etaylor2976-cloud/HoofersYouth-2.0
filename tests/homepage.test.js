const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

test('homepage contains its core sections and primary action', () => {
  for (const id of ['programs', 'why-sailing', 'gallery', 'faq']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, />\s*Explore programs\s*</i);
  assert.match(html, /Your best summer starts here/i);
});

test('homepage exposes accessible interactive hooks', () => {
  assert.match(html, /id="menu-toggle"[^>]*aria-expanded="false"/);
  assert.match(html, /id="primary-nav"/);
  assert.match(html, /data-faq-button/);
  assert.match(html, /aria-controls=/);
});

test('image placeholders describe the intended future photography', () => {
  const placeholders = html.match(/class="[^"]*image-placeholder[^"]*"/g) || [];
  assert.ok(placeholders.length >= 4);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Placeholder for/);
});

test('homepage hero uses the supplied Techs photograph', () => {
  assert.match(html, /class="hero-image"[^>]+role="img"[^>]+aria-label="Young sailors aboard Tech sailboats on Lake Mendota"/);
  assert.doesNotMatch(html, /class="hero-photo"/);
  assert.match(css, /\.hero-image::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-6%[^}]*background:[^}]*url\("assets\/Techs\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.hero-image\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
});

test('stylesheet defines the approved palette and responsive safeguards', () => {
  for (const token of ['--navy', '--seafoam', '--coral', '--sunny']) {
    assert.match(css, new RegExp(token));
  }
  assert.match(css, /@media\s*\(max-width:\s*48rem\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /overflow-x:\s*clip/);
});
