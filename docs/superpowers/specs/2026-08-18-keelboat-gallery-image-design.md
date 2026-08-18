# Keelboat Gallery Image Design

## Goal

Replace the yellow second gallery placeholder on the home page with the supplied `assets/keelboat.jpg` photograph while preserving the card's current shape, size, reveal behavior, and caption format.

## Approved treatment

- Keep the existing `.gallery-two` card and its rounded mask.
- Remove the placeholder-specific class and placeholder accessibility wording.
- Render `keelboat.jpg` as a responsive, edge-to-edge `cover` crop inside the card.
- Center the crop so the sailors and keelboat remain the visual focus as the card resizes.
- Keep the existing two-line caption markup and styling unchanged so its wording can be edited later.
- Add only a subtle darkening gradient to the photograph behind the caption area for dependable contrast; the existing white caption label remains visually unchanged.
- Preserve the white border, shadow, responsive grid behavior, and reveal animation.

## Accessibility

The card remains a semantic image through `role="img"`. Its `aria-label` will describe the actual photograph rather than a placeholder.

## Verification

- Add an automated regression test that checks the placeholder class is removed, the image asset is referenced, and the caption remains present.
- Run the complete existing test suite.
- Inspect the home page at desktop and narrow viewport widths to confirm the crop fills the mask and the caption remains legible.
