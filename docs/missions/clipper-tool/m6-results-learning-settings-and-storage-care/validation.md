# Validation: m6-results-learning-settings-and-storage-care

Run every check from the worktree's root, in the order of the table. V22 to V25 stand before V21
there, so the check of the clean worktree is the last one run. A check written as "block"
runs the commands under its heading below the table, with `bash`. Ports 3000, 8765, 3100 and 8865
must be free before V1, and the Mac must be on a network. The Mac must be on mains power and stay
awake until the last check ends, because the browser tests time their steps on the clock and wait
for renders. On battery it sleeps when the charge runs low, whatever keeps it awake otherwise.

V1, V2 and V3 work in a clone of the repository, which V1 makes in a temporary folder and V3
removes (A147). The clone is started on ports 3000 and 8765 with a data folder of its own, inside
the clone, and with its key file named in the temporary folder. V1 takes the tool as up once the
start command has printed its own line, `Clipper is running at http://localhost:3000`, as the
README does (A154). Every other check runs in the worktree.

V24 starts the tool from the worktree on ports 3000 and 8765, which V3 has left free. Its data
folder and its key file are in a temporary folder that the block makes and removes. The client
of V23 and V24 asks for a connection that stays open, as a browser does, and takes a new
connection for each request (A156).

V25 writes one test file into `web/e2e`, runs it and removes it, also when the block is
interrupted. That test fails on purpose, so its run ends with code 1 (A157).

`pnpm test:browser <file>` prints one line per test. Such a check passes when the command exits 0
and the passed tests show everything its `expected` cell lists.

No check needs an API key. The "seeded set" of the cells below is made on a talk built from the
fixture with the recorded replies: `c01`, `c02` and `c03` kept and exported, `c05` rejected as
not interesting, `c06` rejected as cut off mid-thought, and the views 1,200 for `c01`, 5,400 for
`c02` and 48,000 for `c03`.

