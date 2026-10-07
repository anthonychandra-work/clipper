import { spawn } from 'node:child_process';
import { constants } from 'node:os';

const STOP_GRACE_MS = 5000;
const SIGNAL_EXIT_BASE = 128;
const COULD_NOT_START = 127;

export function runProgram(program) {
  return waitForExit(spawn(program.command, program.args, { ...spawnOptions(program), detached: false }));
}

export function startProgram(program) {
  return spawn(program.command, program.args, { ...spawnOptions(program), detached: true });
}

export function waitForExit(child) {
  if (hasExited(child)) return Promise.resolve(exitCodeOf(child));
  return new Promise((settle) => {
    child.once('error', (error) => settle(reportStartFailure(child, error)));
    child.once('exit', () => settle(exitCodeOf(child)));
  });
}

export async function stopProgram(child) {
  if (hasExited(child) || child.pid === undefined) return;
  signalGroup(child, 'SIGTERM');
  const forcedStop = setTimeout(() => signalGroup(child, 'SIGKILL'), STOP_GRACE_MS);
  await waitForExit(child);
  clearTimeout(forcedStop);
}

function spawnOptions(program) {
  return { cwd: program.cwd, env: program.env ?? process.env, stdio: 'inherit' };
}

function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function exitCodeOf(child) {
  return child.exitCode ?? SIGNAL_EXIT_BASE + constants.signals[child.signalCode];
}

function reportStartFailure(child, error) {
  process.stderr.write(`Could not start ${child.spawnfile}: ${error.message}\n`);
  return COULD_NOT_START;
}

function signalGroup(child, signal) {
  try {
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}
