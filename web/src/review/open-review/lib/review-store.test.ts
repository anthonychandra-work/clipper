import { describe, expect, it, vi } from 'vitest';

import { RequestFailed } from '@/shared/lib/request-json';

import { describeTalkClip, describeTalkReview, STARTING_LOOK } from '../../review.fixtures';
import type { ClipChange, Look, Review, ReviewClip } from '../../review.types';
import { NOTHING_FETCHED, ReviewStore } from './review-store';

const PROJECT_ID = 'a1b2c3d4e5f6';
const REFUSED = 'Clipper could not make this change. Reload the page and try again.';
const NO_ANSWER = 'Clipper did not answer. Check that it is still running, then try again.';
const PLAIN_LOOK: Look = { ...STARTING_LOOK, captionStyle: 'plain', showSafeZones: true };

interface Waiting<Answer> {
  answer: (value: Answer) => void;
  fail: (error: unknown) => void;
}

function standInForTheService(review: Review = describeTalkReview()) {
  const clipAnswers: Waiting<ReviewClip>[] = [];
  const lookAnswers: Waiting<Look>[] = [];
  const wait = <Answer>(waiting: Waiting<Answer>[]) =>
    new Promise<Answer>((answer, fail) => {
      waiting.push({ answer, fail });
    });
  const service = {
    fetchReview: vi.fn(async () => review),
    changeClip: vi.fn((projectId: string, clipId: string, change: ClipChange) => {
      void [projectId, clipId, change];
      return wait(clipAnswers);
    }),
    saveLook: vi.fn((projectId: string, look: Look) => {
      void [projectId, look];
      return wait(lookAnswers);
    }),
  };
  return { service, clipAnswers, lookAnswers };
}

async function openStore(review?: Review) {
  const standIn = standInForTheService(review);
  const store = new ReviewStore(PROJECT_ID, standIn.service);
  await store.load();
  return { store, ...standIn };
}

function readClip(store: ReviewStore, clipId = 'c01'): ReviewClip {
  const clip = store.read().review?.clips.find((candidate) => candidate.id === clipId);
  if (clip === undefined) throw new Error(`The store shows no clip ${clipId}.`);
  return clip;
}

function refuse(): RequestFailed {
  return new RequestFailed(422, { problem: { section: null, message: REFUSED } });
}

