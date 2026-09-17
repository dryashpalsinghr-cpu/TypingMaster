# Project Status

## Current version: 0.5.0 (Phase 5)

### Done
- Phase 1-3: profiles, English + Hindi (Unicode InScript) lessons, practice engine, typing test, dashboard, keyboard chart, theme + i18n.
- Phase 4: legacy encodings (Kruti Dev 010, Remington GAIL), encoding adapters, Font Setup, Mapping Validator, Beta converter, verified-only legacy lessons, Dexie v3.
- Phase 5: Government Exam Mode (editable SSC/RRB/CPCT templates, focus-loss detection, KDPH targets) and printable Certificates from real passed results.

### Honest limitations
- Exam target numbers are illustrative defaults; edit them to the official notification.
- Certificates are practice certificates, not official documents.
- Legacy Kruti Dev / Remington still ship 0 verified keys by design (Phase 4).
- No build/typecheck/EXE produced in authoring sandbox (no network).

### Storage
- Phase 5 exam data lives in a separate IndexedDB database (typeguru-exam-db); the main typeguru-pro-db is unchanged.
