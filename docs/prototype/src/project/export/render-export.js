import { escapeHtml } from '../../escape-html.js';
import { formatDuration } from '../../format-timecode.js';
import { keptClips, rankOf } from '../clip-review.js';
import { clipRange } from '../clip-timing.js';
import { describeLook } from '../clip-preview/index.js';
import { isRendering } from './simulate-render.js';

const PLATFORM_TEXTS = [
  { platform: 'tiktok', label: 'TikTok description' },
  { platform: 'reels', label: 'Reels caption' },
  { platform: 'shorts', label: 'Shorts title' },
];

export function renderExport(state) {
  const kept = keptClips(state);
  if (kept.length === 0) {
    return '<p class="empty panel">Keep at least one clip on the Review tab, then export it here.</p>';
  }
  return `
    <div class="export">
      <section class="panel export__summary">
        <h2 class="label">Output</h2>
        <p>${describeLook(state.look)}</p>
        <p class="hint">1080 × 1920, 30 fps, H.264 MP4. Change the look on the Review tab.</p>
        <button type="button" class="button button--primary" id="render-kept" data-action="render-kept"
          ${isRendering(state) ? 'disabled' : ''}>Render ${kept.length} kept ${kept.length === 1 ? 'clip' : 'clips'}</button>
      </section>
      <ol class="export-list">${kept.map((clip) => renderExportRow(clip, state)).join('')}</ol>
    </div>`;
}

function renderExportRow(clip, state) {
  const review = state.reviews[clip.id];
  const rank = String(rankOf(clip, state.clips)).padStart(2, '0');
  const texts = PLATFORM_TEXTS.map((text) => renderPlatformText(clip, text)).join('');
  return `
    <li class="panel export-row">
      <div class="export-row__head">
        <h3>${escapeHtml(review.title)}</h3>
        <p class="timecode export-row__path">
          exports/${rank}-${clip.id}.mp4 · ${formatDuration(clipRange(clip, review).duration)}
        </p>
        <div class="export-row__status">${renderJobStatus(clip, state.renderJobs[clip.id])}</div>
      </div>
      <dl class="copy-list">${texts}</dl>
    </li>`;
}

function renderJobStatus(clip, job) {
  if (!job) return '<span class="pill">Not rendered</span>';
  if (job.percent < 100) {
    return `<span class="meter"><span id="render-bar-${clip.id}" style="width:${job.percent}%"></span></span>`;
  }
  return '<button type="button" class="button button--small" data-action="download-clip">Download MP4</button>';
}

function renderPlatformText(clip, text) {
  return `
    <div class="copy-item">
      <dt class="label">${text.label}</dt>
      <dd>${escapeHtml(clip.copy[text.platform])}</dd>
      <button type="button" class="button button--small" data-action="copy-platform-text"
        data-clip-id="${clip.id}" data-platform="${text.platform}">Copy</button>
    </div>`;
}
