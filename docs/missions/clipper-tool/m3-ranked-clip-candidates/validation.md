# Validation: m3-ranked-clip-candidates

Run every check from the worktree's root, in the order of the table: V29, added on attempt 2,
comes after V3. A check written as "block" runs the commands under its heading below the table,
with `bash`. Ports 3100, 8865, 3101 and 8866 must be free before V2. The Mac must be on a network
for V1, which fetches packages, and it must stay awake until the last check ends, because the
browser tests time their steps on the clock.

`pnpm test:browser <file>` prints one line per test. Such a check passes when the command exits 0
and the passed tests show everything its `expected` cell lists.

No check needs an API key. A test run saves no key (A58), names a closed local port as the
address of the API (A57), and reaches the stand-in of A59 where a test asks for it. A check that
reads the recorded exchange reads the two evidence files of A73, which V4 saves.

| id | proves | check | expected |
| -- | ------ | ----- | -------- |
| V1 | Setup installs the pinned packages inside the project, the Anthropic SDK among them (A2, A56, R8, R27, R59) | block V1 | The first lines are the listing of the user's key folder, or the message that it does not exist; V24 compares with them. Both commands exit 0. `pip` lists `anthropic 1.11.0`, `docstring_parser 0.18.0`, `jiter 0.17.0`, `sniffio 1.3.1` and `httpx2 2.13.1`. |
| V2 | "The test command passes"; one command runs every check, with no key in the environment (R9, R12) | block V2 | The last line gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `c5c6e25`, and only documents changed before this milestone's first commit, so no gate may fail. |
| V3 | Test data is removed and no tracked file changes (R56) | block V3 | `ls` reports that the folder does not exist. Every path `git status` lists is inside this milestone's folder. |
| V29 | "The test command passes" whichever build of the fixtures it runs on: each fixture video comes out the same in every build and ends where its sound ends (R12, A12, A47, A90) | block V29 | For each of the three videos, the three builds show the same picture length, the same sound length and the same length of the whole file, and the two lines after them end in `True`. The line about the long video and five times the talk gives less than 0.5 s. The exit code of pytest is 0. Its passed tests include one for the talk and one for the long talk that hold the end of the picture against the end of the sound, and the one that holds the long talk against five times the talk. |
| V4 | "The fixture project reaches the ready state"; "With no key saved, the score stage fails with the reason from D30"; the key is entered in Settings (R15, R39, A65, A66, A72) | block V4 | The exit code is 0. The passed tests show: with no key saved the uploaded talk's card reads "Could Not Finish" with "No Anthropic API key is saved. Add one in Settings, then retry.", Retry and "Open Settings", and the stand-in has received no request; "Open Settings" leads to Settings, where the key is saved; Retry then ends on the project's Review tab, and its Library row reads "Ready to review" with its number of candidates. `ls` shows `talk-selection.json` and `selection-requests.json`. Both counts of `grep` are 0. |
| V5 | "candidates that carry every field in D21" (R31, A68, A71) | block V5 | `status: ready`. The two counts of candidates agree. Every candidate's line ends in `every field`. `0` candidates with a field missing or out of range. The ranks run from 1 without a gap. `True` for the totals. |
| V6 | "Every candidate starts on the first word of a transcript sentence and ends on the last word of one" (R29, R30, A61, A67) | block V6 | The longest sentence lasts 30 seconds or less. Both lists of candidates off a sentence's edge are `[]`. |
| V7 | "No candidate is shorter or longer than the chosen length preset" (R33) | the output of block V6 | The preset reads 25 to 60 seconds, the default the fixture project was created with. The list of candidates shorter or longer than the preset is `[]`. |
| V8 | "No two candidates overlap by more than half of the shorter one"; the number of candidates on Auto for a video under ten minutes (R32, R34) | the output of block V6 | The list of pairs is `[]`. The last line ends in `True`. |
| V9 | "The request for pass one contains every window once, and the shortlist size follows D18"; window scores are stored (R28, A62, A63) | block V9 | The windows worked out from the stored transcript and the windows in the requests of pass one are the same list. `True` for every window asked about once, for the stored windows, for no window left out scoring higher, and for each shortlisted window cut once. The line about the shortlist names the same number twice: 3 windows for a video under ten minutes. |
| V10 | "Every selection request names a model identifier from D27, sets no temperature, forces no tool call, and carries an effort setting only for a model that accepts one"; replies as structured output; the fallback; the cached prefix; the brief; the default models (R26, R27, R36, R37, R38, A64) | block V10 | Every request's line shows a key. `requests that break a rule: []`. Pass one names only `claude-sonnet-5-5` and pass two only `claude-opus-5-5`. Both passes show `one shared prefix: True` and `marked for the cache: True`. `True` for the question of pass one. Pass two leaves out all four: intro, outro, sponsor, housekeeping. |
| V11 | "A recorded response that quotes text absent from the transcript loses that clip and keeps the others" (R30, A67) | block V11 | The last line gives exit code 0. Among the passed tests: a clip whose opening words are not in the window is not placed while the other clips of the same recorded reply are; and the run of the two steps on the recorded replies, one of which quotes absent text, ends with the talk's six parts as candidates. |
| V12 | "A malformed response is retried twice, and the stage then fails with a readable reason" (R38, A65) | the output of block V11 | Among the passed tests: an unreadable reply is asked for three times in all and then raises; a reply unreadable once is asked for twice and read; the score step on unreadable replies fails after three requests with "Claude’s reply could not be read, three times in a row. Retry to run this step again."; a reply that leaves a window out, names one twice or names an unknown one counts as unreadable. |
| V13 | "With a recorded replay graph, the candidates that overlap its peaks carry the marker"; the marker breaks ties and changes no score; replay peaks are stored (R35, A70) | the output of block V11 | Among the passed tests: the graph is read from a link's metadata and kept by the fetch step; the opening of a graph and a flat graph give no peak; with the recorded graph the candidate under the peak carries the marker and ranks ahead of the one with the same total, and without the graph the earlier one ranks first; the run of the two steps with the graph stores the peak and the marker. |
| V14 | "With no key saved, the score stage fails with the reason from D30", in the service; a refused key and a declined reply fail with their reasons (R39, A65, A66) | the output of block V11 | Among the passed tests: with no key the score step fails with the missing-key sentence, marked for Settings, after no request, and Retry with a key saved finishes it; a refused key and a declined reply fail marked with their sentences; no answer from the API fails with its own. |
| V15 | "A saved key appears in no response to the browser and in no log line", in the service (R39, A60) | the output of block V11 | Among the passed tests: a saved key is in its file and in no answer; no refusal under `/api/settings` repeats what was sent; the key file has mode 600; with every logger at DEBUG no record holds the key, for a saved key, for one request and for a whole run of the two steps; the start-up settings of a test session name no file in the user's home. |
| V16 | The other rules of selection, by test name (R17, R20, R28, R32, R33, R34, R36, R37, R38, A61, A62, A63, A64, A69) | the output of block V11 | Among the passed tests: sentences end at each end mark, and a long run without one is split at its longest pauses; windows of a three-hour transcript start and end on sentences and share 30 seconds at most; a shortlist of 3, 3, 4, 6, 9, 10 and 10 for 4, 10, 10.5, 35, 70, 71 and 180 minutes; pass one of a three-hour transcript in several requests with every window once; a request to each of the four models with no sampling setting, no tools and no thinking, and to Haiku 4.5 with no effort and no fallback; the model chosen in Settings named in the request; the brief in every request; a clip outside the preset dropped and one on its edge kept; the lower-ranked of two overlapping clips dropped; twelve kept of thirteen on Auto and four with a target of 4; a stop ending a request and a step within two seconds; Retry after a failed cut sending cut requests only; a deleted project leaving no window and no candidate; a database made by M2 upgraded with its projects unchanged. |
| V17 | "A saved key appears in no response to the browser and in no log line", in the browser (R39) | `pnpm test:browser e2e/api-key.spec.ts` | A key saved on the Settings screen takes a link to the talk to ready. No answer the page or the test received holds the key, the pages and the service's addresses for the settings, the projects, the project and its selection among them. Nothing the tool printed holds it. The run's key file holds it with mode 600, and every request the stand-in kept came with a key. After Remove the file is gone and the row is the field again. |
| V18 | The key is entered in Settings, shown masked and removed; its file is outside the repository (R39, A10, A60) | block V18 | The exit code is 0. The passed tests show: Save with nothing typed shows "Paste the key first."; saving shows "Key saved on this Mac" and the row "Saved · ends in" with the key's last four characters and Remove, also after a reload; Remove shows "Key removed" and the field again. The path printed after them is `Library/Application Support/Clipper/anthropic-api-key` in the user's home, and it is not under the folder printed last. |
| V19 | The score and cut steps show their state and progress in the Library and on the status screen, can be stopped and resumed, and survive a restart (R15, R18, A72) | `pnpm test:browser e2e/selection-progress.spec.ts` | The Library row reads "Scoring 4 windows" and then "Cutting clips" over bar values that never fall, and ends at "Ready to review" with its number of candidates. The status screen reads "Step 3 of 4." and "Step 4 of 4." Stop during the score step leaves "Stopped" with a reason that names the step, and Resume ends on the Review tab. After the tool is stopped during the cut step and started again, the Library lists one project, which reaches ready with the same candidates. |
| V20 | What M1 and M2 built still holds now that a project goes on to scoring: importing, the queue, Stop, Retry, Delete, a restart, transcription, the no-speech failure and the model download (R13, R15, R16, R17, R18, R20, R23, R24, R25) | block V20 | The count is 32 or more. The closing line says that no test of these files failed. |
| V21 | The states this milestone adds fit a phone: no sideways scroll and no cut label, at the normal text size and at 200% (R7) | `pnpm test:browser e2e/text-size.spec.ts` | At 390 px and at both sizes, with nothing misfitting: a project stopped for the missing key with "Open Settings", a project being scored, a project being cut, a project failed with the longest sentence of A65, the Library with those and a ready row, and Settings with a saved key, beside the screens M1 and M2 measured. |
| V22 | The web app's rules, by test name (A60, A66, A72) | `pnpm --dir web exec vitest run --reporter=verbose` | Exit 0. Passed tests show: the card of a failure marked for Settings offering "Open Settings" and the card of another failure not; the row of a ready project reading "Ready to review · 6 candidates", and "1 candidate" for one; the sentence of the saved key's row. |
| V23 | Every version is pinned; libraries built into the app carry permissive licences, with tqdm as the one recorded exception; the web app gained no package (R8, R58, A39, A56) | block V23 | `every requirement pinned`. The line `anthropic==1.11.0`. Every licence shown is MIT, BSD, Apache-2.0, PSF, ISC, 0BSD, Zlib, CC0-1.0, CNRI-Python, Unlicense or the LLVM exception, alone or joined. One line shows MPL, and it is `tqdm`. None shows GPL, LGPL or AGPL. Nothing is printed before the closing line about the web app's packages. |
| V24 | "Every check below runs on recorded model responses"; the tool contacts nothing new but the Anthropic API, and no test can reach it; the service's tests never open the user's key file (R12, R57, A57, A58) | block V24 | Every line of the first search is a file of the selection package importing `anthropic`, or `describe_machine.py`, which reads the Mac's own address; none imports another network library. The second search prints one line, the default address in the start-up settings. The third shows the test run and the root `conftest.py` each setting `CLIPPER_ANTHROPIC_SOURCE`. The fourth ends with its closing line: outside tests, nothing reads an Anthropic variable of the shell. The count of requests in the evidence file is the count of them the stand-in kept under the scenario `talk`. The last listing is the same as the first lines of V1. |
| V25 | This milestone's commits touch nothing the boundaries exclude (R4, R11, R55, R56) | block V25 | Nothing is printed before each of the two closing lines about changes. `data` and `.cache` are ignored. No video, audio, database or model file is tracked. No key and no key file is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`. |
| V26 | The README and the agents' instructions cover what this milestone adds (R9, A18, A57, A58, A59) | block V26 | Both files name `CLIPPER_ANTHROPIC_SOURCE`. The README says where the key is saved and kept, that the transcript and no audio or video goes to Anthropic, and that the tests save no key and reach a stand-in. `AGENTS.md` names the selection package, the stand-in and the test key. `fixtures/README.md` describes the recorded replies. |
| V27 | The code follows the standards the hooks enforce, and the service's recorded layout names the new package (A19) | block V27 | Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `selection/`, and no line of it starts with `#`. |
| V28 | The checks left the worktree clean | `git status --porcelain` | Every path listed is inside this milestone's folder. |

