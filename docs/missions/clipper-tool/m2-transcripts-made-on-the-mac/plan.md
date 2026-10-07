# Plan: m2-transcripts-made-on-the-mac

Attempt: 1

## Findings

The code as M1 left it

- The queue runs the stages it is handed, one step after another, and rests a project in the
  state of the last stage that ran. Only the fetch stage is handed to it. A stage gives a failure
  reason of its own through the pipeline's stage error; any other failure reads "“<step>” did not
  finish. Retry to run this step again." (`service/clipper/main.py`,
  `service/clipper/pipeline/run_queue.py`, `service/clipper/pipeline/explain_failure.py`)
- A project is created with four steps. A step is a row keyed by its project and its position,
  with a kind, a state and a percent. Its label is worked out from its kind, and the project's
  percent is the mean of its steps. (`service/clipper/storage/open_database.py`,
  `service/clipper/projects/project.py`, `service/clipper/projects/create_project.py`)
- Stop and shutdown reach a stage as one signal. One runner starts a program, hands over its
  output line by line and ends it within a second of the signal. The media package keeps the
  runner to itself. (`service/clipper/media/run_media_tool.py`,
  `service/clipper/media/__init__.py`)
- Settings stores the transcription model as `large-v3-turbo`, `medium` or `small`, and nothing
  reads it. (`service/clipper/settings/preferences.py`)
- The web app shows the step labels the service sends and counts "Step N of M" from the steps it
  receives. It words one thing itself, the resting state, as "Fetched", in the row and on the
  status card. (`web/src/library/list-projects/lib/describe-row-status.ts`,
  `web/src/project/follow-progress/lib/describe-status.ts`)
- Ten browser test files wait for the fetched rest or read what a fetched project shows:
  `import-link`, `import-upload`, `restart`, `queue`, `queue-through-tool`, `halt-project`,
  `delete-project`, `addresses`, `library` and `text-size`, with `seed-projects.ts` and
  `walk-screens.ts` in the support folder. Two service test files start the whole app and wait
  for it: `service/clipper/test_main.py` and `service/clipper/pipeline/test_router.py`. Some of
  their videos are two seconds of a tone.
- `web/e2e/settings.spec.ts` sets the defaults before each test and leaves "Whisper small" chosen
  after its second test.
- The fixture server answers any address with the file named by its last segment, honours byte
  ranges, sends anything under `/slow/` over about six seconds, and answers
  `/missing-until-repaired/` with "not found" until it is repaired
  (`scripts/serve-fixtures.mjs`). Started on a folder that holds a model's two files, it served
  them at `/<repository>/resolve/<revision>/<file>` as it stands. (tried)
- A browser test run starts the tool once per worker through `pnpm start`, with the run's
  environment plus what a test changes. (`web/e2e/support/tool-test.ts`,
  `web/e2e/support/run-tool.ts`)
- The Playwright limit for one test is 120 seconds, and a wait for a project's state gives up
  after 90. (`web/playwright.config.ts`, `web/e2e/support/service-api.ts`)
- The two requirement files hold exactly what `pip freeze` prints in `service/.venv`, so
  installing them without following dependencies installs the same set. (compared on 2026-10-05)
