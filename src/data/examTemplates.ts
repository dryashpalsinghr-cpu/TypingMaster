import type { ExamTemplate } from "../types/exam";
import { englishExam1, englishExam2, hindiExam1 } from "./examPassages";
// Built-in templates are EDITABLE starting points. Duration and target numbers
// are illustrative defaults - adjust them to the current official notification.
// All passages below are original practice text, not copied from any exam.
export const BUILT_IN_TEMPLATES: ExamTemplate[] = [
  {
    category: "ssc",
    name: "SSC Style (English)",
    description: "English typing test format. Edit duration and targets to match the current notification.",
    language: "en",
    durationSeconds: 600,
    targetWpm: 35,
    targetKdph: 10500,
    minAccuracy: 90,
    allowBackspace: true,
    focusLossLimit: 3,
    isBuiltIn: true,
    updatedAt: 0,
    passage: englishExam1,
  },
  {
    category: "rrb",
    name: "RRB Style (English)",
    description: "Railways typing practice format. Adjust the targets as required.",
    language: "en",
    durationSeconds: 600,
    targetWpm: 30,
    targetKdph: 9000,
    minAccuracy: 88,
    allowBackspace: true,
    focusLossLimit: 3,
    isBuiltIn: true,
    updatedAt: 0,
    passage: englishExam2,
  },
  {
    category: "cpct",
    name: "CPCT Style (Kruti Dev 010)",
    description: "Kruti Dev 010 Hindi typing practice using normal US-keyboard codes.",
    language: "hi",
    durationSeconds: 900,
    targetWpm: 25,
    targetKdph: 7500,
    minAccuracy: 85,
    allowBackspace: true,
    focusLossLimit: 3,
    isBuiltIn: true,
    updatedAt: 0,
    passage: hindiExam1,
  },
];
