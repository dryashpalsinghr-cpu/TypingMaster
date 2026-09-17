import type { KeyDefinition, KeyboardLayoutDefinition } from "../types";
import { enQwertyLayout } from "./enQwerty";

// InScript (Devanagari) maps Devanagari characters onto the SAME physical
// key positions as an English QWERTY keyboard - only the labels/outputs
// change, finger and hand assignment stay identical (spec section 5: use
// KeyboardEvent.code, keep guidance consistent across layouts).
//
// IMPORTANT - accuracy note: this table implements the well-documented
// "core" of the government-standard InScript layout (all vowel matras,
// all independent vowels, virama/halant, anusvara, chandrabindu, visarga,
// and the consonants used by this project's own lesson content). A
// handful of rarer keys (retroflex ट/ठ, sibilant ष, a few nukta letters,
// obscure shifted punctuation) are intentionally left unmapped rather
// than guessed, consistent with this project's rule of never inventing
// unverified mappings. Before using this for a real government exam,
// cross-check the full chart against Windows' official InScript layout
// (Control Panel > Language > Hindi > Keyboard: Devanagari - INSCRIPT).
interface HindiKeyOverride {
  normalLabel: string;
  shiftLabel?: string;
  output: string;
  shiftOutput?: string;
  unicodeComposition?: string;
}

const OVERRIDES: Record<string, HindiKeyOverride> = {
  // Number row - digits are certain; visarga/vocalic-r are well attested
  Digit1: { normalLabel: "१", output: "१" },
  Digit2: { normalLabel: "२", output: "२" },
  Digit3: { normalLabel: "३", output: "३" },
  Digit4: { normalLabel: "४", output: "४" },
  Digit5: { normalLabel: "५", output: "५" },
  Digit6: { normalLabel: "६", output: "६" },
  Digit7: { normalLabel: "७", output: "७" },
  Digit8: { normalLabel: "८", output: "८" },
  Digit9: { normalLabel: "९", output: "९" },
  Digit0: { normalLabel: "०", output: "०" },
  Minus: { normalLabel: "-", shiftLabel: "ः", output: "-", shiftOutput: "ः" },
  Equal: {
    normalLabel: "ृ",
    shiftLabel: "ॄ",
    output: "ृ",
    shiftOutput: "ॄ",
    unicodeComposition: "vocalic-r matra, appears after the consonant it modifies",
  },

  // Top row - vowel matras (normal) / independent vowels (shift)
  KeyQ: { normalLabel: "ौ", shiftLabel: "औ", output: "ौ", shiftOutput: "औ" },
  KeyW: { normalLabel: "ै", shiftLabel: "ऐ", output: "ै", shiftOutput: "ऐ" },
  KeyE: { normalLabel: "ा", shiftLabel: "आ", output: "ा", shiftOutput: "आ" },
  KeyR: { normalLabel: "ी", shiftLabel: "ई", output: "ी", shiftOutput: "ई" },
  KeyT: { normalLabel: "ू", shiftLabel: "ऊ", output: "ू", shiftOutput: "ऊ" },
  KeyY: { normalLabel: "ब", shiftLabel: "भ", output: "ब", shiftOutput: "भ" },
  KeyU: { normalLabel: "ह", shiftLabel: "ङ", output: "ह", shiftOutput: "ङ" },
  KeyI: { normalLabel: "ग", shiftLabel: "घ", output: "ग", shiftOutput: "घ" },
  KeyO: { normalLabel: "द", shiftLabel: "ध", output: "द", shiftOutput: "ध" },
  KeyP: { normalLabel: "ज", shiftLabel: "झ", output: "ज", shiftOutput: "झ" },
  BracketLeft: { normalLabel: "ड", shiftLabel: "ढ", output: "ड", shiftOutput: "ढ" },
  BracketRight: {
    normalLabel: "़",
    shiftLabel: "ज्ञ",
    output: "़",
    shiftOutput: "ज्ञ",
    unicodeComposition: "nukta combining sign (normal); ज्ञ conjunct preset (shift)",
  },

  // Home row - virama/half-letter key, more matras/vowels, core consonants
  KeyA: { normalLabel: "ो", shiftLabel: "ओ", output: "ो", shiftOutput: "ओ" },
  KeyS: { normalLabel: "े", shiftLabel: "ए", output: "े", shiftOutput: "ए" },
  KeyD: {
    normalLabel: "्",
    shiftLabel: "अ",
    output: "्",
    shiftOutput: "अ",
    unicodeComposition: "halant/virama - combines with the previous consonant to form a half-letter or conjunct",
  },
  KeyF: { normalLabel: "ि", shiftLabel: "इ", output: "ि", shiftOutput: "इ" },
  KeyG: { normalLabel: "ु", shiftLabel: "उ", output: "ु", shiftOutput: "उ" },
  KeyH: { normalLabel: "प", shiftLabel: "फ", output: "प", shiftOutput: "फ" },
  KeyJ: { normalLabel: "र", output: "र" },
  KeyK: { normalLabel: "क", shiftLabel: "ख", output: "क", shiftOutput: "ख" },
  KeyL: { normalLabel: "त", shiftLabel: "थ", output: "त", shiftOutput: "थ" },
  Semicolon: { normalLabel: "ॉ", output: "ॉ" },
  Quote: {
    normalLabel: "ं",
    shiftLabel: "ँ",
    output: "ं",
    shiftOutput: "ँ",
    unicodeComposition: "anusvara (normal) / chandrabindu (shift)",
  },

  // Bottom row - remaining core consonants (a commonly-cited stable block)
  KeyC: { normalLabel: "म", shiftLabel: "ण", output: "म", shiftOutput: "ण" },
  KeyV: { normalLabel: "न", output: "न" },
  KeyB: { normalLabel: "व", output: "व" },
  KeyN: { normalLabel: "ल", shiftLabel: "ळ", output: "ल", shiftOutput: "ळ" },
  KeyM: { normalLabel: "स", shiftLabel: "श", output: "स", shiftOutput: "श" },
  Comma: { normalLabel: ",", output: "," },
  Period: { normalLabel: ".", shiftLabel: "।", output: ".", shiftOutput: "।", unicodeComposition: "purna viram (danda)" },
  Slash: { normalLabel: "य", output: "य" },
};

