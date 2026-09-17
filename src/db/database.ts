import Dexie, { type EntityTable } from "dexie";
import type {
  Profile,
  AppSettings,
  Course,
  Lesson,
  AttemptResult,
  Certificate,
  DailyProgress,
} from "../types";

// TypeGuru Pro offline database.
// Every store here maps directly to the data model described in the spec
// (section 23 - Offline Storage and Data Model). Kept intentionally simple
// for Phase 1/2; more stores (KeyboardLayouts overrides, GameScores,
// CustomTexts, Backups, BigramStatistics as its own table) get added as
// later phases land, following the same migration pattern below.

class TypeGuruDB extends Dexie {
  profiles!: EntityTable<Profile, "id">;
  settings!: EntityTable<AppSettings, "id">;
  courses!: EntityTable<Course, "id">;
  lessons!: EntityTable<Lesson, "id">;
  attempts!: EntityTable<AttemptResult, "id">;
  certificates!: EntityTable<Certificate, "id">;
  dailyProgress!: EntityTable<DailyProgress, "id">;

  constructor() {
    super("typeguru-pro-db");

    // v1 - Phase 1 + Phase 2 schema
    this.version(1).stores({
      profiles: "++id, displayName, preferredTypingLanguage",
      settings: "++id, profileId",
      courses: "id, language, order",
      lessons: "id, courseId, language, layout, order",
      attempts:
        "++id, profileId, language, layout, courseId, lessonId, dateTime, kind",
      certificates: "++id, profileId, attemptId, certificateCode",
      dailyProgress: "++id, profileId, date",
    });
  }
}

export const db = new TypeGuruDB();

export const DEFAULT_SETTINGS: Omit<AppSettings, "id" | "profileId"> = {
  theme: "light",
  fontSize: 20,
  soundEnabled: true,
  animationsEnabled: true,
  reducedMotion: false,
  hintDelayMs: 600,
  showKeyboard: true,
  showHands: true,
  showFingerColors: true,
  strictMode: false,
  backspaceAllowed: true,
  autoScroll: true,
  startTimerOnFirstKey: true,
  pauseOnFocusLoss: true,
  calculationMethod: "character",
  adaptiveEnabled: true,
  minAccuracy: 90,
  minWpm: 20,
  lockNextLesson: false,
  breakReminderMinutes: 30,
};
