import { analyticsDb } from "../db/analyticsDb";
import { getResults } from "./examService";
import { fingerForKey } from "../data/fingerMap";
import type { KeystrokeRecord, ReviewSession, KeyStat, BigramStat, FingerStat, TrendPoint } from "../types/analytics";

export async function recordKeystrokes(records: KeystrokeRecord[]): Promise<void> {
  if (records.length === 0) return;
  await analyticsDb.keystrokes.bulkAdd(records.map((r) => ({ ...r, id: undefined })) as KeystrokeRecord[]);
}
export async function saveReviewSession(s: ReviewSession): Promise<number> {
  const { id: _id, ...rest } = s;
  void _id;
  return await analyticsDb.reviewSessions.add(rest as ReviewSession);
}
export async function getKeystrokes(profileId: number): Promise<KeystrokeRecord[]> {
  const all = await analyticsDb.keystrokes.where("profileId").equals(profileId).toArray();
  return all.sort((a, b) => a.at - b.at);
}
export async function clearAnalytics(profileId: number): Promise<void> {
  await analyticsDb.keystrokes.where("profileId").equals(profileId).delete();
  await analyticsDb.reviewSessions.where("profileId").equals(profileId).delete();
}

function isTypable(ch: string): boolean { return !!ch && ch !== " " && ch !== "\n"; }

export function computeKeyStats(records: KeystrokeRecord[]): KeyStat[] {
  const map = new Map<string, { count: number; errors: number; total: number }>();
  for (const r of records) {
    if (!isTypable(r.expected)) continue;
    const key = r.expected.toLowerCase();
    const e = map.get(key) ?? { count: 0, errors: 0, total: 0 };
    e.count++; if (!r.correct) e.errors++; e.total += r.deltaMs;
    map.set(key, e);
  }
  return [...map.entries()].map(([key, v]) => ({ key, count: v.count, errors: v.errors, errorRate: v.count ? v.errors / v.count : 0, avgDeltaMs: v.count ? Math.round(v.total / v.count) : 0 }));
}
export function computeBigramStats(records: KeystrokeRecord[]): BigramStat[] {
  const map = new Map<string, { count: number; errors: number; total: number }>();
  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1]; const cur = records[i];
    if (!isTypable(prev.expected) || !isTypable(cur.expected)) continue;
    if (cur.at - prev.at > 4000) continue;
    const bigram = (prev.expected + cur.expected).toLowerCase();
    const e = map.get(bigram) ?? { count: 0, errors: 0, total: 0 };
    e.count++; if (!cur.correct) e.errors++; e.total += cur.deltaMs;
    map.set(bigram, e);
  }
  return [...map.entries()].map(([bigram, v]) => ({ bigram, count: v.count, errors: v.errors, errorRate: v.count ? v.errors / v.count : 0, avgDeltaMs: v.count ? Math.round(v.total / v.count) : 0 }));
}
export function computeFingerStats(records: KeystrokeRecord[]): FingerStat[] {
  const map = new Map<string, { hand: "left" | "right"; count: number; errors: number; total: number }>();
  for (const r of records) {
    const info = fingerForKey(r.expected);
    if (!info) continue;
    const e = map.get(info.finger) ?? { hand: info.hand, count: 0, errors: 0, total: 0 };
    e.count++; if (!r.correct) e.errors++; e.total += r.deltaMs;
    map.set(info.finger, e);
  }
  return [...map.entries()].map(([finger, v]) => ({ finger, hand: v.hand, count: v.count, errors: v.errors, errorRate: v.count ? v.errors / v.count : 0, avgDeltaMs: v.count ? Math.round(v.total / v.count) : 0 }));
}
export function getWeakKeys(records: KeystrokeRecord[], minCount = 3, n = 8): KeyStat[] {
  return computeKeyStats(records).filter((k) => k.count >= minCount && k.errors > 0).sort((a, b) => b.errorRate - a.errorRate || b.count - a.count).slice(0, n);
}
export function getSlowKeys(records: KeystrokeRecord[], minCount = 3, n = 8): KeyStat[] {
  return computeKeyStats(records).filter((k) => k.count >= minCount).sort((a, b) => b.avgDeltaMs - a.avgDeltaMs).slice(0, n);
}
export function getDifficultBigrams(records: KeystrokeRecord[], minCount = 2, n = 8): BigramStat[] {
  return computeBigramStats(records).filter((b) => b.count >= minCount).sort((a, b) => (b.errorRate - a.errorRate) || (b.avgDeltaMs - a.avgDeltaMs)).slice(0, n);
}
export async function getTrends(profileId: number): Promise<TrendPoint[]> {
  const results = await getResults(profileId);
  return results.slice(0, 20).reverse().map((r) => ({ at: r.takenAt, label: new Date(r.takenAt).toLocaleDateString(), netWpm: r.netWpm, accuracy: r.accuracy }));
}
export function buildDrill(keys: string[], bigrams: string[]): string {
  const pool = keys.length ? keys : ["a", "s", "d", "f", "j", "k", "l", ";"];
  const parts: string[] = [];
  for (let i = 0; i < 12; i++) {
    let w = ""; const len = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < len; j++) w += pool[Math.floor(Math.random() * pool.length)];
    parts.push(w);
  }
  for (const b of bigrams) parts.push(b + b + b);
  return parts.sort(() => Math.random() - 0.5).join(" ");
}
