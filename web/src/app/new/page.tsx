import { EmptyLibraryScreen, LibraryScreen, NewProjectSheet } from '@/library';

export default function NewProjectPage() {
  return (
    <>
      <LibraryScreen whenRegular={<EmptyLibraryScreen />} />
      <NewProjectSheet />
    </>
  );
}
