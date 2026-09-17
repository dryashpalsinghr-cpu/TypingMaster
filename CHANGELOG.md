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
