# Fixtures

The committed inputs of the tests. Videos are built from them when the tests run and are never
committed. Everything in this folder together stays under 20 MB.

## The talk

`talk-script.txt` is a talk written for this project: a baker's advice in six parts, each one a
short story or one piece of advice, between a housekeeping opening and a closing. It has about
630 words in plain sentences, with no figures and no abbreviations, so a transcript can be
compared with it word for word.

`node scripts/build-fixtures.mjs <folder>` speaks the script with the macOS voice Samantha and
writes `talk.mp4` into the folder: about four minutes of 1280 × 720 H.264 video with AAC sound,
the speech over colour bars. The build takes about ten seconds.

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
