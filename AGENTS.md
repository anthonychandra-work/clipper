# Clipper: instructions for coding agents

Clipper is two parts: a Next.js web app in `web` and a Python FastAPI service in `service`. The
browser talks only to the web app, which forwards every `/api` request to the service.

## Commands

Run every command from the repository root.

- `pnpm install` installs the web app's packages.
- `pnpm bootstrap` creates the Python environment in `service/.venv` with
  `/opt/homebrew/bin/python3.12`, installs the pinned Python packages without following their
  declared dependencies, installs the browser the tests drive into `.cache/playwright`, and
  fetches the test model into `.cache/whisper`. Its first run compiles OpenCV, which takes about
  four minutes. A later run builds nothing.
- `pnpm start` starts the service on `127.0.0.1:8765` and the web app on port 3000, then prints
  the address to open. It builds the web app when the build is missing or older than the sources.
  Ctrl-C stops both parts: the service first, and the web app once the service's process has
  ended, so nothing of the tool is still listening when the address no longer answers. The order
  is the same when one part ends by itself.
- `pnpm test` runs every check: Ruff, mypy, pytest, ESLint, the web build, the TypeScript check,
  Vitest and Playwright. It runs them all, reports each as passed or failed, and exits 0 only when
  all passed.
- `pnpm test:browser <file>` runs the named browser tests alone, for example
  `pnpm test:browser e2e/start-command.spec.ts`. Paths are relative to `web`.
- `service/.venv/bin/python -m ruff format service/clipper` formats the Python code. Format before
  a commit; `pnpm test` checks the Ruff rules and not the formatting.

A test run starts its own copy of the tool on ports 3100 and 8865, builds the web app into
`web/.next-test`, and keeps its data in a temporary folder that it removes at the end. It does
not touch a running tool or the `data` folder. Browser tests take the tool from the `tool`
fixture in `web/e2e/support`, which can stop it and start it again inside a test.

Seven environment variables change where a run keeps its files, which ports it uses, where it
downloads models from and where it sends its requests for clips: `CLIPPER_DATA_DIR`,
`CLIPPER_FFMPEG_DIR`, `CLIPPER_KEY_FILE`, `CLIPPER_WEB_PORT`, `CLIPPER_SERVICE_PORT`,
`CLIPPER_MODEL_SOURCE` and `CLIPPER_ANTHROPIC_SOURCE`. Three more serve test
runs: `CLIPPER_WEB_BUILD_DIR` names the folder the web app is built into,
`CLIPPER_REPORTED_FREE_BYTES` replaces the measured free disk space, and `CLIPPER_EVIDENCE_DIR`
names the folder the tests save their evidence into. `README.md` gives what each is without the
variable.

Commit messages read `<type>(<scope>): <summary>`.

## Transcription in tests

- Tests transcribe with the smallest Whisper model, `mlx-community/whisper-tiny`, 74 MB.
  `node scripts/fetch-test-model.mjs` fetches it into `.cache/whisper/tiny` and prints that
  folder. Once the folder is complete the program fetches nothing.
- A browser test run copies the test model into its data folder under the default model's name,
  so a transcript made in a test run names `large-v3-turbo`. It serves the model's folder on a
  local port for the life of the worker and hands that address to the tool as
  `CLIPPER_MODEL_SOURCE` at every start. A test that downloads a model gets the test model's
  files under the name it asked for.
- The service's tests set `CLIPPER_MODEL_SOURCE` to a closed local port unless a test names a
  source, and `pnpm test` does the same for everything it starts. No test reaches Hugging Face.
- `service/clipper/conftest.py` holds ten top-level functions and classes, the most the hooks
  allow. A new fixture goes into a `conftest.py` inside its package. What every test needs is a
  statement at the top of the root one.

## Selection in tests

- No test reaches the Anthropic API. `node scripts/serve-recorded-claude.mjs fixtures/claude` is
  a stand-in for it: it serves the recorded replies of `fixtures/claude`, one folder for each
  scenario, on a free loopback port and prints its address. A request to
  `/<scenario>/v1/messages` gets the scenario's reply to the task it carries, `/slow/` in front
  makes the answer six seconds late, and scenarios joined by `+` are tried in that order.
  `GET /requests` gives what it was asked, never a key, and `DELETE /requests` forgets it.
  `fixtures/README.md` lists the scenarios and the form of a recorded reply.
