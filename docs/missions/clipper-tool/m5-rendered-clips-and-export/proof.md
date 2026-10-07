# Proof: m5-rendered-clips-and-export

Attempt: 1
Result: pass
Commit: 0ec8f3d

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

The checks were run from the worktree's root at `0ec8f3d` with nothing uncommitted before V1,
on 2026-10-06 from 21:22 to 22:12. The blocks were cut out of `validation.md` into files and run
with `bash`, as written; V2's block got the folder V1 named in the place it leaves for it. Ports
3100 and 8865 were free before V1, and the Mac was kept awake with `caffeinate` for the whole
run. Lines in square brackets are markers the validator added; every other line in a code block
is printed by the commands. A check that is one command was run with `echo "exit code: $?"`
after it, which prints the last line of its code block. A sentence under a code block that names
a test file says where a passed test holds something its name does not state.

The checks ran in the order of the table, with one exception that changes nothing a check reads:
the block of V6 ran straight after the block of V4, before the two frames of V5 were opened.

The evidence folder already held the ten files V3 and V17 save, committed with the milestone and
written between 20:47 and 20:49. V3 wrote its six again at 21:52 and 21:53 and V17 its four at
22:05, as the `ls` lines of both blocks show, so the frames and captures opened for V5, V7 and
V18 are the ones this run made. The nine pictures came out byte for byte as committed.
`talk-exports.json` differs in the project's id inside its three download addresses.

V7 passes on a judgement that its section states: the Speaker frame shows bands of plain ground
above and below the portrait, and the upper face of the Stacked frame is left of the middle.

## V1 — "The test command passes"; one command runs every check (R9, R12)

Check: block V1