## Blocks

### V1

```bash
ls -la "$HOME/Library/Application Support/Clipper" 2>&1
pnpm install --frozen-lockfile
pnpm bootstrap
service/.venv/bin/python -m pip --disable-pip-version-check list 2>/dev/null | grep -iE '^(anthropic|docstring_parser|jiter|sniffio|httpx2) '
```

### V2

```bash
evidence="$PWD/docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence"
mkdir -p "$evidence"
env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_BASE_URL pnpm test 2>&1 | tee "$evidence/v2-test-command.txt"
echo "exit code of pnpm test: ${PIPESTATUS[0]}"
```

### V3

```bash
ls "<the folder V2's closing lines named>"
git status --porcelain
```

### V29

```bash
folder="$(mktemp -d)"
for build in 1 2 3; do node scripts/build-fixtures.mjs "$folder/$build" > /dev/null; done
service/.venv/bin/python - "$folder" <<'EOF'
import json
import subprocess
import sys
from pathlib import Path

FFPROBE = "/opt/homebrew/opt/ffmpeg-full/bin/ffprobe"
ASK = ["-v", "error", "-show_entries", "stream=codec_type,duration:format=duration", "-of", "json"]


def measure(video):
    probe = subprocess.run([FFPROBE, *ASK, str(video)], capture_output=True, text=True, check=True)
    report = json.loads(probe.stdout)
    lengths = {stream["codec_type"]: float(stream["duration"]) for stream in report["streams"]}
    return lengths["video"], lengths["audio"], float(report["format"]["duration"])


folder = Path(sys.argv[1])
whole = {}
for name in ("talk", "long-talk", "silence"):
    builds = [measure(folder / str(build) / f"{name}.mp4") for build in (1, 2, 3)]
    for at, (picture, sound, length) in enumerate(builds, 1):
        print("%s, build %d: picture %.3f s, sound %.3f s, whole file %.3f s" % (name, at, picture, sound, length))
    print("%s: the three builds have the same lengths: %s" % (name, len(set(builds)) == 1))
    near = all(abs(picture - sound) <= 0.2 for picture, sound, _ in builds)
    print("%s: the picture ends within 0.2 s of the sound in every build: %s" % (name, near))
    whole[name] = [length for _, _, length in builds]
worst = max(abs(long - 5 * talk) for long in whole["long-talk"] for talk in whole["talk"])
print("the long video against five times the talk, the worst pair of builds: %.3f s apart" % worst)
EOF
(cd service && CLIPPER_FIXTURES_DIR="$folder/1" .venv/bin/python -m pytest clipper/transcription/test_built_fixtures.py -v)
echo "exit code of pytest: $?"
rm -rf "$folder"
```

