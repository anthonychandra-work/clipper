import { createDraft } from './create-draft.js';
import { SAMPLE_PROJECT_ID, sampleProjects } from './sample-projects.js';

export { libraryActions, libraryInputs } from './library-actions.js';
export { renderLibrary } from './render-library.js';
export { CLIP_LENGTHS } from './render-new-project-form.js';
export { resumeProcessing } from './simulate-processing.js';

export function createLibraryState() {
  return {
    projects: sampleProjects.map((project) => ({ ...project })),
    draft: createDraft(),
    openProjectId: SAMPLE_PROJECT_ID,
  };
}
