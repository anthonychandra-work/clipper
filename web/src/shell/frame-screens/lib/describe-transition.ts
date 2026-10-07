export interface ScreenPlace {
  key: string;
  depth: number;
}

export type ScreenTransition = 'none' | 'swap' | 'push' | 'pop';

export function describeTransition(previous: ScreenPlace | null, next: ScreenPlace): ScreenTransition {
  if (previous === null || previous.key === next.key) return 'none';
  if (previous.depth === next.depth) return 'swap';
  return next.depth > previous.depth ? 'push' : 'pop';
}
