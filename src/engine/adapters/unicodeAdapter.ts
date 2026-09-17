import type { KeyboardLayoutDefinition } from "../../types";
import type { CompareResult, TypingAdapter } from "./types";
export class UnicodeTypingAdapter implements TypingAdapter {
  readonly encodingType = "unicode" as const;
  readonly layout: KeyboardLayoutDefinition;
  constructor(layout: KeyboardLayoutDefinition) {
    this.layout = layout;
  }
  normalizeInput(input: string): string { return input.normalize("NFC"); }
  segmentExpectedText(text: string): string[] {
    const normalized = text.normalize("NFC");
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const seg = new Intl.Segmenter("hi", { granularity: "grapheme" });
      return Array.from(seg.segment(normalized), (s) => s.segment);
    }
    return Array.from(normalized);
  }
  compareInput(expected: string, actual: string): CompareResult {
    const e = expected.normalize("NFC"); const a = actual.normalize("NFC");
    return { correct: e === a, expected: e, actual: a };
  }
  getDisplayText(text: string): string { return text.normalize("NFC"); }
}
