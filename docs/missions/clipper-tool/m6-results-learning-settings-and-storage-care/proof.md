# Proof: m6-results-learning-settings-and-storage-care

Attempt: 2
Result: fail
Commit: d2f88ae

| id | result |
| -- | ------ |
| V1 | pass |
| V2 | fail |
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
| V22 | pass |
| V21 | pass |

The checks were run from the worktree's root at `d2f88ae` with nothing uncommitted before V1, on
2026-10-07 from 07:45 to 09:10, in the order of the table, V22 before V21. The blocks were cut
out of `validation.md` into files and run with `bash`, as written; V3's block got the two folders
V2 named in the places it leaves for them. Ports 3000, 8765, 3100 and 8865 were free before V1.
The Mac was on mains power and on its network at 192.168.10.111, and its power log holds no
sleep and no wake between 07:40 and 09:19. Lines in square brackets are markers the validator
added; every other line in a code block is printed by the commands. A check that is one command
was run with `echo "exit code: $?"` after it, which prints the last line of its code block. A
sentence under a code block that names a test file says where a passed test holds something its
name does not state.

V2 fails. In the clone `pnpm test` ended with exit code 1: eight gates passed and Playwright
failed, with 199 of 200 browser tests passed. The test that failed is the one of
`e2e/learning.spec.ts`. The same test passed in V6, run alone in the worktree. Every other check
passes.

The evidence folder already held thirteen files, committed with attempt 1. V6 wrote
`learning-requests.json` again and V14 the eight captures, so the captures opened for V15 are
the ones this run made. All nine came out byte for byte as committed. The run replaced
`v1-start-log.txt`, `v2-test-command.txt`, `v11-service-tests.txt` and `v12-unit-tests.txt`.

## V1 — "The README's setup, start, test and phone instructions work when followed from a fresh copy of the repository", for setup, start and phone; "Settings shows an address made of the Mac's local network address and port 3000, and the tool answers a request sent to that address"; "The free disk figure is within 1 GB of what the system reports"; a first start shows no project (R2, R9, R21, R54, A145, A147, A154)

Check: block V1

Expected: The two commit lines are equal. `pnpm install` and `pnpm bootstrap` each end with exit code 0, and the last line of the bootstrap is `Clipper is set up. Start it with "pnpm start".` The start prints `Clipper is running at http://localhost:3000`. The Library answers 200 with the title Clipper, and the answer of the projects holds no project. The phone address Settings gives is `http://`, then the address of this Mac on its network as the line above prints it, then `:3000`. The three answers of the phone address are 200. The free space Settings gives differs from the one `df` gives by less than 1.0 GB, and so do the two totals. The start command ends with code 130 after the interrupt, and nothing is printed between that line and "end of listeners after the interrupt".

```
commit of the worktree: d2f88aef0fdeed37d68a41e6dd901844296b7599
commit of the clone:    d2f88aef0fdeed37d68a41e6dd901844296b7599
exit code of pnpm install: 0
exit code of pnpm bootstrap: 0
Clipper is set up. Start it with "pnpm start".
Clipper is running at http://localhost:3000
library at localhost: 200
<title>Clipper</title>
{"projects":[],"freeDiskGb":19.7}
address of this Mac on its network: 192.168.10.111
df gives 19.7 GB free of 460.4 GB
Settings gives 19.7 GB free of 460.4 GB
Settings gives the phone address http://192.168.10.111:3000
answer of the phone address to / is 200
answer of the phone address to /settings is 200
answer of the phone address to /api/health is 200
exit code of the start command: 130
end of listeners after the interrupt
```

The two commit lines are equal. The phone address is `http://`, the address of this Mac as the
line above it prints it, and `:3000`. Settings and `df` give the same free space and the same
total, to a tenth of a gigabyte. Nothing stands between the exit code of the start command and the
closing line.

The last seven lines of the start's output, which the block keeps in `start.log` and which is
saved as `evidence/v1-start-log.txt`:

```
▲ Next.js 16.3.8
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
✓ Ready in 116ms
✓ Running next.config.ts took 23ms
Clipper is running at http://localhost:3000
 ELIFECYCLE  Command failed with exit code 130.
```

Result: pass

## V2 — "The test command passes"; the README's test instructions from a fresh copy; one command runs every check (R9, R12, A147)

Check: block V2

