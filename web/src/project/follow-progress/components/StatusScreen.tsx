import type { ReactNode } from 'react';

import { describeSource, type Project } from '@/library';
import { PagePane } from '@/shared/ui';
import { ScreenFrame } from '@/shell';

import { StatusCard } from './StatusCard';

const BACK_TO_LIBRARY = { label: 'Library', href: '/' };

interface StatusScreenProps {
  project: Project;
  projects: Project[];
  actions?: ReactNode;
}

export function StatusScreen({ project, projects, actions }: StatusScreenProps) {
  return (
    <ScreenFrame
      screenKey="project"
      depth={1}
      section="library"
      title={project.title}
      subtitle={describeSource(project)}
      titleStyle="title"
      hasLargeTitle
      back={BACK_TO_LIBRARY}
      actions={actions}
    >
      <PagePane name="processing">
        <StatusCard project={project} projects={projects} />
      </PagePane>
    </ScreenFrame>
  );
}
