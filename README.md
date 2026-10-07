# Clipper

Clipper turns a long spoken video, such as a podcast, an interview or a talk, into short vertical
clips that you review before they are exported. It runs on your Mac, and you use it in a browser
on the Mac or on a phone on the same Wi-Fi.

## What the Mac needs

- Python 3.12 at `/opt/homebrew/bin/python3.12`
- Node 22 or newer
- pnpm 10 or newer
- Homebrew's ffmpeg and ffprobe in `/opt/homebrew/opt/ffmpeg-full/bin`

Clipper looks for ffmpeg and ffprobe in that folder first and on the `PATH` second. When neither
place holds both tools in working order, it says so and does not start.

Everything else installs inside the repository folder.

## Set up

Run both commands once, from the repository folder.

```bash
pnpm install
pnpm bootstrap
```

`pnpm install` installs the web app's packages. It warns that it ignored the build script of
`unrs-resolver`; that is intended. `pnpm bootstrap` creates a Python environment in
`service/.venv`, installs the Python packages into it, downloads the browser the tests drive
into `.cache/playwright`, and fetches the Whisper model the tests transcribe with, 74 MB, into
`.cache/whisper`.

The first `pnpm bootstrap` compiles OpenCV, the library that finds faces, with the compiler of
Apple's Command Line Tools, which Homebrew already requires. That takes about four minutes. A
later `pnpm bootstrap` compiles nothing and ends within seconds.

## Start

```bash
pnpm start
```

The first start builds the web app. A later start builds again only when the sources have
changed. When the tool is up, the command prints its address:

```
Clipper is running at http://localhost:3000
```

Open that address in a browser on the Mac. Ctrl-C stops the tool. A project that was waiting or
being processed carries on at the next start.

Next.js, which serves the web app, prints lines of its own just before Clipper's line. The same
address is among them, and so is a "Network" address, `http://0.0.0.0:3000`. Clipper's line is
the one that says the tool is up. The "Network" address is not the address for a phone.
Settings gives that address under "Open on Your Phone".

## The Anthropic API key

Clipper picks the clips with Claude through the Anthropic API, and for that it needs an API key
of yours.

Open Settings, paste the key into "Anthropic API Key" and press Save. Settings then shows "Saved"
with the last four characters of the key, and Remove deletes it. The key is kept in one file,
`~/Library/Application Support/Clipper/anthropic-api-key`, outside the repository folder, and only
your account on the Mac can read it. Clipper sends it to Anthropic with each request for clips.
It never sends the key back to the browser and never writes it to a log.

Without a saved key a project stops after its transcription with "No Anthropic API key is saved.
Add one in Settings, then retry." Save the key, go back to the project and press Retry.

Picking clips sends Anthropic the transcript of the video, what you asked the project to look
for, and a short note on your earlier decisions once there is one. It sends no audio and no
video. It is the one thing Clipper does that costs money: Anthropic bills the account of the key
for it.

Claude reads the transcript in two passes. Claude Sonnet 5.5 scores every stretch of about ninety
seconds, and Claude Opus 5.5 cuts the clips from the best of them. Settings offers Claude Fable
5.1, Opus 5.5, Sonnet 5.5 and Haiku 4.5 for each pass.

## Review the clips

A project that is ready opens on its Review tab, which lists the clip candidates by rank. A row
gives the clip's title, where it starts in the video, its length and its score out of 100. Four
filters show all the clips, the ones still to decide, the kept and the rejected. The score orders
the clips inside one video. It does not forecast views.

"Source Video" draws the video from its start to its end: a bar for each stretch of the
transcript that was scored, as high as its score, with the stretches that were searched for clips
highlighted, and a numbered pin where each clip sits.

Choosing a clip shows the reason it was picked, its four part scores and its rank, and a warning
when the clip needs context or is not recommended. Its title can be changed.

The preview plays the clip from the fetched video inside an upright 9:16 frame, with captions
timed to the spoken words. It is an approximation of the export, drawn by the browser: no clip
file is made for it, and its framings do not look for faces. In the preview "Speaker" fills the
frame with the middle of the picture, "Stacked" puts its left half above its right half, and
"Full Frame" shows all of it over a blurred copy. The export places the first two by the faces
it finds.

