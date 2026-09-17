// Reusable typing engine (spec sections 7 & 8).
// Grapheme-aware: uses Intl.Segmenter when available so Hindi matra/conjunct
// clusters are treated as one visual unit instead of being split into raw
// UTF-16 code units.
//
// Devanagari note: one visual grapheme cluster (e.g. "कि", "क्ष") is often
// typed as MULTIPLE physical keystrokes (consonant, then matra/virama/next
// consonant), each producing one Unicode code point. So a "cell" here can
// require more than one typeCharacter() call to complete. Each cell keeps
// a typedBuffer that accumulates code points and is compared against the
// expected cluster as a prefix match while typing is in progress, and as
// an exact match once the cluster is complete. English text is just the
// special case where every cluster is a single code point, so this is
// fully backward compatible with the original single-keystroke behaviour.

export interface CharacterState {
  expected: string;
  typed: string | null;
  typedBuffer: string;
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
      characters: segmentGraphemes(expectedText.normalize("NFC")).map((ch) => ({
        expected: ch,
        typed: null,
        typedBuffer: "",
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

  /**
   * Feed one typed Unicode code point (one physical keystroke's output)
   * forward into the current cell's buffer. A cell only advances once its
   * buffer exactly matches the expected cluster - until then, as long as
   * the buffer is still a valid prefix of the expected cluster, the cell
   * stays "pending" (this is the normal, correct path for a multi-key
   * Devanagari matra/conjunct sequence). Returns the updated snapshot.
   */
  typeCharacter(input: string, nowMs: number = performance.now()): EngineSnapshot {
    if (this.state.completed) return this.state;
    if (this.state.startedAt === null) this.state.startedAt = nowMs;

    const idx = this.state.cursor;
    const cell = this.state.characters[idx];
    if (!cell) return this.state;

    const char = input.normalize("NFC");
    this.state.totalKeystrokes += 1;
    cell.typedBuffer += char;
    cell.typed = cell.typedBuffer;
    cell.firstTypedAtMs = cell.firstTypedAtMs ?? nowMs - (this.state.startedAt ?? nowMs);
    this.keyTimings.push(nowMs);

    if (cell.typedBuffer === cell.expected) {
      // full cluster match
      cell.status = cell.status === "incorrect" ? "corrected" : "correct";
      if (cell.status === "corrected") this.state.correctedErrors += 1;
      this.state.cursor += 1;
    } else if (cell.expected.startsWith(cell.typedBuffer)) {
      // valid prefix of a multi-keystroke cluster - keep waiting
      cell.status = "pending";
    } else {
      // mismatch
      if (cell.status !== "incorrect") {
        this.state.uncorrectedErrors += 1;
        cell.status = "incorrect";
      }
      if (!this.config.strictMode && cell.typedBuffer.length >= cell.expected.length) {
        // fluent mode: give up on this cluster once enough keystrokes were
        // spent on it, so a single wrong key never blocks the drill
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
    if (!this.config.backspaceAllowed) return this.state;

    const cell = this.state.characters[this.state.cursor];

    if (cell && cell.typedBuffer.length > 0) {
      // remove the last keystroke within the current (incomplete) cluster
      this.state.backspaces += 1;
      cell.typedBuffer = cell.typedBuffer.slice(0, -1);
      cell.typed = cell.typedBuffer || null;
      if (cell.status === "incorrect" && cell.expected.startsWith(cell.typedBuffer)) {
        this.state.uncorrectedErrors = Math.max(0, this.state.uncorrectedErrors - 1);
      }
      cell.status = cell.typedBuffer.length === 0 ? "pending" : cell.status === "incorrect" ? "incorrect" : "pending";
      this.state.elapsedMs = nowMs - (this.state.startedAt ?? nowMs);
      return { ...this.state };
    }

    if (this.state.cursor === 0) return this.state;

    // current cell has nothing typed yet - step back into the previous cell
    this.state.backspaces += 1;
    this.state.cursor -= 1;
    const prevCell = this.state.characters[this.state.cursor];
    if (prevCell.status === "incorrect") {
      this.state.uncorrectedErrors = Math.max(0, this.state.uncorrectedErrors - 1);
    } else if (prevCell.status === "corrected") {
      this.state.correctedErrors = Math.max(0, this.state.correctedErrors - 1);
    }
    prevCell.status = "pending";
    prevCell.typed = null;
    prevCell.typedBuffer = "";
    this.state.elapsedMs = nowMs - (this.state.startedAt ?? nowMs);
    return { ...this.state };
  }

  reset(expectedText: string): void {
    this.state = {
      characters: segmentGraphemes(expectedText.normalize("NFC")).map((ch) => ({
        expected: ch,
        typed: null,
        typedBuffer: "",
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
