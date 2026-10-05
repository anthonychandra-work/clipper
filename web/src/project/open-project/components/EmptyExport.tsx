import Link from 'next/link';

import { Icon, PagePane } from '@/shared/ui';

import { tabAddress } from '../lib/project-addresses';

export function EmptyExport({ projectId }: { projectId: string }) {
  return (
    <PagePane name="export">
      <div className="empty">
        <Icon name="film" />
        <h2 className="empty__title">No Kept Clips</h2>
        <p>Keep at least one clip on the Review tab, then export it here.</p>
        <Link className="button" id="export-go-review" href={tabAddress(projectId, 'review')}>
          Go to Review
        </Link>
      </div>
    </PagePane>
  );
}
