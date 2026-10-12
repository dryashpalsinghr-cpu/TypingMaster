import type { KeyboardLayoutDefinition, KeyboardLayoutOverride, KeyDefinition } from "../types";
import { krutiKeyLabel } from "../converter/krutiDevCore";
export function mergeKeyboardOverrides(base: KeyboardLayoutDefinition, overrides: KeyboardLayoutOverride[]): KeyboardLayoutDefinition {
  const byCode = new Map(overrides.map((o) => [o.code, o]));
  return { ...base, keys: base.keys.map((key): KeyDefinition => {
    const o = byCode.get(key.code);
    if (!o || key.isModifier || key.code === "Space") return key;
    const output = o.status === "unsupported" ? "" : o.normalOutput ?? key.output;
    const shiftOutput = o.status === "unsupported" ? "" : o.shiftOutput ?? key.shiftOutput;
    const normalLabel = o.unicodeEquivalent || (base.id === "kruti-dev-010" ? krutiKeyLabel(output) : output);
    const shiftLabel = base.id === "kruti-dev-010" ? krutiKeyLabel(shiftOutput ?? "") : shiftOutput;
    return { ...key, output, shiftOutput, normalLabel, shiftLabel,
      legacyOutput: { normal: output, shift: shiftOutput, verified: o.status === "verified" },
      unicodeEquivalent: normalLabel, renderedPreview: normalLabel,
      mappingStatus: o.status, mappingSource: o.sourceNote ?? key.mappingSource };
  }) };
}
