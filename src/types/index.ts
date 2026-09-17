export type InterfaceLanguage = "en" | "hi";
export type TypingLanguage = "en" | "hi";
export type HindiLayoutId = "unicode-inscript" | "kruti-dev-010" | "remington-gail" | "hindi-phonetic";
export type KeyboardLayoutId = "en-qwerty" | HindiLayoutId;
export type EncodingType = "unicode" | "legacy-font";
export type MappingVerificationStatus = "verified" | "unverified" | "unsupported";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type FingerId = "left-pinky" | "left-ring" | "left-middle" | "left-index" | "left-thumb" | "right-thumb" | "right-index" | "right-middle" | "right-ring" | "right-pinky";
export type HandId = "left" | "right";
export type KeyboardRow = "number" | "top" | "home" | "bottom" | "space";
export interface KeyDefinition {
  code: string; normalLabel: string; shiftLabel?: string; output: string; shiftOutput?: string;
  finger: FingerId; hand: HandId; row: KeyboardRow; width?: number; isModifier?: boolean; displayHint?: string;
  unicodeComposition?: string; legacyOutput?: { normal?: string; shift?: string; verified?: boolean };
  encodingType?: EncodingType; renderedPreview?: string; unicodeEquivalent?: string;
  mappingStatus?: MappingVerificationStatus; mappingSource?: string;
}
export interface KeyboardLayoutDefinition { id: KeyboardLayoutId; label: string; labelHi: string; isLegacyEncoding: boolean; keys: KeyDefinition[]; }
export interface Profile { id?: number; displayName: string; avatarColor: string; preferredInterfaceLanguage: InterfaceLanguage; preferredTypingLanguage: TypingLanguage; preferredLayout: KeyboardLayoutId; skillLevel: SkillLevel; dailyGoalMinutes: number; createdAt: string; lastActiveAt: string; lastLessonId?: string; isDemo?: boolean; }
export interface AppSettings { id?: number; profileId: number; theme: "light" | "dark"; fontSize: number; soundEnabled: boolean; animationsEnabled: boolean; reducedMotion: boolean; hintDelayMs: number; showKeyboard: boolean; showHands: boolean; showFingerColors: boolean; strictMode: boolean; backspaceAllowed: boolean; autoScroll: boolean; startTimerOnFirstKey: boolean; pauseOnFocusLoss: boolean; calculationMethod: "character" | "word" | "keystroke"; adaptiveEnabled: boolean; minAccuracy: number; minWpm: number; lockNextLesson: boolean; breakReminderMinutes: number | null; showPhysicalKeyHints: boolean; hindiNormalization: "NFC" | "none"; }
export type ExerciseType = "key-drill" | "sequence-drill" | "word-drill" | "sentence-drill" | "paragraph-drill" | "text-drill" | "timed-drill" | "accuracy-drill" | "speed-drill" | "lesson-exam";
export interface LessonExercise { type: ExerciseType; text: string; label?: string; labelHi?: string; }
export interface Lesson { id: string; courseId: string; language: TypingLanguage; layout: KeyboardLayoutId; order: number; title: string; titleHi?: string; description: string; descriptionHi?: string; newKeys: string[]; requiredKeys: string[]; exerciseType: ExerciseType; practiceText: string; exercises?: LessonExercise[]; suggestedDurationSec: number; passWpm: number; passAccuracy: number; }
export interface Course { id: string; language: TypingLanguage; title: string; titleHi?: string; order: number; }
export interface AttemptResult { id?: number; profileId: number; language: TypingLanguage; layout: KeyboardLayoutId; courseId?: string; lessonId?: string; testId?: string; kind: "lesson" | "test" | "game" | "review"; dateTime: string; durationSec: number; totalKeystrokes: number; correctKeystrokes: number; incorrectKeystrokes: number; correctedErrors: number; uncorrectedErrors: number; backspaces: number; grossWpm: number; netWpm: number; accuracy: number; kdph?: number; keyStats: Record<string, { attempts: number; errors: number; avgMs: number }>; bigramStats: Record<string, { attempts: number; errors: number }>; completed: boolean; passed?: boolean; encodingType?: EncodingType; physicalKeySequence?: string[]; rawLegacyText?: string; }
export interface Certificate { id?: number; profileId: number; attemptId: number; certificateCode: string; issuedAt: string; }
export interface DailyProgress { id?: number; profileId: number; language: TypingLanguage; date: string; minutesPracticed: number; lessonsCompleted: number; avgWpm: number; avgAccuracy: number; }
export interface KeyboardLayoutOverride { id?: number; layoutId: KeyboardLayoutId; code: string; normalOutput?: string; shiftOutput?: string; unicodeEquivalent?: string; status: MappingVerificationStatus; sourceNote?: string; updatedAt: string; }
export interface KeyboardMappingVerification { id?: number; layoutId: KeyboardLayoutId; totalMappableKeys: number; verifiedCount: number; unverifiedCount: number; unsupportedCount: number; updatedAt: string; }
export interface ConversionMapping { id?: number; layoutId: KeyboardLayoutId; legacy: string; unicode: string; verified: boolean; }
export interface FontStatusRecord { id?: number; fontFamily: string; status: "installed" | "missing" | "failed" | "unknown"; detail?: string; checkedAt: string; }
export interface CustomLegacyText { id?: number; layoutId: KeyboardLayoutId; text: string; createdAt: string; }
