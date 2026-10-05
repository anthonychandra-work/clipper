import { existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { SERVICE_DIR } from './read-run-settings.mjs';
import { runProgram } from './run-program.mjs';

const SYSTEM_PYTHON = '/opt/homebrew/bin/python3.12';
const VENV_DIR = join(SERVICE_DIR, '.venv');
const VENV_PYTHON = join(VENV_DIR, 'bin', 'python');
const PINNED_PACKAGES = 'requirements-dev.txt';

const STEPS = [
  {
    title: 'Creating the Python environment in service/.venv',
    isDone: () => existsSync(VENV_PYTHON),
    program: { command: SYSTEM_PYTHON, args: ['-m', 'venv', VENV_DIR] },
  },
  {
    title: 'Installing the pinned Python packages',
    program: {
      command: VENV_PYTHON,
      args: ['-m', 'pip', 'install', '--disable-pip-version-check', '--requirement', PINNED_PACKAGES],
      cwd: SERVICE_DIR,
    },
  },
];

bootstrap();

async function bootstrap() {
  for (const step of STEPS) {
    if (step.isDone?.()) continue;
    process.stdout.write(`${step.title}\n`);
    const exitCode = await runProgram(step.program);
    if (exitCode !== 0) return failBootstrap(step, exitCode);
  }
  process.stdout.write('Clipper is set up. Start it with "pnpm start".\n');
}

function failBootstrap(step, exitCode) {
  process.stderr.write(`Setup stopped at: ${step.title}\n`);
  process.exit(exitCode);
}