### V4

```bash
evidence="$PWD/docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence"
CLIPPER_EVIDENCE_DIR="$evidence" pnpm test:browser e2e/selection.spec.ts
echo "exit code of the browser tests: $?"
ls -l "$evidence"
grep -c "sk-ant-" "$evidence/talk-selection.json" "$evidence/selection-requests.json"
```

### V5

```bash
service/.venv/bin/python - docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/talk-selection.json <<'EOF'
import json
import re
import sys

saved = json.load(open(sys.argv[1]))
candidates = saved["selection"]["candidates"]
HOOK_TYPES = ("number", "story", "list", "hot-take", "confession", "contrarian", "none")
FLAGS = (None, "needs-context", "not-recommended")


def list_faults(candidate):
    faults = []
    start, end = candidate.get("startSeconds"), candidate.get("endSeconds")
    if not (isinstance(start, (int, float)) and isinstance(end, (int, float)) and 0 <= start < end):
        faults.append("start and end")
    parts = [(candidate.get("scores") or {}).get(name) for name in ("hook", "arc", "value", "share")]
    if not all(isinstance(part, int) and 0 <= part <= 25 for part in parts):
        faults.append("subscores")
    elif candidate.get("total") != sum(parts):
        faults.append("total")
    reason = (candidate.get("reason") or "").strip()
    if not reason or len(re.findall(r"[.!?…。？！](?:\s|$)", reason)) != 1:
        faults.append("reason")
    if not 1 <= len((candidate.get("hookTitle") or "").split()) <= 10:
        faults.append("hook title")
    if candidate.get("hookType") not in HOOK_TYPES:
        faults.append("hook type")
    for platform in ("tiktok", "reels", "shorts"):
        text = (candidate.get("platforms") or {}).get(platform) or {}
        if not (text.get("title") or "").strip() or not (text.get("description") or "").strip():
            faults.append(platform)
    if candidate.get("flag") not in FLAGS:
        faults.append("flag")
    return faults


print("status:", saved["project"]["status"])
print("candidates:", len(candidates), "| the project's own count:", saved["project"]["candidateCount"])
for candidate in candidates:
    faults = list_faults(candidate)
    shown = (candidate.get("rank"), candidate.get("total"), candidate.get("hookType"), candidate.get("flag"))
    print("rank %s, total %s, %s, flag %s:" % shown, ", ".join(faults) or "every field")
print("candidates with a field missing or out of range:", sum(1 for candidate in candidates if list_faults(candidate)))
print("ranks:", [candidate.get("rank") for candidate in candidates])
totals = [candidate.get("total") for candidate in candidates]
print("totals in the order of the ranks never rise:", totals == sorted(totals, reverse=True))
EOF
```

