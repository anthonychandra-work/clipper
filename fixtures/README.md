# Fixtures

The committed inputs of the tests. Videos are built from them when the tests run and are never
committed. Everything in this folder together stays under 20 MB.

## The videos

`talk-script.txt` is a talk written for this project: a baker's advice in six parts, each one a
short story or one piece of advice, between a housekeeping opening and a closing. It has about
630 words in plain sentences, with no figures and no abbreviations, so a transcript can be
compared with it word for word.

`node scripts/build-fixtures.mjs <folder>` speaks the script with the macOS voice Samantha and
writes three videos into the folder, each H.264 with AAC sound. The build takes about fifteen
seconds.

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
