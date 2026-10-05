# Plan: m1-a-running-tool-with-a-library-and-import

Attempt: 1

## Findings

The repository

- The worktree holds `.researches/`, `docs/prototype/` and the mission folder, and nothing else.
  There is no code, no project instruction file and no commit convention. Commits so far read
  `<type>(<scope>): <summary>`. (`git ls-files`, `git log`)
- The Mac has 21 GB free. Node is 22.13.0 at `/usr/local/bin`, pnpm 10.13.1, Python 3.12.13 at
  `/opt/homebrew/bin/python3.12`. `/opt/homebrew/opt/ffmpeg-full/bin` holds ffmpeg and ffprobe
  8.1.2, and both run. The `ffmpeg` on the PATH, in `/opt/homebrew/bin`, dies at launch with a
  missing library. A PATH made of the folders of `node` and `pnpm` plus `/usr/bin:/bin` holds no
  ffmpeg at all. (run on 2026-10-05)

The rules every write passes through

- The user's settings run the coding-standards hooks on every Write and Edit
  (`~/.claude/settings.json`, `~/.agents/skills/coding-standards/hooks/`). They refuse:
  - a source file or folder named `utils`, `helpers`, `common` or `misc`, a file named `lib`,
    `util` or `helper`, and `types`, `constants` or the like directly under `src/` or `app/`;
  - a file with more than 10 top-level functions or classes, test files excepted;
  - a function body of more than 20 statements, in TypeScript, JavaScript and Python, test
    callbacks included;
  - more than 3 positional parameters in TypeScript and JavaScript, more than 4 in Python
    (FastAPI-bound parameters and pytest functions are not counted);
  - `any` in TypeScript and `Any` in Python, in every position. JSX text is scanned as code, so a
    sentence containing ": any" is refused too;
  - names that start with `str`, `arr`, `obj` or `fn` followed by a capital, and the snake_case
    forms in Python;
  - an empty `catch` or `except: pass`, `debugger`, `breakpoint()`;
  - a comment longer than one line, anywhere but the top of a file;
  - an import that reaches past a folder's `index.ts` (`@/a/b/c` when `src/a/b/index.ts`
    exists), and an import that climbs three or more parent folders;
  - a comment, a `hooks:` block or a rule switch in `.coding-standards-structure`.
- `console.log` and Python `print(` draw an advisory. The command programs write through
  `process.stdout.write` and `sys.stdout.write`.
- An Edit is checked on the fragment it adds, so a function can grow past a limit over several
  edits unseen. `python3 ~/.claude/skills/coding-standards/hooks/review-files.py <files>` checks
  whole files and tags what the hooks only advise on with `[advisory]`. Run it over each task's
  source files before the commit and fix every finding without that tag. It cannot read an
  image and reports that as a finding, so give it source files only.
- The standards place a Next.js app in capability folders that hold use-case folders, each with
  `components/`, `hooks/`, `lib/`, `api/` and an `index.ts`; `app/` routes only; `shared/` is for
  what three capabilities use. A FastAPI service is packages named by capability, one router per
  package, `__init__.py` as the front door, Pydantic models at the boundary, domain errors turned
  into responses by one handler, settings read once through `BaseSettings`. Tests sit beside the
  code; browser tests sit at the web app's root.
  (`references/nextjs/structures/screaming-architecture.md`, `references/fastapi/structure.md`,
  `references/common/structure.md`)
- With no `.coding-standards-structure` beside a part, the standards tell an agent to ask the
  user which layout applies. T1 writes one at the repository root, one in `web` and one in
  `service`, each recording the layout this plan uses:
  - root: `scripts/` with one program per file, `fixtures/`, `web/`, `service/`, `docs/`;
  - `web/src`: `app/` for routes; `shared/` with `styles/`, `ui/` and `lib/`; `shell/` with
    `frame-screens/`, `present-sheet/`, `present-menu/` and `show-toast/`; `library/` with
    `list-projects/`, `create-project/` and `upload-video/`; `project/` with `open-project/`,
    `follow-progress/` and `delete-project/`; `settings/` with `change-settings/`; and beside
    `src`, `e2e/` with `support/`;
  - `service/clipper`: `main.py`, `__main__.py`, `problems/`, `settings/`, `storage/`, `media/`,
    `projects/`, `pipeline/` and `fetching/`.
- Imports run one way: `shared` is used by all; `shell` by `library`, `project` and `settings`;
  `library` by `project` and `settings`. `app/` joins capabilities that would otherwise import
  each other. In the service, `fetching` imports `pipeline` for the stage interface, both import
  `projects`, `media` and `storage`, and `projects` imports neither of them; `main.py` hands
  `projects` what it needs from `pipeline`.

Forwarding from the web app to the service, measured on Next.js 16.3.8 with `next start`

- A request body over 10 MiB sent through a rewrite to another address is cut at 10 MiB, with no
  proxy file present. A 50 MB upload reached the other side as 10,483,914 bytes; with a
  `Content-Length` the request then hung for 30 seconds and returned 500. A body of exactly
  10,485,760 bytes passes. Seven parts of 8 MiB arrived with matching checksums. Next.js copies
  each forwarded body into memory up to that limit, so raising the limit to 4 GB is not an option.
  Uploads therefore travel in parts (A22).
- A 200 MB response came back through the rewrite whole.
- The address a rewrite forwards to is read when the app is built. A build made for port 8911
  kept forwarding there when started with another port in its environment. A build into a folder
  other than `.next` makes Next.js add that folder to `tsconfig.json` and rewrite
  `next-env.d.ts`. `tsconfig.json` therefore lists the type folders of `.next` and `.next-test`
  from the start, and `next-env.d.ts` is ignored by git (A24).
- A forwarded request that gets no answer for 30 seconds is dropped. Every service endpoint
  answers at once; long work runs in the worker. (Next.js source, through Context7)
- Next.js sends usage data during a build unless `NEXT_TELEMETRY_DISABLED=1` is set. The
  boundaries forbid telemetry, so every script that runs `next` sets it.

Versions, read from npm and PyPI on 2026-10-05 and tried on this Mac