### V6

```bash
service/.venv/bin/python - docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/talk-selection.json <<'EOF'
import json
import re
import sys

saved = json.load(open(sys.argv[1]))
selection = saved["selection"]
candidates = selection["candidates"]
SENTENCE_END = re.compile(r"[.?!…。？！]+[\"'”’»)\]]*$")
sentences, current = [], []
for word in saved["transcript"]["words"]:
    current.append(word)
    if SENTENCE_END.search(word["text"].strip()):
        sentences.append(current)
        current = []
if current:
    sentences.append(current)
longest = max(sentence[-1]["end"] - sentence[0]["start"] for sentence in sentences)
first_words = {round(sentence[0]["start"], 2) for sentence in sentences}
last_words = {round(sentence[-1]["end"], 2) for sentence in sentences}
print("sentences:", len(sentences), "| the longest lasts %.2f s" % longest)
off_start = [c["rank"] for c in candidates if round(c["startSeconds"], 2) not in first_words]
off_end = [c["rank"] for c in candidates if round(c["endSeconds"], 2) not in last_words]
print("candidates that do not start on the first word of a sentence:", off_start)
print("candidates that do not end on the last word of a sentence:", off_end)
limits = selection["clipSeconds"]
print("the preset of the project: %s to %s seconds" % (limits["min"], limits["max"]))
for candidate in candidates:
    length = candidate["endSeconds"] - candidate["startSeconds"]
    print("rank %s: %.2f to %.2f, %.2f s" % (candidate["rank"], candidate["startSeconds"], candidate["endSeconds"], length))
outside = [c["rank"] for c in candidates if not limits["min"] <= round(c["endSeconds"] - c["startSeconds"], 2) <= limits["max"]]
print("candidates shorter or longer than the preset:", outside)
pairs = []
for index, first in enumerate(candidates):
    for second in candidates[index + 1:]:
        shared = min(first["endSeconds"], second["endSeconds"]) - max(first["startSeconds"], second["startSeconds"])
        shorter = min(first["endSeconds"] - first["startSeconds"], second["endSeconds"] - second["startSeconds"])
        if shared > shorter / 2:
            pairs.append((first["rank"], second["rank"]))
print("pairs that overlap by more than half of the shorter one:", pairs)
print("candidates:", len(candidates), "| at least 2 and at most 12:", 2 <= len(candidates) <= 12)
EOF
```

