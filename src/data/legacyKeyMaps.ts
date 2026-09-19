// Real, sourced key mappings for the two legacy Hindi layouts.
//
// Sources (documented public standards, NOT guesses):
//  - Remington GAIL: SIL Global "Remington GAIL (SIL)" Keyman keyboard (MIT license),
//    keymanapp/keyboards -> release/r/remington_gail/source/remington_gail.kmn
//    (base + Shift key stores: consK/consU, halfK/halfU, diaK/diaU, punctK/punctU).
//  - Kruti Dev 010: the documented Kruti Dev 010 legacy ASCII -> Devanagari font
//    mapping widely used in Hindi typing / government exam workflows.
//
// IMPORTANT (honesty): these are the standard/documented mappings. Legacy fonts
// have minor historical variants, so spot-check a few glyphs against YOUR exact
// installed font file in the Mapping Validator before relying on them for
// official exam practice. Nothing here is a random guess.

export type LegacyLayoutId = "kruti-dev-010" | "remington-gail";
export type LegacyKeyGroup =
  | "vowel"
  | "consonant"
  | "matra"
  | "conjunct"
  | "digit"
  | "sign"
  | "punct";

export interface LegacyKeyMapping {
  /** Character produced by the physical key on a US-QWERTY keyboard (already reflects Shift). */
  key: string;
  /** Whether Shift must be held to produce `key`. */
  shift: boolean;
  /** Resulting Devanagari Unicode output. */
  unicode: string;
  /** Short human-readable label for the tutor UI. */
  label: string;
  /** Category, for grouping keys in the UI. */
  group: LegacyKeyGroup;
}

type Row = [string, boolean, string, string, LegacyKeyGroup];
const mk = (rows: Row[]): LegacyKeyMapping[] =>
  rows.map(([key, shift, unicode, label, group]) => ({ key, shift, unicode, label, group }));

// ---------------------------------------------------------------------------
// Remington GAIL (from the official SIL Keyman remington_gail.kmn base/Shift keys)
// ---------------------------------------------------------------------------
export const REMINGTON_GAIL_KEYS: LegacyKeyMapping[] = mk([
  // Independent vowels
  ["v", false, "अ", "अ", "vowel"],
  ["b", false, "इ", "इ", "vowel"],
  ["m", false, "उ", "उ", "vowel"],
  [",", false, "ए", "ए", "vowel"],
  [")", true, "ऋ", "ऋ", "vowel"],
  // Full consonants
  ["d", false, "क", "क", "consonant"],
  ["x", false, "ग", "ग", "consonant"],
  ["p", false, "च", "च", "consonant"],
  ["t", false, "ज", "ज", "consonant"],
  ["r", false, "त", "त", "consonant"],
  ["n", false, "द", "द", "consonant"],
  ["u", false, "न", "न", "consonant"],
  ["i", false, "प", "प", "consonant"],
  ["c", false, "ब", "ब", "consonant"],
  ["e", false, "म", "म", "consonant"],
  [";", false, "य", "य", "consonant"],
  ["j", false, "र", "र", "consonant"],
  ["y", false, "ल", "ल", "consonant"],
  ["o", false, "व", "व", "consonant"],
  ["l", false, "स", "स", "consonant"],
  ["g", false, "ह", "ह", "consonant"],
  ["N", true, "छ", "छ", "consonant"],
  [">", true, "झ", "झ", "consonant"],
  ["V", true, "ट", "ट", "consonant"],
  ["B", true, "ठ", "ठ", "consonant"],
  ["M", true, "ड", "ड", "consonant"],
  ["<", true, "ढ", "ढ", "consonant"],
  ["Q", true, "फ", "फ", "consonant"],
  ["G", true, "ळ", "ळ", "consonant"],
  // Half consonants (consonant + halant)
  ["D", true, "क्", "क् (half)", "consonant"],
  ["[", false, "ख्", "ख् (half)", "consonant"],
  ["X", true, "ग्", "ग् (half)", "consonant"],
  ["?", true, "घ्", "घ् (half)", "consonant"],
  ["P", true, "च्", "च् (half)", "consonant"],
  ["T", true, "ज्", "ज् (half)", "consonant"],
  [".", false, "ण्", "ण् (half)", "consonant"],
  ["R", true, "त्", "त् (half)", "consonant"],
  ["F", true, "थ्", "थ् (half)", "consonant"],
  ["/", false, "ध्", "ध् (half)", "consonant"],
  ["U", true, "न्", "न् (half)", "consonant"],
  ["I", true, "प्", "प् (half)", "consonant"],
  ["C", true, "ब्", "ब् (half)", "consonant"],
  ["H", true, "भ्", "भ् (half)", "consonant"],
  ["E", true, "म्", "म् (half)", "consonant"],
  ["Y", true, "ल्", "ल् (half)", "consonant"],
  ["O", true, "व्", "व् (half)", "consonant"],
  ["'", false, "श्", "श् (half)", "consonant"],
  ['"', true, "ष्", "ष् (half)", "consonant"],
  ["L", true, "स्", "स् (half)", "consonant"],
  // Matras / signs
  ["a", false, "ं", "ं (anusvara)", "matra"],
  ["A", true, "ा", "ा", "matra"],
  ["k", false, "ा", "ा", "matra"],
  ["f", false, "ि", "ि", "matra"],
  ["h", false, "ी", "ी", "matra"],
  ["q", false, "ु", "ु", "matra"],
  ["w", false, "ू", "ू", "matra"],
  ["=", false, "ृ", "ृ", "matra"],
  ["W", true, "ॅ", "ॅ", "matra"],
  ["s", false, "े", "े", "matra"],
  ["S", true, "ै", "ै", "matra"],
  ["+", true, "्", "् (halant)", "matra"],
  ["`", false, "़", "़ (nukta)", "sign"],
  // Frequent conjuncts (single keystroke in Remington GAIL)
  ["(", true, "त्र", "त्र", "conjunct"],
  ["*", true, "द्ध", "द्ध", "conjunct"],
  ["J", true, "श्र", "श्र", "conjunct"],
  ["K", true, "ज्ञ", "ज्ञ", "conjunct"],
  ["z", false, "्र", "्र (rakar)", "conjunct"],
  ["Z", true, "र्", "र् (reph)", "conjunct"],
  // Punctuation (Remington positions)
  ["!", true, "।", "। (danda)", "punct"],
  ["&", true, "’", "’", "punct"],
  ["^", true, "‘", "‘", "punct"],
  ["\\", false, "(", "(", "punct"],
  ["|", true, ")", ")", "punct"],
  ["$", true, "*", "*", "punct"],
  ["]", false, ",", ",", "punct"],
  ["%", true, "-", "-", "punct"],
  ["_", true, ".", ".", "punct"],
  ["@", true, "/", "/", "punct"],
]);