| id | proves | check | expected |
| -- | ------ | ----- | -------- |
| V1 | "The README's setup, start, test and phone instructions work when followed from a fresh copy of the repository", for setup, start and phone; "Settings shows an address made of the Mac's local network address and port 3000, and the tool answers a request sent to that address"; "The free disk figure is within 1 GB of what the system reports"; a first start shows no project (R2, R9, R21, R54, A145, A147, A154) | block V1 | The two commit lines are equal. `pnpm install` and `pnpm bootstrap` each end with exit code 0, and the last line of the bootstrap is `Clipper is set up. Start it with "pnpm start".` The start prints `Clipper is running at http://localhost:3000`. The Library answers 200 with the title Clipper, and the answer of the projects holds no project. The phone address Settings gives is `http://`, then the address of this Mac on its network as the line above prints it, then `:3000`. The three answers of the phone address are 200. The free space Settings gives differs from the one `df` gives by less than 1.0 GB, and so do the two totals. The start command ends with code 130 after the interrupt, and nothing is printed between that line and "end of listeners after the interrupt". |
| V2 | "The test command passes"; the README's test instructions from a fresh copy; one command runs every check (R9, R12, A147) | block V2 | The line after the run gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. The Fixtures lines name four built videos. The closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine gates passed at `0ec8f3d`, with 1,123 service tests, 362 unit tests and 173 browser tests (M5's `proof.md`, V1), and only mission documents changed up to `5ab7552`, where this milestone starts. In the planner's clone of `5ab7552` eight gates passed and Playwright failed with 171 of 173: the Mac slept for eight minutes on an empty battery during one test, and one test met the lost change of A149. Both files passed when run again in the clone. No gate may fail. The named browser tests end with exit code 0 and 4 passed. Nothing is printed between the exit code of the named browser tests and "end of the clone's changes". |
| V3 | Test data and the clone are removed, nothing of the tool is left listening, and no tracked file of the worktree changed (R56, R57) | block V3 | Each of the three `ls` reports that its folder does not exist. Nothing is printed before "end of listeners". Every path `git status` lists is inside this milestone's folder. |
| V4 | What M1 to M5 built still holds beside this milestone (R6, R13 to R50) | block V4 | The count is 173 or more. The closing line says that no test of these files failed. |
| V5 | "Views entered on the Results tab are still there after a reload, and for a seeded set the order and the summary sentence are correct."; the Results tab at its address with the prototype's two groups (R3, R6, R51, A140, A141) | `pnpm test:browser e2e/results-tab.spec.ts` | A talk with no kept clip shows "No Results Yet" with "Go to Review", and one with a kept clip that is not exported shows "Go to Export". With `c01` to `c03` exported the tab lists three rows with the ranks 01, 02 and 03, their titles and empty fields, and reads "Enter views for at least two clips." With the seeded views typed, "Ranking Against Outcome" lists "Almost everyone gets price wrong" with 48,000, "Hire for the habits you cannot teach" with 5,400 and "The worst day my bakery ever had" with 1,200, in that order, under "The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2, 1.", with the first bar the longest. After a reload the three fields hold 1200, 5400 and 48000, the outcome is the same, and the service gives the same views. 90000 typed for `c01` gives "The selector’s first pick performed best. Ranks in order of views: 1, 3, 2." An emptied field and a typed 0 each take their clip out of the outcome, also after a reload. A clip rejected after its export keeps its row. The project's row reads "Exported · 3 clips exported" before the views and "Exported · 3 clips exported, results logged" after them. At 390 px the tab lists the same rows and stores a typed number. |
| V6 | "After clips are rejected with reasons and views are logged, the selection request for a new project contains the note from D40. After "Forget all of it", it does not."; what a deleted project added to the history stays (R20, R52, A142, A143, A144) | block V6 | The exit code of the browser tests is 0, with 1 test passed: it makes the seeded set, with the rejections chosen from the reject menu and the views typed on the Results tab, deletes that talk, makes a second talk, presses "Forget All of It" and makes a third. `withHistory` gives the rejections `{"cutOff": 1, "needsContext": 0, "notInteresting": 1, "repeat": 0}` and four requests: one `score` of every window and one `cut` each of `w01`, `w02` and `w03`. Under each stand the same two lines: "Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip." and "Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds." `afterForgetting` gives four zeros and the same four requests, each with "no note". The last line counts 1 different note. |
| V7 | "Every Settings control works", for what the selector has learned; the phone address in the browser (R52, R54, A144) | `pnpm test:browser e2e/settings.spec.ts` | Settings has the prototype's five groups, with "Forget All of It" switched on. With no history the four counts are 0. With two clips of the talk rejected on the Review tab as "Not Interesting" and "Cut Off Mid-Thought", the rows read Cut Off Mid-Thought 1, Not Interesting 1, Needs Earlier Context 0 and Repeats Another Clip 0. "Forget All of It" shows "The selector forgot what it had learned" and four zeros, a reload shows four zeros, and the Review tab still lists the two rejected clips with their reasons. Each of the six choices is kept after a reload. The phone row gives the address of this Mac with the web port, and the tool answers at it. |
| V8 | "Changed model choices appear in the next selection request, and a changed default clip length is preselected in the new project form."; the clips per video; the free disk figure on the screens (R33, R34, R36, R54, A69, A145) | `pnpm test:browser e2e/settings-effect.spec.ts` | With Claude Haiku 4.5 chosen for scoring and Claude Fable 5.1 for cutting in Settings, the next talk sends one score request that names `claude-haiku-4-5`, with no effort setting, and three cut requests that name `claude-fable-5-1`. With 4 clips per video chosen, the next talk ends ready with four candidates and each cut task asks for 4. With 60–180 s chosen, the new project sheet opens with "60–180 s" selected, also after a reload, and a project made from it has the limits 60 and 180. With the default back, the sheet opens at "25–60 s". A length chosen in the sheet before Settings answers is kept. Started without a reported figure, the tool gives a free space and a total within 1 GB of what the Mac gives for the disk of the data folder, and Settings and the sidebar show that free space rounded down to whole gigabytes. |
| V9 | "A source older than the retention setting is removed by the cleanup. Its project still opens, the Review tab shows the notice from D56, the Export tab states that the source is gone, and its exports are untouched." (R45, R53, A146) | `pnpm test:browser e2e/retention.spec.ts` | A talk with `c01` exported keeps its source and its preview copy when the tool is started six days later by its clock. Started eight days later, the talk's folder holds neither, and holds the transcript, the filmstrip frames and `exports/01-c01.mp4` at the size it had. The Library lists the talk as exported. Its Review tab shows "Preview unavailable. The source video was deleted to free space." in place of the preview, with its six candidates. Its Export tab shows "The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.", has Render switched off, and "Download MP4" saves the file. Its Results tab lists the clip. With "Never" chosen and the clock 400 days ahead the source stays, and with "3 days" and the clock four days ahead it is removed. |
| V10 | "Deleting a project that has exports removes its export files."; the history outlives the project (R20, A142) | `pnpm test:browser e2e/delete-project.spec.ts` | With `c01` exported and `c06` rejected with a reason, Delete Project from the More menu removes the talk's folder with `exports/01-c01.mp4` and leaves the Library empty, and Settings still counts the rejection. Cancel removes nothing. The tests of M1 in this file pass. |
| V11 | The service's rules for the history, the note, the results, Settings and the cleanup, by test name (R20, R51 to R54, A140 to A146) | block V11 | The exit code of pytest is 0. The count of passed tests of the three new packages is 40 or more, and no service test failed. Among the passed tests of the saved output: a change of a clip that arrives while another is being stored applied to what that one stored, and a hundred pairs of changes sent together all stored whole; a database made by M5 upgraded with its projects, candidates, reviews and renders unchanged, its decisions copied into the history, its logged count 0 and its projects imported at the upgrade; a decision entering the history, moving to the end when it changes, and leaving when the clip is undecided; a change of a title or a point leaving the history as it was; the 50 newest of 60 decisions; a deleted project's entries staying; no note from an empty history; the first line with all four reasons; the second line from three, seven and nine clips with views, and none from two; the note in the task of the score request and of every cut request, and in neither the instructions nor the transcript part; no `note` field without a history; the rejections in the settings answer; the forget address emptying the history and leaving the choices and the key; only clips with a finished file in the results, a rejected one among them; views of 1 and of 9,999,999,999 stored and 0, a fraction, a larger number and a clip without a file refused; cleared views leaving the count and the history; a project without candidates answering with no clips; the source and the preview copy of a ready project removed past the retention and kept before it, at 3, 7 and 30 days; "Never" removing nothing; a failed, a stopped, a waiting and a transcribed project keeping their source; a project with a clip in the queue passed over; a tool started with its clock ahead answering with the source gone; through the whole app, the two lines of the note in the four requests of the talk made after the seeded set, and no note after forgetting. |
| V12 | The web app's rules, by test name (A140, A141, A144, A145) | `pnpm --dir web exec vitest run --reporter=verbose` | Exit 0. Passed tests show: typed texts read as views or as none; no order from one clip with views; the order, the shares and the sentence of the seeded set; "The selector’s first pick performed best." for a set led by rank 1; rank 1 before rank 2 between equal views; views shown before the service answers, and a second number for one clip sent only once the first is answered; a second change of a clip in the review shown at once and sent only once the first is answered, and a change of another clip sent without waiting; a refusal; the four rows of what the selector has learned with their numbers; a draft that takes the default clip length and one that keeps a chosen length; the row of an exported project with and without logged results. |
| V13 | On the Results tab and on Settings at 390 px no screen scrolls sideways and no label is cut off at 200% text size, no control has a tap area under 44 px, and text differs from its background by 4.5 to 1 (R7, A148) | `pnpm test:browser e2e/results-fit.spec.ts` | For the Results tab empty, with the seeded set, and presented with twelve clips, titles of 110 characters and views of ten digits, and for Settings without a key and with one saved, with counts of three digits, at 390 px: at the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled to its end, a screen's last line lies above the tab bar; no control has a tap area under 44 px; in light and in dark no text measures under 4.5 to 1. At 1360 px the same screens meet the ratio in light and in dark. |
| V14 | The Results tab and Settings are captured at 390 px and 1360 px, in light and in dark (R3, A20, A148) | block V14 | The exit code is 0. The evidence folder holds four files named `results-<width>-<theme>.png` and four named `settings-<width>-<theme>.png`, for `390` and `1360`, in `light` and `dark`. |
| V15 | The Results tab and Settings reproduce the prototype's screens with the talk's own data, on phone and desktop, in light and in dark (R3, R5, A140, A141, A144) | Open every capture from V14 and record in the proof what each shows. | Results at 390: the project's title above the Review, Export and Results control; "Views After 7 Days" with three rows, 01, 02 and 03, each with its title and a field that holds 1200, 5400 or 48000; under them "Enter each clip’s views a week after posting. The selector compares them with its own ranking and adjusts what it favours on your next video."; "Ranking Against Outcome" with the sentence of V5 and three bars, the longest first, beside 48,000, 5,400 and 1,200; the tab bar. Results at 1360: the sidebar, where the project's row reads "Exported · 3 clips exported, results logged"; a toolbar with the three tabs and the More button; the same page beside it. Settings: the five groups; a storage line of the form "50 GB free of 460 GB on this Mac" with its bar; an address under "Open on Your Phone"; under "What the Selector Has Learned" the counts 1, 1, 0 and 0 and "Forget All of It" in the destructive colour. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text. |
| V16 | This milestone's commits touch nothing the boundaries exclude, add no package, commit no video, no database, no key and no weights, and leave the copied stylesheets as the prototype's (R2, R4, R8, R55, R56, R58, R59) | block V16 | Nothing is printed before each of the three closing lines about changes. Seven lines say that a stylesheet is the prototype's. `data` and `.cache` are ignored. The one tracked video, audio, database or model file is `face_detection_yunet_2026may.onnx`. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`. Nothing is printed before "end of the proxy and middleware files". |
| V17 | The Results tab, Settings, the history and the cleanup ask for nothing outside the tool (R57) | block V17 | The new packages and the two capabilities name no outside address. The exit code of the browser tests is 0, and their passed tests show the Results tab of a talk with the seeded set asking only the tool, at both widths. |
| V18 | The README and the agents' instructions cover what this milestone adds (R9, A18) | block V18 | The README says what the Results tab does, what the selector learns and what "Forget All of It" clears, what each choice in Settings governs, and when the source of a project is removed and what stays. It has no section on what this version does not do yet. Both files name `CLIPPER_CLOCK_AHEAD_DAYS`. `AGENTS.md` names the `learning`, `results` and `retention` packages, the results capability and the direction of their imports. |
| V19 | The code follows the standards the hooks enforce, and both recorded layouts name the new parts (A19) | block V19 | Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `learning/`, `results/` and `retention/`. The web app's layout lists `results/` with three use cases under it. No line of either starts with `#`. |
| V20 | Two changes of one clip made one after the other in the browser are both stored and shown (R40, A149) | `pnpm test:browser e2e/review-preview.spec.ts --repeat-each=20 -g "preview copy moved aside"` | 20 passed, with exit code 0. Each run presses Keep and moves the out point of the same clip at once, with the preview copy moved aside, and reads "Kept", the new out point, and both in what the service holds. Baseline: this test failed once in the planner's run of the test command, on a Mac busy after a wake from sleep, and passed 20 times of 20 on the Mac at rest before any change; the tests V11 and V12 name show the mended rule itself. |
| V22 | The README and the agents' instructions say which line of the start's output means that the tool is up (R9, A18, A154) | block V22 | The README's Start section shows the line `Clipper is running at http://localhost:3000` and says after it that Next.js prints lines of its own before it, the same address and `http://0.0.0.0:3000` among them, that Clipper's line is the one that says the tool is up, and that the address for a phone is the one Settings gives. `AGENTS.md` says that a script or a check waits for the line `Clipper is running at` and not for the address alone, that Next.js prints the address about a tenth of a second earlier, and that `next start` has no option that leaves its lines out. |
| V23 | A request the web app forwards is answered by the service, whatever the pause since the request before it; the service ends each connection with its answer, so "The test command passes" is not lost to a forward that failed (R2, R9, A156) | block V23 | The exit code of pytest is 0 with 1 passed: the service, started as the start command starts it, ended the connection after its answer to a request that asked for the connection to stay open. The exit code of the browser tests is 0 with 2 passed: the answer to the health address carries `Connection: close` at the service's port and through the web port, and 320 requests forwarded in eight rounds of 40, after pauses of 4,960 to 4,995 ms without a request, were each answered 200 with the health. Baseline: in the planner's clone of `32947d3`, before the change, trial versions of the three tests failed, the last with requests answered `500 Internal Server Error` after 4,975 and 4,985 ms. |
| V24 | The same on the tool as the start command runs it: the web app keeps no connection to the service open, and no forwarded request is lost (R2, A156) | block V24 | The start prints `Clipper is running at http://localhost:3000`. The two lines about the service's answer each end in `connection: close`. The 20 requests sent together are answered 200 with the health, and the next line reads `connection ends open at the service port one second later: 0`. The 40 requests sent together are answered 200 with the health. No line begins with "after". The closing line of the pauses reads `requests sent after a pause: 1440; not answered 200 with the health: 0`, and the line under it `lines of the web app about a forward that failed: 0`. The start command ends with code 130 after the interrupt, and nothing is printed between that line and "end of listeners after the interrupt". Baseline: at `32947d3`, before the change, this block printed no header for the service's own answer and `connection: keep-alive` for the answer through the web port, 42 connection ends, 15 lines that begin with "after" and name `500 Internal Server Error`, 113 of the 1,440 requests not answered 200, and 113 lines about a forward that failed. |
| V25 | A browser test that does not pass leaves what the tool printed while it ran in the output of the run (R9, A157) | block V25 | The planted test fails: its run reports 1 failed, and the line after it gives exit code 1. Above the line of that test the output holds `What the tool printed while "a test that a validation block planted, and that fails on purpose" ran:` and under it a line that ends in `Invalid HTTP request received.`, which the service prints for the bytes the test sent to its port. Nothing is printed between the exit code of the planted test and "end of the changes under web/e2e". The browser tests of `e2e/failure-output.spec.ts` end with exit code 0 and 1 passed: a test is given what the tool printed while it ran, the service's line from before a restart of the tool and the address line of the new start among it. |
| V21 | The checks left the worktree clean | `git status --porcelain` | Every path listed is inside this milestone's folder. |

