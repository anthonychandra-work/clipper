'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { showToast } from '@/shell';

import { saveViews } from '../../log-views';
import type { ProjectResults } from '../../results.types';
import { fetchResults } from '../api/fetch-results';
import { NOTHING_FETCHED, type ResultsSnapshot, ResultsStore } from '../lib/results-store';

const service = { fetchResults, saveViews };
const stores = new Map<string, ResultsStore>();

export interface OpenResults {
  results: ProjectResults | null;
  store: ResultsStore;
}

export function useResults(projectId: string): OpenResults {
  const store = findStore(projectId);
  const { results, problem } = useSyncExternalStore(store.watch, store.read, readNothingFetched);

  useEffect(() => {
    if (problem !== null) showToast(problem.message);
  }, [problem]);

  return { results, store };
}

function findStore(projectId: string): ResultsStore {
  const opened = stores.get(projectId) ?? new ResultsStore(projectId, service);
  stores.set(projectId, opened);
  return opened;
}

function readNothingFetched(): ResultsSnapshot {
  return NOTHING_FETCHED;
}
