import type { ProjectResults, ResultClip } from './results.types';

const EXPORTED_TALK_CLIPS: readonly Omit<ResultClip, 'views'>[] = [
  { id: 'c01', rank: 1, title: 'The worst day my bakery ever had' },
  { id: 'c02', rank: 2, title: 'Hire for the habits you cannot teach' },
  { id: 'c03', rank: 3, title: 'Almost everyone gets price wrong' },
];

export const SEEDED_VIEWS: readonly number[] = [1200, 5400, 48000];

export function describeTalkResults(views: readonly (number | null)[] = []): ProjectResults {
  return { clips: EXPORTED_TALK_CLIPS.map((clip, place) => ({ ...clip, views: views[place] ?? null })) };
}
