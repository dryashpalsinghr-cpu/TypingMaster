// Grapheme-aware typing engine for English and Devanagari.
export interface CharacterState {
  expected: string;
  typed: string | null;
  typedBuffer: string;
  status: "pending" | "correct" | "incorrect" | "corrected";
  firstTypedAtMs: number | null;
  hadError?: boolean;
}
export interface EngineSnapshot {
  characters: CharacterState[];
  cursor: number;
  totalKeystrokes: number;
  incorrectKeystrokes?: number;
  backspaces: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  startedAt: number | null;
  elapsedMs: number;
  completed: boolean;
}
export interface EngineConfig {
  strictMode: boolean;
  backspaceAllowed: boolean;
}
function segmentGraphemes(text: string): string[] {
  const w = window as unknown as {
    Intl: typeof Intl & {
      Segmenter?: new (locale?: string, opts?: { granularity: string }) => { segment(input: string): Iterable<{ segment: string }> };
    };
  };
  if (w.Intl?.Segmenter) {
    const seg = new w.Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}
export class TypingEngine {
  private config: EngineConfig;
  private state: EngineSnapshot;
  private keyTimings: number[] = [];
  constructor(expectedText: string, config: EngineConfig) {
    this.config = config;
    this.state = {
      characters: segmentGraphemes(expectedText.normalize("NFC")).map((ch) => ({ expected: ch, typed: null, typedBuffer: "", status: "pending", firstTypedAtMs: null })),
      cursor: 0, totalKeystrokes: 0, incorrectKeystrokes: 0, backspaces: 0,
      correctedErrors: 0, uncorrectedErrors: 0, startedAt: null, elapsedMs: 0, completed: false,
    };
  }
  getSnapshot(): EngineSnapshot { return this.state; }
  typeCharacter(input: string, nowMs: number = performance.now()): EngineSnapshot {
    if (this.state.completed) return this.state;
    if (this.state.startedAt === null) this.state.startedAt = nowMs;
    const cell = this.state.characters[this.state.cursor];
    if (!cell) return this.state;
    const char = input.normalize("NFC");
    this.state.totalKeystrokes += 1;
    cell.typedBuffer = (cell.typedBuffer + char).normalize("NFC");
    cell.typed = cell.typedBuffer;
    cell.firstTypedAtMs = cell.firstTypedAtMs ?? nowMs - (this.state.startedAt ?? nowMs);
    this.keyTimings.push(nowMs);
    if (cell.typedBuffer === cell.expected) {
      cell.status = cell.hadError ? "corrected" : "correct";
      this.state.cursor += 1;
    } else if (cell.expected.startsWith(cell.typedBuffer)) {
      cell.status = "pending";
    } else {
      cell.hadError = true;
      this.state.incorrectKeystrokes = (this.state.incorrectKeystrokes ?? 0) + 1;
      if (cell.status !== "incorrect") {
        this.state.uncorrectedErrors += 1;
        cell.status = "incorrect";
      }
      if (!this.config.strictMode && cell.typedBuffer.length >= cell.expected.length) this.state.cursor += 1;
    }
    if (this.state.cursor >= this.state.characters.length) this.state.completed = true;
    this.state.elapsedMs = nowMs - (this.state.startedAt ?? nowMs);
    return { ...this.state };
  }
  backspace(nowMs: number = performance.now()): EngineSnapshot {
    if (!this.config.backspaceAllowed) return this.state;
    const cell = this.state.characters[this.state.cursor];
    if (cell && cell.typedBuffer.length > 0) {
      this.state.backspaces += 1;
      this.state.completed = false;
      cell.typedBuffer = Array.from(cell.typedBuffer).slice(0, -1).join("");
      cell.typed = cell.typedBuffer || null;
      if (cell.status === "incorrect" && cell.expected.startsWith(cell.typedBuffer)) {
        this.state.uncorrectedErrors = Math.max(0, this.state.uncorrectedErrors - 1);
        this.state.correctedErrors += 1;
      }
      cell.status = cell.expected.startsWith(cell.typedBuffer) ? "pending" : "incorrect";
      this.state.elapsedMs = nowMs - (this.state.startedAt ?? nowMs);
      return { ...this.state };
    }
    if (this.state.cursor === 0) return this.state;
    this.state.backspaces += 1;
    this.state.completed = false;
    this.state.cursor -= 1;
    const prevCell = this.state.characters[this.state.cursor];
    if (prevCell.status === "incorrect") {
      this.state.uncorrectedErrors = Math.max(0, this.state.uncorrectedErrors - 1);
      this.state.correctedErrors += 1;
    }
    prevCell.status = "pending";
    prevCell.typed = null;
    prevCell.typedBuffer = "";
    this.state.elapsedMs = nowMs - (this.state.startedAt ?? nowMs);
    return { ...this.state };
  }
  tick(nowMs: number = performance.now()): EngineSnapshot {
    if (this.state.startedAt !== null && !this.state.completed) this.state.elapsedMs = Math.max(0, nowMs - this.state.startedAt);
    return { ...this.state };
  }
  reset(expectedText: string): void {
    this.state = {
      characters: segmentGraphemes(expectedText.normalize("NFC")).map((ch) => ({ expected: ch, typed: null, typedBuffer: "", status: "pending", firstTypedAtMs: null })),
      cursor: 0, totalKeystrokes: 0, incorrectKeystrokes: 0, backspaces: 0,
      correctedErrors: 0, uncorrectedErrors: 0, startedAt: null, elapsedMs: 0, completed: false,
    };
    this.keyTimings = [];
  }
}
export interface TypingResultMetrics { grossKpm: number; grossWpm: number; netWpm: number; accuracy: number; kdph?: number; }
export function calculateMetrics(snapshot: EngineSnapshot, opts: { netWpmPenaltyPerError?: number; includeKdph?: boolean } = {}): TypingResultMetrics {
  const minutes = Math.max(snapshot.elapsedMs / 60000, 1 / 60);
  const grossKpm = snapshot.totalKeystrokes / minutes;
  const grossWpm = grossKpm / 5;
  const penalty = opts.netWpmPenaltyPerError ?? 1;
  const netWpm = Math.max(0, grossWpm - snapshot.uncorrectedErrors * penalty / minutes);
  const mistakes = snapshot.incorrectKeystrokes ?? (snapshot.uncorrectedErrors + snapshot.correctedErrors);
  const accuracy = snapshot.totalKeystrokes === 0 ? 100 : Math.max(0, snapshot.totalKeystrokes - mistakes) / snapshot.totalKeystrokes * 100;
  return { grossKpm, grossWpm, netWpm, accuracy: Math.round(accuracy * 100) / 100, kdph: opts.includeKdph ? grossKpm * 60 : undefined };
}
