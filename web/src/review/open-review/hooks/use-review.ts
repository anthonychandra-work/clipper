'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { showToast } from '@/shell';

import type { Review } from '../../review.types';
import { changeClip } from '../api/change-clip';
import { fetchReview } from '../api/fetch-review';
import { saveLook } from '../api/save-look';
import { NOTHING_FETCHED, type ReviewSnapshot, ReviewStore } from '../lib/review-store';

const service = { fetchReview, changeClip, saveLook };
const stores = new Map<string, ReviewStore>();

export interface OpenReview {
  review: Review | null;
  store: ReviewStore;
}

export function useReview(projectId: string): OpenReview {
  const store = findStore(projectId);
  const { review, problem } = useSyncExternalStore(store.watch, store.read, readNothingFetched);

  useEffect(() => {
    void store.load();
  }, [store]);

  useEffect(() => {
    if (problem !== null) showToast(problem.message);
  }, [problem]);

  return { review, store };
}

function findStore(projectId: string): ReviewStore {
  const opened = stores.get(projectId) ?? new ReviewStore(projectId, service);
  stores.set(projectId, opened);
  return opened;
}

function readNothingFetched(): ReviewSnapshot {
  return NOTHING_FETCHED;
}
