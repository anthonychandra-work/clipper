# Proof: m3-ranked-clip-candidates

Attempt: 2
Result: pass
Commit: ddea123

| id | result |
| -- | ------ |
| V1 | pass |
| V2 | pass |
| V3 | pass |
| V29 | pass |
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

The checks were run from the worktree's root in the order of the table, at `ddea123` with
nothing uncommitted before V1, on 2026-10-06 from 05:27 to 05:57. The blocks were run with
`bash`, as written. Ports 3100, 8865, 3101 and 8866 were free before V2, the Mac was on a network
and it was kept awake with `caffeinate` for the whole run. Lines in square brackets are markers
the validator added; every other line in a code block is printed by the commands. A check that
is one command was run with `echo "exit code: $?"` after it, which prints the last line of its
code block. A sentence under a code block that names a test file says where a passed test
holds something its name does not state.

## V1 — Setup installs the pinned packages inside the project, the Anthropic SDK among them (A2, A56, R8, R27, R59)

Check: block V1

Expected: The first lines are the listing of the user's key folder, or the message that it does not exist; V24 compares with them. Both commands exit 0. `pip` lists `anthropic 1.11.0`, `docstring_parser 0.18.0`, `jiter 0.17.0`, `sniffio 1.3.1` and `httpx2 2.13.1`.

```
ls: /Users/work/Library/Application Support/Clipper: No such file or directory
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

Done in 509ms using pnpm v10.13.1

> clipper@0.1.0 bootstrap /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/bootstrap-project.mjs

Installing the pinned Python packages
[52 lines "Requirement already satisfied: <package>==<version> ..." left out, one for each package the two requirements files pin]
Installing the browser the tests drive into .cache/playwright
Fetching the model the tests transcribe with into .cache/whisper
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/.cache/whisper/tiny
Clipper is set up. Start it with "pnpm start".
anthropic         1.11.0
docstring_parser  0.18.0
httpx2            2.13.1
jiter             0.17.0
sniffio           1.3.1
```

The block prints no exit code for the two commands, so each was run once more straight after the block, with its output discarded and its exit code printed:

```
exit code of pnpm install --frozen-lockfile: 0
exit code of pnpm bootstrap: 0
```

Result: pass

## V2 — "The test command passes"; one command runs every check, with no key in the environment (R9, R12)

Check: block V2

Expected: The last line gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `c5c6e25`, and only documents changed before this milestone's first commit, so no gate may fail.

The whole output, 249 lines, is `evidence/v2-test-command.txt`. Its opening, the line each gate ended on and its closing lines:

```

> clipper@0.1.0 test /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-tests.mjs


--- Fixtures
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Nfy8Qo/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Nfy8Qo/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Nfy8Qo/fixtures/long-talk.mp4
[...]
--- Ruff
All checks passed!
--- mypy
Success: no issues found in 143 source files
--- pytest
======================= 676 passed in 223.14s (0:03:43) ========================
--- ESLint
--- Web build
--- TypeScript check
--- Vitest
 Test Files  15 passed (15)
      Tests  139 passed (139)
--- Playwright
  91 passed (11.8m)
[...]
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
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Nfy8Qo
Test data size: 0.21 GB (210.3 MB)
The test data folder was removed.
exit code of pnpm test: 0
```

Result: pass

## V3 — Test data is removed and no tracked file changes (R56)

Check: block V3

Expected: `ls` reports that the folder does not exist. Every path `git status` lists is inside this milestone's folder.

The folder V2's closing lines named is `/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Nfy8Qo`.

```
ls: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-Nfy8Qo: No such file or directory
?? docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/v2-test-command.txt
```

The one path listed is the file V2 saved, inside this milestone's folder.

Result: pass

## V29 — "The test command passes" whichever build of the fixtures it runs on: each fixture video comes out the same in every build and ends where its sound ends (R12, A12, A47, A90)

Check: block V29

Expected: For each of the three videos, the three builds show the same picture length, the same sound length and the same length of the whole file, and the two lines after them end in `True`. The line about the long video and five times the talk gives less than 0.5 s. The exit code of pytest is 0. Its passed tests include one for the talk and one for the long talk that hold the end of the picture against the end of the sound, and the one that holds the long talk against five times the talk.

```
talk, build 1: picture 234.933 s, sound 234.939 s, whole file 234.939 s
talk, build 2: picture 234.933 s, sound 234.939 s, whole file 234.939 s
talk, build 3: picture 234.933 s, sound 234.939 s, whole file 234.939 s
talk: the three builds have the same lengths: True
talk: the picture ends within 0.2 s of the sound in every build: True
long-talk, build 1: picture 1174.700 s, sound 1174.698 s, whole file 1174.700 s
long-talk, build 2: picture 1174.700 s, sound 1174.698 s, whole file 1174.700 s
long-talk, build 3: picture 1174.700 s, sound 1174.698 s, whole file 1174.700 s
long-talk: the three builds have the same lengths: True
long-talk: the picture ends within 0.2 s of the sound in every build: True
silence, build 1: picture 20.000 s, sound 20.000 s, whole file 20.000 s
silence, build 2: picture 20.000 s, sound 20.000 s, whole file 20.000 s
silence, build 3: picture 20.000 s, sound 20.000 s, whole file 20.000 s
silence: the three builds have the same lengths: True
silence: the picture ends within 0.2 s of the sound in every build: True
the long video against five times the talk, the worst pair of builds: 0.005 s apart
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0 -- /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collecting ... collected 5 items

clipper/transcription/test_built_fixtures.py::test_the_silent_fixture_is_twenty_seconds_of_h264_with_an_aac_sound_track PASSED [ 20%]
clipper/transcription/test_built_fixtures.py::test_the_long_fixture_is_between_19_and_20_minutes_of_h264_with_an_aac_sound_track PASSED [ 40%]
clipper/transcription/test_built_fixtures.py::test_the_long_fixture_is_the_talk_five_times_over PASSED [ 60%]
clipper/transcription/test_built_fixtures.py::test_the_talk_fixture_ends_its_picture_where_its_sound_ends PASSED [ 80%]
clipper/transcription/test_built_fixtures.py::test_the_long_fixture_ends_its_picture_where_its_sound_ends PASSED [100%]

============================== 5 passed in 0.62s ===============================
exit code of pytest: 0
```

Result: pass

