import type { Look, Review, ReviewClip, ReviewSentence } from './review.types';

const FIRST_FIFTEEN_SENTENCES: readonly [number, number][] = [
  [0, 2.12],
  [2.48, 5.02],
  [5.72, 11.7],
  [11.94, 16.12],
  [16.3, 20.74],
  [21.18, 25.3],
  [25.6, 28.9],
  [29.3, 30.84],
  [31.34, 33.78],
  [34.12, 35.46],
  [35.94, 42.14],
  [42.56, 44.7],
  [45.22, 50.3],
  [50.8, 55.7],
  [55.86, 57.04],
];

export const TALK_SECONDS = 234.94;

export const STARTING_LOOK: Look = {
  captionStyle: 'keyword',
  framing: 'follow-speaker',
  showHookTitle: true,
  showSafeZones: false,
};

export function describeTalkReach(): ReviewSentence[] {
  return FIRST_FIFTEEN_SENTENCES.map(([startSeconds, endSeconds], place) => ({
    number: place + 1,
    startSeconds,
    endSeconds,
    text: `Sentence ${place + 1} of the talk.`,
  }));
}

export function describeTalkClip(changes: Partial<ReviewClip> = {}): ReviewClip {
  return {
    id: 'c01',
    rank: 1,
    startSeconds: 11.94,
    endSeconds: 44.7,
    scores: { hook: 23, arc: 23, value: 20, share: 22 },
    total: 88,
    reason: 'Opens on the worst day and ends on a line that works as a quote.',
    title: 'The worst day my bakery ever had',
    hookTitle: 'The oven broke before sunrise',
    hookType: 'story',
    flag: null,
    flagNote: null,
    isReplayPeak: false,
    decision: 'undecided',
    rejectReason: null,
    startSentence: 4,
    endSentence: 12,
    startNudge: 0,
    endNudge: 0,
    cutStartSentence: 4,
    cutEndSentence: 12,
    sentences: describeTalkReach(),
    captions: { keyword: [], wordByWord: [], plain: [] },
    frames: Array.from({ length: 12 }, () => null),
    ...changes,
  };
}

export function describeTalkReview(clips: ReviewClip[] = [describeTalkClip()]): Review {
  return {
    look: STARTING_LOOK,
    hasPreview: true,
    clipSeconds: { min: 25, max: 60, preferred: { min: 25, max: 50 } },
    windows: [],
    clips,
  };
}
