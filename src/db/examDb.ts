import Dexie, { type Table } from "dexie";
import type { ExamTemplate, ExamResult, CertificateRecord } from "../types/exam";
// Phase 5 uses its OWN IndexedDB database so the main typeguru-pro-db schema
// does not need to be modified. Booleans are intentionally NOT indexed.
export class ExamDB extends Dexie {
  examTemplates!: Table<ExamTemplate, number>;
  examResults!: Table<ExamResult, number>;
  certificates!: Table<CertificateRecord, number>;
  constructor() {
    super("typeguru-exam-db");
    this.version(1).stores({
      examTemplates: "++id, category, updatedAt",
      examResults: "++id, profileId, templateId, takenAt",
      certificates: "++id, profileId, resultId, issuedAt",
    });
  }
}
export const examDb = new ExamDB();
