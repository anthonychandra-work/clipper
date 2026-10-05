import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUILD_PROGRAM = resolve(import.meta.dirname, '..', '..', '..', 'scripts', 'build-fixtures.mjs');
const TALK_VIDEO = 'talk.mp4';

export function findOrBuildFixtures(runDir: string): string {
  const folder = process.env.CLIPPER_FIXTURES_DIR ?? join(runDir, 'fixtures');
  if (!existsSync(join(folder, TALK_VIDEO))) {
    execFileSync(process.execPath, [BUILD_PROGRAM, folder], { stdio: 'inherit' });
  }
  return folder;
}
