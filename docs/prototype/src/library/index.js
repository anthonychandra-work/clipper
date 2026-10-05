import { createDraft } from './create-draft.js';
import { planStages } from './plan-stages.js';
import { SAMPLE_PROJECT_ID, sampleProjects } from './sample-projects.js';

export { libraryActions, libraryInputs } from './library-actions.js';
export { renderEmptyLibraryScreen, renderLibraryScreen, renderSidebar } from './render-library.js';
export { CLIP_LENGTHS, renderNewProjectSheet } from './render-new-project-sheet.js';
export { isInPipeline, renderProcessingScreen } from './render-processing.js';
export { resumeProcessing } from './simulate-processing.js';

export function findOpenProject(state) {
  return state.projects.find((project) => project.id === state.openProjectId);
}

export function createLibraryState() {
  return {
    projects: sampleProjects.map((project) => ({
      ...project,
      stages: planStages({ sourceKind: project.sourceKind, modelToDownload: '' }),
    })),
    draft: createDraft(),
    openProjectId: SAMPLE_PROJECT_ID,
  };
}
