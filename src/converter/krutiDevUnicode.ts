import type { ConversionMapping } from "../types";
export interface ConversionResult { output: string; converted: number; preserved: number; }
function convert(input: string, pairs: { from: string; to: string }[]): ConversionResult {
  const sorted = pairs.filter((p) => p.from).sort((a, b) => b.from.length - a.from.length);
  let i = 0; let output = ""; let converted = 0; let preserved = 0;
  while (i < input.length) {
    let matched = false;
    for (const p of sorted) {
      if (input.startsWith(p.from, i)) { output += p.to; i += p.from.length; converted++; matched = true; break; }
    }
    if (!matched) { output += input[i]; i++; preserved++; }
  }
  return { output, converted, preserved };
}
export function convertKrutiDevToUnicode(input: string, mappings: ConversionMapping[]): ConversionResult {
  return convert(input, mappings.filter((m) => m.verified).map((m) => ({ from: m.legacy, to: m.unicode })));
}
export function convertUnicodeToKrutiDev(input: string, mappings: ConversionMapping[]): ConversionResult {
  return convert(input, mappings.filter((m) => m.verified).map((m) => ({ from: m.unicode, to: m.legacy })));
}
