import type { ClipEdge, ClipPoints, ReviewSentence } from '../../review.types';
import { clipRange, findSentence } from './clip-range';

export const MOST_NUDGE_STEPS = 5;

const SHORTEST_CLIP_SECONDS = 1;

export interface TrimLimits {
  reach: readonly ReviewSentence[];
  videoSeconds: number;
}

export interface EdgeLimits {
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  canNudgeEarlier: boolean;
  canNudgeLater: boolean;
}

export function readPoints(clip: ClipPoints): ClipPoints {
  return {
    startSentence: clip.startSentence,
    startNudge: clip.startNudge,
    endSentence: clip.endSentence,
    endNudge: clip.endNudge,
  };
}

export function moveEdgeTo(points: ClipPoints, edge: ClipEdge, sentence: number): ClipPoints {
  if (edge === 'start') return { ...points, startSentence: sentence, startNudge: 0 };
  return { ...points, endSentence: sentence, endNudge: 0 };
}

export function moveEdge(points: ClipPoints, edge: ClipEdge, step: number): ClipPoints {
  const sentence = edge === 'start' ? points.startSentence : points.endSentence;
  return moveEdgeTo(points, edge, sentence + step);
}

export function nudgeEdge(points: ClipPoints, edge: ClipEdge, step: number): ClipPoints {
  if (edge === 'start') return { ...points, startNudge: points.startNudge + step };
  return { ...points, endNudge: points.endNudge + step };
}

export function arePointsAllowed(points: ClipPoints, limits: TrimLimits): boolean {
  return sitInReach(points, limits.reach) && lieInsideVideo(points, limits);
}

export function edgeLimits(edge: ClipEdge, points: ClipPoints, limits: TrimLimits): EdgeLimits {
  return {
    canMoveEarlier: arePointsAllowed(moveEdge(points, edge, -1), limits),
    canMoveLater: arePointsAllowed(moveEdge(points, edge, 1), limits),
    canNudgeEarlier: arePointsAllowed(nudgeEdge(points, edge, -1), limits),
    canNudgeLater: arePointsAllowed(nudgeEdge(points, edge, 1), limits),
  };
}

function sitInReach(points: ClipPoints, reach: readonly ReviewSentence[]): boolean {
  const areNudgesAllowed = [points.startNudge, points.endNudge].every((nudge) => Math.abs(nudge) <= MOST_NUDGE_STEPS);
  const areSentencesReached = [points.startSentence, points.endSentence].every(
    (sentence) => findSentence(reach, sentence) !== undefined,
  );
  return areNudgesAllowed && areSentencesReached && points.startSentence <= points.endSentence;
}

function lieInsideVideo(points: ClipPoints, limits: TrimLimits): boolean {
  const range = clipRange(points, limits.reach);
  return range.start >= 0 && range.end <= limits.videoSeconds && range.duration >= SHORTEST_CLIP_SECONDS;
}
