import { refresh, state } from '../app-state.js';

export const STAGES = [
  { label: 'Fetching video', seconds: 3 },
  { label: 'Transcribing on this Mac', seconds: 12 },
  { label: 'Scoring 49 windows', seconds: 5 },
  { label: 'Cutting clips', seconds: 4 },
];

const TICK_MS = 200;
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

function advance(projectId) {
  const project = state.projects.find((candidate) => candidate.id === projectId);
  const stageMs = STAGES[project.stageIndex].seconds * 1000;
  project.stagePercent += (TICK_MS / stageMs) * 100;
  if (project.stagePercent < 100) return paintStageBar(project);
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

function paintStageBar(project) {
  const bar = document.getElementById(`stage-bar-${project.id}`);
  if (bar) bar.style.width = `${project.stagePercent}%`;
}
