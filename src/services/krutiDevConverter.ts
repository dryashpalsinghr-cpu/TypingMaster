// Common-case Kruti Dev 010 -> Unicode (Mangal) converter.
//
// Based on the documented Kruti Dev 010 mapping (see src/data/legacyKeyMaps.ts
// for sources). It covers the common letters, vowels, matras, digits and the
// most frequent conjuncts, and it fixes short-i (ि) ordering (Kruti Dev types
// ि BEFORE its consonant; Unicode needs it AFTER).
//
// HONESTY: this is a practical common-case converter, not a full document
// engine. Rare glyphs, some reph (र्) forms, and nukta ambiguities may need
// manual review. For bulk/critical conversion, verify the output.

// Order matters: longer sequences must be replaced before shorter ones.
const PAIRS: [string, string][] = [
  // 3-character sequences first
  ["vkS", "औ"],
  ["vks", "ओ"],
  // 2-character sequences
  ["kS", "ौ"],
  ["ks", "ो"],
  ["vk", "आ"],
  ["bZ", "ई"],
  [",s", "ए"],
  [",S", "ऐ"],
  ["[k", "ख"],
  ["?k", "घ"],
  [".k", "ण"],
  ["Fk", "थ"],
  ["/k", "ध"],
  ["Hk", "भ"],
  ["'k", "श"],
  ['"k', "ष"],
  ["{k", "क्ष"],
  ["=k", "त्र"],
  // single characters
  ["d", "क"],
  ["x", "ग"],
  ["p", "च"],
  ["N", "छ"],
  ["t", "ज"],
  [">", "झ"],
  ["V", "ट"],
  ["B", "ठ"],
  ["M", "ड"],
  ["<", "ढ"],
  ["r", "त"],
  ["n", "द"],
  ["u", "न"],
  ["i", "प"],
  ["Q", "फ"],
  ["c", "ब"],
  ["e", "म"],
  [";", "य"],
  ["j", "र"],
  ["y", "ल"],
  ["o", "व"],
  ["l", "स"],
  ["g", "ह"],
  ["K", "ज्ञ"],
  ["J", "श्र"],
  ["v", "अ"],
  ["b", "इ"],
  ["m", "उ"],
  [",", "ऋ"],
  ["k", "ा"],
  ["f", "ि"],
  ["h", "ी"],
  ["q", "ु"],
  ["w", "ू"],
  ["`", "ृ"],
  ["s", "े"],
  ["S", "ै"],
  ["W", "ॅ"],
  ["a", "ं"],
  ["^", "ँ"],
  ["%", "ः"],
  ["~", "्"],
  ["A", "।"],
  ["0", "०"],
  ["1", "१"],
  ["2", "२"],
  ["3", "३"],
  ["4", "४"],
  ["5", "५"],
  ["6", "६"],
  ["7", "७"],
  ["8", "८"],
  ["9", "९"],
];

export function krutiDevToUnicode(input: string): string {
  let s = input;
  for (const [kd, uni] of PAIRS) {
    if (s.indexOf(kd) !== -1) s = s.split(kd).join(uni);
  }
  // Short-i (ि) is typed before its consonant cluster in Kruti Dev; move it after.
  s = s.replace(/ि([\u0915-\u0939]़?(?:्[\u0915-\u0939]़?)*)/g, "$1ि");
  return s;
}