## Blocks

### V1

```bash
evidence="$PWD/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence"
fresh="${TMPDIR:-/tmp}/clipper-m6-fresh-copy"
rm -rf "$fresh"
mkdir -p "$fresh" "$evidence"
git clone --quiet --branch "$(git rev-parse --abbrev-ref HEAD)" "$PWD" "$fresh/clipper"
echo "commit of the worktree: $(git rev-parse HEAD)"
echo "commit of the clone:    $(git -C "$fresh/clipper" rev-parse HEAD)"
cd "$fresh/clipper"
pnpm install > "$fresh/install.log" 2>&1
echo "exit code of pnpm install: $?"
pnpm bootstrap > "$fresh/bootstrap.log" 2>&1
echo "exit code of pnpm bootstrap: $?"
tail -1 "$fresh/bootstrap.log"
printf 'import os, sys\ntry:\n    os.setsid()\nexcept OSError:\n    pass\nos.execvp(sys.argv[1], sys.argv[1:])\n' > "$fresh/own-group.py"
CLIPPER_KEY_FILE="$fresh/no-key" python3 "$fresh/own-group.py" pnpm start > "$fresh/start.log" 2>&1 &
tool=$!
for i in $(seq 1 300); do grep -q "Clipper is running at http://localhost:3000" "$fresh/start.log" && break; sleep 1; done
grep "Clipper is running" "$fresh/start.log"
curl -s -o "$fresh/library.html" -w "library at localhost: %{http_code}\n" http://localhost:3000/
grep -o "<title>Clipper</title>" "$fresh/library.html"
curl -s http://localhost:3000/api/projects
echo
interface="$(route -n get default | awk '/interface:/ {print $2}')"
echo "address of this Mac on its network: $(ipconfig getifaddr "$interface")"
df -k "$fresh/clipper/data" | tail -1 | awk '{printf "df gives %.1f GB free of %.1f GB\n", $4 / 1048576, $2 / 1048576}'
curl -s http://localhost:3000/api/settings > "$fresh/settings.json"
python3 - "$fresh/settings.json" <<'EOF'
import json
import sys
import urllib.request

settings = json.load(open(sys.argv[1]))
print("Settings gives %.1f GB free of %.1f GB" % (settings["freeDiskGb"], settings["totalDiskGb"]))
print("Settings gives the phone address", settings["phoneAddress"])
for path in ("/", "/settings", "/api/health"):
    with urllib.request.urlopen(settings["phoneAddress"] + path, timeout=10) as answer:
        print("answer of the phone address to", path, "is", answer.status)
EOF
kill -INT -- "-$tool"
wait "$tool"
echo "exit code of the start command: $?"
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:8765 -sTCP:LISTEN
echo "end of listeners after the interrupt"
```

