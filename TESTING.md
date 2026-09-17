# Testing - Phase 5

## Automated (run locally - not run in authoring sandbox)
```
npm ci
npm run typecheck
npm run build
```

## Manual QA checklist
1. Open Exam Mode (/exam). Built-in SSC/RRB/CPCT templates appear and are selectable.
2. Create a new custom test; edit duration/targets/passage; Save; it appears in the list.
3. Duplicate a built-in template; the copy is editable/deletable; built-ins are not.
4. Start a test. Timer counts down; typing increments the key counter.
5. Switch tabs / click away during the test; a focus-loss warning appears and the count rises; exceeding the limit shows the red warning.
6. Submit (or let the timer end). Result shows Gross/Net WPM, accuracy, KDPH, errors, focus losses, pass/fail.
7. Pass a test, then open Certificates (/certificates). The passed result is listed.
8. Set a name, click Generate; a certificate renders with serial + date; Print / Save as PDF prints only the certificate.
9. Reload the app; issued certificates and results persist (separate IndexedDB db).
10. CPCT (Hindi) template requires a Hindi layout/font to type correctly.
