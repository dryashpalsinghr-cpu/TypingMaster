import type { KeyboardLayoutDefinition } from "../types";
/** Characters the current base/Shift layout cannot emit, including disabled overrides. */
export function unreachableCharacters(layout: KeyboardLayoutDefinition, text: string): string[] {
  const outputs = new Set(layout.keys.flatMap((k) => [k.output, k.shiftOutput ?? ""]).join("").normalize("NFC"));
  return [...new Set(Array.from(text.normalize("NFC")).filter((ch) => !outputs.has(ch)))];
}
