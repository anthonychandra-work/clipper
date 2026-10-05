import { setTimeout as delay } from 'node:timers/promises';

import { isPortOpen } from './run-tool';

const LOOPBACK = '127.0.0.1';
const SAMPLE_PAUSE_MS = 1;
const WATCH_TIMEOUT_MS = 30_000;

export interface WatchedPorts {
  webPort: number;
  servicePort: number;
}

export interface PortSample {
  isWebOpen: boolean;
  isServiceOpen: boolean;
}

export async function samplePortsUntilClosed(ports: WatchedPorts): Promise<PortSample[]> {
  const deadline = Date.now() + WATCH_TIMEOUT_MS;
  const samples: PortSample[] = [];
  for (;;) {
    const sample = await samplePorts(ports);
    samples.push(sample);
    if (!sample.isWebOpen && !sample.isServiceOpen) return samples;
    if (Date.now() > deadline) throw new Error(`A port is still open: ${JSON.stringify(sample)}`);
    await delay(SAMPLE_PAUSE_MS);
  }
}

// The web port is read first, so a service port read as open after it outlived the web port.
async function samplePorts(ports: WatchedPorts): Promise<PortSample> {
  const isWebOpen = await isPortOpen(LOOPBACK, ports.webPort);
  const isServiceOpen = await isPortOpen(LOOPBACK, ports.servicePort);
  return { isWebOpen, isServiceOpen };
}
