import { state } from './app-state.js';
import { copyText } from './copy-text.js';
import { escapeHtml } from './escape-html.js';
import { CLIP_LENGTHS } from './library/index.js';
import { REJECT_REASONS } from './project/index.js';
import { showToast } from './show-toast.js';

const CLAUDE_MODELS = ['Claude Fable 5.1', 'Claude Opus 5.5', 'Claude Sonnet 5.5', 'Claude Haiku 4.5'];

const SELECTS = {
  scoringModel: { label: 'Model for scoring windows', options: CLAUDE_MODELS },
  cuttingModel: { label: 'Model for cutting clips', options: CLAUDE_MODELS },
  whisperModel: { label: 'Transcription model', options: ['Whisper large-v3-turbo', 'Whisper medium', 'Whisper small'] },
  defaultLength: { label: 'Clip length', options: CLIP_LENGTHS.map((length) => length.label) },
  clipsPerVideo: { label: 'Clips per video', options: ['Auto', '4', '8', '12'] },
  sourceRetention: { label: 'Delete source videos after', options: ['3 days', '7 days', '30 days', 'Never'] },
};

export const settingsActions = {
  'copy-phone-address': () => copyText(state.settings.phoneAddress),
  'forget-preferences': () => showToast('The real app clears what the selector has learned.'),
};

export const settingsInputs = {
  'edit-setting': (field) => {
    state.settings[field.dataset.field] = field.value;
  },
};

export function createSettingsState() {
  return {
    apiKey: '',
    scoringModel: 'Claude Sonnet 5.5',
    cuttingModel: 'Claude Opus 5.5',
    whisperModel: 'Whisper large-v3-turbo',
    defaultLength: '25–60 s',
    clipsPerVideo: 'Auto',
    sourceRetention: '7 days',
    freeDiskGb: 29,
    totalDiskGb: 460,
    phoneAddress: 'http://192.168.1.24:3000',
  };
}

export function renderSettings(current) {
  const settings = current.settings;
  return `
    <div class="settings">
      <section class="panel settings__group">
        <h1 class="section-title">AI services</h1>
        <label class="field" for="setting-apiKey">
          <span class="label">Anthropic API key</span>
          <input id="setting-apiKey" type="password" autocomplete="off" placeholder="sk-ant-…"
            value="${escapeHtml(settings.apiKey)}" data-input="edit-setting" data-field="apiKey">
        </label>
        <p class="hint">Stored on this Mac. Claude reads the transcript to pick clips; the video stays here.</p>
        ${renderSelect('scoringModel', settings)}
        ${renderSelect('cuttingModel', settings)}
        ${renderSelect('whisperModel', settings)}
        <p class="hint">Transcription runs on this Mac. No audio is uploaded.</p>
      </section>
      <section class="panel settings__group">
        <h2 class="section-title">Defaults for new projects</h2>
        ${renderSelect('defaultLength', settings)}
        ${renderSelect('clipsPerVideo', settings)}
      </section>
      ${renderStorage(settings)}
      ${renderPhoneAccess(settings)}
      ${renderSelectorMemory(current)}
    </div>`;
}

function renderSelect(field, settings) {
  const options = SELECTS[field].options.map((option) => `
    <option ${option === settings[field] ? 'selected' : ''}>${escapeHtml(option)}</option>`);
  return `
    <label class="field" for="setting-${field}">
      <span class="label">${SELECTS[field].label}</span>
      <select id="setting-${field}" data-input="edit-setting" data-field="${field}">${options.join('')}</select>
    </label>`;
}

function renderStorage(settings) {
  const usedPercent = ((settings.totalDiskGb - settings.freeDiskGb) / settings.totalDiskGb) * 100;
  return `
    <section class="panel settings__group">
      <h2 class="section-title">Storage</h2>
      <p><span class="timecode">${settings.freeDiskGb} GB</span> free of ${settings.totalDiskGb} GB on this Mac.</p>
      <span class="meter"><span style="width:${usedPercent.toFixed(0)}%"></span></span>
      ${renderSelect('sourceRetention', settings)}
      <p class="hint">Exported clips stay until you delete them.</p>
    </section>`;
}

function renderPhoneAccess(settings) {
  return `
    <section class="panel settings__group">
      <h2 class="section-title">Open on your phone</h2>
      <div class="settings__row">
        <span class="timecode settings__address">${escapeHtml(settings.phoneAddress)}</span>
        <button type="button" class="button button--small" data-action="copy-phone-address">Copy</button>
      </div>
      <p class="hint">The phone and this Mac must be on the same Wi-Fi.</p>
    </section>`;
}

function renderSelectorMemory(current) {
  const reasons = Object.values(current.reviews).map((review) => review.rejectReason);
  const rows = REJECT_REASONS.map((reason) => `
    <li>
      <span>${reason.label}</span>
      <span class="timecode">${reasons.filter((given) => given === reason.value).length}</span>
    </li>`);
  return `
    <section class="panel settings__group">
      <h2 class="section-title">What the selector has learned</h2>
      <p class="hint">Rejections you gave a reason for. They steer the picks on your next video.</p>
      <ul class="memory-list">${rows.join('')}</ul>
      <button type="button" class="button button--small" data-action="forget-preferences">Forget all of it</button>
    </section>`;
}
