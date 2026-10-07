import { type Problem, readProblem } from '@/shared/lib/read-problem';

import type { ProjectResults, ResultClip } from '../../results.types';

export interface ResultsService {
  fetchResults: (projectId: string) => Promise<ProjectResults>;
  saveViews: (projectId: string, clipId: string, views: number | null) => Promise<ProjectResults>;
}

export interface ResultsSnapshot {
  results: ProjectResults | null;
  problem: Problem | null;
}

export const NOTHING_FETCHED: ResultsSnapshot = { results: null, problem: null };

export class ResultsStore {
  private snapshot = NOTHING_FETCHED;
  private held: ProjectResults | null = null;
  private savesAnswered = 0;
  private readonly listeners = new Set<() => void>();
  private readonly changeCounts = new Map<string, number>();
  private readonly unanswered = new Map<string, Promise<void>>();

  constructor(
    private readonly projectId: string,
    private readonly service: ResultsService,
  ) {}

  read = (): ResultsSnapshot => this.snapshot;

  watch = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) void this.load();
    return () => {
      this.listeners.delete(listener);
    };
  };

  load = async (): Promise<void> => {
    const answeredBefore = this.savesAnswered;
    try {
      const fetched = await this.service.fetchResults(this.projectId);
      // A fetch that overlaps a save may answer with the views as they stood before it.
      if (this.unanswered.size === 0 && this.savesAnswered === answeredBefore) this.keep(fetched);
    } catch (error) {
      this.publish({ ...this.snapshot, problem: readProblem(error) });
    }
  };

  showViews = (clipId: string, views: number | null): void => {
    this.changeCounts.set(clipId, (this.changeCounts.get(clipId) ?? 0) + 1);
    this.showClip(clipId, (clip) => ({ ...clip, views }));
  };

  saveViews = (clipId: string, views: number | null): Promise<void> => {
    this.showViews(clipId, views);
    const sent = this.changeCounts.get(clipId) ?? 0;
    const before = this.unanswered.get(clipId);
    const send = () => this.sendViews(clipId, views, sent);
    const answered = before === undefined ? send() : before.then(send);
    this.unanswered.set(clipId, answered);
    return answered.then(() => {
      if (this.unanswered.get(clipId) === answered) this.unanswered.delete(clipId);
    });
  };

  private async sendViews(clipId: string, views: number | null, sent: number): Promise<void> {
    try {
      this.holdClip(clipId, await this.service.saveViews(this.projectId, clipId, views));
    } catch (error) {
      this.publish({ ...this.snapshot, problem: readProblem(error) });
    }
    this.savesAnswered += 1;
    if (this.changeCounts.get(clipId) === sent) this.showClip(clipId, (clip) => this.findHeldClip(clipId) ?? clip);
  }

  private keep(fetched: ProjectResults): void {
    this.held = fetched;
    this.publish({ results: fetched, problem: null });
  }

  private holdClip(clipId: string, answered: ProjectResults): void {
    const stored = answered.clips.find((clip) => clip.id === clipId);
    if (this.held === null || stored === undefined) return;
    this.held = { clips: replaceClip(this.held.clips, clipId, () => stored) };
  }

  private findHeldClip(clipId: string): ResultClip | undefined {
    return this.held?.clips.find((clip) => clip.id === clipId);
  }

  private showClip(clipId: string, change: (clip: ResultClip) => ResultClip): void {
    const results = this.snapshot.results;
    if (results === null) return;
    this.publish({ ...this.snapshot, results: { clips: replaceClip(results.clips, clipId, change) } });
  }

  private publish(snapshot: ResultsSnapshot): void {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}

function replaceClip(
  clips: readonly ResultClip[],
  clipId: string,
  change: (clip: ResultClip) => ResultClip,
): ResultClip[] {
  return clips.map((clip) => (clip.id === clipId ? change(clip) : clip));
}
