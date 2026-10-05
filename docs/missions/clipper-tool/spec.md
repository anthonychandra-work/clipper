# Spec: Clipper, a personal tool that turns long talking-head videos into reviewed vertical clips

From `intent.md`. Base `82df5ce`.

## Requirements

- R1 — One person uses the tool on one Mac, with no login and no accounts. (D1, D2, M1)
- R2 — The interface is one responsive web app on port 3000, opened in a desktop browser on the Mac
  and in a phone browser on the same Wi-Fi. The browser talks only to the web app, which forwards
  requests to the processing service through the rewrites in its configuration and has no proxy or
  middleware file. Nothing is reachable from the internet. (D3, D4, D64, M1)
- R3 — The app reproduces every screen, control and state of the prototype, at phone and desktop
  width, in light and in dark, and does the real thing wherever the prototype pretends. (D5, D6,
  M1–M6)
- R4 — Colours, type sizes, control sizes and component styles are the prototype's. The stylesheets
  start as copies of the prototype's and change only where real content requires it. The app uses
  no CSS framework and no ready-made component library; unstyled parts that supply only behaviour
  are allowed. (D49, M1)
- R5 — Below 720 px the layout is a tab bar, screens that push with a back control, and a bottom
  toolbar. From 720 px it is a sidebar and a toolbar, with the sidebar laid over the content below
  1000 px. Light and dark follow the system setting. (D50, M1)
- R6 — Every project, every project tab and every clip has its own address. A reload returns to
  the same place, Back and Forward move between them, and on a phone Back from a clip returns to
  the list at the position it was left. (D51, M1 for projects and tabs, M4 for clips)
- R7 — Text stays usable at 200%: no screen scrolls sideways and no label is cut off. Touch
  controls have a tap area of at least 44 px. Text and its background differ by at least 4.5 to 1
  in light and in dark. (D57, M1, M4)
- R8 — The web app is Next.js with TypeScript and React. The processing service is Python 3.12 with
  FastAPI. Records live in SQLite and only the service writes them. One worker takes projects from
  the queue, with no separate queue service. yt-dlp is a project dependency. Python packages
  install with pip into a virtual environment inside the project, at pinned versions. Docker is
  not used. (D44, D45, M1)
- R9 — One command starts the whole tool. One command runs every test: pytest, Vitest, Playwright,
  the type checks and the linters. A README gives setup, start, test and phone-access
  instructions, and an instructions file for coding agents names the same commands. (D46, M1,
  confirmed from a fresh copy in M6)
- R10 — Media work uses ffmpeg and ffprobe from `/opt/homebrew/opt/ffmpeg-full/bin`, and from the
  PATH when that folder does not hold them. At start the tool checks that both run and stops with
  a plain message naming what is missing. The run installs and updates neither. (D59, M1)
- R11 — One data folder, ignored by git, holds sources, preview copies, transcripts, exports and
  the database. (D41, M1)
- R12 — Tests use fixtures made on the Mac: synthesised speech over a generated picture, and one
  public-domain portrait photograph with its source and licence beside it. Recorded model
  responses stand in for Claude, and tests transcribe with the smallest Whisper model. No check
  depends on an API key, on YouTube, or on a download larger than that model. (D47, D48, M1–M6)
- R13 — A project starts from a video link or an uploaded file. Links download through yt-dlp at
  no more than 1080p. Uploads of up to 4 GB show their progress. Sources up to 3 hours long are
  supported. (D9, M1)
- R14 — An upload starts when the project is created and runs while other projects are processed.
  The status screen says the browser must stay open until it finishes. The project then joins the
  queue. (D54, M1)
- R15 — Four stages run in order: fetch, transcribe, score windows, cut clips. Each stage's state
  and progress are stored, shown in the Library, and survive a restart. (D10, M1 for the queue and
  fetch, M2 for transcribe, M3 for score and cut)
- R16 — One project is processed at a time. The others wait in the order they were created. (D12,
  M1)
- R17 — A failed stage shows a plain-language reason and a Retry control that reruns that stage
  only. A stage that runs out of disk space says so. (D11, D67, M1)
- R18 — A project that is uploading, waiting, processing, failed or stopped opens to a status
  screen in place of the tabs. A running project offers Stop. A stopped project keeps its finished
  stages and offers Resume, which reruns the stopped stage. (D53, M1)
- R19 — Fetch also makes a browser-playable preview copy of the source: H.264 video with AAC audio
  at 720p. (D13, M1)
- R20 — Every project screen has a More menu with Delete Project. The confirmation names the
  project and says what is removed. Deleting stops a running project first, then removes its
  source, preview copy, transcript, candidates, exports and records. What the project added to the
  learning history stays. (D65, M1, export files in M6)
- R21 — With no projects, the Library shows an empty state with a New Project control. (D66, M1)
- R22 — A new project is refused when the disk has less than 5 GB free. The new project sheet
  shows the reason under the source field, with the free space and the advice to delete a project
  or free space. (D67, M1)
- R23 — Transcription runs on the Mac with mlx-whisper and stores a start and an end time for
  every word. No audio leaves the machine. (D14, D61, M2)
- R24 — The default transcription model is large-v3-turbo. Settings also offers medium and small.
  A model downloads the first time it is used, with its progress shown as a step of its own. (D15,
  M2)
- R25 — A source with no recognisable speech fails the transcribe stage with a reason that says
  so. (D16, M2)
- R26 — The tool handles spoken video with people on camera, in any language the transcription
  model handles. The interface is in English. Titles, hook titles and descriptions are written in
  the language of the transcript. (D7, D8, M2, M3)
- R27 — Selection uses Claude in two passes over the transcript, through Anthropic's official
  Python SDK. (D17, D62, M3)
