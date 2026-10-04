---
type: research
context: Apple's current design language as of October 2026 — what Liquid Glass is, the rules for using it, how shapes and bars work, and what changed in the 2026 releases.
updated: 2026-10-5
sources:
  - https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
  - https://developer.apple.com/design/human-interface-guidelines/materials
  - https://developer.apple.com/design/human-interface-guidelines/color
  - https://developer.apple.com/design/human-interface-guidelines/layout
  - https://developer.apple.com/design/human-interface-guidelines/toolbars
  - https://developer.apple.com/videos/play/wwdc2025/356/
  - https://en.wikipedia.org/wiki/Liquid_Glass
  - https://www.aninews.in/news/tech/mobile/apple-announces-macos-27-golden-gate-at-wwdc-2026-with-liquid-glass-design-changes-and-more20260609002106/
  - https://www.stuff.tv/news/ios-27-macos-golden-gate-liquid-glass-changes/
  - https://www.macrumors.com/guide/liquid-glass/
  - https://developer.apple.com/design/resources/
---

# Apple's design language in 2026

## Timeline

Apple announced Liquid Glass on 9 June 2025 and shipped it that autumn in iOS 26, iPadOS 26, macOS Tahoe 26, watchOS 26, tvOS 26 and visionOS 26. It replaced the flat look that began with iOS 7 in 2013.

Reviewers and users complained that text over transparent controls was hard to read, most of all in bright light. Apple responded twice:

- iOS 26.1 added a setting that switches the glass from clear to a more heavily tinted look.
- At WWDC in June 2026, Apple opened the keynote with a revision for iOS 27, iPadOS 27 and macOS 27 "Golden Gate". Default transparency is lower, a slider lets each user set the glass anywhere from clear to opaque tinted, sidebar corners changed on iPad and Mac, app icons were redrawn to be easier to recognise, and macOS windows got a tighter corner radius. On macOS, apps have a unified toolbar across the top and a sidebar that reaches the window edge.

iOS 27.0 was released on 14 September 2026. Apple's design resources page offers Figma and Sketch kits for iOS 27, iPadOS 27 and macOS 27.

One social-media post says iOS 27 removes the compatibility mode that let apps keep the old look. No primary source confirmed it.

## What Liquid Glass is

A translucent material that bends and reflects what is behind it, shows highlights that respond to movement, and adapts between light and dark surroundings. Apple applies it to controls, tab bars, sidebars, toolbars, app icons and widgets.

The idea that matters for design work is the split into two layers:

- The **content layer** holds what the person came for: lists, text, photos, video.
- The **controls layer** floats above it in glass: navigation, bars and buttons. Content scrolls underneath and shows through.

## Rules for the glass

From the Human Interface Guidelines:

- Glass belongs to controls and navigation. Do not use it in the content layer. A slider or switch inside content takes on glass only while it is being pressed.
- Use it sparingly. For custom controls, apply it to the most important functional elements only.
- Two variants exist. **Regular** blurs and adjusts the brightness of what is behind it and suits anything that carries text: sidebars, alerts, popovers. **Clear** is highly see-through and suits controls floating over photos or video.
- A clear control over bright content needs a dark dimming layer at 35% opacity behind it. Over dark content, or over the system's own media controls, it needs none.
- A dimming layer behind glass marks an interruption that takes over the screen. Glass with no dimming marks a task that runs alongside the content.

## Colour on glass

- Glass picks up colour from the content behind it. Its own symbols and text are monochrome by default.
- Reserve colour for what needs emphasis: a status indicator or the primary action.
- For a primary action, colour the button's background and leave the label plain.
- Colour one control, the truly prominent one.
- When the content is colourful, keep toolbars and tab bars monochrome so they stay readable.

## Shapes

Apple's 2025 design-system session defines three shape types:

| Type | Corner radius | Where |
|---|---|---|
| Fixed | Constant | Standard elements |
| Capsule | Half the height | Buttons, switches, sliders, bars, grouped rows |
| Concentric | Parent's radius minus the padding between them | Anything nested inside a rounded container |

Concentric corners are the system's signature. A card inside a sheet, a button inside a bar and a window inside a screen all share one centre for their curves, so the gap between the two edges stays even around the corner.

Control shape by platform:

- iPhone and iPad: capsules throughout.
- Mac: rounded rectangles for mini, small and medium controls, where density matters; capsules for large and extra-large ones.

## Bars

- Remove custom backgrounds, borders and decoration from bars. Layout and grouping express the hierarchy.
- Group toolbar items by function and by how often they are used, in at most three groups. Items in a group share one glass background.
- Do not put a text button and a symbol button in the same group; together they read as one control.
- The primary action sits alone at the trailing edge, tinted. A toolbar has one.
- Titles are a word or a short phrase. On iPhone a large title at the top of a screen shrinks to a standard one as the content scrolls.

## Where bars meet content

Hard divider lines under bars are gone. A **scroll edge effect**, a soft blur, marks where content passes under a bar. iPhone and iPad use the soft style. The Mac uses a harder, more opaque edge. Each view has one such effect, and panes in a split view keep theirs at the same height.

Backgrounds and full-width images extend under sidebars and bars to the edge of the screen or window. Where a sidebar would cover part of an image, the system mirrors and blurs the image beneath the sidebar so the visible part stays centred.

## Type and layout changes that came with it

- Titles and alert text are bolder and aligned to the leading edge.
- The system colour palette was adjusted in light, dark and increased-contrast modes to sit well next to glass.
- Action sheets appear from the control that triggered them, not from the bottom of the screen.
- iPhone tab bars float above the content and can shrink as the content scrolls. A search tab can sit at the trailing end.
