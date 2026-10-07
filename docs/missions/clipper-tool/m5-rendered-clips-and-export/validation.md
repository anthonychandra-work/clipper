# Validation: m5-rendered-clips-and-export

Run every check from the worktree's root, in the order of the table. A check written as "block"
runs the commands under its heading below the table, with `bash`. Ports 3100 and 8865 must be free
before V1. The Mac must stay awake until the last check ends, because the browser tests time
their steps on the clock and wait for renders.

`pnpm test:browser <file>` prints one line per test. Such a check passes when the command exits 0
and the passed tests show everything its `expected` cell lists.

No check needs an API key. A browser check that renders makes a talk of its own from the fixture
talk with the recorded replies (A122). The checks that read saved evidence read the files V3 and
V17 save into this milestone's `evidence` folder.

| id | proves | check | expected |
| -- | ------ | ----- | -------- |
| V1 | "The test command passes"; one command runs every check (R9, R12) | block V1 | The last line gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. The Fixtures lines name four built videos, `portrait.mp4` among them. The closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `1663b2a` (M4's `proof.md`, V1), and only mission documents changed before this milestone's first commit, so no gate may fail. |
| V2 | Test data is removed and no tracked file changes (R56) | block V2 | `ls` reports that the folder does not exist. Every path `git status` lists is inside this milestone's folder. |
| V3 | "Rendering the kept fixture clips produces files that ffprobe reports as 1080 × 1920, 30 frames per second, H.264 with AAC, each within 0.1 seconds of its clip's length" (R49, A115, A122) | block V3 | The exit code of pytest is 0. `ls` lists `talk-exports.json`, two `talk-c01-at-` frames and three `framing-` frames. The last part prints one line for each rendered clip of the talk, at least two, the first of them `c01` at 32.76 seconds; every line ends in `as required`, and the list of clips that are not as required is `[]`. |
| V4 | "With the hook title on, a frame at 1 second shows the title and a frame at 4 seconds does not. Both frames show captions. The frames are saved as evidence."; "With a fixture that has no face, the crop is centred." (R47, R48, A113, A114) | block V4 | Both frames are 1080 x 1920. White where the hook title sits is 50% or more at 1s and 2% or less at 4s. White in the caption's band is 0.5% or more in both. The share of the band that differs between the two frames is 1% or more. Both lines end in `cyan, green, magenta`, the middle of the talk's colour bars. |
| V5 | The same two frames, seen (R48, A97, A113) | Open `talk-c01-at-1s.jpg` and `talk-c01-at-4s.jpg` from the evidence folder and record in the proof what each shows. | At 1 second: a white box with rounded corners near the top that reads "The oven broke before sunrise" in dark letters, and under the middle of the frame the caption "TELL YOU ABOUT" in white capitals with a dark shadow, over colour bars that fill the frame. At 4 seconds: no box, and the caption "HAD". No text is cut by an edge of the frame. |
| V6 | "Each of the three framings gives a different picture for the same clip, saved as evidence."; "With the portrait fixture, the follow-speaker framing keeps the face inside the frame." (R47, A114, A121) | block V6 | Three frames of 1080 x 1920. `follow-speaker` has one face, whole, its middle between 0.33 and 0.67 across. `stack-two` has two whole faces, the first with its middle above 0.5 down and narrower than the second, whose middle is below 0.5 down. `whole-frame` has two whole faces, both with their middles between 0.3 and 0.7 down. Each of the three comparisons gives a difference of 10 or more. |
| V7 | The same three frames, seen (R47) | Open the three `framing-` frames from the evidence folder and record in the proof what each shows. | Speaker: the large portrait fills the frame, its face in the middle. Stacked: the small, mirrored portrait in the upper half and the large one in the lower half, each face near the middle of its half. Full Frame: the whole picture with both portraits across the middle of the frame, over a blurred copy of it above and below. Each carries the same caption. |
| V8 | The framings' rules beyond the three frames: the face followed while it moves, the centred crop without a face, and the fall back from two faces (R47, A112, A114) | the output of V3, saved in `v3-render-tests.txt` | Among the passed tests: one face found in the portrait and none in a plain picture; two faces in every moment of the portrait video and none in the talk; a crop that follows a moving face between the moments around it; the middle of the picture when no moment has a face; a part kept inside the picture at its edge; a crop that stays with its face when another is 5% larger; the stacked layout with the left face above from two faces in half of the moments, and the Speaker layout with fewer; the face whole in the Speaker frame at one, three and five seconds of the portrait clip; the Stacked framing of the talk giving the Speaker picture. |
| V9 | "The queue shows progress for each clip and is intact after a reload."; the Export tab at its address with the output and the kept clips; "Download returns the finished file, marked as a video attachment." (R3, R46, R49, R53, A116, A117, A120) | `pnpm test:browser e2e/export-tab.spec.ts` | A talk with no kept clip shows "No Kept Clips". With two clips kept the tab shows the look's sentence, "1080 × 1920, 30 fps, H.264 MP4" and a group for each clip with its title, its file line and "Not rendered"; a look changed on the Review tab changes the sentence. With both queued, the first row reads "Rendering" with a bar whose value rises and the second "Waiting"; after a reload each row shows the state the service holds for it at that moment, the first with a value no lower than before the reload unless it has finished; both end in "Download MP4". The link saves a file named after the clip's title, ending in `.mp4`, from an answer that is `video/mp4` and marked as an attachment, and ffprobe reports the saved file as 1080 × 1920, 30 frames a second, H.264 with AAC, within 0.1 seconds of the row's length. With the source moved aside the tab shows "The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered." and the finished clip still downloads. |
| V10 | "A render that fails shows its reason and a Retry control." (A116, A120) | `pnpm test:browser e2e/export-retry.spec.ts` | With a file that is no video in the source's place, Render ends in a row that shows "This clip could not be rendered. Retry to render it again." and Retry. With the source back, Retry ends in "Download MP4". With the source moved aside, Render is switched off. |
| V11 | "Cancel during rendering stops the clips not yet finished and leaves the finished files in place." (R50, A116) | `pnpm test:browser e2e/export-cancel.spec.ts` | With three clips kept and rendering, Cancel pressed once the first has finished leaves the first row's "Download MP4", its file among the project's exports and no other file there, the second and third rows at "Not rendered", and the button at "Render 3 Clips". |
| V12 | Render from the tab, on the Mac and on the phone; the exported project in the Library (R3, R49, A119) | `pnpm test:browser e2e/export-render.spec.ts` | "Render 2 Clips" turns into "Rendering…", switched off, beside Cancel; each row shows a bar while it waits or renders; both end in "Download MP4" and the button reads "Render 2 Clips" again. The project's row then reads "Exported · 2 clips exported" with a tick, in the sidebar at 1360 px and in the Library at 390 px. At 390 px Render queues the clips from the top bar and "Download MP4" saves the file. |
| V13 | "Each Copy control puts that platform's text on the clipboard." (R31, A16, A118) | `pnpm test:browser e2e/export-copy.spec.ts` | A kept clip shows the six rows "TikTok title", "TikTok description", "Reels title", "Reels caption", "Shorts title" and "Shorts description" with the texts selection stored. Each of the six Copy controls leaves its row's text on the clipboard and shows "Copied". A project made for one platform shows that platform's two rows. With the clipboard interface taken from the page, as at the Mac's network address, Copy still leaves the text on the clipboard. |
| V14 | The service's rules for rendering, the queue and the export, by test name (R20, R46 to R50, A113 to A120) | block V14 | The last line gives exit code 0. Among the passed tests of this block and of V3's saved output: the installed OpenCV without FFmpeg, without a built-in font and without bundled libraries; a clip file of the three layouts at 1080 × 1920 and 30 frames a second from sources at 25 and at 60; a source stored on its side rendered as it plays; an overlay in the frames between its two moments and in none outside them; the hook title over the first three seconds and never with its switch off; captions of the three styles in their sizes and places, a wrapped caption and a long word kept inside the box, and a text in a script Inter lacks; the oldest render taken first across two projects and never two at once; the percent stored while a clip renders; the three reasons of a failed render, with the next clip still rendered; a cancel that leaves a finished render, removes a waiting one and ends the running one; a clip that is no longer kept left out; a render interrupted by a stop finished after the next start; the export's answer with only the kept clips and only the chosen platforms; queueing refused with the source gone; the file answered as `video/mp4` and an attachment; a database made by M4 upgraded with its projects, candidates and reviews unchanged; a project reading `exported` with its count; a deleted project leaving no render and no export; a project without a transcript answering with no clips. |
| V15 | The web app's rules, by test name (A116 to A120) | `pnpm --dir web exec vitest run --reporter=verbose` | Exit 0. Passed tests show: the sentence of the look; a clip's file line; the Render button's words for one clip, for several and while rendering; what a row shows for each state of a render; asking for the export every second while a clip renders and no more afterwards; a refusal shown and the held export kept; the six text rows of three platforms and the two of one; the clipboard interface used when the page has one, the older copy command when it has none, and the blocked message when both fail; the row of an exported project with one clip and with several. |
| V16 | What M1 to M4 built still holds beside the Export tab (R6, R13 to R25, R39 to R45) | block V16 | The count is 153 or more. The closing line says that no test of these files failed. |
| V17 | The Export tab is captured at 390 px and 1360 px, in light and in dark (R3, A20, A122) | block V17 | The exit code is 0. The evidence folder holds four files named `export-<width>-<theme>.png`, for `390` and `1360`, in `light` and `dark`. |
| V18 | The Export tab reproduces the prototype's screen with the talk's own data, on phone and desktop, in light and in dark (R3, R5, A117 to A120) | Open every capture from V17 and record in the proof what each shows. | At 390: the project's title above the Review, Export and Results control, with 2 beside Export; a top bar with the More button and "Render 2 Clips"; "Output" with "Keyword captions, speaker framing, hook title on" and "1080 × 1920, 30 fps, H.264 MP4" and under them "Change the look on the Review tab."; a group headed "The worst day my bakery ever had" with `exports/01-c01.mp4 · 32.8 s` and "Download MP4"; a group headed "Hire for the habits you cannot teach" with `exports/02-c02.mp4 · 33.2 s` and "Not rendered"; in each group six labelled texts, each with Copy; the tab bar. At 1360: the sidebar, where the project's row reads "Exported · 1 clip exported"; a toolbar with the three tabs, the More button and "Render 2 Clips"; the same page beside it. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text. |
| V19 | On the Export tab at 390 px no screen scrolls sideways and no label is cut off at 200% text size, no control has a tap area under 44 px, and text differs from its background by 4.5 to 1 (R7) | `pnpm test:browser e2e/export-fit.spec.ts` | For the empty state, a talk with one clip finished and one not rendered, and an export presented with twelve clips in every state, long titles, a long reason and long descriptions under the notice of a missing source, at 390 px: at the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled to its end, a screen's last line lies above the tab bar; no control has a tap area under 44 px; in light and in dark no text measures under 4.5 to 1. At 1360 px the same screens meet the ratio in light and in dark. |
| V20 | This milestone's commits touch nothing the boundaries exclude, add only the two named packages, commit no video and no weights but the detector's model, and leave the copied stylesheets as the prototype's (R4, R8, R55, R56, R58, R59, A14) | block V20 | Nothing is printed before each of the three closing lines about changes. Seven lines say that a stylesheet is the prototype's. The lines added to the service's requirements are the ban on the ready-made OpenCV package, `opencv-python-headless==5.0.0.93` and `pillow==12.3.0`, with at most comment lines beside them, and no line is removed. The pinned build tools are `cmake`, `distro`, `packaging`, `pip`, `scikit-build`, `setuptools` and `wheel`. `data` and `.cache` are ignored. The one tracked video, audio, database or model file is `face_detection_yunet_2026may.onnx`. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`. |
| V21 | OpenCV is built without FFmpeg and carries permissive licences only; the detector's model and the portrait are stored with their licence and source (R47, R58, R12, A111, A112, A121) | block V21 | OpenCV is 5.0.0 and Pillow 12.3.0. The list of lines that name FFmpeg or the built-in font is `[]`. The disabled parts include `videoio`, and the parts compiled in are `libprotobuf libjpeg-turbo libpng zlib tegra_hal`. The folder of bundled libraries does not exist, and the list of libraries linked outside the system is `[]`. pip gives OpenCV's licence as Apache 2.0 and Pillow's as MIT-CMU. The model is 229738 bytes with the checksum `ebafce4e3c118d6554634be5c27ab333b4c047a9a8c3faf1d7cf93101c22f0f0`, and the licence beside it begins "MIT License" and names Shiqi Yu. `file` gives the portrait as JPEG image data of `600x774`, `ls` gives it as under 100,000 bytes, and the note beside it names Alexander Gardner, 1863, Wikimedia Commons and the public domain. |
| V22 | The Export tab and the renders ask for nothing outside the tool (R57) | block V22 | The export capability and the rendering package name no outside address. The exit code of the browser tests is 0, and their passed tests show the Export tab of a talk with a finished clip asking only the tool, at both widths. |
| V23 | The README and the agents' instructions cover what this milestone adds (R9, A18, A111) | block V23 | The README says what the Export tab does, that the first setup compiles OpenCV and how long it takes, and its section on what this version does not do yet begins after the export. `AGENTS.md` names the rendering package, the export capability, the OpenCV build with its guard test, the detector's model, the named crops, the render queue and the portrait video. |
| V24 | The code follows the standards the hooks enforce, and both recorded layouts name the new parts (A19) | block V24 | Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `rendering/`. The web app's layout lists `export/` with three use cases under it. No line of either starts with `#`. |
| V25 | The checks left the worktree clean | `git status --porcelain` | Every path listed is inside this milestone's folder. |

## Blocks

### V1

```bash
evidence="$PWD/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence"
mkdir -p "$evidence"
env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_BASE_URL pnpm test 2>&1 | tee "$evidence/v1-test-command.txt"
echo "exit code of pnpm test: ${PIPESTATUS[0]}"
```

### V2

```bash
ls "<the folder V1's closing lines named>"
git status --porcelain
```

### V3

```bash
evidence="$PWD/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence"
(cd service && CLIPPER_EVIDENCE_DIR="$evidence" .venv/bin/python -m pytest clipper/rendering -v) 2>&1 | tee "$evidence/v3-render-tests.txt"
echo "exit code of pytest: ${PIPESTATUS[0]}"
ls -l "$evidence/talk-exports.json" "$evidence"/talk-c01-at-*.jpg "$evidence"/framing-*.jpg
service/.venv/bin/python - "$evidence/talk-exports.json" <<'EOF'
import json
import sys

saved = json.load(open(sys.argv[1]))


def list_faults(clip):
    probe = clip["probe"]
    pictures = [stream for stream in probe["streams"] if stream["codec_type"] == "video"]
    sounds = [stream for stream in probe["streams"] if stream["codec_type"] == "audio"]
    if len(pictures) != 1 or len(sounds) != 1:
        return ["streams"]
    picture, sound = pictures[0], sounds[0]
    faults = []
    if picture["codec_name"] != "h264":
        faults.append("picture codec")
    if (picture["width"], picture["height"]) != (1080, 1920):
        faults.append("size")
    if picture["r_frame_rate"] != "30/1" or picture["avg_frame_rate"] != "30/1":
        faults.append("frame rate")
    if sound["codec_name"] != "aac":
        faults.append("sound codec")
    if "mp4" not in probe["format"]["format_name"].split(","):
        faults.append("container")
    if abs(float(probe["format"]["duration"]) - clip["seconds"]) > 0.1:
        faults.append("length")
    return faults


for clip in saved["clips"]:
    probe = clip["probe"]
    by_kind = {stream["codec_type"]: stream for stream in probe["streams"]}
    picture, sound = by_kind.get("video", {}), by_kind.get("audio", {})
    shown = (
        clip["id"],
        clip["seconds"],
        float(probe["format"]["duration"]),
        picture.get("codec_name"),
        picture.get("width"),
        picture.get("height"),
        picture.get("r_frame_rate"),
        sound.get("codec_name"),
    )
    print("%s: clip %.2f s, file %.3f s, %s %s x %s at %s, %s:" % shown, ", ".join(list_faults(clip)) or "as required")
print("clips rendered:", len(saved["clips"]))
print("clips that are not as required:", [clip["id"] for clip in saved["clips"] if list_faults(clip)])
EOF
```

### V4

```bash
service/.venv/bin/python - docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence <<'EOF'
import sys

import numpy as np
from PIL import Image

NAMED = {
    "cyan": (0, 191, 191),
    "green": (0, 191, 0),
    "magenta": (191, 0, 191),
    "yellow": (191, 191, 0),
    "red": (191, 0, 0),
    "blue": (0, 0, 191),
    "white": (255, 255, 255),
    "grey": (191, 191, 191),
    "black": (0, 0, 0),
}


def name_colour(pixel):
    return min(NAMED, key=lambda name: sum((int(seen) - wanted) ** 2 for seen, wanted in zip(pixel, NAMED[name])))


def read(moment):
    return np.asarray(Image.open(f"{sys.argv[1]}/talk-c01-at-{moment}.jpg").convert("RGB")).astype(int)


bands = {}
for moment in ("1s", "4s"):
    frame = read(moment)
    height, width = frame.shape[:2]
    white = frame.min(axis=2) >= 225
    title = white[int(0.105 * height):int(0.15 * height), int(0.12 * width):int(0.88 * width)]
    bands[moment] = white[int(0.60 * height):int(0.75 * height)]
    row = frame[int(0.30 * height)]
    colours = [name_colour(row[int(share * (width - 1))]) for share in (0.05, 0.5, 0.95)]
    shown = (moment, width, height, 100 * title.mean(), 100 * bands[moment].mean(), ", ".join(colours))
    print("at %s: %d x %d | white where the hook title sits: %.1f%% | white in the caption's band: %.2f%% | 30%% down, left to right: %s" % shown)
print("share of the caption's band that differs between the two frames: %.2f%%" % (100 * (bands["1s"] != bands["4s"]).mean()))
EOF
```

### V6

```bash
model=$(git ls-files 'service/clipper/rendering/*.onnx')
service/.venv/bin/python - docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence "$model" <<'EOF'
import itertools
import sys

import cv2
import numpy as np

cv2.utils.logging.setLogLevel(cv2.utils.logging.LOG_LEVEL_ERROR)
FRAMINGS = ("follow-speaker", "stack-two", "whole-frame")
SEARCHED = (270, 480)
frames = {name: cv2.imread(f"{sys.argv[1]}/framing-{name}.jpg") for name in FRAMINGS}
detector = cv2.FaceDetectorYN.create(sys.argv[2], "", SEARCHED, 0.6, 0.3, 5000)
for name, frame in frames.items():
    found = detector.detect(cv2.resize(frame, SEARCHED))[1]
    faces = [] if found is None else sorted(found.tolist(), key=lambda face: face[1])
    shown = []
    for left, top, wide, high, *rest in faces:
        is_whole = left >= 0 and top >= 0 and left + wide <= SEARCHED[0] and top + high <= SEARCHED[1]
        place = ((left + wide / 2) / SEARCHED[0], (top + high / 2) / SEARCHED[1], wide / SEARCHED[0])
        shown.append("middle %.2f across and %.2f down, %.2f wide, " % place + ("whole" if is_whole else "cut by the edge"))
    print("%s: %d x %d, %d face(s): %s" % (name, frame.shape[1], frame.shape[0], len(faces), "; ".join(shown)))
for first, second in itertools.combinations(FRAMINGS, 2):
    difference = np.abs(frames[first].astype(int) - frames[second].astype(int)).mean()
    print("%s against %s: the pixels differ by %.1f of 255 on average" % (first, second, difference))
EOF
```

### V14

```bash
evidence="$PWD/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence"
(cd service && .venv/bin/python -m pytest clipper/media clipper/storage clipper/projects clipper/pipeline clipper/review clipper/test_main.py -v) 2>&1 | tee "$evidence/v14-service-tests.txt"
echo "exit code of pytest: ${PIPESTATUS[0]}"
grep -c "PASSED" "$evidence/v3-render-tests.txt"
grep -E "FAILED|ERROR" "$evidence/v3-render-tests.txt" || echo "no test of the rendering package failed"
```

### V16

```bash
saved=docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence/v1-test-command.txt
files='e2e/(addresses|api-key|captures|delete-project|empty-library|halt-project|import-link|import-upload|layout|library|low-disk|missing-ffmpeg|model-download|new-project-errors|no-speech|own-origin|queue|queue-through-tool|restart|review-captures|review-decide|review-fit|review-inspect|review-list|review-phone|review-preview|review-trim|selection|selection-progress|settings|shell|start-command|stop-order|text-size|transcribe|transcribe-restart|upload-parts|upload-size)\.spec\.ts'
grep -E "$files" "$saved" | grep -c '✓'
grep -E "$files" "$saved" | grep -v '✓' || echo "no test of these files failed"
```

### V17

```bash
evidence="$PWD/docs/missions/clipper-tool/m5-rendered-clips-and-export/evidence"
CLIPPER_EVIDENCE_DIR="$evidence" pnpm test:browser e2e/export-captures.spec.ts
echo "exit code of the browser tests: $?"
ls -l "$evidence"/export-*.png
```

### V20

```bash
git diff --stat 29cb7b1 HEAD -- .researches docs/prototype
echo "end of the changes to .researches and docs/prototype"
git diff --stat 29cb7b1 HEAD -- web/src/shared/styles/tokens.css web/src/shared/styles/base.css web/src/shared/styles/controls.css web/src/shared/styles/lists.css web/src/shared/styles/shell.css web/src/shared/styles/pages.css web/src/shared/styles/review.css web/src/shared/styles/player.css
echo "end of the changes to the copied stylesheets and the tokens"
git diff --stat 29cb7b1 HEAD -- package.json web/package.json pnpm-lock.yaml pnpm-workspace.yaml service/requirements-dev.txt
echo "end of the changes to the other package files"
for sheet in base controls lists shell pages review player; do
  cmp "docs/prototype/styles/$sheet.css" "web/src/shared/styles/$sheet.css" && echo "$sheet.css is the prototype's"
done
git diff 29cb7b1 HEAD -- service/requirements.txt | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) '
cat service/build-constraints.txt
git check-ignore -v data .cache
git ls-files | grep -iE '\.(mp4|mov|mkv|webm|m4v|avi|wav|aiff|pcm|mp3|m4a|sqlite|sqlite3|db|safetensors|npz|pt|gguf|onnx|bin)$'
git grep -nE 'sk-ant-[A-Za-z0-9_-]{20,}' || echo "no key is tracked"
du -sk fixtures
git diff --name-only 29cb7b1 HEAD | grep -vE '^(service|web|scripts|fixtures|docs/missions/clipper-tool)/|^(README|AGENTS)\.md$' || echo "every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md"
grep -rnE "docs/(prototype|missions)" web/src web/next.config.ts service/clipper scripts || echo "the app reads nothing from docs/"
```

### V21

```bash
service/.venv/bin/python - <<'EOF'
import pathlib
import subprocess

import cv2
import PIL

information = cv2.getBuildInformation().splitlines()
print("OpenCV", cv2.__version__, "| Pillow", PIL.__version__)
print("lines that name FFmpeg or the built-in font:", [line.strip() for line in information if "FFMPEG" in line.upper() or "Unicode font" in line])
print([line.strip() for line in information if "Disabled:" in line or "3rdparty dependencies" in line])
folder = pathlib.Path(cv2.__file__).parent
print("folder of bundled libraries exists:", (folder / ".dylibs").exists())
compiled = next(folder.glob("cv2*.so"))
linked = subprocess.run(["otool", "-L", str(compiled)], capture_output=True, text=True).stdout.splitlines()[1:]
print("libraries linked outside the system:", [line.split()[0] for line in linked if not line.split()[0].startswith(("/System/Library/", "/usr/lib/"))])
EOF
service/.venv/bin/python -m pip show opencv-python-headless pillow | grep -E "^(Name|Version|License|License-Expression):"
model=$(git ls-files 'service/clipper/rendering/*.onnx')
ls -l "$model"
shasum -a 256 "$model"
head -3 "$(dirname "$model")/LICENSE"
file fixtures/portrait.jpg
ls -l fixtures/portrait.jpg
grep -rniE "gardner|1863|wikimedia|public domain" fixtures --include='portrait*' --exclude='*.jpg'
```

### V22

```bash
grep -rnE "https?://" web/src/export service/clipper/rendering --include='*.ts' --include='*.tsx' --include='*.py' || echo "the export capability and the rendering package name no outside address"
pnpm test:browser e2e/own-origin.spec.ts
echo "exit code of the browser tests: $?"
```

### V23

```bash
grep -niE "export tab|render|download mp4|copy|compiles|does not do yet" README.md
grep -niE "rendering|export|opencv|yunet|crop|portrait|render queue" AGENTS.md
```

### V24

```bash
git diff --name-only --diff-filter=AM 29cb7b1 HEAD -- '*.ts' '*.tsx' '*.mjs' '*.py' | python3 /Users/work/.claude/skills/coding-standards/hooks/review-files.py --stdin | grep -vE -- '— clean|^$'
cat service/.coding-standards-structure web/.coding-standards-structure
```
