import { escapeHtml } from '../../escape-html.js';
import { formatDuration } from '../../format-timecode.js';
import { renderIcon, renderPage, renderProgress } from '../../controls/index.js';
import { keptClips, rankOf } from '../clip-review.js';
import { clipRange } from '../clip-timing.js';
import { describeLook } from '../clip-preview/index.js';
import { findRenderingClip, isRendering } from './simulate-render.js';

const PLATFORM_TEXTS = [
  { platform: 'tiktok', label: 'TikTok description' },
  { platform: 'reels', label: 'Reels caption' },
  { platform: 'shorts', label: 'Shorts title' },
];

const NO_KEPT_CLIPS = `
  <div class="empty">
    ${renderIcon('film')}
    <h2 class="empty__title">No Kept Clips</h2>
    <p>Keep at least one clip on the Review tab, then export it here.</p>
    <button type="button" class="button" id="export-go-review" data-action="set-tab" data-value="review">
      Go to Review
    </button>
  </div>`;

export function renderExport(state) {
  const kept = keptClips(state);
  if (kept.length === 0) return { body: renderPage('export', NO_KEPT_CLIPS) };
  const rows = kept.map((clip) => renderExportClip(clip, state)).join('');
  return {
    actions: renderRenderButton(kept.length, isRendering(state)),
    body: renderPage('export', `${renderOutput(state.look)}<ol class="export-list">${rows}</ol>`),
  };
}

function renderRenderButton(keptCount, isBusy) {
  const label = isBusy
    ? '<span class="spinner" aria-hidden="true"></span>Rendering…'
    : `Render ${keptCount} ${keptCount === 1 ? 'Clip' : 'Clips'}`;
  return `
    <button type="button" class="bar-button bar-button--tinted" id="render-kept" data-action="render-kept"
      ${isBusy ? 'disabled' : ''}>${label}</button>`;
}

function renderOutput(look) {
  return `
    <section class="group-section">
      <h2 class="list-header">Output</h2>
      <dl class="group divided">
        <div class="row"><dt class="row__label">Look</dt><dd class="row__value">${describeLook(look)}</dd></div>
        <div class="row"><dt class="row__label">Format</dt><dd class="row__value">1080 × 1920, 30 fps, H.264 MP4</dd></div>
      </dl>
      <p class="list-footer">Change the look on the Review tab.</p>
    </section>`;
}

function renderExportClip(clip, state) {
  const review = state.reviews[clip.id];
  const rank = String(rankOf(clip, state.clips)).padStart(2, '0');
  const texts = PLATFORM_TEXTS.map((text) => renderPlatformText(clip, text, review.title)).join('');
  return `
    <li class="group divided">
      <div class="export-clip__head">
        <div>
          <h3 class="export-clip__title">${escapeHtml(review.title)}</h3>
          <p class="export-clip__path">exports/${rank}-${clip.id}.mp4 · ${formatDuration(clipRange(clip, review).duration)}</p>
        </div>
        <div class="export-clip__status">${renderJobStatus(clip, state)}</div>
      </div>
      <dl class="divided">${texts}</dl>
    </li>`;
}

function renderDownloadButton(clip, state) {
  const title = escapeHtml(state.reviews[clip.id].title);
  return `
    <button type="button" class="button" id="download-${clip.id}" data-action="download-clip"
      aria-label="Download MP4 of ${title}">${renderIcon('download')}Download MP4</button>`;
}

function renderJobStatus(clip, state) {
  const job = state.renderJobs[clip.id];
  if (!job) return '<span>Not rendered</span>';
  if (job.percent === 100) return renderDownloadButton(clip, state);
  const stage = findRenderingClip(state) === clip ? 'Rendering' : 'Waiting';
  return `${renderProgress({ name: `render-${clip.id}`, percent: job.percent, label: stage })}<span>${stage}</span>`;
}

function renderPlatformText(clip, text, clipTitle) {
  return `
    <div class="copy-row">
      <dt>${text.label}</dt>
      <dd>
        <span class="copy-row__text">${escapeHtml(clip.copy[text.platform])}</span>
        <button type="button" class="button" id="copy-${clip.id}-${text.platform}" data-action="copy-platform-text"
          data-clip-id="${clip.id}" data-platform="${text.platform}"
          aria-label="Copy ${text.label} for ${escapeHtml(clipTitle)}">Copy</button>
      </dd>
    </div>`;
}
