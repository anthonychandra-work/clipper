# Validation: m2-transcripts-made-on-the-mac

Run every check from the worktree's root, in the order of the table. A check written as "block"
runs the commands under its heading below the table, with `bash`. Ports 3100, 8865, 3101 and 8866
must be free before V2. The Mac must be on a network, because V1 fetches packages and the test
model and V14 asks Hugging Face for six bytes. It must stay awake until the last check ends,
because the browser tests time their steps on the clock.

`pnpm test:browser <file>` prints one line per test. Such a check passes when the command exits 0
and the passed tests show everything its `expected` cell lists.

A test run transcribes with the smallest Whisper model, kept under the default model's name
(A41). A transcript made in a test run therefore names `large-v3-turbo`.

| id | proves | check | expected |
| -- | ------ | ----- | -------- |
| V1 | Setup installs the pinned packages inside the project, mlx-whisper among them and without the two left out, and puts the test model in the project's cache (A2, A39, A41, R8, R23, R59) | block V1 | Both commands exit 0. `pip` lists `mlx-whisper 0.4.3`. The next line reads that torch, requests and certifi are not installed. The cache folder holds `config.json` and a `weights.npz` of 74,418,182 bytes. |
| V2 | "The test command passes"; one command runs every check (R9, R12) | `pnpm test` | Exit 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `365b2dc`, and only documents changed before this milestone's first commit, so no gate may fail. |
| V3 | Test data is removed and no tracked file changes (R56) | block V3 | `ls` reports that the folder does not exist. `git status` prints nothing. |
| V4 | "The fixture project reaches the transcribed state"; the stage shows its progress in the Library and can be stopped and resumed (R15, R18, R23) | block V4 | The exit code is 0. The passed tests show: the uploaded talk reaches "Transcribed"; while the long talk is transcribed its Library row reads "Transcribing on this Mac" over two or more rising bar values; Stop leaves "Stopped" with a reason that names that step, and Resume ends at "Transcribed". `ls` shows `talk-transcript.json` in the evidence folder. |
| V5 | "Every word in the stored transcript has a start and an end, the times never go backwards, and all of them fall inside the video's length" (R23, A44) | block V5 | `status: transcribed`. A language. More than 500 words. `0` words without a start and an end, `0` times that go backwards, `0` times outside the video. The last word ends before the video does. |
| V6 | "The transcript matches the fixture's script with at most 15 words wrong in every 100" (R12) | block V6 | The script has 628 words. The last line gives a figure of 15.00 or less. |
| V7 | "A silent fixture fails the stage with the reason from D16, and Retry reruns that stage alone" (R17, R25, A45) | `pnpm test:browser e2e/no-speech.spec.ts` | The silent fixture's project shows "Could Not Finish", the sentence "No speech was recognised in this video. Clipper needs spoken words to find clips." and Retry, with its first step done. Retry runs the transcribe step again and ends on the same sentence. The first step stays done, and the source and the preview copy are not made again. |
| V8 | "The first project to use a model that is not on the Mac shows the download as its own step before transcription"; the model chosen in Settings is the one used; models are kept in the data folder and nothing is written under the home folder (R24, R59, A40, A42) | block V8 | The exit code is 0. The passed tests show: with "Whisper small" chosen and not on disk, the project's status screen reads "Downloading Whisper small" and "Step 2 of 5." before it reads "Transcribing on this Mac" and "Step 3 of 5."; the model's files are in `models/small` in the run's data folder; the stored transcript names `small`; a second project has four steps and shows no download. `find` prints nothing: no line stands between the exit code and the closing line about `~/.cache/huggingface`. |
| V9 | "Stopping the tool during transcription and starting it again leaves one project, which finishes the stage" (R15) | `pnpm test:browser e2e/transcribe-restart.spec.ts` | The tool is stopped while the transcribe step is running. After the start the Library lists one project. It reaches "Transcribed", and its folder holds the source, the preview copy and the transcript and nothing else. |
| V10 | Each stage's state is stored, shown in the Library and survives a restart; importing, the queue, Stop, Retry and Delete still hold now that a project goes on to transcription (R13, R15, R16, R17, R18, R20) | `pnpm test:browser e2e/restart.spec.ts e2e/queue.spec.ts e2e/queue-through-tool.spec.ts e2e/import-upload.spec.ts e2e/import-link.spec.ts e2e/halt-project.spec.ts e2e/delete-project.spec.ts` | After a stop and a start the uploaded project and the link project are both listed "Transcribed" with the same lengths. A second project waits while the first is processed. An imported project's row ends at "Transcribed" with the fixture's real length, after a bar that never falls. Retry and Resume still finish a fetch. Deleting a transcribed project removes its folder. |
| V11 | The states this milestone adds fit a phone: no sideways scroll and no cut label, at the normal text size and at 200% (R7) | `pnpm test:browser e2e/text-size.spec.ts` | At 390 px and at both sizes, with nothing misfitting: a transcribed project, a project downloading a model, a project being transcribed, a project failed for no speech and a project failed for a model download, on the status screen and in the Library row, beside the screens M1 measured. |
| V12 | The service's rules, by test name (R15, R17, R18, R23, R24, R25, A40, A42, A43, A44, A45, A46) | block V12 | Exit 0. Passed tests show: the talk's sound turned into words within 15 in 100 of the script, whole and in sixty-second parts, with times in order; silence giving no word without a model; the sound of a source taken out, and a source with no sound track named; the transcriber's percent never falling, and a stop ending it within two seconds; times put in order and inside the video's length, and no word raising no speech; the transcript file read back as written; the three models at their repositories and revisions; a download with a rising percent, carried on after a stop, with "not found" and a closed port reported; a step added ahead of another with its own label, without lowering the project's bar; a database from M1 upgraded; a resting project whose next step now exists put back in the queue at start; the talk resting transcribed with a stored transcript; the silent fixture failing with the no-speech sentence, and Retry running that step alone; the download step added for a model that is not on the Mac and not for one that is; the transcript naming the chosen model; a failed download reported with its sentence; an uploaded talk taken through the whole app to transcribed. |
| V13 | The web app's rules, by test name (A46) | `pnpm --dir web exec vitest run --reporter=verbose` | Exit 0. Passed tests show: the row of a transcribed project reading "Transcribed" with its bar; the status card headed "Transcribed" with "Step 2 of 4 is done." and "Not started: Scoring windows, Cutting clips."; "Step 3 of 5 is done." after a download; "Step 2 of 5." during one. |
| V14 | The default model is large-v3-turbo and Settings also offers medium and small: each exists at the fixed address the tool downloads from (R24, A40) | block V14 | Six lines, each ending in `206`. The three weights lines give totals of 1613977612, 1524924912 and 481307592 bytes. Then three lines, each saying that a revision is in the code. |
| V15 | Every version is pinned; libraries built into the app carry permissive licences, with tqdm as the one recorded exception; the web app gained no package (R8, R58, A39) | block V15 | `every requirement pinned`. The line `mlx-whisper==0.4.3`. Every licence shown is MIT, BSD, Apache-2.0, PSF, ISC, 0BSD, Zlib, CC0-1.0, CNRI-Python, Unlicense or the LLVM exception, alone or joined. One line shows MPL, and it is `tqdm`. None shows GPL, LGPL or AGPL. Nothing is printed before the closing line about the web app's packages. |
| V16 | No audio leaves the Mac: the service contacts nothing new but the model source, transcription needs no network, and the service itself does not load the model (R23, R57, A40, A43) | block V16 | Every line of the first search is in one file, the one that downloads a model. The second search shows the transcriber setting the Hugging Face client offline. The next line reads `loaded by the service: []`. Among the passed tests, one transcribes with the model in place and the model source closed. |
| V17 | This milestone's commits touch nothing the boundaries exclude (R4, R11, R55, R56) | block V17 | Nothing is printed before each of the two closing lines about changes. `data` and `.cache` are ignored. No video, audio, database or model file is tracked. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`. |
| V18 | The README and the agents' instructions cover what this milestone adds (R9, A18, A40, A41) | block V18 | Both files name `CLIPPER_MODEL_SOURCE`. The README says where the models and the transcripts are kept, that a model downloads the first time a project needs it, and that setup fetches the test model. `AGENTS.md` names the transcription package and says that packages are installed without following dependencies. |
| V19 | The code follows the standards the hooks enforce, and the service's recorded layout names the new package (A19) | block V19 | Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `transcription/`, and no line of it starts with `#`. |
| V20 | The checks left the worktree clean | `git status --porcelain` | Every path listed is inside this milestone's folder. |

