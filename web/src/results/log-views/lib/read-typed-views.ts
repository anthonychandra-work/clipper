export function readTypedViews(typed: string): number | null {
  const whole = Math.trunc(Number(typed.trim()));
  return Number.isFinite(whole) && whole > 0 ? whole : null;
}
