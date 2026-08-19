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

test('homepage keeps Programs and FAQ as sections without deleted page links', () => {
  assert.match(html, /href="#programs"[^>]*>Explore programs/);
  assert.match(html, /href="#programs"[^>]*>Programs</);
  assert.match(html, /href="#faq"[^>]*>FAQ</);
  assert.equal((html.match(/data-camp-signup/g) || []).length, 9);
  assert.equal((html.match(/>Sign up for camp\s*</g) || []).length, 8);
  assert.doesNotMatch(html, /See all frequently asked questions/i);
  assert.doesNotMatch(html, /href="(?:programs|about|faq|login|signup)\//i);
});

test('programs section presents course selections in three accessible tabs', () => {
  const programs = html.match(/<section id="programs"[\s\S]*?<\/section>/)?.[0] || '';

  assert.match(programs, /role="tablist"[^>]+aria-label="Course schedule"/);
  assert.match(programs, /id="morning-tab"[^>]+role="tab"[^>]+aria-selected="true"[^>]+aria-controls="morning-courses"[^>]*>Morning</);
  assert.match(programs, /id="afternoon-tab"[^>]+role="tab"[^>]+aria-selected="false"[^>]+aria-controls="afternoon-courses"[^>]*>Afternoon</);
  assert.match(programs, /id="day-camp-tab"[^>]+role="tab"[^>]+aria-selected="false"[^>]+aria-controls="day-camp-courses"[^>]*>Day Camp</);
  assert.match(programs, /id="morning-courses"[^>]+role="tabpanel"[^>]+aria-labelledby="morning-tab"/);
  assert.match(programs, /id="afternoon-courses"[^>]+role="tabpanel"[^>]+aria-labelledby="afternoon-tab"[^>]+hidden/);
  assert.match(programs, /id="day-camp-courses"[^>]+role="tabpanel"[^>]+aria-labelledby="day-camp-tab"[^>]+hidden/);
  assert.equal((programs.match(/<h3>Sailing 1<\/h3>/g) || []).length, 2);
  assert.equal((programs.match(/<h3>Sailing 2<\/h3>/g) || []).length, 2);
  assert.equal((programs.match(/<h3>Windsurfing<\/h3>/g) || []).length, 2);
  assert.match(programs, /<h3>Beginner Daycamp<\/h3>/);
  assert.match(programs, /<h3>Advanced Daycamp<\/h3>/);
  assert.equal((programs.match(/Ages 10–17 · 2 weeks/g) || []).length, 6);
  assert.equal((programs.match(/Ages 10–17 · 1 week/g) || []).length, 2);
  assert.equal((programs.match(/class="program-card /g) || []).length, 8);
  assert.doesNotMatch(programs, /Ages 10-18/);
});

test('program cards share one level resting position', () => {
  const yellowCardRule = css.match(/\.program-develop\s*\{[^}]*\}/)?.[0] || '';

  assert.doesNotMatch(yellowCardRule, /transform\s*:/);
  assert.doesNotMatch(css, /\.program-develop:hover\s*\{/);
  assert.match(css, /\.program-card:hover\s*\{[^}]*translateY\(-\.55rem\)/);
});

test('stylesheet no longer contains deleted page-only components', () => {
  for (const selector of ['.nav-login', '.auth-page', '.interior-hero', '.program-detail', '.faq-search-card']) {
    assert.doesNotMatch(css, new RegExp(selector.replace('.', '\\.')));
  }
});

test('homepage photography uses accessible real-image cards', () => {
  const placeholders = html.match(/class="[^"]*image-placeholder[^"]*"/g) || [];
  assert.equal(placeholders.length, 0);
  assert.match(html, /role="img"/);
  assert.doesNotMatch(html, /aria-label="Placeholder for/);
});

test('homepage hero uses the supplied Techs photograph', () => {
  assert.match(html, /class="hero-image"[^>]+role="img"[^>]+aria-label="Young sailors aboard Tech sailboats on Lake Mendota"/);
  assert.doesNotMatch(html, /class="hero-photo"/);
  assert.match(css, /\.hero-image::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-6%[^}]*background:[^}]*url\("assets\/Techs\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.hero-image::before\s*\{[^}]*background-position:\s*60%\s+center/s);
  assert.match(css, /\.hero-image\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
});

test('confidence section uses the supplied Youth Sailing photograph', () => {
  assert.match(html, /class="confidence-image"[^>]+role="img"[^>]+aria-label="Young sailors learning together around a sailboat"/);
  assert.doesNotMatch(html, /class="image-placeholder confidence-image"/);
  assert.match(css, /\.confidence-image::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-6%[^}]*background:[^}]*url\("assets\/Youth_Sailing1\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.confidence-image\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
});

test('first gallery card uses the supplied Tong Family Marina photograph', () => {
  assert.match(html, /class="gallery-image gallery-one"[^>]+role="img"[^>]+aria-label="The Tong Family Marina and Hoofer sailing fleet on Lake Mendota"/);
  assert.doesNotMatch(html, /class="image-placeholder gallery-image gallery-one"/);
  assert.match(html, /<small>The Tong Family Marina<\/small>[^<]+<\/span>/);
  assert.match(css, /\.gallery-one::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-4%[^}]*background:[^}]*url\("assets\/TFM-September-2019\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.gallery-one\s*\{[^}]*display:\s*flex[^}]*overflow:\s*hidden[^}]*isolation:\s*isolate/s);
  assert.match(css, /\.gallery-one \.placeholder-label\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/s);
});

test('second gallery card uses the supplied keelboat photograph', () => {
  assert.match(html, /class="gallery-image gallery-two"[^>]+role="img"[^>]+aria-label="Youth sailors aboard a keelboat at sunset on Lake Mendota"/);
  assert.doesNotMatch(html, /class="image-placeholder gallery-image gallery-two"/);
  assert.match(html, /<small>Photo placeholder<\/small>Finding your crew<\/span>/);
  assert.match(css, /\.gallery-two::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*url\("assets\/keelboat\.jpg"\)[^}]*center\s*\/\s*cover/s);
  assert.match(css, /\.gallery-two::after\s*\{[^}]*content:\s*""[^}]*linear-gradient\([^}]*transparent[^}]*rgba\(0,0,0,\.24\)/s);
  assert.match(css, /\.gallery-two\s*\{[^}]*position:\s*relative[^}]*display:\s*flex[^}]*overflow:\s*hidden[^}]*isolation:\s*isolate/s);
  assert.match(css, /\.gallery-two \.placeholder-label\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/s);
});

