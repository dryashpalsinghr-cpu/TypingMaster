import type { AttemptResult } from "../types";
export function summarizeAttempts(attempts: AttemptResult[]) {
  const n = attempts.length;
  return {
    minutesPracticed: attempts.reduce((s, a) => s + a.durationSec, 0) / 60,
    lessonsCompleted: new Set(attempts.filter((a) => a.kind === "lesson" && a.completed && a.passed && a.lessonId).map((a) => a.lessonId)).size,
    avgWpm: n ? attempts.reduce((s, a) => s + a.netWpm, 0) / n : 0,
    avgAccuracy: n ? attempts.reduce((s, a) => s + a.accuracy, 0) / n : 0,
  };
}
