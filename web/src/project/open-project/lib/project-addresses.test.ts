import { describe, expect, it } from 'vitest';

import type { Project, ProjectStatus } from '@/library';

import { hasTabs, PROJECT_TABS, projectAddress, tabAddress } from './project-addresses';

function describeProject(status: ProjectStatus): Project {
  return {
    id: 'a1b2c3d4e5f6',
    title: 'talk',
    sourceKind: 'link',
    sourceLabel: 'Video link',
    durationSeconds: 236,
    status,
    steps: [],
    percent: 100,
    halt: null,
    upload: null,
    candidateCount: 0,
    keptCount: 0,
    rejectedCount: 0,
  };
}

describe('project addresses', () => {
  it('gives every project an address of its own', () => {
    expect(projectAddress('a1b2c3d4e5f6')).toBe('/projects/a1b2c3d4e5f6');
  });

  it('gives every tab of a project an address of its own', () => {
    const addresses = PROJECT_TABS.map((tab) => tabAddress('a1b2c3d4e5f6', tab.value));

    expect(addresses).toEqual([
      '/projects/a1b2c3d4e5f6/review',
      '/projects/a1b2c3d4e5f6/export',
      '/projects/a1b2c3d4e5f6/results',
    ]);
  });

  it('lists the tabs in the order Review, Export, Results', () => {
    expect(PROJECT_TABS.map((tab) => tab.label)).toEqual(['Review', 'Export', 'Results']);
  });
});

describe('hasTabs', () => {
  it.each(['ready', 'exported'] as const)('shows the tabs of a %s project', (status) => {
    expect(hasTabs(describeProject(status))).toBe(true);
  });

  it.each(['uploading', 'queued', 'processing', 'failed', 'stopped', 'fetched'] as const)(
    'shows the status screen of a %s project',
    (status) => {
      expect(hasTabs(describeProject(status))).toBe(false);
    },
  );
});