test('third gallery card uses the supplied Zest sailboat photograph', () => {
  assert.match(html, /class="gallery-image gallery-three"[^>]+role="img"[^>]+aria-label="Youth sailors piloting bright green Zest sailboats on Lake Mendota"/);
  assert.doesNotMatch(html, /class="image-placeholder gallery-image gallery-three"/);
  assert.match(html, /<small>Photo placeholder<\/small>Chasing the wind<\/span>/);
  assert.match(css, /\.gallery-three::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*url\("assets\/zests\.jpg"\)[^}]*center\s*\/\s*cover/s);
  assert.match(css, /\.gallery-three\s*\{[^}]*position:\s*relative[^}]*display:\s*flex[^}]*overflow:\s*hidden[^}]*isolation:\s*isolate/s);
  assert.match(css, /\.gallery-three \.placeholder-label\s*\{[^}]*position:\s*relative[^}]*z-index:\s*1/s);
});

test('ticker centers its text and overlaps the hero seam', () => {
  assert.match(css, /\.ticker\s*\{[^}]*position:\s*relative[^}]*z-index:\s*2[^}]*display:\s*flex[^}]*justify-content:\s*center[^}]*margin-top:\s*-1\.5rem/s);
  assert.match(css, /\.ticker div\s*\{[^}]*flex:\s*none[^}]*width:\s*max-content/s);
  assert.match(css, /\.ticker\s*\{[^}]*transform:\s*rotate\(-1deg\)\s*scale\(1\.02\)/s);
});

test('final CTA positions the yellow sail left of the mast', () => {
  assert.match(css, /\.cta-sail::before\s*\{[^}]*left:\s*0/s);
  assert.match(css, /\.cta-sail span\s*\{[^}]*right:\s*50%/s);
  assert.match(css, /\.cta-sail::after\s*\{[^}]*right:\s*0[^}]*background:\s*var\(--coral\)/s);
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
