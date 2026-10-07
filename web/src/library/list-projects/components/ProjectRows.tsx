'use client';

import { usePathname } from 'next/navigation';

import type { Project } from '../../library.types';
import { useProjects } from '../hooks/use-projects';
import { ProjectRow } from './ProjectRow';

const PROJECT_ADDRESS = /^\/projects\/([^/]+)/;
const ADDRESSES_SHOWING_THE_NEWEST = ['/', '/new'];

export function ProjectRows({ isGrouped }: { isGrouped: boolean }) {
  const { projects } = useProjects();
  const pathname = usePathname();
  const openProjectId = isGrouped ? undefined : findOpenProjectId(pathname, projects);
  return (
    <ul className={isGrouped ? 'group divided project-rows' : 'project-rows'}>
      {projects.map((project) => (
        <ProjectRow key={project.id} project={project} isCurrent={project.id === openProjectId} />
      ))}
    </ul>
  );
}

function findOpenProjectId(pathname: string, projects: Project[]): string | undefined {
  if (ADDRESSES_SHOWING_THE_NEWEST.includes(pathname)) return projects[0]?.id;
  return PROJECT_ADDRESS.exec(pathname)?.[1];
}
