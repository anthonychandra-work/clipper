import { NewestProject } from '@/project';

import { ReviewTab } from './ReviewTab';

export function NewestProjectReview() {
  return <NewestProject reviewTab={<ReviewTab />} />;
}
