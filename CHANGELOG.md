# Changelog

## [0.5.0] - Phase 5: Government Exam Mode & Certificates
### Added
- Exam Mode: editable SSC / RRB / CPCT practice templates (duration, target WPM, target KDPH, min accuracy, backspace policy, focus-loss limit).
- Live exam runner with countdown timer, KDPH counting, and focus-loss detection (window blur / tab switch) with on-screen warnings.
- Custom template creation, duplication, editing, and deletion. Built-in templates are read-only presets.
- Result screen with Gross/Net WPM, accuracy, KDPH, errors, focus losses, and pass/fail against the template targets.
- Certificates page: printable (Print / Save as PDF) certificates generated ONLY from real passed results. Serial number + issue date. Clearly marked as a practice certificate, not an official document.
- Separate IndexedDB database "typeguru-exam-db" (examTemplates, examResults, certificates) so the main schema is untouched.
### Notes
- Exam passages are original practice text; target numbers are editable illustrative defaults.
- No production build / typecheck / Windows installer was produced in the authoring sandbox (no network). See BUILD-STATUS.txt.

## [0.4.0] - Phase 4: Kruti Dev 010 & Remington GAIL
- Legacy font-based encodings, encoding adapters, Font Setup, Mapping Validator, Beta converter, verified-only lessons, Dexie v3 migration.
