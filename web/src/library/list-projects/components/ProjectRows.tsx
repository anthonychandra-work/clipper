'use client';

import { usePathname } from 'next/navigation';

import { useProjects } from '../hooks/use-projects';
import { ProjectRow } from './ProjectRow';

const PROJECT_ADDRESS = /^\/projects\/([^/]+)/;

export function ProjectRows({ isGrouped }: { isGrouped: boolean }) {
  const { projects } = useProjects();
  const openProjectId = PROJECT_ADDRESS.exec(usePathname())?.[1];
  return (
    <ul className={isGrouped ? 'group divided project-rows' : 'project-rows'}>
      {projects.map((project) => (
        <ProjectRow key={project.id} project={project} isCurrent={project.id === openProjectId} />
      ))}
    </ul>
  );
}
