import type { KeyboardLayoutDefinition, KeyDefinition } from "../types";
import { enQwertyLayout, enQwertyRows } from "./enQwerty";
import { krutiKeyLabel } from "../converter/krutiDevCore";

// Kruti Dev 010 is a legacy GLYPH font: on a normal US keyboard the key you press
// still produces plain ASCII (D -> "d"), and the Kruti Dev font draws that ASCII
// as a Devanagari shape (d -> क). So the typed output of every key stays the same
// as English QWERTY; what changes is the label that shows what the font draws.
//
// Key -> glyph labels come from the community Kruti<->Unicode converter table
// (see src/converter/krutiDevCore.ts). It is not official Kruti Dev documentation:
// spot-check a few keys with the real font installed.

const MAPPING_SOURCE = "Kruti Dev 010 key->glyph table (community converter table); spot-check with installed font";
const UNSURE_SOURCE = "Punctuation/symbol shown by this key in Kruti Dev is not in the reference table - verify with the font";

// Keys whose SHIFT (or normal) glyph is not covered by the reference table.
const UNSURE = new Set(["Digit1", "Digit4", "Digit9", "Digit0"]);

function toKrutiKey(key: KeyDefinition): KeyDefinition {
  if (key.isModifier) return { ...key, encodingType: "legacy-font" };
  const normal = key.output;
  const shift = key.shiftOutput ?? key.output;
  const normalLabel = krutiKeyLabel(normal);
  const shiftLabel = krutiKeyLabel(shift);
  const unsure = UNSURE.has(key.code);
  return {
    ...key,
    normalLabel,
    shiftLabel,
    encodingType: "legacy-font",
    legacyOutput: { normal, shift, verified: !unsure },
    unicodeEquivalent: normalLabel,
    renderedPreview: normalLabel,
    mappingStatus: unsure ? "unverified" : "verified",
    mappingSource: unsure ? UNSURE_SOURCE : MAPPING_SOURCE,
  };
}

export const krutiDev010Layout: KeyboardLayoutDefinition = {
  id: "kruti-dev-010",
  label: "Kruti Dev 010 (Legacy)",
  labelHi: "कृति देव 010 (लीगेसी)",
  isLegacyEncoding: true,
  keys: enQwertyLayout.keys.map(toKrutiKey),
};

export const krutiDev010Rows: KeyDefinition[][] = enQwertyRows.map((row) => row.map(toKrutiKey));