// ---------------------------------------------------------------------------
// Kruti Dev 010 (legacy ASCII font: the key you press -> the Devanagari it shows)
// ---------------------------------------------------------------------------
export const KRUTIDEV_010_KEYS: LegacyKeyMapping[] = mk([
  // Independent vowels
  ["v", false, "अ", "अ", "vowel"],
  ["b", false, "इ", "इ", "vowel"],
  ["m", false, "उ", "उ", "vowel"],
  [",", false, "ए", "ए", "vowel"],
  ["_", true, "ऋ", "ऋ", "vowel"],
  // Full consonants
  ["d", false, "क", "क", "consonant"],
  ["x", false, "ग", "ग", "consonant"],
  ["p", false, "च", "च", "consonant"],
  ["t", false, "ज", "ज", "consonant"],
  ["r", false, "त", "त", "consonant"],
  ["n", false, "द", "द", "consonant"],
  ["u", false, "न", "न", "consonant"],
  ["i", false, "प", "प", "consonant"],
  ["c", false, "ब", "ब", "consonant"],
  ["e", false, "म", "म", "consonant"],
  [";", false, "य", "य", "consonant"],
  ["j", false, "र", "र", "consonant"],
  ["y", false, "ल", "ल", "consonant"],
  ["o", false, "व", "व", "consonant"],
  ["l", false, "स", "स", "consonant"],
  ["g", false, "ह", "ह", "consonant"],
  ["N", true, "छ", "छ", "consonant"],
  [">", true, "झ", "झ", "consonant"],
  ["V", true, "ट", "ट", "consonant"],
  ["B", true, "ठ", "ठ", "consonant"],
  ["M", true, "ड", "ड", "consonant"],
  ["<", true, "ढ", "ढ", "consonant"],
  ["Q", true, "फ", "फ", "consonant"],
  // Matras / signs
  ["k", false, "ा", "ा", "matra"],
  ["f", false, "ि", "ि", "matra"],
  ["h", false, "ी", "ी", "matra"],
  ["q", false, "ु", "ु", "matra"],
  ["w", false, "ू", "ू", "matra"],
  ["`", false, "ृ", "ृ", "matra"],
  ["s", false, "े", "े", "matra"],
  ["S", true, "ै", "ै", "matra"],
  ["W", true, "ॅ", "ॅ", "matra"],
  ["a", false, "ं", "ं (anusvara)", "matra"],
  ["%", true, "ः", "ः (visarga)", "sign"],
  ["~", true, "्", "् (halant)", "matra"],
  ["A", true, "।", "। (danda)", "punct"],
  // Digits: Kruti Dev 010 shows normal 0-9 for the number keys (no Devanagari digits).
]);

// Multi-keystroke Kruti Dev sequences (type the `code` characters in order).
export const KRUTIDEV_010_SEQUENCES: { code: string; unicode: string; label: string }[] = [
  { code: "vk", unicode: "आ", label: "आ" },
  { code: "bZ", unicode: "ई", label: "ई" },
  { code: ",s", unicode: "ऐ", label: "ऐ" },
  { code: "vks", unicode: "ओ", label: "ओ" },
  { code: "vkS", unicode: "औ", label: "औ" },
  { code: "ks", unicode: "ो", label: "ो (matra)" },
  { code: "kS", unicode: "ौ", label: "ौ (matra)" },
  { code: "[k", unicode: "ख", label: "ख" },
  { code: "?k", unicode: "घ", label: "घ" },
  { code: ".k", unicode: "ण", label: "ण" },
  { code: "Fk", unicode: "थ", label: "थ" },
  { code: "/k", unicode: "ध", label: "ध" },
  { code: "Hk", unicode: "भ", label: "भ" },
  { code: "'k", unicode: "श", label: "श" },
  { code: '"k', unicode: "ष", label: "ष" },
  { code: "{k", unicode: "क्ष", label: "क्ष" },
  { code: "=k", unicode: "त्र", label: "त्र" },
  { code: "K", unicode: "ज्ञ", label: "ज्ञ" },
  { code: "J", unicode: "श्र", label: "श्र" },
];

export function getLegacyLayoutKeys(id: LegacyLayoutId): LegacyKeyMapping[] {
  return id === "kruti-dev-010" ? KRUTIDEV_010_KEYS : REMINGTON_GAIL_KEYS;
}

export const LEGACY_KEY_COUNTS = {
  "kruti-dev-010": KRUTIDEV_010_KEYS.length,
  "remington-gail": REMINGTON_GAIL_KEYS.length,
} as const;