Expected: The line after the run gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. The Fixtures lines name four built videos. The closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine gates passed at `0ec8f3d`, with 1,123 service tests, 362 unit tests and 173 browser tests (M5's `proof.md`, V1), and only mission documents changed up to `5ab7552`, where this milestone starts. In the planner's clone of `5ab7552` eight gates passed and Playwright failed with 171 of 173: the Mac slept for eight minutes on an empty battery during one test, and one test met the lost change of A149. Both files passed when run again in the clone. No gate may fail. The named browser tests end with exit code 0 and 4 passed. Nothing is printed between the exit code of the named browser tests and "end of the clone's changes".

The output, with the lines of passed tests left out of the part `pnpm test` printed.
`evidence/v2-test-command.txt` holds that part whole.

```

> clipper@0.1.0 test /private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper
> node scripts/run-tests.mjs


--- Fixtures
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv/fixtures/long-talk.mp4
/private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/.cache/whisper/tiny

--- Ruff
All checks passed!

--- mypy
Success: no issues found in 236 source files

--- pytest
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0
rootdir: /private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collected 1275 items

[103 lines of passed tests]

======================= 1275 passed in 579.52s (0:09:39) =======================

--- ESLint

--- Web build
▲ Next.js 16.3.8 (Turbopack)
✓ Running next.config.ts took 67ms

  Creating an optimized production build ...
✓ Compiled successfully in 3.1s
  Running TypeScript ...
  Finished TypeScript in 3.5s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/5) ...
  Generating static pages using 7 workers (1/5) 
  Generating static pages using 7 workers (2/5) 
  Generating static pages using 7 workers (3/5) 
✓ Generating static pages using 7 workers (5/5) in 170ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /new
├ ƒ /projects/[id]
├ ƒ /projects/[id]/export
├ ƒ /projects/[id]/results
├ ƒ /projects/[id]/review
├ ƒ /projects/[id]/review/[clip]
└ ○ /settings


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


--- TypeScript check

--- Vitest

 RUN  v5.0.3 /private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web


 Test Files  38 passed (38)
      Tests  411 passed (411)
   Start at  07:56:39
   Duration  1.37s (transform 65%, import 20%, tests 10%, worker 5%)

  Transform  transforming modules took 2.83s · 65% of tracked time, re-done on every run
             persist transforms across runs with fsModuleCache: true
             learn more: https://vitest.dev/guide/improving-performance#caching-between-reruns


--- Playwright

Running 200 tests using 1 worker

[49 lines of passed tests]
  ✘   50 e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it (1.1m)
[150 lines of passed tests]


  1) e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it 

    SyntaxError: Unexpected token 'I', "Internal S"... is not valid JSON

       at support/service-api.ts:68

      66 |   const deadline = Date.now() + STATUS_TIMEOUT_MS;
      67 |   for (;;) {
    > 68 |     const project = await readProject(request, projectId);
         |                     ^
      69 |     if (project.status === status) return project;
      70 |     if (Date.now() > deadline) {
      71 |       throw new Error(`The project did not become ${status}: ${JSON.stringify(project)}`);
        at waitForStatus (/private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web/e2e/support/service-api.ts:68:21)
        at cutTalkAndKeepRequests (/private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web/e2e/support/learned-history.ts:55:3)
        at /private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web/e2e/learning.spec.ts:90:23

    Error Context: test-results/learning-two-rejections-wi-1ad05-nd-Forget-All-of-It-ends-it/error-context.md

    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/learning-two-rejections-wi-1ad05-nd-Forget-All-of-It-ends-it/trace.zip
    Usage:

        pnpm exec playwright show-trace test-results/learning-two-rejections-wi-1ad05-nd-Forget-All-of-It-ends-it/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it 
  199 passed (39.3m)

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
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv
Test data size: 0.21 GB (210.6 MB)
The test data folder was removed.
 ELIFECYCLE  Test failed. See above for more details.
exit code of pnpm test: 1

Running 4 tests using 1 worker

  ✓  1 e2e/start-command.spec.ts:14:1 › the tool opens at the address the start command prints (215ms)
  ✓  2 e2e/start-command.spec.ts:23:1 › the service answers through the web port (40ms)
  ✓  3 e2e/start-command.spec.ts:30:1 › the web port is open on the network address and the service port is closed there (9ms)
  ✓  4 e2e/start-command.spec.ts:40:1 › every request of the page goes to the address of the tool (2.1s)

  4 passed (5.6s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-qGhqAy
Test data size: 0.07 GB (71.1 MB)
The test data folder was removed.
exit code of the named browser tests: 0
end of the clone's changes
```

The line after the run gives exit code 1, where the expected cell has 0. Eight gates are reported
as passed and Playwright as failed: 199 of 200 browser tests passed, and the test of
`e2e/learning.spec.ts` failed. It stopped at line 90 of its file, where it waits for the first
talk made after the seeded set to become ready. The answer to a read of that project started with
`Internal S` and was no JSON. The same test passed in V6, run alone in the worktree.

The rest is as the expected cell gives it. The Fixtures lines name four built videos. pytest
passed 1,275 tests and Vitest 411, against 1,123 and 362 of the baseline, and the browser tests
number 200 against 173. The closing lines name the folder that held the run's data, give its size
as 0.21 GB and say it was removed. The named browser tests ended with exit code 0 and 4 passed,
and nothing is printed between that line and "end of the clone's changes".

The expected cell says that no gate may fail, so the check fails.

Result: fail

## V3 — Test data and the clone are removed, nothing of the tool is left listening, and no tracked file of the worktree changed (R56, R57)

Check: block V3

Expected: Each of the three `ls` reports that its folder does not exist. Nothing is printed before "end of listeners". Every path `git status` lists is inside this milestone's folder.

The block was run with the two folders V2 named in the places it leaves for them:
`/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv` for `pnpm test` and
`/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-qGhqAy` for the named browser
tests.

```
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv: No such file or directory
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-qGhqAy: No such file or directory
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T//clipper-m6-fresh-copy: No such file or directory
end of listeners
 M docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v1-start-log.txt
 M docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v2-test-command.txt
```

The two paths `git status` lists are evidence files of this milestone's folder: the start log
saved after V1 and the output V2 saved.

Result: pass

## V4 — What M1 to M5 built still holds beside this milestone (R6, R13 to R50)

Check: block V4

Expected: The count is 173 or more. The closing line says that no test of these files failed.

```
178
no test of these files failed
```

The test that failed in V2 is in `e2e/learning.spec.ts`, which is not among the files this check
names.

Result: pass

## V5 — "Views entered on the Results tab are still there after a reload, and for a seeded set the order and the summary sentence are correct."; the Results tab at its address with the prototype's two groups (R3, R6, R51, A140, A141)

Check: `pnpm test:browser e2e/results-tab.spec.ts`

Expected: A talk with no kept clip shows "No Results Yet" with "Go to Review", and one with a kept clip that is not exported shows "Go to Export". With `c01` to `c03` exported the tab lists three rows with the ranks 01, 02 and 03, their titles and empty fields, and reads "Enter views for at least two clips." With the seeded views typed, "Ranking Against Outcome" lists "Almost everyone gets price wrong" with 48,000, "Hire for the habits you cannot teach" with 5,400 and "The worst day my bakery ever had" with 1,200, in that order, under "The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2, 1.", with the first bar the longest. After a reload the three fields hold 1200, 5400 and 48000, the outcome is the same, and the service gives the same views. 90000 typed for `c01` gives "The selector’s first pick performed best. Ranks in order of views: 1, 3, 2." An emptied field and a typed 0 each take their clip out of the outcome, also after a reload. A clip rejected after its export keeps its row. The project's row reads "Exported · 3 clips exported" before the views and "Exported · 3 clips exported, results logged" after them. At 390 px the tab lists the same rows and stores a typed number.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/results-tab.spec.ts


Running 6 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IaV8g7/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IaV8g7/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IaV8g7/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IaV8g7/fixtures/long-talk.mp4
  ✓  1 e2e/results-tab.spec.ts:92:3 › at 1360 px › a talk with no kept clip shows No Results Yet with Go to Review, and one with a kept clip that is not rendered shows Go to Export (23.6s)
  ✓  2 e2e/results-tab.spec.ts:115:3 › at 1360 px › with three clips exported the tab lists their rows with empty fields, and the outcome follows a typed number at once and waits for two clips with views (49.5s)
  ✓  3 e2e/results-tab.spec.ts:146:3 › at 1360 px › the seeded views are listed by their views under the sentence with the longest bar first, are all there after a reload, and the row in the sidebar reads results logged (56.9s)
  ✓  4 e2e/results-tab.spec.ts:174:3 › at 1360 px › 90000 for the first pick names it best, and an emptied field and a typed 0 each take their clip out of the outcome, also after a reload (50.9s)
  ✓  5 e2e/results-tab.spec.ts:206:3 › at 1360 px › a clip rejected after its export keeps its row and its views (34.6s)
  ✓  6 e2e/results-tab.spec.ts:224:3 › at 390 px › on a phone the tab lists the same rows, and a number typed there is stored (52.0s)

  6 passed (4.8m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IaV8g7
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/results-tab.spec.ts` holds what the names leave out: the ranks 01, 02 and 03 with the
three titles and empty fields, "Enter views for at least two clips.", the sentence of the seeded
set word for word, the three titles beside 48,000, 5,400 and 1,200 in that order, the first bar at
the full width of its track, the fields 1200, 5400 and 48000 and the same views from the service
after the reload, the sentence for 90000, and the row "Exported · 3 clips exported" before the
views and "Exported · 3 clips exported, results logged" after them.

Result: pass

## V6 — "After clips are rejected with reasons and views are logged, the selection request for a new project contains the note from D40. After "Forget all of it", it does not."; what a deleted project added to the history stays (R20, R52, A142, A143, A144)

Check: block V6

Expected: The exit code of the browser tests is 0, with 1 test passed: it makes the seeded set, with the rejections chosen from the reject menu and the views typed on the Results tab, deletes that talk, makes a second talk, presses "Forget All of It" and makes a third. `withHistory` gives the rejections `{"cutOff": 1, "needsContext": 0, "notInteresting": 1, "repeat": 0}` and four requests: one `score` of every window and one `cut` each of `w01`, `w02` and `w03`. Under each stand the same two lines: "Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip." and "Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds." `afterForgetting` gives four zeros and the same four requests, each with "no note". The last line counts 1 different note.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/learning.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PyyEk2/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PyyEk2/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PyyEk2/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PyyEk2/fixtures/long-talk.mp4
  ✓  1 e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it (1.6m)

  1 passed (1.9m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PyyEk2
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code of the browser tests: 0
withHistory | rejections Settings gave: {"cutOff": 1, "needsContext": 0, "notInteresting": 1, "repeat": 0}
  score of every window by claude-sonnet-5-5
    Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip.
    Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds.
  cut of w01 by claude-opus-5-5
    Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip.
    Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds.
  cut of w02 by claude-opus-5-5
    Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip.
    Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds.
  cut of w03 by claude-opus-5-5
    Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip.
    Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds.
afterForgetting | rejections Settings gave: {"cutOff": 0, "needsContext": 0, "notInteresting": 0, "repeat": 0}
  score of every window by claude-sonnet-5-5
    no note
  cut of w01 by claude-opus-5-5
    no note
  cut of w02 by claude-opus-5-5
    no note
  cut of w03 by claude-opus-5-5
    no note
different notes among the requests made with a history: 1
[block exit: 0]
```

`web/e2e/learning.spec.ts` rejects the two clips from the reject menu, types the views on the
Results tab, deletes the talk, makes the second talk, presses "Forget All of It" and makes the
third.

Result: pass

## V7 — "Every Settings control works", for what the selector has learned; the phone address in the browser (R52, R54, A144)

Check: `pnpm test:browser e2e/settings.spec.ts`

Expected: Settings has the prototype's five groups, with "Forget All of It" switched on. With no history the four counts are 0. With two clips of the talk rejected on the Review tab as "Not Interesting" and "Cut Off Mid-Thought", the rows read Cut Off Mid-Thought 1, Not Interesting 1, Needs Earlier Context 0 and Repeats Another Clip 0. "Forget All of It" shows "The selector forgot what it had learned" and four zeros, a reload shows four zeros, and the Review tab still lists the two rejected clips with their reasons. Each of the six choices is kept after a reload. The phone row gives the address of this Mac with the web port, and the tool answers at it.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/settings.spec.ts


Running 11 tests using 1 worker

  ✓   1 e2e/settings.spec.ts:87:3 › at 390 px › Settings has the five groups of the prototype with their rows and footers (421ms)
  ✓   2 e2e/settings.spec.ts:123:3 › at 390 px › the choices start at the defaults, and each one is kept after a reload (465ms)
  ✓   3 e2e/settings.spec.ts:149:3 › at 390 px › Save with nothing typed asks for the key and sends nothing (289ms)
  ✓   4 e2e/settings.spec.ts:160:3 › at 390 px › a saved key is shown by its last four characters, also after a reload, and Remove brings the field back (430ms)
  ✓   5 e2e/settings.spec.ts:186:3 › at 390 px › a key the service refuses is answered in the service’s words, and the field is emptied (327ms)
  ✓   6 e2e/settings.spec.ts:197:3 › at 390 px › the storage row gives the free and the total space with a bar (224ms)
  ✓   7 e2e/settings.spec.ts:205:3 › at 390 px › with nothing learned each of the four reasons reads 0, and Forget All of It is switched on (246ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-MstS2t/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-MstS2t/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-MstS2t/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-MstS2t/fixtures/long-talk.mp4
  ✓   8 e2e/settings.spec.ts:217:3 › at 390 px › two clips rejected with a reason on the Review tab are counted, and Forget All of It forgets them and leaves the clips rejected (23.0s)
  ✓   9 e2e/settings.spec.ts:253:3 › at 390 px › a refusal to forget shows the service’s sentence and leaves the numbers (311ms)
  ✓  10 e2e/settings.spec.ts:276:3 › at 1360 px › the phone row gives the address of this Mac with the web port, and Copy copies it (319ms)
  ✓  11 e2e/settings.spec.ts:289:3 › at 1360 px › the tool answers at the phone address (232ms)

  11 passed (45.8s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-MstS2t
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/settings.spec.ts` holds what the names leave out: the five headings of the groups, the
four rows with 1, 1, 0 and 0 after the two rejections, the toast "The selector forgot what it had
learned", four zeros before and after a reload, the clips `c05` and `c06` still rejected on the
Review tab with their reasons in what the service holds, and each of the six choices at its
changed value after a reload.

Result: pass

## V8 — "Changed model choices appear in the next selection request, and a changed default clip length is preselected in the new project form."; the clips per video; the free disk figure on the screens (R33, R34, R36, R54, A69, A145)

Check: `pnpm test:browser e2e/settings-effect.spec.ts`

Expected: With Claude Haiku 4.5 chosen for scoring and Claude Fable 5.1 for cutting in Settings, the next talk sends one score request that names `claude-haiku-4-5`, with no effort setting, and three cut requests that name `claude-fable-5-1`. With 4 clips per video chosen, the next talk ends ready with four candidates and each cut task asks for 4. With 60–180 s chosen, the new project sheet opens with "60–180 s" selected, also after a reload, and a project made from it has the limits 60 and 180. With the default back, the sheet opens at "25–60 s". A length chosen in the sheet before Settings answers is kept. Started without a reported figure, the tool gives a free space and a total within 1 GB of what the Mac gives for the disk of the data folder, and Settings and the sidebar show that free space rounded down to whole gigabytes.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/settings-effect.spec.ts


Running 6 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PZfeil/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PZfeil/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PZfeil/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PZfeil/fixtures/long-talk.mp4
  ✓  1 e2e/settings-effect.spec.ts:85:1 › with Claude Haiku 4.5 chosen for scoring and Claude Fable 5.1 for cutting, the next talk asks Haiku once without an effort setting and Fable three times (22.5s)
  ✓  2 e2e/settings-effect.spec.ts:108:1 › with 4 chosen as the clips per video, the next talk ends ready with four candidates, and each cut task asks for 4 (19.4s)
  ✓  3 e2e/settings-effect.spec.ts:128:1 › with 60–180 s chosen as the clip length, the new project sheet opens with it selected, also after a reload, and a project made from it has the limits 60 and 180 (1.0s)
  ✓  4 e2e/settings-effect.spec.ts:153:1 › a length chosen in the sheet before Settings answers is kept, and the sheet opens at 25–60 s while it waits (928ms)
  ✓  5 e2e/settings-effect.spec.ts:170:1 › the sheet keeps 25–60 s when Settings cannot be read (478ms)
  ✓  6 e2e/settings-effect.spec.ts:188:3 › started without a reported figure › the tool gives the free space and the total of the data folder’s disk within 1 GB, and Settings and the sidebar show the free space rounded down to whole gigabytes (4.5s)

  6 passed (1.1m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-PZfeil
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/settings-effect.spec.ts` holds what the names leave out: the models `claude-haiku-4-5`
once and `claude-fable-5-1` three times, no effort setting in the score request, and the sheet at
"25–60 s" once the default is put back.

Result: pass

## V9 — "A source older than the retention setting is removed by the cleanup. Its project still opens, the Review tab shows the notice from D56, the Export tab states that the source is gone, and its exports are untouched." (R45, R53, A146)

Check: `pnpm test:browser e2e/retention.spec.ts`

Expected: A talk with `c01` exported keeps its source and its preview copy when the tool is started six days later by its clock. Started eight days later, the talk's folder holds neither, and holds the transcript, the filmstrip frames and `exports/01-c01.mp4` at the size it had. The Library lists the talk as exported. Its Review tab shows "Preview unavailable. The source video was deleted to free space." in place of the preview, with its six candidates. Its Export tab shows "The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.", has Render switched off, and "Download MP4" saves the file. Its Results tab lists the clip. With "Never" chosen and the clock 400 days ahead the source stays, and with "3 days" and the clock four days ahead it is removed.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/retention.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPgTTw/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPgTTw/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPgTTw/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPgTTw/fixtures/long-talk.mp4
  ✓  1 e2e/retention.spec.ts:79:3 › at 1360 px › a talk with a clip exported keeps its source and its preview copy when the tool is started six days later by its clock (34.2s)
  ✓  2 e2e/retention.spec.ts:95:3 › at 1360 px › started eight days later the talk has lost its source and its preview copy and nothing else, and its Review, Export and Results tabs still open (35.4s)
  ✓  3 e2e/retention.spec.ts:122:3 › at 1360 px › with Never chosen in Settings the source stays 400 days later, and with 3 days it is removed four days later (38.3s)
  ✓  4 e2e/retention.spec.ts:150:3 › at 390 px › on a phone the Review list of a talk without its source opens the clip with the notice in place of the preview (34.9s)

  4 passed (2.7m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPgTTw
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/retention.spec.ts` holds what the names leave out: after the start eight days later the
folder holds every file it held but the source and the preview copy, the Library row reads
"Exported · 1 clip exported", the Review tab shows "Preview unavailable. The source video was
deleted to free space." with six candidates, the Export tab shows its notice with Render switched
off, the downloaded file has the size the export had, and the Results tab lists the clip.

Result: pass

## V10 — "Deleting a project that has exports removes its export files."; the history outlives the project (R20, A142)

Check: `pnpm test:browser e2e/delete-project.spec.ts`

Expected: With `c01` exported and `c06` rejected with a reason, Delete Project from the More menu removes the talk's folder with `exports/01-c01.mp4` and leaves the Library empty, and Settings still counts the rejection. Cancel removes nothing. The tests of M1 in this file pass.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/delete-project.spec.ts


Running 5 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gSD2pY/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gSD2pY/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gSD2pY/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gSD2pY/fixtures/long-talk.mp4
  ✓  1 e2e/delete-project.spec.ts:41:3 › at 390 px › the More menu offers Delete Project, and the confirmation names the project (1.0s)
  ✓  2 e2e/delete-project.spec.ts:66:3 › at 390 px › Cancel removes neither the row nor the folder, and Delete removes both (16.1s)
  ✓  3 e2e/delete-project.spec.ts:94:3 › at 390 px › deleting a project while it is being fetched stops it and leaves no folder (5.0s)
  ✓  4 e2e/delete-project.spec.ts:120:3 › at 1360 px › the menu opens under the More control, and deleting shows the next project (1.9s)
  ✓  5 e2e/delete-project.spec.ts:142:3 › at 1360 px › deleting a talk with an exported clip removes its folder with the export and leaves the Library empty, and Settings still counts its rejection (31.0s)

  5 passed (1.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gSD2pY
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/delete-project.spec.ts` rejects `c06` as cut off before the delete, finds `01-c01.mp4` in
`exports` before it and no folder after it, and reads 1, 0, 0 and 0 in Settings.

Result: pass

## V11 — The service's rules for the history, the note, the results, Settings and the cleanup, by test name (R20, R51 to R54, A140 to A146)

Check: block V11

Expected: The exit code of pytest is 0. The count of passed tests of the three new packages is 40 or more, and no service test failed. Among the passed tests of the saved output: a change of a clip that arrives while another is being stored applied to what that one stored, and a hundred pairs of changes sent together all stored whole; a database made by M5 upgraded with its projects, candidates, reviews and renders unchanged, its decisions copied into the history, its logged count 0 and its projects imported at the upgrade; a decision entering the history, moving to the end when it changes, and leaving when the clip is undecided; a change of a title or a point leaving the history as it was; the 50 newest of 60 decisions; a deleted project's entries staying; no note from an empty history; the first line with all four reasons; the second line from three, seven and nine clips with views, and none from two; the note in the task of the score request and of every cut request, and in neither the instructions nor the transcript part; no `note` field without a history; the rejections in the settings answer; the forget address emptying the history and leaving the choices and the key; only clips with a finished file in the results, a rejected one among them; views of 1 and of 9,999,999,999 stored and 0, a fraction, a larger number and a clip without a file refused; cleared views leaving the count and the history; a project without candidates answering with no clips; the source and the preview copy of a ready project removed past the retention and kept before it, at 3, 7 and 30 days; "Never" removing nothing; a failed, a stopped, a waiting and a transcribed project keeping their source; a project with a clip in the queue passed over; a tool started with its clock ahead answering with the source gone; through the whole app, the two lines of the note in the four requests of the talk made after the seeded set, and no note after forgetting.

```
exit code of pytest: 0
======================= 1275 passed in 560.34s (0:09:20) =======================
98
no service test failed
[block exit: 0]
```

The count of passed tests of the three new packages is 98. The passed tests of the saved output,
`evidence/v11-service-tests.txt`, that the expected cell names, in its order:

```
clipper/review/test_change_clip.py::test_a_change_that_arrives_while_another_waits_to_be_stored_is_applied_to_what_that_one_stored PASSED [ 49%]
clipper/review/test_change_clip.py::test_a_hundred_pairs_of_changes_sent_from_two_threads_at_the_same_moment_are_all_stored_whole PASSED [ 49%]
clipper/storage/test_open_database.py::test_a_database_made_by_m5_keeps_its_rows_and_copies_its_decisions_into_the_history PASSED [ 92%]
clipper/storage/test_open_database.py::test_a_database_made_by_m5_opens_with_its_projects_imported_at_the_moment_of_the_upgrade PASSED [ 92%]
clipper/review/test_review_store.py::test_a_kept_clip_enters_the_history_under_its_project_and_its_name PASSED [ 55%]
clipper/review/test_review_store.py::test_a_rejection_enters_the_history_with_its_reason PASSED [ 55%]
clipper/review/test_review_store.py::test_rejecting_a_kept_clip_leaves_one_entry_for_it_and_makes_it_the_newest PASSED [ 55%]
clipper/review/test_review_store.py::test_a_changed_reason_leaves_one_entry_for_the_clip_and_makes_it_the_newest PASSED [ 55%]
clipper/review/test_review_store.py::test_a_clip_set_back_to_undecided_leaves_the_history PASSED [ 55%]
clipper/review/test_review_store.py::test_a_change_of_the_title_or_of_a_point_leaves_the_history_as_it_was PASSED [ 55%]
clipper/learning/test_history_store.py::test_of_60_decisions_the_50_newest_are_given_and_an_older_rejection_is_not_counted PASSED [  2%]
clipper/learning/test_write_note.py::test_60_decisions_read_the_last_50_and_count_the_50_newest PASSED [  3%]
clipper/review/test_review_store.py::test_deleting_the_project_leaves_its_entries_in_the_history PASSED [ 55%]
clipper/storage/test_open_database.py::test_the_history_stays_when_its_project_is_deleted PASSED [ 92%]
clipper/results/test_router.py::test_deleting_the_project_removes_its_views_and_leaves_its_outcomes PASSED [ 43%]
clipper/learning/test_write_note.py::test_no_history_gives_no_note PASSED [  3%]
clipper/learning/test_write_note.py::test_two_rejections_among_five_decisions_name_all_four_reasons_two_of_them_at_0 PASSED [  3%]
clipper/learning/test_write_note.py::test_two_clips_with_views_give_no_second_line PASSED [  3%]
clipper/learning/test_write_note.py::test_three_clips_with_views_give_thirds_of_one_clip_each PASSED [  4%]
clipper/learning/test_write_note.py::test_seven_clips_with_views_give_thirds_of_two PASSED [  4%]
clipper/learning/test_write_note.py::test_nine_clips_give_thirds_of_three_with_their_hook_types_by_number_and_both_lengths PASSED [  4%]
clipper/selection/test_score_stage.py::test_with_a_history_the_score_request_carries_the_note_in_its_task_and_nowhere_else PASSED [ 76%]
clipper/selection/test_cut_stage.py::test_with_a_history_the_score_request_and_each_cut_request_carry_the_same_note_in_their_task PASSED [ 68%]
clipper/selection/test_score_stage.py::test_with_an_empty_history_the_score_task_is_the_task_it_was_and_has_no_note PASSED [ 76%]
clipper/selection/test_cut_stage.py::test_with_an_empty_history_each_of_the_four_tasks_is_the_task_it_was_and_has_no_note PASSED [ 69%]
clipper/settings/test_router.py::test_each_reason_is_given_the_number_of_its_rejections_and_one_without_a_reason_is_in_none PASSED [ 89%]
clipper/settings/test_router.py::test_forgetting_answers_no_rejection_and_so_does_a_later_read_and_both_lists_are_empty PASSED [ 89%]
clipper/settings/test_router.py::test_forgetting_leaves_the_six_choices_and_the_saved_key_as_they_were PASSED [ 89%]
clipper/results/test_describe_results.py::test_only_the_clips_with_a_finished_file_are_listed_by_rank_a_rejected_one_among_them PASSED [ 40%]
clipper/results/test_router.py::test_views_at_both_ends_of_the_range_are_stored[1] PASSED [ 42%]
clipper/results/test_router.py::test_views_at_both_ends_of_the_range_are_stored[9999999999] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body0] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body1] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body2] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body3] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body4] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body5] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body6] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body7] PASSED [ 42%]
clipper/results/test_router.py::test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing[body8] PASSED [ 43%]
clipper/results/test_router.py::test_views_for_a_clip_without_a_finished_file_and_for_an_unknown_clip_are_refused[c04] PASSED [ 43%]
clipper/results/test_router.py::test_views_for_a_clip_without_a_finished_file_and_for_an_unknown_clip_are_refused[c07] PASSED [ 43%]
clipper/results/test_describe_results.py::test_cleared_views_are_gone_the_count_falls_and_the_outcome_leaves_the_history PASSED [ 40%]
clipper/results/test_describe_results.py::test_a_project_with_no_candidates_answers_with_no_clips PASSED [ 41%]
clipper/retention/test_remove_old_sources.py::test_a_ready_project_imported_eight_days_before_loses_its_source_and_its_preview_at_seven_days PASSED [ 43%]
clipper/retention/test_remove_old_sources.py::test_a_ready_project_imported_seven_days_before_or_later_keeps_both_at_seven_days[0] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_a_ready_project_imported_seven_days_before_or_later_keeps_both_at_seven_days[6] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_a_ready_project_imported_seven_days_before_or_later_keeps_both_at_seven_days[7] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_the_retention_chosen_in_settings_decides_at_3_and_30_days_and_never_removes_nothing[3-4-False] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_the_retention_chosen_in_settings_decides_at_3_and_30_days_and_never_removes_nothing[3-2-True] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_the_retention_chosen_in_settings_decides_at_3_and_30_days_and_never_removes_nothing[30-29-True] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_the_retention_chosen_in_settings_decides_at_3_and_30_days_and_never_removes_nothing[30-31-False] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_the_retention_chosen_in_settings_decides_at_3_and_30_days_and_never_removes_nothing[never-1000-True] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_a_project_that_has_not_reached_its_clips_keeps_its_source_at_any_age[failed] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_a_project_that_has_not_reached_its_clips_keeps_its_source_at_any_age[stopped] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_a_project_that_has_not_reached_its_clips_keeps_its_source_at_any_age[queued] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_a_project_that_has_not_reached_its_clips_keeps_its_source_at_any_age[processing] PASSED [ 44%]
clipper/retention/test_remove_old_sources.py::test_a_project_that_has_not_reached_its_clips_keeps_its_source_at_any_age[fetched] PASSED [ 45%]
clipper/retention/test_remove_old_sources.py::test_a_project_that_has_not_reached_its_clips_keeps_its_source_at_any_age[transcribed] PASSED [ 45%]
clipper/retention/test_remove_old_sources.py::test_a_project_with_a_clip_waiting_keeps_both_and_loses_them_once_the_render_is_done PASSED [ 45%]
clipper/retention/test_source_cleaner.py::test_a_tool_started_with_its_clock_eight_days_ahead_answers_with_the_source_gone PASSED [ 45%]
clipper/results/test_whole_app.py::test_the_four_requests_of_the_talk_made_after_the_seeded_set_carry_the_two_lines_of_the_note PASSED [ 43%]
clipper/results/test_whole_app.py::test_after_the_forget_address_the_four_requests_of_a_third_talk_carry_no_note PASSED [ 43%]
```

`service/clipper/storage/test_open_database.py` holds the logged count 0 of the upgraded project,
and `service/clipper/results/test_router.py` refuses 0, a negative number, 1200.5, a number above
9,999,999,999 and five bodies of another form.

Result: pass

## V12 — The web app's rules, by test name (A140, A141, A144, A145)

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: typed texts read as views or as none; no order from one clip with views; the order, the shares and the sentence of the seeded set; "The selector’s first pick performed best." for a set led by rank 1; rank 1 before rank 2 between equal views; views shown before the service answers, and a second number for one clip sent only once the first is answered; a second change of a clip in the review shown at once and sent only once the first is answered, and a change of another clip sent without waiting; a refusal; the four rows of what the selector has learned with their numbers; a draft that takes the default clip length and one that keeps a chosen length; the row of an exported project with and without logged results.

The closing lines of the output, which is saved whole as `evidence/v12-unit-tests.txt`:

```
 Test Files  38 passed (38)
      Tests  411 passed (411)
   Start at  08:59:01
   Duration  1.28s (transform 61%, import 23%, tests 12%, worker 4%)

  Transform  transforming modules took 2.39s · 61% of tracked time, re-done on every run
             persist transforms across runs with fsModuleCache: true
             learn more: https://vitest.dev/guide/improving-performance#caching-between-reruns

exit code: 0
```

The passed tests of that output that the expected cell names, in its order:

```
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "1200" as 1200 views 2ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads " 1200 " as 1200 views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "1200.9" as 1200 views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "1" as 1 views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "9999999999" as 9999999999 views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "" as no views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "   " as no views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "0" as no views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "0.9" as no views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "-5" as no views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "abc" as no views 0ms
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "12 00" as no views 0ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > gives no order from one clip with views 0ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > orders the seeded set by its views and says which pick performed best 51ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > gives each clip of the seeded set its title, its views with separators and its share of the highest views 1ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > says that the first pick performed best for a set whose most viewed clip has rank 1 0ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > puts rank 1 before rank 2 between equal views 1ms
 ✓ src/results/open-results/lib/results-store.test.ts > the results store > shows the views of a clip before the service answers, sends them, and keeps the answer 1ms
 ✓ src/results/open-results/lib/results-store.test.ts > the results store > shows a second number for one clip at once and sends it only once the first is answered 0ms
 ✓ src/results/open-results/lib/results-store.test.ts > the results store > gives the problem of a refusal and shows again what the service holds 0ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > shows a second change of a clip at once and sends it only once the first is answered 1ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > sends a change of another clip while the first clip’s change waits for its answer 0ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > gives the problem of a refused change and still sends the change made after it 6ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > listLearnedRows > gives the four rows of the prototype, each with the number the service gives its reason 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > listLearnedRows > gives four rows of 0 for a history that holds no rejection 0ms
 ✓ src/library/create-project/lib/create-draft.test.ts > a draft of a new project > takes the default length of Settings while no length was chosen 0ms
 ✓ src/library/create-project/lib/create-draft.test.ts > a draft of a new project > keeps a length that was chosen in the sheet when the default arrives 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a project with 1 exports and 1 logged as exported with results logged 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a project with 3 exports and 1 logged as exported with results logged 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a project with 3 exports and 3 logged as exported with results logged 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of an exported project without a logged clip as before 0ms
```

Result: pass

## V13 — On the Results tab and on Settings at 390 px no screen scrolls sideways and no label is cut off at 200% text size, no control has a tap area under 44 px, and text differs from its background by 4.5 to 1 (R7, A148)

Check: `pnpm test:browser e2e/results-fit.spec.ts`

Expected: For the Results tab empty, with the seeded set, and presented with twelve clips, titles of 110 characters and views of ten digits, and for Settings without a key and with one saved, with counts of three digits, at 390 px: at the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled to its end, a screen's last line lies above the tab bar; no control has a tap area under 44 px; in light and in dark no text measures under 4.5 to 1. At 1360 px the same screens meet the ratio in light and in dark.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/results-fit.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-WfLmLZ/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-WfLmLZ/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-WfLmLZ/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-WfLmLZ/fixtures/long-talk.mp4
  ✓  1 e2e/results-fit.spec.ts:79:3 › at 390 px › the results presented to the page hold twelve clips with titles of 110 characters and views of ten digits, and Settings counts of three digits (22.3s)
  ✓  2 e2e/results-fit.spec.ts:101:3 › at 390 px › every Results and Settings screen fits at the normal size and at 200%, with tap areas of 44 px and its last line above the bar (49.5s)
  ✓  3 e2e/results-fit.spec.ts:114:3 › at 390 px › no text of a Results or Settings screen measures under 4.5 to 1, in light and in dark (49.8s)
  ✓  4 e2e/results-fit.spec.ts:131:3 › at 1360 px › the same Results and Settings screens hold no text under 4.5 to 1, in light and in dark (50.2s)

  4 passed (3.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-WfLmLZ
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/results-fit.spec.ts` measures five screens, the Results tab empty, with the seeded set
and crowded, and Settings without a key and with one saved, and expects no misfit on any of them
at either text size and in either theme.

Result: pass

## V14 — The Results tab and Settings are captured at 390 px and 1360 px, in light and in dark (R3, A20, A148)

Check: block V14

Expected: The exit code is 0. The evidence folder holds four files named `results-<width>-<theme>.png` and four named `settings-<width>-<theme>.png`, for `390` and `1360`, in `light` and `dark`.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/results-captures.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yq0AHh/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yq0AHh/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yq0AHh/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yq0AHh/fixtures/long-talk.mp4
  ✓  1 e2e/results-captures.spec.ts:139:1 › the Results tab and Settings of a talk with the seeded set are captured whole at 390 and 1360 px, in light and in dark (51.6s)

  1 passed (1.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-yq0AHh
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code of the browser tests: 0
-rw-r--r--  1 work  staff   74119 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-1360-dark.png
-rw-r--r--  1 work  staff   75027 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-1360-light.png
-rw-r--r--  1 work  staff   70813 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-390-dark.png
-rw-r--r--  1 work  staff   71502 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-390-light.png
-rw-r--r--  1 work  staff  101610 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-1360-dark.png
-rw-r--r--  1 work  staff  101535 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-1360-light.png
-rw-r--r--  1 work  staff  102997 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-390-dark.png
-rw-r--r--  1 work  staff  102653 Oct  7 09:03 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-390-light.png
[block exit: 0]
```

Result: pass

## V15 — The Results tab and Settings reproduce the prototype's screens with the talk's own data, on phone and desktop, in light and in dark (R3, R5, A140, A141, A144)

Check: Open every capture from V14 and record in the proof what each shows.

Expected: Results at 390: the project's title above the Review, Export and Results control; "Views After 7 Days" with three rows, 01, 02 and 03, each with its title and a field that holds 1200, 5400 or 48000; under them "Enter each clip’s views a week after posting. The selector compares them with its own ranking and adjusts what it favours on your next video."; "Ranking Against Outcome" with the sentence of V5 and three bars, the longest first, beside 48,000, 5,400 and 1,200; the tab bar. Results at 1360: the sidebar, where the project's row reads "Exported · 3 clips exported, results logged"; a toolbar with the three tabs and the More button; the same page beside it. Settings: the five groups; a storage line of the form "50 GB free of 460 GB on this Mac" with its bar; an address under "Open on Your Phone"; under "What the Selector Has Learned" the counts 1, 1, 0 and 0 and "Forget All of It" in the destructive colour. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text.

Every capture was opened after V14 had written it.

- `results-390-light.png`: a Library back button and the More button. Under them the title "talk"
  with "Video link · 00:03:54 · 6 candidates", above the control Review, Export 3, Results, with
  Results chosen. "Views After 7 Days" holds three rows: 01 "The worst day my bakery ever had"
  with 1200, 02 "Hire for the habits you cannot teach" with 5400, and 03 "Almost everyone gets
  price wrong" with 48000. Under them stands "Enter each clip’s views a week after posting. The
  selector compares them with its own ranking and adjusts what it favours on your next video."
  "Ranking Against Outcome" holds "The best performer was the selector’s pick number 3. Ranks in
  order of views: 3, 2, 1." and three bars: "Almost everyone gets price wrong" beside 48,000 with
  a bar of the full width, "Hire for the habits you cannot teach" beside 5,400 with a bar of about
  a ninth, and "The worst day my bakery ever had" beside 1,200 with a short stub. The tab bar
  holds Library and Settings.
- `results-390-dark.png`: the same screen on a black ground, with dark grey groups and white text.
- `results-1360-light.png`: the sidebar with Clipper, New Project and the project's row, which
  reads "talk", "Video link · 4 min" and "Exported · 3 clips exported, results logged", and with
  Settings and "50 GB free on this Mac" at its foot. A toolbar with the title, the three tabs with
  Results chosen, and the More button. Beside the sidebar the same two groups, rows, sentence and
  bars as on the phone.
- `results-1360-dark.png`: the same screen with dark surfaces and light text.
- `settings-390-light.png`: the large title Settings and five groups. "AI Services" holds
  Anthropic API Key with a field that shows the placeholder "sk-ant-…" and Save, Scoring Model at
  Claude Sonnet 5.5, Cutting Model at Claude Opus 5.5 and Transcription Model at Whisper
  large-v3-turbo. "Defaults for New Projects" holds Clip Length at 25–60 s and Clips per Video at
  Auto. "Storage" holds "50 GB free of 460 GB on this Mac" with a bar filled to about nine tenths,
  and Delete Source Videos After at 7 days. "Open on Your Phone" holds
  `http://192.168.10.111:3100`, the address of the test run's tool, with Copy. "What the Selector
  Has Learned" holds Cut Off Mid-Thought 1, Not Interesting 1, Needs Earlier Context 0, Repeats
  Another Clip 0 and "Forget All of It" in red. The tab bar holds Library and Settings.
- `settings-390-dark.png`: the same screen on a black ground, with dark grey groups, white text
  and "Forget All of It" in a lighter red.
- `settings-1360-light.png`: the sidebar with the project's row, which reads "Exported · 3 clips
  exported, results logged", and Settings chosen at its foot. A toolbar with the title Settings.
  The same five groups in one column, with the same values, address and counts.
- `settings-1360-dark.png`: the same screen with dark surfaces and light text.

No capture shows clipped or overlapping text. On the phone the label "Anthropic API Key" runs over
two lines and the value of Transcription Model stands on a line of its own; both are whole.

Result: pass

## V16 — This milestone's commits touch nothing the boundaries exclude, add no package, commit no video, no database, no key and no weights, and leave the copied stylesheets as the prototype's (R2, R4, R8, R55, R56, R58, R59)

Check: block V16

Expected: Nothing is printed before each of the three closing lines about changes. Seven lines say that a stylesheet is the prototype's. `data` and `.cache` are ignored. The one tracked video, audio, database or model file is `face_detection_yunet_2026may.onnx`. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`. Nothing is printed before "end of the proxy and middleware files".

```
end of the changes to .researches and docs/prototype
end of the changes to the copied stylesheets and the tokens
end of the changes to the package files
base.css is the prototype's
controls.css is the prototype's
lists.css is the prototype's
shell.css is the prototype's
pages.css is the prototype's
review.css is the prototype's
player.css is the prototype's
.gitignore:1:/data	data
.gitignore:7:.cache/	.cache
service/clipper/rendering/yunet/face_detection_yunet_2026may.onnx
no key is tracked
168	fixtures
every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md
the app reads nothing from docs/
end of the proxy and middleware files
[block exit: 0]
```

Result: pass

## V17 — The Results tab, Settings, the history and the cleanup ask for nothing outside the tool (R57)

Check: block V17

Expected: The new packages and the two capabilities name no outside address. The exit code of the browser tests is 0, and their passed tests show the Results tab of a talk with the seeded set asking only the tool, at both widths.

```
the new packages and the two capabilities name no outside address

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/own-origin.spec.ts


Running 6 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wQCPsf/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wQCPsf/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wQCPsf/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wQCPsf/fixtures/long-talk.mp4
  ✓  1 e2e/own-origin.spec.ts:78:1 › with projects, every request of every screen is addressed to the tool (49.0s)
  ✓  2 e2e/own-origin.spec.ts:98:1 › the Review screens of the talk ask nothing outside the tool, with the preview playing on one of them (30.9s)
  ✓  3 e2e/own-origin.spec.ts:117:1 › the Export tab of a talk with a finished clip asks nothing outside the tool, and saves its file from the tool (31.2s)
  ✓  4 e2e/own-origin.spec.ts:141:1 › the Results tab of a talk with the seeded set asks nothing outside the tool, at both widths (50.0s)
  ✓  5 e2e/own-origin.spec.ts:158:1 › the empty Library asks nothing outside the tool (1.1s)
  ✓  6 e2e/own-origin.spec.ts:175:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (6.2s)

  6 passed (3.1m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wQCPsf
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code of the browser tests: 0
[block exit: 0]
```

Result: pass

## V18 — The README and the agents' instructions cover what this milestone adds (R9, A18)

Check: block V18

Expected: The README says what the Results tab does, what the selector learns and what "Forget All of It" clears, what each choice in Settings governs, and when the source of a project is removed and what stays. It has no section on what this version does not do yet. Both files name `CLIPPER_CLOCK_AHEAD_DAYS`. `AGENTS.md` names the `learning`, `results` and `retention` packages, the results capability and the direction of their imports.

```
87:the clips inside one video. It does not forecast views.
172:The Results tab compares Clipper's ranking with how your clips did once they were posted. It
177:A week after you post a clip, type its views into its field under "Views After 7 Days". A number
179:zero clears the clip's views.
181:"Ranking Against Outcome" waits for the views of two clips. It then lists the clips with views,
182:the most viewed first, each with a bar as long as its share of the highest views. The sentence
184:was the selector’s pick number 2. Ranks in order of views: 2, 1, 4." In the Library, a project
185:with logged views reads "Exported · 4 clips exported, results logged".
187:## What the selector learns
190:rejected, with the reason of a rejection, and each clip with logged views, with its views, the
197:Once three clips have views, a second line names the kinds of hook and the lengths of the best
200:than three clips with views, no note is sent.
202:Settings shows the counted rejections under "What the Selector Has Learned". "Forget All of It"
204:stay kept or rejected, and the Results tabs keep their views. A decision or a number of views
270:each, the views you logged, the project's look and the history the selector learns from; one
271:folder per project with the fetched video, its preview copy, its transcript, the filmstrip
276:exported clips, its candidates, your decisions about them and their logged views. Git ignores
282:The fetched video and its preview copy are the large files of a project. Both are deleted after
289:The transcript, the filmstrip frames, the clip candidates, your decisions, the logged views and
338:| `CLIPPER_CLOCK_AHEAD_DAYS` | Days added to the clock that the cleanup of old source videos reads | 0 |
340:## What Clipper leaves out
41:names the folder the tests save their evidence into, and `CLIPPER_CLOCK_AHEAD_DAYS` adds that
108:  use. `web/src/shell/`, `library/`, `project/`, `review/`, `export/`, `results/` and
112:  `export`, `results` and `settings`; `library` by `project`, `review`, `export`, `results` and
113:  `settings`. `review`, the Review tab, `export`, the Export tab, and `results`, the Results
115:  and nothing but `app/` imports any of the three. `export` and `results` each read their own
118:  and the Results tab.
121:  `learning`, `media`, `projects`, `pipeline`, `fetching`, `transcription`, `selection`,
122:  `review`, `rendering`, `results` and `retention`. Each exports through its `__init__.py` and
126:  `projects` and `media`; `projects` imports none of them. `learning`, the history the selector
127:  learns from, imports `storage` alone. `settings` imports `learning`, whose rejections it
128:  counts and whose history it forgets, and `projects` and `storage`. `selection` imports
129:  `transcription` for the stored transcript, `learning` for the note each pass writes from the
130:  history, and `settings`, `pipeline`, `projects` and `storage`. `review`, the package behind
132:  `learning`. `rendering`, the package behind the Export tab, imports `review`, `selection`,
133:  `projects`, `pipeline`, `media` and `storage`. `results`, the package behind the Results tab,
134:  imports `learning`, `rendering`, `review`, `projects` and `storage`. `retention`, the cleanup
137:  imports `fetching`, `results` or `retention`, nothing but `main.py` and `results` imports
138:  `rendering`, nothing but `main.py`, `rendering` and `results` imports `review`, nothing but
273:## The Results tab
275:- `service/clipper/results` is the package behind the tab. It gives the clips of a project that
278:- `web/src/results/` is the capability, with three use cases. `open-results` holds a project's
279:  results and draws the tab and its empty state. `log-views` reads a typed number as views and
281:  draws the bars. `open-results` imports the other two, and neither imports it back.
282:- The store of the results shows a typed number at once and sends the views of one clip one
288:## The history and the note
290:- `service/clipper/learning` holds the history the selector learns from: two lists in the
295:  when the decision or its reason changed. The store of `results` writes the list of outcomes,
296:  in the transaction that stores or clears a clip's views. `learning` gives both the functions
297:  that write into a transaction another store has open. `DELETE /api/settings/history` empties
299:- Each selection pass writes the note from the history when it starts, and every request of the
305:- `service/clipper/retention` removes the source and the preview copy of a project that is ready
306:  or exported, was imported more days before than the retention chosen in Settings, and has no
308:- The cleaner runs one pass when the service starts, before it answers, and then one pass an
311:- The cleaner reads a clock of its own. `CLIPPER_CLOCK_AHEAD_DAYS` adds that many days to it, so
314:## Settings, the history and the tool's variables in tests
318:  history reach every later test.
321:- A test that reads the history, in Settings or in a selection request, forgets it first.
323:- `fixtures/README.md` gives the seeded set of decisions and views. `web/e2e/learning.spec.ts`
325:  `learning-requests.json`. `web/e2e/support/results-screens.ts` makes it through the service
326:  for `web/e2e/results-fit.spec.ts`, which runs the three measures over the Results tab and
327:  Settings, and for `web/e2e/results-captures.spec.ts`, which saves their captures.
[block exit: 0]
```

The first part is the README's lines and the second the lines of `AGENTS.md`. The README was read
from line 170 to its end. "Log the results" says what the Results tab does. "What the selector
learns" says what the history holds, what the note says, and that "Forget All of It" empties the
history and changes no project. "Settings" has a table of the seven choices with what each
governs. "Where the data lives" says when the fetched video and its preview copy are deleted and
what stays. Line 340 heads "What Clipper leaves out", a list of six things outside the tool's
purpose; none is worded as coming later, and no section says what this version does not do yet.

Result: pass

## V19 — The code follows the standards the hooks enforce, and both recorded layouts name the new parts (A19)

Check: block V19

Expected: Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `learning/`, `results/` and `retention/`. The web app's layout lists `results/` with three use cases under it. No line of either starts with `#`.

```
Total hook-level violations: 0
follows: fastapi
layout: |
  clipper/
    main.py
    __main__.py
    problems/
    settings/
    storage/
    learning/
    media/
    projects/
    pipeline/
    fetching/
    transcription/
    selection/
    review/
    rendering/
    results/
    retention/
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
    review/
      open-review/
      time-clips/
      list-candidates/
      chart-source/
      inspect-clip/
      decide-clip/
      trim-clip/
      preview-clip/
      set-look/
    export/
      open-export/
      render-clips/
      copy-text/
    results/
      open-results/
      log-views/
      compare-outcome/
    settings/
      change-settings/
  e2e/                    browser tests
    support/
[block exit: 0]
```

The first line is the closing count of the review program. No finding is printed.

Result: pass

## V20 — Two changes of one clip made one after the other in the browser are both stored and shown (R40, A149)

Check: `pnpm test:browser e2e/review-preview.spec.ts --repeat-each=20 -g "preview copy moved aside"`

Expected: 20 passed, with exit code 0. Each run presses Keep and moves the out point of the same clip at once, with the preview copy moved aside, and reads "Kept", the new out point, and both in what the service holds. Baseline: this test failed once in the planner's run of the test command, on a Mac busy after a wake from sleep, and passed 20 times of 20 on the Mac at rest before any change; the tests V11 and V12 name show the mended rule itself.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-preview.spec.ts --repeat-each=20 -g 'preview copy moved aside'


Running 20 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UKkb5S/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UKkb5S/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UKkb5S/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UKkb5S/fixtures/long-talk.mp4
  ✓   1 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (22.9s)
  ✓   2 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   3 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   4 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   5 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   6 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   7 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.2s)
  ✓   8 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.2s)
  ✓   9 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  10 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  11 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  12 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  13 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  14 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  15 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  16 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  17 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  18 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.2s)
  ✓  19 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.2s)
  ✓  20 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)

  20 passed (1.9m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UKkb5S
Test data size: 0.09 GB (96.7 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/review-preview.spec.ts` presses Keep and the step of the out point one after the other,
reads "Kept" and the out point 00:00:50.3 on the page, and reads the decision and the new end from
the service.

Result: pass

## V22 — The README and the agents' instructions say which line of the start's output means that the tool is up (R9, A18, A154)

Check: block V22

Expected: The README's Start section shows the line `Clipper is running at http://localhost:3000` and says after it that Next.js prints lines of its own before it, the same address and `http://0.0.0.0:3000` among them, that Clipper's line is the one that says the tool is up, and that the address for a phone is the one Settings gives. `AGENTS.md` says that a script or a check waits for the line `Clipper is running at` and not for the address alone, that Next.js prints the address about a tenth of a second earlier, and that `next start` has no option that leaves its lines out.

````
## Start

```bash
pnpm start
```

The first start builds the web app. A later start builds again only when the sources have
changed. When the tool is up, the command prints its address:

```
Clipper is running at http://localhost:3000
```

Open that address in a browser on the Mac. Ctrl-C stops the tool. A project that was waiting or
being processed carries on at the next start.

Next.js, which serves the web app, prints lines of its own just before Clipper's line. The same
address is among them, and so is a "Network" address, `http://0.0.0.0:3000`. Clipper's line is
the one that says the tool is up. The "Network" address is not the address for a phone.
Settings gives that address under "Open on Your Phone".

end of the README's Start section
393-  needs a new build, and the start command makes one.
394-- A forwarded request with no answer for 30 seconds is dropped. Every service endpoint answers at
395-  once, and long work runs in the queue worker.
396-- Next.js sends usage data during a build unless `NEXT_TELEMETRY_DISABLED=1` is set. Every script
397-  that runs `next` sets it.
398-- `next start` prints lines of its own as soon as it listens, the tool's address among them, and
399:  has no option that leaves them out. The start command prints `Clipper is running at` about a
400-  tenth of a second later, in some starts two tenths, once the service has answered through the
401-  web port. A script or a check that waits for the tool waits for that line and never for the
402-  address alone, as the tool runner of the browser tests does.
403-
404-## ffmpeg
405-
406-Measured on ffmpeg 8.1.2:
407-
408-- `-shortest` over a picture that never ends does not end the video where its sound ends. It
409-  leaves from half a second to almost five seconds of picture after the sound, a different amount
[block exit: 0]
````

Result: pass

## V21 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

```
 M docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v1-start-log.txt
 M docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v11-service-tests.txt
 M docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v12-unit-tests.txt
 M docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v2-test-command.txt
exit code: 0
```

The four paths are the evidence files of this milestone's folder that the run replaced. The check
was run before this file and the entry in `issues.md` were written.

Result: pass
