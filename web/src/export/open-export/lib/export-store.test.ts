import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFailed } from '@/shared/lib/request-json';

import { describeFirstClip, describeSecondClip, describeTalkExport } from '../../export.fixtures';
import type { ClipRender, ProjectExport } from '../../export.types';
import { ExportStore, NOTHING_FETCHED } from './export-store';

const PROJECT_ID = 'a1b2c3d4e5f6';
const SOURCE_DELETED = 'The source video was deleted to free space. New clips cannot be rendered.';
const NO_ANSWER = 'Clipper did not answer. Check that it is still running, then try again.';
const DOWNLOAD = `/api/projects/${PROJECT_ID}/clips/c01/export`;
const WAITING: ClipRender = { state: 'waiting', percent: 0, reason: null };
const DONE: ClipRender = { state: 'done', percent: 100, reason: null };

const NOT_RENDERED = describeTalkExport();
const QUEUED = describeTalkExport({
  clips: [describeFirstClip({ render: { state: 'rendering', percent: 12, reason: null } }), describeSecondClip({ render: WAITING })],
});
const HALF_DONE = describeTalkExport({
  clips: [
    describeFirstClip({ render: DONE, download: DOWNLOAD }),
    describeSecondClip({ render: { state: 'rendering', percent: 40, reason: null } }),
  ],
});
const ALL_DONE = describeTalkExport({
  clips: [describeFirstClip({ render: DONE, download: DOWNLOAD }), describeSecondClip({ render: DONE, download: DOWNLOAD })],
});

function standInForTheService(fetched: ProjectExport[]) {
  const answers = [...fetched];
  const service = {
    fetchExport: vi.fn(async (projectId: string) => {
      void projectId;
      return answers.length > 1 ? (answers.shift() as ProjectExport) : answers[0];
    }),
    startRenders: vi.fn(async (projectId: string) => {
      void projectId;
      return QUEUED;
    }),
    retryRender: vi.fn(async (projectId: string, clipId: string) => {
      void [projectId, clipId];
      return QUEUED;
    }),
    cancelRenders: vi.fn(async (projectId: string) => {
      void projectId;
      return NOT_RENDERED;
    }),
  };
  return { service, store: new ExportStore(PROJECT_ID, service) };
}

