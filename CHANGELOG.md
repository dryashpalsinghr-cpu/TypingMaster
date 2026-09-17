# Changelog

## Phase 3 — Hindi Unicode InScript

### Added
- `src/keyboards/hindiInscript.ts` — Hindi Unicode InScript keyboard layout
  data, reusing physical key positions/finger-hand assignments from
  `enQwerty.ts`.
- `src/keyboards/resolveInput.ts` — physical-key → output resolver shared
  by every layout (`resolveKeyOutput`, `findKeyForOutput`,
  `outputRequiresShift`).
- `src/data/lessons/hindiInscriptBeginner.ts` — 10 original Hindi InScript
  beginner lessons, each with 3+ exercises.
- `src/data/lessons/index.ts` — combined English+Hindi lesson/course
  registry (`getLessonsForLanguage`, `getCourseForLanguage`,
  `getLessonById`, `getLessonExercises`, `getContinueLesson`).
- `src/pages/KeyboardChartPage.tsx` — English + Hindi keyboard chart with
  an honest Windows InScript setup guide.
- `src/i18n/strings.ts` + `src/hooks/useTranslation.ts` — bilingual UI
  string dictionary and `useT()` hook.
- `Lesson.exercises` (optional) on the `Lesson` type — lets one lesson
  contain multiple drills (key/word/sentence) without breaking existing
  single-exercise English lessons.
- `DailyProgress.language` field + Dexie schema **v2** with an in-place
  migration for existing rows.
- `getLanguageProgress()` in `statsService.ts` for per-language dashboard
  cards.
- New nav route: `/keyboard-chart`.
- Typing-language + Hindi-layout selectors in `AppHeader`, persisted to the
  active profile.
- Independent interface-language selector at profile creation (previously
  tied 1:1 to typing language).

### Changed
- `src/engine/typingEngine.ts` — `CharacterState` now tracks a per-cell
  `typedBuffer` so a grapheme cluster spanning multiple keystrokes (matra,
  halant conjunct) is compared correctly; English single-keystroke
  characters behave exactly as before.
- `VirtualKeyboard` — now takes `rows: KeyDefinition[][]` instead of being
  hardcoded to `enQwertyRows`; added `shiftRequired`, `physicalHints`, and
  `devanagari` props.
- `PracticeText` — added `devanagari` prop to switch to Noto Sans
  Devanagari instead of the monospace English font.
- `LessonPracticePage` — fully rewritten to be language/layout-agnostic,
  resolve keystrokes via `resolveKeyOutput()` instead of `KeyboardEvent.key`,
  and step through a lesson's full exercise list before advancing
  `lastLessonId`.
- `DashboardPage`, `LearnPage`, `AppSidebar` — now read from the combined
  lesson registry and the new i18n dictionary instead of importing
  `englishBeginnerLessons` directly.
- `SettingsPage` — added the Hindi settings section (physical-key hints
  toggle, Unicode normalization mode).

### Fixed
- Nothing broken from Phase 2 is expected to have regressed: English
  keystroke resolution now goes through the same `resolveKeyOutput()` path
  used for Hindi, but on a standard QWERTY physical keyboard this produces
  identical output to the previous `KeyboardEvent.key`-based logic.

### Unchanged (verified)
- Windows build workflow (`.github/workflows/build-windows-exe.yml`) and
  Tauri config (`src-tauri/`) — not touched this phase.
- WPM/KPM/Net WPM/accuracy/KDPH formulas in `calculateMetrics()`.
- English lesson content (`englishBeginner.ts`).