- R28 — Pass one splits the transcript into windows of about 90 seconds with 30 seconds of
  overlap, cut on sentence boundaries, and scores each from 0 to 100 on one question: would the
  opening two seconds hold a viewer who has no context. The top windows form a shortlist of 3 to
  10, growing with the length of the video. (D18, M3)
- R29 — Pass two cuts clips inside the shortlisted windows. A clip opens on its hook, makes sense
  alone, completes its setup and payoff, and starts and ends on sentence boundaries. Intros,
  outros, sponsor reads and housekeeping are excluded. (D19, M3)
- R30 — The model quotes the transcript and never supplies timestamps. The tool finds each quote
  in the word-level transcript and takes the times from there. A quote that cannot be found is
  dropped. (D20, M3)
- R31 — Each candidate carries its start and end; four subscores from 0 to 25 for hook, arc, value
  and share, and their total; a one-sentence reason; a hook title of at most 10 words; a hook
  type; a title and description for each of TikTok, Reels and Shorts; and at most one flag,
  "needs context" or "not recommended". (D21, M3)
- R32 — When two candidates overlap by more than half of the shorter one, the lower-scoring one is
  dropped. (D22, M3)
- R33 — Clip length presets are 15–30 s, 25–60 s and 60–180 s. The default is 25–60 s, with
  25–50 s preferred. The preset is a hard limit for selection, and a clip is never padded to reach
  a target. (D23, M3)
- R34 — On the Auto setting a source of 10 minutes or longer yields at least 4 candidates when the
  material holds them, a shorter one at least 2, and no source more than 12. Settings also offers
  fixed targets of 4, 8 and 12. (D24, M3)
- R35 — When a link's metadata includes a most-replayed graph, candidates that overlap its peaks
  show a "Replay peak" marker. The marker breaks ties in the ranking and does not change the
  score. (D26, M3)
- R36 — Claude Sonnet 5.5 (`claude-sonnet-5-5`) scores windows and Claude Opus 5.5
  (`claude-opus-5-5`) cuts clips by default. Settings offers Fable 5.1 (`claude-fable-5-1`), Opus
  5.5, Sonnet 5.5 and Haiku 4.5 (`claude-haiku-4-5`) for each pass. (D27, M3)
- R37 — The optional "what to look for" text from the new project form goes to both selection
  passes. (D28, M3)
- R38 — Selection replies are requested as structured output and checked against a schema.
  Requests set no temperature and force no tool call. An effort setting goes only to models that
  accept one; Haiku 4.5 does not. Where the chosen model supports it, requests opt into the API's
  server-side fallback, and a request that still ends declined fails the stage with a plain
  reason. Requests in one pass that share the transcript send it as a cached prefix. (D62, M3)
- R39 — The API key is entered in Settings and stored in a file on the Mac outside the repository.
  After saving it is shown masked. It is never sent back to the browser and never written to a
  log. Without a saved key, the score stage fails with a reason that points to Settings. (D29,
  D30, M3)
- R40 — Each candidate is kept, rejected or left undecided. Reject opens a menu of four reasons
  (cut off mid-thought, not interesting, needs earlier context, repeats another clip) and "No
  Reason"; the menu of a rejected clip also offers "Undo Reject". The title is editable. (D31, M4)
- R41 — The in point and the out point each move by one transcript sentence, or by 0.2 seconds up
  to one second either way, and by dragging handles on a filmstrip that snap to sentence
  boundaries. Controls at their limit are disabled. A "needs context" flag clears when the in
  point moves earlier than where selection put it. The filmstrip shows frames from the source
  video, made when the clip is cut. (D32, D52, M4)
- R42 — The preview plays the source footage for the clip's range inside a 9:16 frame, with the
  chosen framing, the captions and the hook title drawn by the page in Inter. Platform safe-zone
  guides appear in the preview only. The preview is an approximation and the rendered file is the
  reference. (D33, D37, D60, M4)
- R43 — On a phone the Review tab shows the candidate list first. Opening a clip shows its detail
  with a bar fixed to the bottom of the screen holding Reject, Keep and Next, and the preview
  stays pinned in a small strip under the top bar while the rest of the clip screen scrolls. (D34,
  D58, M4)
- R44 — Scores rank clips inside one video. The interface says so wherever a score appears and
  never presents a score as a forecast of views. (D25, M4)
- R45 — A project whose source is gone shows a notice in place of the preview on the Review tab.
  (D56, M4, confirmed in M6)
- R46 — Framing, caption style and the hook title switch apply to the whole project. (D35, M4 for
  the preview, M5 for the export)
- R47 — Three framings: follow the speaker, where the crop tracks the largest face with smoothed
  movement and falls back to a centred crop when no face is found; stack two, with the two largest
  faces one above the other, falling back to follow the speaker with fewer than two; and whole
  frame, the full picture centred over a blurred copy of itself. Faces are found with OpenCV and
  the YuNet detector, whose model file is stored in the repository with its licence. (D36, D63,
  M5)
- R48 — Three caption styles are timed from the word-level transcript and burned into the export:
  keyword (up to three words, in capitals, one highlighted), word by word, and plain (up to six
  words). The hook title shows for the first 3 seconds when switched on. The service draws
  captions and the hook title as images in Inter and lays them over the video, so the export needs
  no subtitle or text support in ffmpeg. (D37, D60, M5)
- R49 — Exports are 1080 × 1920, 30 frames per second, H.264 video with AAC audio, in an MP4 file.
  Kept clips render one at a time in a queue with progress. Each finished file downloads from the
  browser, including on the phone. (D38, M5)
- R50 — While clips render, Cancel stops every clip that has not finished. Finished files stay.
  (D55, M5)
- R51 — For each exported clip the user enters its views seven days after posting. The Results tab
  shows the clips in order of views against the tool's ranking. (D39, M6)
