# Plan: m4-the-review-workbench

Attempt: 1

## Findings

The code as M3 left it

- A ready project has its candidates, its windows with their scores and its replay peaks in the
  database, and its folder holds the source, the preview copy and the transcript. Nothing serves
  the preview copy, and only the fetch step knows its file name.
  (`service/clipper/selection/selection_store.py`, `service/clipper/fetching/fetch_stage.py`,
  `service/clipper/storage/data_folder.py`)
- A candidate is stored with its start and its end in seconds and not with its sentences. Both
  times are those of a sentence's first and last word (A67), so its sentences are found again
  from the transcript. (`service/clipper/selection/selection_records.py`, `split_sentences.py`)
- The cut step holds no media tools, and the selection tests cut the talk from a transcript
  alone, with no video in the project's folder. (`service/clipper/selection/prepare_pass.py`,
  `cut_stage.py`, `conftest.py`)
- A project's count of candidates is a column that the selection store sets in the transaction
  that replaces the candidates. The projects package imports no other capability, so the counts
  of kept and rejected clips reach a project's JSON the same way.
  (`service/clipper/selection/selection_store.py`, `projects/project_repository.py`)
- `create_app` holds 18 statements of the 20 the hooks allow, and `service/clipper/conftest.py`
  holds ten top-level definitions, the most they allow. (`service/clipper/main.py`)
- The project screen draws the three tabs from one component: the prototype's empty list on the
  Review tab, a constant 0 as the Export tab's number, and the candidate count in the subtitle.
  It also decides between the status screen and the tabs. From 720 px `/` shows the newest
  project through the same screen. (`web/src/project/open-project/components/ProjectScreen.tsx`,
  `ProjectTabs.tsx`, `NewestProject.tsx`)
- The shell's menu has plain items only. The reject menu needs a title, a divider and items that
  show a tick. The app element carries the layout, the screen transition and the large-title
  state as data attributes, and the prototype's player styles select on one more, the place of
  the preview. A screen can already put a bar of its own where the tab bar is.
  (`web/src/shell/present-menu/components/Menu.tsx`, `frame-screens/components/AppShell.tsx`,
  `ScreenFrame.tsx`)
- The shared icons lack play, pause and replay. The shared time formats lack tenths of a second,
  the player's clock and a length in seconds. (`web/src/shared/ui/Icon.tsx`,
  `web/src/shared/lib/format-timecode.ts`)
- `web/public` does not exist. The start command already builds the web app again when a file
  under it changes. (`scripts/build-web-app.mjs`)
- The web app's unit tests run without a page (A26). A rule of the Review tab is therefore a
  plain function with a unit test, and what needs a page is tested in the browser.
- Existing browser tests present a project without candidates to the page as ready. They read
  "No clips in this group." on its Review tab, "Export0" among its tabs and "0 candidates" in its
  subtitle, and some of those projects have no transcript. Three files word the row of a ready
  project without counts. (`web/e2e/addresses.spec.ts`, `support/walk-screens.ts`,
  `support/present-as-ready.ts`, `selection.spec.ts`, `selection-progress.spec.ts`,
  `support/selection-screens.ts`)
- `web/e2e/api-key.spec.ts` fetches every answer of every page itself, at 390 px, where the
  Review address is the list and loads no video. `web/e2e/support/walk-screens.ts` and
  `service-api.ts` hold ten top-level functions each.
