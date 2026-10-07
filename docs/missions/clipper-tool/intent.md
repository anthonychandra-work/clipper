# Intent: Clipper, a personal tool that turns long talking-head videos into reviewed vertical clips

Slug: clipper-tool
Status: ready

## Goals

One person makes short clips from long spoken videos: podcasts, interviews, talks. Today that means
paying a subscription service that meters by credits, or watching the whole video and cutting by
hand.

When this mission is done, the user opens Clipper in a browser on their Mac or their phone, pastes a
video link or uploads a file, and gets ranked clip candidates, each with the reason it was picked.
They keep or reject each one, adjust where it starts and ends, and download captioned vertical
videos with a title and description for TikTok, Reels and Shorts. Everything except the clip
selection runs on the Mac. The only running cost is the Claude API usage for selection.

## Decisions

Who and where

- D1 — One user. No login, no accounts.
- D2 — The tool runs on the user's Mac: Apple M1 Pro, 16 GB RAM, macOS 14, about 24 GB of free
  disk.
- D3 — The interface is one responsive web app. The user opens it in a desktop browser on the Mac
  and in a phone browser on the same Wi-Fi. The phone needs one address: the browser talks only to
  the web app, and the web app passes requests to the processing service.
- D4 — The web app listens on port 3000 on the local network. Nothing is exposed to the internet.

The reference

- D5 — The prototype in `docs/prototype/`, published at
  https://claude.ai/artifact/Eaih2pczU5YB6CaF2WGMqx, is the reference for screens, flows, wording
  and visual style, at phone and desktop width, in light and in dark. The app reproduces every
  screen, every control and every state in it: the Library, the new project sheet, the status
  screen of a project that is not ready, the project view with Review, Export and Results tabs,
  and Settings. Earlier prototypes exist only in the git history and are not references.
- D6 — Where the prototype pretends, the app does the real thing. The prototype's sample projects
  and clips, timed progress bars, staged failures, drawn figures in place of video and of
  filmstrip frames, and messages in place of downloads are stand-ins.

Content and input

- D7 — The first content type is spoken video with people on camera. Gameplay, streams and video
  without speech are out.
- D8 — Any language the transcription model handles. Titles, hook titles and descriptions are
  written in the language of the transcript. The interface is in English.
- D9 — A project starts from a video link or an uploaded file. Links go through yt-dlp, capped at
  1080p. Uploads up to 4 GB show upload progress. Sources up to 3 hours long are supported.

Pipeline

- D10 — Four stages run in order: fetch, transcribe, score windows, cut clips. Each stage's state
  and progress are stored and shown in the Library, and they survive a restart of the tool.
- D11 — A failed stage shows a plain-language reason and a Retry control that reruns that stage
  only.
- D12 — One project is processed at a time. Others wait in a queue in the order they were created.
- D13 — Fetch also makes a browser-playable copy of the source for the preview: H.264 video with
  AAC audio at 720p.

Transcription

- D14 — Transcription runs on the Mac with a Whisper model and stores a start and end time for
  every word. No audio leaves the machine.
- D15 — The default model is large-v3-turbo. Settings also offers medium and small. A model is
  downloaded the first time it is used, with progress shown.
- D16 — A source with no recognisable speech fails the transcribe stage with a reason that says so.

Selection

- D17 — Selection uses Claude through the Anthropic API, in two passes over the transcript.
- D18 — Pass one splits the transcript into windows of about 90 seconds with 30 seconds of overlap,
  cut on sentence boundaries. It scores every window from 0 to 100 on one question: would the
  opening two seconds hold a viewer who has no context. The top windows form a shortlist of 3 to
  10, growing with the length of the video.
- D19 — Pass two cuts clips inside the shortlisted windows. A clip opens on its hook, makes sense
  to someone who has seen nothing else, completes its setup and payoff, and starts and ends on
  sentence boundaries. Intros, outros, sponsor reads and housekeeping are excluded.
- D20 — The model never supplies timestamps. It quotes the transcript, and the tool finds the quote
  in the word-level transcript and takes the times from there. A quote that cannot be found is
  dropped.
- D21 — Each candidate carries: start and end; four subscores from 0 to 25 for hook, arc, value
  and share, and their total; a one-sentence reason; a hook title of at most 10 words; a hook
  type; a title and description for each of TikTok, Reels and Shorts; and at most one flag, either
  "needs context" or "not recommended".
- D22 — When two candidates overlap by more than half of the shorter one, the lower-scoring one is
  dropped.
