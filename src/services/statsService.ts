import { db } from "../db/database";
import type { AttemptResult } from "../types";

export interface DashboardStats {
  avgWpm: number;
  avgAccuracy: number;
  bestWpm: number;
  lessonsCompleted: number;
  minutesTodayPracticed: number;
  streakDays: number;
  weakKeys: string[];
  recentAttempt: AttemptResult | null;
  weeklyWpm: { date: string; wpm: number }[];
  weeklyAccuracy: { date: string; accuracy: number }[];
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function getDashboardStats(profileId: number): Promise<DashboardStats> {
  const attempts = await db.attempts.where("profileId").equals(profileId).sortBy("dateTime");

  if (attempts.length === 0) {
    return {
      avgWpm: 0,
      avgAccuracy: 0,
      bestWpm: 0,
      lessonsCompleted: 0,
      minutesTodayPracticed: 0,
      streakDays: 0,
      weakKeys: [],
      recentAttempt: null,
      weeklyWpm: [],
      weeklyAccuracy: [],
    };
  }

  const avgWpm = Math.round(attempts.reduce((s, a) => s + a.netWpm, 0) / attempts.length);
  const avgAccuracy = Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length);
  const bestWpm = Math.round(Math.max(...attempts.map((a) => a.netWpm)));
  const lessonsCompleted = attempts.filter((a) => a.kind === "lesson" && a.completed).length;

  const todayKey = toDateKey(new Date().toISOString());
  const minutesTodayPracticed = Math.round(
    attempts.filter((a) => toDateKey(a.dateTime) === todayKey).reduce((s, a) => s + a.durationSec, 0) / 60
  );

  // Practice streak: count consecutive days (including today) with at least one attempt.
  const daySet = new Set(attempts.map((a) => toDateKey(a.dateTime)));
  let streakDays = 0;
  const cursor = new Date();
  for (;;) {
    const key = toDateKey(cursor.toISOString());
    if (daySet.has(key)) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Weak keys: aggregate per-key error rate across all attempts.
  const keyTotals: Record<string, { attempts: number; errors: number }> = {};
  for (const a of attempts) {
    for (const [key, stat] of Object.entries(a.keyStats ?? {})) {
      keyTotals[key] ??= { attempts: 0, errors: 0 };
      keyTotals[key].attempts += stat.attempts;
      keyTotals[key].errors += stat.errors;
    }
  }
  const weakKeys = Object.entries(keyTotals)
    .filter(([, s]) => s.attempts >= 3)
    .sort((a, b) => b[1].errors / b[1].attempts - a[1].errors / a[1].attempts)
    .slice(0, 6)
    .map(([key]) => key);

  const last7 = attempts.slice(-7);
  const weeklyWpm = last7.map((a) => ({ date: toDateKey(a.dateTime), wpm: Math.round(a.netWpm) }));
  const weeklyAccuracy = last7.map((a) => ({ date: toDateKey(a.dateTime), accuracy: Math.round(a.accuracy) }));

  return {
    avgWpm,
    avgAccuracy,
    bestWpm,
    lessonsCompleted,
    minutesTodayPracticed,
    streakDays,
    weakKeys,
    recentAttempt: attempts[attempts.length - 1],
    weeklyWpm,
    weeklyAccuracy,
  };
}

export async function saveAttempt(attempt: AttemptResult): Promise<number> {
  const id = await db.attempts.add(attempt);
  const todayKey = toDateKey(attempt.dateTime);
  const existing = await db.dailyProgress
    .where("profileId")
    .equals(attempt.profileId)
    .filter((d) => d.date === todayKey)
    .first();

  if (existing) {
    await db.dailyProgress.update(existing.id as number, {
      minutesPracticed: existing.minutesPracticed + attempt.durationSec / 60,
      lessonsCompleted: existing.lessonsCompleted + (attempt.kind === "lesson" && attempt.completed ? 1 : 0),
      avgWpm: (existing.avgWpm + attempt.netWpm) / 2,
      avgAccuracy: (existing.avgAccuracy + attempt.accuracy) / 2,
    });
  } else {
    await db.dailyProgress.add({
      profileId: attempt.profileId,
      date: todayKey,
      minutesPracticed: attempt.durationSec / 60,
      lessonsCompleted: attempt.kind === "lesson" && attempt.completed ? 1 : 0,
      avgWpm: attempt.netWpm,
      avgAccuracy: attempt.accuracy,
    });
  }

  return id as number;
}
