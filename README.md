# TypeGuru Pro

An original, offline-first Hindi + English typing tutor (React + TypeScript + Vite + Dexie/IndexedDB). Not affiliated with or copied from any commercial typing product.

## Version
0.7.0 - Phase 7: Original Typing Games.

## Phase 7 summary
- **Games hub** (`/games`): three original games with per-profile high scores.
  - **Letter Bubbles**: pop falling letters by typing them; 3 misses ends the game.
  - **Word Runner**: type running words against a 60-second clock (Hindi words when the profile language is Hindi).
  - **Key Defender**: destroy incoming keys before they reach your base; speed ramps up.
- Every game records real keystroke data into the Phase 6 analytics store, so your heatmap and Personalized Review keep getting better.
- High scores are stored in a separate IndexedDB database; all earlier databases are untouched.

## Honesty notes
- All games are original code with no copied assets or word lists. High scores are real, never seeded.
- No build, typecheck, or Windows installer was produced in the authoring sandbox (no network). See BUILD-STATUS.txt.

## Apply order
Apply Phase 4, then 5, then 6, then 7. The new App.tsx references pages from all prior phases, and games record into the Phase 6 analytics store.

## Develop
```
npm ci
npm run dev
npm run typecheck
npm run build
```
