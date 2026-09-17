# Next Phase

## Phase 4 — Kruti Dev 010 and Remington GAIL

**Kruti Dev 010 (legacy non-Unicode)**
- New `src/keyboards/krutiDev010.ts` following the exact shape of
  `enQwerty.ts`/`hindiInscript.ts` — `KeyDefinition.legacyOutput` already
  exists in the type (`{ normal, shift, verified }`) specifically for this;
  it was added in Phase 1 groundwork and is unused until now.
- Do **not** reuse the InScript Unicode mapping — Kruti Dev is a different,
  legacy glyph-position encoding. Keep its lesson text, expected key
  sequences, and rendering logic entirely separate from Hindi Unicode
  (per the project's own rule in the original spec).
- Only mark a key `verified: true` once cross-checked against an
  authoritative Kruti Dev chart — never guess a mapping. Unverified keys
  render with a visible "needs verification" marker rather than a silent
  best guess.
- Font: this app still does not bundle or download Kruti Dev 010. The
  `public/fonts/README.md` setup guide from Phase 3 already covers this —
  Phase 4 should make the "missing font" state visible in the Kruti Dev
  practice screen itself (an honest setup notice, not a silent wrong-font
  render).
- Add the keyboard-mapping validation screen described in the original
  spec (type each physical key, preview the rendered glyph, mark
  unverified, export/import the verified layout as JSON).

**Remington GAIL**
- New `src/keyboards/remingtonGail.ts`, kept as its own mapping file —
  never assume a Remington GAIL key matches its Kruti Dev 010 counterpart.
- Its own lessons file, own finger guidance, own import/export JSON.

**Wiring**
- `src/keyboards/index.ts`'s `getKeyboardLayout`/`getKeyboardRows` already
  have a documented fallback branch for these two ids — replace the
  fallback-to-QWERTY comment with real cases once the layout files exist.
- `AppHeader`'s Hindi-layout `<select>` already lists Kruti Dev 010 and
  Remington GAIL as disabled options labeled "(Phase 4)" — just remove
  `disabled` once the layout + lessons exist.
- Add `krutiDevBeginner.ts` and `remingtonGailBeginner.ts` under
  `src/data/lessons/`, then register them in `src/data/lessons/index.ts`
  alongside the existing English/Hindi arrays (the registry already
  supports more than two language/layout combinations — `Lesson.layout`
  is the discriminator, not `Lesson.language`).
- `LessonPracticePage`, `VirtualKeyboard`, and the typing engine need **no**
  changes for this — they were already generalized in Phase 3 to work from
  a `KeyboardLayoutDefinition` + `Lesson.layout`, which is exactly the
  point of that refactor.
- Dashboard: extend the two-card English/Hindi progress section to a
  per-layout breakdown if Kruti Dev/Remington GAIL should track separately
  from Unicode Hindi (recommended, since exam bodies usually require one
  specific layout).

**Also still pending (not Phase 4, listed for planning):**
Typing Test, Exam Mode, Personalized Review, Statistics heatmaps,
Certificates, Games, Admin/Content Editor, PWA/offline polish, Tauri
desktop-only capabilities (tray, start-with-Windows, global TypingMeter).