### V9

```bash
evidence=docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence
service/.venv/bin/python - "$evidence/talk-selection.json" "$evidence/selection-requests.json" <<'EOF'
import json
import math
import re
import sys

saved = json.load(open(sys.argv[1]))
requests = json.load(open(sys.argv[2]))
SENTENCE_END = re.compile(r"[.?!…。？！]+[\"'”’»)\]]*$")
sentences, current = [], []
for word in saved["transcript"]["words"]:
    current.append(word)
    if SENTENCE_END.search(word["text"].strip()):
        sentences.append((current[0]["start"], current[-1]["end"]))
        current = []
if current:
    sentences.append((current[0]["start"], current[-1]["end"]))

expected, first = [], 0
while True:
    last = first
    while last + 1 < len(sentences) and sentences[last + 1][1] - sentences[first][0] <= 90:
        last += 1
    if sentences[-1][1] - sentences[last][1] < 30:
        last = len(sentences) - 1
    expected.append((first + 1, last + 1))
    if last == len(sentences) - 1:
        break
    mark = sentences[last][1] - 30
    first = next(index for index in range(first + 1, len(sentences)) if sentences[index][0] >= mark)


def read_task(request):
    return json.loads(request["body"]["messages"][0]["content"][-1]["text"])


tasks = [read_task(request) for request in requests]
asked = [window for task in tasks if task["task"] == "score" for window in task["windows"]]
stored = saved["selection"]["windows"]
print("windows worked out from the stored transcript:", ["w%02d %d-%d" % (at + 1, *span) for at, span in enumerate(expected)])
print("windows in the requests of pass one:          ", ["%s %d-%d" % (w["id"], w["firstSentence"], w["lastSentence"]) for w in asked])
once = [(w["firstSentence"], w["lastSentence"]) for w in asked] == expected and len({w["id"] for w in asked}) == len(asked)
print("every window is asked about once:", once)
print("windows stored with their scores:", [(w["id"], w["score"]) for w in stored])
whole = all(isinstance(w["score"], int) and 0 <= w["score"] <= 100 for w in stored)
print("the stored windows are the windows asked about, each with a score from 0 to 100:", [w["id"] for w in stored] == [w["id"] for w in asked] and whole)
minutes = saved["project"]["durationSeconds"] / 60
size = min(len(expected), 10, max(3, 2 + math.ceil(minutes / 10)))
shortlist = [w["id"] for w in stored if w["isShortlisted"]]
taken = [w["score"] for w in stored if w["isShortlisted"]]
left_out = [w["score"] for w in stored if not w["isShortlisted"]]
print("the video lasts %.1f minutes, so the shortlist holds %d windows; the stored one holds %d: %s" % (minutes, size, len(shortlist), shortlist))
print("no window left out scored higher than one taken:", not left_out or max(left_out) <= min(taken))
cut = [task["window"]["id"] for task in tasks if task["task"] == "cut"]
print("windows cut in pass two:", cut, "| each shortlisted window once:", sorted(cut) == sorted(shortlist))
EOF
```

