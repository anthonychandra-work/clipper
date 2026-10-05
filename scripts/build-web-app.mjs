import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { WEB_DIR, describeRunEnvironment } from './read-run-settings.mjs';

const NEXT_PROGRAM = join(WEB_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');
const BUILD_RECORD_NAME = 'clipper-build.json';
const BUILD_INPUTS = ['src', 'public', 'next.config.ts', 'package.json', 'tsconfig.json'];

export function describeNextProgram(settings, args) {
  return {
    command: process.execPath,
    args: [NEXT_PROGRAM, ...args],
    cwd: WEB_DIR,
    env: describeRunEnvironment(settings, process.env),
  };
}

export async function buildWebAppIfStale(settings, runToCompletion) {
  if (!isWebBuildStale(settings)) return;
  const startedAtMs = Date.now();
  rmSync(buildRecordPath(settings), { force: true });
  const exitCode = await runToCompletion(describeNextProgram(settings, ['build']));
  if (exitCode !== 0) throw new Error('The web app could not be built. The lines above say why.');
  writeFileSync(buildRecordPath(settings), JSON.stringify({ servicePort: settings.servicePort, startedAtMs }));
}

function isWebBuildStale(settings) {
  const record = readBuildRecord(settings);
  if (record === null || record.servicePort !== settings.servicePort) return true;
  const newestInputMs = Math.max(...BUILD_INPUTS.map((input) => newestChangeMs(join(WEB_DIR, input))));
  return newestInputMs > record.startedAtMs;
}

function readBuildRecord(settings) {
  const recordPath = buildRecordPath(settings);
  return existsSync(recordPath) ? JSON.parse(readFileSync(recordPath, 'utf8')) : null;
}

function buildRecordPath(settings) {
  return join(WEB_DIR, settings.webBuildDir, BUILD_RECORD_NAME);
}

function newestChangeMs(path) {
  if (!existsSync(path)) return 0;
  if (!statSync(path).isDirectory()) return statSync(path).mtimeMs;
  const entries = readdirSync(path, { recursive: true, withFileTypes: true });
  return Math.max(0, ...entries.map((entry) => statSync(join(entry.parentPath, entry.name)).mtimeMs));
}