- A service test takes the stand-in from the `recorded_claude` fixture in
  `service/clipper/selection/conftest.py`, which starts it once a session, and hands its address
  to what it tests. A browser test run starts it for the life of the worker and hands the tool
  its `talk` scenario as `CLIPPER_ANTHROPIC_SOURCE` at every start. A browser test reads and
  clears its requests through the `recordedClaude` fixture.
- Everything else a test run starts gets a closed local port as `CLIPPER_ANTHROPIC_SOURCE`:
  `pnpm test` sets it, and `service/clipper/conftest.py` sets it whatever the shell says. The tool
  hands the SDK the saved key and that address itself, so a key, a token or an address for
  Anthropic in the shell is never used.
- A test run starts with no key saved, so a project in a test ends failed at the score step with
  "No Anthropic API key is saved. Add one in Settings, then retry." The browser tests describe
  that end once, in `web/e2e/support/keyless-end.ts`. A test that needs candidates saves the key
  `sk-ant-test-4f2a` first and removes it when it ends: a browser test through the `savedKey`
  fixture or on the Settings screen, a service test into a key file in its temporary folder.
- The test key is short on purpose. The hook that scans every write for secrets refuses `sk-`
  followed by twenty or more key characters, and a test key under that length passes it.
- `service/clipper/conftest.py` sets `CLIPPER_KEY_FILE` to a path under `/dev/null`, where no file
  can be read or made. A service test that saves a key names a key file of its own, and none
  opens the key file in the user's home.
- Selection asks Claude through the SDK's async client, run to its end in the queue's thread and
  cancelled when the stop signal is set. Keep it that way: a stream closed from another thread
  does not end the thread that reads it, so a stop would not end the step.
- A browser test that checks what a page received fetches each answer itself, by routing the
  page's requests through the test. Asked afterwards, the browser no longer holds the body of an
  answer to a page it has left, or of a link the framework fetched ahead of a tap.

## Layout

Each part records its layout in a `.coding-standards-structure` file. Follow it; do not move
folders.

- `scripts/` holds the command programs, one program per file.
- `fixtures/` holds the committed test inputs.
- `web/src/app/` holds routes only. A route renders a screen from a capability folder.
- `web/src/shared/` holds the styles, the generic interface parts and the code three capabilities
  use. `web/src/shell/`, `library/`, `project/`, `review/`, `export/` and `settings/` are the
  capabilities. Each holds use-case folders with `components/`, `hooks/`, `lib/` and `api/`, and
  exports through its `index.ts`.
- Web imports run one way: `shared` is used by all; `shell` by `library`, `project`, `review`,
  `export` and `settings`; `library` by `project`, `review`, `export` and `settings`. `review`,
  the Review tab, and `export`, the Export tab, each also import `project`, which gives them the
  project's frame and the open project, and nothing but `app/` imports either of them. `export`
  reads its own address of the service and imports nothing of `review`. `app/` joins
  capabilities that would otherwise import each other: it hands the project screen the Review
  tab and the Export tab.
- `web/e2e/` holds the browser tests, with their shared code in `support/`.
- `service/clipper/` holds one package per capability: `problems`, `settings`, `storage`,
  `media`, `projects`, `pipeline`, `fetching`, `transcription`, `selection`, `review` and
  `rendering`. Each exports through its `__init__.py` and has at most one router. `main.py`
  joins them.
- Service imports run one way: `fetching` and `transcription` import `pipeline`, `projects`,
  `media` and `storage`, and `transcription` also imports `settings`; `pipeline` imports
  `projects` and `media`; `projects` imports none of them. `selection` imports `transcription`
  for the stored transcript, and `settings`, `pipeline`, `projects` and `storage`. `review`, the
  package behind the Review tab, imports `selection`, `transcription`, `projects`, `media` and
  `storage`. `rendering`, the package behind the Export tab, imports `review`, `selection`,
  `projects`, `pipeline`, `media` and `storage`. Nothing but `main.py` imports `fetching` or
  `rendering`, nothing but `main.py` and `rendering` imports `review`, nothing but `main.py`,
  `review` and `rendering` imports `selection`, and nothing but `main.py`, `selection` and
  `review` imports `transcription`. `main.py` hands `projects` what it needs from `pipeline`.
