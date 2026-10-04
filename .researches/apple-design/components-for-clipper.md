---
type: research
context: Apple's rules for the interface components a clipping tool needs, how Apple's own video apps handle trimming and timelines, and how those map onto Clipper's screens.
updated: 2026-10-5
sources:
  - https://developer.apple.com/design/human-interface-guidelines/tab-bars
  - https://developer.apple.com/design/human-interface-guidelines/sidebars
  - https://developer.apple.com/design/human-interface-guidelines/split-views
  - https://developer.apple.com/design/human-interface-guidelines/toolbars
  - https://developer.apple.com/design/human-interface-guidelines/segmented-controls
  - https://developer.apple.com/design/human-interface-guidelines/buttons
  - https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
  - https://developer.apple.com/design/human-interface-guidelines/sheets
  - https://developer.apple.com/design/human-interface-guidelines/toggles
  - https://developer.apple.com/design/human-interface-guidelines/sliders
  - https://developer.apple.com/design/human-interface-guidelines/progress-indicators
  - https://developer.apple.com/design/human-interface-guidelines/playing-video
  - https://developer.apple.com/videos/play/wwdc2025/356/
  - https://support.apple.com/guide/final-cut-pro-ipad/dev3de99654f/ipados
  - https://support.apple.com/guide/imovie-iphone/knaeca4b0ea2/ios
  - https://www.cultofmac.com/news/make-sending-videos-easier-using-trim-right-on-your-iphone-or-ipad-ios-tips
---

# Apple components for a clipping tool

## Navigation

**Tab bar.** Moves between the top-level sections of an app. It never holds actions; those go in a toolbar. On iPhone it floats at the bottom on glass and can shrink while content scrolls. On iPad it sits near the top and can turn into a sidebar. Fewer tabs are easier to use, and five is the ceiling Apple suggests for a default set. Each tab has a symbol and a one-word label. A tab is never hidden or disabled because its content is empty.

**Sidebar.** Sits on the leading side and lists areas of the app or collections of content. It needs width, so Apple's advice for iPhone and iPad is to start from a tab bar and add a sidebar when there are more areas than tabs can hold. It floats on glass with content running beneath it, shows at most two levels of hierarchy, and can be hidden by the user but is visible by default.

**Split view.** Two or three panes side by side: a list, the selected item's contents, and optionally a further detail or an inspector. The selection that leads to the next pane stays highlighted. Apple advises against split views at phone width. On iPad and Mac the panes must hold up as the window is resized, and on the Mac the dividers can be dragged.

**List to detail.** On a phone the same hierarchy becomes a stack: tap a row, the detail slides in, a back button returns. A row that leads somewhere carries a chevron at its trailing end.

## Bars and actions

**Toolbar.** Holds the title, navigation controls and actions for the current view. Items sit at the leading edge (back, sidebar toggle, title), the centre (common controls) and the trailing edge (search, inspector toggle, the primary action). One primary action, tinted, at the trailing edge. Symbols are preferred to text for familiar actions; text is right when a symbol would be guessed at. On iPhone a second toolbar can sit at the bottom of the screen.

**Buttons.** The most likely action in a view gets the prominent style in the accent colour. A view has one prominent button, two at most. Destructive actions use red and never take the primary role. Labels start with a verb and use title-style capitalisation. Every custom button needs a pressed state. A button that starts something slow shows an activity indicator inside itself and can change its label while it works.

**Segmented control.** Switches between closely related views or picks one option from a short set. About five segments at most on iPhone, up to seven on wider screens. Segments have equal widths and hold either text or symbols, not a mix. A segmented control that shows a selection never triggers actions.

## Content

**Lists.** A grouped list separates sets of rows with headers, footers and space. Row text is short enough not to wrap. A row that navigates shows a chevron; a row that offers extra information shows an info button. Navigation lists keep the selected row highlighted; option lists flash the row and then show a checkmark.