### V2

```bash
evidence="$PWD/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence"
fresh="${TMPDIR:-/tmp}/clipper-m6-fresh-copy"
cd "$fresh/clipper"
env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_BASE_URL caffeinate -i pnpm test 2>&1 | tee "$evidence/v2-test-command.txt"
echo "exit code of pnpm test: ${PIPESTATUS[0]}"
caffeinate -i pnpm test:browser e2e/start-command.spec.ts 2>&1 | tail -12
echo "exit code of the named browser tests: ${PIPESTATUS[0]}"
git status --porcelain
echo "end of the clone's changes"
```

### V3

```bash
fresh="${TMPDIR:-/tmp}/clipper-m6-fresh-copy"
ls "<the folder the closing lines of pnpm test named in V2>"
ls "<the folder the closing lines of the named browser tests named in V2>"
rm -rf "$fresh"
ls "$fresh"
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:8765 -sTCP:LISTEN
lsof -nP -iTCP:3100 -sTCP:LISTEN
lsof -nP -iTCP:8865 -sTCP:LISTEN
echo "end of listeners"
git status --porcelain
```

### V4

```bash
saved=docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/v2-test-command.txt
files='e2e/(addresses|api-key|captures|delete-project|empty-library|export-cancel|export-captures|export-copy|export-fit|export-render|export-retry|export-tab|halt-project|import-link|import-upload|layout|library|low-disk|missing-ffmpeg|model-download|new-project-errors|no-speech|own-origin|queue|queue-through-tool|restart|review-captures|review-decide|review-fit|review-inspect|review-list|review-phone|review-preview|review-trim|selection|selection-progress|settings|shell|start-command|stop-order|text-size|transcribe|transcribe-restart|upload-parts|upload-size)\.spec\.ts'
grep -E "$files" "$saved" | grep -c '✓'
grep -E "$files" "$saved" | grep -v '✓' || echo "no test of these files failed"
```

