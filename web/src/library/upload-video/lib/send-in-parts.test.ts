import { describe, expect, it, vi } from 'vitest';

import { RequestFailed, ServiceUnreachable } from '@/shared/lib/request-json';

import { PART_BYTES, sendInParts, type UploadRun } from './send-in-parts';

const MIB = 1024 * 1024;

type SentPart = [offset: number, size: number];

function planRun(fileBytes: number, sendPart: UploadRun['sendPart']) {
  const progress: number[] = [];
  const run: UploadRun = {
    file: new Blob([new Uint8Array(fileBytes)]),
    sendPart: vi.fn(sendPart),
    onProgress: (sentBytes) => progress.push(sentBytes),
    waitBeforeResend: vi.fn(async () => undefined),
  };
  return { run, progress, sent: () => vi.mocked(run.sendPart).mock.calls.map(describePart) };
}

function describePart([offset, part]: [number, Blob]): SentPart {
  return [offset, part.size];
}

async function acceptPart(offset: number, part: Blob) {
  return { receivedBytes: offset + part.size };
}

describe('sendInParts', () => {
  it('cuts a file into 8 MiB parts and sends them in order', async () => {
    const { run, progress, sent } = planRun(20 * MIB, acceptPart);

    const outcome = await sendInParts(run);

    expect(PART_BYTES).toBe(8 * MIB);
    expect(sent()).toEqual([
      [0, 8 * MIB],
      [8 * MIB, 8 * MIB],
      [16 * MIB, 4 * MIB],
    ]);
    expect(progress).toEqual([8 * MIB, 16 * MIB, 20 * MIB]);
    expect(outcome).toBe('sent');
  });

  it('sends a file smaller than one part in a single request', async () => {
    const { run, sent } = planRun(3 * MIB, acceptPart);

    await sendInParts(run);

    expect(sent()).toEqual([[0, 3 * MIB]]);
  });

  it('carries on from the count the service holds when a part arrives out of step', async () => {
    let isFirstRequest = true;
    const { run, sent } = planRun(20 * MIB, async (offset, part) => {
      if (!isFirstRequest) return acceptPart(offset, part);
      isFirstRequest = false;
      throw new RequestFailed(409, { problem: { section: null, message: 'out of step' }, receivedBytes: 8 * MIB });
    });

    const outcome = await sendInParts(run);

    expect(sent()).toEqual([
      [0, 8 * MIB],
      [8 * MIB, 8 * MIB],
      [16 * MIB, 4 * MIB],
    ]);
    expect(outcome).toBe('sent');
  });

  it('sends a part again from the same count when the tool does not answer', async () => {
    let failuresLeft = 2;
    const { run, sent } = planRun(10 * MIB, async (offset, part) => {
      if (offset === 8 * MIB && failuresLeft > 0) {
        failuresLeft -= 1;
        throw new ServiceUnreachable(new TypeError('fetch failed'));
      }
      return acceptPart(offset, part);
    });

    const outcome = await sendInParts(run);

    expect(sent().map(([offset]) => offset)).toEqual([0, 8 * MIB, 8 * MIB, 8 * MIB]);
    expect(run.waitBeforeResend).toHaveBeenCalledTimes(2);
    expect(outcome).toBe('sent');
  });

  it('stops after a part has failed and been sent again three times', async () => {
    const { run, progress, sent } = planRun(20 * MIB, async (offset, part) => {
      if (offset === 0) return acceptPart(offset, part);
      throw new ServiceUnreachable(new TypeError('fetch failed'));
    });

    const outcome = await sendInParts(run);

    expect(sent().map(([offset]) => offset)).toEqual([0, 8 * MIB, 8 * MIB, 8 * MIB, 8 * MIB]);
    expect(progress).toEqual([8 * MIB]);
    expect(outcome).toBe('stopped');
  });

  it('counts the failures of each part on their own', async () => {
    const failuresLeft = new Map([
      [0, 3],
      [8 * MIB, 3],
    ]);
    const { run } = planRun(16 * MIB, async (offset, part) => {
      const left = failuresLeft.get(offset) ?? 0;
      failuresLeft.set(offset, left - 1);
      if (left > 0) throw new ServiceUnreachable(new TypeError('fetch failed'));
      return acceptPart(offset, part);
    });

    expect(await sendInParts(run)).toBe('sent');
  });

  it('ends as sent when the service has the whole file but its answer was lost', async () => {
    let attempts = 0;
    const { run } = planRun(3 * MIB, async () => {
      attempts += 1;
      if (attempts === 1) throw new ServiceUnreachable(new TypeError('fetch failed'));
      throw new RequestFailed(409, { problem: { section: null, message: 'This project is not waiting for an upload.' } });
    });

    expect(await sendInParts(run)).toBe('sent');
  });

  it('ends quietly when the project was deleted', async () => {
    const { run, sent } = planRun(20 * MIB, async (offset, part) => {
      if (offset === 0) return acceptPart(offset, part);
      throw new RequestFailed(404, { problem: { section: null, message: 'This project does not exist.' } });
    });

    const outcome = await sendInParts(run);

    expect(sent()).toHaveLength(2);
    expect(run.waitBeforeResend).not.toHaveBeenCalled();
    expect(outcome).toBe('deleted');
  });
});