- R52 — Before each selection the tool writes a short note from the user's history: the count of
  rejections by reason over the last 50 decisions and, for clips with logged views, the hook types
  and lengths of the best and worst third. The note goes into both selection passes. "Forget all
  of it" in Settings clears the history the note is built from. (D40, M6)
- R53 — Sources and preview copies are deleted a set number of days after import: 7 by default,
  with 3, 30 and never as options. Exports stay until the user deletes the project. A project
  whose source is gone still opens and still offers its exports; it cannot render new clips, and
  the Export tab says why. (D42, M6)
- R54 — Settings shows the Mac's real free disk space and the address to open on the phone, and
  every control in it takes effect. (D43, D15, D23, D24, D27, D42, M6)
- R55 — `.researches/` and `docs/prototype/` stay as they are. The app copies from the prototype
  and loads nothing from `docs/`. (Boundaries, M1–M6)
- R56 — No key, video, model weights or database is committed. Committed fixtures stay under 20 MB
  in total. Data the tests create stays under 2 GB and is removed when the tests finish.
  (Boundaries, M1–M6)
- R57 — The tool contacts only the video source the user pasted, the Whisper model download and
  the Anthropic API, with no analytics and no telemetry. It listens on the local network only,
  with no tunnel and no public address. Tests call neither the live Anthropic API nor YouTube.
  (Boundaries, M1–M6)
- R58 — No code comes from the open-source clippers studied in `.researches/`. Remotion is not
  used. Libraries built into the app carry permissive licences such as MIT, BSD or Apache-2.0.
  (Boundaries, M1–M6)
- R59 — Nothing installs system-wide. Beyond Python 3.12, Node 22, pnpm and Homebrew ffmpeg,
  everything the project needs installs inside the project. (Boundaries, M1–M6)

## Assumptions

- A1 — The web app lives in `web`, the processing service in `service`, the committed test inputs
  in `fixtures`, the command programs in `scripts`, and the data folder is `data` at the
  repository root. The intent names no layout; two parts in two languages each need a root of
  their own. (scaffolding)
- A2 — Setup is `pnpm install` followed by `pnpm bootstrap`, which creates the Python virtual
  environment, installs the pinned Python packages and installs the browser the tests drive. The
  start command is `pnpm start` and the test command is `pnpm test`. pnpm is already required, so
  it carries the commands for both parts. The setup script is not named `setup`, because pnpm has
  a command of that name that edits the user's shell configuration. (scaffolding)
- A3 — The web app listens on every network interface at port 3000. The service listens on the
  loopback address only, at port 8765, because nothing but the web app talks to it. A test run
  uses ports and a temporary data folder of its own, so it disturbs neither a running tool nor the
  user's data. (scaffolding)
- A4 — What differs between a normal start and a test run is read from environment variables at
  start: the data folder, the ffmpeg folder, the key file and the ports. With none set, the tool
  uses the values the intent gives. (scaffolding)
- A5 — The start command serves a production build of the web app and builds it when no build
  exists or the sources are newer than the build. A tool used daily runs the fast build, and D46
  asks for one command. (scaffolding)
- A6 — The web app reads and changes records only through the service's HTTP interface, under one
  path prefix that the rewrites forward. Preview copies, filmstrip frames and exports reach the
  browser the same way. D44 gives the writes to the service; sending the reads the same way keeps
  the database out of the web app. (scaffolding)
- A7 — The Library is at `/`, the new project sheet at `/new`, Settings at `/settings`, a project
  at `/projects/<id>`, its tabs at `/projects/<id>/review`, `/projects/<id>/export` and
  `/projects/<id>/results`, and a clip at `/projects/<id>/review/<clip>`. D51 says what has an
  address and not its form. (scaffolding)
- A8 — Until a later milestone builds the next stage, the queue stops a project after its last
  built stage. The project rests in the state that stage produced, fetched after M1 and
  transcribed after M2, and its status screen shows the remaining stages as not started. M1 builds
  the project view's frame: the three tabs at their own addresses and the More menu. M4, M5 and M6
  fill the tabs. (scaffolding)
- A9 — M1 lays out every Settings control from the prototype and stores each choice. A control
  takes effect in the milestone that builds what it governs: the transcription model in M2, the
  API key in M3, and the rest by M6, whose checks cover them. (scaffolding)
- A10 — The API key is stored in `~/Library/Application Support/Clipper/anthropic-api-key`,
  readable by the user's account only. D29 says outside the repository and not where; this is the
  folder macOS gives an application for its own files. Tests write their key to a temporary folder
  and never open that file. (scaffolding)
- A11 — Whisper models are kept in a models folder inside the data folder, and the browser the
  tests drive installs inside the project. Both default to folders in the user's home, which the
  boundary against system-wide installs rules out. Tests keep their copy of the smallest model in
  a git-ignored cache folder inside the project, so one download serves every run. (scaffolding)
- A12 — The test command builds the fixture videos at the start of a run, from committed scripts
  and the committed photograph, into the run's temporary folder, and removes that folder at the
  end. The boundaries forbid committing video. (scaffolding)
- A13 — The recorded model responses are written by hand in the shape the API returns, against
  the fixture's script. The run has no API key and is not allowed to call the API, so nothing real
  is there to record. The user's first live video is the first real exchange with the API.
  (scaffolding)
- A14 — The boundary against committing model weights covers the Whisper models. The face
  detector's model file, under 1 MB, is committed with its licence because D63 says so.
  (scaffolding)
- A15 — One copy of Inter and its licence sits in the web app's public files. The browser loads it
  for the preview and the service draws export captions from the same file, so the two cannot
  drift apart. (scaffolding)
- A16 — Selection writes a title and a description for all three platforms, as D21 says. The
  platforms chosen in the new project form are stored with the project and decide which platforms'
  text the Export tab shows. The intent does not say what the choice changes. (scaffolding)
