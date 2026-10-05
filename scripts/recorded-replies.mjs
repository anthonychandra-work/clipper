import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RECORDED_SUFFIX = '.json';

export function openRecordedReplies(folder) {
  const scenarios = new Map(listScenarioNames(folder).map((name) => [name, readScenario(folder, name)]));
  const usesByReply = new Map();
  return {
    take: (scenarioNames, task) => takeFirstFitting(listRecorded(scenarios, scenarioNames), task, usesByReply),
    forgetUses: () => usesByReply.clear(),
  };
}

function listScenarioNames(folder) {
  const entries = readdirSync(folder, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

function readScenario(folder, name) {
  const files = readdirSync(join(folder, name)).filter((file) => file.endsWith(RECORDED_SUFFIX));
  return files.sort().map((file) => ({
    ...JSON.parse(readFileSync(join(folder, name, file), 'utf8')),
    source: `${name}/${file}`,
  }));
}

function listRecorded(scenarios, scenarioNames) {
  return scenarioNames.flatMap((name) => scenarios.get(name) ?? []);
}

function takeFirstFitting(recordedReplies, task, usesByReply) {
  const fitting = recordedReplies.find((recorded) => fitsTask(recorded, task) && hasUsesLeft(recorded, usesByReply));
  if (fitting) usesByReply.set(fitting.source, (usesByReply.get(fitting.source) ?? 0) + 1);
  return fitting ?? null;
}

function fitsTask(recorded, task) {
  const fitsKind = recorded.task === undefined || recorded.task === task?.task;
  const fitsWindow = recorded.window === undefined || recorded.window === task?.window?.id;
  return fitsKind && fitsWindow;
}

function hasUsesLeft(recorded, usesByReply) {
  return recorded.uses === undefined || (usesByReply.get(recorded.source) ?? 0) < recorded.uses;
}
