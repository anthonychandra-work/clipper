# Proof: m2-transcripts-made-on-the-mac

Attempt: 1
Result: pass
Commit: c5c6e25

| id | result |
| -- | ------ |
| V1 | pass |
| V2 | pass |
| V3 | pass |
| V4 | pass |
| V5 | pass |
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

Lines in square brackets are markers the validator added. Lines that begin with `+` after
such a marker are `bash -x` naming the command it is about to run. Every other line is
printed by the commands. The checks were run from the worktree's root in the order of the
table, at c5c6e25 with nothing uncommitted before V1, on 2026-10-06 from 00:11 to 00:42. The
blocks were run with `bash`, as written. The Mac was on a network and did not sleep during
the run.

## V1 — Setup installs the pinned packages inside the project, mlx-whisper among them and without the two left out, and puts the test model in the project's cache (A2, A39, A41, R8, R23, R59)

Check: block V1

Expected: Both commands exit 0. `pip` lists `mlx-whisper 0.4.3`. The next line reads that torch, requests and certifi are not installed. The cache folder holds `config.json` and a `weights.npz` of 74,418,182 bytes.

The block was run with each command's exit code traced.

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

Done in 268ms using pnpm v10.13.1
[exit code of the command before: 0] + pnpm bootstrap

> clipper@0.1.0 bootstrap /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/bootstrap-project.mjs

Installing the pinned Python packages
[48 lines reading "Requirement already satisfied" left out]
Installing the browser the tests drive into .cache/playwright
Fetching the model the tests transcribe with into .cache/whisper
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/.cache/whisper/tiny
Clipper is set up. Start it with "pnpm start".
[exit code of the command before: 0] + service/.venv/bin/python -m pip --disable-pip-version-check list
[exit code of the command before: 0] + grep -iE '^(mlx-whisper|mlx|numpy) '
mlx               0.32.3
mlx-whisper       0.4.3
numpy             2.5.3
[exit code of the command before: 0] + service/.venv/bin/python -m pip --disable-pip-version-check list
[exit code of the command before: 0] + grep -iE '^(torch|requests|certifi) '
[exit code of the command before: 1] + echo 'torch, requests and certifi are not installed'
torch, requests and certifi are not installed
[exit code of the command before: 0] + ls -l .cache/whisper/tiny
total 165800
-rw-r--r--  1 work  staff       262 Oct  5 22:21 config.json
-rw-r--r--  1 work  staff  74418182 Oct  5 22:21 weights.npz
```

Result: pass

## V2 — "The test command passes"; one command runs every check (R9, R12)

Check: `pnpm test`

Expected: Exit 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `365b2dc`, and only documents changed before this milestone's first commit, so no gate may fail.

Ports 3100, 8865, 3101 and 8866 had no listener before the command. The whole output is below and in `evidence/v2-test-command.txt`.

```

> clipper@0.1.0 test /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-tests.mjs


--- Fixtures
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sNfEnC/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sNfEnC/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sNfEnC/fixtures/long-talk.mp4
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/.cache/whisper/tiny

--- Ruff
All checks passed!

--- mypy
Success: no issues found in 94 source files

--- pytest
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collected 312 items

clipper/fetching/test_download_link.py ..........                        [  3%]
clipper/fetching/test_fetch_stage.py ........                            [  5%]
clipper/media/test_extract_audio.py .....                                [  7%]
clipper/media/test_locate_media_tools.py ........                        [  9%]
clipper/media/test_make_preview_copy.py .......                          [ 12%]
clipper/media/test_probe_video.py ......                                 [ 14%]
clipper/media/test_run_media_tool.py ....                                [ 15%]
clipper/pipeline/test_explain_failure.py ........                        [ 17%]
clipper/pipeline/test_halt_project.py ......                             [ 19%]
clipper/pipeline/test_recover_interrupted.py ....                        [ 21%]
clipper/pipeline/test_requeue_rested.py ....                             [ 22%]
clipper/pipeline/test_router.py ..........                               [ 25%]
clipper/pipeline/test_run_queue.py ............                          [ 29%]
clipper/problems/test_handle_app_errors.py .....                         [ 31%]
clipper/projects/test_create_project.py .......................          [ 38%]
clipper/projects/test_delete_project.py .....                            [ 40%]
clipper/projects/test_project.py ......                                  [ 41%]
clipper/projects/test_project_queue.py .............                     [ 46%]
clipper/projects/test_project_repository.py .........                    [ 49%]
clipper/projects/test_receive_upload.py ...............                  [ 53%]
clipper/projects/test_router.py ....................                     [ 60%]
clipper/settings/test_describe_machine.py ...                            [ 61%]
clipper/settings/test_preference_store.py ........                       [ 63%]
clipper/settings/test_router.py ..............                           [ 68%]
clipper/settings/test_startup_settings.py .......                        [ 70%]
clipper/storage/test_data_folder.py ......                               [ 72%]
clipper/storage/test_open_database.py .......                            [ 74%]
clipper/storage/test_read_disk_space.py ....                             [ 75%]
clipper/test_fixture_server.py ........                                  [ 78%]
clipper/test_main.py .............                                       [ 82%]
clipper/transcription/test_built_fixtures.py ...                         [ 83%]
clipper/transcription/test_download_model.py .....                       [ 85%]
clipper/transcription/test_model_stage.py ......                         [ 87%]
clipper/transcription/test_run_transcriber.py ....                       [ 88%]
clipper/transcription/test_transcribe_audio.py ..........                [ 91%]
clipper/transcription/test_transcribe_stage.py .....                     [ 93%]
clipper/transcription/test_transcript.py .........                       [ 96%]
clipper/transcription/test_transcript_store.py ....                      [ 97%]
clipper/transcription/test_whisper_models.py .....                       [ 99%]
clipper/transcription/test_whole_app.py ...                              [100%]

======================= 312 passed in 185.61s (0:03:05) ========================

--- ESLint

--- Web build
▲ Next.js 16.3.8 (Turbopack)
✓ Running next.config.ts took 61ms

  Creating an optimized production build ...
✓ Compiled successfully in 399ms
  Running TypeScript ...
  Finished TypeScript in 1217ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/5) ...
  Generating static pages using 7 workers (1/5) 
  Generating static pages using 7 workers (2/5) 
  Generating static pages using 7 workers (3/5) 
✓ Generating static pages using 7 workers (5/5) in 104ms
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
      Tests  130 passed (130)
   Start at  00:15:28
   Duration  798ms (transform 53%, import 25%, tests 16%, worker 6%)


--- Playwright

