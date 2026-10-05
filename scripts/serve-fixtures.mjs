import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { basename, join, resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const LOOPBACK = '127.0.0.1';
const SLOW_PREFIX = '/slow/';
const REPAIRABLE_PREFIX = '/missing-until-repaired/';
const SLOW_STEPS = 60;
const SLOW_STEP_MS = 100;
const EXIT_USAGE = 2;

const folder = resolve(process.argv[2] ?? explainUsage());
let isRepaired = false;

const server = createServer((request, response) => answer(request, response));
server.listen(0, LOOPBACK, () => {
  process.stdout.write(`Fixtures are served at http://${LOOPBACK}:${server.address().port}\n`);
});

function explainUsage() {
  process.stderr.write('Name the folder to serve: node scripts/serve-fixtures.mjs <folder>\n');
  process.exit(EXIT_USAGE);
}

function answer(request, response) {
  const path = new URL(request.url, `http://${LOOPBACK}`).pathname;
  if (path === '/repair') return repair(response);
  if (path === '/missing.mp4') return sendNotFound(response);
  if (path.startsWith(REPAIRABLE_PREFIX) && !isRepaired) return sendNotFound(response);
  return sendFile(request, response, { name: basename(path), isSlow: path.startsWith(SLOW_PREFIX) });
}

function repair(response) {
  isRepaired = true;
  response.writeHead(200, { 'Content-Type': 'text/plain' }).end('repaired');
}

function sendNotFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found');
}

function sendFile(request, response, delivery) {
  const file = join(folder, delivery.name);
  if (!existsSync(file) || !statSync(file).isFile()) return sendNotFound(response);
  const size = statSync(file).size;
  const range = readRange(request.headers.range, size);
  if (range === null) return response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
  response.writeHead(range.isPartial ? 206 : 200, describeHeaders(range, size));
  if (request.method === 'HEAD') return response.end();
  if (delivery.isSlow) return trickle(file, range, response);
  return createReadStream(file, { start: range.start, end: range.end }).pipe(response);
}

function readRange(header, size) {
  const requested = /^bytes=(\d+)-(\d*)$/.exec(header ?? '');
  if (!requested) return { start: 0, end: size - 1, isPartial: false };
  const start = Number(requested[1]);
  const end = requested[2] === '' ? size - 1 : Math.min(Number(requested[2]), size - 1);
  return start <= end ? { start, end, isPartial: true } : null;
}

function describeHeaders(range, size) {
  const headers = {
    'Content-Type': 'video/mp4',
    'Content-Length': range.end - range.start + 1,
    'Accept-Ranges': 'bytes',
  };
  return range.isPartial ? { ...headers, 'Content-Range': `bytes ${range.start}-${range.end}/${size}` } : headers;
}

async function trickle(file, range, response) {
  const bytes = (await readFile(file)).subarray(range.start, range.end + 1);
  const stepSize = Math.ceil(bytes.length / SLOW_STEPS);
  for (let sent = 0; sent < bytes.length && !response.destroyed; sent += stepSize) {
    response.write(bytes.subarray(sent, sent + stepSize));
    await delay(SLOW_STEP_MS);
  }
  response.end();
}
