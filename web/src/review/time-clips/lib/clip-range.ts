import type { ClipPoints, ReviewSentence } from '../../review.types';

export const NUDGE_STEP_SECONDS = 0.2;

const HUNDREDTHS_PER_SECOND = 100;
const NUDGE_STEP_HUNDREDTHS = NUDGE_STEP_SECONDS * HUNDREDTHS_PER_SECOND;

export interface ClipRange {
  start: number;
  end: number;
  duration: number;
}

export function clipRange(points: ClipPoints, reach: readonly ReviewSentence[]): ClipRange {
  const first = getSentence(reach, points.startSentence);
  const last = getSentence(reach, points.endSentence);
  const start = toHundredths(first.startSeconds) + points.startNudge * NUDGE_STEP_HUNDREDTHS;
  const end = toHundredths(last.endSeconds) + points.endNudge * NUDGE_STEP_HUNDREDTHS;
  return {
    start: start / HUNDREDTHS_PER_SECOND,
    end: end / HUNDREDTHS_PER_SECOND,
    duration: (end - start) / HUNDREDTHS_PER_SECOND,
  };
}

export function findSentence(reach: readonly ReviewSentence[], number: number): ReviewSentence | undefined {
  return reach.find((sentence) => sentence.number === number);
}

function getSentence(reach: readonly ReviewSentence[], number: number): ReviewSentence {
  const sentence = findSentence(reach, number);
  if (sentence === undefined) throw new Error(`Sentence ${number} is outside the reach of this clip.`);
  return sentence;
}

function toHundredths(seconds: number): number {
  return Math.round(seconds * HUNDREDTHS_PER_SECOND);
}