- D23 — Clip length presets: 15–30 s, 25–60 s and 60–180 s. The default is 25–60 s, with 25–50 s
  preferred. The preset is a hard limit for selection. Inside it, the clip's own arc decides the
  length; a clip is never padded to reach a target.
- D24 — Clip count on the Auto setting: at least 4 candidates for a source of 10 minutes or longer
  when the material holds them, at least 2 for a shorter one, and at most 12. Settings also offers
  fixed targets of 4, 8 and 12.
- D25 — Scores rank clips inside one video. The interface says so wherever a score appears and
  never presents a score as a forecast of views.
- D26 — When a link's metadata includes a most-replayed graph, candidates that overlap its peaks
  show a "Replay peak" marker, and the marker breaks ties in the ranking. It does not change the
  score.
- D27 — Default models: Claude Sonnet 5.5 (`claude-sonnet-5-5`) scores windows and Claude Opus 5.5
  (`claude-opus-5-5`) cuts clips. Settings offers Fable 5.1 (`claude-fable-5-1`), Opus 5.5,
  Sonnet 5.5 and Haiku 4.5 (`claude-haiku-4-5`) for each pass. Clip selection needs no other
  outside service.
- D28 — The optional "what to look for" text from the new project form is passed to both selection
  passes.
- D29 — The API key is entered in Settings and stored in a file on the Mac outside the repository.
  After saving it is shown masked. It is never sent back to the browser and never written to a
  log.
- D30 — Without a saved key, the score stage fails with a reason that points to Settings.

Review

- D31 — Each candidate is kept, rejected or left undecided. A rejection takes an optional reason:
  cut off mid-thought, not interesting, needs earlier context, or repeats another clip. Reject
  opens a menu of the four reasons and "No Reason"; the menu of a rejected clip also offers "Undo
  Reject". The title is editable.
- D32 — The in point and the out point each move by one transcript sentence, or by 0.2 seconds up
  to one second either way. Controls at their limit are disabled. A "needs context" flag clears
  when the in point moves earlier than where selection put it.
- D33 — The preview plays the source footage for the clip's range inside a 9:16 frame, with the
  chosen framing, the captions and the hook title drawn by the page. It is an approximation. The
  rendered file is the reference.
- D34 — On a phone the Review tab shows the candidate list first. Opening a clip shows its detail
  with a bar fixed to the bottom of the screen holding Reject, Keep and Next.

Look and export

- D35 — Framing, caption style and the hook title switch apply to the whole project.
- D36 — Three framings: follow the speaker, where the crop tracks the face with smoothed movement
  and falls back to a centred crop when no face is found; stack two, with two people one above the
  other; and whole frame, the full picture centred over a blurred copy of itself.
- D37 — Three caption styles, timed from the word-level transcript and burned into the export:
  keyword (up to three words at a time, in capitals, one word highlighted), word by word, and
  plain (up to six words). The hook title shows for the first 3 seconds when switched on.
  Platform safe-zone guides appear in the preview only.
- D38 — Exports are 1080 × 1920, 30 frames per second, H.264 video with AAC audio, in an MP4 file.
  Kept clips render one at a time in a queue with progress. Each finished file downloads from the
  browser, including on the phone.

Results and learning

- D39 — For each exported clip the user enters its views seven days after posting. The Results tab
  shows the clips in order of views against the tool's ranking.
- D40 — Before each selection the tool writes a short note from the user's history: the count of
  rejections by reason over the last 50 decisions and, for clips with logged views, the hook types
  and lengths of the best and worst third. The note goes into both selection passes. "Forget all
  of it" in Settings clears the history the note is built from.

Storage

- D41 — One data folder holds sources, preview copies, transcripts, exports and the database. Git
  ignores it.
- D42 — Sources and preview copies are deleted a set number of days after import: 7 by default,
  with 3, 30 and never as options. Exports stay until the user deletes the project. A project whose
  source is gone still opens and still offers its exports; it cannot render new clips, and the
  Export tab says why.
- D43 — Settings shows the Mac's real free disk space and the address to open on the phone.

How it is built

- D44 — The web app is Next.js with TypeScript and React. The processing service is Python 3.12
  with FastAPI. Records live in SQLite, and only the processing service writes them. One worker
  takes projects from the queue; there is no separate queue service. yt-dlp is a project
  dependency, not a system install. Docker is not used, because a container on a Mac cannot use
  the machine's graphics hardware for transcription.
- D45 — Python 3.12 is at `/opt/homebrew/bin/python3.12`. Node 22 and pnpm 10 are installed.
  Python packages install into a virtual environment inside the project with pip, at pinned
  versions.
