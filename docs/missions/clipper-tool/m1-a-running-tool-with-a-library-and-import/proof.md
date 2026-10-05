# Proof: m1-a-running-tool-with-a-library-and-import

Attempt: 1
Result: fail
Commit: 8e61f28

| id | result |
| -- | ------ |
| V1 | pass |
| V2 | pass |
| V3 | pass |
| V4 | fail |
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
| V20 | fail |
| V21 | pass |
| V22 | pass |
| V23 | pass |
| V24 | pass |
| V25 | pass |
| V26 | fail |
| V27 | pass |
| V28 | pass |
| V29 | pass |
| V30 | pass |
| V31 | pass |
| V32 | pass |

Lines in square brackets are markers the validator added between commands. Every other line is
printed by the commands. Blocks were run with `bash` from the worktree's root.

## V1 — Setup works from the committed files, inside the project

Check: block V1

Expected: Both commands exit 0. Python reports 3.12. `find` prints a browser folder inside the worktree.

```
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

Done in 283ms using pnpm v10.13.1
[exit code of pnpm install --frozen-lockfile: 0]

> clipper@0.1.0 bootstrap /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/bootstrap-project.mjs

Installing the pinned Python packages
[32 lines that begin "Requirement already satisfied" left out]
Installing the browser the tests drive into .cache/playwright
Clipper is set up. Start it with "pnpm start".
[exit code of pnpm bootstrap: 0]
Python 3.12.13
./.cache/playwright/chromium_headless_shell-1243
```

The worktree already held the installed packages, the Python environment and the browser, so both
commands found everything in place and installed nothing.

Result: pass

## V2 — "The test command passes"; one command runs every check

Check: `pnpm test`

Expected: Exit 0. The output reports Ruff, mypy, pytest, ESLint, the TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. No gate existed before this milestone, so there is no baseline.

The command was run twice. The second run, from 20:10:29 to 20:16:47 with the Mac awake throughout,
decides the check:

```
All checks passed!
Success: no issues found in 68 source files
======================== 224 passed in 82.80s (0:01:22) ========================
 Test Files  15 passed (15)
      Tests  117 passed (117)
  76 passed (4.6m)
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
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-cLqRdy
Test data size: 0.05 GB (53.4 MB)
The test data folder was removed.
[exit code: 0]
```

The first run, from 19:27:24 to 19:53:48, exited 1 with three browser tests timed out:

```
  ✘  33 e2e/library.spec.ts:95:3 › at 390 px › a row follows the progress of its project without a reload (2.0m)
  ✘  41 e2e/new-project-errors.spec.ts:89:1 › a missing file shows its error under Source and moves focus to the file field (11.0m)
  ✘  46 e2e/queue-through-tool.spec.ts:17:1 › a second link project waits for the first and then finishes (5.6m)
  3 failed
    e2e/library.spec.ts:95:3 › at 390 px › a row follows the progress of its project without a reload 
    e2e/new-project-errors.spec.ts:89:1 › a missing file shows its error under Source and moves focus to the file field 
    e2e/queue-through-tool.spec.ts:17:1 › a second link project waits for the first and then finishes 
  73 passed (24.6m)
--- Results
Fixtures: passed
Ruff: passed
mypy: passed
pytest: passed
ESLint: passed
Web build: passed
TypeScript check: passed
Vitest: passed
Playwright: failed
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-oOelWc
Test data size: 0.05 GB (53.4 MB)
The test data folder was removed.
 ELIFECYCLE  Test failed. See above for more details.
[exit code: 1]
```

The Mac's lid was closed during that run. Its power log (`pmset -g log`) shows it asleep from
19:30:59 to 19:51:42, with four wakes of under a minute in between:

```
2026-10-05 19:30:59 +0700 Sleep               	Entering Sleep state due to 'Clamshell Sleep':TCPKeepAlive=active Using Batt (Charge:100%) 113 secs
2026-10-05 19:33:04 +0700 Sleep               	Entering Sleep state due to 'Maintenance Sleep':TCPKeepAlive=active Using Batt (Charge:100%) 661 secs
2026-10-05 19:44:15 +0700 Sleep               	Entering Sleep state due to 'Maintenance Sleep':TCPKeepAlive=active Using Batt (Charge:100%) 39 secs
2026-10-05 19:45:04 +0700 Sleep               	Entering Sleep state due to 'Maintenance Sleep':TCPKeepAlive=active Using Batt (Charge:100%) 42 secs
2026-10-05 19:46:16 +0700 Sleep               	Entering Sleep state due to 'Maintenance Sleep':TCPKeepAlive=active Using Batt (Charge:100%) 326 secs
2026-10-05 19:51:42 +0700 Wake                	Wake from Deep Idle [CDNVA] : due to SMC.OutboxNotEmpty smc.70070000 lid/HID Activity Using BATT (Charge:100%)
```

The three tests are the ones that were running when the Mac went to sleep at 19:30:59, 19:33:04 and
19:46:16. They took 2.0, 11.0 and 5.6 minutes on the clock, and each has a limit of 2 minutes. All
three passed in the second run and in V9, V10 and V11.

Result: pass

## V3 — Test data is removed and no tracked file changes

Check: block V3

Expected: `ls` reports that the folder does not exist. `git status` prints nothing.

After the first run of V2:

```
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-oOelWc: No such file or directory
[exit code of ls: 1]
[end of git status --porcelain]
```

After the second run of V2, which followed V19:

```
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-cLqRdy: No such file or directory
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/settings-1360-dark.png
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/settings-1360-light.png
[end of git status --porcelain]
```

