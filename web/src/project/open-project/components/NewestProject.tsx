'use client';

import { EmptyLibraryScreen, useProjects } from '@/library';

import { ProjectScreen } from './ProjectScreen';

export function NewestProject() {
  const { projects, isLoaded } = useProjects();
  if (!isLoaded) return null;
  if (projects.length === 0) return <EmptyLibraryScreen />;
  return <ProjectScreen projectId={projects[0].id} tab="review" />;
}
