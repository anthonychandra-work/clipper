# Validation: m1-a-running-tool-with-a-library-and-import

Run every check from the worktree's root, in the order of the table: V33, added on attempt 2,
comes after V5. A check written as "block" runs the commands under its heading below the table,
with `bash`. Ports 3000, 8765, 3100 and 8865 must be free before V1. The Mac must be on a network
and stay awake until the last check ends, because the browser tests time their steps on the
clock. On battery power a closed lid puts it to sleep.

`pnpm test:browser <file>` prints one line per test. Such a check passes when the command exits 0
and the passed tests show everything its `expected` cell lists.

| id | proves | check | expected |
| -- | ------ | ----- | -------- |
| V1 | Setup works from the committed files, inside the project (A2, R8, R59) | block V1 | Both commands exit 0. Python reports 3.12. `find` prints a browser folder inside the worktree. |
| V2 | "The test command passes"; one command runs every check (R9, R12) | `pnpm test` | Exit 0. The output reports Ruff, mypy, pytest, ESLint, the TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. No gate existed before this milestone, so there is no baseline. |
| V3 | Test data is removed and no tracked file changes (R56) | block V3 | `ls` reports that the folder does not exist. `git status` prints nothing. |
| V4 | "The start command brings the tool up, and the Library opens at the address it prints"; the web app on every interface, the service on loopback only (R2, R11, A3) | block V4 | The log shows `http://localhost:3000`. The Library answers 200 and the page's title is `Clipper`. `/api/health` answers 200 through port 3000. `lsof` shows port 3000 listening on `*` and port 8765 on `127.0.0.1`. The data folder holds a database file. After the interrupt neither port has a listener. |
| V5 | "Started with a setting that points at a folder without ffmpeg, the tool stops with a message that names ffmpeg" (R10) | block V5 | The exit code is neither 0 nor 142. The log holds a sentence that names `ffmpeg` and `ffprobe` and says where Clipper looked. No line contains `Traceback`. Neither port has a listener. |
| V33 | When the tool is stopped, the service stops before the web app, so nothing of the tool is listening once its address no longer answers (A36) | block V33 | Five rounds. Each prints `200` for the service through the web app, then a line that reads `<count> samples, 0 with the web port closed and the service port open`, then exit code 130. After the last round neither port has a listener. |
| V6 | The web app is reachable on the Mac's network address and the service is not; pages ask nothing outside the tool (R2, R57) | `pnpm test:browser e2e/start-command.spec.ts e2e/own-origin.spec.ts` | The Library opens at the address the start command printed. The web port answers on the Mac's network address and the service port refuses there. On every screen of this milestone, each request goes to the tool's own address. |
| V7 | "Uploading the fixture video creates a project whose row shows the fetch stage progressing and then complete, with the fixture's real length" (R13, R15) | `pnpm test:browser e2e/import-upload.spec.ts` | The fixture is uploaded through the new project sheet. The project's row shows the first step's bar at two or more rising values and never a falling one. The row then reads "Fetched" with the length ffprobe reports for the fixture. |
| V8 | "A link to the same file, served by a local test server, does the same" (R13) | `pnpm test:browser e2e/import-link.spec.ts` | A link to the fixture on the local server is entered in the sheet. The row shows the first step's bar rising, then "Fetched" with the fixture's length. |
| V9 | "After the tool is stopped and started again, both projects are listed in the same state"; a project interrupted mid-step finishes after the restart (R15) | `pnpm test:browser e2e/restart.spec.ts e2e/queue-through-tool.spec.ts` | After a stop and a start, the uploaded project and the link project are both listed as fetched with the same lengths. A project whose fetch was cut off by a stop finishes after the start. |
| V10 | "A link that is not a link, a missing file, and no platform selected each show the error under its field, as the prototype does, and move focus to that field" | `pnpm test:browser e2e/new-project-errors.spec.ts` | "Paste the full link, starting with https://" appears under Source with focus in the link field. "Choose a video file first." appears under Source with focus on the file field. "Turn on at least one platform." appears under Platforms with focus on the first platform switch. In each case the field is marked invalid and no project is created. |
| V11 | "With no projects, the Library shows the empty state from D66, and its control opens the new project sheet"; rows show each stage state (R15, R21) | `pnpm test:browser e2e/empty-library.spec.ts e2e/library.spec.ts` | With no projects the Library shows "No Projects Yet" and a "New Project" control, and the control opens the sheet at `/new`. With projects, each row shows its title, source, length and status, and a row leads to its project. |
| V12 | "Deleting a project after confirming removes it from the Library and removes its files from the data folder. Cancelling the confirmation removes nothing" (R20) | `pnpm test:browser e2e/delete-project.spec.ts` | The More menu offers "Delete Project…". The confirmation names the project and says what is removed. Cancel leaves the row and the project's folder. Delete removes the row and the folder. Deleting a project while it is being fetched stops it and leaves no folder. |
| V13 | "With free space reported as under 5 GB, creating a project is refused with the reason from D67" (R22) | `pnpm test:browser e2e/low-disk.spec.ts` | With 3 GB reported free, "Find Clips" creates nothing. The reason appears under the source field, gives the free space and says to delete a project or free space. |
| V14 | "A second project created while the first is being fetched shows as waiting and starts when the first finishes"; an upload runs while another project is processed (R14, R16, R18) | `pnpm test:browser e2e/queue.spec.ts` | While the first project is fetched, the second reads "Waiting in queue" and its status screen names the first. It starts only after the first has finished, and finishes. A file sent meanwhile arrives in full and then waits its turn. |
| V15 | "A link the test server answers with 'not found' fails the fetch stage with a reason and a Retry control. Stop during a fetch leaves the project stopped, and Resume finishes it" (R17, R18) | `pnpm test:browser e2e/halt-project.spec.ts` | The missing link's project shows "Could Not Finish", a reason in plain words and Retry; once the server serves the file, Retry finishes it. Stop during a fetch shows "Stopped" with its reason and Resume, and Resume finishes it. |
| V16 | "An upload shows its progress, and a 50 MB upload arrives at the same size it was sent" (R13, R14, A22) | `pnpm test:browser e2e/upload-size.spec.ts` | While a 50 MiB file is sent, the status screen says to keep the page open and shows a bar between its ends. The stored file has 52,428,800 bytes and the checksum of the file sent. |
| V17 | "Opening a project, reloading the page and pressing Back each land where D51 says"; each tab has its own address (R6) | `pnpm test:browser e2e/addresses.spec.ts` | Opening a project from the Library lands on `/projects/<id>`. A reload shows the same project. Back returns to the Library. A project presented as ready shows Review, Export and Results at `/projects/<id>/review`, `/export` and `/results`; a reload keeps the tab, and Back and Forward move between tabs. |
| V18 | "At 390 px the Library is a list above a tab bar and the new project form opens as a sheet. At 1360 px the projects are in a sidebar and the sheet is centred"; the two layouts and the sidebar change at the stated widths (R5) | `pnpm test:browser e2e/shell.spec.ts e2e/layout.spec.ts` | At 390 px the list sits above a tab bar at the bottom edge, and the sheet spans the width from the bottom edge. At 1360 px the projects are in the sidebar and the sheet is centred. The layout changes at 720 px. The sidebar lies over the content at 999 px and beside it at 1000 px. |
| V19 | "Screen captures at both widths, in light and in dark, are saved" (A20) | block V19 | Exit 0. The evidence folder holds 24 files named `<screen>-<width>-<theme>.png`: `library`, `empty-library`, `new-project`, `status`, `project` and `settings`, at `390` and `1360`, in `light` and `dark`. |
| V20 | The screens are laid out as the prototype's, on phone and desktop, in light and in dark (R3, R5) | Open every capture from V19 and record in the proof what each shows. | At 390: the Library has a large title, project rows and a tab bar with Library and Settings; the sheet rises from the bottom with Cancel, New Project and Find Clips; the status screen has a centred card with a heading, a bar and a step line; the project view has the Review, Export and Results control; Settings has five titled groups; the empty Library reads "No Projects Yet" with "New Project". At 1360: a sidebar holds Clipper, New Project, the project rows and Settings, with the screen beside it; the sheet is centred over a dimmed page. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text. |
| V21 | "At 390 px no screen scrolls sideways and no label is cut off, at the normal text size and at 200%" (R7) | `pnpm test:browser e2e/text-size.spec.ts` | For the Library, the empty Library, the sheet with each source and each error, the status screen in each state, the project tabs, the delete confirmation and Settings, at 390 px, at the normal size and at 200%: no sideways scroll, no element wider than the screen, no label with clipped text. |
| V22 | Settings holds every control of the prototype and keeps each choice (A9, A30) | `pnpm test:browser e2e/settings.spec.ts` | The five groups and their rows are present. Each of the six choices, once changed, is still chosen after a reload. The storage row gives free and total space, and the phone row gives an address with the web port. |
| V23 | The service's rules, by test name (R10, R11, R13, R15, R16, R17, R19, R20, R22, A22) | block V23 | Exit 0. Passed tests show: the tools found in the configured folder, taken from the PATH when it lacks them, and a missing or broken tool named; the fixture's length read; a preview copy that is H.264 with AAC and no taller than 720 pixels; no format above 1080 pixels allowed for a link; a "not found" link reported; a three-hour source fetched; projects taken in creation order, one at a time; step state and percent stored; a project interrupted by a restart finished; stop, resume and retry, with finished steps not run again; the disk-full reason; an upload appended part by part with its size intact; a file over 4 GB refused; a new project refused under 5 GB free; delete removing the project's files. |
| V24 | The web app's rules, by test name (R13, A22) | `pnpm --dir web exec vitest run --reporter=verbose` | Exit 0. Passed tests show: the three problems of a draft; lengths in seconds, minutes and hours; a file cut into 8 MiB parts, sent in order and carried on from the count the service holds. |
| V25 | The web app forwards through rewrites, has no proxy or middleware file, and holds no database (R2, R8) | block V25 | `find` prints nothing. The first `grep` shows the rewrites in the configuration. The second `grep` prints nothing. |
| V26 | The design is the prototype's: tokens and stylesheets unchanged (R4, A31) | block V26 | Five lines ending `identical` and the line `tokens identical`. The list of stylesheets holds those five, `tokens.css` and at most one more, whose content is pasted into the proof. |
| V27 | No CSS framework or component library; every version pinned; yt-dlp is a project dependency (R4, R8) | block V27 | The first line reads `next react react-dom`. Then `every version exact`, then `every requirement pinned`, then the pinned lines for yt-dlp, fastapi and uvicorn. |
| V28 | Libraries built into the app carry permissive licences (R58) | block V28 | Every licence shown is MIT, ISC, BSD, 0BSD, Apache-2.0, PSF, Unlicense or CC-BY-4.0. None is GPL, LGPL, AGPL or MPL. |
| V29 | This milestone's commits touch nothing the boundaries exclude (R11, R55, R56) | block V29 | `data` is ignored. No video, audio, database or model file is tracked. No key is tracked. `fixtures` is under 20,480 KB. The diff against `.researches` and `docs/prototype` is empty. The app reads nothing from `docs/`. |
| V30 | The README and the agents' instructions name the commands (R9, A18) | block V30 | `README.md` and `AGENTS.md` each name `pnpm install`, `pnpm bootstrap`, `pnpm start` and `pnpm test`. `CLAUDE.md` is `@AGENTS.md`. The README has the phone instructions. |
| V31 | The code follows the standards the hooks enforce, and both layouts are recorded (A19) | block V31 | Every finding printed carries `[advisory]`; none appears without it. Both structure files exist, the web one begins `follows: screaming-architecture`, and neither has a line starting with `#`. |
| V32 | The checks left the worktree clean | `git status --porcelain` | Every path listed is inside this milestone's folder. |

