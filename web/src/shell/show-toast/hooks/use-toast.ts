'use client';

import { useSyncExternalStore } from 'react';

import { readToast, watchToast } from '../lib/toast-store';

export function useToast(): string | null {
  return useSyncExternalStore(watchToast, readToast, readNoToast);
}

function readNoToast(): null {
  return null;
}
