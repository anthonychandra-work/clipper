import { escapeHtml } from '../escape-html.js';
import { renderSegmented } from '../render-segmented.js';

const SOURCE_KINDS = [
  { value: 'link', label: 'YouTube link' },
  { value: 'file', label: 'Upload a file' },
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

export function renderNewProjectForm(draft) {
  const lengthHint = CLIP_LENGTHS.find((length) => length.value === draft.length).hint;
  return `
    <h1 id="new-project-heading" class="section-title">New project</h1>
    <form class="stack" data-submit="submit-project" novalidate>
      ${renderSegmented({ label: 'Source', action: 'set-source-kind', selected: draft.sourceKind, options: SOURCE_KINDS })}
      ${draft.sourceKind === 'link' ? renderLinkField(draft) : renderFileField(draft)}
      <div class="field">
        <span class="label">Clip length</span>
        ${renderSegmented({ label: 'Clip length', action: 'set-length', selected: draft.length, options: CLIP_LENGTHS })}
        <p class="hint">${lengthHint}</p>
      </div>
      <div class="field">
        <span class="label">Platforms</span>
        <div class="platforms">${PLATFORMS.map((platform) => renderPlatformToggle(platform, draft)).join('')}</div>
      </div>
      <label class="field" for="draft-brief">
        <span class="label">What to look for (optional)</span>
        <textarea id="draft-brief" rows="2" data-input="edit-draft" data-field="brief"
          placeholder="Pricing advice and strong opinions. Skip the sponsor read.">${escapeHtml(draft.brief)}</textarea>
      </label>
      ${draft.error ? `<p class="form-error" role="alert">${escapeHtml(draft.error)}</p>` : ''}
      <button type="submit" class="button button--primary">Find clips</button>
    </form>`;
}

function renderLinkField(draft) {
  return `
    <label class="field" for="draft-link">
      <span class="label">Video link</span>
      <input id="draft-link" type="url" inputmode="url" data-input="edit-draft" data-field="link"
        value="${escapeHtml(draft.link)}" placeholder="https://www.youtube.com/watch?v=…">
    </label>`;
}

function renderFileField(draft) {
  return `
    <label class="field" for="draft-file">
      <span class="label">Video file</span>
      <input id="draft-file" type="file" accept="video/*" data-input="pick-file">
      <span class="hint" id="draft-file-name">${escapeHtml(describeChosenFile(draft.fileName))}</span>
    </label>`;
}

export function describeChosenFile(fileName) {
  return fileName ? `Chosen: ${fileName}` : 'MP4, MOV or MKV.';
}

function renderPlatformToggle(platform, draft) {
  return `
    <button type="button" class="platform-toggle" data-action="toggle-platform"
      data-platform="${platform.value}" aria-pressed="${draft.platforms.includes(platform.value)}">
      ${platform.label}
    </button>`;
}
