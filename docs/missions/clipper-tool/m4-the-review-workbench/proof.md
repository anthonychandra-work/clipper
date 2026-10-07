# Proof: m4-the-review-workbench

Attempt: 1
Result: pass
Commit: 1663b2a

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

The checks were run from the worktree's root in the order of the table, at `1663b2a` with nothing
uncommitted before V1, on 2026-10-06 from 16:00 to 16:38. The blocks were cut out of
`validation.md` into files and run with `bash`, as written; V2's block got the folder V1 named in
the place it leaves for it. Ports 3100 and 8865 were free before V1, and the Mac was kept awake
with `caffeinate` for the whole run. Lines in square brackets are markers the validator added;
every other line in a code block is printed by the commands. A check that is one command was run
with `echo "exit code: $?"` after it, which prints the last line of its code block. A sentence
under a code block that names a test file says where a passed test holds something its name does
not state.

One run is not pasted. The validator first started V10, V12 and V15 from a loop of its own, which
handed the command an empty file name, `e2e/.spec.ts`, and got "No tests found" three times. That
was the loop and not the checks. Each of the three was then run as written, and those runs are the
ones below.

## V1 — "The test command passes"; one command runs every check (R9, R12)

Check: block V1

Expected: The last line gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `ddea123` (M3's `proof.md`, V2), and only mission documents changed before this milestone's first commit, so no gate may fail.

```

> clipper@0.1.0 test /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-tests.mjs


--- Fixtures
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-21KvCU/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-21KvCU/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-21KvCU/fixtures/long-talk.mp4
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/.cache/whisper/tiny

--- Ruff
All checks passed!

--- mypy
Success: no issues found in 166 source files

--- pytest
[81 lines left out: the header of the pytest session and one line of dots for each of its 72 test files]
======================= 860 passed in 300.37s (0:05:00) ========================

--- ESLint

--- Web build
[the lines of the Next.js build left out; its route list names /projects/[id]/review and /projects/[id]/review/[clip]]

--- TypeScript check

--- Vitest
[4 lines left out]
 Test Files  29 passed (29)
      Tests  305 passed (305)
[7 lines left out: the start time, the duration and a note on workers]
--- Playwright

Running 153 tests using 1 worker

[153 lines left out, one for each browser test, each with ✓; V3 and V25 count them by file]

  153 passed (15.6m)

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
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-21KvCU
Test data size: 0.21 GB (210.3 MB)
The test data folder was removed.
exit code of pnpm test: 0
```

The whole output, 324 lines, is `evidence/v1-test-command.txt`, which the block saved. All nine gates
report passed, as at the baseline `ddea123`. The run kept its data in
`/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-21KvCU`, 0.21 GB, and removed it.

Result: pass

## V2 — Test data is removed and no tracked file changes (R56)

Check: block V2

Expected: `ls` reports that the folder does not exist. Every path `git status` lists is inside this milestone's folder.

```
$ ls "/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-21KvCU"
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-21KvCU: No such file or directory
$ git status --porcelain
?? docs/missions/clipper-tool/m4-the-review-workbench/evidence/v1-test-command.txt
```

The lines that start with `$` are the two commands of the block, with the folder V1 named in the
place the block leaves for it. The one path listed is the file V1 saved, inside this milestone's
folder.

Result: pass

## V3 — "Every check below runs as a browser test on the fixture project" (R12, A103)

Check: block V3

Expected: Each of the eight lines shows at least one passed test and `0 not passed`. The line from `ready-talk.ts` shows the shared project being made from `talk.mp4`. The last number, the uses of the shared project in the Review tests, is above 0.

```
review-list: 11 passed, 0 not passed
review-inspect: 6 passed, 0 not passed
review-decide: 8 passed, 0 not passed
review-trim: 9 passed, 0 not passed
review-preview: 13 passed, 0 not passed
review-phone: 7 passed, 0 not passed
review-fit: 6 passed, 0 not passed
review-captures: 1 passed, 0 not passed
11:const TALK_VIDEO = 'talk.mp4';
     186
```

Line 11 of `web/e2e/support/ready-talk.ts` names the video. `makeReadyTalk` in the same file makes
the shared project from a link to it, `${server.address}/${TALK_VIDEO}`, and waits for it to be
ready. The 61 passed tests of the eight files and the 92 of V25 are the 153 of V1.

Result: pass

## V4 — The Review tab works on real data: the filtered candidate list, and the source timeline with window scores and clip markers (R3, R35, R44, A99, A100, A101)

Check: `pnpm test:browser e2e/review-list.spec.ts`

Expected: At 1360 px the talk's Review tab lists its six clips in the order of their ranks, each with its title, its start, its length, its tags and its total, under filters that read 6, 6, 0 and 0, and says under the list that the score orders clips inside this video and does not forecast views. The source timeline shows four bars, three of them highlighted, and six numbered pins in the order of the clips' starts. A row and a pin each lead to their clip's address, a reload keeps it, and an address that names no clip leads to the list. At 390 px the Review address is the list.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-list.spec.ts


Running 11 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-42PGmq/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-42PGmq/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-42PGmq/fixtures/long-talk.mp4
  ✓   1 e2e/review-list.spec.ts:77:3 › at 1360 px › the list holds the talk’s six clips in the order of their ranks under filters that read 6, 6, 0 and 0 (19.1s)
  ✓   2 e2e/review-list.spec.ts:98:3 › at 1360 px › the Review address shows the list beside the first-ranked clip, and the list pane beside the detail pane (428ms)
  ✓   3 e2e/review-list.spec.ts:114:3 › at 1360 px › a row leads to its clip’s address and is marked there, a reload keeps both, and Back returns to the clip before (734ms)
  ✓   4 e2e/review-list.spec.ts:137:3 › at 1360 px › an address that names no clip of the project leads to the list (392ms)
  ✓   5 e2e/review-list.spec.ts:145:3 › at 1360 px › the Library address shows the Review tab of the newest project with its first clip marked (420ms)
  ✓   6 e2e/review-list.spec.ts:161:5 › at 1360 px › in a short window › the list pane stays in place, where it was scrolled to, while the address moves from clip to clip (573ms)
  ✓   7 e2e/review-list.spec.ts:183:3 › the source timeline at 1360 px › “Source Video” stands above the candidates with a bar for each window, as high as its score (434ms)
  ✓   8 e2e/review-list.spec.ts:210:3 › the source timeline at 1360 px › six numbered pins stand in the order of the clips’ starts, over the middles of their clips (379ms)
  ✓   9 e2e/review-list.spec.ts:232:3 › the source timeline at 1360 px › a pin leads to its clip’s address, where the pin and the row are marked (536ms)
  ✓  10 e2e/review-list.spec.ts:247:3 › at 390 px › the Review address is the list under the project’s title and tabs, with no clip open (314ms)
  ✓  11 e2e/review-list.spec.ts:261:3 › at 390 px › a row leads to a screen titled “Clip 3 of 6” whose back control returns to the list (501ms)

  11 passed (41.2s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-42PGmq
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code: 0
```

In `web/e2e/review-list.spec.ts` the first test compares each row's rank, title, tags and total with
the six clips as cut, its start and its length with the times the service holds, the first reading
"00:00:11 · 32.8 s", and reads "The score orders clips inside this video. It does not forecast
views." under the list. The seventh reads the scores 72, 81, 64 and 23 of the four bars and finds
the first three highlighted.

Result: pass

## V5 — "Selecting a candidate shows its reason, its four subscores, its total and its rank"; the flag, the replay marker and the editable title (R31, R35, R40, R44)

Check: `pnpm test:browser e2e/review-inspect.spec.ts`

Expected: Choosing a candidate shows its reason, its four subscores out of 25, its total out of 100 and its rank among the six, each equal to what the service holds, with the sentence that the score orders clips inside this video and does not forecast views. The clip flagged as needing context and the one flagged as not recommended each show their sentence. A clip under a replay peak shows "Replay peak" in the list and the note in the inspector. A typed title is in the list at once and in both places after a reload.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-inspect.spec.ts


Running 6 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LmdqbT/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LmdqbT/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LmdqbT/fixtures/long-talk.mp4
  ✓  1 e2e/review-inspect.spec.ts:43:1 › choosing a candidate shows its reason, its four subscores, its total and its rank as the service holds them (18.7s)
  ✓  2 e2e/review-inspect.spec.ts:67:1 › each candidate shows its own reason and standing, the first without being chosen (606ms)
  ✓  3 e2e/review-inspect.spec.ts:83:1 › the clip that needs context and the one that is not recommended each show their flag’s sentence (692ms)
  ✓  4 e2e/review-inspect.spec.ts:105:1 › a title typed into the field is in the list at once, and in the field and the list after a reload (1.0s)
  ✓  5 e2e/review-inspect.spec.ts:130:1 › a title is saved when the field is left, without waiting, and emptying the field brings back selection’s title (1.0s)
  ✓  6 e2e/review-inspect.spec.ts:157:1 › a clip presented as lying under a replay peak shows the tag in the list and the note in the inspector (463ms)

  6 passed (38.1s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-LmdqbT
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code: 0
```

In `web/e2e/review-inspect.spec.ts` the first test reads "Hook 21/25", "Arc 20/25", "Value 22/25",
"Share 19/25" and "82 of 100, rank 3 of 6. The score orders clips inside this video. It does not
forecast views.", and compares the reason and the scores with the service's. The sixth reads the
tag "Replay peak" in the second row and the note "Replay peak. Viewers of the source video
rewatched this part more than the rest."

Result: pass

## V6 — "The sentence controls move the in point and the out point by one transcript sentence, and the length shown changes to match"; every change is stored (R41, A93)

Check: `pnpm test:browser e2e/review-trim.spec.ts`

Expected: Each sentence step, earlier and later, on the in point and on the out point, moves that point to the neighbouring sentence's time as the service holds it, and the length shown is the difference of the two times shown. A moved point is still there after a reload.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-trim.spec.ts


Running 9 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-KGZpYF/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-KGZpYF/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-KGZpYF/fixtures/long-talk.mp4
  ✓  1 e2e/review-trim.spec.ts:84:1 › each sentence step moves its point to the neighbouring sentence’s time as the service holds it, and the length is the difference of the two times (19.1s)
  ✓  2 e2e/review-trim.spec.ts:109:1 › a moved point is followed by the list’s time and length, the timeline’s pin and the transcript, and is still there after a reload (619ms)
  ✓  3 e2e/review-trim.spec.ts:132:1 › five 0.2-second steps move a point by one second and switch the sixth off, earlier and later (1.6s)
  ✓  4 e2e/review-trim.spec.ts:156:1 › the sentence steps are switched off at both ends of the reach and where the two points meet (904ms)
  ✓  5 e2e/review-trim.spec.ts:180:1 › the reading names the preferred band, the limits, the minimum and the maximum, each for a clip of that length (1.4s)
  ✓  6 e2e/review-trim.spec.ts:206:1 › the “needs context” flag and its tag go when the in point moves one sentence earlier, by the button and by the step, and return when it moves back (843ms)
  ✓  7 e2e/review-trim.spec.ts:233:1 › every frame of the strip is a loaded picture 104 px high whose colours are the talk’s colour bars (468ms)
  ✓  8 e2e/review-trim.spec.ts:253:1 › a handle dragged along the strip leaves its point on the sentence nearest the place it was let go, and its words change to match (856ms)
  ✓  9 e2e/review-trim.spec.ts:282:1 › a handle is a slider that the arrow keys move by a sentence, within what the rules allow (460ms)

  9 passed (43.6s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-KGZpYF
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code: 0
```

The first test of `web/e2e/review-trim.spec.ts` presses the four sentence steps in turn, the in
point earlier and later and the out point later and earlier, and after each compares the two times
and the length shown with the clip the service holds.

Result: pass

## V7 — "The 0.2-second controls stop at one second either way, and every control at its limit is disabled" (R41, A93)

Check: the output of V6

Expected: Five 0.2-second steps move a point by one second and the sixth is switched off, earlier and later. The sentence steps are switched off at both ends of the clip's reach and where the two points meet.

```
  ✓  3 e2e/review-trim.spec.ts:132:1 › five 0.2-second steps move a point by one second and switch the sixth off, earlier and later (1.6s)
  ✓  4 e2e/review-trim.spec.ts:156:1 › the sentence steps are switched off at both ends of the reach and where the two points meet (904ms)
exit code: 0
```

Lines 3 and 4 of V6's output. The third test reads the in point at 00:00:10.9 after five steps
earlier and at 00:00:12.9 after ten later, and the out point at 00:00:45.7 after five later, each
with the step that would be the sixth switched off.

Result: pass

## V8 — "The length reading states whether the clip is inside the preferred band, inside the limits, too short or too long" (R33, A94)

Check: the output of V6

Expected: The reading says "inside the preferred 25–50 s band", "inside the 25–60 s limits", "shorter than the 25 s minimum" and "longer than the 60 s maximum", each for a clip of that length.

```
  ✓  5 e2e/review-trim.spec.ts:180:1 › the reading names the preferred band, the limits, the minimum and the maximum, each for a clip of that length (1.4s)
exit code: 0
```

Line 5 of V6's output. The test reads "inside the preferred 25–50 s band." at 32.8 s, "inside the
25–60 s limits." at 52.6 s, "shorter than the 25 s minimum." at 4.7 s and "longer than the 60 s
maximum." at 65.3 s.

Result: pass

## V9 — "The filmstrip shows frames from the fixture video. Dragging a handle moves that point to a sentence boundary, and the times and the length shown change to match"; the cleared flag (R41, A93, A95)

Check: the output of V6

Expected: Every frame of the strip is a loaded picture whose colours are the talk's colour bars. A handle dragged along the strip leaves its point on the start or the end of the sentence nearest the place it was let go, and the time, the length and the handle's own words change to match. The "needs context" flag goes when the in point moves one sentence earlier and returns when it moves back.

```
  ✓  6 e2e/review-trim.spec.ts:206:1 › the “needs context” flag and its tag go when the in point moves one sentence earlier, by the button and by the step, and return when it moves back (843ms)
  ✓  7 e2e/review-trim.spec.ts:233:1 › every frame of the strip is a loaded picture 104 px high whose colours are the talk’s colour bars (468ms)
  ✓  8 e2e/review-trim.spec.ts:253:1 › a handle dragged along the strip leaves its point on the sentence nearest the place it was let go, and its words change to match (856ms)
exit code: 0
```

Lines 6, 7 and 8 of V6's output. The eighth test lets the in handle go near the start of the second
sentence and the out handle near the end of the thirteenth, and reads the times 00:00:02.4 and
00:00:50.3, the length 47.8 s and the handles' words "Sentence 2 of 15, 00:00:02.4" and "Sentence
13 of 15, 00:00:50.3".

Result: pass

## V10 — "A kept clip, a rejected clip with its reason, and an edited title are all still there after a reload, and the counts in the list filters and in the Library row match" (R40, A92)

Check: `pnpm test:browser e2e/review-decide.spec.ts`

Expected: After a reload the first clip is kept, the second is rejected with the reason it was given, and the third has its new title. The filters read 6, 4, 1 and 1, the Export tab reads 1, and the Library row reads "Ready to review · 6 candidates, 1 kept, 1 rejected".

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-decide.spec.ts


Running 8 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-8Vij76/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-8Vij76/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-8Vij76/fixtures/long-talk.mp4
  ✓  1 e2e/review-decide.spec.ts:90:1 › Reject, Keep and Next sit in the toolbar after the More button (20.4s)
  ✓  2 e2e/review-decide.spec.ts:106:1 › Keep keeps the clip at once in the buttons, the row, the pin and the counts, and Keep again leaves it undecided (597ms)
  ✓  3 e2e/review-decide.spec.ts:128:1 › Reject opens the menu of four reasons and No Reason under its heading, and a kept clip has no Undo Reject (500ms)
  ✓  4 e2e/review-decide.spec.ts:149:1 › each of the five choices rejects the clip with it, and carries the tick when the menu is opened again (2.1s)
  ✓  5 e2e/review-decide.spec.ts:173:1 › the menu of a rejected clip also offers Undo Reject, which leaves the clip undecided (857ms)
  ✓  6 e2e/review-decide.spec.ts:199:1 › Next goes through the six clips and back to the first, and through the two of a filter’s group (1.1s)
  ✓  7 e2e/review-decide.spec.ts:222:1 › the menu opens with the keyboard on the reason that was chosen, moves with the arrows and closes with Escape (714ms)
  ✓  8 e2e/review-decide.spec.ts:244:1 › a kept clip, a rejected clip with its reason and an edited title are still there after a reload, and the counts match (1.2s)

  8 passed (43.9s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-8Vij76
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code: 0
```

The eighth test of `web/e2e/review-decide.spec.ts` reads, after the reload, the tags "Kept" on the
first row and "Rejected" on the second, the title "Price by your own costs" on the third, the
reason `not-interesting` in the service's review, the filters All 6, To Do 4, Kept 1 and Rejected
1, the count 1 on the Export tab and the Library row "Ready to review · 6 candidates, 1 kept, 1
rejected".

Result: pass

## V11 — "Reject opens the menu from D31. Choosing a reason marks the clip rejected with that reason, and "Undo Reject" clears it" (R40)

Check: the output of V10

Expected: Reject opens a menu with "Cut Off Mid-Thought", "Not Interesting", "Needs Earlier Context", "Repeats Another Clip" and "No Reason". Each choice leaves the clip rejected with that choice ticked when the menu opens again, and the menu of a rejected clip also offers "Undo Reject", which leaves the clip undecided. Keep keeps a clip and, pressed again, leaves it undecided. Next goes through the clips of the shown group and back to its first.

```
  ✓  2 e2e/review-decide.spec.ts:106:1 › Keep keeps the clip at once in the buttons, the row, the pin and the counts, and Keep again leaves it undecided (597ms)
  ✓  3 e2e/review-decide.spec.ts:128:1 › Reject opens the menu of four reasons and No Reason under its heading, and a kept clip has no Undo Reject (500ms)
  ✓  4 e2e/review-decide.spec.ts:149:1 › each of the five choices rejects the clip with it, and carries the tick when the menu is opened again (2.1s)
  ✓  5 e2e/review-decide.spec.ts:173:1 › the menu of a rejected clip also offers Undo Reject, which leaves the clip undecided (857ms)
  ✓  6 e2e/review-decide.spec.ts:199:1 › Next goes through the six clips and back to the first, and through the two of a filter’s group (1.1s)
exit code: 0
```

Lines 2 to 6 of V10's output. The third test reads the menu's five choices as "Cut Off
Mid-Thought", "Not Interesting", "Needs Earlier Context", "Repeats Another Clip" and "No Reason".

Result: pass

## V12 — "Play moves through the clip and stops at the out point, and the caption shown at a given moment is the words spoken at that moment"; the preview copy reaches the browser through the web app (R19, R42, A91, A97, A98)

Check: `pnpm test:browser e2e/review-preview.spec.ts`

Expected: A range request for the preview copy through the web port answers 206, and a video element plays it. On the Review tab, Play moves the playhead forward, and the clip stops at its out point with the video's time within 0.3 seconds of it. At moments set with the slider and at moments read while the clip plays, the caption holds the word the stored transcript gives for that moment, with no more than three, one and six words in the three styles.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-preview.spec.ts


Running 13 tests using 1 worker

  ✓   1 e2e/review-preview.spec.ts:163:1 › the tool serves Inter from its own address at the committed size, and the page draws a heavy text in it (355ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-0s2VTF/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-0s2VTF/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-0s2VTF/fixtures/long-talk.mp4
  ✓   2 e2e/review-preview.spec.ts:184:1 › through the web port a byte range of the preview copy answers 206, and a video element plays it and plays on after a jump (8.5s)
  ✓   3 e2e/review-preview.spec.ts:210:1 › Play moves the playhead forward from the in point, and Pause holds it (19.6s)
  ✓   4 e2e/review-preview.spec.ts:231:1 › from two seconds before the end the clip stops at its out point, and Play at the end starts from the in point (3.9s)
  ✓   5 e2e/review-preview.spec.ts:255:1 › with the slider on the middle of a word of the stored transcript, the caption holds that word in each style, in no more than three, one and six words (769ms)
  ✓   6 e2e/review-preview.spec.ts:281:1 › while the clip plays, the caption read together with the video’s time holds the word spoken at that moment, in each style (25.3s)
  ✓   7 e2e/review-preview.spec.ts:309:1 › the keyword style marks one word of a caption, and the two other styles mark none (596ms)
  ✓   8 e2e/review-preview.spec.ts:328:1 › the hook title shows at one second and not at four, and never with its switch off (514ms)
  ✓   9 e2e/review-preview.spec.ts:345:1 › the safe zones follow their switch, and the caption and the hook title are drawn in Inter (625ms)
  ✓  10 e2e/review-preview.spec.ts:363:1 › each framing draws a different part of the talk’s colour bars, read from a capture of the frame (795ms)
  ✓  11 e2e/review-preview.spec.ts:382:1 › a changed look is the same on another clip and after a reload, and is the one the service holds (900ms)
  ✓  12 e2e/review-preview.spec.ts:410:1 › a step of a point and Next each put the playhead back at the in point, paused (2.4s)
  ✓  13 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (663ms)

  13 passed (1.4m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-0s2VTF
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code: 0
```

In `web/e2e/review-preview.spec.ts` the fourth test compares the video's time at the stop with the
clip's end and allows 0.3 seconds. The fifth and the sixth ask of every caption they read that it
holds the word of the stored transcript and has no more words than its style allows.

Result: pass

## V13 — The preview shows the source footage in a 9:16 frame with the chosen framing, the hook title, the safe zones and captions in Inter, and the look applies to the whole project (R42, R46, A15, A96, A98)

Check: the output of V12

Expected: The three framings draw three different pictures, each holding the talk's colour bars. The hook title shows at one second and not at four, and never with its switch off. The safe zones follow their switch. The caption's typeface is Inter, served by the tool. A changed look is the same on another clip and after a reload.

```
  ✓   1 e2e/review-preview.spec.ts:163:1 › the tool serves Inter from its own address at the committed size, and the page draws a heavy text in it (355ms)
  ✓   8 e2e/review-preview.spec.ts:328:1 › the hook title shows at one second and not at four, and never with its switch off (514ms)
  ✓   9 e2e/review-preview.spec.ts:345:1 › the safe zones follow their switch, and the caption and the hook title are drawn in Inter (625ms)
  ✓  10 e2e/review-preview.spec.ts:363:1 › each framing draws a different part of the talk’s colour bars, read from a capture of the frame (795ms)
  ✓  11 e2e/review-preview.spec.ts:382:1 › a changed look is the same on another clip and after a reload, and is the one the service holds (900ms)
exit code: 0
```

Lines 1 and 8 to 11 of V12's output.

Result: pass

## V14 — A project whose source is gone shows a notice in place of the preview (R45, A98)

Check: the output of V12

Expected: With the project's preview copy moved out of its place in the test's data folder, the Review tab shows "Preview unavailable. The source video was deleted to free space." in place of the preview, and a decision and a step of a point still work.

```
  ✓  13 e2e/review-preview.spec.ts:433:1 › with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work (663ms)
exit code: 0
```

Line 13 of V12's output. The test moves `preview.mp4` of the project aside in the run's data folder,
reads "Preview unavailable. The source video was deleted to free space.", presses Keep and a
sentence step, and moves the file back.

Result: pass

## V15 — "At 390 px the candidate list shows first; opening a clip shows the detail with the fixed bar of Reject, Keep and Next; the back control returns to the list" (R43, R6, A99)

Check: `pnpm test:browser e2e/review-phone.spec.ts`

Expected: At 390 px the Review address shows the candidate list, above the source timeline, and no preview. A row opens the clip's screen at its top, with the preview, the inspector and a bar fixed to the bottom of the window that holds Reject, Keep and Next. The back control returns to the list. Left by the back control and by the browser's Back, the list is where it was scrolled to.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-phone.spec.ts


Running 7 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9W0GZo/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9W0GZo/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9W0GZo/fixtures/long-talk.mp4
  ✓  1 e2e/review-phone.spec.ts:61:1 › the Review address shows the candidate list first, above the source timeline, with no preview on the screen (20.0s)
  ✓  2 e2e/review-phone.spec.ts:78:1 › a row opens the clip’s screen at its top with the preview, the inspector and a bar of Reject, Keep and Next fixed to the bottom, and the back control returns to the list with the tab bar (624ms)
  ✓  3 e2e/review-phone.spec.ts:101:1 › the list is where it was left after the back control and after the browser’s Back, and Forward returns to the clip (1.1s)
  ✓  4 e2e/review-phone.spec.ts:125:1 › Next opens the next clip’s screen at its top (581ms)
  ✓  5 e2e/review-phone.spec.ts:138:1 › each of the three tabs and a clip open at their own addresses, and a reload returns to each (550ms)
  ✓  6 e2e/review-phone.spec.ts:161:1 › with the clip playing, scrolling past the preview pins a strip under the top bar that still plays, pauses and plays again, and scrolling back up puts the preview back in the page (2.7s)
  ✓  7 e2e/review-phone.spec.ts:186:1 › Reject opens its menu above the buttons of the bar, and a reason chosen there leaves the button reading “Rejected” (778ms)

  7 passed (42.1s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-9W0GZo
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code: 0
```

Result: pass

## V16 — "Each tab and each clip opens at its own address, and a reload returns to it" (R6)

Check: the output of V15

Expected: The Review, Export and Results tabs and a clip each open at their own address, and a reload shows the same tab and the same clip. Forward after Back returns to the clip.

```
  ✓  3 e2e/review-phone.spec.ts:101:1 › the list is where it was left after the back control and after the browser’s Back, and Forward returns to the clip (1.1s)
  ✓  5 e2e/review-phone.spec.ts:138:1 › each of the three tabs and a clip open at their own addresses, and a reload returns to each (550ms)
exit code: 0
```

Lines 3 and 5 of V15's output.

Result: pass

## V17 — "At 390 px, scrolling the clip screen past the preview pins it under the top bar, and it still plays" (R43)

Check: the output of V15

Expected: With the clip playing, scrolling its screen past the preview pins a strip with the picture, Pause, the slider and the clock directly under the top bar. The video's time goes on advancing, the strip's Pause stops it and its Play starts it again, and scrolling back up returns the preview to the page.

```
  ✓  6 e2e/review-phone.spec.ts:161:1 › with the clip playing, scrolling past the preview pins a strip under the top bar that still plays, pauses and plays again, and scrolling back up puts the preview back in the page (2.7s)
exit code: 0
```

Line 6 of V15's output. The test finds the picture, the play control, the slider and the clock in
the pinned strip, and the strip within 1 px of the top bar's lower edge.

Result: pass

## V18 — "Screen captures at 390 px and 1360 px, in light and in dark, are saved" (A20, A103)

Check: block V18

Expected: The exit code is 0. The evidence folder holds eight files named `review-list-<width>-<theme>.png` and `review-clip-<width>-<theme>.png`, for `390` and `1360`, in `light` and `dark`, and `talk-review.json`. The count of `grep` is 0.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-captures.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Annnte/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Annnte/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Annnte/fixtures/long-talk.mp4
  ✓  1 e2e/review-captures.spec.ts:118:1 › the Review list and the flagged clip are captured whole at 390 and 1360 px, in light and in dark, and the talk’s review is saved (21.8s)

  1 passed (37.9s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Annnte
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code of the browser tests: 0
-rw-r--r--  1 work  staff  288360 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-1360-dark.png
-rw-r--r--  1 work  staff  290668 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-1360-light.png
-rw-r--r--  1 work  staff  215858 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-390-dark.png
-rw-r--r--  1 work  staff  213610 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-clip-390-light.png
-rw-r--r--  1 work  staff  266427 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-1360-dark.png
-rw-r--r--  1 work  staff  268640 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-1360-light.png
-rw-r--r--  1 work  staff  108738 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-390-dark.png
-rw-r--r--  1 work  staff  110437 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/review-list-390-light.png
-rw-r--r--  1 work  staff  366347 Oct  6 16:27 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m4-the-review-workbench/evidence/talk-review.json
0
```

Eight captures and `talk-review.json`, written at 16:27 in this run. The eight pictures are byte for
byte the ones committed at `4dea2e8`: `git status` lists none of them as changed.

Result: pass

## V19 — The Review tab reproduces the prototype's screens with the talk's own data, on phone and desktop, in light and in dark (R3, R5)

Check: Open every capture from V18 and record in the proof what each shows.

Expected: `review-list` at 390: the project's title above the Review, Export and Results control, with 1 beside Export; "Candidates" with four filters and their counts; six rows, each with a rank, a title, a time and a length, tags and a score, the first marked "Kept" and the sixth "Rejected"; the sentence about the score; "Source Video" with bars and six numbered pins; the tab bar. `review-clip` at 390: "Clip 4 of 6" in the top bar beside "Clips"; the talk's colour bars inside a 9:16 frame with a caption and the hook title; the title field; the flag's sentence with "Start One Sentence Earlier"; "Why This Clip" with four bars and the line with the total and the rank; "In and Out Points" with the length reading, a filmstrip of colour-bar frames with a handle at each end of the clip, and the In and Out rows with their steps; "Look"; "Transcript"; and a bar at the bottom with Reject, Keep and Next. At 1360: the sidebar; a toolbar with the three tabs, the More button, Reject, Keep and Next; the timeline above the candidates in the left pane; the preview beside the inspector; the first clip marked in `review-list` and the fourth in `review-clip`. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text.

The captures are in `evidence/`, written by V18 in this run. Sizes are in pixels. Each holds its
whole screen, longer than the window.

| capture | size | what it shows |
| -- | -- | -- |
| `review-list-390-light.png` | 390 × 1424 | A "Library" back control and a More control. The title "talk" with "Video link · 00:03:54 · 6 candidates", above one control holding Review, chosen, Export with 1 beside it, and Results. "Candidates" with four filters: All 6, chosen, To Do 4, Kept 1 and Rejected 1. Six rows, each with a rank from 01 to 06, a title on two lines, a start and a length, tags, a score and a chevron: "The worst day my bakery ever had", "00:00:11 · 32.8 s", 88; "Hire for the habits you cannot teach", "00:01:26 · 33.2 s", 84; "Almost everyone gets price wrong", "00:00:45 · 41.3 s", 82; "The hotel order that almost ended the business", "00:02:00 · 41.3 s", 82; "How to know when it is time to grow", "00:02:41 · 31.2 s", 75; "The smallest lesson is to write things down", "00:03:13 · 29.5 s", 55. The first row carries "Story" and a green "Kept" with a tick; the fourth "Confession" and an orange "Needs context"; the sixth, in grey, "No hook", an orange "Not recommended" and a red "Rejected" with a cross. Under the list: "The score orders clips inside this video. It does not forecast views." Then "Source Video": a card with four bars, the first three blue and the fourth grey and low, six numbered pins in two rows, 1, 2 and 5 above and 3, 4 and 6 below, pin 1 ringed in green and pin 6 in a dashed red ring, the times 00:00:00, 00:00:58, 00:01:57, 00:02:56 and 00:03:54, and a three-line footer. The tab bar with Library, marked current, and Settings lies below the last line of text. |
| `review-list-390-dark.png` | 390 × 1424 | The same screen on a black page, with dark grey groups and tab bar, white titles and light grey second lines. The bars, the pins and the tags keep their colours. |
| `review-clip-390-light.png` | 390 × 3156 | A "Clips" back control with "Clip 4 of 6" beside it. A 9:16 frame with round corners holding the talk's colour bars, cyan, green and magenta above a row of magenta, black and cyan and a row of white, purple and black. Inside it the hook title "I let one customer become my boss" in a white box near the top, the caption "I ALSO WANT" in white capitals, and at the foot a bar with Play, a slider at its start and "0:00 / 0:41". "Title" with a field that reads "The hotel order that almost ended the bu…". An orange panel with a warning sign, the sentence "Opens on “also” and never says what the business is, so a viewer who starts here lacks the setting." and the control "Start One Sentence Earlier". "Why This Clip": "A confession with a cost and a way out, closed by the rule it left behind.", four bars, Hook 20/25, Arc 22/25, Value 21/25 and Share 19/25, and under the group "82 of 100, rank 4 of 6. The score orders clips inside this video. It does not forecast views." "In and Out Points": "41.3 s, inside the preferred 25–50 s band." over a band marked 25, 50 and 60; a filmstrip of colour-bar frames, dimmed outside the clip, with a frame around the clip and a handle at each of its ends; the rows In, 00:02:00.1, and Out, 00:02:41.4, each with a pair of Sentence steps and a pair of 0.2 s steps; and the footer "Drag a handle to move the cut to another sentence, or step it below." "Look": Captions with Keyword chosen, Each Word and Plain; Framing with Speaker chosen, Stacked and Full Frame; Hook Title, on; Platform Safe Zones, off; and "The look applies to every clip in this project." "Transcript": sixteen sentences, three in grey, then "IN" beside "I also want to be honest about a mistake that almost ended the business.", eight more, "OUT" beside "When one of them grows too large, I go and find others before I need them.", and three in grey. At the bottom a bar with Reject, a blue Keep and Next, below the last sentence. |
| `review-clip-390-dark.png` | 390 × 3156 | The same screen on a black page, with dark grey groups, a dark brown flag panel, white text and light blue "IN" and "OUT". The frame around the clip in the filmstrip is white. The black parts of the colour bars are the colour of the page. |
| `review-list-1360-light.png` | 1360 × 1779 | A sidebar with Clipper, a sidebar toggle, New Project, a Projects list whose one row, marked, reads "talk", "Video link · 4 min" and "Ready to review · 6 candidates, 1 kept, 1 rejected", and at its foot Settings and "50 GB free on this Mac". A toolbar with "talk" over "Video link · 00:03:54 · 6 candidates", the control with Review chosen, Export 1 and Results, then More, Reject, the Keep control, which reads "Kept" in green with a tick because the clip shown is the kept one, and a blue Next. In the left pane "Source Video", with the four bars, the six pins, pin 1 ringed, the times and the footer, stands above "Candidates", with the four filters and the six rows, the first on a blue ground and tagged "Kept", the sixth tagged "Rejected", and the sentence about the score. Beside the pane the preview: the colour bars in a 9:16 frame with the hook title "The oven broke before sunrise", the caption "I WANT TO" and "0:00 / 0:32". Beside the preview the inspector: Title, "The worst day my bakery ever had"; Why This Clip with its reason, four bars at 23/25, 23/25, 20/25 and 22/25, and "88 of 100, rank 1 of 6." with the sentence about the score; In and Out Points with "32.8 s, inside the preferred 25–50 s band.", the band, the filmstrip with its two handles, In at 00:00:11.9 and Out at 00:00:44.7 with their steps; Look; and Transcript, fifteen sentences with "IN" at "I want to tell you about the worst day my bakery ever had." and "OUT" at "What they do not forgive is silence." |
| `review-list-1360-dark.png` | 1360 × 1779 | The same screen with a dark grey sidebar, a black page, dark grey groups and white text. The marked rows are on a dark blue ground. |
| `review-clip-1360-light.png` | 1360 × 1976 | The same sidebar and toolbar, with More, Reject, a blue Keep and Next. In the left pane the timeline above the candidates, with pin 4 ringed and the fourth row, "The hotel order that almost ended the business", on a blue ground. The preview with the hook title "I let one customer become my boss", the caption "I ALSO WANT" and "0:00 / 0:41". The inspector: Title, "The hotel order that almost ended the business", whole; the orange flag panel with its sentence and "Start One Sentence Earlier"; Why This Clip with 20/25, 22/25, 21/25 and 19/25 and "82 of 100, rank 4 of 6."; In and Out Points with "41.3 s, inside the preferred 25–50 s band.", In at 00:02:00.1 and Out at 00:02:41.4; Look; and Transcript, sixteen sentences with "IN" and "OUT" as at 390. |
| `review-clip-1360-dark.png` | 1360 × 1976 | The same screen with a dark grey sidebar, a black page, dark grey groups, a dark brown flag panel and white text. |

Every expectation is met. Three things are recorded as seen:

- At 390 px the title of the fourth clip, "The hotel order that almost ended the business", is
  longer than its one-line field and ends in an ellipsis, "The hotel order that almost ended the
  bu…". It is the text of a field, shortened inside the field, with no letter cut at an edge; at
  1360 px the field holds it whole. The validator did not count it as clipped text. M1's proof
  passed the same expectation with the hint of the Video Link field ending in an ellipsis.
- In `review-list` at 1360 px the Keep control reads "Kept", because the first clip is the one
  shown and it is kept. In `review-clip` it reads "Keep".
- In the dark captures the black parts of the talk's colour bars are the colour of the page, so
  the lower right corner of the preview frame does not stand out from the page.

No label, title, row, footer or control is cut in a capture, and no text lies over other text
apart from the hook title, the caption and the player bar, which are drawn over the video.

Result: pass

## V20 — "On the Review tab at 390 px no screen scrolls sideways and no label is cut off at 200% text size, and no control has a tap area under 44 px" (R7, A101, A103)

Check: `pnpm test:browser e2e/review-fit.spec.ts`

Expected: For the list, a clip, the flagged clip, a clip with the reject menu open and a clip with the preview pinned, on the talk and on the presented review of twelve clips, 180 windows and long titles, at 390 px: at the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled to its end, a screen's last line lies above the bar at the bottom; and no control has a tap area under 44 px. The test of the tap measure shows that it finds a control made too small on purpose.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/review-fit.spec.ts


Running 6 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-89i1Wq/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-89i1Wq/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-89i1Wq/fixtures/long-talk.mp4
  ✓  1 e2e/review-fit.spec.ts:93:3 › at 390 px › the tap measure finds a control made too small on purpose, and leaves out one that is switched off (19.2s)
  ✓  2 e2e/review-fit.spec.ts:110:3 › at 390 px › the contrast measure finds a text made too faint on purpose, on a plain colour and on a plain gradient (341ms)
  ✓  3 e2e/review-fit.spec.ts:128:3 › at 390 px › on the talk, every Review screen fits at the normal size and at 200%, with tap areas of 44 px and its last line above the bar (3.9s)
  ✓  4 e2e/review-fit.spec.ts:141:3 › at 390 px › on a review of twelve crowded clips, 180 windows and long titles, every Review screen fits the same way (3.8s)
  ✓  5 e2e/review-fit.spec.ts:154:3 › at 390 px › no text of a Review screen measures under 4.5 to 1, in light and in dark, on the talk and on the crowded review (3.9s)
  ✓  6 e2e/review-fit.spec.ts:174:3 › at 1360 px › the list beside a clip and beside the flagged clip holds no text under 4.5 to 1, in light and in dark (1.9s)

  6 passed (49.8s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-89i1Wq
Test data size: 0.09 GB (96.4 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/review-fit.spec.ts` walks five screens, the list, a clip, the flagged clip, the reject menu
and the pinned preview, on the talk in the third test and on the crowded review in the fourth, each
at the normal size and at 200%, and asks for no misfit, no small tap area and no text under the
bottom bar on any of the twenty.

Result: pass

## V21 — Text and its background differ by at least 4.5 to 1 on the Review tab, in light and in dark (R7, A102)

Check: the output of V20

Expected: On the same screens at 390 px, and on the list beside a clip and beside the flagged clip at 1360 px, in light and in dark, no text measures under 4.5 to 1. The test of the contrast measure shows that it finds a text made too faint on purpose.

```
  ✓  2 e2e/review-fit.spec.ts:110:3 › at 390 px › the contrast measure finds a text made too faint on purpose, on a plain colour and on a plain gradient (341ms)
  ✓  5 e2e/review-fit.spec.ts:154:3 › at 390 px › no text of a Review screen measures under 4.5 to 1, in light and in dark, on the talk and on the crowded review (3.9s)
  ✓  6 e2e/review-fit.spec.ts:174:3 › at 1360 px › the list beside a clip and beside the flagged clip holds no text under 4.5 to 1, in light and in dark (1.9s)
exit code: 0
```

Lines 2, 5 and 6 of V20's output.

Result: pass

## V22 — The review the browser receives agrees with the stored transcript: each clip's times, the sentences its points can reach, and its captions (R41, R42, A91, A93, A97)

Check: block V22

Expected: `status: ready`. Six clips, the project's own count 6. The limits read 25 to 60 seconds with 25 to 50 preferred. Four windows, three of them shortlisted. Every clip's line ends in `as the transcript says`, and the list of clips that differ is `[]`. The ranks run from 1 to 6. The kept and the rejected counts of the review are the project's: 1 and 1.

```
status: ready | clips: 6 | the project's own count: 6
sentences in the stored transcript: 54
limits: 25 to 60 seconds, preferred {'min': 25, 'max': 50}
look: {'captionStyle': 'keyword', 'framing': 'follow-speaker', 'showHookTitle': True, 'showSafeZones': False} | preview copy on the Mac: True
windows: [('w01', 72, True), ('w02', 81, True), ('w03', 64, True), ('w04', 23, False)]
c01 rank 1, keep, sentences 4-12, 32.76 s, captions 32/89/18: as the transcript says
c02 rank 2, undecided, sentences 23-30, 33.18 s, captions 33/89/19: as the transcript says
c03 rank 3, undecided, sentences 13-22, 41.32 s, captions 38/106/21: as the transcript says
c04 rank 4, undecided, sentences 31-40, 41.30 s, captions 41/114/23: as the transcript says
c05 rank 5, undecided, sentences 41-47, 31.16 s, captions 31/90/18: as the transcript says
c06 rank 6, reject, sentences 48-51, 29.52 s, captions 26/76/14: as the transcript says
clips that differ from the transcript: []
ranks: [1, 2, 3, 4, 5, 6]
kept and rejected in the review: 1 and 1 | in the project: 1 and 1
```

Result: pass

## V23 — The service's rules for the review, by test name (R20, R40, R41, R45, A91 to A97)

Check: block V23

Expected: The last line gives exit code 0. Among the passed tests: a kept, a rejected and an undecided clip stored and read back, with the project's two counts following; a title stored without the blanks around it and an empty one bringing back selection's; the reach of the talk's six parts; five nudge steps allowed and a sixth refused; refusals for an in point after the out point, a sentence outside the reach, a point outside the video and a clip under one second, each answered without repeating what was sent and storing nothing; captions of three, one and six words that end with their sentence, with the highlighted word by A97's rule; twelve frames for each candidate, each from its own moment of a video whose picture changes; a frame that cannot be taken left out without failing the step; the cut step unchanged when handed no frame maker; the look stored and read back; a byte range of the preview copy answered 206 and a missing preview copy 404; a review without the preview copy saying so; a project without candidates answering with no clips; a database made by M3 upgraded with its projects and candidates unchanged; a deleted project leaving no review, no look and no frame; cutting again leaving no review.

```
[75 of the 627 lines, each ending in PASSED; the others are left out]
clipper/review/test_caption_groups.py::test_the_keyword_style_takes_three_words_to_a_caption PASSED [  0%]
clipper/review/test_caption_groups.py::test_the_word_by_word_style_takes_one_word_to_a_caption PASSED [  0%]
clipper/review/test_caption_groups.py::test_the_plain_style_takes_six_words_to_a_caption PASSED [  0%]
clipper/review/test_caption_groups.py::test_the_end_of_a_sentence_closes_a_caption_early PASSED [  0%]
clipper/review/test_caption_groups.py::test_the_highlighted_word_is_the_longest_of_six_characters_or_more PASSED [  0%]
clipper/review/test_caption_groups.py::test_a_word_with_a_digit_counts_as_strong_however_short PASSED [  1%]
clipper/review/test_caption_groups.py::test_a_long_word_is_taken_over_a_shorter_one_with_a_digit PASSED [  1%]
clipper/review/test_caption_groups.py::test_of_two_words_as_long_the_earlier_is_taken PASSED [  1%]
clipper/review/test_caption_groups.py::test_the_length_of_a_word_is_measured_as_it_is_shown PASSED [  1%]
clipper/review/test_caption_groups.py::test_a_caption_of_short_words_highlights_none PASSED [  1%]
clipper/review/test_caption_groups.py::test_the_word_by_word_and_plain_styles_highlight_none PASSED [  1%]
clipper/review/test_change_clip.py::test_a_kept_clip_is_answered_kept_and_read_kept PASSED [  2%]
clipper/review/test_change_clip.py::test_a_clip_is_rejected_with_each_reason_or_with_none PASSED [  2%]
clipper/review/test_change_clip.py::test_a_clip_returned_to_undecided_carries_no_reason PASSED [  3%]
clipper/review/test_change_clip.py::test_the_counts_of_the_project_follow_a_keep_a_reject_and_a_return_to_undecided PASSED [  3%]
clipper/review/test_change_clip.py::test_a_title_is_stored_without_the_blanks_around_it PASSED [  3%]
clipper/review/test_change_clip.py::test_an_empty_title_brings_back_the_title_selection_gave[] PASSED [  4%]
clipper/review/test_change_clip.py::test_an_empty_title_brings_back_the_title_selection_gave[   ] PASSED [  4%]
clipper/review/test_change_clip.py::test_an_empty_title_brings_back_the_title_selection_gave[None] PASSED [  4%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points0] PASSED [  5%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points1] PASSED [  5%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points2] PASSED [  5%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points3] PASSED [  5%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points4] PASSED [  6%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points5] PASSED [  6%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points6] PASSED [  6%]
clipper/review/test_change_clip.py::test_points_past_a_limit_are_refused_and_nothing_is_stored[points7] PASSED [  6%]
clipper/review/test_change_clip.py::test_a_refused_move_leaves_the_review_that_was_stored_before PASSED [  6%]
clipper/review/test_clip_points.py::test_up_to_five_nudge_steps_either_way_are_allowed[-5] PASSED [  7%]
clipper/review/test_clip_points.py::test_up_to_five_nudge_steps_either_way_are_allowed[-1] PASSED [  7%]
clipper/review/test_clip_points.py::test_up_to_five_nudge_steps_either_way_are_allowed[0] PASSED [  8%]
clipper/review/test_clip_points.py::test_up_to_five_nudge_steps_either_way_are_allowed[1] PASSED [  8%]
clipper/review/test_clip_points.py::test_up_to_five_nudge_steps_either_way_are_allowed[5] PASSED [  8%]
clipper/review/test_clip_points.py::test_a_sixth_nudge_step_is_refused[-6] PASSED [  8%]
clipper/review/test_clip_points.py::test_a_sixth_nudge_step_is_refused[6] PASSED [  8%]
clipper/review/test_clip_points.py::test_an_in_point_after_the_out_point_is_refused PASSED [  9%]
clipper/review/test_clip_points.py::test_a_sentence_outside_the_reach_is_refused[4-16] PASSED [ 10%]
clipper/review/test_clip_points.py::test_a_sentence_outside_the_reach_is_refused[0-12] PASSED [ 10%]
clipper/review/test_clip_points.py::test_a_sentence_outside_the_reach_is_refused[4-55] PASSED [ 10%]
clipper/review/test_clip_points.py::test_a_sentence_outside_the_reach_is_refused[-1-12] PASSED [ 10%]
clipper/review/test_clip_points.py::test_a_start_before_the_video_begins_is_refused PASSED [ 10%]
clipper/review/test_clip_points.py::test_an_end_after_the_video_ends_is_refused PASSED [ 11%]
clipper/review/test_clip_points.py::test_a_clip_left_shorter_than_one_second_is_refused PASSED [ 11%]
clipper/review/test_clip_points.py::test_the_refusal_is_a_422_that_carries_one_sentence_and_nothing_that_was_sent PASSED [ 11%]
clipper/review/test_describe_review.py::test_a_review_with_the_preview_copy_removed_says_so_and_still_gives_its_clips PASSED [ 14%]
clipper/review/test_describe_review.py::test_a_project_without_candidates_answers_with_no_clips_and_reads_no_transcript PASSED [ 14%]
clipper/review/test_filmstrip.py::test_two_candidates_each_get_twelve_frames_104_px_high_from_the_preview_copy PASSED [ 14%]
clipper/review/test_filmstrip.py::test_each_frame_is_taken_at_its_own_moment_of_a_video_whose_picture_changes PASSED [ 14%]
clipper/review/test_filmstrip.py::test_a_preview_copy_that_ends_inside_a_stretch_leaves_the_late_frames_out_and_keeps_the_others PASSED [ 14%]
clipper/review/test_filmstrip.py::test_without_a_preview_copy_every_frame_is_left_out_and_the_step_goes_on PASSED [ 15%]
clipper/review/test_review_store.py::test_a_review_is_read_back_as_written_under_the_name_of_its_clip PASSED [ 15%]
clipper/review/test_review_store.py::test_a_saved_look_is_read_back_and_a_second_one_replaces_it PASSED [ 16%]
clipper/review/test_review_store.py::test_deleting_the_project_leaves_no_review_and_no_look PASSED [ 17%]
clipper/review/test_review_store.py::test_cutting_again_leaves_no_review_and_both_counts_at_0_and_keeps_the_look PASSED [ 17%]
clipper/review/test_router.py::test_a_byte_range_is_answered_206_with_that_range_and_the_whole_size PASSED [ 17%]
clipper/review/test_router.py::test_a_project_without_a_preview_copy_answers_404_and_says_so PASSED [ 18%]
clipper/review/test_router.py::test_a_project_without_candidates_answers_with_no_clips PASSED [ 18%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change0] PASSED [ 19%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change1] PASSED [ 19%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change2] PASSED [ 19%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change3] PASSED [ 19%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change4] PASSED [ 19%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change5] PASSED [ 20%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change6] PASSED [ 20%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change7] PASSED [ 20%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change8] PASSED [ 20%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change9] PASSED [ 20%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change10] PASSED [ 20%]
clipper/review/test_router.py::test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing[change11] PASSED [ 21%]
clipper/review/test_router.py::test_storing_the_look_answers_with_it_and_the_next_request_reads_it PASSED [ 21%]
clipper/review/test_router.py::test_a_review_with_the_preview_copy_removed_says_so_and_still_gives_its_clips PASSED [ 23%]
clipper/review/test_trim_reach.py::test_the_six_parts_of_the_talk_reach_three_sentences_further_on_each_side PASSED [ 24%]
clipper/selection/test_cut_stage.py::test_handed_no_work_the_cut_step_fills_its_whole_bar_with_the_cut_requests PASSED [ 48%]
clipper/selection/test_whole_app.py::test_the_uploaded_talk_ends_ready_with_72_frames_in_its_folder_and_deleting_it_removes_them PASSED [ 78%]
clipper/storage/test_open_database.py::test_a_database_made_by_m3_keeps_its_projects_and_candidates_and_counts_no_decision PASSED [ 82%]
[...]
======================= 627 passed in 115.84s (0:01:55) ========================
exit code of pytest: 0
```

The whole output is `evidence/v23-service-tests.txt`, which the block saved. "The cut step unchanged
when handed no frame maker" is `test_handed_no_work_the_cut_step_fills_its_whole_bar_with_the_cut_requests`:
the frame maker is the work `main.py` hands the cut step, and the test, handed none, reads the bar
at 33, 67 and 100 and the six candidates in their order. "No frame" after a delete is the test of
`clipper/selection/test_whole_app.py` about the 72 frames.

Result: pass

## V24 — The web app's rules, by test name (A92, A93, A94, A99, A101)

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: a clip's times from its sentences and nudges; the steps allowed at each limit of A93; the four readings of a length, and three for a preset without a preferred band; when a flag shows; the counts and groups of the four filters; the next clip in a group and from its last to its first; pins moved apart by no more than a tap area needs, twelve crowded ones among them; the caption for a moment before, inside and after a caption; the row of a ready project with its kept and rejected counts; the three time formats; a change shown at once, replaced by the service's answer, and brought back when the service refuses.

```
[97 of the 305 lines, each with ✓; the others are left out]
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a ready project with 0 candidates and no decision as a note 1ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a ready project with 1 candidates and no decision as a note 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a ready project with 6 candidates and no decision as a note 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > counts the kept and the rejected clips of a ready project in its row 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > counts the kept and the rejected clips of a ready project in its row 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > counts the kept and the rejected clips of a ready project in its row 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > counts the kept and the rejected clips of a ready project in its row 0ms
 ✓ src/review/time-clips/lib/move-edge.test.ts > edgeLimits > allows every step of both points of a clip in the middle of its reach 2ms
 ✓ src/review/time-clips/lib/move-edge.test.ts > edgeLimits > allows five nudge steps either way and switches the sixth off 2ms
 ✓ src/review/time-clips/lib/move-edge.test.ts > edgeLimits > switches the sentence steps off at the two ends of the reach 1ms
 ✓ src/review/time-clips/lib/move-edge.test.ts > edgeLimits > switches off the steps that would put the in point after the out point 1ms
 ✓ src/review/time-clips/lib/move-edge.test.ts > edgeLimits > switches off the nudge that would start the clip before the video begins 1ms
 ✓ src/review/time-clips/lib/move-edge.test.ts > edgeLimits > switches off the nudge that would end the clip after the video ends 1ms
 ✓ src/review/time-clips/lib/move-edge.test.ts > edgeLimits > switches off the steps that would leave the clip shorter than one second 1ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > applies a decision at once, sends it, and takes the service’s answer in its place 1ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > works out the new times of a clip at once when a point is moved 1ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > keeps a newer change of a clip when the answer to an older one arrives after it 1ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > shows what the service holds again and gives the problem when the service refuses 0ms
 ✓ src/review/open-review/lib/review-store.test.ts > the review store > goes back to the last answer of the service, not to the first, after a later refusal 0ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > puts the pins in two rows by turns, in the order of their clips 1ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > leaves pins that are far apart where their clips are 0ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > leaves two pins a tap area apart on a row where they are 0ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > moves two pins that crowd on a row apart by no more than a tap area needs 0ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > keeps a pin that crowds nobody in place beside a pair that was moved apart 0ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > keeps the tap area of a pin at either end inside the card 0ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > gives twelve clips within one minute of a three-hour video each a place of their own in a card 326 px wide 1ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > centres a crowd of pins on the place their clips share 0ms
 ✓ src/review/chart-source/lib/place-pins.test.ts > placePins > draws the pins closer than a tap area only when the row is too narrow to hold them apart 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > writes 0 seconds with its tenths cut off 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > writes 11.94 seconds with its tenths cut off 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > writes 11.99 seconds with its tenths cut off 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > writes 5.3 seconds with its tenths cut off 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > writes 44.7 seconds with its tenths cut off 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > writes 120.16 seconds with its tenths cut off 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > writes 3725.05 seconds with its tenths cut off 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatPreciseTimecode > counts a time one hundredth short of a second by its hundredths, not by its binary fraction 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatClock > writes 0 seconds as a clock of minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatClock > writes 7 seconds as a clock of minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatClock > writes 7.9 seconds as a clock of minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatClock > writes 32.76 seconds as a clock of minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatClock > writes 65.3 seconds as a clock of minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatClock > writes 600 seconds as a clock of minutes and seconds 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatDuration > writes a length of 32.76 seconds to a tenth of a second 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatDuration > writes a length of 4.7 seconds to a tenth of a second 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatDuration > writes a length of 52.6 seconds to a tenth of a second 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatDuration > writes a length of 65.3 seconds to a tenth of a second 0ms
 ✓ src/shared/lib/format-timecode.test.ts > formatDuration > writes a length of 41 seconds to a tenth of a second 0ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > countFilters > names the four filters All, To Do, Kept and Rejected, in that order 2ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > countFilters > counts six clips without a decision as 6, 6, 0 and 0 1ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > countFilters > counts one kept and one rejected clip of six as 6, 4, 1 and 1 1ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > countFilters > counts every clip under All, whatever its decision 0ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > filterClips > shows every clip under All, in the order of the ranks 0ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > filterClips > shows the clips without a decision under To Do 0ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > filterClips > shows the kept clips under Kept 0ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > filterClips > shows the rejected clips under Rejected 0ms
 ✓ src/review/list-candidates/lib/filter-clips.test.ts > filterClips > shows no clip in a group that holds none 1ms
 ✓ src/review/time-clips/lib/clip-range.test.ts > clipRange > starts where the first word of the in sentence starts and ends where the last word of the out sentence ends 2ms
 ✓ src/review/time-clips/lib/clip-range.test.ts > clipRange > gives the times of the talk’s first clip after one sentence step of its in point 0ms
 ✓ src/review/time-clips/lib/clip-range.test.ts > clipRange > gives the times of the talk’s first clip after five nudges of its out point 0ms
 ✓ src/review/time-clips/lib/clip-range.test.ts > clipRange > moves a point by two tenths of a second for each nudge step, in hundredths 0ms
 ✓ src/review/time-clips/lib/clip-range.test.ts > clipRange > works out the length as the difference of the two times 0ms
 ✓ src/review/time-clips/lib/clip-range.test.ts > clipRange > refuses to time a point on a sentence outside the reach 0ms
 ✓ src/review/time-clips/lib/clip-range.test.ts > findSentence > finds a sentence of the reach by its number in the transcript 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > rates a clip of 24.99 seconds against the 25–60 s preset as short 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > rates a clip of 25 seconds against the 25–60 s preset as ideal 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > rates a clip of 50 seconds against the 25–60 s preset as ideal 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > rates a clip of 50.01 seconds against the 25–60 s preset as allowed 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > rates a clip of 60 seconds against the 25–60 s preset as allowed 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > rates a clip of 60.01 seconds against the 25–60 s preset as long 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > has three readings for a preset without a preferred band: 14.99 seconds is short 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > has three readings for a preset without a preferred band: 15 seconds is allowed 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > has three readings for a preset without a preferred band: 22 seconds is allowed 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > has three readings for a preset without a preferred band: 30 seconds is allowed 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > rateLength > has three readings for a preset without a preferred band: 30.01 seconds is long 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > describeLength > says of 32.76 seconds under the 25–60 s preset that it is “inside the preferred 25–50 s band” 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > describeLength > says of 52.6 seconds under the 25–60 s preset that it is “inside the 25–60 s limits” 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > describeLength > says of 4.7 seconds under the 25–60 s preset that it is “shorter than the 25 s minimum” 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > describeLength > says of 65.3 seconds under the 25–60 s preset that it is “longer than the 60 s maximum” 0ms
 ✓ src/review/time-clips/lib/rate-length.test.ts > describeLength > words the limits with the numbers of the project’s own preset 0ms
 ✓ src/review/preview-clip/lib/find-caption.test.ts > the caption for a place of the playhead > is none before the first caption starts 1ms
 ✓ src/review/preview-clip/lib/find-caption.test.ts > the caption for a place of the playhead > is the caption whose words are being spoken, from the start of its first word 0ms
 ✓ src/review/preview-clip/lib/find-caption.test.ts > the caption for a place of the playhead > stays in a pause after its last word, until the next caption starts 0ms
 ✓ src/review/preview-clip/lib/find-caption.test.ts > the caption for a place of the playhead > is the last caption at the end of the clip 0ms
 ✓ src/review/preview-clip/lib/find-caption.test.ts > the caption for a place of the playhead > is the first caption from the in point when a nudge put the in point inside its first word 0ms
 ✓ src/review/preview-clip/lib/find-caption.test.ts > the caption for a place of the playhead > is none for a clip without captions 0ms
 ✓ src/review/time-clips/lib/find-open-flag.test.ts > isFlagOpen > shows no flag for a clip that has none 1ms
 ✓ src/review/time-clips/lib/find-open-flag.test.ts > isFlagOpen > shows “needs context” while the in point sits where selection put it 0ms
 ✓ src/review/time-clips/lib/find-open-flag.test.ts > isFlagOpen > hides “needs context” while the in point sits on an earlier sentence 0ms
 ✓ src/review/time-clips/lib/find-open-flag.test.ts > isFlagOpen > shows “needs context” again when the in point returns, or goes later 0ms
 ✓ src/review/time-clips/lib/find-open-flag.test.ts > isFlagOpen > does not hide “needs context” for a nudge earlier on the same sentence 0ms
 ✓ src/review/time-clips/lib/find-open-flag.test.ts > isFlagOpen > shows “not recommended” wherever the in point sits 0ms
 ✓ src/review/open-review/lib/review-addresses.test.ts > findNextClip > goes to the next clip of the group 0ms
 ✓ src/review/open-review/lib/review-addresses.test.ts > findNextClip > goes from the last clip of the group to its first 0ms
 ✓ src/review/open-review/lib/review-addresses.test.ts > findNextClip > goes through the clips of a filter’s group alone 0ms
 ✓ src/review/open-review/lib/review-addresses.test.ts > findNextClip > starts at the first clip of the group from a clip that is not in it, or from no clip 0ms
 ✓ src/review/open-review/lib/review-addresses.test.ts > findNextClip > stays on the one clip of a group of one 0ms
 ✓ src/review/open-review/lib/review-addresses.test.ts > findNextClip > has no next clip in an empty group 0ms
[...]
 Test Files  29 passed (29)
      Tests  305 passed (305)
[6 lines left out: the start time, the duration and a note on workers]
exit code: 0
```

The whole output is `evidence/v24-web-tests.txt`, saved by the validator.

Result: pass

## V25 — What M1 to M3 built still holds beside the Review tab: importing, the queue, Stop, Retry, Delete, a restart, transcription, selection, the key, Settings, the layout and the text fit of every earlier screen (R13 to R25, R39)

Check: block V25

Expected: The count is 91 or more. The closing line says that no test of these files failed.

```
92
no test of these files failed
```

Result: pass

## V26 — This milestone's commits touch nothing the boundaries exclude, add no package, and leave the copied stylesheets as the prototype's (R4, R8, R55, R56, R58, R59)

Check: block V26

Expected: Nothing is printed before each of the three closing lines about changes. Seven lines say that a stylesheet is the prototype's. `data` and `.cache` are ignored. No video, audio, database or model file is tracked. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`.

```
end of the changes to .researches and docs/prototype
end of the changes to the stylesheets copied before this milestone
end of the changes to the packages
base.css is the prototype's
controls.css is the prototype's
lists.css is the prototype's
shell.css is the prototype's
pages.css is the prototype's
review.css is the prototype's
player.css is the prototype's
.gitignore:1:/data	data
.gitignore:7:.cache/	.cache
no video, audio, database or model file is tracked
no key is tracked
104	fixtures
every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md
the app reads nothing from docs/
```

`6d9c04a` is "docs(clipper-tool): pass m3 and start planning m4"; 21 commits follow it. `fixtures`
is 104 KB.

Result: pass

## V27 — Inter is stored in the repository with its licence, and the Review tab asks for nothing outside the tool (R42, R57, R58, A15)

Check: block V27

Expected: The first checksum is `4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf`. The licence's first lines name the Inter Project Authors and the SIL Open Font License, Version 1.1. `git ls-files` lists the font and its licence and nothing else under `web/public`. The Review tab and the stylesheets name no outside address. The exit code of the browser tests is 0, and their passed tests show the Review screens asking only the tool.

```
4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf  web/public/fonts/inter/InterVariable.ttf
262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a  web/public/fonts/inter/LICENSE.txt
Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
web/public/fonts/inter/InterVariable.ttf
web/public/fonts/inter/LICENSE.txt
the Review tab and the stylesheets name no outside address

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/own-origin.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-j99xOe/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-j99xOe/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-j99xOe/fixtures/long-talk.mp4
  ✓  1 e2e/own-origin.spec.ts:71:1 › with projects, every request of every screen is addressed to the tool (48.7s)
  ✓  2 e2e/own-origin.spec.ts:91:1 › the Review screens of the talk ask nothing outside the tool, with the preview playing on one of them (29.7s)
  ✓  3 e2e/own-origin.spec.ts:110:1 › the empty Library asks nothing outside the tool (1.0s)
  ✓  4 e2e/own-origin.spec.ts:127:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (6.7s)

  4 passed (1.8m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-j99xOe
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
exit code of the browser tests: 0
```

Result: pass

## V28 — The README and the agents' instructions cover what this milestone adds (R9, A18)

Check: block V28

Expected: The README says what the Review tab does and that the preview is an approximation of the export, and its section on what this version does not do yet begins after the review. `AGENTS.md` names the review package, the review capability, the layout that keeps the tab in place, the shared ready talk, the three measures and Inter.

```
73:A project that is ready opens on its Review tab, which lists the clip candidates by rank. A row
75:filters show all the clips, the ones still to decide, the kept and the rejected. The score orders
86:timed to the spoken words. It is an approximation of the export, drawn by the browser: no clip
100:Keep keeps a clip. Reject asks why first: the clip is cut off mid-thought, is not interesting,
107:On a phone the list comes first and a clip opens as a screen of its own, with Reject, Keep and
135:A test run starts its own copy of the tool on ports 3100 and 8865 and keeps its data in a
139:Whisper model, which the run keeps under the default model's name, and a test that downloads a
148:Clipper keeps everything but the API key in the `data` folder inside the repository folder: one
203:## What this version does not do yet
208:The reason of a rejection is stored, and it does not steer which clips are picked from the next
103:- `web/src/shared/` holds the styles, the generic interface parts and the code three capabilities
104:  use. `web/src/shell/`, `library/`, `project/`, `review/` and `settings/` are the capabilities.
107:- Web imports run one way: `shared` is used by all; `shell` by `library`, `project`, `review` and
108:  `settings`; `library` by `project`, `review` and `settings`. `review`, the Review tab, also
110:  `app/` imports `review`. `app/` joins capabilities that would otherwise import each other: it
111:  hands the project screen the Review tab.
114:  `media`, `projects`, `pipeline`, `fetching`, `transcription`, `selection` and `review`. Each
119:  for the stored transcript, and `settings`, `pipeline`, `projects` and `storage`. `review`, the
120:  package behind the Review tab, imports `selection`, `transcription`, `projects`, `media` and
121:  `storage`. Nothing but `main.py` imports `fetching` or `review`, nothing but `main.py` and
122:  `review` imports `selection`, and nothing but `main.py`, `selection` and `review` imports
136:## The Review tab
138:- `service/clipper/review` is the package behind the tab. It gives a project's review in one
139:  answer, takes the changes to a clip and to the look, and serves the preview copy with byte
143:- `web/src/review/` is the capability, with nine use cases: `open-review` holds a project's
144:  review and the tab's addresses, `time-clips` the rules for a clip's times and steps,
147:  points, `preview-clip` the player and `set-look` the look. `open-review` imports the others and
149:- The store of a review shows a change at once, sends it, and puts the service's answer in its
151:- The Review addresses, `/projects/<id>/review` and `/projects/<id>/review/<clip>`, share one
159:- The video of the preview stays inside its place in the frame. A framing that shows another
162:- Inter 4.1's variable font is `web/public/fonts/inter/InterVariable.ttf`, with its licence, the
164:  own head, the caption and the hook title of the preview are drawn in it, and a later export
167:## The Review tab in tests
169:- The Review tests share one ready talk: the fixture talk, cut with the recorded replies. A test
175:- The browser the tests drive plays the preview copy, H.264 with AAC, through the web port. A
181:  contrast measure composes a text's colour with the backgrounds behind it, plain gradients among
183:  The tap area measure also leaves out a control whose middle is covered, and the contrast
185:- `web/e2e/review-fit.spec.ts` runs the three over the Review screens, on the ready talk and on
186:  a review presented to the page with twelve crowded clips, 180 windows and long titles. A rule
188:- `web/e2e/review-captures.spec.ts` saves the captures of the Review tab and the talk's review
216:python3 ~/.claude/skills/coding-standards/hooks/review-files.py <files>
228:  `lists.css`, `shell.css`, `review.css`, `player.css` and `pages.css`, copied byte for byte, and
235:  large-title state and the place of the clip preview as data attributes. The preview's place is
236:  `inline` or, once a phone screen is scrolled past the preview, `docked`. Keep that markup.
```

The README's lines 73 to 107 describe the Review tab, line 86 says of the preview "It is an
approximation of the export", and "What this version does not do yet" starts at line 203.
`AGENTS.md` names the package at line 138, the capability at 143, the shared layout at 151, the
ready talk at 169, the measures at 181 to 185 and Inter at 162.

Result: pass

## V29 — The code follows the standards the hooks enforce, and both recorded layouts name the new parts (A19)

Check: block V29

Expected: Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `review/`. The web app's layout lists `review/` with nine use cases under it. No line of either starts with `#`.

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
    media/
    projects/
    pipeline/
    fetching/
    transcription/
    selection/
    review/
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
    settings/
      change-settings/
  e2e/                    browser tests
    support/
```

No finding is printed. Run without the filter, the review reads 175 files and reports each as clean.
The web app's layout lists nine folders under `review/`.

Result: pass

## V30 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

```
 M docs/missions/clipper-tool/m4-the-review-workbench/evidence/talk-review.json
?? docs/missions/clipper-tool/m4-the-review-workbench/evidence/v1-test-command.txt
?? docs/missions/clipper-tool/m4-the-review-workbench/evidence/v23-service-tests.txt
```

The three paths are what V1, V18 and V23 wrote into this milestone's evidence folder.

Result: pass
