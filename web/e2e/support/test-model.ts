import { execFileSync } from 'node:child_process';
import { constants, cpSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FETCH_PROGRAM = resolve(import.meta.dirname, '..', '..', '..', 'scripts', 'fetch-test-model.mjs');
const DEFAULT_MODEL = 'large-v3-turbo';

export function findOrFetchTestModel(): string {
  const printed = execFileSync(process.execPath, [FETCH_PROGRAM], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  return printed.trim();
}

export function placeAsDefaultModel(testModelDir: string, dataDir: string): void {
  const folder = join(dataDir, 'models', DEFAULT_MODEL);
  if (existsSync(folder)) return;
  cpSync(testModelDir, folder, { recursive: true, mode: constants.COPYFILE_FICLONE });
}
