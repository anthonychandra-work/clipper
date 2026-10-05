import { join } from 'node:path';
import process from 'node:process';

import { buildWebApp } from './build-web-app.mjs';
import { describeWebTool, enterTestRun, finishTestRun } from './prepare-test-run.mjs';
import { ROOT_DIR, SERVICE_DIR, readRunSettings } from './read-run-settings.mjs';
import { runProgram } from './run-program.mjs';

const SERVICE_PYTHON = join(SERVICE_DIR, '.venv', 'bin', 'python');
const FIXTURE_BUILD_PROGRAM = join(ROOT_DIR, 'scripts', 'build-fixtures.mjs');
const TEST_MODEL_PROGRAM = join(ROOT_DIR, 'scripts', 'fetch-test-model.mjs');
const INTERRUPTS = ['SIGINT', 'SIGTERM'];

const GATES = [
  { name: 'Fixtures', run: (testRun) => prepareFixturesOnce(testRun) },
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
    results.push({ name: gate.name, hasPassed: await runGate(gate, testRun) });
  }
  process.stdout.write('\n--- Results\n');
  results.forEach(reportGate);
  finishTestRun(testRun);
  process.exit(results.every((result) => result.hasPassed) ? 0 : 1);
}

async function runGate(gate, testRun) {
  if (wasInterrupted) return false;
  process.stdout.write(`\n--- ${gate.name}\n`);
  return (await gate.run(testRun)) === 0;
}

async function prepareFixturesOnce(testRun) {
  const folder = join(testRun.folder, 'fixtures');
  const exitCode = await runProgram({ command: process.execPath, args: [FIXTURE_BUILD_PROGRAM, folder] });
  if (exitCode !== 0) return exitCode;
  process.env.CLIPPER_FIXTURES_DIR = folder;
  return runProgram({ command: process.execPath, args: [TEST_MODEL_PROGRAM] });
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