## Blocks

### V1

```bash
pnpm install --frozen-lockfile
pnpm bootstrap
service/.venv/bin/python --version
find . -maxdepth 3 -type d -name 'chromium*' -not -path '*/node_modules/*'
```

### V3

```bash
ls "<the folder V2's closing lines named>"
git status --porcelain
```

### V4

```bash
run="$(mktemp -d)"
printf 'import os, sys\ntry:\n    os.setsid()\nexcept OSError:\n    pass\nos.execvp(sys.argv[1], sys.argv[1:])\n' > "$run/own-group.py"
CLIPPER_DATA_DIR="$run/data" python3 "$run/own-group.py" pnpm start > "$run/start.log" 2>&1 &
tool=$!
for i in $(seq 1 180); do grep -q "http://localhost:3000" "$run/start.log" && break; sleep 1; done
cat "$run/start.log"
curl -s -o "$run/library.html" -w "library: %{http_code}\n" http://localhost:3000/
grep -o "<title>Clipper</title>" "$run/library.html"
curl -s -w "\nservice through the web app: %{http_code}\n" http://localhost:3000/api/health
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:8765 -sTCP:LISTEN
ls "$run/data"
kill -INT -- "-$tool"
for i in $(seq 1 30); do lsof -nP -iTCP:3000 -sTCP:LISTEN > /dev/null || break; sleep 1; done
lsof -nP -iTCP:3000 -sTCP:LISTEN; lsof -nP -iTCP:8765 -sTCP:LISTEN; echo "end of listeners after the interrupt"
rm -rf "$run"
```