- The transcriber, `service/clipper/transcription/transcribe_audio.py`, is a program of its own.
  The service starts it by its file path once for each transcription and imports nothing from
  it, and it imports nothing from the service. MLX and the model are loaded in that program
  alone, and their memory returns to the Mac when it ends. It is one file, so the limit of ten
  top-level functions and classes applies to all of it.
- The service starts ffmpeg and the transcriber through the program runner of `media`. Each runs
  in a process group of its own and ends on the stop signal, so a signal sent to the service's
  group does not end it behind the queue's back.
- A unit test sits beside the file it tests.
- `docs/missions/` holds the mission's intent, spec and plans. `docs/prototype/` holds the design
  reference.

## The Review tab

- `service/clipper/review` is the package behind the tab. It gives a project's review in one
  answer, takes the changes to a clip and to the look, and serves the preview copy with byte
  ranges and the filmstrip frames. It works out where a clip's points can go and groups a clip's
  words into captions, so the page and a later export draw the same groups. The cut step of
  `selection` is handed its frame maker by `main.py` and imports nothing from it.
- `web/src/review/` is the capability, with nine use cases: `open-review` holds a project's
  review and the tab's addresses, `time-clips` the rules for a clip's times and steps,
  `list-candidates` the list and its filters, `chart-source` the timeline, `inspect-clip` the
  title, the flag and the scores, `decide-clip` Keep, Reject and Next, `trim-clip` the in and out
  points, `preview-clip` the player and `set-look` the look. `open-review` imports the others and
  hands each what it shows as properties. None imports it back; several import `time-clips`.
- The store of a review shows a change at once, sends it, and puts the service's answer in its
  place. An answer that arrives after a newer change of the same clip does not undo that change.
- The Review addresses, `/projects/<id>/review` and `/projects/<id>/review/<clip>`, share one
  layout that holds the tab, and their pages draw nothing. Next.js keeps a layout mounted while
  the address moves between its pages, so the list's place and the playing video stay as they
  are from the list to a clip and from clip to clip. A page that drew the tab would mount it anew
  at every address.
- A clip is chosen with a link. Measured on Next.js 16.3.8: after a link the clip named in the
  address reaches the screen through the route's parameters, and after the browser's own
  `pushState` it does not.
- The video of the preview stays inside its place in the frame. A framing that shows another
  part of the picture draws it on a canvas from the video's frames. An element wider than the
  screen fails the text fit measure even where an ancestor cuts it off.
- Inter 4.1's variable font is `web/public/fonts/inter/InterVariable.ttf`, with its licence, the
  SIL Open Font License 1.1, beside it in `LICENSE.txt`. The page declares the font face in its
  own head, the caption and the hook title of the preview are drawn in it, and a later export
  reads the same file. Keep both files, unchanged.

## The Review tab in tests

- The Review tests share one ready talk: the fixture talk, cut with the recorded replies. A test
  takes it from the `readyTalk` fixture, which finds it by its title, its state and its six
  candidates, or makes it from a link to `talk.mp4`. Before each test the fixture deletes every
  other project and puts back every clip's decision, title and points and the project's look. A
  test leaves the project in place for the next one, and a test that moves one of its files aside
  moves it back when it ends, whatever its result.
- The browser the tests drive plays the preview copy, H.264 with AAC, through the web port. A
  test presses Play and reads the video's time and the caption together.
- `web/e2e/support` holds three measures. The text fit finds a screen that scrolls sideways, an
  element wider than the screen and a cut label, at the normal text size and at 200%. The tap
  area measure scrolls each control to the middle of the window and taps 21 px to its left, to
  its right, above and below its middle; each tap must land on the control or on its label. The
  contrast measure composes a text's colour with the backgrounds behind it, plain gradients among
  them, and finds a text under 4.5 to 1. The last two leave out controls that are switched off.
  The tap area measure also leaves out a control whose middle is covered, and the contrast
  measure text over the video.
