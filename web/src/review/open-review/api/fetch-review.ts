import { requestJson } from '@/shared/lib/request-json';

import type { Review } from '../../review.types';

export function fetchReview(projectId: string): Promise<Review> {
  return requestJson<Review>(`/projects/${projectId}/review`);
}