### V5

```bash
run="$(mktemp -d)"; mkdir "$run/no-tools"
env PATH="$(dirname "$(command -v node)"):$(dirname "$(command -v pnpm)"):/usr/bin:/bin" CLIPPER_FFMPEG_DIR="$run/no-tools" CLIPPER_DATA_DIR="$run/data" perl -e 'alarm 180; exec @ARGV' pnpm start > "$run/start.log" 2>&1
echo "exit code: $?"
cat "$run/start.log"
lsof -nP -iTCP:3000 -sTCP:LISTEN; lsof -nP -iTCP:8765 -sTCP:LISTEN; echo "end of listeners"
rm -rf "$run"
```

### V33

```bash
run="$(mktemp -d)"
printf 'import os, sys\ntry:\n    os.setsid()\nexcept OSError:\n    pass\nos.execvp(sys.argv[1], sys.argv[1:])\n' > "$run/own-group.py"
cat > "$run/watch-ports.py" <<'EOF'
import socket
import time


def is_open(port):
    with socket.socket() as probe:
        probe.settimeout(0.5)
        return probe.connect_ex(("127.0.0.1", port)) == 0


samples = service_alone = 0
deadline = time.monotonic() + 30
while time.monotonic() < deadline:
    is_web_open = is_open(3000)
    is_service_open = is_open(8765)
    samples += 1
    service_alone += (not is_web_open) and is_service_open
    if not is_web_open and not is_service_open:
        break
    time.sleep(0.005)
print(f"{samples} samples, {service_alone} with the web port closed and the service port open")
EOF
for round in 1 2 3 4 5; do
  CLIPPER_DATA_DIR="$run/data" python3 "$run/own-group.py" pnpm start > "$run/start.log" 2>&1 &
  tool=$!
  for i in $(seq 1 180); do grep -q "http://localhost:3000" "$run/start.log" && break; sleep 1; done
  curl -s -o /dev/null -w "round $round, service through the web app: %{http_code}\n" http://localhost:3000/api/health
  kill -INT -- "-$tool"
  python3 "$run/watch-ports.py"
  wait "$tool"; echo "exit code of the start command: $?"
done
lsof -nP -iTCP:3000 -sTCP:LISTEN; lsof -nP -iTCP:8765 -sTCP:LISTEN; echo "end of listeners after the last round"
rm -rf "$run"
```

