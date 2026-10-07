import { describe, expect, it, vi } from 'vitest';

import { RequestFailed } from '@/shared/lib/request-json';

import { describeTalkResults } from '../../results.fixtures';
import type { ProjectResults } from '../../results.types';
import { NOTHING_FETCHED, ResultsStore } from './results-store';

const PROJECT_ID = 'a1b2c3d4e5f6';
const REFUSED = 'Clipper could not make this change. Reload the page and try again.';
const NO_ANSWER = 'Clipper did not answer. Check that it is still running, then try again.';

interface Waiting {
  answer: (results: ProjectResults) => void;
  fail: (error: unknown) => void;
}

function standInForTheService(fetched: ProjectResults = describeTalkResults()) {
  const saves: Waiting[] = [];
  const heldFetches: Waiting[] = [];
  let isHoldingFetches = false;
  const wait = (waiting: Waiting[]) =>
    new Promise<ProjectResults>((answer, fail) => {
      waiting.push({ answer, fail });
    });
  const service = {
    fetchResults: vi.fn((projectId: string) => {
      void projectId;
      return isHoldingFetches ? wait(heldFetches) : Promise.resolve(fetched);
    }),
    saveViews: vi.fn((projectId: string, clipId: string, views: number | null) => {
      void [projectId, clipId, views];
      return wait(saves);
    }),
  };
  const holdFetches = () => {
    isHoldingFetches = true;
  };
  return { service, saves, heldFetches, holdFetches };
}

async function openStore(fetched?: ProjectResults) {
  const standIn = standInForTheService(fetched);
  const store = new ResultsStore(PROJECT_ID, standIn.service);
  await store.load();
  return { store, ...standIn };
}

function readViews(store: ResultsStore): (number | null)[] {
  return store.read().results?.clips.map((clip) => clip.views) ?? [];
}

function refuse(): RequestFailed {
  return new RequestFailed(422, { problem: { section: null, message: REFUSED } });
}

