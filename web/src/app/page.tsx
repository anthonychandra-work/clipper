import { EmptyLibraryScreen, LibraryScreen } from '@/library';

export default function LibraryPage() {
  return <LibraryScreen whenRegular={<EmptyLibraryScreen />} />;
}
