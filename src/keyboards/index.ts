import type { KeyboardLayoutId, KeyboardLayoutDefinition, KeyDefinition } from "../types";
import { enQwertyLayout, enQwertyRows } from "./enQwerty";
import { hindiInscriptLayout, hindiInscriptRows } from "./hindiInscript";

export function getKeyboardLayout(id: KeyboardLayoutId): KeyboardLayoutDefinition {
  switch (id) {
    case "unicode-inscript":
      return hindiInscriptLayout;
    case "en-qwerty":
    default:
      // Kruti Dev 010 / Remington GAIL / Hindi Phonetic land here in
      // Phase 4 - falling back to QWERTY for now rather than crashing.
      return enQwertyLayout;
  }
}

export function getKeyboardRows(id: KeyboardLayoutId): KeyDefinition[][] {
  switch (id) {
    case "unicode-inscript":
      return hindiInscriptRows;
    case "en-qwerty":
    default:
      return enQwertyRows;
  }
}

export { enQwertyLayout, enQwertyRows, hindiInscriptLayout, hindiInscriptRows };
