import { update } from '../app-state.js';
import { formatTimecode } from '../format-timecode.js';
import { renderSegmented } from '../controls/index.js';
import {
  findOpenProject, isInPipeline, renderEmptyLibraryScreen, renderProcessingScreen,
} from '../library/index.js';
import { keptClips } from './clip-review.js';
import { renderProjectMoreButton } from './delete-project.js';
import { renderExport } from './export/index.js';
import { renderResults } from './render-results.js';
import { renderReview } from './review/index.js';

const TABS = [
  { value: 'review', label: 'Review', render: renderReview },
  { value: 'export', label: 'Export', render: renderExport },
  { value: 'results', label: 'Results', render: renderResults },
];

const PUSHED_CLIP_KEY = 'clip';

export const tabActions = {
  'set-tab': ({ value }) => update((state) => {
    state.tab = value;
  }),
};

export function renderProjectScreen(state) {
  const project = findOpenProject(state);
  if (!project) return renderEmptyLibraryScreen();
  const more = renderProjectMoreButton(state);
  if (isInPipeline(project)) return { ...renderProcessingScreen(project, state), actions: more };
  const tab = TABS.find((candidate) => candidate.value === state.tab).render(state);
  const length = formatTimecode(project.durationSeconds);
  return {
    key: 'project',
    depth: 1,
    title: project.title,
    subtitle: `${project.source} · ${length} · ${state.clips.length} candidates`,
    titleStyle: 'title',
    hasLargeTitle: true,
    back: { label: 'Library', action: 'navigate', view: 'library' },
    centre: renderTabs(state),
    ...tab,
    actions: tab.key === PUSHED_CLIP_KEY ? tab.actions : `${more}${tab.actions ?? ''}`,
  };
}

function renderTabs(state) {
  const options = TABS.map((tab) => ({
    value: tab.value,
    label: tab.label,
    count: tab.value === 'export' ? keptClips(state).length : undefined,
  }));
  return renderSegmented({ name: 'tab', label: 'Project steps', action: 'set-tab', selected: state.tab, options });
}
