# Manifest-Driven Homepage Slideshow Design

## Goal

Replace the homepage's three-image gallery mosaic with a manual slideshow whose contents are generated from the supported image files in `assets/slideshow/`. Adding or removing slideshow images must not require editing homepage HTML or JavaScript.

## Image source and ordering

- `assets/slideshow/` is the authoritative image directory.
- Supported extensions are `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif`, matched case-insensitively.
- Files are sorted by filename using a stable, case-insensitive comparison.
- Numeric filename prefixes control display order, for example `01-tong-family-marina.jpg` and `02-keelboat.jpg`.
- The displayed title is derived from the filename stem by removing a leading numeric prefix and separator, replacing hyphens and underscores with spaces, and converting the remaining words to title case.
- Unsupported files and subdirectories are ignored.

## Manifest generator

Add `scripts/generate-slideshow-manifest.js`, a dependency-free Node script that scans the image directory and writes `js/slideshow-manifest.js` deterministically.

The generated classic script assigns an array to `globalThis.HoofersSlideshowImages`. Each entry contains:

- `src`: the root-relative project path using forward slashes;
- `title`: the human-readable title derived from the filename; and
- `alt`: accessible text derived from the title without claiming details not present in the filename.

The generator exposes its pure scanning and rendering functions through CommonJS so tests can exercise them with temporary fixtures. It also supports a check mode that exits unsuccessfully when the committed manifest does not match the image directory. The repository documentation will give the refresh command:

```text
node scripts/generate-slideshow-manifest.js
```

The current Tong Family Marina, keelboat, and Zest photographs will be copied into the new directory with ordered, readable filenames, then the manifest will be generated and committed.

## Homepage integration

The Home route will load scripts in this order:

1. `js/common.js`
2. `js/slideshow-manifest.js`
3. `js/home.js`

The gallery section will contain one slideshow shell rather than three hard-coded image cards. `js/home.js` will read `globalThis.HoofersSlideshowImages`, create one slide for each manifest entry, and initialize the controls.

The slideshow includes:

- one large image viewport using the site's rounded white-framed treatment;
- the current slide title over the photograph;
- previous and next buttons;
- one selectable indicator per image;
- an accessible `current of total` status; and
- left and right arrow-key navigation while focus is within the slideshow.

The first image is selected initially. Navigation wraps from the last image to the first and from the first image to the last. There is no timer or autoplay. Transitions use the site's existing motion language and are disabled by the existing reduced-motion rule.

## Empty and single-image states

- With no manifest entries, the gallery displays `Photos coming soon.` and hides all navigation controls.
- With one image, the image and caption remain visible while previous, next, and indicator controls are hidden.
- A missing or malformed global manifest is treated as an empty manifest rather than throwing an error.

## Accessibility

- Generated images receive `alt` text from the manifest.
- Previous and next controls have explicit accessible labels.
- Indicator buttons announce their slide number and title and expose the selected state.
- The counter is an `aria-live="polite"` status so manual changes are announced without interrupting the visitor.
- Keyboard navigation supplements normal button and indicator activation; it does not trap focus.

## Styling and responsive behavior

The new slideshow retains the gallery's seafoam section background, centered heading, white image border, organic rounded corners, navy typography, coral controls, and subtle shadow. Desktop uses a wide landscape viewport. Mobile keeps the controls touch-friendly, moves captions away from controls, and maintains a usable fixed aspect ratio without horizontal overflow.

The obsolete mosaic grid and per-image gallery selectors will be removed once the slideshow styles replace them.

## Verification

Automated checks will cover:

- supported-file filtering, deterministic ordering, and filename-to-title conversion;
- generated manifest freshness against `assets/slideshow/`;
- correct Home route script order;
- slideshow markup and absence of the old mosaic structure;
- initial, next, previous, wraparound, indicator, and arrow-key behavior;
- empty and single-image states;
- syntax checks for all classic scripts; and
- the complete existing test suite plus `git diff --check`.

No backend, deployment change, autoplay, image upload interface, or caption-management interface is included.
