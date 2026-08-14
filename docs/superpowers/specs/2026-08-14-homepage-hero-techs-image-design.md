# Homepage Hero Techs Image Design

## Goal

Replace the homepage's top image placeholder with the supplied `assets/Techs.jpg` photograph while preserving the existing playful hero composition.

## Design

- Keep the current hero visual container, organic border shape, white frame, shadow, sticker, sun, and wave decorations.
- Use the existing `.hero-image` container as the semantic image and organic mask, with concise descriptive text supplied through `role="img"` and `aria-label`.
- Render `assets/Techs.jpg` on a dedicated `.hero-image::before` background layer rather than as a nested `<img>`. The container's irregular border radius and `overflow: hidden` mask the layer to the cutout.
- Extend the background layer 6% beyond every edge and use `background-size: cover`, creating a subtle 12% zoom while guaranteeing full coverage without distortion or empty space.
- Set the horizontal background position to `60%` so the photograph shifts left within the cutout and centers the foreground sailors more effectively. Keep the vertical position centered.
- Remove the placeholder icon and placeholder label from the top hero only. Other homepage placeholders remain unchanged.

## Scope

This change affects only `index.html`, the hero-image styling in `styles.css`, and the focused homepage test. It does not change navigation, content, interactions, the cutout's size, or other image placeholders.

## Validation

- Confirm the homepage cutout has semantic image labeling.
- Confirm the `::before` layer references `assets/Techs.jpg`, extends 6% beyond the cutout, and uses cover sizing.
- Confirm the photograph uses `background-position: 60% center`.
- Confirm the cutout retains its organic border radius and hidden overflow so it masks the photograph.
- Run the homepage tests, JavaScript syntax check, internal-link check, and whitespace validation.
