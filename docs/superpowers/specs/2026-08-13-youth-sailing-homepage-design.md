# Youth Sailing Homepage Design

## Goal

Create a fun, polished homepage for a youth sailing program that helps families quickly understand the experience and makes exploring programs the clear next step.

## Scope

This phase covers only the responsive homepage. Program detail, registration, about, family information, and other supporting pages are deferred. Homepage links to those destinations may remain non-navigating previews until the pages are built.

## Visual Direction

Use the approved “bold youth-forward” direction: deep navy, seafoam, coral, and sunny yellow; modern organic shapes; confident typography; and energetic but restrained decorative details. The result should feel exciting to young sailors while remaining credible and easy for parents to scan.

Photography will use clearly labeled image placeholders that preserve the intended composition and can be replaced later without restructuring the page.

## Page Structure

1. A compact header with the program name, simple navigation, and a prominent “Explore programs” action.
2. A hero with the headline “Your best summer starts here,” supporting copy about independence, teamwork, and belonging, a primary program CTA, and a large youth-sailing image placeholder.
3. Three program cards—Discover, Develop, and Lead—with short audience and progression cues.
4. A confidence-building section covering safety, qualified instruction, teamwork, and skill growth.
5. A lively photo-placeholder gallery that shows the future storytelling rhythm.
6. A parent testimonial that provides social reassurance.
7. A short FAQ preview for common parent concerns.
8. A final call to explore programs, followed by a practical footer.

## Interaction and Responsive Behavior

- Header links and calls to action scroll to relevant homepage sections where possible.
- The mobile header uses an accessible menu button and collapsible navigation.
- FAQ items use keyboard-accessible disclosure controls.
- Motion is subtle, limited to entrances and hover feedback, and disabled when reduced motion is preferred.
- Layouts reflow cleanly from wide desktop screens to small phones without horizontal scrolling.

## Content and Accessibility

Use concrete, family-friendly language rather than filler copy. Maintain semantic landmarks, visible focus states, logical heading order, sufficient color contrast, descriptive labels, and usable touch targets. Image placeholders include meaningful accessible labels.

## Technical Shape

Implement the page as a lightweight static site using the existing `index.html`, `styles.css`, and `script.js` files. Keep presentation in the stylesheet and use JavaScript only for the mobile menu, FAQ disclosures, and optional progressive enhancement.

## Validation

Check HTML, CSS, and JavaScript for syntax errors; confirm navigation, menu, and FAQ behavior; and verify the layout at desktop and mobile widths. Supporting-page navigation is excluded from functional validation because those pages are intentionally deferred.
