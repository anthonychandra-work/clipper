const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

export function formatTimecode(totalSeconds) {
  const hours = totalSeconds / SECONDS_PER_HOUR;
  const minutes = (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE;
  return `${padTwo(hours)}:${padTwo(minutes)}:${padTwo(totalSeconds % SECONDS_PER_MINUTE)}`;
}

export function formatPreciseTimecode(totalSeconds) {
  const tenths = Math.floor((totalSeconds % 1) * 10);
  return `${formatTimecode(totalSeconds)}.${tenths}`;
}

export function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  return `${minutes}:${padTwo(totalSeconds % SECONDS_PER_MINUTE)}`;
}

export function formatDuration(seconds) {
  return `${seconds.toFixed(1)} s`;
}

export function formatLength(totalSeconds) {
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.round((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

function padTwo(value) {
  return String(Math.floor(value)).padStart(2, '0');
}
