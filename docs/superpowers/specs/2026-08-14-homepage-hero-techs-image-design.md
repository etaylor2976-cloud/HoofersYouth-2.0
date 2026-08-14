# Homepage Hero Techs Image Design

## Goal

Replace the homepage's top image placeholder with the supplied `assets/Techs.jpg` photograph while preserving the existing playful hero composition.

## Design

- Keep the current hero visual container, organic border shape, white frame, shadow, sticker, sun, and wave decorations.
- Render `assets/Techs.jpg` inside that container as a semantic image.
- Anchor the photograph to all four edges of the frame with absolute positioning. This gives it a definite rendered height even though the frame uses `min-height`.
- Crop the photograph with `object-fit: cover` so it fills the entire responsive frame without distortion or an empty area beneath it.
- Use concise descriptive alternative text for accessibility.
- Remove the placeholder icon and placeholder label from the top hero only. Other homepage placeholders remain unchanged.

## Scope

This change affects only `index.html`, the hero-image styling in `styles.css`, and the focused homepage test. It does not change navigation, content, interactions, or other image placeholders.

## Validation

- Confirm the homepage references `assets/Techs.jpg` and includes meaningful alt text.
- Confirm the image is anchored with `position: absolute` and `inset: 0`, then fills the hero frame responsively.
- Run the homepage tests, JavaScript syntax check, internal-link check, and whitespace validation.
