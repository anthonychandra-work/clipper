'use client';

import { useSyncExternalStore } from 'react';

import { showToast } from '@/shell';

import { refreshProjects } from '../../list-projects';
import { sendPart } from '../api/send-part';
import { type RunningUploads, type UploadProgress, UploadsStore } from '../lib/uploads-store';

const NO_UPLOADS: RunningUploads = {};

const uploadsStore = new UploadsStore({ sendPart, showToast, onEnded: refreshProjects });

export function useUpload(projectId: string): UploadProgress | null {
  const running = useSyncExternalStore(uploadsStore.watch, uploadsStore.read, readNoUploads);
  return running[projectId] ?? null;
}

export function startUpload(projectId: string, file: Blob): void {
  void uploadsStore.start(projectId, file);
}

function readNoUploads(): RunningUploads {
  return NO_UPLOADS;
}
