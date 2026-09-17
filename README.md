# TypeGuru Pro

Bilingual (English/Hindi) offline-first typing tutor. React + TypeScript +
Vite + Tailwind + Dexie (IndexedDB), packaged for a future Windows EXE via
Tauri.

## Status: Phase 1 + Phase 2 complete

- App shell, original branding, local multi-profile system, dashboard,
  settings, IndexedDB architecture (Dexie) — **Phase 1**
- English QWERTY typing engine, finger/hand guidance, English beginner
  course (10 lessons, home row → full paragraph), real-time WPM/accuracy
  calculation, results saved to IndexedDB and reflected on the dashboard
  — **Phase 2**

Everything else in the original spec (Hindi Unicode InScript, Kruti Dev
010, Remington GAIL, typing tests, exam mode, personalized review,
statistics heatmaps, certificates, games, admin editor) is scaffolded as
an honest "Scheduled: Phase N" screen in the nav rather than a fake
button — nothing pretends to work that doesn't yet.

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
bundles the EXE/MSI).

## Local development (optional, only if you want to run it on this PC)

```bash
npm install
npm run dev        # browser dev server
```

## Adding the licensed Kruti Dev 010 font

See `public/fonts/README.md`. The app will not fabricate or download this
font — it must be supplied by whoever holds a valid license, placed at
`public/fonts/krutidev010.woff2`.

## Architecture notes for the next phase

- Keyboard layouts live in `src/keyboards/` as plain data (`KeyDefinition[]`),
  keyed by `KeyboardEvent.code` — add `hindiInscript.ts`, `krutiDev010.ts`,
  `remingtonGail.ts` here following the same shape as `enQwerty.ts`.
- The typing engine (`src/engine/typingEngine.ts`) is already
  grapheme-aware (`Intl.Segmenter`) so Hindi matras/conjuncts won't need
  engine changes — only new lesson data and a new keyboard layout file.
- `src/db/database.ts` is the single Dexie schema; bump `this.version(2)`
  when new stores are needed (KeyboardLayouts overrides, GameScores,
  CustomTexts, Backups, BigramStatistics) rather than editing v1 in place.
- Desktop-only capabilities (tray, start-with-Windows, global typing
  monitor) belong behind a `DesktopIntegrationService` interface so the
  browser build keeps working without Tauri — none of that exists yet by
  design (Phase 8).
