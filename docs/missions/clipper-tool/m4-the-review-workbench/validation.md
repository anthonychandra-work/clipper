# Validation: m4-the-review-workbench

Run every check from the worktree's root, in the order of the table. A check written as "block"
runs the commands under its heading below the table, with `bash`. Ports 3100 and 8865 must be free
before V1. The Mac must stay awake until the last check ends, because the browser tests time
their steps on the clock and play video.

`pnpm test:browser <file>` prints one line per test. Such a check passes when the command exits 0
and the passed tests show everything its `expected` cell lists.

No check needs an API key. The Review checks share one ready project, made from the fixture talk
with the recorded replies (A103). A check that reads the saved review reads `talk-review.json`,
which V18 saves.

| id | proves | check | expected |
| -- | ------ | ----- | -------- |
| V1 | "The test command passes"; one command runs every check (R9, R12) | block V1 | The last line gives exit code 0. The output reports Fixtures, Ruff, mypy, pytest, ESLint, Web build, TypeScript check, Vitest and Playwright, each passed. Its closing lines name the folder that held the run's data, give its size as under 2 GB and say it was removed. Baseline: all nine passed at `ddea123` (M3's `proof.md`, V2), and only mission documents changed before this milestone's first commit, so no gate may fail. |
| V2 | Test data is removed and no tracked file changes (R56) | block V2 | `ls` reports that the folder does not exist. Every path `git status` lists is inside this milestone's folder. |
| V3 | "Every check below runs as a browser test on the fixture project" (R12, A103) | block V3 | Each of the eight lines shows at least one passed test and `0 not passed`. The line from `ready-talk.ts` shows the shared project being made from `talk.mp4`. The last number, the uses of the shared project in the Review tests, is above 0. |
| V4 | The Review tab works on real data: the filtered candidate list, and the source timeline with window scores and clip markers (R3, R35, R44, A99, A100, A101) | `pnpm test:browser e2e/review-list.spec.ts` | At 1360 px the talk's Review tab lists its six clips in the order of their ranks, each with its title, its start, its length, its tags and its total, under filters that read 6, 6, 0 and 0, and says under the list that the score orders clips inside this video and does not forecast views. The source timeline shows four bars, three of them highlighted, and six numbered pins in the order of the clips' starts. A row and a pin each lead to their clip's address, a reload keeps it, and an address that names no clip leads to the list. At 390 px the Review address is the list. |
| V5 | "Selecting a candidate shows its reason, its four subscores, its total and its rank"; the flag, the replay marker and the editable title (R31, R35, R40, R44) | `pnpm test:browser e2e/review-inspect.spec.ts` | Choosing a candidate shows its reason, its four subscores out of 25, its total out of 100 and its rank among the six, each equal to what the service holds, with the sentence that the score orders clips inside this video and does not forecast views. The clip flagged as needing context and the one flagged as not recommended each show their sentence. A clip under a replay peak shows "Replay peak" in the list and the note in the inspector. A typed title is in the list at once and in both places after a reload. |
| V6 | "The sentence controls move the in point and the out point by one transcript sentence, and the length shown changes to match"; every change is stored (R41, A93) | `pnpm test:browser e2e/review-trim.spec.ts` | Each sentence step, earlier and later, on the in point and on the out point, moves that point to the neighbouring sentence's time as the service holds it, and the length shown is the difference of the two times shown. A moved point is still there after a reload. |
| V7 | "The 0.2-second controls stop at one second either way, and every control at its limit is disabled" (R41, A93) | the output of V6 | Five 0.2-second steps move a point by one second and the sixth is switched off, earlier and later. The sentence steps are switched off at both ends of the clip's reach and where the two points meet. |
| V8 | "The length reading states whether the clip is inside the preferred band, inside the limits, too short or too long" (R33, A94) | the output of V6 | The reading says "inside the preferred 25–50 s band", "inside the 25–60 s limits", "shorter than the 25 s minimum" and "longer than the 60 s maximum", each for a clip of that length. |
| V9 | "The filmstrip shows frames from the fixture video. Dragging a handle moves that point to a sentence boundary, and the times and the length shown change to match"; the cleared flag (R41, A93, A95) | the output of V6 | Every frame of the strip is a loaded picture whose colours are the talk's colour bars. A handle dragged along the strip leaves its point on the start or the end of the sentence nearest the place it was let go, and the time, the length and the handle's own words change to match. The "needs context" flag goes when the in point moves one sentence earlier and returns when it moves back. |
| V10 | "A kept clip, a rejected clip with its reason, and an edited title are all still there after a reload, and the counts in the list filters and in the Library row match" (R40, A92) | `pnpm test:browser e2e/review-decide.spec.ts` | After a reload the first clip is kept, the second is rejected with the reason it was given, and the third has its new title. The filters read 6, 4, 1 and 1, the Export tab reads 1, and the Library row reads "Ready to review · 6 candidates, 1 kept, 1 rejected". |
| V11 | "Reject opens the menu from D31. Choosing a reason marks the clip rejected with that reason, and "Undo Reject" clears it" (R40) | the output of V10 | Reject opens a menu with "Cut Off Mid-Thought", "Not Interesting", "Needs Earlier Context", "Repeats Another Clip" and "No Reason". Each choice leaves the clip rejected with that choice ticked when the menu opens again, and the menu of a rejected clip also offers "Undo Reject", which leaves the clip undecided. Keep keeps a clip and, pressed again, leaves it undecided. Next goes through the clips of the shown group and back to its first. |
| V12 | "Play moves through the clip and stops at the out point, and the caption shown at a given moment is the words spoken at that moment"; the preview copy reaches the browser through the web app (R19, R42, A91, A97, A98) | `pnpm test:browser e2e/review-preview.spec.ts` | A range request for the preview copy through the web port answers 206, and a video element plays it. On the Review tab, Play moves the playhead forward, and the clip stops at its out point with the video's time within 0.3 seconds of it. At moments set with the slider and at moments read while the clip plays, the caption holds the word the stored transcript gives for that moment, with no more than three, one and six words in the three styles. |
| V13 | The preview shows the source footage in a 9:16 frame with the chosen framing, the hook title, the safe zones and captions in Inter, and the look applies to the whole project (R42, R46, A15, A96, A98) | the output of V12 | The three framings draw three different pictures, each holding the talk's colour bars. The hook title shows at one second and not at four, and never with its switch off. The safe zones follow their switch. The caption's typeface is Inter, served by the tool. A changed look is the same on another clip and after a reload. |
| V14 | A project whose source is gone shows a notice in place of the preview (R45, A98) | the output of V12 | With the project's preview copy moved out of its place in the test's data folder, the Review tab shows "Preview unavailable. The source video was deleted to free space." in place of the preview, and a decision and a step of a point still work. |
| V15 | "At 390 px the candidate list shows first; opening a clip shows the detail with the fixed bar of Reject, Keep and Next; the back control returns to the list" (R43, R6, A99) | `pnpm test:browser e2e/review-phone.spec.ts` | At 390 px the Review address shows the candidate list, above the source timeline, and no preview. A row opens the clip's screen at its top, with the preview, the inspector and a bar fixed to the bottom of the window that holds Reject, Keep and Next. The back control returns to the list. Left by the back control and by the browser's Back, the list is where it was scrolled to. |
| V16 | "Each tab and each clip opens at its own address, and a reload returns to it" (R6) | the output of V15 | The Review, Export and Results tabs and a clip each open at their own address, and a reload shows the same tab and the same clip. Forward after Back returns to the clip. |
| V17 | "At 390 px, scrolling the clip screen past the preview pins it under the top bar, and it still plays" (R43) | the output of V15 | With the clip playing, scrolling its screen past the preview pins a strip with the picture, Pause, the slider and the clock directly under the top bar. The video's time goes on advancing, the strip's Pause stops it and its Play starts it again, and scrolling back up returns the preview to the page. |
| V18 | "Screen captures at 390 px and 1360 px, in light and in dark, are saved" (A20, A103) | block V18 | The exit code is 0. The evidence folder holds eight files named `review-list-<width>-<theme>.png` and `review-clip-<width>-<theme>.png`, for `390` and `1360`, in `light` and `dark`, and `talk-review.json`. The count of `grep` is 0. |
| V19 | The Review tab reproduces the prototype's screens with the talk's own data, on phone and desktop, in light and in dark (R3, R5) | Open every capture from V18 and record in the proof what each shows. | `review-list` at 390: the project's title above the Review, Export and Results control, with 1 beside Export; "Candidates" with four filters and their counts; six rows, each with a rank, a title, a time and a length, tags and a score, the first marked "Kept" and the sixth "Rejected"; the sentence about the score; "Source Video" with bars and six numbered pins; the tab bar. `review-clip` at 390: "Clip 4 of 6" in the top bar beside "Clips"; the talk's colour bars inside a 9:16 frame with a caption and the hook title; the title field; the flag's sentence with "Start One Sentence Earlier"; "Why This Clip" with four bars and the line with the total and the rank; "In and Out Points" with the length reading, a filmstrip of colour-bar frames with a handle at each end of the clip, and the In and Out rows with their steps; "Look"; "Transcript"; and a bar at the bottom with Reject, Keep and Next. At 1360: the sidebar; a toolbar with the three tabs, the More button, Reject, Keep and Next; the timeline above the candidates in the left pane; the preview beside the inspector; the first clip marked in `review-list` and the fourth in `review-clip`. Dark captures have dark surfaces and light text. No capture shows clipped or overlapping text. |
| V20 | "On the Review tab at 390 px no screen scrolls sideways and no label is cut off at 200% text size, and no control has a tap area under 44 px" (R7, A101, A103) | `pnpm test:browser e2e/review-fit.spec.ts` | For the list, a clip, the flagged clip, a clip with the reject menu open and a clip with the preview pinned, on the talk and on the presented review of twelve clips, 180 windows and long titles, at 390 px: at the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen and no label is cut; scrolled to its end, a screen's last line lies above the bar at the bottom; and no control has a tap area under 44 px. The test of the tap measure shows that it finds a control made too small on purpose. |
| V21 | Text and its background differ by at least 4.5 to 1 on the Review tab, in light and in dark (R7, A102) | the output of V20 | On the same screens at 390 px, and on the list beside a clip and beside the flagged clip at 1360 px, in light and in dark, no text measures under 4.5 to 1. The test of the contrast measure shows that it finds a text made too faint on purpose. |
| V22 | The review the browser receives agrees with the stored transcript: each clip's times, the sentences its points can reach, and its captions (R41, R42, A91, A93, A97) | block V22 | `status: ready`. Six clips, the project's own count 6. The limits read 25 to 60 seconds with 25 to 50 preferred. Four windows, three of them shortlisted. Every clip's line ends in `as the transcript says`, and the list of clips that differ is `[]`. The ranks run from 1 to 6. The kept and the rejected counts of the review are the project's: 1 and 1. |
| V23 | The service's rules for the review, by test name (R20, R40, R41, R45, A91 to A97) | block V23 | The last line gives exit code 0. Among the passed tests: a kept, a rejected and an undecided clip stored and read back, with the project's two counts following; a title stored without the blanks around it and an empty one bringing back selection's; the reach of the talk's six parts; five nudge steps allowed and a sixth refused; refusals for an in point after the out point, a sentence outside the reach, a point outside the video and a clip under one second, each answered without repeating what was sent and storing nothing; captions of three, one and six words that end with their sentence, with the highlighted word by A97's rule; twelve frames for each candidate, each from its own moment of a video whose picture changes; a frame that cannot be taken left out without failing the step; the cut step unchanged when handed no frame maker; the look stored and read back; a byte range of the preview copy answered 206 and a missing preview copy 404; a review without the preview copy saying so; a project without candidates answering with no clips; a database made by M3 upgraded with its projects and candidates unchanged; a deleted project leaving no review, no look and no frame; cutting again leaving no review. |
| V24 | The web app's rules, by test name (A92, A93, A94, A99, A101) | `pnpm --dir web exec vitest run --reporter=verbose` | Exit 0. Passed tests show: a clip's times from its sentences and nudges; the steps allowed at each limit of A93; the four readings of a length, and three for a preset without a preferred band; when a flag shows; the counts and groups of the four filters; the next clip in a group and from its last to its first; pins moved apart by no more than a tap area needs, twelve crowded ones among them; the caption for a moment before, inside and after a caption; the row of a ready project with its kept and rejected counts; the three time formats; a change shown at once, replaced by the service's answer, and brought back when the service refuses. |
| V25 | What M1 to M3 built still holds beside the Review tab: importing, the queue, Stop, Retry, Delete, a restart, transcription, selection, the key, Settings, the layout and the text fit of every earlier screen (R13 to R25, R39) | block V25 | The count is 91 or more. The closing line says that no test of these files failed. |
| V26 | This milestone's commits touch nothing the boundaries exclude, add no package, and leave the copied stylesheets as the prototype's (R4, R8, R55, R56, R58, R59) | block V26 | Nothing is printed before each of the three closing lines about changes. Seven lines say that a stylesheet is the prototype's. `data` and `.cache` are ignored. No video, audio, database or model file is tracked. No key is tracked. `fixtures` is under 20,480 KB. Every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, `README.md` or `AGENTS.md`. The app reads nothing from `docs/`. |
| V27 | Inter is stored in the repository with its licence, and the Review tab asks for nothing outside the tool (R42, R57, R58, A15) | block V27 | The first checksum is `4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf`. The licence's first lines name the Inter Project Authors and the SIL Open Font License, Version 1.1. `git ls-files` lists the font and its licence and nothing else under `web/public`. The Review tab and the stylesheets name no outside address. The exit code of the browser tests is 0, and their passed tests show the Review screens asking only the tool. |
| V28 | The README and the agents' instructions cover what this milestone adds (R9, A18) | block V28 | The README says what the Review tab does and that the preview is an approximation of the export, and its section on what this version does not do yet begins after the review. `AGENTS.md` names the review package, the review capability, the layout that keeps the tab in place, the shared ready talk, the three measures and Inter. |
| V29 | The code follows the standards the hooks enforce, and both recorded layouts name the new parts (A19) | block V29 | Every finding printed carries `[advisory]`; none appears without it. The service's layout lists `review/`. The web app's layout lists `review/` with nine use cases under it. No line of either starts with `#`. |
| V30 | The checks left the worktree clean | `git status --porcelain` | Every path listed is inside this milestone's folder. |

