import { connect } from 'node:net';

import { expect, test } from './support';

const LOOPBACK = '127.0.0.1';
const BYTES_THAT_ARE_NO_REQUEST = 'this is no request\r\n\r\n';
const LINE_OF_THE_SERVICE = 'Invalid HTTP request received.';

function sendNoRequest(port: number): Promise<void> {
  return new Promise((settle, reject) => {
    const socket = connect({ host: LOOPBACK, port }, () => socket.write(BYTES_THAT_ARE_NO_REQUEST));
    socket.resume();
    socket.once('close', () => settle());
    socket.once('error', reject);
  });
}

test('a test is given what the tool printed while it ran, with the line of the service from before a restart of the tool and the address line of the new start', async ({
  tool,
  readToolOutputOfTest,
}) => {
  const addressLine = `Clipper is running at ${tool.address}`;
  await sendNoRequest(tool.settings.servicePort);

  await tool.stop();
  await tool.start();
  const printed = readToolOutputOfTest();

  expect(printed).toContain(LINE_OF_THE_SERVICE);
  expect(printed).toContain(addressLine);
  expect(printed.indexOf(LINE_OF_THE_SERVICE)).toBeLessThan(printed.indexOf(addressLine));
});