- D46 — One command starts the whole tool. One command runs every test: the service tests with
  pytest, the web app's unit tests with Vitest, the browser tests with Playwright, the type
  checks and the linters. A README gives setup, start, test and phone-access instructions, and a
  short instructions file for coding agents names the same commands.
- D47 — Tests use fixtures made on the Mac: speech from the macOS speech synthesiser over a
  generated picture, plus one public-domain portrait photograph with its source and licence
  recorded beside it. Recorded model responses stand in for Claude. Tests transcribe with the
  smallest Whisper model.
- D48 — No check depends on an API key, on YouTube, or on a download larger than the smallest
  Whisper model. The user runs the first live video after the mission ends.

Design and states

- D49 — The app's colours, type sizes, control sizes and component styles are the prototype's.
  Its stylesheets start as copies of the prototype's and change only where real content requires
  it. The app uses no CSS framework and no ready-made component library, because each brings a
  look of its own and the prototype's styles are already written. Unstyled parts that supply only
  behaviour, such as keyboard handling and focus for a menu or a dialog, are allowed.
- D50 — The layout follows the width of the window. Below 720 px: a tab bar, screens that push
  with a back control, and a bottom toolbar. From 720 px: a sidebar and a toolbar, with the
  sidebar laid over the content below 1000 px. Light and dark follow the system setting.
- D51 — Every project, every project tab and every clip has its own address. A reload returns to
  the same place, and the browser's Back and Forward move between them. On a phone, Back from a
  clip returns to the list at the position it was left.
- D52 — The in point and the out point are also set by dragging handles on a filmstrip. A handle
  snaps to sentence boundaries. The filmstrip shows frames from the source video, made when the
  clip is cut.
- D53 — A project that is uploading, waiting, processing, failed or stopped opens to a status
  screen in place of the tabs. A running project offers Stop. A stopped project keeps its
  finished stages and offers Resume, which reruns the stopped stage.
- D54 — An upload starts when the project is created and runs while other projects are processed.
  The browser must stay open until it finishes, and the status screen says so. The project then
  joins the queue.
- D55 — While clips render, Cancel stops every clip that has not finished. Finished files stay.
- D56 — A project whose source is gone shows a notice in place of the preview on the Review tab.
- D57 — Text stays usable when enlarged to 200%: no screen scrolls sideways and no label is cut
  off. On touch layouts every control has a tap area of at least 44 px. Text and its background
  differ by at least 4.5 to 1, in light and in dark.
- D58 — On a phone the clip preview stays pinned in a small strip under the top bar while the
  rest of the clip screen scrolls.

Stack details

- D59 — Media work uses ffmpeg and ffprobe. The tool takes them from
  `/opt/homebrew/opt/ffmpeg-full/bin`, where version 8.1 is installed and working, and from the
  PATH when that folder does not hold them. At start it checks that both run and stops with a
  plain message naming what is missing. The `ffmpeg` on the PATH of this Mac does not start, and
  Homebrew has no ready-made packages for macOS 14, so the run installs and updates neither.
- D60 — Captions and the hook title in exported files are drawn by the processing service as
  images and laid over the video, so the export needs no subtitle or text support in ffmpeg. The
  preview and the export use one typeface, Inter, stored in the repository with its SIL Open Font
  License. It replaces the system font the prototype uses for captions and the hook title.
- D61 — Transcription uses mlx-whisper, which runs Whisper on the Mac's graphics hardware and
  returns a start and an end time for every word.
- D62 — Selection calls go through Anthropic's official Python SDK. Replies are requested as
  structured output and checked against a schema. Requests set no temperature and force no tool
  call, because the current models reject both. An effort setting goes only to models that accept
  one; Haiku 4.5 does not. Where the chosen model supports it, requests opt into the API's
  server-side fallback, and a request that still ends declined fails the stage with a plain
  reason. Requests in one pass that share the transcript send it as a cached prefix.
- D63 — "Follow the speaker" finds faces with OpenCV and the YuNet face detector, whose model
  file is stored in the repository with its licence, and follows the largest face. It does not
  work out who is speaking. "Stack two" uses the two largest faces and falls back to "follow the
  speaker" when it finds fewer than two.
- D64 — The web app forwards requests to the processing service through the rewrites in its
  configuration. It has no proxy or middleware file, because that file cuts off request bodies
  over 10 MB. The browser learns of progress by asking once a second.

Deleting and disk space

- D65 — Every project screen has a "More" menu with "Delete Project". A confirmation names the
  project and says what is removed. Deleting removes the project's source, preview copy,
  transcript, candidates, exports and records. A project that is running is stopped first. What
  the project added to the history in D40 stays.
