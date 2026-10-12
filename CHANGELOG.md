# Changelog

## [0.7.0] - Phase 7: Original Typing Games
### Added
- Games hub (/games) with three original games and per-profile high scores.
- Letter Bubbles: type falling letters to pop them before they reach the bottom; 3 misses ends the game.
- Word Runner: type running words correctly against a 60-second clock (supports Hindi words when the profile language is Hindi).
- Key Defender: destroy incoming keys before they reach your base; difficulty ramps up over time.
- All games record real keystroke data into the Phase 6 analytics store, so heatmaps and Personalized Review keep improving.
- Separate IndexedDB database "typeguru-games-db" for high scores; all earlier databases untouched.
### Notes
- Every game is original code with no copied assets or word lists. High scores are real, never seeded.
- No production build / typecheck / Windows installer was produced in the authoring sandbox (no network). See BUILD-STATUS.txt.

## [0.6.0] - Phase 6: Analytics & Personalized Review
- Keyboard heatmap, finger performance, difficult bigrams, exam WPM trend, and drills generated from real typing history.

## [0.5.0] - Phase 5: Government Exam Mode & Certificates
- Editable SSC/RRB/CPCT exam templates, focus-loss detection, KDPH, printable certificates from real passed results.

## [0.4.0] - Phase 4: Kruti Dev 010 & Remington GAIL
- Legacy font-based encodings, encoding adapters, Font Setup, Mapping Validator, Beta converter, verified-only lessons, Dexie v3 migration.

## 2026-10-13 — Key guidance, timers, lessons and practice totals

- Draw the dotted finger guide to the centre of the required key; show that key in blue in both keyboard styles and themes.
- Start exam and typing-test countdowns on first text input. Ignore pre-start focus losses, and do not save empty tests.
- Show today's practice and lifetime practice in hours/minutes/seconds, including exam results. Split saved sessions at local midnight and refresh the dashboard after focus changes and every 30 seconds.
- Save unfinished typing tests when navigating away; preserve exam time/results when leaving a started exam. Keep lesson partial durations precise, cap them at the lesson deadline, and isolate lesson sessions when changing lessons.
- Retain the existing beginner lesson IDs. Add eight English lessons (four speed, two numbers, two special marks) and two Kruti Dev Hindi speed lessons. These are original exercises following the categories described in the official TypingMaster manual: https://www.typingmaster.com/typing-tutor/support/user-manual.html
- Correct the E-key lesson's finger instruction and selection after deleting an exam template.
- Use Node 24 for the Windows workflow, run frontend tests/build before packaging, and fail artifact upload if no installer exists.

Validation: production build, TypeScript, existing regression tests, nine practice-time regression checks, new curriculum keyboard-reachability checks, and lint (warnings only). Browser interaction testing was unavailable because Chromium could not be downloaded in this environment. Windows installer execution remains a manual check. Existing font and bundle-size build warnings remain.
