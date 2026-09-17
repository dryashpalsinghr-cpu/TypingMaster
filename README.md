# TypeGuru Pro

An original, offline-first Hindi + English typing tutor (React + TypeScript + Vite + Dexie/IndexedDB). Not affiliated with or copied from any commercial typing product.

## Version
0.4.0 - Phase 4: Kruti Dev 010 & Remington GAIL (legacy encodings).

## Phase 4 summary
- Legacy font-based encodings (Kruti Dev 010, Remington GAIL) modeled as first-class layouts.
- Encoding adapters separate Unicode typing from legacy font-byte typing; Unicode attempts are never reinterpreted as legacy.
- **Font Setup** page: detect a locally installed, user-licensed font. The copyrighted font is never bundled or downloaded.
- **Keyboard Mapping Validator** (admin, optional PIN): add per-key overrides stored in IndexedDB, import/export JSON, duplicate/missing detection, completion %. Built-in mappings are immutable and ship empty + unverified.
- **Kruti Dev <-> Unicode Converter** (Beta): uses only verified mapping pairs, longest-match-first, preserves unmatched input.
- Verified-only lessons: legacy lessons stay locked until mappings are verified. Nothing is guessed.
- Language/layout choice persists per profile.

## Honesty notes
- 0 Kruti Dev and 0 Remington keys are verified out of the box - by design.
- No build, typecheck, or Windows installer was produced in the authoring sandbox (no network). See BUILD-STATUS.txt.

## Develop
```
npm ci
npm run dev
npm run typecheck
npm run build
```

## Windows EXE
Push to GitHub and run the "Build Windows EXE" workflow; download the TypeGuruPro-Windows artifact (unsigned).
