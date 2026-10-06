import { existsSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE_START = 'source.';
const ASIDE_START = 'aside-';
const NOT_A_VIDEO = 'These are notes and no video.';

export interface ProjectFolder {
  dataDir: string;
  projectId: string;
}

export function moveSourceAside(folder: ProjectFolder): () => void {
  const projectDir = findProjectDir(folder);
  const source = readdirSync(projectDir).find((name) => name.startsWith(SOURCE_START));
  if (source === undefined) throw new Error(`The project has no source in ${projectDir}.`);
  const aside = join(projectDir, `${ASIDE_START}${source}`);
  renameSync(join(projectDir, source), aside);
  return () => {
    if (existsSync(aside)) renameSync(aside, join(projectDir, source));
  };
}

export function putNotesInPlaceOfSource(folder: ProjectFolder): () => void {
  const putSourceBack = moveSourceAside(folder);
  const notes = join(findProjectDir(folder), `${SOURCE_START}mp4`);
  writeFileSync(notes, NOT_A_VIDEO);
  let isSourceBack = false;
  return () => {
    if (isSourceBack) return;
    rmSync(notes);
    putSourceBack();
    isSourceBack = true;
  };
}

export function listExportFiles(folder: ProjectFolder): string[] {
  const exportsDir = join(findProjectDir(folder), 'exports');
  return existsSync(exportsDir) ? readdirSync(exportsDir).sort() : [];
}

export function listRenderWorkFolders(folder: ProjectFolder): string[] {
  return readdirSync(findProjectDir(folder)).filter((name) => name.startsWith('rendering-'));
}

function findProjectDir(folder: ProjectFolder): string {
  return join(folder.dataDir, 'projects', folder.projectId);
}
