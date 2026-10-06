# Plan: m5-rendered-clips-and-export

Attempt: 1

## Findings

The code as M4 left it

- Nothing makes a clip file. A project's status can already read `exported`, and the web app
  gives such a project its tabs and a row that reads "Exported", but nothing sets that status.
  (`service/clipper/projects/project.py`, `web/src/project/open-project/lib/project-addresses.ts`,
  `web/src/library/list-projects/lib/describe-row-status.ts`)
- The Export tab is the prototype's empty state, drawn by the project capability, and the number
  beside the tab is the kept count. The tab's route hands the project screen nothing, where the
  Review tab reaches it as an element from its route.
  (`web/src/project/open-project/components/ProjectTabs.tsx`, `EmptyExport.tsx`,
  `ProjectScreen.tsx`, `web/src/app/projects/[id]/export/page.tsx`,
  `web/src/app/projects/[id]/review/layout.tsx`)
- The review package already works out what an export needs of a clip: its times from its
  points, its title, and its words grouped into captions in the three styles, beside the
  project's look. It gives them only inside the Review tab's whole answer. A candidate's platform
  texts are stored and served by the selection address alone, and the platforms chosen for a
  project are stored and appear in no answer. (`service/clipper/review/describe_review.py`,
  `caption_groups.py`, `service/clipper/selection/selection_records.py`,
  `service/clipper/projects/project.py`)
- The program runner reads a program's lines, ends it on the stop signal, and starts it in the
  service's own folder. The reader of ffmpeg's progress lines is private to the preview copy.
  (`service/clipper/media/run_media_tool.py`, `make_preview_copy.py`)
- Deleting a project stops it only while the pipeline is processing it.
  (`service/clipper/projects/delete_project.py`)
- `create_app` holds 18 statements of the 20 the hooks allow, and `main.py` seven top-level
  definitions of ten. `service/clipper/conftest.py` holds ten. (`service/clipper/main.py`)
- Bootstrap installs both requirements files as ready-made packages, without following their
  dependencies. (`scripts/bootstrap-project.mjs`)
- The shared icons lack the download arrow. The prototype's styles for the Export tab are in
  `pages.css`, copied in M1. (`web/src/shared/ui/Icon.tsx`, `web/src/shared/styles/pages.css`)
- Existing browser tests present a project without candidates as ready and read "No Kept Clips"
  on its Export tab. Some of those projects have no transcript. (`web/e2e/addresses.spec.ts`,
  `support/walk-screens.ts`, `support/present-as-ready.ts`)
- The Review tests find their shared talk by its `ready` status. `web/e2e/support/service-api.ts`
  and `walk-screens.ts` hold ten functions each. (`web/e2e/support/ready-talk.ts`)
