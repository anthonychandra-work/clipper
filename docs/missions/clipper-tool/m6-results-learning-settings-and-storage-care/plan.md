# Plan: m6-results-learning-settings-and-storage-care

Attempt: 1

## Findings

The code as M5 left it

- The Results tab is the prototype's empty state, drawn by the project capability, and its route
  hands the project screen nothing, where the Review and the Export tab reach it as elements from
  their routes. Nothing stores views. (`web/src/project/open-project/components/ProjectScreen.tsx`,
  `ProjectTabs.tsx`, `EmptyResults.tsx`, `web/src/app/projects/[id]/results/page.tsx`)
- A decision and its reason are stored with the project's reviews, which are removed with their
  candidates and so with the project. Nothing else records them and nothing reads them for a
  selection. One method stores a review, in one transaction, for a change of the decision, of the
  title and of a point alike. (`service/clipper/review/review_store.py`, `change_clip.py`,
  `service/clipper/storage/open_database.py`)
- A selection request is the instructions as the system text, the transcript as a cached part,
  and the task as one JSON object. Both passes get what they send from one piece of code, which
  the score step and the cut step each call when they start. The stand-in for the API picks a
  recorded reply by the task's kind and its window alone, so a new field in the task changes no
  reply. (`service/clipper/selection/prepare_pass.py`, `selection_task.py`, `score_windows.py`,
  `cut_clips.py`, `scripts/recorded-replies.mjs`)
- Settings stores six choices. The two models and the clips per video are read when a pass
  starts, and the transcription model when a transcription starts. The default clip length is
  stored, and the new project sheet always starts at 25–60 s. The retention is stored and nothing
  reads it. "What the Selector Has Learned" shows four zeros with "Forget All of It" switched
  off, and its rows are keyed by other names than the service gives the reasons. The free disk
  space and the phone address are real. (`service/clipper/settings/preferences.py`, `router.py`,
  `web/src/settings/change-settings/components/SelectorMemorySection.tsx`,
  `lib/setting-options.ts`, `web/src/library/create-project/lib/create-draft.ts`)
- A project is stored with its place in the order of creation and with no time.
  (`service/clipper/storage/open_database.py`, `service/clipper/projects/project.py`)
- Deleting a project stops its work, removes its folder with the exports, and removes its
  records. The service's tests cover it; no browser test deletes a project that has exports.
  (`service/clipper/projects/delete_project.py`, `service/clipper/rendering/test_whole_app.py`,
  `web/e2e/delete-project.spec.ts`)
- The Review tab shows its notice when the preview copy is missing and the Export tab when the
  source is, each read from the files at every answer. Both are tested by moving a file aside.
  The transcript stays in the project's folder and both tabs read it.
  (`service/clipper/review/describe_review.py`, `service/clipper/rendering/describe_export.py`,
  `web/e2e/export-tab.spec.ts`)
- The export answer lists kept clips only. Whether a clip has a finished file is worked out
  inside the rendering package and given to no other package.
  (`service/clipper/rendering/describe_export.py`, `find_download.py`)
- Five files hold ten top-level functions and classes, the most the hooks allow:
  `service/clipper/main.py`, `service/clipper/settings/router.py`, `service/clipper/conftest.py`,
  and in the browser tests `web/e2e/support/service-api.ts` and `walk-screens.ts`.
  `service/clipper/selection/conftest.py` and `service/clipper/review/conftest.py` hold nine.
  What this milestone adds to `main.py` joins the records and the functions it has, and a new
  helper of the browser tests goes into a file of its own.
- A browser test run uses one tool and one database from its first test file to its last, and
  the files run in the order of their names. A choice left in Settings and an entry left in a
  history reach every later test. The tool of a run can be stopped and started again inside a
  test with other environment variables, and every start reports 50 GB free unless a test says
  otherwise. (`web/e2e/support/tool-test.ts`, `run-tool.ts`, `web/playwright.config.ts`)
- `pnpm test` passed all nine gates at `0ec8f3d`, with 1,123 service tests, 362 unit tests and
  173 browser tests in 21.3 minutes (M5's `proof.md`, V1). Only mission documents changed between
  that commit and `5ab7552`, where this milestone starts. (`git diff --stat 0ec8f3d 5ab7552`)

The prototype

- The Results tab is one page of two groups. "Views After 7 Days" is a list with a row for each
  kept clip: the rank in two digits, the title as the label, and a number field. Its footer ends
  in "These figures are examples.", which is the prototype speaking of itself. "Ranking Against
  Outcome" reads "Enter views for at least two clips." or shows the sentence and a bar for each
  clip with views, the longest for the most views. With no kept clip the page is "No Results
  Yet" with "Go to Review". The page keeps a typed number in memory and stores nothing.
  (`docs/prototype/src/project/render-results.js`)
- Its styles for the rows, the bars, the number field and the counts of Settings are in the
  stylesheets copied in M1. (`web/src/shared/styles/pages.css`, `controls.css`)
- "Forget All of It" shows a message about the real app and asks nothing first. The counts are
  the sample project's rejections. The row of the exported sample project reads "Exported · 6
  clips exported, results logged". (`docs/prototype/src/settings/render-settings.js`,
  `docs/prototype/src/library/sample-projects.js`)