- `pnpm test` passed all nine gates at `365b2dc` in 6 min 26 s (M1's `proof.md`, V2). Only
  mission documents and M1's evidence pictures changed between that commit and `e9f9b5e`, where
  this milestone starts. (`git diff --stat 365b2dc e9f9b5e`)

The rules every write passes through

- `AGENTS.md` lists them. Before each commit, format the Python code and run the standards
  review over the task's source files; it must print no finding without `[advisory]`.
- The hooks refuse an eleventh top-level function or class in a file. Test files are exempt by
  name: `test_*.py`, `*.test.*` and `*.spec.*`. `service/clipper/conftest.py` is not exempt and
  holds ten. New fixtures go into a `conftest.py` inside the transcription package. What every
  test needs is a statement at the top of the root one, not another fixture.
  (`~/.claude/skills/coding-standards/hooks/block-god-file.py`)
- `service/clipper/projects/project.py` holds nine classes, `web/e2e/support/run-tool.ts` eight
  functions and `scripts/start-tool.mjs` nine.
- `Any` is refused in Python, and mlx-whisper has no type information. What it returns is read
  through a Pydantic model, as ffprobe's answer is. (`service/clipper/media/probe_video.py`)

The prototype

- With a transcription model that is not downloaded, a new project gets a step between the fetch
  and "Transcribing on this Mac", labelled "Downloading" and the model's name as Settings shows
  it, and its status card counts "Step 2 of 5." The prototype decides this when the project is
  created and marks the model downloaded when the step ends.
  (`docs/prototype/src/library/plan-stages.js`, `library-actions.js`, `simulate-processing.js`,
  `render-processing.js`)
- Settings shows nothing about which models are downloaded.
  (`docs/prototype/src/settings/render-settings.js`)
- The prototype has no wording for a source without speech, for a model download that fails, or
  for a project resting after transcription.

mlx-whisper, read from PyPI and from its installed source, and tried on this Mac on 2026-10-05

- Context7 has no entry for mlx-whisper. What follows was read from the source of 0.4.3 and run.
- Versions pip resolves for Python 3.12 on macOS 14, arm64: `mlx-whisper` 0.4.3, released
  2025-08-29, `mlx` and `mlx-metal` 0.32.3, `numba` 0.68.0, `llvmlite` 0.50.0, `numpy` 2.5.3,
  `scipy` 1.18.1, `tqdm` 4.70.1, `more-itertools` 11.1.0, `tiktoken` 0.14.0, `regex` 2026.9.29,
  `huggingface_hub` 2.1.1, `filelock` 4.0.12, `fsspec` 2026.9.0, `hf-xet` 1.6.0 and `PyYAML`
  6.0.3. It also needs `httpx2` 2.13.1, `httpcore2` 2.13.1, `truststore` 0.10.4 and `packaging`
  26.3, which `requirements-dev.txt` pins at those versions, and `anyio`, `idna`, `h11`, `click`
  and `typing_extensions`, which `requirements.txt` pins at the versions pip resolves.
- mlx-whisper declares `torch` (2.14.1, with `sympy`, `networkx`, `jinja2`, `MarkupSafe`, `mpmath`
  and `setuptools`), and `tiktoken` declares `requests` (with `urllib3`, `charset-normalizer` and
  `certifi`). Only mlx-whisper's converter imports `torch`. `tiktoken` imports `requests` only to
  fetch a vocabulary, and mlx-whisper ships its own. Installed without those eleven, the other 25
  packages transcribed the fixture. `pip check` then names `torch` and `requests` as missing.
- Licences, from the packages' metadata: MIT, BSD, Apache-2.0 and PSF-2.0, and for `numpy`,
  `regex` and `llvmlite` those joined with 0BSD, Zlib, CC0-1.0, CNRI-Python and the LLVM
  exception. Two are not permissive: `tqdm`, "MPL-2.0 AND MIT", which mlx-whisper and the Hugging
  Face client both import when they load; and `certifi`, MPL-2.0, which only `requests` needs.
  (A39)
- A fresh environment with the 25 packages takes 493 MB. `service/.venv` takes 168 MB today.
- Given a file name, mlx-whisper decodes it by running `ffmpeg` from the PATH, which does not
  start on this Mac. Given samples at 16 kHz, it needs no ffmpeg. (`mlx_whisper/audio.py`)
- Given a folder that holds `config.json` and `weights.npz` or `weights.safetensors`, it loads
  the model from there. Given anything else, it asks the Hugging Face client, whose cache is
  `~/.cache/huggingface` unless it is told another place. With a folder, and the client set
  offline, a run created no cache. (`mlx_whisper/load_models.py`, tried)
- It has no progress callback and cannot be stopped from outside. In its verbose mode it prints
  each decoded stretch with its start and its end as it goes. (`mlx_whisper/transcribe.py`)
- It works out the spectrogram of all the sound it is given before it decodes. For three hours of
  sound that step alone peaked at 7.1 GB and the whole run at 10 GB, on a Mac with 16 GB. (A43)
- The smallest model on the talk fixture: 628 words for a script of 628, 3 of them wrong, which
  is 0.48 in every 100; the same file on a second run; every word with a start and an end; no
  time before the one before it; the last word ending at 234.56 s of a video 235.6 s long.
- As a process of its own, a transcription of the fixture took 4.3 s: 0.9 s to load and 3.2 s to
  transcribe. The first run after installing took 24 s. From a thread inside a running program it
  took 2.6 s, and nothing can end it there before it finishes.
- Cut at the quietest half second in the thirty seconds before each mark, the fixture in
  sixty-second parts had 2 words wrong. The talk five times over, 19.6 minutes, gave 3,140 words
  in two parts, which is five times 628, and 3,132 in one piece.
- On twenty seconds of silence the smallest model wrote one word, "you". Its no-speech score for
  that stretch was 0.81, and its own rule kept the word because the average log-probability,
  −0.99, was above −1.0. Dropping stretches by the no-speech score alone is wrong: in the second
  half of the long talk the model scored 35 stretches of correctly transcribed speech above its
  limit of 0.6. The silent fixture decodes to samples that are all zero, and the talk peaks at
  −0.9 dB of full scale. A minute of noise, a minute of a tone, and the two-second tone the
  service tests build each gave no word. (A45)

Models and where they come from, read from Hugging Face on 2026-10-05

| choice | repository | revision | files, in bytes |
| ------ | ---------- | -------- | --------------- |
| `large-v3-turbo` | `mlx-community/whisper-large-v3-turbo` | `a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb` | `config.json` 268, `weights.safetensors` 1,613,977,612 |
| `medium` | `mlx-community/whisper-medium-mlx` | `7fc08c4eac4c316526498f147dfdee6f6303f975` | `config.json` 268, `weights.npz` 1,524,924,912 |
| `small` | `mlx-community/whisper-small-mlx` | `45f3915923c7a79a5a5b5a7d909d39aeb0e5630e` | `config.json` 266, `weights.npz` 481,307,592 |
| the test model | `mlx-community/whisper-tiny` | `78c52ab98ca87f570bc57ad852e15ef7060f9f76` | `config.json` 262, `weights.npz` 74,418,182 |

- `https://huggingface.co/<repository>/resolve/<revision>/<file>` answers a plain request: the
  small file directly, the weights through a redirect to a content network. Both honour byte
  ranges and declare the whole size, and a file that does not exist answers 404. Python's own
  HTTP client, run by `/opt/homebrew/bin/python3.12`, fetched the 74 MB in 4.3 s with the
  certificates checked.
- The Hugging Face client fetched the same model through its chunk store, wrote into its cache
  as well as into the target folder, and reported progress from a thread that is not Python's.
  The tool does not call it. (A40)

Fixtures, tried on this Mac

- The talk's speech five times over a 320 × 180 picture at 10 frames a second took 6 s to build
  and is 10 MB. Its preview copy took 18 s, and the smallest model transcribed it in 14 s. A test
  that fetches it, stops its transcription and lets it finish fits inside 120 seconds.
- Twenty seconds of silence over the picture builds in under a second.

What the spec's file list leaves out

- The spec lists the transcription, pipeline and settings packages for this milestone. A step
  with a label of its own, the `model` step and the transcribed state also change
  `service/clipper/projects/` and `service/clipper/storage/`. Taking the sound out of a source,
  and sharing the program runner, change `service/clipper/media/`.

## Tasks

- [x] T1 — Add mlx-whisper at pinned versions and turn a file of sound into timed words
  Files: `service/requirements.txt`, `service/requirements-dev.txt`, `service/pyproject.toml`,
  `service/.coding-standards-structure`, `scripts/bootstrap-project.mjs`,
  `scripts/fetch-test-model.mjs`, `scripts/run-tests.mjs`,
  `service/clipper/transcription/__init__.py`, `service/clipper/transcription/conftest.py`,
  `service/clipper/transcription/transcribe_audio.py`,
  `service/clipper/transcription/test_transcribe_audio.py`
  Done: `requirements.txt` pins the sixteen new packages of the Findings and takes over the four
  that `requirements-dev.txt` pinned. Neither file names `torch`, `requests` or `certifi`.
  Bootstrap installs both files without following dependencies; after it, `pip list` shows
  `mlx-whisper 0.4.3` and none of those three. mypy is told that mlx-whisper has no type
  information. `node scripts/fetch-test-model.mjs` fetches the test model's two files at the
  revision of the Findings into `.cache/whisper/tiny`, checks that the weights have 74,418,182
  bytes, and prints the folder. It writes into a folder beside the final one and renames it, so
  an interrupted fetch leaves no half model under the final name, and with the folder complete it
  fetches nothing. Bootstrap runs it as a step, the test command runs it in its fixtures gate,
  and pytest started alone runs it once per session. The transcriber is a program in the
  transcription package that the service's interpreter starts by its file path. It imports
  nothing else from the service, so the service never loads MLX. It takes a file of 16 kHz mono
  16-bit samples, a model folder, a place for its result and the length of a part, ten minutes
  when none is given. It sets `HF_HUB_OFFLINE`, which keeps the Hugging Face client offline,
  before that client loads. It takes the sound in parts no longer than that length, each cut at
  the quietest half second in the thirty seconds before its mark, and gives the model no part
  whose loudest sample is under one thousandth of full scale. The language found for the first
  part that reaches the model is used for the rest. It
  writes the language and every word, with its text as the model gave it and its start and end
  counted from the start of the whole sound, and prints the seconds it has finished after each
  decoded stretch and each part. Tests run it with the test model on the talk's sound, which they
  make with the located ffmpeg: at most 15 words wrong in every 100 against
  `fixtures/talk-script.txt`; every word with a start and an end, no time before the one before
  it, none past the sound's length; the same in parts of sixty seconds; printed seconds that
  rise and end at the sound's length; and twenty seconds of zero samples give no word, also with
  a model folder that does not exist. `service/.coding-standards-structure` lists
  `transcription/`. `pnpm bootstrap` and `pnpm test` exit 0.

- [x] T2 — Build the silent fixture and the long fixture
  Files: `scripts/build-fixtures.mjs`, `fixtures/README.md`,
  `service/clipper/transcription/conftest.py`,
  `service/clipper/transcription/test_built_fixtures.py`
  Done: `node scripts/build-fixtures.mjs <folder>` also writes `silence.mp4`, twenty seconds of
  the picture over a silent sound track, and `long-talk.mp4`, the talk's speech five times over
  a 320 × 180 picture at 10 frames a second, between 19 and 20 minutes long. The whole build
  stays under 30 seconds. Tests read both with ffprobe: the lengths, and an H.264 picture with an
  AAC sound track in each. `fixtures/README.md` describes the three videos and the test model.
  No video is committed.

- [x] T3 — Take the sound out of a source and run the transcriber with progress and a stop
  Files: `service/clipper/media/__init__.py`, `service/clipper/media/extract_audio.py`,
  `service/clipper/media/test_extract_audio.py`, `service/clipper/transcription/__init__.py`,
  `service/clipper/transcription/run_transcriber.py`,
  `service/clipper/transcription/test_run_transcriber.py`,
  `service/clipper/transcription/conftest.py`,
  `service/clipper/transcription/test_transcribe_audio.py`
  Done: taking the sound out of a source writes 16 kHz mono 16-bit samples with the located
  ffmpeg; for the talk, between 234 and 236 seconds of them. A source with no sound track raises
  a named error. A stop signal ends ffmpeg within two seconds, and neither case leaves a file.
  The media package offers its program runner to the other packages. Running the transcriber
  from the service starts the program of T1, turns the seconds it prints into a percent of the
  sound's length that never falls, and returns the language and the words it wrote. A stop
  signal ends the program within two seconds and leaves no process behind. A program that ends
  with an error raises an error that carries the end of what it printed. Tests run it on the
  talk, stop it on the long talk, and start it on a model folder that does not exist.

- [x] T4 — Put the words in order and keep the transcript with the project
  Files: `service/clipper/transcription/__init__.py`,
  `service/clipper/transcription/transcript.py`,
  `service/clipper/transcription/test_transcript.py`,
  `service/clipper/transcription/transcript_store.py`,
  `service/clipper/transcription/test_transcript_store.py`
  Done: the words the transcriber returned become the transcript of A44: the language, the
  model's name, and the words in order with their text unchanged. Times are rounded to hundredths
  of a second and put in order: a word that starts before the word before it ends starts where
  that one ends, a word that ends before it starts ends where it starts, and every time is
  brought inside the video's length. No word at all raises a named no-speech error. The
  transcript is written as `transcript.json` in the project's folder, under another name first
  and then renamed, so a reader never finds half a file. Read back, it equals what was written.
  Tests cover each rule with made-up words.

- [x] T5 — Know the three models and download one
  Files: `service/clipper/settings/startup_settings.py`,
  `service/clipper/settings/test_startup_settings.py`, `service/clipper/storage/data_folder.py`,
  `service/clipper/storage/test_data_folder.py`, `service/clipper/conftest.py`,
  `scripts/prepare-test-run.mjs`, `service/clipper/transcription/__init__.py`,
  `service/clipper/transcription/whisper_models.py`,
  `service/clipper/transcription/test_whisper_models.py`,
  `service/clipper/transcription/download_model.py`,
  `service/clipper/transcription/test_download_model.py`,
  `service/clipper/transcription/conftest.py`
  Done: for each of the three choices in Settings the service knows the repository, the
  revision and the two files of the Findings' table, and the name Settings shows. It forms a
  file's address as `<source>/<repository>/resolve/<revision>/<file>`. The source is
  `https://huggingface.co`, or `CLIPPER_MODEL_SOURCE` when that is set. Models live in `models`
  inside the data folder, one folder per choice, and a model is on the Mac when its folder
  exists. A download fetches both files into a folder beside the final one, reports a rising
  percent of the bytes the server declares, and renames the folder once each file has its
  declared size. Started again after a stop or a failure, it asks only for the bytes it lacks. A
  stop signal ends it within two seconds. "Not found", a refused connection and a file that ends
  short each raise a named download error. Tests fetch from the fixture server started on the
  test model's folder: a whole download whose files have the served sizes; a rising percent from
  the slow address; a stop, then a second run that asks for the rest only; "not found"; and a
  closed port. A test run sets `CLIPPER_MODEL_SOURCE` to a closed local port for everything it
  starts, and the service's tests set it the same way when the variable is absent.

- [x] T6 — Let a project gain a step, rest as transcribed, and carry on after an upgrade
  Files: `service/clipper/storage/open_database.py`,
  `service/clipper/storage/test_open_database.py`, `service/clipper/projects/__init__.py`,
  `service/clipper/projects/project.py`, `service/clipper/projects/test_project.py`,
  `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/projects/project_queue.py`, `service/clipper/projects/test_project_queue.py`,
  `service/clipper/projects/describe_project.py`, `service/clipper/projects/test_router.py`,
  `service/clipper/pipeline/__init__.py`, `service/clipper/pipeline/run_queue.py`,
  `service/clipper/pipeline/test_run_queue.py`, `service/clipper/pipeline/requeue_rested.py`,
  `service/clipper/pipeline/test_requeue_rested.py`, `service/clipper/main.py`,
  `service/clipper/test_main.py`
  Done: a step can carry a label of its own, stored with it. A third migration adds it, and a
  database made by M1 opens with its projects unchanged. Projects know a `model` step and a
  `transcribed` state. The queue's records can put a step ahead of another step of a project:
  the later steps move down, and the new one waits at 0 with its label. Asked again for a project
  that already has that step, they set it back to waiting at 0 with the new label and add
  nothing. A step's key is its project and its position, and the move never gives two rows one
  position. A project's bar is four quarters, one for each step it was created with. A step
  added ahead of one of them shares that quarter, so with the fetch done and a download added the
  project stays at 25. Before the worker starts a step, it runs what the service registered for
  that kind of step and then takes the project's first unfinished step. Tests with stand-in
  stages: a registered check that puts a step ahead of the second one makes that step run first
  and the second after it, and the stop reason of the added step carries its own label. At
  start, after interrupted projects have gone back into the queue, so does a project that rests
  while its next step has a stage; one whose next step has none stays as it is. A project's JSON
  shows a step's own label. `pnpm test` exits 0 with the queue still ending at fetched.

- [x] T7 — Build the download step and the transcribe step
  Files: `service/clipper/transcription/__init__.py`,
  `service/clipper/transcription/model_stage.py`,
  `service/clipper/transcription/test_model_stage.py`,
  `service/clipper/transcription/transcribe_stage.py`,
  `service/clipper/transcription/test_transcribe_stage.py`,
  `service/clipper/transcription/conftest.py`
  Done: the check before a project's download or transcription reads the model chosen in
  Settings. When that model is not on the Mac it puts "Downloading Whisper <name>" ahead of
  "Transcribing on this Mac"; when it is, it adds nothing. The download step fetches the model
  chosen at the moment it runs and is done at once when the model is already there. A failed
  download leaves the project failed with the sentence of A42. The transcribe step removes what
  an earlier attempt left, takes the sound out of the source, runs the transcriber with the
  chosen model's folder, and stores the transcript with the model's name. Its percent follows the
  seconds transcribed. It leaves the source and the preview copy as they were and removes the
  file of samples. A source with no sound track, or with no word, leaves the project failed with
  the sentence of A45. A stop ends it within two seconds, with no transcript and no file of
  samples left. Tests run both steps through the queue's worker with the test model, on projects
  whose fetch is already done: the talk rests transcribed with a stored transcript; the silent
  fixture fails with the reason, and Retry runs the transcribe step again and no other; with
  "Whisper small" chosen and no model on disk, the project gains the download step, the model
  lands in the folder for small, the transcript names small, and a second project gains no
  step; with the model source closed the download fails with its reason; and with the model in
  place and the model source closed, transcription still finishes.

- [x] T8 — Show the transcribed rest in the web app
  Files: `web/src/library/library.types.ts`, `web/src/library/index.ts`,
  `web/src/library/list-projects/index.ts`,
  `web/src/library/list-projects/lib/describe-row-status.ts`,
  `web/src/library/list-projects/lib/describe-row-status.test.ts`,
  `web/src/project/follow-progress/lib/describe-status.ts`,
  `web/src/project/follow-progress/lib/describe-status.test.ts`
  Done: the web app knows the `transcribed` state and the `model` step. A transcribed project's
  row shows its bar and "Transcribed". Its status card is headed "Transcribed" and reads "Step 2
  of 4 is done." and "Not started: Scoring windows, Cutting clips."; after a download it reads
  "Step 3 of 5 is done." A project in its download step reads "Step 2 of 5." under the label the
  service sent. The word for a resting state is written once and used by the row and the card.
  Unit tests cover each sentence.

- [x] T9 — Describe the resting state once in the browser tests
  Files: `web/e2e/support/resting-state.ts`, `web/e2e/support/index.ts`,
  `web/e2e/support/seed-projects.ts`, `web/e2e/support/walk-screens.ts`,
  `web/e2e/import-link.spec.ts`, `web/e2e/import-upload.spec.ts`, `web/e2e/restart.spec.ts`,
  `web/e2e/queue.spec.ts`, `web/e2e/queue-through-tool.spec.ts`, `web/e2e/halt-project.spec.ts`,
  `web/e2e/delete-project.spec.ts`, `web/e2e/addresses.spec.ts`, `web/e2e/library.spec.ts`,
  `web/e2e/text-size.spec.ts`
  Done: every browser test that waits for a project to rest, or reads what a rested project
  shows, takes it from one description in the support folder: the state, the word in the row, the
  heading and the two lines of the status card, the states of the four steps, and the files in
  the project's folder. The description still says fetched, and no test names the fetched state
  itself. `pnpm test` exits 0.

- [x] T10 — Hand the queue the download and transcribe steps
  Files: `service/clipper/main.py`, `service/clipper/test_main.py`,
  `service/clipper/pipeline/test_router.py`, `service/clipper/transcription/conftest.py`,
  `service/clipper/transcription/test_whole_app.py`, `web/e2e/support/test-model.ts`,
  `web/e2e/support/tool-test.ts`, `web/e2e/support/run-tool.ts`,
  `web/e2e/support/resting-state.ts`, `web/e2e/support/service-api.ts`,
  `web/e2e/support/index.ts`, `web/e2e/import-link.spec.ts`, `web/e2e/import-upload.spec.ts`,
  `web/e2e/library.spec.ts`, `web/e2e/settings.spec.ts`
  Done: the service hands the queue the fetch, download and transcribe steps and the check of
  T7, so a fetched project goes on and rests transcribed. The service's tests that start the
  whole app wait for the fetch step to be done where the fetch is their subject, and a new test
  takes an uploaded talk through the whole app to transcribed. A browser test run fetches the
  test model when it is missing, copies it into the run's data folder as the default model,
  serves its folder on a local port for the life of the worker, and gives that address to the
  tool as `CLIPPER_MODEL_SOURCE` at every start, also when a test stops and starts the tool. The
  description of the resting state says transcribed: "Transcribed" in the row and as the
  heading, "Step 2 of 4 is done.", "Not started: Scoring windows, Cutting clips.", the first two
  steps done, and `preview.mp4`, `source.mp4` and `transcript.json` in the folder. The two
  import tests follow the row from the fetch through "Transcribing on this Mac" to
  "Transcribed" and still find a bar that never falls and the fixture's real length.
  `settings.spec.ts` sets the defaults again after each test. `pnpm test` exits 0.

- [x] T11 — Browser tests: the fixture transcribed, progress, Stop and Resume, and a restart
  Files: `web/e2e/transcribe.spec.ts`, `web/e2e/transcribe-restart.spec.ts`,
  `web/e2e/support/read-transcript.ts`, `web/e2e/support/service-api.ts`,
  `web/e2e/support/index.ts`,
  `docs/missions/clipper-tool/m2-transcripts-made-on-the-mac/evidence/talk-transcript.json`,
  `service/clipper/media/run_media_tool.py`, `service/clipper/media/test_run_media_tool.py`
  Done: in `transcribe.spec.ts` the uploaded talk reaches "Transcribed". Its stored transcript
  has every word with a start and an end, no time before the one before it, none past the
  video's length, and at most 15 words wrong in every 100 against the script. The test saves
  `talk-transcript.json` into `CLIPPER_EVIDENCE_DIR` when that is set and into the test output
  otherwise, making the folder when it is missing: one object with `status`, `durationSeconds`
  and `transcript`, the stored file as it is. A link to the long talk shows "Transcribing on
  this Mac" in its Library row over two or more rising bar values. Stop on its status screen
  leaves "Stopped" with "Stopped at “Transcribing on this Mac”. The stages before it are kept."
  and no transcript, and Resume ends at "Transcribed". In `transcribe-restart.spec.ts` the tool
  is stopped while the long talk's transcribe step is running and started again. The Library
  then lists one project, it reaches "Transcribed", and its folder holds the source, the preview
  copy and the transcript and nothing else. The evidence file is saved with the command of block
  V4 and committed.

- [x] T12 — Browser tests: no speech, and the model download as a step of its own
  Files: `web/e2e/no-speech.spec.ts`, `web/e2e/model-download.spec.ts`,
  `web/e2e/support/index.ts`
  Done: in `no-speech.spec.ts` a link to the silent fixture ends at "Could Not Finish" with the
  sentence of A45 and Retry, its first step done. Retry shows the transcribe step running again
  and ends on the same sentence. Through the Retry the fetch step stays done, and the source and
  the preview copy keep their modification times. In `model-download.spec.ts` the tool is
  started with the model source at the server's slow address, and "Whisper small" is chosen on
  the Settings screen. The next project's status screen shows "Downloading Whisper small" with
  "Step 2 of 5." and a bar, then "Transcribing on this Mac" with "Step 3 of 5.", and rests at
  "Step 3 of 5 is done." The model's two files are in `models/small` in the data folder, and the
  stored transcript names `small`. A second project has four steps and never shows the
  download. The test chooses the default model again and starts the tool as it found it.

- [x] T13 — Fit the new states on a phone at 200%
  Files: `web/e2e/support/walk-screens.ts`, `web/e2e/support/seed-projects.ts`,
  `web/e2e/text-size.spec.ts`, `web/e2e/own-origin.spec.ts`, `web/src/shared/styles/app.css`
  Done: the walk of screens shows four more states of a project, presented to the page from the
  held list: the download step running, the transcribe step running, failed with the no-speech
  sentence, and failed with the download sentence. At 390 px, at the normal text size and at
  200%, none scrolls sideways and none cuts a label, on the status screen and in the Library
  row. A rule that a state needs goes into `app.css`, and the copied stylesheets stay as they
  are. `own-origin.spec.ts` walks the same screens.

- [x] T14 — Bring the README and the instructions for coding agents up to date
  Files: `README.md`, `AGENTS.md`
  Done: `README.md` says that bootstrap also fetches the test model, 74 MB, into
  `.cache/whisper`; that the data folder also holds `models` and each project's transcript; that
  a model downloads the first time a project needs it, with the size of each; what
  `CLIPPER_MODEL_SOURCE` sets, in the table of variables; how long `pnpm test` takes now, as
  measured; and what this version does not do yet, which begins after "Transcribed".
  `AGENTS.md` names the transcription package and the direction of its imports; the transcriber
  as a program of its own that the service starts; the install without following dependencies
  and the two packages left out; `tqdm` as the one package under the MPL; the test model, its
  cache and the local model server; and the limit the root `conftest.py` has reached. Each
  command in both files was run as written.
