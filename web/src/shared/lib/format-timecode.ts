const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const HUNDREDTHS_PER_SECOND = 100;
const HUNDREDTHS_PER_TENTH = 10;
const TENTHS_PER_SECOND = 10;

export function formatTimecode(totalSeconds: number): string {
  const hours = totalSeconds / SECONDS_PER_HOUR;
  const minutes = (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE;
  return `${padTwo(hours)}:${padTwo(minutes)}:${padTwo(totalSeconds % SECONDS_PER_MINUTE)}`;
}

export function formatPreciseTimecode(totalSeconds: number): string {
  const hundredths = Math.round(totalSeconds * HUNDREDTHS_PER_SECOND);
  const tenths = Math.floor(hundredths / HUNDREDTHS_PER_TENTH) % TENTHS_PER_SECOND;
  return `${formatTimecode(hundredths / HUNDREDTHS_PER_SECOND)}.${tenths}`;
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  return `${minutes}:${padTwo(totalSeconds % SECONDS_PER_MINUTE)}`;
}

export function formatDuration(seconds: number): string {
  return `${seconds.toFixed(1)} s`;
}

function padTwo(value: number): string {
  return String(Math.floor(value)).padStart(2, '0');
}
