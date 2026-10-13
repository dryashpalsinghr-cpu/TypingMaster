# Changelog

## Dashboard audit — 2026-10-13
- The 1-Min Test shortcut now opens a one-minute setup.
- Dashboard and language speed/accuracy include saved exams and exclude empty attempts.
- Weekly charts show the latest seven local calendar days, including days without practice.
- Dashboard refreshes update all cards together, ignore stale requests, and show a retryable storage error.
- Regression fixtures verify exam-only profiles, mixed practice, empty attempts and profile isolation.

## Desktop functional audit — 2026-10-13
- Keep game input separate from focused controls and dialogs; focus the playfield when starting.
- Resolve game/review physical keys independently of the OS language; keep English game analytics labelled English.
- Preserve case-sensitive legacy outputs in analytics and prevent bigrams across different layouts/profiles.
- Filter review drills to their layout; show the legacy font and block missing-font review/Word Runner.
- Keep header dropdown text readable in dark mode.
- Prevent duplicate certificate clicks and display certificate load/save failures.
- Preflight invalid/duplicate backup IDs across every database before clearing records; make analytics clearing transactional.
- Added regression coverage for these failures. Windows installer runtime still requires a real-PC check.

## UI follow-up — 2026-10-13
- Wrap long profile names and layout badges within narrow headers.
- Keep keyboard reference keys readable in a keyboard-accessible horizontal scroll region.
- Reset the content scroll position when changing pages.
- Highlight Backup & Restore in navigation and match the mobile Menu button to dark mode.
- Verified with Chromium at 320, 390, 800 and 1366px widths; existing regression suites and production build pass.

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

## 2026-10-13 — Deep UI and keyboard-mapping fixes

- Apply saved physical-key overrides consistently to lessons, tests, exams and the keyboard chart. Update input outputs, visible glyph labels and guidance together. Disabled keys no longer emit text; impossible passages show a warning.
- Correct Windows InScript base digits (0–9), Shift+1…0, conjunct shortcuts, Shift+= (ऋ), and the backquote/Shift-slash layer. Reference: https://unicode.org/cldr/charts/43/keyboards/layouts/hi.html#hi-t-k0-windows . This practice layout supports base and Shift layers; AltGr extensions are not implemented.
- Resolve exam text through physical key codes instead of OS-dependent text. Preserve selection/correction behaviour, ignore empty pre-start deletions, and do not auto-submit when profile preferences change.
- Account for Caps Lock in Shift guidance and highlight the opposite hand's Shift key. Use one finger-colour palette for hands and keys.
- Restore green/red pressed-key feedback in dark mode. Show the Hindi glyph in Current Key and add Hindi coaching tips and primary exam labels.
- Keep buttons, selects, links, modals and mobile navigation from leaking keystrokes into practice. Trap focus in dialogs and focus practice without automatically scrolling away from its title.
- Correct numeric stat-card truncation on narrow screens and sequence clipping at 1024px. Use one column below 1200px, keep hands/keys at readable sizes, and allow horizontal keyboard scrolling on narrow screens. Recompute the connector after scrolling.
- Validate complete mapping files before writing and import them transactionally. Serialize concurrent key saves, show validation/PIN/storage errors, exclude modifiers from key verification, and apply explicitly verified converter pairs.
- Require a genuinely loaded Kruti font rather than accepting fallback-font checks. Disable legacy-font tests/exams when the font is unavailable; guided lessons still use Unicode key glyphs. Correct font preview/install instructions and remove a cached-status race.
- Reject invalid exam templates and report a typing-test save failure instead of claiming the result was saved.

Validation: production build and TypeScript passed; lint completed with warnings. All existing tests plus 28 UI/mapping regression groups passed, using real React screens and IndexedDB in JSDOM. Existing Kruti lesson key coverage and word round-trips reported 0 problems. Chromium checks passed at 1366×768, 1024×768, 800×700 and 390×844: no sequence overflow, readable key/hand dimensions, correct connector endpoint, dark feedback, first-input exam timing, missing-font blocking and the InScript Shift chart. No browser page errors were observed.

Remaining manual checks: real Windows WebView/installer execution and glyph shapes against a locally installed, licensed Kruti Dev 010 font. Kruti glyph labels are still based on the documented community converter table; marked unverified symbols remain unverified. Remington GAIL has no built-in lessons or independently verified mapping. These are not guessed or represented as completed support.
