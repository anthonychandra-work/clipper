'use client';

import { createContext, useContext } from 'react';

import type { Project } from '@/library';

export const OpenProjectContext = createContext<Project | null>(null);

export function useOpenProject(): Project {
  const project = useContext(OpenProjectContext);
  if (project === null) throw new Error('This component must be rendered inside the screen of an open project.');
  return project;
}
