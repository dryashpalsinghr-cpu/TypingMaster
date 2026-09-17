import type { KeyboardLayoutDefinition, KeyDefinition } from "../types";
import { enQwertyLayout, enQwertyRows } from "./enQwerty";
const MAPPING_SOURCE = "Needs mapping verification (Kruti Dev 010 chart)";
function toLegacyKey(key: KeyDefinition): KeyDefinition {
  if (key.isModifier) return { ...key, encodingType: "legacy-font" };
  return { ...key, encodingType: "legacy-font", legacyOutput: { verified: false }, mappingStatus: "unverified", mappingSource: MAPPING_SOURCE };
}
export const krutiDev010Layout: KeyboardLayoutDefinition = { id: "kruti-dev-010", label: "Kruti Dev 010 (Legacy)", labelHi: "कृति देव 010 (लीगेसी)", isLegacyEncoding: true, keys: enQwertyLayout.keys.map(toLegacyKey) };
export const krutiDev010Rows: KeyDefinition[][] = enQwertyRows.map((row) => row.map(toLegacyKey));
