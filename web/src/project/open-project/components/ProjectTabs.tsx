import Link from 'next/link';
import type { ReactNode } from 'react';

import { describeCandidateCount, type Project } from '@/library';
import { formatTimecode } from '@/shared/lib/format-timecode';
import { ScreenFrame } from '@/shell';

import { PROJECT_TABS, type ProjectTab, tabAddress } from '../lib/project-addresses';
import { EmptyExport } from './EmptyExport';
import { EmptyResults } from './EmptyResults';
import { EmptyReview } from './EmptyReview';

const BACK_TO_LIBRARY = { label: 'Library', href: '/' };
const KEPT_COUNT = 0;

interface ProjectTabsProps {
  project: Project;
  tab: ProjectTab;
  actions: ReactNode;
}

export function ProjectTabs({ project, tab, actions }: ProjectTabsProps) {
  return (
    <ScreenFrame
      screenKey="project"
      depth={1}
      section="library"
      title={project.title}
      subtitle={describeProject(project)}
      titleStyle="title"
      hasLargeTitle
      back={BACK_TO_LIBRARY}
      centre={<TabLinks projectId={project.id} current={tab} />}
      actions={actions}
    >
      {tab === 'review' ? <EmptyReview /> : null}
      {tab === 'export' ? <EmptyExport projectId={project.id} /> : null}
      {tab === 'results' ? <EmptyResults projectId={project.id} /> : null}
    </ScreenFrame>
  );
}

function TabLinks({ projectId, current }: { projectId: string; current: ProjectTab }) {
  return (
    <div className="segmented" role="group" aria-label="Project steps">
      {PROJECT_TABS.map((tab) => (
        <Link
          key={tab.value}
          className="segmented__option"
          id={`tab-${tab.value}`}
          href={tabAddress(projectId, tab.value)}
          aria-current={tab.value === current ? 'page' : 'false'}
        >
          {tab.label}
          {tab.value === 'export' ? <span className="segmented__count">{KEPT_COUNT}</span> : null}
        </Link>
      ))}
    </div>
  );
}

function describeProject(project: Project): string {
  const length = project.durationSeconds === null ? '' : ` · ${formatTimecode(project.durationSeconds)}`;
  return `${project.sourceLabel}${length} · ${describeCandidateCount(project.candidateCount)}`;
}