- A17 — The web app is checked with ESLint and the TypeScript compiler, the service with Ruff and
  mypy. D46 asks for linters and type checks without naming them; these are the usual ones for
  each language and carry MIT licences. (scaffolding)
- A18 — The instructions for coding agents are in `AGENTS.md`, and a one-line `CLAUDE.md` includes
  it, so Claude Code and other agents read the same text. (scaffolding)
- A19 — Code follows the coding standards that this Mac's hooks enforce on every file an agent
  writes. The web app uses the standards' default Next.js layout: capability folders, each holding
  use-case folders. The service's top folders are named by capability. M1 records both layouts in
  the file the standards read, so no agent has to ask the user which layout applies. Unit tests
  sit beside the code they test, and the browser tests sit in one folder at the web app's root.
  (scaffolding)
- A20 — Screen captures and frames that a milestone must save are committed as image files in an
  `evidence` folder inside that milestone's folder. The pull request is what the user reviews, and
  nothing else from the run outlives it. (scaffolding)
- A21 — Each dependency is pinned at its latest stable release when the milestone that introduces
  it is planned, checked against the library's current documentation. The intent asks for pinned
  versions and names none. (scaffolding)
- A22 — An upload travels in parts of 8 MiB, each its own request through the rewrites. The
  service appends each part to the file on disk and answers with the bytes it holds, and the
  project joins the queue when the last part lands. Measured on Next.js 16.3.8: the rewrites cut
  every request body over 10 MiB, with or without a proxy file, so the route D64 chose cannot
  carry a larger body in one request. (planner, m1)
- A23 — The service's interface sits under `/api`, and `/api/health` answers once the service is
  up. The environment variables of A4 are `CLIPPER_DATA_DIR`, `CLIPPER_FFMPEG_DIR`,
  `CLIPPER_KEY_FILE`, `CLIPPER_WEB_PORT` and `CLIPPER_SERVICE_PORT`. Three more serve test runs:
  `CLIPPER_WEB_BUILD_DIR`; `CLIPPER_REPORTED_FREE_BYTES`, which replaces the free disk space the
  tool reports so the 5 GB rule can be checked on any disk; and `CLIPPER_EVIDENCE_DIR`, the
  folder the capture test writes to. A test run uses web port 3100 and service port 8865. The
  virtual environment is `service/.venv`. (planner, m1)
- A24 — The address a rewrite forwards to is fixed when the web app is built (measured on Next.js
  16.3.8). A normal start builds into `.next` and builds again when the service port has changed.
  A test run builds into `.next-test`, a cache kept between runs like the model cache in A11.
  (planner, m1)
- A25 — `pnpm test:browser <file>` runs the named browser tests alone, building the fixtures and
  starting the tool as the full run does. A check on one behaviour needs a command that runs that
  behaviour's test by itself. (planner, m1)
- A26 — Four choices depart from A21's newest release or its usual install. TypeScript is 6.0.3
  and ESLint 9.39.5, because the lint configuration that ships with Next.js 16.3.8 accepts
  neither TypeScript 7 nor ESLint 10. yt-dlp installs with its YouTube script package and without
  its default extras, one of which carries the GPL. pnpm skips Next.js's optional image library,
  whose binary carries the LGPL. The web app's unit tests run without a simulated page: the
  current jsdom needs a newer Node than 22.13, and what needs a page is tested in a real browser
  by the browser tests. (planner, m1)
- A27 — Every project has four steps, as in the prototype. For an uploaded file the first step is
  sending the file and then, in the queue, reading its length and making the preview copy; it
  reads "Uploading video" and then "Preparing video". For both kinds of source the step's bar
  counts the arrival of the bytes as its first 70% and the preparation as the rest. A project
  resting after its last built step reads "Fetched" in its row and on its status screen, which
  names the steps not yet started. (planner, m1)
- A28 — An upload whose page was closed stays listed as uploading. Its status screen, opened in a
  browser that is not sending the file, says so and tells the user to delete the project and
  upload again. D54 requires the browser to stay open and names no recovery. (planner, m1)
- A29 — At 720 px and wider, `/` shows the newest project beside the sidebar, as the prototype
  does, or the empty state when there is none. `/projects/<id>` shows the status screen until the
  project has candidates, and from then on leads to its Review tab. No project can have
  candidates in M1, so M1's checks of the tabs present a fetched project to the page as ready; the
  tabs show the prototype's empty states. (planner, m1)
- A30 — In M1 the two Settings controls whose work a later milestone builds are shown disabled:
  Save for the API key (M3) and "Forget All of It" (M6). The free disk space and the phone address
  are real from M1, because the Library and the 5 GB rule already read the disk and a made-up
  address would be a pretend value. (planner, m1)
- A31 — The copied stylesheets stay identical to the prototype's files, and the design tokens keep
  the prototype's names and values. A rule the real app needs beyond them goes into one further
  stylesheet, so every departure from the prototype sits in one place. (planner, m1)
- A32 — FastAPI 0.142.2 requires the OpenTelemetry interface package and, left at its defaults,
  traces requests and sends them to a collector when the environment names one. The service
  starts FastAPI with its tracing, metrics, logs and exporter setup switched off, and without its
  documentation pages, which load scripts from a public address. The boundaries allow no
  telemetry and three outside contacts only. (executor, m1)
- A33 — The status screen of an upload shows the bytes this browser has sent as the fill of its
  bar, read from the count the service holds, and keeps the prototype's wording; it adds no
  figure in megabytes. The prototype has no wording for one. (executor, m1)
- A34 — The 200% text check doubles the root font size before a page loads, as a browser's text
  size setting does. Doubled after the load, Chromium keeps a container rule measured in `rem` at
  its old width, and the prototype's narrow sheet bar never applies. A label counts as cut when
  its text overflows its own box, when it lies outside an ancestor that hides overflow, or when
  it is the chosen option of a select narrower than that option. Text typed into a field and a
  field's hint scroll with the field and are not counted. (executor, m1)
