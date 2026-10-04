import { state, update } from '../app-state.js';
import { createDraft } from './create-draft.js';
import { describeChosenFile } from './render-new-project-form.js';
import { startProcessing } from './simulate-processing.js';

const LINK_PATTERN = /^https?:\/\/\S+\.\S+/;
const SAMPLE_DURATION_SECONDS = 4360;

export const libraryActions = {
  'set-source-kind': ({ value }) => update((current) => setSourceKind(current.draft, value)),
  'set-length': ({ value }) => update((current) => {
    current.draft.length = value;
  }),
  'toggle-platform': ({ platform }) => update((current) => togglePlatform(current.draft, platform)),
  'submit-project': () => submitProject(),
  'open-project': ({ projectId }) => openProject(projectId),
};

export const libraryInputs = {
  'edit-draft': (field) => {
    state.draft[field.dataset.field] = field.value;
  },
  'pick-file': (field) => showChosenFile(field.files[0]?.name ?? ''),
};

function setSourceKind(draft, sourceKind) {
  draft.sourceKind = sourceKind;
  draft.error = '';
}

function togglePlatform(draft, platform) {
  const isChosen = draft.platforms.includes(platform);
  draft.platforms = isChosen
    ? draft.platforms.filter((chosen) => chosen !== platform)
    : [...draft.platforms, platform];
}

function showChosenFile(fileName) {
  state.draft.fileName = fileName;
  document.getElementById('draft-file-name').textContent = describeChosenFile(fileName);
}

function submitProject() {
  const problem = findDraftProblem(state.draft);
  if (problem) return update((current) => {
    current.draft.error = problem;
  });
  const project = createProject(state.draft);
  update((current) => {
    current.projects.unshift(project);
    current.draft = createDraft();
  });
  startProcessing(project.id);
}

function findDraftProblem(draft) {
  if (draft.sourceKind === 'link' && !LINK_PATTERN.test(draft.link.trim())) {
    return 'Paste the full link, starting with https://';
  }
  if (draft.sourceKind === 'file' && !draft.fileName) return 'Choose a video file first.';
  if (draft.platforms.length === 0) return 'Pick at least one platform.';
  return '';
}

function createProject(draft) {
  const isLink = draft.sourceKind === 'link';
  return {
    id: `project-${Date.now()}`,
    title: isLink ? 'New video from link' : draft.fileName,
    source: isLink ? 'YouTube link' : 'Uploaded file',
    durationSeconds: SAMPLE_DURATION_SECONDS,
    status: 'processing',
    stageIndex: 0,
    stagePercent: 0,
  };
}

function openProject(projectId) {
  update((current) => {
    current.openProjectId = projectId;
    current.view = 'project';
    current.tab = 'review';
    current.isDetailOpen = false;
  });
  window.scrollTo(0, 0);
}