### V10

```bash
service/.venv/bin/python - docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/selection-requests.json <<'EOF'
import json
import sys

requests = json.load(open(sys.argv[1]))
MODELS = ("claude-fable-5-1", "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-4-5")
NOT_ALLOWED = ("temperature", "top_p", "top_k", "tool_choice", "tools")
FALLBACK = "server-side-fallback-2026-07-01"


def read_task(body):
    return json.loads(body["messages"][0]["content"][-1]["text"])


faults = []
for at, request in enumerate(requests, 1):
    body = request["body"]
    task = read_task(body)
    output = body.get("output_config") or {}
    takes_effort = body["model"] != "claude-haiku-4-5"
    shown = (at, task["task"], body["model"], output.get("effort"), body.get("fallbacks"), request.get("beta"), request.get("hasKey"))
    print("%d %-5s %-18s effort=%s fallbacks=%s beta=%s key=%s" % shown)
    if body["model"] not in MODELS:
        faults.append((at, "model"))
    if any(name in body for name in NOT_ALLOWED):
        faults.append((at, "a setting that is not allowed"))
    if ("effort" in output) != takes_effort:
        faults.append((at, "effort"))
    if (output.get("format") or {}).get("type") != "json_schema":
        faults.append((at, "structured output"))
    if (body.get("fallbacks") == "default") != takes_effort or (FALLBACK in (request.get("beta") or "")) != takes_effort:
        faults.append((at, "fallback"))
    if task.get("brief") != "Advice a shop owner can use." or not task.get("language"):
        faults.append((at, "brief or language"))
    if not request.get("hasKey"):
        faults.append((at, "key"))
print("requests that break a rule:", faults)
for name in ("score", "cut"):
    bodies = [request["body"] for request in requests if read_task(request["body"])["task"] == name]
    prefixes = {json.dumps([body["system"], body["messages"][0]["content"][:-1]], sort_keys=True) for body in bodies}
    marked = all(body["messages"][0]["content"][-2].get("cache_control") == {"type": "ephemeral"} for body in bodies)
    shown = (name, len(bodies), sorted({body["model"] for body in bodies}), len(prefixes) == 1, marked)
    print("%s: %d requests, models %s, one shared prefix: %s, marked for the cache: %s" % shown)
texts = {}
for name in ("score", "cut"):
    systems = [request["body"]["system"] for request in requests if read_task(request["body"])["task"] == name]
    texts[name] = json.dumps(systems).lower()
print("pass one asks about the opening two seconds and a viewer with no context:", "two seconds" in texts["score"] and "no context" in texts["score"])
print("pass two leaves out:", [word for word in ("intro", "outro", "sponsor", "housekeeping") if word in texts["cut"]])
EOF
```