## Blocks

### V1

```bash
pnpm install --frozen-lockfile
pnpm bootstrap
service/.venv/bin/python -m pip --disable-pip-version-check list 2>/dev/null | grep -iE '^(mlx-whisper|mlx|numpy) '
service/.venv/bin/python -m pip --disable-pip-version-check list 2>/dev/null | grep -iE '^(torch|requests|certifi) ' || echo "torch, requests and certifi are not installed"
ls -l .cache/whisper/tiny
```

### V3

```bash
ls "<the folder V2's closing lines named>"
git status --porcelain
```

### V4

```bash
evidence="$PWD/docs/missions/clipper-tool/m2-transcripts-made-on-the-mac/evidence"
CLIPPER_EVIDENCE_DIR="$evidence" pnpm test:browser e2e/transcribe.spec.ts
echo "exit code of the browser tests: $?"
ls -l "$evidence"
```

### V5

```bash
service/.venv/bin/python - docs/missions/clipper-tool/m2-transcripts-made-on-the-mac/evidence/talk-transcript.json <<'EOF'
import json
import sys

saved = json.load(open(sys.argv[1]))
words = saved["transcript"]["words"]
length = saved["durationSeconds"]
timed = [word for word in words if all(isinstance(word.get(edge), (int, float)) for edge in ("start", "end"))]
times = [time for word in timed for time in (word["start"], word["end"])]
print("status:", saved["status"])
print("language:", saved["transcript"]["language"])
print("words:", len(words))
print("words without a start and an end:", len(words) - len(timed))
print("times that go backwards:", sum(1 for earlier, later in zip(times, times[1:]) if later < earlier))
print("times outside the video:", sum(1 for time in times if time < 0 or time > length))
print("the last word ends at", times[-1], "of", length, "seconds")
EOF
```

