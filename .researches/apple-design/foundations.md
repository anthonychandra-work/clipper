---
type: research
context: The numbers behind Apple's design system — type sizes, system colours, hit targets, contrast, dark mode and accessibility settings — from the Human Interface Guidelines.
updated: 2026-10-5
sources:
  - https://developer.apple.com/design/human-interface-guidelines/typography
  - https://developer.apple.com/design/human-interface-guidelines/color
  - https://developer.apple.com/design/human-interface-guidelines/layout
  - https://developer.apple.com/design/human-interface-guidelines/accessibility
  - https://developer.apple.com/design/human-interface-guidelines/dark-mode
  - https://developer.apple.com/design/human-interface-guidelines/buttons
  - https://developer.apple.com/design/human-interface-guidelines/materials
  - https://developer.apple.com/fonts/
---

# Apple design foundations

## Typefaces

San Francisco is the system family. SF Pro is the interface font on iPhone, iPad, Mac and Apple TV, with nine weights, four widths, a rounded variant and optical sizes that adjust letter shapes to the point size. SF Mono is the monospaced companion. New York is the serif companion.

Rules:

- Use regular, medium, semibold and bold. Avoid ultralight, thin and light.
- Keep the number of typefaces low. Build hierarchy from size, weight and colour.
- Body text is 17 pt on iPhone and iPad, with an 11 pt minimum. On the Mac it is 13 pt, with a 10 pt minimum.

## Text styles on iPhone and iPad

Sizes at the default text-size setting.

| Style | Size (pt) | Line height (pt) | Weight | Emphasised weight |
|---|---|---|---|---|
| Large Title | 34 | 41 | Regular | Bold |
| Title 1 | 28 | 34 | Regular | Bold |
| Title 2 | 22 | 28 | Regular | Bold |
| Title 3 | 20 | 25 | Regular | Semibold |
| Headline | 17 | 22 | Semibold | Semibold |
| Body | 17 | 22 | Regular | Semibold |
| Callout | 16 | 21 | Regular | Semibold |
| Subhead | 15 | 20 | Regular | Semibold |
| Footnote | 13 | 18 | Regular | Semibold |
| Caption 1 | 12 | 16 | Regular | Semibold |
| Caption 2 | 11 | 13 | Regular | Semibold |

People change the text size in system settings. Layouts must hold at every size, and Apple asks apps to support enlargement to at least 200%.

## Text styles on the Mac

| Style | Size (pt) | Line height (pt) | Weight | Emphasised weight |
|---|---|---|---|---|
| Large Title | 26 | 32 | Regular | Bold |
| Title 1 | 22 | 26 | Regular | Bold |
| Title 2 | 17 | 22 | Regular | Bold |
| Title 3 | 15 | 20 | Regular | Semibold |
| Headline | 13 | 16 | Bold | Heavy |
| Body | 13 | 16 | Regular | Semibold |
| Callout | 12 | 15 | Regular | Semibold |
| Subheadline | 11 | 14 | Regular | Semibold |
| Footnote | 10 | 13 | Regular | Semibold |
| Caption 1 | 10 | 13 | Regular | Medium |
| Caption 2 | 10 | 13 | Medium | Semibold |

The Mac does not scale text with a system setting.

## System colours

Values published in the Human Interface Guidelines for iPhone and iPad, converted to hex. Each colour has its own light and dark value; the dark one is brighter.

| Colour | Light | Dark | Light, increased contrast | Dark, increased contrast |
|---|---|---|---|---|
| Red | #FF383C | #FF4245 | #E9152D | #FF6165 |
| Orange | #FF8D28 | #FF9230 | #C55300 | #FFA056 |
| Yellow | #FFCC00 | #FFD600 | #A16A00 | #FEDF43 |
| Green | #34C759 | #30D158 | #008932 | #4AD968 |
| Mint | #00C8B3 | #00DAC3 | #008575 | #54DFCB |
| Teal | #00C3D0 | #00D2E0 | #008198 | #3BDDEC |
| Cyan | #00C0E8 | #3CD3FE | #007EAE | #6DD9FF |
| Blue | #0088FF | #0091FF | #1E6EF4 | #5CB8FF |
| Indigo | #6155F5 | #6D7CFF | #564ADE | #A7AAFF |
| Purple | #CB30E0 | #DB34F2 | #B02FC2 | #EA8DFF |
| Pink | #FF2D55 | #FF375F | #E7124D | #FF8AC4 |
| Brown | #AC7F5E | #B78A66 | #956D51 | #DBA679 |