- A35 — A Settings choice shows its chosen option as text that wraps, with the select lying over
  it unseen, and moves under its label when the two do not fit side by side. In a group narrower
  than 18 rem, any row lets a control move under its label. The prototype's select cuts a long
  option with an ellipsis, at 390 px for the transcription model and at 200% for four of the six
  choices, which R7 does not allow. The rules sit in the app's own stylesheet, and the copied
  stylesheets stay unchanged. (executor, m1)
- A36 — When the tool is stopped, the service stops first, and the web app stops once the
  service's process has ended. The web app's address is the one the user opens, so it is the last
  thing to close: when it no longer answers, nothing of the tool is still listening. The intent
  asks for one command that starts the tool and does not say how the tool stops. (planner, m1)
- A37 — A saved screen capture holds its whole screen. For a screen longer than the window, the
  capture is taken with the window made as tall as the screen, at the same width. On a phone the
  tab bar floats over a screen that scrolls, as in the prototype, so a capture of the first
  window alone shows the bar over text and leaves out what is below it. (planner, m1)
- A38 — The capture check counts the tab bar as the strip it occupies across the bottom of the
  phone window, from edge to edge, and not only the pill drawn in the middle of that strip. A
  line of text beside the pill counts as lying under the bar. A phone screen keeps more room than
  the strip free under its content, so a screen shown whole leaves the strip empty. The plan says
  "under the tab bar" and names no box. (executor, m1)
- A39 — mlx-whisper is 0.4.3, its newest release. Bootstrap installs the pinned packages exactly
  as listed, without following their declared dependencies; both requirement files already name
  every package. Two packages that mlx-whisper declares are left out because transcription never
  loads them: PyTorch, a 127 MB download that only its model converter uses, and `requests`, which
  brings `certifi` under the MPL. `tqdm` is installed: mlx-whisper cannot be imported without it,
  and part of it is under MPL-2.0. It is used unchanged and nothing of it is copied into the app.
  D61 names mlx-whisper, and every other package it needs carries a permissive licence.
  (planner, m2)
- A40 — The three models in Settings are the MLX conversions that the `mlx-community` group
  publishes on Hugging Face: `whisper-large-v3-turbo`, `whisper-medium-mlx` and
  `whisper-small-mlx`. The tool fetches a model's two files itself, over HTTPS, at a fixed
  revision, into a folder named after the choice inside `models` in the data folder. A download
  carries on from the bytes it already holds, and a model counts as on the Mac once its folder is
  complete. The Hugging Face client that mlx-whisper loads is kept offline; left to itself it
  stores models and logs in the user's home folder. `CLIPPER_MODEL_SOURCE` replaces
  `https://huggingface.co` as the place models come from. (planner, m2)
- A41 — A test run transcribes with `mlx-community/whisper-tiny`, 74 MB, kept in
  `.cache/whisper/tiny`. `pnpm bootstrap` fetches it, and a test run fetches it when it is
  missing. The run copies it into its data folder under the default choice, so no test downloads
  a model unless it asks to, and a transcript made in a test run names the default model while it
  was made by the smallest. The run points `CLIPPER_MODEL_SOURCE` at a local server that answers
  every model with those files. The service's own tests point it at a closed local port, so none
  of them reaches Hugging Face. (planner, m2)
- A42 — The download step joins a project when its transcription is about to start and the chosen
  model is not on the Mac. The project then has five steps, and the second reads "Downloading
  Whisper large-v3-turbo", with the name of the chosen model. The prototype adds the step when the
  project is created; by the time the project's turn comes, another project may have fetched the
  model, or the choice in Settings may have changed. The step shares the transcribe step's quarter
  of the project's bar, so the bar does not fall when the step appears. A download that fails
  reads "The transcription model could not be downloaded. Check your connection, then retry."
  (planner, m2)
- A43 — Transcription runs in a process of its own, which the service starts for each project and
  ends when the step is stopped or the tool shuts down. Its memory returns to the Mac when it
  finishes. It takes the sound in parts of about ten minutes, each cut at the quietest moment
  before its mark. Measured on this Mac: mlx-whisper works out the spectrogram of everything it is
  given before it decodes, and three hours of sound took 7 GB for that alone; cut into two parts,
  the twenty-minute fixture lost no word. (planner, m2)
- A44 — The transcript is one file, `transcript.json`, in the project's folder: the language, the
  model that made it, and the words in order. Each word has its text as the model gave it, with
  the space in front of it when there is one, so that the words joined give the text in any
  language, and a start and an end in seconds. Before the file is written the times are put in
  order: no word starts before the word before it ends, none ends before it starts, and none lies
  outside the video's length. R11 puts transcripts in the data folder beside the database, and
  deleting the project removes the file with the folder. (planner, m2)
- A45 — A source has no recognisable speech when it has no sound track, when its sound stays
  under one thousandth of full scale, or when the model returns no word. The stage then fails with
  "No speech was recognised in this video. Clipper needs spoken words to find clips." A part of
  the sound that stays under that level is not given to the model. Measured: on twenty seconds of
  silence the smallest model wrote one word, and its own no-speech score, taken alone, marked
  real speech in the long fixture as silence. (planner, m2)
- A46 — A project resting after this milestone reads "Transcribed" in its row and on its status
  screen, which names the two steps not yet started. At start, a project that rests after a step
  built by an earlier version goes back into the queue when the next step now exists, so a
  project fetched before this milestone is transcribed. (planner, m2)
- A47 — Two more fixture videos are built with the talk: twenty seconds of silence, and the
  talk's speech five times over a small picture, about twenty minutes, long enough for a check to
  stop the step or the tool while it is being transcribed. The fixture's stored transcript, with
  the video's length, is committed as a file in the milestone's evidence folder, so the checks on
  its words can be repeated on what the tool produced. (planner, m2)
