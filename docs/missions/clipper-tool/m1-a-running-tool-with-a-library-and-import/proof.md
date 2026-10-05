# Proof: m1-a-running-tool-with-a-library-and-import

Attempt: 2
Result: pass
Commit: 365b2dc

| id | result |
| -- | ------ |
| V1 | pass |
| V2 | pass |
| V3 | pass |
| V4 | pass |
| V5 | pass |
| V33 | pass |
| V6 | pass |
| V7 | pass |
| V8 | pass |
| V9 | pass |
| V10 | pass |
| V11 | pass |
| V12 | pass |
| V13 | pass |
| V14 | pass |
| V15 | pass |
| V16 | pass |
| V17 | pass |
| V18 | pass |
| V19 | pass |
| V20 | pass |
| V21 | pass |
| V22 | pass |
| V23 | pass |
| V24 | pass |
| V25 | pass |
| V26 | pass |
| V27 | pass |
| V28 | pass |
| V29 | pass |
| V30 | pass |
| V31 | pass |
| V32 | pass |

Lines in square brackets are markers the validator added between commands. Lines that begin
with `+` are `bash -x` naming the command it is about to run. Every other line is printed by the
commands. Blocks were run with `bash` from the worktree's root, at 365b2dc with nothing
uncommitted, in the order of the table. Ports 3000, 8765, 3100 and 8865 were free before V1.

## V1 — Setup works from the committed files, inside the project (A2, R8, R59)

Check: block V1

Expected: Both commands exit 0. Python reports 3.12. `find` prints a browser folder inside the worktree.

The block was run with each command's exit code traced. 32 lines reading "Requirement already satisfied" are left out at the marker.

```
[exit code of the command before: 0] + pnpm install --frozen-lockfile
Scope: all 2 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date

╭ Warning ─────────────────────────────────────────────────────────────────────╮
│                                                                              │
│   Ignored build scripts: unrs-resolver.                                      │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed     │
│   to run scripts.                                                            │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯

Done in 243ms using pnpm v10.13.1
[exit code of the command before: 0] + pnpm bootstrap

> clipper@0.1.0 bootstrap /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/bootstrap-project.mjs

Installing the pinned Python packages
[32 lines left out]
Installing the browser the tests drive into .cache/playwright
Clipper is set up. Start it with "pnpm start".
[exit code of the command before: 0] + service/.venv/bin/python --version
Python 3.12.13
[exit code of the command before: 0] + find . -maxdepth 3 -type d -name 'chromium*' -not -path '*/node_modules/*'
./.cache/playwright/chromium_headless_shell-1243
[exit code of the block: 0]
```

Result: pass

## V2 — "The test command passes"; one command runs every check (R9, R12)

Check: `pnpm test`

Expected: Exit 0. The output reports Ruff, mypy, pytest, ESLint, the TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. No gate existed before this milestone, so there is no baseline.

```
[started 21:06:16]

> clipper@0.1.0 test /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-tests.mjs


--- Fixtures
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-OZh4gg/fixtures/talk.mp4

--- Ruff
All checks passed!

--- mypy
Success: no issues found in 68 source files

--- pytest
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collected 224 items

clipper/fetching/test_download_link.py ..........                        [  4%]
clipper/fetching/test_fetch_stage.py ........                            [  8%]
clipper/media/test_locate_media_tools.py ........                        [ 11%]
clipper/media/test_make_preview_copy.py .......                          [ 14%]
clipper/media/test_probe_video.py ......                                 [ 17%]
clipper/pipeline/test_explain_failure.py ........                        [ 20%]
clipper/pipeline/test_halt_project.py ......                             [ 23%]
clipper/pipeline/test_recover_interrupted.py ....                        [ 25%]
clipper/pipeline/test_router.py ..........                               [ 29%]
clipper/pipeline/test_run_queue.py .........                             [ 33%]
clipper/problems/test_handle_app_errors.py .....                         [ 36%]
clipper/projects/test_create_project.py .......................          [ 46%]
clipper/projects/test_delete_project.py .....                            [ 48%]
clipper/projects/test_project_queue.py ........                          [ 52%]
clipper/projects/test_project_repository.py ........                     [ 55%]
clipper/projects/test_receive_upload.py ...............                  [ 62%]
clipper/projects/test_router.py ...................                      [ 70%]
clipper/settings/test_describe_machine.py ...                            [ 72%]
clipper/settings/test_preference_store.py ........                       [ 75%]
clipper/settings/test_router.py ..............                           [ 82%]
clipper/settings/test_startup_settings.py ......                         [ 84%]
clipper/storage/test_data_folder.py ....                                 [ 86%]
clipper/storage/test_open_database.py ......                             [ 89%]
clipper/storage/test_read_disk_space.py ....                             [ 91%]
clipper/test_fixture_server.py ........                                  [ 94%]
clipper/test_main.py ............                                        [100%]

======================== 224 passed in 80.58s (0:01:20) ========================

--- ESLint

--- Web build
▲ Next.js 16.3.8 (Turbopack)
✓ Running next.config.ts took 60ms

  Creating an optimized production build ...
✓ Compiled successfully in 418ms
  Running TypeScript ...
  Finished TypeScript in 1198ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/5) ...
  Generating static pages using 7 workers (1/5) 
  Generating static pages using 7 workers (2/5) 
  Generating static pages using 7 workers (3/5) 
✓ Generating static pages using 7 workers (5/5) in 96ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /new
├ ƒ /projects/[id]
├ ƒ /projects/[id]/export
├ ƒ /projects/[id]/results
├ ƒ /projects/[id]/review
└ ○ /settings


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


--- TypeScript check

--- Vitest

 RUN  v5.0.3 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/web


 Test Files  15 passed (15)
      Tests  117 passed (117)
   Start at  21:07:52
   Duration  453ms (transform 58%, import 23%, tests 14%, worker 4%)


--- Playwright

Running 77 tests using 1 worker

  ✓   1 e2e/addresses.spec.ts:23:3 › at 390 px › a project opens at its own address, a reload shows it again, and Back returns to the Library (1.2s)
  ✓   2 e2e/addresses.spec.ts:44:3 › at 390 px › a ready project opens on its Review tab, and each tab has an address that a reload keeps (6.6s)
  ✓   3 e2e/addresses.spec.ts:69:3 › at 390 px › Back and Forward move between the tabs of a ready project (468ms)
  ✓   4 e2e/addresses.spec.ts:92:3 › at 390 px › the tab address of a project that is not ready shows its status screen (627ms)
  ✓   5 e2e/addresses.spec.ts:110:3 › at 1360 px › the tabs sit in the toolbar with the current one pressed (203ms)
  ✓   6 e2e/captures.spec.ts:61:1 › six screens are captured whole at 390 and 1360 px, in light and in dark (11.6s)
  ✓   7 e2e/delete-project.spec.ts:33:3 › at 390 px › the More menu offers Delete Project, and the confirmation names the project (552ms)
  ✓   8 e2e/delete-project.spec.ts:58:3 › at 390 px › Cancel removes neither the row nor the folder, and Delete removes both (8.1s)
  ✓   9 e2e/delete-project.spec.ts:86:3 › at 390 px › deleting a project while it is being fetched stops it and leaves no folder (3.9s)
  ✓  10 e2e/delete-project.spec.ts:112:3 › at 1360 px › the menu opens under the More control, and deleting shows the next project (1.6s)
  ✓  11 e2e/empty-library.spec.ts:13:3 › at 390 px › with no projects the Library shows the empty state, and its control opens the sheet (265ms)
  ✓  12 e2e/empty-library.spec.ts:29:3 › at 390 px › Cancel closes the sheet, returns to the Library and gives focus back to the control (748ms)
  ✓  13 e2e/empty-library.spec.ts:41:3 › at 390 px › Escape and a click outside the sheet both return to the Library (607ms)
  ✓  14 e2e/empty-library.spec.ts:57:3 › at 390 px › the sheet opened at its own address returns to the Library (696ms)
  ✓  15 e2e/empty-library.spec.ts:71:3 › at 1360 px › the empty state fills the main area, and the sidebar control opens the sheet (182ms)
  ✓  16 e2e/empty-library.spec.ts:81:3 › at 1360 px › closing the sheet returns to the screen the user was on (796ms)
  ✓  17 e2e/halt-project.spec.ts:13:1 › a link that answers "not found" shows the reason and Retry, and Retry finishes it once repaired (8.4s)
  ✓  18 e2e/halt-project.spec.ts:38:1 › Stop during a fetch leaves the project stopped, and Resume finishes it (15.3s)
  ✓  19 e2e/import-link.spec.ts:21:1 › a link to the fixture is fetched: its bar rises, then the row reads Fetched with the real length (13.1s)
  ✓  20 e2e/import-link.spec.ts:42:1 › Find Clips sends the link, the length, the platforms and the brief the user chose (617ms)
  ✓  21 e2e/import-upload.spec.ts:28:1 › the uploaded fixture is fetched: its bar rises, then the row reads Fetched with the real length (7.8s)
  ✓  22 e2e/import-upload.spec.ts:48:1 › a browser that is not sending the file says so on the status screen (164ms)
  ✓  23 e2e/layout.spec.ts:47:3 › at 390 px › the Library is a list above a tab bar at the bottom edge (638ms)
  ✓  24 e2e/layout.spec.ts:65:3 › at 390 px › the new project sheet spans the width and rises from the bottom edge (455ms)
  ✓  25 e2e/layout.spec.ts:78:3 › at 1360 px › the projects are in a sidebar beside the screen (419ms)
  ✓  26 e2e/layout.spec.ts:94:3 › at 1360 px › the new project sheet is centred (464ms)
  ✓  27 e2e/layout.spec.ts:105:1 › the phone layout ends at 719 px and the desktop layout begins at 720 px (856ms)
  ✓  28 e2e/layout.spec.ts:123:1 › the sidebar lies over the content at 999 px and beside it at 1000 px (226ms)
  ✓  29 e2e/library.spec.ts:25:3 › at 390 px › each row shows its title, its source and length, and its status (7.8s)
  ✓  30 e2e/library.spec.ts:47:3 › at 390 px › the Library has a large title, the plus control, the Projects group and the free space (219ms)
  ✓  31 e2e/library.spec.ts:67:3 › at 390 px › a row opens the screen of its project, and the back control returns to the Library (737ms)
  ✓  32 e2e/library.spec.ts:88:3 › at 390 px › the address of a project that does not exist leads to the Library (122ms)
  ✓  33 e2e/library.spec.ts:95:3 › at 390 px › a row follows the progress of its project without a reload (13.4s)
  ✓  34 e2e/library.spec.ts:112:3 › at 1360 px › the projects are in the sidebar and the free space is in its foot (696ms)
  ✓  35 e2e/library.spec.ts:126:3 › at 1360 px › the Library address shows the newest project beside the sidebar, marked in the list (1.6s)
  ✓  36 e2e/low-disk.spec.ts:21:1 › with 3 GB reported free, Find Clips creates nothing and gives the reason under the source (3.2s)
  ✓  37 e2e/missing-ffmpeg.spec.ts:20:1 › the start command stops with a sentence that names the missing media tools (523ms)
  ✓  38 e2e/new-project-errors.spec.ts:20:1 › the sheet has the sections, the wording and the defaults of the prototype (199ms)
  ✓  39 e2e/new-project-errors.spec.ts:51:1 › the hint follows the chosen length, and the file field names the chosen file (607ms)
  ✓  40 e2e/new-project-errors.spec.ts:67:1 › a link that is not a link shows its error under Source and moves focus to the link field (556ms)
  ✓  41 e2e/new-project-errors.spec.ts:89:1 › a missing file shows its error under Source and moves focus to the file field (563ms)
  ✓  42 e2e/new-project-errors.spec.ts:102:1 › no platform shows its error under Platforms and moves focus to the first switch (716ms)
  ✓  43 e2e/own-origin.spec.ts:58:1 › with projects, every request of every screen is addressed to the tool (30.1s)
  ✓  44 e2e/own-origin.spec.ts:78:1 › the empty Library asks nothing outside the tool (1.2s)
  ✓  45 e2e/own-origin.spec.ts:95:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (6.2s)
  ✓  46 e2e/queue-through-tool.spec.ts:17:1 › a second link project waits for the first and then finishes (24.7s)
  ✓  47 e2e/queue-through-tool.spec.ts:34:1 › a project whose fetch is cut off by a stop finishes after the start (14.9s)
  ✓  48 e2e/queue.spec.ts:26:1 › a second project waits while the first is fetched, names it, and starts when it finishes (21.8s)
  ✓  49 e2e/queue.spec.ts:50:1 › a file sent while another project is processed arrives in full and then waits its turn (20.4s)
  ✓  50 e2e/restart.spec.ts:24:1 › the uploaded project and the link project are listed in the same state after a stop and a start (13.9s)
  ✓  51 e2e/settings.spec.ts:39:3 › at 390 px › Settings has the five groups of the prototype with their rows and footers (173ms)
  ✓  52 e2e/settings.spec.ts:74:3 › at 390 px › the choices start at the defaults, and each one is kept after a reload (259ms)
  ✓  53 e2e/settings.spec.ts:100:3 › at 390 px › the storage row gives the free and the total space with a bar (149ms)
  ✓  54 e2e/settings.spec.ts:112:3 › at 1360 px › the phone row gives the address of this Mac with the web port, and Copy copies it (199ms)
  ✓  55 e2e/settings.spec.ts:125:3 › at 1360 px › the tool answers at the phone address (148ms)
  ✓  56 e2e/shell.spec.ts:9:1 › the page is the loading line before the width of the window is known (6ms)
  ✓  57 e2e/shell.spec.ts:19:3 › at 1360 px › the sidebar is docked with the app name, its toggle, New Project and Settings (123ms)
  ✓  58 e2e/shell.spec.ts:31:3 › at 1360 px › the toolbar carries the title of the screen (203ms)
  ✓  59 e2e/shell.spec.ts:43:3 › at 1360 px › the toggle hides the sidebar and the toolbar offers to show it again (189ms)
  ✓  60 e2e/shell.spec.ts:53:3 › at 1360 px › the sheet, the menu layer and the toast follow the app as its later siblings (129ms)
  ✓  61 e2e/shell.spec.ts:65:3 › at 860 px › the sidebar lies over the content with its scrim, and Escape closes it (172ms)
  ✓  62 e2e/shell.spec.ts:80:3 › at 860 px › a click on the scrim closes the sidebar, and so does going to another screen (267ms)
  ✓  63 e2e/shell.spec.ts:97:3 › at 390 px › the tab bar holds Library and Settings with the current one marked (201ms)
  ✓  64 e2e/shell.spec.ts:111:3 › at 390 px › the large title moves into the bar when the screen is scrolled (463ms)
  ✓  65 e2e/shell.spec.ts:127:1 › light and dark follow the system (116ms)
  ✓  66 e2e/start-command.spec.ts:14:1 › the tool opens at the address the start command prints (115ms)
  ✓  67 e2e/start-command.spec.ts:23:1 › the service answers through the web port (6ms)
  ✓  68 e2e/start-command.spec.ts:30:1 › the web port is open on the network address and the service port is closed there (6ms)
  ✓  69 e2e/start-command.spec.ts:40:1 › every request of the page goes to the address of the tool (2.1s)
  ✓  70 e2e/stop-order.spec.ts:11:1 › the service stops listening before the web app when the tool is stopped (1.1s)
  ✓  71 e2e/text-size.spec.ts:63:1 › the measure finds a block that is too wide, a cut label, a spilled label and a cut choice (206ms)
  ✓  72 e2e/text-size.spec.ts:81:1 › with projects, every screen fits at the normal size and at 200% (18.2s)
  ✓  73 e2e/text-size.spec.ts:99:1 › the empty Library fits at the normal size and at 200% (223ms)
  ✓  74 e2e/text-size.spec.ts:114:3 › with 3 GB reported free › the low disk error fits at the normal size and at 200% (3.6s)
  ✓  75 e2e/upload-parts.spec.ts:14:1 › a 50 MiB file sent in 8 MiB parts through the web port is stored whole (267ms)
  ✓  76 e2e/upload-parts.spec.ts:33:1 › a part sent at another offset is answered with the count the service holds (16ms)
  ✓  77 e2e/upload-size.spec.ts:31:1 › a 50 MiB upload shows its progress and arrives at the size and checksum it was sent with (7.1s)

  77 passed (4.8m)

--- Results
Fixtures: passed
Ruff: passed
mypy: passed
pytest: passed
ESLint: passed
Web build: passed
TypeScript check: passed
Vitest: passed
Playwright: passed
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-OZh4gg
Test data size: 0.05 GB (53.4 MB)
The test data folder was removed.
[exit code: 0]
[ended 21:12:42]
```

