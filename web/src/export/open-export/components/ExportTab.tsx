'use client';

import { useEffect } from 'react';

import { refreshProjects } from '@/library';
import { ProjectFrame, useOpenProject } from '@/project';
import { PagePane } from '@/shared/ui';

import type { ProjectExport } from '../../export.types';
import { useExport } from '../hooks/use-export';
import { EmptyExport } from './EmptyExport';
import { ExportClip } from './ExportClip';
import { OutputSection } from './OutputSection';
import { SourceGoneNotice } from './SourceGoneNotice';

export function ExportTab() {
  const project = useOpenProject();
  const { projectExport } = useExport(project.id);
  useLibraryToldOfFinishedClips(projectExport);

  if (projectExport === null || projectExport.clips.length === 0) {
    return (
      <ProjectFrame project={project} tab="export">
        {projectExport === null ? null : <EmptyExport projectId={project.id} />}
      </ProjectFrame>
    );
  }
  return (
    <ProjectFrame project={project} tab="export">
      <PagePane name="export">
        {projectExport.hasSource ? null : <SourceGoneNotice />}
        <OutputSection look={projectExport.look} />
        <ol className="export-list">
          {projectExport.clips.map((clip) => (
            <ExportClip key={clip.id} clip={clip} hasSource={projectExport.hasSource} />
          ))}
        </ol>
      </PagePane>
    </ProjectFrame>
  );
}

function useLibraryToldOfFinishedClips(projectExport: ProjectExport | null): void {
  const finishedCount = projectExport?.clips.filter((clip) => clip.render.state === 'done').length ?? 0;

  useEffect(() => {
    void refreshProjects();
  }, [finishedCount]);
}