### V6

```bash
service/.venv/bin/python - docs/missions/clipper-tool/m2-transcripts-made-on-the-mac/evidence/talk-transcript.json fixtures/talk-script.txt <<'EOF'
import json
import re
import sys


def split_words(text):
    return re.findall(r"[a-z0-9']+", text.lower().replace("’", "'"))


heard = split_words(" ".join(word["text"] for word in json.load(open(sys.argv[1]))["transcript"]["words"]))
spoken = split_words(open(sys.argv[2]).read())
row = list(range(len(heard) + 1))
for count, spoken_word in enumerate(spoken, 1):
    below = [count]
    for at, heard_word in enumerate(heard, 1):
        below.append(min(row[at] + 1, below[at - 1] + 1, row[at - 1] + (spoken_word != heard_word)))
    row = below
print("words in the script:", len(spoken))
print("words in the transcript:", len(heard))
print("words wrong:", row[-1])
print("words wrong in every 100: %.2f" % (100 * row[-1] / len(spoken)))
EOF
```

### V8

```bash
marker="$(mktemp)"
pnpm test:browser e2e/model-download.spec.ts
echo "exit code of the browser tests: $?"
find "$HOME/.cache/huggingface" -newer "$marker" 2>/dev/null
echo "end of the files written under ~/.cache/huggingface during the check"
rm -f "$marker"
```

### V12

```bash
(cd service && .venv/bin/python -m pytest clipper -v)
```

### V14

```bash
for address in \
  mlx-community/whisper-large-v3-turbo/resolve/a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb/config.json \
  mlx-community/whisper-large-v3-turbo/resolve/a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb/weights.safetensors \
  mlx-community/whisper-medium-mlx/resolve/7fc08c4eac4c316526498f147dfdee6f6303f975/config.json \
  mlx-community/whisper-medium-mlx/resolve/7fc08c4eac4c316526498f147dfdee6f6303f975/weights.npz \
  mlx-community/whisper-small-mlx/resolve/45f3915923c7a79a5a5b5a7d909d39aeb0e5630e/config.json \
  mlx-community/whisper-small-mlx/resolve/45f3915923c7a79a5a5b5a7d909d39aeb0e5630e/weights.npz; do
  printf '%s ' "$address"
  curl -sL -r 0-0 -o /dev/null -D - -w '%{http_code}\n' "https://huggingface.co/$address" | grep -iE '^content-range|^[0-9]{3}$' | tr '\r\n' '  '
  echo
done
for revision in a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb 7fc08c4eac4c316526498f147dfdee6f6303f975 45f3915923c7a79a5a5b5a7d909d39aeb0e5630e; do
  grep -rq --include='*.py' "$revision" service/clipper && echo "$revision is in the code" || echo "$revision is missing from the code"
done
```

