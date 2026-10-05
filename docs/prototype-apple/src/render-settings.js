import { state } from './app-state.js';
import { copyText } from './copy-text.js';
import { escapeHtml } from './escape-html.js';
import { renderIcon, renderPage, renderProgress } from './controls/index.js';
import { CLIP_LENGTHS } from './library/index.js';
import { REJECT_REASONS } from './project/index.js';
import { showToast } from './show-toast.js';

const CLAUDE_MODELS = ['Claude Fable 5.1', 'Claude Opus 5.5', 'Claude Sonnet 5.5', 'Claude Haiku 4.5'];

const SELECTS = {
  scoringModel: { label: 'Scoring Model', options: CLAUDE_MODELS },
  cuttingModel: { label: 'Cutting Model', options: CLAUDE_MODELS },
  whisperModel: { label: 'Transcription Model', options: ['Whisper large-v3-turbo', 'Whisper medium', 'Whisper small'] },
  defaultLength: { label: 'Clip Length', options: CLIP_LENGTHS.map((length) => length.label) },
  clipsPerVideo: { label: 'Clips per Video', options: ['Auto', '4', '8', '12'] },
  sourceRetention: { label: 'Delete Source Videos After', options: ['3 days', '7 days', '30 days', 'Never'] },
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

export function renderSettingsScreen(current) {
  const settings = current.settings;
  return {
    key: 'settings',
    depth: 0,
    title: 'Settings',
    hasLargeTitle: true,
    body: renderPage('settings', `
      ${renderAiServices(settings)}
      ${renderDefaults(settings)}
      ${renderStorage(settings)}
      ${renderPhoneAccess(settings)}
      ${renderSelectorMemory(current)}`),
  };
}

function renderAiServices(settings) {
  return `
    <section class="group-section">
      <h2 class="list-header">AI Services</h2>
      <div class="group divided">
        <label class="row" for="setting-apiKey">
          <span class="row__label">Anthropic API Key</span>
          <input class="row__field" id="setting-apiKey" type="password" autocomplete="off" placeholder="sk-ant-…"
            value="${escapeHtml(settings.apiKey)}" data-input="edit-setting" data-field="apiKey">
        </label>
        ${renderSelectRow('scoringModel', settings)}
        ${renderSelectRow('cuttingModel', settings)}
        ${renderSelectRow('whisperModel', settings)}
      </div>
      <p class="list-footer">
        The key is stored on this Mac. Claude reads the transcript to score windows and cut clips; the video
        stays here. Transcription runs on this Mac. No audio is uploaded.
      </p>
    </section>`;
}

function renderDefaults(settings) {
  return `
    <section class="group-section">
      <h2 class="list-header">Defaults for New Projects</h2>
      <div class="group divided">
        ${renderSelectRow('defaultLength', settings)}
        ${renderSelectRow('clipsPerVideo', settings)}
      </div>
    </section>`;
}

function renderSelectRow(field, settings) {
  const options = SELECTS[field].options.map((option) => `
    <option ${option === settings[field] ? 'selected' : ''}>${escapeHtml(option)}</option>`);
  return `
    <label class="row" for="setting-${field}">
      <span class="row__label">${SELECTS[field].label}</span>
      <span class="menu-button">
        <select id="setting-${field}" data-input="edit-setting" data-field="${field}">${options.join('')}</select>
        ${renderIcon('chevron-up-down')}
      </span>
    </label>`;
}

function renderStorage(settings) {
  const usedPercent = ((settings.totalDiskGb - settings.freeDiskGb) / settings.totalDiskGb) * 100;
  return `
    <section class="group-section">
      <h2 class="list-header">Storage</h2>
      <div class="group divided">
        <div class="storage">
          <p><span class="numeric">${settings.freeDiskGb} GB</span> free of ${settings.totalDiskGb} GB on this Mac</p>
          ${renderProgress({ name: 'disk', percent: usedPercent, label: 'Disk space used' })}
        </div>
        ${renderSelectRow('sourceRetention', settings)}
      </div>
      <p class="list-footer">Exported clips stay until you delete them.</p>
    </section>`;
}

function renderPhoneAccess(settings) {
  return `
    <section class="group-section">
      <h2 class="list-header">Open on Your Phone</h2>
      <div class="group">
        <div class="row">
          <span class="address">${escapeHtml(settings.phoneAddress)}</span>
          <button type="button" class="button" id="copy-phone-address" data-action="copy-phone-address">Copy</button>
        </div>
      </div>
      <p class="list-footer">The phone and this Mac must be on the same Wi-Fi.</p>
    </section>`;
}

function renderSelectorMemory(current) {
  const reasons = Object.values(current.reviews).map((review) => review.rejectReason);
  const rows = REJECT_REASONS.map((reason) => `
    <li class="row">
      <span class="row__label">${reason.label}</span>
      <span class="memory-count numeric">${reasons.filter((given) => given === reason.value).length}</span>
    </li>`);
  return `
    <section class="group-section">
      <h2 class="list-header">What the Selector Has Learned</h2>
      <ul class="group divided">
        ${rows.join('')}
        <li>
          <button type="button" class="row__action row__action--destructive" id="forget-preferences"
            data-action="forget-preferences">Forget All of It</button>
        </li>
      </ul>
      <p class="list-footer">Rejections you gave a reason for. They steer the picks on your next video.</p>
    </section>`;
}