- `pnpm test` passed all nine gates at `ddea123`, with 676 service tests, 139 unit tests and 91
  browser tests in 11.8 minutes (M3's `proof.md`, V2). Only mission documents changed between
  that commit and `6d9c04a`, where this milestone starts. (`git diff --stat ddea123 6d9c04a`)

The fixture

- The talk ends ready with six candidates, `c01` to `c06`, on sentences 4–12, 23–30, 13–22,
  31–40, 41–47 and 48–51 of 54, between 29.5 and 41.3 seconds long, all inside the preferred
  band. `c04` is flagged as needing context and `c06` as not recommended. No candidate carries
  the replay marker, because an upload and the fixture server's link have no graph. Three of its
  four windows are shortlisted. It lasts 234.94 seconds and was created with the 25–60 s preset.
  (`docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/talk-selection.json`)
- With three sentences on each side (A93) the six clips reach sentences 1–15, 20–33, 10–25,
  28–43, 38–50 and 45–54. Inside those stretches every state of the length reading can be
  reached: `c03` lasts 52.6 seconds with its out point on sentence 25, `c04` lasts 65.3 seconds
  from sentence 28 to 43, and `c06` lasts 4.7 seconds when it ends on sentence 48.
- The talk's picture is still colour bars, so every frame of it looks the same. A browser check
  can tell a frame of the talk from a drawn stand-in by its colours. Telling one moment from
  another takes a video whose picture changes, which a service test builds for itself.
  (`scripts/build-fixtures.mjs`, `service/clipper/conftest.py`)

The prototype

- The Review tab is a split view: a list pane with the source timeline and the candidate list,
  and a detail pane with the preview beside the inspector. The inspector holds the title field,
  the flag, "Why This Clip", "In and Out Points", "Look" and "Transcript". Below 720 px the list
  pane comes first with the candidates above the timeline, a clip is a pushed screen titled
  "Clip 3 of 8" with "Clips" as its back control, and Reject, Keep and Next sit in a bar at the
  bottom; from 720 px they sit in the toolbar after the More button.
  (`docs/prototype/src/project/review/render-review.js`, `render-candidate-list.js`,
  `render-source-timeline.js`, `docs/prototype/src/project/clip-inspector/render-decision.js`,
  `render-clip-inspector.js`)
- Its rules are the ones A92 to A98 keep: Keep toggles, a rejection takes one of four reasons or
  none, a sentence step resets the nudge, five nudge steps each way, the "needs context" flag
  hidden while the in point sits earlier, captions of three, one and six words that end with
  their sentence, a hook title for three seconds, and a preview that pins itself once less than a
  quarter of it is in view. (`docs/prototype/src/project/move-edge.js`, `clip-review.js`,
  `clip-timing.js`, `docs/prototype/src/project/clip-preview/build-captions.js`, `play-clip.js`,
  `dock-preview.js`, `docs/prototype/src/project/clip-trim/drag-trim.js`)
- It pretends in five places the app replaces: sample clips with made-up word times, drawn
  figures in place of the video, drawn frames in the filmstrip, a clock in place of playback, and
  a fixed 15–25–50–60 band whatever the project's preset.
- `docs/prototype/styles/review.css` and `player.css` are not yet copied. They use only tokens
  the app already has. The five stylesheets copied in M1 are still the prototype's byte for byte.
- Measured on the prototype's Review screens at 390 px with the app's own text measure, at the
  normal size and at 200%, once the screen's entry motion has ended: no sideways scroll and no
  cut label on the list, on a clip and with the reject menu open. No control there has a tap area
  under 44 px by the measure of A103. Three texts measure under 4.5 to 1 (A102).

Measured on this Mac on 2026-10-06, with throwaway files outside the worktree

- The browser the tests drive is Playwright 1.63.0's headless shell (`.cache/playwright`). It
  plays H.264 with AAC: a 720p file loaded, jumped to 25.5 seconds and played on, without a tap.
- Through a rewrite of the test build of the web app, with a stand-in for the service: a byte
  range came back as 206 with its `Content-Range`, a 328 MB file passed whole with the same bytes
  and its first byte after 2 ms, and a fifteen-minute video played, stayed paused for forty
  seconds, played on, and jumped to 800 seconds and back to 120, each from a new range request.
  The thirty-second limit of a forwarded request did not end a paused video.
- Starlette 1.7.0, which the service pins, answers a byte range of a file with 206 and a range
  past its end with 416. (`service/.venv/lib/python3.12/site-packages/starlette/responses.py`)
- Next.js 16.3.8, in a throwaway app with a layout over a list page and a page for each clip
  that draw nothing: the layout's screen stayed mounted from the list to a clip, from clip to
  clip, and back, and a scrolling pane inside it kept its place. A reload, and arriving from
  another tab, mount it anew. A link to a clip did not move the window, so a phone screen has to
  go to its top itself. The browser's Back, and a step back in history from the page, returned
  the window to where the list was left; a link to the list did not, so the screen keeps the
  list's place itself for the back control, which is a link. The clip in the address reached the
  screen through the route's parameters after a link, and not after the browser's own
  `pushState`, so clips are chosen with links.
- A second picture drawn from the playing video onto a canvas, on every frame the browser
  presents, followed it in the tests' browser: 59 drawings in two seconds and one after a jump.
  Inter's variable font file loaded from a font face at weight 900, and a screen capture showed
  the video's picture.
- Frames with ffmpeg 8.1.2: twelve commands, one frame each, took 1.0 second for the talk and 1.4
  for a moving 720p picture. One command for all twelve took 0.4 and 0.6 seconds, and wrote none
  of them when one moment lay after the picture's end. (A95)
- Inter 4.1 is the newest release, at
  `https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip`. It holds
  `InterVariable.ttf`, 879,708 bytes, SHA-256
  `4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf`, and `LICENSE.txt`, the SIL
  Open Font License 1.1, 4,380 bytes, SHA-256
  `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a`. A browser reads the
  variable TrueType file, and so can the export of M5, which draws from the same copy (A15).

Next.js, read from its documentation through Context7 (`/vercel/next.js`)

- A layout keeps its state and is not drawn again when the address moves between its pages. A
  client component under it reads the page's part of the address from the route's parameters.

The rules every write passes through

- `AGENTS.md` lists the coding-standards rules. Before each commit, format the Python code and
  run the standards review over the task's source files; it must print no finding without
  `[advisory]`. A file holds at most ten top-level functions or classes, and a function at most
  twenty statements, a browser test's page function among them.
- A use-case folder is reached through its `index.ts`. The parts of the Review tab therefore take
  what they show as properties from the one use case that holds the review, and none of them
  imports it back.
- The six stylesheets copied in M1 are not edited, and neither are the two this milestone copies.
  A rule the Review tab needs beyond them goes into `app.css`.
- No hook refuses a write to any file named below. The font file and the captures are binary
  files, placed with a command and never given to the standards review.
- Seven tasks add readers of the Review tab to `web/e2e/support/review-page.ts`. Before it would
  pass ten functions, the readers of one part of the tab move into a file beside it, named after
  that part.

What the spec's file list leaves out

- The spec lists the review and selection packages and `main.py`. This milestone also changes
  `service/clipper/storage/` (a migration and two places in the data folder),
  `service/clipper/projects/` (two counts), `service/clipper/media/` (one frame of a video) and
  `service/clipper/fetching/` (the preview copy's place). In the web app it also changes
  `web/src/project/` (the frame and the open project are handed to the Review tab) and
  `web/src/shell/` (the menu's parts and the preview's place on the app element). Both recorded
  layouts, `README.md` and `AGENTS.md` change too.

## Tasks

- [x] T1 — Serve the preview copy with byte ranges, and play it through the web app
  Files: `service/clipper/storage/data_folder.py`, `service/clipper/storage/test_data_folder.py`,
  `service/clipper/fetching/fetch_stage.py`, `service/clipper/review/__init__.py`,
  `service/clipper/review/router.py`, `service/clipper/review/test_router.py`,
  `service/clipper/main.py`, `service/.coding-standards-structure`, `AGENTS.md`,
  `web/e2e/review-preview.spec.ts`
  Done: the data folder knows where a project's preview copy is kept, and the fetch step takes
  the place from it. `GET /api/projects/<id>/preview` answers the preview copy as `video/mp4`. A
  request for a byte range is answered 206 with that range and the file's whole size, and a range
  past the end 416. An unknown project answers the 404 of the other project addresses, and a
  project without a preview copy answers 404 with "This project has no preview copy on this
  Mac." in the app's problem form. The service's recorded layout lists `review/`. `AGENTS.md`
  names the package and what it imports: `selection`, `transcription`, `projects`, `media` and
  `storage`, with nothing but `main.py` importing it. Service tests cover each answer. A browser
  test fetches a link to the talk and, at the tool's own address, finds that a range request
  through the web port answers 206 with the range, and that a video element given the preview
  address reports the project's length, plays so that its time advances, and plays on from a
  later moment after a jump there. `pnpm test` exits 0.

- [x] T2 — Store a clip's review and a project's look, and count kept and rejected clips
  Files: `service/clipper/storage/open_database.py`,
  `service/clipper/storage/test_open_database.py`, `service/clipper/review/review_records.py`,
  `service/clipper/review/review_store.py`, `service/clipper/review/test_review_store.py`,
  `service/clipper/review/conftest.py`, `service/clipper/review/__init__.py`,
  `service/clipper/projects/project.py`, `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/projects/project_schemas.py`, `service/clipper/projects/describe_project.py`,
  `service/clipper/projects/test_router.py`, `service/clipper/selection/selection_store.py`,
  `service/clipper/selection/test_selection_store.py`
  Done: a sixth migration adds a table of clip reviews, each row removed with its candidate, a
  table of looks, each row removed with its project, and the counts of kept and rejected clips on
  the project. A database made by M3 opens with its projects and candidates unchanged and both
  counts 0. A review holds A92's decision and reason, the edited title or none, and A93's
  sentence and nudge for each point. The store reads a project's reviews by clip, and saves one
  review and sets the project's two counts in one transaction. It reads a project's look, A96's
  starting look when none is stored, and saves one. Replacing a project's candidates removes its
  reviews and sets both counts to 0. A project's JSON carries `keptCount` and `rejectedCount`.
  The package's test fixtures hold a cut talk: the committed transcript and six candidates on the
  talk's six parts, stored without asking for them. Tests: what is read back equals what was
  written; the counts follow a keep, a reject and a return to undecided, each in its own project;
  a second save of a clip replaces the first; deleting the project leaves no review and no look;
  cutting again leaves no review and both counts 0.

- [x] T3 — Work out where a clip's points can go
  Files: `service/clipper/review/trim_reach.py`, `service/clipper/review/test_trim_reach.py`,
  `service/clipper/review/clip_points.py`, `service/clipper/review/test_clip_points.py`,
  `service/clipper/review/__init__.py`
  Done: a candidate's first and last sentence are found from its start and its end. Its reach is
  A93's stretch. A clip's start and end are worked out from the sentence and the nudge of each
  point, in hundredths of a second. A wanted pair of points is judged by A93: allowed, or refused
  with the sentence of A91. Tests: the six parts of the committed transcript reach sentences
  1–15, 20–33, 10–25, 28–43, 38–50 and 45–54; a clip on the first sentence reaches nothing
  before it and one on the last nothing after it; five steps either way are allowed and a sixth
  is refused; a move to another sentence with no nudge is allowed; refused are an in point after
  the out point, a sentence outside the reach, a start before the video begins, an end after it
  ends, and a clip left shorter than one second.

- [ ] T4 — Group a clip's words into captions
  Files: `service/clipper/review/caption_groups.py`,
  `service/clipper/review/test_caption_groups.py`, `service/clipper/review/__init__.py`
  Done: a clip's words become captions in the three styles by A97. Tests with made-up words:
  three, one and six words to a caption; the end of a sentence closes a caption early; the
  punctuation around a word is left out; the highlighted word is the longest of six characters
  or more, a word with a digit counts, the earlier of two as long is taken, and a caption of
  short words highlights none; the word-by-word and plain styles highlight none; times count
  from the in point and move with its nudge. On the committed transcript, the captions of the
  first part in each style hold that part's words in their order.

- [ ] T5 — Make the filmstrip frames when the clips are cut
  Files: `service/clipper/media/grab_frame.py`, `service/clipper/media/test_grab_frame.py`,
  `service/clipper/media/__init__.py`, `service/clipper/storage/data_folder.py`,
  `service/clipper/storage/test_data_folder.py`, `service/clipper/review/filmstrip.py`,
  `service/clipper/review/test_filmstrip.py`, `service/clipper/review/__init__.py`,
  `service/clipper/selection/prepare_pass.py`, `service/clipper/selection/cut_stage.py`,
  `service/clipper/selection/test_cut_stage.py`, `service/clipper/selection/__init__.py`,
  `service/clipper/selection/test_whole_app.py`, `service/clipper/main.py`
  Done: one frame of a video at a given moment is written as a JPEG of a given height; a moment
  with no picture writes nothing and says so, and a stop ends the work. The data folder knows
  where a project's frames are kept. For a project's candidates the filmstrip maker removes the
  frames an earlier cut left and writes A95's twelve for each candidate from the preview copy. A
  frame that cannot be taken is left out and named in the log; a stop ends the step as a stop,
  and a full disk fails it with the queue's sentence. The cut step can be handed work to do with
  the candidates it has chosen before it stores them. Handed none it does nothing, so the
  selection tests that cut the talk from a transcript alone stay as they are. The service hands
  it the filmstrip maker, and the step's bar follows A95. Tests: on a built video whose picture
  is red, then green, then blue, a frame taken in each part has that colour, read back with
  ffmpeg; the twelve moments of a stretch are the middles of its twelfths; two candidates on a
  built video each get twelve frames 104 px high; a preview copy that ends inside a stretch
  leaves the late frames out and keeps the others; the frames of an earlier cut are gone; a stop
  set during the work ends it. Through the whole app the uploaded talk ends ready with 72 frames
  in its folder, and deleting the project removes them.

- [ ] T6 — Serve the review and take its changes
  Files: `service/clipper/review/review_schemas.py`, `service/clipper/review/describe_review.py`,
  `service/clipper/review/test_describe_review.py`, `service/clipper/review/change_clip.py`,
  `service/clipper/review/test_change_clip.py`, `service/clipper/review/router.py`,
  `service/clipper/review/test_router.py`, `service/clipper/review/test_whole_app.py`,
  `service/clipper/review/conftest.py`, `service/clipper/review/__init__.py`,
  `service/clipper/main.py`
  Done: the four other addresses of A91 answer in its form. The review of a project gives every
  field A91 names: the look, `hasPreview`, the limits with A94's preferred band or none, the
  windows, and for each clip the candidate's fields, the review, the times as they stand, the
  reach with each sentence's text, A97's captions, and twelve places for frames, each the address
  of a frame that is on disk or nothing. A project with no candidates answers with no clips and
  reads no transcript. A change to a clip stores A92's decision with its reason, the title by
  A92's rule, or the points when A93 allows them, and answers with the clip as the review gives
  it. A reason sent with any decision but a rejection is not kept. A change the rules refuse, a
  field of another kind and an unknown value answer the sentence of A91 and store nothing; an
  unknown clip answers 404 with "This clip does not exist." Storing the look answers with it, and
  a look with an unknown value is refused the same way. A frame's address answers the JPEG, and
  404 when it is not on disk. Tests on the cut talk: every field under its name; the three
  presets give their limits and only the 25–60 s one a preferred band; a kept, a rejected and an
  undecided clip with the project's counts following; a title with blanks around it, and an empty
  one; a moved in point changes the start, the length and the captions; each refusal; the look
  stored and read by the next request; a project without candidates; a review with the preview
  copy removed says so and still gives its clips. Through the whole app, the uploaded talk's
  review has six clips with twelve frame addresses each, and each address answers a JPEG.

- [ ] T7 — Count kept and rejected clips in the Library row and on the Export tab
  Files: `web/src/library/library.types.ts`,
  `web/src/library/list-projects/lib/describe-row-status.ts`,
  `web/src/library/list-projects/lib/describe-row-status.test.ts`,
  `web/src/library/list-projects/lib/projects-store.test.ts`,
  `web/src/project/follow-progress/lib/describe-status.test.ts`,
  `web/src/project/open-project/lib/project-addresses.test.ts`,
  `web/src/project/open-project/components/ProjectTabs.tsx`, `web/e2e/selection.spec.ts`,
  `web/e2e/selection-progress.spec.ts`, `web/e2e/support/selection-screens.ts`
  Done: the web app knows a project's `keptCount` and `rejectedCount`. The row of a ready project
  reads "Ready to review · 6 candidates, 0 kept, 0 rejected", with "1 candidate" for one, and the
  number on the Export tab is the kept count. Unit tests cover rows with 0, 1 and 6 candidates
  and with kept and rejected clips. The browser tests that read the row expect the new wording,
  and the ready row presented to the 200% walk reads "Ready to review · 12 candidates, 10 kept, 2
  rejected", the longest a project can have.

- [ ] T8 — Copy the Review styles, and add Inter, three icons and three time formats
  Files: `web/src/shared/styles/review.css`, `web/src/shared/styles/player.css`,
  `web/src/app/layout.tsx`, `web/src/shared/styles/app.css`,
  `web/public/fonts/inter/InterVariable.ttf`, `web/public/fonts/inter/LICENSE.txt`,
  `web/src/shared/ui/Icon.tsx`, `web/src/shared/lib/format-timecode.ts`,
  `web/src/shared/lib/format-timecode.test.ts`, `web/e2e/review-preview.spec.ts`, `AGENTS.md`
  Done: the two stylesheets are the prototype's files byte for byte, loaded after the shell's
  sheet and before the pages' sheet, as the prototype loads them. `AGENTS.md` names eight copied
  files that are not edited. The font file and its licence are the two files of the Inter 4.1
  release named in the Findings, with the checksum given there. The page declares Inter from that
  file, for every weight, and the app's stylesheet makes it the typeface of the caption and of
  the hook title. The icons gain play, pause and replay with the prototype's shapes. A time is
  also written with its tenths cut off, as `00:00:11.9`; as a clock, `0:07`; and as a length,
  `32.8 s`. Unit tests cover the three. A browser test finds that the tool serves the font file
  from its own address at the committed size and that the page draws a heavy text in Inter with
  it. `pnpm test` exits 0, so no screen built before changed its fit.

- [ ] T9 — Hold a project's review in the web app and work out a clip's times
  Files: `web/.coding-standards-structure`, `web/src/review/index.ts`,
  `web/src/review/review.types.ts`, `web/src/review/time-clips/index.ts`,
  `web/src/review/time-clips/lib/clip-range.ts`,
  `web/src/review/time-clips/lib/clip-range.test.ts`,
  `web/src/review/time-clips/lib/move-edge.ts`, `web/src/review/time-clips/lib/move-edge.test.ts`,
  `web/src/review/time-clips/lib/rate-length.ts`,
  `web/src/review/time-clips/lib/rate-length.test.ts`,
  `web/src/review/time-clips/lib/find-open-flag.ts`,
  `web/src/review/time-clips/lib/find-open-flag.test.ts`, `web/src/review/open-review/index.ts`,
  `web/src/review/open-review/api/fetch-review.ts`,
  `web/src/review/open-review/api/change-clip.ts`, `web/src/review/open-review/api/save-look.ts`,
  `web/src/review/open-review/lib/review-store.ts`,
  `web/src/review/open-review/lib/review-store.test.ts`,
  `web/src/review/open-review/lib/review-addresses.ts`,
  `web/src/review/open-review/lib/review-addresses.test.ts`,
  `web/src/review/open-review/hooks/use-review.ts`
  Done: the web app's recorded layout lists the review capability with nine use cases: open the
  review, time clips, list candidates, chart the source, inspect a clip, decide a clip, trim a
  clip, preview a clip and set the look. The types describe A91's answer. From a clip's sentences
  and nudges the app works out its start, its end and its length as the service does, which steps
  of each point are allowed by A93, whether its flag shows, and A94's reading of a length for a
  preset with and without a preferred band. A clip's address and the list's address follow A7,
  and the next clip follows A99. One store for each project holds the review: it fetches it,
  applies a change to a clip or to the look at once, sends it, and takes the service's answer in
  its place. An answer that arrives after a newer change of the same clip does not undo that
  change. When the service refuses or does not answer, the store shows what the service holds
  again and gives the problem to be shown. Unit tests, with a stand-in for the service: each rule
  above, the times of the talk's first clip after one sentence step and after five nudges, the
  two orders in which two answers can arrive, and a refusal.

- [ ] T10 — Open the Review tab at its addresses, with the candidate list and its filters
  Files: `web/src/app/projects/[id]/review/layout.tsx`,
  `web/src/app/projects/[id]/review/page.tsx`, `web/src/app/projects/[id]/review/[clip]/page.tsx`,
  `web/src/app/page.tsx`, `web/src/app/new/page.tsx`, `web/src/project/index.ts`,
  `web/src/project/open-project/index.ts`,
  `web/src/project/open-project/components/ProjectScreen.tsx`,
  `web/src/project/open-project/components/ProjectFrame.tsx`,
  `web/src/project/open-project/components/ProjectTabs.tsx`,
  `web/src/project/open-project/components/NewestProject.tsx`,
  `web/src/project/open-project/components/EmptyReview.tsx`,
  `web/src/review/index.ts`, `web/src/review/open-review/index.ts`,
  `web/src/review/open-review/components/ReviewTab.tsx`,
  `web/src/review/open-review/components/NewestProjectReview.tsx`,
  `web/src/review/open-review/components/ReviewSplit.tsx`,
  `web/src/review/open-review/components/ClipScreen.tsx`,
  `web/src/review/open-review/components/EmptyReview.tsx`,
  `web/src/review/list-candidates/index.ts`,
  `web/src/review/list-candidates/components/CandidateList.tsx`,
  `web/src/review/list-candidates/components/CandidateRow.tsx`,
  `web/src/review/list-candidates/lib/filter-clips.ts`,
  `web/src/review/list-candidates/lib/filter-clips.test.ts`, `web/src/shared/styles/app.css`,
  `AGENTS.md`, `web/e2e/support/ready-talk.ts`, `web/e2e/support/read-review.ts`,
  `web/e2e/support/review-page.ts`, `web/e2e/support/tool-test.ts`, `web/e2e/support/index.ts`,
  `web/e2e/review-list.spec.ts`, `web/e2e/api-key.spec.ts`
  Done: the Review addresses share one layout that holds the tab, and their pages draw nothing of
  their own, so the screen stays in place while the address moves between the list and the
  clips. The project screen takes the Review tab from the route and shows it for a project that
  has tabs; the routes of `/` and of the new project sheet hand it the Review tab of the newest
  project. The project capability gives its frame, with the title, the subtitle, the three tabs
  and the More button, and the open project to the review capability, which imports `project`,
  `library`, `shell` and `shared` and is imported by `app/` alone; `AGENTS.md` says so. The empty
  list leaves the project capability, whose file for it is removed, and the review capability
  draws it. The tab fetches the review when it opens. With no clips it shows what it showed
  before, "Candidates" over "No clips in this group." With clips, from 720 px, it is the
  prototype's split view: the list pane beside the detail pane, which later tasks fill. The
  candidate list follows the prototype's markup,
  ids included: the filters All, To Do, Kept and Rejected with their counts; a row for each clip
  in the order of the ranks with its two-figure rank, its title, its start and its length as
  `00:00:11 · 32.8 s`, its tags and its total; "No clips in this group." for an empty group; and
  A100's sentence under the list. The tags are the hook type in the prototype's words, "Replay
  peak", the label of a flag that is showing, and "Kept" or "Rejected". A row is a link to its
  clip's address and is marked as current when its clip is shown. A99 decides which clip an
  address shows and where an unknown one leads. Below 720 px the Review address shows the list
  pane alone under the project's title and tabs, and a clip's address shows a pushed screen
  titled as A99 says, with "Clips" as its back control. Unit tests cover the counts and the
  groups of the four filters. Browser tests take A103's ready talk from a fixture named
  `readyTalk`, which makes it from a link to `talk.mp4` and puts it back before each test. At
  1360 px the list holds the talk's six clips in order with their titles, times, lengths, tags
  and totals, and A100's sentence; the filters read 6, 6, 0 and 0; choosing the third row leads
  to its address and marks it, a reload keeps both, and Back returns to the clip before; an
  address naming no clip leads to the list; `/` shows the newest project's Review tab with its
  first clip marked. At 390 px the Review address is the list, and a row leads to a screen titled
  "Clip 3 of 6" whose back control returns to the list. The key test also searches the service's
  review answer for the key. `pnpm test` exits 0, the tests that present a project without
  candidates as ready among them.

- [ ] T11 — Draw the source timeline
  Files: `web/src/review/chart-source/index.ts`,
  `web/src/review/chart-source/components/SourceTimeline.tsx`,
  `web/src/review/chart-source/hooks/use-element-width.ts`,
  `web/src/review/chart-source/lib/place-pins.ts`,
  `web/src/review/chart-source/lib/place-pins.test.ts`,
  `web/src/review/open-review/components/ReviewSplit.tsx`, `web/src/shared/styles/app.css`,
  `web/e2e/support/review-page.ts`, `web/e2e/support/index.ts`, `web/e2e/review-list.spec.ts`
  Done: the list pane shows "Source Video" in the prototype's markup, above the candidates from
  720 px and below them on a phone. It draws one bar for each window in the order of their
  starts, as high as its score and highlighted when shortlisted; a numbered pin for each clip,
  which is a link to the clip, wears its decision and is marked when its clip is shown; five
  times along the video's length; and A100's sentence under them. A pin is named as in the
  prototype, "Clip ranked 3, at 00:00:45, not decided". Pins follow A101: over the middle of
  their clip, in two rows by turns, and kept a tap area apart on a row. With more windows than
  fit with gaps, the bars have none and stay inside the card. Unit tests: pins far apart keep
  their places; two that crowd are moved apart by no more than needed; twelve clips within one
  minute of a three-hour video each get a place of their own inside a card 326 px wide. Browser
  tests on the talk: four bars, three of them highlighted, with heights in the order of the
  stored scores; six pins in the order of the clips' starts; a pin leads to its clip's address.

- [ ] T12 — Show why a clip was picked, its flag and its title
  Files: `web/src/review/inspect-clip/index.ts`,
  `web/src/review/inspect-clip/components/TitleField.tsx`,
  `web/src/review/inspect-clip/components/ClipFlag.tsx`,
  `web/src/review/inspect-clip/components/WhyThisClip.tsx`,
  `web/src/review/inspect-clip/hooks/use-title-draft.ts`,
  `web/src/review/open-review/components/ClipDetail.tsx`,
  `web/src/review/open-review/components/ReviewSplit.tsx`,
  `web/src/review/open-review/components/ClipScreen.tsx`, `web/e2e/support/review-page.ts`,
  `web/e2e/support/index.ts`, `web/e2e/review-inspect.spec.ts`
  Done: the detail pane holds the inspector in the prototype's markup, for the clip the address
  shows. The title field holds the clip's title and saves it by A92; the list shows the new title
  as it is typed. A flag that is showing is a note with its sentence. "Why This Clip" gives the
  reason, the four subscores as bars with their figures out of 25, the note "Replay peak. Viewers
  of the source video rewatched this part more than the rest." for a clip under a peak, and under
  them "82 of 100, rank 3 of 6. The score orders clips inside this video. It does not forecast
  views." with the clip's own numbers. Browser tests at 1360 px on the talk: choosing a candidate
  shows its reason, its four subscores, its total and its rank, each equal to what the service
  holds; the fourth clip shows its flag's sentence and the sixth its own; a title typed into the
  field is in the list at once and in the field and the list after a reload; emptying the field
  brings back the title selection gave; a clip presented to the page as lying under a replay peak
  shows the tag in the list and the note in the inspector.

- [ ] T13 — Keep, Reject with a reason, Undo Reject and Next
  Files: `web/src/shell/present-menu/components/Menu.tsx`, `web/src/shell/present-menu/index.ts`,
  `web/src/shell/index.ts`, `web/src/review/decide-clip/index.ts`,
  `web/src/review/decide-clip/components/DecisionControls.tsx`,
  `web/src/review/decide-clip/components/RejectMenu.tsx`,
  `web/src/review/decide-clip/lib/reject-reasons.ts`,
  `web/src/review/decide-clip/lib/apply-decision.ts`,
  `web/src/review/decide-clip/lib/apply-decision.test.ts`,
  `web/src/review/open-review/components/ReviewTab.tsx`,
  `web/src/review/open-review/components/ClipScreen.tsx`, `web/e2e/support/review-page.ts`,
  `web/e2e/support/index.ts`, `web/e2e/review-decide.spec.ts`
  Done: the shell's menu can show a title, a divider, and items that carry a tick when chosen.
  Reject, Keep and Next follow the prototype's markup and states: from 720 px in the toolbar
  after the More button, and on a phone's clip screen in a bar at the bottom in place of the tab
  bar. Keep keeps the clip, and pressed again leaves it undecided. Reject opens the menu headed
  "Why? The selector uses the reason when it picks clips from your next video." with "Cut Off
  Mid-Thought", "Not Interesting", "Needs Earlier Context", "Repeats Another Clip" and, under a
  divider, "No Reason"; the chosen one carries the tick, and for a rejected clip "Undo Reject"
  follows. Choosing a reason rejects the clip with it, and "Undo Reject" leaves it undecided.
  Next follows A99. Every decision is stored through the review, shows at once in the buttons,
  the row's tag, the pin and the filters' counts, and asks the Library for its rows again, so the
  row and the Export tab's number follow within the same moment. A unit test covers what each
  press makes of each decision. Browser tests on the talk: Keep and Keep again; each of the five
  choices of the menu, with the tick on the chosen one when the menu is opened again; "Undo
  Reject"; Next through the six clips and back to the first, and through the two of a filter's
  group; the menu opened and closed with the keyboard. One test keeps the first clip, rejects the
  second as "Not Interesting" and gives the third a new title, reloads, and finds all three; the
  filters read 6, 4, 1 and 1, the Kept group holds the first clip alone, the Export tab reads 1,
  and the Library row reads "Ready to review · 6 candidates, 1 kept, 1 rejected".

- [ ] T14 — Move the in and out points: steps, the length reading, the filmstrip and its handles
  Files: `web/src/review/trim-clip/index.ts`,
  `web/src/review/trim-clip/components/BoundaryEditor.tsx`,
  `web/src/review/trim-clip/components/LengthBand.tsx`,
  `web/src/review/trim-clip/components/EdgeRow.tsx`,
  `web/src/review/trim-clip/components/Filmstrip.tsx`,
  `web/src/review/trim-clip/components/ClipTranscript.tsx`,
  `web/src/review/trim-clip/hooks/use-trim-drag.ts`,
  `web/src/review/trim-clip/lib/nearest-sentence.ts`,
  `web/src/review/trim-clip/lib/nearest-sentence.test.ts`,
  `web/src/review/trim-clip/lib/place-selection.ts`,
  `web/src/review/trim-clip/lib/place-selection.test.ts`,
  `web/src/review/inspect-clip/components/ClipFlag.tsx`,
  `web/src/review/open-review/components/ClipDetail.tsx`, `web/src/shared/styles/app.css`,
  `web/e2e/support/review-page.ts`, `web/e2e/support/index.ts`, `web/e2e/review-trim.spec.ts`
  Done: "In and Out Points" and "Transcript" follow the prototype's markup. The length reading
  and its band follow A94 with the project's preset. Each point has its time to a tenth of a
  second and two pairs of steps, by a sentence and by 0.2 seconds, named as in the prototype; a
  step A93 does not allow is switched off. The filmstrip shows the clip's twelve frames over its
  reach, an empty place where a frame is missing, the part outside the clip shaded, and a handle
  at each point. A handle dragged along the strip moves its point to the nearest sentence the
  rules allow while the times, the length reading and the transcript follow, and the point is
  stored when the handle is let go. A handle is also a slider: the arrow keys move it by a
  sentence, and it says its sentence, the number of sentences and its time. The flag of a clip
  that needs context offers "Start One Sentence Earlier", which moves the in point back one
  sentence. The transcript lists the sentences of the reach, marks the two that hold the points
  "In" and "Out", and greys those outside the clip. Every move is stored through the review, and
  the list's time and length and the timeline's pin follow it. The app's stylesheet hides the
  prototype's drawn figure where a real frame is shown. Unit tests cover the nearest sentence for
  each handle, kept on the right side of the other point, and the shares of the strip before and
  after the clip. Browser tests at 1360 px on the talk: each sentence step moves its point to the
  neighbouring sentence's time as the service holds it, and the length shown is the difference of
  the two times; five 0.2-second steps move a point by one second and switch the sixth off, in
  both directions; the sentence steps are switched off at the ends of the reach and where the two
  points meet; the reading says in turn "inside the preferred 25–50 s band", "inside the 25–60 s
  limits", "shorter than the 25 s minimum" and "longer than the 60 s maximum", on the clips the
  Findings name; the fourth clip's flag and its tag go when its in point moves one sentence
  earlier, by the button and by the step, and return when it moves back; every frame of the strip
  is a loaded picture 104 px high whose colours are the talk's colour bars; a handle dragged to a
  place in the strip leaves its point on the sentence nearest that place, with the times, the
  length and the handle's own words changed to match; a moved point is still there after a
  reload.

- [ ] T15 — Play the clip: the footage in a 9:16 frame, the framings, the captions and the look
  Files: `web/src/review/preview-clip/index.ts`,
  `web/src/review/preview-clip/components/ClipPreview.tsx`,
  `web/src/review/preview-clip/components/PlayerPicture.tsx`,
  `web/src/review/preview-clip/components/PlayerTransport.tsx`,
  `web/src/review/preview-clip/components/SourceGoneNotice.tsx`,
  `web/src/review/preview-clip/hooks/use-playback.ts`,
  `web/src/review/preview-clip/hooks/use-second-picture.ts`,
  `web/src/review/preview-clip/lib/find-caption.ts`,
  `web/src/review/preview-clip/lib/find-caption.test.ts`,
  `web/src/review/preview-clip/lib/frame-picture.ts`,
  `web/src/review/preview-clip/lib/frame-picture.test.ts`, `web/src/review/set-look/index.ts`,
  `web/src/review/set-look/components/LookControls.tsx`,
  `web/src/review/set-look/lib/look-options.ts`,
  `web/src/review/open-review/components/ClipDetail.tsx`, `web/src/shared/styles/app.css`,
  `web/e2e/support/review-page.ts`, `web/e2e/support/index.ts`, `web/e2e/review-preview.spec.ts`
  Done: the preview follows the prototype's markup with the video in place of the drawn figures.
  It plays the preview copy by A98: Play and Pause, a slider over the clip's length, and a clock
  that reads the place and the length, as `0:07 / 0:33`. The picture is drawn by A98 for each
  framing; the second picture a framing needs is drawn from the one playing video on every frame
  the browser presents and after every jump, so both show the same moment. The caption is the one
  A97 gives for the place of the playhead, in the chosen style, with the highlighted word marked,
  in Inter. The hook title and the two safe zones, "Platform buttons" and "Caption and sound",
  follow their switches and A98. "Look" follows the prototype's markup: the two choices and the
  two switches of A96, and "The look applies to every clip in this project." A change of the look
  shows at once and is stored for the project. With no preview copy the notice of A98 stands in
  place of the preview. Unit tests: the caption for a time before the first caption, inside one,
  in a pause after one and at the end; the part of the picture each framing draws, for a wide and
  for an upright source. Browser tests at 1360 px on the talk: Play moves the playhead forward,
  and from two seconds before the end it stops at the out point with the playhead on the clip's
  length and the video's time within 0.3 seconds of the out point; Play at the end starts from
  the in point; with the slider on the middle of three words taken from the stored transcript,
  and at three moments read together with the video's time while it plays, the caption holds the
  word spoken at that moment, in each of the three styles with no more than three, one and six
  words; the keyword style marks one word; the hook title shows at one second and not at four,
  and never with its switch off; each framing draws a different picture, read from a capture of
  the frame, and all of them hold the talk's colour bars; the safe zones follow their switch; the
  caption's typeface is Inter; the look is the same on another clip and after a reload; after a
  step of a point and after Next the playhead is at the start, paused; with the project's preview
  copy moved aside in the test's data folder a reload shows the notice, and a decision and a step
  of a point still work. That test moves the copy back when it ends, whatever its result, because
  the project is shared.

- [ ] T16 — Finish the phone layout: the list where it was left and the pinned preview
  Files: `web/src/shell/frame-screens/lib/shell-context.ts`,
  `web/src/shell/frame-screens/components/AppShell.tsx`,
  `web/src/review/open-review/hooks/use-list-position.ts`,
  `web/src/review/open-review/components/ReviewTab.tsx`,
  `web/src/review/open-review/components/ClipScreen.tsx`,
  `web/src/review/preview-clip/hooks/use-preview-dock.ts`,
  `web/src/review/preview-clip/lib/measure-shown-share.ts`,
  `web/src/review/preview-clip/lib/measure-shown-share.test.ts`,
  `web/src/review/preview-clip/components/ClipPreview.tsx`,
  `web/src/review/preview-clip/index.ts`, `AGENTS.md`, `web/e2e/support/review-page.ts`,
  `web/e2e/support/index.ts`, `web/e2e/review-phone.spec.ts`
  Done: on a phone a clip's screen opens at its top, also after Next, and the list returns where
  it was left (A99). The app element carries the preview's place as a fourth data attribute,
  which the copied player styles select on, and `AGENTS.md` names it with the three others. On a
  phone the preview counts as scrolled away once less than a quarter of it shows between the top
  bar and the bottom of the window; it is then pinned as the prototype's strip under the top bar,
  and goes back into the page when the screen is scrolled up again or left. A unit test covers
  the share that shows. Browser tests at 390 px on the talk: the Review address shows the
  candidate list first, above the source timeline, with no preview on the screen; a row opens the
  clip's screen at its top, with the preview, the inspector, and a bar fixed to the bottom of the
  window that holds Reject, Keep and Next and no tab bar; the back control returns to the list
  with the tab bar; with the list scrolled, a clip opened and left by the back control, and again
  by the browser's Back, the list is where it was left both times; Forward returns to the clip;
  each of the three tabs and a clip open at their own addresses and a reload returns to each;
  with the clip playing, scrolling its screen past the preview pins the strip under the top bar,
  the video's time goes on advancing, the strip's Pause stops it and its Play starts it again,
  and scrolling back up puts the preview back in the page; Reject opens its menu above the bar,
  and a reason chosen there leaves the button reading "Rejected".

- [ ] T17 — Fit the Review tab on a phone: 200% text, tap areas and contrast
  Files: `web/e2e/support/measure-tap-areas.ts`, `web/e2e/support/measure-contrast.ts`,
  `web/e2e/support/review-screens.ts`, `web/e2e/support/index.ts`, `web/e2e/review-fit.spec.ts`,
  `web/e2e/own-origin.spec.ts`, `web/src/shared/styles/app.css`
  Done: the screens of the Review tab can be walked as the other screens are: the list, a clip,
  the flagged clip, a clip with the reject menu open, and a clip with the preview pinned, each on
  the talk and on the review A103 presents to the page. The tap-area measure and the contrast
  measure follow A103, and a test of each shows that it finds a control that is too small and a
  text that is too faint, placed on a page on purpose. At 390 px, on every one of those screens:
  at the normal text size and at 200% nothing scrolls sideways and no label is cut, by the
  measure the other screens use; with the screen scrolled to its end, its last line lies above
  the bar at the bottom; no control has a tap area under 44 px at either text size; and in light
  and in dark no text measures under 4.5 to 1. At 1360 px the list beside a clip and beside the
  flagged clip meet the same ratio in light and in dark. A rule that a screen needs for any of
  this goes into the app's stylesheet (A102), and the copied stylesheets and the tokens stay as
  they are. The test that every request of every screen goes to the tool also walks the Review
  screens of the talk at both widths, with the preview playing on one of them.

- [ ] T18 — Save the captures and the talk's review as evidence
  Files: `web/e2e/review-captures.spec.ts`, `web/e2e/support/review-screens.ts`,
  `web/e2e/support/index.ts`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-390-light.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-390-dark.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-1360-light.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-1360-dark.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-390-light.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-390-dark.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-1360-light.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-1360-dark.png`,
  `docs/missions/clipper-tool/m4-the-review-workbench/evidence/talk-review.json`
  Done: a browser test keeps the talk's first clip and rejects its sixth, then captures A103's two
  screens whole, as A37 asks: `review-list` at the Review address and `review-clip` at the
  address of the fourth clip, the flagged one, each at 390 and 1360 px in light and in dark, once
  the frames of the strip and the picture of the preview have loaded. It checks each file as the
  M1 captures are checked, and that the middle of each clip capture's preview is not one flat
  colour. It also saves A103's `talk-review.json`. The files go into `CLIPPER_EVIDENCE_DIR` when
  that is set and into the test output otherwise. They are saved with the command of validation
  block V18 and committed.

- [ ] T19 — Bring the README and the agents' instructions up to date
  Files: `README.md`, `AGENTS.md`
  Done: `README.md` says what the Review tab does: the list and its filters, the timeline, the
  preview and that it is an approximation of the export, the look, the in and out points, Keep
  and Reject with a reason, and that every change is stored. Its section on what this version
  does not do yet starts after the review: kept clips cannot be exported, the results are not
  recorded, and a rejection's reason does not steer the next selection yet. It gives the time
  `pnpm test` takes now, as measured. `AGENTS.md` names the review package and the review
  capability with their use cases and the direction of their imports; the layout that keeps the
  Review tab in place and why its pages draw nothing; that clips are chosen with links and why;
  the ready talk the Review tests share and how a test puts it back; that the tests' browser
  plays the preview copy; the three measures for text fit, tap areas and contrast; and Inter's
  place and licence. Each command in the two files was run as written.
