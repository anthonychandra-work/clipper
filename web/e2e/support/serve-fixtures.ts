import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve } from 'node:path';
import type { Readable } from 'node:stream';

const SERVE_PROGRAM = resolve(import.meta.dirname, '..', '..', '..', 'scripts', 'serve-fixtures.mjs');
const ANNOUNCED_ADDRESS = /http:\/\/\S+/;

export interface FixtureServer {
  readonly address: string;
  repair(): Promise<void>;
  stop(): Promise<void>;
}

export async function serveFixtures(folder: string): Promise<FixtureServer> {
  const server = spawn(process.execPath, [SERVE_PROGRAM, folder], { stdio: ['ignore', 'pipe', 'inherit'] });
  const address = await readAnnouncedAddress(server.stdout);
  return {
    address,
    repair: async () => {
      await fetch(`${address}/repair`);
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
  if (!announced) throw new Error(`The fixture server did not print its address: ${firstLines}`);
  return announced[0];
}
