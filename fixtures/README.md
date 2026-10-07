# Fixtures

The committed inputs of the tests. Videos are built from them when the tests run and are never
committed. Everything in this folder together stays under 20 MB.

## The videos

`talk-script.txt` is a talk written for this project: a baker's advice in six parts, each one a
short story or one piece of advice, between a housekeeping opening and a closing. It has about
630 words in plain sentences, with no figures and no abbreviations, so a transcript can be
compared with it word for word.

`node scripts/build-fixtures.mjs <folder>` speaks the script with the macOS voice Samantha and
writes four videos into the folder, each H.264 with AAC sound. Each video lasts as long as its
sound. To know that length, the builder measures the speech it has just written: the talk gets
the speech's length and the long talk five times it. The silent video and the portrait video
get a length of their own. The build takes about fifteen seconds.

| Video | What it holds |
| ----- | ------------- |
| `talk.mp4` | The speech over colour bars, about four minutes at 1280 × 720. |
| `long-talk.mp4` | The speech five times over, about twenty minutes, over a 320 × 180 picture at 10 frames a second. It is long enough for a test to stop a transcription that is under way. |
| `silence.mp4` | Twenty seconds of the colour bars over a silent sound track. |
| `portrait.mp4` | The first twelve seconds of the speech at 1280 × 720, over the portrait twice on a plain ground: small and mirrored on the left, and large on the right, where it drifts 100 px further right over the twelve seconds. It holds a face that moves and two faces at once, for the tests of the framings. The talk's colour bars hold no face. |

## The portrait

`portrait.jpg` is a photograph of a face, 600 × 774 pixels, for the tests that look for faces. It
is Alexander Gardner's portrait of Abraham Lincoln of 1863, in the public domain.
`portrait-source.md` gives its source on Wikimedia Commons, its author, its date, its licence,
the checksum of the original and how the original was reduced.

The tests of the face finder read the photograph itself, and the fixture builder draws it into
`portrait.mp4`. There the small portrait is 360 px high and lies 100 px from the left edge, and
the large one is 640 px high and starts 660 px from the left edge. At these places the large
face stays whole inside an upright part of the picture that follows it, neither portrait reaches
into the other's half of the picture, and the small face is large enough to be found in a frame
that shows the whole picture.

## The test model

The tests transcribe with the smallest Whisper model, `mlx-community/whisper-tiny`, 74 MB.
`node scripts/fetch-test-model.mjs` fetches its two files from Hugging Face at a fixed revision
into `.cache/whisper/tiny`, which git ignores, and prints that folder. Once the folder is
complete the program fetches nothing. `pnpm bootstrap` runs it, and the tests run it again before
they need the model.

## The fixture server

`node scripts/serve-fixtures.mjs <folder>` serves the built folder on a free loopback port and
prints its address. It stands in for a video site in the link tests.

| Address | Answer |
| ------- | ------ |
| `/talk.mp4` | The video, with byte ranges honoured. |
| `/slow/talk.mp4` | The video, sent over about six seconds. |
| `/missing.mp4` | "not found". |
| `/missing-until-repaired/talk.mp4` | "not found" until `/repair` has been called, then the video. |

`pnpm test` builds the fixtures once into its temporary folder for pytest and Playwright. Run
alone, pytest and `pnpm test:browser` each build their own.

## The transcript and the replay graph

`talk-transcript.json` is the transcript the tool stores for `talk.mp4` when it transcribes with
the test model: the language, the name of the model and 628 words, each with its text, its start
and its end in seconds. The tests of sentences, windows and recorded replies read it, so they
need no transcription. It has 54 sentences, which lie in four windows.

`talk-replay-graph.json` is a most-replayed graph for the talk in the form yt-dlp gives one: 100
points over the length of the talk, each with its start, its end and a value from 0 to 1. Its
first point is high, as every such graph is where viewers begin. One peak lies over the fourth
part of the talk, and the level is low everywhere else.

## The recorded replies

`claude/` holds the replies that stand in for Claude. They are written by hand against the talk,
because no test has a key or may call the API. Each folder is one scenario.

| Scenario | What it answers |
| -------- | --------------- |
| `talk` | A score for each of the talk's four windows, and the clips of the three windows on the shortlist. Between them the clips hold the talk's six parts, one clip that overlaps another by more than half, one whose opening words are not in the transcript, one longer than a minute, one flagged as needing context, one flagged as not recommended, and two with the same total. |
| `one-window` | A score for a transcript of one window. |
| `window-twice` | Scores for the talk's windows that name one window twice. |
| `unknown-window` | Scores for the talk's windows that name a window nobody asked about. |
| `unreadable` | Plain prose where structured output was asked for, whatever the task. |
| `unreadable-once` | A reply cut off at the token limit, for one request. After it the scenario has nothing to say. |
| `unreadable-cuts` | For every cut, a clip whose hook title has eleven words. |
| `no-clips` | For every cut, no clip. |
| `declined` | A reply that ends declined, whatever the task. |
| `rejected-key` | The API's answer to a key it does not accept, with status 401. |

A recorded reply is one JSON file with these fields:

| Field | What it holds |
| ----- | ------------- |
| `task` | The task the reply answers, `score` or `cut`. A file without it answers every task. |
| `window` | For a cut, the window the reply answers, such as `w02`. A file without it answers every window. |
| `uses` | How many requests the reply answers before it stands aside. A file without it always answers. |
| `status` | The status of an error. With it, `reply` is the error's body. |
| `reply` | The message in the shape the API returns. Its structured output is written as an object, and the stand-in sends it as text. |

The files of a scenario are tried in the order of their names, and the first that fits answers.

## The seeded set

The tests of the Results tab, of the note and of what Settings counts use one set of decisions
and views on a talk cut with the `talk` scenario. The clips `c01`, `c02` and `c03` are kept and
rendered. `c05` is rejected as not interesting and `c06` as cut off mid-thought. The views are
1,200 for `c01`, 5,400 for `c02` and 48,000 for `c03`.

| Where | What the set gives |
| ----- | ------------------ |
| The Results tab | The clips in the order `c03`, `c02`, `c01`, under "The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2, 1." |
| Settings | 1 under "Cut Off Mid-Thought", 1 under "Not Interesting" and 0 under the two other reasons. |
| The first line of the note | "Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip." |
| The second line of the note | "Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds." |

`c01` opens on a story and lasts 32.76 seconds, `c02` on a contrarian claim and lasts 33.18, and
`c03` on a hot take and lasts 41.32, so the best third is `c03` and the worst third is `c01`.

## The stand-in for the API

`node scripts/serve-recorded-claude.mjs fixtures/claude` serves the scenarios on a free loopback
port and prints its address. The service's tests and the browser tests start it and send the
tool's requests for clips to it.

| Address | Answer |
| ------- | ------ |
| `POST /<scenario>/v1/messages` | The scenario's reply to the task in the request: a stream of events when the request asks for one, one JSON message otherwise. It names the model the request named. When no reply fits, 404 in the API's error shape. |
| `POST /<first>+<second>/v1/messages` | The same, with the scenarios tried in that order. |
| `POST /slow/<scenario>/v1/messages` | The same answer, six seconds late. |
| `GET /requests` | What it was asked so far, in order: the scenario, the path, the beta header, the body, and whether a key came with the request. It keeps no key. |
| `DELETE /requests` | Forgets the requests and how often each reply was used. |
