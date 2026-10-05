# Plan: m3-ranked-clip-candidates

Attempt: 1

## Findings

The code as M2 left it

- The queue is handed three stages: fetch, model download and transcribe. A project is created
  with four steps and rests `transcribed` with `score` and `cut` pending. A stage states a
  failure of its own through `StageFailedError`; any other failure reads "“<step>” did not
  finish. Retry to run this step again." Stop and shutdown reach a stage as one event, and the
  queue waits five seconds for a stopped stage to end. At start, a project that rests before a
  step that now has a stage goes back into the queue. (`service/clipper/main.py`,
  `pipeline/run_queue.py`, `pipeline/explain_failure.py`, `pipeline/requeue_rested.py`)
- With a score stage in the queue a project passes from transcribing to scoring without resting,
  so the `transcribed` state is no longer seen from outside. Three tests in
  `service/clipper/transcription/test_whole_app.py` wait for it.
- A project stores its clip length (`short`, `standard`, `long`), its platforms and its brief.
  Its JSON gives none of them and has no count of candidates. Its halt is one sentence. A step
  can carry a label of its own, and the one way to set a label also resets the step.
  (`projects/project.py`, `projects/project_schemas.py`, `projects/project_queue.py`)
- `ready` is already a project state. The web app sends a ready project from `/projects/<id>` to
  its Review tab, shows "Ready to review" in its row, and writes "0 candidates" in its subtitle
  from a constant. (`web/src/project/open-project/lib/project-addresses.ts`,
  `web/src/project/open-project/components/ProjectTabs.tsx`,
  `web/src/library/list-projects/lib/describe-row-status.ts`)
- Settings stores the scoring model, the cutting model and the clips per video, and nothing reads
  them. The start-up settings hold `key_file`, by default A10's file in the user's home, and
  nothing reads it. The key row is a field with Save switched off.
  (`service/clipper/settings/preferences.py`, `settings/startup_settings.py`,
  `web/src/settings/change-settings/components/ApiKeyRow.tsx`)
- A refused change to `/api/settings` is answered by FastAPI's own 422, which repeats the body
  that was sent. `settings/test_router.py` sends a key to that address and reads only the status.
- Five service test files start the whole app with only a data folder: `test_main.py`,
  `pipeline/test_router.py`, `projects/test_router.py`, `settings/test_router.py` and
  `transcription/test_whole_app.py`. Run without `pnpm test`, their key file is the one in the
  user's home as soon as anything reads it. `~/Library/Application Support/Clipper` does not
  exist on this Mac today.
- Twelve browser test files take the place where a project comes to rest from
  `web/e2e/support/resting-state.ts`: `addresses`, `delete-project`, `halt-project`,
  `import-link`, `import-upload`, `library`, `queue`, `queue-through-tool`, `restart` and
  `text-size`, with `seed-projects.ts` and `walk-screens.ts` in the support folder. Three more
  write "Transcribed" themselves: `transcribe`, `transcribe-restart` and `model-download`.
  `halt-project` and `queue` wait for the rest by the heading of the status card.
  `support/status-screen.ts` reads the card's buttons and not its links.
- A browser test run starts the tool once per worker through `pnpm start` and can stop and start
  it with a changed environment. The fixture server is one Node program that pytest and
  Playwright both start. (`web/e2e/support/tool-test.ts`, `scripts/serve-fixtures.mjs`,
  `service/clipper/conftest.py`)
- At the hooks' limit of 10 top-level functions and classes: `service/clipper/conftest.py`,
  `web/e2e/support/walk-screens.ts` and `web/e2e/support/service-api.ts`. One short of it:
  `projects/project.py` and `fetching/download_link.py`. `create_app` in `main.py` holds 19
  statements of the 20 allowed. What these files would gain goes into a new file beside them.
