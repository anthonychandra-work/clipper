import { existsSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

import { BROWSERS_DIR, describeWebTool } from './prepare-test-run.mjs';
import { ROOT_DIR, SERVICE_DIR } from './read-run-settings.mjs';
import { runProgram } from './run-program.mjs';

const SYSTEM_PYTHON = '/opt/homebrew/bin/python3.12';
const VENV_DIR = join(SERVICE_DIR, '.venv');
const VENV_PYTHON = join(VENV_DIR, 'bin', 'python');
const PINNED_PACKAGES = ['--requirement', 'requirements-dev.txt'];
const PINNED_BUILD_TOOLS = ['--build-constraint', 'build-constraints.txt'];
const TEST_MODEL_PROGRAM = join(ROOT_DIR, 'scripts', 'fetch-test-model.mjs');

// The two requirement files name every package, and two that mlx-whisper declares are left out.
const INSTALL_AS_PINNED = ['install', '--disable-pip-version-check', '--no-deps'];

// Left out: FFmpeg and video reading, every library Homebrew could lend, and OpenCV's two downloads.
const OPENCV_PARTS_LEFT_OUT = [
  'WITH_FFMPEG',
  'WITH_AVFOUNDATION',
  'WITH_GSTREAMER',
  'WITH_OPENEXR',
  'WITH_AVIF',
  'WITH_JPEGXL',
  'WITH_OPENJPEG',
  'WITH_JASPER',
  'WITH_TIFF',
  'WITH_WEBP',
  'WITH_ITT',
  'WITH_OPENCL',
  'WITH_KLEIDICV',
  'WITH_UNIFONT',
  'BUILD_opencv_videoio',
  'BUILD_opencv_highgui',
];
const OPENCV_PARTS_COMPILED_IN = ['BUILD_JPEG', 'BUILD_PNG', 'BUILD_ZLIB', 'BUILD_PROTOBUF'];

const STEPS = [
  {
    title: 'Creating the Python environment in service/.venv',
    isDone: () => existsSync(VENV_PYTHON),
    program: { command: SYSTEM_PYTHON, args: ['-m', 'venv', VENV_DIR] },
  },
  {
    title: 'Installing the pinned Python packages',
    note: 'The first setup compiles OpenCV, which takes about four minutes.',
    program: {
      command: VENV_PYTHON,
      args: ['-m', 'pip', ...INSTALL_AS_PINNED, ...PINNED_PACKAGES, ...PINNED_BUILD_TOOLS],
      cwd: SERVICE_DIR,
      env: { ...process.env, ...describeOpenCvBuild() },
    },
  },
  {
    title: 'Installing the browser the tests drive into .cache/playwright',
    program: {
      ...describeWebTool('playwright', ['install', 'chromium', '--only-shell']),
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: BROWSERS_DIR },
    },
  },
  {
    title: 'Fetching the model the tests transcribe with into .cache/whisper',
    program: { command: process.execPath, args: [TEST_MODEL_PROGRAM] },
  },
];

bootstrap();

async function bootstrap() {
  for (const step of STEPS) {
    if (step.isDone?.()) continue;
    process.stdout.write(`${announce(step)}\n`);
    const exitCode = await runProgram(step.program);
    if (exitCode !== 0) return failBootstrap(step, exitCode);
  }
  process.stdout.write('Clipper is set up. Start it with "pnpm start".\n');
}

function announce(step) {
  return step.note ? `${step.title}. ${step.note}` : step.title;
}

function failBootstrap(step, exitCode) {
  process.stderr.write(`Setup stopped at: ${step.title}\n`);
  process.exit(exitCode);
}

function describeOpenCvBuild() {
  const switches = [
    ...OPENCV_PARTS_LEFT_OUT.map((part) => `-D${part}=OFF`),
    ...OPENCV_PARTS_COMPILED_IN.map((part) => `-D${part}=ON`),
  ];
  return {
    ENABLE_HEADLESS: '1',
    MAKEFLAGS: `-j${availableParallelism()}`,
    CMAKE_ARGS: switches.join(' '),
  };
}
