// Reusable typing engine (spec sections 7 & 8).
// Grapheme-aware: uses Intl.Segmenter when available so Hindi matra/conjunct
// clusters are treated as one visual unit instead of being split into raw
// UTF-16 code units.

export interface CharacterState {
  expected: string;
  typed: string | null;
  status: "pending" | "correct" | "incorrect" | "corrected";
  firstTypedAtMs: number | null;
}

export interface EngineSnapshot {
  characters: CharacterState[];
  cursor: number;
  totalKeystrokes: number;
  backspaces: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  startedAt: number | null;
  elapsedMs: number;
  completed: boolean;
}

export interface EngineConfig {
  strictMode: boolean; // must fix an error before moving on
  backspaceAllowed: boolean;
}

function segmentGraphemes(text: string): string[] {
  const w = window as unknown as {
    Intl: typeof Intl & {
      Segmenter?: new (
        locale?: string,
        opts?: { granularity: string }
      ) => { segment(input: string): Iterable<{ segment: string }> };
    };
  };
  if (w.Intl?.Segmenter) {
    const seg = new w.Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text); // fallback: code-point aware, not full grapheme-aware
}

export class TypingEngine {
  private config: EngineConfig;
  private state: EngineSnapshot;
  private keyTimings: number[] = [];

  constructor(expectedText: string, config: EngineConfig) {
    this.config = config;
    this.state = {
      characters: segmentGraphemes(expectedText).map((ch) => ({
        expected: ch,
        typed: null,
        status: "pending",
        firstTypedAtMs: null,
      })),
      cursor: 0,
      totalKeystrokes: 0,
      backspaces: 0,
      correctedErrors: 0,
      uncorrectedErrors: 0,
      startedAt: null,
      elapsedMs: 0,
      completed: false,
    };
  }

  getSnapshot(): EngineSnapshot {
    return this.state;
  }

  /** Feed one typed grapheme forward. Returns the updated snapshot. */
  typeCharacter(char: string, nowMs: number = performance.now()): EngineSnapshot {
    if (this.state.completed) return this.state;
    if (this.state.startedAt === null) this.state.startedAt = nowMs;

    const idx = this.state.cursor;
    const cell = this.state.characters[idx];
    if (!cell) return this.state;

    this.state.totalKeystrokes += 1;
    const isCorrect = char === cell.expected;
    cell.typed = char;
    cell.firstTypedAtMs = cell.firstTypedAtMs ?? nowMs - (this.state.startedAt ?? nowMs);
    this.keyTimings.push(nowMs);

    if (isCorrect) {
      cell.status = cell.status === "incorrect" ? "corrected" : "correct";
      if (cell.status === "corrected") this.state.correctedErrors += 1;
      this.state.cursor += 1;
    } else {
      cell.status = "incorrect";
      this.state.uncorrectedErrors += 1;
      if (!this.config.strictMode) {
        // fluent mode: still advance so the drill keeps flowing
        this.state.cursor += 1;
      }
    }

    if (this.state.cursor >= this.state.characters.length) {
      this.state.completed = true;
    }

    this.state.elapsedMs = nowMs - (this.state.startedAt ?? nowMs);
    return { ...this.state };
  }

  backspace(nowMs: number = performance.now()): EngineSnapshot {
    if (!this.config.backspaceAllowed || this.state.cursor === 0) return this.state;
    this.state.backspaces += 1;
    this.state.cursor -= 1;
    const cell = this.state.characters[this.state.cursor];
    if (cell.status === "incorrect") this.state.uncorrectedErrors = Math.max(0, this.state.uncorrectedErrors - 1);
    cell.status = "pending";
    cell.typed = null;
    this.state.elapsedMs = nowMs - (this.state.startedAt ?? nowMs);
    return { ...this.state };
  }

  reset(expectedText: string): void {
    this.state = {
      characters: segmentGraphemes(expectedText).map((ch) => ({
        expected: ch,
        typed: null,
        status: "pending",
        firstTypedAtMs: null,
      })),
      cursor: 0,
      totalKeystrokes: 0,
      backspaces: 0,
      correctedErrors: 0,
      uncorrectedErrors: 0,
      startedAt: null,
      elapsedMs: 0,
      completed: false,
    };
    this.keyTimings = [];
  }
}

export interface TypingResultMetrics {
  grossKpm: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  kdph?: number;
}

/**
 * Default calculation formulas (spec section 8).
 * netWpmPenaltyPerError: how many WPM to subtract per uncorrected error
 * (a configurable penalty, not a hardcoded industry rule).
 */
export function calculateMetrics(
  snapshot: EngineSnapshot,
  opts: { netWpmPenaltyPerError?: number; includeKdph?: boolean } = {}
): TypingResultMetrics {
  const minutes = Math.max(snapshot.elapsedMs / 60000, 1 / 60);
  const grossKpm = snapshot.totalKeystrokes / minutes;
  const grossWpm = grossKpm / 5;
  const penalty = opts.netWpmPenaltyPerError ?? 1;
  const netWpm = Math.max(0, grossWpm - snapshot.uncorrectedErrors * penalty / minutes);
  const accuracy =
    snapshot.totalKeystrokes === 0
      ? 100
      : ((snapshot.totalKeystrokes - snapshot.uncorrectedErrors) / snapshot.totalKeystrokes) * 100;

  return {
    grossKpm,
    grossWpm,
    netWpm,
    accuracy: Math.round(accuracy * 100) / 100,
    kdph: opts.includeKdph ? grossKpm * 60 : undefined,
  };
}
