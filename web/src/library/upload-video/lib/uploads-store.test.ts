import { describe, expect, it, vi } from 'vitest';

import { RequestFailed, ServiceUnreachable } from '@/shared/lib/request-json';

import { type RunningUploads, UploadsStore, type UploadsSource } from './uploads-store';

const MIB = 1024 * 1024;

function buildStore(sendPart: UploadsSource['sendPart']) {
  const onEnded = vi.fn(async () => undefined);
  const source = { sendPart: vi.fn(sendPart), showToast: vi.fn(), onEnded, resendDelayMs: 0 };
  const store = new UploadsStore(source);
  const seen: RunningUploads[] = [];
  store.watch(() => seen.push(store.read()));
  return { store, source, seen };
}

async function acceptPart(_projectId: string, offset: number, part: Blob) {
  return { receivedBytes: offset + part.size };
}

function buildFile(bytes: number): Blob {
  return new Blob([new Uint8Array(bytes)]);
}

describe('the uploads store', () => {
  it('tells a screen how many bytes of a project have gone, and forgets it when all have', async () => {
    const { store, source, seen } = buildStore(acceptPart);

    const outcome = await store.start('a1b2c3', buildFile(12 * MIB));

    expect(seen).toEqual([
      { a1b2c3: { sentBytes: 0, totalBytes: 12 * MIB } },
      { a1b2c3: { sentBytes: 8 * MIB, totalBytes: 12 * MIB } },
      { a1b2c3: { sentBytes: 12 * MIB, totalBytes: 12 * MIB } },
      {},
    ]);
    expect(outcome).toBe('sent');
    expect(source.showToast).not.toHaveBeenCalled();
    expect(source.onEnded).toHaveBeenCalledTimes(1);
  });

  it('keeps the upload listed until the Library has been asked for the new state', async () => {
    const { store, source } = buildStore(acceptPart);
    const listedWhenAsked: string[][] = [];
    source.onEnded.mockImplementation(async () => {
      listedWhenAsked.push(Object.keys(store.read()));
    });

    await store.start('a1b2c3', buildFile(MIB));

    expect(listedWhenAsked).toEqual([['a1b2c3']]);
    expect(store.read()).toEqual({});
  });

  it('sends each part to the project it belongs to', async () => {
    const { store, source } = buildStore(acceptPart);

    await store.start('a1b2c3', buildFile(9 * MIB));

    expect(source.sendPart.mock.calls.map(([projectId, offset]) => [projectId, offset])).toEqual([
      ['a1b2c3', 0],
      ['a1b2c3', 8 * MIB],
    ]);
  });

  it('follows two uploads at once', async () => {
    const { store, seen } = buildStore(acceptPart);

    await Promise.all([store.start('first', buildFile(MIB)), store.start('second', buildFile(2 * MIB))]);

    expect(seen).toContainEqual({
      first: { sentBytes: 0, totalBytes: MIB },
      second: { sentBytes: 0, totalBytes: 2 * MIB },
    });
    expect(store.read()).toEqual({});
  });

  it('says the upload stopped when a part keeps failing', async () => {
    const { store, source } = buildStore(async () => {
      throw new ServiceUnreachable(new TypeError('fetch failed'));
    });

    const outcome = await store.start('a1b2c3', buildFile(MIB));

    expect(outcome).toBe('stopped');
    expect(source.sendPart).toHaveBeenCalledTimes(4);
    expect(source.showToast).toHaveBeenCalledWith('The upload stopped. Delete the project and upload the file again.');
    expect(store.read()).toEqual({});
  });

  it('ends the upload of a deleted project without a word', async () => {
    const { store, source } = buildStore(async () => {
      throw new RequestFailed(404, { problem: { section: null, message: 'This project does not exist.' } });
    });

    const outcome = await store.start('a1b2c3', buildFile(MIB));

    expect(outcome).toBe('deleted');
    expect(source.showToast).not.toHaveBeenCalled();
    expect(store.read()).toEqual({});
  });
});
