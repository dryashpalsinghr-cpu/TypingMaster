import { krutiDevToUnicode, unicodeToKrutiDev } from "../converter/krutiDevCore";
import type { ConversionMapping } from "../types";
/** Apply explicitly verified conversion pairs, converting unmatched spans with the built-in table. */
export function convertWithMappings(input: string, direction: "k2u" | "u2k", mappings: ConversionMapping[]): string {
  const convert = direction === "k2u" ? krutiDevToUnicode : unicodeToKrutiDev;
  const pairs = mappings.filter((m) => m.verified && m.layoutId === "kruti-dev-010").map((m) => ({ from: direction === "k2u" ? m.legacy : m.unicode, to: direction === "k2u" ? m.unicode : m.legacy })).filter((m) => m.from.length > 0).sort((a, b) => b.from.length - a.from.length);
  let out = "", span = "";
  for (let i = 0; i < input.length;) {
    const pair = pairs.find((p) => input.startsWith(p.from, i));
    if (pair) { out += convert(span) + pair.to; span = ""; i += pair.from.length; }
    else { const ch = String.fromCodePoint(input.codePointAt(i)!); span += ch; i += ch.length; }
  }
  return out + convert(span);
}