The fixture

- The talk's six clips, by rank: `c01` "The worst day my bakery ever had", story, 32.76 s; `c02`
  "Hire for the habits you cannot teach", contrarian, 33.18 s; `c03` "Almost everyone gets price
  wrong", hot-take, 41.32 s; `c04`, confession, 41.30 s; `c05`, hot-take, 31.16 s; `c06`, none,
  29.52 s. A run of the talk asks four times: one score request and three cut requests.
  (`docs/missions/clipper-tool/m4-the-review-workbench/evidence/talk-review.json`,
  `docs/missions/clipper-tool/m3-ranked-clip-candidates/evidence/selection-requests.json`)
- The checks of this milestone use one seeded set. On a talk of their own: `c01`, `c02` and
  `c03` kept and rendered, `c05` rejected as not interesting, `c06` rejected as cut off
  mid-thought, and the views 1,200 for `c01`, 5,400 for `c02` and 48,000 for `c03`. It gives the
  order `c03`, `c02`, `c01`, the sentence "The best performer was the selector’s pick number 3.
  Ranks in order of views: 3, 2, 1.", the counts 1, 1, 0 and 0 in Settings, and the note "Of the
  last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0
  needing earlier context, 0 repeating another clip." with the second line "Of 3 posted clips
  with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds.
  The worst third opened with: story 1, and lasted 33 seconds."

Measured on this Mac on 2026-10-06

- A clone of the repository at `5ab7552`, made in a temporary folder and set up as the README
  says: `pnpm install` ended with code 0 in 3 seconds and `pnpm bootstrap` with code 0 in 37
  seconds, with the OpenCV package pip had built before taken from pip's cache. Bootstrap
  downloaded the browser the tests drive, 94.3 MiB, and the test model. `pnpm start` printed its
  address 12 seconds later, the web build included. The Library answered at
  `http://localhost:3000` and, with Settings and the health address, at the phone address
  Settings gave, `http://192.168.10.111:3000`, the address of the interface that holds the
  default route. Settings gave 13.7 GB free and the system gave 13.7. Ctrl-C left no listener on
  ports 3000 and 8765. Nothing of the README had to be corrected for the clone, and its run of
  `pnpm test` left no change in it.
- The clone's run of `pnpm test` ended with code 1. Eight gates passed, pytest with 1,123 tests
  and Vitest with 362, and Playwright failed with 171 of 173 passed. The first failure was the
  Mac: on battery at 1%, it slept from 22:55:59 to 23:04:04, through the test that was running,
  which waited for a talk that could not get ready (`e2e/review-captures.spec.ts`). The second
  came five minutes after the wake, with a load average of 34: the test that presses Keep and
  then moves the out point of the same clip read "Keep" on the button
  (`e2e/review-preview.spec.ts`, "with the preview copy moved aside"). Run again in the clone
  with the Mac on mains power, the two files passed, 14 tests of 14, and that test passed 20
  times of 20.
- The cause of the second failure is in the code. The service reads a clip's stored review,
  applies the change and writes the whole review back, with nothing that keeps two requests
  apart, and it answers requests on several threads. The page sends a second change of a clip
  while the first is on its way and shows the answer to the later one. Measured in the clone
  with a probe that was removed again: of a decision and a moved point of one clip sent to the
  review package at the same moment, only one was stored in 43 rounds of 300. T2 mends both
  sides (A149). (`service/clipper/review/change_clip.py`, `review_store.py`,
  `web/src/review/open-review/lib/review-store.ts`)
- The disk had between 13 and 18 GiB free during these measurements, where the intent gives
  about 24 GB. A clone that is set up takes 1.6 GB, and a test run 0.2 GB while it lasts.
- The SQLite of the service's Python is 3.51.2 and gives the present time in seconds as a
  function of its own. Node 22.13 reads a folder's free space with `statfsSync`.

No library is added and none is updated, so no library's documentation decides anything here.

The rules every write passes through

- `AGENTS.md` lists the coding-standards rules. Before each commit, format the Python code and
  run the standards review over the task's source files; it must print no finding without
  `[advisory]`. A file holds at most ten top-level functions or classes, a function at most
  twenty statements, a Python function at most four positional parameters and a TypeScript one
  at most three.
- No hook refuses a write to any file named below. The captures are binary files, placed with a
  command and never given to the standards review.
- The eight copied stylesheets are not edited. A rule a screen needs beyond them goes into
  `app.css`.
- `AGENTS.md` fixes which package imports which. T1, T3, T4, T6, T7 and T11 write each new
  direction into it in the commit whose code first follows it.