### V6

```bash
evidence="$PWD/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence"
CLIPPER_EVIDENCE_DIR="$evidence" pnpm test:browser e2e/learning.spec.ts
echo "exit code of the browser tests: $?"
service/.venv/bin/python - "$evidence/learning-requests.json" <<'EOF'
import json
import sys

saved = json.load(open(sys.argv[1]))


def read_task(kept):
    return json.loads(kept["body"]["messages"][0]["content"][-1]["text"])


for name in ("withHistory", "afterForgetting"):
    part = saved[name]
    print(name, "| rejections Settings gave:", json.dumps(part["rejections"], sort_keys=True))
    for kept in part["requests"]:
        task = read_task(kept)
        window = task["window"]["id"] if "window" in task else "every window"
        print("  %s of %s by %s" % (task["task"], window, kept["body"]["model"]))
        for line in task["note"].splitlines() if "note" in task else ["no note"]:
            print("    " + line)
notes = {read_task(kept).get("note") for kept in saved["withHistory"]["requests"]}
print("different notes among the requests made with a history:", len(notes))
EOF
```

### V11

```bash
evidence="$PWD/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence"
(cd service && .venv/bin/python -m pytest clipper -v) > "$evidence/v11-service-tests.txt" 2>&1
echo "exit code of pytest: $?"
tail -1 "$evidence/v11-service-tests.txt"
grep -cE "^clipper/(learning|results|retention)/.* PASSED" "$evidence/v11-service-tests.txt"
grep -E "FAILED|ERROR" "$evidence/v11-service-tests.txt" || echo "no service test failed"
```