Expected: The last line gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. The Fixtures lines name four built videos, `portrait.mp4` among them. The closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `1663b2a` (M4's `proof.md`, V1), and only mission documents changed before this milestone's first commit, so no gate may fail.

```

> clipper@0.1.0 test /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-tests.mjs


--- Fixtures
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-filBfH/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-filBfH/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-filBfH/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-filBfH/fixtures/long-talk.mp4
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/.cache/whisper/tiny

--- Ruff
All checks passed!

--- mypy
Success: no issues found in 210 source files

--- pytest
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collected 1123 items

[the lines of dots, one per test file, are left out; the whole output is in evidence/v1-test-command.txt]

======================= 1123 passed in 388.00s (0:06:27) =======================

--- ESLint

--- Web build
▲ Next.js 16.3.8 (Turbopack)
✓ Running next.config.ts took 61ms

  Creating an optimized production build ...
✓ Compiled successfully in 406ms
  Running TypeScript ...
  Finished TypeScript in 1237ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/5) ...
  Generating static pages using 7 workers (1/5) 
  Generating static pages using 7 workers (2/5) 
  Generating static pages using 7 workers (3/5) 
✓ Generating static pages using 7 workers (5/5) in 98ms
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

 RUN  v5.0.3 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/web


 Test Files  34 passed (34)
      Tests  362 passed (362)
   Start at  21:29:37
   Duration  845ms (transform 61%, import 24%, tests 10%, worker 5%)

    Isolate  34 workers spawned · ~89ms startup each (spawn + environment, per file)
             at least ~343ms faster with isolate: false — reuses workers across files instead of one per file


--- Playwright

Running 173 tests using 1 worker

[173 lines, one per passed test, are left out; they are in evidence/v1-test-command.txt]

  173 passed (21.3m)

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
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-filBfH
Test data size: 0.21 GB (210.6 MB)
The test data folder was removed.
exit code of pnpm test: 0
```

The Fixtures lines name four built videos: `silence.mp4`, `portrait.mp4`, `talk.mp4` and
`long-talk.mp4`. Each of the nine gates reads passed. The run's data folder held 0.21 GB and
was removed. The block ran from 21:22:44 to 21:50:57.

Result: pass

## V2 — Test data is removed and no tracked file changes (R56)

Check: block V2

Expected: `ls` reports that the folder does not exist. Every path `git status` lists is inside this milestone's folder.

The folder V1's closing lines named is
`/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-filBfH`.

```
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-filBfH: No such file or directory
?? docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/v1-test-command.txt
```

The one path listed is the output V1's block saved into this milestone's evidence folder.

Result: pass

## V3 — "Rendering the kept fixture clips produces files that ffprobe reports as 1080 × 1920, 30 frames per second, H.264 with AAC, each within 0.1 seconds of its clip's length" (R49, A115, A122)

Check: block V3

Expected: The exit code of pytest is 0. `ls` lists `talk-exports.json`, two `talk-c01-at-` frames and three `framing-` frames. The last part prints one line for each rendered clip of the talk, at least two, the first of them `c01` at 32.76 seconds; every line ends in `as required`, and the list of clips that are not as required is `[]`.

```
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0 -- /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collecting ... collected 231 items

[231 lines, one per passed test, are left out; they are in evidence/v3-render-tests.txt]

======================= 231 passed in 125.13s (0:02:05) ========================
exit code of pytest: 0
-rw-r--r--  1 work  staff  218741 Oct  6 21:52 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/framing-follow-speaker.jpg
-rw-r--r--  1 work  staff  191921 Oct  6 21:52 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/framing-stack-two.jpg
-rw-r--r--  1 work  staff  127129 Oct  6 21:52 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/framing-whole-frame.jpg
-rw-r--r--  1 work  staff   92333 Oct  6 21:53 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/talk-c01-at-1s.jpg
-rw-r--r--  1 work  staff   60461 Oct  6 21:53 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/talk-c01-at-4s.jpg
-rw-r--r--  1 work  staff    3514 Oct  6 21:53 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/talk-exports.json
c01: clip 32.76 s, file 32.767 s, h264 1080 x 1920 at 30/1, aac: as required
c02: clip 33.18 s, file 33.200 s, h264 1080 x 1920 at 30/1, aac: as required
c03: clip 41.32 s, file 41.333 s, h264 1080 x 1920 at 30/1, aac: as required
clips rendered: 3
clips that are not as required: []
```

`ls` lists `talk-exports.json`, the two `talk-c01-at-` frames and the three `framing-` frames,
each written by this run at 21:52 or 21:53. Three clips of the talk were rendered, the first
`c01` at 32.76 seconds, and every line ends in `as required`.

Result: pass

## V4 — "With the hook title on, a frame at 1 second shows the title and a frame at 4 seconds does not. Both frames show captions. The frames are saved as evidence."; "With a fixture that has no face, the crop is centred." (R47, R48, A113, A114)

Check: block V4

Expected: Both frames are 1080 x 1920. White where the hook title sits is 50% or more at 1s and 2% or less at 4s. White in the caption's band is 0.5% or more in both. The share of the band that differs between the two frames is 1% or more. Both lines end in `cyan, green, magenta`, the middle of the talk's colour bars.

```
at 1s: 1080 x 1920 | white where the hook title sits: 79.9% | white in the caption's band: 6.38% | 30% down, left to right: cyan, green, magenta
at 4s: 1080 x 1920 | white where the hook title sits: 0.0% | white in the caption's band: 1.90% | 30% down, left to right: cyan, green, magenta
share of the caption's band that differs between the two frames: 6.63%
```

Result: pass

## V5 — The same two frames, seen (R48, A97, A113)

Check: Open `talk-c01-at-1s.jpg` and `talk-c01-at-4s.jpg` from the evidence folder and record in the proof what each shows.

Expected: At 1 second: a white box with rounded corners near the top that reads "The oven broke before sunrise" in dark letters, and under the middle of the frame the caption "TELL YOU ABOUT" in white capitals with a dark shadow, over colour bars that fill the frame. At 4 seconds: no box, and the caption "HAD". No text is cut by an edge of the frame.

Opened `evidence/talk-c01-at-1s.jpg` and `evidence/talk-c01-at-4s.jpg`, as V3 saved them in
this run.

`talk-c01-at-1s.jpg`, 1080 × 1920. Colour bars fill the frame from edge to edge: a cyan, a
green and a magenta column over the upper two thirds, a row of magenta, black and cyan blocks
under them, and white, dark violet and black at the bottom. Near the top, from about a tenth
to a sixth of the way down, lies a white box with rounded corners. It reads "The oven broke
before sunrise" in dark letters on one line, with room left and right of the words, and the
box itself stands clear of both sides of the frame. Under the middle of the frame, about 62%
down, the caption "TELL YOU ABOUT" stands in white capitals with a dark shadow under and
around the letters.

`talk-c01-at-4s.jpg`, 1080 × 1920. The same colour bars, no box, and the caption "HAD" in
the same place, letters and shadow.

In neither frame does a text touch an edge of the frame or lose part of a letter.

Result: pass

## V6 — "Each of the three framings gives a different picture for the same clip, saved as evidence."; "With the portrait fixture, the follow-speaker framing keeps the face inside the frame." (R47, A114, A121)

Check: block V6

Expected: Three frames of 1080 x 1920. `follow-speaker` has one face, whole, its middle between 0.33 and 0.67 across. `stack-two` has two whole faces, the first with its middle above 0.5 down and narrower than the second, whose middle is below 0.5 down. `whole-frame` has two whole faces, both with their middles between 0.3 and 0.7 down. Each of the three comparisons gives a difference of 10 or more.

```
follow-speaker: 1080 x 1920, 1 face(s): middle 0.49 across and 0.41 down, 0.51 wide, whole
stack-two: 1080 x 1920, 2 face(s): middle 0.39 across and 0.25 down, 0.18 wide, whole; middle 0.50 across and 0.75 down, 0.33 wide, whole
whole-frame: 1080 x 1920, 2 face(s): middle 0.72 across and 0.47 down, 0.16 wide, whole; middle 0.20 across and 0.48 down, 0.09 wide, whole
follow-speaker against stack-two: the pixels differ by 73.6 of 255 on average
follow-speaker against whole-frame: the pixels differ by 60.1 of 255 on average
stack-two against whole-frame: the pixels differ by 56.9 of 255 on average
```

Result: pass

## V7 — The same three frames, seen (R47)

Check: Open the three `framing-` frames from the evidence folder and record in the proof what each shows.

Expected: Speaker: the large portrait fills the frame, its face in the middle. Stacked: the small, mirrored portrait in the upper half and the large one in the lower half, each face near the middle of its half. Full Frame: the whole picture with both portraits across the middle of the frame, over a blurred copy of it above and below. Each carries the same caption.

Opened `evidence/framing-follow-speaker.jpg`, `evidence/framing-stack-two.jpg` and
`evidence/framing-whole-frame.jpg`, as V3 saved them in this run. Each is 1080 × 1920.

`framing-follow-speaker.jpg` (Speaker). One portrait, the large one: a black and white
photograph of a bearded man in a dark coat and bow tie. It takes the whole width of the
frame, with its left and right sides beyond the frame's edges, and the face is in the middle
of the frame, a little above half way down. A band of the fixture's plain dark ground lies
above the portrait and another below it. The caption "BEFORE WE START", in capitals with
"BEFORE" in yellow and the other words in white, lies under the face.

`framing-stack-two.jpg` (Stacked). The upper half shows the small portrait on the plain
ground. It is mirrored against the large one: its ear and the long end of its bow tie are on
the left where the large portrait has them on the right. Its face is half way down the upper
half and left of the frame's middle, and plain ground fills the right of that half. The lower
half shows the large portrait with its face in the middle of the half; the frame's bottom edge
cuts the portrait below the bow tie. The same caption lies between the two halves.

`framing-whole-frame.jpg` (Full Frame). The whole wide picture lies as a strip across the
middle of the frame, the small mirrored portrait on its left and the large one on its right,
both on the plain ground. Above and below the strip is an enlarged, blurred copy of the same
picture. The same caption lies under the strip, over the blurred copy.

The caption has the same words, letters and colours in all three, at a different height in
each.

Two things seen fall short of the plainest reading of the expectation, and the validator
judged both to meet it. They are recorded so that the judgement can be checked.

- The Speaker frame is not the portrait in every row. Measured on the saved file, 104 rows of
  plain ground lie above the portrait and 104 below, so the portrait takes 89.2% of the
  frame's height and all of its width. It is the one subject of the frame and reaches both
  sides, which is what "fills the frame" was taken to ask.
- The upper face of the Stacked frame has its middle 0.39 across, as V6 printed, which is 0.11
  of the frame's width left of the middle, and 0.25 down, the middle of the upper half. V6
  takes 0.33 to 0.67 across as the middle for the Speaker face, and 0.39 lies inside that.

Result: pass

## V8 — The framings' rules beyond the three frames: the face followed while it moves, the centred crop without a face, and the fall back from two faces (R47, A112, A114)

Check: the output of V3, saved in `v3-render-tests.txt`

Expected: Among the passed tests: one face found in the portrait and none in a plain picture; two faces in every moment of the portrait video and none in the talk; a crop that follows a moving face between the moments around it; the middle of the picture when no moment has a face; a part kept inside the picture at its edge; a crop that stays with its face when another is 5% larger; the stacked layout with the left face above from two faces in half of the moments, and the Speaker layout with fewer; the face whole in the Speaker frame at one, three and five seconds of the portrait clip; the Stacked framing of the talk giving the Speaker picture.

Read from `evidence/v3-render-tests.txt`, which V3 saved in this run.

```
[one face found in the portrait and none in a plain picture]
clipper/rendering/test_find_faces.py::test_the_portrait_gives_one_face_in_its_upper_two_thirds PASSED [ 23%]
clipper/rendering/test_find_faces.py::test_a_plain_grey_picture_gives_no_face PASSED [ 24%]
[two faces in every moment of the portrait video and none in the talk]
clipper/rendering/test_sample_faces.py::test_six_seconds_of_the_portrait_video_give_thirty_moments_with_two_faces_each PASSED [ 86%]
clipper/rendering/test_sample_faces.py::test_the_talk_gives_moments_without_a_face PASSED [ 86%]
[a crop that follows a moving face between the moments around it]
clipper/rendering/test_follow_faces.py::test_a_face_that_moves_steadily_is_followed_at_each_moment PASSED [ 27%]
clipper/rendering/test_follow_faces.py::test_the_place_of_each_thirtieth_of_a_second_lies_between_the_moments_around_it PASSED [ 27%]
[the middle of the picture when no moment has a face]
clipper/rendering/test_follow_faces.py::test_no_face_in_any_moment_gives_the_middle_of_the_picture_for_every_frame PASSED [ 26%]
clipper/rendering/test_frame_picture.py::test_no_face_in_any_moment_gives_the_upright_middle_of_a_wide_picture PASSED [ 31%]
[a part kept inside the picture at its edge]
clipper/rendering/test_frame_picture.py::test_a_face_near_an_edge_gives_a_part_that_stays_inside_the_picture[0.05-0.0] PASSED [ 32%]
clipper/rendering/test_frame_picture.py::test_a_face_near_an_edge_gives_a_part_that_stays_inside_the_picture[0.97-0.68359375] PASSED [ 32%]
[a crop that stays with its face when another is 5% larger]
clipper/rendering/test_follow_faces.py::test_of_two_faces_that_take_turns_at_being_5_percent_larger_the_first_stays_followed PASSED [ 29%]
[the stacked layout with the left face above from two faces in half of the moments, and the Speaker layout with fewer]
clipper/rendering/test_frame_picture.py::test_two_faces_in_at_least_half_of_the_moments_are_stacked_with_the_left_face_above[5] PASSED [ 35%]
clipper/rendering/test_frame_picture.py::test_two_faces_in_at_least_half_of_the_moments_are_stacked_with_the_left_face_above[10] PASSED [ 35%]
clipper/rendering/test_frame_picture.py::test_two_faces_in_fewer_than_half_of_the_moments_give_the_speaker_layout PASSED [ 36%]
[the face whole in the Speaker frame at one, three and five seconds of the portrait clip]
clipper/rendering/test_render_clip.py::test_the_speaker_framing_keeps_the_one_face_whole_in_the_middle_of_the_frame PASSED [ 58%]
[the Stacked framing of the talk giving the Speaker picture]
clipper/rendering/test_render_clip.py::test_the_stacked_framing_on_the_talk_gives_the_speaker_picture PASSED [ 57%]
[the closing line of the saved output]
======================= 231 passed in 125.13s (0:02:05) ========================
```

`[5]` and `[10]` of the stacked test are the moments with two faces, of ten.
`clipper/rendering/test_render_clip.py` reads the Speaker frame at 1.0, 3.0 and 5.0 seconds
of the portrait clip in `test_the_speaker_framing_keeps_the_one_face_whole_in_the_middle_of_the_frame`
and finds one whole face in each.

Result: pass

## V9 — "The queue shows progress for each clip and is intact after a reload."; the Export tab at its address with the output and the kept clips; "Download returns the finished file, marked as a video attachment." (R3, R46, R49, R53, A116, A117, A120)

Check: `pnpm test:browser e2e/export-tab.spec.ts`

Expected: A talk with no kept clip shows "No Kept Clips". With two clips kept the tab shows the look's sentence, "1080 × 1920, 30 fps, H.264 MP4" and a group for each clip with its title, its file line and "Not rendered"; a look changed on the Review tab changes the sentence. With both queued, the first row reads "Rendering" with a bar whose value rises and the second "Waiting"; after a reload each row shows the state the service holds for it at that moment, the first with a value no lower than before the reload unless it has finished; both end in "Download MP4". The link saves a file named after the clip's title, ending in `.mp4`, from an answer that is `video/mp4` and marked as an attachment, and ffprobe reports the saved file as 1080 × 1920, 30 frames a second, H.264 with AAC, within 0.1 seconds of the row's length. With the source moved aside the tab shows "The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered." and the finished clip still downloads.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/export-tab.spec.ts


Running 5 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UsQEF7/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UsQEF7/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UsQEF7/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UsQEF7/fixtures/long-talk.mp4
  ✓  1 e2e/export-tab.spec.ts:72:1 › a talk with no kept clip shows No Kept Clips, and Go to Review leads to the Review tab (18.7s)
  ✓  2 e2e/export-tab.spec.ts:86:1 › with two clips kept, the tab shows the look, the format and a group for each clip in the order of the ranks (346ms)
  ✓  3 e2e/export-tab.spec.ts:108:1 › after the look is changed on the Review tab, the sentence of the look follows (909ms)
  ✓  4 e2e/export-tab.spec.ts:129:1 › two queued clips read Rendering and Waiting, keep their state over a reload and end in Download MP4 (41.1s)
  ✓  5 e2e/export-tab.spec.ts:154:1 › the download of a finished clip is an MP4 attachment named after the clip, also once the source is gone (39.2s)

  5 passed (1.9m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-UsQEF7
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/export-tab.spec.ts` holds what the names leave out. The second test reads the look's
sentence, "1080 × 1920, 30 fps, H.264 MP4", and both groups with their titles, the file lines
`exports/01-c01.mp4 · 32.8 s` and `exports/02-c02.mp4 · 33.2 s`, and "Not rendered". The
fourth reads "Rendering" with a bar whose value then rises and "Waiting" on the second row,
finds the rows read after the reload among the answers the service gave to the page, and
takes the first row's value after the reload as no lower than before, or the row as finished.
The fifth saves `03 Almost everyone gets price wrong.mp4`, reads the answer as `video/mp4`
with a disposition that starts `attachment; filename`, has ffprobe report the saved file as
`h264 1080 x 1920 at 30/1` with `aac` in an MP4 within 0.1 seconds of the row's 41.3, then
moves the source aside, reads the notice in the expected words and saves the file again at
the same size.

Result: pass

## V10 — "A render that fails shows its reason and a Retry control." (A116, A120)

Check: `pnpm test:browser e2e/export-retry.spec.ts`

Expected: With a file that is no video in the source's place, Render ends in a row that shows "This clip could not be rendered. Retry to render it again." and Retry. With the source back, Retry ends in "Download MP4". With the source moved aside, Render is switched off.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/export-retry.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPlRis/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPlRis/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPlRis/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPlRis/fixtures/long-talk.mp4
  ✓  1 e2e/export-retry.spec.ts:24:1 › a render that fails shows its reason with Retry, and Retry ends in Download MP4 once the source is back (28.3s)
  ✓  2 e2e/export-retry.spec.ts:53:1 › with the source moved aside, Render is refused in a toast and is switched off under the notice (20.0s)

  2 passed (1.1m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nPlRis
Test data size: 0.09 GB (96.7 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/export-retry.spec.ts`: the first test reads the row as "This clip could not be
rendered. Retry to render it again." followed by Retry, and after Retry as "Download MP4".
The second reads the Render button as switched off after a reload with the source moved
aside.

Result: pass

## V11 — "Cancel during rendering stops the clips not yet finished and leaves the finished files in place." (R50, A116)

Check: `pnpm test:browser e2e/export-cancel.spec.ts`

Expected: With three clips kept and rendering, Cancel pressed once the first has finished leaves the first row's "Download MP4", its file among the project's exports and no other file there, the second and third rows at "Not rendered", and the button at "Render 3 Clips".

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/export-cancel.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nyVtrq/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nyVtrq/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nyVtrq/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nyVtrq/fixtures/long-talk.mp4
  ✓  1 e2e/export-cancel.spec.ts:18:1 › Cancel during the second clip leaves the first clip’s file and download, and the two others not rendered (29.3s)

  1 passed (46.3s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-nyVtrq
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/export-cancel.spec.ts` waits for the rows to read "Download MP4", "Rendering",
"Waiting", presses Cancel, and then reads "Download MP4", "Not rendered", "Not rendered",
`01-c01.mp4` as the one file among the project's exports, and the button "Render 3 Clips"
switched on.

Result: pass

## V12 — Render from the tab, on the Mac and on the phone; the exported project in the Library (R3, R49, A119)

Check: `pnpm test:browser e2e/export-render.spec.ts`

Expected: "Render 2 Clips" turns into "Rendering…", switched off, beside Cancel; each row shows a bar while it waits or renders; both end in "Download MP4" and the button reads "Render 2 Clips" again. The project's row then reads "Exported · 2 clips exported" with a tick, in the sidebar at 1360 px and in the Library at 390 px. At 390 px Render queues the clips from the top bar and "Download MP4" saves the file.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/export-render.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-lwix5Q/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-lwix5Q/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-lwix5Q/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-lwix5Q/fixtures/long-talk.mp4
  ✓  1 e2e/export-render.spec.ts:48:3 › at 1360 px › Render reads Rendering… beside Cancel while the rows show their bars, and both clips end in Download MP4 (36.6s)
  ✓  2 e2e/export-render.spec.ts:80:3 › at 390 px › the same actions are in the top bar, Render queues the clip, and Download MP4 saves the file (25.3s)

  2 passed (1.3m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-lwix5Q
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/export-render.spec.ts`: the first test reads "Rendering…" switched off with Cancel
before it in the toolbar, the bars labelled "Rendering" and "Waiting", both rows at
"Download MP4", the button back at "Render 2 Clips", and the project's row as "Exported · 2
clips exported" with one tick in the sidebar at 1360 px and in the Library at 390 px. The
second presses "Render 1 Clip" in the top bar at 390 px and saves
`06 The smallest lesson is to write things down.mp4`.

Result: pass

## V13 — "Each Copy control puts that platform's text on the clipboard." (R31, A16, A118)

Check: `pnpm test:browser e2e/export-copy.spec.ts`

Expected: A kept clip shows the six rows "TikTok title", "TikTok description", "Reels title", "Reels caption", "Shorts title" and "Shorts description" with the texts selection stored. Each of the six Copy controls leaves its row's text on the clipboard and shows "Copied". A project made for one platform shows that platform's two rows. With the clipboard interface taken from the page, as at the Mac's network address, Copy still leaves the text on the clipboard.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/export-copy.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-uN7RbY/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-uN7RbY/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-uN7RbY/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-uN7RbY/fixtures/long-talk.mp4
  ✓  1 e2e/export-copy.spec.ts:54:1 › a kept clip shows a title and a description for each of the three platforms, as selection stored them (18.7s)
  ✓  2 e2e/export-copy.spec.ts:70:1 › each of the six Copy controls leaves its row’s text on the clipboard and shows Copied (650ms)
  ✓  3 e2e/export-copy.spec.ts:90:1 › a project made for TikTok alone shows that platform’s two rows (18.5s)
  ✓  4 e2e/export-copy.spec.ts:109:1 › with the clipboard interface taken from the page, Copy still leaves the text on the clipboard (507ms)

  4 passed (54.5s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-uN7RbY
Test data size: 0.09 GB (96.7 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/export-copy.spec.ts`: the first test reads the six labels "TikTok title", "TikTok
description", "Reels title", "Reels caption", "Shorts title" and "Shorts description" and
compares the six texts with those the selection stored. The fourth takes
`navigator.clipboard` from the page, presses Copy on "Reels caption" and reads that text
from the clipboard in a second page.

Result: pass

## V14 — The service's rules for rendering, the queue and the export, by test name (R20, R46 to R50, A113 to A120)

Check: block V14

Expected: The last line gives exit code 0. Among the passed tests of this block and of V3's saved output: the installed OpenCV without FFmpeg, without a built-in font and without bundled libraries; a clip file of the three layouts at 1080 × 1920 and 30 frames a second from sources at 25 and at 60; a source stored on its side rendered as it plays; an overlay in the frames between its two moments and in none outside them; the hook title over the first three seconds and never with its switch off; captions of the three styles in their sizes and places, a wrapped caption and a long word kept inside the box, and a text in a script Inter lacks; the oldest render taken first across two projects and never two at once; the percent stored while a clip renders; the three reasons of a failed render, with the next clip still rendered; a cancel that leaves a finished render, removes a waiting one and ends the running one; a clip that is no longer kept left out; a render interrupted by a stop finished after the next start; the export's answer with only the kept clips and only the chosen platforms; queueing refused with the source gone; the file answered as `video/mp4` and an attachment; a database made by M4 upgraded with its projects, candidates and reviews unchanged; a project reading `exported` with its count; a deleted project leaving no render and no export; a project without a transcript answering with no clips.

```
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0 -- /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collecting ... collected 422 items

[422 lines, one per passed test, are left out; they are in evidence/v14-service-tests.txt]

======================= 422 passed in 108.99s (0:01:48) ========================
exit code of pytest: 0
231
no test of the rendering package failed
```

The passed tests, from `evidence/v14-service-tests.txt` and `evidence/v3-render-tests.txt`:

```
[the installed OpenCV without FFmpeg, without a built-in font and without bundled libraries]
clipper/rendering/test_opencv_build.py::test_the_installed_opencv_names_no_ffmpeg_in_its_build_information PASSED [ 38%]
clipper/rendering/test_opencv_build.py::test_the_installed_opencv_has_no_font_built_in PASSED [ 39%]
clipper/rendering/test_opencv_build.py::test_the_installed_opencv_carries_no_folder_of_bundled_libraries PASSED [ 39%]
[a clip file of the three layouts at 1080 × 1920 and 30 frames a second from sources at 25 and at 60]
clipper/rendering/test_encode_clip.py::test_a_clip_of_each_layout_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_planned[layout0-2.0] PASSED [ 14%]
clipper/rendering/test_encode_clip.py::test_a_clip_of_each_layout_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_planned[layout0-3.37] PASSED [ 15%]
clipper/rendering/test_encode_clip.py::test_a_clip_of_each_layout_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_planned[layout1-2.0] PASSED [ 15%]
clipper/rendering/test_encode_clip.py::test_a_clip_of_each_layout_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_planned[layout1-3.37] PASSED [ 16%]
clipper/rendering/test_encode_clip.py::test_a_clip_of_each_layout_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_planned[layout2-2.0] PASSED [ 16%]
clipper/rendering/test_encode_clip.py::test_a_clip_of_each_layout_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_planned[layout2-3.37] PASSED [ 16%]
clipper/rendering/test_encode_clip.py::test_a_source_at_another_frame_rate_is_rendered_at_30_frames_a_second[25] PASSED [ 17%]
clipper/rendering/test_encode_clip.py::test_a_source_at_another_frame_rate_is_rendered_at_30_frames_a_second[60] PASSED [ 17%]
[a source stored on its side rendered as it plays]
clipper/rendering/test_encode_clip.py::test_a_video_stored_on_its_side_is_rendered_as_it_plays PASSED [ 21%]
[an overlay in the frames between its two moments and in none outside them]
clipper/rendering/test_encode_clip.py::test_an_overlay_listed_from_one_second_to_two_shows_in_the_frames_between_them_only PASSED [ 20%]
[the hook title over the first three seconds and never with its switch off]
clipper/rendering/test_overlay_timeline.py::test_the_hook_title_shows_over_the_first_three_seconds PASSED [ 42%]
clipper/rendering/test_overlay_timeline.py::test_with_the_switch_off_no_overlay_carries_a_hook_title PASSED [ 42%]
clipper/rendering/test_render_clip.py::test_with_the_switch_off_the_frame_at_one_second_shows_no_hook_title PASSED [ 56%]
[captions of the three styles in their sizes and places, a wrapped caption and a long word kept inside the box, and a text in a script Inter lacks]
clipper/rendering/test_draw_overlays.py::test_a_keyword_caption_is_in_capitals_with_yellow_only_inside_the_highlighted_word PASSED [  9%]
clipper/rendering/test_draw_overlays.py::test_an_each_word_caption_is_larger_than_a_keyword_caption PASSED [ 10%]
clipper/rendering/test_draw_overlays.py::test_a_plain_caption_keeps_its_small_letters_and_is_smaller PASSED [ 10%]
clipper/rendering/test_draw_overlays.py::test_the_top_edge_of_the_caption_lies_where_the_framing_puts_it[follow-speaker-0.6] PASSED [  8%]
clipper/rendering/test_draw_overlays.py::test_the_top_edge_of_the_caption_lies_where_the_framing_puts_it[stack-two-0.45] PASSED [  8%]
clipper/rendering/test_draw_overlays.py::test_the_top_edge_of_the_caption_lies_where_the_framing_puts_it[whole-frame-0.68] PASSED [  9%]
clipper/rendering/test_draw_overlays.py::test_a_caption_of_six_long_words_wraps_onto_more_lines_inside_the_box PASSED [ 11%]
clipper/rendering/test_draw_overlays.py::test_a_word_of_thirty_letters_is_drawn_smaller_and_stays_inside_the_box PASSED [ 11%]
clipper/rendering/test_draw_overlays.py::test_a_caption_in_japanese_is_drawn_in_other_shapes_than_the_box_of_a_missing_character PASSED [ 12%]
clipper/rendering/test_set_type.py::test_a_text_with_a_character_inter_lacks_is_set_whole_in_arial_unicode PASSED [ 96%]
[the oldest render taken first across two projects and never two at once]
clipper/rendering/test_render_store.py::test_the_oldest_waiting_render_is_taken_first_across_two_projects PASSED [ 63%]
clipper/rendering/test_render_worker.py::test_the_renders_of_two_projects_are_taken_in_the_order_they_were_queued PASSED [ 69%]
clipper/rendering/test_render_worker.py::test_three_queued_clips_are_rendered_one_after_another_in_their_order PASSED [ 68%]
[the percent stored while a clip renders]
clipper/rendering/test_render_worker.py::test_a_render_that_reports_40_percent_leaves_40_stored_while_it_runs PASSED [ 69%]
[the three reasons of a failed render, with the next clip still rendered]
clipper/rendering/test_render_worker.py::test_a_failed_render_leaves_its_sentence_and_the_next_clip_is_still_rendered[failure0-Not enough free disk space to finish. Free some space, then retry.] PASSED [ 70%]
clipper/rendering/test_render_worker.py::test_a_failed_render_leaves_its_sentence_and_the_next_clip_is_still_rendered[failure1-Not enough free disk space to finish. Free some space, then retry.] PASSED [ 70%]
clipper/rendering/test_render_worker.py::test_a_failed_render_leaves_its_sentence_and_the_next_clip_is_still_rendered[failure2-The source video is no longer on this Mac, so this clip cannot be rendered.] PASSED [ 71%]
clipper/rendering/test_render_worker.py::test_a_failed_render_leaves_its_sentence_and_the_next_clip_is_still_rendered[failure3-This clip could not be rendered. Retry to render it again.] PASSED [ 71%]
clipper/rendering/test_render_worker.py::test_a_failed_render_leaves_its_sentence_and_the_next_clip_is_still_rendered[failure4-This clip could not be rendered. Retry to render it again.] PASSED [ 72%]
[a cancel that leaves a finished render, removes a waiting one and ends the running one]
clipper/rendering/test_render_worker.py::test_a_render_that_had_finished_when_the_cancel_came_stays_done PASSED [ 73%]
clipper/rendering/test_render_store.py::test_cancelling_removes_a_waiting_render_without_an_export_and_returns_one_with_it_to_done PASSED [ 66%]
clipper/rendering/test_render_worker.py::test_a_cancel_during_the_second_clip_ends_it_and_renders_neither_it_nor_the_third PASSED [ 72%]
[a clip that is no longer kept left out]
clipper/rendering/test_render_worker.py::test_a_clip_that_is_no_longer_kept_when_its_turn_comes_is_taken_out_and_not_rendered PASSED [ 74%]
[a render interrupted by a stop finished after the next start]
clipper/rendering/test_render_worker.py::test_a_shutdown_during_a_render_leaves_it_waiting_and_a_new_worker_renders_it PASSED [ 74%]
clipper/rendering/test_whole_app.py::test_an_app_stopped_during_a_render_finishes_it_after_the_next_start PASSED [ 99%]
[the export's answer with only the kept clips and only the chosen platforms]
clipper/rendering/test_describe_export.py::test_only_the_kept_clips_are_given_in_the_order_of_their_ranks PASSED [  0%]
clipper/rendering/test_describe_export.py::test_the_texts_are_those_of_the_platforms_chosen_in_the_order_tiktok_reels_shorts PASSED [  1%]
[queueing refused with the source gone]
clipper/rendering/test_queue_renders.py::test_queueing_with_the_source_gone_is_refused_and_stores_nothing PASSED [ 54%]
clipper/rendering/test_router.py::test_queueing_with_the_source_gone_is_refused_with_409 PASSED [ 77%]
[the file answered as video/mp4 and an attachment]
clipper/rendering/test_router.py::test_a_finished_clip_is_answered_as_an_mp4_attachment_under_its_rank_and_title PASSED [ 80%]
[a database made by M4 upgraded with its projects, candidates and reviews unchanged]
clipper/storage/test_open_database.py::test_a_database_made_by_m4_keeps_its_projects_candidates_and_reviews_and_counts_no_export PASSED [ 17%]
[a project reading exported with its count]
clipper/rendering/test_render_store.py::test_done_notes_the_export_counts_it_and_makes_a_ready_project_exported PASSED [ 64%]
clipper/rendering/test_whole_app.py::test_the_project_reads_exported_with_a_count_of_two PASSED [ 97%]
clipper/projects/test_router.py::test_an_exported_project_carries_the_number_of_its_exports PASSED [ 40%]
[a deleted project leaving no render and no export]
clipper/rendering/test_render_store.py::test_deleting_the_project_leaves_no_render PASSED [ 68%]
clipper/projects/test_delete_project.py::test_delete_removes_the_exports_of_the_project_with_its_folder PASSED [ 25%]
clipper/rendering/test_whole_app.py::test_deleting_the_project_during_a_render_removes_its_exports_and_leaves_no_folder PASSED [100%]
[a project without a transcript answering with no clips]
clipper/rendering/test_describe_export.py::test_a_project_with_no_transcript_answers_with_no_clips_and_its_look PASSED [  6%]
```

The three reasons are the three sentences in the names of the failed-render test: no free
disk space, the source no longer on the Mac, and any other failure.
`clipper/rendering/test_render_worker.py` counts the renders running together in
`test_three_queued_clips_are_rendered_one_after_another_in_their_order` and finds at most
one. `clipper/rendering/test_router.py` reads the answer of the finished clip as `video/mp4`
with a disposition of the kind `attachment`.

Result: pass

## V15 — The web app's rules, by test name (A116 to A120)

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: the sentence of the look; a clip's file line; the Render button's words for one clip, for several and while rendering; what a row shows for each state of a render; asking for the export every second while a clip renders and no more afterwards; a refusal shown and the held export kept; the six text rows of three platforms and the two of one; the clipboard interface used when the page has one, the older copy command when it has none, and the blocked message when both fail; the row of an exported project with one clip and with several.

```

 RUN  v5.0.3 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/web

[362 lines, one per passed test, are left out; they are in evidence/v15-web-tests.txt]

 Test Files  34 passed (34)
      Tests  362 passed (362)
   Start at  22:04:12
   Duration  934ms (transform 62%, import 24%, tests 9%, worker 5%)

    Isolate  34 workers spawned · ~97ms startup each (spawn + environment, per file)
             at least ~372ms faster with isolate: false — reuses workers across files instead of one per file

exit code: 0
```

The passed tests, from `evidence/v15-web-tests.txt`, where the validator saved the output:

```
[the sentence of the look]
 ✓ src/export/open-export/lib/describe-output.test.ts > the sentence of the look > words the starting look as the prototype does 1ms
 ✓ src/export/open-export/lib/describe-output.test.ts > the sentence of the look > names each caption style, each framing and the switch 0ms
[a clip's file line]
 ✓ src/export/open-export/lib/describe-output.test.ts > the file line of a clip > gives the file inside the project and the length to a tenth of a second 0ms
 ✓ src/export/open-export/lib/describe-output.test.ts > the file line of a clip > writes 33.18 seconds as 33.2 s 0ms
 ✓ src/export/open-export/lib/describe-output.test.ts > the file line of a clip > writes 41.3 seconds as 41.3 s 0ms
 ✓ src/export/open-export/lib/describe-output.test.ts > the file line of a clip > writes 30 seconds as 30.0 s 0ms
 ✓ src/export/open-export/lib/describe-output.test.ts > the file line of a clip > writes 124.96 seconds as 125.0 s 0ms
[the Render button's words for one clip, for several and while rendering]
 ✓ src/export/render-clips/lib/describe-render.test.ts > the Render button > counts one kept clip 1ms
 ✓ src/export/render-clips/lib/describe-render.test.ts > the Render button > counts several kept clips, finished ones among them 0ms
 ✓ src/export/render-clips/lib/describe-render.test.ts > the Render button > reads Rendering… and is switched off while a clip is waiting 0ms
 ✓ src/export/render-clips/lib/describe-render.test.ts > the Render button > reads Rendering… and is switched off while a clip is rendering 0ms
[what a row shows for each state of a render]
 ✓ src/export/render-clips/lib/describe-render.test.ts > what the row of a clip shows > reads Not rendered for a clip that was never queued 0ms
 ✓ src/export/render-clips/lib/describe-render.test.ts > what the row of a clip shows > shows a bar labelled Waiting for a waiting clip 0ms
 ✓ src/export/render-clips/lib/describe-render.test.ts > what the row of a clip shows > shows a bar labelled Rendering with the percent of a rendering clip 0ms
 ✓ src/export/render-clips/lib/describe-render.test.ts > what the row of a clip shows > shows the reason of a failed clip 0ms
 ✓ src/export/render-clips/lib/describe-render.test.ts > what the row of a clip shows > offers the download of a finished clip 0ms
[asking for the export every second while a clip renders and no more afterwards]
 ✓ src/export/open-export/lib/export-store.test.ts > the export store > asks again every second while a clip renders, and no more once all are done 4ms
[a refusal shown and the held export kept]
 ✓ src/export/open-export/lib/export-store.test.ts > the export store > gives the problem of a refusal to be shown and keeps the export the service holds 1ms
[the six text rows of three platforms and the two of one]
 ✓ src/export/copy-text/lib/text-rows.test.ts > the text rows of a clip > gives a title and a description for each of three platforms, in the order TikTok, Reels, Shorts 1ms
 ✓ src/export/copy-text/lib/text-rows.test.ts > the text rows of a clip > gives the two rows of the one platform chosen 0ms
[the clipboard interface used when the page has one, the older copy command when it has none, and the blocked message when both fail]
 ✓ src/export/copy-text/lib/copy-text.test.ts > copying a text > hands the text to the clipboard interface when the page has one, and says Copied 2ms
 ✓ src/export/copy-text/lib/copy-text.test.ts > copying a text > uses the older copy command on the selected text when the page has no clipboard interface 0ms
 ✓ src/export/copy-text/lib/copy-text.test.ts > copying a text > says that copying is blocked when both ways fail, and still puts the selection back 0ms
[the row of an exported project with one clip and with several]
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of an exported project with 1 exports as a note 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of an exported project with 2 exports as a note 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of an exported project with 12 exports as a note 0ms
```

Result: pass

## V16 — What M1 to M4 built still holds beside the Export tab (R6, R13 to R25, R39 to R45)

Check: block V16

Expected: The count is 153 or more. The closing line says that no test of these files failed.

```
154
no test of these files failed
```

154 of the 173 passed lines of V1's saved output belong to the files of M1 to M4. The other
19 belong to the seven `export-` files.

Result: pass

## V17 — The Export tab is captured at 390 px and 1360 px, in light and in dark (R3, A20, A122)

Check: block V17

Expected: The exit code is 0. The evidence folder holds four files named `export-<width>-<theme>.png`, for `390` and `1360`, in `light` and `dark`.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/export-captures.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IkPUF2/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IkPUF2/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IkPUF2/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IkPUF2/fixtures/long-talk.mp4
  ✓  1 e2e/export-captures.spec.ts:99:1 › the Export tab with one clip finished and one not rendered is captured whole at 390 and 1360 px, in light and in dark (26.9s)

  1 passed (44.0s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-IkPUF2
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code of the browser tests: 0
-rw-r--r--  1 work  staff  134903 Oct  6 22:05 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-1360-dark.png
-rw-r--r--  1 work  staff  133487 Oct  6 22:05 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-1360-light.png
-rw-r--r--  1 work  staff  156588 Oct  6 22:05 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-390-dark.png
-rw-r--r--  1 work  staff  151819 Oct  6 22:05 /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/export-390-light.png
```

The four files carry the time of this run, 22:05.

Result: pass

## V18 — The Export tab reproduces the prototype's screen with the talk's own data, on phone and desktop, in light and in dark (R3, R5, A117 to A120)

Check: Open every capture from V17 and record in the proof what each shows.

Expected: At 390: the project's title above the Review, Export and Results control, with 2 beside Export; a top bar with the More button and "Render 2 Clips"; "Output" with "Keyword captions, speaker framing, hook title on" and "1080 × 1920, 30 fps, H.264 MP4" and under them "Change the look on the Review tab."; a group headed "The worst day my bakery ever had" with `exports/01-c01.mp4 · 32.8 s` and "Download MP4"; a group headed "Hire for the habits you cannot teach" with `exports/02-c02.mp4 · 33.2 s` and "Not rendered"; in each group six labelled texts, each with Copy; the tab bar. At 1360: the sidebar, where the project's row reads "Exported · 1 clip exported"; a toolbar with the three tabs, the More button and "Render 2 Clips"; the same page beside it. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text.

Opened the four captures V17 saved in this run.

`export-390-light.png`, 390 × 1808. A top bar with a "Library" back button, the More button
and a blue "Render 2 Clips". Under it the title "talk" and "Video link · 00:03:54 · 6
candidates", above the control Review, Export, Results, where Export is the chosen one and
has 2 beside it. "Output" heads a card with "Look" beside "Keyword captions, speaker
framing, hook title on", on two lines, and "Format" beside "1080 × 1920, 30 fps, H.264
MP4"; under the card, "Change the look on the Review tab." A group headed "The worst day my
bakery ever had" with `exports/01-c01.mp4 · 32.8 s` and a "Download MP4" button, then six
labelled texts, "TikTok title", "TikTok description", "Reels title", "Reels caption",
"Shorts title" and "Shorts description", each with a Copy button on its right. A group
headed "Hire for the habits you cannot teach" with `exports/02-c02.mp4 · 33.2 s` and "Not
rendered", with the same six labelled texts and Copy buttons. At the bottom the tab bar with
Library and Settings, below the last line of the last group. Dark text on light surfaces.

`export-390-dark.png`, 390 × 1808. The same screen, with a near-black ground, dark grey cards
and light text. The Render button stays blue, and the Copy and Download labels are a lighter
blue.

`export-1360-light.png`, 1360 × 1141. The sidebar on the left with "Clipper", "New Project",
"Projects" and the project's row: "talk", "Video link · 4 min", and a tick before "Exported
· 1 clip exported"; at its foot "Settings" and "50 GB free on this Mac". A toolbar with
"talk" and "Video link · 00:03:54 · 6 candidates", the three tabs Review, Export with 2
beside it, and Results, the More button and "Render 2 Clips". Beside the sidebar the same
page: "Output" with the look on one line and the format, "Change the look on the Review
tab.", and the two groups, the first with "Download MP4" at the right of its head and the
second with "Not rendered" there, each with its six labelled texts and a Copy button at the
right of every one.

`export-1360-dark.png`, 1360 × 1141. The same, with dark surfaces and light text.

In none of the four is a text cut off or laid over another. The longer texts wrap onto two
or three lines inside their rows. The texts are the talk's own: the titles, the file lines and
the lengths are those of its first two clips.

Result: pass

## V19 — On the Export tab at 390 px no screen scrolls sideways and no label is cut off at 200% text size, no control has a tap area under 44 px, and text differs from its background by 4.5 to 1 (R7)

Check: `pnpm test:browser e2e/export-fit.spec.ts`

Expected: For the empty state, a talk with one clip finished and one not rendered, and an export presented with twelve clips in every state, long titles, a long reason and long descriptions under the notice of a missing source, at 390 px: at the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled to its end, a screen's last line lies above the tab bar; no control has a tap area under 44 px; in light and in dark no text measures under 4.5 to 1. At 1360 px the same screens meet the ratio in light and in dark.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/export-fit.spec.ts


Running 4 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-zN3N8L/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-zN3N8L/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-zN3N8L/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-zN3N8L/fixtures/long-talk.mp4
  ✓  1 e2e/export-fit.spec.ts:74:3 › at 390 px › the export presented to the page holds twelve clips in every state, with long texts, under the notice (25.8s)
  ✓  2 e2e/export-fit.spec.ts:95:3 › at 390 px › every Export screen fits at the normal size and at 200%, with tap areas of 44 px and its last line above the bar (25.8s)
  ✓  3 e2e/export-fit.spec.ts:108:3 › at 390 px › no text of an Export screen measures under 4.5 to 1, in light and in dark (25.4s)
  ✓  4 e2e/export-fit.spec.ts:125:3 › at 1360 px › the same Export screens hold no text under 4.5 to 1, in light and in dark (25.4s)

  4 passed (2.0m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-zN3N8L
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code: 0
```

`web/e2e/export-fit.spec.ts` measures the three screens `export-empty`, `export-talk` and
`export-crowded`. Its first test reads the crowded one as twelve rows, the first five in the
states "Not rendered", "Waiting", "Rendering", the long reason with Retry and "Download
MP4", every title of 110 characters or more and three texts of 300, under the notice of the
missing source. The second runs the text fit, the tap areas and the last line above the bar
at the normal size and at 200%.

Result: pass

## V20 — This milestone's commits touch nothing the boundaries exclude, add only the two named packages, commit no video and no weights but the detector's model, and leave the copied stylesheets as the prototype's (R4, R8, R55, R56, R58, R59, A14)

Check: block V20

Expected: Nothing is printed before each of the three closing lines about changes. Seven lines say that a stylesheet is the prototype's. The lines added to the service's requirements are the ban on the ready-made OpenCV package, `opencv-python-headless==5.0.0.93` and `pillow==12.3.0`, with at most comment lines beside them, and no line is removed. The pinned build tools are `cmake`, `distro`, `packaging`, `pip`, `scikit-build`, `setuptools` and `wheel`. `data` and `.cache` are ignored. The one tracked video, audio, database or model file is `face_detection_yunet_2026may.onnx`. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`.

```
end of the changes to .researches and docs/prototype
end of the changes to the copied stylesheets and the tokens
end of the changes to the other package files
base.css is the prototype's
controls.css is the prototype's
lists.css is the prototype's
shell.css is the prototype's
pages.css is the prototype's
review.css is the prototype's
player.css is the prototype's
+# The ready-made OpenCV package ships FFmpeg under the LGPL, so OpenCV is built here without it.
+--no-binary opencv-python-headless
+opencv-python-headless==5.0.0.93
+pillow==12.3.0
cmake==4.4.4
distro==1.9.0
packaging==26.3
pip==26.2.1
scikit-build==0.19.1
setuptools==69.5.1
wheel==0.48.0
.gitignore:1:/data	data
.gitignore:7:.cache/	.cache
service/clipper/rendering/yunet/face_detection_yunet_2026may.onnx
no key is tracked
164	fixtures
every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md
the app reads nothing from docs/
```

Nothing is printed before any of the three closing lines about changes. The added lines of
the requirements are one comment, the ban `--no-binary opencv-python-headless` and the two
packages; no line is removed. `fixtures` holds 164 KB.

Result: pass

## V21 — OpenCV is built without FFmpeg and carries permissive licences only; the detector's model and the portrait are stored with their licence and source (R47, R58, R12, A111, A112, A121)

Check: block V21

Expected: OpenCV is 5.0.0 and Pillow 12.3.0. The list of lines that name FFmpeg or the built-in font is `[]`. The disabled parts include `videoio`, and the parts compiled in are `libprotobuf libjpeg-turbo libpng zlib tegra_hal`. The folder of bundled libraries does not exist, and the list of libraries linked outside the system is `[]`. pip gives OpenCV's licence as Apache 2.0 and Pillow's as MIT-CMU. The model is 229738 bytes with the checksum `ebafce4e3c118d6554634be5c27ab333b4c047a9a8c3faf1d7cf93101c22f0f0`, and the licence beside it begins "MIT License" and names Shiqi Yu. `file` gives the portrait as JPEG image data of `600x774`, `ls` gives it as under 100,000 bytes, and the note beside it names Alexander Gardner, 1863, Wikimedia Commons and the public domain.

```
OpenCV 5.0.0 | Pillow 12.3.0
lines that name FFmpeg or the built-in font: []
['3rdparty dependencies:       libprotobuf libjpeg-turbo libpng zlib tegra_hal', 'Disabled:                    highgui videoio world']
folder of bundled libraries exists: False
libraries linked outside the system: []
Name: opencv_python_headless
Version: 5.0.0.93
License: Apache 2.0
Name: pillow
Version: 12.3.0
License-Expression: MIT-CMU
-rw-r--r--  1 work  staff  229738 Oct  6 17:36 service/clipper/rendering/yunet/face_detection_yunet_2026may.onnx
ebafce4e3c118d6554634be5c27ab333b4c047a9a8c3faf1d7cf93101c22f0f0  service/clipper/rendering/yunet/face_detection_yunet_2026may.onnx
MIT License

Copyright (c) 2020 Shiqi Yu <shiqi.yu@gmail.com>
fixtures/portrait.jpg: JPEG image data, JFIF standard 1.02, aspect ratio, density 946x945, segment length 16, comment: "Lavc62.28.102", baseline, precision 8, 600x774, components 3
-rw-r--r--  1 work  staff  55068 Oct  6 17:36 fixtures/portrait.jpg
fixtures/portrait-source.md:3:`portrait.jpg` is Alexander Gardner's photograph of Abraham Lincoln, taken on 8 November 1863. It
fixtures/portrait-source.md:4:is in the public domain: its copyright has expired, and Wikimedia Commons marks it "Public
fixtures/portrait-source.md:10:| Author | Alexander Gardner |
fixtures/portrait-source.md:11:| Date | 8 November 1863 |
fixtures/portrait-source.md:12:| Licence | Public domain |
fixtures/portrait-source.md:13:| Page on Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Abraham_Lincoln_O-77_matte_collodion_print.jpg |
fixtures/portrait-source.md:14:| Original file | https://upload.wikimedia.org/wikipedia/commons/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg |
fixtures/portrait-source.md:25:Wikimedia sends the original only to a request that names a browser as its user agent.
```

Result: pass

## V22 — The Export tab and the renders ask for nothing outside the tool (R57)

Check: block V22

Expected: The export capability and the rendering package name no outside address. The exit code of the browser tests is 0, and their passed tests show the Export tab of a talk with a finished clip asking only the tool, at both widths.

```
the export capability and the rendering package name no outside address

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/own-origin.spec.ts


Running 5 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-DB8fu3/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-DB8fu3/fixtures/portrait.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-DB8fu3/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-DB8fu3/fixtures/long-talk.mp4
  ✓  1 e2e/own-origin.spec.ts:74:1 › with projects, every request of every screen is addressed to the tool (44.7s)
  ✓  2 e2e/own-origin.spec.ts:94:1 › the Review screens of the talk ask nothing outside the tool, with the preview playing on one of them (27.6s)
  ✓  3 e2e/own-origin.spec.ts:113:1 › the Export tab of a talk with a finished clip asks nothing outside the tool, and saves its file from the tool (27.9s)
  ✓  4 e2e/own-origin.spec.ts:137:1 › the empty Library asks nothing outside the tool (1.1s)
  ✓  5 e2e/own-origin.spec.ts:154:3 › with 3 GB reported free › the low disk error asks nothing outside the tool (6.2s)

  5 passed (2.1m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-DB8fu3
Test data size: 0.09 GB (89.6 MB)
The test data folder was removed.
exit code of the browser tests: 0
```

`web/e2e/own-origin.spec.ts`: the third test visits the Export tab of the talk at 390 px and
at 1360 px, saves the finished clip's file at both, and finds no request outside the tool's
address.

Result: pass

## V23 — The README and the agents' instructions cover what this milestone adds (R9, A18, A111)

Check: block V23

Expected: The README says what the Export tab does, that the first setup compiles OpenCV and how long it takes, and its section on what this version does not do yet begins after the export. `AGENTS.md` names the rendering package, the export capability, the OpenCV build with its guard test, the detector's model, the named crops, the render queue and the portrait video.

```
34:The first `pnpm bootstrap` compiles OpenCV, the library that finds faces, with the compiler of
36:later `pnpm bootstrap` compiles nothing and ends within seconds.
93:"Full Frame" shows all of it over a blurred copy. The export places the first two by the faces
118:The Export tab lists the clips you kept, in the order of their ranks. The number beside the tab
119:counts them. "Output" gives the look the clips are rendered with and their format: 1080 × 1920,
123:"Render 2 Clips", with the number of your kept clips, renders them one at a time. A row reads
124:"Waiting" and then "Rendering" beside a bar, and offers "Download MP4" when its file is finished.
127:on. Rendering goes on when you leave the tab, and it does not wait for another project that is
128:being transcribed. A clip that was being rendered when the tool stopped is rendered at the next
131:For the framing, the render looks for faces in the clip five times a second:
136:  of the clip shows two faces. A clip with fewer is rendered as "Speaker" renders it.
137:- "Full Frame" shows the whole picture over a blurred copy of itself, with faces or without.
141:Cancel stops the clip that is being rendered and takes the waiting clips out of the queue. Clips
142:that had finished keep their files. A clip that could not be rendered shows the reason and Retry,
145:"Download MP4" saves a clip's file under its rank and title, as in
150:project: TikTok, Reels and Shorts. Copy puts one text on the clipboard, on the Mac and on a
154:A finished file stays as it was rendered. After a change to the look or to a clip's in and out
155:points, press Render again: every kept clip is rendered anew, and a file is replaced only when
160:When the fetched video is no longer in the project's folder, the tab says so and switches Render
187:A test run starts its own copy of the tool on ports 3100 and 8865 and keeps its data in a
192:and a test that downloads a model gets it from a server on the Mac. The tests that render clips
193:render them from those videos, and their files are removed with the run's folder.
203:and the project's look; one folder per project with the fetched video, its preview copy, its
207:as in `exports/01-c01.mp4`, the path its row on the Export tab shows. Deleting a project in
259:## What this version does not do yet
266:platforms chosen with it decide which texts the Export tab shows. In Settings, the API key, the
14:  fetches the test model into `.cache/whisper`. Its first run compiles OpenCV, which takes about
105:  use. `web/src/shell/`, `library/`, `project/`, `review/`, `export/` and `settings/` are the
107:  exports through its `index.ts`.
109:  `export` and `settings`; `library` by `project`, `review`, `export` and `settings`. `review`,
110:  the Review tab, and `export`, the Export tab, each also import `project`, which gives them the
111:  project's frame and the open project, and nothing but `app/` imports either of them. `export`
114:  tab and the Export tab.
118:  `rendering`. Each exports through its `__init__.py` and has at most one router. `main.py`
125:  `storage`. `rendering`, the package behind the Export tab, imports `review`, `selection`,
127:  `rendering`, nothing but `main.py` and `rendering` imports `review`, nothing but `main.py`,
128:  `review` and `rendering` imports `selection`, and nothing but `main.py`, `selection` and
147:  words into captions, so the page and the export draw the same groups. The cut step of
170:  own head, the caption and the hook title of the preview are drawn in it, and the export reads
197:## The Export tab
199:- `service/clipper/rendering` is the package behind the tab. It gives a project's export in one
201:  kept clip into `exports/<rank>-<clip>.mp4` in the project's folder. It takes the clips as they
202:  stand from `review`, with their points, their captions and the project's look, so an export
206:  one. The framing is chosen from what was found, and its crop is placed for every frame. The
209:- A render works in `rendering-<clip>` beside `exports` and removes that folder when it ends,
210:  however it ends. The clip is written there under another name and moved into `exports` when
211:  it is whole, so `exports` holds finished files only.
212:- The face finder is OpenCV's YuNet detector. Its model,
213:  `service/clipper/rendering/yunet/face_detection_yunet_2026may.onnx`, comes from OpenCV's model
216:- The render queue is a table and a worker of its own, beside the queue of the pipeline. One
217:  clip renders at a time, the oldest in the queue first whatever its project, and an export
222:- `web/src/export/` is the capability, with three use cases. `open-export` holds a project's
223:  export and draws the tab: the output, the clips, the empty state and the notice of a missing
225:  of a render. `copy-text` lists a clip's platform texts and copies one. `open-export` imports
227:- The store of an export asks the service again one second after each answer while a clip waits
233:## The Export tab in tests
235:- Nothing but deleting a project removes an export. A browser test that renders therefore takes
243:- `portrait.mp4` is the fixture with faces. It shows one public-domain portrait twice on a plain
246:  is the fixture for the crop that stays in the middle.
248:  the portrait video, from `service/clipper/rendering/conftest.py`.
249:- `web/e2e/export-fit.spec.ts` runs the three measures over the Export tab: empty, with the
250:  talk, and with an export presented to the page that holds twelve clips in every state of a
252:- `web/e2e/export-captures.spec.ts` saves the captures of the tab, and the tests of the
253:  rendering package save frames of rendered clips and what ffprobe reports for the talk's files,
338:  file of crop commands by name alone, and the list of overlay pictures names each picture the
340:- The crop of a framing moves through `sendcmd`, with one line of commands for each frame. Every
341:  crop of the graph carries a name of its own: `crop@part` for the Speaker framing, `crop@upper`
342:  and `crop@lower` for the Stacked, and `crop@ground` for the blurred copy of the Full Frame. A
343:  command addressed to plain `crop` reaches every crop of the run.
348:- An export is cut from the fetched source and not from the preview copy. A crop is given in
349:  shares of the picture, so a video stored on its side is cropped as it plays.
355:exporter setup switched off, and without its documentation pages. `sharp` is left out of the web
367:OpenCV is `opencv-python-headless`, compiled on the Mac from its source release. Its ready-made
370:builds OpenCV with FFmpeg and video reading switched off:
373:  from linking Homebrew's picture libraries and switch off the two downloads OpenCV makes while
375:- The result links Apple's own frameworks only. What it compiles in beside OpenCV, libjpeg-turbo,
379:- Install OpenCV with `pnpm bootstrap` and no other way. A pip command without the settings
380:  builds OpenCV with its own defaults, video reading among them.
384:- After any reinstall, `service/clipper/rendering/test_opencv_build.py` must pass. It fails when
385:  the installed OpenCV names FFmpeg in its build information, reads video, has a font built in
388:Clipper reads no video through OpenCV: ffmpeg writes the pictures it searches for faces.
390:Pillow draws the captions and the hook title of an export. It installs from its ready-made
```

The output is one grep after the other: the README's lines first, numbered 34 to 266, then
those of `AGENTS.md`, numbered from 14. The README says what the Export tab does from line
118 to 160. Its line 35, between the two lines printed at 34 and 36, reads "Apple's Command Line Tools, which Homebrew already requires. That takes
about four minutes. A". The section headed at line 259 begins "A project ends with its
exported clips. The results of posted clips are not recorded". `AGENTS.md` names the
rendering package at line 199, the export capability at 222, the OpenCV build from 367 with
its guard test at 384, the detector's model at 212 and 213, the named crops at 340 to 343,
the render queue at 216 and the portrait video at 243.

Result: pass

## V24 — The code follows the standards the hooks enforce, and both recorded layouts name the new parts (A19)

Check: block V24

Expected: Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `rendering/`. The web app's layout lists `export/` with three use cases under it. No line of either starts with `#`.

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
    rendering/
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
    settings/
      change-settings/
  e2e/                    browser tests
    support/
```

The review printed no finding. Its one line left by the filter is the total, and each of the
124 files it was given was reported clean. The web app's layout lists `open-export/`,
`render-clips/` and `copy-text/` under `export/`.

Result: pass

## V25 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

```
 M docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/talk-exports.json
?? docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/v1-test-command.txt
?? docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/v14-service-tests.txt
?? docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/v15-web-tests.txt
?? docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/v3-render-tests.txt
exit code: 0
```

Run at 22:12, after V24 and before this file was written. The five paths are in this
milestone's evidence folder.

Result: pass
