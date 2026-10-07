# Proof: m6-results-learning-settings-and-storage-care

Attempt: 1
Result: fail
Commit: 8e8382e

| id | result |
| -- | ------ |
| V1 | fail |
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
| V21 | pass |

The checks were run from the worktree's root at `8e8382e` with nothing uncommitted before V1, on
2026-10-07 from 05:50 to 07:25, in the order of the table. The blocks were cut out of
`validation.md` into files and run with `bash`, as written; V3's block got the two folders V2
named in the places it leaves for them. Ports 3000, 8765, 3100 and 8865 were free before V1. The
Mac was on mains power and on its network at 192.168.10.111. Lines in square brackets are
markers the validator added; every other line in a code block is printed by the commands. A
check that is one command was run with `echo "exit code: $?"` after it, which prints the last
line of its code block. A sentence under a code block that names a test file says where a passed
test holds something its name does not state.

V1 fails on one line. The block did not print `Clipper is running at http://localhost:3000`,
which the expected cell has the start print. The start's saved output holds the line. V2 to V21
pass.

The evidence folder already held nine files, committed with the milestone. V6 wrote
`learning-requests.json` again and V14 the eight captures, so the captures opened for V15 are
the ones this run made. All nine came out byte for byte as committed. The run added
`v1-start-log.txt`, `v2-test-command.txt`, `v11-service-tests.txt` and `v12-unit-tests.txt`.

## V1 — "The README's setup, start, test and phone instructions work when followed from a fresh copy of the repository", for setup, start and phone; "Settings shows an address made of the Mac's local network address and port 3000, and the tool answers a request sent to that address"; "The free disk figure is within 1 GB of what the system reports"; a first start shows no project (R2, R9, R21, R54, A145, A147)

Check: block V1

Expected: The two commit lines are equal. `pnpm install` and `pnpm bootstrap` each end with exit code 0, and the last line of the bootstrap is `Clipper is set up. Start it with "pnpm start".` The start prints `Clipper is running at http://localhost:3000`. The Library answers 200 with the title Clipper, and the answer of the projects holds no project. The phone address Settings gives is `http://`, then the address of this Mac on its network as the line above prints it, then `:3000`. The three answers of the phone address are 200. The free space Settings gives differs from the one `df` gives by less than 1.0 GB, and so do the two totals. The start command ends with code 130 after the interrupt, and nothing is printed between that line and "end of listeners after the interrupt".

```
commit of the worktree: 8e8382ee2c303dbf7f50e6c07c4211fa0eeea3ba
commit of the clone:    8e8382ee2c303dbf7f50e6c07c4211fa0eeea3ba
exit code of pnpm install: 0
exit code of pnpm bootstrap: 0
Clipper is set up. Start it with "pnpm start".
library at localhost: 200
<title>Clipper</title>
{"projects":[],"freeDiskGb":18.8}
address of this Mac on its network: 192.168.10.111
df gives 18.8 GB free of 460.4 GB
Settings gives 18.8 GB free of 460.4 GB
Settings gives the phone address http://192.168.10.111:3000
answer of the phone address to / is 200
answer of the phone address to /settings is 200
answer of the phone address to /api/health is 200
exit code of the start command: 130
end of listeners after the interrupt
```

The block printed no `Clipper is running at http://localhost:3000` line. The expected cell has the
start print it, and the block's `grep "Clipper is running"` is the command that shows it. Its
place is between the bootstrap's last line and `library at localhost: 200`, and nothing is there.
Every other line is as the expected cell gives it: both commits are `8e8382e`, both exit codes
are 0, the Library answers 200 with its title, the projects answer holds no project, the phone
address is `http://192.168.10.111:3000` and answers 200 three times, both disk figures equal the
ones `df` gives, and the start ends with 130 with no listener left.

The start's output, which the block keeps in `start.log` inside the clone, was copied to
`evidence/v1-start-log.txt` before V3 removed the clone. Its lines 34 to 41, read after the block
had ended:

```

▲ Next.js 16.3.8
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
✓ Ready in 102ms
✓ Running next.config.ts took 22ms
Clipper is running at http://localhost:3000
 ELIFECYCLE  Command failed with exit code 130.
```

The block waits until that file holds the text `http://localhost:3000` and then prints its lines
with "Clipper is running". Line 36, which Next.js prints, holds that text four lines before the
tool's own line 40. In this run the wait ended on line 36 and the grep ran before line 40 was
written. The requests that follow in the block were answered: the Library with 200 and the
projects by the service.

Result: fail

## V2 — "The test command passes"; the README's test instructions from a fresh copy; one command runs every check (R9, R12, A147)

Check: block V2

