import type { KeyboardLayoutDefinition, KeyDefinition } from "../types";
import { enQwertyLayout, enQwertyRows } from "./enQwerty";
const MAPPING_SOURCE = "Needs mapping verification (Remington GAIL chart)";
function toLegacyKey(key: KeyDefinition): KeyDefinition {
  if (key.isModifier) return { ...key, encodingType: "legacy-font" };
  return { ...key, encodingType: "legacy-font", legacyOutput: { verified: false }, mappingStatus: "unverified", mappingSource: MAPPING_SOURCE };
}
export const remingtonGailLayout: KeyboardLayoutDefinition = { id: "remington-gail", label: "Remington GAIL (Legacy)", labelHi: "रेमिंगटन गेल (लीगेसी)", isLegacyEncoding: true, keys: enQwertyLayout.keys.map(toLegacyKey) };
export const remingtonGailRows: KeyDefinition[][] = enQwertyRows.map((row) => row.map(toLegacyKey));
