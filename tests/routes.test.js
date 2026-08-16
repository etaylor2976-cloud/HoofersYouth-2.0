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

const entries = {
  home: 'home', programs: 'programs', about: 'about', faq: 'faq',
  contact: 'contact', login: 'login', signup: 'signup'
};

test('every route loads common javascript followed by its page entry', () => {
  Object.entries(routes).forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    const prefix = name === 'home' ? 'js/' : '../js/';
    const commonIndex = html.indexOf(`src="${prefix}common.js" defer`);
    const pageIndex = html.indexOf(`src="${prefix}${entries[name]}.js" defer`);
    const formsIndex = html.indexOf(`src="${prefix}forms-common.js" defer`);
    assert.ok(commonIndex >= 0, `${file}: common.js`);
    if (['contact', 'login', 'signup'].includes(name)) {
      assert.ok(formsIndex > commonIndex && pageIndex > formsIndex, `${file}: form script order`);
    } else {
      assert.equal(formsIndex, -1, `${file}: no forms-common.js`);
      assert.ok(pageIndex > commonIndex, `${file}: ${entries[name]}.js after common.js`);
    }
    assert.doesNotMatch(html, /src="(?:\.\.\/)?script\.js"/);
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

test('contact and account pages expose complete demo-form hooks', () => {
  for (const file of [routes.contact, routes.login, routes.signup]) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /data-demo-form/);
    assert.match(html, /data-form-status[^>]*aria-live="polite"/);
    assert.match(html, /This is a front-end demo/i);
  }
  assert.match(fs.readFileSync(routes.contact, 'utf8'), /name="message"/);
  assert.match(fs.readFileSync(routes.login, 'utf8'), /name="password"/);
  assert.match(fs.readFileSync(routes.signup, 'utf8'), /name="passwordConfirm"/);
});

module.exports = { routes };
