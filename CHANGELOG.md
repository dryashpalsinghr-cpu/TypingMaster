# Changelog

## [0.4.0] - Phase 4: Kruti Dev 010 & Remington GAIL
### Added
- Legacy font-based encodings modeled as first-class keyboard layouts (kruti-dev-010, remington-gail).
- Encoding adapter layer (Unicode vs legacy font); Unicode attempts never reinterpreted as legacy bytes.
- Font Setup page with local font detection (no bundling/downloading of copyrighted fonts).
- Keyboard Mapping Validator (admin, optional PIN): IndexedDB overrides, JSON import/export, duplicate/missing detection, completion %, immutable built-ins.
- Kruti Dev <-> Unicode converter (Beta): verified-only pairs, longest-match-first, preserves unmatched input.
- Verified-only legacy lessons (locked until mappings verified).
- Per-profile language/layout persistence.
- Dexie migration v2 -> v3 adding 5 stores: keyboardLayoutOverrides, keyboardMappingVerification, conversionMappings, fontStatus, customLegacyTexts.
### Notes
- Ships with 0 verified Kruti Dev and 0 verified Remington keys by design; nothing guessed.
- No production build / typecheck / Windows installer produced in the authoring sandbox (no network). See BUILD-STATUS.txt.
