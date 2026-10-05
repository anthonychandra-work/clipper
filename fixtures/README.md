# Fixtures

The committed inputs of the tests. Videos are built from them when the tests run and are never
committed. Everything in this folder together stays under 20 MB.

## The videos

`talk-script.txt` is a talk written for this project: a baker's advice in six parts, each one a
short story or one piece of advice, between a housekeeping opening and a closing. It has about
630 words in plain sentences, with no figures and no abbreviations, so a transcript can be
compared with it word for word.

`node scripts/build-fixtures.mjs <folder>` speaks the script with the macOS voice Samantha and
writes three videos into the folder, each H.264 with AAC sound. Each video lasts as long as its
sound. To know that length, the builder measures the speech it has just written: the talk gets
the speech's length and the long talk five times it. The build takes about fifteen seconds.

| Video | What it holds |
| ----- | ------------- |
| `talk.mp4` | The speech over colour bars, about four minutes at 1280 × 720. |
| `long-talk.mp4` | The speech five times over, about twenty minutes, over a 320 × 180 picture at 10 frames a second. It is long enough for a test to stop a transcription that is under way. |
| `silence.mp4` | Twenty seconds of the colour bars over a silent sound track. |

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
