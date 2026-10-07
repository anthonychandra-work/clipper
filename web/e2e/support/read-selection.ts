import type { APIRequestContext } from '@playwright/test';

export interface SelectedWindow {
  id: string;
  startSeconds: number;
  endSeconds: number;
  score: number;
  isShortlisted: boolean;
}

export interface ReplayPeak {
  startSeconds: number;
  endSeconds: number;
}

export interface Candidate {
  id: string;
  rank: number;
  startSeconds: number;
  endSeconds: number;
  total: number;
  flag: string | null;
  isReplayPeak: boolean;
}

export interface Selection {
  clipSeconds: { min: number; max: number };
  windows: SelectedWindow[];
  replayPeaks: ReplayPeak[];
  candidates: Candidate[];
}

export async function readSelection(request: APIRequestContext, projectId: string): Promise<Selection> {
  const answer = await request.get(`/api/projects/${projectId}/selection`);
  if (!answer.ok()) throw new Error(`The selection was not given: ${answer.status()} ${await answer.text()}`);
  return answer.json();
}
