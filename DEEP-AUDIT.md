# TypeGuru Pro — deeper audit and patched source

## Status

This package contains a second-pass set of source fixes in addition to the earlier typing-engine/exam corrections. It is a **release candidate, not a verified Windows release**. The first-pass fixes are already on GitHub main. The second-pass changes are being submitted to GitHub for integration into main at the user's explicit request. This does not certify a complete Windows release.

The review covered typing state, timing, profiles, local preferences, daily statistics, backups, certificate issuance, review input handling, game lifecycle, navigation and profile-selection UI. All 83 current TypeScript/TSX source files were parsed/transformed successfully. That is syntax coverage, **not** proof that every function or every route has been fully exercised.

## Confirmed issues addressed in this pass

| Area | Problem | Change |
| --- | --- | --- |
| Daily progress | Averaging the old average with the newest attempt biases results; replaying a lesson inflates completion counts. | Recompute arithmetic averages from all matching daily attempts, count distinct passed/completed lesson IDs, and save attempt/progress together in one database transaction. |
| Dashboard weak keys | Error-free keys could be shown as weak. | Require an actual error before adding a key to the weakness list. |
| Lesson completion display | Resume position was treated as proof that earlier lessons were passed. | Check actual stored completed/passed attempts instead. |
| Profile creation | A profile could be created without its settings when the second write failed. | Commit profile and settings together. Demo initialization uses the same transactional approach. |
| Profile deletion | The profile could disappear before cleanup in other databases succeeded, making recovery/retry awkward. | Perform cross-database cleanup before deleting the profile itself. Deletion remains non-atomic across separate databases; a retry is still important if interrupted. |
| Profile-selection UI | Delete was a hover-only span inside a profile-selection button, unavailable to normal keyboard interaction and awkward on touch screens. | Use a separate labeled 44px button, disable controls during deletion, and show failures. Creation also guards duplicate submissions and shows errors. |
| Startup and preferences | Blocked localStorage or a failed profile lookup could cause failures/blank startup. | Add safe preference helpers, validated theme/language defaults, lookup catch/finally handling, and a fallback route. Onboarding and mapping PIN storage failures are handled too. |
| Profile language | Selecting a different profile did not apply its saved interface language. Header language changes were not saved to the profile. | Apply the selected profile's language and persist header language changes; serialize preference writes and show storage errors. |
| Backup boundaries | Export/restore included unrelated localStorage keys, and backup structural validation was weak. | Limit preferences to the tg- namespace, restrict database names, validate version/store/record containers, and reject unsupported format data before restore. |
| Fresh-device restore | Restore skipped databases that had never been opened on the new device. | Initialize all four application schemas before importing. Preflight future schema versions and unknown tables before clearing existing records. |
| Restore failure cleanup | A failed restore could leave a connection open or report scheduled writes as imported records. | Await transaction completion, abort on failure, close connections in finally, and count records only after the transaction commits. |
| Certificates | The service did not enforce its UI promise that certificates come only from saved passed results. | Re-fetch and verify the stored result before issuing a certificate; use the saved metrics. |
| Letter Bubbles / Key Defender | React state updater callbacks modified refs, scores, lives and capture logs. StrictMode can invoke these callbacks more than once. | Move side effects out of updater callbacks, use canonical refs for each event, ignore modifier shortcuts/repeat events, and guard single completion/save. |
| Word Runner | Timer completion and score ref writes happened inside updater callbacks; timer decrementing drifted. Bulk replacement/drop could bypass key capture. | Use a monotonic deadline, single-finish guard, score updates outside updater callbacks, input-length/append checks, and paste/drop prevention. Hindi keys now also contribute capture records. |
| Personalized Review | Paste/replacement could complete a drill without capturing its real keys; mode could change while running; saves could overlap. | Accept append/backspace edits only, block paste/drop, lock modes during the session/save, guard single completion, and report failed saves. |
| Mobile navigation | Sidebar disappeared below the desktop breakpoint with no replacement navigation. A wrapping fixed-height header could collide with content. | Add an accessible mobile drawer with focus cycling/Escape handling; allow the header to grow; expose Backup & Restore in navigation. |
| Responsive practice / motion | Typing sequence groups could overflow at narrow widths; transition-heavy UI ignored OS reduced-motion preferences. | Allow sequence groups to wrap and add reduced-motion overrides without redesigning the app's theme. |
| Onboarding replay | Reopening the tour could resume on its previous step. | Remount the tour when opening/closing so a replay begins at the first step. |

## Checks performed

- 10 typing-engine regression cases passed.
- 19 new deep-audit cases passed: daily summaries, distinct lesson counts, storage failures, structural backup validation, and rejecting invalid restore input before touching IndexedDB.
- 46/46 known Kruti conversion pairs passed.
- 12 Kruti lessons checked, zero reported problems.
- All 83 TypeScript/TSX source modules parsed/transformed with esbuild.
- The new pure storage and progress-summary modules passed standalone TypeScript checking.
- 15 isolated browser checks passed, including StrictMode game scoring/single save, modifier-shortcut handling, mobile drawer reachability/focus/Escape, namespace filtering, and backup preflight preservation.

### Important browser-test limits

The browser checks used real React StrictMode and real Chromium IndexedDB, but mocked game persistence, routing/profile services and the Dexie schema initializer. They are **component/raw-IndexedDB regression checks**, not full application database integration tests. Desktop and 390px mobile shell fixtures were rendered and inspected; their icons/services and a subset of utility CSS were substituted. They do **not** prove that the complete production UI passes visual QA.

The browser fixture tooling was sandbox-only; its results are saved under audit-evidence. The portable new regression script is scripts/deep-audit-selftest.ts and runs through npm test.

## Validation blocked / remaining release gates

Project dependencies are not installed. An offline install failed because the required Vite package was not cached. Full typecheck still reports missing vite/client and node type definitions. General computer internet access was disabled, so dependencies were not downloaded.

Consequently the following are **not yet verified**:

1. Full npm run typecheck, npm run lint and npm run build against the project's actual dependency versions.
2. Every route and every production UI state in light/dark mode and at narrow/desktop viewport widths, especially dialogs, long Hindi passages, charts and games.
3. Actual Dexie profile/progress transactions, concurrent saves, import schema migrations and backup/restore across real app versions.
4. Keyboard mapping overrides end-to-end: the validator can save overrides, but some practice/chart code reads built-in definitions directly. Runtime override integration still needs a dedicated check/fix; this package does not claim it is solved.
5. Windows font installation/detection, IME/composition behavior, certificate print layout, focus-loss behavior, audio availability, installer/executable build and startup.
6. Restore is atomic per database, not across all four databases. A failure after one database has committed can leave a partial multi-database restore. Record-level backup schema validation is not exhaustive.
7. Optional desktop features are still governed by the existing minimal Tauri shell; this audit does not turn roadmap/placeholder capabilities into implemented OS integrations.

## Before using this as a release

Use Node 24 (or a compatible Node version with TypeScript stripping support) for the regression scripts. After enabling internet access, install the locked dependencies with npm ci, then run npm test, npm run typecheck, npm run lint and npm run build. Complete the UI/database/Windows gates above before distributing this pass as a verified production build.

No claim is made that all functions are bug-free, that the full production UI has passed, or that a new EXE has been built.
