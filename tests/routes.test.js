const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

const expectedScripts = {
  home: ['js/common.js', 'js/home.js'],
  programs: ['../js/common.js', '../js/programs.js'],
  about: ['../js/common.js', '../js/about.js'],
  faq: ['../js/common.js', '../js/faq.js'],
  contact: ['../js/common.js', '../js/forms-common.js', '../js/contact.js'],
  login: ['../js/common.js', '../js/forms-common.js', '../js/login.js'],
  signup: ['../js/common.js', '../js/forms-common.js', '../js/signup.js']
};

function routeScriptSources(file) {
  const html = fs.readFileSync(file, 'utf8');
  return [...html.matchAll(/<script\s+([^>]+)><\/script>/g)].map(([, attributes]) => {
    assert.match(attributes, /\bdefer\b/, `${file}: deferred script`);
    const source = attributes.match(/\bsrc="([^"]+)"/);
    assert.ok(source, `${file}: script source`);
    return source[1];
  });
}

test('every route loads its exact deferred script list', () => {
  Object.entries(routes).forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    assert.deepEqual(routeScriptSources(file), expectedScripts[name], `${file}: script order`);
    assert.doesNotMatch(html, /src="(?:\.\.\/)?script\.js"/);
  });
});

test('each route runs its classic scripts in one shared global scope', () => {
  Object.values(routes).forEach((file) => {
    const context = vm.createContext({
      document: { addEventListener() {} },
      window: {}
    });
    routeScriptSources(file).forEach((source) => {
      const scriptFile = path.resolve(path.dirname(file), source);
      vm.runInContext(fs.readFileSync(scriptFile, 'utf8'), context, { filename: scriptFile });
    });
  });
});

test('nested pages load the shared root stylesheet', () => {
  Object.values(routes).filter((file) => file !== routes.home).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /href="\.\.\/styles\.css"/);
  });
});

test('every route identifies its active page', () => {
  Object.entries(routes).forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    const label = name === 'signup' ? 'Sign up' : name[0].toUpperCase() + name.slice(1);
    assert.match(html, new RegExp(`aria-current="page"[^>]*>${label}<`, 'i'));
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1, `${file}: active page count`);
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
