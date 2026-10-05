'use client';

import { type Project, useUpload } from '@/library';
import { Icon } from '@/shared/ui';

import { describeStatus } from '../lib/describe-status';
import { HaltActions } from './HaltActions';
import { StepProgress } from './StepProgress';

interface StatusCardProps {
  project: Project;
  projects: Project[];
}

export function StatusCard({ project, projects }: StatusCardProps) {
  const isSendingHere = useUpload(project.id) !== null;
  const status = describeStatus(project, { projects, isSendingHere });
  return (
    <section className="status-card" aria-label={status.heading}>
      {status.hasWarning ? <Icon name="warning" /> : null}
      <h2 className="status-card__title">{status.heading}</h2>
      {status.bar ? <StepProgress projectId={project.id} bar={status.bar} /> : null}
      <p className="status-card__stage">{status.stage}</p>
      {status.footnote ? <p className="list-footer">{status.footnote}</p> : null}
      {status.action ? <HaltActions projectId={project.id} action={status.action} /> : null}
    </section>
  );
}