"Look" sets the caption style and the framing, and switches the hook title and the platform safe
zones on or off. The safe zones mark where a platform's buttons and captions cover the picture.
The look applies to every clip of the project.

"In and Out Points" moves the start and the end of a clip by one sentence of the transcript, or
by 0.2 seconds up to one second either way. Dragging a handle of the filmstrip moves a point to
another sentence. A point reaches up to three sentences beyond the clip as it was cut, and a
reading says whether the length is inside the limits chosen for the project.

Keep keeps a clip. Reject asks why first: the clip is cut off mid-thought, is not interesting,
needs earlier context or repeats another clip, or you give no reason. Next opens the next clip of
the filter.

Every change is stored as you make it. A reload, or the phone, shows the same decisions, titles,
points and look.

On a phone the list comes first and a clip opens as a screen of its own, with Reject, Keep and
Next in a bar at the bottom. Scrolling past the preview pins it under the top bar, where it goes
on playing.

## Export the clips

The Export tab lists the clips you kept, in the order of their ranks. The number beside the tab
counts them. "Output" gives the look the clips are rendered with and their format: 1080 × 1920,
30 frames a second, H.264 with AAC sound, in an MP4 file. The look is the one set on the Review
tab. With no kept clip the tab says so and links back to Review.

"Render 2 Clips", with the number of your kept clips, renders them one at a time. A row reads
"Waiting" and then "Rendering" beside a bar, and offers "Download MP4" when its file is finished.
A clip is cut from the fetched video between its in and out points. Its captions are burned into
the picture, and so is the hook title over the first three seconds when the look has it switched
on. Rendering goes on when you leave the tab, and it does not wait for another project that is
being transcribed. A clip that was being rendered when the tool stopped is rendered at the next
start.

For the framing, the render looks for faces in the clip five times a second:

- "Speaker" fills the frame with an upright part of the picture that follows the largest face.
  Without a face it shows the middle of the picture.
- "Stacked" shows two faces one above the other, the one further left above, when at least half
  of the clip shows two faces. A clip with fewer is rendered as "Speaker" renders it.
- "Full Frame" shows the whole picture over a blurred copy of itself, with faces or without.

The preview on the Review tab stays an approximation of these files.

Cancel stops the clip that is being rendered and takes the waiting clips out of the queue. Clips
that had finished keep their files. A clip that could not be rendered shows the reason and Retry,
which queues that clip again.

"Download MP4" saves a clip's file under its rank and title, as in
`01 The worst day my bakery ever had.mp4`. It is a link to the file, so the browser on the Mac
and the browser on a phone each save it as they save any file.

Under each clip are the title and the description written for every platform chosen with the
project: TikTok, Reels and Shorts. Copy puts one text on the clipboard, on the Mac and on a
phone. Clipper posts nothing. You upload a file to the platform yourself and paste its texts
there.

A finished file stays as it was rendered. After a change to the look or to a clip's in and out
points, press Render again: every kept clip is rendered anew, and a file is replaced only when
its new version is whole. The files are kept in the project's folder, under `exports`, and stay
there until you delete the project. In the Library a project with a finished clip reads
"Exported" with the number of its exported clips.

When the fetched video is no longer in the project's folder, the tab says so and switches Render
off. Finished clips still download.

## Log the results

The Results tab compares Clipper's ranking with how your clips did once they were posted. It
lists every clip of the project that has a finished file on the Mac, in the order of their
ranks. A clip you rejected after rendering it stays in the list. Before a clip is rendered the
tab reads "No Results Yet" and links to the Review tab, or to the Export tab once a clip is kept.

A week after you post a clip, type its views into its field under "Views After 7 Days". A number
is stored half a second after you stop typing and when you leave the field. An empty field or a
zero clears the clip's views.

