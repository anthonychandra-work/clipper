import type { ClipSeconds } from '../../review.types';

const BAND_SCALE_OVER_MAX = 1.25;

export type LengthRating = 'short' | 'allowed' | 'ideal' | 'long';

export function rateLength(seconds: number, limits: ClipSeconds): LengthRating {
  if (seconds < limits.min) return 'short';
  if (seconds > limits.max) return 'long';
  const preferred = limits.preferred;
  const isIdeal = preferred !== null && seconds >= preferred.min && seconds <= preferred.max;
  return isIdeal ? 'ideal' : 'allowed';
}

export function describeLength(seconds: number, limits: ClipSeconds): string {
  const notes: Record<LengthRating, string> = {
    short: `shorter than the ${limits.min} s minimum`,
    allowed: `inside the ${limits.min}–${limits.max} s limits`,
    ideal: `inside the preferred ${limits.preferred?.min}–${limits.preferred?.max} s band`,
    long: `longer than the ${limits.max} s maximum`,
  };
  return notes[rateLength(seconds, limits)];
}

export function measureBandScale(limits: ClipSeconds): number {
  return limits.max * BAND_SCALE_OVER_MAX;
}
