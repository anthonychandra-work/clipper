import { escapeHtml } from '../../escape-html.js';
import { renderSegmented } from '../../render-segmented.js';
import { selectedClip } from '../clip-review.js';
import { clipRange } from '../clip-timing.js';

const CAPTION_STYLES = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'pop', label: 'Word by word' },
  { value: 'clean', label: 'Plain' },
];

const LAYOUTS = [
  { value: 'follow', label: 'Follow speaker' },
  { value: 'stacked', label: 'Stack two' },
  { value: 'fit', label: 'Whole frame' },
];

const LOOK_TOGGLES = [
  { option: 'showHookTitle', label: 'Hook title' },
  { option: 'showSafeZones', label: 'Platform safe zones' },
];

const SCENES = {
  follow: `<div class="scene">${renderFigure('guest')}</div>`,
  stacked: `
    <div class="scene">
      <div class="scene__half scene__half--top">${renderFigure('host')}</div>
      <div class="scene__half scene__half--bottom">${renderFigure('guest')}</div>
    </div>`,
  fit: `
    <div class="scene">
      <div class="scene__wide">${renderFigure('host')}${renderFigure('guest')}</div>
    </div>`,
};

const SAFE_ZONES = `
  <span class="safe-zone safe-zone--rail">Platform buttons</span>
  <span class="safe-zone safe-zone--footer">Caption and sound</span>`;

export function renderClipPreview(state) {
  const clip = selectedClip(state);
  const { duration } = clipRange(clip, state.reviews[clip.id]);
  return `
    <section class="preview" aria-label="Clip preview">
      ${renderPhone(clip, state.look)}
      ${renderTransport(state.playback, duration)}
      ${renderLookControls(state.look)}
    </section>`;
}

function renderPhone(clip, look) {
  const hook = `<p class="phone__hook" id="preview-hook">${escapeHtml(clip.hookTitle)}</p>`;
  return `
    <div class="phone phone--${look.layout}">
      ${SCENES[look.layout]}
      ${look.showSafeZones ? SAFE_ZONES : ''}
      ${look.showHookTitle ? hook : ''}
      <p class="phone__caption caption--${look.captions}" id="preview-caption"></p>
    </div>`;
}

function renderFigure(role) {
  return `
    <span class="figure figure--${role}">
      <span class="figure__head"></span>
      <span class="figure__body"></span>
    </span>`;
}

function renderTransport(playback, duration) {
  return `
    <div class="transport">
      <button type="button" class="button button--primary" id="preview-play" data-action="toggle-playback">
        ${playback.isPlaying ? 'Pause' : 'Play'}
      </button>
      <input type="range" class="transport__scrubber" id="preview-scrubber" min="0"
        max="${duration.toFixed(1)}" step="0.1" value="${playback.seconds.toFixed(1)}"
        data-input="seek" aria-label="Position in clip">
      <span class="timecode" id="preview-clock"></span>
    </div>`;
}

function renderLookControls(look) {
  return `
    <div class="look">
      <span class="label">Captions</span>
      ${renderSegmented({ label: 'Caption style', action: 'set-caption-style', selected: look.captions, options: CAPTION_STYLES })}
      <span class="label">Framing</span>
      ${renderSegmented({ label: 'Framing', action: 'set-layout', selected: look.layout, options: LAYOUTS })}
      <div class="look__toggles">${LOOK_TOGGLES.map((toggle) => renderLookToggle(toggle, look)).join('')}</div>
    </div>`;
}

function renderLookToggle(toggle, look) {
  return `
    <label class="check" for="look-${toggle.option}">
      <input type="checkbox" id="look-${toggle.option}" data-action="toggle-look"
        data-option="${toggle.option}" ${look[toggle.option] ? 'checked' : ''}>
      ${toggle.label}
    </label>`;
}

export function describeLook(look) {
  const captions = CAPTION_STYLES.find((style) => style.value === look.captions).label;
  const layout = LAYOUTS.find((option) => option.value === look.layout).label;
  const hook = look.showHookTitle ? 'hook title on' : 'hook title off';
  return `Captions: ${captions}. Framing: ${layout}. ${hook[0].toUpperCase()}${hook.slice(1)}.`;
}
