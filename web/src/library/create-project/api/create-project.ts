import { requestJson } from '@/shared/lib/request-json';

import type { Project } from '../../library.types';
import type { Draft } from '../lib/create-draft';

export function createProject(draft: Draft): Promise<Project> {
  const isLink = draft.sourceKind === 'link';
  return requestJson<Project>('/projects', {
    method: 'POST',
    json: {
      sourceKind: draft.sourceKind,
      link: isLink ? draft.link.trim() : '',
      fileName: isLink ? '' : (draft.file?.name ?? ''),
      fileSizeBytes: isLink ? 0 : (draft.file?.size ?? 0),
      clipLength: draft.length,
      platforms: draft.platforms,
      brief: draft.brief,
    },
  });
}