### V15

```bash
grep -vE '^(#|-r |[[:space:]]*$)' service/requirements.txt service/requirements-dev.txt | grep -v '==' || echo "every requirement pinned"
grep -iE '^mlx-whisper==' service/requirements.txt
service/.venv/bin/python - <<'EOF'
import re
from importlib.metadata import metadata

lines = [line.strip() for line in open("service/requirements.txt")]
names = [re.split(r"[=\[ ]", line)[0] for line in lines if line and not line.startswith(("#", "-"))]
for name in names:
    found = metadata(name)
    classifiers = [entry.split(" :: ")[-1] for entry in (found.get_all("Classifier") or []) if entry.startswith("License")]
    first_line = ((found.get("License") or "").strip().splitlines() or [""])[0][:60]
    print(name, "|", found.get("License-Expression") or ", ".join(classifiers) or first_line)
EOF
git diff --stat e9f9b5e HEAD -- package.json web/package.json pnpm-lock.yaml pnpm-workspace.yaml
echo "end of the changes to the web app's packages"
```

### V16

```bash
grep -rnE --include='*.py' '^[[:space:]]*(import|from)[[:space:]]+(urllib\.request|urllib[[:space:]]+import|urllib3|http\.client|socket|httpx2|requests|huggingface_hub)' service/clipper/transcription service/clipper/media | grep -v '/test_'
grep -rn --include='*.py' 'HF_HUB_OFFLINE' service/clipper/transcription | grep -v '/test_'
(cd service && .venv/bin/python -c "import sys, clipper; print('loaded by the service:', [name for name in ('mlx', 'mlx_whisper', 'numpy', 'scipy', 'numba') if name in sys.modules])")
(cd service && .venv/bin/python -m pytest clipper/transcription -v)
```

### V17

```bash
git diff --stat e9f9b5e HEAD -- .researches docs/prototype
echo "end of the changes to .researches and docs/prototype"
git diff --stat e9f9b5e HEAD -- web/src/shared/styles/tokens.css web/src/shared/styles/base.css web/src/shared/styles/controls.css web/src/shared/styles/lists.css web/src/shared/styles/shell.css web/src/shared/styles/pages.css
echo "end of the changes to the copied stylesheets"
git check-ignore -v data .cache
git ls-files | grep -iE '\.(mp4|mov|mkv|webm|m4v|avi|wav|aiff|pcm|mp3|m4a|sqlite|sqlite3|db|safetensors|npz|pt|gguf|onnx|bin)$' || echo "no video, audio, database or model file is tracked"
git grep -nE 'sk-ant-[A-Za-z0-9_-]{20,}' || echo "no key is tracked"
du -sk fixtures
git diff --name-only e9f9b5e HEAD | grep -vE '^(service|web|scripts|fixtures|docs/missions/clipper-tool)/|^(README|AGENTS)\.md$' || echo "every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md"
grep -rnE "docs/(prototype|missions)" web/src web/next.config.ts service/clipper scripts || echo "the app reads nothing from docs/"
```

### V18

```bash
grep -n "CLIPPER_MODEL_SOURCE" README.md AGENTS.md
grep -niE "model|transcript" README.md
grep -niE "transcription|following dependencies|no-deps" AGENTS.md
```

### V19

```bash
git diff --name-only --diff-filter=AM e9f9b5e HEAD -- '*.ts' '*.tsx' '*.mjs' '*.py' | python3 /Users/work/.claude/skills/coding-standards/hooks/review-files.py --stdin | grep -vE -- '— clean|^$'
cat service/.coding-standards-structure
```
