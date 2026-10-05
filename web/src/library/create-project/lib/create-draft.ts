import type { Problem } from '@/shared/lib/read-problem';

import type { SourceKind } from '../../library.types';
import type { ClipLength } from './clip-lengths';

export type Platform = 'tiktok' | 'reels' | 'shorts';

export interface Draft {
  sourceKind: SourceKind;
  link: string;
  file: File | null;
  length: ClipLength;
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
    platforms: ['tiktok', 'reels', 'shorts'],
    brief: '',
    problem: null,
  };
}