Running 82 tests using 1 worker

  ✓   1 e2e/addresses.spec.ts:24:3 › at 390 px › a project opens at its own address, a reload shows it again, and Back returns to the Library (1.5s)
  ✓   2 e2e/addresses.spec.ts:45:3 › at 390 px › a ready project opens on its Review tab, and each tab has an address that a reload keeps (12.6s)
  ✓   3 e2e/addresses.spec.ts:70:3 › at 390 px › Back and Forward move between the tabs of a ready project (424ms)
  ✓   4 e2e/addresses.spec.ts:93:3 › at 390 px › the tab address of a project that is not ready shows its status screen (598ms)
  ✓   5 e2e/addresses.spec.ts:111:3 › at 1360 px › the tabs sit in the toolbar with the current one pressed (205ms)
  ✓   6 e2e/captures.spec.ts:61:1 › six screens are captured whole at 390 and 1360 px, in light and in dark (18.5s)
  ✓   7 e2e/delete-project.spec.ts:35:3 › at 390 px › the More menu offers Delete Project, and the confirmation names the project (675ms)
  ✓   8 e2e/delete-project.spec.ts:60:3 › at 390 px › Cancel removes neither the row nor the folder, and Delete removes both (25.8s)
  ✓   9 e2e/delete-project.spec.ts:88:3 › at 390 px › deleting a project while it is being fetched stops it and leaves no folder (2.7s)
  ✓  10 e2e/delete-project.spec.ts:114:3 › at 1360 px › the menu opens under the More control, and deleting shows the next project (1.7s)
  ✓  11 e2e/empty-library.spec.ts:13:3 › at 390 px › with no projects the Library shows the empty state, and its control opens the sheet (249ms)
  ✓  12 e2e/empty-library.spec.ts:29:3 › at 390 px › Cancel closes the sheet, returns to the Library and gives focus back to the control (789ms)
  ✓  13 e2e/empty-library.spec.ts:41:3 › at 390 px › Escape and a click outside the sheet both return to the Library (655ms)
  ✓  14 e2e/empty-library.spec.ts:57:3 › at 390 px › the sheet opened at its own address returns to the Library (741ms)
  ✓  15 e2e/empty-library.spec.ts:71:3 › at 1360 px › the empty state fills the main area, and the sidebar control opens the sheet (224ms)
  ✓  16 e2e/empty-library.spec.ts:81:3 › at 1360 px › closing the sheet returns to the screen the user was on (833ms)
  ✓  17 e2e/halt-project.spec.ts:13:1 › a link that answers "not found" shows the reason and Retry, and Retry finishes it once repaired (20.5s)
  ✓  18 e2e/halt-project.spec.ts:38:1 › Stop during a fetch leaves the project stopped, and Resume finishes it (21.3s)
  ✓  19 e2e/import-link.spec.ts:23:1 › a link to the fixture is fetched and transcribed: its bar never falls, then the row rests with the real length (19.1s)
  ✓  20 e2e/import-link.spec.ts:46:1 › Find Clips sends the link, the length, the platforms and the brief the user chose (637ms)
  ✓  21 e2e/import-upload.spec.ts:30:1 › the uploaded fixture is prepared and transcribed: its bar never falls, then the row rests with the real length (14.8s)
  ✓  22 e2e/import-upload.spec.ts:54:1 › a browser that is not sending the file says so on the status screen (185ms)
  ✓  23 e2e/layout.spec.ts:47:3 › at 390 px › the Library is a list above a tab bar at the bottom edge (681ms)
  ✓  24 e2e/layout.spec.ts:65:3 › at 390 px › the new project sheet spans the width and rises from the bottom edge (463ms)
  ✓  25 e2e/layout.spec.ts:78:3 › at 1360 px › the projects are in a sidebar beside the screen (415ms)
  ✓  26 e2e/layout.spec.ts:94:3 › at 1360 px › the new project sheet is centred (472ms)
  ✓  27 e2e/layout.spec.ts:105:1 › the phone layout ends at 719 px and the desktop layout begins at 720 px (887ms)
  ✓  28 e2e/layout.spec.ts:123:1 › the sidebar lies over the content at 999 px and beside it at 1000 px (238ms)
  ✓  29 e2e/library.spec.ts:26:3 › at 390 px › each row shows its title, its source and length, and its status (13.4s)
  ✓  30 e2e/library.spec.ts:48:3 › at 390 px › the Library has a large title, the plus control, the Projects group and the free space (227ms)
  ✓  31 e2e/library.spec.ts:68:3 › at 390 px › a row opens the screen of its project, and the back control returns to the Library (762ms)
  ✓  32 e2e/library.spec.ts:89:3 › at 390 px › the address of a project that does not exist leads to the Library (132ms)
  ✓  33 e2e/library.spec.ts:96:3 › at 390 px › a row follows the progress of its project without a reload (18.4s)
  ✓  34 e2e/library.spec.ts:113:3 › at 1360 px › the projects are in the sidebar and the free space is in its foot (492ms)
  ✓  35 e2e/library.spec.ts:127:3 › at 1360 px › the Library address shows the newest project beside the sidebar, marked in the list (1.6s)
  ✓  36 e2e/low-disk.spec.ts:21:1 › with 3 GB reported free, Find Clips creates nothing and gives the reason under the source (3.5s)
  ✓  37 e2e/missing-ffmpeg.spec.ts:20:1 › the start command stops with a sentence that names the missing media tools (651ms)
  ✓  38 e2e/model-download.spec.ts:62:1 › the first project to need a model that is not on the Mac downloads it as a step of its own, and the next does not (39.3s)
  ✓  39 e2e/new-project-errors.spec.ts:20:1 › the sheet has the sections, the wording and the defaults of the prototype (210ms)
  ✓  40 e2e/new-project-errors.spec.ts:51:1 › the hint follows the chosen length, and the file field names the chosen file (614ms)
  ✓  41 e2e/new-project-errors.spec.ts:67:1 › a link that is not a link shows its error under Source and moves focus to the link field (591ms)
  ✓  42 e2e/new-project-errors.spec.ts:89:1 › a missing file shows its error under Source and moves focus to the file field (574ms)
  ✓  43 e2e/new-project-errors.spec.ts:102:1 › no platform shows its error under Platforms and moves focus to the first switch (742ms)
  ✓  44 e2e/no-speech.spec.ts:44:1 › a silent video cannot finish for want of speech, and Retry runs the transcription again and nothing else (3.3s)
  ✓  45 e2e/own-origin.spec.ts:58:1 › with projects, every request of every screen is addressed to the tool (39.8s)
  ✓  46 e2e/own-origin.spec.ts:78:1 › the empty Library asks nothing outside the tool (1.0s)
  ✓  47 e2e/own-origin.spec.ts:95:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (4.5s)
  ✓  48 e2e/queue-through-tool.spec.ts:19:1 › a second link project waits for the first and then finishes (28.2s)
  ✓  49 e2e/queue-through-tool.spec.ts:36:1 › a project whose fetch is cut off by a stop finishes after the start (19.1s)
  ✓  50 e2e/queue.spec.ts:28:1 › a second project waits while the first is processed, names it, and starts when it finishes (49.2s)
  ✓  51 e2e/queue.spec.ts:52:1 › a file sent while another project is processed arrives in full and then waits its turn (27.7s)
  ✓  52 e2e/restart.spec.ts:25:1 › the uploaded project and the link project are listed in the same state after a stop and a start (22.6s)
  ✓  53 e2e/settings.spec.ts:47:3 › at 390 px › Settings has the five groups of the prototype with their rows and footers (203ms)
  ✓  54 e2e/settings.spec.ts:82:3 › at 390 px › the choices start at the defaults, and each one is kept after a reload (280ms)
  ✓  55 e2e/settings.spec.ts:108:3 › at 390 px › the storage row gives the free and the total space with a bar (161ms)
  ✓  56 e2e/settings.spec.ts:120:3 › at 1360 px › the phone row gives the address of this Mac with the web port, and Copy copies it (234ms)
  ✓  57 e2e/settings.spec.ts:133:3 › at 1360 px › the tool answers at the phone address (163ms)
  ✓  58 e2e/shell.spec.ts:9:1 › the page is the loading line before the width of the window is known (5ms)
  ✓  59 e2e/shell.spec.ts:19:3 › at 1360 px › the sidebar is docked with the app name, its toggle, New Project and Settings (127ms)
  ✓  60 e2e/shell.spec.ts:31:3 › at 1360 px › the toolbar carries the title of the screen (186ms)
  ✓  61 e2e/shell.spec.ts:43:3 › at 1360 px › the toggle hides the sidebar and the toolbar offers to show it again (175ms)
  ✓  62 e2e/shell.spec.ts:53:3 › at 1360 px › the sheet, the menu layer and the toast follow the app as its later siblings (114ms)
  ✓  63 e2e/shell.spec.ts:65:3 › at 860 px › the sidebar lies over the content with its scrim, and Escape closes it (170ms)
  ✓  64 e2e/shell.spec.ts:80:3 › at 860 px › a click on the scrim closes the sidebar, and so does going to another screen (267ms)
  ✓  65 e2e/shell.spec.ts:97:3 › at 390 px › the tab bar holds Library and Settings with the current one marked (199ms)
  ✓  66 e2e/shell.spec.ts:111:3 › at 390 px › the large title moves into the bar when the screen is scrolled (444ms)
  ✓  67 e2e/shell.spec.ts:127:1 › light and dark follow the system (107ms)
  ✓  68 e2e/start-command.spec.ts:14:1 › the tool opens at the address the start command prints (112ms)
  ✓  69 e2e/start-command.spec.ts:23:1 › the service answers through the web port (5ms)
  ✓  70 e2e/start-command.spec.ts:30:1 › the web port is open on the network address and the service port is closed there (5ms)
  ✓  71 e2e/start-command.spec.ts:40:1 › every request of the page goes to the address of the tool (2.1s)
  ✓  72 e2e/stop-order.spec.ts:11:1 › the service stops listening before the web app when the tool is stopped (1.1s)
  ✓  73 e2e/text-size.spec.ts:68:1 › the measure finds a block that is too wide, a cut label, a spilled label and a cut choice (187ms)
  ✓  74 e2e/text-size.spec.ts:86:1 › with projects, every screen fits at the normal size and at 200% (22.9s)
  ✓  75 e2e/text-size.spec.ts:104:1 › the empty Library fits at the normal size and at 200% (204ms)
  ✓  76 e2e/text-size.spec.ts:119:3 › with 3 GB reported free › the low disk error fits at the normal size and at 200% (3.7s)
  ✓  77 e2e/transcribe-restart.spec.ts:22:1 › the tool stopped during a transcription and started again lists one project, which is transcribed (39.3s)
  ✓  78 e2e/transcribe.spec.ts:54:1 › the uploaded talk reaches Transcribed, and its stored words are timed in order and match the script (12.0s)
  ✓  79 e2e/transcribe.spec.ts:77:1 › the long talk shows its transcription in the Library with a rising bar, stops without a transcript, and resumes (39.8s)
  ✓  80 e2e/upload-parts.spec.ts:14:1 › a 50 MiB file sent in 8 MiB parts through the web port is stored whole (268ms)
  ✓  81 e2e/upload-parts.spec.ts:33:1 › a part sent at another offset is answered with the count the service holds (17ms)
  ✓  82 e2e/upload-size.spec.ts:31:1 › a 50 MiB upload shows its progress and arrives at the size and checksum it was sent with (7.1s)

  82 passed (9.3m)

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
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sNfEnC
Test data size: 0.21 GB (210.3 MB)
The test data folder was removed.
[exit code of pnpm test: 0]
```

Result: pass

## V3 — Test data is removed and no tracked file changes (R56)

Check: block V3

Expected: `ls` reports that the folder does not exist. `git status` prints nothing.

The folder is the one V2's closing lines named, `/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sNfEnC`.

```
[exit code of the command before: 0] + ls /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sNfEnC
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sNfEnC: No such file or directory
[exit code of the command before: 1] + git status --porcelain
[exit code of the last command: 0]
```

Result: pass

## V4 — "The fixture project reaches the transcribed state"; the stage shows its progress in the Library and can be stopped and resumed (R15, R18, R23)

Check: block V4

Expected: The exit code is 0. The passed tests show: the uploaded talk reaches "Transcribed"; while the long talk is transcribed its Library row reads "Transcribing on this Mac" over two or more rising bar values; Stop leaves "Stopped" with a reason that names that step, and Resume ends at "Transcribed". `ls` shows `talk-transcript.json` in the evidence folder.

What the two passed tests assert, in `web/e2e/transcribe.spec.ts`: the status card of the uploaded talk is headed "Transcribed" (line 61); the Library row of the long talk reads "Transcribing on this Mac" (line 87) over three bar values, each greater than the one before (lines 88 and 100); after Stop the card is headed "Stopped" with the reason "Stopped at “Transcribing on this Mac”. The stages before it are kept." (lines 94 and 102); after Resume it is headed "Transcribed" (line 98).

The run rewrote `evidence/talk-transcript.json`. It differs from the committed copy in one line: `durationSeconds` reads 235.7 where the committed copy read 235.633333.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/transcribe.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-pDVdXx/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-pDVdXx/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-pDVdXx/fixtures/long-talk.mp4
  ✓  1 e2e/transcribe.spec.ts:54:1 › the uploaded talk reaches Transcribed, and its stored words are timed in order and match the script (21.3s)
  ✓  2 e2e/transcribe.spec.ts:77:1 › the long talk shows its transcription in the Library with a rising bar, stops without a transcript, and resumes (41.9s)

  2 passed (1.5m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-pDVdXx
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
exit code of the browser tests: 0
total 112
-rw-r--r--  1 work  staff  55204 Oct  6 00:25 talk-transcript.json
[exit code of the block: 0]
```