Expected: The line after the run gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. The Fixtures lines name four built videos. The closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine gates passed at `0ec8f3d`, with 1,123 service tests, 362 unit tests and 173 browser tests (M5's `proof.md`, V1), and only mission documents changed up to `5ab7552`, where this milestone starts. In the planner's clone of `5ab7552` eight gates passed and Playwright failed with 171 of 173: the Mac slept for eight minutes on an empty battery during one test, and one test met the lost change of A149. Both files passed when run again in the clone. No gate may fail. The named browser tests end with exit code 0 and 4 passed. Nothing is printed between the exit code of the named browser tests and "end of the clone's changes".

```

> clipper@0.1.0 test /private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper
> node scripts/run-tests.mjs


--- Fixtures
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Y5jC09/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Y5jC09/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Y5jC09/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Y5jC09/fixtures/long-talk.mp4
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

[the lines of dots, one per test file, are left out; the whole output is in evidence/v2-test-command.txt]

======================= 1275 passed in 553.60s (0:09:13) =======================

--- ESLint

--- Web build
[the lines of the web build are left out]

--- TypeScript check

--- Vitest

 RUN  v5.0.3 /private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web


 Test Files  38 passed (38)
      Tests  411 passed (411)
   Start at  06:03:55
   Duration  1.21s (transform 62%, import 22%, tests 11%, worker 5%)

  Transform  transforming modules took 2.20s · 62% of tracked time, re-done on every run
             persist transforms across runs with fsModuleCache: true
             learn more: https://vitest.dev/guide/improving-performance#caching-between-reruns


--- Playwright

Running 200 tests using 1 worker

[the 200 lines of passed tests are left out; V4 counts them from evidence/v2-test-command.txt]

  200 passed (38.8m)

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
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Y5jC09
Test data size: 0.21 GB (210.6 MB)
The test data folder was removed.
exit code of pnpm test: 0

Running 4 tests using 1 worker

  ✓  1 e2e/start-command.spec.ts:14:1 › the tool opens at the address the start command prints (227ms)
  ✓  2 e2e/start-command.spec.ts:23:1 › the service answers through the web port (33ms)
  ✓  3 e2e/start-command.spec.ts:30:1 › the web port is open on the network address and the service port is closed there (12ms)
  ✓  4 e2e/start-command.spec.ts:40:1 › every request of the page goes to the address of the tool (2.1s)

  4 passed (5.6s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JAYKj1
Test data size: 0.07 GB (71.1 MB)
The test data folder was removed.
exit code of the named browser tests: 0
end of the clone's changes
```

The run took from 05:53 to 06:42. The nine gates passed with 1,275 service tests, 411 unit tests
and 200 browser tests, against 1,123, 362 and 173 at the baseline. No line of the output marks a
failed, flaky or retried test.

Result: pass

## V3 — Test data and the clone are removed, nothing of the tool is left listening, and no tracked file of the worktree changed (R56, R57)

Check: block V3

Expected: Each of the three `ls` reports that its folder does not exist. Nothing is printed before "end of listeners". Every path `git status` lists is inside this milestone's folder.

The two places the block leaves open got the folders V2's closing lines name:
`/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Y5jC09` and
`/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JAYKj1`.

```
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Y5jC09: No such file or directory
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JAYKj1: No such file or directory
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T//clipper-m6-fresh-copy: No such file or directory
end of listeners
?? docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v1-start-log.txt
?? docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v2-test-command.txt
```

`v1-start-log.txt` is the copy of the start's output the validator saved for V1, and
`v2-test-command.txt` is the file V2's block writes.

Result: pass

## V4 — What M1 to M5 built still holds beside this milestone (R6, R13 to R50)

Check: block V4

Expected: The count is 173 or more. The closing line says that no test of these files failed.

```
178
no test of these files failed
```

Result: pass

## V5 — "Views entered on the Results tab are still there after a reload, and for a seeded set the order and the summary sentence are correct."; the Results tab at its address with the prototype's two groups (R3, R6, R51, A140, A141)

Check: `pnpm test:browser e2e/results-tab.spec.ts`

Expected: A talk with no kept clip shows "No Results Yet" with "Go to Review", and one with a kept clip that is not exported shows "Go to Export". With `c01` to `c03` exported the tab lists three rows with the ranks 01, 02 and 03, their titles and empty fields, and reads "Enter views for at least two clips." With the seeded views typed, "Ranking Against Outcome" lists "Almost everyone gets price wrong" with 48,000, "Hire for the habits you cannot teach" with 5,400 and "The worst day my bakery ever had" with 1,200, in that order, under "The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2, 1.", with the first bar the longest. After a reload the three fields hold 1200, 5400 and 48000, the outcome is the same, and the service gives the same views. 90000 typed for `c01` gives "The selector’s first pick performed best. Ranks in order of views: 1, 3, 2." An emptied field and a typed 0 each take their clip out of the outcome, also after a reload. A clip rejected after its export keeps its row. The project's row reads "Exported · 3 clips exported" before the views and "Exported · 3 clips exported, results logged" after them. At 390 px the tab lists the same rows and stores a typed number.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/results-tab.spec.ts


Running 6 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-1uCVRq/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-1uCVRq/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-1uCVRq/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-1uCVRq/fixtures/long-talk.mp4
  ✓  1 e2e/results-tab.spec.ts:92:3 › at 1360 px › a talk with no kept clip shows No Results Yet with Go to Review, and one with a kept clip that is not rendered shows Go to Export (24.0s)
  ✓  2 e2e/results-tab.spec.ts:115:3 › at 1360 px › with three clips exported the tab lists their rows with empty fields, and the outcome follows a typed number at once and waits for two clips with views (48.2s)
  ✓  3 e2e/results-tab.spec.ts:146:3 › at 1360 px › the seeded views are listed by their views under the sentence with the longest bar first, are all there after a reload, and the row in the sidebar reads results logged (50.9s)
  ✓  4 e2e/results-tab.spec.ts:174:3 › at 1360 px › 90000 for the first pick names it best, and an emptied field and a typed 0 each take their clip out of the outcome, also after a reload (50.2s)
  ✓  5 e2e/results-tab.spec.ts:206:3 › at 1360 px › a clip rejected after its export keeps its row and its views (33.4s)
  ✓  6 e2e/results-tab.spec.ts:224:3 › at 390 px › on a phone the tab lists the same rows, and a number typed there is stored (1.0m)

  6 passed (4.8m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-1uCVRq
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/results-tab.spec.ts` holds what the names leave out. Test 2 reads the three rows with
the ranks 01, 02 and 03, their titles and empty fields, the two groups with the footer under the
first, and "Enter views for at least two clips." before a number and after one. Test 3 reads the
row "Exported · 3 clips exported" before the views and "Exported · 3 clips exported, results
logged" after them, the sentence and the three titles with 48,000, 5,400 and 1,200 in that
order, bars of 100%, 11% and between 2% and 3% of the track, the fields 1200, 5400 and 48000
after the reload, and the same views from the service. Test 4 reads "The selector’s first pick
performed best. Ranks in order of views: 1, 3, 2." Test 6 reads the same three rows at 390 px
and 5400 from the service after a reload.

Result: pass

## V6 — "After clips are rejected with reasons and views are logged, the selection request for a new project contains the note from D40. After "Forget all of it", it does not."; what a deleted project added to the history stays (R20, R52, A142, A143, A144)

Check: block V6

Expected: The exit code of the browser tests is 0, with 1 test passed: it makes the seeded set, with the rejections chosen from the reject menu and the views typed on the Results tab, deletes that talk, makes a second talk, presses "Forget All of It" and makes a third. `withHistory` gives the rejections `{"cutOff": 1, "needsContext": 0, "notInteresting": 1, "repeat": 0}` and four requests: one `score` of every window and one `cut` each of `w01`, `w02` and `w03`. Under each stand the same two lines: "Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip." and "Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds." `afterForgetting` gives four zeros and the same four requests, each with "no note". The last line counts 1 different note.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/learning.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-GwFDoz/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-GwFDoz/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-GwFDoz/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-GwFDoz/fixtures/long-talk.mp4
  ✓  1 e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it (1.6m)

  1 passed (1.9m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-GwFDoz
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
```

`web/e2e/learning.spec.ts` exports `c01` to `c03` through the service, rejects `c05` and `c06`
from the reject menu of the Review tab, types the three views on the Results tab, deletes the
talk, makes a second one, presses "Forget All of It" in Settings and makes a third. The run
wrote `evidence/learning-requests.json` at 06:50, byte for byte as committed.

Result: pass

## V7 — "Every Settings control works", for what the selector has learned; the phone address in the browser (R52, R54, A144)

Check: `pnpm test:browser e2e/settings.spec.ts`

Expected: Settings has the prototype's five groups, with "Forget All of It" switched on. With no history the four counts are 0. With two clips of the talk rejected on the Review tab as "Not Interesting" and "Cut Off Mid-Thought", the rows read Cut Off Mid-Thought 1, Not Interesting 1, Needs Earlier Context 0 and Repeats Another Clip 0. "Forget All of It" shows "The selector forgot what it had learned" and four zeros, a reload shows four zeros, and the Review tab still lists the two rejected clips with their reasons. Each of the six choices is kept after a reload. The phone row gives the address of this Mac with the web port, and the tool answers at it.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/settings.spec.ts


Running 11 tests using 1 worker

  ✓   1 e2e/settings.spec.ts:87:3 › at 390 px › Settings has the five groups of the prototype with their rows and footers (398ms)
  ✓   2 e2e/settings.spec.ts:123:3 › at 390 px › the choices start at the defaults, and each one is kept after a reload (390ms)
  ✓   3 e2e/settings.spec.ts:149:3 › at 390 px › Save with nothing typed asks for the key and sends nothing (279ms)
  ✓   4 e2e/settings.spec.ts:160:3 › at 390 px › a saved key is shown by its last four characters, also after a reload, and Remove brings the field back (443ms)
  ✓   5 e2e/settings.spec.ts:186:3 › at 390 px › a key the service refuses is answered in the service’s words, and the field is emptied (312ms)
  ✓   6 e2e/settings.spec.ts:197:3 › at 390 px › the storage row gives the free and the total space with a bar (230ms)
  ✓   7 e2e/settings.spec.ts:205:3 › at 390 px › with nothing learned each of the four reasons reads 0, and Forget All of It is switched on (249ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wt8byr/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wt8byr/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wt8byr/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wt8byr/fixtures/long-talk.mp4
  ✓   8 e2e/settings.spec.ts:217:3 › at 390 px › two clips rejected with a reason on the Review tab are counted, and Forget All of It forgets them and leaves the clips rejected (22.9s)
  ✓   9 e2e/settings.spec.ts:253:3 › at 390 px › a refusal to forget shows the service’s sentence and leaves the numbers (334ms)
  ✓  10 e2e/settings.spec.ts:276:3 › at 1360 px › the phone row gives the address of this Mac with the web port, and Copy copies it (337ms)
  ✓  11 e2e/settings.spec.ts:289:3 › at 1360 px › the tool answers at the phone address (232ms)

  11 passed (45.6s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-wt8byr
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/settings.spec.ts` holds what the names leave out. Test 1 reads the five group titles
and finds "Forget All of It" switched on. Test 8 reads the rows Cut Off Mid-Thought 1, Not
Interesting 1, Needs Earlier Context 0 and Repeats Another Clip 0, the toast "The selector
forgot what it had learned", four zeros before and after a reload, and `c05` and `c06` tagged
Rejected in the Review list. It reads the two reasons from the review the service gives, not
from the list. Test 2 changes all six choices and reads each after a reload.

Result: pass

## V8 — "Changed model choices appear in the next selection request, and a changed default clip length is preselected in the new project form."; the clips per video; the free disk figure on the screens (R33, R34, R36, R54, A69, A145)

Check: `pnpm test:browser e2e/settings-effect.spec.ts`

Expected: With Claude Haiku 4.5 chosen for scoring and Claude Fable 5.1 for cutting in Settings, the next talk sends one score request that names `claude-haiku-4-5`, with no effort setting, and three cut requests that name `claude-fable-5-1`. With 4 clips per video chosen, the next talk ends ready with four candidates and each cut task asks for 4. With 60–180 s chosen, the new project sheet opens with "60–180 s" selected, also after a reload, and a project made from it has the limits 60 and 180. With the default back, the sheet opens at "25–60 s". A length chosen in the sheet before Settings answers is kept. Started without a reported figure, the tool gives a free space and a total within 1 GB of what the Mac gives for the disk of the data folder, and Settings and the sidebar show that free space rounded down to whole gigabytes.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/settings-effect.spec.ts


Running 6 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-HZl523/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-HZl523/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-HZl523/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-HZl523/fixtures/long-talk.mp4
  ✓  1 e2e/settings-effect.spec.ts:85:1 › with Claude Haiku 4.5 chosen for scoring and Claude Fable 5.1 for cutting, the next talk asks Haiku once without an effort setting and Fable three times (22.4s)
  ✓  2 e2e/settings-effect.spec.ts:108:1 › with 4 chosen as the clips per video, the next talk ends ready with four candidates, and each cut task asks for 4 (18.5s)
  ✓  3 e2e/settings-effect.spec.ts:128:1 › with 60–180 s chosen as the clip length, the new project sheet opens with it selected, also after a reload, and a project made from it has the limits 60 and 180 (1.0s)
  ✓  4 e2e/settings-effect.spec.ts:153:1 › a length chosen in the sheet before Settings answers is kept, and the sheet opens at 25–60 s while it waits (924ms)
  ✓  5 e2e/settings-effect.spec.ts:170:1 › the sheet keeps 25–60 s when Settings cannot be read (496ms)
  ✓  6 e2e/settings-effect.spec.ts:188:3 › started without a reported figure › the tool gives the free space and the total of the data folder’s disk within 1 GB, and Settings and the sidebar show the free space rounded down to whole gigabytes (4.3s)

  6 passed (1.1m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-HZl523
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/settings-effect.spec.ts` holds what the names leave out. Test 1 reads the models of the
four requests as `claude-haiku-4-5` once and `claude-fable-5-1` three times, with no effort
setting on the first. Test 3 puts the default back through the service and reads the sheet at
"25–60 s".

Result: pass

## V9 — "A source older than the retention setting is removed by the cleanup. Its project still opens, the Review tab shows the notice from D56, the Export tab states that the source is gone, and its exports are untouched." (R45, R53, A146)

Check: `pnpm test:browser e2e/retention.spec.ts`

Expected: A talk with `c01` exported keeps its source and its preview copy when the tool is started six days later by its clock. Started eight days later, the talk's folder holds neither, and holds the transcript, the filmstrip frames and `exports/01-c01.mp4` at the size it had. The Library lists the talk as exported. Its Review tab shows "Preview unavailable. The source video was deleted to free space." in place of the preview, with its six candidates. Its Export tab shows "The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.", has Render switched off, and "Download MP4" saves the file. Its Results tab lists the clip. With "Never" chosen and the clock 400 days ahead the source stays, and with "3 days" and the clock four days ahead it is removed.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/retention.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9sH0Dx/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9sH0Dx/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9sH0Dx/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9sH0Dx/fixtures/long-talk.mp4
  ✓  1 e2e/retention.spec.ts:79:3 › at 1360 px › a talk with a clip exported keeps its source and its preview copy when the tool is started six days later by its clock (34.1s)
  ✓  2 e2e/retention.spec.ts:95:3 › at 1360 px › started eight days later the talk has lost its source and its preview copy and nothing else, and its Review, Export and Results tabs still open (34.7s)
  ✓  3 e2e/retention.spec.ts:122:3 › at 1360 px › with Never chosen in Settings the source stays 400 days later, and with 3 days it is removed four days later (38.1s)
  ✓  4 e2e/retention.spec.ts:150:3 › at 390 px › on a phone the Review list of a talk without its source opens the clip with the notice in place of the preview (34.3s)

  4 passed (2.7m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9sH0Dx
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/retention.spec.ts` holds what the names leave out. Test 2 compares every file of the
talk's folder with its size before the start: the folder holds all but `source.mp4` and
`preview.mp4`, each at the size it had, the transcript, the frames and `exports/01-c01.mp4`
among them. It reads "Exported · 1 clip exported" in the Library, the preview notice with six
candidates on the Review tab, the notice of the Export tab with Render switched off, a download
of the size the export had, and the row of `c01` on the Results tab.

Result: pass

## V10 — "Deleting a project that has exports removes its export files."; the history outlives the project (R20, A142)

Check: `pnpm test:browser e2e/delete-project.spec.ts`

Expected: With `c01` exported and `c06` rejected with a reason, Delete Project from the More menu removes the talk's folder with `exports/01-c01.mp4` and leaves the Library empty, and Settings still counts the rejection. Cancel removes nothing. The tests of M1 in this file pass.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/delete-project.spec.ts


Running 5 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-bJ6nYH/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-bJ6nYH/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-bJ6nYH/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-bJ6nYH/fixtures/long-talk.mp4
  ✓  1 e2e/delete-project.spec.ts:41:3 › at 390 px › the More menu offers Delete Project, and the confirmation names the project (1.2s)
  ✓  2 e2e/delete-project.spec.ts:66:3 › at 390 px › Cancel removes neither the row nor the folder, and Delete removes both (15.1s)
  ✓  3 e2e/delete-project.spec.ts:94:3 › at 390 px › deleting a project while it is being fetched stops it and leaves no folder (5.0s)
  ✓  4 e2e/delete-project.spec.ts:120:3 › at 1360 px › the menu opens under the More control, and deleting shows the next project (1.7s)
  ✓  5 e2e/delete-project.spec.ts:142:3 › at 1360 px › deleting a talk with an exported clip removes its folder with the export and leaves the Library empty, and Settings still counts its rejection (29.6s)

  5 passed (1.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-bJ6nYH
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

Tests 1 to 4 are the tests of M1. Test 2 holds the Cancel that removes nothing. Test 5 rejects
`c06` as cut off mid-thought, finds `01-c01.mp4` in the exports before the delete and no folder
after it, and reads the counts 1, 0, 0 and 0 in Settings.

Result: pass

## V11 — The service's rules for the history, the note, the results, Settings and the cleanup, by test name (R20, R51 to R54, A140 to A146)

Check: block V11

Expected: The exit code of pytest is 0. The count of passed tests of the three new packages is 40 or more, and no service test failed. Among the passed tests of the saved output: a change of a clip that arrives while another is being stored applied to what that one stored, and a hundred pairs of changes sent together all stored whole; a database made by M5 upgraded with its projects, candidates, reviews and renders unchanged, its decisions copied into the history, its logged count 0 and its projects imported at the upgrade; a decision entering the history, moving to the end when it changes, and leaving when the clip is undecided; a change of a title or a point leaving the history as it was; the 50 newest of 60 decisions; a deleted project's entries staying; no note from an empty history; the first line with all four reasons; the second line from three, seven and nine clips with views, and none from two; the note in the task of the score request and of every cut request, and in neither the instructions nor the transcript part; no `note` field without a history; the rejections in the settings answer; the forget address emptying the history and leaving the choices and the key; only clips with a finished file in the results, a rejected one among them; views of 1 and of 9,999,999,999 stored and 0, a fraction, a larger number and a clip without a file refused; cleared views leaving the count and the history; a project without candidates answering with no clips; the source and the preview copy of a ready project removed past the retention and kept before it, at 3, 7 and 30 days; "Never" removing nothing; a failed, a stopped, a waiting and a transcribed project keeping their source; a project with a clip in the queue passed over; a tool started with its clock ahead answering with the source gone; through the whole app, the two lines of the note in the four requests of the talk made after the seeded set, and no note after forgetting.

```
exit code of pytest: 0
======================= 1275 passed in 552.05s (0:09:12) =======================
98
no service test failed

[lines of evidence/v11-service-tests.txt for the tests the expected cell names, picked out by the validator]
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

Three test bodies hold what their names leave out. The upgrade test in
`service/clipper/storage/test_open_database.py` compares the projects, candidates, reviews and
renders with what they were and reads a logged count of 0. The test of the cut step in
`service/clipper/selection/test_cut_stage.py` finds no line of the note in the instructions or
the transcript part of any of the four requests. The refused views in
`service/clipper/results/test_router.py` are 0, -5, 1200.5, one more than 9,999,999,999, a text,
a truth value, a body with a second field, an empty body and a list. Among the projects that
keep their source, `queued` is the waiting one.

Result: pass

## V12 — The web app's rules, by test name (A140, A141, A144, A145)

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: typed texts read as views or as none; no order from one clip with views; the order, the shares and the sentence of the seeded set; "The selector’s first pick performed best." for a set led by rank 1; rank 1 before rank 2 between equal views; views shown before the service answers, and a second number for one clip sent only once the first is answered; a second change of a clip in the review shown at once and sent only once the first is answered, and a change of another clip sent without waiting; a refusal; the four rows of what the selector has learned with their numbers; a draft that takes the default clip length and one that keeps a chosen length; the row of an exported project with and without logged results.

```

 RUN  v5.0.3 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/web

[the 411 lines of passed tests are in evidence/v12-unit-tests.txt; the ones the expected cell names follow]
 ✓ src/results/log-views/lib/read-typed-views.test.ts > readTypedViews > reads "1200" as 1200 views 1ms
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
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > orders the seeded set by its views and says which pick performed best 56ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > gives each clip of the seeded set its title, its views with separators and its share of the highest views 0ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > says that the first pick performed best for a set whose most viewed clip has rank 1 0ms
 ✓ src/results/compare-outcome/lib/rank-outcome.test.ts > rankOutcome > puts rank 1 before rank 2 between equal views 0ms
 ✓ src/results/open-results/lib/results-store.test.ts > the results store > shows the views of a clip before the service answers, sends them, and keeps the answer 1ms
 ✓ src/results/open-results/lib/results-store.test.ts > the results store > shows a second number for one clip at once and sends it only once the first is answered 0ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > shows a second change of a clip at once and sends it only once the first is answered 1ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > sends a change of another clip while the first clip’s change waits for its answer 1ms
 ✓ src/results/open-results/lib/results-store.test.ts > the results store > gives the problem of a refusal and shows again what the service holds 0ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > gives the problem of a refused change and still sends the change made after it 2ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > listLearnedRows > gives the four rows of the prototype, each with the number the service gives its reason 0ms
 ✓ src/library/create-project/lib/create-draft.test.ts > a draft of a new project > takes the default length of Settings while no length was chosen 0ms
 ✓ src/library/create-project/lib/create-draft.test.ts > a draft of a new project > keeps a length that was chosen in the sheet when the default arrives 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a project with 1 exports and 1 logged as exported with results logged 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a project with 3 exports and 1 logged as exported with results logged 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a project with 3 exports and 3 logged as exported with results logged 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of an exported project without a logged clip as before 0ms

 Test Files  38 passed (38)
      Tests  411 passed (411)
   Start at  07:06:48
   Duration  1.27s (transform 59%, import 24%, tests 12%, worker 4%)

  Transform  transforming modules took 2.22s · 59% of tracked time, re-done on every run
             persist transforms across runs with fsModuleCache: true
             learn more: https://vitest.dev/guide/improving-performance#caching-between-reruns

exit code: 0
```

Result: pass

## V13 — On the Results tab and on Settings at 390 px no screen scrolls sideways and no label is cut off at 200% text size, no control has a tap area under 44 px, and text differs from its background by 4.5 to 1 (R7, A148)

Check: `pnpm test:browser e2e/results-fit.spec.ts`

Expected: For the Results tab empty, with the seeded set, and presented with twelve clips, titles of 110 characters and views of ten digits, and for Settings without a key and with one saved, with counts of three digits, at 390 px: at the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled to its end, a screen's last line lies above the tab bar; no control has a tap area under 44 px; in light and in dark no text measures under 4.5 to 1. At 1360 px the same screens meet the ratio in light and in dark.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/results-fit.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-vXqlqE/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-vXqlqE/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-vXqlqE/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-vXqlqE/fixtures/long-talk.mp4
  ✓  1 e2e/results-fit.spec.ts:79:3 › at 390 px › the results presented to the page hold twelve clips with titles of 110 characters and views of ten digits, and Settings counts of three digits (22.2s)
  ✓  2 e2e/results-fit.spec.ts:101:3 › at 390 px › every Results and Settings screen fits at the normal size and at 200%, with tap areas of 44 px and its last line above the bar (49.6s)
  ✓  3 e2e/results-fit.spec.ts:114:3 › at 390 px › no text of a Results or Settings screen measures under 4.5 to 1, in light and in dark (50.6s)
  ✓  4 e2e/results-fit.spec.ts:131:3 › at 1360 px › the same Results and Settings screens hold no text under 4.5 to 1, in light and in dark (49.4s)

  4 passed (3.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-vXqlqE
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/results-fit.spec.ts` measures five screens in tests 2, 3 and 4: the Results tab empty,
with the seeded set and with the twelve crowded clips, and Settings without a key and with one.
Each test fails unless all five were measured in both states it names.

Result: pass

## V14 — The Results tab and Settings are captured at 390 px and 1360 px, in light and in dark (R3, A20, A148)

Check: block V14

Expected: The exit code is 0. The evidence folder holds four files named `results-<width>-<theme>.png` and four named `settings-<width>-<theme>.png`, for `390` and `1360`, in `light` and `dark`.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/results-captures.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-oBhR0m/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-oBhR0m/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-oBhR0m/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-oBhR0m/fixtures/long-talk.mp4
  ✓  1 e2e/results-captures.spec.ts:139:1 › the Results tab and Settings of a talk with the seeded set are captured whole at 390 and 1360 px, in light and in dark (51.2s)

  1 passed (1.2m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-oBhR0m
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code of the browser tests: 0
-rw-r--r--  1 work  staff   74119 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-1360-dark.png
-rw-r--r--  1 work  staff   75027 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-1360-light.png
-rw-r--r--  1 work  staff   70813 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-390-dark.png
-rw-r--r--  1 work  staff   71502 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-390-light.png
-rw-r--r--  1 work  staff  101610 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-1360-dark.png
-rw-r--r--  1 work  staff  101535 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-1360-light.png
-rw-r--r--  1 work  staff  102997 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-390-dark.png
-rw-r--r--  1 work  staff  102653 Oct  7 07:11 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-390-light.png
```

The eight files were written by this run at 07:11, byte for byte as committed.

Result: pass

## V15 — The Results tab and Settings reproduce the prototype's screens with the talk's own data, on phone and desktop, in light and in dark (R3, R5, A140, A141, A144)

Check: Open every capture from V14 and record in the proof what each shows.

Expected: Results at 390: the project's title above the Review, Export and Results control; "Views After 7 Days" with three rows, 01, 02 and 03, each with its title and a field that holds 1200, 5400 or 48000; under them "Enter each clip’s views a week after posting. The selector compares them with its own ranking and adjusts what it favours on your next video."; "Ranking Against Outcome" with the sentence of V5 and three bars, the longest first, beside 48,000, 5,400 and 1,200; the tab bar. Results at 1360: the sidebar, where the project's row reads "Exported · 3 clips exported, results logged"; a toolbar with the three tabs and the More button; the same page beside it. Settings: the five groups; a storage line of the form "50 GB free of 460 GB on this Mac" with its bar; an address under "Open on Your Phone"; under "What the Selector Has Learned" the counts 1, 1, 0 and 0 and "Forget All of It" in the destructive colour. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text.

`evidence/results-390-light.png`: "talk" with "Video link · 00:03:54 · 6 candidates" above the
Review, Export and Results control, with Results chosen. "Views After 7 Days" lists 01 "The
worst day my bakery ever had" with 1200, 02 "Hire for the habits you cannot teach" with 5400 and
03 "Almost everyone gets price wrong" with 48000. Under the rows stands "Enter each clip’s views
a week after posting. The selector compares them with its own ranking and adjusts what it
favours on your next video." "Ranking Against Outcome" holds "The best performer was the
selector’s pick number 3. Ranks in order of views: 3, 2, 1." and three bars: a full one beside
48,000, a short one beside 5,400 and a dot beside 1,200. The tab bar with Library and Settings
is at the bottom. The two longer titles of the rows wrap onto a second line.

`evidence/results-390-dark.png`: the same screen on a black ground with dark grey groups and
white text.

`evidence/results-1360-light.png`: the sidebar with Clipper, New Project and the project's row,
which reads "talk", "Video link · 4 min" and "Exported · 3 clips exported, results logged", and
Settings with "50 GB free on this Mac" at its foot. The toolbar holds the title, the Review,
Export and Results tabs and the More button. Beside the sidebar is the same page as at 390 px,
with each title on one line.

`evidence/results-1360-dark.png`: the same screen with dark surfaces and light text.

`evidence/settings-390-light.png`: the five groups AI Services, Defaults for New Projects,
Storage, Open on Your Phone and What the Selector Has Learned. Storage reads "50 GB free of 460
GB on this Mac" over a bar filled for most of its length. Under "Open on Your Phone" stands
`http://192.168.10.111:3100`, the Mac's address with the web port of the test run, beside Copy.
The last group counts Cut Off Mid-Thought 1, Not Interesting 1, Needs Earlier Context 0 and
Repeats Another Clip 0 over "Forget All of It" in red. "Anthropic API Key" wraps onto two lines
and the transcription model's choice stands under its label.

`evidence/settings-390-dark.png`: the same screen on a black ground with light text, "Forget
All of It" in a lighter red.

`evidence/settings-1360-light.png`: the sidebar with the talk's row and Settings marked as the
current screen, the toolbar titled Settings, and the five groups with the same storage line,
address and counts, each row on one line.

`evidence/settings-1360-dark.png`: the same screen with dark surfaces and light text.

No capture shows clipped or overlapping text.

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

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-SgIDXD/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-SgIDXD/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-SgIDXD/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-SgIDXD/fixtures/long-talk.mp4
  ✓  1 e2e/own-origin.spec.ts:78:1 › with projects, every request of every screen is addressed to the tool (48.6s)
  ✓  2 e2e/own-origin.spec.ts:98:1 › the Review screens of the talk ask nothing outside the tool, with the preview playing on one of them (30.2s)
  ✓  3 e2e/own-origin.spec.ts:117:1 › the Export tab of a talk with a finished clip asks nothing outside the tool, and saves its file from the tool (31.1s)
  ✓  4 e2e/own-origin.spec.ts:141:1 › the Results tab of a talk with the seeded set asks nothing outside the tool, at both widths (49.7s)
  ✓  5 e2e/own-origin.spec.ts:158:1 › the empty Library asks nothing outside the tool (1.1s)
  ✓  6 e2e/own-origin.spec.ts:175:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (6.4s)

  6 passed (3.1m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-SgIDXD
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code of the browser tests: 0
```

Result: pass

## V18 — The README and the agents' instructions cover what this milestone adds (R9, A18)

Check: block V18

Expected: The README says what the Results tab does, what the selector learns and what "Forget All of It" clears, what each choice in Settings governs, and when the source of a project is removed and what stays. It has no section on what this version does not do yet. Both files name `CLIPPER_CLOCK_AHEAD_DAYS`. `AGENTS.md` names the `learning`, `results` and `retention` packages, the results capability and the direction of their imports.

```
82:the clips inside one video. It does not forecast views.
167:The Results tab compares Clipper's ranking with how your clips did once they were posted. It
172:A week after you post a clip, type its views into its field under "Views After 7 Days". A number
174:zero clears the clip's views.
176:"Ranking Against Outcome" waits for the views of two clips. It then lists the clips with views,
177:the most viewed first, each with a bar as long as its share of the highest views. The sentence
179:was the selector’s pick number 2. Ranks in order of views: 2, 1, 4." In the Library, a project
180:with logged views reads "Exported · 4 clips exported, results logged".
182:## What the selector learns
185:rejected, with the reason of a rejection, and each clip with logged views, with its views, the
192:Once three clips have views, a second line names the kinds of hook and the lengths of the best
195:than three clips with views, no note is sent.
197:Settings shows the counted rejections under "What the Selector Has Learned". "Forget All of It"
199:stay kept or rejected, and the Results tabs keep their views. A decision or a number of views
265:each, the views you logged, the project's look and the history the selector learns from; one
266:folder per project with the fetched video, its preview copy, its transcript, the filmstrip
271:exported clips, its candidates, your decisions about them and their logged views. Git ignores
277:The fetched video and its preview copy are the large files of a project. Both are deleted after
284:The transcript, the filmstrip frames, the clip candidates, your decisions, the logged views and
333:| `CLIPPER_CLOCK_AHEAD_DAYS` | Days added to the clock that the cleanup of old source videos reads | 0 |
335:## What Clipper leaves out
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
```

The block prints the lines of both files that hold its search words. The sections they point
into were read in `README.md` as committed. "Log the results", from line 165, says what the tab
lists, how views are typed and cleared and what the outcome shows. "What the selector learns",
from line 182, says what the history holds, what the note counts and that "Forget All of It"
empties the history and changes no project. "Settings", from line 203, is a table of the seven
choices with what each governs and when it takes effect. "Where the data lives" says from line
277 when the fetched video and its preview copy are deleted and from line 284 what stays.

The README's last section, "What Clipper leaves out" at line 335, lists six things outside the
tool's scope, such as accounts and posting to the platforms. The section "What this version does
not do yet", which the README had at `5ab7552`, is gone.

`AGENTS.md` names the three packages at lines 121 and 122, gives their imports from line 126, and names the results capability at line 108 and its imports from line 112 to 118.

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
```

The review printed no finding. It read the 126 changed source files and reported each as clean,
which the block's last filter leaves out.

Result: pass

## V20 — Two changes of one clip made one after the other in the browser are both stored and shown (R40, A149)

Check: `pnpm test:browser e2e/review-preview.spec.ts --repeat-each=20 -g "preview copy moved aside"`

Expected: 20 passed, with exit code 0. Each run presses Keep and moves the out point of the same clip at once, with the preview copy moved aside, and reads "Kept", the new out point, and both in what the service holds. Baseline: this test failed once in the planner's run of the test command, on a Mac busy after a wake from sleep, and passed 20 times of 20 on the Mac at rest before any change; the tests V11 and V12 name show the mended rule itself.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-preview.spec.ts --repeat-each=20 -g 'preview copy moved aside'


Running 20 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-cHubX8/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-cHubX8/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-cHubX8/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-cHubX8/fixtures/long-talk.mp4
  ✓   1 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (22.9s)
  ✓   2 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   3 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   4 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   5 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.0s)
  ✓   6 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.2s)
  ✓   7 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   8 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓   9 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  10 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  11 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  12 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  13 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  14 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.8s)
  ✓  15 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.2s)
  ✓  16 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  17 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  18 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  19 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)
  ✓  20 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (1.1s)

  20 passed (1.9m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-cHubX8
Test data size: 0.09 GB (96.7 MB)
The test data folder was removed.
exit code: 0
```

The test, at line 433 of `web/e2e/review-preview.spec.ts`, moves the preview copy aside, presses
Keep and steps the out point of `c01` one after the other, and reads "Kept", the out point
00:00:50.3 and both from the service.

Result: pass

## V21 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

```
?? docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v1-start-log.txt
?? docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v11-service-tests.txt
?? docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v12-unit-tests.txt
?? docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v2-test-command.txt
exit code: 0
```

The check ran at 07:21, after V20, and listed the first, the second and the fourth of these
files. It ran again at 07:25, once the validator had saved the output of V12 as the third, and
that output is the one shown. The four files are evidence of this run. `proof.md` and
`issues.md` were written after it, in the same folder.

Result: pass
