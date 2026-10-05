import { mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

import { ROOT_DIR, readRunSettings } from './read-run-settings.mjs';
import { runProgram } from './run-program.mjs';

const HOMEBREW_FFMPEG_DIR = '/opt/homebrew/opt/ffmpeg-full/bin';
const TALK_SCRIPT = join(ROOT_DIR, 'fixtures', 'talk-script.txt');
const VOICE = 'Samantha';
const WORDS_PER_MINUTE = '120';
const PICTURE = 'smptebars=size=1280x720:rate=30';
const EXIT_USAGE = 2;

buildFixtures(process.argv[2]);

async function buildFixtures(givenFolder) {
  if (!givenFolder) return explainUsage();
  const folder = resolve(givenFolder);
  mkdirSync(folder, { recursive: true });
  const speech = join(folder, 'talk.aiff');
  const video = join(folder, 'talk.mp4');
  await runStep(describeSpeech(speech));
  await runStep(describeTalkVideo(speech, video));
  rmSync(speech);
  process.stdout.write(`Built ${video}\n`);
}

function explainUsage() {
  process.stderr.write('Name the folder to build into: node scripts/build-fixtures.mjs <folder>\n');
  process.exit(EXIT_USAGE);
}

async function runStep(program) {
  const exitCode = await runProgram(program);
  if (exitCode !== 0) process.exit(exitCode);
}

function describeSpeech(speech) {
  return { command: 'say', args: ['-v', VOICE, '-r', WORDS_PER_MINUTE, '-o', speech, '-f', TALK_SCRIPT] };
}

function describeTalkVideo(speech, video) {
  const picture = ['-f', 'lavfi', '-i', PICTURE];
  const encoding = ['-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k'];
  const output = ['-shortest', '-movflags', '+faststart', video];
  return {
    command: join(findFfmpegDir(), 'ffmpeg'),
    args: ['-hide_banner', '-loglevel', 'error', '-y', ...picture, '-i', speech, ...encoding, ...output],
  };
}

function findFfmpegDir() {
  return readRunSettings(process.env).paths.CLIPPER_FFMPEG_DIR ?? HOMEBREW_FFMPEG_DIR;
}
