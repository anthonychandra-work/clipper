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
`service/.venv`, installs the Python packages into it, and downloads the browser the tests drive
into `.cache/playwright`.

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
seven minutes.

```bash
pnpm test:browser e2e/start-command.spec.ts
```

This runs the named browser test files alone. Their paths are relative to `web`.

A test run starts its own copy of the tool on ports 3100 and 8865 and keeps its data in a
temporary folder, which it removes at the end. A Clipper that is running and the `data` folder
are left alone. The tests fetch nothing from a video site and call no paid service: they build a
four-minute test video on the Mac from the system voice and ffmpeg.

## Where the data lives

Clipper keeps everything in the `data` folder inside the repository folder: one database file,
and one folder per project with the fetched video and its preview copy. Deleting a project in
Clipper removes its folder. Git ignores `data`.

A new project needs 5 GB free on the disk that holds the data folder. An uploaded file can be up
to 4 GB.

## Settings read at start

Set a variable in front of the command:

```bash
CLIPPER_WEB_PORT=3001 pnpm start
```

| Variable | What it sets | Without it |
| --- | --- | --- |
| `CLIPPER_DATA_DIR` | The folder for the database and the projects | `data` in the repository folder |
| `CLIPPER_FFMPEG_DIR` | The folder that holds ffmpeg and ffprobe | `/opt/homebrew/opt/ffmpeg-full/bin` |
| `CLIPPER_KEY_FILE` | The file for the Anthropic API key, which this version does not use yet | `~/Library/Application Support/Clipper/anthropic-api-key` |
| `CLIPPER_WEB_PORT` | The port the web app listens on | 3000 |
| `CLIPPER_SERVICE_PORT` | The port the processing service listens on, reachable from the Mac only | 8765 |

A relative path in the first three counts from the folder the command was started in.

Three more variables serve test runs.

| Variable | What it sets | Without it |
| --- | --- | --- |
| `CLIPPER_WEB_BUILD_DIR` | The folder inside `web` that the web app is built into | `.next` |
| `CLIPPER_REPORTED_FREE_BYTES` | A free disk space figure that replaces the measured one | The measured figure |
| `CLIPPER_EVIDENCE_DIR` | The folder the screen capture test saves into | The test output folder |

## What this version does not do yet

A project stops at "Fetched", after the first of its four steps. Transcribing, scoring and cutting
come in later versions, so no project has clips yet and none reaches the view with the Review,
Export and Results tabs.

The clip length, the platforms and the note given with a new project are stored for those later
steps. In Settings, the six choices are stored and nothing acts on them yet, the API key cannot
be saved, and "Forget All of It" is switched off.