- `pnpm test` passed all nine gates at `c5c6e25` (M2's `proof.md`, V2). Only mission documents
  changed between that commit and `9715bcb`, where this milestone starts.
  (`git diff --stat c5c6e25 9715bcb`)

The prototype

- With no key saved, a project fails at the score step with "No Anthropic API key is saved. Add
  one in Settings, then retry.", and its card shows Retry and, as a second control, "Open
  Settings". No other failure of selection has a wording.
  (`docs/prototype/src/library/simulate-processing.js`, `render-processing.js`)
- The key row is a field with Save, or "Saved · ends in 4f2a" with Remove. Save with nothing
  typed shows "Paste the key first."; saving shows "Key saved on this Mac"; removing shows "Key
  removed". (`docs/prototype/src/settings/api-key.js`)
- The score step reads "Scoring 49 windows". A ready row reads "Ready to review · 8 candidates,
  3 kept, 1 rejected". (`docs/prototype/src/library/plan-stages.js`, `render-project-row.js`)
- A sample clip has a title, a hook title, a hook type (Number, Story, List, Hot take,
  Confession, Contrarian, No hook), four subscores, a reason, a replay signal, a flag with a
  label and a sentence, and one text per platform. (`docs/prototype/src/project/sample-clips.js`)

The Anthropic API and its SDK, read from the `claude-api` skill's reference (cached 2026-09-25)
and from Context7, and tried on this Mac on 2026-10-06

- `pip index versions anthropic` gives 1.11.0 as the newest. For Python 3.12 on this Mac pip
  resolves fifteen packages. Eleven are already pinned at the same versions, `httpx2` 2.13.1
  among them, which the SDK now builds on. Four are new: `anthropic` 1.11.0, `docstring_parser`
  0.18.0, `jiter` 0.17.0 and `sniffio` 1.3.1, all MIT, `sniffio` with Apache-2.0 beside it. (A56)
- The four models of D27 exist under those identifiers. Opus 5.5, Sonnet 5.5 and Fable 5.1
  answer 400 to a sampling setting, to a forced `tool_choice` and to `thinking` switched off;
  thinking runs by itself when the parameter is left out. Effort goes in `output_config.effort`
  and is refused by Haiku 4.5. All four support structured output.
- The SDK's `messages.create`, `stream` and `parse` have no `temperature`, `top_p` or `top_k`
  parameter.
- Structured output: `stream(..., output_format=<a Pydantic model>)` sends
  `output_config.format` as a JSON schema, moves bounds the API does not take (a number's range)
  into the field's description, and `get_final_message().parsed_output` is the validated
  object. A reply that is not valid for the model raises `pydantic_core.ValidationError` there.
  `output_config={"effort": ...}` given beside it is merged.
- Server-side fallback in its `default` form: `client.beta.messages.stream(...,
  betas=["server-side-fallback-2026-07-01"], fallbacks="default")`. The request goes to
  `/v1/messages?beta=true` with the header `anthropic-beta` and `fallbacks` in the body. Fable
  5.1, Opus 5.5 and Sonnet 5.5 take it; Haiku 4.5 does not. A request that still ends declined
  answers 200 with `stop_reason` `refusal`, and its text may still parse, so the stop reason is
  read first.
- A client made with `api_key` and `base_url` sent its request to that address although
  `ANTHROPIC_BASE_URL` named another, and carried only `X-Api-Key` with that key although
  `ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` were set. (A57)
- With every logger at DEBUG the SDK logged the request's body, so the transcript, and not the
  key. A 401 raises `AuthenticationError`, and a closed port raises `APIConnectionError` after
  1.4 seconds with the SDK's two retries; neither error's text held the key.
- A stream closed from another thread did not end the thread that was reading it; the process
  had to be killed. The async client, run with `asyncio.run` in the calling thread and its task
  cancelled when the stop signal was set, ended 0.02 seconds after the signal and left no thread.
- A local server that answers `POST /v1/messages` with the events `message_start`,
  `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta` and
  `message_stop` satisfied the SDK's stream helper; one JSON message satisfied `parse`.
- A cache entry can be read once the first answer has begun, so the requests of one pass go one
  after another. The smallest prefix that is cached is 512 tokens on the three newer models and
  4,096 on Haiku 4.5; a shorter one is sent uncached without an error.

yt-dlp 2026.8.19, read from its installed source

- A YouTube video's most-replayed graph is `heatmap` in the info `extract_info` returns: 100
  points, each `start_time`, `end_time` and a `value` from 0 to 1, or nothing when the video has
  none. The YouTube extractor fills it, and a plain file from the fixture server has none.
  (`yt_dlp/extractor/common.py`, `youtube/_video.py`)

The fixture's transcript, read from M2's evidence file

- The stored transcript of the talk has 628 words and, split by A61, 54 sentences. The longest
  lasts 17.1 seconds, so none is split at a pause. Laid out by A62 it has four windows, over
  sentences 1–23, 17–38, 32–49 and 44–54, and the video lasts under four minutes, so the
  shortlist holds three.
- The talk's six parts each lie inside the standard preset: sentences 4–12 (32.8 s), 13–22
  (41.3 s), 23–30 (33.2 s), 31–40 (41.3 s), 41–47 (31.2 s) and 48–51 (29.5 s). The fourth
  starts in the second window and ends after it, and it starts before the third window does. A
  clip held inside one window could not be cut there. (A67)
- Three words differ from the script: "and winter", "At the rent" and "flower". The stored words
  and their times were the same in two runs; only the video's length differed, by 0.07 seconds.

The rules every write passes through

- `AGENTS.md` lists the coding-standards rules. Before each commit, format the Python code and
  run the standards review over the task's source files; it must print no finding without
  `[advisory]`.
- A second hook, `~/.claude/hooks/secret-scan.py`, refuses a write that holds `sk-` followed by
  twenty or more key characters. It skips `fixtures/`, `*.spec.ts`, `*.test.ts`, `.md` and
  `.txt`, and it scans `test_*.py`, `conftest.py` and `web/e2e/support/`. The key the tests save
  is `sk-ant-test-4f2a` everywhere. (A58)
- New fixtures of the service's tests go into `service/clipper/selection/conftest.py`. What
  every test needs is a statement at the top of the root one.

What the spec's file list leaves out

- The spec lists the selection, settings, fetching and pipeline packages. The steps also change
  `service/clipper/projects/` and `service/clipper/storage/`: a halt that points to Settings, a
  step's label, the count of candidates and three new tables. The stand-in and the test run's
  settings change `scripts/`. `service/.coding-standards-structure`, `README.md`, `AGENTS.md`
  and this milestone's `evidence` folder change too.

## Tasks

- [x] T1 — Add the Anthropic SDK and the stand-in, and ask Claude under the request rules
  Files: `service/requirements.txt`, `service/.coding-standards-structure`,
  `service/clipper/settings/startup_settings.py`,
  `service/clipper/settings/test_startup_settings.py`, `service/clipper/conftest.py`,
  `scripts/prepare-test-run.mjs`, `scripts/serve-recorded-claude.mjs`,
  `scripts/recorded-replies.mjs`, `scripts/shape-claude-answer.mjs`,
  `fixtures/claude/one-window/score.json`,
  `fixtures/claude/unreadable/every-task.json`,
  `fixtures/claude/unreadable-once/first-request.json`,
  `fixtures/claude/declined/every-task.json`, `fixtures/claude/rejected-key/every-task.json`,
  `service/clipper/selection/__init__.py`, `service/clipper/selection/conftest.py`,
  `service/clipper/selection/model_traits.py`, `service/clipper/selection/test_model_traits.py`,
  `service/clipper/selection/ask_claude.py`, `service/clipper/selection/test_ask_claude.py`,
  `service/clipper/selection/claude_errors.py`,
  `service/clipper/selection/test_recorded_claude.py`
  Done: `requirements.txt` pins the four packages of A56, and after `pnpm bootstrap` `pip list`
  shows `anthropic 1.11.0`. The start-up settings gain the address of A57. A test run names a
  closed local port for it, and the root `conftest.py` sets it to that port whatever the
  environment says. `service/.coding-standards-structure` lists `selection/`.
  `node scripts/serve-recorded-claude.mjs <folder>` is the stand-in of A59: it serves the
  folder's scenarios on a free loopback port and prints its address. A request to
  `/<scenario>/v1/messages`, with or without `?beta=true`, is answered by the first recorded
  reply of the scenario that fits the task in the last part of the user message. A scenario
  written as several names joined by `+` is tried in that order. A recorded reply marked for a
  number of uses answers that many requests and then stands aside. A recorded reply can be an
  error with its status. No fitting reply answers 404 in the API's error shape. The answer is a
  stream of events when the request asks for one and one JSON message otherwise, and it names the
  request's model. Under `/slow/` it comes six seconds late. `GET /requests` gives what A59
  lists, in the order the requests came, and `DELETE /requests` forgets them. Asking Claude takes
  the model, the effort, the system text, the transcript part, the task, the Pydantic model of
  the reply, the key, the address and the stop signal. It sends one streamed request through the
  SDK's async client, run to its end in the calling thread, with the key and the address handed
  to the client. The request follows A64: `max_tokens` 32,000; the transcript part marked for
  the cache; the reply's model as the output format; for the three models that take them, the
  effort and the fallback of the Findings; for Haiku 4.5 neither. It returns the validated
  reply. A reply that does not validate, that stopped at the token limit, or that a check handed
  in by the caller refuses is asked for again, three requests at most, and then raises a named
  error. A declined reply raises a named error after one request. The SDK's errors become named
  errors for a refused key, no answer, a busy service and anything else. A set stop signal
  cancels the request and raises a named error within two seconds. Tests against the stand-in,
  for each of the four models: the path, the header and the body are as described, and no body
  has `temperature`, `top_p`, `top_k`, `tools`, `tool_choice` or `thinking`. Further tests: a
  good reply is returned; `unreadable` takes three requests and raises; `unreadable-once` ahead
  of `one-window` takes two and returns; `declined` takes one; `rejected-key` and a closed port
  raise their errors; under `/slow/` a stop set after one second ends the call in under two; a
  key and an address in `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` are
  not used; with every logger at DEBUG no log record and no error's text holds the key; the
  stand-in's answers and its kept requests hold no key. `pnpm bootstrap` and `pnpm test` exit 0.

- [x] T2 — Keep the API key in its file and out of every answer
  Files: `service/clipper/settings/api_key_store.py`,
  `service/clipper/settings/test_api_key_store.py`, `service/clipper/settings/router.py`,
  `service/clipper/settings/test_router.py`, `service/clipper/settings/__init__.py`,
  `service/clipper/main.py`, `service/clipper/conftest.py`
  Done: the key store reads, saves and removes the key in the file the start-up settings name.
  Saving makes the folder when it is missing, with access for the user's account only, and
  writes the file with mode 600. A file that is not there, or cannot be reached, means no key.
  `PUT /api/settings/api-key` saves and `DELETE` removes, and both answer as `GET /api/settings`
  does, which gains `hasApiKey` and `apiKeyEnding`, the last four characters or nothing. The two
  refusals of A60 are answered in the app's problem form. No answer under `/api/settings` repeats
  what was sent: a refused key, a body of the wrong shape, and a refused change of the choices,
  which today repeats its body. The root `conftest.py` sets the key file, whatever the
  environment says, to a path under `/dev/null`, where no file can be read or made, so a test
  that saves a key must name a file of its own. Tests name a key file in their temporary
  folder: a saved key is in the file and in no answer; the ending is shown; removing deletes
  the file; a key saved by one app is read by the next one started on the same file; each
  refusal; a key sent to the choices' address is not in the 422; with every logger at DEBUG no
  record holds the key; the start-up settings of a test session do not name a file in the
  user's home.

- [x] T3 — Split a transcript into sentences and windows
  Files: `fixtures/talk-transcript.json`, `service/clipper/selection/split_sentences.py`,
  `service/clipper/selection/test_split_sentences.py`,
  `service/clipper/selection/split_windows.py`,
  `service/clipper/selection/test_split_windows.py`, `service/clipper/selection/conftest.py`,
  `service/clipper/selection/__init__.py`, `AGENTS.md`
  Done: `fixtures/talk-transcript.json` is the transcript the tool stored for the talk with the
  test model, as the `transcript` of M2's evidence file holds it. The selection package takes
  the transcript's form from the transcription package, and `AGENTS.md` says what `selection`
  imports: `transcription` for the stored transcript, `settings`, `pipeline`, `projects` and
  `storage`, with nothing but `main.py` importing `selection`. Sentences follow A61: each
  knows its number from 1, its words, its start and its end. Windows follow A62 and carry their
  names. Tests with made-up words cover each end mark, a closing quotation mark after one, a
  last word without one, and seventy seconds without punctuation split at the longest pauses
  into parts of 30 seconds or less. On a made-up transcript of three hours every window starts
  and ends on a sentence, none but the last is longer than 90 seconds, each next one starts at
  or after the moment 30 seconds before the one before it ends, and every sentence is in a
  window. A transcript of one sentence gives one window. The committed transcript gives 54
  sentences and the four windows of the Findings.

- [x] T4 — Store windows, replay peaks and candidates, and count a project's candidates
  Files: `service/clipper/storage/open_database.py`,
  `service/clipper/storage/test_open_database.py`,
  `service/clipper/selection/selection_records.py`,
  `service/clipper/selection/selection_store.py`,
  `service/clipper/selection/test_selection_store.py`, `service/clipper/selection/__init__.py`,
  `service/clipper/projects/project.py`, `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/projects/project_schemas.py`, `service/clipper/projects/describe_project.py`,
  `service/clipper/projects/test_router.py`
  Done: a fourth migration adds tables for a project's windows, replay peaks and candidates,
  each row removed with its project, and a count of candidates on the project. A database made
  by M2 opens with its projects unchanged and a count of 0. The records hold what A71 lists; a
  candidate's total is worked out from its subscores. The store replaces a project's windows in
  one transaction, and replaces its candidates and peaks and sets the count in another. Read
  back, both equal what was written, windows in the order of their starts and candidates in the
  order of their ranks. Deleting the project leaves no row of the three tables. A project's JSON
  carries `candidateCount`.

- [ ] T5 — Pass one: score every window once and form the shortlist
  Files: `service/clipper/selection/transcript_part.py`,
  `service/clipper/selection/test_transcript_part.py`,
  `service/clipper/selection/score_windows.py`,
  `service/clipper/selection/test_score_windows.py`,
  `service/clipper/selection/form_shortlist.py`,
  `service/clipper/selection/test_form_shortlist.py`, `service/clipper/selection/__init__.py`,
  `fixtures/claude/talk/score.json`
  Done: the transcript part is one line for each sentence with its number, its start in seconds
  and its text, and is the same text every time for the same transcript. Pass one turns a
  project's windows into questions of at most 60 windows each, every window in one of them. The
  task is A64's with `task` `score`. The instructions ask D18's question in D18's words, tell the
  model to use the whole range from 0 to 100 and that most windows hold no clip, and ask for a
  whole number for each window by its name. The reply is checked as A65 says. The questions are
  asked one after another with the scoring model and medium effort, and a percent is reported
  after each. The shortlist follows A63. Tests: a made-up transcript of three hours gives
  questions whose windows together are every window once, with one system text and one
  transcript part for all; a video of 4, 10, 10.5, 35, 70, 71 and 180 minutes gives a shortlist
  of 3, 3, 4, 6, 9, 10 and 10; fewer windows than that are all taken; of two equal scores the
  earlier window is taken. Against the stand-in with the committed transcript and the `talk`
  scenario, one request scores the four windows and three are shortlisted. A recorded reply that
  leaves a window out, names one twice or names an unknown one is unreadable.

- [ ] T6 — Pass two: ask for clips in a window and place each quote
  Files: `service/clipper/selection/clip_limits.py`,
  `service/clipper/selection/test_clip_limits.py`, `service/clipper/selection/cut_clips.py`,
  `service/clipper/selection/test_cut_clips.py`, `service/clipper/selection/place_quote.py`,
  `service/clipper/selection/test_place_quote.py`, `service/clipper/selection/__init__.py`,
  `fixtures/claude/talk/cut-w01.json`, `fixtures/claude/talk/cut-w02.json`,
  `fixtures/claude/talk/cut-w03.json`
  Done: the limits of a clip are 15 to 30, 25 to 60 and 60 to 180 seconds for the three presets.
  The number of clips to ask for and to keep follows A69 from the choice in Settings and the
  video's length. The cut question for one window is A64's task with `task` `cut`, that window
  and the number asked for. Its instructions carry D19's rules, name intros, outros, sponsor
  reads and housekeeping as left out, give 25 to 50 seconds as preferred for the standard
  preset, forbid padding, ask for every title and description in the transcript's language, ask
  for a hook title of at most ten words that names something the clip holds, and ask for the
  opening and the closing words quoted exactly and for no time. The reply is a list of clips,
  none allowed. A clip has its opening words, its closing words, four subscores from 0 to 25, a
  reason of one sentence, a title, a hook title, one of the seven hook types, no flag or one of
  the two with its sentence, and a title and a description for each of the three platforms. The
  limits of A65 are part of the reply's model. Placing a clip follows A67 and returns the first
  and last sentence with the times, or nothing. The three recorded cut replies answer for the
  talk's shortlisted windows. Between them they hold the six parts of the talk as clips inside
  the standard preset; one more clip that overlaps another by more than half with a lower total;
  one whose opening words are not in the transcript; one longer than 60 seconds; one flagged as
  needing context and one as not recommended; and two with equal totals, one of which T8's
  graph will mark. Tests with made-up words: quoted words are found whatever their case and
  punctuation; words quoted from the middle of sentences give the whole sentences; words that
  also occur before the window are found inside it; opening words that are not in the window
  give nothing; closing words that come only before the opening words give nothing. Against the
  stand-in, each of the three recorded replies is read, and every clip in them but the one with
  the absent quote is placed in the committed transcript.

- [ ] T7 — Choose the candidates: length, overlap, rank and count
  Files: `service/clipper/selection/choose_candidates.py`,
  `service/clipper/selection/test_choose_candidates.py`, `service/clipper/selection/__init__.py`
  Done: from the placed clips of every window, a clip shorter or longer than the preset is
  dropped, one exactly on an edge is kept, and none is lengthened or shortened. The rest are
  ranked as A69 says. Going down the ranking, a clip that overlaps a kept one by more than half
  of the shorter of the two is dropped. The best ones up to the number to keep become the
  candidates, with ranks from 1 and their totals. Tests with made-up clips cover each rule, a
  pair that overlaps by exactly half and is kept, thirteen clips on Auto that become twelve, a
  fixed target of 4 that keeps the best four, and no clip that gives no candidate. With the
  placed clips of the three recorded replies the candidates are the talk's six parts.

- [ ] T8 — Keep the replay graph, find its peaks and mark the candidates
  Files: `service/clipper/storage/data_folder.py`, `service/clipper/storage/test_data_folder.py`,
  `service/clipper/fetching/read_replay_graph.py`,
  `service/clipper/fetching/test_read_replay_graph.py`,
  `service/clipper/fetching/download_link.py`, `service/clipper/fetching/test_download_link.py`,
  `service/clipper/fetching/fetch_stage.py`, `service/clipper/fetching/test_fetch_stage.py`,
  `service/clipper/fetching/__init__.py`,
  `service/clipper/selection/replay_peaks.py`, `service/clipper/selection/test_replay_peaks.py`,
  `service/clipper/selection/choose_candidates.py`,
  `service/clipper/selection/test_choose_candidates.py`, `service/clipper/selection/__init__.py`,
  `fixtures/talk-replay-graph.json`
  Done: the data folder knows where a project's replay graph is kept. A downloaded link gives
  back the `heatmap` of its metadata, or nothing, and the fetch step writes it as
  `replay-graph.json`, under another name first, and writes no file when there is none. A fetch
  that is run again removes the graph an earlier attempt left. The peaks of a graph follow A70.
  A candidate that shares at least one second with a peak carries the marker, and the marker
  breaks a tie of totals without changing a total. `fixtures/talk-replay-graph.json` is 100
  points over the talk's length: a high first point, one peak over the talk's fourth part and a
  low level elsewhere. Tests: the graph is read from a made-up info of the shape of the
  Findings, and a missing or empty one gives nothing; the fetch step stores a graph handed to it
  by a stand-in for the download and stores none for the fixture server's link; the high first
  point is no peak; a flat graph has no peak; two points side by side form one peak; a clip
  that only touches a peak carries no marker. With the recorded graph, of the two recorded clips
  with equal totals the one under the peak carries the marker and ranks first, and without the
  graph the earlier one ranks first.

- [ ] T9 — Let a failure point to Settings
  Files: `service/clipper/storage/open_database.py`,
  `service/clipper/storage/test_open_database.py`, `service/clipper/projects/project.py`,
  `service/clipper/projects/project_queue.py`, `service/clipper/projects/test_project_queue.py`,
  `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/projects/project_schemas.py`, `service/clipper/projects/describe_project.py`,
  `service/clipper/projects/test_router.py`, `service/clipper/pipeline/pipeline_stage.py`,
  `service/clipper/pipeline/explain_failure.py`,
  `service/clipper/pipeline/test_explain_failure.py`, `service/clipper/pipeline/run_queue.py`,
  `service/clipper/pipeline/test_run_queue.py`
  Done: a stage's stated failure can carry the mark of A66. The queue stores the mark with the
  halt, a fifth migration adds it, and a database made before it opens with its projects
  unchanged and unmarked. Putting a project back into the queue clears the mark with the reason.
  A stop, a full disk and every failure without the mark store none. A project's JSON gives the
  mark as `opensSettings` beside the reason. Tests with stand-in stages: a marked failure is
  stored and shown marked; Retry clears it; a failure that states only its reason is unmarked.

- [ ] T10 — Build the score step and the cut step
  Files: `service/clipper/selection/selection_reasons.py`,
  `service/clipper/selection/test_selection_reasons.py`,
  `service/clipper/selection/score_stage.py`, `service/clipper/selection/test_score_stage.py`,
  `service/clipper/selection/cut_stage.py`, `service/clipper/selection/test_cut_stage.py`,
  `service/clipper/selection/conftest.py`, `service/clipper/selection/__init__.py`,
  `service/clipper/projects/project_queue.py`, `service/clipper/projects/test_project_queue.py`,
  `fixtures/claude/unreadable-cuts/cut.json`
  Done: the queue's records can give a step a label without touching its state or its percent.
  The named errors of T1 become the sentences of A65 with the marks of A66. The score step
  stands for the `score` step and rests `transcribed`. It reads the key first, and with none it
  fails with the missing-key sentence, marked, and sends nothing. It reads the stored
  transcript, splits it, labels its step "Scoring N windows", runs pass one with the scoring
  model chosen in Settings, and stores the windows with their scores and the shortlist. The cut
  step stands for the `cut` step and rests `ready`. It reads the key the same way, asks pass two
  for each stored shortlisted window in the order of their starts with the cutting model chosen
  in Settings and high effort, reports a percent after each, places the clips, reads the
  project's replay graph when it has one, chooses the candidates and stores them with the peaks
  and the count. With no candidate it fails with A65's sentence. Both pass the project's brief,
  its clip length and the transcript's language. A stop ends either step within two seconds as a
  stop. Tests run both steps through the queue's worker, with the stand-in, a key file of their
  own and the committed transcript, on projects whose first two steps are done. With `talk` the
  project rests `ready` after one score request and three cut requests, with the six candidates,
  the count 6, the label "Scoring 4 windows" and no peak. With the recorded graph in its folder
  the peak is stored and the candidate under it carries the marker. With no key it fails marked
  after no request, and with a key saved Retry finishes it. `unreadable` fails the score step
  after three requests with its sentence and stores no window. `unreadable-once` ahead of `talk`
  rests `ready`.
  `unreadable-cuts` ahead of `talk` fails the cut step with the windows stored, and a Retry
  against `talk` sends cut requests only. `declined` and `rejected-key` fail marked with their
  sentences, and a closed port with its own. With Haiku 4.5 chosen for scoring, the score
  request names it and carries no effort and no fallback. A brief given with the project is in
  every request. A fixed target of 4 keeps four candidates. Under `/slow/` a stop leaves the
  project stopped at its step in under two seconds, and Resume finishes it. Deleting a ready
  project leaves no window and no candidate. With every logger at DEBUG no record of a whole run
  holds the key.

- [ ] T11 — Serve a project's selection
  Files: `service/clipper/selection/selection_schemas.py`, `service/clipper/selection/router.py`,
  `service/clipper/selection/test_router.py`, `service/clipper/selection/__init__.py`,
  `service/clipper/main.py`
  Done: `GET /api/projects/<id>/selection` answers in the form of A71, with the limits of the
  project's clip length. A project with nothing stored answers with three empty lists, and an
  unknown project with the 404 of the other project addresses. Tests write records through the
  store and read them through the address: every field of A71 is there under its name, a
  candidate without a flag gives none, and the lists keep their order.

- [ ] T12 — Save the key in Settings, show it masked and remove it
  Files: `web/src/settings/change-settings/lib/setting-options.ts`,
  `web/src/settings/change-settings/lib/setting-options.test.ts`,
  `web/src/settings/change-settings/api/save-api-key.ts`,
  `web/src/settings/change-settings/api/remove-api-key.ts`,
  `web/src/settings/change-settings/hooks/use-settings.ts`,
  `web/src/settings/change-settings/components/ApiKeyRow.tsx`,
  `web/src/settings/change-settings/components/AiServicesSection.tsx`,
  `web/src/settings/change-settings/components/SettingsScreen.tsx`, `web/e2e/settings.spec.ts`
  Done: the key row follows the prototype's markup and A60's wording. With no key saved it is
  the field with Save switched on. Save with nothing typed shows "Paste the key first." and
  sends nothing. Save sends the key, empties the field, shows "Key saved on this Mac", and the
  row becomes "Saved · ends in" with the four characters and Remove. Remove shows "Key removed"
  and brings the field back. A refusal from the service is shown as it is worded. The page keeps
  the typed key only until it is sent. `settings.spec.ts` drives the row at 390 px: Save is
  enabled; the three messages; the saved row after a reload; and the key removed again when the
  test ends, whatever its result. A unit test covers the sentence of the saved row.

- [ ] T13 — Show Open Settings on a failure and the candidates of a ready project
  Files: `web/src/library/library.types.ts`,
  `web/src/library/list-projects/lib/describe-row-status.ts`,
  `web/src/library/list-projects/lib/describe-row-status.test.ts`,
  `web/src/library/list-projects/lib/projects-store.test.ts`,
  `web/src/project/follow-progress/lib/describe-status.ts`,
  `web/src/project/follow-progress/lib/describe-status.test.ts`,
  `web/src/project/follow-progress/components/HaltActions.tsx`,
  `web/src/project/follow-progress/components/StatusCard.tsx`,
  `web/src/project/open-project/components/ProjectTabs.tsx`,
  `web/e2e/support/status-screen.ts`
  Done: the web app knows a project's `candidateCount` and its halt's `opensSettings`. The card
  of a marked failure shows "Open Settings" after Retry, a link to `/settings` in the prototype's markup,
  and the card of any other failure shows Retry alone. The row of a ready project reads "Ready
  to review · N candidates", with "1 candidate" for one, and the subtitle of its screen gives
  the same number in place of the constant. Unit tests cover the marked and the unmarked card
  and the row with 0, 1 and 6 candidates. The browser tests' reading of the status card also
  gives the card's links.

- [ ] T14 — Describe the end of a run without a key once in the browser tests
  Files: `web/e2e/support/keyless-end.ts`, `web/e2e/support/resting-state.ts`,
  `web/e2e/support/index.ts`, `web/e2e/support/wait-for-step.ts`,
  `web/e2e/support/seed-projects.ts`, `web/e2e/support/walk-screens.ts`,
  `web/e2e/addresses.spec.ts`, `web/e2e/delete-project.spec.ts`, `web/e2e/halt-project.spec.ts`,
  `web/e2e/import-link.spec.ts`, `web/e2e/import-upload.spec.ts`, `web/e2e/library.spec.ts`,
  `web/e2e/model-download.spec.ts`, `web/e2e/queue.spec.ts`,
  `web/e2e/queue-through-tool.spec.ts`, `web/e2e/restart.spec.ts`, `web/e2e/text-size.spec.ts`,
  `web/e2e/transcribe.spec.ts`, `web/e2e/transcribe-restart.spec.ts`
  Done: `keyless-end.ts` replaces `resting-state.ts`, which is removed. It describes where a
  project ends in a run that saved no key: the state, the row's status and bar label, the card's
  heading, stage line, footnote, buttons, links, bar and warning, the states of the four steps,
  and the files in the project's folder. It still describes the transcribed rest. Every browser
  test that waits for that end or reads it takes it from there, and the seeded project and its
  screen are named after it. A test that waits for the end on the status card waits for the
  card's stage line, which no other state of that project shares. The three tests whose subject
  is transcription wait for the transcribe step to be done, asked from the service, and read
  the steps' kinds and states from the service instead of the resting card. No spec names the
  transcribed rest itself. `pnpm test` exits 0.

- [ ] T15 — Hand the queue the score and cut steps
  Files: `service/clipper/main.py`, `service/clipper/test_main.py`,
  `service/clipper/transcription/test_whole_app.py`,
  `service/clipper/selection/test_whole_app.py`, `service/clipper/selection/conftest.py`,
  `web/e2e/support/keyless-end.ts`
  Done: the service hands the queue the fetch, download, transcribe, score and cut steps, with
  the key store, the address of A57 and the selection store. The tests of the transcription
  package that start the whole app wait for the transcribe step to be done and find the project
  failed for the missing key, marked. New tests take an uploaded talk through the whole app with
  a key file of their own and the stand-in: it rests `ready` with `candidateCount` 6, its
  `selection` has every field of A71, and the words transcribed in the run are the words of the
  committed transcript. A project that rested `transcribed` under the
  earlier version is scored and cut after the start. The description of the end without a key
  now says: failed; "Could not finish" in the row with no bar; the card headed "Could Not
  Finish" with the missing-key sentence, no footnote, Retry, the link "Open Settings", no bar
  and the warning; the first two steps done; and `preview.mp4`, `source.mp4` and
  `transcript.json` in the folder. `pnpm test` exits 0.

- [ ] T16 — Browser tests: with a key the talk reaches Ready, and the evidence is saved
  Files: `web/e2e/support/serve-recorded-claude.ts`, `web/e2e/support/saved-key.ts`,
  `web/e2e/support/tool-test.ts`, `web/e2e/support/run-tool.ts`,
  `web/e2e/support/read-selection.ts`, `web/e2e/support/index.ts`, `web/e2e/selection.spec.ts`,
  `docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/talk-selection.json`,
  `docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/selection-requests.json`
  Done: a browser test run starts the stand-in on `fixtures/claude` for the life of the worker
  and gives the tool its `talk` scenario as `CLIPPER_ANTHROPIC_SOURCE` at every start, also when
  a test stops and starts the tool. A test can read and clear the stand-in's requests, and can
  ask for a saved key, which is saved through the service before the test and removed after it.
  In `selection.spec.ts`, at 390 px, the talk is uploaded through the sheet with the brief of
  A73 and no key saved. Its card shows "Could Not Finish", the missing-key sentence, Retry and
  "Open Settings", and the stand-in has received nothing. "Open Settings" leads to Settings,
  where the key is typed and saved. Back on the project, Retry ends on its Review tab at
  `/projects/<id>/review`, with the subtitle giving 6 candidates, and its Library row reads
  "Ready to review · 6 candidates". The test saves the two files of A73 into
  `CLIPPER_EVIDENCE_DIR` when that is set and into the test output otherwise, and removes the
  key when it ends, whatever its result. A second test, with a saved key, takes a link to the
  talk to ready and finds six candidates and no peak in its selection. The evidence files are
  saved with the command of validation block V4 and committed.

- [ ] T17 — Browser tests: the two steps on screen, Stop and Resume, a restart, and the key
  Files: `web/e2e/selection-progress.spec.ts`, `web/e2e/api-key.spec.ts`,
  `web/e2e/support/run-tool.ts`, `web/e2e/support/index.ts`
  Done: `selection-progress.spec.ts` starts the tool with the stand-in's `/slow/talk` and a
  saved key, and starts it as it found it afterwards. A link to the talk shows, in its Library
  row, "Scoring 4 windows" and then "Cutting clips" over bar values that never fall, and ends at
  "Ready to review · 6 candidates". On its status screen the two steps read "Step 3 of 4." and
  "Step 4 of 4." under "Finding Clips". Stop during the score step leaves "Stopped" with
  "Stopped at “Scoring 4 windows”. The stages before it are kept.", and Resume ends on the
  Review tab. In a second test the tool is stopped while the cut step runs and started again:
  the Library lists one project, it reaches ready, and its selection has the six candidates.
  `api-key.spec.ts` saves a key on the Settings screen, takes a link to the talk to ready with
  it, opens the Library, the project's three tabs and Settings, and asks the service for the
  settings, the projects, the project and its selection. No answer the page or the test
  received holds the key, nothing the tool has printed since its start holds it, the key file of
  the run holds it with mode 600, and every request the stand-in kept came with a key. After
  Remove the file is gone and the row is the field again. A test can read what the tool printed.

- [ ] T18 — Fit the new states on a phone at 200%
  Files: `web/e2e/support/selection-screens.ts`, `web/e2e/support/walk-screens.ts`,
  `web/e2e/support/seed-projects.ts`, `web/e2e/support/index.ts`, `web/e2e/text-size.spec.ts`,
  `web/e2e/own-origin.spec.ts`, `web/src/shared/styles/app.css`
  Done: the walk of screens shows these states more, presented to the page from the held list
  where the tool cannot be made to rest in them: the score step running under "Scoring 180
  windows"; the cut step running; a project failed with the declined sentence, the longest of
  A65, and "Open Settings"; the Library with those three and a ready row reading "Ready to
  review · 12 candidates"; and Settings with a saved key, saved through the service and removed
  when the walk ends. The seeded project that ended without a key already shows the missing-key
  card. At 390 px, at the normal text size and at 200%, none scrolls sideways and none cuts a
  label. A rule that a state needs goes into `app.css`, and the copied stylesheets stay as they
  are. `own-origin.spec.ts` walks the same screens.

- [ ] T19 — Bring the README, the fixtures' notes and the agents' instructions up to date
  Files: `README.md`, `AGENTS.md`, `fixtures/README.md`
  Done: `README.md` says how to save the API key in Settings and where it is kept; that
  selection sends the transcript, and no audio or video, to Anthropic and is the tool's one
  running cost; which model each pass uses by default; what `CLIPPER_ANTHROPIC_SOURCE` and
  `CLIPPER_KEY_FILE` set, in the table of variables; that the tests save no key and reach a
  stand-in on the Mac in place of the API; how long `pnpm test` takes now, as measured; and what
  this version does not do yet, which begins after "Ready to review": the candidates are stored
  and the Review tab does not list them yet. `fixtures/README.md` describes the committed
  transcript, the replay graph, the scenarios of recorded replies, the form of a recorded reply
  and the stand-in's addresses. `AGENTS.md` names the selection package and the direction of its
  imports; the stand-in and how the service's tests and the browser tests reach it; the test
  key and why it is short; the key file the service's tests name; the new variable; and that
  selection requests go through the async client so a stop can cancel them. Each command in the
  three files was run as written.
