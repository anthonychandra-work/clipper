import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ROOT_DIR, WEB_DIR } from './read-run-settings.mjs';

export const BROWSERS_DIR = join(ROOT_DIR, '.cache', 'playwright');

const TEST_WEB_PORT = '3100';
const TEST_SERVICE_PORT = '8865';
const TEST_WEB_BUILD_DIR = '.next-test';
const CLOSED_LOCAL_PORT = 'http://127.0.0.1:9';
const BYTES_PER_MB = 1024 ** 2;
const BYTES_PER_GB = 1024 ** 3;

export function enterTestRun() {
  const folder = mkdtempSync(join(tmpdir(), 'clipper-test-'));
  Object.assign(process.env, {
    CLIPPER_TEST_RUN_DIR: folder,
    CLIPPER_DATA_DIR: join(folder, 'data'),
    CLIPPER_KEY_FILE: join(folder, 'anthropic-api-key'),
    CLIPPER_WEB_PORT: TEST_WEB_PORT,
    CLIPPER_SERVICE_PORT: TEST_SERVICE_PORT,
    CLIPPER_WEB_BUILD_DIR: TEST_WEB_BUILD_DIR,
    CLIPPER_MODEL_SOURCE: CLOSED_LOCAL_PORT,
    CLIPPER_ANTHROPIC_SOURCE: CLOSED_LOCAL_PORT,
    PLAYWRIGHT_BROWSERS_PATH: BROWSERS_DIR,
    NEXT_TELEMETRY_DISABLED: '1',
  });
  return { folder };
}

export function describeWebTool(name, args) {
  return { command: join(WEB_DIR, 'node_modules', '.bin', name), args, cwd: WEB_DIR };
}

export function finishTestRun(testRun) {
  const bytes = measureFolderBytes(testRun.folder);
  rmSync(testRun.folder, { recursive: true, force: true });
  const size = `${(bytes / BYTES_PER_GB).toFixed(2)} GB (${(bytes / BYTES_PER_MB).toFixed(1)} MB)`;
  process.stdout.write(`Test data folder: ${testRun.folder}\n`);
  process.stdout.write(`Test data size: ${size}\n`);
  process.stdout.write('The test data folder was removed.\n');
}

function measureFolderBytes(folder) {
  const entries = readdirSync(folder, { recursive: true, withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());
  return files.reduce((sum, entry) => sum + statSync(join(entry.parentPath, entry.name)).size, 0);
}
