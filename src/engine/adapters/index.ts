import type { KeyboardLayoutDefinition } from "../../types";
import type { TypingAdapter } from "./types";
import { UnicodeTypingAdapter } from "./unicodeAdapter";
import { LegacyFontTypingAdapter } from "./legacyFontAdapter";
export function getAdapterForLayout(layout: KeyboardLayoutDefinition): TypingAdapter {
  return layout.isLegacyEncoding ? new LegacyFontTypingAdapter(layout) : new UnicodeTypingAdapter(layout);
}
export type { TypingAdapter, CompareResult, RequiredKeystroke, EncodingKind } from "./types";
export { UnicodeTypingAdapter } from "./unicodeAdapter";
export { LegacyFontTypingAdapter } from "./legacyFontAdapter";
