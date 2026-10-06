import type { ResultClip } from '../../results.types';

const FEWEST_CLIPS_COMPARED = 2;
const WHOLE_TRACK_PERCENT = 100;

type MeasuredClip = ResultClip & { views: number };

export interface OutcomeRow {
  id: string;
  title: string;
  views: string;
  sharePercent: number;
}

export interface Outcome {
  sentence: string;
  rows: OutcomeRow[];
}

export function rankOutcome(clips: readonly ResultClip[]): Outcome | null {
  const mostViewedFirst = clips.filter(hasViews).sort(compareByViewsThenRank);
  if (mostViewedFirst.length < FEWEST_CLIPS_COMPARED) return null;
  const mostViews = mostViewedFirst[0].views;
  return {
    sentence: describeOutcome(mostViewedFirst.map((clip) => clip.rank)),
    rows: mostViewedFirst.map((clip) => ({
      id: clip.id,
      title: clip.title,
      views: clip.views.toLocaleString('en-US'),
      sharePercent: (clip.views * WHOLE_TRACK_PERCENT) / mostViews,
    })),
  };
}

function hasViews(clip: ResultClip): clip is MeasuredClip {
  return clip.views !== null;
}

function compareByViewsThenRank(first: MeasuredClip, second: MeasuredClip): number {
  return second.views - first.views || first.rank - second.rank;
}

function describeOutcome(ranksByViews: readonly number[]): string {
  const bestRank = ranksByViews[0];
  const verdict =
    bestRank === 1
      ? 'The selector’s first pick performed best.'
      : `The best performer was the selector’s pick number ${bestRank}.`;
  return `${verdict} Ranks in order of views: ${ranksByViews.join(', ')}.`;
}
