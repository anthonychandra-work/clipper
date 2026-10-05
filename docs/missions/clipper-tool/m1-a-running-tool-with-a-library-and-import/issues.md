# Issues: m1-a-running-tool-with-a-library-and-import

## Attempt 1 — validator

Failed: V4, V20, V26

V4, the lines printed after the interrupt:

```
COMMAND  PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Python  3313 work    7u  IPv4 0x72fe9d790b26175d      0t0  TCP 127.0.0.1:8765 (LISTEN)
end of listeners after the interrupt
```

V20, the two captures that depart from the expected list: `evidence/settings-390-light.png` and
`evidence/settings-390-dark.png`.

V26, the output of the token comparison:

```
grep: --include=tokens.css: No such file or directory
128a129,130
> --slider-fill: var(--video-ink);
> --slider-track: var(--video-glass-edge);
153a156
> --value: 0%;
```

Observed:

- V4. After the interrupt the web port had no listener and the service was still listening on
  127.0.0.1:8765. Five seconds later the service's process was gone and both ports were free. The
  block lists both ports as soon as port 3000 is free. Run five more times, it printed no listener
  on either port. Every other expectation of V4 held in all six runs.
- V20. Both Settings captures at 390 px show three titled groups, AI Services, Defaults for New
  Projects and Storage, where the check expects five. Each capture holds the first 844 px of a
  screen that scrolls, and the other two groups are below that. In the same two captures the tab bar
  covers text: the second Storage row reads "Delete S" and "days" on either side of the bar, and the
  footer reads "Exported cl". The Settings captures at 1360 px show all five group titles. Every
  other expectation of V20 is met.
- V26. The comparison did not print `tokens identical`. The option that names `tokens.css` comes
  after the `--` separator, so `grep` read it as a file name and searched every file under
  `web/src`. The three lines it found are at lines 254 to 256 of `controls.css`, which the first
  command of the block reported identical to the prototype's. Run with the option before the
  separator, the comparison printed `tokens identical`. The five stylesheets compared identical, and
  the stylesheet list holds the five, `tokens.css` and `app.css`.
- V2 passed on its second run. Its first run exited 1 with three browser tests timed out while the
  Mac was asleep with its lid closed, from 19:30:59 to 19:51:42 by the power log. `proof.md` holds
  both runs.