describe('the review store', () => {
  it('holds nothing until the review is fetched, then shows it and tells its readers', async () => {
    const { service } = standInForTheService();
    const store = new ReviewStore(PROJECT_ID, service);
    const told = vi.fn();
    store.watch(told);
    const before = store.read();

    await store.load();

    expect(before).toBe(NOTHING_FETCHED);
    expect(service.fetchReview).toHaveBeenCalledWith(PROJECT_ID);
    expect(store.read()).toEqual({ review: describeTalkReview(), problem: null });
    expect(told).toHaveBeenCalledTimes(1);
  });

  it('gives the problem to be shown when the review cannot be fetched', async () => {
    const { service } = standInForTheService();
    service.fetchReview.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const store = new ReviewStore(PROJECT_ID, service);

    await store.load();

    expect(store.read()).toEqual({ review: null, problem: { section: null, message: NO_ANSWER } });
  });

  it('stops telling a reader that stopped watching', async () => {
    const { store } = await openStore();
    const told = vi.fn();
    const stopWatching = store.watch(told);

    stopWatching();
    store.showChange('c01', { title: 'A new title' });

    expect(told).not.toHaveBeenCalled();
  });

  it('applies a decision at once, sends it, and takes the service’s answer in its place', async () => {
    const { store, service, clipAnswers } = await openStore();

    const changed = store.changeClip('c01', { decision: 'reject', rejectReason: 'repeat' });
    const shownAtOnce = readClip(store);
    clipAnswers[0].answer(describeTalkClip({ decision: 'reject', rejectReason: 'repeat', title: 'As the service has it' }));
    await changed;

    expect(shownAtOnce).toMatchObject({ decision: 'reject', rejectReason: 'repeat' });
    expect(service.changeClip).toHaveBeenCalledWith(PROJECT_ID, 'c01', { decision: 'reject', rejectReason: 'repeat' });
    expect(readClip(store).title).toBe('As the service has it');
  });

  it('shows no reason for a clip that is no longer rejected', async () => {
    const rejected = describeTalkClip({ decision: 'reject', rejectReason: 'cut-off' });
    const { store } = await openStore(describeTalkReview([rejected]));

    void store.changeClip('c01', { decision: 'keep' });

    expect(readClip(store)).toMatchObject({ decision: 'keep', rejectReason: null });
  });

  it('works out the new times of a clip at once when a point is moved', async () => {
    const { store } = await openStore();

    void store.changeClip('c01', { startSentence: 3, startNudge: 0, endSentence: 12, endNudge: 5 });

    expect(readClip(store)).toMatchObject({ startSentence: 3, endNudge: 5, startSeconds: 5.72, endSeconds: 45.7 });
  });

  it('shows a change that is not sent, such as a title while it is typed', async () => {
    const { store, service } = await openStore();

    store.showChange('c01', { title: 'The morning the ov' });

    expect(readClip(store).title).toBe('The morning the ov');
    expect(service.changeClip).not.toHaveBeenCalled();
  });

  it('changes one clip and leaves the others as they were', async () => {
    const clips = [describeTalkClip(), describeTalkClip({ id: 'c02', rank: 2 })];
    const { store } = await openStore(describeTalkReview(clips));

    void store.changeClip('c02', { decision: 'keep' });

    expect(readClip(store, 'c01').decision).toBe('undecided');
    expect(readClip(store, 'c02').decision).toBe('keep');
  });

  it('shows a second change of a clip at once and sends it only once the first is answered', async () => {
    const { store, service, clipAnswers } = await openStore();
    const first = store.changeClip('c01', { decision: 'keep' });
    void store.changeClip('c01', { endNudge: 3 });
    const shownAtOnce = readClip(store);
    const sentBeforeTheAnswer = service.changeClip.mock.calls.length;

    clipAnswers[0].answer(describeTalkClip({ decision: 'keep' }));
    await first;

    expect(shownAtOnce).toMatchObject({ decision: 'keep', endNudge: 3, endSeconds: 45.3 });
    expect(sentBeforeTheAnswer).toBe(1);
    expect(service.changeClip).toHaveBeenCalledTimes(2);
    expect(service.changeClip).toHaveBeenLastCalledWith(PROJECT_ID, 'c01', { endNudge: 3 });
  });

  it('sends three changes of a clip in the order they were made', async () => {
    const { store, service, clipAnswers } = await openStore();
    const changes: ClipChange[] = [{ decision: 'keep' }, { title: 'The morning the oven broke' }, { endNudge: 2 }];
    const sent = changes.map((change) => store.changeClip('c01', change));
    const sentAtOnce = service.changeClip.mock.calls.length;

    for (const [place, answered] of sent.entries()) {
      clipAnswers[place].answer(describeTalkClip());
      await answered;
    }

    expect(sentAtOnce).toBe(1);
    expect(service.changeClip.mock.calls.map(([, , change]) => change)).toEqual(changes);
  });

  it('sends a change of another clip while the first clip’s change waits for its answer', async () => {
    const clips = [describeTalkClip(), describeTalkClip({ id: 'c02', rank: 2 })];
    const { store, service } = await openStore(describeTalkReview(clips));

    void store.changeClip('c01', { decision: 'keep' });
    void store.changeClip('c02', { decision: 'reject', rejectReason: 'repeat' });

    expect(service.changeClip.mock.calls.map(([, clipId]) => clipId)).toEqual(['c01', 'c02']);
  });

  it('keeps showing the newer change after the first answer, and shows the last answer of the service after it', async () => {
    const { store, clipAnswers } = await openStore();
    const first = store.changeClip('c01', { decision: 'keep' });
    const second = store.changeClip('c01', { endNudge: 3 });

    clipAnswers[0].answer(describeTalkClip({ decision: 'keep', title: 'As stored after the first' }));
    await first;
    const afterTheFirstAnswer = readClip(store);
    clipAnswers[1].answer(describeTalkClip({ decision: 'keep', endNudge: 3, title: 'As stored after the second' }));
    await second;

    expect(afterTheFirstAnswer).toMatchObject({ decision: 'keep', endNudge: 3, title: describeTalkClip().title });
    expect(readClip(store)).toEqual(
      describeTalkClip({ decision: 'keep', endNudge: 3, title: 'As stored after the second' }),
    );
  });

  it('gives the problem of a refused change and still sends the change made after it', async () => {
    const { store, service, clipAnswers } = await openStore();
    const first = store.changeClip('c01', { startSentence: 1, startNudge: 0, endSentence: 12, endNudge: 0 });
    const second = store.changeClip('c01', { decision: 'keep' });

    clipAnswers[0].fail(refuse());
    await first;
    const problemAfterTheRefusal = store.read().problem;
    clipAnswers[1].answer(describeTalkClip({ decision: 'keep' }));
    await second;

    expect(problemAfterTheRefusal).toEqual({ section: null, message: REFUSED });
    expect(service.changeClip).toHaveBeenLastCalledWith(PROJECT_ID, 'c01', { decision: 'keep' });
    expect(readClip(store)).toEqual(describeTalkClip({ decision: 'keep' }));
  });

  it('does not let an answer undo a title typed after the change was sent', async () => {
    const { store, clipAnswers } = await openStore();
    const saved = store.changeClip('c01', { title: 'The morning' });

    store.showChange('c01', { title: 'The morning the oven broke' });
    clipAnswers[0].answer(describeTalkClip({ title: 'The morning' }));
    await saved;

    expect(readClip(store).title).toBe('The morning the oven broke');
  });

  it('shows what the service holds again and gives the problem when the service refuses', async () => {
    const { store, clipAnswers } = await openStore();

    const changed = store.changeClip('c01', { startSentence: 1, startNudge: 0, endSentence: 12, endNudge: 0 });
    const shownAtOnce = readClip(store);
    clipAnswers[0].fail(refuse());
    await changed;

    expect(shownAtOnce.startSentence).toBe(1);
    expect(readClip(store)).toEqual(describeTalkClip());
    expect(store.read().problem).toEqual({ section: null, message: REFUSED });
  });

  it('goes back to the last answer of the service, not to the first, after a later refusal', async () => {
    const { store, clipAnswers } = await openStore();
    const kept = store.changeClip('c01', { decision: 'keep' });
    clipAnswers[0].answer(describeTalkClip({ decision: 'keep' }));
    await kept;

    const rejected = store.changeClip('c01', { decision: 'reject', rejectReason: null });
    clipAnswers[1].fail(new TypeError('Failed to fetch'));
    await rejected;

    expect(readClip(store).decision).toBe('keep');
    expect(store.read().problem).toEqual({ section: null, message: NO_ANSWER });
  });

  it('gives a new problem each time, so the same sentence is shown twice', async () => {
    const { store, clipAnswers } = await openStore();
    const first = store.changeClip('c01', { decision: 'keep' });
    clipAnswers[0].fail(refuse());
    await first;
    const firstProblem = store.read().problem;

    const second = store.changeClip('c01', { decision: 'keep' });
    clipAnswers[1].fail(refuse());
    await second;

    expect(store.read().problem).toEqual(firstProblem);
    expect(store.read().problem).not.toBe(firstProblem);
  });

  it('applies a change of the look at once, sends it, and takes the answer', async () => {
    const { store, service, lookAnswers } = await openStore();

    const changed = store.changeLook(PLAIN_LOOK);
    const shownAtOnce = store.read().review?.look;
    lookAnswers[0].answer(PLAIN_LOOK);
    await changed;

    expect(shownAtOnce).toEqual(PLAIN_LOOK);
    expect(service.saveLook).toHaveBeenCalledWith(PROJECT_ID, PLAIN_LOOK);
    expect(store.read().review?.look).toEqual(PLAIN_LOOK);
  });

  it('keeps a newer look when the answer to an older one arrives', async () => {
    const { store, lookAnswers } = await openStore();
    const stacked: Look = { ...PLAIN_LOOK, framing: 'stack-two' };
    const first = store.changeLook(PLAIN_LOOK);
    void store.changeLook(stacked);

    lookAnswers[0].answer(PLAIN_LOOK);
    await first;

    expect(store.read().review?.look).toEqual(stacked);
  });

  it('shows the look the service holds again when it refuses a look', async () => {
    const { store, lookAnswers } = await openStore();

    const changed = store.changeLook(PLAIN_LOOK);
    lookAnswers[0].fail(refuse());
    await changed;

    expect(store.read().review?.look).toEqual(STARTING_LOOK);
    expect(store.read().problem).toEqual({ section: null, message: REFUSED });
  });
});
