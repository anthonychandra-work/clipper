import { escapeHtml } from '../escape-html.js';
import { renderSegmented, renderSwitch } from '../controls/index.js';
import { markInvalid, renderDraftProblem } from './render-draft-problem.js';

const SOURCE_KINDS = [
  { value: 'link', label: 'YouTube Link' },
  { value: 'file', label: 'Upload a File' },
];

export const CLIP_LENGTHS = [
  { value: 'short', label: '15–30 s', hint: 'One line or one reaction. Easiest to watch to the end.' },
  { value: 'standard', label: '25–60 s', hint: 'One point with its setup and payoff.' },
  { value: 'long', label: '60–180 s', hint: 'A full story or argument. Long enough for TikTok payouts.' },
];

const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reels', label: 'Reels' },
  { value: 'shorts', label: 'Shorts' },
];

const SHEET_BAR = `
  <header class="sheet__bar">
    <div class="sheet__grabber" data-drag="dismiss-sheet" aria-hidden="true"><span></span></div>
    <button type="button" class="bar-button" id="sheet-cancel" data-action="close-sheet">Cancel</button>
    <h2 class="sheet__title" id="sheet-title">New Project</h2>
    <button type="submit" class="bar-button bar-button--tinted" id="sheet-confirm">Find Clips</button>
  </header>`;

export function renderNewProjectSheet(state) {
  const draft = state.draft;
  return `
    <form class="sheet__form" data-submit="submit-project" novalidate>
      ${SHEET_BAR}
      <div class="sheet__body">
        ${renderSource(draft)}
        ${renderLength(draft)}
        ${renderPlatforms(draft)}
        ${renderBrief(draft)}
      </div>
    </form>`;
}

export function describeChosenFile(fileName) {
  return fileName ? `Chosen: ${fileName}` : 'MP4, MOV or MKV.';
}

function renderSource(draft) {
  const kind = renderSegmented({
    name: 'source', label: 'Source', action: 'set-source-kind', selected: draft.sourceKind, options: SOURCE_KINDS,
  });
  return `
    <section class="group-section">
      <h3 class="list-header">Source</h3>
      ${kind}
      ${draft.sourceKind === 'link' ? renderLinkField(draft) : renderFileField(draft)}
      ${renderDraftProblem(draft, 'source')}
    </section>`;
}

function renderLinkField(draft) {
  return `
    <div class="group">
      <label class="row" for="draft-link">
        <span class="row__label">Video Link</span>
        <input class="row__field" id="draft-link" type="url" inputmode="url" data-input="edit-draft"
          data-field="link" value="${escapeHtml(draft.link)}" placeholder="https://www.youtube.com/watch?v=…"
          ${markInvalid(draft, 'source')}>
      </label>
    </div>`;
}

function renderFileField(draft) {
  return `
    <div class="group">
      <label class="row row--stack" for="draft-file">
        <span class="row__label">Video File</span>
        <input id="draft-file" type="file" accept="video/*" data-input="pick-file" ${markInvalid(draft, 'source')}>
      </label>
    </div>
    <p class="list-footer" id="draft-file-name">${escapeHtml(describeChosenFile(draft.fileName))}</p>`;
}

function renderLength(draft) {
  const length = renderSegmented({
    name: 'length', label: 'Clip length', action: 'set-length', selected: draft.length, options: CLIP_LENGTHS,
  });
  return `
    <section class="group-section">
      <h3 class="list-header">Clip Length</h3>
      ${length}
      <p class="list-footer">${CLIP_LENGTHS.find((option) => option.value === draft.length).hint}</p>
    </section>`;
}

function renderPlatforms(draft) {
  const rows = PLATFORMS.map((platform) => renderPlatformRow(platform, draft)).join('');
  return `
    <section class="group-section">
      <h3 class="list-header">Platforms</h3>
      <div class="group divided" role="group" aria-label="Platforms" ${markInvalid(draft, 'platforms')}>${rows}</div>
      ${renderDraftProblem(draft, 'platforms')}
    </section>`;
}

function renderPlatformRow(platform, draft) {
  const toggle = renderSwitch({
    id: `platform-${platform.value}`,
    action: 'toggle-platform',
    value: platform.value,
    isOn: draft.platforms.includes(platform.value),
  });
  return `
    <label class="row" for="platform-${platform.value}">
      <span class="row__label">${platform.label}</span>
      ${toggle}
    </label>`;
}

function renderBrief(draft) {
  return `
    <section class="group-section">
      <label class="list-header" for="draft-brief">What to Look For (Optional)</label>
      <div class="group">
        <textarea class="text-area" id="draft-brief" rows="3" data-input="edit-draft" data-field="brief"
          placeholder="Pricing advice and strong opinions. Skip the sponsor read.">${escapeHtml(draft.brief)}</textarea>
      </div>
    </section>`;
}
