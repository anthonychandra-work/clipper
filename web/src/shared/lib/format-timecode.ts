const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

export function formatTimecode(totalSeconds: number): string {
  const hours = totalSeconds / SECONDS_PER_HOUR;
  const minutes = (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE;
  return `${padTwo(hours)}:${padTwo(minutes)}:${padTwo(totalSeconds % SECONDS_PER_MINUTE)}`;
}

function padTwo(value: number): string {
  return String(Math.floor(value)).padStart(2, '0');
}
