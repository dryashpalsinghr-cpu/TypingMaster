import { db } from "../db/database";
import { getKeyboardLayout } from "../keyboards";
import type { KeyboardLayoutId, KeyboardLayoutOverride, KeyboardMappingVerification, MappingVerificationStatus, ConversionMapping, FontStatusRecord } from "../types";
export interface MappingExport { kind: "typeguru-mapping-export"; version: 1; layoutId: KeyboardLayoutId; exportedAt: string; overrides: KeyboardLayoutOverride[]; conversions: ConversionMapping[]; }
export async function getOverrides(layoutId: KeyboardLayoutId): Promise<KeyboardLayoutOverride[]> { return db.keyboardLayoutOverrides.where("layoutId").equals(layoutId).toArray(); }
export async function upsertOverride(o: Omit<KeyboardLayoutOverride, "id" | "updatedAt"> & { updatedAt?: string }): Promise<void> {
  const existing = await db.keyboardLayoutOverrides.where("[layoutId+code]").equals([o.layoutId, o.code]).first();
  const row: KeyboardLayoutOverride = { layoutId: o.layoutId, code: o.code, normalOutput: o.normalOutput, shiftOutput: o.shiftOutput, unicodeEquivalent: o.unicodeEquivalent, status: o.status, sourceNote: o.sourceNote, updatedAt: new Date().toISOString() };
  if (existing && existing.id != null) await db.keyboardLayoutOverrides.update(existing.id, row); else await db.keyboardLayoutOverrides.add(row);
}
export async function resetOverrides(layoutId: KeyboardLayoutId): Promise<void> {
  await db.keyboardLayoutOverrides.where("layoutId").equals(layoutId).delete();
  await db.keyboardMappingVerification.where("layoutId").equals(layoutId).delete();
}
export async function getMergedLayout(layoutId: KeyboardLayoutId) {
  const base = getKeyboardLayout(layoutId); const overrides = await getOverrides(layoutId);
  const byCode = new Map(overrides.map((o) => [o.code, o]));
  return base.keys.map((k) => {
    const o = byCode.get(k.code); if (!o) return k;
    return { ...k, legacyOutput: { normal: o.normalOutput ?? k.legacyOutput?.normal, shift: o.shiftOutput ?? k.legacyOutput?.shift, verified: o.status === "verified" }, unicodeEquivalent: o.unicodeEquivalent ?? k.unicodeEquivalent, mappingStatus: o.status, mappingSource: o.sourceNote ?? k.mappingSource };
  });
}
export async function getVerificationSummary(layoutId: KeyboardLayoutId): Promise<KeyboardMappingVerification> {
  const base = getKeyboardLayout(layoutId); const mappable = base.keys.filter((k) => !k.isModifier);
  const overrides = await getOverrides(layoutId); const byCode = new Map(overrides.map((o) => [o.code, o]));
  let verified = 0; let unverified = 0; let unsupported = 0;
  for (const k of mappable) {
    const status: MappingVerificationStatus = byCode.get(k.code)?.status ?? k.mappingStatus ?? "unverified";
    if (status === "verified") verified++; else if (status === "unsupported") unsupported++; else unverified++;
  }
  return { layoutId, totalMappableKeys: mappable.length, verifiedCount: verified, unverifiedCount: unverified, unsupportedCount: unsupported, updatedAt: new Date().toISOString() };
}
export async function isLayoutLessonReady(layoutId: KeyboardLayoutId): Promise<boolean> {
  const s = await getVerificationSummary(layoutId); return s.totalMappableKeys > 0 && s.verifiedCount === s.totalMappableKeys;
}
export async function getConversionMappings(layoutId: KeyboardLayoutId): Promise<ConversionMapping[]> { return db.conversionMappings.where("layoutId").equals(layoutId).toArray(); }
export async function upsertConversionMapping(m: Omit<ConversionMapping, "id">): Promise<void> {
  const existing = await db.conversionMappings.where("layoutId").equals(m.layoutId).and((r) => r.legacy === m.legacy && r.unicode === m.unicode).first();
  if (existing && existing.id != null) await db.conversionMappings.update(existing.id, m); else await db.conversionMappings.add(m as ConversionMapping);
}
export async function saveFontStatus(s: Omit<FontStatusRecord, "id" | "checkedAt"> & { checkedAt?: string }): Promise<void> {
  const existing = await db.fontStatus.where("fontFamily").equals(s.fontFamily).first();
  const row: FontStatusRecord = { fontFamily: s.fontFamily, status: s.status, detail: s.detail, checkedAt: new Date().toISOString() };
  if (existing && existing.id != null) await db.fontStatus.update(existing.id, row); else await db.fontStatus.add(row);
}
export async function getFontStatus(fontFamily: string): Promise<FontStatusRecord | undefined> { return db.fontStatus.where("fontFamily").equals(fontFamily).first(); }
export async function exportMappings(layoutId: KeyboardLayoutId): Promise<MappingExport> {
  return { kind: "typeguru-mapping-export", version: 1, layoutId, exportedAt: new Date().toISOString(), overrides: await getOverrides(layoutId), conversions: await getConversionMappings(layoutId) };
}
export async function importMappings(data: MappingExport): Promise<number> {
  if (!data || data.kind !== "typeguru-mapping-export") throw new Error("Invalid mapping file");
  let count = 0;
  for (const o of data.overrides ?? []) { const { id: _id, ...rest } = o; await upsertOverride(rest); count++; }
  for (const c of data.conversions ?? []) { const { id: _id, ...rest } = c; await upsertConversionMapping(rest); count++; }
  return count;
}
