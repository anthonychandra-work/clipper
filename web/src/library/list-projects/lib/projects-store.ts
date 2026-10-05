import type { Project, ProjectList } from '../../library.types';

const POLL_MS = 1000;

export interface ProjectsSnapshot {
  projects: Project[];
  freeDiskGb: number | null;
  isLoaded: boolean;
  isUnreachable: boolean;
}

export interface PageVisibility {
  isVisible: () => boolean;
  watch: (onChange: () => void) => () => void;
}

export interface ProjectsSource {
  fetchProjects: () => Promise<ProjectList>;
  page: PageVisibility;
}

export const NOTHING_LOADED: ProjectsSnapshot = {
  projects: [],
  freeDiskGb: null,
  isLoaded: false,
  isUnreachable: false,
};

export class ProjectsStore {
  private snapshot = NOTHING_LOADED;
  private lastAnswer = '';
  private readonly listeners = new Set<() => void>();
  private timer: ReturnType<typeof setInterval> | undefined;
  private stopWatchingPage: (() => void) | undefined;
  private isAsking = false;

  constructor(private readonly source: ProjectsSource) {}

  read = (): ProjectsSnapshot => this.snapshot;

  watch = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.startAsking();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stopAsking();
    };
  };

  refresh = async (): Promise<void> => {
    if (this.isAsking || !this.source.page.isVisible()) return;
    this.isAsking = true;
    try {
      this.keep(await this.source.fetchProjects());
    } catch {
      if (!this.snapshot.isUnreachable) this.publish({ ...this.snapshot, isUnreachable: true });
    } finally {
      this.isAsking = false;
    }
  };

  private startAsking(): void {
    this.timer = setInterval(this.refresh, POLL_MS);
    this.stopWatchingPage = this.source.page.watch(this.refresh);
    void this.refresh();
  }

  private stopAsking(): void {
    clearInterval(this.timer);
    this.stopWatchingPage?.();
  }

  private keep(answer: ProjectList): void {
    const serialized = JSON.stringify(answer);
    if (serialized === this.lastAnswer && !this.snapshot.isUnreachable) return;
    this.lastAnswer = serialized;
    this.publish({ ...answer, isLoaded: true, isUnreachable: false });
  }

  private publish(snapshot: ProjectsSnapshot): void {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}
