import Link from 'next/link';

import { Icon, PagePane } from '@/shared/ui';

import { tabAddress } from '../lib/project-addresses';

export function EmptyResults({ projectId }: { projectId: string }) {
  return (
    <PagePane name="results">
      <div className="empty">
        <Icon name="chart" />
        <h2 className="empty__title">No Results Yet</h2>
        <p>Results appear here after you keep clips and post them.</p>
        <Link className="button" id="results-go-review" href={tabAddress(projectId, 'review')}>
          Go to Review
        </Link>
      </div>
    </PagePane>
  );
}