- New fixtures of the service's tests go into a `conftest.py` inside their package.
- A browser test that changes a choice in Settings puts the defaults back when it ends, whatever
  its result. A test that reads the history, in Settings or in a selection request, forgets it
  first. A test that starts the tool with other variables starts it again without them when it
  ends.

What the spec's file list leaves out

- The spec lists `results`, `storage`, `selection`, `settings`, `projects` and `main.py` in the
  service, and `results`, `settings`, `library`, `review`, `export`, `app` and `e2e` in the web
  app. This milestone also adds two service packages, `learning` (the history and the note) and
  `retention` (the cleanup), and changes `service/clipper/review/` (a decision enters the
  history, and a clip is changed by one request at a time), `service/clipper/rendering/` (the
  exported clips for another package, and whether a project has a clip in the queue),
  `web/src/project/` (the Results tab comes from its route), `web/src/shared/styles/app.css`,
  both recorded layouts and `fixtures/README.md`. In `web/src/review/` it changes the store
  alone (T2), and in `web/src/export/` nothing: both notices are built, and T12 checks them
  against a source the cleanup removed.

## Tasks

- [ ] T1 — Keep a history of decisions that outlives its project
  Files: `service/.coding-standards-structure`, `AGENTS.md`,
  `service/clipper/storage/open_database.py`, `service/clipper/storage/test_open_database.py`,
  `service/clipper/learning/__init__.py`, `service/clipper/learning/history_records.py`,
  `service/clipper/learning/history_store.py`, `service/clipper/learning/test_history_store.py`,
  `service/clipper/review/review_store.py`, `service/clipper/review/test_review_store.py`
  Done: the service's recorded layout lists `learning/`, and `AGENTS.md` says that `learning`,
  the history the selector learns from, imports `storage` alone and that `review` imports it. An
  eighth migration adds the two lists of A142 and copies the kept and the rejected clips of an
  existing database into the first, in the order they are stored. The `learning` package records
  a decision or an outcome inside a transaction that another package's store has open, and takes
  one out the same way. It gives the newest decisions up to a number, the rejections of each
  reason among the last 50, and every outcome, and it empties both lists. The review store
  records a clip's decision in the transaction that stores its review, when the decision or the
  reason differs from the one stored. Tests: a database made by M5 that holds a kept clip, a
  clip rejected with a reason and an undecided one opens with its projects, candidates, reviews
  and renders unchanged and with those two decisions in the list; a new database has both lists
  empty; a kept clip enters the list; a rejection carries its reason; rejecting a kept clip
  leaves one entry for the clip and makes it the newest; a changed reason does the same; a clip
  set back to undecided leaves the list; a change of the title or of a point leaves the list as
  it was; of 60 decisions the 50 newest are given, and a rejection among the 10 oldest is not
  counted; a rejection without a reason is counted under none of the four reasons; deleting the
  project leaves its entries; emptying the lists leaves the clip rejected in its review; an
  outcome recorded twice for one clip is held once with the later values, and is gone once it is
  taken out. `pnpm test` exits 0.

- [ ] T2 — Store two changes of one clip that arrive together
  Files: `AGENTS.md`, `service/clipper/review/change_clip.py`,
  `service/clipper/review/test_change_clip.py`,
  `web/src/review/open-review/lib/review-store.ts`,
  `web/src/review/open-review/lib/review-store.test.ts`
  Done: the service changes one clip at a time, by A149: reading the stored review, judging the
  change and storing it happen under one lock, as the parts of an upload are appended under
  one. The web app's store of a review shows every change at once, as before, and sends the
  changes of one clip one after another, each when the one before it is answered; a change of
  another clip does not wait. After the last answer the page shows the clip as the service
  holds it, and a refused change gives its problem and does not hold back the changes after it.
  `AGENTS.md` words the store's rule so. Tests of the service: a change that arrives while
  another change of the same clip is held between its reading and its storing is applied to
  what that one stored, so a decision and a moved point sent together are both stored; a
  hundred such pairs sent from two threads at the same moment are all stored whole. Unit tests
  of the store, with a stand-in for the service that answers when the test says: a second
  change of a clip is shown at once and sent only once the first is answered; three changes go
  out in the order they were made; a change of a second clip is sent while the first clip's
  change waits for its answer; after the last answer the clip shown is the one the service
  answered last; a refusal of the first change shows its problem, and the second is still sent.
  The tests that held an answer back until after a newer change are rewritten for this order,
  and the tests of a typed title and of the look stay as they are. `pnpm test` exits 0, and
  `pnpm test:browser e2e/review-preview.spec.ts --repeat-each=20 -g "preview copy moved aside"`
  passes 20 times of 20.