### V11

```bash
evidence="$PWD/docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence"
(cd service && .venv/bin/python -m pytest clipper/selection clipper/settings clipper/fetching clipper/pipeline clipper/projects clipper/storage -v) 2>&1 | tee "$evidence/v11-service-tests.txt"
echo "exit code of pytest: ${PIPESTATUS[0]}"
```

### V18

```bash
pnpm test:browser e2e/settings.spec.ts
echo "exit code of the browser tests: $?"
(cd service && env -u CLIPPER_KEY_FILE .venv/bin/python -c "from clipper.settings import StartupSettings; print(StartupSettings().key_file)")
git rev-parse --show-toplevel
```

### V20

```bash
saved=docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/v2-test-command.txt
files='e2e/(addresses|delete-project|halt-project|import-link|import-upload|library|model-download|no-speech|queue|queue-through-tool|restart|transcribe|transcribe-restart)\.spec\.ts'
grep -E "$files" "$saved" | grep -c '✓'
grep -E "$files" "$saved" | grep -v '✓' || echo "no test of these files failed"
```

### V23

```bash
grep -vE '^(#|-r |[[:space:]]*$)' service/requirements.txt service/requirements-dev.txt | grep -v '==' || echo "every requirement pinned"
grep -iE '^anthropic==' service/requirements.txt
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
git diff --stat 9715bcb HEAD -- package.json web/package.json pnpm-lock.yaml pnpm-workspace.yaml
echo "end of the changes to the web app's packages"
```