- Web: `next` 16.3.8, `react` and `react-dom` 19.3.0, `typescript` 6.0.3, `@types/node` 22.20.5,
  `@types/react` and `@types/react-dom` 19.3.0, `eslint` 9.39.5, `eslint-config-next` 16.3.8,
  `vitest` 5.0.3, `@playwright/test` 1.63.0. This set built, linted, type-checked and ran one
  unit test and one browser test on Node 22.13.0.
- `typescript-eslint` 8.71.0, which `eslint-config-next` uses, accepts TypeScript below 6.1 only.
  `eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y`, also inside
  `eslint-config-next`, accept ESLint up to 9. `jsdom` 30 needs Node 22.22 or newer (A26).
- Vitest warns unless the package is an ES module: `web/package.json` sets `"type": "module"`.
- Next.js 16 has no `next lint`; ESLint runs from its own command with the flat configuration
  that `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` export. `params`
  of a page is a promise. (Next.js documentation, through Context7)
- pnpm 10 skips dependency build scripts unless `pnpm-workspace.yaml` allows them, and warned
  about `unrs-resolver`; linting worked without it.
- `ignoredOptionalDependencies: [sharp]` in `pnpm-workspace.yaml` keeps the LGPL image library
  out, and the build still passes. The app sets `images.unoptimized`.
- Service: `fastapi` 0.142.2 (with `starlette` 1.7.0), `uvicorn` 0.54.0, `pydantic` 2.13.5,
  `pydantic-settings` 2.15.0, `yt-dlp` 2026.8.19, `yt-dlp-ejs` 0.8.0; for the checks `pytest`
  9.1.1, `httpx2` 2.13.1, `ruff` 0.16.10, `mypy` 2.4.0. All installed into a Python 3.12 virtual
  environment. Starlette's test client warns with `httpx` and asks for `httpx2`.
- `yt-dlp[default]` pulls in `mutagen`, which is GPL. `yt-dlp` alone has no required
  dependencies. YouTube needs a JavaScript runtime and the `yt-dlp-ejs` scripts; only Deno is on
  by default, and Node is switched on with the option `js_runtimes: {"node": {}}`.
- Playwright's `chromium --only-shell` install is 94 MiB and runs on macOS 14.3.1 from a folder
  named by `PLAYWRIGHT_BROWSERS_PATH`.

Media and download behaviour, tried on this Mac

- `say -v Samantha -o speech.aiff -f script.txt` turned 624 words into 176 seconds of speech in 2
  seconds. ffmpeg laid it over a generated 1280 × 720 picture at 30 frames a second in 4.5
  seconds, giving a 2.7 MB file.
- Making a 720p H.264 and AAC copy of that file with `libx264 -preset veryfast` took 4 seconds,
  and `-progress pipe:1` reported `out_time_us` as it went. One-second polling sees several
  values.
- ffprobe on random bytes exits 1 with "Invalid data found when processing input".
- yt-dlp fetched `http://127.0.0.1:<port>/talk.mp4` through its generic extractor, called the
  progress hook with bytes done and total, and gave the title `talk` and no length: the length
  comes from ffprobe. A "not found" answer raised `DownloadError` whose cause carries status 404.
  Raising `DownloadCancelled` in the progress hook stopped a slow download within half a second
  and left a `.part` file. A file already present at the output path is not fetched again.

The prototype

- `docs/prototype/index.html` holds the design tokens in one `<style>` block; `styles/base.css`,
  `controls.css`, `lists.css`, `shell.css` and `pages.css` style every screen of this milestone.
  `review.css` and `player.css` belong to the Review tab and are copied in M4.
- The sheet, the menu layer and the toast are later siblings of `.app`, and the copied rules
  depend on it (`.app[data-layout="compact"] ~ .sheet`). `.app` carries `data-layout`, set from
  `(max-width: 719px)`, plus `data-enter` and `data-large-title`. The sidebar docks from 1000 px.
- The prototype's rows and tabs are buttons that change state. Addresses need links, and the
  copied rules select by class, so a link takes the same class.
- Wording comes from `src/library/render-library.js`, `render-new-project-sheet.js`,
  `render-processing.js`, `halt-project.js`, `library-actions.js`, `project/delete-project.js`,
  `project/export/render-export.js`, `project/render-results.js` and
  `settings/render-settings.js`. The prototype has no wording for the low-disk refusal, for a
  file over 4 GB, or for a project resting between steps.
- Only the toolbar's one-line title is cut with an ellipsis. On a phone the same title is shown
  in full as the large title above the content.
- `formatLength` rounds to whole minutes, so a source under a minute would read "0 min".
- Not audited here: from the token values, a tinted button label on the sheet in light measures
  about 4.4 to 1 and placeholder text on the dark sheet about 4.35 to 1, just under D57's 4.5.
  M1 copies the tokens unchanged and no check in this milestone measures contrast.

## Tasks

- [x] T1 — Start both parts with one command, the web app forwarding `/api` to the service
  Files: `.gitignore`, `.coding-standards-structure`, `package.json`, `pnpm-workspace.yaml`,
  `pnpm-lock.yaml`, `AGENTS.md`, `CLAUDE.md`, `scripts/bootstrap-project.mjs`,
  `scripts/start-tool.mjs`, `scripts/read-run-settings.mjs`, `scripts/run-program.mjs`,
  `scripts/build-web-app.mjs`, `scripts/wait-until-answering.mjs`,
  `docs/missions/clipper-tool/spec.md`, `service/.coding-standards-structure`, `service/pyproject.toml`,
  `service/requirements.txt`, `service/requirements-dev.txt`, `service/clipper/__init__.py`,
  `service/clipper/__main__.py`, `service/clipper/main.py`,
  `service/clipper/settings/__init__.py`, `service/clipper/settings/startup_settings.py`,
  `web/.coding-standards-structure`, `web/package.json`, `web/next.config.ts`,
  `web/tsconfig.json`, `web/src/app/layout.tsx`, `web/src/app/page.tsx`
  Done: `pnpm install` and `pnpm bootstrap` succeed from a clean checkout; bootstrap creates
  `service/.venv` with `/opt/homebrew/bin/python3.12` and installs `requirements-dev.txt`.
  Every version in both `package.json` files is exact, and both requirements files pin every
  installed package with `==`, direct and transitive, with no `mutagen`. `pnpm start` starts the
  service on `127.0.0.1:8765`, waits for `/api/health`, builds the web app when no build exists,
  when a source file is newer than the build or when the build was made for another service
  port, starts it on `0.0.0.0:3000` and prints `Clipper is running at http://localhost:3000`.
  That address serves a page titled `Clipper` with the prototype's loading line, and
  `/api/health` answers through it. Ctrl-C stops both parts; when one part exits the other is
  stopped and the command exits 1. The five variables of A23 change the folders and ports, and
  `CLIPPER_WEB_BUILD_DIR=.next-test` with other ports starts a second copy without changing a
  tracked file. Every script that runs `next` sets `NEXT_TELEMETRY_DISABLED=1`. The web app has
  no proxy or middleware file. `.gitignore` covers `data/`, `node_modules/`, `.next*/`,
  `next-env.d.ts`, `service/.venv/`, `.cache/`, the caches of Python, Ruff, mypy and pytest,
  Playwright's output folders, and `.DS_Store`. `web/.coding-standards-structure` reads
  `follows: screaming-architecture` and then a `layout:` tree,
  `service/.coding-standards-structure` reads `follows: fastapi` and then its tree, the root's
  holds a tree alone, and none has a comment. `AGENTS.md` names the setup and start commands,
  the layout and the rules above; `CLAUDE.md` is the one line `@AGENTS.md`.

