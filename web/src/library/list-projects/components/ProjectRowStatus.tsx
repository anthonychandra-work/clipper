import { Icon, ProgressBar } from '@/shared/ui';

import type { Project } from '../../library.types';
import { describeRowStatus } from '../lib/describe-row-status';

export function ProjectRowStatus({ project }: { project: Project }) {
  const status = describeRowStatus(project);
  if (status.kind === 'note') {
    return (
      <span className={`project-row__status project-row__status--${status.status}`}>
        {status.hasWarning ? <Icon name="warning" /> : null}
        {status.text}
      </span>
    );
  }
  return (
    <>
      <ProgressBar name={`processing-${project.id}`} percent={status.percent} label={status.label} />
      <span className="project-row__status">{status.label}</span>
    </>
  );
}
