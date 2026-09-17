// ===== Core shared types for TypeGuru Pro =====

export type InterfaceLanguage = "en" | "hi";
export type TypingLanguage = "en" | "hi";

export type HindiLayoutId =
  | "unicode-inscript"
  | "kruti-dev-010"
  | "remington-gail"
  | "hindi-phonetic";

export type KeyboardLayoutId = "en-qwerty" | HindiLayoutId;

export type FingerId =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "left-thumb"
  | "right-thumb"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";

export type HandId = "left" | "right";

export type KeyboardRow = "number" | "top" | "home" | "bottom" | "space";

export interface KeyDefinition {
  code: string; // KeyboardEvent.code, e.g. "KeyF"
  normalLabel: string;
  shiftLabel?: string;
  output: string; // character produced without shift
  shiftOutput?: string; // character produced with shift
  finger: FingerId;
  hand: HandId;
  row: KeyboardRow;
  width?: number; // relative key width, default 1
  isModifier?: boolean;
  displayHint?: string;
  unicodeComposition?: string; // notes on matra/virama composition behaviour
  legacyOutput?: {
    normal?: string;
    shift?: string;
    verified?: boolean;
  };
}

export interface KeyboardLayoutDefinition {
  id: KeyboardLayoutId;
  label: string;
  labelHi: string;
  isLegacyEncoding: boolean; // true for Kruti Dev / Remington
  keys: KeyDefinition[];
}

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface Profile {
  id?: number;
  displayName: string;
  avatarColor: string;
  preferredInterfaceLanguage: InterfaceLanguage;
  preferredTypingLanguage: TypingLanguage;
  preferredLayout: KeyboardLayoutId;
  skillLevel: SkillLevel;
  dailyGoalMinutes: number;
  createdAt: string;
  lastActiveAt: string;
  lastLessonId?: string;
  isDemo?: boolean;
}

export interface AppSettings {
  id?: number;
  profileId: number;
  theme: "light" | "dark";
  fontSize: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  hintDelayMs: number;
  showKeyboard: boolean;
  showHands: boolean;
  showFingerColors: boolean;
  strictMode: boolean;
  backspaceAllowed: boolean;
  autoScroll: boolean;
  startTimerOnFirstKey: boolean;
  pauseOnFocusLoss: boolean;
  calculationMethod: "character" | "word" | "keystroke";
  adaptiveEnabled: boolean;
  minAccuracy: number;
  minWpm: number;
  lockNextLesson: boolean;
  breakReminderMinutes: number | null;
  // Hindi-specific (spec section 21 "Hindi" settings group)
  showPhysicalKeyHints: boolean; // show the underlying English key label on Hindi virtual keys
  hindiNormalization: "NFC" | "none";
}

export type ExerciseType =
  | "key-drill"
  | "sequence-drill"
  | "word-drill"
  | "sentence-drill"
  | "paragraph-drill"
  | "text-drill"
  | "timed-drill"
  | "accuracy-drill"
  | "speed-drill"
  | "lesson-exam";

export interface LessonExercise {
  type: ExerciseType;
  text: string;
  label?: string;
  labelHi?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  language: TypingLanguage;
  layout: KeyboardLayoutId;
  order: number;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  newKeys: string[];
  requiredKeys: string[];
  exerciseType: ExerciseType;
  practiceText: string;
  /**
   * Optional additional exercises within the same lesson (spec requires at
   * least a key drill + word drill + sentence/paragraph drill per Hindi
   * lesson). When present, the practice screen steps through
   * [{type: exerciseType, text: practiceText}, ...exercises] in order and
   * only advances the profile's lastLessonId once every exercise in the
   * lesson is complete. English lessons from Phase 2 omit this field and
   * keep behaving exactly as a single-exercise lesson.
   */
  exercises?: LessonExercise[];
  suggestedDurationSec: number;
  passWpm: number;
  passAccuracy: number;
}

export interface Course {
  id: string;
  language: TypingLanguage;
  title: string;
  titleHi?: string;
  order: number;
}

export interface AttemptResult {
  id?: number;
  profileId: number;
  language: TypingLanguage;
  layout: KeyboardLayoutId;
  courseId?: string;
  lessonId?: string;
  testId?: string;
  kind: "lesson" | "test" | "game" | "review";
  dateTime: string;
  durationSec: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  backspaces: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  kdph?: number;
  keyStats: Record<string, { attempts: number; errors: number; avgMs: number }>;
  bigramStats: Record<string, { attempts: number; errors: number }>;
  completed: boolean;
  passed?: boolean;
}

export interface Certificate {
  id?: number;
  profileId: number;
  attemptId: number;
  certificateCode: string;
  issuedAt: string;
}

export interface DailyProgress {
  id?: number;
  profileId: number;
  language: TypingLanguage;
  date: string; // yyyy-mm-dd
  minutesPracticed: number;
  lessonsCompleted: number;
  avgWpm: number;
  avgAccuracy: number;
}
