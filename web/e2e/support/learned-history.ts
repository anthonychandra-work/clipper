import type { APIRequestContext, APIResponse, Page } from '@playwright/test';

import type { Rejections, Settings } from '@/settings';

import { rejectAs } from './review-decision';
import type { KeptRequest, RecordedClaude } from './serve-recorded-claude';
import { createLinkProject, waitForStatus } from './service-api';

export const SEEDED_REJECTIONS = [
  { clipId: 'c05', reason: 'Not Interesting' },
  { clipId: 'c06', reason: 'Cut Off Mid-Thought' },
];

export const SEEDED_NOTE = [
  'Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not interesting, 0 needing earlier context, 0 repeating another clip.',
  'Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds.',
].join('\n');

export interface SelectionSources {
  request: APIRequestContext;
  recordedClaude: RecordedClaude;
}

export interface LearnedRequests {
  rejections: Rejections;
  requests: KeptRequest[];
}

export interface SentTask {
  task: string;
  window?: { id: string };
  clipCount?: number;
  note?: string;
}

export async function readSettings(request: APIRequestContext): Promise<Settings> {
  return readAnswer(await request.get('/api/settings'));
}

export async function forgetHistory(request: APIRequestContext): Promise<Settings> {
  return readAnswer(await request.delete('/api/settings/history'));
}

export async function rejectOnTheReviewTab(page: Page, clipAddress: string, reason: string): Promise<void> {
  await page.goto(clipAddress);
  const stored = page.waitForResponse((answer) => answer.request().method() === 'PATCH' && answer.ok());
  await rejectAs(page, reason);
  await stored;
}

export async function cutTalkAndKeepRequests(sources: SelectionSources, link: string): Promise<LearnedRequests> {
  const { rejections } = await readSettings(sources.request);
  await sources.recordedClaude.forgetRequests();
  const created = await createLinkProject(sources.request, link);
  await waitForStatus(sources.request, created.id, 'ready');
  return { rejections, requests: await sources.recordedClaude.listRequests() };
}

export function nameSentTasks(requests: KeptRequest[]): string[] {
  return requests.map(readSentTask).map((sent) => (sent.window ? `${sent.task} ${sent.window.id}` : sent.task));
}

export function readSentNotes(requests: KeptRequest[]): (string | null)[] {
  return requests.map(readSentTask).map((sent) => sent.note ?? null);
}

export function readSentTask(kept: KeptRequest): SentTask {
  const messages = kept.body.messages as { content: { text: string }[] }[];
  const parts = messages[0].content;
  return JSON.parse(parts[parts.length - 1].text);
}

async function readAnswer(answer: APIResponse): Promise<Settings> {
  if (!answer.ok()) throw new Error(`The settings were not given: ${answer.status()} ${await answer.text()}`);
  return answer.json();
}
