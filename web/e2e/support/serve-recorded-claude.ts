import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve } from 'node:path';
import type { Readable } from 'node:stream';

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..');
const SERVE_PROGRAM = resolve(ROOT_DIR, 'scripts', 'serve-recorded-claude.mjs');
const RECORDED_REPLIES_DIR = resolve(ROOT_DIR, 'fixtures', 'claude');
const ANNOUNCED_ADDRESS = /http:\/\/\S+/;

export interface KeptRequest {
  scenario: string;
  path: string;
  beta: string | null;
  body: Record<string, unknown>;
  hasKey: boolean;
}

export interface RecordedClaude {
  readonly address: string;
  at(scenario: string): string;
  listRequests(): Promise<KeptRequest[]>;
  forgetRequests(): Promise<void>;
  stop(): Promise<void>;
}

export async function serveRecordedClaude(): Promise<RecordedClaude> {
  const server = spawn(process.execPath, [SERVE_PROGRAM, RECORDED_REPLIES_DIR], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const address = await readAnnouncedAddress(server.stdout);
  return {
    address,
    at: (scenario) => `${address}/${scenario}`,
    listRequests: async () => (await fetch(`${address}/requests`)).json(),
    forgetRequests: async () => {
      await fetch(`${address}/requests`, { method: 'DELETE' });
    },
    stop: async () => {
      server.kill();
      await once(server, 'exit');
    },
  };
}

async function readAnnouncedAddress(output: Readable): Promise<string> {
  const [firstLines] = await once(output, 'data');
  const announced = ANNOUNCED_ADDRESS.exec(String(firstLines));
  if (!announced) throw new Error(`The stand-in for the API did not print its address: ${firstLines}`);
  return announced[0];
}
