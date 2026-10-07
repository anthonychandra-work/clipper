'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon, PagePane } from '@/shared/ui';
import { ScreenFrame, useShell } from '@/shell';

import { useDiskLine, useProjects } from '../hooks/use-projects';
import { EmptyLibrary } from './EmptyLibrary';
import { ProjectRows } from './ProjectRows';

const NEW_PROJECT_ADDRESS = '/new';

export function LibraryScreen({ whenRegular }: { whenRegular: ReactNode }) {
  const { layout } = useShell();
  return layout === 'compact' ? <CompactLibrary /> : whenRegular;
}

function CompactLibrary() {
  const { projects, isLoaded } = useProjects();
  return (
    <ScreenFrame
      screenKey="library"
      depth={0}
      section="library"
      title="Library"
      hasLargeTitle
      actions={<NewProjectControl />}
    >
      <PagePane name="library">
        {isLoaded && projects.length === 0 ? <EmptyLibrary /> : null}
        {projects.length > 0 ? <ProjectSection /> : null}
      </PagePane>
    </ScreenFrame>
  );
}

function NewProjectControl() {
  return (
    <Link
      className="bar-button bar-button--icon bar-button--tinted"
      id="new-project"
      href={NEW_PROJECT_ADDRESS}
      scroll={false}
      aria-label="New Project"
    >
      <Icon name="plus" />
    </Link>
  );
}

function ProjectSection() {
  const diskLine = useDiskLine();
  return (
    <section className="group-section" aria-labelledby="projects-heading">
      <h2 className="list-header" id="projects-heading">
        Projects
      </h2>
      <ProjectRows isGrouped />
      <p className="list-footer numeric">{diskLine}</p>
    </section>
  );
}
