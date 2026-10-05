import type { KeyDefinition, KeyboardLayoutDefinition } from "../types";
import { enQwertyLayout } from "./enQwerty";

// InScript (Devanagari) maps Devanagari characters onto the SAME physical
// key positions as an English QWERTY keyboard - only the labels/outputs
// change, finger and hand assignment stay identical (spec section 5: use
// KeyboardEvent.code, keep guidance consistent across layouts).
//
// This table follows the standard (CDAC / Windows) InScript layout: every
// consonant, vowel, matra, halant, anusvara, chandrabindu, nukta and danda has
// its own key, so any Hindi paragraph can be typed completely. The number-row
// conjunct shortcuts (Shift+3..8) are not mapped - those conjuncts are typed
// as consonant + halant + consonant, exactly like the Unicode text itself.
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
    shiftLabel: "ञ",
    output: "़",
    shiftOutput: "ञ",
    unicodeComposition: "nukta combining sign (normal); ञ (shift)",
  },
  Backslash: { normalLabel: "ॉ", shiftLabel: "ऑ", output: "ॉ", shiftOutput: "ऑ" },

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
  KeyJ: { normalLabel: "र", shiftLabel: "ऱ", output: "र", shiftOutput: "ऱ" },
  KeyK: { normalLabel: "क", shiftLabel: "ख", output: "क", shiftOutput: "ख" },
  KeyL: { normalLabel: "त", shiftLabel: "थ", output: "त", shiftOutput: "थ" },
  Semicolon: { normalLabel: "च", shiftLabel: "छ", output: "च", shiftOutput: "छ" },
  Quote: { normalLabel: "ट", shiftLabel: "ठ", output: "ट", shiftOutput: "ठ" },

  // Bottom row - anusvara/chandrabindu and the remaining consonants
  KeyZ: { normalLabel: "ॆ", shiftLabel: "ऎ", output: "ॆ", shiftOutput: "ऎ" },
  KeyX: {
    normalLabel: "ं",
    shiftLabel: "ँ",
    output: "ं",
    shiftOutput: "ँ",
    unicodeComposition: "anusvara (normal) / chandrabindu (shift)",
  },
  KeyC: { normalLabel: "म", shiftLabel: "ण", output: "म", shiftOutput: "ण" },
  KeyV: { normalLabel: "न", shiftLabel: "ऩ", output: "न", shiftOutput: "ऩ" },
  KeyB: { normalLabel: "व", shiftLabel: "ऴ", output: "व", shiftOutput: "ऴ" },
  KeyN: { normalLabel: "ल", shiftLabel: "ळ", output: "ल", shiftOutput: "ळ" },
  KeyM: { normalLabel: "स", shiftLabel: "श", output: "स", shiftOutput: "श" },
  Comma: { normalLabel: ",", shiftLabel: "ष", output: ",", shiftOutput: "ष" },
  Period: { normalLabel: ".", shiftLabel: "।", output: ".", shiftOutput: "।", unicodeComposition: "purna viram (danda)" },
  Slash: { normalLabel: "य", shiftLabel: "य़", output: "य", shiftOutput: "य़" },
};

const hindiKeys: KeyDefinition[] = enQwertyLayout.keys.map((key) => {
  const override = OVERRIDES[key.code];
  if (!override) {
    // Modifiers (Backspace, Tab, CapsLock, Enter, Shift, Space) and the few
    // keys without a Hindi letter (e.g. Backquote) keep their English
    // behaviour so the physical keyboard never goes "dead".
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
