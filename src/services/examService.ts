import { examDb } from "../db/examDb";
import { BUILT_IN_TEMPLATES } from "../data/examTemplates";
import type { ExamTemplate, ExamResult } from "../types/exam";

export async function getTemplates(): Promise<ExamTemplate[]> {
  const custom = await examDb.examTemplates.toArray();
  const builtins = BUILT_IN_TEMPLATES.map((t, i) => ({ ...t, id: -(i + 1) }));
  const sortedCustom = custom.sort((a, b) => b.updatedAt - a.updatedAt);
  return [...builtins, ...sortedCustom];
}

export async function saveTemplate(t: ExamTemplate): Promise<number> {
  const toSave: ExamTemplate = { ...t, isBuiltIn: false, updatedAt: Date.now() };
  if (toSave.id && toSave.id > 0) {
    await examDb.examTemplates.update(toSave.id, toSave);
    return toSave.id;
  }
  const { id: _id, ...rest } = toSave;
  void _id;
  return await examDb.examTemplates.add(rest as ExamTemplate);
}

export async function deleteTemplate(id: number): Promise<void> {
  if (id > 0) await examDb.examTemplates.delete(id);
}

export async function getResults(profileId: number): Promise<ExamResult[]> {
  const all = await examDb.examResults.where("profileId").equals(profileId).toArray();
  return all.sort((a, b) => b.takenAt - a.takenAt);
}

export async function saveResult(r: ExamResult): Promise<number> {
  const { id: _id, ...rest } = r;
  void _id;
  return await examDb.examResults.add(rest as ExamResult);
}

export function computeExamMetrics(input: {
  typedChars: number;
  correctChars: number;
  errors: number;
  keyDepressions: number;
  durationSeconds: number;
  minAccuracy: number;
  targetWpm: number;
  targetKdph: number;
}): { grossWpm: number; netWpm: number; accuracy: number; kdph: number; passed: boolean } {
  const minutes = input.durationSeconds > 0 ? input.durationSeconds / 60 : 1 / 60;
  const hours = input.durationSeconds > 0 ? input.durationSeconds / 3600 : 1 / 3600;
  const grossWpm = Math.round(input.typedChars / 5 / minutes);
  const netWpm = Math.max(0, Math.round(input.correctChars / 5 / minutes));
  const accuracy = input.typedChars > 0 ? Math.round((input.correctChars / input.typedChars) * 100) : 0;
  const kdph = Math.round(input.keyDepressions / hours);
  const passed = netWpm >= input.targetWpm && kdph >= input.targetKdph && accuracy >= input.minAccuracy;
  return { grossWpm, netWpm, accuracy, kdph, passed };
}
