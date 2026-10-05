import { refresh, state } from '../app-state.js';
import { paintProgress } from '../controls/index.js';

export const STAGES = [
  { label: 'Fetching video', seconds: 3 },
  { label: 'Transcribing on this Mac', seconds: 12 },
  { label: 'Scoring 49 windows', seconds: 5 },
  { label: 'Cutting clips', seconds: 4 },
];

const TICK_MS = 200;
const TOTAL_SECONDS = sumSeconds(STAGES);
const timers = new Map();

export function resumeProcessing() {
  state.projects
    .filter((project) => project.status === 'processing')
    .forEach((project) => startProcessing(project.id));
}

export function startProcessing(projectId) {
  if (timers.has(projectId)) return;
  timers.set(projectId, setInterval(() => advance(projectId), TICK_MS));
}

export function overallPercent(project) {
  const finishedSeconds = sumSeconds(STAGES.slice(0, project.stageIndex));
  const currentSeconds = STAGES[project.stageIndex].seconds * (project.stagePercent / 100);
  return ((finishedSeconds + currentSeconds) / TOTAL_SECONDS) * 100;
}

function sumSeconds(stages) {
  return stages.reduce((sum, stage) => sum + stage.seconds, 0);
}

function advance(projectId) {
  const project = state.projects.find((candidate) => candidate.id === projectId);
  const stageMs = STAGES[project.stageIndex].seconds * 1000;
  project.stagePercent += (TICK_MS / stageMs) * 100;
  if (project.stagePercent < 100) return paintProgress(`processing-${project.id}`, overallPercent(project));
  finishStage(project);
}

function finishStage(project) {
  project.stagePercent = 0;
  project.stageIndex += 1;
  if (project.stageIndex === STAGES.length) markReady(project);
  refresh();
}

function markReady(project) {
  project.status = 'ready';
  clearInterval(timers.get(project.id));
  timers.delete(project.id);
}