- D66 — With no projects, the Library shows an empty state with a "New Project" control. A first
  start shows this.
- D67 — A new project is refused when the disk has less than 5 GB free. The new project sheet
  shows the reason under the source field, with the free space and the advice to delete a project
  or free space. A stage that runs out of disk space fails with a reason that says so.

## Scope

In: the web app, the processing service, the storage layout, the tests and fixtures, and the README
described above.

Out, each left for a later mission:

- Accounts, billing and use by more than one person.
- Posting or scheduling to TikTok, Instagram or YouTube.
- B-roll, dubbing, sound effects and background music.
- Gameplay, streams, live-chat signals and video without speech.
- Hosting on a server and access from outside the local network.
- Picking clips with a model that runs on the Mac.

## Milestones

### M1 — A running tool with a library and import

Outcome: one command starts the tool. The Library, the new project sheet, the status screen, the
project view and Settings exist as laid out in the prototype, on phone and desktop, each at its
own address. A project created from an upload or a link is fetched, given a preview copy, and
listed with its real length and its stage progress, all stored. Projects wait their turn, and a
project can be stopped, resumed and retried.

Done when:

- The start command brings the tool up, and the Library opens at the address it prints.
- Started with a setting that points at a folder without ffmpeg, the tool stops with a message
  that names ffmpeg.
- Uploading the fixture video creates a project whose row shows the fetch stage progressing and
  then complete, with the fixture's real length.
- A link to the same file, served by a local test server, does the same.
- After the tool is stopped and started again, both projects are listed in the same state.
- A link that is not a link, a missing file, and no platform selected each show the error under
  its field, as the prototype does, and move focus to that field.
- With no projects, the Library shows the empty state from D66, and its control opens the new
  project sheet.
- Deleting a project after confirming removes it from the Library and removes its files from the
  data folder. Cancelling the confirmation removes nothing.
- With free space reported as under 5 GB, creating a project is refused with the reason from D67.
- A second project created while the first is being fetched shows as waiting and starts when the
  first finishes.
- A link the test server answers with "not found" fails the fetch stage with a reason and a Retry
  control. Stop during a fetch leaves the project stopped, and Resume finishes it.
- An upload shows its progress, and a 50 MB upload arrives at the same size it was sent.
- Opening a project, reloading the page and pressing Back each land where D51 says.
- At 390 px the Library is a list above a tab bar and the new project form opens as a sheet. At
  1360 px the projects are in a sidebar and the sheet is centred. Screen captures at both widths,
  in light and in dark, are saved.
- At 390 px no screen scrolls sideways and no label is cut off, at the normal text size and at
  200%.
- The test command passes.

### M2 — Transcripts made on the Mac

Outcome: the transcribe stage produces a word-level transcript for every project, with progress in
the Library and the model choice in Settings.

Done when:

- The fixture project reaches the transcribed state.
- Every word in the stored transcript has a start and an end, the times never go backwards, and
  all of them fall inside the video's length.
- The transcript matches the fixture's script with at most 15 words wrong in every 100.
- A silent fixture fails the stage with the reason from D16, and Retry reruns that stage alone.
- The first project to use a model that is not on the Mac shows the download as its own step
  before transcription.
- Stopping the tool during transcription and starting it again leaves one project, which finishes
  the stage.
- The test command passes.

### M3 — Ranked clip candidates

Outcome: the score and cut stages turn a transcript into ranked candidates with every field in D21.
Window scores and replay peaks are stored for the Review tab.

Done when:

- Every check below runs on recorded model responses.
- The fixture project reaches the ready state with candidates that carry every field in D21.
- Every candidate starts on the first word of a transcript sentence and ends on the last word of
  one.
- No candidate is shorter or longer than the chosen length preset.
- No two candidates overlap by more than half of the shorter one.
- A recorded response that quotes text absent from the transcript loses that clip and keeps the
  others.
- A malformed response is retried twice, and the stage then fails with a readable reason.
- The request for pass one contains every window once, and the shortlist size follows D18.
- Every selection request names a model identifier from D27, sets no temperature, forces no tool
  call, and carries an effort setting only for a model that accepts one.
- With a recorded replay graph, the candidates that overlap its peaks carry the marker.
- With no key saved, the score stage fails with the reason from D30.
- A saved key appears in no response to the browser and in no log line.
- The test command passes.

### M4 — The review workbench

