import { type Problem, readProblem } from '@/shared/lib/read-problem';

import type { ClipChange, Look, Review, ReviewClip } from '../../review.types';
import { clipRange } from '../../time-clips';

const LOOK = 'the look';

export interface ReviewService {
  fetchReview: (projectId: string) => Promise<Review>;
  changeClip: (projectId: string, clipId: string, change: ClipChange) => Promise<ReviewClip>;
  saveLook: (projectId: string, look: Look) => Promise<Look>;
}

export interface ReviewSnapshot {
  review: Review | null;
  problem: Problem | null;
}

export const NOTHING_FETCHED: ReviewSnapshot = { review: null, problem: null };

export class ReviewStore {
  private snapshot = NOTHING_FETCHED;
  private held: Review | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly changeCounts = new Map<string, number>();
  private readonly heldCounts = new Map<string, number>();
  private readonly unanswered = new Map<string, Promise<void>>();

  constructor(
    private readonly projectId: string,
    private readonly service: ReviewService,
  ) {}

  read = (): ReviewSnapshot => this.snapshot;

  watch = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  load = async (): Promise<void> => {
    try {
      this.held = await this.service.fetchReview(this.projectId);
      this.publish({ review: this.held, problem: null });
    } catch (error) {
      this.publish({ ...this.snapshot, problem: readProblem(error) });
    }
  };

  showChange = (clipId: string, change: ClipChange): void => {
    this.countChange(clipId);
    this.showClip(clipId, (clip) => applyChange(clip, change));
  };

  changeClip = (clipId: string, change: ClipChange): Promise<void> => {
    this.showChange(clipId, change);
    const sent = this.changeCounts.get(clipId) ?? 0;
    const before = this.unanswered.get(clipId);
    const send = () => this.sendChange(clipId, change, sent);
    const answered = before === undefined ? send() : before.then(send);
    this.unanswered.set(clipId, answered);
    return answered.then(() => {
      if (this.unanswered.get(clipId) === answered) this.unanswered.delete(clipId);
    });
  };

  changeLook = async (look: Look): Promise<void> => {
    const sent = this.countChange(LOOK);
    this.showLook(look);
    try {
      const answered = await this.service.saveLook(this.projectId, look);
      this.holdNewest(LOOK, sent, (held) => ({ ...held, look: answered }));
    } catch (error) {
      this.publish({ ...this.snapshot, problem: readProblem(error) });
    }
    if (this.changeCounts.get(LOOK) === sent && this.held !== null) this.showLook(this.held.look);
  };

  private async sendChange(clipId: string, change: ClipChange, sent: number): Promise<void> {
    try {
      const answered = await this.service.changeClip(this.projectId, clipId, change);
      this.holdNewest(clipId, sent, (held) => ({ ...held, clips: replaceClip(held.clips, clipId, () => answered) }));
    } catch (error) {
      this.publish({ ...this.snapshot, problem: readProblem(error) });
    }
    if (this.changeCounts.get(clipId) === sent) this.showClip(clipId, (clip) => this.findHeldClip(clipId) ?? clip);
  }

  private countChange(name: string): number {
    const count = (this.changeCounts.get(name) ?? 0) + 1;
    this.changeCounts.set(name, count);
    return count;
  }

  private holdNewest(name: string, sent: number, hold: (held: Review) => Review): void {
    if (this.held === null || sent <= (this.heldCounts.get(name) ?? 0)) return;
    this.heldCounts.set(name, sent);
    this.held = hold(this.held);
  }

  private findHeldClip(clipId: string): ReviewClip | undefined {
    return this.held?.clips.find((clip) => clip.id === clipId);
  }

  private showClip(clipId: string, change: (clip: ReviewClip) => ReviewClip): void {
    const review = this.snapshot.review;
    if (review === null) return;
    this.publish({ ...this.snapshot, review: { ...review, clips: replaceClip(review.clips, clipId, change) } });
  }

  private showLook(look: Look): void {
    const review = this.snapshot.review;
    if (review !== null) this.publish({ ...this.snapshot, review: { ...review, look } });
  }

  private publish(snapshot: ReviewSnapshot): void {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}

function replaceClip(
  clips: readonly ReviewClip[],
  clipId: string,
  change: (clip: ReviewClip) => ReviewClip,
): ReviewClip[] {
  return clips.map((clip) => (clip.id === clipId ? change(clip) : clip));
}

function applyChange(clip: ReviewClip, change: ClipChange): ReviewClip {
  const changed = { ...clip, ...change };
  const range = clipRange(changed, clip.sentences);
  return {
    ...changed,
    rejectReason: changed.decision === 'reject' ? changed.rejectReason : null,
    startSeconds: range.start,
    endSeconds: range.end,
  };
}