The run started at 21:06:16 and ended at 21:12:42. The Mac stayed awake throughout.

Result: pass

## V3 — Test data is removed and no tracked file changes (R56)

Check: block V3

Expected: `ls` reports that the folder does not exist. `git status` prints nothing.

The folder is the one the closing lines of V2 named.

```
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-OZh4gg: No such file or directory
[exit code of ls: 1]
[end of git status, exit code: 0]
```

Result: pass

## V4 — "The start command brings the tool up, and the Library opens at the address it prints"; the web app on every interface, the service on loopback only (R2, R11, A3)

Check: block V4

Expected: The log shows `http://localhost:3000`. The Library answers 200 and the page's title is `Clipper`. `/api/health` answers 200 through port 3000. `lsof` shows port 3000 listening on `*` and port 8765 on `127.0.0.1`. The data folder holds a database file. After the interrupt neither port has a listener.

```
> clipper@0.1.0 start /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/start-tool.mjs

▲ Next.js 16.3.8
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
✓ Ready in 95ms
✓ Running next.config.ts took 20ms
Clipper is running at http://localhost:3000
library: 200
<title>Clipper</title>
{"status":"ok"}
service through the web app: 200
COMMAND  PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    1086 work   15u  IPv4 0x72fe9d790ce16e4d      0t0  TCP *:3000 (LISTEN)
COMMAND  PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Python  1082 work    8u  IPv4 0x72fe9d790ce2697d      0t0  TCP 127.0.0.1:8765 (LISTEN)
clipper.sqlite3
projects
end of listeners after the interrupt
[exit code of the block: 0]
```

Result: pass

## V5 — "Started with a setting that points at a folder without ffmpeg, the tool stops with a message that names ffmpeg" (R10)

Check: block V5

Expected: The exit code is neither 0 nor 142. The log holds a sentence that names `ffmpeg` and `ffprobe` and says where Clipper looked. No line contains `Traceback`. Neither port has a listener.

```
exit code: 1

> clipper@0.1.0 start /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/start-tool.mjs

Clipper cannot start: ffmpeg and ffprobe did not run from /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/tmp.JM68Q4Ah8P/no-tools or from the PATH (/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/node_modules/.bin:/snapshot/dist/node-gyp-bin:/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/node_modules/.bin:/usr/local/bin:/Users/work/Library/pnpm:/usr/bin:/bin).
 ELIFECYCLE  Command failed with exit code 1.
end of listeners
[exit code of the block: 0]
```

Result: pass

## V33 — When the tool is stopped, the service stops before the web app, so nothing of the tool is listening once its address no longer answers (A36)

Check: block V33

Expected: Five rounds. Each prints `200` for the service through the web app, then a line that reads `<count> samples, 0 with the web port closed and the service port open`, then exit code 130. After the last round neither port has a listener.

```
round 1, service through the web app: 200
15 samples, 0 with the web port closed and the service port open
exit code of the start command: 130
round 2, service through the web app: 200
30 samples, 0 with the web port closed and the service port open
exit code of the start command: 130
round 3, service through the web app: 200
26 samples, 0 with the web port closed and the service port open
exit code of the start command: 130
round 4, service through the web app: 200
25 samples, 0 with the web port closed and the service port open
exit code of the start command: 130
round 5, service through the web app: 200
26 samples, 0 with the web port closed and the service port open
exit code of the start command: 130
end of listeners after the last round
[exit code of the block: 0]
```

Result: pass

## V6 — The web app is reachable on the Mac's network address and the service is not; pages ask nothing outside the tool (R2, R57)

Check: `pnpm test:browser e2e/start-command.spec.ts e2e/own-origin.spec.ts`

Expected: The Library opens at the address the start command printed. The web port answers on the Mac's network address and the service port refuses there. On every screen of this milestone, each request goes to the tool's own address.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/start-command.spec.ts e2e/own-origin.spec.ts