- [ ] T3 — Write the note and send it with both passes
  Files: `AGENTS.md`, `service/clipper/learning/write_note.py`,
  `service/clipper/learning/test_write_note.py`, `service/clipper/learning/__init__.py`,
  `service/clipper/selection/selection_task.py`, `service/clipper/selection/prepare_pass.py`,
  `service/clipper/selection/test_prepare_pass.py`, `service/clipper/selection/score_windows.py`,
  `service/clipper/selection/test_score_windows.py`, `service/clipper/selection/cut_clips.py`,
  `service/clipper/selection/test_cut_clips.py`, `service/clipper/selection/test_score_stage.py`,
  `service/clipper/selection/test_cut_stage.py`, `service/clipper/selection/conftest.py`,
  `service/clipper/main.py`
  Done: the note is written from the decisions and the outcomes by A143, with its two sentences
  as A143 words them. The score step and the cut step are handed the history, and each writes
  the note when it starts. The task of every request of a pass carries it as `note`, and a task
  written without a note has no such field. A pass context made without a note carries none, so
  the code that builds one elsewhere stays as it is. The instructions of both passes gain A143's
  paragraph about the note. `AGENTS.md` says that `selection` imports `learning`. Tests of the
  note: no history gives none; decisions that are all keeps give none; two rejections among five
  decisions give the first line of the Findings, with "0" for the two other reasons; a rejection
  without a reason counts in the total alone; 60 decisions read "the last 50" and count the 50
  newest; two clips with views give no second line; three give thirds of one clip each; nine
  give thirds of three, with the hook types by how many clips had each and the shortest and the
  longest length; seven give thirds of two; a third whose clips are equally long gives one
  number; both lines are joined by a line break. Tests of the two steps, on the recorded replies
  of the talk: with a history, the score request and each of the three cut requests carry the
  same note in their task, and the note is in neither the instructions nor the transcript part;
  with an empty history none of the four tasks has the field, and each is otherwise the task it
  was before this milestone; after the history is emptied, a second run carries none.

- [ ] T4 — Give the rejections with Settings and forget the history through the service
  Files: `AGENTS.md`, `service/clipper/settings/router.py`,
  `service/clipper/settings/describe_settings.py`, `service/clipper/settings/__init__.py`,
  `service/clipper/settings/test_router.py`, `service/clipper/main.py`,
  `service/clipper/test_main.py`
  Done: the settings answer carries A144's `rejections`, and `DELETE /api/settings/history`
  empties both lists and answers with the settings. The form of the answer and the function that
  fills it move from the router into a file of their own, which leaves the router room for the
  new address under the limit of ten. `AGENTS.md` says that `settings` imports `learning`. Tests:
  a new tool answers four zeros; after rejections stored with three of the reasons and one
  without, the answer gives each reason its number; a change of a choice and a saved key answer
  with the same numbers; the forget address answers four zeros, and a later read does too; the
  six choices and the saved key are as they were after forgetting; forgetting an empty history
  answers four zeros.

- [ ] T5 — Show what the selector has learned in Settings, and forget it
  Files: `web/src/settings/change-settings/lib/setting-options.ts`,
  `web/src/settings/change-settings/lib/setting-options.test.ts`,
  `web/src/settings/change-settings/api/forget-history.ts`,
  `web/src/settings/change-settings/hooks/use-settings.ts`,
  `web/src/settings/change-settings/components/SelectorMemorySection.tsx`,
  `web/src/settings/change-settings/components/SettingsScreen.tsx`,
  `web/e2e/support/learned-history.ts`, `web/e2e/support/index.ts`, `web/e2e/settings.spec.ts`
  Done: the four rows of "What the Selector Has Learned" show the numbers the service gives,
  each under the reason the service names, in the prototype's order and markup. "Forget All of
  It" is switched on. Pressed, it sends the request, shows the four zeros of the answer and
  A144's message; a refusal shows the service's sentence and leaves the numbers. A helper of the
  browser tests forgets the history through the service and reads the settings. Unit tests: the
  four rows with their labels for an answer with four different numbers. Browser tests at 390
  px, each forgetting first: a new history shows four zeros and the control switched on; with
  `c05` of the shared ready talk rejected as "Not Interesting" and `c06` as "Cut Off Mid-Thought"
  on the Review tab, Settings shows 1, 1, 0 and 0 against the four labels; "Forget All of It"
  shows the message and four zeros, a reload shows four zeros, and the Review tab still lists
  two rejected clips with their reasons. The test of the five groups reads the control as
  switched on. `pnpm test` exits 0.