The two files listed after the second run are the captures V19 had rewritten. `git status` printed
the same two lines before that run started.

Result: pass

## V4 — "The start command brings the tool up, and the Library opens at the address it prints"; the web app on every interface, the service on loopback only

Check: block V4

Expected: The log shows `http://localhost:3000`. The Library answers 200 and the page's title is `Clipper`. `/api/health` answers 200 through port 3000. `lsof` shows port 3000 listening on `*` and port 8765 on `127.0.0.1`. The data folder holds a database file. After the interrupt neither port has a listener.

```

> clipper@0.1.0 start /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/start-tool.mjs

▲ Next.js 16.3.8
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
✓ Ready in 178ms
✓ Running next.config.ts took 94ms
Clipper is running at http://localhost:3000
library: 200
<title>Clipper</title>
{"status":"ok"}
service through the web app: 200
COMMAND  PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    3328 work   15u  IPv4 0x72fe9d790cdcb4f5      0t0  TCP *:3000 (LISTEN)
COMMAND  PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Python  3313 work    7u  IPv4 0x72fe9d790b26175d      0t0  TCP 127.0.0.1:8765 (LISTEN)
clipper.sqlite3
projects
COMMAND  PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Python  3313 work    7u  IPv4 0x72fe9d790b26175d      0t0  TCP 127.0.0.1:8765 (LISTEN)
end of listeners after the interrupt
```

After the interrupt the listing printed the service still listening on 127.0.0.1:8765. Five seconds
later neither port had a listener and the service's process was gone. The block was then run five
more times. The lines each repeat printed after the interrupt:

```
[repeat 1]
end of listeners after the interrupt
[repeat 2]
end of listeners after the interrupt
[repeat 3]
end of listeners after the interrupt
[repeat 4]
end of listeners after the interrupt
[repeat 5]
end of listeners after the interrupt
```

Every other expectation held in all six runs.

Result: fail

## V5 — "Started with a setting that points at a folder without ffmpeg, the tool stops with a message that names ffmpeg"

Check: block V5

Expected: The exit code is neither 0 nor 142. The log holds a sentence that names `ffmpeg` and `ffprobe` and says where Clipper looked. No line contains `Traceback`. Neither port has a listener.

```
exit code: 1

> clipper@0.1.0 start /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/start-tool.mjs

Clipper cannot start: ffmpeg and ffprobe did not run from /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/tmp.Tv5fHgVjCd/no-tools or from the PATH (/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/node_modules/.bin:/snapshot/dist/node-gyp-bin:/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/node_modules/.bin:/usr/local/bin:/Users/work/Library/pnpm:/usr/bin:/bin).
 ELIFECYCLE  Command failed with exit code 1.
end of listeners
```

Result: pass

## V6 — The web app is reachable on the Mac's network address and the service is not; pages ask nothing outside the tool

Check: `pnpm test:browser e2e/start-command.spec.ts e2e/own-origin.spec.ts`

Expected: The Library opens at the address the start command printed. The web port answers on the Mac's network address and the service port refuses there. On every screen of this milestone, each request goes to the tool's own address.

