import { LibraryScreen } from '@/library';
import { NewestProject } from '@/project';

export default function LibraryPage() {
  return <LibraryScreen whenRegular={<NewestProject />} />;
}
