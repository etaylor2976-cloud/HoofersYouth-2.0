# Multipage Youth Sailing Site Design

## Goal

Expand the existing youth sailing homepage into a cohesive static multipage site that helps families understand the programs, trust the organization, find practical answers, make contact, and preview a future account experience.

## Scope

The first multipage release includes seven routes:

- `/` — Home
- `/programs/` — Programs
- `/about/` — About
- `/faq/` — Frequently Asked Questions
- `/contact/` — Contact
- `/login/` — Login
- `/signup/` — Sign up

Login, signup, and contact submissions are front-end demonstrations. They validate input and display an inline confirmation, but do not send, persist, or authenticate data.

## Architecture

Use a folder-per-page static structure. Each route owns an `index.html` file while the root `styles.css` and `script.js` provide shared appearance and behavior. Relative asset and navigation paths will be correct from both the root homepage and nested folders.

The shared header includes Home, Programs, About, FAQ, and Contact, plus Login and Sign up actions. The shared footer repeats the main public navigation and organization details. Mobile navigation, focus behavior, motion preferences, and form patterns remain consistent across pages.

## Visual System

Extend the approved bold youth-forward direction: deep navy, seafoam, coral, sunny yellow, organic shapes, confident display typography, friendly body typography, and purposeful image placeholders. Interior pages reuse the same tokens and components while varying section composition so the site feels cohesive rather than duplicated.

Every page includes a clear title, short orientation copy, active navigation state, and a distinct accent composition. Image placeholders remain clearly labeled and accessible so real photography can replace them without changing layout.

## Page Designs

### Home

Preserve the existing homepage and the committed Beginner, Advanced, and Windsurfing program names. Replace section-only navigation with real page routes where appropriate. Program cards lead to Programs, the FAQ preview leads to FAQ, and the account actions appear in the global header.

### Programs

Present Beginner, Advanced, and Windsurfing as the three primary choices. Each program includes intended experience level, ages 10–18, core skills, a sample session rhythm, and fit guidance. A comparison section helps families choose, followed by preparation notes and a contact call to action. This release does not add individual program-detail routes.

### About

Explain the program mission, teaching approach, safety culture, and community history. Use editorial image placeholders and a small instructor-values section without inventing named staff profiles. The page should make the organization feel experienced, welcoming, and youth-centered.

### FAQ

Provide categorized questions for eligibility and experience, safety, scheduling and weather, equipment and clothing, registration, and account access. Questions use accessible disclosure controls. A client-side text filter narrows visible questions and announces the result count; an empty state explains when no questions match.

### Contact

Combine practical contact information with a front-end inquiry form. Fields include name, email, topic, and message. Required fields and email format receive inline errors. A valid submission replaces or updates the form status with a clear demo confirmation stating that no message was actually sent.

### Login

Use a focused account panel with email, password, show-password control, remember-me option, forgotten-password placeholder link, and a route to Sign up. Validation is front-end only. A valid submission displays a demo-success message and does not authenticate or store credentials.

### Sign Up

Use a matching account panel with parent or guardian name, email, password, password confirmation, and terms acknowledgement. Validate required fields, email format, minimum password length, matching passwords, and consent. A valid submission displays a demo-success message and does not create or store an account.

## Interaction and Data Flow

`script.js` initializes only components present on the current page:

1. Mobile navigation opens, closes after selection, and closes with Escape.
2. FAQ disclosures synchronize visual state, panel visibility, and `aria-expanded`.
3. FAQ filtering reads local question text, updates visibility, reports the number of matches, and displays an empty state when appropriate.
4. Demo forms validate on submission, focus the first invalid field, render field-level errors, and announce success or failure through a live status region.
5. Password visibility controls update the input type and accessible label.
6. Progressive reveal effects remain optional and respect reduced-motion preferences.

No network requests, browser storage, cookies, or authentication tokens are used.

## Error Handling and Accessibility

Forms use labels, instructions, appropriate input types, `aria-describedby`, field-specific error containers, and an announced form status. Invalid state clears when corrected and resubmitted. FAQ filtering and disclosure controls work by keyboard. Every page includes skip navigation, semantic landmarks, logical headings, visible focus states, sufficient contrast, and touch-friendly controls.

If JavaScript is unavailable, navigation and page content remain usable. FAQ answers remain readable through semantic structure or a no-script-safe presentation, while forms remain visibly marked as demonstrations.

## Responsive Behavior

Wide screens use expressive split layouts and asymmetric image-placeholder compositions. Tablet layouts reduce decorative overlap and grid density. Small screens stack content, collapse the primary navigation, make form actions comfortably tappable, and avoid horizontal scrolling. Account pages remain compact without shrinking labels or controls.

## Validation

Automated tests verify that all route files exist, nested pages load shared assets with correct relative paths, navigation links resolve to intended folders, active page labels are present, required page sections exist, demo forms expose their validation hooks, FAQ controls expose filtering and disclosure hooks, and shared responsive and reduced-motion rules remain available. JavaScript unit tests cover menu, disclosure, filtering, password visibility, field validation, and demo submission state.

The final source audit checks for empty links, placeholder implementation notes, broken relative paths, unintended persistence or network code, JavaScript syntax errors, and changes outside the approved seven-page scope.
