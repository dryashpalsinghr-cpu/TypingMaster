/** Saved session timestamps represent the end of the session. Split at local midnight. */
export function practiceSecondsToday(endMs: number, durationSec: number, now = new Date()): number {
  if (!Number.isFinite(endMs) || !Number.isFinite(durationSec) || durationSec <= 0) return 0;
  const midnight = new Date(now); midnight.setHours(0, 0, 0, 0);
  const tomorrow = new Date(midnight); tomorrow.setDate(tomorrow.getDate() + 1);
  const startMs = endMs - durationSec * 1000;
  return Math.max(0, Math.min(endMs, now.getTime(), tomorrow.getTime()) - Math.max(startMs, midnight.getTime())) / 1000;
}
export function validPracticeSeconds(seconds: number): number {
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}
export function formatPracticeTime(seconds: number): string {
  const total = Math.floor(validPracticeSeconds(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const secs = total % 60;
  return hours ? `${hours} h ${minutes} min ${secs} sec` : `${minutes} min ${secs} sec`;
}
