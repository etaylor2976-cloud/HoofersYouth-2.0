const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const routes = {
  home: 'index.html',
  contact: 'contact/index.html'
};
const removedRouteNames = ['programs', 'about', 'faq', 'login', 'signup'];
const expectedScripts = {
  home: ['js/common.js', 'js/slideshow-manifest.js', 'js/home.js'],
  contact: ['../js/common.js', '../js/forms-common.js', '../js/contact.js']
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

test('only Home and Contact route documents remain', () => {
  Object.values(routes).forEach((file) => assert.equal(fs.existsSync(file), true, file));
  removedRouteNames.forEach((name) => {
    const file = path.join(name, 'index.html');
    assert.equal(fs.existsSync(file), false, file);
  });
});

test('remaining routes load their exact deferred script lists', () => {
  Object.entries(routes).forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    assert.deepEqual(routeScriptSources(file), expectedScripts[name], `${file}: script order`);
    assert.doesNotMatch(html, /src="(?:\.\.\/)?script\.js"/);
  });
});

test('remaining routes run classic scripts in one shared global scope', () => {
  Object.values(routes).forEach((file) => {
    const context = vm.createContext({ document: { addEventListener() {} }, window: {} });
    routeScriptSources(file).forEach((source) => {
      const scriptFile = path.resolve(path.dirname(file), source);
      vm.runInContext(fs.readFileSync(scriptFile, 'utf8'), context, { filename: scriptFile });
    });
  });
});

test('Contact loads the shared root stylesheet', () => {
  assert.match(fs.readFileSync(routes.contact, 'utf8'), /href="\.\.\/styles\.css"/);
});

test('remaining routes identify their active page', () => {
  Object.entries(routes).forEach(([name, file]) => {
    const html = fs.readFileSync(file, 'utf8');
    const label = name[0].toUpperCase() + name.slice(1);
    assert.match(html, new RegExp(`aria-current="page"[^>]*>${label}<`, 'i'));
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1, `${file}: active page count`);
  });
});

test('remaining routes expose only valid primary navigation', () => {
  const home = fs.readFileSync(routes.home, 'utf8');
  const contact = fs.readFileSync(routes.contact, 'utf8');
  assert.match(home, /href="#programs"[^>]*>Programs</);
  assert.match(home, /href="#faq"[^>]*>FAQ</);
  assert.match(home, /href="contact\/"[^>]*>Contact</);
  assert.match(contact, /href="\.\.\/#programs"[^>]*>Programs</);
  assert.match(contact, /href="\.\.\/#faq"[^>]*>FAQ</);
  assert.match(contact, /href="\.\.\/contact\/"[^>]*aria-current="page"[^>]*>Contact</);
  for (const html of [home, contact]) {
    assert.doesNotMatch(html, />About</i);
    assert.doesNotMatch(html, />Login</i);
    assert.match(html, /data-camp-signup/);
  }
});

test('remaining routes show the current linked street address', () => {
  const address = '800 Langdon St, Madison, WI 53706';
  const mapUrl = 'https://www.bing.com/maps?q=800%20Langdon%20St%2C%20Madison%2C%20WI%2053706';
  const escapedMapUrl = mapUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  Object.values(routes).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, new RegExp(`href="${escapedMapUrl}"[^>]*>${address}<`), file);
    assert.doesNotMatch(html, /Lake Mendota · Madison, Wisconsin/, file);
  });
});

test('active source has no deleted route references', () => {
  const sourceFiles = [
    'index.html',
    'contact/index.html',
    'js/common.js',
    'js/home.js',
    'js/forms-common.js',
    'js/contact.js',
    'styles.css'
  ];
  const deletedPath = /(?:\.\.\/)?(?:programs|about|faq|login|signup)\//i;
  sourceFiles.forEach((file) => assert.doesNotMatch(fs.readFileSync(file, 'utf8'), deletedPath, file));
});

test('Contact remains a frontend-only demo form', () => {
  const html = fs.readFileSync(routes.contact, 'utf8');
  assert.match(html, /data-demo-form/);
  assert.match(html, /data-form-status[^>]*aria-live="polite"/);
  assert.match(html, /This is a front-end demo/i);
  assert.match(html, /name="message"/);
  assert.doesNotMatch(html, /Account preview/i);
});

module.exports = { routes };
