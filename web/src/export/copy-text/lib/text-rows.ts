import type { ExportClip, Platform } from '../../export.types';

export interface TextRow {
  id: string;
  label: string;
  text: string;
}

const LABELS: Record<Platform, { title: string; description: string }> = {
  tiktok: { title: 'TikTok title', description: 'TikTok description' },
  reels: { title: 'Reels title', description: 'Reels caption' },
  shorts: { title: 'Shorts title', description: 'Shorts description' },
};

export function listTextRows(clip: ExportClip): TextRow[] {
  return clip.texts.flatMap((written) => [
    { id: `copy-${clip.id}-${written.platform}-title`, label: LABELS[written.platform].title, text: written.title },
    {
      id: `copy-${clip.id}-${written.platform}-description`,
      label: LABELS[written.platform].description,
      text: written.description,
    },
  ]);
}
