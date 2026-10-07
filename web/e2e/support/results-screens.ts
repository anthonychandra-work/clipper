import { type APIRequestContext, expect, type Page } from '@playwright/test';

import type { ProjectList } from '@/library';
import type { ProjectResults } from '@/results';
import type { Settings } from '@/settings';

import { LONG_TITLE } from './crowded-review';
import { readSettings } from './learned-history';
import { exportSeededClips, readResults, SEEDED_VIEWS, storeViews } from './read-results';
import { changeClip } from './read-review';
import { readProjectList, type ScreenVisit, type Walk } from './walk-screens';

const SETTINGS_ADDRESS = '**/api/settings';
const RESULTS_ADDRESS = '**/api/projects/*/results';
const CROWD_COUNT = 12;
const MOST_VIEWS = 9_999_999_999;
const FEWER_VIEWS_EACH_RANK = 123_456_789;
const COUNTS_OF_THREE_DIGITS = { cutOff: 128, notInteresting: 204, needsContext: 317, repeat: 100 };
const REASON_COUNT = Object.keys(COUNTS_OF_THREE_DIGITS).length;
const REJECTED_THROUGH_THE_SERVICE = [
  { clipId: 'c05', rejectReason: 'not-interesting' },
  { clipId: 'c06', rejectReason: 'cut-off' },
] as const;

export interface ShownResults {
  list: ProjectList;
  results: ProjectResults;
  settings: Settings;
}

export async function makeSeededSet(request: APIRequestContext, projectId: string): Promise<ShownResults> {
  await exportSeededClips(request, projectId);
  for (const { clipId, rejectReason } of REJECTED_THROUGH_THE_SERVICE) {
    await changeClip(request, { projectId, clipId }, { decision: 'reject', rejectReason });
  }
  for (const [clipId, views] of Object.entries(SEEDED_VIEWS)) {
    await storeViews(request, { projectId, clipId }, views);
  }
  return readShownResults(request, projectId);
}

export async function readShownResults(request: APIRequestContext, projectId: string): Promise<ShownResults> {
  return {
    list: await readProjectList(request),
    results: await readResults(request, projectId),
    settings: await readSettings(request),
  };
}

export function walkResults(projectId: string, shown: ShownResults): Walk {
  return {
    shownList: shown.list,
    screens: [
      showResults('results-empty', { projectId, held: { clips: [] } }),
      showResults('results-seeded', { projectId, held: null }),
      showResults('results-crowded', { projectId, held: crowdResults() }),
      showSettings('settings-keyless', crowdSettings(shown.settings, null)),
      showSettings('settings-with-key', crowdSettings(shown.settings, '4f2a')),
    ],
  };
}

export function walkSeededScreens(projectId: string, shown: ShownResults): Walk {
  return {
    shownList: shown.list,
    screens: [showResults('results', { projectId, held: null }), showSettings('settings', null)],
  };
}

interface ResultsScreen {
  projectId: string;
  held: ProjectResults | null;
}

function showResults(name: string, screen: ResultsScreen): ScreenVisit {
  return {
    name,
    open: async (page: Page) => {
      await page.unroute(RESULTS_ADDRESS);
      if (screen.held !== null) await page.route(RESULTS_ADDRESS, (route) => route.fulfill({ json: screen.held }));
      await page.goto(`/projects/${screen.projectId}/results`);
      await expect(page.locator('.views-row, .empty').first()).toBeVisible();
    },
  };
}

function showSettings(name: string, held: Settings | null): ScreenVisit {
  return {
    name,
    open: async (page: Page) => {
      await page.unroute(SETTINGS_ADDRESS);
      if (held !== null) await page.route(SETTINGS_ADDRESS, (route) => route.fulfill({ json: held }));
      await page.goto('/settings');
      await expect(page.locator('.memory-count')).toHaveCount(REASON_COUNT);
    },
    leave: (page: Page) => page.unroute(SETTINGS_ADDRESS),
  };
}

function crowdResults(): ProjectResults {
  const clips = Array.from({ length: CROWD_COUNT }, (_, place) => ({
    id: `c${String(place + 1).padStart(2, '0')}`,
    rank: place + 1,
    title: `${LONG_TITLE} ${place + 1}`,
    views: MOST_VIEWS - place * FEWER_VIEWS_EACH_RANK,
  }));
  return { clips };
}

function crowdSettings(settings: Settings, keyEnding: string | null): Settings {
  return {
    ...settings,
    hasApiKey: keyEnding !== null,
    apiKeyEnding: keyEnding,
    rejections: COUNTS_OF_THREE_DIGITS,
  };
}
