# Tong Family Marina Gallery Image Design

## Goal

Replace the first homepage gallery placeholder with `assets/TFM-September-2019.jpg` while preserving the card's existing organic shape and the supplied Tong Family Marina caption.

## Design

- Remove `image-placeholder` from the first gallery card so it is no longer treated as unfinished photography.
- Keep `gallery-image gallery-one`, `data-reveal`, and the existing caption markup.
- Give the card an accessible image description for the Tong Family Marina photograph.
- Render the photograph through `.gallery-one::before`, using an absolutely positioned, slightly oversized background with `cover` and centered positioning.
- Clip the photograph to the existing rounded card shape with `overflow: hidden`.
- Keep the caption above the photograph with explicit stacking and its existing light label treatment so it remains readable.
- Leave the other two gallery placeholders unchanged.

## Verification

- Add a homepage regression test covering the asset URL, masked crop, non-placeholder markup, accessible label, and caption retention.
- Run the focused homepage tests and the full test suite.
- Inspect the card in a rendered browser at desktop and narrow widths to confirm that the marina photo fills the mask and the caption remains legible.

## Scope

This is a frontend-only homepage change. It does not alter other gallery cards, page structure, or navigation.