- `pnpm test` passed all nine gates at `1663b2a`, with 860 service tests, 305 unit tests and 153
  browser tests in about 21 minutes (M4's `proof.md`, V1). Only mission documents changed between
  that commit and `29cb7b1`, where this milestone starts. (`git diff --stat 1663b2a 29cb7b1`)

The fixture

- The talk's six clips last 32.76, 33.18, 41.32, 41.30, 31.16 and 29.52 seconds. The first runs
  from 11.94 to 44.70 seconds, is titled "The worst day my bakery ever had" and has the hook
  title "The oven broke before sunrise". With keyword captions it shows "TELL YOU ABOUT" one
  second in, from 0.78 seconds, and "HAD" four seconds in, from 3.80. Every candidate carries a
  title and a description for each of the three platforms.
  (`docs/missions/clipper-tool/m4-the-review-workbench/evidence/talk-review.json`,
  `docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/talk-selection.json`,
  `fixtures/talk-transcript.json`)
- The talk's picture is colour bars of 1280 × 720. Measured on one frame: its middle 9:16 part
  is cyan at the left edge, green in the middle and magenta at the right edge, 30% down, and its
  upper three quarters hold no white and no yellow pixel. White and yellow there in a rendered
  frame come from the overlays, and the three colours in that order show a centred crop.
  (`scripts/build-fixtures.mjs`)

The prototype

- The Export tab is one page: a notice when the source is gone, "Output" with the look and the
  format and "Change the look on the Review tab.", then one group for each kept clip with its
  title, a line `exports/01-c01.mp4 · 32.8 s`, its state at the right and its platform texts,
  each with Copy. The toolbar holds "Render 2 Clips" after the More button; while clips render
  it reads "Rendering…" with a spinner, switched off, beside Cancel. A row reads "Not rendered",
  shows a bar with "Waiting" or "Rendering", shows the reason with Retry, or offers "Download
  MP4". With no kept clip the page is "No Kept Clips" with "Go to Review".
  (`docs/prototype/src/project/export/render-export.js`, `export-actions.js`)
- It pretends in four places the app replaces: a timed bar in place of a render, a staged
  failure of the second clip at 40%, a message in place of the download, and one text for each
  platform where selection writes a title and a description.
  (`docs/prototype/src/project/export/simulate-render.js`, `stage-sample-failure.js`,
  `docs/prototype/src/project/sample-clips.js`)
- The row of an exported project carries a tick and reads "Exported · 6 clips exported, results
  logged". (`docs/prototype/src/library/render-project-row.js`, `sample-projects.js`)
- The preview's caption and hook title are sized by the frame's width: 7.3%, 10.6% and 5.6% of
  it for the three caption styles and 5% for the hook title, at the weights and places A113
  lists. (`web/src/shared/styles/player.css`)

Measured on this Mac on 2026-10-06, with throwaway files outside the worktree

- `opencv-python-headless` 5.0.0.93 is the newest release and `pillow` 12.3.0 is Pillow's. The
  ready-made OpenCV package for this Mac holds a folder of 99 bundled libraries, among them
  `libavcodec`, `libx264`, `libx265`, `libfribidi` and `libgnutls`, and its own notes read "All
  wheels ship with FFmpeg licensed under the LGPLv2.1". Pillow's package holds 18 libraries, each
  under a permissive licence by the list in its own licence file.
- OpenCV builds from its source release on this Mac in 226 to 229 seconds, four times out of
  four, the last time with exactly the settings below, with pip 26.0, the version in the
  project's environment, Apple clang 15 from the Command Line Tools and no CMake on the Mac: pip
  fetches CMake for the build. The settings: the requirements file
  forbids the ready-made package (`--no-binary opencv-python-headless`); pip gets
  `--build-constraint` with a file that pins `cmake` 4.4.4, `distro` 1.9.0, `packaging` 26.3,
  `pip` 26.2.1, `scikit-build` 0.19.1, `setuptools` 69.5.1 and `wheel` 0.48.0; the environment of
  that pip run holds `ENABLE_HEADLESS=1`, `MAKEFLAGS=-j` with the number of processors, and
  `CMAKE_ARGS` with these switches: `WITH_FFMPEG`, `WITH_AVFOUNDATION`, `WITH_GSTREAMER`,
  `WITH_OPENEXR`, `WITH_AVIF`, `WITH_JPEGXL`, `WITH_OPENJPEG`, `WITH_JASPER`, `WITH_TIFF`,
  `WITH_WEBP`, `WITH_ITT`, `WITH_OPENCL`, `WITH_KLEIDICV` and `WITH_UNIFONT` set to `OFF`;
  `BUILD_JPEG`, `BUILD_PNG`, `BUILD_ZLIB` and `BUILD_PROTOBUF` set to `ON`;
  `BUILD_opencv_videoio` and `BUILD_opencv_highgui` set to `OFF`. The package's own build list
  pins the numpy headers it compiles against.
- What the switches are for. The `WITH_` ones for picture formats keep the build from linking
  Homebrew's copies of those libraries. `WITH_KLEIDICV` and `WITH_UNIFONT` stop the two
  downloads OpenCV otherwise makes while it is configured, a library from Arm's server and a font
  it builds in; with both off the build's log shows no download of OpenCV's own. Switching more
  modules off fails: with `features`, `flann`, `geometry` and others off, only `core` was left
  and the package could not be put together.
- The result is a package file of 13 MB with no folder of bundled libraries. Its one compiled
  file links AppKit, Accelerate, `libc++` and `libSystem` and nothing else. Its build information
  names libprotobuf, libjpeg-turbo, libpng, zlib and OpenCV's ARM routines as what was compiled
  in, lists `highgui`, `videoio` and `world` as disabled, and has no line about FFmpeg. A build
  that took the font in prints "Built-in Unicode font: YES"; this one has no such line. A second
  run of the same pip command builds nothing.
- pip keeps a package it has built in its cache and reuses it for the same release. The trial
  builds were taken out of that cache again, so the first bootstrap on this Mac builds.
- `mypy --strict` passes on code that calls OpenCV's face detector and Pillow's drawing, with the
  type information both packages ship.
- The YuNet model `face_detection_yunet_2026may.onnx`, 229,738 bytes, SHA-256
  `ebafce4e3c118d6554634be5c27ab333b4c047a9a8c3faf1d7cf93101c22f0f0`, is at
  `https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/`, beside its
  `LICENSE`, the MIT licence of Shiqi Yu, 2020. With the built OpenCV it finds the portrait's
  face with a score of 0.92 at widths of 600, 320 and 160 pixels, both faces in every sampled
  frame of a video that holds the portrait twice, and no face in the colour bars at scores of
  0.3, 0.6 and 0.9. Forty pictures of 640 × 360 take 0.26 seconds. The detector gives each face
  as a box and a score. OpenCV prints a warning for each detector it makes unless its log level
  is raised to errors.
- The portrait's original is 2200 × 2835, 3,898,023 bytes, SHA-256
  `f5e79a35f74b54e0435dfc87f5956d6917725e2f5b8c17932ecf5bad704e29b2`, at
  `https://upload.wikimedia.org/wikipedia/commons/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg`.
  Wikimedia Commons marks it public domain, by Alexander Gardner, 8 November 1863, and asks for
  a browser-like name in the request. ffmpeg reduces it to 600 × 774 and 55 KB with a width of
  600 and JPEG quality 3.
- Pillow draws from `InterVariable.ttf` at any weight once the font's two axes are set, optical
  size from 14 to 32 and weight from 100 to 900. A frame-sized overlay with a hook title and a
  caption is drawn in 0.06 seconds and saved as a PNG in 0.02. Inter holds Latin, Greek and
  Cyrillic letters and no Japanese, Korean, Arabic, Devanagari or Thai ones; a missing character
  draws the same box as any other missing one. The Mac has
  `/System/Library/Fonts/Supplemental/Arial Unicode.ttf`. Pillow 12.3.0 marks reading pixels
  with `getdata` as deprecated; numpy reads them.
- ffmpeg 8.1.2 renders a clip in one run. The source is opened at the in point for the clip's
  length. A crop filter takes a new place for every frame from a file of timed commands, and a
  place written as a share of the picture's width works there. A command that names `crop`
  reaches every crop filter of the run: with two crops, each needs a name of its own, as in
  `crop@top`, and its commands that name. The overlays are a list of pictures with a length for
  each, read as a second input and laid over the video; the picture shown changes within a
  frame of the listed moment. Results: 1080 × 1920, 30 frames a second, H.264 High with AAC, 8.000
  seconds for an 8-second clip, in 2 to 4 seconds; frames of the three framings of one clip
  differ, the moving face stays in the middle of the Speaker framing, and the detector finds the
  faces in frames of all three reduced to 270 × 480.
- Started in a folder whose name holds a space, a colon, an apostrophe, brackets and a comma,
  with its command file and its pictures named without their folder, ffmpeg renders the same.
  Named with its whole path inside the filter, such a file needs escaping.
- A video stored on its side: ffprobe reports the stored 1280 × 720 with a rotation of 90, and
  ffmpeg decodes frames of 720 × 1280.
- In the browser the tests drive, Playwright 1.63.0's headless shell: at `http://localhost` the
  page is a secure one, writes to the clipboard, and reads it back once the test grants both
  clipboard permissions. At the Mac's address on the local network, which is how a phone opens
  the tool, the page is not secure and has no clipboard interface; selecting a text field and
  using the browser's older copy command returns true there, and a page at `localhost` then
  reads that text from the clipboard. A link marked as a download, to an answer marked as an
  attachment, raises Playwright's download event with the answer's file name.

Library documentation, read through Context7

- OpenCV 5.0 (`/websites/opencv_5_0`): the face detector is made from a model file, an input
  size and a score threshold, its input size can be set again, and each face it returns is 15
  numbers, the box first and the score last.
- Pillow 12.3.0 (`/python-pillow/pillow/12.3.0`): a variable font's axes are read and set on the
  loaded font; text is drawn at an anchor; a rectangle is drawn with rounded corners.

The rules every write passes through

- `AGENTS.md` lists the coding-standards rules. Before each commit, format the Python code and
  run the standards review over the task's source files; it must print no finding without
  `[advisory]`. A file holds at most ten top-level functions or classes, and a function at most
  twenty statements, a test's function among them.
- No hook refuses a write to any file named below. The model file, the portrait, the evidence
  frames and the captures are binary files, placed with a command and never given to the
  standards review. The hook that scans writes for secrets passes the test key (A58).
- The eight copied stylesheets are not edited. A rule the Export tab needs beyond them goes into
  `app.css`.
- `service/clipper/rendering` and `web/e2e/support` end with more source files flat than the
  coding standards advise, as A79, A85 and A106 record for other folders. Each file is named
  below at its flat path, and the service's recorded layout is one flat package for a capability.
- New fixtures of the service's tests go into `service/clipper/rendering/conftest.py`.
- `AGENTS.md` fixes which package imports which. T1 and T11 write the new directions into it
  before code follows them.

What the spec's file list leaves out

- The spec lists the rendering package, `main.py`, the requirements, the fixtures, the export
  capability, `web/src/app/` and `web/e2e/`. This milestone also changes `scripts/` (bootstrap
  and the fixture builder), `service/build-constraints.txt`, `service/clipper/media/` (a start
  folder for a program, pictures of a stretch of video), `service/clipper/storage/` (a migration
  and the places of exports), `service/clipper/projects/` (the export count and the stop before
  a delete), `service/clipper/pipeline/` (telling a full disk), `service/clipper/review/` (a
  project's clips as they stand), `web/src/project/` (the Export tab comes from the route),
  `web/src/library/` (the exported row), `web/src/shared/` (one icon and the app's stylesheet),
  both recorded layouts, `README.md` and `AGENTS.md`.

## Tasks

- [ ] T1 — Add OpenCV built without FFmpeg, Pillow and the face detector, and find the faces in
  a picture
  Files: `service/requirements.txt`, `service/build-constraints.txt`,
  `scripts/bootstrap-project.mjs`, `service/clipper/rendering/__init__.py`,
  `service/clipper/rendering/find_faces.py`, `service/clipper/rendering/test_find_faces.py`,
  `service/clipper/rendering/test_opencv_build.py`,
  `service/clipper/rendering/yunet/face_detection_yunet_2026may.onnx`,
  `service/clipper/rendering/yunet/LICENSE`, `fixtures/portrait.jpg`,
  `fixtures/portrait-source.md`, `fixtures/README.md`, `service/.coding-standards-structure`,
  `AGENTS.md`, `README.md`
  Done: the requirements name `opencv-python-headless` 5.0.0.93 and `pillow` 12.3.0 and forbid
  the ready-made OpenCV package. `pnpm bootstrap` installs them with the settings the Findings
  give, says before the install that the first setup compiles OpenCV for about four minutes, and
  builds nothing when run again. The model file has the size and the checksum the Findings give,
  and the licence beside it is the zoo's. The portrait is A121's photograph, reduced as the
  Findings say, and the note beside it gives its title, its author, its date, its address on
  Wikimedia Commons, the original's checksum and that it is in the public domain;
  `fixtures/README.md` names both files. The service's recorded layout lists `rendering/`.
  `AGENTS.md` says how OpenCV is built and why, that the guard test below must pass after any
  reinstall, and that `rendering`, the package behind the Export tab, imports `review`,
  `selection`, `projects`, `pipeline`, `media` and `storage`, with nothing but `main.py`
  importing it. `README.md` says in its setup section that the first setup compiles OpenCV and
  how long that takes. A picture's faces are found by A112: reduced first, each face given as
  the shares of the picture its box covers, the largest first, with OpenCV's warnings kept out
  of the log. Tests: the installed OpenCV names no FFmpeg in its build information, lists video
  reading among its disabled parts, has no built-in font and carries no folder of bundled
  libraries; the portrait gives one face, between a fifth and three quarters of the way across
  and in the upper two thirds of the picture; the portrait enlarged to 2,400 px wide gives the
  same face; a plain grey picture gives none; a picture that holds the portrait at two sizes
  gives two faces, the larger first. `pnpm test` exits 0.

- [ ] T2 — Build the portrait video with the fixtures
  Files: `scripts/build-fixtures.mjs`, `fixtures/README.md`,
  `service/clipper/rendering/conftest.py`, `service/clipper/rendering/test_portrait_fixture.py`
  Done: the fixture builder also writes `portrait.mp4` by A121, with its length stated as the
  other videos' lengths are (A90), and `fixtures/README.md` lists it with what it holds and why.
  The service's tests take it from a fixture of the rendering package. Tests: it is H.264 with
  AAC at 1280 × 720 and 30 frames a second and lasts twelve seconds to within two tenths; its
  picture ends within two tenths of a second of its sound; in a frame one second, six seconds
  and eleven seconds in the detector finds two faces, the larger right of the picture's middle
  and the smaller left of it; the larger face's middle lies between 5% and 9% of the picture's
  width further right at eleven seconds than at one.

- [ ] T3 — Render a clip with ffmpeg from a given layout and given overlay pictures
  Files: `service/clipper/media/run_media_tool.py`,
  `service/clipper/media/test_run_media_tool.py`, `service/clipper/media/__init__.py`,
  `service/clipper/rendering/render_plan.py`, `service/clipper/rendering/picture_filters.py`,
  `service/clipper/rendering/test_picture_filters.py`, `service/clipper/rendering/encode_clip.py`,
  `service/clipper/rendering/test_encode_clip.py`, `service/clipper/rendering/conftest.py`,
  `service/clipper/rendering/__init__.py`
  Done: the program runner can start a program in a given folder, and the media package gives
  its reader of ffmpeg's progress lines to other packages. A render plan names a source, an in
  point, a length, a work folder, a target, one of three layouts and a list of overlay pictures
  with the moment each starts. The layouts: one 9:16 part of the picture whose place is given
  for every thirtieth of a second; two 9:8 parts, one above the other, each with its places; and
  the whole picture over a blurred copy. Places are shares of the picture. One ffmpeg run, in the
  ways the Findings measured, writes the file A115 describes: started in the work folder, with a
  name of its own for every crop, under another name until it is whole. Its progress rises to
  100. A stop ends the run as the media package's stop and leaves neither the file nor its
  unfinished form; a failure of ffmpeg carries ffmpeg's last words, a full disk among them. Tests
  on videos built for them: for each layout ffprobe reports 1080 × 1920, 30 frames a second,
  H.264 and AAC, and a length within 0.1 seconds of the plan's, for lengths of 2.0 and 3.37
  seconds; sources at 25 and at 60 frames a second both give 30; on a video red on its left half
  and blue on its right, a place on the left gives a red frame, one on the right a blue one, and
  places that go from left to right give red at the start and blue at the end; the stacked
  layout shows the upper part's colour above and the lower part's below, each from its own
  places; the whole-picture layout shows red beside blue in the middle of the frame and neither
  pure colour at its top; an overlay listed from one second to two is in the frame at 1.5
  seconds and in neither the frame at 0.5 nor the one at 2.5; a video stored on its side is
  rendered as it plays; a work folder whose name holds a space, a colon and an apostrophe
  renders the same; a stop set during the run leaves no file; a source that is no video fails
  with ffmpeg's words.

- [ ] T4 — Work out the picture of each framing from a clip's faces
  Files: `service/clipper/rendering/follow_faces.py`,
  `service/clipper/rendering/test_follow_faces.py`, `service/clipper/rendering/frame_picture.py`,
  `service/clipper/rendering/test_frame_picture.py`, `service/clipper/rendering/__init__.py`
  Done: from the faces of a clip's moments, the picture's shape and the project's framing come
  the layout and the places of T3's plan, by A114. Tests, all on made-up faces: no face in any
  moment gives the middle of the picture; a face near an edge gives a part that stays inside the
  picture; a face that moves steadily is followed, and the place for each thirtieth of a second
  lies between the places of the moments around it; one moment's jump moves the part by no more
  than a fifth of the jump; a moment without a face takes the place of the nearest moment with
  one; of two faces that take turns at being 5% larger the part stays with the first, and it
  moves to a face that is a quarter larger; a picture as upright as the frame is shown whole,
  and a more upright one moves the part up and down; two faces in at least half of the moments
  give the stacked layout with the left face above, each part half the picture's width wide in
  a 16:9 picture; two faces in fewer than half give the Speaker layout; the Full Frame framing
  gives the whole-picture layout whatever the faces.

- [ ] T5 — Find the faces of a clip's stretch of the source
  Files: `service/clipper/media/sample_frames.py`, `service/clipper/media/test_sample_frames.py`,
  `service/clipper/media/__init__.py`, `service/clipper/rendering/sample_faces.py`,
  `service/clipper/rendering/test_sample_faces.py`, `service/clipper/rendering/__init__.py`
  Done: the media package writes pictures of a stretch of a video into a folder, a given number
  for each second and no longer than a given size on their longer side, as ffmpeg decodes them,
  and a stop ends the work. The rendering package takes a clip's stretch at A112's rate and
  size, searches each picture, and gives the faces of each moment with the picture's shape. It
  reports how far it is and leaves no picture behind, however it ends. Tests: six seconds of the
  portrait video give thirty moments, each with two faces, the larger right of the middle and
  further right in the last moment than in the first; the talk gives moments without a face; a
  stretch that runs past the video's end gives the moments the video has and does not fail; a
  video stored on its side gives an upright shape; a stop set during the work ends it and leaves
  the folder empty.

- [ ] T6 — Draw the captions and the hook title as pictures, and say when each shows
  Files: `service/clipper/rendering/overlay_timeline.py`,
  `service/clipper/rendering/test_overlay_timeline.py`,
  `service/clipper/rendering/draw_overlays.py`, `service/clipper/rendering/test_draw_overlays.py`,
  `service/clipper/rendering/__init__.py`
  Done: from a clip's captions in one style (A97), its length and the hook title switch comes
  the list of moments at which the overlay changes: nothing before the first caption starts
  (A107), each caption from its start until the next one starts, the last until the clip ends,
  and the hook title over the first three seconds. A caption that starts before the in point
  shows from the first frame, and one that starts after the out point is left out. Each distinct
  overlay is drawn once, by A113, from the Inter file in the web app's public files (A15), and
  written as a picture into the work folder. Tests of the list: a caption at the first frame; a
  first caption half a second in; the switch off; a caption that spans the third second appears
  once with the hook title and once without; a clip of two seconds keeps the hook title to its
  end. Tests of the pictures, read back as pixels: a picture is 1080 × 1920 and clear outside the
  caption and the hook title's box; the box starts 10% down, leaves 9% free on each side and is
  white with dark letters; the caption's top edge lies 60%, 45% or 68% down for the three
  framings; a keyword caption is in capitals with yellow only inside the highlighted word, an
  Each Word caption is larger, and a Plain caption keeps its small letters; a caption of six
  long words wraps onto a second line inside the box; a word of thirty letters is drawn smaller
  and stays inside the box; the letters are Inter's, as wide as Pillow measures them at that
  weight and wider than at weight 400; a caption in Japanese is drawn in other shapes than
  Inter's missing-character box; the file the drawing reads has the checksum of M4's Findings.

- [ ] T7 — Render a kept clip of a project
  Files: `service/clipper/review/describe_review.py`,
  `service/clipper/review/test_describe_review.py`, `service/clipper/review/__init__.py`,
  `service/clipper/storage/data_folder.py`, `service/clipper/storage/test_data_folder.py`,
  `service/clipper/rendering/render_clip.py`, `service/clipper/rendering/test_render_clip.py`,
  `service/clipper/rendering/conftest.py`, `service/clipper/rendering/__init__.py`
  Done: the data folder knows where a project's exports, a clip's export and a render's work
  folder are kept (A115). The review package gives a project's clips as they stand to another
  package: for each its decision, its title, its times and its captions in a style, with the
  project's look; the Review tab's answer is unchanged. Rendering a clip reads the clip and the
  look, takes the project's source, finds the faces of its stretch (T5), works out the picture
  (T4), draws the overlays (T6) and encodes (T3) into the clip's export file. Its progress
  follows A116. It empties the work folder first, of what a killed tool left, and removes it
  when it ends, however it ends. A project without a source fails with A120's own failure. Tests
  on the cut talk of the review package's fixtures, with the built `talk.mp4` as its source, and
  on a project cut from made-up words over `portrait.mp4`: the talk's first clip with keyword
  captions and the hook title is 32.76 seconds long to within 0.1, and its frame at one second
  shows the hook title and the caption of that moment by A122's measure, its frame at four
  seconds shows that moment's caption and not the hook title, and both show cyan, green and
  magenta from left to right above the caption; with the switch off the frame at one second
  does not show the hook title; in each of the two other caption styles a frame shows that
  style's caption; a clip moved by a nudge and by a sentence is as long as the review says; one
  clip of the portrait video in the three framings gives three frames that differ from each
  other; in the Speaker framing the detector finds one whole face in the frame at one, three and
  five seconds, its middle in the middle third of the width; in the Stacked framing it finds a
  face in the upper half and one in the lower; in the Full Frame it finds two side by side; the
  Stacked framing on the talk gives the Speaker picture; a stop leaves no file and no work
  folder; a source moved away fails as A120 says. The test of the three framings saves A122's
  three frames when `CLIPPER_EVIDENCE_DIR` is set.

- [ ] T8 — Store the renders and count a project's exports
  Files: `service/clipper/storage/open_database.py`,
  `service/clipper/storage/test_open_database.py`, `service/clipper/rendering/render_records.py`,
  `service/clipper/rendering/render_store.py`, `service/clipper/rendering/test_render_store.py`,
  `service/clipper/rendering/__init__.py`, `service/clipper/projects/project.py`,
  `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/projects/project_schemas.py`, `service/clipper/projects/describe_project.py`,
  `service/clipper/projects/test_router.py`
  Done: a seventh migration adds a table of renders, each row removed with its candidate, and
  the count of exports on the project. A database made by M4 opens with its projects, candidates
  and reviews unchanged and the count 0. A render holds A116's state, its percent, its reason,
  its place in the queue and whether a finished export of the clip is on the Mac. The store
  queues clips at the end in the order given and leaves a waiting or rendering one where it is;
  takes the oldest waiting render of any project and marks it rendering; raises its percent;
  marks it done, which also notes the export, counts the project's exports and makes a ready
  project exported (A119), in one transaction; marks it failed with a reason; cancels a
  project's waiting and rendering ones by A116; puts every rendering one back to waiting, ahead
  of the ones queued later; takes one clip out; and lists a project's renders. A project's JSON
  carries `exportedCount`. Tests: what is read back equals what was written; the oldest is taken
  first across two projects; a clip queued twice is in the queue once; done sets the count and
  the status and a second done of the same clip leaves the count; cancelling leaves a done and
  a failed one alone, removes a waiting one that has no export and returns one that has to done;
  a render put back after a restart is taken before a later one; deleting the project leaves no
  render; a project that is not ready keeps its status.

- [ ] T9 — Run the render queue
  Files: `service/clipper/pipeline/explain_failure.py`,
  `service/clipper/pipeline/test_explain_failure.py`, `service/clipper/pipeline/__init__.py`,
  `service/clipper/rendering/render_worker.py`, `service/clipper/rendering/test_render_worker.py`,
  `service/clipper/rendering/__init__.py`
  Done: the pipeline package tells other packages whether a failure is a full disk and gives its
  sentence for one. One worker, in a thread of its own, follows A116: it takes the oldest
  waiting render, renders it with the work it was handed, stores the percent at most four times
  a second, and marks the render done or failed with A120's reasons, logging the cause of a
  failure. It can be told to stop one project's render and answers once that render has ended.
  When it is shut down it ends the running render and leaves it in the queue. Tests, with
  stand-ins for the rendering work: three queued clips are rendered one after another in their
  order, never two at once; a stand-in that reports 40% leaves 40 stored while it runs; a full
  disk, a missing source and any other failure each leave their sentence, and the next clip is
  still rendered; a cancel during the second clip ends it, leaves the first done and renders
  neither the second nor the third; a clip that is no longer kept when its turn comes is taken
  out and not rendered; a shutdown during a render leaves it waiting, and a new worker on the
  same database renders it.

- [ ] T10 — Serve the export, and start, retry, cancel and download through the service
  Files: `service/clipper/rendering/export_schemas.py`,
  `service/clipper/rendering/describe_export.py`,
  `service/clipper/rendering/test_describe_export.py`,
  `service/clipper/rendering/queue_renders.py`, `service/clipper/rendering/test_queue_renders.py`,
  `service/clipper/rendering/router.py`, `service/clipper/rendering/test_router.py`,
  `service/clipper/rendering/test_whole_app.py`, `service/clipper/rendering/conftest.py`,
  `service/clipper/rendering/__init__.py`, `service/clipper/projects/delete_project.py`,
  `service/clipper/projects/test_delete_project.py`, `service/clipper/main.py`,
  `service/clipper/test_main.py`
  Done: the five addresses of A117 answer in its form, with its refusals. A render that is done
  while its file is missing is given as no render. The service makes the store and the worker
  once, starts the worker with the app, puts interrupted renders back first, and stops the
  worker when the app stops; `create_app` is split so that it and `main.py` stay inside the
  hooks' limits. Deleting a project asks the service to stop its work whatever its status, which
  stops a pipeline step and a render, and then removes the folder with its exports. Tests on the
  cut talk: every field under its name; only the kept clips, by rank; only the texts of the
  platforms chosen; a clip's length after a moved point; each state of a render as the answer
  gives it; a project with no kept clip, and one with no transcript, answer with no clips;
  queueing with the source gone answers 409 with A117's sentence and stores nothing; queueing a
  clip that is not kept and an unknown clip are refused; the file's answer is `video/mp4`,
  marked as an attachment under A115's name, also for a title with a slash and one in Japanese;
  a clip without a file answers 404. Through the whole app, once for several tests: the uploaded
  talk with a key ends ready; its first and second clips are kept and queued; both end done with
  rising percents on the way; ffprobe reports each file as 1080 × 1920, 30 frames a second, H.264
  with AAC, within 0.1 seconds of its clip's length; the first clip's frames at one and at four
  seconds pass T7's measures; the project reads `exported` with a count of 2; a cancel during a
  third clip's render leaves the two files and no third; an app stopped during a render and
  started again on the same data finishes that render; deleting the project removes its exports.
  The run saves A122's `talk-exports.json` and the two frames of the first clip when
  `CLIPPER_EVIDENCE_DIR` is set. `pnpm test` exits 0, the browser tests that present a project
  without candidates as ready among them.

- [ ] T11 — Hold a project's export in the web app
  Files: `web/.coding-standards-structure`, `AGENTS.md`, `web/src/export/index.ts`,
  `web/src/export/export.types.ts`, `web/src/export/export.fixtures.ts`,
  `web/src/export/open-export/index.ts`, `web/src/export/open-export/api/fetch-export.ts`,
  `web/src/export/open-export/lib/export-store.ts`,
  `web/src/export/open-export/lib/export-store.test.ts`,
  `web/src/export/open-export/lib/describe-output.ts`,
  `web/src/export/open-export/lib/describe-output.test.ts`,
  `web/src/export/open-export/hooks/use-export.ts`, `web/src/export/render-clips/index.ts`,
  `web/src/export/render-clips/api/start-renders.ts`,
  `web/src/export/render-clips/api/retry-render.ts`,
  `web/src/export/render-clips/api/cancel-renders.ts`,
  `web/src/export/render-clips/lib/describe-render.ts`,
  `web/src/export/render-clips/lib/describe-render.test.ts`
  Done: the web app's recorded layout lists the export capability with three use cases: open the
  export, render clips and copy text. `AGENTS.md` says that `export`, the Export tab, imports
  `project`, `library`, `shell` and `shared`, that nothing but `app/` imports it, and that it
  reads its own address and nothing of `review`. The types describe A117's answer. One store for
  each project holds the export: it fetches it, asks again once a second while a clip is waiting
  or rendering and somebody is watching, and stops asking when neither holds. Render, Retry and
  Cancel send their request and put the service's answer in the store; a refusal gives the
  problem to be shown and leaves what the service holds. Plain rules give the sentence of the
  look as the prototype words it, "Keyword captions, speaker framing, hook title on"; the format
  line "1080 × 1920, 30 fps, H.264 MP4"; a clip's file line, `exports/01-c01.mp4 · 32.8 s`; the
  words of the Render button for one clip, for several and while rendering; whether the project
  is rendering; and what a row shows for each state of A120. Unit tests, with a stand-in for the
  service and a clock the test moves: each rule; asking again every second while a clip renders
  and no more once all are done; no asking with nobody watching; an answer put in place after
  Render and after Cancel; a refusal.

- [ ] T12 — Open the Export tab: the output, the kept clips and the state of each
  Files: `web/src/app/projects/[id]/export/page.tsx`,
  `web/src/project/open-project/components/ProjectScreen.tsx`,
  `web/src/project/open-project/components/ProjectTabs.tsx`,
  `web/src/project/open-project/components/EmptyExport.tsx`, `web/src/export/index.ts`,
  `web/src/export/open-export/index.ts`, `web/src/export/open-export/components/ExportTab.tsx`,
  `web/src/export/open-export/components/EmptyExport.tsx`,
  `web/src/export/open-export/components/OutputSection.tsx`,
  `web/src/export/open-export/components/ExportClip.tsx`,
  `web/src/export/open-export/components/SourceGoneNotice.tsx`,
  `web/src/export/render-clips/index.ts`,
  `web/src/export/render-clips/components/RenderStatus.tsx`, `web/src/shared/ui/Icon.tsx`,
  `web/src/shared/styles/app.css`, `web/e2e/support/ready-talk.ts`,
  `web/e2e/support/tool-test.ts`, `web/e2e/support/read-export.ts`,
  `web/e2e/support/export-page.ts`, `web/e2e/support/probe-export.ts`, `web/e2e/support/index.ts`,
  `web/e2e/export-tab.spec.ts`
  Done: the project screen takes the Export tab from its route and shows it inside the open
  project, as it takes the Review tab. The empty state leaves the project capability, whose file
  for it is removed, and the export capability draws it, unchanged, for a project with no kept
  clip. With kept clips the tab follows the prototype's markup, ids included: "Output" with the
  look's sentence, the format line and "Change the look on the Review tab."; then one group for
  each kept clip in the order of the ranks, with its title, its file line and its state by A120,
  the bar named and labelled as the prototype's. A finished clip's "Download MP4" is a link to
  the file's address, marked as a download and named "Download MP4 of" its title. With the
  source gone A120's notice stands above "Output". The rows follow the service while clips
  render, and when a clip finishes the Library is asked for its rows again. The icons gain the
  prototype's download arrow. A browser check that renders takes a talk of its own from a
  fixture that deletes every project, makes the talk from a link and waits until it is ready
  (A122); helpers read the export from the service, start and cancel renders there, read the
  tab's rows from the page and ask ffprobe about a saved file. Browser tests at 1360 px: a talk
  with no kept clip shows "No Kept Clips", and "Go to Review" leads to the Review tab; with two
  clips kept, the tab shows the look's sentence, the format line and two groups, in the order of
  the ranks, with their titles, their file lines and "Not rendered"; after the look is changed on
  the Review tab the sentence follows; with the two longest clips kept and queued through the
  service, the first row reads "Rendering" with a bar whose value rises between two readings
  and the second "Waiting"; after a reload each row shows the state the service holds for it at
  that moment, the first with a value no lower than before the reload unless it has finished;
  both rows end in "Download MP4"; the link saves a file whose name ends in `.mp4` and holds the
  clip's title,
  from an answer that is `video/mp4` and marked as an attachment, and ffprobe reports the saved
  file as 1080 × 1920, 30 frames a second, H.264 with AAC, within 0.1 seconds of the length in
  the row; with the source moved aside the notice shows and the finished clip still downloads.
  `pnpm test` exits 0.

- [ ] T13 — Render, Cancel and Retry from the tab
  Files: `web/src/export/render-clips/index.ts`,
  `web/src/export/render-clips/components/RenderActions.tsx`,
  `web/src/export/render-clips/components/RenderStatus.tsx`,
  `web/src/export/open-export/components/ExportTab.tsx`,
  `web/src/export/open-export/components/ExportClip.tsx`, `web/src/shared/styles/app.css`,
  `web/e2e/support/export-page.ts`, `web/e2e/support/index.ts`, `web/e2e/export-render.spec.ts`,
  `web/e2e/export-cancel.spec.ts`, `web/e2e/export-retry.spec.ts`
  Done: the toolbar holds the prototype's actions after the More button, with its markup and
  ids: "Render 2 Clips", or "Render 1 Clip", which queues the kept clips; while clips wait or
  render, "Rendering…" with the spinner, switched off, and Cancel before it. With the source
  gone Render is switched off. A failed row shows its reason as an alert and Retry, which queues
  that clip. A refusal of the service shows its sentence as a toast. Browser tests on a talk of
  their own, at 1360 px: with two clips kept, Render leaves the button reading "Rendering…",
  switched off, beside Cancel; each row shows a bar while it waits or renders, and the rendering
  row's value rises; both end in "Download MP4" and the button reads "Render 2 Clips" again.
  With three clips kept, Cancel pressed once the first row offers its download and the second
  is rendering leaves the first row's download, its file among the project's exports and no
  other file there, and the second and third rows at "Not rendered" with the button at "Render
  3 Clips". With a file that is no video in
  the source's place, Render ends in a row that shows "This clip could not be rendered. Retry to
  render it again." with Retry; with the source back, Retry ends in "Download MP4". With the
  source moved aside, Render is switched off under the notice. At 390 px the same actions are in
  the top bar, Render queues the clips, and "Download MP4" saves the file.

- [ ] T14 — Show each platform's title and description with Copy
  Files: `web/src/export/copy-text/index.ts`, `web/src/export/copy-text/lib/copy-text.ts`,
  `web/src/export/copy-text/lib/copy-text.test.ts`, `web/src/export/copy-text/lib/text-rows.ts`,
  `web/src/export/copy-text/lib/text-rows.test.ts`,
  `web/src/export/copy-text/components/PlatformTexts.tsx`,
  `web/src/export/open-export/components/ExportClip.tsx`, `web/src/shared/styles/app.css`,
  `web/e2e/support/export-page.ts`, `web/e2e/support/index.ts`, `web/e2e/export-copy.spec.ts`
  Done: under each clip's head are A118's rows in the prototype's markup: the label, the text and
  a Copy control named as the prototype names it, "Copy TikTok description for" the clip's
  title. Copy follows A118, with its two messages. Unit tests, with stand-ins for the browser:
  the six rows of three platforms in order, and the two of one; the text handed to the clipboard
  interface when the page has one; the older copy command used when it has none, with the
  selection put back afterwards; the blocked message when both fail. Browser tests on the shared
  ready talk with its first clip kept, with the clipboard permissions granted: the clip shows
  six rows whose texts are the ones selection stored; each of the six Copy controls leaves that
  row's text on the clipboard and shows "Copied"; a project made for TikTok alone shows two
  rows; with the page's clipboard interface taken away, as at the Mac's network address, Copy
  still leaves the text on the clipboard, read from a second page.

- [ ] T15 — Show an exported project in the Library
  Files: `web/src/library/library.types.ts`,
  `web/src/library/list-projects/lib/describe-row-status.ts`,
  `web/src/library/list-projects/lib/describe-row-status.test.ts`,
  `web/src/library/list-projects/components/ProjectRowStatus.tsx`,
  `web/src/library/list-projects/lib/projects-store.test.ts`,
  `web/src/project/follow-progress/lib/describe-status.test.ts`,
  `web/src/project/open-project/lib/project-addresses.test.ts`,
  `web/e2e/support/crowded-review.ts`, `web/e2e/support/selection-screens.ts`,
  `web/e2e/export-render.spec.ts`
  Done: the web app knows a project's `exportedCount`. The row of an exported project reads
  "Exported · 2 clips exported", or "Exported · 1 clip exported", with the prototype's tick, in
  the Library and in the sidebar (A119). Unit tests cover both wordings and that a ready project
  keeps its own row. The browser test of T13 that renders two clips reads the row with its tick
  at 1360 px, in the sidebar, and at 390 px, in the Library. Every place that builds a project
  for a test carries the count.

- [ ] T16 — Fit the Export tab on a phone: 200% text, tap areas and contrast
  Files: `web/e2e/support/export-screens.ts`, `web/e2e/support/index.ts`,
  `web/e2e/export-fit.spec.ts`, `web/e2e/own-origin.spec.ts`, `web/src/shared/styles/app.css`,
  `web/src/export/open-export/components/ExportClip.tsx`,
  `web/src/export/render-clips/components/RenderActions.tsx`
  Done: the screens of the Export tab can be walked as the Review tab's are: the empty state; a
  talk with one clip finished and one not rendered; and an export presented to the page with
  twelve clips in every state of A120, titles of 110 characters, a reason of two sentences and
  descriptions of 300 characters, under the notice of a missing source. At 390 px, on each of
  them, with the measures the Review tab's check uses: at the normal text size and at 200%
  nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled
  to its end, the screen's last line lies above the tab bar; no control has a tap area under 44
  px; and in light and in dark no text measures under 4.5 to 1. At 1360 px the same screens meet
  the ratio in light and in dark. A rule a screen needs for this goes into the app's stylesheet,
  and the copied stylesheets stay as they are. The test that every request of every screen goes
  to the tool also opens the Export tab of a talk with a finished clip at both widths and saves
  its file.

- [ ] T17 — Save the frames, the probed files and the captures as evidence
  Files: `web/e2e/export-captures.spec.ts`, `web/e2e/support/export-screens.ts`,
  `web/e2e/support/index.ts`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/talk-exports.json`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/talk-c01-at-1s.jpg`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/talk-c01-at-4s.jpg`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/framing-follow-speaker.jpg`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/framing-stack-two.jpg`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/framing-whole-frame.jpg`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-390-light.png`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-390-dark.png`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-1360-light.png`,
  `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-1360-dark.png`
  Done: a browser test renders the first clip of a talk of its own, keeps the second, and
  captures the Export tab whole (A37) at 390 and 1360 px in light and in dark, checking each
  file as the Review captures are checked. The files go into `CLIPPER_EVIDENCE_DIR` when that is
  set and into the test output otherwise. The ten files of A122 are saved with the commands of
  validation blocks V3 and V17 and committed. No video is committed.

- [ ] T18 — Bring the README and the agents' instructions up to date
  Files: `README.md`, `AGENTS.md`, `fixtures/README.md`
  Done: `README.md` says what the Export tab does: that kept clips render one at a time into
  1080 × 1920 files with the captions and the hook title burned in, what the three framings do
  with faces and without, Cancel and Retry, Download on the Mac and on the phone, the platform
  texts with Copy, where the files are kept and that they stay until the project is deleted,
  and that the Review preview stays an approximation of them. Its section on what this version
  does not do yet starts after the export. Its setup section gives the time the first setup
  takes and its test section the time `pnpm test` takes now, both as measured. `AGENTS.md` names
  the rendering package and the export capability with their use cases and the direction of
  their imports; the OpenCV build, its guard test and the pinned build tools; the detector's
  model and its licence; how ffmpeg is driven for a render, with the named crops and the start
  in the work folder; the render queue beside the pipeline; the portrait video; the talk a
  rendering browser test makes for itself; and how a test makes a render fail and a source go
  missing. `fixtures/README.md` describes the portrait, its note and `portrait.mp4`. Each command
  in the three files was run as written.
