import { existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { buildWebAppIfStale, describeNextProgram } from './build-web-app.mjs';
import { SERVICE_DIR, WEB_DIR, describeRunEnvironment, readRunSettings } from './read-run-settings.mjs';
import { startProgram, stopProgram, waitForExit } from './run-program.mjs';
import { waitUntilAnswering } from './wait-until-answering.mjs';

const SERVICE_PYTHON = join(SERVICE_DIR, '.venv', 'bin', 'python');
const INSTALLED_NEXT = join(WEB_DIR, 'node_modules', 'next');
const EVERY_INTERFACE = '0.0.0.0';
const EXIT_FAILED = 1;
const SIGNAL_EXIT_CODES = { SIGHUP: 129, SIGINT: 130, SIGTERM: 143 };

const runningPrograms = new Set();
let isStopping = false;

main().catch(failStart);

async function main() {
  assertSetUp();
  const settings = readRunSettings(process.env);
  stopOnSignals();
  launchPart(describeService(settings));
  await waitUntilAnswering(`http://127.0.0.1:${settings.servicePort}/api/health`);
  await buildWebAppIfStale(settings, runToCompletion);
  launchPart(describeWebApp(settings));
  await waitUntilAnswering(`http://127.0.0.1:${settings.webPort}/api/health`);
  process.stdout.write(`Clipper is running at http://localhost:${settings.webPort}\n`);
}

function assertSetUp() {
  if (existsSync(SERVICE_PYTHON) && existsSync(INSTALLED_NEXT)) return;
  throw new Error('Clipper is not set up yet. Run "pnpm install" and then "pnpm bootstrap".');
}

function describeService(settings) {
  return {
    command: SERVICE_PYTHON,
    args: ['-m', 'clipper'],
    cwd: SERVICE_DIR,
    env: describeRunEnvironment(settings, process.env),
  };
}

function describeWebApp(settings) {
  const address = ['--hostname', EVERY_INTERFACE, '--port', String(settings.webPort)];
  return describeNextProgram(settings, ['start', ...address]);
}

function launchPart(program) {
  const part = startProgram(program);
  runningPrograms.add(part);
  waitForExit(part).then(() => shutDown(EXIT_FAILED));
}

async function runToCompletion(program) {
  const child = startProgram(program);
  runningPrograms.add(child);
  const exitCode = await waitForExit(child);
  runningPrograms.delete(child);
  return exitCode;
}

function stopOnSignals() {
  Object.entries(SIGNAL_EXIT_CODES).forEach(([signal, exitCode]) => {
    process.on(signal, () => shutDown(exitCode));
  });
}

async function shutDown(exitCode) {
  if (isStopping) return;
  isStopping = true;
  await Promise.all([...runningPrograms].map(stopProgram));
  process.exit(exitCode);
}

function failStart(error) {
  process.stderr.write(`${error.message}\n`);
  return shutDown(EXIT_FAILED);
}
