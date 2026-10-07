import type { Decision, ReviewClip } from '../../review.types';

export type ClipFilter = 'all' | Decision;

export interface CountedFilter {
  value: ClipFilter;
  label: string;
  count: number;
}

const FILTERS: readonly { value: ClipFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'undecided', label: 'To Do' },
  { value: 'keep', label: 'Kept' },
  { value: 'reject', label: 'Rejected' },
];

export function filterClips(clips: readonly ReviewClip[], filter: ClipFilter): ReviewClip[] {
  return clips.filter((clip) => filter === 'all' || clip.decision === filter);
}

export function countFilters(clips: readonly ReviewClip[]): CountedFilter[] {
  return FILTERS.map((filter) => ({ ...filter, count: filterClips(clips, filter.value).length }));
}
