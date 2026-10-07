import Link from 'next/link';

import { Icon, PagePane } from '@/shared/ui';
import { ScreenFrame } from '@/shell';

const NEW_PROJECT_ADDRESS = '/new';

export function EmptyLibrary() {
  return (
    <div className="empty">
      <Icon name="film" />
      <h2 className="empty__title">No Projects Yet</h2>
      <p>Paste a video link or upload a file, and Clipper finds its best clips.</p>
      <Link
        className="button button--prominent"
        id="first-project"
        href={NEW_PROJECT_ADDRESS}
        scroll={false}
      >
        New Project
      </Link>
    </div>
  );
}

export function EmptyLibraryScreen() {
  return (
    <ScreenFrame screenKey="library" depth={0} section="library" title="Library">
      <PagePane name="library">
        <EmptyLibrary />
      </PagePane>
    </ScreenFrame>
  );
}
