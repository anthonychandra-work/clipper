import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

import { ROOT_DIR, readRunSettings } from './read-run-settings.mjs';
import { runProgram } from './run-program.mjs';

const HOMEBREW_FFMPEG_DIR = '/opt/homebrew/opt/ffmpeg-full/bin';
const TALK_SCRIPT = join(ROOT_DIR, 'fixtures', 'talk-script.txt');
const VOICE = 'Samantha';
const WORDS_PER_MINUTE = '120';
const ASK_FOR_LENGTH = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0'];
const PICTURE = ['-f', 'lavfi', '-i', 'smptebars=size=1280x720:rate=30'];
const SMALL_PICTURE = ['-f', 'lavfi', '-i', 'smptebars=size=320x180:rate=10'];
const SILENCE = ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=mono:sample_rate=44100'];
const FOUR_MORE_TIMES = ['-stream_loop', '4'];
const FIVE_TIMES_OVER = 5;
const TWENTY_SECONDS = 20;
const ENCODING = ['-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k'];
const EXIT_USAGE = 2;

buildFixtures(process.argv[2]);

async function buildFixtures(givenFolder) {
  if (!givenFolder) return explainUsage();
  const folder = resolve(givenFolder);
  mkdirSync(folder, { recursive: true });
  const speech = join(folder, 'talk.aiff');
  await runStep(describeSpeech(speech));
  const videos = listVideos(speech, measureSpeech(speech));
  await Promise.all(videos.map((video) => buildVideo(video, folder)));
  rmSync(speech);
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

function measureSpeech(speech) {
  const ffprobe = join(findFfmpegDir(), 'ffprobe');
  const answer = execFileSync(ffprobe, [...ASK_FOR_LENGTH, speech], { encoding: 'utf8' });
  return Number(answer.trim());
}

function listVideos(speech, speechSeconds) {
  return [
    { name: 'talk.mp4', inputs: [...PICTURE, '-i', speech], seconds: speechSeconds },
    {
      name: 'long-talk.mp4',
      inputs: [...SMALL_PICTURE, ...FOUR_MORE_TIMES, '-i', speech],
      seconds: FIVE_TIMES_OVER * speechSeconds,
    },
    { name: 'silence.mp4', inputs: [...PICTURE, ...SILENCE], seconds: TWENTY_SECONDS },
  ];
}

// A video's length is stated: ffmpeg's -shortest leaves a different tail of picture in each run.
async function buildVideo(video, folder) {
  const file = join(folder, video.name);
  const output = [...ENCODING, '-t', String(video.seconds), '-movflags', '+faststart', file];
  await runStep({
    command: join(findFfmpegDir(), 'ffmpeg'),
    args: ['-hide_banner', '-loglevel', 'error', '-y', ...video.inputs, ...output],
  });
  process.stdout.write(`Built ${file}\n`);
}

function findFfmpegDir() {
  return readRunSettings(process.env).paths.CLIPPER_FFMPEG_DIR ?? HOMEBREW_FFMPEG_DIR;
}