- [ ] T6 — Store the views of exported clips and serve the Results tab
  Files: `service/.coding-standards-structure`, `AGENTS.md`,
  `service/clipper/storage/open_database.py`, `service/clipper/storage/test_open_database.py`,
  `service/clipper/rendering/list_exported_clips.py`,
  `service/clipper/rendering/test_list_exported_clips.py`,
  `service/clipper/rendering/__init__.py`, `service/clipper/results/__init__.py`,
  `service/clipper/results/results_store.py`, `service/clipper/results/test_results_store.py`,
  `service/clipper/results/results_schemas.py`, `service/clipper/results/describe_results.py`,
  `service/clipper/results/test_describe_results.py`, `service/clipper/results/router.py`,
  `service/clipper/results/test_router.py`, `service/clipper/results/conftest.py`,
  `service/clipper/results/test_whole_app.py`, `service/clipper/projects/project.py`,
  `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/projects/project_schemas.py`, `service/clipper/projects/describe_project.py`,
  `service/clipper/projects/test_router.py`, `service/clipper/main.py`,
  `service/clipper/test_main.py`
  Done: a ninth migration adds the views of a clip, removed with its candidate, and the count of
  logged clips on the project; a database made by M5 opens unchanged with the count 0. The
  rendering package gives another package a project's clips that have a finished file, kept or
  not, as they stand, by rank. The new `results` package answers the two addresses of A140 in
  its form, with its refusals. Storing views writes them, counts the project's logged clips and
  records the outcome of A142 with the clip's hook type and its length as it stands, in one
  transaction; clearing them undoes all three. A project's JSON carries `loggedCount`. The
  service's recorded layout lists `results/`, and `AGENTS.md` says that `results`, the package
  behind the Results tab, imports `learning`, `rendering`, `review`, `projects` and `storage`,
  that nothing but `main.py` imports it, and that `rendering` is imported by `main.py` and
  `results` alone. Tests on the cut talk of the review package's fixtures, with exports put in
  place for them: only clips with a finished file are listed, by rank, a clip that was rejected
  after its export among them; every field under its name; a title edited on the Review tab is
  the title given; stored views are given back, and the project counts them; views of 1 and of
  9,999,999,999 are stored, and 0, a negative number, a fraction, a larger number, a text and an
  unknown field are refused and store nothing; views for a clip without a finished file and for
  an unknown clip are refused; cleared views are gone, the count falls and the outcome leaves
  the history; views stored twice leave one outcome with the later number; the outcome holds the
  length of a clip whose point was moved; a project with no candidates, and one with no
  transcript, answer with no clips; deleting the project removes its views and leaves its
  outcomes. Through the whole app, once for several tests, with the stand-in's `talk` scenario:
  the seeded set of the Findings is made on an uploaded talk through the service's addresses,
  with the three clips rendered; the results give the three clips with their views and the
  project reads `loggedCount` 3; the settings give 1, 1, 0 and 0; the talk is deleted; a second
  uploaded talk ends ready, and its four requests each carry the two lines of the Findings as
  `note`; after the forget address, a third talk's four requests carry no `note`. `pnpm test`
  exits 0, the browser tests that open the Results tab of a project without candidates among
  them.

- [ ] T7 — Hold a project's results in the web app
  Files: `web/.coding-standards-structure`, `AGENTS.md`, `web/src/results/index.ts`,
  `web/src/results/results.types.ts`, `web/src/results/results.fixtures.ts`,
  `web/src/results/open-results/index.ts`, `web/src/results/open-results/api/fetch-results.ts`,
  `web/src/results/open-results/lib/results-store.ts`,
  `web/src/results/open-results/lib/results-store.test.ts`,
  `web/src/results/open-results/hooks/use-results.ts`, `web/src/results/log-views/index.ts`,
  `web/src/results/log-views/api/save-views.ts`,
  `web/src/results/log-views/lib/read-typed-views.ts`,
  `web/src/results/log-views/lib/read-typed-views.test.ts`,
  `web/src/results/compare-outcome/index.ts`,
  `web/src/results/compare-outcome/lib/rank-outcome.ts`,
  `web/src/results/compare-outcome/lib/rank-outcome.test.ts`
  Done: the web app's recorded layout lists the results capability with three use cases: open
  the results, log views and compare the outcome. `AGENTS.md` says that `results`, the Results
  tab, imports `project`, `library`, `shell` and `shared`, that nothing but `app/` imports it,
  and that it reads its own address of the service. The types describe A140's answer. One store
  for each project holds the results: it fetches them when somebody starts watching, shows a
  clip's new views at once, and sends the views of one clip one after another, as the review
  store sends a clip's changes (A149), so the last answer it shows is what the service holds; a
  refusal gives the problem to be shown and brings back what the service holds. Plain rules
  read a typed text as views by A141, and give the outcome by A141: whether two clips have
  views, the clips in their order, each one's share of the highest views, its views written
  with separators, and the sentence. Unit tests, with a stand-in for the service: a fetch on
  the first watcher; views shown before the answer and the answer kept; a second number for one
  clip shown at once and sent only once the first is answered; a refusal; "1200", " 1200 " and
  "1200.9" read as 1,200, and an empty text, "0", "-5" and "abc" as none; one clip with views
  gives no order; the seeded set of the Findings gives its order, its sentence and shares of
  100, 11.25 and 2.5; a set whose most viewed clip has rank 1 gives "The selector’s first pick
  performed best."; equal views put rank 1 before rank 2; clips of the ranks 2, 4 and 5 are
  named by those ranks.

