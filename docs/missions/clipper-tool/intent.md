# Intent: Clipper, a personal tool that turns long talking-head videos into reviewed vertical clips

Slug: clipper-tool
Status: draft

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
- D2 — The tool runs on the user's Mac: Apple M1 Pro, 16 GB RAM, macOS, about 29 GB of free disk.
- D3 — The interface is one responsive web app. The user opens it in a desktop browser on the Mac
  and in a phone browser on the same Wi-Fi. The phone needs one address: the browser talks only to
  the web app, and the web app passes requests to the processing service.
- D4 — The web app listens on port 3000 on the local network. Nothing is exposed to the internet.

The reference

- D5 — The prototype in `docs/prototype/`, published at
  https://claude.ai/artifact/DfY7Fq2sPvbHH5pWnqP6CJ, is the reference for screens, flows, wording
  and visual style. The app reproduces every screen and every control in it: Library with the new
  project form, the project view with Review, Export and Results tabs, and Settings.
- D6 — Where the prototype pretends, the app does the real thing. The prototype's sample clips,
  timed progress bars, drawn figures in place of video, and messages in place of downloads are
  stand-ins.

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
  Sonnet 5.5 and Haiku 4.5 (`claude-haiku-4-5-20251001`) for each pass.
- D28 — The optional "what to look for" text from the new project form is passed to both selection
  passes.
- D29 — The API key is entered in Settings and stored in a file on the Mac outside the repository.
  After saving it is shown masked. It is never sent back to the browser and never written to a
  log.
- D30 — Without a saved key, the score stage fails with a reason that points to Settings.

Review

- D31 — Each candidate is kept, rejected or left undecided. A rejection takes an optional reason:
  cut off mid-thought, not interesting, needs earlier context, or repeats another clip. The title
  is editable.
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
  with 3, 30 and never as options. Exports stay until the user deletes them. A project whose
  source is gone still opens and still offers its exports; it cannot render new clips, and the
  Export tab says why.
- D43 — Settings shows the Mac's real free disk space and the address to open on the phone.

How it is built

- D44 — The web app is Next.js with TypeScript. The processing service is Python 3.12 with
  FastAPI. Records live in SQLite. Media work uses ffmpeg and ffprobe from Homebrew. yt-dlp is a
  project dependency, not a system install. Docker is not used, because a container on a Mac
  cannot use the machine's graphics hardware for transcription.
- D45 — Python 3.12 is at `/opt/homebrew/bin/python3.12`. Node 22 and pnpm 10 are installed.
- D46 — One command starts the whole tool. One command runs every test. A README gives setup,
  start, test and phone-access instructions.
- D47 — Tests use fixtures made on the Mac: speech from the macOS speech synthesiser over a
  generated picture, plus one public-domain portrait photograph with its source and licence
  recorded beside it. Recorded model responses stand in for Claude. Tests transcribe with the
  smallest Whisper model.
- D48 — No check depends on an API key, on YouTube, or on a download larger than the smallest
  Whisper model. The user runs the first live video after the mission ends.

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

Outcome: one command starts the tool. The Library, the new project form, the project view and
Settings exist as laid out in the prototype, on phone and desktop. A project created from an upload
or a link is fetched, given a preview copy, and listed with its real length and its stage progress,
all stored.

Done when:

- The start command brings the tool up, and the Library opens at the address it prints.
- Uploading the fixture video creates a project whose row shows the fetch stage progressing and
  then complete, with the fixture's real length.
- A link to the same file, served by a local test server, does the same.
- After the tool is stopped and started again, both projects are listed in the same state.
- A link that is not a link, a missing file, and no platform selected each show the inline error
  the prototype shows.
- At 390 px wide no screen scrolls sideways. At 1360 px the Library shows the form and the project
  list side by side. Screen captures at both widths are saved.
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
- Screen captures at 390 px and 1360 px are saved.
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
- A source older than the retention setting is removed by the cleanup. Its project still opens,
  the Export tab states that the source is gone, and its exports are untouched.
- Settings shows an address made of the Mac's local network address and port 3000, and the tool
  answers a request sent to that address.
- The README's setup, start, test and phone instructions work when followed from a fresh copy of
  the repository.
- The test command passes.

## Boundaries

- Leave `.researches/` and `docs/prototype/` as they are.
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
