import { expect, type Page } from '@playwright/test';

import type { ProjectList } from '@/library';
import type { Review } from '@/review';

import { type CrowdedReview, presentCrowdedReview } from './crowded-review';
import type { ReadyTalk } from './ready-talk';
import { waitForPicture } from './review-preview';
import type { ScreenVisit, Walk } from './walk-screens';

const REVIEW_ADDRESS = '**/api/projects/*/review';
const FIRST_CLIP = 'c01';
const SECOND_CLIP = 'c02';
const FLAGGED_CLIP = 'c04';

export function walkTalkReview(talk: ReadyTalk, shownList: ProjectList): Walk {
  const showTalk = (page: Page) => page.unroute(REVIEW_ADDRESS);
  return { shownList, screens: listReviewScreens(talk.project.id, 'review', showTalk) };
}

export function walkCrowdedReview(talk: ReadyTalk, shownList: ProjectList): Walk {
  const crowded = presentCrowdedReview(talk);
  const showCrowd = (page: Page) => holdReview(page, crowded.review);
  return {
    shownList: holdProject(shownList, crowded),
    screens: listReviewScreens(talk.project.id, 'crowded', showCrowd),
  };
}

function listReviewScreens(projectId: string, name: string, prepare: (page: Page) => Promise<void>): ScreenVisit[] {
  const review = `/projects/${projectId}/review`;
  const openClip = async (page: Page, clipId: string, arrange?: (page: Page) => Promise<void>) => {
    await prepare(page);
    await page.goto(`${review}/${clipId}`);
    await waitForPicture(page);
    await arrange?.(page);
  };
  return [
    { name: `${name}-list`, open: (page) => openList(page, review, prepare) },
    { name: `${name}-clip`, open: (page) => openClip(page, FIRST_CLIP) },
    { name: `${name}-flagged-clip`, open: (page) => openClip(page, FLAGGED_CLIP, expectFlag) },
    {
      name: `${name}-reject-menu`,
      open: (page) => openClip(page, SECOND_CLIP, openRejectMenu),
      leave: (page) => page.keyboard.press('Escape'),
    },
    { name: `${name}-pinned-preview`, open: (page) => openClip(page, FIRST_CLIP, pinPreview) },
  ];
}

async function openList(page: Page, review: string, prepare: (page: Page) => Promise<void>): Promise<void> {
  await prepare(page);
  await page.goto(review);
  await expect(page.locator('.candidate__open').first()).toBeVisible();
  await expect(page.locator('.timeline__pin').first()).toBeVisible();
}

async function expectFlag(page: Page): Promise<void> {
  await expect(page.locator('.inspector .flag[role="note"]')).toBeVisible();
}

async function openRejectMenu(page: Page): Promise<void> {
  await page.locator('#decision-reject').click();
  await expect(page.locator('#menu:not([hidden]) .menu[role="menu"]')).toBeVisible();
}

async function pinPreview(page: Page): Promise<void> {
  if (await page.locator('.app[data-layout="compact"]').count() === 0) return;
  await page.locator('section.preview').evaluate((preview) => {
    window.scrollTo({ top: window.scrollY + preview.getBoundingClientRect().bottom, behavior: 'instant' });
  });
  await expect(page.locator('#app')).toHaveAttribute('data-preview', 'docked');
}

async function holdReview(page: Page, review: Review): Promise<void> {
  await page.unroute(REVIEW_ADDRESS);
  await page.route(REVIEW_ADDRESS, (route) => route.fulfill({ json: review }));
}

function holdProject(list: ProjectList, crowded: CrowdedReview): ProjectList {
  const projects = list.projects.map((project) => (project.id === crowded.project.id ? crowded.project : project));
  return { ...list, projects };
}
