export interface KeystrokeRecord {
  id?: number;
  profileId: number;
  at: number;
  layoutId: string;
  expected: string;
  typed: string;
  correct: boolean;
  deltaMs: number;
}
export interface ReviewSession {
  id?: number;
  profileId: number;
  at: number;
  mode: string;
  totalKeys: number;
  correctKeys: number;
  accuracy: number;
  avgDeltaMs: number;
}
export interface KeyStat { key: string; count: number; errors: number; errorRate: number; avgDeltaMs: number; }
export interface BigramStat { bigram: string; count: number; errors: number; errorRate: number; avgDeltaMs: number; }
export interface FingerStat { finger: string; hand: "left" | "right"; count: number; errors: number; errorRate: number; avgDeltaMs: number; }
export interface TrendPoint { at: number; label: string; netWpm: number; accuracy: number; }