### V14

```bash
evidence="$PWD/docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence"
CLIPPER_EVIDENCE_DIR="$evidence" pnpm test:browser e2e/results-captures.spec.ts
echo "exit code of the browser tests: $?"
ls -l "$evidence"/results-*.png "$evidence"/settings-*.png
```

### V16

```bash
git diff --stat 5ab7552 HEAD -- .researches docs/prototype
echo "end of the changes to .researches and docs/prototype"
git diff --stat 5ab7552 HEAD -- web/src/shared/styles/tokens.css web/src/shared/styles/base.css web/src/shared/styles/controls.css web/src/shared/styles/lists.css web/src/shared/styles/shell.css web/src/shared/styles/pages.css web/src/shared/styles/review.css web/src/shared/styles/player.css
echo "end of the changes to the copied stylesheets and the tokens"
git diff --stat 5ab7552 HEAD -- package.json web/package.json pnpm-lock.yaml pnpm-workspace.yaml service/requirements.txt service/requirements-dev.txt service/build-constraints.txt
echo "end of the changes to the package files"
for sheet in base controls lists shell pages review player; do
  cmp "docs/prototype/styles/$sheet.css" "web/src/shared/styles/$sheet.css" && echo "$sheet.css is the prototype's"
done
git check-ignore -v data .cache
git ls-files | grep -iE '\.(mp4|mov|mkv|webm|m4v|avi|wav|aiff|pcm|mp3|m4a|sqlite|sqlite3|db|safetensors|npz|pt|gguf|onnx|bin)$'
git grep -nE 'sk-ant-[A-Za-z0-9_-]{20,}' || echo "no key is tracked"
du -sk fixtures
git diff --name-only 5ab7552 HEAD | grep -vE '^(service|web|scripts|fixtures|docs/missions/clipper-tool)/|^(README|AGENTS)\.md$' || echo "every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md"
grep -rnE "docs/(prototype|missions)" web/src web/next.config.ts service/clipper scripts || echo "the app reads nothing from docs/"
find web -path '*/node_modules' -prune -o -path 'web/.next*' -prune -o \( -name 'proxy.*' -o -name 'middleware.*' \) -print
echo "end of the proxy and middleware files"
```

