import { type ChildProcess, spawn } from 'node:child_process';
import { connect } from 'node:net';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..');
const RUNNING_LINE = /Clipper is running at (http:\/\/\S+)/;
const LOOPBACK = '127.0.0.1';
const FIFTY_GB_IN_BYTES = String(50 * 1024 ** 3);
const KILLED_BY_SIGNAL = 128;
const PORT_POLL_MS = 100;
const PORT_CLOSE_TIMEOUT_MS = 20_000;

export interface TestRunSettings {
  runDir: string;
  dataDir: string;
  webPort: number;
  servicePort: number;
}

export interface StartCommand {
  readonly child: ChildProcess;
  readonly exit: Promise<number>;
  output(): string;
}

export function readTestRunSettings(): TestRunSettings {
  return {
    runDir: readVariable('CLIPPER_TEST_RUN_DIR'),
    dataDir: readVariable('CLIPPER_DATA_DIR'),
    webPort: Number(readVariable('CLIPPER_WEB_PORT')),
    servicePort: Number(readVariable('CLIPPER_SERVICE_PORT')),
  };
}

export type EnvironmentChanges = Partial<NodeJS.ProcessEnv>;

export function launchStartCommand(environment: NodeJS.ProcessEnv): StartCommand {
  const child = spawn('pnpm', ['start'], {
    cwd: ROOT_DIR,
    env: environment,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const printed: string[] = [];
  child.stdout.on('data', (chunk: Buffer) => printed.push(chunk.toString()));
  child.stderr.on('data', (chunk: Buffer) => printed.push(chunk.toString()));
  const exit = new Promise<number>((settle) => {
    child.once('close', (code) => settle(code ?? KILLED_BY_SIGNAL));
  });
  return { child, exit, output: () => printed.join('') };
}

export function isPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((settle) => {
    const socket = connect({ host, port });
    socket.once('connect', () => {
      socket.destroy();
      settle(true);
    });
    socket.once('error', () => settle(false));
  });
}

export class ToolRun {
  address = '';
  private command: StartCommand | null = null;

  constructor(
    readonly settings: TestRunSettings,
    readonly modelSource: string,
  ) {}

  async start(changes: EnvironmentChanges = {}): Promise<void> {
    const environment = {
      ...process.env,
      CLIPPER_REPORTED_FREE_BYTES: FIFTY_GB_IN_BYTES,
      CLIPPER_MODEL_SOURCE: this.modelSource,
      ...changes,
    };
    this.command = launchStartCommand(environment);
    this.address = await readPrintedAddress(this.command);
  }

  async stop(): Promise<void> {
    if (this.command === null) return;
    interruptGroup(this.command.child);
    await this.command.exit;
    this.command = null;
    await waitUntilClosed(this.settings.webPort);
    await waitUntilClosed(this.settings.servicePort);
  }
}

function readVariable(name: string): string {
  const value = process.env[name];
  if (value) return value;
  throw new Error(`${name} is not set. Run the browser tests with "pnpm test:browser <file>".`);
}

function readPrintedAddress(command: StartCommand): Promise<string> {
  return new Promise((settle, reject) => {
    command.child.stdout?.on('data', () => {
      const found = RUNNING_LINE.exec(command.output());
      if (found) settle(found[1]);
    });
    command.exit.then((code) => {
      reject(new Error(`The start command ended with code ${code}:\n${command.output()}`));
    });
  });
}

function interruptGroup(child: ChildProcess): void {
  if (child.pid === undefined || child.exitCode !== null) return;
  process.kill(-child.pid, 'SIGINT');
}

async function waitUntilClosed(port: number): Promise<void> {
  const deadline = Date.now() + PORT_CLOSE_TIMEOUT_MS;
  while (await isPortOpen(LOOPBACK, port)) {
    if (Date.now() > deadline) throw new Error(`Port ${port} is still open after the tool was stopped.`);
    await delay(PORT_POLL_MS);
  }
}
