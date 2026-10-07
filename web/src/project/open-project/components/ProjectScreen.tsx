'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { StatusScreen } from '../../follow-progress';
import { useProject } from '../hooks/use-project';
import { OpenProjectContext } from '../lib/open-project-context';
import { hasTabs, type ProjectTab, tabAddress } from '../lib/project-addresses';
import { ProjectMoreButton } from './ProjectMoreButton';

const LIBRARY_ADDRESS = '/';

interface ProjectScreenProps {
  projectId: string;
  tab?: ProjectTab;
  reviewTab?: ReactNode;
  exportTab?: ReactNode;
  resultsTab?: ReactNode;
}

export function ProjectScreen({ projectId, tab, reviewTab, exportTab, resultsTab }: ProjectScreenProps) {
  const router = useRouter();
  const { project, projects, isMissing } = useProject(projectId);
  const mustOpenReview = project !== null && hasTabs(project) && tab === undefined;

  useEffect(() => {
    if (isMissing) router.replace(LIBRARY_ADDRESS);
    else if (mustOpenReview) router.replace(tabAddress(projectId, 'review'));
  }, [isMissing, mustOpenReview, projectId, router]);

  if (project === null || mustOpenReview) return null;
  if (tab === undefined || !hasTabs(project)) {
    return <StatusScreen project={project} projects={projects} actions={<ProjectMoreButton project={project} />} />;
  }
  const tabs = { review: reviewTab, export: exportTab, results: resultsTab };
  return <OpenProjectContext value={project}>{tabs[tab]}</OpenProjectContext>;
}
