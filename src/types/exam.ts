export type ExamCategory = "ssc" | "rrb" | "cpct" | "custom";
export interface ExamTemplate {
  id?: number;
  category: ExamCategory;
  name: string;
  description: string;
  language: "en" | "hi";
  durationSeconds: number;
  passage: string;
  targetWpm: number;
  targetKdph: number;
  minAccuracy: number;
  allowBackspace: boolean;
  focusLossLimit: number;
  isBuiltIn: boolean;
  updatedAt: number;
}
export interface ExamResult {
  id?: number;
  profileId: number;
  templateId: number;
  templateName: string;
  category: ExamCategory;
  language: "en" | "hi";
  takenAt: number;
  durationSeconds: number;
  typedChars: number;
  correctChars: number;
  errors: number;
  keyDepressions: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  kdph: number;
  focusLossCount: number;
  passed: boolean;
}
export interface CertificateRecord {
  id?: number;
  profileId: number;
  resultId: number;
  recipientName: string;
  templateName: string;
  category: ExamCategory;
  netWpm: number;
  accuracy: number;
  kdph: number;
  issuedAt: number;
  serial: string;
}
