import { expect, isPortOpen, type PortSample, samplePortsUntilClosed, test } from './support';

const LOOPBACK = '127.0.0.1';
const BOTH_OPEN: PortSample = { isWebOpen: true, isServiceOpen: true };
const BOTH_CLOSED: PortSample = { isWebOpen: false, isServiceOpen: false };

function isServiceListeningAlone(sample: PortSample): boolean {
  return !sample.isWebOpen && sample.isServiceOpen;
}

test('the service stops listening before the web app when the tool is stopped', async ({ tool }) => {
  expect(await isPortOpen(LOOPBACK, tool.settings.webPort)).toBe(true);
  expect(await isPortOpen(LOOPBACK, tool.settings.servicePort)).toBe(true);

  const [samples] = await Promise.all([samplePortsUntilClosed(tool.settings), tool.stop()]);
  await tool.start();

  expect(samples[0]).toEqual(BOTH_OPEN);
  expect(samples.at(-1)).toEqual(BOTH_CLOSED);
  expect(samples.filter(isServiceListeningAlone)).toEqual([]);
});