## Blocks

### V1

```bash
evidence="$PWD/docs/missions/clipper-tool/m4-the-review-workbench/evidence"
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
saved=docs/missions/clipper-tool/m4-the-review-workbench/evidence/v1-test-command.txt
for spec in review-list review-inspect review-decide review-trim review-preview review-phone review-fit review-captures; do
  passed=$(grep -E "e2e/$spec\.spec\.ts" "$saved" | grep -c '✓')
  failed=$(grep -E "e2e/$spec\.spec\.ts" "$saved" | grep -vc '✓')
  echo "$spec: $passed passed, $failed not passed"
done
grep -n "talk.mp4" web/e2e/support/ready-talk.ts
grep -n "readyTalk" web/e2e/review-*.spec.ts | wc -l
```

### V18

```bash
evidence="$PWD/docs/missions/clipper-tool/m4-the-review-workbench/evidence"
CLIPPER_EVIDENCE_DIR="$evidence" pnpm test:browser e2e/review-captures.spec.ts
echo "exit code of the browser tests: $?"
ls -l "$evidence"/review-*.png "$evidence/talk-review.json"
grep -c "sk-ant-" "$evidence/talk-review.json"
```

### V22

```bash
service/.venv/bin/python - docs/missions/clipper-tool/m4-the-review-workbench/evidence/talk-review.json <<'EOF'
import json
import re
import sys

saved = json.load(open(sys.argv[1]))
review, words = saved["review"], saved["transcript"]["words"]
SENTENCE_END = re.compile(r"[.?!…。？！]+[\"'”’»)\]]*$")
SIZES = {"keyword": 3, "wordByWord": 1, "plain": 6}
NEAR = 0.011
sentences, current = [], []
for word in words:
    current.append(word)
    if SENTENCE_END.search(word["text"].strip()):
        sentences.append(current)
        current = []
if current:
    sentences.append(current)


def bare(text):
    return re.sub(r"^\W+|\W+$", "", text.strip()).lower()


def group_words(spoken, size):
    groups, group = [], []
    for sentence in spoken:
        for at, word in enumerate(sentence):
            group.append(word)
            if len(group) == size or at == len(sentence) - 1:
                groups.append(group)
                group = []
    return groups


def is_strong(text):
    return bool(re.search(r"\d", text)) or len(bare(text)) >= 6


def list_caption_faults(clip, style, spoken):
    wanted = group_words(spoken, SIZES[style])
    shown = clip["captions"][style]
    if [[bare(w["text"]) for w in c["words"]] for c in shown] != [[bare(w["text"]) for w in g] for g in wanted]:
        return ["%s words" % style]
    faults = []
    for caption, group in zip(shown, wanted):
        if abs(caption["startSeconds"] - (group[0]["start"] - clip["startSeconds"])) > NEAR:
            faults.append("%s time" % style)
        marked = [w["text"] for w in caption["words"] if w["isHighlighted"]]
        strong = [w["text"] for w in caption["words"] if is_strong(w["text"])]
        longest = max((len(bare(text)) for text in strong), default=0)
        if style != "keyword" and marked:
            faults.append("%s highlight" % style)
        if style == "keyword" and (len(marked) != min(1, len(strong)) or any(len(bare(text)) != longest for text in marked)):
            faults.append("keyword highlight")
    return sorted(set(faults))


def list_faults(clip):
    faults = []
    spoken = sentences[clip["startSentence"] - 1:clip["endSentence"]]
    start = spoken[0][0]["start"] + 0.2 * clip["startNudge"]
    end = spoken[-1][-1]["end"] + 0.2 * clip["endNudge"]
    if abs(clip["startSeconds"] - start) > NEAR or abs(clip["endSeconds"] - end) > NEAR:
        faults.append("times")
    first = max(1, clip["cutStartSentence"] - 3)
    last = min(len(sentences), clip["cutEndSentence"] + 3)
    if [s["number"] for s in clip["sentences"]] != list(range(first, last + 1)):
        faults.append("reach")
    for given in clip["sentences"]:
        whole = sentences[given["number"] - 1]
        same_text = given["text"] == "".join(w["text"] for w in whole).strip()
        same_times = abs(given["startSeconds"] - whole[0]["start"]) <= NEAR and abs(given["endSeconds"] - whole[-1]["end"]) <= NEAR
        if not (same_text and same_times):
            faults.append("sentence %d" % given["number"])
    for style in SIZES:
        faults += list_caption_faults(clip, style, spoken)
    if len(clip["frames"]) != 12 or not all(isinstance(frame, str) and frame.startswith("/api/") for frame in clip["frames"]):
        faults.append("frames")
    return faults


print("status:", saved["project"]["status"], "| clips:", len(review["clips"]), "| the project's own count:", saved["project"]["candidateCount"])
print("sentences in the stored transcript:", len(sentences))
limits = review["clipSeconds"]
print("limits: %s to %s seconds, preferred %s" % (limits["min"], limits["max"], limits["preferred"]))
print("look:", review["look"], "| preview copy on the Mac:", review["hasPreview"])
print("windows:", [(w["id"], w["score"], w["isShortlisted"]) for w in review["windows"]])
for clip in review["clips"]:
    faults = list_faults(clip)
    length = clip["endSeconds"] - clip["startSeconds"]
    counts = tuple(len(clip["captions"][style]) for style in SIZES)
    shown = (clip["id"], clip["rank"], clip["decision"], clip["startSentence"], clip["endSentence"], length) + counts
    print("%s rank %s, %s, sentences %s-%s, %.2f s, captions %d/%d/%d:" % shown, ", ".join(faults) or "as the transcript says")
print("clips that differ from the transcript:", [clip["id"] for clip in review["clips"] if list_faults(clip)])
print("ranks:", [clip["rank"] for clip in review["clips"]])
kept = sum(1 for clip in review["clips"] if clip["decision"] == "keep")
rejected = sum(1 for clip in review["clips"] if clip["decision"] == "reject")
print("kept and rejected in the review: %d and %d | in the project: %d and %d" % (kept, rejected, saved["project"]["keptCount"], saved["project"]["rejectedCount"]))
EOF
```