- A48 — The transcriber cuts a part in the middle of the quietest half second before its mark,
  and the quietest half second is the one whose samples add up to the least. For each stretch and
  each part it prints one line, `transcribed_seconds=` and the seconds done so far. It writes its
  result as one JSON object: the language, or none when no part reached the model, and the words.
  When sound has to reach the model and the model folder holds none, it ends with an error that
  names the folder. The plan fixes what the transcriber does and leaves these forms open.
  (executor, m2)
- A49 — The latest time a transcript holds is the video's length rounded down to a hundredth of a
  second. The plan rounds every time to a hundredth, A44 keeps every time inside the video, and a
  video's length is rarely a whole hundredth. (executor, m2)

## Milestones

### m1-a-running-tool-with-a-library-and-import

Outcome: one command starts the tool. The Library, the new project sheet, the status screen, the
project view and Settings exist as laid out in the prototype, on phone and desktop, each at its
own address. A project created from an upload or a link is fetched, given a preview copy, and
listed with its real length and its stage progress, all stored. Projects wait their turn, and a
project can be stopped, resumed and retried.

Done when:

- The start command brings the tool up, and the Library opens at the address it prints.
- Started with a setting that points at a folder without ffmpeg, the tool stops with a message
  that names ffmpeg.
- Uploading the fixture video creates a project whose row shows the fetch stage progressing and
  then complete, with the fixture's real length.
- A link to the same file, served by a local test server, does the same.
- After the tool is stopped and started again, both projects are listed in the same state.
- A link that is not a link, a missing file, and no platform selected each show the error under
  its field, as the prototype does, and move focus to that field.
- With no projects, the Library shows the empty state from D66, and its control opens the new
  project sheet.
- Deleting a project after confirming removes it from the Library and removes its files from the
  data folder. Cancelling the confirmation removes nothing.
- With free space reported as under 5 GB, creating a project is refused with the reason from D67.
- A second project created while the first is being fetched shows as waiting and starts when the
  first finishes.
- A link the test server answers with "not found" fails the fetch stage with a reason and a Retry
  control. Stop during a fetch leaves the project stopped, and Resume finishes it.
- An upload shows its progress, and a 50 MB upload arrives at the same size it was sent.
- Opening a project, reloading the page and pressing Back each land where D51 says.
- At 390 px the Library is a list above a tab bar and the new project form opens as a sheet. At
  1360 px the projects are in a sidebar and the sheet is centred. Screen captures at both widths,
  in light and in dark, are saved.
- At 390 px no screen scrolls sideways and no label is cut off, at the normal text size and at
  200%.
- The test command passes.

Tasks:

- Set up the repository: the ignore rules, the root commands, the web app and the service with
  pinned dependencies, the linters and type checks, and the recorded code layout of each part.
- Give the service its start-up settings, its data folder, its database, and the ffmpeg and
  ffprobe check that stops the start with a plain message.
- Build the fixture video from synthesised speech over a generated picture, and a local server
  that serves it for the link checks.
- Store projects and their stage states. Create, list, read and delete a project, deleting its
  files with it, and refuse a new project when less than 5 GB is free.
- Receive an upload of up to 4 GB straight to disk with its size intact.
- Run the queue with one worker: creation order, stored progress, recovery after a restart, Stop,
  Resume, Retry, and plain failure reasons, a full disk among them.
- Build the fetch stage: download a link through yt-dlp at no more than 1080p, read the real
  length, and make the 720p preview copy.
- Copy the prototype's design tokens and stylesheets into the web app and build the shell: sidebar
  and toolbar from 720 px; tab bar, pushed screens and bottom toolbar below; light and dark.
- Build the Library: project rows with stage progress asked for once a second, the sidebar list,
  and the empty state.
- Build the new project sheet at its own address: source, clip length, platforms and the optional
  brief, errors under their fields with focus moved to the field, upload progress, and the
  low-disk refusal.
- Build the status screen for uploading, waiting, processing, failed and stopped projects, with
  Stop, Resume and Retry.
- Build the project view's frame: the three tabs at their own addresses, and the More menu with
  Delete Project and its confirmation.
- Lay out Settings with every control from the prototype, storing each choice.
- Write the start command, which runs both parts and prints the address, and the test command,
  which runs every check and removes what it created.
- Write browser tests for the milestone's checks, with captures at 390 px and 1360 px in light and
  in dark, and the 200% text check.
- Write the README and the instructions for coding agents.

Files:

- `.gitignore` — new
- `package.json` — new
- `pnpm-workspace.yaml` — new
- `README.md` — new
- `AGENTS.md` — new
- `CLAUDE.md` — new
- `scripts/` — new
- `fixtures/` — new
- `web/package.json` — new
- `web/next.config.ts` — new
- `web/tsconfig.json` — new
- `web/eslint.config.mjs` — new
- `web/vitest.config.ts` — new
- `web/playwright.config.ts` — new
- `web/.coding-standards-structure` — new
- `web/src/app/` — new
- `web/src/shared/` — new
- `web/src/shell/` — new
- `web/src/library/` — new
- `web/src/project/` — new
- `web/src/settings/` — new
- `web/e2e/` — new
- `service/pyproject.toml` — new
- `service/requirements.txt` — new
- `service/requirements-dev.txt` — new
- `service/.coding-standards-structure` — new
- `service/clipper/main.py` — new
- `service/clipper/storage/` — new
- `service/clipper/media/` — new
- `service/clipper/projects/` — new
- `service/clipper/pipeline/` — new
- `service/clipper/fetching/` — new
- `service/clipper/settings/` — new
- `docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/` — new

### m2-transcripts-made-on-the-mac

Outcome: the transcribe stage produces a word-level transcript for every project, with progress in
the Library and the model choice in Settings.

