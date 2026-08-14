# Confidence Section Youth Sailing Image Design

## Goal

Replace the image placeholder beside “Confidence comes with every tack.” with the supplied `assets/Youth_Sailing1.jpg` photograph.

## Design

- Keep the current confidence-section layout, organic cutout, white border, rotation, shadow, and “Small crews. Big growth.” note.
- Use `.confidence-image` as the semantic image and organic mask, with `role="img"` and a concise `aria-label` describing young sailors learning together.
- Remove the placeholder class, icon, and label so no placeholder pattern overlays the photograph.
- Render `assets/Youth_Sailing1.jpg` on a dedicated `.confidence-image::before` layer.
- Extend the photo layer 6% beyond every edge and use centered cover cropping. The cutout's irregular border radius and `overflow: hidden` mask the oversized layer.

## Scope

This change affects only the confidence image markup in `index.html`, its focused styles in `styles.css`, and the homepage regression test. It does not change the section copy, surrounding layout, or other placeholders.

## Validation

- Confirm the confidence cutout has semantic image labeling.
- Confirm the background layer references `assets/Youth_Sailing1.jpg`, uses `inset: -6%`, and uses cover cropping.
- Confirm the cutout retains its organic border radius, border, and hidden overflow.
- Render the homepage at desktop and narrow widths to confirm the photograph fully fills the masked cutout.
- Run the full automated test suite, JavaScript syntax check, and whitespace validation.