"Ranking Against Outcome" waits for the views of two clips. It then lists the clips with views,
the most viewed first, each with a bar as long as its share of the highest views. The sentence
above them says where the best performer stood in Clipper's ranking, as in "The best performer
was the selector’s pick number 2. Ranks in order of views: 2, 1, 4." In the Library, a project
with logged views reads "Exported · 4 clips exported, results logged".

## What the selector learns

Clipper keeps a history of what you did with your clips. It holds each clip that stands kept or
rejected, with the reason of a rejection, and each clip with logged views, with its views, the
kind of hook it opens on and its length.

Before each of the two passes over a new video, Clipper writes a short note from that history
and sends it to Claude beside the transcript. The note counts the rejections of each reason
among your last 50 decisions, as in "Of the last 20 clips this user decided on, 6 were rejected:
3 cut off mid-thought, 2 not interesting, 1 needing earlier context, 0 repeating another clip."
Once three clips have views, a second line names the kinds of hook and the lengths of the best
third and of the worst third. Claude is told to let the note tip a close call and to put the
rules for a clip and what you asked the project to look for first. With no rejection and fewer
than three clips with views, no note is sent.

Settings shows the counted rejections under "What the Selector Has Learned". "Forget All of It"
empties the history, so the next video is picked without a note. It changes no project: clips
stay kept or rejected, and the Results tabs keep their views. A decision or a number of views
you change afterwards enters the history again. Deleting a project leaves what it added to the
history.

## Settings

A choice is stored when you make it and takes effect without a restart.

| Choice | What it governs | Takes effect |
| --- | --- | --- |
| Anthropic API Key | The key the requests for clips are sent with | At the next request for clips |
| Scoring Model | The Claude model that scores the stretches of the transcript | When the next video is scored |
| Cutting Model | The Claude model that cuts the clips | When the next video's clips are cut |
| Transcription Model | The Whisper model a video is transcribed with | When the next transcription starts |
| Clip Length | The length a new project starts with: 15–30 s, 25–60 s or 60–180 s | When the new project sheet is next opened |
| Clips per Video | How many clips a video should yield: Auto, 4, 8 or 12 | When the next video's clips are cut |
| Delete Source Videos After | The days a finished project keeps its fetched video: 3, 7, 30 or Never | At the next cleanup, within an hour |

"Storage" gives the free space of the disk that holds the data folder, as the Mac counts it for
your account. It is the figure `df` prints, in gigabytes of 1024³ bytes, rounded down. Finder
also counts space that macOS can purge, so its figure can be larger.

## Open it on a phone

Put the phone on the same Wi-Fi as the Mac. In Clipper on the Mac, open Settings and read the
address under "Open on Your Phone". It is the Mac's address on your network with the web port, in
the form `http://192.168.0.12:3000`. Type it into the phone's browser.

Clipper listens on your local network only and sets up no public address.

## Tests

```bash
pnpm test
```

This runs every check: the Python linter, type checker and tests, then the web linter, build, type
check and unit tests, then the browser tests. It prints each as passed or failed and takes about
46 minutes, of which the browser tests take 38.

Keep the Mac on mains power and awake until the run ends. The browser tests time their steps on
the clock and wait for clips to render, and a Mac on battery goes to sleep when its charge runs
low.

```bash
pnpm test:browser e2e/start-command.spec.ts
```

This runs the named browser test files alone. Their paths are relative to `web`.

A test run starts its own copy of the tool on ports 3100 and 8865 and keeps its data in a
temporary folder, which it removes at the end. A Clipper that is running and the `data` folder
are left alone. The tests fetch nothing from a video site and call no paid service: they build
their test videos on the Mac from the system voice, a public-domain portrait and ffmpeg. They
transcribe with the smallest Whisper model, which the run keeps under the default model's name,
and a test that downloads a model gets it from a server on the Mac. The tests that render clips
render them from those videos, and their files are removed with the run's folder.

The tests save no key of yours and do not read the file your key is kept in. Where a test needs
clips, it saves a made-up key into a file of the run, and the requests for clips go to a stand-in
on the Mac that answers in place of the Anthropic API with replies recorded for the test video.

## Where the data lives

