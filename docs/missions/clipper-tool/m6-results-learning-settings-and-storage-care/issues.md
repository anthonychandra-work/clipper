# Issues: m6-results-learning-settings-and-storage-care

## Attempt 1 — validator

Failed: V1

The whole output of block V1:

```
commit of the worktree: 8e8382ee2c303dbf7f50e6c07c4211fa0eeea3ba
commit of the clone:    8e8382ee2c303dbf7f50e6c07c4211fa0eeea3ba
exit code of pnpm install: 0
exit code of pnpm bootstrap: 0
Clipper is set up. Start it with "pnpm start".
library at localhost: 200
<title>Clipper</title>
{"projects":[],"freeDiskGb":18.8}
address of this Mac on its network: 192.168.10.111
df gives 18.8 GB free of 460.4 GB
Settings gives 18.8 GB free of 460.4 GB
Settings gives the phone address http://192.168.10.111:3000
answer of the phone address to / is 200
answer of the phone address to /settings is 200
answer of the phone address to /api/health is 200
exit code of the start command: 130
end of listeners after the interrupt
```

Lines 34 to 41 of the start's output, which the block keeps in `start.log` and which is saved as
`evidence/v1-start-log.txt`, read after the block had ended:

```

▲ Next.js 16.3.8
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
✓ Ready in 102ms
✓ Running next.config.ts took 22ms
Clipper is running at http://localhost:3000
 ELIFECYCLE  Command failed with exit code 130.
```

Observed: The expected cell has the start print `Clipper is running at http://localhost:3000`,
and the block shows it with `grep "Clipper is running"` on the start's output. That command
printed nothing: no line stands between the bootstrap's last line and the line
`library at localhost: 200`. Every other line of the block is as the expected cell gives it.
The start did print the line, as line 40 of its output. The block waits until that output holds
the text `http://localhost:3000`, and line 36, which Next.js prints, holds it four lines
earlier. In this run the wait ended on line 36 and the grep ran before line 40 was written. The
requests the block sent next were answered, the Library with 200 and the projects by the
service. V2 to V21 pass.

## Attempt 2 — validator

Failed: V2

The lines of block V2's output that show the failure, from the Playwright gate of `pnpm test` to
its exit code, with the lines of passed tests left out. `evidence/v2-test-command.txt` holds the
whole output of `pnpm test`.

```
--- Playwright

Running 200 tests using 1 worker

[49 lines of passed tests]
  ✘   50 e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it (1.1m)
[150 lines of passed tests]


  1) e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it 

    SyntaxError: Unexpected token 'I', "Internal S"... is not valid JSON

       at support/service-api.ts:68

      66 |   const deadline = Date.now() + STATUS_TIMEOUT_MS;
      67 |   for (;;) {
    > 68 |     const project = await readProject(request, projectId);
         |                     ^
      69 |     if (project.status === status) return project;
      70 |     if (Date.now() > deadline) {
      71 |       throw new Error(`The project did not become ${status}: ${JSON.stringify(project)}`);
        at waitForStatus (/private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web/e2e/support/service-api.ts:68:21)
        at cutTalkAndKeepRequests (/private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web/e2e/support/learned-history.ts:55:3)
        at /private/var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-m6-fresh-copy/clipper/web/e2e/learning.spec.ts:90:23

    Error Context: test-results/learning-two-rejections-wi-1ad05-nd-Forget-All-of-It-ends-it/error-context.md

    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/learning-two-rejections-wi-1ad05-nd-Forget-All-of-It-ends-it/trace.zip
    Usage:

        pnpm exec playwright show-trace test-results/learning-two-rejections-wi-1ad05-nd-Forget-All-of-It-ends-it/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    e2e/learning.spec.ts:73:1 › two rejections with a reason and three clips with views reach the next talk’s four requests as a note, and Forget All of It ends it 
  199 passed (39.3m)

--- Results
Fixtures: passed
Ruff: passed
mypy: passed
pytest: passed
ESLint: passed
Web build: passed
TypeScript check: passed
Vitest: passed
Playwright: failed
Test data folder: /var/folders/64/xznbj4n94qz_cxzl70mw82hr0000gp/T/clipper-test-JI4hiv
Test data size: 0.21 GB (210.6 MB)
The test data folder was removed.
 ELIFECYCLE  Test failed. See above for more details.
exit code of pnpm test: 1
```

Observed: The expected cell has `pnpm test` end with exit code 0 and all nine gates passed, and
says that no gate may fail. In the clone at `d2f88ae` the command ended with exit code 1. Eight
gates passed, pytest with 1,275 tests and Vitest with 411, and Playwright failed with 199 of 200
tests passed.

The test that failed is the one test of `e2e/learning.spec.ts`, number 50 of the run. It had
made the seeded set and deleted that talk, and stopped at line 90 of its file, where it makes
the next talk and waits for it to become ready. While it waited, one read of that project,
`GET /api/projects/<id>` through the web port, was answered with a body that starts with
`Internal S` and is no JSON. The test reads every answer as JSON and ended there. The output
gives neither the status of that answer nor which part sent it, the web app or the service.

The same test passed in V6, run alone in the worktree, in 1.6 minutes. The service's tests of
the same flow, the two of `clipper/results/test_whole_app.py` that V11 names, passed in V2 and
in V11. The Mac was on mains power, and its power log holds no sleep and no wake during the run.

Nothing but the printed lines is left of the failure. The run removed its data folder at its
end, and the next command of the block, the named browser tests, emptied the folder that held
the test's trace and error context.

The rest of V2 is as the expected cell gives it: four built videos, a data folder of 0.21 GB
that was removed, the named browser tests with exit code 0 and 4 passed, and no change in the
clone. V1, V3 to V20, V22 and V21 pass.