Result: pass

## V5 — "Every word in the stored transcript has a start and an end, the times never go backwards, and all of them fall inside the video's length" (R23, A44)

Check: block V5

Expected: `status: transcribed`. A language. More than 500 words. `0` words without a start and an end, `0` times that go backwards, `0` times outside the video. The last word ends before the video does.

```
status: transcribed
language: en
words: 628
words without a start and an end: 0
times that go backwards: 0
times outside the video: 0
the last word ends at 234.56 of 235.7 seconds
[exit code of the block: 0]
```

Result: pass

## V6 — "The transcript matches the fixture's script with at most 15 words wrong in every 100" (R12)

Check: block V6

Expected: The script has 628 words. The last line gives a figure of 15.00 or less.

```
words in the script: 628
words in the transcript: 628
words wrong: 3
words wrong in every 100: 0.48
[exit code of the block: 0]
```

Result: pass

## V7 — "A silent fixture fails the stage with the reason from D16, and Retry reruns that stage alone" (R17, R25, A45)

Check: `pnpm test:browser e2e/no-speech.spec.ts`

Expected: The silent fixture's project shows "Could Not Finish", the sentence "No speech was recognised in this video. Clipper needs spoken words to find clips." and Retry, with its first step done. Retry runs the transcribe step again and ends on the same sentence. The first step stays done, and the source and the preview copy are not made again.

