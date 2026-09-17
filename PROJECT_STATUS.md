# Project Status

## Current version: 0.7.0 (Phase 7)

### Done
- Phase 1-3: profiles, English + Hindi (Unicode InScript) lessons, practice engine, typing test, dashboard, keyboard chart, theme + i18n.
- Phase 4: legacy encodings (Kruti Dev 010, Remington GAIL), encoding adapters, Font Setup, Mapping Validator, Beta converter, verified-only legacy lessons, Dexie v3.
- Phase 5: Government Exam Mode and printable Certificates from real passed results.
- Phase 6: Analytics (heatmap, finger performance, bigrams, exam WPM trend) and Personalized Review drills from real typing history.
- Phase 7: Original typing games (Letter Bubbles, Word Runner, Key Defender) with high scores, feeding real keystrokes into analytics.

### Honest limitations
- Games and analytics need real play/practice data; new profiles start from empty states.
- Word Runner Hindi mode needs a Hindi layout/font to type correctly.
- Certificates remain practice certificates, not official documents (Phase 5).
- No build/typecheck/EXE produced in authoring sandbox (no network).

### Storage
- Phase 7 high scores live in a separate IndexedDB database (typeguru-games-db). The main db, exam db, and analytics db are all unchanged.
