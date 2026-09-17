import type { KeyboardLayoutDefinition } from "../../types";
import type { CompareResult, TypingAdapter } from "./types";
export class LegacyFontTypingAdapter implements TypingAdapter {
  readonly encodingType = "legacy-font" as const;
  constructor(readonly layout: KeyboardLayoutDefinition) {}
  normalizeInput(input: string): string { return input; }
  segmentExpectedText(text: string): string[] { return Array.from(text); }
  compareInput(expected: string, actual: string): CompareResult { return { correct: expected === actual, expected, actual }; }
  getDisplayText(text: string): string { return text; }
}
