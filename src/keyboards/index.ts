import type { KeyboardLayoutId, KeyboardLayoutDefinition, KeyDefinition } from "../types";
import { enQwertyLayout, enQwertyRows } from "./enQwerty";
import { hindiInscriptLayout, hindiInscriptRows } from "./hindiInscript";
import { krutiDev010Layout, krutiDev010Rows } from "./krutiDev010";
import { remingtonGailLayout, remingtonGailRows } from "./remingtonGail";
export function getKeyboardLayout(id: KeyboardLayoutId): KeyboardLayoutDefinition {
  switch (id) {
    case "unicode-inscript": return hindiInscriptLayout;
    case "kruti-dev-010": return krutiDev010Layout;
    case "remington-gail": return remingtonGailLayout;
    case "en-qwerty": default: return enQwertyLayout;
  }
}
export function getKeyboardRows(id: KeyboardLayoutId): KeyDefinition[][] {
  switch (id) {
    case "unicode-inscript": return hindiInscriptRows;
    case "kruti-dev-010": return krutiDev010Rows;
    case "remington-gail": return remingtonGailRows;
    case "en-qwerty": default: return enQwertyRows;
  }
}
export { enQwertyLayout, enQwertyRows, hindiInscriptLayout, hindiInscriptRows, krutiDev010Layout, krutiDev010Rows, remingtonGailLayout, remingtonGailRows };