### V19

```bash
CLIPPER_EVIDENCE_DIR="$PWD/docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence" pnpm test:browser e2e/captures.spec.ts
ls docs/missions/clipper-tool/m1-a-running-tool-with-a-library-and-import/evidence
```

### V23

```bash
cd service && .venv/bin/python -m pytest clipper -v
```

### V25

```bash
find web -path '*/node_modules' -prune -o -path 'web/.next*' -prune -o \( -name 'proxy.*' -o -name 'middleware.*' \) -print
grep -n "rewrites" web/next.config.ts
grep -rniE "sqlite" web/src web/package.json
```

### V26

```bash
for f in base controls lists shell pages; do cmp docs/prototype/styles/$f.css "$(find web/src -name "$f.css")" && echo "$f.css identical"; done
diff <(grep -o -- '--[a-z0-9-]*: [^;]*;' docs/prototype/index.html | sort -u) <(grep -rho --include='tokens.css' -- '--[a-z0-9-]*: [^;]*;' web/src | sort -u) && echo "tokens identical"
find web/src -name '*.css' | sort
```

### V27

```bash
node -e 'const web = require("./web/package.json"); const root = require("./package.json"); console.log(Object.keys(web.dependencies).sort().join(" ")); const all = { ...web.dependencies, ...web.devDependencies, ...root.dependencies, ...root.devDependencies }; const loose = Object.entries(all).filter(([, version]) => !/^\d+\.\d+\.\d+$/.test(version)); console.log(loose.length ? loose.map(([name, version]) => name + "@" + version).join(" ") : "every version exact");'
grep -vE '^(#|-r |[[:space:]]*$)' service/requirements.txt service/requirements-dev.txt | grep -v '==' || echo "every requirement pinned"
grep -iE '^(yt-dlp|fastapi|uvicorn)' service/requirements.txt
```

