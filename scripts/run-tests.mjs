import { join } from 'node:path';
import process from 'node:process';

import { buildWebApp } from './build-web-app.mjs';
import { describeWebTool, enterTestRun, finishTestRun } from './prepare-test-run.mjs';
import { SERVICE_DIR, readRunSettings } from './read-run-settings.mjs';
import { runProgram } from './run-program.mjs';

const SERVICE_PYTHON = join(SERVICE_DIR, '.venv', 'bin', 'python');
const INTERRUPTS = ['SIGINT', 'SIGTERM'];

const GATES = [
  { name: 'Ruff', run: () => runProgram(describeServiceTool(['ruff', 'check', 'clipper'])) },
  { name: 'mypy', run: () => runProgram(describeServiceTool(['mypy', '--strict', 'clipper'])) },
  { name: 'pytest', run: () => runProgram(describeServiceTool(['pytest', 'clipper'])) },
  { name: 'ESLint', run: () => runProgram(describeWebTool('eslint', ['.'])) },
  { name: 'Web build', run: () => buildWebApp(readRunSettings(process.env), runProgram) },
  { name: 'TypeScript check', run: () => runProgram(describeWebTool('tsc', ['--noEmit'])) },
  { name: 'Vitest', run: () => runProgram(describeWebTool('vitest', ['run'])) },
  { name: 'Playwright', run: () => runProgram(describeWebTool('playwright', ['test'])) },
];

let wasInterrupted = false;

runTests();

async function runTests() {
  const testRun = enterTestRun();
  INTERRUPTS.forEach((signal) => process.on(signal, skipRemainingGates));
  const results = [];
  for (const gate of GATES) {
    results.push({ name: gate.name, hasPassed: await runGate(gate) });
  }
  process.stdout.write('\n--- Results\n');
  results.forEach(reportGate);
  finishTestRun(testRun);
  process.exit(results.every((result) => result.hasPassed) ? 0 : 1);
}

async function runGate(gate) {
  if (wasInterrupted) return false;
  process.stdout.write(`\n--- ${gate.name}\n`);
  return (await gate.run()) === 0;
}

function describeServiceTool(args) {
  return { command: SERVICE_PYTHON, args: ['-m', ...args], cwd: SERVICE_DIR };
}

function reportGate(result) {
  process.stdout.write(`${result.name}: ${result.hasPassed ? 'passed' : 'failed'}\n`);
}

function skipRemainingGates() {
  wasInterrupted = true;
}
