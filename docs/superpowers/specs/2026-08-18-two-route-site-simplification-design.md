# Two-Route Site Simplification Design

## Goal

Simplify Hoofers Youth Sailing into a frontend-only site with two routes: the existing home page and Contact page. Programs and FAQ content remain available as sections on the home page; About and Login are removed entirely; Signup becomes an inline camp-signup action rather than a page.

## Remaining routes

- Home: `index.html`
- Contact: `contact/index.html`

Delete the route documents and directories for Programs, About, FAQ, Login, and Signup. Delete their page-specific JavaScript when it is no longer consumed by either remaining route.

## Navigation

The home-page header contains:

- Home, marked as the current page
- Programs, linked to `#programs`
- FAQ, linked to `#faq`
- Contact, linked to `contact/`
- Sign up, implemented as a camp-signup action with no route destination

The Contact-page header contains:

- Home, linked to `../`
- Programs, linked to `../#programs`
- FAQ, linked to `../#faq`
- Contact, marked as the current page
- Sign up, implemented as the same camp-signup action with no route destination

Both footers expose only valid destinations from the same two-route and homepage-section model. About and Login do not appear anywhere in navigation or page copy.

## Homepage actions

- Keep the existing Programs and FAQ section content and layout as the canonical experience for those subjects; only the outgoing page links change as specified below.
- Keep “Explore programs” actions linked to `#programs`.
- Replace each program card’s “Meet the program” link with a “Sign up for camp” button.
- Remove the “See all frequently asked questions” link because no standalone FAQ route remains.
- Preserve the final call-to-action’s “Explore programs” label and point it to `#programs`.

## Camp signup behavior

Every header signup action and program-card signup button uses one shared frontend behavior. Activating it displays the native browser alert:

> You’re signed up for camp! We’ll be in touch with next steps.

The action does not navigate, submit a form, store data, or contact a backend. Buttons use `type="button"` and a shared data attribute so the behavior remains accessible and testable.

## Contact page

Keep the existing contact form and frontend-only validation behavior. Remove the obsolete “Account preview” topic option. Retain the existing demo disclosure that no message is sent.

## Code cleanup

- Delete `programs/`, `about/`, `faq/`, `login/`, and `signup/` route directories.
- Delete the page-specific scripts for those deleted routes.
- Retain shared navigation, reveal, form-validation, home-page FAQ disclosure, and Contact-page scripts.
- Remove tests that only describe deleted pages or account forms.
- Remove CSS used exclusively by deleted Programs, About, standalone FAQ, Login, and Signup pages while preserving selectors used by Home or Contact.
- Remove every HTML, JavaScript, CSS, and test reference to the deleted route paths.

## Verification

- Begin with failing route and interaction regression tests.
- Confirm only the Home and Contact route documents remain.
- Confirm both remaining pages expose only valid navigation targets.
- Confirm all camp-signup actions display the approved alert message.
- Confirm no references to the deleted route paths remain in active source or tests.
- Confirm the homepage Programs and FAQ sections still render and the home-page FAQ disclosures still work.
- Confirm the Contact form validation still works.
- Run the complete automated test suite and inspect Home and Contact at desktop and mobile widths.
