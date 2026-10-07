import type { ReviewSentence } from '../../review.types';
import type { ClipRange } from '../../time-clips';

export interface SelectionPlace {
  before: number;
  after: number;
}

export function placeSelection(range: ClipRange, reach: readonly ReviewSentence[]): SelectionPlace {
  const stretchStart = reach[0].startSeconds;
  const stretchEnd = reach[reach.length - 1].endSeconds;
  const stretchSeconds = stretchEnd - stretchStart;
  return {
    before: toPercent(range.start - stretchStart, stretchSeconds),
    after: toPercent(stretchEnd - range.end, stretchSeconds),
  };
}

function toPercent(seconds: number, stretchSeconds: number): number {
  return Math.min(100, Math.max(0, (seconds / stretchSeconds) * 100));
}
