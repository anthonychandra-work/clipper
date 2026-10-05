import { refresh, state } from '../app-state.js';
import { paintProgress } from '../controls/index.js';

const TICK_MS = 200;

const MISSING_KEY = {
  reason: 'No Anthropic API key is saved. Add one in Settings, then retry.',
  opensSettings: true,
};

let timer = null;

export function resumeProcessing() {
  if (!timer) timer = setInterval(runQueue, TICK_MS);
}

export function currentStage(project) {
  return project.stages[project.stageIndex];
}

export function overallPercent(project) {
  const finishedSeconds = sumSeconds(project.stages.slice(0, project.stageIndex));
  const currentSeconds = currentStage(project).seconds * (project.stagePercent / 100);
  return ((finishedSeconds + currentSeconds) / sumSeconds(project.stages)) * 100;
}

function sumSeconds(stages) {
  return stages.reduce((sum, stage) => sum + stage.seconds, 0);
}

function runQueue() {
  state.projects.filter((project) => project.status === 'uploading').forEach(advance);
  const active = state.projects.find((project) => project.status === 'processing') ?? startOldestQueued();
  if (active) advance(active);
}

function startOldestQueued() {
  const next = state.projects.findLast((project) => project.status === 'queued');
  if (!next) return null;
  next.status = 'processing';
  refresh();
  return next;
}

function advance(project) {
  const stage = currentStage(project);
  if (stage.kind === 'score' && !state.settings.hasApiKey) return failProject(project, MISSING_KEY);
  project.stagePercent += (TICK_MS / (stage.seconds * 1000)) * 100;
  if (project.stagePercent < 100) return paintProgress(`processing-${project.id}`, overallPercent(project));
  finishStage(project, stage);
}

function failProject(project, halt) {
  project.status = 'failed';
  project.halt = halt;
  refresh();
}

function finishStage(project, stage) {
  project.stagePercent = 0;
  project.stageIndex += 1;
  if (stage.kind === 'model') state.settings.downloadedModels.push(state.settings.whisperModel);
  if (stage.kind === 'upload') project.status = 'queued';
  if (project.stageIndex === project.stages.length) project.status = 'ready';
  refresh();
}
