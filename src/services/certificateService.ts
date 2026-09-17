import { examDb } from "../db/examDb";
import type { ExamResult, CertificateRecord } from "../types/exam";

export async function issueCertificate(result: ExamResult, recipientName: string): Promise<CertificateRecord> {
  const serial = "TG-" + result.category.toUpperCase() + "-" + Date.now().toString(36).toUpperCase();
  const rec: CertificateRecord = {
    profileId: result.profileId,
    resultId: result.id ?? 0,
    recipientName: recipientName.trim() || "Learner",
    templateName: result.templateName,
    category: result.category,
    netWpm: result.netWpm,
    accuracy: result.accuracy,
    kdph: result.kdph,
    issuedAt: Date.now(),
    serial,
  };
  const id = await examDb.certificates.add(rec);
  return { ...rec, id };
}

export async function getCertificates(profileId: number): Promise<CertificateRecord[]> {
  const all = await examDb.certificates.where("profileId").equals(profileId).toArray();
  return all.sort((a, b) => b.issuedAt - a.issuedAt);
}