### V28

```bash
pnpm --dir web licenses list --prod
service/.venv/bin/python - <<'EOF'
import re
from importlib.metadata import metadata

lines = [line.strip() for line in open("service/requirements.txt")]
names = [re.split(r"[=\[ ]", line)[0] for line in lines if line and not line.startswith(("#", "-"))]
for name in names:
    found = metadata(name)
    classifiers = [entry for entry in (found.get_all("Classifier") or []) if entry.startswith("License")]
    print(name, "|", found.get("License-Expression") or (found.get("License") or "").strip()[:60] or classifiers)
EOF
```

### V29

```bash
git check-ignore -v data
git ls-files | grep -iE '\.(mp4|mov|mkv|webm|m4v|avi|wav|aiff|mp3|m4a|sqlite|sqlite3|db|safetensors|npz|pt|gguf|onnx|bin)$' || echo "no video, audio, database or model file is tracked"
git grep -nE 'sk-ant-[A-Za-z0-9_-]{20,}' || echo "no key is tracked"
du -sk fixtures
git diff --stat 82df5ce HEAD -- .researches docs/prototype
grep -rnE "docs/(prototype|missions)" web/src web/next.config.ts service/clipper scripts || echo "the app reads nothing from docs/"
```

### V30

```bash
grep -nE "pnpm (install|bootstrap|start|test)" README.md AGENTS.md
cat CLAUDE.md
grep -niE "phone|wi-fi" README.md
```

### V31

```bash
git diff --name-only --diff-filter=AM 82df5ce HEAD -- '*.ts' '*.tsx' '*.mjs' '*.py' | python3 /Users/work/.claude/skills/coding-standards/hooks/review-files.py --stdin | grep -vE -- '— clean|^$'
cat web/.coding-standards-structure service/.coding-standards-structure
```
