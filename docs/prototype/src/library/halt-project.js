import { update } from '../app-state.js';
import { currentStage } from './simulate-processing.js';

export const haltActions = {
  'stop-project': ({ projectId }) => update((current) => stopProject(findProject(current, projectId))),
  'retry-project': ({ projectId }) => update((current) => retryProject(findProject(current, projectId))),
};

function findProject(current, projectId) {
  return current.projects.find((project) => project.id === projectId);
}

function stopProject(project) {
  project.status = 'stopped';
  project.halt = { reason: `Stopped at “${currentStage(project).label}”. The stages before it are kept.` };
}

function retryProject(project) {
  project.halt = null;
  project.stagePercent = 0;
  project.status = currentStage(project).kind === 'upload' ? 'uploading' : 'queued';
}
