import { type APIRequestContext, expect, type Page } from '@playwright/test';

import type { ExportClip, ProjectExport, RenderState } from '@/export';
import type { Project, ProjectList } from '@/library';

import { LONG_TITLE } from './crowded-review';
import { exportRows } from './export-page';
import { keepClips, readExport, waitForExport } from './read-export';
import { holdProjectList, type ScreenVisit, type Walk } from './walk-screens';

const EXPORT_ADDRESS = '**/api/projects/*/export';
const FIRST_TWO_CLIPS = ['c01', 'c02'];
const CROWD_COUNT = 12;
const EVERY_STATE: readonly RenderState[] = ['none', 'waiting', 'rendering', 'failed', 'done'];
const RENDERED_PERCENT = 41.3;
const LONG_REASON = 'Not enough free disk space to finish. Free some space, then retry.';
const LONG_DESCRIPTION = [
  'The oven broke before sunrise on the busiest Saturday of the winter, with a line of customers at the door.',
  'What the baker told them, one by one, turned the worst morning of the year into the reason they came back.',
  'Watch to the end for the sentence she says to every new baker now. #bakery #smallshops',
].join(' ');

export interface ShownExport {
  list: ProjectList;
  talkExport: ProjectExport;
}

export async function finishFirstOfTwoClips(request: APIRequestContext, projectId: string): Promise<ShownExport> {
  await keepClips(request, projectId, FIRST_TWO_CLIPS);
  await request.post(`/api/projects/${projectId}/clips/c01/render`);
  await waitForExport(request, projectId, (shown) => shown.clips[0].render.state === 'done');
  const list: ProjectList = await (await request.get('/api/projects')).json();
  return { list, talkExport: await readExport(request, projectId) };
}

export function walkExport(projectId: string, shown: ShownExport): Walk {
  const crowded = crowdExport(shown.talkExport);
  const withoutClips = { ...shown.talkExport, clips: [] };
  return {
    shownList: shown.list,
    screens: [
      showExport('export-empty', { projectId, list: countKept(shown.list, 0), held: withoutClips }),
      showExport('export-talk', { projectId, list: shown.list, held: null }),
      showExport('export-crowded', { projectId, list: countKept(shown.list, CROWD_COUNT), held: crowded }),
    ],
  };
}

interface ExportScreen {
  projectId: string;
  list: ProjectList;
  held: ProjectExport | null;
}

function showExport(name: string, screen: ExportScreen): ScreenVisit {
  const rowCount = screen.held?.clips.length ?? FIRST_TWO_CLIPS.length;
  return {
    name,
    open: async (page: Page) => {
      await holdProjectList(page, screen.list);
      await page.unroute(EXPORT_ADDRESS);
      if (screen.held !== null) await page.route(EXPORT_ADDRESS, (route) => route.fulfill({ json: screen.held }));
      await page.goto(`/projects/${screen.projectId}/export`);
      await expect(page.locator('.export-list, .empty').first()).toBeVisible();
      await expect(exportRows(page)).toHaveCount(rowCount);
    },
  };
}

function countKept(list: ProjectList, keptCount: number): ProjectList {
  const projects = list.projects.map((project: Project) => ({ ...project, keptCount }));
  return { ...list, projects };
}

function crowdExport(talkExport: ProjectExport): ProjectExport {
  const [finished] = talkExport.clips;
  const clips = Array.from({ length: CROWD_COUNT }, (_, place) => crowdClip(finished, place));
  return { ...talkExport, hasSource: false, clips };
}

function crowdClip(finished: ExportClip, place: number): ExportClip {
  const state = EVERY_STATE[place % EVERY_STATE.length];
  const rank = String(place + 1).padStart(2, '0');
  const percent = { none: 0, waiting: 0, rendering: RENDERED_PERCENT, failed: 0, done: 100 }[state];
  return {
    ...finished,
    id: `c${rank}`,
    rank: place + 1,
    title: `${LONG_TITLE} ${place + 1}`,
    file: `exports/${rank}-c${rank}.mp4`,
    render: { state, percent, reason: state === 'failed' ? LONG_REASON : null },
    download: state === 'done' ? finished.download : null,
    texts: finished.texts.map((written) => ({ ...written, description: LONG_DESCRIPTION })),
  };
}
