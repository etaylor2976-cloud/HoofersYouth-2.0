const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

function cssHex(variableName) {
  const value = css.match(new RegExp(`${variableName}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  assert.ok(value, `${variableName} should resolve to a six-digit hex color`);
  return value;
}

function contrastRatio(firstHex, secondHex) {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((value) => parseInt(value, 16) / 255);
    const linear = channels.map((value) => value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4);
    return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
  };
  const lighter = Math.max(luminance(firstHex), luminance(secondHex));
  const darker = Math.min(luminance(firstHex), luminance(secondHex));
  return (lighter + 0.05) / (darker + 0.05);
}

function colorHsl(hex) {
  const [red, green, blue] = hex.slice(1).match(/.{2}/g).map((value) => parseInt(value, 16) / 255);
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 2;
  const delta = maximum - minimum;
  let hue = 0;

  if (delta) {
    if (maximum === red) hue = ((green - blue) / delta) % 6;
    else if (maximum === green) hue = ((blue - red) / delta) + 2;
    else hue = ((red - green) / delta) + 4;
    hue = (hue * 60 + 360) % 360;
  }

  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs((2 * lightness) - 1));
  return { hue, saturation: saturation * 100, lightness: lightness * 100 };
}

test('homepage contains its core sections and primary action', () => {
  for (const id of ['programs', 'why-sailing', 'gallery', 'faq']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, />\s*Explore programs\s*</i);
  assert.match(html, /Your best summer starts here/i);
});

test('homepage presents confidence before course selection', () => {
  const sectionIds = [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(sectionIds, ['top', 'why-sailing', 'programs', 'gallery', 'faq']);
});

test('homepage exposes accessible interactive hooks', () => {
  assert.match(html, /id="menu-toggle"[^>]*aria-expanded="false"/);
  assert.match(html, /id="primary-nav"/);
  assert.match(html, /data-faq-button/);
  assert.match(html, /aria-controls=/);
});

test('sticky navigation uses a solid cream surface', () => {
  const headerRule = css.match(/\.site-header\s*\{[^}]*\}/)?.[0] || '';

  assert.match(headerRule, /position:\s*sticky/);
  assert.match(headerRule, /background:\s*var\(--cream\)/);
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
  const developCardRule = css.match(/\.program-develop\s*\{[^}]*\}/)?.[0] || '';
  const hoverRule = css.match(/\.program-card:hover\s*\{[^}]*\}/)?.[0] || '';

  assert.doesNotMatch(developCardRule, /transform\s*:/);
  assert.doesNotMatch(css, /\.program-develop:hover\s*\{/);
  assert.match(hoverRule, /translateY\(-\.3rem\)/);
  assert.doesNotMatch(hoverRule, /rotate\(/);
});

test('course cards use the approved palette with readable text', () => {
  const programs = html.match(/<section id="programs"[\s\S]*?<\/section>/)?.[0] || '';
  const cardClasses = {};

  for (const match of programs.matchAll(/<article class="program-card ([^"]+)">([\s\S]*?)<\/article>/g)) {
    const title = match[2].match(/<h3>([^<]+)<\/h3>/)?.[1];
    if (title) cardClasses[title] = match[1];
  }

  assert.deepEqual(cardClasses, {
    'Sailing 1': 'program-discover',
    'Sailing 2': 'program-develop',
    Windsurfing: 'program-windsurf',
    'Beginner Daycamp': 'program-discover',
    'Advanced Daycamp': 'program-lead'
  });

  const palettes = {
    'program-discover': ['--seafoam', '--navy'],
    'program-develop': ['--ink', '--white'],
    'program-windsurf': ['--sunny', '--ink'],
    'program-lead': ['--ink', '--white']
  };

  for (const [className, [backgroundToken, textToken]] of Object.entries(palettes)) {
    const rule = css.match(new RegExp(`\\.${className}\\s*\\{[^}]*\\}`))?.[0] || '';
    assert.match(rule, new RegExp(`background:\\s*var\\(${backgroundToken}\\)`));
    assert.match(rule, new RegExp(`color:\\s*var\\(${textToken}\\)`));
    assert.ok(
      contrastRatio(cssHex(backgroundToken), cssHex(textToken)) >= 4.5,
      `${className} text should meet WCAG AA contrast`
    );
  }
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

test('homepage hero uses the supplied Techs photograph as its full background', () => {
  const heroRule = css.match(/\.hero\s*\{[^}]*\}/)?.[0] || '';

  assert.match(heroRule, /background:[^;]*linear-gradient\([^;]*url\("assets\/Techs\.jpg"\)[^;]*cover[^;]*no-repeat/s);
  assert.doesNotMatch(html, /class="hero-(?:visual|image)"/);
  assert.doesNotMatch(css, /\.hero-image(?:\s|:|\{)/);
  assert.match(heroRule, /grid-template-columns:\s*minmax\(0,\s*43rem\)/);
});

test('hero omits the wave lines and concentric circle decorations', () => {
  assert.doesNotMatch(html, /class="wave-lines"/);
  assert.doesNotMatch(css, /\.wave-lines|\.hero::before/);
});

test('confidence section uses the supplied Youth Sailing photograph', () => {
  assert.match(html, /class="confidence-image"[^>]+role="img"[^>]+aria-label="Young sailors learning together around a sailboat"/);
  assert.doesNotMatch(html, /class="image-placeholder confidence-image"/);
  assert.match(css, /\.confidence-image::before\s*\{[^}]*content:\s*""[^}]*position:\s*absolute[^}]*inset:\s*-6%[^}]*background:[^}]*url\("assets\/Youth_Sailing1\.jpg"\)[^}]*cover/s);
  assert.match(css, /\.confidence-image\s*\{[^}]*overflow:\s*hidden[^}]*border-radius:/s);
  assert.doesNotMatch(css, /\.confidence-visual::before\s*\{/);
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

test('newsletter controls stay vertically centered while status remains responsive', () => {
  const formRule = css.match(/\.newsletter-form\s*\{[^}]*\}/)?.[0] || '';
  const statusRule = css.match(/\.newsletter-status\s*\{[^}]*\}/)?.[0] || '';
  const mobileLayout = css.match(/@media\s*\(max-width:\s*48rem\)\s*\{[\s\S]*?\/\* Contact form \*\//)?.[0] || '';

  assert.match(formRule, /position:\s*relative/);
  assert.match(statusRule, /position:\s*absolute/);
  assert.match(statusRule, /top:\s*calc\(100%\s*\+\s*\.25rem\)/);
  assert.match(mobileLayout, /\.newsletter-status\s*\{[^}]*position:\s*static/s);
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

test('primary buttons remain readable on the subdued nautical palette', () => {
  const buttonRule = css.match(/\.button\s*\{[^}]*\}/)?.[0] || '';
  const backgroundToken = buttonRule.match(/background:\s*var\((--[a-z-]+)\)/)?.[1];
  const textToken = buttonRule.match(/color:\s*var\((--[a-z-]+)\)/)?.[1];

  assert.ok(backgroundToken, 'primary button background token');
  assert.ok(textToken, 'primary button text token');
  assert.ok(
    contrastRatio(cssHex(backgroundToken), cssHex(textToken)) >= 4.5,
    'primary button text should meet WCAG AA contrast'
  );
});

test('brand accents stay within a subdued nautical color range', () => {
  const ocean = colorHsl(cssHex('--ocean'));
  const coral = colorHsl(cssHex('--coral'));
  const sunny = colorHsl(cssHex('--sunny'));

  assert.ok(ocean.hue >= 175 && ocean.hue <= 205, 'ocean should remain blue-green');
  assert.ok(ocean.saturation <= 32, 'ocean should be muted');
  assert.ok(coral.hue >= 5 && coral.hue <= 18, 'coral should remain warm');
  assert.ok(coral.saturation <= 38, 'coral should be muted');
  assert.ok(sunny.hue >= 35 && sunny.hue <= 48, 'sunny should read as warm sand');
  assert.ok(sunny.saturation <= 42, 'sunny should be muted');
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
