'use client';

import { showToast } from '@/shell';

import type { ExportClip } from '../../export.types';
import { copyText, describeBrowserPage } from '../lib/copy-text';
import { listTextRows } from '../lib/text-rows';

export function PlatformTexts({ clip }: { clip: ExportClip }) {
  const rows = listTextRows(clip);
  if (rows.length === 0) return null;
  return (
    <dl className="divided">
      {rows.map((row) => (
        <div className="copy-row" key={row.id}>
          <dt>{row.label}</dt>
          <dd>
            <span className="copy-row__text">{row.text}</span>
            <button
              type="button"
              className="button"
              id={row.id}
              aria-label={`Copy ${row.label} for ${clip.title}`}
              onClick={() => void copyAndTell(row.text)}
            >
              Copy
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}

async function copyAndTell(text: string): Promise<void> {
  showToast(await copyText(text, describeBrowserPage()));
}
