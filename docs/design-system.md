# QULTURE temporary design system

The eight PNGs in `docs/design/concepts/` are the accepted visual specification for the local MVP. They were generated with the built-in GPT Image 2 workflow and intentionally separate public pre-launch surfaces from the isolated demo-commerce surface.

## Tokens

- Paper: `#f3f2ee`
- Surface: `#ffffff`
- Text: `#0b0b0b`
- Inverse: `#0a0a0a`
- Inverse text: `#f5f5f2`
- Graphite: `#292929`
- Muted: `#717171`
- Border: `rgba(10, 10, 10, 0.18)`
- Inverse border: `rgba(245, 245, 242, 0.28)`
- Cold accent: `#a5b4c2`
- Success: `#4f7258`
- Warning: `#9a6f2d`
- Error: `#9e3b36`

## Typography and layout

- System grotesk stack only; no runtime font dependency.
- 12-column desktop grid and four-column mobile grid.
- Large uppercase display copy with restrained tracking; compact deliberate chrome type.
- Page gutters: `clamp(18px, 3.9vw, 64px)`.
- Surfaces stay open: rules, bands, rails and lists are preferred over card grids.
- Controls are rectangular with `0–2px` radius and at least `44px` hit targets.

## Component families

- Transparent-to-paper sticky header; compact full-screen mobile menu.
- Outline and solid rectangular action buttons with a single arrow glyph.
- Editorial media frames with stable aspect ratios and monochrome imagery.
- Ruled lists/accordions for proof, knowledge and product details.
- Desktop right-side / mobile full-screen AI sheet.
- Consent and waitlist forms use plain fields and explicit separate choices.
- Demo commerce always carries the full-width `DEMO COMMERCE — NOT FOR PUBLICATION` safety rail.

## Media treatment

The supplied `hero-video.mp4` is the hero background and `hero-poster.png` is its poster/reduced-motion/error fallback. Do not globally tint the media. A localized low-opacity black readability layer is permitted only behind hero copy.

## Motion

Use 150–350ms opacity, translate, media swap and small image zoom transitions. All motion is disabled or reduced under `prefers-reduced-motion: reduce`.