Blue is the default accent. Green is the default "on" colour for switches. Red marks destructive actions.

## Backgrounds, labels and greys

The guidelines name these colours by role and show them as swatches without numbers. The values below are the ones documented for the system before the 2025 redesign. They were not rechecked against iOS 27.

| Role | Light | Dark |
|---|---|---|
| Background | #FFFFFF | #000000 |
| Secondary background | #F2F2F7 | #1C1C1E |
| Tertiary background | #FFFFFF | #2C2C2E |
| Grouped background | #F2F2F7 | #000000 |
| Secondary grouped background | #FFFFFF | #1C1C1E |
| Label | #000000 | #FFFFFF |
| Secondary label | #3C3C43 at 60% | #EBEBF5 at 60% |
| Tertiary label | #3C3C43 at 30% | #EBEBF5 at 30% |
| Separator | #3C3C43 at 29% | #545458 at 60% |
| Grey | #8E8E93 | #8E8E93 |
| Grey 2 | #AEAEB2 | #636366 |
| Grey 3 | #C7C7CC | #48484A |
| Grey 4 | #D1D1D6 | #3A3A3C |
| Grey 5 | #E5E5EA | #2C2C2E |
| Grey 6 | #F2F2F7 | #1C1C1E |

Rules for these roles:

- Use each colour for its named purpose. A separator colour is not a text colour.
- Text sits in four levels: label, secondary, tertiary and quaternary. The lowest level is for watermark-like text and does not belong on thin materials.
- A plain screen uses the background colours. A screen made of grouped rows uses the grouped set, where the page is light grey and the row groups are white.

## Dark mode

- Dark mode has two background sets. The base set is dimmer and recedes. The elevated set is brighter and belongs to anything layered above: sheets, popovers.
- Dark colours are not inversions of light ones. Backgrounds get dimmer and foreground colours get brighter.
- Follow the system setting. Apple tells apps not to offer their own light and dark switch.
- Pure white areas inside dark content appear to glow; darken them slightly.

## Contrast

| Text | Minimum contrast |
|---|---|
| Up to 17 pt | 4.5 to 1 |
| 18 pt and larger | 3 to 1 |
| Bold at any size | 3 to 1 |

Apple recommends 7 to 1 for custom colours on small text.

## Hit targets and spacing

| Platform | Default control size | Minimum |
|---|---|---|
| iPhone, iPad | 44 × 44 pt | 28 × 28 pt |
| Mac | 28 × 28 pt | 20 × 20 pt |

A button's tappable region is at least 44 × 44 pt, whatever its visible size. Leave about 12 pt around a control that has a visible background and about 24 pt around one that has none.

## Layout

- Keep content and controls inside the safe area: clear of the status bar, the Dynamic Island, the home indicator and any bars.
- Backgrounds run edge to edge, under bars and sidebars.
- Choose layouts by available width and height, compact or regular, and not by device name. The functions stay the same at every size; what changes is how much is visible at once.
- Put the most important content at the top and the leading side. Group related items with space, a shared container or a separator.
- On the Mac, keep controls and essential information away from the bottom edge of a window, which people push off-screen.

## Accessibility settings to honour

| Setting | Effect on the design |
|---|---|
| Reduce Motion | Replace movement and zoom with fades; remove bounce; do not animate blur or depth |
| Reduce Transparency | Replace glass and blur with solid backgrounds |
| Increase Contrast | Use the higher-contrast colour set |
| Bold Text | Heavier weights throughout |
| Differentiate Without Colour | Carry meaning with a shape, symbol or label as well as colour |
