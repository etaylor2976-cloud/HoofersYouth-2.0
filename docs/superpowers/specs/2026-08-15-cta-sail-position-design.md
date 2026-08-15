# CTA Sail Position Design

## Goal

Move the yellow sail in the homepage final call-to-action illustration to the left side of the white mast.

## Design

- Reposition only the yellow `.cta-sail::before` triangle so it sits fully to the left of the mast.
- Preserve the yellow sail's existing size, color, and triangular shape.
- Keep the coral sail on the right side of the mast.
- Do not change the mast, hull, illustration rotation, final CTA layout, or responsive scaling.

## Verification

- Add regression coverage for the yellow sail's left-side positioning.
- Run the homepage tests and full test suite.
- Render the final CTA at desktop and narrow widths to confirm the yellow sail remains left of the mast without unwanted overlap or clipping.

## Scope

This is a frontend-only CSS positioning correction to the existing sailboat illustration.
