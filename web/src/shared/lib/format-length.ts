const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const LONGEST_SHOWN_IN_SECONDS = 59;

export function formatLength(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds);
  if (seconds <= LONGEST_SHOWN_IN_SECONDS) return `${seconds} s`;
  const totalMinutes = Math.round(totalSeconds / SECONDS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}
