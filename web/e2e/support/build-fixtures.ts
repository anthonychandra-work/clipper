import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUILD_PROGRAM = resolve(import.meta.dirname, '..', '..', '..', 'scripts', 'build-fixtures.mjs');
const HOMEBREW_FFMPEG_DIR = '/opt/homebrew/opt/ffmpeg-full/bin';
const TALK_VIDEO = 'talk.mp4';
const ASK_FOR_LENGTH = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0'];

export function findOrBuildFixtures(runDir: string): string {
  const folder = process.env.CLIPPER_FIXTURES_DIR ?? join(runDir, 'fixtures');
  if (!existsSync(join(folder, TALK_VIDEO))) {
    execFileSync(process.execPath, [BUILD_PROGRAM, folder], { stdio: 'inherit' });
  }
  return folder;
}

export function probeTalkLength(fixturesDir: string): number {
  const ffprobe = join(process.env.CLIPPER_FFMPEG_DIR ?? HOMEBREW_FFMPEG_DIR, 'ffprobe');
  const answer = execFileSync(ffprobe, [...ASK_FOR_LENGTH, join(fixturesDir, TALK_VIDEO)], { encoding: 'utf8' });
  return Number(answer.trim());
}