Running 7 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sL1JXk/fixtures/talk.mp4
  ✓  1 e2e/own-origin.spec.ts:58:1 › with projects, every request of every screen is addressed to the tool (33.4s)
  ✓  2 e2e/own-origin.spec.ts:78:1 › the empty Library asks nothing outside the tool (1.1s)
  ✓  3 e2e/own-origin.spec.ts:95:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (5.7s)
  ✓  4 e2e/start-command.spec.ts:14:1 › the tool opens at the address the start command prints (270ms)
  ✓  5 e2e/start-command.spec.ts:23:1 › the service answers through the web port (27ms)
  ✓  6 e2e/start-command.spec.ts:30:1 › the web port is open on the network address and the service port is closed there (19ms)
  ✓  7 e2e/start-command.spec.ts:40:1 › every request of the page goes to the address of the tool (2.2s)

  7 passed (52.3s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sL1JXk
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V7 — "Uploading the fixture video creates a project whose row shows the fetch stage progressing and then complete, with the fixture's real length" (R13, R15)

Check: `pnpm test:browser e2e/import-upload.spec.ts`

Expected: The fixture is uploaded through the new project sheet. The project's row shows the first step's bar at two or more rising values and never a falling one. The row then reads "Fetched" with the length ffprobe reports for the fixture.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/import-upload.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-02z75L/fixtures/talk.mp4
  ✓  1 e2e/import-upload.spec.ts:28:1 › the uploaded fixture is fetched: its bar rises, then the row reads Fetched with the real length (8.2s)
  ✓  2 e2e/import-upload.spec.ts:48:1 › a browser that is not sending the file says so on the status screen (190ms)

  2 passed (20.2s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-02z75L
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V8 — "A link to the same file, served by a local test server, does the same" (R13)

Check: `pnpm test:browser e2e/import-link.spec.ts`

Expected: A link to the fixture on the local server is entered in the sheet. The row shows the first step's bar rising, then "Fetched" with the fixture's length.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/import-link.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-byL4W6/fixtures/talk.mp4
  ✓  1 e2e/import-link.spec.ts:21:1 › a link to the fixture is fetched: its bar rises, then the row reads Fetched with the real length (14.1s)
  ✓  2 e2e/import-link.spec.ts:42:1 › Find Clips sends the link, the length, the platforms and the brief the user chose (642ms)

  2 passed (25.5s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-byL4W6
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V9 — "After the tool is stopped and started again, both projects are listed in the same state"; a project interrupted mid-step finishes after the restart (R15)

Check: `pnpm test:browser e2e/restart.spec.ts e2e/queue-through-tool.spec.ts`

Expected: After a stop and a start, the uploaded project and the link project are both listed as fetched with the same lengths. A project whose fetch was cut off by a stop finishes after the start.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/restart.spec.ts e2e/queue-through-tool.spec.ts


Running 3 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Km37Oa/fixtures/talk.mp4
  ✓  1 e2e/queue-through-tool.spec.ts:17:1 › a second link project waits for the first and then finishes (31.9s)
  ✓  2 e2e/queue-through-tool.spec.ts:34:1 › a project whose fetch is cut off by a stop finishes after the start (18.3s)
  ✓  3 e2e/restart.spec.ts:24:1 › the uploaded project and the link project are listed in the same state after a stop and a start (14.2s)

  3 passed (1.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Km37Oa
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V10 — "A link that is not a link, a missing file, and no platform selected each show the error under its field, as the prototype does, and move focus to that field"

Check: `pnpm test:browser e2e/new-project-errors.spec.ts`

Expected: "Paste the full link, starting with https://" appears under Source with focus in the link field. "Choose a video file first." appears under Source with focus on the file field. "Turn on at least one platform." appears under Platforms with focus on the first platform switch. In each case the field is marked invalid and no project is created.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/new-project-errors.spec.ts


Running 5 tests using 1 worker

  ✓  1 e2e/new-project-errors.spec.ts:20:1 › the sheet has the sections, the wording and the defaults of the prototype (263ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gsW8bh/fixtures/talk.mp4
  ✓  2 e2e/new-project-errors.spec.ts:51:1 › the hint follows the chosen length, and the file field names the chosen file (625ms)
  ✓  3 e2e/new-project-errors.spec.ts:67:1 › a link that is not a link shows its error under Source and moves focus to the link field (570ms)
  ✓  4 e2e/new-project-errors.spec.ts:89:1 › a missing file shows its error under Source and moves focus to the file field (572ms)
  ✓  5 e2e/new-project-errors.spec.ts:102:1 › no platform shows its error under Platforms and moves focus to the first switch (723ms)

  5 passed (11.0s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gsW8bh
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V11 — "With no projects, the Library shows the empty state from D66, and its control opens the new project sheet"; rows show each stage state (R15, R21)

Check: `pnpm test:browser e2e/empty-library.spec.ts e2e/library.spec.ts`

Expected: With no projects the Library shows "No Projects Yet" and a "New Project" control, and the control opens the sheet at `/new`. With projects, each row shows its title, source, length and status, and a row leads to its project.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/empty-library.spec.ts e2e/library.spec.ts


Running 13 tests using 1 worker

  ✓   1 e2e/empty-library.spec.ts:13:3 › at 390 px › with no projects the Library shows the empty state, and its control opens the sheet (303ms)
  ✓   2 e2e/empty-library.spec.ts:29:3 › at 390 px › Cancel closes the sheet, returns to the Library and gives focus back to the control (753ms)
  ✓   3 e2e/empty-library.spec.ts:41:3 › at 390 px › Escape and a click outside the sheet both return to the Library (649ms)
  ✓   4 e2e/empty-library.spec.ts:57:3 › at 390 px › the sheet opened at its own address returns to the Library (713ms)
  ✓   5 e2e/empty-library.spec.ts:71:3 › at 1360 px › the empty state fills the main area, and the sidebar control opens the sheet (195ms)
  ✓   6 e2e/empty-library.spec.ts:81:3 › at 1360 px › closing the sheet returns to the screen the user was on (798ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yXGkRL/fixtures/talk.mp4
  ✓   7 e2e/library.spec.ts:25:3 › at 390 px › each row shows its title, its source and length, and its status (7.9s)
  ✓   8 e2e/library.spec.ts:47:3 › at 390 px › the Library has a large title, the plus control, the Projects group and the free space (276ms)
  ✓   9 e2e/library.spec.ts:67:3 › at 390 px › a row opens the screen of its project, and the back control returns to the Library (544ms)
  ✓  10 e2e/library.spec.ts:88:3 › at 390 px › the address of a project that does not exist leads to the Library (153ms)
  ✓  11 e2e/library.spec.ts:95:3 › at 390 px › a row follows the progress of its project without a reload (13.6s)
  ✓  12 e2e/library.spec.ts:112:3 › at 1360 px › the projects are in the sidebar and the free space is in its foot (660ms)
  ✓  13 e2e/library.spec.ts:126:3 › at 1360 px › the Library address shows the newest project beside the sidebar, marked in the list (1.6s)

  13 passed (36.5s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yXGkRL
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V12 — "Deleting a project after confirming removes it from the Library and removes its files from the data folder. Cancelling the confirmation removes nothing" (R20)

Check: `pnpm test:browser e2e/delete-project.spec.ts`

Expected: The More menu offers "Delete Project…". The confirmation names the project and says what is removed. Cancel leaves the row and the project's folder. Delete removes the row and the folder. Deleting a project while it is being fetched stops it and leaves no folder.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/delete-project.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-o9FBOD/fixtures/talk.mp4
  ✓  1 e2e/delete-project.spec.ts:33:3 › at 390 px › the More menu offers Delete Project, and the confirmation names the project (690ms)
  ✓  2 e2e/delete-project.spec.ts:58:3 › at 390 px › Cancel removes neither the row nor the folder, and Delete removes both (8.5s)
  ✓  3 e2e/delete-project.spec.ts:86:3 › at 390 px › deleting a project while it is being fetched stops it and leaves no folder (3.9s)
  ✓  4 e2e/delete-project.spec.ts:112:3 › at 1360 px › the menu opens under the More control, and deleting shows the next project (1.1s)

  4 passed (23.7s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-o9FBOD
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V13 — "With free space reported as under 5 GB, creating a project is refused with the reason from D67" (R22)

Check: `pnpm test:browser e2e/low-disk.spec.ts`

Expected: With 3 GB reported free, "Find Clips" creates nothing. The reason appears under the source field, gives the free space and says to delete a project or free space.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/low-disk.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-70YXH2/fixtures/talk.mp4
  ✓  1 e2e/low-disk.spec.ts:21:1 › with 3 GB reported free, Find Clips creates nothing and gives the reason under the source (3.3s)

  1 passed (11.9s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-70YXH2
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V14 — "A second project created while the first is being fetched shows as waiting and starts when the first finishes"; an upload runs while another project is processed (R14, R16, R18)

Check: `pnpm test:browser e2e/queue.spec.ts`

Expected: While the first project is fetched, the second reads "Waiting in queue" and its status screen names the first. It starts only after the first has finished, and finishes. A file sent meanwhile arrives in full and then waits its turn.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/queue.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-80rJPP/fixtures/talk.mp4
  ✓  1 e2e/queue.spec.ts:26:1 › a second project waits while the first is fetched, names it, and starts when it finishes (18.9s)
  ✓  2 e2e/queue.spec.ts:50:1 › a file sent while another project is processed arrives in full and then waits its turn (18.1s)

  2 passed (45.3s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-80rJPP
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V15 — "A link the test server answers with 'not found' fails the fetch stage with a reason and a Retry control. Stop during a fetch leaves the project stopped, and Resume finishes it" (R17, R18)

Check: `pnpm test:browser e2e/halt-project.spec.ts`

Expected: The missing link's project shows "Could Not Finish", a reason in plain words and Retry; once the server serves the file, Retry finishes it. Stop during a fetch shows "Stopped" with its reason and Resume, and Resume finishes it.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/halt-project.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-YVIXNY/fixtures/talk.mp4
  ✓  1 e2e/halt-project.spec.ts:13:1 › a link that answers "not found" shows the reason and Retry, and Retry finishes it once repaired (8.6s)
  ✓  2 e2e/halt-project.spec.ts:38:1 › Stop during a fetch leaves the project stopped, and Resume finishes it (14.3s)

  2 passed (31.4s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-YVIXNY
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V16 — "An upload shows its progress, and a 50 MB upload arrives at the same size it was sent" (R13, R14, A22)

Check: `pnpm test:browser e2e/upload-size.spec.ts`

Expected: While a 50 MiB file is sent, the status screen says to keep the page open and shows a bar between its ends. The stored file has 52,428,800 bytes and the checksum of the file sent.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/upload-size.spec.ts


Running 1 test using 1 worker

  ✓  1 e2e/upload-size.spec.ts:31:1 › a 50 MiB upload shows its progress and arrives at the size and checksum it was sent with (7.2s)

  1 passed (9.1s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-NkNKnd
Test data size: 0.05 GB (50.0 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V17 — "Opening a project, reloading the page and pressing Back each land where D51 says"; each tab has its own address (R6)

Check: `pnpm test:browser e2e/addresses.spec.ts`

Expected: Opening a project from the Library lands on `/projects/<id>`. A reload shows the same project. Back returns to the Library. A project presented as ready shows Review, Export and Results at `/projects/<id>/review`, `/export` and `/results`; a reload keeps the tab, and Back and Forward move between tabs.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/addresses.spec.ts


Running 5 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-q9NZzt/fixtures/talk.mp4
  ✓  1 e2e/addresses.spec.ts:23:3 › at 390 px › a project opens at its own address, a reload shows it again, and Back returns to the Library (1.1s)
  ✓  2 e2e/addresses.spec.ts:44:3 › at 390 px › a ready project opens on its Review tab, and each tab has an address that a reload keeps (6.6s)
  ✓  3 e2e/addresses.spec.ts:69:3 › at 390 px › Back and Forward move between the tabs of a ready project (404ms)
  ✓  4 e2e/addresses.spec.ts:92:3 › at 390 px › the tab address of a project that is not ready shows its status screen (618ms)
  ✓  5 e2e/addresses.spec.ts:110:3 › at 1360 px › the tabs sit in the toolbar with the current one pressed (205ms)

  5 passed (17.5s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-q9NZzt
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V18 — "At 390 px the Library is a list above a tab bar and the new project form opens as a sheet. At 1360 px the projects are in a sidebar and the sheet is centred"; the two layouts and the sidebar change at the stated widths (R5)

Check: `pnpm test:browser e2e/shell.spec.ts e2e/layout.spec.ts`

Expected: At 390 px the list sits above a tab bar at the bottom edge, and the sheet spans the width from the bottom edge. At 1360 px the projects are in the sidebar and the sheet is centred. The layout changes at 720 px. The sidebar lies over the content at 999 px and beside it at 1000 px.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/shell.spec.ts e2e/layout.spec.ts


Running 16 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-NosYA9/fixtures/talk.mp4
  ✓   1 e2e/layout.spec.ts:47:3 › at 390 px › the Library is a list above a tab bar at the bottom edge (773ms)
  ✓   2 e2e/layout.spec.ts:65:3 › at 390 px › the new project sheet spans the width and rises from the bottom edge (481ms)
  ✓   3 e2e/layout.spec.ts:78:3 › at 1360 px › the projects are in a sidebar beside the screen (422ms)
  ✓   4 e2e/layout.spec.ts:94:3 › at 1360 px › the new project sheet is centred (472ms)
  ✓   5 e2e/layout.spec.ts:105:1 › the phone layout ends at 719 px and the desktop layout begins at 720 px (881ms)
  ✓   6 e2e/layout.spec.ts:123:1 › the sidebar lies over the content at 999 px and beside it at 1000 px (236ms)
  ✓   7 e2e/shell.spec.ts:9:1 › the page is the loading line before the width of the window is known (7ms)
  ✓   8 e2e/shell.spec.ts:19:3 › at 1360 px › the sidebar is docked with the app name, its toggle, New Project and Settings (124ms)
  ✓   9 e2e/shell.spec.ts:31:3 › at 1360 px › the toolbar carries the title of the screen (206ms)
  ✓  10 e2e/shell.spec.ts:43:3 › at 1360 px › the toggle hides the sidebar and the toolbar offers to show it again (176ms)
  ✓  11 e2e/shell.spec.ts:53:3 › at 1360 px › the sheet, the menu layer and the toast follow the app as its later siblings (116ms)
  ✓  12 e2e/shell.spec.ts:65:3 › at 860 px › the sidebar lies over the content with its scrim, and Escape closes it (171ms)
  ✓  13 e2e/shell.spec.ts:80:3 › at 860 px › a click on the scrim closes the sidebar, and so does going to another screen (268ms)
  ✓  14 e2e/shell.spec.ts:97:3 › at 390 px › the tab bar holds Library and Settings with the current one marked (203ms)
  ✓  15 e2e/shell.spec.ts:111:3 › at 390 px › the large title moves into the bar when the screen is scrolled (444ms)
  ✓  16 e2e/shell.spec.ts:127:1 › light and dark follow the system (109ms)

  16 passed (13.7s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-NosYA9
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V19 — "Screen captures at both widths, in light and in dark, are saved" (A20)

Check: block V19

Expected: Exit 0. The evidence folder holds 24 files named `<screen>-<width>-<theme>.png`: `library`, `empty-library`, `new-project`, `status`, `project` and `settings`, at `390` and `1360`, in `light` and `dark`.

```
[exit code of the command before: 0] + CLIPPER_EVIDENCE_DIR=/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence
[exit code of the command before: 0] + pnpm test:browser e2e/captures.spec.ts

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/captures.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-4uoxzt/fixtures/talk.mp4
  ✓  1 e2e/captures.spec.ts:61:1 › six screens are captured whole at 390 and 1360 px, in light and in dark (15.1s)

  1 passed (24.3s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-4uoxzt
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code of the command before: 0] + ls docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence
empty-library-1360-dark.png
empty-library-1360-light.png
empty-library-390-dark.png
empty-library-390-light.png
library-1360-dark.png
library-1360-light.png
library-390-dark.png
library-390-light.png
new-project-1360-dark.png
new-project-1360-light.png
new-project-390-dark.png
new-project-390-light.png
project-1360-dark.png
project-1360-light.png
project-390-dark.png
project-390-light.png
settings-1360-dark.png
settings-1360-light.png
settings-390-dark.png
settings-390-light.png
status-1360-dark.png
status-1360-light.png
status-390-dark.png
status-390-light.png
[exit code of the block: 0]
```

Result: pass

## V20 — The screens are laid out as the prototype's, on phone and desktop, in light and in dark (R3, R5)

Check: Open every capture from V19 and record in the proof what each shows.

Expected: At 390: the Library has a large title, project rows and a tab bar with Library and Settings; the sheet rises from the bottom with Cancel, New Project and Find Clips; the status screen has a centred card with a heading, a bar and a step line; the project view has the Review, Export and Results control; Settings has five titled groups; the empty Library reads "No Projects Yet" with "New Project". At 1360: a sidebar holds Clipper, New Project, the project rows and Settings, with the screen beside it; the sheet is centred over a dimmed page. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text.

The captures are in `evidence/`, written by V19 in this run. Sizes are in pixels.

| capture | size | what it shows |
| -- | -- | -- |
| `library-390-light.png` | 390 × 888 | A round plus control at the top right and the large title "Library". A Projects group of six rows, each with a title, a source line and a status: "interview.mov", Uploaded file, a bar, Uploading video; three "New video from link" rows reading Waiting in queue, Fetching video with an empty bar, and Stopped; a fourth reading Could not finish in orange with a warning sign; "talk", "Video link · 4 min", a bar, Fetched. "50 GB free on this Mac" sits under the group. The tab bar is below it, clear of the text, with Library marked current and Settings. |
| `library-390-dark.png` | 390 × 888 | The same screen on a black page, with a dark grey group and tab bar and white text. |
| `empty-library-390-light.png` | 390 × 844 | The plus control, the large title "Library", a film icon, "No Projects Yet", the sentence "Paste a video link or upload a file, and Clipper finds its best clips." and a blue "New Project" control. The tab bar with Library and Settings at the bottom edge. |
| `empty-library-390-dark.png` | 390 × 844 | The same screen on a black page with white text. |
| `new-project-390-light.png` | 390 × 888 | A sheet over the dimmed Library, spanning the width and reaching the bottom edge, with a grabber at its top. Its bar holds Cancel, with a focus ring, "New Project" and a blue Find Clips. Sections: Source (YouTube Link chosen, Upload a File, and a Video Link field), Clip Length (15–30 s, 25–60 s chosen, 60–180 s, and the line "One point with its setup and payoff."), Platforms (TikTok, Reels and Shorts, all on) and What to Look For (Optional) with a text area. The hint inside the Video Link field is shortened to "https://www.youtube.…". |
| `new-project-390-dark.png` | 390 × 888 | The same sheet in dark grey with white text, with the same shortened hint. |
| `status-390-light.png` | 390 × 844 | A Library back control and a More control. The title "New video from link" with "Video link" under it. Centred below: the heading "Finding Clips", an empty bar, the step line "Fetching video", "Step 1 of 4." and a Stop control. The tab bar at the bottom edge. |
| `status-390-dark.png` | 390 × 844 | The same screen on a black page with white text. |
| `project-390-light.png` | 390 × 844 | The back and More controls. The title "talk" with "Video link · 00:03:55 · 0 candidates". One control holding Review, chosen, Export 0 and Results. A Candidates group reading "No clips in this group." The tab bar at the bottom edge. |
| `project-390-dark.png` | 390 × 844 | The same screen on a black page with white text. |
| `settings-390-light.png` | 390 × 1419 | The large title "Settings" and five titled groups, each whole. AI Services: Anthropic API Key on two lines with the hint "sk-ant-…" and a Save control, Scoring Model "Claude Sonnet 5.5", Cutting Model "Claude Opus 5.5", Transcription Model with "Whisper large-v3-turbo" on the line under its label, and a four-line footer. Defaults for New Projects: Clip Length "25–60 s" and Clips per Video "Auto". Storage: "50 GB free of 460 GB on this Mac" with a bar, Delete Source Videos After "7 days", and the footer "Exported clips stay until you delete them." Open on Your Phone: "http://192.168.10.111:3100" with a Copy control and a one-line footer. What the Selector Has Learned: Cut Off Mid-Thought, Not Interesting, Needs Earlier Context and Repeats Another Clip, each 0, "Forget All of It" in red, and a two-line footer. The tab bar, with Settings marked current, is below the last footer and covers no text. |
| `settings-390-dark.png` | 390 × 1419 | The same screen with the same five groups, dark grey on a black page with white text. The tab bar covers no text. |
| `library-1360-light.png` | 1360 × 900 | A sidebar with Clipper, a sidebar toggle, New Project, a Projects list of the six rows with the first marked, and at its foot Settings and "50 GB free on this Mac". Beside it the newest project: the title "interview.mov" with "Uploaded file", a More control at the right, and centred the heading "Uploading Video", a bar, the step line "Uploading video" and three lines of explanation. |
| `library-1360-dark.png` | 1360 × 900 | The same screen with a dark grey sidebar, a black page and white text. |
| `empty-library-1360-light.png` | 1360 × 900 | The sidebar with Clipper, New Project, an empty Projects list and Settings. Beside it the title "Library" and, centred, the film icon, "No Projects Yet", its sentence and "New Project". |
| `empty-library-1360-dark.png` | 1360 × 900 | The same screen with a dark grey sidebar, a black page and white text. |
| `new-project-1360-light.png` | 1360 × 900 | The sheet centred over the dimmed sidebar and page, with Cancel, "New Project" and Find Clips and the four sections. The Video Link hint reads "https://www.youtube.com/watch?v=…". A few letters of the dimmed page's explanation show beside the sheet's right edge, where the sheet lies over it. |
| `new-project-1360-dark.png` | 1360 × 900 | The same sheet in dark grey over a dimmed dark page. |
| `status-1360-light.png` | 1360 × 900 | The sidebar with the third project marked. Beside it the title "New video from link" with "Video link" and, centred, "Finding Clips", an empty bar, "Fetching video", "Step 1 of 4." and Stop. |
| `status-1360-dark.png` | 1360 × 900 | The same screen with a dark grey sidebar, a black page and white text. |
| `project-1360-light.png` | 1360 × 900 | The sidebar with "talk" marked and reading "Ready to review". Beside it the title "talk" with "Video link · 00:03:55 · 0 candidates", the Review, Export 0 and Results control in the toolbar with Review chosen, a More control, and a Candidates group reading "No clips in this group." |
| `project-1360-dark.png` | 1360 × 900 | The same screen with a dark grey sidebar, a black page and white text. |
| `settings-1360-light.png` | 1360 × 1041 | The sidebar with Settings marked. Beside it the title "Settings" and all five groups, each whole with its rows and footer: AI Services, Defaults for New Projects, Storage, Open on Your Phone with the address and Copy, and What the Selector Has Learned down to "Forget All of It" and its footer. |
| `settings-1360-dark.png` | 1360 × 1041 | The same screen with a dark grey sidebar, dark grey groups on a black page and white text. |

Every expectation is met. The Settings captures at 390 px hold the whole screen with its five
titled groups, and the tab bar lies below the last line of text. In the sheet at 390 px the hint
inside the Video Link field, a sample address, ends in an ellipsis where the field ends; the rule
that shortens it is in `app.css`, pasted under V26. No label, title, row, footer or control is cut
in a capture, and no text lies over other text.

Result: pass

## V21 — "At 390 px no screen scrolls sideways and no label is cut off, at the normal text size and at 200%" (R7)

Check: `pnpm test:browser e2e/text-size.spec.ts`

Expected: For the Library, the empty Library, the sheet with each source and each error, the status screen in each state, the project tabs, the delete confirmation and Settings, at 390 px, at the normal size and at 200%: no sideways scroll, no element wider than the screen, no label with clipped text.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/text-size.spec.ts


Running 4 tests using 1 worker

  ✓  1 e2e/text-size.spec.ts:63:1 › the measure finds a block that is too wide, a cut label, a spilled label and a cut choice (464ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-WDw9U6/fixtures/talk.mp4
  ✓  2 e2e/text-size.spec.ts:81:1 › with projects, every screen fits at the normal size and at 200% (19.1s)
  ✓  3 e2e/text-size.spec.ts:99:1 › the empty Library fits at the normal size and at 200% (235ms)
  ✓  4 e2e/text-size.spec.ts:114:3 › with 3 GB reported free › the low disk error fits at the normal size and at 200% (4.8s)

  4 passed (36.2s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-WDw9U6
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V22 — Settings holds every control of the prototype and keeps each choice (A9, A30)

Check: `pnpm test:browser e2e/settings.spec.ts`

Expected: The five groups and their rows are present. Each of the six choices, once changed, is still chosen after a reload. The storage row gives free and total space, and the phone row gives an address with the web port.

```
> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/settings.spec.ts


Running 5 tests using 1 worker

  ✓  1 e2e/settings.spec.ts:39:3 › at 390 px › Settings has the five groups of the prototype with their rows and footers (392ms)
  ✓  2 e2e/settings.spec.ts:74:3 › at 390 px › the choices start at the defaults, and each one is kept after a reload (492ms)
  ✓  3 e2e/settings.spec.ts:100:3 › at 390 px › the storage row gives the free and the total space with a bar (254ms)
  ✓  4 e2e/settings.spec.ts:112:3 › at 1360 px › the phone row gives the address of this Mac with the web port, and Copy copies it (358ms)
  ✓  5 e2e/settings.spec.ts:125:3 › at 1360 px › the tool answers at the phone address (200ms)

  5 passed (3.9s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-AHtpsn
Test data size: 0.00 GB (0.0 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V23 — The service's rules, by test name (R10, R11, R13, R15, R16, R17, R19, R20, R22, A22)

Check: block V23

Expected: Exit 0. Passed tests show: the tools found in the configured folder, taken from the PATH when it lacks them, and a missing or broken tool named; the fixture's length read; a preview copy that is H.264 with AAC and no taller than 720 pixels; no format above 1080 pixels allowed for a link; a "not found" link reported; a three-hour source fetched; projects taken in creation order, one at a time; step state and percent stored; a project interrupted by a restart finished; stop, resume and retry, with finished steps not run again; the disk-full reason; an upload appended part by part with its size intact; a file over 4 GB refused; a new project refused under 5 GB free; delete removing the project's files.

```
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0 -- /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collecting ... collected 224 items

clipper/fetching/test_download_link.py::test_the_fixture_is_stored_at_its_full_size_with_the_title_yt_dlp_read PASSED [  0%]
clipper/fetching/test_download_link.py::test_the_caller_receives_a_rising_percent_that_ends_at_100 PASSED [  0%]
clipper/fetching/test_download_link.py::test_no_format_above_1080_pixels_is_allowed_for_a_link PASSED [  1%]
clipper/fetching/test_download_link.py::test_a_link_offered_only_above_1080_pixels_is_not_downloaded PASSED [  1%]
clipper/fetching/test_download_link.py::test_a_source_whose_height_is_unknown_is_still_accepted PASSED [  2%]
clipper/fetching/test_download_link.py::test_node_is_the_javascript_runtime_and_ffmpeg_comes_from_the_folder_found PASSED [  2%]
clipper/fetching/test_download_link.py::test_a_link_that_answers_not_found_is_reported_as_not_found PASSED [  3%]
clipper/fetching/test_download_link.py::test_a_link_to_nothing_is_reported_as_a_download_error PASSED [  3%]
clipper/fetching/test_download_link.py::test_a_stop_signal_ends_the_download_within_two_seconds PASSED [  4%]
clipper/fetching/test_download_link.py::test_a_rerun_starts_from_an_empty_folder PASSED [  4%]
clipper/fetching/test_fetch_stage.py::test_a_link_is_downloaded_then_measured_and_given_a_preview_copy PASSED [  4%]
clipper/fetching/test_fetch_stage.py::test_the_percent_of_a_link_counts_the_download_as_70_and_the_preview_as_the_rest PASSED [  5%]
clipper/fetching/test_fetch_stage.py::test_an_uploaded_file_is_measured_and_given_a_preview_copy_from_70_percent_on PASSED [  5%]
clipper/fetching/test_fetch_stage.py::test_a_three_hour_source_is_fetched_with_a_length_of_10800_seconds PASSED [  6%]
clipper/fetching/test_fetch_stage.py::test_a_rerun_starts_from_clean_files PASSED [  6%]
clipper/fetching/test_fetch_stage.py::test_a_link_that_cannot_be_downloaded_fails_with_a_plain_reason PASSED [  7%]
clipper/fetching/test_fetch_stage.py::test_an_upload_that_is_not_a_video_fails_by_name PASSED [  7%]
clipper/fetching/test_fetch_stage.py::test_an_upload_whose_file_is_gone_fails_by_name PASSED [  8%]
clipper/media/test_locate_media_tools.py::test_tools_are_found_in_the_configured_folder PASSED [  8%]
clipper/media/test_locate_media_tools.py::test_tools_are_taken_from_the_path_when_the_folder_lacks_them PASSED [  8%]
clipper/media/test_locate_media_tools.py::test_a_tool_that_does_not_start_in_the_folder_is_taken_from_the_path PASSED [  9%]
clipper/media/test_locate_media_tools.py::test_a_missing_tool_is_named_with_the_places_searched PASSED [  9%]
clipper/media/test_locate_media_tools.py::test_a_broken_tool_is_named PASSED [ 10%]
clipper/media/test_locate_media_tools.py::test_both_tools_are_named_when_neither_is_found PASSED [ 10%]
clipper/media/test_locate_media_tools.py::test_a_file_that_is_not_a_program_does_not_count_as_a_tool PASSED [ 11%]
clipper/media/test_locate_media_tools.py::test_the_homebrew_tools_on_this_mac_run PASSED [ 11%]
clipper/media/test_make_preview_copy.py::test_the_preview_copy_is_h264_with_aac_and_no_taller_than_720_pixels PASSED [ 12%]
clipper/media/test_make_preview_copy.py::test_a_source_lower_than_720_pixels_keeps_its_height PASSED [ 12%]
clipper/media/test_make_preview_copy.py::test_the_preview_copy_is_as_long_as_its_source PASSED [ 12%]
clipper/media/test_make_preview_copy.py::test_the_index_is_at_the_front_of_the_file PASSED [ 13%]
clipper/media/test_make_preview_copy.py::test_the_caller_receives_a_rising_percent_that_ends_at_100 PASSED [ 13%]
clipper/media/test_make_preview_copy.py::test_a_stop_signal_ends_ffmpeg_within_two_seconds_and_removes_the_partial_file PASSED [ 14%]
clipper/media/test_make_preview_copy.py::test_a_source_that_cannot_be_read_fails_by_name_and_leaves_no_file PASSED [ 14%]
clipper/media/test_probe_video.py::test_the_length_of_the_fixture_is_the_length_ffprobe_reports PASSED [ 15%]
clipper/media/test_probe_video.py::test_the_fixture_is_about_four_minutes_of_720p PASSED [ 15%]
clipper/media/test_probe_video.py::test_the_height_of_a_built_video_is_read PASSED [ 16%]
clipper/media/test_probe_video.py::test_a_file_that_is_not_a_video_raises_a_named_error PASSED [ 16%]
clipper/media/test_probe_video.py::test_sound_without_a_picture_is_not_a_video PASSED [ 16%]
clipper/media/test_probe_video.py::test_a_file_that_does_not_exist_is_not_a_video PASSED [ 17%]
clipper/pipeline/test_explain_failure.py::test_a_reason_the_stage_states_is_used_as_it_is PASSED [ 17%]
clipper/pipeline/test_explain_failure.py::test_a_file_that_is_not_a_video_is_explained_with_what_to_do PASSED [ 18%]
clipper/pipeline/test_explain_failure.py::test_a_full_disk_reported_by_python_gives_the_disk_full_reason PASSED [ 18%]
clipper/pipeline/test_explain_failure.py::test_a_full_disk_reported_by_ffmpeg_gives_the_disk_full_reason PASSED [ 19%]
clipper/pipeline/test_explain_failure.py::test_a_full_disk_behind_a_failed_download_gives_the_disk_full_reason PASSED [ 19%]
clipper/pipeline/test_explain_failure.py::test_another_operating_system_error_is_not_taken_for_a_full_disk PASSED [ 20%]
clipper/pipeline/test_explain_failure.py::test_anything_else_names_the_step_and_suggests_a_retry PASSED [ 20%]
clipper/pipeline/test_explain_failure.py::test_a_stop_names_the_step_and_says_the_earlier_stages_are_kept PASSED [ 20%]
clipper/pipeline/test_halt_project.py::test_stop_ends_the_running_step_within_two_seconds_and_leaves_the_project_stopped PASSED [ 21%]
clipper/pipeline/test_halt_project.py::test_the_queue_moves_on_after_a_stop PASSED [ 21%]
clipper/pipeline/test_halt_project.py::test_a_project_that_is_not_processing_cannot_be_stopped PASSED [ 22%]
clipper/pipeline/test_halt_project.py::test_resume_puts_a_stopped_project_back_in_the_queue_and_it_finishes PASSED [ 22%]
clipper/pipeline/test_halt_project.py::test_retry_runs_the_failed_step_again_and_not_the_steps_that_finished PASSED [ 23%]
clipper/pipeline/test_halt_project.py::test_a_project_that_is_neither_stopped_nor_failed_cannot_be_run_again PASSED [ 23%]
clipper/pipeline/test_recover_interrupted.py::test_a_project_found_processing_goes_back_to_the_queue_with_its_step_at_the_start PASSED [ 24%]
clipper/pipeline/test_recover_interrupted.py::test_a_recovered_project_is_the_next_one_taken PASSED [ 24%]
clipper/pipeline/test_recover_interrupted.py::test_projects_that_were_not_processing_are_left_as_they_were PASSED [ 25%]
clipper/pipeline/test_recover_interrupted.py::test_nothing_is_recovered_from_an_empty_library PASSED [ 25%]
clipper/pipeline/test_router.py::test_stop_during_a_fetch_leaves_the_project_stopped_and_resume_finishes_it PASSED [ 25%]
clipper/pipeline/test_router.py::test_a_link_that_answers_not_found_fails_with_a_reason_and_retry_finishes_it_once_repaired PASSED [ 26%]
clipper/pipeline/test_router.py::test_an_upload_that_is_not_a_video_fails_with_what_to_do PASSED [ 26%]
clipper/pipeline/test_router.py::test_deleting_a_project_while_it_is_fetched_stops_it_and_leaves_no_folder PASSED [ 27%]
clipper/pipeline/test_router.py::test_an_action_the_state_of_the_project_does_not_allow_answers_409[stop] PASSED [ 27%]
clipper/pipeline/test_router.py::test_an_action_the_state_of_the_project_does_not_allow_answers_409[resume] PASSED [ 28%]
clipper/pipeline/test_router.py::test_an_action_the_state_of_the_project_does_not_allow_answers_409[retry] PASSED [ 28%]
clipper/pipeline/test_router.py::test_an_action_on_an_unknown_project_answers_404[stop] PASSED [ 29%]
clipper/pipeline/test_router.py::test_an_action_on_an_unknown_project_answers_404[resume] PASSED [ 29%]
clipper/pipeline/test_router.py::test_an_action_on_an_unknown_project_answers_404[retry] PASSED [ 29%]
clipper/pipeline/test_run_queue.py::test_projects_are_taken_in_creation_order_one_at_a_time PASSED [ 30%]
clipper/pipeline/test_run_queue.py::test_the_step_of_the_running_project_is_marked_running PASSED [ 30%]
clipper/pipeline/test_run_queue.py::test_a_finished_project_rests_fetched_with_its_other_three_steps_pending PASSED [ 31%]
clipper/pipeline/test_run_queue.py::test_a_project_that_joins_later_is_taken_once_the_queue_is_free PASSED [ 31%]
clipper/pipeline/test_run_queue.py::test_the_step_percent_is_stored_and_never_falls PASSED [ 32%]
clipper/pipeline/test_run_queue.py::test_the_step_percent_is_stored_at_least_once_a_second PASSED [ 32%]
clipper/pipeline/test_run_queue.py::test_a_failing_stage_leaves_the_project_failed_with_a_reason_and_the_queue_moving PASSED [ 33%]
clipper/pipeline/test_run_queue.py::test_stopping_the_worker_ends_the_running_stage_and_leaves_its_project_processing PASSED [ 33%]
clipper/pipeline/test_run_queue.py::test_a_project_deleted_while_it_waits_is_skipped PASSED [ 33%]
clipper/problems/test_handle_app_errors.py::test_a_refusal_answers_422_with_its_section_and_message PASSED [ 34%]
clipper/problems/test_handle_app_errors.py::test_a_missing_thing_answers_404 PASSED [ 34%]
clipper/problems/test_handle_app_errors.py::test_a_conflict_answers_409 PASSED [ 35%]
clipper/problems/test_handle_app_errors.py::test_an_error_without_a_kind_answers_500_with_its_message PASSED [ 35%]
clipper/problems/test_handle_app_errors.py::test_an_error_outside_the_hierarchy_is_left_to_the_server PASSED [ 36%]
clipper/projects/test_create_project.py::test_a_link_project_waits_in_the_queue_under_a_placeholder_title PASSED [ 36%]
clipper/projects/test_create_project.py::test_a_file_project_starts_uploading_under_its_file_name PASSED [ 37%]
clipper/projects/test_create_project.py::test_a_project_has_four_steps_that_have_not_started PASSED [ 37%]
clipper/projects/test_create_project.py::test_the_first_step_of_a_file_project_runs_while_it_uploads PASSED [ 37%]
clipper/projects/test_create_project.py::test_the_id_is_safe_for_an_address PASSED [ 38%]
clipper/projects/test_create_project.py::test_the_source_label_names_where_a_link_points[https://www.youtube.com/watch?v=abc123-YouTube link] PASSED [ 38%]
clipper/projects/test_create_project.py::test_the_source_label_names_where_a_link_points[https://youtu.be/abc123-YouTube link] PASSED [ 39%]
clipper/projects/test_create_project.py::test_the_source_label_names_where_a_link_points[https://m.youtube.com/watch?v=abc123-YouTube link] PASSED [ 39%]
clipper/projects/test_create_project.py::test_the_source_label_names_where_a_link_points[http://127.0.0.1:8000/talk.mp4-Video link] PASSED [ 40%]
clipper/projects/test_create_project.py::test_the_source_label_names_where_a_link_points[https://notyoutube.com/talk.mp4-Video link] PASSED [ 40%]
clipper/projects/test_create_project.py::test_the_choices_of_the_draft_are_kept PASSED [ 41%]
clipper/projects/test_create_project.py::test_a_link_that_is_not_a_link_is_refused_under_the_source[] PASSED [ 41%]
clipper/projects/test_create_project.py::test_a_link_that_is_not_a_link_is_refused_under_the_source[youtube.com/watch] PASSED [ 41%]
clipper/projects/test_create_project.py::test_a_link_that_is_not_a_link_is_refused_under_the_source[https://nodots] PASSED [ 42%]
clipper/projects/test_create_project.py::test_a_link_that_is_not_a_link_is_refused_under_the_source[ftp://a.b/c] PASSED [ 42%]
clipper/projects/test_create_project.py::test_a_missing_file_is_refused_under_the_source[-100] PASSED [ 43%]
clipper/projects/test_create_project.py::test_a_missing_file_is_refused_under_the_source[empty.mp4-0] PASSED [ 43%]
clipper/projects/test_create_project.py::test_no_platform_is_refused_under_the_platforms PASSED [ 44%]
clipper/projects/test_create_project.py::test_a_file_over_4_gb_is_refused PASSED [ 44%]
clipper/projects/test_create_project.py::test_a_file_of_exactly_4_gb_is_accepted PASSED [ 45%]
clipper/projects/test_create_project.py::test_a_new_project_is_refused_under_5_gb_free PASSED [ 45%]
clipper/projects/test_create_project.py::test_the_refusal_never_shows_the_5_gb_it_asks_for PASSED [ 45%]
clipper/projects/test_create_project.py::test_a_new_project_is_accepted_at_exactly_5_gb_free PASSED [ 46%]
clipper/projects/test_delete_project.py::test_delete_removes_the_files_of_the_project PASSED [ 46%]
clipper/projects/test_delete_project.py::test_delete_leaves_the_other_projects_alone PASSED [ 47%]
clipper/projects/test_delete_project.py::test_delete_works_for_a_project_that_has_no_files_yet PASSED [ 47%]
clipper/projects/test_delete_project.py::test_a_processing_project_is_stopped_before_its_files_are_removed PASSED [ 48%]
clipper/projects/test_delete_project.py::test_deleting_an_unknown_project_raises_not_found PASSED [ 48%]
clipper/projects/test_project_queue.py::test_the_oldest_queued_project_is_taken_and_marked_processing PASSED [ 49%]
clipper/projects/test_project_queue.py::test_nothing_is_taken_from_an_empty_queue PASSED [ 49%]
clipper/projects/test_project_queue.py::test_a_step_percent_is_stored_while_the_step_runs_and_never_falls PASSED [ 50%]
clipper/projects/test_project_queue.py::test_a_finished_step_is_done_at_100_percent_and_the_project_rests PASSED [ 50%]
clipper/projects/test_project_queue.py::test_a_halt_stores_the_reason_and_returns_the_step_to_its_start PASSED [ 50%]
clipper/projects/test_project_queue.py::test_a_requeued_project_waits_again_without_its_reason PASSED [ 51%]
clipper/projects/test_project_queue.py::test_an_uploaded_file_keeps_the_share_its_arrival_earned_when_its_step_restarts PASSED [ 51%]
clipper/projects/test_project_queue.py::test_processing_projects_are_listed_oldest_first PASSED [ 52%]
clipper/projects/test_project_repository.py::test_a_stored_project_is_read_back_unchanged PASSED [ 52%]
clipper/projects/test_project_repository.py::test_a_file_project_keeps_its_upload PASSED [ 53%]
clipper/projects/test_project_repository.py::test_projects_are_listed_newest_first PASSED [ 53%]
clipper/projects/test_project_repository.py::test_each_listed_project_carries_its_own_steps_in_order PASSED [ 54%]
clipper/projects/test_project_repository.py::test_finding_an_unknown_id_returns_nothing PASSED [ 54%]
clipper/projects/test_project_repository.py::test_getting_an_unknown_id_raises_not_found PASSED [ 54%]
clipper/projects/test_project_repository.py::test_deleting_removes_the_project_and_its_steps PASSED [ 55%]
clipper/projects/test_project_repository.py::test_projects_survive_reopening_the_database PASSED [ 55%]
clipper/projects/test_receive_upload.py::test_an_upload_is_appended_part_by_part_with_its_size_intact PASSED [ 56%]
clipper/projects/test_receive_upload.py::test_the_bytes_held_are_recorded_as_the_first_70_percent_of_the_step PASSED [ 56%]
clipper/projects/test_receive_upload.py::test_the_project_joins_the_queue_when_the_last_part_lands PASSED [ 57%]
clipper/projects/test_receive_upload.py::test_another_offset_is_refused_with_the_count_held[0] PASSED [ 57%]
clipper/projects/test_receive_upload.py::test_another_offset_is_refused_with_the_count_held[2] PASSED [ 58%]
clipper/projects/test_receive_upload.py::test_another_offset_is_refused_with_the_count_held[4] PASSED [ 58%]
clipper/projects/test_receive_upload.py::test_another_offset_is_refused_with_the_count_held[100] PASSED [ 58%]
clipper/projects/test_receive_upload.py::test_a_part_that_would_pass_the_declared_size_is_refused PASSED [ 59%]
clipper/projects/test_receive_upload.py::test_a_project_that_is_not_uploading_refuses_parts PASSED [ 59%]
clipper/projects/test_receive_upload.py::test_a_part_for_an_unknown_project_is_not_found PASSED [ 60%]
clipper/projects/test_receive_upload.py::test_the_stored_name_never_comes_from_the_name_the_browser_sent[talk.mp4-source.mp4] PASSED [ 60%]
clipper/projects/test_receive_upload.py::test_the_stored_name_never_comes_from_the_name_the_browser_sent[Interview.MOV-source.mov] PASSED [ 61%]
clipper/projects/test_receive_upload.py::test_the_stored_name_never_comes_from_the_name_the_browser_sent[no-extension-source.video] PASSED [ 61%]
clipper/projects/test_receive_upload.py::test_the_stored_name_never_comes_from_the_name_the_browser_sent[../../escape.sh;rm-source.video] PASSED [ 62%]
clipper/projects/test_receive_upload.py::test_the_stored_name_never_comes_from_the_name_the_browser_sent[archive.tar.gz-source.gz] PASSED [ 62%]
clipper/projects/test_router.py::test_an_empty_library_lists_no_projects_and_the_free_space PASSED [ 62%]
clipper/projects/test_router.py::test_a_created_link_project_is_returned_in_its_json_form PASSED [ 63%]
clipper/projects/test_router.py::test_a_created_file_project_reports_its_upload PASSED [ 63%]
clipper/projects/test_router.py::test_projects_are_listed_newest_first PASSED [ 64%]
clipper/projects/test_router.py::test_one_project_is_read_by_its_id PASSED [ 64%]
clipper/projects/test_router.py::test_a_draft_with_a_problem_is_refused_with_its_section[change0-source-Paste the full link, starting with https://] PASSED [ 65%]
clipper/projects/test_router.py::test_a_draft_with_a_problem_is_refused_with_its_section[change1-source-Choose a video file first.] PASSED [ 65%]
clipper/projects/test_router.py::test_a_draft_with_a_problem_is_refused_with_its_section[change2-platforms-Turn on at least one platform.] PASSED [ 66%]
clipper/projects/test_router.py::test_a_file_over_4_gb_is_refused PASSED [ 66%]
clipper/projects/test_router.py::test_a_new_project_is_refused_when_the_reported_free_space_is_under_5_gb PASSED [ 66%]
clipper/projects/test_router.py::test_delete_removes_the_project_and_its_folder PASSED [ 67%]
clipper/projects/test_router.py::test_upload_parts_are_appended_and_the_new_count_is_answered PASSED [ 67%]
clipper/projects/test_router.py::test_a_part_at_another_offset_answers_409_with_the_count_held PASSED [ 68%]
clipper/projects/test_router.py::test_a_part_declared_larger_than_8_mib_answers_413 PASSED [ 68%]
clipper/projects/test_router.py::test_a_part_of_exactly_8_mib_is_accepted PASSED [ 69%]
clipper/projects/test_router.py::test_a_part_for_a_link_project_answers_409 PASSED [ 69%]
clipper/projects/test_router.py::test_a_part_for_an_unknown_project_answers_404 PASSED [ 70%]
clipper/projects/test_router.py::test_an_unknown_id_answers_404_through_the_error_handler[GET] PASSED [ 70%]
clipper/projects/test_router.py::test_an_unknown_id_answers_404_through_the_error_handler[DELETE] PASSED [ 70%]
clipper/settings/test_describe_machine.py::test_the_network_address_is_an_address_of_this_mac PASSED [ 71%]
clipper/settings/test_describe_machine.py::test_the_phone_address_is_the_network_address_with_the_web_port PASSED [ 71%]
clipper/settings/test_describe_machine.py::test_without_a_network_the_address_falls_back_to_this_mac PASSED [ 72%]
clipper/settings/test_preference_store.py::test_the_defaults_are_the_choices_of_a_new_tool PASSED [ 72%]
clipper/settings/test_preference_store.py::test_the_models_are_stored_under_the_identifiers_the_api_names PASSED [ 73%]
clipper/settings/test_preference_store.py::test_one_choice_is_stored_and_the_others_keep_their_defaults PASSED [ 73%]
clipper/settings/test_preference_store.py::test_every_choice_can_be_changed_and_is_read_back PASSED [ 74%]
clipper/settings/test_preference_store.py::test_a_later_choice_replaces_an_earlier_one PASSED [ 74%]
clipper/settings/test_preference_store.py::test_choices_survive_a_new_store_on_the_same_database PASSED [ 75%]
clipper/settings/test_preference_store.py::test_a_value_outside_the_options_is_not_a_change PASSED [ 75%]
clipper/settings/test_preference_store.py::test_a_name_that_is_not_a_choice_is_not_a_change PASSED [ 75%]
clipper/settings/test_router.py::test_settings_start_at_the_defaults PASSED [ 76%]
clipper/settings/test_router.py::test_settings_carry_the_disk_space_and_the_phone_address PASSED [ 76%]
clipper/settings/test_router.py::test_one_choice_is_stored_and_returned_with_the_rest[scoringModel-claude-haiku-4-5] PASSED [ 77%]
clipper/settings/test_router.py::test_one_choice_is_stored_and_returned_with_the_rest[cuttingModel-claude-fable-5-1] PASSED [ 77%]
clipper/settings/test_router.py::test_one_choice_is_stored_and_returned_with_the_rest[whisperModel-small] PASSED [ 78%]
clipper/settings/test_router.py::test_one_choice_is_stored_and_returned_with_the_rest[defaultLength-long] PASSED [ 78%]
clipper/settings/test_router.py::test_one_choice_is_stored_and_returned_with_the_rest[clipsPerVideo-12] PASSED [ 79%]
clipper/settings/test_router.py::test_one_choice_is_stored_and_returned_with_the_rest[sourceRetention-never] PASSED [ 79%]
clipper/settings/test_router.py::test_a_value_outside_the_options_is_refused_and_nothing_changes[change0] PASSED [ 79%]
clipper/settings/test_router.py::test_a_value_outside_the_options_is_refused_and_nothing_changes[change1] PASSED [ 80%]
clipper/settings/test_router.py::test_a_value_outside_the_options_is_refused_and_nothing_changes[change2] PASSED [ 80%]
clipper/settings/test_router.py::test_a_value_outside_the_options_is_refused_and_nothing_changes[change3] PASSED [ 81%]
clipper/settings/test_router.py::test_a_value_outside_the_options_is_refused_and_nothing_changes[change4] PASSED [ 81%]
clipper/settings/test_router.py::test_a_value_outside_the_options_is_refused_and_nothing_changes[change5] PASSED [ 82%]
clipper/settings/test_startup_settings.py::test_defaults_are_the_values_the_tool_runs_with PASSED [ 82%]
clipper/settings/test_startup_settings.py::test_the_free_disk_space_is_measured_unless_a_figure_is_reported PASSED [ 83%]
clipper/settings/test_startup_settings.py::test_the_repository_root_holds_the_service_folder PASSED [ 83%]
clipper/settings/test_startup_settings.py::test_the_search_path_is_the_path_of_the_environment PASSED [ 83%]
clipper/settings/test_startup_settings.py::test_a_setting_given_by_name_wins_over_the_environment PASSED [ 84%]
clipper/settings/test_startup_settings.py::test_environment_variables_replace_the_defaults PASSED [ 84%]
clipper/storage/test_data_folder.py::test_opening_creates_the_folder_and_its_parents PASSED [ 85%]
clipper/storage/test_data_folder.py::test_the_database_file_sits_inside_the_folder PASSED [ 85%]
clipper/storage/test_data_folder.py::test_each_project_has_a_folder_of_its_own_under_projects PASSED [ 86%]
clipper/storage/test_data_folder.py::test_opening_an_existing_folder_keeps_what_it_holds PASSED [ 86%]
clipper/storage/test_open_database.py::test_opening_creates_the_database_file_in_wal_mode PASSED [ 87%]
clipper/storage/test_open_database.py::test_a_new_database_holds_the_project_tables_at_the_current_version PASSED [ 87%]
clipper/storage/test_open_database.py::test_the_schema_version_counts_the_migrations_applied PASSED [ 87%]
clipper/storage/test_open_database.py::test_a_later_migration_raises_the_version_and_keeps_the_rows PASSED [ 88%]
clipper/storage/test_open_database.py::test_a_migration_that_fails_leaves_the_version_where_it_was PASSED [ 88%]
clipper/storage/test_open_database.py::test_a_transaction_that_fails_changes_nothing PASSED [ 89%]
clipper/storage/test_read_disk_space.py::test_the_measured_space_is_what_the_system_reports PASSED [ 89%]
clipper/storage/test_read_disk_space.py::test_a_reported_figure_replaces_the_measured_free_space PASSED [ 90%]
clipper/storage/test_read_disk_space.py::test_zero_reported_bytes_is_taken_as_a_full_disk PASSED [ 90%]
clipper/storage/test_read_disk_space.py::test_space_is_given_in_gigabytes PASSED [ 91%]
clipper/test_fixture_server.py::test_the_fixture_build_writes_the_talk_video PASSED [ 91%]
clipper/test_fixture_server.py::test_the_server_sends_the_whole_file PASSED [ 91%]
clipper/test_fixture_server.py::test_the_server_honours_a_byte_range PASSED [ 92%]
clipper/test_fixture_server.py::test_the_server_honours_an_open_ended_range PASSED [ 92%]
clipper/test_fixture_server.py::test_a_range_past_the_end_is_refused PASSED [ 93%]
clipper/test_fixture_server.py::test_the_slow_address_takes_about_six_seconds PASSED [ 93%]
clipper/test_fixture_server.py::test_the_missing_address_answers_not_found PASSED [ 94%]
clipper/test_fixture_server.py::test_the_repairable_address_is_missing_until_repaired PASSED [ 94%]
clipper/test_main.py::test_health_answers_once_the_service_is_up PASSED  [ 95%]
clipper/test_main.py::test_starting_creates_the_data_folder_and_its_database PASSED [ 95%]
clipper/test_main.py::test_starting_without_the_media_tools_fails_before_anything_is_created PASSED [ 95%]
clipper/test_main.py::test_a_project_interrupted_by_a_restart_is_finished_after_the_start PASSED [ 96%]
clipper/test_main.py::test_the_queue_does_not_run_before_the_service_has_started PASSED [ 96%]
clipper/test_main.py::test_no_documentation_page_is_served[/docs] PASSED [ 97%]
clipper/test_main.py::test_no_documentation_page_is_served[/redoc] PASSED [ 97%]
clipper/test_main.py::test_no_documentation_page_is_served[/openapi.json] PASSED [ 98%]
clipper/test_main.py::test_fastapi_starts_with_its_telemetry_switched_off[tracing] PASSED [ 98%]
clipper/test_main.py::test_fastapi_starts_with_its_telemetry_switched_off[metrics] PASSED [ 99%]
clipper/test_main.py::test_fastapi_starts_with_its_telemetry_switched_off[logs] PASSED [ 99%]
clipper/test_main.py::test_fastapi_starts_with_its_telemetry_switched_off[auto_configure] PASSED [100%]

======================== 224 passed in 98.61s (0:01:38) ========================
[exit code of the block: 0]
```

Result: pass

## V24 — The web app's rules, by test name (R13, A22)

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: the three problems of a draft; lengths in seconds, minutes and hours; a file cut into 8 MiB parts, sent in order and carried on from the count the service holds.

```
 RUN  v5.0.3 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/web

 ✓ src/project/open-project/lib/project-addresses.test.ts > project addresses > gives every project an address of its own 1ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > project addresses > gives every tab of a project an address of its own 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > project addresses > lists the tabs in the order Review, Export, Results 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the tabs of a ready project 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the tabs of a exported project 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the status screen of a uploading project 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the status screen of a queued project 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the status screen of a processing project 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the status screen of a failed project 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the status screen of a stopped project 0ms
 ✓ src/project/open-project/lib/project-addresses.test.ts > hasTabs > shows the status screen of a fetched project 0ms
 ✓ src/shell/show-toast/lib/toast-store.test.ts > the toast store > shows a message and hides it after three and a half seconds 2ms
 ✓ src/shell/show-toast/lib/toast-store.test.ts > the toast store > replaces the message and restarts the time when another toast arrives 1ms
 ✓ src/shell/show-toast/lib/toast-store.test.ts > the toast store > tells its watchers when a message appears and when it goes 1ms
 ✓ src/library/list-projects/lib/projects-store.test.ts > the projects store > holds nothing and asks nothing until a component reads it 2ms
 ✓ src/library/list-projects/lib/projects-store.test.ts > the projects store > asks at once and then once a second, however many components read it 2ms
 ✓ src/library/list-projects/lib/projects-store.test.ts > the projects store > stops asking when the last component stops reading 1ms
 ✓ src/library/list-projects/lib/projects-store.test.ts > the projects store > does not ask while the page is hidden and asks at once when it shows again 1ms
 ✓ src/library/list-projects/lib/projects-store.test.ts > the projects store > tells its readers only when the answer changes 2ms
 ✓ src/library/list-projects/lib/projects-store.test.ts > the projects store > keeps what it has when the tool does not answer, and recovers 1ms
 ✓ src/library/list-projects/lib/projects-store.test.ts > the projects store > does not ask again while an answer is still on its way 2ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > finds nothing wrong with a full link and a platform 2ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > finds nothing wrong with a chosen file and a platform 1ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for the full link when it is "" 1ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for the full link when it is "   " 1ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for the full link when it is "youtube.com/watch?v=abc123" 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for the full link when it is "https://nodots" 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for the full link when it is "not a link" 1ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > accepts a link with spaces around it 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for a file when none was chosen 1ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for a platform when every one is off 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > reports the source before the platforms when both are wrong 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findInvalidFieldId > points at the link field for a problem with a link 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findInvalidFieldId > points at the file field for a problem with a file 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findInvalidFieldId > points at the first platform switch for a problem with the platforms 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findInvalidFieldId > points nowhere when the draft has no problem 0ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > asks under the /api prefix and returns the parsed answer 13ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > sends a JSON body with its content type 1ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > sends a raw body untouched 1ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > returns null for an empty answer 2ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > throws the status and the body when the service refuses 2ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > keeps an answer that is not JSON as text 1ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > reports an unreachable service by name 1ms
 ✓ src/shared/lib/request-json.test.ts > requestJson > lets a cancelled request end as cancelled 1ms
 ✓ src/library/upload-video/lib/uploads-store.test.ts > the uploads store > tells a screen how many bytes of a project have gone, and forgets it when all have 9ms
 ✓ src/library/upload-video/lib/uploads-store.test.ts > the uploads store > keeps the upload listed until the Library has been asked for the new state 1ms
 ✓ src/library/upload-video/lib/uploads-store.test.ts > the uploads store > sends each part to the project it belongs to 6ms
 ✓ src/library/upload-video/lib/uploads-store.test.ts > the uploads store > follows two uploads at once 9ms
 ✓ src/library/upload-video/lib/uploads-store.test.ts > the uploads store > says the upload stopped when a part keeps failing 11ms
 ✓ src/library/upload-video/lib/uploads-store.test.ts > the uploads store > ends the upload of a deleted project without a word 2ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > cuts a file into 8 MiB parts and sends them in order 12ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > sends a file smaller than one part in a single request 3ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > carries on from the count the service holds when a part arrives out of step 16ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > sends a part again from the same count when the tool does not answer 8ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > stops after a part has failed and been sent again three times 9ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > counts the failures of each part on their own 4ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > ends as sent when the service has the whole file but its answer was lost 1ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > ends quietly when the project was deleted 7ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the bar and the step label while a link is fetched 1ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the bar and the step label while a file uploads 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the bar and Fetched for a project that rests after its first step 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows a note for a queued project 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows a note for a failed project 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows a note for a stopped project 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > findCurrentStep > is the first step that has not finished 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under a minute in seconds: 0.4 1ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under a minute in seconds: 7 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under a minute in seconds: 45.4 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under a minute in seconds: 59.4 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under an hour in minutes: 59.6 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under an hour in minutes: 60 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under an hour in minutes: 235.6 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under an hour in minutes: 1930 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under an hour in minutes: 3569 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length of an hour or more in hours and minutes: 3571 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length of an hour or more in hours and minutes: 3600 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length of an hour or more in hours and minutes: 4360 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length of an hour or more in hours and minutes: 10800 0ms
 ✓ src/shared/lib/read-problem.test.ts > readProblem > reads the section and the message the service refused with 1ms
 ✓ src/shared/lib/read-problem.test.ts > readProblem > reads a problem that belongs to no section 0ms
 ✓ src/shared/lib/read-problem.test.ts > readProblem > says the tool did not answer for an answer without a problem 0ms
 ✓ src/shared/lib/read-problem.test.ts > readProblem > says the tool did not answer for a problem without a message 0ms
 ✓ src/shared/lib/read-problem.test.ts > readProblem > says the tool did not answer for a tool that does not answer 0ms
 ✓ src/shared/lib/read-problem.test.ts > readProblem > says the tool did not answer for an error of another kind 0ms
 ✓ src/shell/present-menu/lib/place-menu.test.ts > placeMenu > opens below a control in the top half, aligned to its right edge on the right side 1ms
 ✓ src/shell/present-menu/lib/place-menu.test.ts > placeMenu > aligns to the left edge of a control on the left side 0ms
 ✓ src/shell/present-menu/lib/place-menu.test.ts > placeMenu > opens above a control in the bottom half 0ms
 ✓ src/shell/present-menu/lib/place-menu.test.ts > placeMenu > keeps a margin to the right edge of the window 0ms
 ✓ src/shell/present-menu/lib/place-menu.test.ts > placeMenu > keeps a margin to the left edge of the window 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatTimecode > gives 0 seconds as hours, minutes and seconds 1ms
 ✓ src/shared/lib/format-timecode.test.ts > formatTimecode > gives 59.9 seconds as hours, minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatTimecode > gives 236 seconds as hours, minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatTimecode > gives 235.6 seconds as hours, minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatTimecode > gives 3600 seconds as hours, minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatTimecode > gives 4360 seconds as hours, minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatTimecode > gives 10800 seconds as hours, minutes and seconds 0ms
 ✓ src/shell/frame-screens/lib/describe-transition.test.ts > describeTransition > does not animate the first screen 1ms
 ✓ src/shell/frame-screens/lib/describe-transition.test.ts > describeTransition > does not animate a screen that stays 0ms
 ✓ src/shell/frame-screens/lib/describe-transition.test.ts > describeTransition > swaps between screens of the same depth 0ms
 ✓ src/shell/frame-screens/lib/describe-transition.test.ts > describeTransition > pushes a deeper screen 0ms
 ✓ src/shell/frame-screens/lib/describe-transition.test.ts > describeTransition > pops back to a shallower screen 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > the setting options > offers the four Claude models for each pass, stored under their identifiers 1ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > the setting options > offers the three Whisper models 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > the setting options > offers the lengths, the clip counts and the retention periods of the prototype 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > the setting options > labels every row as the prototype does 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > the setting options > shows the defaults under the labels the prototype starts with 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > the setting options > names the four reasons a clip can be rejected for 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > describeDiskUse > gives the used share of the disk in percent 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > describeDiskUse > is empty for a disk whose size is not known 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > tells the browser that sends an upload to keep the page open 1ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > tells a browser that does not send the upload what to do about it 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > shows the step of a processing project and offers Stop 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > names the project a waiting one waits for 1ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > says a waiting project starts in a moment when nothing is processed 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > gives the reason of a failed project and offers Retry 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > gives the reason of a stopped project and offers Resume 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > names what has not started for a project that rests after its first step 0ms

 Test Files  15 passed (15)
      Tests  117 passed (117)
   Start at  21:24:46
   Duration  578ms (transform 53%, import 27%, tests 15%, worker 5%)

[exit code: 0]
```

Result: pass

## V25 — The web app forwards through rewrites, has no proxy or middleware file, and holds no database (R2, R8)

Check: block V25

Expected: `find` prints nothing. The first `grep` shows the rewrites in the configuration. The second `grep` prints nothing.

`find` and the second `grep` printed nothing. The block's exit code is that of the second `grep`, which found no line.

```
+ find web -path '*/node_modules' -prune -o -path 'web/.next*' -prune -o '(' -name 'proxy.*' -o -name 'middleware.*' ')' -print
+ grep -n rewrites web/next.config.ts
11:  rewrites: async () => [
+ grep -rniE sqlite web/src web/package.json
[exit code of the block: 1]
```

Result: pass

## V26 — The design is the prototype's: tokens and stylesheets unchanged (R4, A31)

Check: block V26

Expected: Five lines ending `identical` and the line `tokens identical`. The list of stylesheets holds those five, `tokens.css` and at most one more, whose content is pasted into the proof.

```
base.css identical
controls.css identical
lists.css identical
shell.css identical
pages.css identical
tokens identical
web/src/shared/styles/app.css
web/src/shared/styles/base.css
web/src/shared/styles/controls.css
web/src/shared/styles/lists.css
web/src/shared/styles/pages.css
web/src/shared/styles/shell.css
web/src/shared/styles/tokens.css
[exit code of the block: 0]
```

The one stylesheet beyond the six is `web/src/shared/styles/app.css`:

```css
/* The rules the real app needs beyond the prototype's stylesheets. */

/* A button that is switched off. */
.button:disabled {
  color: var(--label-3);
  cursor: default;
}

/* Links that wear the classes of the prototype's buttons. */
a.bar-button,
a.button,
a.tab-bar__tab,
a.sidebar__new,
a.sidebar__link,
a.project-row,
a.segmented__option {
  text-decoration: none;
}

a.sidebar__link,
a.project-row {
  color: inherit;
}

a.segmented__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

a.segmented__option[aria-current="page"],
a.segmented__option[aria-current="page"]:hover,
a.segmented__option[aria-current="page"]:active {
  background: var(--segment);
  box-shadow: 0 0 0 0.5px var(--glass-rim), 0 1px 4px var(--shadow);
  font-weight: 600;
}

/* A hint longer than its field ends in an ellipsis. */
.row__field:placeholder-shown {
  text-overflow: ellipsis;
}

/* A choice shows its chosen option as text that can wrap, with the select lying over it unseen. */
.menu-button__chosen {
  min-width: 0;
  padding: 6px max(20px, 1.2em) 6px 6px;
  text-align: right;
  overflow-wrap: anywhere;
}

.menu-button__chosen ~ select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  opacity: 0;
}

.menu-button:has(select:focus-visible) {
  border-radius: 8px;
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

/* A choice moves under its label when the two do not fit side by side. */
label.row {
  flex-wrap: wrap;
}

label.row .menu-button {
  margin-left: auto;
}

/* With large text, every control that does not fit beside its label moves under it. */
.group {
  container-type: inline-size;
}

@container (max-width: 18rem) {
  .row {
    flex-wrap: wrap;
  }

  .row > .row__label ~ :last-child {
    margin-left: auto;
  }
}
```

Result: pass

## V27 — No CSS framework or component library; every version pinned; yt-dlp is a project dependency (R4, R8)

Check: block V27

Expected: The first line reads `next react react-dom`. Then `every version exact`, then `every requirement pinned`, then the pinned lines for yt-dlp, fastapi and uvicorn.

```
next react react-dom
every version exact
every requirement pinned
fastapi==0.142.2
uvicorn==0.54.0
yt-dlp==2026.8.19
yt-dlp-ejs==0.8.0
[exit code of the block: 0]
```

Result: pass

## V28 — Libraries built into the app carry permissive licences (R58)

Check: block V28

Expected: Every licence shown is MIT, ISC, BSD, 0BSD, Apache-2.0, PSF, Unlicense or CC-BY-4.0. None is GPL, LGPL, AGPL or MPL.

```
┌────────────────────────────────────┬──────────────┐
│ Package                            │ License      │
├────────────────────────────────────┼──────────────┤
│ tslib                              │ 0BSD         │
├────────────────────────────────────┼──────────────┤
│ @playwright/test                   │ Apache-2.0   │
├────────────────────────────────────┼──────────────┤
│ @swc/helpers                       │ Apache-2.0   │
├────────────────────────────────────┼──────────────┤
│ baseline-browser-mapping           │ Apache-2.0   │
├────────────────────────────────────┼──────────────┤
│ playwright                         │ Apache-2.0   │
├────────────────────────────────────┼──────────────┤
│ playwright-core                    │ Apache-2.0   │
├────────────────────────────────────┼──────────────┤
│ source-map-js                      │ BSD-3-Clause │
├────────────────────────────────────┼──────────────┤
│ caniuse-lite                       │ CC-BY-4.0    │
├────────────────────────────────────┼──────────────┤
│ electron-to-chromium               │ ISC          │
├────────────────────────────────────┼──────────────┤
│ lru-cache                          │ ISC          │
├────────────────────────────────────┼──────────────┤
│ picocolors                         │ ISC          │
├────────────────────────────────────┼──────────────┤
│ semver                             │ ISC          │
├────────────────────────────────────┼──────────────┤
│ yallist                            │ ISC          │
├────────────────────────────────────┼──────────────┤
│ @babel/code-frame                  │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/compat-data                 │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/core                        │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/generator                   │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helper-compilation-targets  │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helper-globals              │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helper-module-imports       │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helper-module-transforms    │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helper-string-parser        │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helper-validator-identifier │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helper-validator-option     │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/helpers                     │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/parser                      │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/template                    │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/traverse                    │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @babel/types                       │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @jridgewell/gen-mapping            │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @jridgewell/remapping              │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @jridgewell/resolve-uri            │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @jridgewell/sourcemap-codec        │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @jridgewell/trace-mapping          │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @next/env                          │ MIT          │
├────────────────────────────────────┼──────────────┤
│ @next/swc-darwin-arm64             │ MIT          │
├────────────────────────────────────┼──────────────┤
│ browserslist                       │ MIT          │
├────────────────────────────────────┼──────────────┤
│ client-only                        │ MIT          │
├────────────────────────────────────┼──────────────┤
│ convert-source-map                 │ MIT          │
├────────────────────────────────────┼──────────────┤
│ debug                              │ MIT          │
├────────────────────────────────────┼──────────────┤
│ escalade                           │ MIT          │
├────────────────────────────────────┼──────────────┤
│ gensync                            │ MIT          │
├────────────────────────────────────┼──────────────┤
│ js-tokens                          │ MIT          │
├────────────────────────────────────┼──────────────┤
│ jsesc                              │ MIT          │
├────────────────────────────────────┼──────────────┤
│ json5                              │ MIT          │
├────────────────────────────────────┼──────────────┤
│ ms                                 │ MIT          │
├────────────────────────────────────┼──────────────┤
│ nanoid                             │ MIT          │
├────────────────────────────────────┼──────────────┤
│ next                               │ MIT          │
├────────────────────────────────────┼──────────────┤
│ node-releases                      │ MIT          │
├────────────────────────────────────┼──────────────┤
│ postcss                            │ MIT          │
├────────────────────────────────────┼──────────────┤
│ react                              │ MIT          │
├────────────────────────────────────┼──────────────┤
│ react-dom                          │ MIT          │
├────────────────────────────────────┼──────────────┤
│ scheduler                          │ MIT          │
├────────────────────────────────────┼──────────────┤
│ styled-jsx                         │ MIT          │
├────────────────────────────────────┼──────────────┤
│ update-browserslist-db             │ MIT          │
└────────────────────────────────────┴──────────────┘
annotated-doc | MIT
annotated-types | MIT
anyio | MIT
click | BSD-3-Clause
fastapi | MIT
h11 | MIT
idna | BSD-3-Clause
opentelemetry-api | Apache-2.0
pydantic | MIT
pydantic-settings | MIT
pydantic_core | MIT
python-dotenv | BSD-3-Clause
starlette | BSD-3-Clause
typing-inspection | MIT
typing_extensions | PSF-2.0
uvicorn | BSD-3-Clause
yt-dlp | Unlicense
yt-dlp-ejs | Unlicense AND MIT AND ISC
[exit code of the block: 0]
```

Result: pass

## V29 — This milestone's commits touch nothing the boundaries exclude (R11, R55, R56)

Check: block V29

Expected: `data` is ignored. No video, audio, database or model file is tracked. No key is tracked. `fixtures` is under 20,480 KB. The diff against `.researches` and `docs/prototype` is empty. The app reads nothing from `docs/`.

```
+ git check-ignore -v data
.gitignore:1:/data	data
+ git ls-files
+ grep -iE '\.(mp4|mov|mkv|webm|m4v|avi|wav|aiff|mp3|m4a|sqlite|sqlite3|db|safetensors|npz|pt|gguf|onnx|bin)$'
+ echo 'no video, audio, database or model file is tracked'
no video, audio, database or model file is tracked
+ git grep -nE 'sk-ant-[A-Za-z0-9_-]{20,}'
+ echo 'no key is tracked'
no key is tracked
+ du -sk fixtures
8	fixtures
+ git diff --stat 82df5ce HEAD -- .researches docs/prototype
+ grep -rnE 'docs/(prototype|missions)' web/src web/next.config.ts service/clipper scripts
+ echo 'the app reads nothing from docs/'
the app reads nothing from docs/
[exit code of the block: 0]
```

Result: pass

## V30 — The README and the agents' instructions name the commands (R9, A18)

Check: block V30

Expected: `README.md` and `AGENTS.md` each name `pnpm install`, `pnpm bootstrap`, `pnpm start` and `pnpm test`. `CLAUDE.md` is `@AGENTS.md`. The README has the phone instructions.

```
+ grep -nE 'pnpm (install|bootstrap|start|test)' README.md AGENTS.md
README.md:24:pnpm install
README.md:25:pnpm bootstrap
README.md:28:`pnpm install` installs the web app's packages. It warns that it ignored the build script of
README.md:29:`unrs-resolver`; that is intended. `pnpm bootstrap` creates a Python environment in
README.md:36:pnpm start
README.md:60:pnpm test
README.md:68:pnpm test:browser e2e/start-command.spec.ts
README.md:92:CLIPPER_WEB_PORT=3001 pnpm start
AGENTS.md:10:- `pnpm install` installs the web app's packages.
AGENTS.md:11:- `pnpm bootstrap` creates the Python environment in `service/.venv` with
AGENTS.md:14:- `pnpm start` starts the service on `127.0.0.1:8765` and the web app on port 3000, then prints
AGENTS.md:19:- `pnpm test` runs every check: Ruff, mypy, pytest, ESLint, the web build, the TypeScript check,
AGENTS.md:22:- `pnpm test:browser <file>` runs the named browser tests alone, for example
AGENTS.md:23:  `pnpm test:browser e2e/start-command.spec.ts`. Paths are relative to `web`.
AGENTS.md:25:  a commit; `pnpm test` checks the Ruff rules and not the formatting.
+ cat CLAUDE.md
@AGENTS.md
+ grep -niE 'phone|wi-fi' README.md
5:on the Mac or on a phone on the same Wi-Fi.
49:## Open it on a phone
51:Put the phone on the same Wi-Fi as the Mac. In Clipper on the Mac, open Settings and read the
52:address under "Open on Your Phone". It is the Mac's address on your network with the web port, in
53:the form `http://192.168.0.12:3000`. Type it into the phone's browser.
[exit code of the block: 0]
```

Result: pass

## V31 — The code follows the standards the hooks enforce, and both layouts are recorded (A19)

Check: block V31

Expected: Every finding printed carries `[advisory]`; none appears without it. Both structure files exist, the web one begins `follows: screaming-architecture`, and neither has a line starting with `#`.

```
Total hook-level violations: 0
follows: screaming-architecture
layout: |
  src/
    app/                  routes only
    shared/
      styles/
      ui/
      lib/
    shell/
      frame-screens/
      present-sheet/
      present-menu/
      show-toast/
    library/
      list-projects/
      create-project/
      upload-video/
    project/
      open-project/
      follow-progress/
      delete-project/
    settings/
      change-settings/
  e2e/                    browser tests
    support/
follows: fastapi
layout: |
  clipper/
    main.py
    __main__.py
    problems/
    settings/
    storage/
    media/
    projects/
    pipeline/
    fetching/
[exit code of the block: 0]
```

The review read 252 files and reported each as clean. The one line it printed besides is the count of findings, which is 0.

Result: pass

## V32 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

Run after every other check and before this file was written.

```
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/project-1360-dark.png
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/project-1360-light.png
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/project-390-dark.png
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/project-390-light.png
[exit code: 0]
```

Result: pass
