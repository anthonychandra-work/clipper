import type { Project } from '@/library';

import type { Review } from '../../review.types';

export function measureVideo(project: Project, review: Review): number {
  const lastWindowEnd = Math.max(0, ...review.windows.map((scored) => scored.endSeconds));
  return project.durationSeconds ?? lastWindowEnd;
}