## V4 — "The fixture project reaches the ready state"; "With no key saved, the score stage fails with the reason from D30"; the key is entered in Settings (R15, R39, A65, A66, A72)

Check: block V4

Expected: The exit code is 0. The passed tests show: with no key saved the uploaded talk's card reads "Could Not Finish" with "No Anthropic API key is saved. Add one in Settings, then retry.", Retry and "Open Settings", and the stand-in has received no request; "Open Settings" leads to Settings, where the key is saved; Retry then ends on the project's Review tab, and its Library row reads "Ready to review" with its number of candidates. `ls` shows `talk-selection.json` and `selection-requests.json`. Both counts of `grep` are 0.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/selection.spec.ts


Running 2 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sScmQe/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sScmQe/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sScmQe/fixtures/long-talk.mp4
  ✓  1 e2e/selection.spec.ts:80:1 › with no key the uploaded talk points to Settings, and with the key saved there Retry ends on its Review tab (17.0s)
  ✓  2 e2e/selection.spec.ts:109:1 › with a saved key a link to the talk reaches ready with six candidates and no replay peak (12.7s)

  2 passed (45.0s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-sScmQe
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
exit code of the browser tests: 0
total 264
-rw-r--r--  1 work  staff  48039 Oct  6 05:45 selection-requests.json
-rw-r--r--  1 work  staff  64188 Oct  6 05:45 talk-selection.json
-rw-r--r--  1 work  staff  19588 Oct  6 05:44 v2-test-command.txt
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/talk-selection.json:0
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/selection-requests.json:0
```

The first passed test, `web/e2e/selection.spec.ts:80`, holds the card read with no key against the heading "Could Not Finish", the sentence, the button Retry and the link "Open Settings" (lines 104 and 105) and the stand-in's requests against an empty list (line 106); it taps "Open Settings", saves the key on `/settings` (lines 92 and 93), presses Retry, waits for `/projects/<id>/review` (line 96) and reads the Library row as "Ready to review · 6 candidates" (line 100).

Result: pass

## V5 — "candidates that carry every field in D21" (R31, A68, A71)

Check: block V5

Expected: `status: ready`. The two counts of candidates agree. Every candidate's line ends in `every field`. `0` candidates with a field missing or out of range. The ranks run from 1 without a gap. `True` for the totals.

```
status: ready
candidates: 6 | the project's own count: 6
rank 1, total 88, story, flag None: every field
rank 2, total 84, contrarian, flag None: every field
rank 3, total 82, hot-take, flag None: every field
rank 4, total 82, confession, flag needs-context: every field
rank 5, total 75, hot-take, flag None: every field
rank 6, total 55, none, flag not-recommended: every field
candidates with a field missing or out of range: 0
ranks: [1, 2, 3, 4, 5, 6]
totals in the order of the ranks never rise: True
```

Result: pass

## V6 — "Every candidate starts on the first word of a transcript sentence and ends on the last word of one" (R29, R30, A61, A67)

Check: block V6

Expected: The longest sentence lasts 30 seconds or less. Both lists of candidates off a sentence's edge are `[]`.

```
sentences: 54 | the longest lasts 17.10 s
candidates that do not start on the first word of a sentence: []
candidates that do not end on the last word of a sentence: []
the preset of the project: 25 to 60 seconds
rank 1: 11.94 to 44.70, 32.76 s
rank 2: 86.54 to 119.72, 33.18 s
rank 3: 45.22 to 86.54, 41.32 s
rank 4: 120.16 to 161.46, 41.30 s
rank 5: 161.80 to 192.96, 31.16 s
rank 6: 193.40 to 222.92, 29.52 s
candidates shorter or longer than the preset: []
pairs that overlap by more than half of the shorter one: []
candidates: 6 | at least 2 and at most 12: True
```

Result: pass

## V7 — "No candidate is shorter or longer than the chosen length preset" (R33)

Check: the output of block V6

Expected: The preset reads 25 to 60 seconds, the default the fixture project was created with. The list of candidates shorter or longer than the preset is `[]`.

```
the preset of the project: 25 to 60 seconds
rank 1: 11.94 to 44.70, 32.76 s
rank 2: 86.54 to 119.72, 33.18 s
rank 3: 45.22 to 86.54, 41.32 s
rank 4: 120.16 to 161.46, 41.30 s
rank 5: 161.80 to 192.96, 31.16 s
rank 6: 193.40 to 222.92, 29.52 s
candidates shorter or longer than the preset: []
```

Result: pass

## V8 — "No two candidates overlap by more than half of the shorter one"; the number of candidates on Auto for a video under ten minutes (R32, R34)

Check: the output of block V6

Expected: The list of pairs is `[]`. The last line ends in `True`.

```
pairs that overlap by more than half of the shorter one: []
candidates: 6 | at least 2 and at most 12: True
```

Result: pass

## V9 — "The request for pass one contains every window once, and the shortlist size follows D18"; window scores are stored (R28, A62, A63)

Check: block V9

Expected: The windows worked out from the stored transcript and the windows in the requests of pass one are the same list. `True` for every window asked about once, for the stored windows, for no window left out scoring higher, and for each shortlisted window cut once. The line about the shortlist names the same number twice: 3 windows for a video under ten minutes.

```
windows worked out from the stored transcript: ['w01 1-23', 'w02 17-38', 'w03 32-49', 'w04 44-54']
windows in the requests of pass one:           ['w01 1-23', 'w02 17-38', 'w03 32-49', 'w04 44-54']
every window is asked about once: True
windows stored with their scores: [('w01', 72), ('w02', 81), ('w03', 64), ('w04', 23)]
the stored windows are the windows asked about, each with a score from 0 to 100: True
the video lasts 3.9 minutes, so the shortlist holds 3 windows; the stored one holds 3: ['w01', 'w02', 'w03']
no window left out scored higher than one taken: True
windows cut in pass two: ['w01', 'w02', 'w03'] | each shortlisted window once: True
```

Result: pass

## V10 — "Every selection request names a model identifier from D27, sets no temperature, forces no tool call, and carries an effort setting only for a model that accepts one"; replies as structured output; the fallback; the cached prefix; the brief; the default models (R26, R27, R36, R37, R38, A64)

Check: block V10

Expected: Every request's line shows a key. `requests that break a rule: []`. Pass one names only `claude-sonnet-5-5` and pass two only `claude-opus-5-5`. Both passes show `one shared prefix: True` and `marked for the cache: True`. `True` for the question of pass one. Pass two leaves out all four: intro, outro, sponsor, housekeeping.

```
1 score claude-sonnet-5-5  effort=medium fallbacks=default beta=server-side-fallback-2026-07-01 key=True
2 cut   claude-opus-5-5    effort=high fallbacks=default beta=server-side-fallback-2026-07-01 key=True
3 cut   claude-opus-5-5    effort=high fallbacks=default beta=server-side-fallback-2026-07-01 key=True
4 cut   claude-opus-5-5    effort=high fallbacks=default beta=server-side-fallback-2026-07-01 key=True
requests that break a rule: []
score: 1 requests, models ['claude-sonnet-5-5'], one shared prefix: True, marked for the cache: True
cut: 3 requests, models ['claude-opus-5-5'], one shared prefix: True, marked for the cache: True
pass one asks about the opening two seconds and a viewer with no context: True
pass two leaves out: ['intro', 'outro', 'sponsor', 'housekeeping']
```

Result: pass

## V11 — "A recorded response that quotes text absent from the transcript loses that clip and keeps the others" (R30, A67)

Check: block V11

Expected: The last line gives exit code 0. Among the passed tests: a clip whose opening words are not in the window is not placed while the other clips of the same recorded reply are; and the run of the two steps on the recorded replies, one of which quotes absent text, ends with the talk's six parts as candidates.

The whole output, 574 lines, is `evidence/v11-service-tests.txt`. Its opening and its closing lines:

```
============================= test session starts ==============================
platform darwin -- Python 3.12.13, pytest-9.1.1, pluggy-1.6.0 -- /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service/.venv/bin/python
cachedir: .pytest_cache
rootdir: /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool/service
configfile: pyproject.toml
plugins: anyio-4.15.1
collecting ... collected 563 items
[...]

======================= 563 passed in 130.48s (0:02:10) ========================
exit code of pytest: 0
```

The passed tests the expected cell names:

```
clipper/selection/test_cut_clips.py::test_a_clip_whose_opening_words_are_absent_is_not_placed_while_the_others_of_its_reply_are PASSED [ 16%]
clipper/selection/test_cut_clips.py::test_each_recorded_reply_is_read_and_every_clip_but_the_one_with_an_absent_quote_is_placed[w01] PASSED [ 15%]
clipper/selection/test_cut_clips.py::test_each_recorded_reply_is_read_and_every_clip_but_the_one_with_an_absent_quote_is_placed[w02] PASSED [ 16%]
clipper/selection/test_cut_clips.py::test_each_recorded_reply_is_read_and_every_clip_but_the_one_with_an_absent_quote_is_placed[w03] PASSED [ 16%]
clipper/selection/test_choose_candidates.py::test_the_placed_clips_of_the_three_recorded_replies_give_the_six_parts_of_the_talk PASSED [  8%]
clipper/selection/test_cut_stage.py::test_the_talk_rests_ready_after_one_score_request_and_three_cut_requests_with_six_candidates PASSED [ 16%]
clipper/selection/test_cut_stage.py::test_a_percent_is_reported_after_each_window_is_cut_and_the_clip_with_an_absent_quote_is_lost PASSED [ 18%]
```

Result: pass

## V12 — "A malformed response is retried twice, and the stage then fails with a readable reason" (R38, A65)

Check: the output of block V11

Expected: Among the passed tests: an unreadable reply is asked for three times in all and then raises; a reply unreadable once is asked for twice and read; the score step on unreadable replies fails after three requests with "Claude’s reply could not be read, three times in a row. Retry to run this step again."; a reply that leaves a window out, names one twice or names an unknown one counts as unreadable.

```
clipper/selection/test_ask_claude.py::test_an_unreadable_reply_is_asked_for_three_times_in_all_and_then_raises PASSED [  1%]
clipper/selection/test_ask_claude.py::test_a_reply_unreadable_once_is_asked_for_twice_and_read PASSED [  1%]
clipper/selection/test_score_stage.py::test_unreadable_replies_fail_the_score_step_after_three_requests_and_store_no_window PASSED [ 34%]
clipper/selection/test_selection_reasons.py::test_a_named_error_of_asking_becomes_its_sentence_with_its_mark[failure0-Claude\u2019s reply could not be read, three times in a row. Retry to run this step again.-False] PASSED [ 39%]
clipper/selection/test_score_windows.py::test_a_reply_that_leaves_a_window_out_names_one_twice_or_an_unknown_one_is_unreadable[one-window] PASSED [ 36%]
clipper/selection/test_score_windows.py::test_a_reply_that_leaves_a_window_out_names_one_twice_or_an_unknown_one_is_unreadable[window-twice] PASSED [ 36%]
clipper/selection/test_score_windows.py::test_a_reply_that_leaves_a_window_out_names_one_twice_or_an_unknown_one_is_unreadable[unknown-window] PASSED [ 36%]
```

The sentence is not in the name of the score step's test. That test, `service/clipper/selection/test_score_stage.py:112`, holds the project's reason against "Claude’s reply could not be read, three times in a row. Retry to run this step again." (lines 125 to 127) and the tasks asked against three score requests (line 129).

Result: pass

## V13 — "With a recorded replay graph, the candidates that overlap its peaks carry the marker"; the marker breaks ties and changes no score; replay peaks are stored (R35, A70)

Check: the output of block V11

Expected: Among the passed tests: the graph is read from a link's metadata and kept by the fetch step; the opening of a graph and a flat graph give no peak; with the recorded graph the candidate under the peak carries the marker and ranks ahead of the one with the same total, and without the graph the earlier one ranks first; the run of the two steps with the graph stores the peak and the marker.

```
clipper/fetching/test_read_replay_graph.py::test_the_graph_is_read_from_the_heatmap_of_the_metadata_in_the_form_it_has PASSED [ 68%]
clipper/fetching/test_fetch_stage.py::test_the_graph_a_download_hands_over_is_kept_in_the_form_it_came_in PASSED [ 66%]
clipper/selection/test_replay_peaks.py::test_the_high_first_point_of_a_graph_is_no_peak PASSED [ 28%]
clipper/selection/test_replay_peaks.py::test_a_high_point_anywhere_in_the_first_twentieth_is_no_peak PASSED [ 28%]
clipper/selection/test_replay_peaks.py::test_a_flat_graph_has_no_peak PASSED [ 28%]
clipper/selection/test_choose_candidates.py::test_the_marker_breaks_a_tie_of_totals_without_changing_a_total PASSED [  7%]
clipper/selection/test_choose_candidates.py::test_with_the_recorded_graph_the_clip_under_the_peak_carries_the_marker_and_ranks_first PASSED [  7%]
clipper/selection/test_choose_candidates.py::test_without_the_graph_the_earlier_of_the_two_clips_with_equal_totals_ranks_first PASSED [  8%]
clipper/selection/test_cut_stage.py::test_with_the_recorded_graph_in_its_folder_the_peak_is_stored_and_the_clip_under_it_is_marked PASSED [ 17%]
```

Result: pass

## V14 — "With no key saved, the score stage fails with the reason from D30", in the service; a refused key and a declined reply fail with their reasons (R39, A65, A66)

Check: the output of block V11

Expected: Among the passed tests: with no key the score step fails with the missing-key sentence, marked for Settings, after no request, and Retry with a key saved finishes it; a refused key and a declined reply fail marked with their sentences; no answer from the API fails with its own.

```
clipper/selection/test_prepare_pass.py::test_with_no_key_saved_the_pass_fails_with_the_missing_key_sentence_marked_for_settings PASSED [ 25%]
clipper/selection/test_score_stage.py::test_with_no_key_the_score_step_fails_marked_after_no_request_and_retry_with_a_key_finishes_it PASSED [ 33%]
clipper/selection/test_score_stage.py::test_a_declined_reply_and_a_refused_key_fail_the_score_step_marked_for_settings[declined-Claude declined to read this transcript. Retry, or choose another model for this step in Settings.] PASSED [ 34%]
clipper/selection/test_score_stage.py::test_a_declined_reply_and_a_refused_key_fail_the_score_step_marked_for_settings[rejected-key-Anthropic did not accept the saved API key. Check the key in Settings, then retry.] PASSED [ 34%]
clipper/selection/test_score_stage.py::test_no_answer_from_the_api_fails_the_score_step_with_its_own_sentence_and_no_mark PASSED [ 34%]
clipper/selection/test_whole_app.py::test_with_no_key_saved_a_transcribed_project_fails_marked_and_the_stand_in_hears_nothing PASSED [ 51%]
```

Result: pass

## V15 — "A saved key appears in no response to the browser and in no log line", in the service (R39, A60)

Check: the output of block V11

Expected: Among the passed tests: a saved key is in its file and in no answer; no refusal under `/api/settings` repeats what was sent; the key file has mode 600; with every logger at DEBUG no record holds the key, for a saved key, for one request and for a whole run of the two steps; the start-up settings of a test session name no file in the user's home.

```
clipper/settings/test_router.py::test_a_saved_key_is_in_its_file_and_only_its_ending_is_in_an_answer PASSED [ 60%]
clipper/settings/test_router.py::test_a_refused_change_of_the_choices_does_not_repeat_what_was_sent PASSED [ 59%]
clipper/settings/test_router.py::test_an_unusable_key_is_refused_in_the_problem_form_without_repeating_it[-Paste the key first.] PASSED [ 60%]
clipper/settings/test_router.py::test_an_unusable_key_is_refused_in_the_problem_form_without_repeating_it[  -Paste the key first.] PASSED [ 60%]
clipper/settings/test_router.py::test_an_unusable_key_is_refused_in_the_problem_form_without_repeating_it[sk-ant test-4f2a-An API key has no spaces or line breaks. Paste it again.] PASSED [ 61%]
clipper/settings/test_router.py::test_an_unusable_key_is_refused_in_the_problem_form_without_repeating_it[sk-ant-test\n-4f2a-An API key has no spaces or line breaks. Paste it again.] PASSED [ 61%]
clipper/settings/test_router.py::test_a_body_of_the_wrong_shape_is_refused_without_repeating_it[{"apiKey": ["sk-ant-test-4f2a"]}] PASSED [ 61%]
clipper/settings/test_router.py::test_a_body_of_the_wrong_shape_is_refused_without_repeating_it[{"key": "sk-ant-test-4f2a"}] PASSED [ 61%]
clipper/settings/test_router.py::test_a_body_of_the_wrong_shape_is_refused_without_repeating_it[{"apiKey": "sk-ant-test-4f2a", "note": "sk-ant-test-4f2a"}] PASSED [ 61%]
clipper/settings/test_router.py::test_a_body_of_the_wrong_shape_is_refused_without_repeating_it["sk-ant-test-4f2a"] PASSED [ 61%]
clipper/settings/test_router.py::test_a_body_of_the_wrong_shape_is_refused_without_repeating_it[{"apiKey": "sk-ant-test-4f2a] PASSED [ 62%]
clipper/settings/test_api_key_store.py::test_saving_makes_the_missing_folder_and_the_file_for_the_account_of_the_user_only PASSED [ 52%]
clipper/settings/test_router.py::test_with_every_logger_at_debug_no_record_holds_a_saved_or_a_refused_key PASSED [ 62%]
clipper/selection/test_ask_claude.py::test_with_every_logger_at_debug_no_record_and_no_error_holds_the_key PASSED [  3%]
clipper/selection/test_cut_stage.py::test_with_every_logger_at_debug_no_record_of_a_whole_run_of_the_two_steps_holds_the_key PASSED [ 18%]
clipper/settings/test_api_key_store.py::test_the_startup_settings_of_a_test_session_name_no_file_in_the_home_of_the_user PASSED [ 55%]
```

The mode is not in a test's name. `service/clipper/settings/test_api_key_store.py:34` holds the key file's mode against `0o600` (line 40).

Result: pass

## V16 — The other rules of selection, by test name (R17, R20, R28, R32, R33, R34, R36, R37, R38, A61, A62, A63, A64, A69)

Check: the output of block V11

Expected: Among the passed tests: sentences end at each end mark, and a long run without one is split at its longest pauses; windows of a three-hour transcript start and end on sentences and share 30 seconds at most; a shortlist of 3, 3, 4, 6, 9, 10 and 10 for 4, 10, 10.5, 35, 70, 71 and 180 minutes; pass one of a three-hour transcript in several requests with every window once; a request to each of the four models with no sampling setting, no tools and no thinking, and to Haiku 4.5 with no effort and no fallback; the model chosen in Settings named in the request; the brief in every request; a clip outside the preset dropped and one on its edge kept; the lower-ranked of two overlapping clips dropped; twelve kept of thirteen on Auto and four with a target of 4; a stop ending a request and a step within two seconds; Retry after a failed cut sending cut requests only; a deleted project leaving no window and no candidate; a database made by M2 upgraded with its projects unchanged.

```
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[.] PASSED [ 43%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[?] PASSED [ 43%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[!] PASSED [ 43%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[\u2026] PASSED [ 43%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[\u3002] PASSED [ 43%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[\uff1f] PASSED [ 44%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[\uff01] PASSED [ 44%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[?!] PASSED [ 44%]
clipper/selection/test_split_sentences.py::test_each_end_mark_ends_a_sentence[...] PASSED [ 44%]
clipper/selection/test_split_sentences.py::test_seventy_seconds_without_punctuation_are_split_at_the_longest_pauses PASSED [ 46%]
clipper/selection/test_split_windows.py::test_every_window_of_a_three_hour_transcript_starts_and_ends_on_a_sentence PASSED [ 47%]
clipper/selection/test_split_windows.py::test_each_next_window_starts_at_or_after_30_seconds_before_the_one_before_it_ends PASSED [ 48%]
clipper/selection/test_form_shortlist.py::test_the_shortlist_grows_with_the_length_of_the_video[4-3] PASSED [ 19%]
clipper/selection/test_form_shortlist.py::test_the_shortlist_grows_with_the_length_of_the_video[10-3] PASSED [ 19%]
clipper/selection/test_form_shortlist.py::test_the_shortlist_grows_with_the_length_of_the_video[10.5-4] PASSED [ 19%]
clipper/selection/test_form_shortlist.py::test_the_shortlist_grows_with_the_length_of_the_video[35-6] PASSED [ 19%]
clipper/selection/test_form_shortlist.py::test_the_shortlist_grows_with_the_length_of_the_video[70-9] PASSED [ 19%]
clipper/selection/test_form_shortlist.py::test_the_shortlist_grows_with_the_length_of_the_video[71-10] PASSED [ 19%]
clipper/selection/test_form_shortlist.py::test_the_shortlist_grows_with_the_length_of_the_video[180-10] PASSED [ 20%]
clipper/selection/test_score_windows.py::test_a_three_hour_transcript_is_asked_about_in_questions_of_at_most_60_windows PASSED [ 35%]
clipper/selection/test_ask_claude.py::test_a_request_to_a_newer_model_carries_the_effort_and_asks_for_the_fallback[claude-fable-5-1] PASSED [  0%]
clipper/selection/test_ask_claude.py::test_a_request_to_a_newer_model_carries_the_effort_and_asks_for_the_fallback[claude-opus-5-5] PASSED [  0%]
clipper/selection/test_ask_claude.py::test_a_request_to_a_newer_model_carries_the_effort_and_asks_for_the_fallback[claude-sonnet-5-5] PASSED [  0%]
clipper/selection/test_ask_claude.py::test_a_request_to_haiku_carries_no_effort_and_asks_for_no_fallback PASSED [  0%]
clipper/selection/test_score_stage.py::test_with_haiku_chosen_for_scoring_the_request_names_it_with_no_effort_and_no_fallback PASSED [ 34%]
clipper/selection/test_cut_stage.py::test_the_brief_the_clip_length_and_the_language_are_in_every_request PASSED [ 17%]
clipper/selection/test_choose_candidates.py::test_a_clip_shorter_or_longer_than_the_preset_is_dropped PASSED [  3%]
clipper/selection/test_choose_candidates.py::test_a_clip_exactly_on_an_edge_of_the_preset_is_kept[100-125] PASSED [  3%]
clipper/selection/test_choose_candidates.py::test_a_clip_exactly_on_an_edge_of_the_preset_is_kept[100-160] PASSED [  3%]
clipper/selection/test_choose_candidates.py::test_a_clip_exactly_on_an_edge_of_the_preset_is_kept[10.02-35.02] PASSED [  4%]
clipper/selection/test_choose_candidates.py::test_a_clip_exactly_on_an_edge_of_the_preset_is_kept[10.02-70.02] PASSED [  4%]
clipper/selection/test_choose_candidates.py::test_of_two_clips_that_overlap_by_more_than_half_of_the_shorter_the_lower_ranked_goes PASSED [  4%]
clipper/selection/test_choose_candidates.py::test_thirteen_clips_on_auto_become_twelve PASSED [  5%]
clipper/selection/test_choose_candidates.py::test_a_fixed_target_of_4_keeps_the_best_four PASSED [  5%]
clipper/selection/test_ask_claude.py::test_a_stop_set_after_one_second_ends_a_slow_request_in_under_two PASSED [  3%]
clipper/selection/test_score_stage.py::test_a_stop_during_the_score_step_ends_it_within_two_seconds_and_resume_finishes_the_project PASSED [ 35%]
clipper/selection/test_cut_stage.py::test_a_stop_during_the_cut_step_ends_it_within_two_seconds_and_resume_finishes_the_project PASSED [ 18%]
clipper/selection/test_cut_stage.py::test_unreadable_cuts_fail_the_cut_step_with_the_windows_stored_and_retry_sends_cuts_only PASSED [ 17%]
clipper/selection/test_cut_stage.py::test_deleting_a_ready_project_leaves_no_window_no_peak_and_no_candidate PASSED [ 18%]
clipper/storage/test_open_database.py::test_a_database_made_by_m2_gains_the_selection_tables_and_keeps_its_projects PASSED [ 98%]
```

Two things the cell lists are not in a test's name. The four tests of a request to a model call one shared set of assertions, `service/clipper/selection/test_ask_claude.py:100`, which holds the request's body against `temperature`, `top_p`, `top_k`, `tools`, `tool_choice` and `thinking` (lines 29 and 114). The test of the three-hour transcript, `service/clipper/selection/test_score_windows.py:75`, holds the windows asked about against the list of all windows, none twice (lines 87 and 88), in more than two requests (lines 84 and 85).

Result: pass

## V17 — "A saved key appears in no response to the browser and in no log line", in the browser (R39)

Check: `pnpm test:browser e2e/api-key.spec.ts`

Expected: A key saved on the Settings screen takes a link to the talk to ready. No answer the page or the test received holds the key, the pages and the service's addresses for the settings, the projects, the project and its selection among them. Nothing the tool printed holds it. The run's key file holds it with mode 600, and every request the stand-in kept came with a key. After Remove the file is gone and the row is the field again.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/api-key.spec.ts


Running 1 test using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-3bpkqg/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-3bpkqg/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-3bpkqg/fixtures/long-talk.mp4
  ✓  1 e2e/api-key.spec.ts:106:1 › a key saved in Settings finds the clips of a link and is held by its file alone (23.9s)

  1 passed (59.6s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-3bpkqg
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
exit code: 0
```

The passed test, `web/e2e/api-key.spec.ts:106`, saves the key on the Settings screen and waits for a link to the talk to be ready with 6 candidates (lines 114 to 116 and 128). It holds every answer the page received, with a page, a prefetched link and a service address among them, and the answers of `/api/settings`, `/api/projects`, the project and its selection against the key (lines 75, 129 and 130); what the tool printed against the key (line 131); the key file against the key and mode `0o600` (line 132); and the file as gone after Remove, with the field empty again (lines 122 to 124 and 134). For the stand-in it holds the number of kept requests that came with a key against 4 (line 133), the number of requests a run of the talk makes: V10 lists the four, each with `key=True`.

Result: pass

## V18 — The key is entered in Settings, shown masked and removed; its file is outside the repository (R39, A10, A60)

Check: block V18

Expected: The exit code is 0. The passed tests show: Save with nothing typed shows "Paste the key first."; saving shows "Key saved on this Mac" and the row "Saved · ends in" with the key's last four characters and Remove, also after a reload; Remove shows "Key removed" and the field again. The path printed after them is `Library/Application Support/Clipper/anthropic-api-key` in the user's home, and it is not under the folder printed last.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/settings.spec.ts


Running 8 tests using 1 worker

  ✓  1 e2e/settings.spec.ts:59:3 › at 390 px › Settings has the five groups of the prototype with their rows and footers (300ms)
  ✓  2 e2e/settings.spec.ts:94:3 › at 390 px › the choices start at the defaults, and each one is kept after a reload (311ms)
  ✓  3 e2e/settings.spec.ts:120:3 › at 390 px › Save with nothing typed asks for the key and sends nothing (217ms)
  ✓  4 e2e/settings.spec.ts:131:3 › at 390 px › a saved key is shown by its last four characters, also after a reload, and Remove brings the field back (362ms)
  ✓  5 e2e/settings.spec.ts:157:3 › at 390 px › a key the service refuses is answered in the service’s words, and the field is emptied (257ms)
  ✓  6 e2e/settings.spec.ts:168:3 › at 390 px › the storage row gives the free and the total space with a bar (171ms)
  ✓  7 e2e/settings.spec.ts:180:3 › at 1360 px › the phone row gives the address of this Mac with the web port, and Copy copies it (271ms)
  ✓  8 e2e/settings.spec.ts:193:3 › at 1360 px › the tool answers at the phone address (182ms)

  8 passed (5.0s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-KMATF5
Test data size: 0.07 GB (71.0 MB)
The test data folder was removed.
exit code of the browser tests: 0
/Users/work/Library/Application Support/Clipper/anthropic-api-key
/Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
```

The texts are not in the tests' names. `web/e2e/settings.spec.ts` holds the toast after Save with nothing typed against "Paste the key first." (line 126); the toast after saving against "Key saved on this Mac" (line 141); the row against "Saved · ends in 4f2a" before and after a reload, with Remove as its one button (lines 142 to 146); and the toast after Remove against "Key removed", with the field empty again (lines 151 and 152). The path printed is in the home of the user, `/Users/work`, and does not start with the folder printed after it.

Result: pass

## V19 — The score and cut steps show their state and progress in the Library and on the status screen, can be stopped and resumed, and survive a restart (R15, R18, A72)

Check: `pnpm test:browser e2e/selection-progress.spec.ts`

Expected: The Library row reads "Scoring 4 windows" and then "Cutting clips" over bar values that never fall, and ends at "Ready to review" with its number of candidates. The status screen reads "Step 3 of 4." and "Step 4 of 4." Stop during the score step leaves "Stopped" with a reason that names the step, and Resume ends on the Review tab. After the tool is stopped during the cut step and started again, the Library lists one project, which reaches ready with the same candidates.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/selection-progress.spec.ts


Running 3 tests using 1 worker

Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gNwf0i/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gNwf0i/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gNwf0i/fixtures/long-talk.mp4
  ✓  1 e2e/selection-progress.spec.ts:57:1 › the row of a link reads its two selection steps over a bar that never falls and ends ready (39.9s)
  ✓  2 e2e/selection-progress.spec.ts:77:1 › the status screen counts the two steps as 3 and 4, Stop names the score step, and Resume ends on the Review tab (41.1s)
  ✓  3 e2e/selection-progress.spec.ts:99:1 › the tool stopped while clips are cut and started again lists one project, which reaches ready with its six candidates (41.4s)

  3 passed (2.3m)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-gNwf0i
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
exit code: 0
```

The row's two labels and the status screen's reason are constants of the test and not in its names: `web/e2e/selection-progress.spec.ts` follows the row's bar until it reads "Scoring 4 windows", "Cutting clips" and "Ready to review · 6 candidates" (lines 22 to 24 and 65 to 67), holds the bar's values against their own sorted order (line 72), and holds the stopped card against "Stopped at “Scoring 4 windows”. The stages before it are kept." (lines 25 and 94).

Result: pass

## V20 — What M1 and M2 built still holds now that a project goes on to scoring: importing, the queue, Stop, Retry, Delete, a restart, transcription, the no-speech failure and the model download (R13, R15, R16, R17, R18, R20, R23, R24, R25)

Check: block V20

Expected: The count is 32 or more. The closing line says that no test of these files failed.

```
32
no test of these files failed
```

The 32 lines counted, by file: addresses 5, delete-project 4, halt-project 2, import-link 2, import-upload 2, library 7, model-download 1, no-speech 1, queue 2, queue-through-tool 2, restart 1, transcribe 2, transcribe-restart 1.

Result: pass

## V21 — The states this milestone adds fit a phone: no sideways scroll and no cut label, at the normal text size and at 200% (R7)

Check: `pnpm test:browser e2e/text-size.spec.ts`

Expected: At 390 px and at both sizes, with nothing misfitting: a project stopped for the missing key with "Open Settings", a project being scored, a project being cut, a project failed with the longest sentence of A65, the Library with those and a ready row, and Settings with a saved key, beside the screens M1 and M2 measured.

```

> clipper@0.1.0 test:browser /Users/Work/Documents/_my-projects/clipper/.worktrees/clipper-tool
> node scripts/run-browser-tests.mjs e2e/text-size.spec.ts


Running 4 tests using 1 worker

  ✓  1 e2e/text-size.spec.ts:75:1 › the measure finds a block that is too wide, a cut label, a spilled label and a cut choice (543ms)
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-QGkUMR/fixtures/silence.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-QGkUMR/fixtures/talk.mp4
Built /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-QGkUMR/fixtures/long-talk.mp4
  ✓  2 e2e/text-size.spec.ts:93:1 › with projects, every screen fits at the normal size and at 200% (24.6s)
  ✓  3 e2e/text-size.spec.ts:111:1 › the empty Library fits at the normal size and at 200% (224ms)
  ✓  4 e2e/text-size.spec.ts:126:3 › with 3 GB reported free › the low disk error fits at the normal size and at 200% (4.6s)

  4 passed (45.6s)
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-QGkUMR
Test data size: 0.09 GB (89.3 MB)
The test data folder was removed.
exit code: 0
```

The screens are not in the tests' names. The second passed test, `web/e2e/text-size.spec.ts:93`, runs at 390 px (lines 18 and 64) and holds the list of misfits against an empty list and the list of screens measured against 28 names, each at the normal size and at 200% (lines 20 to 49, 107 and 108). Among the names: `status-keyless`, the status screen of a project that a run without a key left failed, the state whose card V4 reads with "Open Settings"; `status-scoring`; `status-cutting`; `status-declined`, failed with "Claude declined to read this transcript. Retry, or choose another model for this step in Settings."; `library`, which holds the row of the project without a key; `library-selection`, the Library with the rows of the other three and a row "Ready to review · 12 candidates"; and `settings-saved-key`.

Result: pass

## V22 — The web app's rules, by test name (A60, A66, A72)

Check: `pnpm --dir web exec vitest run --reporter=verbose`

Expected: Exit 0. Passed tests show: the card of a failure marked for Settings offering "Open Settings" and the card of another failure not; the row of a ready project reading "Ready to review · 6 candidates", and "1 candidate" for one; the sentence of the saved key's row.

```
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a ready project with 0 candidates as a note with their number 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a ready project with 1 candidates as a note with their number 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeRowStatus > reads the row of a ready project with 6 candidates as a note with their number 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeCandidateCount > words 0 as “0 candidates” 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeCandidateCount > words 1 as “1 candidate” 0ms
 ✓ src/library/list-projects/lib/describe-row-status.test.ts > describeCandidateCount > words 12 as “12 candidates” 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > describeSavedKey > reads "Saved · ends in" with the last four characters of the saved key 0ms
 ✓ src/settings/change-settings/lib/setting-options.test.ts > describeSavedKey > reads "Saved" alone for a key too short to show an ending of 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > gives the reason of a failed project and offers Retry alone 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > offers Open Settings beside Retry on the card of a failure marked for Settings 0ms
 ✓ src/project/follow-progress/lib/describe-status.test.ts > describeStatus > gives the reason of a stopped project and offers Resume without Open Settings 0ms
[...]
 Test Files  15 passed (15)
      Tests  139 passed (139)
exit code: 0
```

The text of the ready row is not in a test's name: `web/src/library/list-projects/lib/describe-row-status.test.ts` holds the rows of 1 and 6 candidates against "Ready to review · 1 candidate" and "Ready to review · 6 candidates" (lines 91 and 92).

Result: pass

## V23 — Every version is pinned; libraries built into the app carry permissive licences, with tqdm as the one recorded exception; the web app gained no package (R8, R58, A39, A56)

Check: block V23

Expected: `every requirement pinned`. The line `anthropic==1.11.0`. Every licence shown is MIT, BSD, Apache-2.0, PSF, ISC, 0BSD, Zlib, CC0-1.0, CNRI-Python, Unlicense or the LLVM exception, alone or joined. One line shows MPL, and it is `tqdm`. None shows GPL, LGPL or AGPL. Nothing is printed before the closing line about the web app's packages.

```
every requirement pinned
anthropic==1.11.0
annotated-doc | MIT
annotated-types | MIT
anthropic | MIT License
anyio | MIT
click | BSD-3-Clause
docstring_parser | MIT License
fastapi | MIT
filelock | MIT
fsspec | BSD-3-Clause
h11 | MIT License
hf-xet | Apache-2.0
httpcore2 | BSD-3-Clause
httpx2 | BSD-3-Clause
huggingface_hub | Apache Software License
idna | BSD-3-Clause
jiter | MIT
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
sniffio | MIT License, Apache Software License
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
```

Result: pass

## V24 — "Every check below runs on recorded model responses"; the tool contacts nothing new but the Anthropic API, and no test can reach it; the service's tests never open the user's key file (R12, R57, A57, A58)

Check: block V24

Expected: Every line of the first search is a file of the selection package importing `anthropic`, or `describe_machine.py`, which reads the Mac's own address; none imports another network library. The second search prints one line, the default address in the start-up settings. The third shows the test run and the root `conftest.py` each setting `CLIPPER_ANTHROPIC_SOURCE`. The fourth ends with its closing line: outside tests, nothing reads an Anthropic variable of the shell. The count of requests in the evidence file is the count of them the stand-in kept under the scenario `talk`. The last listing is the same as the first lines of V1.

```
service/clipper/selection/ask_claude.py:8:import anthropic
service/clipper/selection/ask_claude.py:9:from anthropic.types import TextBlockParam
service/clipper/settings/describe_machine.py:1:import socket
service/clipper/settings/startup_settings.py:10:ANTHROPIC_API = "https://api.anthropic.com"
scripts/prepare-test-run.mjs:26:    CLIPPER_ANTHROPIC_SOURCE: CLOSED_LOCAL_PORT,
service/clipper/conftest.py:23:os.environ["CLIPPER_ANTHROPIC_SOURCE"] = CLOSED_LOCAL_PORT
outside tests, nothing reads an Anthropic variable of the shell
requests in the evidence file: 4 | kept by the stand-in under the scenario talk: 4
ls: /Users/work/Library/Application Support/Clipper: No such file or directory
```

The first lines of V1 read `ls: /Users/work/Library/Application Support/Clipper: No such file or directory`, the same as the last line here.

Result: pass

## V25 — This milestone's commits touch nothing the boundaries exclude (R4, R11, R55, R56)

Check: block V25

Expected: Nothing is printed before each of the two closing lines about changes. `data` and `.cache` are ignored. No video, audio, database or model file is tracked. No key and no key file is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`.

```
end of the changes to .researches and docs/prototype
end of the changes to the copied stylesheets
.gitignore:1:/data	data
.gitignore:7:.cache/	.cache
no video, audio, database or model file is tracked
no key is tracked
no key file is tracked
104	fixtures
every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md
the app reads nothing from docs/
```

Result: pass

## V26 — The README and the agents' instructions cover what this milestone adds (R9, A18, A57, A58, A59)

Check: block V26

Expected: Both files name `CLIPPER_ANTHROPIC_SOURCE`. The README says where the key is saved and kept, that the transcript and no audio or video goes to Anthropic, and that the tests save no key and reach a stand-in. `AGENTS.md` names the selection package, the stand-in and the test key. `fixtures/README.md` describes the recorded replies.

```
README.md:147:| `CLIPPER_ANTHROPIC_SOURCE` | The address the requests for clips are sent to | `https://api.anthropic.com` |
AGENTS.md:36:`CLIPPER_MODEL_SOURCE` and `CLIPPER_ANTHROPIC_SOURCE`. Three more serve test
AGENTS.md:72:  its `talk` scenario as `CLIPPER_ANTHROPIC_SOURCE` at every start. A browser test reads and
AGENTS.md:74:- Everything else a test run starts gets a closed local port as `CLIPPER_ANTHROPIC_SOURCE`:
50:## The Anthropic API key
52:Clipper picks the clips with Claude through the Anthropic API, and for that it needs an API key
55:Open Settings, paste the key into "Anthropic API Key" and press Save. Settings then shows "Saved"
57:`~/Library/Application Support/Clipper/anthropic-api-key`, outside the repository folder, and only
58:your account on the Mac can read it. Clipper sends it to Anthropic with each request for clips.
61:Without a saved key a project stops after its transcription with "No Anthropic API key is saved.
64:Picking clips sends the transcript of the video to Anthropic, and no audio and no video. It is
65:the one thing Clipper does that costs money: Anthropic bills the account of the key for it.
103:clips, it saves a made-up key into a file of the run, and the requests for clips go to a stand-in
104:on the Mac that answers in place of the Anthropic API with replies recorded for the test video.
108:Clipper keeps everything but the API key in the `data` folder inside the repository folder: one
143:| `CLIPPER_KEY_FILE` | The file the Anthropic API key is saved in | `~/Library/Application Support/Clipper/anthropic-api-key` |
147:| `CLIPPER_ANTHROPIC_SOURCE` | The address the requests for clips are sent to | `https://api.anthropic.com` |
151:Clipper hands Anthropic's library the saved key and this address itself. A key, a token or an
152:address for Anthropic that is set in the shell is not used.
170:chosen with it are stored for the export. In Settings, the API key, the two Claude models, the
60:## Selection in tests
63:  a stand-in for it: it serves the recorded replies of `fixtures/claude`, one folder for each
69:- A service test takes the stand-in from the `recorded_claude` fixture in
70:  `service/clipper/selection/conftest.py`, which starts it once a session, and hands its address
81:  `sk-ant-test-4f2a` first and removes it when it ends: a browser test through the `savedKey`
88:- Selection asks Claude through the SDK's async client, run to its end in the queue's thread and
112:  `media`, `projects`, `pipeline`, `fetching`, `transcription` and `selection`. Each exports
116:  `projects` and `media`; `projects` imports none of them. `selection` imports `transcription`
118:  `main.py` imports `fetching` or `selection`, and nothing but `main.py` and `selection` imports
51:and its end in seconds. The tests of sentences, windows and recorded replies read it, so they
59:## The recorded replies
62:because no test has a key or may call the API. Each folder is one scenario.
64:| Scenario | What it answers |
71:| `unreadable-once` | A reply cut off at the token limit, for one request. After it the scenario has nothing to say. |
77:A recorded reply is one JSON file with these fields:
85:| `reply` | The message in the shape the API returns. Its structured output is written as an object, and the stand-in sends it as text. |
87:The files of a scenario are tried in the order of their names, and the first that fits answers.
89:## The stand-in for the API
91:`node scripts/serve-recorded-claude.mjs fixtures/claude` serves the scenarios on a free loopback
97:| `POST /<scenario>/v1/messages` | The scenario's reply to the task in the request: a stream of events when the request asks for one, one JSON message otherwise. It names the model the request named. When no reply fits, 404 in the API's error shape. |
98:| `POST /<first>+<second>/v1/messages` | The same, with the scenarios tried in that order. |
99:| `POST /slow/<scenario>/v1/messages` | The same answer, six seconds late. |
100:| `GET /requests` | What it was asked so far, in order: the scenario, the path, the beta header, the body, and whether a key came with the request. It keeps no key. |
```

Two sentences the cell asks for begin on lines the searches do not print, because the words searched for are on the line after. `README.md:56` reads "The key is kept in one file," before the path on line 57, and `README.md:102` reads "The tests save no key of yours and do not read the file your key is kept in. Where a test needs" before lines 103 and 104.

Result: pass

## V27 — The code follows the standards the hooks enforce, and the service's recorded layout names the new package (A19)

Check: block V27

Expected: Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `selection/`, and no line of it starts with `#`.

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
```

No finding is printed. Unfiltered, the review names 138 files, each as clean.

Result: pass

## V28 — The checks left the worktree clean

Check: `git status --porcelain`

Expected: Every path listed is inside this milestone's folder.

```
 M docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/talk-selection.json
?? docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/v11-service-tests.txt
?? docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/v2-test-command.txt
```

All three paths are in this milestone's `evidence` folder: V4 saved `talk-selection.json` again, and the one line that differs from the committed file is the project's id; V2 and V11 saved the other two.

Result: pass
