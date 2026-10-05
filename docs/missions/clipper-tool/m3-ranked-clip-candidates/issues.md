# Issues: m3-ranked-clip-candidates

## Attempt 1 — executor

Failed: no task. Every task of the plan is built and ticked. What fails is the test command,
`pnpm test`, in two of the four full runs made while building, on a test this plan does not
touch.

```
FAILED clipper/transcription/test_built_fixtures.py::test_the_long_fixture_is_the_talk_five_times_over

>       assert long_length == pytest.approx(5 * talk_length, abs=5)
E       assert 1177.1 == 1182.333335 ± 5

E       assert 1177.4 == 1186.166665 ± 5
```

The four full runs, in order:

| run | tree | this test | every other gate | exit |
| --- | ---- | --------- | ---------------- | ---- |
| 1 | `da9d63c` (T14) | passed | passed | 0 |
| 2 | `492b4b3` (T15) | failed, 1177.1 against 1182.33 | passed | 1 |
| 3 | `492b4b3` (T15), unchanged | passed | passed | 0 |
| 4 | `0958a98` (T18) with T19's three documents | failed, 1177.4 against 1186.17 | passed, 91 browser tests among them | 1 |

No full run has passed on the final tree. Run 4 is the only full run of T16, T17 and T18
together.

Observed:

- The test compares the length of the long fixture video with five times the length of the talk
  fixture video and allows 5 seconds. The long video was 1177.1 and 1177.4 seconds, five times
  the speech. The talk video was 236.47 and 237.23 seconds in the two failing runs, 1.05 and 1.75
  seconds longer than its own speech. Past 1.0 second the test fails.
- Six builds of the fixtures made one after another, outside the test command, gave talk videos
  0.11 to 0.55 seconds longer than their speech, and differences of 0.57 to 2.73 against the 5
  allowed. None would have failed.
- `git diff c5c6e25 HEAD` is empty for the fixture builder, this test, the test runner and the
  talk's script. `c5c6e25` is the commit M2's test command passed at. Nothing this milestone
  changed runs while the fixtures are built. M2's records hold passing runs only, so how often
  this test failed before this milestone is not known.
- The cause is not established. The builder encodes three videos at once, so load on the Mac
  during the build is one guess. It was not tested, and it does not separate the runs: all four
  were started soon after other heavy work, the two that passed as well as the two that failed.
- Validation block V2 runs `pnpm test` once and expects exit code 0.

Not done, and why:

- The test and the builder were not changed. Both belong to M2 and no task of this plan names
  them. Whether to allow the talk video a longer tail in the test, or to make the builder end
  the talk video where its sound ends, is a decision for a plan.
- The command was not run again after the second failure. One more passing run would not show
  that the command passes.
