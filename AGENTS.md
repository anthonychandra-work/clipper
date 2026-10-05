# Clipper: instructions for coding agents

Clipper is two parts: a Next.js web app in `web` and a Python FastAPI service in `service`. The
browser talks only to the web app, which forwards every `/api` request to the service.

## Commands

Run every command from the repository root.

- `pnpm install` installs the web app's packages.
- `pnpm bootstrap` creates the Python environment in `service/.venv` with
  `/opt/homebrew/bin/python3.12` and installs the pinned Python packages.
- `pnpm start` starts the service on `127.0.0.1:8765` and the web app on port 3000, then prints
  the address to open. It builds the web app when the build is missing or older than the sources.
  Ctrl-C stops both parts.

Five environment variables change where a run keeps its files and which ports it uses:
`CLIPPER_DATA_DIR`, `CLIPPER_FFMPEG_DIR`, `CLIPPER_KEY_FILE`, `CLIPPER_WEB_PORT` and
`CLIPPER_SERVICE_PORT`. `CLIPPER_WEB_BUILD_DIR` names the folder the web app is built into.

## Layout

Each part records its layout in a `.coding-standards-structure` file. Follow it; do not move
folders.

- `scripts/` holds the command programs, one program per file.
- `fixtures/` holds the committed test inputs.
- `web/src/app/` holds routes only. A route renders a screen from a capability folder.
- `web/src/shared/` holds the styles, the generic interface parts and the code three capabilities
  use. `web/src/shell/`, `library/`, `project/` and `settings/` are the capabilities. Each holds
  use-case folders with `components/`, `hooks/`, `lib/` and `api/`, and exports through its
  `index.ts`.
- Web imports run one way: `shared` is used by all; `shell` by `library`, `project` and
  `settings`; `library` by `project` and `settings`. `app/` joins capabilities that would
  otherwise import each other.
- `web/e2e/` holds the browser tests, with their shared code in `support/`.
- `service/clipper/` holds one package per capability: `problems`, `settings`, `storage`,
  `media`, `projects`, `pipeline` and `fetching`. Each exports through its `__init__.py` and has
  at most one router. `main.py` joins them.
- Service imports run one way: `fetching` imports `pipeline`; both import `projects`, `media` and
  `storage`; `projects` imports neither. `main.py` hands `projects` what it needs from `pipeline`.
- A unit test sits beside the file it tests.

## Rules every write passes through

The coding-standards hooks on this Mac check every file an agent writes and refuse:

- a source file or folder named `utils`, `helpers`, `common` or `misc`; a file named `lib`, `util`
  or `helper`; and `types`, `constants` or the like directly under `src/` or `app/`;
- a file with more than 10 top-level functions or classes, test files excepted;
- a function body of more than 20 statements, test callbacks included;
- more than 3 positional parameters in TypeScript and JavaScript, more than 4 in Python;
- `any` in TypeScript and `Any` in Python, in every position, JSX text included;
- names that start with `str`, `arr`, `obj` or `fn` followed by a capital, and the snake_case
  forms in Python;
- an empty `catch` or `except: pass`, `debugger` and `breakpoint()`;
- a comment longer than one line anywhere but the top of a file;
- an import that reaches past a folder's `index.ts`, and one that climbs three or more parent
  folders;
- a comment or a rule switch in a `.coding-standards-structure` file.

Command programs write through `process.stdout.write` and `sys.stdout.write`, because
`console.log` and `print` draw a warning. An edit is checked only on the lines it adds, so check
whole files before a commit and fix every finding that is not tagged `[advisory]`:

```bash
python3 ~/.claude/skills/coding-standards/hooks/review-files.py <files>
```

## Dependencies

Every version is exact: in both `package.json` files, and with `==` in both requirements files,
transitive packages included. The service starts FastAPI with its tracing, metrics, logs and
exporter setup switched off, and without its documentation pages.
