'use client';

import { useSyncExternalStore } from 'react';

import { fetchProjects } from '../api/fetch-projects';
import { NOTHING_LOADED, type ProjectsSnapshot, ProjectsStore } from '../lib/projects-store';

const browserPage = {
  isVisible: () => document.visibilityState === 'visible',
  watch: (onChange: () => void) => {
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  },
};

const projectsStore = new ProjectsStore({ fetchProjects, page: browserPage });

export function useProjects(): ProjectsSnapshot {
  return useSyncExternalStore(projectsStore.watch, projectsStore.read, readNothingLoaded);
}

export function useDiskLine(): string {
  const { freeDiskGb } = useProjects();
  return freeDiskGb === null ? '' : `${Math.floor(freeDiskGb)} GB free on this Mac`;
}

export function refreshProjects(): Promise<void> {
  return projectsStore.refresh();
}

function readNothingLoaded(): ProjectsSnapshot {
  return NOTHING_LOADED;
}
