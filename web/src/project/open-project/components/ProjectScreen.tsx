'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { StatusScreen } from '../../follow-progress';
import { useProject } from '../hooks/use-project';

const LIBRARY_ADDRESS = '/';

interface ProjectScreenProps {
  projectId: string;
  actions?: ReactNode;
}

export function ProjectScreen({ projectId, actions }: ProjectScreenProps) {
  const router = useRouter();
  const { project, projects, isMissing } = useProject(projectId);

  useEffect(() => {
    if (isMissing) router.replace(LIBRARY_ADDRESS);
  }, [isMissing, router]);

  if (project === null) return null;
  return <StatusScreen project={project} projects={projects} actions={actions} />;
}
