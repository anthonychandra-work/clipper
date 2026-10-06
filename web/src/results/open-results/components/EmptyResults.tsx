import Link from 'next/link';

import type { Project } from '@/library';
import { tabAddress } from '@/project';
import { Icon, PagePane } from '@/shared/ui';

export function EmptyResults({ project }: { project: Project }) {
  const hasKeptClip = project.keptCount > 0;
  return (
    <PagePane name="results">
      <div className="empty">
        <Icon name="chart" />
        <h2 className="empty__title">No Results Yet</h2>
        <p>Results appear here after you keep clips and post them.</p>
        {hasKeptClip ? (
          <Link className="button" id="results-go-export" href={tabAddress(project.id, 'export')}>
            Go to Export
          </Link>
        ) : (
          <Link className="button" id="results-go-review" href={tabAddress(project.id, 'review')}>
            Go to Review
          </Link>
        )}
      </div>
    </PagePane>
  );
}
