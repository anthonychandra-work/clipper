import type { Caption } from '../../review.types';

export function findCaption(captions: readonly Caption[], seconds: number): Caption | null {
  return captions.findLast((caption) => seconds >= caption.startSeconds) ?? null;
}
