import type { ClipEdge, ClipPoints } from '../../review.types';
import { arePointsAllowed, moveEdgeTo, type TrimLimits } from '../../time-clips';

export interface HandlePlace {
  edge: ClipEdge;
  share: number;
  points: ClipPoints;
}

export function findNearestSentence({ edge, share, points }: HandlePlace, limits: TrimLimits): number {
  const reach = limits.reach;
  const stretchStart = reach[0].startSeconds;
  const seconds = stretchStart + share * (reach[reach.length - 1].endSeconds - stretchStart);
  const current = edge === 'start' ? points.startSentence : points.endSentence;
  const allowed = reach.filter((sentence) => arePointsAllowed(moveEdgeTo(points, edge, sentence.number), limits));
  const nearest = allowed.reduce<{ number: number; distance: number } | null>((best, sentence) => {
    const distance = Math.abs((edge === 'start' ? sentence.startSeconds : sentence.endSeconds) - seconds);
    return best === null || distance < best.distance ? { number: sentence.number, distance } : best;
  }, null);
  return nearest?.number ?? current;
}
