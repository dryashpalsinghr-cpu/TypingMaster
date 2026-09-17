import type { KeyboardLayoutDefinition } from "../../types";
export type EncodingKind = "unicode" | "legacy-font";
export interface RequiredKeystroke { code: string; shift: boolean; }
export interface CompareResult { correct: boolean; expected: string; actual: string; }
export interface TypingAdapter {
  readonly encodingType: EncodingKind; readonly layout: KeyboardLayoutDefinition;
  normalizeInput(input: string): string; segmentExpectedText(text: string): string[];
  compareInput(expected: string, actual: string): CompareResult; getDisplayText(text: string): string;
}
