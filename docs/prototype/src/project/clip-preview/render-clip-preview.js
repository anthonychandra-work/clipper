import { escapeHtml } from '../../escape-html.js';
import { renderIcon } from '../../controls/index.js';
import { findOpenProject } from '../../library/index.js';
import { selectedClip } from '../clip-review.js';
import { clipRange } from '../clip-timing.js';

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

const PLAY_SURFACE = `
  <button type="button" class="player__surface" data-action="toggle-playback" tabindex="-1"
    aria-hidden="true"></button>
  <span class="player__dim"></span>`;

const SOURCE_DELETED_PREVIEW = `
  <section class="preview preview--gone" aria-label="Clip preview">
    <div class="player player--gone">
      ${renderIcon('film')}
      <p>Preview unavailable. The source video was deleted to free space.</p>
    </div>
  </section>`;

export function renderClipPreview(state) {
  if (findOpenProject(state).isSourceDeleted) return SOURCE_DELETED_PREVIEW;
  const clip = selectedClip(state);
  const { duration } = clipRange(clip, state.reviews[clip.id]);
  return `
    <section class="preview" aria-label="Clip preview">
      <div class="player-shell${state.playback.isPlaying ? ' is-playing' : ''}">
        ${renderPicture(clip, state.look)}
        ${renderTransport(state.playback, duration)}
      </div>
    </section>`;
}

function renderPicture(clip, look) {
  const hook = `<p class="player__hook" id="preview-hook">${escapeHtml(clip.hookTitle)}</p>`;
  return `
    <div class="player player--${look.layout}">
      ${SCENES[look.layout]}
      ${look.showSafeZones ? SAFE_ZONES : ''}
      ${look.showHookTitle ? hook : ''}
      <p class="player__caption caption--${look.captions}" id="preview-caption"></p>
      ${PLAY_SURFACE}
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
    <div class="player__controls">
      <button type="button" class="player__play" id="preview-play" data-action="toggle-playback"
        aria-label="${playback.isPlaying ? 'Pause' : 'Play'}">${renderIcon(playback.isPlaying ? 'pause' : 'play')}</button>
      <input type="range" class="slider" id="preview-scrubber" min="0" max="${duration.toFixed(1)}" step="0.1"
        value="${playback.seconds.toFixed(1)}" data-input="seek" aria-label="Position in clip">
      <span class="player__clock numeric" id="preview-clock"></span>
    </div>`;
}
