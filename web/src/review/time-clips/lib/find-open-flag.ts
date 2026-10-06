import type { ReviewClip } from '../../review.types';

type FlaggedClip = Pick<ReviewClip, 'flag' | 'startSentence' | 'cutStartSentence'>;

const FLAG_LABELS = {
  'needs-context': 'Needs context',
  'not-recommended': 'Not recommended',
} as const;

export function isFlagOpen(clip: FlaggedClip): boolean {
  if (clip.flag === null) return false;
  if (clip.flag !== 'needs-context') return true;
  return clip.startSentence >= clip.cutStartSentence;
}

export function findOpenFlagLabel(clip: FlaggedClip): string | null {
  return clip.flag !== null && isFlagOpen(clip) ? FLAG_LABELS[clip.flag] : null;
}
