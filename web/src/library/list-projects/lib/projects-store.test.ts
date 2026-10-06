import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Project, ProjectList } from '../../library.types';
import { NOTHING_LOADED, ProjectsStore } from './projects-store';

const TALK: Project = {
  id: 'a1b2c3d4e5f6',
  title: 'talk',
  sourceKind: 'link',
  sourceLabel: 'Video link',
  durationSeconds: 235.6,
  status: 'fetched',
  steps: [],
  percent: 25,
  halt: null,
  upload: null,
  candidateCount: 0,
  keptCount: 0,
  rejectedCount: 0,
  exportedCount: 0,
};

function buildStore(answers: () => Promise<ProjectList>) {
  const page = { isVisible: true, notify: () => undefined as void };
  const fetchProjects = vi.fn(answers);
  const store = new ProjectsStore({
    fetchProjects,
    page: {
      isVisible: () => page.isVisible,
      watch: (onChange) => {
        page.notify = onChange;
        return () => undefined;
      },
    },
  });
  return { store, fetchProjects, page };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('the projects store', () => {
  it('holds nothing and asks nothing until a component reads it', () => {
    const { store, fetchProjects } = buildStore(async () => ({ projects: [], freeDiskGb: 21 }));

    expect(store.read()).toBe(NOTHING_LOADED);
    expect(fetchProjects).not.toHaveBeenCalled();
  });

  it('asks at once and then once a second, however many components read it', async () => {
    const { store, fetchProjects } = buildStore(async () => ({ projects: [TALK], freeDiskGb: 21 }));

    store.watch(() => undefined);
    store.watch(() => undefined);
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(3000);

    expect(fetchProjects).toHaveBeenCalledTimes(4);
    expect(store.read()).toMatchObject({ projects: [TALK], freeDiskGb: 21, isLoaded: true });
  });

  it('stops asking when the last component stops reading', async () => {
    const { store, fetchProjects } = buildStore(async () => ({ projects: [], freeDiskGb: 21 }));
    const stopFirst = store.watch(() => undefined);
    const stopSecond = store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(1000);

    stopFirst();
    await vi.advanceTimersByTimeAsync(1000);
    stopSecond();
    await vi.advanceTimersByTimeAsync(5000);

    expect(fetchProjects).toHaveBeenCalledTimes(3);
  });

  it('does not ask while the page is hidden and asks at once when it shows again', async () => {
    const { store, fetchProjects, page } = buildStore(async () => ({ projects: [], freeDiskGb: 21 }));
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    page.isVisible = false;
    await vi.advanceTimersByTimeAsync(5000);
    const asksWhileHidden = fetchProjects.mock.calls.length;
    page.isVisible = true;
    page.notify();
    await vi.advanceTimersByTimeAsync(0);

    expect(asksWhileHidden).toBe(1);
    expect(fetchProjects).toHaveBeenCalledTimes(2);
  });

  it('tells its readers only when the answer changes', async () => {
    let title = 'New video from link';
    const { store } = buildStore(async () => ({ projects: [{ ...TALK, title }], freeDiskGb: 21 }));
    const told = vi.fn();
    store.watch(told);
    await vi.advanceTimersByTimeAsync(2000);
    const unchanged = store.read();

    title = 'talk';
    await vi.advanceTimersByTimeAsync(1000);

    expect(told).toHaveBeenCalledTimes(2);
    expect(store.read()).not.toBe(unchanged);
    expect(store.read().projects[0].title).toBe('talk');
  });

  it('keeps what it has when the tool does not answer, and recovers', async () => {
    let isDown = false;
    const { store } = buildStore(async () => {
      if (isDown) throw new Error('Clipper did not answer.');
      return { projects: [TALK], freeDiskGb: 21 };
    });
    store.watch(() => undefined);
    await vi.advanceTimersByTimeAsync(0);

    isDown = true;
    await vi.advanceTimersByTimeAsync(1000);
    const whileDown = store.read();
    isDown = false;
    await vi.advanceTimersByTimeAsync(1000);

    expect(whileDown).toMatchObject({ projects: [TALK], isUnreachable: true });
    expect(store.read()).toMatchObject({ projects: [TALK], isUnreachable: false });
  });

  it('does not ask again while an answer is still on its way', async () => {
    const pending: ((list: ProjectList) => void)[] = [];
    const { store, fetchProjects } = buildStore(
      () => new Promise<ProjectList>((answer) => pending.push(answer)),
    );
    store.watch(() => undefined);

    await vi.advanceTimersByTimeAsync(3000);
    pending[0]({ projects: [], freeDiskGb: 21 });
    await vi.advanceTimersByTimeAsync(1000);

    expect(pending).toHaveLength(2);
    expect(fetchProjects).toHaveBeenCalledTimes(2);
  });
});