Done when:

- The fixture project reaches the transcribed state.
- Every word in the stored transcript has a start and an end, the times never go backwards, and
  all of them fall inside the video's length.
- The transcript matches the fixture's script with at most 15 words wrong in every 100.
- A silent fixture fails the stage with the reason from D16, and Retry reruns that stage alone.
- The first project to use a model that is not on the Mac shows the download as its own step
  before transcription.
- Stopping the tool during transcription and starting it again leaves one project, which finishes
  the stage.
- The test command passes.

Tasks:

- Add mlx-whisper at a pinned version and transcribe a source into words with a start and an end
  time each, stored with the project.
- Keep models in the data folder, and download a missing model as a step of its own, with
  progress, before transcription.
- Add the transcribe stage to the queue: progress, the no-speech failure, Retry of that stage
  alone, and completion after a restart.
- Make the transcription model chosen in Settings the one the stage uses.
- Show the model download step and the transcribe stage in the Library and on the status screen.
- Add a silent fixture, and tests that transcribe with the smallest model and compare the result
  with the fixture's script.

Files:

- `service/clipper/transcription/` — new
- `service/clipper/pipeline/` — changed
- `service/clipper/settings/` — changed
- `service/clipper/main.py` — changed
- `service/requirements.txt` — changed
- `fixtures/` — changed
- `scripts/` — changed
- `web/src/library/` — changed
- `web/src/project/` — changed
- `web/src/settings/` — changed
- `web/e2e/` — changed

### m3-ranked-clip-candidates

Outcome: the score and cut stages turn a transcript into ranked candidates with every field in D21.
Window scores and replay peaks are stored for the Review tab.

Done when:

- Every check below runs on recorded model responses.
- The fixture project reaches the ready state with candidates that carry every field in D21.
- Every candidate starts on the first word of a transcript sentence and ends on the last word of
  one.
- No candidate is shorter or longer than the chosen length preset.
- No two candidates overlap by more than half of the shorter one.
- A recorded response that quotes text absent from the transcript loses that clip and keeps the
  others.
- A malformed response is retried twice, and the stage then fails with a readable reason.
- The request for pass one contains every window once, and the shortlist size follows D18.
- Every selection request names a model identifier from D27, sets no temperature, forces no tool
  call, and carries an effort setting only for a model that accepts one.
- With a recorded replay graph, the candidates that overlap its peaks carry the marker.
- With no key saved, the score stage fails with the reason from D30.
- A saved key appears in no response to the browser and in no log line.
- The test command passes.

Tasks:

- Save the API key from Settings to its file outside the repository, show it masked, and keep it
  out of every response and every log line.
- Split a transcript into sentences, and into windows of about 90 seconds with 30 seconds of
  overlap that start and end on sentence boundaries.
- Call Claude through the official SDK under the request rules of R38, retry a malformed reply
  twice, and then fail the stage with a readable reason.
- Build pass one: score every window once and form the shortlist.
- Build pass two: cut clips inside the shortlist, place each quote in the word-level transcript,
  drop the quotes that are not found, and apply the length preset, the overlap rule and the clip
  count.
- Keep the replay graph from a link's metadata, mark the candidates that overlap its peaks, and
  break ranking ties with the marker.
- Add the score and cut stages to the queue, ending in the ready state, with the missing-key
  failure that points to Settings.
- Store window scores and replay peaks for the Review tab.
- Show the two stages in the Library and on the status screen.
- Write the recorded responses for the fixture, and a stand-in for the API that serves them and
  keeps each request for the checks to read.

Files:

- `service/clipper/selection/` — new
- `service/clipper/settings/` — changed
- `service/clipper/fetching/` — changed
- `service/clipper/pipeline/` — changed
- `service/clipper/main.py` — changed
- `service/requirements.txt` — changed
- `fixtures/` — changed
- `web/src/settings/` — changed
- `web/src/library/` — changed
- `web/src/project/` — changed
- `web/e2e/` — changed

### m4-the-review-workbench

Outcome: the Review tab works on real data: the source timeline with window scores and clip
markers, the filtered candidate list, the preview playing source footage with captions, and the
inspector with scores, reason, flags, boundary editing, title and decision. Every change is stored.

Done when:

- Every check below runs as a browser test on the fixture project.
- Selecting a candidate shows its reason, its four subscores, its total and its rank.
- The sentence controls move the in point and the out point by one transcript sentence, and the
  length shown changes to match.
- The 0.2-second controls stop at one second either way, and every control at its limit is
  disabled.
- The length reading states whether the clip is inside the preferred band, inside the limits, too
  short or too long.
- A kept clip, a rejected clip with its reason, and an edited title are all still there after a
  reload, and the counts in the list filters and in the Library row match.
- Play moves through the clip and stops at the out point, and the caption shown at a given moment
  is the words spoken at that moment.
- At 390 px the candidate list shows first; opening a clip shows the detail with the fixed bar of
  Reject, Keep and Next; the back control returns to the list.
- Reject opens the menu from D31. Choosing a reason marks the clip rejected with that reason, and
  "Undo Reject" clears it.
- The filmstrip shows frames from the fixture video. Dragging a handle moves that point to a
  sentence boundary, and the times and the length shown change to match.
- Each tab and each clip opens at its own address, and a reload returns to it.
- At 390 px, scrolling the clip screen past the preview pins it under the top bar, and it still
  plays.
- On the Review tab at 390 px no screen scrolls sideways and no label is cut off at 200% text
  size, and no control has a tap area under 44 px.
- Screen captures at 390 px and 1360 px, in light and in dark, are saved.
- The test command passes.

Tasks:

- Serve a project's candidates, window scores, transcript sentences and look, and store decisions,
  reject reasons, titles, boundaries and the look.
- Make the filmstrip frames from the source when a clip is cut.
- Build the Review tab at desktop width: the source timeline with window scores and clip markers,
  the filtered candidate list, the preview and the inspector.