- [ ] T8 — Open the Results tab
  Files: `web/src/app/projects/[id]/results/page.tsx`,
  `web/src/project/open-project/components/ProjectScreen.tsx`,
  `web/src/project/open-project/components/ProjectTabs.tsx`,
  `web/src/project/open-project/components/EmptyResults.tsx`, `web/src/results/index.ts`,
  `web/src/results/open-results/index.ts`,
  `web/src/results/open-results/components/ResultsTab.tsx`,
  `web/src/results/open-results/components/EmptyResults.tsx`,
  `web/src/results/log-views/index.ts`, `web/src/results/log-views/components/ViewsList.tsx`,
  `web/src/results/log-views/hooks/use-views-draft.ts`,
  `web/src/results/compare-outcome/index.ts`,
  `web/src/results/compare-outcome/components/OutcomeSection.tsx`,
  `web/src/shared/styles/app.css`, `web/e2e/support/read-results.ts`,
  `web/e2e/support/results-page.ts`, `web/e2e/support/index.ts`, `web/e2e/results-tab.spec.ts`,
  `web/e2e/api-key.spec.ts`
  Done: the project screen takes the Results tab from its route and shows it inside the open
  project, as it takes the two other tabs. The empty state leaves the project capability, whose
  two files for it are removed, and the results capability draws it by A141, with its control
  chosen by the project's kept count. With listed clips the tab follows the prototype's markup,
  ids included, and A141: the rows, the footer, and the outcome, which follows a typed number at
  once. A number is saved half a second after the last keystroke and when the field is left.
  Helpers of the browser tests read the results from the service, store views there, export
  clips of a talk and wait for their files, and read the rows and the outcome from the page.
  The test that a saved key reaches no answer also asks the results address. Browser tests on a
  talk of their own, at 1360 px: with no kept clip the tab shows "No Results Yet" and "Go to
  Review", which leads to the Review tab; with `c01` kept and not rendered it shows "Go to
  Export", which leads to the Export tab; with `c01` to `c03` exported and `c04` kept and not
  rendered it lists three rows with the ranks 01, 02 and 03, their titles and empty fields, the
  footer of A141 and "Enter views for at least two clips."; after the first typed number that
  line stays, and after the second the sentence and two bars show; with the seeded views typed,
  the outcome lists "Almost everyone gets price wrong" with 48,000, "Hire for the habits you
  cannot teach" with 5,400 and "The worst day my bakery ever had" with 1,200, under the sentence
  of the Findings, the first bar as wide as its track and the third between 2% and 3% of it;
  after a reload the three fields hold 1200, 5400 and 48000, the outcome is the same and the
  service gives the same views; 90000 typed for `c01` gives "The selector’s first pick performed
  best. Ranks in order of views: 1, 3, 2."; an emptied field and a typed 0 each take their clip
  out of the outcome, also after a reload; `c03`, rejected after its export, keeps its row and
  its views. At 390 px the tab lists the same rows, and a number typed there is stored.
  `pnpm test` exits 0.

- [ ] T9 — Show logged results in the Library
  Files: `web/src/library/library.types.ts`,
  `web/src/library/list-projects/lib/describe-row-status.ts`,
  `web/src/library/list-projects/lib/describe-row-status.test.ts`,
  `web/src/library/list-projects/lib/projects-store.test.ts`,
  `web/src/project/follow-progress/lib/describe-status.test.ts`,
  `web/src/project/open-project/lib/project-addresses.test.ts`,
  `web/src/results/open-results/components/ResultsTab.tsx`,
  `web/e2e/support/crowded-review.ts`, `web/e2e/support/selection-screens.ts`,
  `web/e2e/results-tab.spec.ts`
  Done: the web app knows a project's `loggedCount`. The row of an exported project with a
  logged clip reads "Exported · 3 clips exported, results logged", in the Library and in the
  sidebar, and without one it reads as before (A140). The Library is asked for its rows again
  when a clip's views are stored. Every place that builds a project for a test carries the
  count. Unit tests: the row with logged clips, for one export and for several, and the row
  without. The browser test of T8 that types the seeded views reads the row before and after, in
  the sidebar at 1360 px and in the Library at 390 px.

- [ ] T10 — Check in a browser that rejections and results reach the next selection, and that
  forgetting ends it
  Files: `web/e2e/learning.spec.ts`, `web/e2e/support/learned-history.ts`,
  `web/e2e/support/read-results.ts`, `web/e2e/support/index.ts`
  Done: one browser test at 1360 px, with a time limit of its own, forgets the history and then
  makes the seeded set of the Findings on a talk of its own: the three clips kept and rendered
  through the service, the two rejections chosen from the reject menu of the Review tab, and the
  views typed on the Results tab. Settings then shows 1, 1, 0 and 0. The test deletes the talk,
  saves the test key, which the making of its own talk removed, empties what the stand-in kept,
  and makes a second talk from a link: each of its four requests carries the two lines of the
  Findings as `note`, the same in all four. It presses "Forget All of It" and makes a third
  talk: none of its four requests has a `note`, and Settings shows four zeros. It saves A148's
  `learning-requests.json` into the folder `CLIPPER_EVIDENCE_DIR` names, or into the test's
  output without it. When it ends it removes the key, the projects and the history, whatever its
  result.

