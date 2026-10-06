import { describe, expect, it } from 'vitest';

import { describeTalkReach, TALK_SECONDS } from '../../review.fixtures';
import type { ClipPoints } from '../../review.types';
import { arePointsAllowed, edgeLimits, moveEdge, moveEdgeTo, nudgeEdge, type TrimLimits } from './move-edge';

const LIMITS: TrimLimits = { reach: describeTalkReach(), videoSeconds: TALK_SECONDS };
const AS_CUT: ClipPoints = { startSentence: 4, startNudge: 0, endSentence: 12, endNudge: 0 };
const EVERY_STEP = { canMoveEarlier: true, canMoveLater: true, canNudgeEarlier: true, canNudgeLater: true };

function place(points: Partial<ClipPoints>): ClipPoints {
  return { ...AS_CUT, ...points };
}

describe('moving a point', () => {
  it('moves the in point by one sentence and leaves the out point', () => {
    expect(moveEdge(AS_CUT, 'start', -1)).toEqual(place({ startSentence: 3 }));
    expect(moveEdge(AS_CUT, 'start', 1)).toEqual(place({ startSentence: 5 }));
  });

  it('moves the out point by one sentence and leaves the in point', () => {
    expect(moveEdge(AS_CUT, 'end', 1)).toEqual(place({ endSentence: 13 }));
  });

  it('sets the nudge of a point back to none when the point goes to another sentence', () => {
    const nudged = place({ startNudge: -4, endNudge: 3 });

    expect(moveEdge(nudged, 'start', -1)).toEqual(place({ startSentence: 3, startNudge: 0, endNudge: 3 }));
    expect(moveEdgeTo(nudged, 'end', 14)).toEqual(place({ startNudge: -4, endSentence: 14, endNudge: 0 }));
  });

  it('nudges a point by one step and keeps its sentence', () => {
    expect(nudgeEdge(AS_CUT, 'start', -1)).toEqual(place({ startNudge: -1 }));
    expect(nudgeEdge(place({ endNudge: 4 }), 'end', 1)).toEqual(place({ endNudge: 5 }));
  });
});

describe('edgeLimits', () => {
  it('allows every step of both points of a clip in the middle of its reach', () => {
    expect(edgeLimits('start', AS_CUT, LIMITS)).toEqual(EVERY_STEP);
    expect(edgeLimits('end', AS_CUT, LIMITS)).toEqual(EVERY_STEP);
  });

  it('allows five nudge steps either way and switches the sixth off', () => {
    const earliest = edgeLimits('start', place({ startNudge: -5 }), LIMITS);
    const latest = edgeLimits('end', place({ endNudge: 5 }), LIMITS);

    expect(edgeLimits('start', place({ startNudge: -4 }), LIMITS).canNudgeEarlier).toBe(true);
    expect(earliest).toMatchObject({ canNudgeEarlier: false, canNudgeLater: true });
    expect(latest).toMatchObject({ canNudgeEarlier: true, canNudgeLater: false });
  });

  it('switches the sentence steps off at the two ends of the reach', () => {
    const atFirst = edgeLimits('start', place({ startSentence: 1 }), LIMITS);
    const atLast = edgeLimits('end', place({ endSentence: 15 }), LIMITS);

    expect(atFirst).toMatchObject({ canMoveEarlier: false, canMoveLater: true });
    expect(atLast).toMatchObject({ canMoveEarlier: true, canMoveLater: false });
  });

  it('switches off the steps that would put the in point after the out point', () => {
    const met = place({ startSentence: 9, endSentence: 9 });

    expect(edgeLimits('start', met, LIMITS)).toMatchObject({ canMoveEarlier: true, canMoveLater: false });
    expect(edgeLimits('end', met, LIMITS)).toMatchObject({ canMoveEarlier: false, canMoveLater: true });
  });

  it('switches off the nudge that would start the clip before the video begins', () => {
    const atTheStart = edgeLimits('start', place({ startSentence: 1 }), LIMITS);

    expect(atTheStart).toMatchObject({ canNudgeEarlier: false, canNudgeLater: true });
  });

  it('switches off the nudge that would end the clip after the video ends', () => {
    const shortVideo = { ...LIMITS, videoSeconds: 57.3 };

    expect(edgeLimits('end', place({ endSentence: 15 }), shortVideo).canNudgeLater).toBe(true);
    expect(edgeLimits('end', place({ endSentence: 15, endNudge: 1 }), shortVideo).canNudgeLater).toBe(false);
  });

  it('switches off the steps that would leave the clip shorter than one second', () => {
    const oneShortSentence = place({ startSentence: 10, endSentence: 10 });

    expect(edgeLimits('start', oneShortSentence, LIMITS)).toMatchObject({ canNudgeEarlier: true, canNudgeLater: true });
    expect(edgeLimits('start', { ...oneShortSentence, startNudge: 1 }, LIMITS).canNudgeLater).toBe(false);
    expect(edgeLimits('end', { ...oneShortSentence, endNudge: -1 }, LIMITS).canNudgeEarlier).toBe(false);
  });
});

describe('arePointsAllowed', () => {
  it.each([
    [{ startSentence: 10, endSentence: 9 }, 'an in point after the out point'],
    [{ endSentence: 16 }, 'a sentence after the reach'],
    [{ startSentence: 0 }, 'a sentence before the reach'],
    [{ startNudge: -6 }, 'a sixth nudge step earlier'],
    [{ endNudge: 6 }, 'a sixth nudge step later'],
    [{ startSentence: 1, startNudge: -1 }, 'a start before the video begins'],
    [{ startSentence: 10, endSentence: 10, endNudge: -2 }, 'a clip shorter than one second'],
  ])('refuses %o: %s', (points, why) => {
    expect(arePointsAllowed(place(points), LIMITS), why).toBe(false);
  });

  it('allows a move to another sentence of the reach with no nudge', () => {
    expect(arePointsAllowed(place({ startSentence: 1, endSentence: 15 }), LIMITS)).toBe(true);
    expect(arePointsAllowed(place({ startSentence: 12, endSentence: 12 }), LIMITS)).toBe(true);
  });
});
