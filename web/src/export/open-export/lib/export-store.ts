import { type Problem, readProblem } from '@/shared/lib/read-problem';

import type { ProjectExport } from '../../export.types';
import { isRendering } from '../../render-clips';

const ASK_AGAIN_MS = 1000;

export interface ExportService {
  fetchExport: (projectId: string) => Promise<ProjectExport>;
  startRenders: (projectId: string) => Promise<ProjectExport>;
  retryRender: (projectId: string, clipId: string) => Promise<ProjectExport>;
  cancelRenders: (projectId: string) => Promise<ProjectExport>;
}

export interface ExportSnapshot {
  projectExport: ProjectExport | null;
  problem: Problem | null;
}

export const NOTHING_FETCHED: ExportSnapshot = { projectExport: null, problem: null };

export class ExportStore {
  private snapshot = NOTHING_FETCHED;
  private lastAnswer = '';
  private requestsSent = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly projectId: string,
    private readonly service: ExportService,
  ) {}

  read = (): ExportSnapshot => this.snapshot;

  watch = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) void this.load();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) clearTimeout(this.timer);
    };
  };

  load = async (): Promise<void> => {
    const sentBefore = this.requestsSent;
    try {
      const answer = await this.service.fetchExport(this.projectId);
      // A fetch that overlaps a Render, Retry or Cancel may answer with the queue as it stood earlier.
      if (this.requestsSent === sentBefore) this.keep(answer);
    } catch (error) {
      if (this.snapshot.projectExport === null) this.publish({ projectExport: null, problem: readProblem(error) });
    }
    this.askAgainWhileRendering();
  };

  startRenders = (): Promise<void> => this.send(() => this.service.startRenders(this.projectId));

  retryRender = (clipId: string): Promise<void> => this.send(() => this.service.retryRender(this.projectId, clipId));

  cancelRenders = (): Promise<void> => this.send(() => this.service.cancelRenders(this.projectId));

  private async send(request: () => Promise<ProjectExport>): Promise<void> {
    this.requestsSent += 1;
    try {
      this.keep(await request());
    } catch (error) {
      this.publish({ ...this.snapshot, problem: readProblem(error) });
    }
    this.requestsSent += 1;
    this.askAgainWhileRendering();
  }

  private keep(answer: ProjectExport): void {
    const serialized = JSON.stringify(answer);
    if (serialized === this.lastAnswer && this.snapshot.problem === null) return;
    this.lastAnswer = serialized;
    this.publish({ projectExport: answer, problem: null });
  }

  private askAgainWhileRendering(): void {
    clearTimeout(this.timer);
    const isWatched = this.listeners.size > 0;
    if (isWatched && isRendering(this.snapshot.projectExport)) this.timer = setTimeout(this.load, ASK_AGAIN_MS);
  }

  private publish(snapshot: ExportSnapshot): void {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}
