import { state, update } from '../app-state.js';
import { leaveSidebar } from '../navigate.js';
import { createDraft } from './create-draft.js';
import { haltActions } from './halt-project.js';
import { planStages } from './plan-stages.js';
import { describeChosenFile } from './render-new-project-sheet.js';

const LINK_PATTERN = /^https?:\/\/\S+\.\S+/;
const SAMPLE_DURATION_SECONDS = 4360;
const FIRST_PLATFORM_SWITCH = 'platform-tiktok';

export const libraryActions = {
  ...haltActions,
  'set-source-kind': ({ value }) => update((current) => setSourceKind(current.draft, value)),
  'set-length': ({ value }) => update((current) => {
    current.draft.length = value;
  }),
  'toggle-platform': ({ value }) => update((current) => togglePlatform(current.draft, value)),
  'submit-project': () => submitProject(),
  'open-project': ({ projectId }) => openProject(projectId),
};

export const libraryInputs = {
  'edit-draft': (field) => editDraft(field.dataset.field, field.value),
  'pick-file': (field) => showChosenFile(field.files[0]?.name ?? ''),
};

function setSourceKind(draft, sourceKind) {
  draft.sourceKind = sourceKind;
  draft.problem = null;
}

function togglePlatform(draft, platform) {
  const isChosen = draft.platforms.includes(platform);
  draft.platforms = isChosen
    ? draft.platforms.filter((chosen) => chosen !== platform)
    : [...draft.platforms, platform];
  draft.problem = null;
}

function editDraft(field, value) {
  state.draft[field] = value;
  if (state.draft.problem) update((current) => {
    current.draft.problem = null;
  });
}

function showChosenFile(fileName) {
  state.draft.fileName = fileName;
  state.draft.problem = null;
  document.getElementById('draft-file-name').textContent = describeChosenFile(fileName);
}

function submitProject() {
  const problem = findDraftProblem(state.draft);
  if (problem) return showDraftProblem(problem);
  const project = createProject(state.draft, state.settings);
  update((current) => {
    current.projects.unshift(project);
    current.draft = createDraft();
    current.sheet = null;
  });
}

function showDraftProblem(problem) {
  update((current) => {
    current.draft.problem = problem;
  });
  const invalidFieldId = problem.section === 'platforms' ? FIRST_PLATFORM_SWITCH : `draft-${state.draft.sourceKind}`;
  document.getElementById(invalidFieldId).focus();
}

function findDraftProblem(draft) {
  if (draft.sourceKind === 'link' && !LINK_PATTERN.test(draft.link.trim())) {
    return { section: 'source', message: 'Paste the full link, starting with https://' };
  }
  if (draft.sourceKind === 'file' && !draft.fileName) {
    return { section: 'source', message: 'Choose a video file first.' };
  }
  if (draft.platforms.length === 0) return { section: 'platforms', message: 'Turn on at least one platform.' };
  return null;
}

function createProject(draft, settings) {
  const isLink = draft.sourceKind === 'link';
  const isModelReady = settings.downloadedModels.includes(settings.whisperModel);
  return {
    id: `project-${Date.now()}`,
    title: isLink ? 'New video from link' : draft.fileName,
    source: isLink ? 'YouTube link' : 'Uploaded file',
    sourceKind: draft.sourceKind,
    durationSeconds: SAMPLE_DURATION_SECONDS,
    status: isLink ? 'queued' : 'uploading',
    stageIndex: 0,
    stagePercent: 0,
    stages: planStages({ sourceKind: draft.sourceKind, modelToDownload: isModelReady ? '' : settings.whisperModel }),
  };
}

function openProject(projectId) {
  update((current) => {
    current.openProjectId = projectId;
    current.view = 'project';
    current.tab = 'review';
    current.isDetailOpen = false;
    leaveSidebar(current);
  });
  window.scrollTo(0, 0);
}