Clipper keeps everything but the API key in the `data` folder inside the repository folder: one
database file, which also holds the clip candidates of every project, what you decided about
each, the views you logged, the project's look and the history the selector learns from; one
folder per project with the fetched video, its preview copy, its transcript, the filmstrip
frames of its clips, its exported clips in `exports` and, for a link whose site gives one, the
video's most-replayed graph; and a `models` folder with the transcription models. An exported
clip is `data/projects/<project>/exports/<rank>-<clip>.mp4`, as in `exports/01-c01.mp4`, the
path its row on the Export tab shows. Deleting a project in Clipper removes its folder with the
exported clips, its candidates, your decisions about them and their logged views. Git ignores
`data`.

A new project needs 5 GB free on the disk that holds the data folder. An uploaded file can be up
to 4 GB.

The fetched video and its preview copy are the large files of a project. Both are deleted after
the number of days chosen under "Delete Source Videos After" in Settings, counted from the day
the project was created, once the project is ready or exported and has no clip waiting or
rendering. The cleanup runs when Clipper starts and then once an hour. With "Never" it removes
nothing. A project that failed, was stopped or is still being processed keeps its video
whatever its age, because Retry and Resume need it. Delete such a project yourself.

The transcript, the filmstrip frames, the clip candidates, your decisions, the logged views and
the exported clips stay, and the project still opens. Its Review tab shows "Preview unavailable.
The source video was deleted to free space." in place of the preview, and its Export tab says
that new clips cannot be rendered and still offers the finished files.

## Transcription models

Clipper transcribes on the Mac with the Whisper model chosen in Settings. A model downloads from
Hugging Face the first time a project needs it, as a step of that project, and stays in
`data/models` for every project after it.

| Model | Download |
| --- | --- |
| Whisper large-v3-turbo, the default | 1.6 GB |
| Whisper medium | 1.5 GB |
| Whisper small | 0.5 GB |

A download that was stopped or cut off carries on from the bytes it already holds.

## Settings read at start

Set a variable in front of the command:

```bash
CLIPPER_WEB_PORT=3001 pnpm start
```

| Variable | What it sets | Without it |
| --- | --- | --- |
| `CLIPPER_DATA_DIR` | The folder for the database and the projects | `data` in the repository folder |
| `CLIPPER_FFMPEG_DIR` | The folder that holds ffmpeg and ffprobe | `/opt/homebrew/opt/ffmpeg-full/bin` |
| `CLIPPER_KEY_FILE` | The file the Anthropic API key is saved in | `~/Library/Application Support/Clipper/anthropic-api-key` |
| `CLIPPER_WEB_PORT` | The port the web app listens on | 3000 |
| `CLIPPER_SERVICE_PORT` | The port the processing service listens on, reachable from the Mac only | 8765 |
| `CLIPPER_MODEL_SOURCE` | The address the transcription models are downloaded from | `https://huggingface.co` |
| `CLIPPER_ANTHROPIC_SOURCE` | The address the requests for clips are sent to | `https://api.anthropic.com` |

A relative path in the first three counts from the folder the command was started in.

Clipper hands Anthropic's library the saved key and this address itself. A key, a token or an
address for Anthropic that is set in the shell is not used.

Four more variables serve test runs.

| Variable | What it sets | Without it |
| --- | --- | --- |
| `CLIPPER_WEB_BUILD_DIR` | The folder inside `web` that the web app is built into | `.next` |
| `CLIPPER_REPORTED_FREE_BYTES` | A free disk space figure that replaces the measured one | The measured figure |
| `CLIPPER_EVIDENCE_DIR` | The folder the tests save their evidence into | The test output folder |
| `CLIPPER_CLOCK_AHEAD_DAYS` | Days added to the clock that the cleanup of old source videos reads | 0 |

## What Clipper leaves out

- Accounts, billing and use by more than one person.
- Posting or scheduling to TikTok, Instagram or YouTube.
- B-roll, dubbing, sound effects and background music.
- Gameplay, streams, live-chat signals and video without speech.
- Hosting on a server and access from outside the local network.
- Picking clips with a model that runs on the Mac.
