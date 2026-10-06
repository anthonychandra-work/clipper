import type { Problem } from '@/shared/lib/read-problem';

import type { SourceKind } from '../../library.types';
import type { ClipLength } from './clip-lengths';

export type Platform = 'tiktok' | 'reels' | 'shorts';

export interface Draft {
  sourceKind: SourceKind;
  link: string;
  file: File | null;
  length: ClipLength;
  isLengthChosen: boolean;
  platforms: Platform[];
  brief: string;
  problem: Problem | null;
}

export const PLATFORMS: readonly { value: Platform; label: string }[] = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reels', label: 'Reels' },
  { value: 'shorts', label: 'Shorts' },
];

export function createDraft(): Draft {
  return {
    sourceKind: 'link',
    link: '',
    file: null,
    length: 'standard',
    isLengthChosen: false,
    platforms: ['tiktok', 'reels', 'shorts'],
    brief: '',
    problem: null,
  };
}

export function chooseLength(draft: Draft, length: ClipLength): Draft {
  return { ...draft, length, isLengthChosen: true };
}

export function takeDefaultLength(draft: Draft, defaultLength: ClipLength): Draft {
  return draft.isLengthChosen ? draft : { ...draft, length: defaultLength };
}
