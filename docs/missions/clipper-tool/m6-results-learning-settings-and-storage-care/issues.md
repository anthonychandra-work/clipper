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