- [x] T2 — Run every check with one command
  Files: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `AGENTS.md`,
  `scripts/bootstrap-project.mjs`, `scripts/build-web-app.mjs`, `scripts/start-tool.mjs`,
  `scripts/prepare-test-run.mjs`,
  `scripts/run-tests.mjs`, `scripts/run-browser-tests.mjs`, `service/pyproject.toml`,
  `service/clipper/test_main.py`, `service/clipper/settings/test_startup_settings.py`,
  `web/package.json`, `web/tsconfig.json`, `web/eslint.config.mjs`, `web/vitest.config.ts`,
  `web/playwright.config.ts`, `web/src/shared/lib/request-json.ts`,
  `web/src/shared/lib/request-json.test.ts`, `web/e2e/support/index.ts`,
  `web/e2e/support/run-tool.ts`, `web/e2e/support/tool-test.ts`, `web/e2e/start-command.spec.ts`
  Done: `pnpm test` runs Ruff, mypy in strict mode, pytest, ESLint, the web build into
  `.next-test`, `tsc --noEmit`, Vitest in the node environment and Playwright, runs them all even
  when one fails, prints one line per gate with `passed` or `failed`, and exits 0 only when all
  passed. ESLint skips both build folders, and Vitest runs only the tests under `src/`. The
  command creates one temporary folder for the run, gives it to the tool as its data folder,
  prints its size and removes it at the end, and leaves nothing listening on ports 3100 and 8865.
  `pnpm test:browser <file>` runs the named browser tests the same way. Bootstrap installs
  Chromium's headless shell into `.cache/playwright`. The browser tests run in one worker; a
  worker fixture starts the tool through `pnpm start` with the variables of A23, takes the
  address from the line it prints, sets `CLIPPER_REPORTED_FREE_BYTES` to 50 GB and can stop and
  start the tool again inside a test. The first browser test opens the printed address, reads
  `/api/health` through it, reaches the web port on the Mac's network address and finds the
  service port closed there, and sees every request of the page go to the tool's own address.
  The first unit tests cover the start-up settings' defaults and the request helper that every
  later call to `/api` goes through. `git status` is clean after a run.

- [x] T3 — Give the service its data folder, its database and the media tools check
  Files: `service/clipper/__main__.py`, `service/clipper/main.py`,
  `service/clipper/settings/startup_settings.py`,
  `service/clipper/settings/test_startup_settings.py`, `service/clipper/storage/__init__.py`,
  `service/clipper/storage/data_folder.py`, `service/clipper/storage/test_data_folder.py`,
  `service/clipper/storage/open_database.py`, `service/clipper/storage/test_open_database.py`,
  `service/clipper/media/__init__.py`, `service/clipper/media/locate_media_tools.py`,
  `service/clipper/media/test_locate_media_tools.py`, `service/clipper/test_main.py`,
  `scripts/start-tool.mjs`, `web/e2e/support/index.ts`, `web/e2e/support/run-tool.ts`,
  `web/e2e/missing-ffmpeg.spec.ts`
  Done: at start the service creates the data folder and `clipper.sqlite3` inside it, in WAL
  mode, with a schema version it can raise later. It looks for ffmpeg and ffprobe in
  `CLIPPER_FFMPEG_DIR`, by default `/opt/homebrew/opt/ffmpeg-full/bin`, then on the PATH, and
  runs each with `-version`. When one is absent or does not start, the service prints one
  sentence that names each missing tool and the places it looked, with no traceback, and exits
  1; `pnpm start` shows that sentence, starts no web app and exits 1. A browser test runs the
  start command with an empty tools folder and a PATH without ffmpeg and reads `ffmpeg` and
  `ffprobe` in the message.

- [x] T4 — Build the fixture video and the local server for link checks
  Files: `fixtures/talk-script.txt`, `fixtures/README.md`, `scripts/build-fixtures.mjs`,
  `scripts/serve-fixtures.mjs`, `scripts/run-tests.mjs`, `scripts/run-browser-tests.mjs`,
  `service/pyproject.toml`,
  `service/clipper/conftest.py`, `service/clipper/test_fixture_server.py`,
  `web/e2e/support/index.ts`, `web/e2e/support/build-fixtures.ts`,
  `web/e2e/support/serve-fixtures.ts`, `web/e2e/support/tool-test.ts`
  Done: `fixtures/talk-script.txt` is a talk of about 650 words in plain sentences, with several
  distinct topics and no figures or abbreviations, so M2 can compare a transcript with it and M3
  can cut clips from it. `node scripts/build-fixtures.mjs <folder>` speaks it with the voice
  Samantha and writes `talk.mp4`, about four minutes of 1280 × 720 H.264 with AAC over a
  generated picture. `node scripts/serve-fixtures.mjs <folder>` serves it on a free loopback port
  it prints, honours byte ranges, serves `/slow/talk.mp4` over about six seconds, answers
  `/missing.mp4` with "not found", and answers `/missing-until-repaired/talk.mp4` with "not
  found" until `/repair` is called. The test command builds the fixtures once into its temporary
  folder and hands the folder to pytest and Playwright; each runner builds its own when started
  alone. No video is committed.

