import { state, update } from '../app-state.js';
import { escapeHtml } from '../escape-html.js';
import { showToast } from '../show-toast.js';

const SHOWN_ENDING_LENGTH = 4;

export const apiKeyActions = {
  'save-api-key': () => saveApiKey(),
  'remove-api-key': () => removeApiKey(),
};

export function renderApiKeyRow(settings) {
  return settings.hasApiKey ? renderSavedKey(settings) : renderKeyField(settings);
}

function renderSavedKey(settings) {
  return `
    <div class="row">
      <span class="row__label">Anthropic API Key</span>
      <span class="row__value numeric">Saved · ends in ${escapeHtml(settings.apiKeyEnding)}</span>
      <button type="button" class="button button--destructive" id="remove-api-key"
        data-action="remove-api-key">Remove</button>
    </div>`;
}

function renderKeyField(settings) {
  return `
    <div class="row">
      <label class="row__label" for="setting-apiKey">Anthropic API Key</label>
      <input class="row__field" id="setting-apiKey" type="password" autocomplete="off" placeholder="sk-ant-…"
        value="${escapeHtml(settings.apiKey)}" data-input="edit-setting" data-field="apiKey">
      <button type="button" class="button" id="save-api-key" data-action="save-api-key">Save</button>
    </div>`;
}

function saveApiKey() {
  const key = state.settings.apiKey.trim();
  if (!key) return showToast('Paste the key first.');
  update((current) => {
    current.settings.hasApiKey = true;
    current.settings.apiKeyEnding = key.slice(-SHOWN_ENDING_LENGTH);
    current.settings.apiKey = '';
  });
  showToast('Key saved on this Mac');
}

function removeApiKey() {
  update((current) => {
    current.settings.hasApiKey = false;
  });
  showToast('Key removed');
}
