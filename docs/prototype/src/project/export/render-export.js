import { escapeHtml } from '../../escape-html.js';
import { formatDuration } from '../../format-timecode.js';
import { renderIcon, renderPage, renderProgress } from '../../controls/index.js';
import { findOpenProject } from '../../library/index.js';
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

const SOURCE_DELETED_NOTICE = `
  <div class="group flag" role="note">
    ${renderIcon('warning')}
    <p class="flag__message">
      The source video was deleted to free space. Finished exports are still here.
      New clips cannot be rendered.
    </p>
  </div>`;

const CANCEL_BUTTON = `
  <button type="button" class="bar-button" id="cancel-render" data-action="cancel-render">Cancel</button>`;

export function renderExport(state) {
  const kept = keptClips(state);
  if (kept.length === 0) return { body: renderPage('export', NO_KEPT_CLIPS) };
  const isSourceDeleted = Boolean(findOpenProject(state).isSourceDeleted);
  const rows = kept.map((clip) => renderExportClip(clip, state, isSourceDeleted)).join('');
  return {
    actions: renderToolbarActions({ keptCount: kept.length, isBusy: isRendering(state), isSourceDeleted }),
    body: renderPage('export', `
      ${isSourceDeleted ? SOURCE_DELETED_NOTICE : ''}
      ${renderOutput(state.look)}
      <ol class="export-list">${rows}</ol>`),
  };
}

function renderToolbarActions({ keptCount, isBusy, isSourceDeleted }) {
  const label = isBusy
    ? '<span class="spinner" aria-hidden="true"></span>Rendering…'
    : `Render ${keptCount} ${keptCount === 1 ? 'Clip' : 'Clips'}`;
  return `
    ${isBusy ? CANCEL_BUTTON : ''}
    <button type="button" class="bar-button bar-button--tinted" id="render-kept" data-action="render-kept"
      ${isBusy || isSourceDeleted ? 'disabled' : ''}>${label}</button>`;
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

function renderExportClip(clip, state, isSourceDeleted) {
  const review = state.reviews[clip.id];
  const rank = String(rankOf(clip, state.clips)).padStart(2, '0');
  const texts = PLATFORM_TEXTS.map((text) => renderPlatformText(clip, text, review.title)).join('');
  const status = isSourceDeleted ? renderDownloadButton(clip, review) : renderJobStatus(clip, state);
  return `
    <li class="group divided">
      <div class="export-clip__head">
        <div>
          <h3 class="export-clip__title">${escapeHtml(review.title)}</h3>
          <p class="export-clip__path">exports/${rank}-${clip.id}.mp4 · ${formatDuration(clipRange(clip, review).duration)}</p>
        </div>
        <div class="export-clip__status">${status}</div>
      </div>
      <dl class="divided">${texts}</dl>
    </li>`;
}

function renderDownloadButton(clip, review) {
  return `
    <button type="button" class="button" id="download-${clip.id}" data-action="download-clip"
      aria-label="Download MP4 of ${escapeHtml(review.title)}">${renderIcon('download')}Download MP4</button>`;
}

function renderJobStatus(clip, state) {
  const job = state.renderJobs[clip.id];
  if (!job) return '<span>Not rendered</span>';
  if (job.error) return renderJobError(clip, job);
  if (job.percent === 100) return renderDownloadButton(clip, state.reviews[clip.id]);
  const stage = findRenderingClip(state) === clip ? 'Rendering' : 'Waiting';
  return `${renderProgress({ name: `render-${clip.id}`, percent: job.percent, label: stage })}<span>${stage}</span>`;
}

function renderJobError(clip, job) {
  return `
    <span class="export-clip__error" role="alert">${renderIcon('warning')}${escapeHtml(job.error)}</span>
    <button type="button" class="button" id="retry-render-${clip.id}" data-action="retry-render"
      data-clip-id="${clip.id}">Retry</button>`;
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