const hindiKeys: KeyDefinition[] = enQwertyLayout.keys.map((key) => {
  const override = OVERRIDES[key.code];
  if (!override) {
    // Modifiers (Backspace, Tab, CapsLock, Enter, Shift, Space) and any key
    // intentionally left unmapped (KeyZ, KeyX, Backquote, BracketRight
    // extras, etc.) keep their English behaviour so the physical keyboard
    // never goes "dead" - see file header note on unmapped keys.
    return { ...key };
  }
  return {
    ...key,
    normalLabel: override.normalLabel,
    shiftLabel: override.shiftLabel,
    output: override.output,
    shiftOutput: override.shiftOutput,
    unicodeComposition: override.unicodeComposition,
  };
});

export const hindiInscriptLayout: KeyboardLayoutDefinition = {
  id: "unicode-inscript",
  label: "Hindi Unicode - InScript",
  labelHi: "हिन्दी यूनिकोड - इनस्क्रिप्ट",
  isLegacyEncoding: false,
  keys: hindiKeys,
};

// Same row grouping as English so the virtual keyboard renders identically
// shaped rows - only the glyphs differ.
export const hindiInscriptRows: KeyDefinition[][] = (() => {
  const byCode = new Map(hindiKeys.map((k) => [k.code, k]));
  return [
    ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
    ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
    ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
    ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
    ["Space"],
  ].map((row) => row.map((code) => byCode.get(code)!).filter(Boolean));
})();

/** Keys with a confirmed Hindi mapping in this Phase-3 build. */
export const MAPPED_HINDI_CODES = new Set(Object.keys(OVERRIDES));
