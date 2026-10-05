import { type UploadOutcome, sendInParts } from './send-in-parts';

const RESEND_DELAY_MS = 1000;

export const UPLOAD_STOPPED = 'The upload stopped. Delete the project and upload the file again.';

export interface UploadProgress {
  sentBytes: number;
  totalBytes: number;
}

export type RunningUploads = Readonly<Record<string, UploadProgress>>;

export interface UploadsSource {
  sendPart: (projectId: string, offset: number, part: Blob) => Promise<{ receivedBytes: number }>;
  showToast: (message: string) => void;
  onEnded: () => void;
  resendDelayMs?: number;
}

export class UploadsStore {
  private running: RunningUploads = {};
  private readonly listeners = new Set<() => void>();

  constructor(private readonly source: UploadsSource) {}

  read = (): RunningUploads => this.running;

  watch = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  async start(projectId: string, file: Blob): Promise<UploadOutcome> {
    this.publish({ ...this.running, [projectId]: { sentBytes: 0, totalBytes: file.size } });
    const outcome = await sendInParts({
      file,
      sendPart: (offset, part) => this.source.sendPart(projectId, offset, part),
      onProgress: (sentBytes) => this.publish({ ...this.running, [projectId]: { sentBytes, totalBytes: file.size } }),
      waitBeforeResend: () => wait(this.source.resendDelayMs ?? RESEND_DELAY_MS),
    });
    this.publish(without(this.running, projectId));
    if (outcome === 'stopped') this.source.showToast(UPLOAD_STOPPED);
    this.source.onEnded();
    return outcome;
  }

  private publish(running: RunningUploads): void {
    this.running = running;
    this.listeners.forEach((listener) => listener());
  }
}

function without(running: RunningUploads, projectId: string): RunningUploads {
  return Object.fromEntries(Object.entries(running).filter(([id]) => id !== projectId));
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