- [x] T5 — Store projects: create, list, read and delete, with the refusals
  Files: `service/clipper/main.py`, `service/clipper/conftest.py`,
  `service/clipper/projects/describe_project.py`, `service/clipper/problems/__init__.py`,
  `service/clipper/problems/app_error.py`, `service/clipper/problems/handle_app_errors.py`,
  `service/clipper/problems/test_handle_app_errors.py`,
  `service/clipper/settings/startup_settings.py`,
  `service/clipper/settings/test_startup_settings.py`, `service/clipper/storage/__init__.py`,
  `service/clipper/storage/open_database.py`, `service/clipper/storage/test_open_database.py`,
  `service/clipper/storage/data_folder.py`, `service/clipper/storage/test_data_folder.py`,
  `service/clipper/storage/read_disk_space.py`,
  `service/clipper/storage/test_read_disk_space.py`, `service/clipper/projects/__init__.py`,
  `service/clipper/projects/project.py`, `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/projects/project_schemas.py`, `service/clipper/projects/create_project.py`,
  `service/clipper/projects/test_create_project.py`,
  `service/clipper/projects/delete_project.py`,
  `service/clipper/projects/test_delete_project.py`, `service/clipper/projects/router.py`,
  `service/clipper/projects/test_router.py`
  Done: a project is stored with an id safe for an address, its creation order, title, source
  kind, source label ("YouTube link", "Video link" or "Uploaded file"), clip length, platforms,
  brief, status, and four steps (`fetch`, `transcribe`, `score`, `cut`), each with a state, a
  percent and a label: "Fetching video" for a link, "Uploading video" and then "Preparing video"
  for a file, "Transcribing on this Mac", "Scoring windows" and "Cutting clips".
  `GET /api/projects` returns them newest first with the free disk space in GB;
  `GET /api/projects/<id>` returns one. A project in JSON carries `id`, `title`, `sourceKind`,
  `sourceLabel`, `durationSeconds` (null until read), `status` (`uploading`, `queued`,
  `processing`, `failed`, `stopped`, `fetched`, later `ready` and `exported`), `steps`,
  `percent` (the four steps weighted equally), `halt` and `upload`. `POST /api/projects` makes a
  link project `queued`, titled "New video from link", and a file project `uploading`, titled
  with its file name. It refuses with status 422 and `{problem: {section, message}}`: a link that
  does not match the prototype's pattern ("Paste the full link, starting with https://"); no
  file ("Choose a video file first."); no platform ("Turn on at least one platform."); a file
  over 4 GB ("This file is larger than 4 GB. Choose a smaller one."); and less than 5 GB free
  ("Only 3.2 GB is free on this Mac, and a new project needs 5 GB. Delete a project or free some
  space.", with the real figure). `CLIPPER_REPORTED_FREE_BYTES` replaces the measured free space.
  `DELETE /api/projects/<id>` removes the project's folder under `projects/` in the data folder
  and its records. An unknown id answers 404 through the one error handler.

- [x] T6 — Receive an upload in parts, straight to disk
  Files: `service/clipper/projects/project.py`, `service/clipper/projects/receive_upload.py`,
  `service/clipper/projects/test_receive_upload.py`, `service/clipper/projects/router.py`,
  `service/clipper/projects/test_router.py`, `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/project_schemas.py`, `web/e2e/support/index.ts`,
  `web/e2e/support/service-api.ts`, `web/e2e/upload-parts.spec.ts`
  Done: `PUT /api/projects/<id>/upload?offset=<n>` appends the body to the project's source file
  when `n` equals the bytes already held and answers with the new count. Another offset answers
  409 with the count held, so a sender can carry on from there. A part declared larger than 8 MiB
  answers 413 before it is read, and a project that is not uploading answers 409. The handler
  hands the write to a thread. When the count reaches the declared size the project becomes
  `queued`. A browser test sends 50 MiB of random bytes in 8 MiB parts through the web port and
  finds the stored file equal in size and checksum.

- [x] T7 — Read a video's length and make the 720p preview copy
  Files: `service/clipper/conftest.py`,
  `service/clipper/media/__init__.py`, `service/clipper/media/run_media_tool.py`,
  `service/clipper/media/probe_video.py`, `service/clipper/media/test_probe_video.py`,
  `service/clipper/media/make_preview_copy.py`,
  `service/clipper/media/test_make_preview_copy.py`
  Done: probing the fixture returns the length ffprobe reports, and probing a file that is not a
  video raises a named error. The preview copy is an MP4 with H.264 video and AAC audio, 720
  pixels high or the source's height when that is lower, with the index at the front of the
  file. While it is made the caller receives a rising percent, and a stop signal ends ffmpeg
  within two seconds and removes the partial file.

- [x] T8 — Download a link through yt-dlp
  Files: `service/pyproject.toml`, `service/clipper/fetching/__init__.py`,
  `service/clipper/fetching/download_link.py`, `service/clipper/fetching/test_download_link.py`
  Done: downloading the fixture server's `/talk.mp4` stores a file of the same size in the
  project's folder and returns its path and the title yt-dlp read. The format choice takes no
  video above 1080 pixels high and still accepts a source whose height is unknown; Node is
  switched on as the JavaScript runtime; ffmpeg comes from the folder the media check found. The
  caller receives a rising percent. `/missing.mp4` raises a download error that says the video
  was not found. A stop signal ends the download within two seconds, and a rerun starts from an
  empty folder.

- [x] T9 — Run the queue with one worker and the fetch stage
  Files: `service/clipper/main.py`, `service/clipper/test_main.py`, `service/clipper/conftest.py`,
  `service/clipper/projects/__init__.py`, `service/clipper/projects/project_queue.py`,
  `service/clipper/projects/test_project_queue.py`, `service/clipper/projects/receive_upload.py`,
  `service/clipper/projects/test_router.py`, `service/clipper/storage/__init__.py`,
  `service/clipper/storage/data_folder.py`, `service/clipper/fetching/download_link.py`,
  `web/e2e/support/index.ts`, `service/clipper/pipeline/__init__.py`,
  `service/clipper/pipeline/pipeline_stage.py`, `service/clipper/pipeline/run_queue.py`,
  `service/clipper/pipeline/test_run_queue.py`,
  `service/clipper/pipeline/recover_interrupted.py`,
  `service/clipper/pipeline/test_recover_interrupted.py`,
  `service/clipper/fetching/__init__.py`, `service/clipper/fetching/fetch_stage.py`,
  `service/clipper/fetching/test_fetch_stage.py`, `service/clipper/projects/project.py`,
  `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`, `web/e2e/support/service-api.ts`,
  `web/e2e/queue-through-tool.spec.ts`
  Done: one worker, started and stopped with the service, takes the oldest queued project,
  marks it `processing` and runs its next step through one stage interface; the fetch stage is
  the only stage registered. For a link it downloads, then reads the length and makes the
  preview copy; for an uploaded file it reads the length and makes the preview copy. The step's
  percent follows A27, never falls, and is stored at least once a second. The project ends
  `fetched` with its real length, the title yt-dlp read for a link, and `preview.mp4` beside its
  source; it then rests, its other three steps pending. A second project stays `queued` until
  the first has finished. A project found `processing` at start goes back to the queue and its
  step runs again from clean files. A three-hour source, built small in the test, is fetched
  with a length of 10,800 seconds. A browser test creates two link projects through the web
  port, sees the second wait and then finish, stops the tool during a slow fetch, starts it and
  sees that project finish.

- [x] T10 — Stop, resume and retry a project, with plain failure reasons
  Files: `service/clipper/main.py`, `service/clipper/pipeline/pipeline_stage.py`,
  `service/clipper/fetching/fetch_stage.py`, `service/clipper/fetching/test_fetch_stage.py`,
  `service/clipper/projects/__init__.py`, `service/clipper/pipeline/__init__.py`,
  `service/clipper/pipeline/halt_project.py`, `service/clipper/pipeline/test_halt_project.py`,
  `service/clipper/pipeline/explain_failure.py`,
  `service/clipper/pipeline/test_explain_failure.py`, `service/clipper/pipeline/run_queue.py`,
  `service/clipper/pipeline/test_run_queue.py`, `service/clipper/pipeline/router.py`,
  `service/clipper/pipeline/test_router.py`, `service/clipper/projects/delete_project.py`,
  `service/clipper/projects/test_delete_project.py`, `service/clipper/projects/router.py`
  Done: `POST /api/projects/<id>/stop` on a processing project ends its step within two seconds
  and leaves it `stopped` with the reason `Stopped at “<step label>”. The stages before it are
  kept.` `/resume` and `/retry` put a stopped or failed project back in the queue at the same
  step, and finished steps are not run again. A step that fails leaves the project `failed` with
  one of these reasons: "The video could not be downloaded. Check the link and your connection,
  then retry."; "This file is not a video Clipper can read. Delete the project and try another
  file."; "Not enough free disk space to finish. Free some space, then retry." for a full disk,
  whether Python or ffmpeg reports it; and for anything else a sentence that names the step and
  suggests a retry. Deleting a processing project stops it first, through a dependency the
  projects package receives and does not import.

- [x] T11 — Copy the prototype's design and build the shell
  Files: `web/e2e/start-command.spec.ts`, `web/src/shell/frame-screens/lib/shell-context.ts`,
  `web/src/shell/frame-screens/hooks/use-screen-transition.ts`,
  `web/src/shell/present-sheet/components/SheetGrabber.tsx`,
  `web/src/shell/present-sheet/hooks/use-sheet-drag.ts`,
  `web/src/shared/styles/tokens.css`, `web/src/shared/styles/base.css`,
  `web/src/shared/styles/controls.css`, `web/src/shared/styles/lists.css`,
  `web/src/shared/styles/shell.css`, `web/src/shared/styles/pages.css`,
  `web/src/shared/styles/app.css`, `web/src/shared/ui/index.ts`, `web/src/shared/ui/Icon.tsx`,
  `web/src/shared/ui/ProgressBar.tsx`, `web/src/shared/ui/SegmentedControl.tsx`,
  `web/src/shared/ui/Switch.tsx`, `web/src/shared/ui/PagePane.tsx`, `web/src/shell/index.ts`,
  `web/src/shell/frame-screens/index.ts`,
  `web/src/shell/frame-screens/components/AppShell.tsx`,
  `web/src/shell/frame-screens/components/SidebarFrame.tsx`,
  `web/src/shell/frame-screens/components/ScreenFrame.tsx`,
  `web/src/shell/frame-screens/components/Toolbar.tsx`,
  `web/src/shell/frame-screens/components/ScreenHead.tsx`,
  `web/src/shell/frame-screens/components/TabBar.tsx`,
  `web/src/shell/frame-screens/hooks/use-layout.ts`,
  `web/src/shell/frame-screens/hooks/use-sidebar.ts`,
  `web/src/shell/frame-screens/hooks/use-large-title.ts`,
  `web/src/shell/frame-screens/lib/describe-transition.ts`,
  `web/src/shell/frame-screens/lib/describe-transition.test.ts`,
  `web/src/shell/present-sheet/index.ts`, `web/src/shell/present-sheet/components/Sheet.tsx`,
  `web/src/shell/present-sheet/hooks/use-modal-dialog.ts`,
  `web/src/shell/present-menu/index.ts`, `web/src/shell/present-menu/components/Menu.tsx`,
  `web/src/shell/present-menu/hooks/use-menu-keys.ts`,
  `web/src/shell/present-menu/lib/place-menu.ts`,
  `web/src/shell/present-menu/lib/place-menu.test.ts`, `web/src/shell/show-toast/index.ts`,
  `web/src/shell/show-toast/components/ToastHost.tsx`,
  `web/src/shell/show-toast/hooks/use-toast.ts`, `web/src/shell/show-toast/lib/toast-store.ts`,
  `web/src/shell/show-toast/lib/toast-store.test.ts`, `web/src/app/layout.tsx`,
  `web/src/app/page.tsx`, `web/src/app/settings/page.tsx`, `web/e2e/shell.spec.ts`
  Done: `tokens.css` is the content of the prototype's `<style>` block, each declaration on its
  own line as it stands there, and the five stylesheets are byte-for-byte copies; `app.css`
  holds only what addresses need, such as a link wearing a row's class. Components produce the
  prototype's markup: its classes, ids, roles and labels. The shell renders `.app` with `data-layout`,
  `data-enter` and `data-large-title` as the prototype sets them, then the sheet, the menu layer
  and the toast as its later siblings; before the width is known it renders the loading line.
  From 720 px: the sidebar with the app name, its toggle, "New Project" and "Settings", and the
  toolbar; below 1000 px the sidebar lies over the content with its scrim, and Escape closes it.
  Below 720 px: the toolbar with the back control and the large title that moves into the bar on
  scroll, and the tab bar with Library and Settings, the current one marked. Light and dark
  follow the system. The sheet is a native dialog that closes on Escape and on a click outside
  and returns focus to its opener; the menu moves focus with the arrow keys and closes on Escape
  and Tab. A screen declares its title, subtitle, back control, centre and actions through
  `ScreenFrame`; the sidebar's content arrives from `app/layout.tsx`, so the shell imports no
  other capability. `/` and `/settings` show their titles. Browser tests cover 390, 860 and
  1360 px.

- [x] T12 — Build the Library: project rows, the sidebar list and the empty state
  Files: `web/src/shared/styles/app.css`, `web/e2e/support/seed-projects.ts`,
  `web/e2e/support/service-api.ts`, `web/src/shell/frame-screens/components/AppShell.tsx`,
  `web/src/shell/frame-screens/components/SidebarFrame.tsx`,
  `web/src/shell/frame-screens/lib/shell-context.ts`,
  `web/src/shell/frame-screens/hooks/use-opener-memory.ts`,
  `web/src/shell/frame-screens/hooks/use-previous-address.ts`,
  `web/src/shell/present-sheet/components/Sheet.tsx`,
  `web/src/shell/present-sheet/hooks/use-modal-dialog.ts`,
  `web/src/library/index.ts`, `web/src/library/library.types.ts`,
  `web/src/library/list-projects/index.ts`,
  `web/src/library/list-projects/api/fetch-projects.ts`,
  `web/src/library/list-projects/lib/projects-store.ts`,
  `web/src/library/list-projects/lib/projects-store.test.ts`,
  `web/src/library/list-projects/lib/describe-row-status.ts`,
  `web/src/library/list-projects/lib/describe-row-status.test.ts`,
  `web/src/library/list-projects/hooks/use-projects.ts`,
  `web/src/library/list-projects/components/LibraryScreen.tsx`,
  `web/src/library/list-projects/components/LibrarySidebar.tsx`,
  `web/src/library/list-projects/components/ProjectRows.tsx`,
  `web/src/library/list-projects/components/ProjectRow.tsx`,
  `web/src/library/list-projects/components/ProjectRowStatus.tsx`,
  `web/src/library/list-projects/components/EmptyLibrary.tsx`,
  `web/src/library/create-project/index.ts`,
  `web/src/library/create-project/components/NewProjectSheet.tsx`,
  `web/src/shared/lib/format-length.ts`, `web/src/shared/lib/format-length.test.ts`,
  `web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/app/new/page.tsx`,
  `web/e2e/support/index.ts`, `web/e2e/support/library-page.ts`, `web/e2e/library.spec.ts`,
  `web/e2e/empty-library.spec.ts`
  Done: one store asks `GET /api/projects` once a second while the page is visible, however
  many components read it. Each row is a link to `/projects/<id>` with the title, the source
  label and the length once known ("4 min", "1 h 13 min", seconds under a minute), and its
  status as the prototype shows it: a progress bar and the step label while uploading or
  processing, "Waiting in queue", "Could not finish" with the warning icon, "Stopped", and for
  a resting project the bar and "Fetched". Below 720 px `/` is the Library screen: large title,
  the plus control, the Projects group and the line "N GB free on this Mac". From 720 px the
  rows are in the sidebar with the current project marked, and the disk line is in its foot;
  the main area takes its content from `app/page.tsx`, which until T13 passes only the empty
  state. The prototype's notice about sample data is left out. With no projects the Library
  shows "No Projects Yet", its sentence and "New Project". Every "New Project" control leads to
  `/new`, which shows the Library with the sheet open: its bar with Cancel, the title and "Find
  Clips". Cancel, Escape and a click outside return to where the user was. T16 fills the sheet.

- [x] T13 — Build the status screen with Stop, Resume and Retry
  Files: `web/src/shared/lib/read-problem.ts`, `web/src/shared/lib/read-problem.test.ts`,
  `web/src/library/list-projects/components/ProjectRows.tsx`, `web/src/app/new/page.tsx`,
  `web/src/project/index.ts`, `web/src/project/follow-progress/index.ts`,
  `web/src/project/follow-progress/components/StatusScreen.tsx`,
  `web/src/project/follow-progress/components/StatusCard.tsx`,
  `web/src/project/follow-progress/components/StepProgress.tsx`,
  `web/src/project/follow-progress/components/QueueNote.tsx`,
  `web/src/project/follow-progress/components/HaltActions.tsx`,
  `web/src/project/follow-progress/lib/describe-status.ts`,
  `web/src/project/follow-progress/lib/describe-status.test.ts`,
  `web/src/project/follow-progress/api/halt-project.ts`,
  `web/src/project/open-project/index.ts`,
  `web/src/project/open-project/components/ProjectScreen.tsx`,
  `web/src/project/open-project/components/NewestProject.tsx`,
  `web/src/project/open-project/hooks/use-project.ts`, `web/src/app/page.tsx`,
  `web/src/app/projects/[id]/page.tsx`, `web/e2e/support/index.ts`,
  `web/e2e/support/status-screen.ts`, `web/e2e/library.spec.ts`, `web/e2e/queue.spec.ts`,
  `web/e2e/halt-project.spec.ts`
  Done: `/projects/<id>` shows the status card for a project that is uploading, waiting,
  processing, failed, stopped or resting, with the title, the source label and the length in
  the screen's head and the back control to the Library on a phone. Headings and lines are the
  prototype's: "Uploading Video" with "Keep this page open until the upload finishes."; "Finding
  Clips" with the bar, the step label, "Step N of 4." and Stop; "Waiting in Queue" with "It
  starts when “<title>” finishes." or "It starts in a moment." and "One video is processed at a
  time."; "Could Not Finish" and "Stopped" with the warning icon, the reason, and Retry or
  Resume. A resting project shows "Fetched", "Step 1 of 4 is done." and "Not started:
  Transcribing on this Mac, Scoring windows, Cutting clips.", with no button. The screen takes
  its toolbar actions from its caller, so T14 can add the More control. From 720 px `/` shows
  the newest project this way beside the sidebar. An address of a project that does not exist
  leads to `/`. Browser tests, with projects created through the web port: a row opens its
  project's screen; a second project reads "Waiting in queue", names the first on its status
  screen, and starts when the first finishes; a file sent in parts meanwhile arrives in full
  and then waits its turn; Stop during a slow fetch leaves "Stopped" and Resume finishes it; a
  link the server answers with "not found" shows the reason and Retry, and Retry after
  `/repair` finishes it.

- [x] T14 — Build the project view's frame: tabs at their own addresses, More and Delete Project
  Files: `web/src/shared/styles/app.css`,
  `web/src/project/open-project/components/NewestProject.tsx`,
  `web/src/project/index.ts`, `web/src/project/open-project/index.ts`,
  `web/src/project/open-project/components/ProjectScreen.tsx`,
  `web/src/project/open-project/components/ProjectTabs.tsx`,
  `web/src/project/open-project/components/ProjectMoreButton.tsx`,
  `web/src/project/open-project/components/EmptyReview.tsx`,
  `web/src/project/open-project/components/EmptyExport.tsx`,
  `web/src/project/open-project/components/EmptyResults.tsx`,
  `web/src/project/open-project/lib/project-addresses.ts`,
  `web/src/project/open-project/lib/project-addresses.test.ts`,
  `web/src/project/delete-project/index.ts`,
  `web/src/project/delete-project/components/DeleteProjectAlert.tsx`,
  `web/src/project/delete-project/api/delete-project.ts`,
  `web/src/shared/lib/format-timecode.ts`, `web/src/shared/lib/format-timecode.test.ts`,
  `web/src/app/projects/[id]/page.tsx`, `web/src/app/projects/[id]/review/page.tsx`,
  `web/src/app/projects/[id]/export/page.tsx`, `web/src/app/projects/[id]/results/page.tsx`,
  `web/e2e/support/index.ts`, `web/e2e/support/present-as-ready.ts`,
  `web/e2e/addresses.spec.ts`, `web/e2e/delete-project.spec.ts`
  Done: for a project that is `ready` or `exported`, `/projects/<id>` leads to
  `/projects/<id>/review`, and the frame shows the title, the subtitle (source label, length as
  `00:03:56`, and the count of candidates) and the Review, Export and Results control, each tab
  a link to its own address with the current one pressed. The tabs show the prototype's empty
  states: "No clips in this group.", "No Kept Clips" and "No Results Yet", the last two with
  "Go to Review". A tab address of a project that is not ready shows its status screen. Every
  project screen has the More control; its menu holds "Delete Project…", which opens the alert
  `Delete “<title>”?` with the prototype's message, Cancel and Delete. Cancel closes it and
  changes nothing. Delete removes the project, shows "Project deleted" and leads to `/`.
  Browser tests: opening a project from the Library lands on
  `/projects/<id>`, a reload shows the same project, and Back returns to the Library; with a
  fetched project presented to the page as ready, each tab has its address, a reload keeps the
  tab, and Back and Forward move between tabs; deleting after confirming removes the row and
  the project's folder from the data folder, also while it is being fetched, and cancelling
  removes neither.

- [x] T15 — Send a file from the browser in parts
  Files: `web/src/library/index.ts`, `web/src/library/upload-video/index.ts`,
  `web/src/library/upload-video/api/send-part.ts`,
  `web/src/library/upload-video/lib/send-in-parts.ts`,
  `web/src/library/upload-video/lib/send-in-parts.test.ts`,
  `web/src/library/upload-video/lib/uploads-store.ts`,
  `web/src/library/upload-video/lib/uploads-store.test.ts`,
  `web/src/library/upload-video/hooks/use-upload.ts`
  Done: the sender cuts a file into 8 MiB parts and sends them in order from the count the
  service holds. A part that fails is sent again up to three times, each time from the count
  the service answers with; after that the sender stops and a toast reads "The upload stopped.
  Delete the project and upload the file again." It lives outside any screen, so moving between
  screens does not end it, and it tells a screen
  whether this browser is sending a given project and how many bytes have gone. A project that
  was deleted ends its upload quietly. Unit tests drive it with a stand-in for the request.

- [ ] T16 — Build the new project sheet
  Files: `web/src/library/create-project/index.ts`,
  `web/src/library/create-project/components/NewProjectSheet.tsx`,
  `web/src/library/create-project/components/SourceSection.tsx`,
  `web/src/library/create-project/components/LinkField.tsx`,
  `web/src/library/create-project/components/FileField.tsx`,
  `web/src/library/create-project/components/ClipLengthSection.tsx`,
  `web/src/library/create-project/components/PlatformsSection.tsx`,
  `web/src/library/create-project/components/BriefSection.tsx`,
  `web/src/library/create-project/components/FieldError.tsx`,
  `web/src/library/create-project/hooks/use-draft.ts`,
  `web/src/library/create-project/lib/create-draft.ts`,
  `web/src/library/create-project/lib/clip-lengths.ts`,
  `web/src/library/create-project/lib/find-draft-problem.ts`,
  `web/src/library/create-project/lib/find-draft-problem.test.ts`,
  `web/src/library/create-project/api/create-project.ts`,
  `web/src/project/follow-progress/components/StatusCard.tsx`, `web/src/app/new/page.tsx`,
  `web/e2e/support/index.ts`, `web/e2e/support/new-project-sheet.ts`,
  `web/e2e/new-project-errors.spec.ts`, `web/e2e/low-disk.spec.ts`,
  `web/e2e/import-link.spec.ts`, `web/e2e/import-upload.spec.ts`,
  `web/e2e/upload-size.spec.ts`, `web/e2e/restart.spec.ts`
  Done: the sheet at `/new` has the prototype's sections, wording, ids and defaults: Source with
  "YouTube Link" and "Upload a File", the link field or the file field with its line ("MP4, MOV
  or MKV." or "Chosen: <name>"); Clip Length with the three lengths and their hints; Platforms
  with three switches; "What to Look For (Optional)". "Find Clips" checks the draft in the
  browser, and the service checks it again. A problem appears under its section as the
  prototype's alert line, marks the field invalid and moves focus to the link field, the file
  field or the first platform switch; editing the field clears it. The low-disk and 4 GB
  refusals from the service appear under the source field the same way. A created project
  opens at `/projects/<id>`; a file starts sending at once, and its status screen shows the
  bytes this browser has sent. In a browser that is not sending the file, that screen replaces
  "Keep this page open until the upload finishes." with "This upload is not running in this
  browser. If no other browser is sending it, delete the project and upload the file again."
  Browser tests: the three field errors with their focus; the low-disk refusal with the tool
  started at 3 GB reported free; a link to the fixture at the server's slow address, whose row
  shows the first step's bar rise and then "Fetched" with the length ffprobe gives for the
  fixture; the same for the uploaded fixture; a 50 MiB upload, each part held back a moment by
  the test, whose bar is seen between its ends and whose stored file matches in size and
  checksum; and both projects listed in the same state after the tool is stopped and started.

- [ ] T17 — Lay out Settings and store each choice
  Files: `service/clipper/main.py`, `service/clipper/storage/open_database.py`,
  `service/clipper/storage/test_open_database.py`, `service/clipper/settings/__init__.py`,
  `service/clipper/settings/preferences.py`, `service/clipper/settings/preference_store.py`,
  `service/clipper/settings/test_preference_store.py`,
  `service/clipper/settings/describe_machine.py`,
  `service/clipper/settings/test_describe_machine.py`, `service/clipper/settings/router.py`,
  `service/clipper/settings/test_router.py`, `web/src/settings/index.ts`,
  `web/src/settings/change-settings/index.ts`,
  `web/src/settings/change-settings/api/fetch-settings.ts`,
  `web/src/settings/change-settings/api/save-setting.ts`,
  `web/src/settings/change-settings/hooks/use-settings.ts`,
  `web/src/settings/change-settings/lib/setting-options.ts`,
  `web/src/settings/change-settings/lib/setting-options.test.ts`,
  `web/src/settings/change-settings/components/SettingsScreen.tsx`,
  `web/src/settings/change-settings/components/AiServicesSection.tsx`,
  `web/src/settings/change-settings/components/ApiKeyRow.tsx`,
  `web/src/settings/change-settings/components/SelectRow.tsx`,
  `web/src/settings/change-settings/components/DefaultsSection.tsx`,
  `web/src/settings/change-settings/components/StorageSection.tsx`,
  `web/src/settings/change-settings/components/PhoneAccessSection.tsx`,
  `web/src/settings/change-settings/components/SelectorMemorySection.tsx`,
  `web/src/app/settings/page.tsx`, `web/e2e/settings.spec.ts`
  Done: `GET /api/settings` returns the six choices, the free and total disk space and the
  phone address; `PATCH /api/settings` stores one choice and refuses a value outside its
  options. Defaults: Claude Sonnet 5.5 scores, Claude Opus 5.5 cuts, Whisper large-v3-turbo,
  25–60 s, Auto, 7 days. Choices are stored under stable keys, the model identifiers of D27
  among them, and shown with the prototype's labels. The phone address is the Mac's network
  address with the web port. `/settings` has the prototype's five sections, rows, labels and
  footers: AI Services with the key field and its disabled Save and the three model choices;
  Defaults for New Projects; Storage with "N GB free of M GB on this Mac", its bar and the
  retention choice; Open on Your Phone with the address and Copy, which copies it and shows
  "Copied"; What the Selector Has Learned with the four reasons at 0 and the disabled "Forget
  All of It". A browser test changes each choice, reloads and finds it kept, and finds every
  row.

- [ ] T18 — Check the layouts, the text sizes and the requests, and save the captures
  Files: `web/e2e/support/index.ts`, `web/e2e/support/capture-screens.ts`,
  `web/e2e/support/measure-text-fit.ts`, `web/e2e/layout.spec.ts`, `web/e2e/text-size.spec.ts`,
  `web/e2e/own-origin.spec.ts`, `web/e2e/captures.spec.ts`,
  `docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/`
  Done: `layout.spec.ts` measures, at 390 px, the Library list above the tab bar at the bottom
  edge and the new project sheet spanning the width from the bottom edge; at 1360 px, the
  projects in the sidebar and the sheet centred; the switch between the two layouts at 720 px;
  and the sidebar over the content at 999 px and docked at 1000 px. `text-size.spec.ts` opens
  the Library, the empty Library, the new project sheet with each source kind and with each
  error, the status screen in each state, the project tabs, the delete alert and Settings at
  390 px, at the normal text size and with the root font size doubled, and finds no sideways
  scroll, no element wider than the screen and no label whose text is clipped. `own-origin.spec.ts`
  walks the same screens and finds every request addressed to the tool. `captures.spec.ts`
  saves `<screen>-<width>-<theme>.png` for `library`, `empty-library`, `new-project`, `status`,
  `project` and `settings` at 390 and 1360 px in light and dark, into `CLIPPER_EVIDENCE_DIR`
  when it is set and into the test output otherwise. The 24 captures are committed in the
  evidence folder. Whatever these tests find wrong in a component is fixed in this task.

- [ ] T19 — Write the README and finish the instructions for coding agents
  Files: `README.md`, `AGENTS.md`
  Done: `README.md` gives what Clipper is in two sentences; what must be on the Mac (Python
  3.12, Node 22, pnpm 10, the Homebrew ffmpeg at its path); setup with `pnpm install` and
  `pnpm bootstrap`; `pnpm start` and the address it prints; `pnpm test` and
  `pnpm test:browser`; opening the tool on a phone on the same Wi-Fi from the address in
  Settings; where the data lives; the variables of A23; and what this version does not do yet.
  `AGENTS.md` names the same commands, the layout of each part, the rules in the Findings, the
  prototype as the design reference with its stylesheets copied unchanged, and the mission's
  boundaries. Each command in both files was run as written.
