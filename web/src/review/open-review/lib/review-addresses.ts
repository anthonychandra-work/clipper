import { tabAddress } from '@/project';

import type { ReviewClip } from '../../review.types';

export function reviewAddress(projectId: string): string {
  return tabAddress(projectId, 'review');
}

export function clipAddress(projectId: string, clipId: string): string {
  return `${reviewAddress(projectId)}/${clipId}`;
}

export interface ShownAddress {
  clips: readonly ReviewClip[];
  clipId: string | undefined;
  isPhone: boolean;
}

export function findShownClip({ clips, clipId, isPhone }: ShownAddress): ReviewClip | null {
  const named = clips.find((clip) => clip.id === clipId) ?? null;
  if (isPhone) return named;
  return named ?? clips[0] ?? null;
}

export function namesNoClip(clips: readonly ReviewClip[], clipId: string | undefined): boolean {
  return clipId !== undefined && clips.every((clip) => clip.id !== clipId);
}

export function findNextClip(group: readonly ReviewClip[], currentId: string | null): ReviewClip | null {
  if (group.length === 0) return null;
  const place = group.findIndex((clip) => clip.id === currentId);
  return group[(place + 1) % group.length];
}
