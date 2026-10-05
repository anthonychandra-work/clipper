# Clipper: instructions for coding agents

Clipper is two parts: a Next.js web app in `web` and a Python FastAPI service in `service`. The
browser talks only to the web app, which forwards every `/api` request to the service.

## Commands

Run every command from the repository root.

- `pnpm install` installs the web app's packages.
- `pnpm bootstrap` creates the Python environment in `service/.venv` with
  `/opt/homebrew/bin/python3.12`, installs the pinned Python packages without following their
  declared dependencies, installs the browser the tests drive into `.cache/playwright`, and
  fetches the test model into `.cache/whisper`.
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

Six environment variables change where a run keeps its files, which ports it uses and where it
downloads models from: `CLIPPER_DATA_DIR`, `CLIPPER_FFMPEG_DIR`, `CLIPPER_KEY_FILE`,
`CLIPPER_WEB_PORT`, `CLIPPER_SERVICE_PORT` and `CLIPPER_MODEL_SOURCE`. Three more serve test
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

## Layout

Each part records its layout in a `.coding-standards-structure` file. Follow it; do not move
folders.

- `scripts/` holds the command programs, one program per file.
- `fixtures/` holds the committed test inputs.
- `web/src/app/` holds routes only. A route renders a screen from a capability folder.
- `web/src/shared/` holds the styles, the generic interface parts and the code three capabilities
  use. `web/src/shell/`, `library/`, `project/` and `settings/` are the capabilities. Each holds
  use-case folders with `components/`, `hooks/`, `lib/` and `api/`, and exports through its
  `index.ts`.
- Web imports run one way: `shared` is used by all; `shell` by `library`, `project` and
  `settings`; `library` by `project` and `settings`. `app/` joins capabilities that would
  otherwise import each other.
- `web/e2e/` holds the browser tests, with their shared code in `support/`.
- `service/clipper/` holds one package per capability: `problems`, `settings`, `storage`,
  `media`, `projects`, `pipeline`, `fetching` and `transcription`. Each exports through its
  `__init__.py` and has at most one router. `main.py` joins them.
- Service imports run one way: `fetching` and `transcription` import `pipeline`, `projects`,
  `media` and `storage`, and `transcription` also imports `settings`; `pipeline` imports
  `projects` and `media`; `projects` imports none of them. Nothing but `main.py` imports
  `fetching` or `transcription`. `main.py` hands `projects` what it needs from `pipeline`.
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

- `web/src/shared/styles/` holds the prototype's five stylesheets, `base.css`, `controls.css`,
  `lists.css`, `shell.css` and `pages.css`, copied byte for byte, and `tokens.css`, which holds the
  design tokens of the prototype's page with their names and values unchanged. Do not edit these
  six files. `review.css` and `player.css` are copied when the Review tab is built.
- A rule the app needs beyond them goes into `app.css` in the same folder, so every departure
  from the prototype sits in one file.
- The copied rules select by class and by position: the sheet, the menu layer and the toast are
  later siblings of the app element, which carries the layout, the screen transition and the
  large-title state as data attributes. Keep that markup.
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
