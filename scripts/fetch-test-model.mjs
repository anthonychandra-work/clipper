import { createWriteStream, existsSync, mkdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { ROOT_DIR } from './read-run-settings.mjs';

const REPOSITORY = 'mlx-community/whisper-tiny';
const REVISION = '78c52ab98ca87f570bc57ad852e15ef7060f9f76';
const MODEL_SOURCE = `https://huggingface.co/${REPOSITORY}/resolve/${REVISION}`;
const MODEL_DIR = join(ROOT_DIR, '.cache', 'whisper', 'tiny');
const PARTIAL_DIR = `${MODEL_DIR}.partial`;
const MODEL_FILES = [
  { name: 'config.json', bytes: 262 },
  { name: 'weights.npz', bytes: 74_418_182 },
];
const EXIT_FETCH_FAILED = 1;

fetchTestModel();

async function fetchTestModel() {
  if (!holdsModel(MODEL_DIR)) await fetchIntoPlace().catch(failFetch);
  process.stdout.write(`${MODEL_DIR}\n`);
}

function holdsModel(folder) {
  return MODEL_FILES.every((file) => hasBytes(join(folder, file.name), file.bytes));
}

function hasBytes(file, bytes) {
  return existsSync(file) && statSync(file).size === bytes;
}

async function fetchIntoPlace() {
  process.stderr.write(`Fetching the test model ${REPOSITORY} into .cache/whisper\n`);
  rmSync(PARTIAL_DIR, { recursive: true, force: true });
  mkdirSync(PARTIAL_DIR, { recursive: true });
  for (const file of MODEL_FILES) await fetchFile(file);
  rmSync(MODEL_DIR, { recursive: true, force: true });
  renameSync(PARTIAL_DIR, MODEL_DIR);
}

async function fetchFile(file) {
  const response = await fetch(`${MODEL_SOURCE}/${file.name}`);
  if (!response.ok) throw new Error(`${file.name} answered ${response.status}.`);
  const target = join(PARTIAL_DIR, file.name);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(target));
  if (!hasBytes(target, file.bytes)) {
    throw new Error(`${file.name} has ${statSync(target).size} bytes, and ${file.bytes} were expected.`);
  }
}

function failFetch(error) {
  process.stderr.write(`The test model could not be fetched: ${error.message}\n`);
  process.exit(EXIT_FETCH_FAILED);
}
