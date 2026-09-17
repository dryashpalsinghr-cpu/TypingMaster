import Dexie, { type EntityTable } from "dexie";
import type { Profile, AppSettings, Course, Lesson, AttemptResult, Certificate, DailyProgress, KeyboardLayoutOverride, KeyboardMappingVerification, ConversionMapping, FontStatusRecord, CustomLegacyText } from "../types";
class TypeGuruDB extends Dexie {
  profiles!: EntityTable<Profile, "id">;
  settings!: EntityTable<AppSettings, "id">;
  courses!: EntityTable<Course, "id">;
  lessons!: EntityTable<Lesson, "id">;
  attempts!: EntityTable<AttemptResult, "id">;
  certificates!: EntityTable<Certificate, "id">;
  dailyProgress!: EntityTable<DailyProgress, "id">;
  keyboardLayoutOverrides!: EntityTable<KeyboardLayoutOverride, "id">;
  keyboardMappingVerification!: EntityTable<KeyboardMappingVerification, "id">;
  conversionMappings!: EntityTable<ConversionMapping, "id">;
  fontStatus!: EntityTable<FontStatusRecord, "id">;
  customLegacyTexts!: EntityTable<CustomLegacyText, "id">;
  constructor() {
    super("typeguru-pro-db");
    this.version(1).stores({
      profiles: "++id, displayName, preferredTypingLanguage", settings: "++id, profileId",
      courses: "id, language, order", lessons: "id, courseId, language, layout, order",
      attempts: "++id, profileId, language, layout, courseId, lessonId, dateTime, kind",
      certificates: "++id, profileId, attemptId, certificateCode", dailyProgress: "++id, profileId, date",
    });
    this.version(2).stores({ dailyProgress: "++id, profileId, date, language, [profileId+language]" }).upgrade(async (tx) => {
      await tx.table("dailyProgress").toCollection().modify((row: { language?: string }) => { row.language ??= "en"; });
    });
    this.version(3).stores({
      keyboardLayoutOverrides: "++id, layoutId, code, status, [layoutId+code]",
      keyboardMappingVerification: "++id, layoutId",
      conversionMappings: "++id, layoutId, legacy, unicode",
      fontStatus: "++id, fontFamily",
      customLegacyTexts: "++id, layoutId, createdAt",
    });
  }
}
export const db = new TypeGuruDB();
export const DEFAULT_SETTINGS: Omit<AppSettings, "id" | "profileId"> = { theme: "light", fontSize: 20, soundEnabled: true, animationsEnabled: true, reducedMotion: false, hintDelayMs: 600, showKeyboard: true, showHands: true, showFingerColors: true, strictMode: false, backspaceAllowed: true, autoScroll: true, startTimerOnFirstKey: true, pauseOnFocusLoss: true, calculationMethod: "character", adaptiveEnabled: true, minAccuracy: 90, minWpm: 20, lockNextLesson: false, breakReminderMinutes: 30, showPhysicalKeyHints: true, hindiNormalization: "NFC" };
