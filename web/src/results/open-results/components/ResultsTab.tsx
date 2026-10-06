'use client';

import { ProjectFrame, useOpenProject } from '@/project';
import { PagePane } from '@/shared/ui';

import { OutcomeSection } from '../../compare-outcome';
import { ViewsList } from '../../log-views';
import { useResults } from '../hooks/use-results';
import { EmptyResults } from './EmptyResults';

export function ResultsTab() {
  const project = useOpenProject();
  const { results, store } = useResults(project.id);

  if (results === null || results.clips.length === 0) {
    return (
      <ProjectFrame project={project} tab="results">
        {results === null ? null : <EmptyResults project={project} />}
      </ProjectFrame>
    );
  }
  return (
    <ProjectFrame project={project} tab="results">
      <PagePane name="results">
        <ViewsList
          clips={results.clips}
          onShow={store.showViews}
          onSave={(clipId, views) => void store.saveViews(clipId, views)}
        />
        <OutcomeSection clips={results.clips} />
      </PagePane>
    </ProjectFrame>
  );
}
