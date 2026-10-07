import { networkInterfaces } from 'node:os';

import { expect, isPortOpen, test } from './support';

const SETTLE_MS = 2000;

function findNetworkAddress(): string {
  const interfaces = Object.values(networkInterfaces()).flatMap((addresses) => addresses ?? []);
  const reachable = interfaces.find((address) => address.family === 'IPv4' && !address.internal);
  if (!reachable) throw new Error('This Mac has no network address. Join a network and run the test again.');
  return reachable.address;
}

test('the tool opens at the address the start command prints', async ({ page, tool }) => {
  expect(tool.address).toBe(`http://localhost:${tool.settings.webPort}`);

  await page.goto(tool.address);

  await expect(page).toHaveTitle('Clipper');
  await expect(page.locator('#app')).toBeAttached();
});

test('the service answers through the web port', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok' });
});

test('the web port is open on the network address and the service port is closed there', async ({ request, tool }) => {
  const networkAddress = findNetworkAddress();

  const library = await request.get(`http://${networkAddress}:${tool.settings.webPort}/`);

  expect(library.status()).toBe(200);
  expect(await isPortOpen(networkAddress, tool.settings.servicePort)).toBe(false);
  expect(await isPortOpen('127.0.0.1', tool.settings.servicePort)).toBe(true);
});

test('every request of the page goes to the address of the tool', async ({ page, tool }) => {
  const requestedAddresses: string[] = [];
  page.on('request', (request) => requestedAddresses.push(request.url()));

  await page.goto('/');
  await expect(page.locator('#app[data-layout]')).toBeVisible();
  await page.waitForTimeout(SETTLE_MS);

  expect(requestedAddresses.length).toBeGreaterThan(0);
  expect(requestedAddresses.filter((address) => !address.startsWith(`${tool.address}/`))).toEqual([]);
});
