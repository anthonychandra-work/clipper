import type { Project, ProjectStatus } from '@/library';

export type ProjectTab = 'review' | 'export' | 'results';

export const PROJECT_TABS: readonly { value: ProjectTab; label: string }[] = [
  { value: 'review', label: 'Review' },
  { value: 'export', label: 'Export' },
  { value: 'results', label: 'Results' },
];

const STATUSES_WITH_TABS: readonly ProjectStatus[] = ['ready', 'exported'];

export function projectAddress(projectId: string): string {
  return `/projects/${projectId}`;
}

export function tabAddress(projectId: string, tab: ProjectTab): string {
  return `${projectAddress(projectId)}/${tab}`;
}

export function hasTabs(project: Project): boolean {
  return STATUSES_WITH_TABS.includes(project.status);
}
