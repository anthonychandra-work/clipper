import { LibraryScreen, NewProjectSheet } from '@/library';
import { NewestProject } from '@/project';

export default function NewProjectPage() {
  return (
    <>
      <LibraryScreen whenRegular={<NewestProject />} />
      <NewProjectSheet />
    </>
  );
}
