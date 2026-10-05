import Link from 'next/link';

import { formatLength } from '@/shared/lib/format-length';
import { Icon } from '@/shared/ui';

import type { Project } from '../../library.types';
import { ProjectRowStatus } from './ProjectRowStatus';

interface ProjectRowProps {
  project: Project;
  isCurrent: boolean;
}

export function ProjectRow({ project, isCurrent }: ProjectRowProps) {
  return (
    <li>
      <Link
        className="project-row"
        id={`project-${project.id}`}
        href={`/projects/${project.id}`}
        aria-current={isCurrent}
      >
        <span className="project-row__text">
          <span className="project-row__title">{project.title}</span>
          <span className="project-row__meta numeric">{describeSource(project)}</span>
          <ProjectRowStatus project={project} />
        </span>
        <Icon name="chevron-right" />
      </Link>
    </li>
  );
}

export function describeSource(project: Project): string {
  if (project.durationSeconds === null) return project.sourceLabel;
  return `${project.sourceLabel} · ${formatLength(project.durationSeconds)}`;
}
