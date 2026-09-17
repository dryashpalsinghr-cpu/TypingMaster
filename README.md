# TypeGuru Pro

Bilingual (English/Hindi) offline-first typing tutor. React + TypeScript +
Vite + Tailwind + Dexie (IndexedDB), packaged for a future Windows EXE via
Tauri.

## Status: Phase 1, 2 + 3 complete

- **Phase 1** — App shell, original branding, local multi-profile system,
  dashboard, settings, IndexedDB architecture (Dexie).
- **Phase 2** — English QWERTY typing engine, finger/hand guidance, English
  beginner course (10 lessons), real-time WPM/accuracy calculation.
- **Phase 3** — Hindi Unicode InScript: keyboard layout, grapheme-aware
  matra/halant/conjunct handling, 10 original Hindi lessons (3+ exercises
  each), Hindi keyboard chart + Windows setup guide, per-language dashboard
  progress, typing-language/layout switcher, and a first full pass of
  interface translation. See `PROJECT_STATUS.md` for the detailed
  breakdown and `CHANGELOG.md` for the exact diff of what changed.

Everything else in the original spec (Kruti Dev 010, Remington GAIL, Hindi
Phonetic, typing tests, exam mode, personalized review, statistics
heatmaps, certificates, games, admin editor) is scaffolded as an honest
"Scheduled: Phase N" screen in the nav rather than a fake button — nothing
pretends to work that doesn't yet. `NEXT_PHASE.md` has the concrete plan
for Phase 4 (Kruti Dev 010 + Remington GAIL).

## Getting the Windows EXE — zero manual steps

1. Push this whole folder to a new GitHub repository (or upload the zip
   and let GitHub extract it, then commit).
2. GitHub Actions picks it up automatically — `.github/workflows/build-windows-exe.yml`
   runs on every push to `main` (also runnable by hand from the **Actions**
   tab → *Build Windows EXE* → **Run workflow**).
3. Open the finished run → **Artifacts** → download `TypeGuruPro-Windows`.
   Inside is the installer: an `.exe` (NSIS) and an `.msi`.

No Rust, no Node, nothing to install locally — the `windows-latest`
GitHub runner does the whole build (npm install → Vite build → Tauri
bundles the EXE/MSI). Untouched since Phase 2.

## Local development (optional, only if you want to run it on this PC)

```bash
npm install
npm run dev         # browser dev server
npm run typecheck   # tsc --noEmit
npm run build       # production build (same as CI runs)
```

## Adding the licensed Kruti Dev 010 font

See `public/fonts/README.md`. The app will not fabricate or download this
font — it must be supplied by whoever holds a valid license, placed at
`public/fonts/krutidev010.woff2`. (Kruti Dev typing itself is Phase 4;
this note is preserved from Phase 2 for when that lands.)

## Hindi InScript — do you need Windows set to InScript?

No. The app maps every physical key (`KeyboardEvent.code`) to its Hindi
output itself, so typing works the same in-browser regardless of the OS
keyboard layout. See the in-app Keyboard Chart page (`/keyboard-chart`)
for the full guide, including how to enable it in Windows anyway if you
also want to type Hindi InScript outside this app.

## Architecture notes for the next phase

- Keyboard layouts live in `src/keyboards/` as plain data (`KeyDefinition[]`),
  keyed by `KeyboardEvent.code`. `enQwerty.ts` and `hindiInscript.ts` are
  the reference shape — add `krutiDev010.ts` and `remingtonGail.ts` the
  same way for Phase 4. `resolveInput.ts` already works generically for any
  future layout — no changes needed there.
- Lessons are queried through `src/data/lessons/index.ts`, never by
  importing a per-language file directly from a page component. Add new
  per-layout lesson files there the same way `hindiInscriptBeginner.ts`
  was added.
- The typing engine (`src/engine/typingEngine.ts`) is grapheme- and
  multi-keystroke-cluster aware (`Intl.Segmenter` + NFC + a per-cell
  `typedBuffer`), so Kruti Dev/Remington GAIL won't need engine changes —
  only new lesson data and a new keyboard layout file, exactly like Hindi
  InScript needed in this phase.
- `src/db/database.ts` is the single Dexie schema; it's on **v2** now
  (added `DailyProgress.language`). Bump to `v3` following the same
  `.version(n).stores({...}).upgrade(...)` pattern for any future
  additions (KeyboardLayouts overrides, GameScores, CustomTexts, Backups,
  BigramStatistics) rather than editing an existing version in place.
- UI strings go through `src/i18n/strings.ts` + `useT()` — add new keys
  there rather than hardcoding English/Hindi text in a page component.
- Desktop-only capabilities (tray, start-with-Windows, global typing
  monitor) belong behind a `DesktopIntegrationService` interface so the
  browser build keeps working without Tauri — none of that exists yet by
  design (Phase 8).