- Build the inspector: rank, total and the four subscores with the wording R44 asks for, the
  reason, the flag and the replay marker, the editable title, and Keep and Reject with the reason
  menu and Undo Reject.
- Build boundary editing: sentence steps, 0.2-second steps up to one second, disabled controls at
  their limits, the length reading, the cleared "needs context" flag, and filmstrip handles that
  snap to sentence boundaries.
- Build the preview: the source footage inside a 9:16 frame with the chosen framing, captions in
  the three styles from the word times, the hook title, the safe-zone guides and the project-wide
  look controls, drawn in Inter.
- Build the phone layout: the list first, the clip screen with the fixed bar of Reject, Keep and
  Next, the pinned preview strip, and Back to the list at the position it was left.
- Give every clip its own address.
- Show the notice in place of the preview when the source is gone.
- Write browser tests for the milestone's checks, with the tap-area and 200% text checks and
  captures at both widths in light and in dark.

Files:

- `service/clipper/review/` — new
- `service/clipper/selection/` — changed
- `service/clipper/main.py` — changed
- `web/src/review/` — new
- `web/src/app/` — changed
- `web/src/shared/` — changed
- `web/src/library/` — changed
- `web/public/fonts/inter/` — new
- `web/e2e/` — changed
- `docs/missions/clipper-tool/m4-the-review-workbench/evidence/` — new

### m5-rendered-clips-and-export

Outcome: the Export tab renders kept clips into finished vertical videos and offers each file and
its platform text.

Done when:

- Rendering the kept fixture clips produces files that ffprobe reports as 1080 × 1920, 30 frames
  per second, H.264 with AAC, each within 0.1 seconds of its clip's length.
- With the hook title on, a frame at 1 second shows the title and a frame at 4 seconds does not.
  Both frames show captions. The frames are saved as evidence.
- Each of the three framings gives a different picture for the same clip, saved as evidence.
- With the portrait fixture, the follow-speaker framing keeps the face inside the frame. With a
  fixture that has no face, the crop is centred.
- The queue shows progress for each clip and is intact after a reload. A render that fails shows
  its reason and a Retry control.
- Cancel during rendering stops the clips not yet finished and leaves the finished files in place.
- Download returns the finished file, marked as a video attachment.
- Each Copy control puts that platform's text on the clipboard.
- The test command passes.

Tasks:

- Find faces with OpenCV and the YuNet detector, and commit the detector's model file with its
  licence.
- Work out the crop of each framing: follow the speaker with smoothed movement and a centred
  fallback, stack two with its fallback, and the whole frame over a blurred copy of itself.
- Draw captions and the hook title as images in Inter, timed from the word-level transcript, in
  the three caption styles.
- Render one clip with ffmpeg to 1080 × 1920 at 30 frames per second, H.264 with AAC, in MP4, with
  the images laid over the video.
- Run the render queue: kept clips one at a time, stored progress, a reason and Retry on failure,
  and Cancel that leaves finished files in place.
- Build the Export tab: the queue with progress, Download as a video attachment, each platform's
  title and description with its Copy control, and the explanation shown when the source is gone.
- Add the portrait fixture with its source and licence, and a fixture with no face.
- Write tests for the milestone's checks and save the evidence frames.

Files:

- `service/clipper/rendering/` — new
- `service/clipper/main.py` — changed
- `service/requirements.txt` — changed
- `fixtures/` — changed
- `web/src/export/` — new
- `web/src/app/` — changed
- `web/e2e/` — changed
- `docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/` — new

### m6-results-learning-settings-and-storage-care

Outcome: the Results tab stores views and compares them with the ranking. Rejection reasons and
results shape later selections. Every Settings control works, and old sources are cleaned up.

Done when:

- Views entered on the Results tab are still there after a reload, and for a seeded set the order
  and the summary sentence are correct.
- After clips are rejected with reasons and views are logged, the selection request for a new
  project contains the note from D40. After "Forget all of it", it does not.
- Changed model choices appear in the next selection request, and a changed default clip length is
  preselected in the new project form.
- The free disk figure is within 1 GB of what the system reports.
- Deleting a project that has exports removes its export files.
- A source older than the retention setting is removed by the cleanup. Its project still opens,
  the Review tab shows the notice from D56, the Export tab states that the source is gone, and
  its exports are untouched.
- Settings shows an address made of the Mac's local network address and port 3000, and the tool
  answers a request sent to that address.
- The README's setup, start, test and phone instructions work when followed from a fresh copy of
  the repository.
- The test command passes.

Tasks:

- Store the views entered for each exported clip, and build the Results tab: the clips in order of
  views against the tool's ranking, with the summary sentence.
- Write the note from the user's history before each selection, send it to both passes, and clear
  its history on "Forget all of it".
- Make every Settings control take effect: the model for each pass, the default clip length, the
  clips per video and the retention period.
- Show the Mac's real free disk space and the phone address in Settings.
- Delete sources and preview copies past the retention period, and keep such a project openable
  with its exports, the Review notice and the Export tab's explanation.
- Remove a deleted project's export files while keeping what it added to the history.
- Follow the README from a fresh copy of the repository and correct whatever fails.
- Write tests for the milestone's checks.

Files:

- `service/clipper/results/` — new
- `service/clipper/storage/` — changed
- `service/clipper/selection/` — changed
- `service/clipper/settings/` — changed
- `service/clipper/projects/` — changed
- `service/clipper/main.py` — changed
- `web/src/results/` — new
- `web/src/settings/` — changed
- `web/src/library/` — changed
- `web/src/review/` — changed
- `web/src/export/` — changed
- `web/src/app/` — changed
- `web/e2e/` — changed
- `README.md` — changed
- `AGENTS.md` — changed

## Overlap

None.