### V23

```bash
evidence="$PWD/docs/missions/clipper-tool/m4-the-review-workbench/evidence"
(cd service && .venv/bin/python -m pytest clipper/review clipper/media clipper/selection clipper/storage clipper/projects -v) 2>&1 | tee "$evidence/v23-service-tests.txt"
echo "exit code of pytest: ${PIPESTATUS[0]}"
```

### V25

```bash
saved=docs/missions/clipper-tool/m4-the-review-workbench/evidence/v1-test-command.txt
files='e2e/(addresses|api-key|captures|delete-project|empty-library|halt-project|import-link|import-upload|layout|library|low-disk|missing-ffmpeg|model-download|new-project-errors|no-speech|own-origin|queue|queue-through-tool|restart|selection|selection-progress|settings|shell|start-command|stop-order|text-size|transcribe|transcribe-restart|upload-parts|upload-size)\.spec\.ts'
grep -E "$files" "$saved" | grep -c '✓'
grep -E "$files" "$saved" | grep -v '✓' || echo "no test of these files failed"
```

### V26

```bash
git diff --stat 6d9c04a HEAD -- .researches docs/prototype
echo "end of the changes to .researches and docs/prototype"
git diff --stat 6d9c04a HEAD -- web/src/shared/styles/tokens.css web/src/shared/styles/base.css web/src/shared/styles/controls.css web/src/shared/styles/lists.css web/src/shared/styles/shell.css web/src/shared/styles/pages.css
echo "end of the changes to the stylesheets copied before this milestone"
git diff --stat 6d9c04a HEAD -- package.json web/package.json pnpm-lock.yaml pnpm-workspace.yaml service/requirements.txt service/requirements-dev.txt
echo "end of the changes to the packages"
for sheet in base controls lists shell pages review player; do
  cmp "docs/prototype/styles/$sheet.css" "web/src/shared/styles/$sheet.css" && echo "$sheet.css is the prototype's"
done
git check-ignore -v data .cache
git ls-files | grep -iE '\.(mp4|mov|mkv|webm|m4v|avi|wav|aiff|pcm|mp3|m4a|sqlite|sqlite3|db|safetensors|npz|pt|gguf|onnx|bin)$' || echo "no video, audio, database or model file is tracked"
git grep -nE 'sk-ant-[A-Za-z0-9_-]{20,}' || echo "no key is tracked"
du -sk fixtures
git diff --name-only 6d9c04a HEAD | grep -vE '^(service|web|scripts|fixtures|docs/missions/clipper-tool)/|^(README|AGENTS)\.md$' || echo "every changed file is in the service, the web app, the scripts, the fixtures, the mission's documents, README.md or AGENTS.md"
grep -rnE "docs/(prototype|missions)" web/src web/next.config.ts service/clipper scripts || echo "the app reads nothing from docs/"
```

### V27

```bash
shasum -a 256 web/public/fonts/inter/InterVariable.ttf web/public/fonts/inter/LICENSE.txt
head -3 web/public/fonts/inter/LICENSE.txt
git ls-files web/public
grep -rnE "https?://" web/src/review web/src/shared/styles || echo "the Review tab and the stylesheets name no outside address"
pnpm test:browser e2e/own-origin.spec.ts
echo "exit code of the browser tests: $?"
```

### V28

```bash
grep -niE "review tab|keep|reject|approximation|does not do yet" README.md
grep -niE "review|inter|tap area|contrast|ready talk" AGENTS.md
```

### V29

```bash
git diff --name-only --diff-filter=AM 6d9c04a HEAD -- '*.ts' '*.tsx' '*.mjs' '*.py' | python3 /Users/work/.claude/skills/coding-standards/hooks/review-files.py --stdin | grep -vE -- '— clean|^$'
cat service/.coding-standards-structure web/.coding-standards-structure
```
