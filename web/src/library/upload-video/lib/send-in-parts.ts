import { RequestFailed } from '@/shared/lib/request-json';

export const PART_BYTES = 8 * 1024 * 1024;

const MAX_RESENDS_OF_A_PART = 3;
const NOT_FOUND = 404;
const CONFLICT = 409;

export type UploadOutcome = 'sent' | 'stopped' | 'deleted';

export interface UploadRun {
  file: Blob;
  sendPart: (offset: number, part: Blob) => Promise<{ receivedBytes: number }>;
  onProgress: (sentBytes: number) => void;
  waitBeforeResend: () => Promise<void>;
}

export async function sendInParts(run: UploadRun): Promise<UploadOutcome> {
  let heldBytes = 0;
  let resends = 0;
  while (heldBytes < run.file.size) {
    try {
      const answer = await run.sendPart(heldBytes, run.file.slice(heldBytes, heldBytes + PART_BYTES));
      heldBytes = answer.receivedBytes;
      resends = 0;
      run.onProgress(heldBytes);
    } catch (error) {
      if (isProjectGone(error)) return 'deleted';
      if (hasStoppedTakingParts(error)) return 'sent';
      if (resends === MAX_RESENDS_OF_A_PART) return 'stopped';
      resends += 1;
      heldBytes = readHeldBytes(error) ?? heldBytes;
      await run.waitBeforeResend();
    }
  }
  return 'sent';
}

function isProjectGone(error: unknown): boolean {
  return error instanceof RequestFailed && error.status === NOT_FOUND;
}

function hasStoppedTakingParts(error: unknown): boolean {
  const isConflict = error instanceof RequestFailed && error.status === CONFLICT;
  return isConflict && readHeldBytes(error) === null;
}

function readHeldBytes(error: unknown): number | null {
  if (!(error instanceof RequestFailed)) return null;
  const body = error.body;
  if (typeof body !== 'object' || body === null || !('receivedBytes' in body)) return null;
  return typeof body.receivedBytes === 'number' ? body.receivedBytes : null;
}
