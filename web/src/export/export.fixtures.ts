import type { ClipRender, ExportClip, ExportLook, PlatformText, ProjectExport } from './export.types';

export const STARTING_LOOK: ExportLook = {
  captionStyle: 'keyword',
  framing: 'follow-speaker',
  showHookTitle: true,
};

export const NOT_RENDERED: ClipRender = { state: 'none', percent: 0, reason: null };

const TALK_TEXTS: PlatformText[] = [
  { platform: 'tiktok', title: 'The oven broke', description: 'What a bad morning taught a baker. #bakery' },
  { platform: 'reels', title: 'Nobody left angry', description: 'Customers forgive bad news. #smallbusiness' },
  { platform: 'shorts', title: 'The worst day my bakery had', description: 'Tell them the truth.' },
];

export function describeFirstClip(changes: Partial<ExportClip> = {}): ExportClip {
  return {
    id: 'c01',
    rank: 1,
    title: 'The worst day my bakery ever had',
    seconds: 32.76,
    file: 'exports/01-c01.mp4',
    render: NOT_RENDERED,
    download: null,
    texts: TALK_TEXTS,
    ...changes,
  };
}

export function describeSecondClip(changes: Partial<ExportClip> = {}): ExportClip {
  return {
    id: 'c02',
    rank: 2,
    title: 'Hire for the habits you cannot teach',
    seconds: 33.18,
    file: 'exports/02-c02.mp4',
    render: NOT_RENDERED,
    download: null,
    texts: TALK_TEXTS,
    ...changes,
  };
}

export function describeTalkExport(changes: Partial<ProjectExport> = {}): ProjectExport {
  return {
    look: STARTING_LOOK,
    hasSource: true,
    platforms: ['tiktok', 'reels', 'shorts'],
    clips: [describeFirstClip(), describeSecondClip()],
    ...changes,
  };
}