- [ ] T11 — Remove the sources of old projects
  Files: `service/.coding-standards-structure`, `AGENTS.md`, `README.md`,
  `service/clipper/storage/open_database.py`, `service/clipper/storage/test_open_database.py`,
  `service/clipper/storage/data_folder.py`, `service/clipper/storage/test_data_folder.py`,
  `service/clipper/projects/project.py`, `service/clipper/projects/create_project.py`,
  `service/clipper/projects/test_create_project.py`,
  `service/clipper/projects/project_repository.py`,
  `service/clipper/projects/test_project_repository.py`,
  `service/clipper/rendering/render_store.py`, `service/clipper/rendering/test_render_store.py`,
  `service/clipper/retention/__init__.py`, `service/clipper/retention/conftest.py`,
  `service/clipper/retention/remove_old_sources.py`,
  `service/clipper/retention/test_remove_old_sources.py`,
  `service/clipper/retention/source_cleaner.py`,
  `service/clipper/retention/test_source_cleaner.py`,
  `service/clipper/settings/startup_settings.py`,
  `service/clipper/settings/test_startup_settings.py`, `service/clipper/main.py`,
  `service/clipper/test_main.py`
  Done: a tenth migration stores the moment a project was imported; a project of an existing
  database gets the moment of the upgrade, and a new project the moment it is created. The data
  folder removes a project's source and preview copy and nothing else of it. The render store
  says whether a project has a clip waiting or rendering. The new `retention` package removes
  old sources by A146, given the present moment, and a cleaner runs that once when the service
  starts, before it answers, and then once an hour until the service stops. The clock it reads
  runs ahead by the days `CLIPPER_CLOCK_AHEAD_DAYS` names, 0 without it. The service's recorded
  layout lists `retention/`. `AGENTS.md` says that `retention` imports `projects`, `settings`
  and `storage`, that `main.py` hands it what it needs of `rendering`, and that nothing but
  `main.py` imports it, and it names the variable among those that serve test runs, as the
  README's table does. Tests, with a clock the test sets: a ready project imported eight days
  before loses its source and its preview copy at seven days, and keeps its transcript, its
  frames, its candidates, its reviews and its exports; one imported six days before keeps both;
  an exported project is treated as a ready one; at three days a project of four days loses
  them and at thirty a project of twenty-nine keeps them; with "Never" a project of a thousand
  days keeps them; a project that failed, one that was stopped, one that waits and one that
  rests transcribed keep them at any age; a project with a clip waiting keeps them, and loses
  them at the next pass once the render is done; a project whose source is already gone is
  passed over; a changed retention is followed at the next pass without a restart; a database
  made by M5 opens with its projects imported at the moment of the upgrade. Through the app: a
  tool started with the clock eight days ahead answers its first request with the source of a
  ready project gone, the review without its preview copy and the export without its source,
  and with no variable the same project keeps both; the cleaner ends when the app stops.

- [ ] T12 — Check in a browser the cleanup of an old source and the delete of a project with
  exports
  Files: `web/e2e/retention.spec.ts`, `web/e2e/delete-project.spec.ts`,
  `web/e2e/support/source-file.ts`, `web/e2e/support/index.ts`
  Done: browser tests on a talk of their own with `c01` exported, at 1360 px. Started again with
  the clock six days ahead, the talk keeps its source and its preview copy. Started again eight
  days ahead, its folder holds neither, and still holds the transcript, the frames and
  `exports/01-c01.mp4` at the size it had; the Library lists the talk as exported; its Review
  tab shows "Preview unavailable. The source video was deleted to free space." in place of the
  preview, with the six candidates listed; its Export tab shows "The source video was deleted to
  free space. Finished exports are still here. New clips cannot be rendered.", has Render
  switched off, and "Download MP4" saves the file; its Results tab lists the clip. With "Never"
  chosen in Settings and the clock 400 days ahead the talk keeps its source, and with "3 days"
  and the clock four days ahead it loses it. At 390 px the Review list of the talk without its
  source opens the clip with the notice. A test of the delete: with `c01` exported and `c06`
  rejected with a reason, Delete Project from the More menu removes the talk's folder with
  `exports/01-c01.mp4`, leaves the Library empty, and Settings still counts the rejection. Each
  test puts the retention back to 7 days and starts the tool again without the variable when it
  ends, whatever its result.