### V17

```bash
grep -rnE --include='*.ts' --include='*.tsx' --include='*.py' --exclude='test_*.py' --exclude='conftest.py' --exclude='*.test.ts' "https?://" web/src/results web/src/settings service/clipper/learning service/clipper/results service/clipper/retention || echo "the new packages and the two capabilities name no outside address"
pnpm test:browser e2e/own-origin.spec.ts
echo "exit code of the browser tests: $?"
```

### V18

```bash
grep -niE "results tab|views|learn|forget all of it|deleted? after|preview copy|does not do yet|leaves out|CLIPPER_CLOCK_AHEAD_DAYS" README.md
grep -niE "learning|results|retention|history|cleaner|CLIPPER_CLOCK_AHEAD_DAYS" AGENTS.md
```

### V19

```bash
git diff --name-only --diff-filter=AM 5ab7552 HEAD -- '*.ts' '*.tsx' '*.mjs' '*.py' | python3 /Users/work/.claude/skills/coding-standards/hooks/review-files.py --stdin | grep -vE -- '— clean|^$'
cat service/.coding-standards-structure web/.coding-standards-structure
```

### V22

```bash
awk '/^## Start$/ {inside = 1} /^## The Anthropic API key$/ {inside = 0} inside' README.md
echo "end of the README's Start section"
grep -n -B6 -A10 "Clipper is running at" AGENTS.md
```

### V23

```bash
(cd service && .venv/bin/python -m pytest clipper/test_serve.py -v)
echo "exit code of pytest: $?"
pnpm test:browser e2e/forwarding.spec.ts
echo "exit code of the browser tests: $?"
```

### V24

