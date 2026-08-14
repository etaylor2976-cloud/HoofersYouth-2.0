const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const routes = {
  home: 'index.html',
  programs: 'programs/index.html',
  about: 'about/index.html',
  faq: 'faq/index.html',
  contact: 'contact/index.html',
  login: 'login/index.html',
  signup: 'signup/index.html'
};

test('all seven route documents exist', () => {
  Object.values(routes).forEach((file) => {
    assert.equal(fs.existsSync(file), true, file);
  });
});

test('nested pages load shared root assets and identify the active page', () => {
  Object.entries(routes).filter(([name]) => name !== 'home').forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    const label = name === 'signup' ? 'Sign up' : name[0].toUpperCase() + name.slice(1);
    assert.match(html, /href="\.\.\/styles\.css"/);
    assert.match(html, /src="\.\.\/script\.js"/);
    assert.match(html, new RegExp(`aria-current="page"[^>]*>${label}<`, 'i'));
  });
});

test('every route exposes complete primary navigation', () => {
  Object.values(routes).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    ['Home', 'Programs', 'About', 'FAQ', 'Contact', 'Login', 'Sign up'].forEach((label) => {
      assert.match(html, new RegExp(`>${label}<`, 'i'), `${file}: ${label}`);
    });
  });
});

test('programs page covers all three offerings and family decision content', () => {
  const html = fs.readFileSync(routes.programs, 'utf8');
  ['Beginner', 'Advanced', 'Windsurfing', 'Ages 10–18', 'A typical session', 'Choose your program'].forEach((text) => {
    assert.match(html, new RegExp(text, 'i'));
  });
});

test('about page covers mission, safety, history, and instructor values', () => {
  const html = fs.readFileSync(routes.about, 'utf8');
  ['Our mission', 'How we teach', 'Safety', 'Since 1963', 'Patient', 'Prepared', 'Encouraging'].forEach((text) => {
    assert.match(html, new RegExp(text, 'i'));
  });
});

test('faq page exposes searchable categorized disclosures and empty state', () => {
  const html = fs.readFileSync(routes.faq, 'utf8');
  assert.match(html, /id="faq-search"/);
  assert.match(html, /id="faq-results"[^>]*aria-live="polite"/);
  assert.ok((html.match(/data-faq-item/g) || []).length >= 12);
  assert.match(html, /id="faq-empty"[^>]*hidden/);
  ['Eligibility', 'Safety', 'Weather', 'Equipment', 'Registration', 'Account'].forEach((text) => {
    assert.match(html, new RegExp(text, 'i'));
  });
});

module.exports = { routes };
