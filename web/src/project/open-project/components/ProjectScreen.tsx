'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { StatusScreen } from '../../follow-progress';
import { useProject } from '../hooks/use-project';
import { hasTabs, type ProjectTab, tabAddress } from '../lib/project-addresses';
import { ProjectMoreButton } from './ProjectMoreButton';
import { ProjectTabs } from './ProjectTabs';

const LIBRARY_ADDRESS = '/';

interface ProjectScreenProps {
  projectId: string;
  tab?: ProjectTab;
}

export function ProjectScreen({ projectId, tab }: ProjectScreenProps) {
  const router = useRouter();
  const { project, projects, isMissing } = useProject(projectId);
  const mustOpenReview = project !== null && hasTabs(project) && tab === undefined;

  useEffect(() => {
    if (isMissing) router.replace(LIBRARY_ADDRESS);
    else if (mustOpenReview) router.replace(tabAddress(projectId, 'review'));
  }, [isMissing, mustOpenReview, projectId, router]);

  if (project === null || mustOpenReview) return null;
  const more = <ProjectMoreButton project={project} />;
  if (tab === undefined || !hasTabs(project)) {
    return <StatusScreen project={project} projects={projects} actions={more} />;
  }
  return <ProjectTabs project={project} tab={tab} actions={more} />;
}