```bash
probe="$(mktemp -d "${TMPDIR:-/tmp}/clipper-m6-forwarding.XXXXXX")"
printf 'import os, sys\ntry:\n    os.setsid()\nexcept OSError:\n    pass\nos.execvp(sys.argv[1], sys.argv[1:])\n' > "$probe/own-group.py"
cat > "$probe/ask.mjs" <<'EOF'
import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const [address, atOnceText, firstPauseText, lastPauseText] = process.argv.slice(2);
const atOnce = Number(atOnceText);

// A browser asks for a connection that stays open, and each request here takes a connection of its own.
function ask() {
  return new Promise((settle) => {
    const sent = http.get(address, { agent: false, headers: { Connection: 'keep-alive' } }, (answer) => {
      const parts = [];
      answer.on('data', (part) => parts.push(part));
      answer.on('end', () => settle(`${answer.statusCode} ${Buffer.concat(parts).toString().slice(0, 40)}`));
    });
    sent.on('error', (error) => settle(`no answer, ${error.code}`));
  });
}

function askTogether() {
  return Promise.all(Array.from({ length: atOnce }, ask));
}

const first = await askTogether();
process.stdout.write(`${first.length} requests sent together, answered 200 with the health: ${first.filter((answer) => answer === '200 {"status":"ok"}').length}\n`);
let asked = 0;
let lost = 0;
for (let pause = Number(firstPauseText); pause <= Number(lastPauseText); pause += 1) {
  await delay(pause);
  const answers = await askTogether();
  const others = answers.filter((answer) => answer !== '200 {"status":"ok"}');
  asked += answers.length;
  lost += others.length;
  if (others.length > 0) process.stdout.write(`after ${pause} ms without a request: ${others.length} of ${answers.length} answered "${others[0]}"\n`);
}
if (asked > 0) process.stdout.write(`requests sent after a pause: ${asked}; not answered 200 with the health: ${lost}\n`);
EOF
CLIPPER_DATA_DIR="$probe/data" CLIPPER_KEY_FILE="$probe/no-key" python3 "$probe/own-group.py" pnpm start > "$probe/start.log" 2>&1 &
tool=$!
for i in $(seq 1 300); do grep -q "Clipper is running at http://localhost:3000" "$probe/start.log" && break; sleep 1; done
grep "Clipper is running" "$probe/start.log"
echo "the service's answer at its own port: $(curl -s -D - -o /dev/null http://127.0.0.1:8765/api/health | tr -d '\r' | grep -i '^connection:')"
echo "the service's answer through the web port: $(curl -s -D - -o /dev/null http://127.0.0.1:3000/api/health | tr -d '\r' | grep -i '^connection:')"
node "$probe/ask.mjs" http://127.0.0.1:3000/api/health 20 1 0
sleep 1
echo "connection ends open at the service port one second later: $(netstat -an -p tcp | grep -cE '127\.0\.0\.1\.8765 .*ESTABLISHED')"
node "$probe/ask.mjs" http://127.0.0.1:3000/api/health 40 4960 4995
echo "lines of the web app about a forward that failed: $(grep -c 'Failed to proxy' "$probe/start.log")"
kill -INT -- "-$tool"
wait "$tool"
echo "exit code of the start command: $?"
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:8765 -sTCP:LISTEN
echo "end of listeners after the interrupt"
rm -rf "$probe"
```

### V25

```bash
planted=web/e2e/zz-fails-on-purpose.spec.ts
trap 'rm -f "$planted"' EXIT
cat > "$planted" <<'EOF'
import { connect } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

import { expect, test } from './support';

test('a test that a validation block planted, and that fails on purpose', async ({ tool }) => {
  await new Promise<void>((settle, reject) => {
    const socket = connect({ host: '127.0.0.1', port: tool.settings.servicePort }, () => {
      socket.write('this is no request\r\n\r\n');
    });
    socket.on('data', () => undefined);
    socket.once('close', () => settle());
    socket.once('error', reject);
  });
  await delay(1000);

  expect('this test').toBe('failed on purpose');
});
EOF
pnpm test:browser e2e/zz-fails-on-purpose.spec.ts
echo "exit code of the planted test: $?"
rm -f "$planted"
trap - EXIT
git status --porcelain web/e2e
echo "end of the changes under web/e2e"
pnpm test:browser e2e/failure-output.spec.ts
echo "exit code of the browser tests: $?"
```