- [ ] T13 — Start a new project with the clip length chosen in Settings, and check that every
  choice takes effect
  Files: `web/src/library/create-project/api/fetch-default-length.ts`,
  `web/src/library/create-project/hooks/use-draft.ts`,
  `web/src/library/create-project/lib/create-draft.ts`,
  `web/src/library/create-project/lib/create-draft.test.ts`,
  `web/e2e/settings-effect.spec.ts`, `web/e2e/support/index.ts`
  Done: the new project sheet follows A145. The library capability reads the default from the
  settings address itself, since `settings` imports `library`. Unit tests: a draft takes a
  default while no length was chosen, keeps a chosen length, and starts at 25–60 s. Browser
  tests, each putting the six defaults back when it ends. With "Claude Haiku 4.5" chosen as the
  scoring model and "Claude Fable 5.1" as the cutting model in Settings, a talk made next sends
  one score request that names `claude-haiku-4-5`, without an effort setting, and three cut
  requests that name `claude-fable-5-1`. With "4" chosen as the clips per video, a talk made
  next ends ready with four candidates, and each cut task asks for 4. With "60–180 s" chosen as
  the clip length, the sheet opens with "60–180 s" selected and its hint under it, after a
  reload of `/new` too, and a project made from it has the limits 60 and 180 in its selection;
  with the default back, the sheet opens at "25–60 s". With "15–30 s" chosen in the sheet before
  Settings answers, held back by the test, the sheet keeps "15–30 s". Started without the
  reported figure, the tool's settings answer gives a free space and a total within 1 GB of
  what the Mac gives for the data folder's disk, and Settings and the sidebar show that free
  space rounded down to whole gigabytes. `pnpm test` exits 0.

- [ ] T14 — Fit the Results tab and Settings on a phone: 200% text, tap areas and contrast
  Files: `web/e2e/support/results-screens.ts`, `web/e2e/support/index.ts`,
  `web/e2e/results-fit.spec.ts`, `web/e2e/own-origin.spec.ts`, `web/src/shared/styles/app.css`,
  `web/src/results/log-views/components/ViewsList.tsx`,
  `web/src/results/compare-outcome/components/OutcomeSection.tsx`,
  `web/src/settings/change-settings/components/SelectorMemorySection.tsx`,
  `docs/missions/clipper-tool/spec.md`
  Done: the screens of A148 can be walked as the Export tab's are: the Results tab empty, with
  the seeded set, and presented with twelve clips; Settings without a key and with one, with
  counts of three digits. At 390 px, on each, with the measures the Export tab's check uses: at
  the normal text size and at 200% nothing scrolls sideways, no element is wider than the screen
  and no label is cut; scrolled to its end, the screen's last line lies above the tab bar; no
  control has a tap area under 44 px; in light and in dark no text measures under 4.5 to 1. At
  1360 px the same screens meet the ratio in light and in dark. A rule a screen needs for this
  goes into the app's stylesheet, and the copied stylesheets stay as they are. The spec's
  Assumptions gain a line that names each such rule. The test that every request of every
  screen goes to the tool also opens the Results tab of a talk with the seeded set, at both
  widths.

- [ ] T15 — Save the captures and the requests as evidence
  Files: `web/e2e/results-captures.spec.ts`, `web/e2e/support/results-screens.ts`,
  `web/e2e/support/index.ts`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-390-light.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-390-dark.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-1360-light.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/results-1360-dark.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-390-light.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-390-dark.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-1360-light.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/settings-1360-dark.png`,
  `docs/missions/clipper-tool/m6-results-learning-settings-and-storage-care/evidence/learning-requests.json`
  Done: a browser test makes the seeded set on a talk of its own and captures the Results tab
  and Settings whole (A37) at 390 and 1360 px in light and in dark, reading each screen before
  the picture is taken and checking each file as the Export captures are checked. The files go
  into `CLIPPER_EVIDENCE_DIR` when that is set and into the test's output otherwise. The eight
  captures and `learning-requests.json` are saved with the commands of validation blocks V6 and
  V14 and committed. No video is committed.

- [ ] T16 — Bring the README and the agents' instructions up to date, and follow the README
  from a fresh copy
  Files: `README.md`, `AGENTS.md`, `fixtures/README.md`
  Done: `README.md` says what the Results tab does and when a clip is listed there; what the
  selector learns from rejections and views, that the next request for clips carries it as a
  short note beside the transcript, and what "Forget All of It" clears and leaves; what each
  choice in Settings governs and when a change takes effect; that the source and the preview
  copy of a finished project are removed after the chosen days, what stays, and what the Review
  and the Export tab then show; and where the free disk figure comes from. Its section on what
  this version does not do yet is replaced by what Clipper leaves out, from the intent's scope.
  Its tables of variables name `CLIPPER_CLOCK_AHEAD_DAYS`. Its test section gives the time
  `pnpm test` takes now, as measured, and says that the Mac must be on mains power and awake
  for the run. `AGENTS.md` names the three new packages and the results capability with their
  use cases and the direction of their imports; which store writes which list of the history;
  the cleaner and its clock; and the three rules of the Findings for a browser test that
  touches Settings, the history or the tool's variables. `fixtures/README.md` gives the seeded
  set. Then the README is followed from a clone of the repository in a temporary folder, by
  validation blocks V1 and V2: setup, start, the phone address, and the test command. Whatever
  fails is corrected, in the README or in the code, and the blocks are run again from a new
  clone until both end as their `expected` cells say. The clone is removed afterwards with
  block V3. The output V2 writes into the evidence folder is the validator's to save and is
  not committed. Each command in the three files was run as written.
