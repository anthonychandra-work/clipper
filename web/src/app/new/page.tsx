import { LibraryScreen, NewProjectSheet } from '@/library';
import { NewestProjectReview } from '@/review';

export default function NewProjectPage() {
  return (
    <>
      <LibraryScreen whenRegular={<NewestProjectReview />} />
      <NewProjectSheet />
    </>
  );
}
