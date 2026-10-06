import type { Project } from '@/library';

import { EmptyResults } from './EmptyResults';
import { ProjectFrame } from './ProjectFrame';

export function ProjectTabs({ project }: { project: Project }) {
  return (
    <ProjectFrame project={project} tab="results">
      <EmptyResults projectId={project.id} />
    </ProjectFrame>
  );
}
