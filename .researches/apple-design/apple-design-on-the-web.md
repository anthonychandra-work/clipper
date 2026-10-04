---
type: research
context: What a web page can and cannot take from Apple's design system — fonts, symbols, glass effects, accessibility settings — and the licence and brand limits that apply.
updated: 2026-10-5
sources:
  - https://developer.apple.com/fonts/
  - https://developer.apple.com/design/human-interface-guidelines/sf-symbols
  - https://developer.apple.com/sf-symbols/
  - https://developer.apple.com/design/resources/
  - https://developer.mozilla.org/docs/Web/CSS/font-family
  - https://furbo.org/2018/03/28/system-fonts-in-css/
  - https://www.caniemail.com/features/css-sytem-ui
  - https://developer.chrome.com/blog/css-prefers-reduced-transparency
  - https://kube.io/blog/liquid-glass-css-svg/
  - https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/
  - https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07
  - https://developer.apple.com/design/human-interface-guidelines/accessibility
  - https://developer.apple.com/design/human-interface-guidelines/dark-mode
---

# Apple design on the web

Apple publishes no web kit. Its design resources are Figma and Sketch libraries for iOS 27, iPadOS 27 and macOS 27, icon templates, the fonts and the symbols app. A web page that follows Apple's conventions rebuilds them in CSS.

## Fonts

**The licence rules out shipping San Francisco.** Apple's font licence allows the fonts "solely for creating mock-ups of user interfaces to be used in software products running on Apple's iOS, OS X or tvOS operating systems". It adds: "You may not embed the Apple Font in any software programs or other products", and it forbids using them for interfaces on any non-Apple operating system. A web page cannot serve SF Pro as a web font.

**The system font keyword is the permitted route.** A page that asks for the system interface font gets San Francisco on an iPhone, iPad or Mac, because the browser uses the font already on the device. The same request gets Segoe UI on Windows and Roboto on Android.

| CSS keyword | What it selects | Support |
|---|---|---|
| `system-ui` | The platform's interface font | All current browsers |
| `-apple-system` | San Francisco, older spelling | Safari and browsers on Apple devices |
| `ui-rounded` | The rounded variant | Safari on Mac; all browsers on iPhone and iPad |
| `ui-monospace` | SF Mono | Same |
| `ui-serif` | New York | Same |

On a non-Apple device the page looks like that platform, not like Apple. That matches Apple's own advice to use the system font. A page that must look the same everywhere needs a separately licensed typeface, and the result is an approximation of San Francisco, not the real thing.

## Symbols

SF Symbols holds over 7,000 icons that match the system font's weights. Apple's terms prohibit using the symbols, "or images that are confusingly similar", in app icons, logos or any trademarked use, and symbols that depict Apple products cannot be altered. The full licence text was not retrieved for this research; the common reading is that the symbols are licensed for apps on Apple platforms, which excludes a web page. A web page draws its own icons or uses an openly licensed set, and keeps Apple's convention: simple outlined or filled glyphs, one weight, sized with the text beside them.

## Glass in CSS

Three levels are achievable, and each browser supports a different one.

| Level | How | Where it works |
|---|---|---|
| Tinted panel | A semi-opaque background colour | Everywhere |
| Frosted glass | Blurring and saturating what is behind the element, plus a thin light border and a soft highlight | All current browsers |
| Refraction | Bending the content behind the element with a displacement filter | Chrome, Edge and other Chromium browsers only |

Safari and Firefox do not accept a displacement filter as a backdrop effect. They draw nothing in its place, not a weaker version. Since Safari is the browser on every iPhone, a design that depends on refraction fails on the devices it imitates. Build the tinted panel first, add the frost on top, and treat refraction as an extra.

Two other limits apply. A backdrop effect reaches only the content directly behind the element, while Apple's glass bends content from beyond its own edges. And the web versions move pixels by a fixed pattern; they do not compute light, so highlights do not respond to device movement.

The 2026 system revision lowered the default transparency. A frosted panel with a fairly opaque tint is closer to the current system than a nearly clear one, and it keeps text readable.

## System settings a page can read

| Apple setting | Web equivalent | Support |
|---|---|---|
| Light or dark appearance | The colour-scheme preference | All current browsers |
| Reduce Motion | The reduced-motion preference | All current browsers |
| Increase Contrast | The contrast preference | All current browsers |
| Reduce Transparency | The reduced-transparency preference | Chrome and Edge 118 and later; behind a flag in Firefox; not in Safari |
| Screen cut-outs and the home indicator | Safe-area inset values | Safari on iPhone and iPad, and other browsers that draw edge to edge |
| Larger text | The browser's text size and zoom | All browsers; sizes set in relative units follow it |

Safari does not report Reduce Transparency, so a page cannot honour that setting for the people most likely to have it. A glass panel has to be readable as it stands.

## Sizes

Apple's measurements are in points. One point equals one CSS pixel at default zoom, so the published numbers carry over directly: 44-pixel hit targets, 17-pixel body text on a phone, 13-pixel body text on a desktop.

## Limits that come from Apple's brand

- Do not use the Apple logo, product photographs or drawings of Apple devices.
- Do not present the page as an Apple product or imply Apple's endorsement.
- Following the published interface conventions is what the guidelines are for. Copying Apple's artwork is not.

The page that hosts Clipper's prototype loads web fonts from Google Fonts only, so San Francisco could not be loaded there even if the licence allowed it. The system font keyword works on that host.
