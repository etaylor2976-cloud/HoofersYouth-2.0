# Page-Specific JavaScript Design

## Goal

Replace the single site-wide `script.js` entry point with a small shared module and one JavaScript entry file per HTML page. The split must preserve all current behavior while giving each route an obvious place for future backend integration.

## Architecture

JavaScript will live in a root-level `js/` directory. Every page will load `js/common.js` first and then load its own page entry file. Nested routes will use `../js/...` paths, while the homepage will use `js/...` paths.

`common.js` owns only behavior used across the whole site:

- Mobile navigation state and event wiring
- Scroll-reveal animation initialization and reduced-motion fallback

Each page entry owns its route-specific initialization:

- `home.js`: homepage FAQ disclosures
- `about.js`: shared initialization only, with a dedicated location for future About-page behavior
- `programs.js`: shared initialization only, with a dedicated location for future Programs-page behavior
- `faq.js`: FAQ disclosures, search filtering, result count, and empty state
- `contact.js`: contact-form validation and demo submission state
- `login.js`: login-form validation, demo submission state, and password visibility
- `signup.js`: signup-form validation, password matching, demo submission state, and password visibility

The existing root `script.js` will be removed after every HTML route and test has moved to the new files.

## Interfaces and Loading

The project remains compatible with direct static-file use and the existing Node test runner. `common.js` will expose its helpers through a browser namespace and through `module.exports` when running under Node. Page files will use the browser namespace in the browser and CommonJS `require` in tests.

Each page entry will register one `DOMContentLoaded` callback. That callback will initialize shared behavior through `common.js` and then initialize only the features used by that page. Functions will continue accepting document and window references where useful so tests can exercise behavior with lightweight fakes.

HTML script order will be explicit and use `defer`:

```html
<script src="js/common.js" defer></script>
<script src="js/home.js" defer></script>
```

Nested pages will use the equivalent `../js/` paths.

## Behavior Preservation

The refactor will preserve:

- Mobile navigation open, close, link-click, and Escape-key behavior
- Reveal animation behavior, including reduced-motion and missing `IntersectionObserver` fallbacks
- Homepage and FAQ-page disclosure accessibility state
- FAQ search matching, visible count, and empty state
- Contact, login, and signup validation messages and focus behavior
- Login and signup password visibility labels and ARIA state
- Demo-only form submissions that never send or store data

Optional DOM hooks will remain guarded. A missing navigation control, FAQ panel, form status, or password input must not throw an error or block other page initialization.

## Backend Readiness

Login, signup, and contact submission logic will remain local to their page files. A future backend implementation can replace each page's demo submit handler without touching FAQ, navigation, animations, or unrelated routes. Shared validation may be extracted later if actual backend requirements make reuse valuable; it will not be generalized prematurely in this refactor.

## Testing

Tests will mirror the new file boundaries:

- Shared-interaction tests for navigation and reveal behavior
- Homepage tests for homepage FAQ behavior
- FAQ tests for disclosures and search filtering
- Contact, login, and signup tests for their own form behavior
- Route tests that require every HTML document to load `common.js` and exactly its matching page entry file, without loading the old `script.js`

The implementation will follow test-first changes: update or add a structural test and confirm it fails against the current layout, then create the new files and update the HTML until the tests pass. The complete Node test suite will be run after the split.

## Scope

This change reorganizes JavaScript only. It will not alter page content, styling, form fields, validation rules, visual behavior, or introduce backend requests. Existing unrelated working-tree changes will be preserved.