**Sheets.** A sheet handles one scoped task related to the current screen and then goes away. On iPhone it has a cancel control at the leading edge of its top bar and the confirming control at the trailing edge. It can rest at half height or full height, with a grabber showing it can be resized, and it dismisses with a downward swipe. One sheet at a time. Long or complex flows, and anything showing video full-frame, use a full-screen presentation.

**Switches.** On iPhone and iPad a switch belongs in a list row. Outside a list, a button that shows an on and off state does the job. The default "on" colour is green. A switch takes effect immediately. On the Mac, checkboxes handle settings with dependencies and switches emphasise important ones; neither goes in a toolbar.

**Sliders.** A track, a thumb and a filled portion from the minimum to the thumb. Minimum is at the leading side. Icons at either end can show what the extremes mean. On the Mac a slider can carry tick marks and show its value in a tooltip.

**Progress.** A bar or filling circle for work whose length is known; a spinner for work whose length is not. Apple prefers the known kind because it lets a person decide whether to wait. Progress moves at an even pace, switches from spinner to bar once the length becomes known, never switches between circle and bar, and comes with a short specific description. Long work offers Cancel, and Pause where cancelling would lose progress.

## How Apple's video apps edit

**Photos.** Trimming a video shows a filmstrip of its frames with a handle at each end. The handles are neutral until dragged and turn yellow while trimming, with the kept section framed in yellow.

**iMovie on iPhone.** Editing happens on a horizontal timeline of clips. Pinching zooms the timeline: zoomed in shows detail for trimming, zoomed out shows more clips.

**Final Cut Pro for iPad.** One editing screen with four regions: the viewer at the top for playback, the browser of media at the upper right, the timeline along the bottom, and an inspector that opens on the left from a control in the lower corner.

**Video playback.** Apple's guidance is to use the system player or match its behaviour. Video keeps its original aspect ratio; the player either fits it inside the frame or fills the frame and crops the edges. Controls floating over video use the clear glass variant.

## Mapping onto Clipper's screens

This section is my recommendation, derived from the rules above. It is not Apple's guidance for this app.

| Clipper screen or control | Phone | Desktop |
|---|---|---|
| Library and Settings | Two tabs in a floating bottom tab bar | Sidebar listing projects, with Settings at its foot |
| Opening a project | Pushes onto the stack with a back button and a large title | Selects the project in the sidebar |
| Review, Export, Results | Segmented control under the title | Segmented control in the centre of the toolbar |
| Candidate list | Grouped list; each row shows rank, title, time and score, with a chevron | Middle pane of a three-pane split view, selected row highlighted |
| Clip detail | Pushed screen: preview on top, details in grouped sections below | Detail pane: preview with the inspector beside it |
| Keep, Reject, Next | Bottom toolbar on glass | Trailing end of the toolbar |
| Reject reasons | Menu that opens from the Reject button | Menu that opens from the Reject button |
| In and out points | Filmstrip with handles that turn yellow while dragged, plus sentence and 0.2-second step buttons | The same, wider |
| Playback controls | Clear glass controls over the preview, with a dimming layer when the frame is bright | The same |
| Caption style and framing | Segmented controls | Segmented controls in the inspector |
| Hook title and safe zones | Switches in list rows | Switches in the inspector |
| New project | Sheet with Cancel at the leading edge and Find Clips at the trailing edge | Sheet centred over the window |
| Processing stages | One progress bar with the stage named beneath it | The same, in the project's sidebar row |
| Render queue | Progress bar per clip, then a Download button | The same |
| Settings | Grouped list with switches and menus | Grouped form |

Colour follows from the same rules. One accent, the system blue, marks the primary action on each screen. Green marks kept clips and red marks rejected ones, each with a label or symbol so the meaning does not depend on colour. Yellow is reserved for trim handles and the highlighted caption word, where Apple's own apps and short-video captions already use it. Glass appears on the tab bar, the toolbars, the sidebar and the controls over video; lists, forms and the inspector stay opaque.
