import { getKeyboardLayout } from "../keyboards";
import type { KeyboardLayoutOverride } from "../types";
export const LEGACY_LAYOUTS = ["kruti-dev-010", "remington-gail"] as const;
const statuses = ["verified", "unverified", "unsupported"];
export function validateOverride(value: unknown, expectedLayout?: string): asserts value is KeyboardLayoutOverride {
  if (!value || typeof value !== "object") throw new Error("Invalid key mapping");
  const o = value as KeyboardLayoutOverride;
  if (!LEGACY_LAYOUTS.includes(o.layoutId as typeof LEGACY_LAYOUTS[number]) || (expectedLayout && o.layoutId !== expectedLayout)) throw new Error("Mapping layout does not match the selected keyboard");
  const key = getKeyboardLayout(o.layoutId).keys.find((k) => k.code === o.code);
  if (!key || key.isModifier || key.code === "Space") throw new Error("Only printable legacy keys can be overridden");
  if (!statuses.includes(o.status)) throw new Error("Invalid verification status");
  for (const output of [o.normalOutput, o.shiftOutput]) {
    if (output !== undefined && (typeof output !== "string" || !/^[\x20-\x7e]?$/.test(output))) throw new Error("Legacy output must be one printable English key-code");
  }
  if (o.status === "verified" && !o.normalOutput) throw new Error("A verified key needs a normal output");
  if (o.unicodeEquivalent !== undefined && (typeof o.unicodeEquivalent !== "string" || o.unicodeEquivalent.length > 64)) throw new Error("Invalid Unicode preview");
  if (o.sourceNote !== undefined && typeof o.sourceNote !== "string") throw new Error("Invalid mapping source note");
}
export function validateMappingExport(value: unknown): void {
  if (!value || typeof value !== "object") throw new Error("Invalid mapping file");
  const d = value as {kind?: unknown; version?: unknown; layoutId?: unknown; overrides?: unknown; conversions?: unknown};
  if (d.kind !== "typeguru-mapping-export" || d.version !== 1 || !LEGACY_LAYOUTS.includes(d.layoutId as typeof LEGACY_LAYOUTS[number]) || !Array.isArray(d.overrides) || !Array.isArray(d.conversions)) throw new Error("Invalid or unsupported mapping file");
  const codes = new Set<string>();
  for (const o of d.overrides) { validateOverride(o, d.layoutId as string); if (codes.has(o.code)) throw new Error("Duplicate key mapping"); codes.add(o.code); }
  for (const c of d.conversions) {
    if (!c || typeof c !== "object" || c.layoutId !== d.layoutId || typeof c.legacy !== "string" || !c.legacy || typeof c.unicode !== "string" || !c.unicode || typeof c.verified !== "boolean") throw new Error("Invalid conversion mapping");
  }
}
