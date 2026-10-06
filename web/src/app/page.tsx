import { LibraryScreen } from '@/library';
import { NewestProjectReview } from '@/review';

export default function LibraryPage() {
  return <LibraryScreen whenRegular={<NewestProjectReview />} />;
}