- `web/e2e/review-fit.spec.ts` runs the three over the Review screens, on the ready talk and on
  a review presented to the page with twelve crowded clips, 180 windows and long titles. A rule
  a screen needs to pass goes into `app.css`.
- `web/e2e/review-captures.spec.ts` saves the captures of the Review tab and the talk's review
  into the folder `CLIPPER_EVIDENCE_DIR` names.

## Rules every write passes through

The coding-standards hooks on this Mac check every file an agent writes and refuse:

- a source file or folder named `utils`, `helpers`, `common` or `misc`; a file named `lib`, `util`
  or `helper`; and `types`, `constants` or the like directly under `src/` or `app/`;
- a file with more than 10 top-level functions or classes, test files excepted;
- a function body of more than 20 statements, test callbacks included;
- more than 3 positional parameters in TypeScript and JavaScript, more than 4 in Python.
  Parameters that FastAPI binds and pytest functions are not counted;
- `any` in TypeScript and `Any` in Python, in every position. JSX text is scanned as code, so a
  sentence on a screen that holds a colon followed by that word is refused too;
- names that start with `str`, `arr`, `obj` or `fn` followed by a capital, and the snake_case
  forms in Python;
- an empty `catch` or `except: pass`, `debugger` and `breakpoint()`;
- a comment longer than one line anywhere but the top of a file;
- an import that reaches past a folder's `index.ts`, and one that climbs three or more parent
  folders;
- a comment, a `hooks:` block or a rule switch in a `.coding-standards-structure` file.

Command programs write through `process.stdout.write` and `sys.stdout.write`, because
`console.log` and `print` draw a warning. An edit is checked only on the lines it adds, so check
whole files before a commit and fix every finding that is not tagged `[advisory]`:

```bash
python3 ~/.claude/skills/coding-standards/hooks/review-files.py <files>
```

Give it source files only. It cannot read an image and reports one as a finding.

## The design reference

The prototype in `docs/prototype/` is the reference for every screen, flow, wording and style, at
phone and desktop width, in light and in dark. Where it pretends, with sample projects or timed
progress, the app does the real thing.

- `web/src/shared/styles/` holds the prototype's seven stylesheets, `base.css`, `controls.css`,
  `lists.css`, `shell.css`, `review.css`, `player.css` and `pages.css`, copied byte for byte, and
  `tokens.css`, which holds the design tokens of the prototype's page with their names and values
  unchanged. Do not edit these eight files. The page loads them in the prototype's order.
- A rule the app needs beyond them goes into `app.css` in the same folder, so every departure
  from the prototype sits in one file.
- The copied rules select by class and by position: the sheet, the menu layer and the toast are
  later siblings of the app element, which carries the layout, the screen transition, the
  large-title state and the place of the clip preview as data attributes. The preview's place is
  `inline` or, once a phone screen is scrolled past the preview, `docked`. Keep that markup.
- The prototype's rows and tabs are buttons. Where the app needs an address, a link takes the
  same class.
- The app loads nothing from `docs/`. Copy what it needs.
- The phone layout ends at 719 px and the sidebar docks from 1000 px. Text stays usable at 200%:
  no screen scrolls sideways and no label is cut. `web/e2e/layout.spec.ts` and
  `web/e2e/text-size.spec.ts` measure both, and `web/e2e/captures.spec.ts` saves the screens a
  milestone commits as evidence. A capture holds its whole screen: for a screen longer than the
  window, the test makes the window as tall as the screen, at the same width, before it takes the
  picture. It fails when part of a screen stays out of view, or when text lies under the phone's
  tab bar.

## Forwarding from the web app to the service

Measured on Next.js 16.3.8:

- A request body over 10 MiB is cut on its way through a rewrite. Uploads travel in parts of
  8 MiB, each its own request.