Outcome: the Review tab works on real data: the source timeline with window scores and clip
markers, the filtered candidate list, the preview playing source footage with captions, and the
inspector with scores, reason, flags, boundary editing, title and decision. Every change is stored.

Done when:

- Every check below runs as a browser test on the fixture project.
- Selecting a candidate shows its reason, its four subscores, its total and its rank.
- The sentence controls move the in point and the out point by one transcript sentence, and the
  length shown changes to match.
- The 0.2-second controls stop at one second either way, and every control at its limit is
  disabled.
- The length reading states whether the clip is inside the preferred band, inside the limits, too
  short or too long.
- A kept clip, a rejected clip with its reason, and an edited title are all still there after a
  reload, and the counts in the list filters and in the Library row match.
- Play moves through the clip and stops at the out point, and the caption shown at a given moment
  is the words spoken at that moment.
- At 390 px the candidate list shows first; opening a clip shows the detail with the fixed bar of
  Reject, Keep and Next; the back control returns to the list.
- Reject opens the menu from D31. Choosing a reason marks the clip rejected with that reason, and
  "Undo Reject" clears it.
- The filmstrip shows frames from the fixture video. Dragging a handle moves that point to a
  sentence boundary, and the times and the length shown change to match.
- Each tab and each clip opens at its own address, and a reload returns to it.
- At 390 px, scrolling the clip screen past the preview pins it under the top bar, and it still
  plays.
- On the Review tab at 390 px no screen scrolls sideways and no label is cut off at 200% text
  size, and no control has a tap area under 44 px.
- Screen captures at 390 px and 1360 px, in light and in dark, are saved.
- The test command passes.

### M5 — Rendered clips and export

Outcome: the Export tab renders kept clips into finished vertical videos and offers each file and
its platform text.

Done when:

- Rendering the kept fixture clips produces files that ffprobe reports as 1080 × 1920, 30 frames
  per second, H.264 with AAC, each within 0.1 seconds of its clip's length.
- With the hook title on, a frame at 1 second shows the title and a frame at 4 seconds does not.
  Both frames show captions. The frames are saved as evidence.
- Each of the three framings gives a different picture for the same clip, saved as evidence.
- With the portrait fixture, the follow-speaker framing keeps the face inside the frame. With a
  fixture that has no face, the crop is centred.
- The queue shows progress for each clip and is intact after a reload. A render that fails shows
  its reason and a Retry control.
- Cancel during rendering stops the clips not yet finished and leaves the finished files in place.
- Download returns the finished file, marked as a video attachment.
- Each Copy control puts that platform's text on the clipboard.
- The test command passes.

### M6 — Results, learning, settings and storage care

Outcome: the Results tab stores views and compares them with the ranking. Rejection reasons and
results shape later selections. Every Settings control works, and old sources are cleaned up.

Done when:

- Views entered on the Results tab are still there after a reload, and for a seeded set the order
  and the summary sentence are correct.
- After clips are rejected with reasons and views are logged, the selection request for a new
  project contains the note from D40. After "Forget all of it", it does not.
- Changed model choices appear in the next selection request, and a changed default clip length is
  preselected in the new project form.
- The free disk figure is within 1 GB of what the system reports.
- Deleting a project that has exports removes its export files.
- A source older than the retention setting is removed by the cleanup. Its project still opens,
  the Review tab shows the notice from D56, the Export tab states that the source is gone, and
  its exports are untouched.
- Settings shows an address made of the Mac's local network address and port 3000, and the tool
  answers a request sent to that address.
- The README's setup, start, test and phone instructions work when followed from a fresh copy of
  the repository.
- The test command passes.

## Boundaries

- Leave `.researches/` and `docs/prototype/` as they are. The app copies from the prototype and
  loads nothing from `docs/`.
- Commit no key, no video, no model weights and no database. The data folder and any file holding
  secrets are ignored by git.
- The tool contacts three things only: the video source the user pasted, the Whisper model
  download, and the Anthropic API. No analytics and no telemetry.
- Tests call neither the live Anthropic API nor YouTube.
- Copy no code from the open-source clippers studied in `.researches/`; several carry the AGPL
  licence. Do not use Remotion, whose licence charges companies.
- Libraries built into the app carry permissive licences such as MIT, BSD or Apache-2.0.
- Install nothing system-wide. Beyond Python 3.12, Node 22, pnpm and Homebrew ffmpeg, everything
  the project needs installs inside the project.
- No Docker.
- Fixtures committed to the repository stay under 20 MB in total. Data the tests create stays
  under 2 GB and is removed when the tests finish.
- The tool listens on the local network only. Add no tunnel and no public address.
