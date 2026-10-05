'use client';

import { type Project, useProjects } from '@/library';

export interface OpenProject {
  project: Project | null;
  projects: Project[];
  isMissing: boolean;
}

export function useProject(projectId: string): OpenProject {
  const { projects, isLoaded } = useProjects();
  const project = projects.find((candidate) => candidate.id === projectId) ?? null;
  return { project, projects, isMissing: isLoaded && project === null };
}