```
Running 7 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-blt9nJ/fixtures/talk.mp4
  ✓  1 e2e/own-origin.spec.ts:58:1 › with projects, every request of every screen is addressed to the tool (31.2s)
  ✓  2 e2e/own-origin.spec.ts:78:1 › the empty Library asks nothing outside the tool (1.0s)
  ✓  3 e2e/own-origin.spec.ts:95:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (4.9s)
  ✓  4 e2e/start-command.spec.ts:14:1 › the tool opens at the address the start command prints (157ms)
  ✓  5 e2e/start-command.spec.ts:23:1 › the service answers through the web port (10ms)
  ✓  6 e2e/start-command.spec.ts:30:1 › the web port is open on the network address and the service port is closed there (10ms)
  ✓  7 e2e/start-command.spec.ts:40:1 › every request of the page goes to the address of the tool (2.1s)
  7 passed (49.2s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-blt9nJ
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V7 — "Uploading the fixture video creates a project whose row shows the fetch stage progressing and then complete, with the fixture's real length"

Check: `pnpm test:browser e2e/import-upload.spec.ts`

Expected: The fixture is uploaded through the new project sheet. The project's row shows the first step's bar at two or more rising values and never a falling one. The row then reads "Fetched" with the length ffprobe reports for the fixture.

```
Running 2 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-1Ms1ic/fixtures/talk.mp4
  ✓  1 e2e/import-upload.spec.ts:28:1 › the uploaded fixture is fetched: its bar rises, then the row reads Fetched with the real length (9.0s)
  ✓  2 e2e/import-upload.spec.ts:48:1 › a browser that is not sending the file says so on the status screen (208ms)
  2 passed (19.5s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-1Ms1ic
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V8 — "A link to the same file, served by a local test server, does the same"

Check: `pnpm test:browser e2e/import-link.spec.ts`

Expected: A link to the fixture on the local server is entered in the sheet. The row shows the first step's bar rising, then "Fetched" with the fixture's length.

```
Running 2 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-kx5jLq/fixtures/talk.mp4
  ✓  1 e2e/import-link.spec.ts:21:1 › a link to the fixture is fetched: its bar rises, then the row reads Fetched with the real length (13.2s)
  ✓  2 e2e/import-link.spec.ts:42:1 › Find Clips sends the link, the length, the platforms and the brief the user chose (639ms)
  2 passed (22.7s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-kx5jLq
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V9 — "After the tool is stopped and started again, both projects are listed in the same state"; a project interrupted mid-step finishes after the restart

Check: `pnpm test:browser e2e/restart.spec.ts e2e/queue-through-tool.spec.ts`

Expected: After a stop and a start, the uploaded project and the link project are both listed as fetched with the same lengths. A project whose fetch was cut off by a stop finishes after the start.

```
Running 3 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-0afevt/fixtures/talk.mp4
  ✓  1 e2e/queue-through-tool.spec.ts:17:1 › a second link project waits for the first and then finishes (18.3s)
  ✓  2 e2e/queue-through-tool.spec.ts:34:1 › a project whose fetch is cut off by a stop finishes after the start (14.1s)
  ✓  3 e2e/restart.spec.ts:24:1 › the uploaded project and the link project are listed in the same state after a stop and a start (20.1s)
  3 passed (1.0m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-0afevt
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V10 — "A link that is not a link, a missing file, and no platform selected each show the error under its field, as the prototype does, and move focus to that field"

Check: `pnpm test:browser e2e/new-project-errors.spec.ts`

Expected: "Paste the full link, starting with https://" appears under Source with focus in the link field. "Choose a video file first." appears under Source with focus on the file field. "Turn on at least one platform." appears under Platforms with focus on the first platform switch. In each case the field is marked invalid and no project is created.

```
Running 5 tests using 1 worker
  ✓  1 e2e/new-project-errors.spec.ts:20:1 › the sheet has the sections, the wording and the defaults of the prototype (290ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-V4o95m/fixtures/talk.mp4
  ✓  2 e2e/new-project-errors.spec.ts:51:1 › the hint follows the chosen length, and the file field names the chosen file (645ms)
  ✓  3 e2e/new-project-errors.spec.ts:67:1 › a link that is not a link shows its error under Source and moves focus to the link field (582ms)
  ✓  4 e2e/new-project-errors.spec.ts:89:1 › a missing file shows its error under Source and moves focus to the file field (571ms)
  ✓  5 e2e/new-project-errors.spec.ts:102:1 › no platform shows its error under Platforms and moves focus to the first switch (740ms)
  5 passed (11.7s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-V4o95m
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V11 — "With no projects, the Library shows the empty state from D66, and its control opens the new project sheet"; rows show each stage state

Check: `pnpm test:browser e2e/empty-library.spec.ts e2e/library.spec.ts`

Expected: With no projects the Library shows "No Projects Yet" and a "New Project" control, and the control opens the sheet at `/new`. With projects, each row shows its title, source, length and status, and a row leads to its project.

```
Running 13 tests using 1 worker
  ✓   1 e2e/empty-library.spec.ts:13:3 › at 390 px › with no projects the Library shows the empty state, and its control opens the sheet (292ms)
  ✓   2 e2e/empty-library.spec.ts:29:3 › at 390 px › Cancel closes the sheet, returns to the Library and gives focus back to the control (858ms)
  ✓   3 e2e/empty-library.spec.ts:41:3 › at 390 px › Escape and a click outside the sheet both return to the Library (637ms)
  ✓   4 e2e/empty-library.spec.ts:57:3 › at 390 px › the sheet opened at its own address returns to the Library (697ms)
  ✓   5 e2e/empty-library.spec.ts:71:3 › at 1360 px › the empty state fills the main area, and the sidebar control opens the sheet (204ms)
  ✓   6 e2e/empty-library.spec.ts:81:3 › at 1360 px › closing the sheet returns to the screen the user was on (799ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sCpiKr/fixtures/talk.mp4
  ✓   7 e2e/library.spec.ts:25:3 › at 390 px › each row shows its title, its source and length, and its status (8.0s)
  ✓   8 e2e/library.spec.ts:47:3 › at 390 px › the Library has a large title, the plus control, the Projects group and the free space (274ms)
  ✓   9 e2e/library.spec.ts:67:3 › at 390 px › a row opens the screen of its project, and the back control returns to the Library (761ms)
  ✓  10 e2e/library.spec.ts:88:3 › at 390 px › the address of a project that does not exist leads to the Library (150ms)
  ✓  11 e2e/library.spec.ts:95:3 › at 390 px › a row follows the progress of its project without a reload (13.4s)
  ✓  12 e2e/library.spec.ts:112:3 › at 1360 px › the projects are in the sidebar and the free space is in its foot (437ms)
  ✓  13 e2e/library.spec.ts:126:3 › at 1360 px › the Library address shows the newest project beside the sidebar, marked in the list (1.6s)
  13 passed (37.0s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sCpiKr
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V12 — "Deleting a project after confirming removes it from the Library and removes its files from the data folder. Cancelling the confirmation removes nothing"

Check: `pnpm test:browser e2e/delete-project.spec.ts`

Expected: The More menu offers "Delete Project…". The confirmation names the project and says what is removed. Cancel leaves the row and the project's folder. Delete removes the row and the folder. Deleting a project while it is being fetched stops it and leaves no folder.

```
Running 4 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yQFd51/fixtures/talk.mp4
  ✓  1 e2e/delete-project.spec.ts:33:3 › at 390 px › the More menu offers Delete Project, and the confirmation names the project (670ms)
  ✓  2 e2e/delete-project.spec.ts:58:3 › at 390 px › Cancel removes neither the row nor the folder, and Delete removes both (8.1s)
  ✓  3 e2e/delete-project.spec.ts:86:3 › at 390 px › deleting a project while it is being fetched stops it and leaves no folder (2.6s)
  ✓  4 e2e/delete-project.spec.ts:112:3 › at 1360 px › the menu opens under the More control, and deleting shows the next project (1.4s)
  4 passed (21.1s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yQFd51
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V13 — "With free space reported as under 5 GB, creating a project is refused with the reason from D67"

Check: `pnpm test:browser e2e/low-disk.spec.ts`

Expected: With 3 GB reported free, "Find Clips" creates nothing. The reason appears under the source field, gives the free space and says to delete a project or free space.

```
Running 1 test using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-fnq8rW/fixtures/talk.mp4
  ✓  1 e2e/low-disk.spec.ts:21:1 › with 3 GB reported free, Find Clips creates nothing and gives the reason under the source (3.3s)
  1 passed (12.1s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-fnq8rW
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V14 — "A second project created while the first is being fetched shows as waiting and starts when the first finishes"; an upload runs while another project is processed

Check: `pnpm test:browser e2e/queue.spec.ts`

Expected: While the first project is fetched, the second reads "Waiting in queue" and its status screen names the first. It starts only after the first has finished, and finishes. A file sent meanwhile arrives in full and then waits its turn.

```
Running 2 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-4doItC/fixtures/talk.mp4
  ✓  1 e2e/queue.spec.ts:26:1 › a second project waits while the first is fetched, names it, and starts when it finishes (19.6s)
  ✓  2 e2e/queue.spec.ts:50:1 › a file sent while another project is processed arrives in full and then waits its turn (17.9s)
  2 passed (45.7s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-4doItC
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V15 — "A link the test server answers with 'not found' fails the fetch stage with a reason and a Retry control. Stop during a fetch leaves the project stopped, and Resume finishes it"

Check: `pnpm test:browser e2e/halt-project.spec.ts`

Expected: The missing link's project shows "Could Not Finish", a reason in plain words and Retry; once the server serves the file, Retry finishes it. Stop during a fetch shows "Stopped" with its reason and Resume, and Resume finishes it.

```
Running 2 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-J0tYOA/fixtures/talk.mp4
  ✓  1 e2e/halt-project.spec.ts:13:1 › a link that answers "not found" shows the reason and Retry, and Retry finishes it once repaired (8.5s)
  ✓  2 e2e/halt-project.spec.ts:38:1 › Stop during a fetch leaves the project stopped, and Resume finishes it (15.3s)
  2 passed (32.3s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-J0tYOA
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V16 — "An upload shows its progress, and a 50 MB upload arrives at the same size it was sent"

Check: `pnpm test:browser e2e/upload-size.spec.ts`

Expected: While a 50 MiB file is sent, the status screen says to keep the page open and shows a bar between its ends. The stored file has 52,428,800 bytes and the checksum of the file sent.

```
Running 1 test using 1 worker
  ✓  1 e2e/upload-size.spec.ts:31:1 › a 50 MiB upload shows its progress and arrives at the size and checksum it was sent with (7.3s)
  1 passed (9.2s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-odJXSr
Test data size: 0.05 GB (50.0 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V17 — "Opening a project, reloading the page and pressing Back each land where D51 says"; each tab has its own address

Check: `pnpm test:browser e2e/addresses.spec.ts`

Expected: Opening a project from the Library lands on `/projects/<id>`. A reload shows the same project. Back returns to the Library. A project presented as ready shows Review, Export and Results at `/projects/<id>/review`, `/export` and `/results`; a reload keeps the tab, and Back and Forward move between tabs.

```
Running 5 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-rwfd9M/fixtures/talk.mp4
  ✓  1 e2e/addresses.spec.ts:23:3 › at 390 px › a project opens at its own address, a reload shows it again, and Back returns to the Library (1.1s)
  ✓  2 e2e/addresses.spec.ts:44:3 › at 390 px › a ready project opens on its Review tab, and each tab has an address that a reload keeps (6.6s)
  ✓  3 e2e/addresses.spec.ts:69:3 › at 390 px › Back and Forward move between the tabs of a ready project (413ms)
  ✓  4 e2e/addresses.spec.ts:92:3 › at 390 px › the tab address of a project that is not ready shows its status screen (397ms)
  ✓  5 e2e/addresses.spec.ts:110:3 › at 1360 px › the tabs sit in the toolbar with the current one pressed (211ms)
  5 passed (17.5s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-rwfd9M
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V18 — "At 390 px the Library is a list above a tab bar and the new project form opens as a sheet. At 1360 px the projects are in a sidebar and the sheet is centred"; the two layouts and the sidebar change at the stated widths

Check: `pnpm test:browser e2e/shell.spec.ts e2e/layout.spec.ts`

Expected: At 390 px the list sits above a tab bar at the bottom edge, and the sheet spans the width from the bottom edge. At 1360 px the projects are in the sidebar and the sheet is centred. The layout changes at 720 px. The sidebar lies over the content at 999 px and beside it at 1000 px.

```
Running 16 tests using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-FSqY1G/fixtures/talk.mp4
  ✓   1 e2e/layout.spec.ts:47:3 › at 390 px › the Library is a list above a tab bar at the bottom edge (896ms)
  ✓   2 e2e/layout.spec.ts:65:3 › at 390 px › the new project sheet spans the width and rises from the bottom edge (475ms)
  ✓   3 e2e/layout.spec.ts:78:3 › at 1360 px › the projects are in a sidebar beside the screen (663ms)
  ✓   4 e2e/layout.spec.ts:94:3 › at 1360 px › the new project sheet is centred (470ms)
  ✓   5 e2e/layout.spec.ts:105:1 › the phone layout ends at 719 px and the desktop layout begins at 720 px (869ms)
  ✓   6 e2e/layout.spec.ts:123:1 › the sidebar lies over the content at 999 px and beside it at 1000 px (236ms)
  ✓   7 e2e/shell.spec.ts:9:1 › the page is the loading line before the width of the window is known (7ms)
  ✓   8 e2e/shell.spec.ts:19:3 › at 1360 px › the sidebar is docked with the app name, its toggle, New Project and Settings (126ms)
  ✓   9 e2e/shell.spec.ts:31:3 › at 1360 px › the toolbar carries the title of the screen (190ms)
  ✓  10 e2e/shell.spec.ts:43:3 › at 1360 px › the toggle hides the sidebar and the toolbar offers to show it again (175ms)
  ✓  11 e2e/shell.spec.ts:53:3 › at 1360 px › the sheet, the menu layer and the toast follow the app as its later siblings (116ms)
  ✓  12 e2e/shell.spec.ts:65:3 › at 860 px › the sidebar lies over the content with its scrim, and Escape closes it (172ms)
  ✓  13 e2e/shell.spec.ts:80:3 › at 860 px › a click on the scrim closes the sidebar, and so does going to another screen (269ms)
  ✓  14 e2e/shell.spec.ts:97:3 › at 390 px › the tab bar holds Library and Settings with the current one marked (201ms)
  ✓  15 e2e/shell.spec.ts:111:3 › at 390 px › the large title moves into the bar when the screen is scrolled (445ms)
  ✓  16 e2e/shell.spec.ts:127:1 › light and dark follow the system (111ms)
  16 passed (14.2s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-FSqY1G
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V19 — "Screen captures at both widths, in light and in dark, are saved"

Check: block V19

Expected: Exit 0. The evidence folder holds 24 files named `<screen>-<width>-<theme>.png`: `library`, `empty-library`, `new-project`, `status`, `project` and `settings`, at `390` and `1360`, in `light` and `dark`.

```
Running 1 test using 1 worker
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-6f9ni2/fixtures/talk.mp4
  ✓  1 e2e/captures.spec.ts:36:1 › six screens are captured at 390 and 1360 px, in light and in dark (11.1s)
  1 passed (20.2s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-6f9ni2
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code of pnpm test:browser e2e/captures.spec.ts: 0]
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
```

The folder held the same 24 names before the run. The run rewrote all 24 between 20:01:52 and
20:02:02. Twenty-two are byte for byte the committed files. The two Settings captures at 1360 px
differ in the phone address they show: `http://192.168.10.111:3100` now, `http://192.168.1.24:3100`
in the committed copies.

Result: pass

## V20 — The screens are laid out as the prototype's, on phone and desktop, in light and in dark

Check: Open every capture from V19 and record in the proof what each shows.

Expected: At 390: the Library has a large title, project rows and a tab bar with Library and Settings; the sheet rises from the bottom with Cancel, New Project and Find Clips; the status screen has a centred card with a heading, a bar and a step line; the project view has the Review, Export and Results control; Settings has five titled groups; the empty Library reads "No Projects Yet" with "New Project". At 1360: a sidebar holds Clipper, New Project, the project rows and Settings, with the screen beside it; the sheet is centred over a dimmed page. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text.

The captures are in `evidence/`.

| capture | what it shows |
| -- | -- |
| `library-390-light.png` | Large title "Library" with a round plus control above it. A Projects group of six rows, each with a title, a source line and a status: Uploading video and Fetched with a bar, Waiting in queue, Fetching video with an empty bar, Stopped, and Could not finish in orange with a warning sign. The Fetched row reads "Video link · 4 min". "50 GB free on this Mac" sits under the group, clear of the tab bar. The tab bar at the bottom holds Library, marked current, and Settings. |
| `library-390-dark.png` | The same screen on a black page with dark grey rows and white text. |
| `empty-library-390-light.png` | Large title "Library", the plus control, a film icon, "No Projects Yet", one sentence of explanation and a blue "New Project" control. The tab bar with Library and Settings. |
| `empty-library-390-dark.png` | The same screen on a black page with white text. |
| `new-project-390-light.png` | A sheet over the dimmed Library, spanning the width and reaching the bottom edge, with a grabber. Its bar holds Cancel, "New Project" and a blue Find Clips. Sections Source (YouTube Link chosen, Upload a File), Clip Length (25–60 s chosen), Platforms (TikTok, Reels and Shorts, all on) and What to Look For (Optional). The hint in the Video Link field is shortened to "https://www.youtube....". |
| `new-project-390-dark.png` | The same sheet in dark grey with white text. |
| `status-390-light.png` | A Library back control and a More control. Title "New video from link", "Video link" under it. Centred below: the heading "Finding Clips", an empty bar, the step line "Fetching video", "Step 1 of 4." and a Stop control. The tab bar. |
| `status-390-dark.png` | The same screen on a black page with white text. |
| `project-390-light.png` | The back and More controls. Title "talk", "Video link · 00:03:55 · 0 candidates". A control with Review (chosen), Export 0 and Results. A Candidates group reading "No clips in this group." The tab bar. |
| `project-390-dark.png` | The same screen on a black page with white text. |
| `settings-390-light.png` | Large title "Settings". Three titled groups are in view: AI Services (Anthropic API Key with a Save control, Scoring Model, Cutting Model, Transcription Model, and a four-line footer), Defaults for New Projects (Clip Length, Clips per Video) and Storage ("50 GB free of 460 GB on this Mac" with a bar). The tab bar lies over the second Storage row, which reads "Delete S" on its left and "days" on its right, and over the footer, which reads "Exported cl". The other two groups are below the captured area. |
| `settings-390-dark.png` | The same screen, with the same three groups and the same text under the tab bar, in dark grey with white text. |
| `library-1360-light.png` | A sidebar with Clipper, a sidebar toggle, New Project, a Projects list of the six rows with the first marked, and at its foot Settings and "50 GB free on this Mac". Beside it the newest project: title "interview.mov", the heading "Uploading Video", a bar, a step line and three lines of explanation, with a More control at the right. |
| `library-1360-dark.png` | The same screen with a dark grey sidebar, a black page and white text. |
| `empty-library-1360-light.png` | The sidebar with Clipper, New Project, an empty Projects list and Settings. Beside it the title "Library" and, centred, "No Projects Yet" with its sentence and "New Project". |
| `empty-library-1360-dark.png` | The same screen with a dark grey sidebar, a black page and white text. |
| `new-project-1360-light.png` | The sheet centred over the dimmed sidebar and page, with Cancel, "New Project" and Find Clips and the four sections. The Video Link hint reads "https://www.youtube.com/watch?v=…". |
| `new-project-1360-dark.png` | The same sheet in dark grey over a dimmed dark page. |
| `status-1360-light.png` | The sidebar with the third project marked. Beside it the title "New video from link" and, centred, "Finding Clips", an empty bar, "Fetching video", "Step 1 of 4." and Stop. |
| `status-1360-dark.png` | The same screen with a dark grey sidebar, a black page and white text. |
| `project-1360-light.png` | The sidebar with "talk" marked and reading "Ready to review". Beside it the title "talk", the Review, Export 0 and Results control in the toolbar with Review chosen, and a Candidates group reading "No clips in this group." |
| `project-1360-dark.png` | The same screen with a dark grey sidebar, a black page and white text. |
| `settings-1360-light.png` | The sidebar with Settings marked. Beside it all five group titles: AI Services, Defaults for New Projects, Storage, Open on Your Phone (an address with a Copy control) and What the Selector Has Learned. The capture ends partway through the fifth group, at the row "Needs Earlier Context". |
| `settings-1360-dark.png` | The same screen with a dark grey sidebar, dark grey groups on a black page and white text. |

Two expectations are not met, both in the Settings captures at 390 px. They show three of the five
titled groups, because each capture holds the first 844 px of a screen that scrolls. And the tab bar
covers text of the Storage group's second row and of its footer. Every other expectation is met.

Result: fail

## V21 — "At 390 px no screen scrolls sideways and no label is cut off, at the normal text size and at 200%"

Check: `pnpm test:browser e2e/text-size.spec.ts`

Expected: For the Library, the empty Library, the sheet with each source and each error, the status screen in each state, the project tabs, the delete confirmation and Settings, at 390 px, at the normal size and at 200%: no sideways scroll, no element wider than the screen, no label with clipped text.

```
Running 4 tests using 1 worker
  ✓  1 e2e/text-size.spec.ts:63:1 › the measure finds a block that is too wide, a cut label, a spilled label and a cut choice (526ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-F1jQ3e/fixtures/talk.mp4
  ✓  2 e2e/text-size.spec.ts:81:1 › with projects, every screen fits at the normal size and at 200% (18.1s)
  ✓  3 e2e/text-size.spec.ts:99:1 › the empty Library fits at the normal size and at 200% (226ms)
  ✓  4 e2e/text-size.spec.ts:114:3 › with 3 GB reported free › the low disk error fits at the normal size and at 200% (3.6s)
  4 passed (31.7s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-F1jQ3e
Test data size: 0.00 GB (3.4 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V22 — Settings holds every control of the prototype and keeps each choice

Check: `pnpm test:browser e2e/settings.spec.ts`

Expected: The five groups and their rows are present. Each of the six choices, once changed, is still chosen after a reload. The storage row gives free and total space, and the phone row gives an address with the web port.

```
Running 5 tests using 1 worker
  ✓  1 e2e/settings.spec.ts:39:3 › at 390 px › Settings has the five groups of the prototype with their rows and footers (244ms)
  ✓  2 e2e/settings.spec.ts:74:3 › at 390 px › the choices start at the defaults, and each one is kept after a reload (280ms)
  ✓  3 e2e/settings.spec.ts:100:3 › at 390 px › the storage row gives the free and the total space with a bar (155ms)
  ✓  4 e2e/settings.spec.ts:112:3 › at 1360 px › the phone row gives the address of this Mac with the web port, and Copy copies it (217ms)
  ✓  5 e2e/settings.spec.ts:125:3 › at 1360 px › the tool answers at the phone address (143ms)
  5 passed (2.6s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-jNgjqb
Test data size: 0.00 GB (0.0 MB)
The test data folder was removed.
[exit code: 0]
```

Result: pass

## V23 — The service's rules, by test name

Check: block V23

Expected: Exit 0. Passed tests show: the tools found in the configured folder, taken from the PATH when it lacks them, and a missing or broken tool named; the fixture's length read; a preview copy that is H.264 with AAC and no taller than 720 pixels; no format above 1080 pixels allowed for a link; a "not found" link reported; a three-hour source fetched; projects taken in creation order, one at a time; step state and percent stored; a project interrupted by a restart finished; stop, resume and retry, with finished steps not run again; the disk-full reason; an upload appended part by part with its size intact; a file over 4 GB refused; a new project refused under 5 GB free; delete removing the project's files.

```
collecting ... collected 224 items
clipper/media/test_locate_media_tools.py::test_tools_are_found_in_the_configured_folder PASSED [  8%]
clipper/media/test_locate_media_tools.py::test_tools_are_taken_from_the_path_when_the_folder_lacks_them PASSED [  8%]
clipper/media/test_locate_media_tools.py::test_a_missing_tool_is_named_with_the_places_searched PASSED [  9%]
clipper/media/test_locate_media_tools.py::test_a_broken_tool_is_named PASSED [ 10%]
clipper/media/test_probe_video.py::test_the_length_of_the_fixture_is_the_length_ffprobe_reports PASSED [ 15%]
clipper/media/test_make_preview_copy.py::test_the_preview_copy_is_h264_with_aac_and_no_taller_than_720_pixels PASSED [ 12%]
clipper/fetching/test_download_link.py::test_no_format_above_1080_pixels_is_allowed_for_a_link PASSED [  1%]
clipper/fetching/test_download_link.py::test_a_link_that_answers_not_found_is_reported_as_not_found PASSED [  3%]
clipper/fetching/test_fetch_stage.py::test_a_three_hour_source_is_fetched_with_a_length_of_10800_seconds PASSED [  6%]
clipper/pipeline/test_run_queue.py::test_projects_are_taken_in_creation_order_one_at_a_time PASSED [ 30%]
clipper/pipeline/test_run_queue.py::test_the_step_of_the_running_project_is_marked_running PASSED [ 30%]
clipper/pipeline/test_run_queue.py::test_the_step_percent_is_stored_and_never_falls PASSED [ 32%]
clipper/test_main.py::test_a_project_interrupted_by_a_restart_is_finished_after_the_start PASSED [ 96%]
clipper/pipeline/test_halt_project.py::test_stop_ends_the_running_step_within_two_seconds_and_leaves_the_project_stopped PASSED [ 21%]
clipper/pipeline/test_halt_project.py::test_resume_puts_a_stopped_project_back_in_the_queue_and_it_finishes PASSED [ 22%]
clipper/pipeline/test_halt_project.py::test_retry_runs_the_failed_step_again_and_not_the_steps_that_finished PASSED [ 23%]
clipper/pipeline/test_explain_failure.py::test_a_full_disk_reported_by_python_gives_the_disk_full_reason PASSED [ 18%]
clipper/projects/test_receive_upload.py::test_an_upload_is_appended_part_by_part_with_its_size_intact PASSED [ 56%]
clipper/projects/test_create_project.py::test_a_file_over_4_gb_is_refused PASSED [ 44%]
clipper/projects/test_create_project.py::test_a_new_project_is_refused_under_5_gb_free PASSED [ 45%]
clipper/projects/test_delete_project.py::test_delete_removes_the_files_of_the_project PASSED [ 46%]
[203 more lines, each ending PASSED, left out]
======================== 224 passed in 87.06s (0:01:27) ========================
[exit code: 0]
```

Result: pass

## V24 — The web app's rules, by test name

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: the three problems of a draft; lengths in seconds, minutes and hours; a file cut into 8 MiB parts, sent in order and carried on from the count the service holds.

```
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for the full link when it is "youtube.com/watch?v=abc123" 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for a file when none was chosen 0ms
 ✓ src/library/create-project/lib/find-draft-problem.test.ts > findDraftProblem > asks for a platform when every one is off 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under a minute in seconds: 45.4 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length under an hour in minutes: 235.6 0ms
 ✓ src/shared/lib/format-length.test.ts > formatLength > gives a length of an hour or more in hours and minutes: 10800 0ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > cuts a file into 8 MiB parts and sends them in order 6ms
 ✓ src/library/upload-video/lib/send-in-parts.test.ts > sendInParts > carries on from the count the service holds when a part arrives out of step 9ms
[109 more lines, each beginning with a tick, left out]
 Test Files  15 passed (15)
      Tests  117 passed (117)
[exit code: 0]
```

Result: pass

## V25 — The web app forwards through rewrites, has no proxy or middleware file, and holds no database

Check: block V25

Expected: `find` prints nothing. The first `grep` shows the rewrites in the configuration. The second `grep` prints nothing.

```
[end of find]
11:  rewrites: async () => [
[end of first grep]
[end of second grep]
```

Result: pass

## V26 — The design is the prototype's: tokens and stylesheets unchanged

Check: block V26

Expected: Five lines ending `identical` and the line `tokens identical`. The list of stylesheets holds those five, `tokens.css` and at most one more, whose content is pasted into the proof.

```
base.css identical
controls.css identical
lists.css identical
shell.css identical
pages.css identical
grep: --include=tokens.css: No such file or directory
128a129,130
> --slider-fill: var(--video-ink);
> --slider-track: var(--video-glass-edge);
153a156
> --value: 0%;
web/src/shared/styles/app.css
web/src/shared/styles/base.css
web/src/shared/styles/controls.css
web/src/shared/styles/lists.css
web/src/shared/styles/pages.css
web/src/shared/styles/shell.css
web/src/shared/styles/tokens.css
```

The line `tokens identical` was not printed. The second command printed an error and three lines
that the prototype's page does not hold. In that command the option naming `tokens.css` comes after
the `--` separator, so `grep` read it as a file name and searched every file under `web/src`. The
three lines are in `controls.css`, at lines 254 to 256, which the first command reported identical
to the prototype's. Run in zsh, where `grep` is another program, the block printed the same three
lines. Run with the option before the separator, the comparison printed:

```
tokens identical
```

The five stylesheets are identical, and the list holds the five, `tokens.css` and one more,
`app.css`:

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

Result: fail

## V27 — No CSS framework or component library; every version pinned; yt-dlp is a project dependency

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
```

Result: pass

## V28 — Libraries built into the app carry permissive licences

Check: block V28

Expected: Every licence shown is MIT, ISC, BSD, 0BSD, Apache-2.0, PSF, Unlicense or CC-BY-4.0. None is GPL, LGPL, AGPL or MPL.

The rows of the first command's table, without its ruling lines, then the second command's output:

```
│ Package                            │ License      │
│ tslib                              │ 0BSD         │
│ @playwright/test                   │ Apache-2.0   │
│ @swc/helpers                       │ Apache-2.0   │
│ baseline-browser-mapping           │ Apache-2.0   │
│ playwright                         │ Apache-2.0   │
│ playwright-core                    │ Apache-2.0   │
│ source-map-js                      │ BSD-3-Clause │
│ caniuse-lite                       │ CC-BY-4.0    │
│ electron-to-chromium               │ ISC          │
│ lru-cache                          │ ISC          │
│ picocolors                         │ ISC          │
│ semver                             │ ISC          │
│ yallist                            │ ISC          │
│ @babel/code-frame                  │ MIT          │
│ @babel/compat-data                 │ MIT          │
│ @babel/core                        │ MIT          │
│ @babel/generator                   │ MIT          │
│ @babel/helper-compilation-targets  │ MIT          │
│ @babel/helper-globals              │ MIT          │
│ @babel/helper-module-imports       │ MIT          │
│ @babel/helper-module-transforms    │ MIT          │
│ @babel/helper-string-parser        │ MIT          │
│ @babel/helper-validator-identifier │ MIT          │
│ @babel/helper-validator-option     │ MIT          │
│ @babel/helpers                     │ MIT          │
│ @babel/parser                      │ MIT          │
│ @babel/template                    │ MIT          │
│ @babel/traverse                    │ MIT          │
│ @babel/types                       │ MIT          │
│ @jridgewell/gen-mapping            │ MIT          │
│ @jridgewell/remapping              │ MIT          │
│ @jridgewell/resolve-uri            │ MIT          │
│ @jridgewell/sourcemap-codec        │ MIT          │
│ @jridgewell/trace-mapping          │ MIT          │
│ @next/env                          │ MIT          │
│ @next/swc-darwin-arm64             │ MIT          │
│ browserslist                       │ MIT          │
│ client-only                        │ MIT          │
│ convert-source-map                 │ MIT          │
│ debug                              │ MIT          │
│ escalade                           │ MIT          │
│ gensync                            │ MIT          │
│ js-tokens                          │ MIT          │
│ jsesc                              │ MIT          │
│ json5                              │ MIT          │
│ ms                                 │ MIT          │
│ nanoid                             │ MIT          │
│ next                               │ MIT          │
│ node-releases                      │ MIT          │
│ postcss                            │ MIT          │
│ react                              │ MIT          │
│ react-dom                          │ MIT          │
│ scheduler                          │ MIT          │
│ styled-jsx                         │ MIT          │
│ update-browserslist-db             │ MIT          │
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
```

Result: pass

## V29 — This milestone's commits touch nothing the boundaries exclude

Check: block V29

Expected: `data` is ignored. No video, audio, database or model file is tracked. No key is tracked. `fixtures` is under 20,480 KB. The diff against `.researches` and `docs/prototype` is empty. The app reads nothing from `docs/`.

```
.gitignore:1:/data	data
no video, audio, database or model file is tracked
no key is tracked
8	fixtures
[end of git diff --stat]
the app reads nothing from docs/
```

Result: pass

## V30 — The README and the agents' instructions name the commands

Check: block V30

Expected: `README.md` and `AGENTS.md` each name `pnpm install`, `pnpm bootstrap`, `pnpm start` and `pnpm test`. `CLAUDE.md` is `@AGENTS.md`. The README has the phone instructions.

```
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
AGENTS.md:17:- `pnpm test` runs every check: Ruff, mypy, pytest, ESLint, the web build, the TypeScript check,
AGENTS.md:20:- `pnpm test:browser <file>` runs the named browser tests alone, for example
AGENTS.md:21:  `pnpm test:browser e2e/start-command.spec.ts`. Paths are relative to `web`.
AGENTS.md:23:  a commit; `pnpm test` checks the Ruff rules and not the formatting.
[CLAUDE.md]
@AGENTS.md
[phone instructions]
5:on the Mac or on a phone on the same Wi-Fi.
49:## Open it on a phone
51:Put the phone on the same Wi-Fi as the Mac. In Clipper on the Mac, open Settings and read the
52:address under "Open on Your Phone". It is the Mac's address on your network with the web port, in
53:the form `http://192.168.0.12:3000`. Type it into the phone's browser.
```

Result: pass

## V31 — The code follows the standards the hooks enforce, and both layouts are recorded

Check: block V31

Expected: Every finding printed carries `[advisory]`; none appears without it. Both structure files exist, the web one begins `follows: screaming-architecture`, and neither has a line starting with `#`.

```
Total hook-level violations: 0
[end of findings]
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
```

The review read 249 files and reported each one clean, so it printed no finding of either kind.

Result: pass

## V32 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

```
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/settings-1360-dark.png
 M docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence/settings-1360-light.png
```

Result: pass