### V24

```bash
grep -rnE --include='*.py' '^[[:space:]]*(import|from)[[:space:]]+(anthropic|httpx2|httpx|urllib\.request|urllib3|http\.client|socket|requests|aiohttp)' service/clipper/selection service/clipper/settings | grep -vE '/(test_[^/]*|conftest)\.py:'
grep -rnI --exclude-dir=__pycache__ "api\.anthropic\.com" service/clipper scripts web/src web/e2e fixtures | grep -v '/test_'
grep -n "CLIPPER_ANTHROPIC_SOURCE" scripts/prepare-test-run.mjs service/clipper/conftest.py
grep -rnE "ANTHROPIC_(API_KEY|AUTH_TOKEN|BASE_URL)" service/clipper scripts web/src | grep -v '/test_' || echo "outside tests, nothing reads an Anthropic variable of the shell"
service/.venv/bin/python - docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/selection-requests.json <<'EOF'
import json
import sys

requests = json.load(open(sys.argv[1]))
print("requests in the evidence file:", len(requests), "| kept by the stand-in under the scenario talk:", sum(1 for request in requests if "talk" in request["scenario"]))
EOF
ls -la "$HOME/Library/Application Support/Clipper" 2>&1
```

### V25

```bash
git diff --stat 9715bcb HEAD -- .researches docs/prototype
echo "end of the changes to .researches and docs/prototype"
git diff --stat 9715bcb HEAD -- web/src/shared/styles/tokens.css web/src/shared/styles/base.css web/src/shared/styles/controls.css web/src/shared/styles/lists.css web/src/shared/styles/shell.css web/src/shared/styles/pages.css
echo "end of the changes to the copied stylesheets"
git check-ignore -v data .cache
git ls-files | grep -iE '\.(mp4|mov|mkv|webm|m4v|avi|wav|aiff|pcm|mp3|m4a|sqlite|sqlite3|db|safetensors|npz|pt|gguf|onnx|bin)$' || echo "no video, audio, database or model file is tracked"
git grep -nE 'sk-ant-[A-Za-z0-9_-]{20,}' || echo "no key is tracked"
git ls-files | grep -E '(^|/)anthropic-api-key$' || echo "no key file is tracked"
du -sk fixtures
git diff --name-only 9715bcb HEAD | grep -vE '^(service|web|scripts|fixtures|docs/missions/clipper-tool)/|^(README|AGENTS)\.md$' || echo "every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md"
grep -rnE "docs/(prototype|missions)" web/src web/next.config.ts service/clipper scripts || echo "the app reads nothing from docs/"
```

### V26

```bash
grep -n "CLIPPER_ANTHROPIC_SOURCE" README.md AGENTS.md
grep -niE "api key|anthropic|stand-in" README.md
grep -niE "selection|stand-in|sk-ant-test" AGENTS.md
grep -niE "recorded|scenario|stand-in" fixtures/README.md
```

### V27

```bash
git diff --name-only --diff-filter=AM 9715bcb HEAD -- '*.ts' '*.tsx' '*.mjs' '*.py' | python3 /Users/work/.claude/skills/coding-standards/hooks/review-files.py --stdin | grep -vE -- '— clean|^$'
cat service/.coding-standards-structure
```
