'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { showToast } from '@/shell';

import type { ProjectExport } from '../../export.types';
import { cancelRenders, retryRender, startRenders } from '../../render-clips';
import { fetchExport } from '../api/fetch-export';
import { type ExportSnapshot, ExportStore, NOTHING_FETCHED } from '../lib/export-store';

const service = { fetchExport, startRenders, retryRender, cancelRenders };
const stores = new Map<string, ExportStore>();

export interface OpenExport {
  projectExport: ProjectExport | null;
  store: ExportStore;
}

export function useExport(projectId: string): OpenExport {
  const store = findStore(projectId);
  const { projectExport, problem } = useSyncExternalStore(store.watch, store.read, readNothingFetched);

  useEffect(() => {
    if (problem !== null) showToast(problem.message);
  }, [problem]);

  return { projectExport, store };
}

function findStore(projectId: string): ExportStore {
  const opened = stores.get(projectId) ?? new ExportStore(projectId, service);
  stores.set(projectId, opened);
  return opened;
}

function readNothingFetched(): ExportSnapshot {
  return NOTHING_FETCHED;
}