- The address a rewrite forwards to is fixed when the web app is built. A changed service port
  needs a new build, and the start command makes one.
- A forwarded request with no answer for 30 seconds is dropped. Every service endpoint answers at
  once, and long work runs in the queue worker.
- Next.js sends usage data during a build unless `NEXT_TELEMETRY_DISABLED=1` is set. Every script
  that runs `next` sets it.

## ffmpeg

Measured on ffmpeg 8.1.2:

- `-shortest` over a picture that never ends does not end the video where its sound ends. It
  leaves from half a second to almost five seconds of picture after the sound, a different amount
  in each run: the picture source runs ahead of the sound, and how far is a race between two
  threads.
- A command that must end a video at a known moment states the length with `-t`. The fixture
  builder measures the speech with ffprobe and gives each video its length that way, and every
  build of a video then has the same picture length and the same sound length.

## Dependencies

Every version is exact: in both `package.json` files, and with `==` in both requirements files,
transitive packages included. The service starts FastAPI with its tracing, metrics, logs and
exporter setup switched off, and without its documentation pages. `sharp` is left out of the web
app and `yt-dlp` is installed without its optional packages, because each would bring in a
library under the LGPL or the GPL.

Bootstrap installs the two requirements files without following dependencies, so a package is
installed only when a file names it. To add one, add every package it needs at an exact version.
Two packages that mlx-whisper declares are left out because transcription never loads them:
`torch`, which only its model converter uses, and `requests`, which would bring in `certifi`
under the MPL. `pip check` names both as missing, and that is intended. `tqdm` is the one
installed package under the MPL, "MPL-2.0 AND MIT". mlx-whisper cannot be imported without it;
it is used unchanged and nothing of it is copied into the app.

OpenCV is `opencv-python-headless`, compiled on the Mac from its source release. Its ready-made
package carries 99 libraries inside it, FFmpeg, x264 and x265 among them, under the LGPL and the
GPL. `service/requirements.txt` therefore forbids the ready-made package, and `pnpm bootstrap`
builds OpenCV with FFmpeg and video reading switched off:

- The settings of the build are in `scripts/bootstrap-project.mjs`. They also keep the build
  from linking Homebrew's picture libraries and switch off the two downloads OpenCV makes while
  it is configured, a library from Arm's server and a font it builds in.
- The result links Apple's own frameworks only. What it compiles in beside OpenCV, libjpeg-turbo,
  libpng, zlib and Protocol Buffers, carries permissive licences.
- The tools pip fetches for the build are pinned in `service/build-constraints.txt`. They serve
  the build alone and are no part of the app.
- Install OpenCV with `pnpm bootstrap` and no other way. A pip command without the settings
  builds OpenCV with its own defaults, video reading among them.
- pip keeps the package it built in its cache and reuses it for the same release. After a build
  with other settings, take that package out of pip's cache and uninstall it before the next
  bootstrap.
- After any reinstall, `service/clipper/rendering/test_opencv_build.py` must pass. It fails when
  the installed OpenCV names FFmpeg in its build information, reads video, has a font built in
  or carries a folder of bundled libraries.

Clipper reads no video through OpenCV: ffmpeg writes the pictures it searches for faces.

## Boundaries

- Leave `.researches/` and `docs/prototype/` as they are.
- Commit no key, no video, no model weights and no database. Git ignores the data folder and any
  file holding secrets.
- The tool contacts three things only: the video source the user pasted, the Whisper model
  download, and the Anthropic API. No analytics and no telemetry.
- Tests call neither the live Anthropic API nor YouTube.
- Copy no code from the open-source clippers studied in `.researches/`; several carry the AGPL
  licence. Do not use Remotion.
- Libraries built into the app carry permissive licences such as MIT, BSD or Apache-2.0.
- Install nothing system-wide. Beyond Python 3.12, Node 22, pnpm and Homebrew ffmpeg, everything
  the project needs installs inside the project.
- No Docker.
- Committed fixtures stay under 20 MB in total. Data the tests create stays under 2 GB and is
  removed when the tests finish.
- The tool listens on the local network only. Add no tunnel and no public address.
