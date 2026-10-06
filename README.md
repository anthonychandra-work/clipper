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

Picking clips sends the transcript of the video to Anthropic, and no audio and no video. It is
the one thing Clipper does that costs money: Anthropic bills the account of the key for it.

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
file is made yet, and the framings do not look for faces. "Speaker" fills the frame with the
middle of the picture, "Stacked" puts its left half above its right half, and "Full Frame" shows
all of it over a blurred copy.

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
twenty minutes.

```bash
pnpm test:browser e2e/start-command.spec.ts
```

This runs the named browser test files alone. Their paths are relative to `web`.

A test run starts its own copy of the tool on ports 3100 and 8865 and keeps its data in a
temporary folder, which it removes at the end. A Clipper that is running and the `data` folder
are left alone. The tests fetch nothing from a video site and call no paid service: they build
their test videos on the Mac from the system voice and ffmpeg. They transcribe with the smallest
Whisper model, which the run keeps under the default model's name, and a test that downloads a
model gets it from a server on the Mac.

The tests save no key of yours and do not read the file your key is kept in. Where a test needs
clips, it saves a made-up key into a file of the run, and the requests for clips go to a stand-in
on the Mac that answers in place of the Anthropic API with replies recorded for the test video.

## Where the data lives

Clipper keeps everything but the API key in the `data` folder inside the repository folder: one
database file, which also holds the clip candidates of every project, what you decided about each
and the project's look; one folder per project with the fetched video, its preview copy, its
transcript, the filmstrip frames of its clips and, for a link whose site gives one, the video's
most-replayed graph; and a `models` folder with the transcription models. Deleting a project in
Clipper removes its folder, its candidates and your decisions about them. Git ignores `data`.

A new project needs 5 GB free on the disk that holds the data folder. An uploaded file can be up
to 4 GB.

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

Three more variables serve test runs.

| Variable | What it sets | Without it |
| --- | --- | --- |
| `CLIPPER_WEB_BUILD_DIR` | The folder inside `web` that the web app is built into | `.next` |
| `CLIPPER_REPORTED_FREE_BYTES` | A free disk space figure that replaces the measured one | The measured figure |
| `CLIPPER_EVIDENCE_DIR` | The folder the tests save their evidence into | The test output folder |

## What this version does not do yet

A project ends with its review. Kept clips cannot be exported yet: the number on the Export tab
counts them, the tab itself still shows its empty screen, and the texts written for TikTok, Reels
and Shorts with each clip are stored and not shown. The results of posted clips are not recorded.
The reason of a rejection is stored, and it does not steer which clips are picked from the next
video yet.

The clip length and the note given with a new project steer which clips are picked. The platforms
chosen with it are stored for the export. In Settings, the API key, the two Claude models, the
transcription model and the clips per video take effect. The clip length chosen in Settings is not
yet the one a new project starts with, the days before source videos are deleted are stored and
nothing acts on them, and "Forget All of It" is switched off.
