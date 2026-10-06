import type { Project } from '@/library';

import { EmptyExport } from './EmptyExport';
import { EmptyResults } from './EmptyResults';
import { ProjectFrame } from './ProjectFrame';

interface ProjectTabsProps {
  project: Project;
  tab: 'export' | 'results';
}

export function ProjectTabs({ project, tab }: ProjectTabsProps) {
  return (
    <ProjectFrame project={project} tab={tab}>
      {tab === 'export' ? <EmptyExport projectId={project.id} /> : <EmptyResults projectId={project.id} />}
    </ProjectFrame>
  );
}
