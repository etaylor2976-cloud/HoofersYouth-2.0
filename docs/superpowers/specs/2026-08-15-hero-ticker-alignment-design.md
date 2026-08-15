# Hero Ticker Alignment Design

## Goal

Horizontally center the homepage ticker text and remove the cream-colored gap exposed at the left edge between the light-blue hero and the angled navy ticker.

## Design

- Preserve the ticker's navy color, text, star separators, typography, and playful rotation.
- Center the complete ticker text row horizontally with flexbox so overflow is balanced across the left and right sides.
- Move the ticker slightly upward so its rotated top edge overlaps the light-blue hero background.
- Keep the ticker above the hero at the overlap using explicit stacking.
- Do not change the hero image, hero content, ticker copy, or the section below the ticker.
- Retain the same treatment at desktop and narrow viewport widths.

## Verification

- Add regression coverage for horizontal ticker centering and the hero overlap.
- Run the homepage tests and full test suite.
- Render the homepage at desktop and narrow widths to confirm the text is horizontally centered and no cream gap appears above the ticker's left edge.

## Scope

This is a frontend-only CSS adjustment to the homepage hero/ticker boundary.