describe('the results store', () => {
  it('holds nothing and asks nothing until somebody watches, then fetches the results once', async () => {
    const { service } = standInForTheService();
    const store = new ResultsStore(PROJECT_ID, service);
    const before = store.read();
    const told = vi.fn();

    store.watch(told);
    store.watch(vi.fn());
    await vi.waitFor(() => expect(told).toHaveBeenCalledTimes(1));

    expect(before).toBe(NOTHING_FETCHED);
    expect(service.fetchResults).toHaveBeenCalledTimes(1);
    expect(service.fetchResults).toHaveBeenCalledWith(PROJECT_ID);
    expect(store.read()).toEqual({ results: describeTalkResults(), problem: null });
  });

  it('gives the problem to be shown when the results cannot be fetched', async () => {
    const { service } = standInForTheService();
    service.fetchResults.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const store = new ResultsStore(PROJECT_ID, service);

    await store.load();

    expect(store.read()).toEqual({ results: null, problem: { section: null, message: NO_ANSWER } });
  });

  it('stops telling a watcher that stopped watching', async () => {
    const { store } = await openStore();
    const told = vi.fn();
    const stopWatching = store.watch(told);

    stopWatching();
    store.showViews('c01', 1200);

    expect(told).not.toHaveBeenCalled();
  });

  it('shows the views of a clip before the service answers, sends them, and keeps the answer', async () => {
    const { store, service, saves } = await openStore();

    const saved = store.saveViews('c02', 5400);
    const shownAtOnce = readViews(store);
    saves[0].answer(describeTalkResults([null, 5400, null]));
    await saved;

    expect(shownAtOnce).toEqual([null, 5400, null]);
    expect(service.saveViews).toHaveBeenCalledWith(PROJECT_ID, 'c02', 5400);
    expect(readViews(store)).toEqual([null, 5400, null]);
  });

  it('shows a typed number that is not sent yet', async () => {
    const { store, service } = await openStore();

    store.showViews('c01', 12);

    expect(readViews(store)).toEqual([12, null, null]);
    expect(service.saveViews).not.toHaveBeenCalled();
  });

  it('shows a second number for one clip at once and sends it only once the first is answered', async () => {
    const { store, service, saves } = await openStore();
    const first = store.saveViews('c01', 12);
    void store.saveViews('c01', 1200);
    const shownAtOnce = readViews(store);
    const sentBeforeTheAnswer = service.saveViews.mock.calls.length;

    saves[0].answer(describeTalkResults([12, null, null]));
    await first;

    expect(shownAtOnce).toEqual([1200, null, null]);
    expect(sentBeforeTheAnswer).toBe(1);
    expect(service.saveViews).toHaveBeenCalledTimes(2);
    expect(service.saveViews).toHaveBeenLastCalledWith(PROJECT_ID, 'c01', 1200);
    expect(readViews(store)).toEqual([1200, null, null]);
  });

  it('shows what the service answered last once the last number of a clip is answered', async () => {
    const { store, saves } = await openStore();
    const first = store.saveViews('c01', 12);
    const second = store.saveViews('c01', 1200);

    saves[0].answer(describeTalkResults([12, null, null]));
    await first;
    saves[1].answer(describeTalkResults([1199, null, null]));
    await second;

    expect(readViews(store)).toEqual([1199, null, null]);
  });

  it('sends the views of another clip while the first clip waits for its answer', async () => {
    const { store, service } = await openStore();

    void store.saveViews('c01', 1200);
    void store.saveViews('c03', 48000);

    expect(service.saveViews.mock.calls.map(([, clipId]) => clipId)).toEqual(['c01', 'c03']);
  });

  it('takes from an answer the clip it was sent for and leaves a newer number of another clip', async () => {
    const { store, saves } = await openStore();
    const first = store.saveViews('c01', 1200);
    const third = store.saveViews('c03', 48000);

    saves[0].answer(describeTalkResults([1200, null, null]));
    await first;
    const afterTheFirstAnswer = readViews(store);
    saves[1].answer(describeTalkResults([1200, null, 48000]));
    await third;

    expect(afterTheFirstAnswer).toEqual([1200, null, 48000]);
    expect(readViews(store)).toEqual([1200, null, 48000]);
  });

  it('clears the views of a clip when none are saved for it', async () => {
    const { store, service, saves } = await openStore(describeTalkResults([1200, 5400, 48000]));

    const cleared = store.saveViews('c02', null);
    saves[0].answer(describeTalkResults([1200, null, 48000]));
    await cleared;

    expect(service.saveViews).toHaveBeenCalledWith(PROJECT_ID, 'c02', null);
    expect(readViews(store)).toEqual([1200, null, 48000]);
  });

  it('gives the problem of a refusal and shows again what the service holds', async () => {
    const { store, saves } = await openStore(describeTalkResults([1200, null, null]));

    const refused = store.saveViews('c01', 99_999_999_999);
    const shownAtOnce = readViews(store);
    saves[0].fail(refuse());
    await refused;

    expect(shownAtOnce).toEqual([99_999_999_999, null, null]);
    expect(readViews(store)).toEqual([1200, null, null]);
    expect(store.read().problem).toEqual({ section: null, message: REFUSED });
  });

  it('still sends the number typed after one that was refused', async () => {
    const { store, service, saves } = await openStore();
    const first = store.saveViews('c01', 99_999_999_999);
    const second = store.saveViews('c01', 1200);

    saves[0].fail(refuse());
    await first;
    saves[1].answer(describeTalkResults([1200, null, null]));
    await second;

    expect(service.saveViews).toHaveBeenLastCalledWith(PROJECT_ID, 'c01', 1200);
    expect(readViews(store)).toEqual([1200, null, null]);
  });

  it('does not let a fetch that overlaps a save bring back the views as they stood before it', async () => {
    const { store, saves, heldFetches, holdFetches } = await openStore();
    holdFetches();
    const fetchedAgain = store.load();
    const saved = store.saveViews('c01', 1200);

    saves[0].answer(describeTalkResults([1200, null, null]));
    await saved;
    heldFetches[0].answer(describeTalkResults());
    await fetchedAgain;

    expect(readViews(store)).toEqual([1200, null, null]);
  });
});
