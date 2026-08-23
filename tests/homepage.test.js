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

test('every course card reserves a labeled image placeholder instead of an icon', () => {
  const programs = html.match(/<section id="programs"[\s\S]*?<\/section>/)?.[0] || '';

  assert.equal((programs.match(/class="program-image-placeholder"/g) || []).length, 8);
  assert.equal((programs.match(/>Image placeholder<\/span>/g) || []).length, 8);
  assert.doesNotMatch(programs, /class="program-icon"/);
});

test('course image placeholders use a responsive photo-shaped frame', () => {
  const placeholderRule = css.match(/\.program-image-placeholder\s*\{[^}]*\}/)?.[0] || '';

  assert.match(placeholderRule, /width:\s*100%/);
  assert.match(placeholderRule, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(placeholderRule, /border:\s*[^;]*dashed/);
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

test('homepage feature photography uses accessible real-image cards', () => {
  assert.match(html, /role="img"/);
  assert.doesNotMatch(html, /class="image-placeholder (?:hero|confidence)-image"/);
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
  assert.match(css, /\.slideshow-caption-title\s*\{[^}]*display:\s*block/s);
  assert.match(css, /\.slideshow-caption-description\s*\{[^}]*display:\s*block/s);
  assert.match(css, /\.slideshow-control/);
  assert.match(css, /\.slideshow-indicator\[aria-current="true"\]/);
  assert.doesNotMatch(css, /\.gallery-grid|\.gallery-one|\.gallery-two|\.gallery-three/);
});

test('newsletter banner keeps the blue hero seam and responsive inline form', () => {
  assert.match(css, /\.newsletter-banner\s*\{[^}]*position:\s*relative[^}]*z-index:\s*2[^}]*display:\s*grid[^}]*min-height:\s*7\.5rem[^}]*margin-top:\s*-1\.5rem[^}]*background:\s*var\(--navy\)/s);
  assert.match(css, /\.newsletter-form\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(12rem,\s*1fr\)\s+auto/s);
  assert.doesNotMatch(css, /\.ticker\s*\{/);
});

test('homepage exposes an accessible inline newsletter signup', () => {
  const banner = html.match(/<aside class="newsletter-banner"[\s\S]*?<\/aside>/)?.[0] || '';

  assert.match(banner, /aria-labelledby="newsletter-title"/);
  assert.match(banner, /<form[^>]+data-newsletter-form/);
  assert.match(banner, /<input[^>]+type="email"[^>]+required/);
  assert.match(banner, /data-newsletter-status[^>]+aria-live="polite"/);
  assert.doesNotMatch(html, /class="ticker"/);
});

test('homepage omits the testimonial and final crew CTA sections', () => {
  assert.doesNotMatch(html, /class="[^"]*testimonial/);
  assert.doesNotMatch(html, /Parent testimonial|Ready to find|The lake is calling/i);
  for (const selector of ['.testimonial', '.quote-mark', '.final-cta', '.cta-sail']) {
    assert.doesNotMatch(css, new RegExp(selector.replace('.', '\\.')));
  }
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

test('desktop homepage sections fit the viewport without forcing the mobile layout', () => {
  const desktopLayout = css.match(/@media\s*\(min-width:\s*68\.0625rem\)\s*\{[\s\S]*$/)?.[0] || '';

  assert.match(desktopLayout, /\.hero\s*\{[^}]*min-height:\s*calc\(100svh\s*-\s*5\.25rem\s*-\s*6rem\)/s);
  assert.match(desktopLayout, /\.section\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(desktopLayout, /\.programs\s*,\s*\.gallery\s*\{[^}]*align-content:\s*center/s);
  assert.match(desktopLayout, /\.confidence\s*,\s*\.faq\s*\{[^}]*align-items:\s*center/s);

  const mobileLayout = css.match(/@media\s*\(max-width:\s*48rem\)\s*\{[\s\S]*?\/\* Contact form \*\//)?.[0] || '';
  assert.match(mobileLayout, /\.hero\s*\{[^}]*min-height:\s*auto/s);
});
