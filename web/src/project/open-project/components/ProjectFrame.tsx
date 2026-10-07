import Link from 'next/link';
import type { ReactNode } from 'react';

import { describeCandidateCount, type Project } from '@/library';
import { formatTimecode } from '@/shared/lib/format-timecode';
import { ScreenFrame } from '@/shell';

import { PROJECT_TABS, type ProjectTab, tabAddress } from '../lib/project-addresses';
import { ProjectMoreButton } from './ProjectMoreButton';

const BACK_TO_LIBRARY = { label: 'Library', href: '/' };

interface ProjectFrameProps {
  project: Project;
  tab: ProjectTab;
  actions?: ReactNode;
  children: ReactNode;
}

export function ProjectFrame({ project, tab, actions, children }: ProjectFrameProps) {
  const trailing = (
    <>
      <ProjectMoreButton project={project} />
      {actions}
    </>
  );
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
      centre={<TabLinks project={project} current={tab} />}
      actions={trailing}
    >
      {children}
    </ScreenFrame>
  );
}

function TabLinks({ project, current }: { project: Project; current: ProjectTab }) {
  return (
    <div className="segmented" role="group" aria-label="Project steps">
      {PROJECT_TABS.map((tab) => (
        <Link
          key={tab.value}
          className="segmented__option"
          id={`tab-${tab.value}`}
          href={tabAddress(project.id, tab.value)}
          aria-current={tab.value === current ? 'page' : 'false'}
        >
          {tab.label}
          {tab.value === 'export' ? <span className="segmented__count">{project.keptCount}</span> : null}
        </Link>
      ))}
    </div>
  );
}

function describeProject(project: Project): string {
  const length = project.durationSeconds === null ? '' : ` · ${formatTimecode(project.durationSeconds)}`;
  return `${project.sourceLabel}${length} · ${describeCandidateCount(project.candidateCount)}`;
}