function refuse(): RequestFailed {
  return new RequestFailed(409, { problem: { section: null, message: SOURCE_DELETED } });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('the export store', () => {
  it('holds nothing and asks nothing until a component reads it, then fetches the export', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED]);
    const before = store.read();
    const told = vi.fn();

    store.watch(told);
    await vi.advanceTimersByTimeAsync(0);

    expect(before).toBe(NOTHING_FETCHED);
    expect(service.fetchExport).toHaveBeenCalledExactlyOnceWith(PROJECT_ID);
    expect(store.read()).toEqual({ projectExport: NOT_RENDERED, problem: null });
    expect(told).toHaveBeenCalledTimes(1);
  });

  it('does not ask again while no clip is waiting or rendering', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED]);

    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(5000);

    expect(service.fetchExport).toHaveBeenCalledTimes(1);
  });

  it('asks again every second while a clip renders, and no more once all are done', async () => {
    const { service, store } = standInForTheService([QUEUED, QUEUED, HALF_DONE, ALL_DONE]);
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    await vi.advanceTimersByTimeAsync(999);
    const askedInTheFirstSecond = service.fetchExport.mock.calls.length;
    await vi.advanceTimersByTimeAsync(1);
    const askedAfterOneSecond = service.fetchExport.mock.calls.length;
    await vi.advanceTimersByTimeAsync(2000);
    const shownWhenDone = store.read().projectExport;
    await vi.advanceTimersByTimeAsync(10_000);

    expect([askedInTheFirstSecond, askedAfterOneSecond]).toEqual([1, 2]);
    expect(shownWhenDone).toEqual(ALL_DONE);
    expect(service.fetchExport).toHaveBeenCalledTimes(4);
  });

  it('tells its readers only when the answer differs from the one it holds', async () => {
    const { store } = standInForTheService([QUEUED, QUEUED, QUEUED, HALF_DONE]);
    const told = vi.fn();

    store.watch(told);
    await vi.advanceTimersByTimeAsync(2000);
    const toldWhileUnchanged = told.mock.calls.length;
    await vi.advanceTimersByTimeAsync(1000);

    expect(toldWhileUnchanged).toBe(1);
    expect(told).toHaveBeenCalledTimes(2);
  });

  it('stops asking when nobody is watching, and asks afresh when somebody watches again', async () => {
    const { service, store } = standInForTheService([QUEUED]);
    const stopWatching = store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(1000);

    stopWatching();
    await vi.advanceTimersByTimeAsync(5000);
    const askedWhileUnwatched = service.fetchExport.mock.calls.length;
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    expect(askedWhileUnwatched).toBe(2);
    expect(service.fetchExport).toHaveBeenCalledTimes(3);
  });

  it('does not start asking after a fetch that nobody watches', async () => {
    const { service, store } = standInForTheService([QUEUED]);

    await store.load();
    await vi.advanceTimersByTimeAsync(5000);

    expect(service.fetchExport).toHaveBeenCalledTimes(1);
    expect(store.read().projectExport).toEqual(QUEUED);
  });

  it('puts the answer of Render in place and then follows the renders', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED, HALF_DONE, ALL_DONE]);
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    await store.startRenders();
    const shownAfterRender = store.read().projectExport;
    await vi.advanceTimersByTimeAsync(2000);

    expect(service.startRenders).toHaveBeenCalledExactlyOnceWith(PROJECT_ID);
    expect(shownAfterRender).toEqual(QUEUED);
    expect(store.read().projectExport).toEqual(ALL_DONE);
    expect(service.fetchExport).toHaveBeenCalledTimes(3);
  });

  it('puts the answer of Retry in place for the clip it names', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED]);
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    await store.retryRender('c02');

    expect(service.retryRender).toHaveBeenCalledExactlyOnceWith(PROJECT_ID, 'c02');
    expect(store.read().projectExport).toEqual(QUEUED);
  });

  it('puts the answer of Cancel in place and stops asking', async () => {
    const { service, store } = standInForTheService([QUEUED]);
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    await store.cancelRenders();
    await vi.advanceTimersByTimeAsync(5000);

    expect(service.cancelRenders).toHaveBeenCalledExactlyOnceWith(PROJECT_ID);
    expect(store.read()).toEqual({ projectExport: NOT_RENDERED, problem: null });
    expect(service.fetchExport).toHaveBeenCalledTimes(1);
  });

  it('gives the problem of a refusal to be shown and keeps the export the service holds', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED]);
    service.startRenders.mockRejectedValueOnce(refuse());
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    await store.startRenders();

    expect(store.read()).toEqual({
      projectExport: NOT_RENDERED,
      problem: { section: null, message: SOURCE_DELETED },
    });
  });

  it('clears a shown problem with the next answer, even an unchanged one', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED]);
    service.retryRender.mockRejectedValueOnce(refuse());
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);
    await store.retryRender('c01');

    await store.load();

    expect(store.read()).toEqual({ projectExport: NOT_RENDERED, problem: null });
  });

  it('gives the problem of a first fetch that failed, with nothing held', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED]);
    service.fetchExport.mockRejectedValueOnce(new Error('offline'));

    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    expect(store.read()).toEqual({ projectExport: null, problem: { section: null, message: NO_ANSWER } });
  });

  it('keeps what it holds and asks again when a later fetch fails while a clip renders', async () => {
    const { service, store } = standInForTheService([QUEUED, ALL_DONE]);
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);
    service.fetchExport.mockRejectedValueOnce(new Error('offline'));

    await vi.advanceTimersByTimeAsync(1000);
    const shownAfterTheFailure = store.read();
    await vi.advanceTimersByTimeAsync(1000);

    expect(shownAfterTheFailure).toEqual({ projectExport: QUEUED, problem: null });
    expect(store.read().projectExport).toEqual(ALL_DONE);
  });

  it('drops a fetch that was on its way while Render was sent, since it may show the queue as it stood', async () => {
    const { service, store } = standInForTheService([NOT_RENDERED]);
    let answerTheFetch: (answer: ProjectExport) => void = () => undefined;
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);
    service.fetchExport.mockImplementationOnce(() => new Promise<ProjectExport>((answer) => (answerTheFetch = answer)));

    const fetching = store.load();
    await store.startRenders();
    answerTheFetch(NOT_RENDERED);
    await fetching;

    expect(store.read().projectExport).toEqual(QUEUED);
  });
});
