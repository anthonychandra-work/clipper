import { formatDuration } from '../../format-timecode.js';
import { DURATION_BAND, rateDuration } from '../clip-timing.js';

const BAND_SCALE_SECONDS = 75;

const DURATION_NOTES = {
  short: `shorter than the ${DURATION_BAND.min} s minimum`,
  allowed: `inside the ${DURATION_BAND.min}–${DURATION_BAND.max} s limits`,
  ideal: `inside the preferred ${DURATION_BAND.idealMin}–${DURATION_BAND.idealMax} s band`,
  long: `longer than the ${DURATION_BAND.max} s maximum`,
};

export function renderDurationBand(duration) {
  const rating = rateDuration(duration);
  const ticks = Object.values(DURATION_BAND).map(renderTick).join('');
  return `
    <div class="band band--${rating}">
      <p class="band__reading"><span class="numeric">${formatDuration(duration)}</span>, ${DURATION_NOTES[rating]}.</p>
      <div class="band__track" role="img" aria-label="Clip length against the allowed and preferred bands">
        <span class="band__allowed" style="${spanStyle(DURATION_BAND.min, DURATION_BAND.max)}"></span>
        <span class="band__ideal" style="${spanStyle(DURATION_BAND.idealMin, DURATION_BAND.idealMax)}"></span>
        <span class="band__now" style="left:${toPercent(Math.min(duration, BAND_SCALE_SECONDS))}%"></span>
      </div>
      <div class="band__ticks numeric" aria-hidden="true">${ticks}</div>
    </div>`;
}

function spanStyle(fromSeconds, toSeconds) {
  return `left:${toPercent(fromSeconds)}%;width:${toPercent(toSeconds - fromSeconds)}%`;
}

function toPercent(seconds) {
  return ((seconds / BAND_SCALE_SECONDS) * 100).toFixed(2);
}

function renderTick(seconds) {
  return `<span class="band__tick" style="left:${toPercent(seconds)}%">${seconds}</span>`;
}
