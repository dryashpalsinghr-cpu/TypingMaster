# TypeGuru Pro — Project Status

## Phase 1 — App Shell ✅
Original branding, local multi-profile system (no login), dashboard shell,
settings, IndexedDB architecture (Dexie).

## Phase 2 — English Typing Engine ✅
English QWERTY keyboard-layout data (`src/keyboards/enQwerty.ts`), finger/hand
guidance, grapheme-aware typing engine, real-time WPM/KPM/accuracy
calculation, 10-lesson beginner course, results saved to IndexedDB and
reflected on the dashboard.

## Phase 3 — Hindi Unicode InScript ✅ (this build)

**Keyboard layer**
- `src/keyboards/hindiInscript.ts` — InScript mapped onto the same physical
  key positions as QWERTY (`KeyboardEvent.code`-keyed), normal + Shift
  layers, finger/hand assignment inherited from the physical position.
  Every mapped key is documented; a handful of rarer keys are intentionally
  left unmapped rather than guessed (see the file's header comment).
- `src/keyboards/resolveInput.ts` — resolves what a physical key produces on
  *any* layout from its own table, independent of the OS keyboard layout.
  This is what lets Hindi InScript typing work correctly in the browser
  without requiring Windows to actually be set to InScript.
- `src/pages/KeyboardChartPage.tsx` — static reference chart for both
  English and Hindi layouts, with an honest Windows InScript setup guide
  (clearly stated as optional, not required, for using this app).

**Typing engine**
- `src/engine/typingEngine.ts` was extended (not replaced) so each "cell" is
  a full Unicode grapheme cluster (`Intl.Segmenter`, NFC-normalized) that
  can require more than one physical keystroke — this is what correctly
  handles matras, halant/virama conjuncts, anusvara, chandrabindu, and
  visarga without ever comparing Hindi text with plain JS string indexing.
  English lessons are unaffected: a Latin character is just a one-keystroke
  cluster, so old behaviour is preserved exactly.
- WPM, KPM, Net WPM, accuracy, and KDPH formulas are untouched.

**Lessons**
- `src/data/lessons/hindiInscriptBeginner.ts` — 10 original lessons (home
  row → basic vowels → basic consonants → left-hand keys → right-hand keys
  → matras → halant/half-letters → Shift-layer characters → common words →
  sentences/paragraph). Every lesson has at least 3 exercises (key drill,
  word drill, sentence/paragraph drill) via the new `Lesson.exercises[]`
  field — English lessons don't use this field and are unaffected.
- `src/data/lessons/index.ts` — combined English+Hindi registry used by the
  UI instead of importing per-language files directly.

**UI integration**
- `LessonPracticePage` is now language/layout-agnostic: it looks up the
  lesson's own `layout`, renders the matching virtual keyboard, and resolves
  every keystroke through `resolveKeyOutput()` rather than trusting
  `KeyboardEvent.key`.
- `VirtualKeyboard` takes `rows` instead of being hardcoded to English, adds
  an optional physical-English-key hint overlay (Hindi mode only), and
  highlights the Shift key whenever the *next* required character needs it
  (not only when Shift is physically held).
- `AppHeader` gained a typing-language selector and a Hindi-layout selector
  (only InScript is enabled; Kruti Dev / Remington GAIL show as
  "Phase 4", disabled) — the choice is saved to the active profile.
- `DashboardPage` shows English and Hindi progress as two separate cards
  (lessons completed / avg WPM / avg accuracy), backed by a new
  `getLanguageProgress()` stats helper. "Continue" opens the profile's
  `preferredTypingLanguage` and its `lastLessonId` correctly.
- A first pass of full interface translation (`src/i18n/`) now covers
  navigation, dashboard, learn, typing screen, settings, and a couple of
  generic error strings, switchable independently of typing language.

**Data model**
- `Profile`, `AppSettings`, `AttemptResult` already had language/layout
  fields from Phase 1/2 groundwork; `DailyProgress` gained a `language`
  field (Dexie schema bumped to **v2** with an in-place migration — no data
  loss for existing Phase 2 users, whose rows are tagged `en`).

Not touched this phase (by design): Kruti Dev 010, Remington GAIL, Hindi
Phonetic, Typing Test, Exam Mode, Personalized Review, Statistics heatmaps,
Certificates, Games, Admin/Content Editor. These remain honest
"Scheduled: Phase N" screens — nothing pretends to work that doesn't yet.

## Verified this phase
- `npm run typecheck` — no errors
- `npm run build` — succeeds, no runtime warnings besides the expected
  "Kruti Dev font not found at build time" notice (intentional — see
  `public/fonts/README.md`)
- Manual review of every Hindi word used in lesson content against the
  InScript mapping table (see `hindiInscriptBeginner.ts` header comment)
- English course, dashboard, settings, and profile flows re-checked against
  the Phase 2 build to confirm no regression
