import { createDraft } from './create-draft.js';
import { SAMPLE_PROJECT_ID, sampleProjects } from './sample-projects.js';

export { libraryActions, libraryInputs } from './library-actions.js';
export { renderLibraryScreen, renderSidebar } from './render-library.js';
export { CLIP_LENGTHS, renderNewProjectSheet } from './render-new-project-sheet.js';
export { renderProcessingScreen } from './render-processing.js';
export { resumeProcessing } from './simulate-processing.js';

export function createLibraryState() {
  return {
    projects: sampleProjects.map((project) => ({ ...project })),
    draft: createDraft(),
    openProjectId: SAMPLE_PROJECT_ID,
  };
}