What the passed test asserts, in `web/e2e/no-speech.spec.ts`: the card reads "Could Not Finish", the sentence and the one button Retry (lines 63 to 70) with the steps done, pending, pending, pending (line 71); after Retry a sample of the project shows the transcribe step running (line 72), every sample has the first step done (line 73), the card ends equal to the first one (line 74), and the change times of `source.mp4` and `preview.mp4` are the same as before Retry (line 75).

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/no-speech.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-AJuzfJ/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-AJuzfJ/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-AJuzfJ/fixtures/long-talk.mp4
  ✓  1 e2e/no-speech.spec.ts:44:1 › a silent video cannot finish for want of speech, and Retry runs the transcription again and nothing else (5.8s)

  1 passed (23.8s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-AJuzfJ
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
[exit code of the command: 0]
```

Result: pass

## V8 — "The first project to use a model that is not on the Mac shows the download as its own step before transcription"; the model chosen in Settings is the one used; models are kept in the data folder and nothing is written under the home folder (R24, R59, A40, A42)

Check: block V8

Expected: The exit code is 0. The passed tests show: with "Whisper small" chosen and not on disk, the project's status screen reads "Downloading Whisper small" and "Step 2 of 5." before it reads "Transcribing on this Mac" and "Step 3 of 5."; the model's files are in `models/small` in the run's data folder; the stored transcript names `small`; a second project has four steps and shows no download. `find` prints nothing: no line stands between the exit code and the closing line about `~/.cache/huggingface`.

What the passed test asserts, in `web/e2e/model-download.spec.ts`: "Whisper small" is chosen in Settings (lines 28 and 29); the card reads "Downloading Whisper small" with "Step 2 of 5." and then "Transcribing on this Mac" with "Step 3 of 5." (lines 71, 72, 79 and 80); `models/small` in the run's data folder holds `config.json` and `weights.npz` (line 82); the stored transcript names `small` (line 83); the second project never shows the download and has the steps fetch, transcribe, score and cut (lines 84 to 86).

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/model-download.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-2SlrXz/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-2SlrXz/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-2SlrXz/fixtures/long-talk.mp4
  ✓  1 e2e/model-download.spec.ts:62:1 › the first project to need a model that is not on the Mac downloads it as a step of its own, and the next does not (42.9s)

  1 passed (1.1m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-2SlrXz
Test data size: 0.16 GB (160.3 MB)
The test data folder was removed.
exit code of the browser tests: 0
end of the files written under ~/.cache/huggingface during the check
[exit code of the block: 0]
```

Result: pass

## V9 — "Stopping the tool during transcription and starting it again leaves one project, which finishes the stage" (R15)

Check: `pnpm test:browser e2e/transcribe-restart.spec.ts`

Expected: The tool is stopped while the transcribe step is running. After the start the Library lists one project. It reaches "Transcribed", and its folder holds the source, the preview copy and the transcript and nothing else.

What the passed test asserts, in `web/e2e/transcribe-restart.spec.ts`: the tool is stopped once the transcribe step reports a percent above 0 (lines 30 and 32), and after the start the project is queued or processing (line 39); the Library lists one row (line 40), which reads "Transcribed" (line 37); the folder holds `preview.mp4`, `source.mp4` and `transcript.json` (line 41).

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/transcribe-restart.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LMnTOK/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LMnTOK/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LMnTOK/fixtures/long-talk.mp4
  ✓  1 e2e/transcribe-restart.spec.ts:22:1 › the tool stopped during a transcription and started again lists one project, which is transcribed (42.4s)

  1 passed (58.0s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LMnTOK
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
[exit code of the command: 0]
```

Result: pass

## V10 — Each stage's state is stored, shown in the Library and survives a restart; importing, the queue, Stop, Retry and Delete still hold now that a project goes on to transcription (R13, R15, R16, R17, R18, R20)

Check: `pnpm test:browser e2e/restart.spec.ts e2e/queue.spec.ts e2e/queue-through-tool.spec.ts e2e/import-upload.spec.ts e2e/import-link.spec.ts e2e/halt-project.spec.ts e2e/delete-project.spec.ts`

Expected: After a stop and a start the uploaded project and the link project are both listed "Transcribed" with the same lengths. A second project waits while the first is processed. An imported project's row ends at "Transcribed" with the fixture's real length, after a bar that never falls. Retry and Resume still finish a fetch. Deleting a transcribed project removes its folder.

The resting word the tests compare with is "Transcribed" (`web/e2e/support/resting-state.ts`, line 17). `restart.spec.ts` compares both rows, "Video link · 4 min" and "Uploaded file · 4 min" with that word, and both stored projects before and after the stop and the start (lines 47 to 53). `delete-project.spec.ts` deletes a project that has come to rest transcribed and finds its folder gone (lines 67 and 84).

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/restart.spec.ts e2e/queue.spec.ts e2e/queue-through-tool.spec.ts e2e/import-upload.spec.ts e2e/import-link.spec.ts e2e/halt-project.spec.ts e2e/delete-project.spec.ts


Running 15 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-EbvcEd/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-EbvcEd/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-EbvcEd/fixtures/long-talk.mp4
  ✓   1 e2e/delete-project.spec.ts:35:3 › at 390 px › the More menu offers Delete Project, and the confirmation names the project (759ms)
  ✓   2 e2e/delete-project.spec.ts:60:3 › at 390 px › Cancel removes neither the row nor the folder, and Delete removes both (13.4s)
  ✓   3 e2e/delete-project.spec.ts:88:3 › at 390 px › deleting a project while it is being fetched stops it and leaves no folder (5.0s)
  ✓   4 e2e/delete-project.spec.ts:114:3 › at 1360 px › the menu opens under the More control, and deleting shows the next project (1.8s)
  ✓   5 e2e/halt-project.spec.ts:13:1 › a link that answers "not found" shows the reason and Retry, and Retry finishes it once repaired (14.4s)
  ✓   6 e2e/halt-project.spec.ts:38:1 › Stop during a fetch leaves the project stopped, and Resume finishes it (20.3s)
  ✓   7 e2e/import-link.spec.ts:23:1 › a link to the fixture is fetched and transcribed: its bar never falls, then the row rests with the real length (19.2s)
  ✓   8 e2e/import-link.spec.ts:46:1 › Find Clips sends the link, the length, the platforms and the brief the user chose (686ms)
  ✓   9 e2e/import-upload.spec.ts:30:1 › the uploaded fixture is prepared and transcribed: its bar never falls, then the row rests with the real length (12.8s)
  ✓  10 e2e/import-upload.spec.ts:54:1 › a browser that is not sending the file says so on the status screen (156ms)
  ✓  11 e2e/queue-through-tool.spec.ts:19:1 › a second link project waits for the first and then finishes (26.8s)
  ✓  12 e2e/queue-through-tool.spec.ts:36:1 › a project whose fetch is cut off by a stop finishes after the start (19.9s)
  ✓  13 e2e/queue.spec.ts:28:1 › a second project waits while the first is processed, names it, and starts when it finishes (44.0s)
  ✓  14 e2e/queue.spec.ts:52:1 › a file sent while another project is processed arrives in full and then waits its turn (28.8s)
  ✓  15 e2e/restart.spec.ts:25:1 › the uploaded project and the link project are listed in the same state after a stop and a start (25.0s)

  15 passed (4.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-EbvcEd
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
[exit code of the command: 0]
```

Result: pass

## V11 — The states this milestone adds fit a phone: no sideways scroll and no cut label, at the normal text size and at 200% (R7)

Check: `pnpm test:browser e2e/text-size.spec.ts`

Expected: At 390 px and at both sizes, with nothing misfitting: a transcribed project, a project downloading a model, a project being transcribed, a project failed for no speech and a project failed for a model download, on the status screen and in the Library row, beside the screens M1 measured.

The second passed test measures, at 390 px, at the normal size and at 200%, with no misfit: `library`, `status-rested`, `status-failed`, `status-stopped`, `status-processing`, `status-queued`, `status-uploading`, `library-transcription`, `status-downloading`, `status-transcribing`, `status-no-speech`, `status-download-failed`, the three project tabs, the delete alert, Settings, the two new-project sheets and the four sheet errors (`web/e2e/text-size.spec.ts`, lines 19 to 43, 100 and 101). `library-transcription` is the Library holding the rows of the four presented states, and the rested project is the transcribed one (`web/e2e/support/walk-screens.ts`, lines 77 to 91; `web/e2e/support/seed-projects.ts`, lines 59 to 91).

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/text-size.spec.ts


Running 4 tests using 1 worker

  ✓  1 e2e/text-size.spec.ts:68:1 › the measure finds a block that is too wide, a cut label, a spilled label and a cut choice (248ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-NrtsLO/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-NrtsLO/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-NrtsLO/fixtures/long-talk.mp4
  ✓  2 e2e/text-size.spec.ts:86:1 › with projects, every screen fits at the normal size and at 200% (23.5s)
  ✓  3 e2e/text-size.spec.ts:104:1 › the empty Library fits at the normal size and at 200% (211ms)
  ✓  4 e2e/text-size.spec.ts:119:3 › with 3 GB reported free › the low disk error fits at the normal size and at 200% (3.7s)

  4 passed (42.4s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-NrtsLO
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
[exit code of the command: 0]
```

Result: pass

## V12 — The service's rules, by test name (R15, R17, R18, R23, R24, R25, A40, A42, A43, A44, A45, A46)

Check: block V12

Expected: Exit 0. Passed tests show: the talk's sound turned into words within 15 in 100 of the script, whole and in sixty-second parts, with times in order; silence giving no word without a model; the sound of a source taken out, and a source with no sound track named; the transcriber's percent never falling, and a stop ending it within two seconds; times put in order and inside the video's length, and no word raising no speech; the transcript file read back as written; the three models at their repositories and revisions; a download with a rising percent, carried on after a stop, with "not found" and a closed port reported; a step added ahead of another with its own label, without lowering the project's bar; a database from M1 upgraded; a resting project whose next step now exists put back in the queue at start; the talk resting transcribed with a stored transcript; the silent fixture failing with the no-speech sentence, and Retry running that step alone; the download step added for a model that is not on the Mac and not for one that is; the transcript naming the chosen model; a failed download reported with its sentence; an uploaded talk taken through the whole app to transcribed.

The whole output, with all 312 tests, is in `evidence/v12-service-tests.txt`. The lines below are the passed tests that show what the check lists; the others are left out at the markers. Two items are asserted inside a test and not carried by its name. The rising percent of a download: `service/clipper/transcription/test_download_model.py`, lines 73, 74 and 96. The transcript naming the chosen model: `test_model_stage.py`, line 68, and `test_whole_app.py`, line 112, in the same folder.

```
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0 -- /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collecting ... collected 312 items

[18 other passed tests left out]
clipper/media/test_extract_audio.py::test_the_sound_of_the_talk_becomes_between_234_and_236_seconds_of_samples PASSED [  6%]
clipper/media/test_extract_audio.py::test_the_samples_are_16_khz_mono_16_bit PASSED [  6%]
clipper/media/test_extract_audio.py::test_a_source_with_no_sound_track_fails_by_name_and_leaves_no_file PASSED [  6%]
clipper/media/test_extract_audio.py::test_a_stop_signal_ends_ffmpeg_within_two_seconds_and_leaves_no_file PASSED [  7%]
clipper/media/test_extract_audio.py::test_a_source_that_is_not_a_video_fails_by_name PASSED [  7%]
[43 other passed tests left out]
clipper/pipeline/test_requeue_rested.py::test_a_project_that_rests_goes_back_into_the_queue_when_its_next_step_has_a_stage PASSED [ 21%]
clipper/pipeline/test_requeue_rested.py::test_a_project_that_rests_stays_as_it_is_when_its_next_step_has_no_stage PASSED [ 21%]
clipper/pipeline/test_requeue_rested.py::test_projects_that_do_not_rest_are_left_as_they_were PASSED [ 22%]
clipper/pipeline/test_requeue_rested.py::test_rested_projects_are_requeued_oldest_first PASSED [ 22%]
[19 other passed tests left out]
clipper/pipeline/test_run_queue.py::test_a_check_that_puts_a_step_ahead_of_the_second_makes_it_run_first_and_the_second_after PASSED [ 28%]
clipper/pipeline/test_run_queue.py::test_the_stop_reason_of_an_added_step_carries_its_own_label PASSED [ 29%]
[34 other passed tests left out]
clipper/projects/test_project.py::test_the_bar_of_a_project_is_four_quarters_one_for_each_step_it_was_created_with PASSED [ 40%]
clipper/projects/test_project.py::test_a_step_added_ahead_of_another_shares_its_quarter_so_the_bar_does_not_fall PASSED [ 40%]
clipper/projects/test_project.py::test_the_added_step_and_the_step_behind_it_fill_their_quarter_between_them PASSED [ 41%]
clipper/projects/test_project.py::test_a_step_with_a_label_of_its_own_is_shown_under_it PASSED [ 41%]
clipper/projects/test_project.py::test_a_download_step_without_a_label_has_one_worked_out_from_its_kind PASSED [ 41%]
clipper/projects/test_project.py::test_the_first_unfinished_step_is_the_added_one_until_it_is_done PASSED [ 41%]
[8 other passed tests left out]
clipper/projects/test_project_queue.py::test_a_step_put_ahead_of_another_waits_at_0_with_its_label_and_the_later_steps_move_down PASSED [ 44%]
clipper/projects/test_project_queue.py::test_with_the_fetch_done_and_a_download_added_the_project_stays_at_25 PASSED [ 45%]
[4 other passed tests left out]
clipper/projects/test_project_repository.py::test_a_step_with_a_label_of_its_own_is_stored_with_it PASSED [ 46%]
[69 other passed tests left out]
clipper/settings/test_startup_settings.py::test_models_come_from_hugging_face_unless_another_source_is_named PASSED [ 69%]
[7 other passed tests left out]
clipper/storage/test_data_folder.py::test_each_model_has_a_folder_of_its_own_under_models PASSED [ 71%]
[4 other passed tests left out]
clipper/storage/test_open_database.py::test_a_database_made_by_m1_gains_the_step_label_and_keeps_its_projects PASSED [ 73%]
[21 other passed tests left out]
clipper/test_main.py::test_a_project_that_rested_fetched_goes_on_to_the_steps_after_it_at_the_start PASSED [ 80%]
[7 other passed tests left out]
clipper/transcription/test_built_fixtures.py::test_the_silent_fixture_is_twenty_seconds_of_h264_with_an_aac_sound_track PASSED [ 83%]
clipper/transcription/test_built_fixtures.py::test_the_long_fixture_is_between_19_and_20_minutes_of_h264_with_an_aac_sound_track PASSED [ 83%]
clipper/transcription/test_built_fixtures.py::test_the_long_fixture_is_the_talk_five_times_over PASSED [ 83%]
clipper/transcription/test_download_model.py::test_a_whole_download_lands_under_the_final_name_with_the_sizes_the_server_declared PASSED [ 83%]
clipper/transcription/test_download_model.py::test_a_download_stopped_at_the_slow_address_is_carried_on_from_the_bytes_it_holds PASSED [ 84%]
clipper/transcription/test_download_model.py::test_a_file_the_source_does_not_hold_raises_a_download_error_and_leaves_no_model PASSED [ 84%]
clipper/transcription/test_download_model.py::test_a_closed_port_raises_a_download_error PASSED [ 84%]
clipper/transcription/test_download_model.py::test_a_file_that_ends_short_raises_a_download_error PASSED [ 85%]
clipper/transcription/test_model_stage.py::test_with_small_chosen_and_not_on_the_mac_the_first_project_gains_the_download_step PASSED [ 85%]
clipper/transcription/test_model_stage.py::test_with_the_model_source_closed_the_download_fails_with_its_reason PASSED [ 85%]
clipper/transcription/test_model_stage.py::test_the_download_step_is_done_at_once_when_the_model_is_already_there PASSED [ 86%]
clipper/transcription/test_model_stage.py::test_the_check_adds_nothing_when_the_chosen_model_is_on_the_mac PASSED [ 86%]
clipper/transcription/test_model_stage.py::test_a_changed_choice_gives_the_waiting_download_step_the_name_of_the_new_model PASSED [ 86%]
clipper/transcription/test_model_stage.py::test_the_check_stands_before_the_download_and_before_the_transcription PASSED [ 87%]
clipper/transcription/test_run_transcriber.py::test_the_talk_comes_back_as_its_language_and_its_words PASSED [ 87%]
clipper/transcription/test_run_transcriber.py::test_the_percent_of_the_sound_never_falls_and_ends_at_100 PASSED [ 87%]
clipper/transcription/test_run_transcriber.py::test_a_stop_signal_ends_the_transcriber_within_two_seconds_and_leaves_no_process PASSED [ 88%]
clipper/transcription/test_run_transcriber.py::test_a_model_folder_that_does_not_exist_raises_an_error_with_what_the_program_printed PASSED [ 88%]
clipper/transcription/test_transcribe_audio.py::test_the_sound_of_the_talk_becomes_words_within_15_in_100_of_the_script PASSED [ 88%]
clipper/transcription/test_transcribe_audio.py::test_every_word_has_a_start_and_an_end_in_order_and_inside_the_sound PASSED [ 89%]
clipper/transcription/test_transcribe_audio.py::test_the_talk_in_parts_of_sixty_seconds_is_within_15_in_100_with_times_in_order PASSED [ 89%]
clipper/transcription/test_transcribe_audio.py::test_the_printed_seconds_rise_and_end_at_the_length_of_the_sound[whole_talk] PASSED [ 89%]
clipper/transcription/test_transcribe_audio.py::test_the_printed_seconds_rise_and_end_at_the_length_of_the_sound[talk_in_parts] PASSED [ 90%]
clipper/transcription/test_transcribe_audio.py::test_twenty_seconds_of_silence_give_no_word PASSED [ 90%]
clipper/transcription/test_transcribe_audio.py::test_silence_gives_no_word_without_a_model PASSED [ 90%]
clipper/transcription/test_transcribe_audio.py::test_sound_without_a_model_ends_with_an_error_that_names_the_folder PASSED [ 91%]
clipper/transcription/test_transcribe_audio.py::test_a_part_is_cut_in_the_quietest_half_second_of_the_thirty_seconds_before_its_mark PASSED [ 91%]
clipper/transcription/test_transcribe_audio.py::test_a_part_is_never_longer_than_its_mark_and_the_last_one_ends_with_the_sound PASSED [ 91%]
clipper/transcription/test_transcribe_stage.py::test_the_talk_rests_transcribed_with_a_stored_transcript PASSED [ 91%]
clipper/transcription/test_transcribe_stage.py::test_with_the_model_in_place_and_the_model_source_closed_transcription_still_finishes PASSED [ 92%]
clipper/transcription/test_transcribe_stage.py::test_the_silent_fixture_fails_for_want_of_speech_and_retry_runs_that_step_alone PASSED [ 92%]
clipper/transcription/test_transcribe_stage.py::test_a_source_with_no_sound_track_fails_for_want_of_speech PASSED [ 92%]
clipper/transcription/test_transcribe_stage.py::test_a_stop_ends_the_transcription_within_two_seconds_with_no_transcript_and_no_samples PASSED [ 93%]
clipper/transcription/test_transcript.py::test_the_transcript_holds_the_language_the_model_and_the_words_in_order PASSED [ 93%]
clipper/transcription/test_transcript.py::test_the_text_of_a_word_is_kept_as_the_model_gave_it PASSED [ 93%]
clipper/transcription/test_transcript.py::test_times_are_rounded_to_hundredths_of_a_second PASSED [ 94%]
clipper/transcription/test_transcript.py::test_a_word_that_starts_before_the_word_before_it_ends_starts_where_that_one_ends PASSED [ 94%]
clipper/transcription/test_transcript.py::test_a_word_that_ends_before_it_starts_ends_where_it_starts PASSED [ 94%]
clipper/transcription/test_transcript.py::test_every_time_is_brought_inside_the_length_of_the_video PASSED [ 95%]
clipper/transcription/test_transcript.py::test_a_length_between_two_hundredths_keeps_every_time_under_it PASSED [ 95%]
clipper/transcription/test_transcript.py::test_no_word_at_all_raises_no_speech PASSED [ 95%]
clipper/transcription/test_transcript.py::test_sound_that_never_reached_the_model_raises_no_speech PASSED [ 96%]
clipper/transcription/test_transcript_store.py::test_a_transcript_read_back_equals_what_was_written PASSED [ 96%]
clipper/transcription/test_transcript_store.py::test_the_transcript_is_one_file_named_transcript_json PASSED [ 96%]
clipper/transcription/test_transcript_store.py::test_the_file_holds_the_language_the_model_and_each_word_with_its_times PASSED [ 97%]
clipper/transcription/test_transcript_store.py::test_writing_again_replaces_the_transcript PASSED [ 97%]
clipper/transcription/test_whisper_models.py::test_every_choice_in_settings_is_a_published_model PASSED [ 97%]
clipper/transcription/test_whisper_models.py::test_a_model_is_known_by_its_name_its_repository_its_revision_and_its_two_files[large-v3-turbo-Whisper large-v3-turbo-mlx-community/whisper-large-v3-turbo/resolve/a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb-weights.safetensors] PASSED [ 98%]
clipper/transcription/test_whisper_models.py::test_a_model_is_known_by_its_name_its_repository_its_revision_and_its_two_files[medium-Whisper medium-mlx-community/whisper-medium-mlx/resolve/7fc08c4eac4c316526498f147dfdee6f6303f975-weights.npz] PASSED [ 98%]
clipper/transcription/test_whisper_models.py::test_a_model_is_known_by_its_name_its_repository_its_revision_and_its_two_files[small-Whisper small-mlx-community/whisper-small-mlx/resolve/45f3915923c7a79a5a5b5a7d909d39aeb0e5630e-weights.npz] PASSED [ 98%]
clipper/transcription/test_whisper_models.py::test_another_source_replaces_hugging_face_in_every_address PASSED [ 99%]
clipper/transcription/test_whole_app.py::test_an_uploaded_talk_goes_through_the_whole_app_and_rests_transcribed PASSED [ 99%]
clipper/transcription/test_whole_app.py::test_a_project_that_rested_fetched_under_an_earlier_version_is_transcribed_after_the_start PASSED [ 99%]
clipper/transcription/test_whole_app.py::test_the_model_chosen_in_settings_is_downloaded_and_used_for_the_next_project PASSED [100%]

======================= 312 passed in 173.88s (0:02:53) ========================
[exit code of the block: 0]
```

Result: pass

## V13 — The web app's rules, by test name (A46)

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: the row of a transcribed project reading "Transcribed" with its bar; the status card headed "Transcribed" with "Step 2 of 4 is done." and "Not started: Scoring windows, Cutting clips."; "Step 3 of 5 is done." after a download; "Step 2 of 5." during one.

The whole output, with all 130 tests, is in `evidence/v13-web-tests.txt`. The tests whose names do not carry the wording assert it in `web/src/project/follow-progress/lib/describe-status.test.ts`: the card headed "Transcribed" with "Step 2 of 4 is done." and "Not started: Scoring windows, Cutting clips." (lines 136 to 148), "Step 3 of 5 is done." (line 154) and "Step 2 of 5." (line 166).

```

 RUN  v5.0.3 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/web

[5 other passed tests left out]
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the bar and the step label while a link is fetched 1ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the bar and the step label while a file uploads 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the bar and Fetched for a project that rests after its first step 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the bar and Transcribed for a project that rests after its transcription 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows the label the service sent while a model is downloaded 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows a note for a queued project 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows a note for a failed project 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > shows a note for a stopped project 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > nameRestingState > gives the fetched state one word 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > nameRestingState > gives the transcribed state one word 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > nameRestingState > has no word for a uploading project, which does not rest 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > nameRestingState > has no word for a queued project, which does not rest 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > nameRestingState > has no word for a processing project, which does not rest 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > nameRestingState > has no word for a failed project, which does not rest 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > nameRestingState > has no word for a stopped project, which does not rest 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > findCurrentStep > is the first step that has not finished 0ms
[97 other passed tests left out]
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > tells the browser that sends an upload to keep the page open 1ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > tells a browser that does not send the upload what to do about it 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > shows the step of a processing project and offers Stop 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > names the project a waiting one waits for 1ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > says a waiting project starts in a moment when nothing is processed 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > gives the reason of a failed project and offers Retry 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > gives the reason of a stopped project and offers Resume 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > names what has not started for a project that rests after its first step 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > heads a transcribed project Transcribed and names the two steps that have not started 1ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > counts a model download among the steps that are done 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > shows a model download under the label the service sent, as step 2 of 5 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > counts the transcription as step 3 of 5 after a model download 0ms

 Test Files  15 passed (15)
      Tests  130 passed (130)
   Start at  00:38:33
   Duration  541ms (transform 55%, import 26%, tests 14%, worker 5%)

[exit code of the command: 0]
```

Result: pass

## V14 — The default model is large-v3-turbo and Settings also offers medium and small: each exists at the fixed address the tool downloads from (R24, A40)

Check: block V14

Expected: Six lines, each ending in `206`. The three weights lines give totals of 1613977612, 1524924912 and 481307592 bytes. Then three lines, each saying that a revision is in the code.

Each of the six lines ends in `206` and one space, which the block's `tr` puts in place of the line end.

```
mlx-community/whisper-large-v3-turbo/resolve/a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb/config.json content-range: bytes 0-0/268  content-range: bytes 0-0/268  206 
mlx-community/whisper-large-v3-turbo/resolve/a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb/weights.safetensors content-range: bytes 0-0/1613977612  206 
mlx-community/whisper-medium-mlx/resolve/7fc08c4eac4c316526498f147dfdee6f6303f975/config.json content-range: bytes 0-0/268  content-range: bytes 0-0/268  206 
mlx-community/whisper-medium-mlx/resolve/7fc08c4eac4c316526498f147dfdee6f6303f975/weights.npz content-range: bytes 0-0/1524924912  206 
mlx-community/whisper-small-mlx/resolve/45f3915923c7a79a5a5b5a7d909d39aeb0e5630e/config.json content-range: bytes 0-0/266  content-range: bytes 0-0/266  206 
mlx-community/whisper-small-mlx/resolve/45f3915923c7a79a5a5b5a7d909d39aeb0e5630e/weights.npz content-range: bytes 0-0/481307592  206 
a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb is in the code
7fc08c4eac4c316526498f147dfdee6f6303f975 is in the code
45f3915923c7a79a5a5b5a7d909d39aeb0e5630e is in the code
[exit code of the block: 0]
```

Result: pass

## V15 — Every version is pinned; libraries built into the app carry permissive licences, with tqdm as the one recorded exception; the web app gained no package (R8, R58, A39)

Check: block V15

Expected: `every requirement pinned`. The line `mlx-whisper==0.4.3`. Every licence shown is MIT, BSD, Apache-2.0, PSF, ISC, 0BSD, Zlib, CC0-1.0, CNRI-Python, Unlicense or the LLVM exception, alone or joined. One line shows MPL, and it is `tqdm`. None shows GPL, LGPL or AGPL. Nothing is printed before the closing line about the web app's packages.

`huggingface_hub` is shown by its classifier, "Apache Software License". The `License` field of the installed package, version 2.1.1, reads `Apache-2.0`.

```
every requirement pinned
mlx-whisper==0.4.3
annotated-doc | MIT
annotated-types | MIT
anyio | MIT
click | BSD-3-Clause
fastapi | MIT
filelock | MIT
fsspec | BSD-3-Clause
h11 | MIT License
hf-xet | Apache-2.0
httpcore2 | BSD-3-Clause
httpx2 | BSD-3-Clause
huggingface_hub | Apache Software License
idna | BSD-3-Clause
llvmlite | BSD-2-Clause AND Apache-2.0 WITH LLVM-exception
mlx | MIT
mlx-metal | MIT
mlx-whisper | MIT
more-itertools | MIT
numba | BSD License
numpy | BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0
opentelemetry-api | Apache-2.0
packaging | Apache-2.0 OR BSD-2-Clause
pydantic | MIT
pydantic-settings | MIT
pydantic_core | MIT
python-dotenv | BSD-3-Clause
PyYAML | MIT License
regex | Apache-2.0 AND CNRI-Python
scipy | BSD License
starlette | BSD-3-Clause
tiktoken | MIT License
tqdm | MPL-2.0 AND MIT
truststore | MIT
typing-inspection | MIT
typing_extensions | PSF-2.0
uvicorn | BSD-3-Clause
yt-dlp | Unlicense
yt-dlp-ejs | Unlicense AND MIT AND ISC
end of the changes to the web app's packages
[exit code of the block: 0]
```

Result: pass

## V16 — No audio leaves the Mac: the service contacts nothing new but the model source, transcription needs no network, and the service itself does not load the model (R23, R57, A40, A43)

Check: block V16

Expected: Every line of the first search is in one file, the one that downloads a model. The second search shows the transcriber setting the Hugging Face client offline. The next line reads `loaded by the service: []`. Among the passed tests, one transcribes with the model in place and the model source closed.

The block was run with each command traced. All of its output is in `evidence/v16-no-audio-leaves.txt`.

```
[exit code of the command before: 0] + grep -rnE '--include=*.py' '^[[:space:]]*(import|from)[[:space:]]+(urllib\.request|urllib[[:space:]]+import|urllib3|http\.client|socket|httpx2|requests|huggingface_hub)' service/clipper/transcription service/clipper/media
[exit code of the command before: 0] + grep -v /test_
service/clipper/transcription/download_model.py:1:import http.client
service/clipper/transcription/download_model.py:3:import urllib.request
[exit code of the command before: 0] + grep -rn '--include=*.py' HF_HUB_OFFLINE service/clipper/transcription
[exit code of the command before: 0] + grep -v /test_
service/clipper/transcription/transcribe_audio.py:131:    os.environ["HF_HUB_OFFLINE"] = "1"
[exit code of the command before: 0] + cd service
[exit code of the command before: 0] + .venv/bin/python -c 'import sys, clipper; print('\''loaded by the service:'\'', [name for name in ('\''mlx'\'', '\''mlx_whisper'\'', '\''numpy'\'', '\''scipy'\'', '\''numba'\'') if name in sys.modules])'
loaded by the service: []
[exit code of the command before: 0] + cd service
[exit code of the command before: 0] + .venv/bin/python -m pytest clipper/transcription -v
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0 -- /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collecting ... collected 54 items

[29 other passed tests left out]
clipper/transcription/test_transcribe_stage.py::test_with_the_model_in_place_and_the_model_source_closed_transcription_still_finishes PASSED [ 55%]
[24 other passed tests left out]

======================== 54 passed in 93.35s (0:01:33) =========================
[exit code of the block: 0]
```

Result: pass

## V17 — This milestone's commits touch nothing the boundaries exclude (R4, R11, R55, R56)

Check: block V17

Expected: Nothing is printed before each of the two closing lines about changes. `data` and `.cache` are ignored. No video, audio, database or model file is tracked. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`.

```
end of the changes to .researches and docs/prototype
end of the changes to the copied stylesheets
.gitignore:1:/data	data
.gitignore:7:.cache/	.cache
no video, audio, database or model file is tracked
no key is tracked
8	fixtures
every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md
the app reads nothing from docs/
[exit code of the block: 0]
```

Result: pass

## V18 — The README and the agents' instructions cover what this milestone adds (R9, A18, A40, A41)

Check: block V18

Expected: Both files name `CLIPPER_MODEL_SOURCE`. The README says where the models and the transcripts are kept, that a model downloads the first time a project needs it, and that setup fetches the test model. `AGENTS.md` names the transcription package and says that packages are installed without following dependencies.

The block was run with each command traced. Line 93 of the README goes on, on line 94, "Hugging Face the first time a project needs it, as a step of that project".

```
[exit code of the command before: 0] + grep -n CLIPPER_MODEL_SOURCE README.md AGENTS.md
README.md:120:| `CLIPPER_MODEL_SOURCE` | The address the transcription models are downloaded from | `https://huggingface.co` |
AGENTS.md:35:`CLIPPER_WEB_PORT`, `CLIPPER_SERVICE_PORT` and `CLIPPER_MODEL_SOURCE`. Three more serve test
AGENTS.md:51:  `CLIPPER_MODEL_SOURCE` at every start. A test that downloads a model gets the test model's
AGENTS.md:53:- The service's tests set `CLIPPER_MODEL_SOURCE` to a closed local port unless a test names a
[exit code of the command before: 0] + grep -niE 'model|transcript' README.md
31:into `.cache/playwright`, and fetches the Whisper model the tests transcribe with, 74 MB, into
78:Whisper model, which the run keeps under the default model's name, and a test that downloads a
79:model gets it from a server on the Mac.
84:one folder per project with the fetched video, its preview copy and its transcript, and a
85:`models` folder with the transcription models. Deleting a project in Clipper removes its folder.
91:## Transcription models
93:Clipper transcribes on the Mac with the Whisper model chosen in Settings. A model downloads from
95:`data/models` for every project after it.
97:| Model | Download |
120:| `CLIPPER_MODEL_SOURCE` | The address the transcription models are downloaded from | `https://huggingface.co` |
139:steps. In Settings, the transcription model is the one choice that takes effect. The other five
[exit code of the command before: 0] + grep -niE 'transcription|following dependencies|no-deps' AGENTS.md
43:## Transcription in tests
76:  `media`, `projects`, `pipeline`, `fetching` and `transcription`. Each exports through its
78:- Service imports run one way: `fetching` and `transcription` import `pipeline`, `projects`,
79:  `media` and `storage`, and `transcription` also imports `settings`; `pipeline` imports
81:  `fetching` or `transcription`. `main.py` hands `projects` what it needs from `pipeline`.
82:- The transcriber, `service/clipper/transcription/transcribe_audio.py`, is a program of its own.
83:  The service starts it by its file path once for each transcription and imports nothing from
171:Bootstrap installs the two requirements files without following dependencies, so a package is
173:Two packages that mlx-whisper declares are left out because transcription never loads them:
[exit code of the block: 0]
```

Result: pass

## V19 — The code follows the standards the hooks enforce, and the service's recorded layout names the new package (A19)

Check: block V19

Expected: Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `transcription/`, and no line of it starts with `#`.

The block was run with each command traced. The review printed no finding. Without the block's filter it names 83 files, each followed by "clean (no hook-level violations)".

```
[exit code of the command before: 0] + git diff --name-only --diff-filter=AM e9f9b5e HEAD -- '*.ts' '*.tsx' '*.mjs' '*.py'
[exit code of the command before: 0] + python3 /Users/work/.claude/skills/coding-standards/hooks/review-files.py --stdin
[exit code of the command before: 0] + grep -vE -- '— clean|^$'
Total hook-level violations: 0
[exit code of the command before: 0] + cat service/.coding-standards-structure
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
    transcription/
[exit code of the block: 0]
```

Result: pass

## V20 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

Run last, after V19.

```
 M docs/missions/clipper-tool/m2-transcripts-made-on-the-mac/evidence/talk-transcript.json
[exit code of the command: 0]
```

Result: pass
