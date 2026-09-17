# Testing

## Automated (run locally - not run in authoring sandbox)
```
npm ci
npm run typecheck
npm run build
```

## Manual QA checklist
1. Create/select a profile; switch typing language to Hindi.
2. Select Kruti Dev 010 layout -> Learn page shows the amber "lessons locked" notice.
3. Font Setup -> Re-check reports installed/missing correctly for a licensed font.
4. Mapping Validator -> unlock (PIN or skip); add an override; Save; completion % updates; duplicate/missing warnings appear as expected.
5. Export mappings -> JSON downloads; Import restores them.
6. Converter (Beta) -> only verified pairs convert; unmatched text preserved; counts correct.
7. Switch back to Unicode InScript -> Hindi Unicode lessons work and are NOT reinterpreted as legacy.
8. Reload app -> language/layout persisted per profile; Dexie upgraded to v3 without data loss.
