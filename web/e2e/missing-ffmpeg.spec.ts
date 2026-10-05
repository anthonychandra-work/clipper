import { existsSync, mkdtempSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';

import { expect, isPortOpen, launchStartCommand, readTestRunSettings, test } from './support';

const SPARE_WEB_PORT = 3101;
const SPARE_SERVICE_PORT = 8866;

function findFolderOf(program: string): string {
  const folders = (process.env.PATH ?? '').split(delimiter);
  const holder = folders.find((folder) => existsSync(join(folder, program)));
  if (!holder) throw new Error(`${program} is not on the PATH.`);
  return holder;
}

function describePathWithoutFfmpeg(): string {
  return [dirname(process.execPath), findFolderOf('pnpm'), '/usr/bin', '/bin'].join(delimiter);
}

test('the start command stops with a sentence that names the missing media tools', async () => {
  const emptyToolsDir = mkdtempSync(join(readTestRunSettings().runDir, 'no-tools-'));

  const command = launchStartCommand({
    ...process.env,
    PATH: describePathWithoutFfmpeg(),
    CLIPPER_FFMPEG_DIR: emptyToolsDir,
    CLIPPER_WEB_PORT: String(SPARE_WEB_PORT),
    CLIPPER_SERVICE_PORT: String(SPARE_SERVICE_PORT),
  });
  const exitCode = await command.exit;

  expect(exitCode).toBe(1);
  expect(command.output()).toContain('ffmpeg and ffprobe did not run');
  expect(command.output()).toContain(emptyToolsDir);
  expect(command.output()).not.toContain('Traceback');
  expect(await isPortOpen('127.0.0.1', SPARE_WEB_PORT)).toBe(false);
  expect(await isPortOpen('127.0.0.1', SPARE_SERVICE_PORT)).toBe(false);
});
