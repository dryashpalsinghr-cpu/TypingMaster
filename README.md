# TypeGuru Pro

An original, offline-first Hindi + English typing tutor (React + TypeScript + Vite + Dexie/IndexedDB). Not affiliated with or copied from any commercial typing product.

## Version
0.5.0 - Phase 5: Government Exam Mode & Certificates.

## Phase 5 summary
- **Exam Mode** (`/exam`): editable SSC / RRB / CPCT practice templates - duration, target WPM, target KDPH, minimum accuracy, backspace policy, and focus-loss limit are all editable. Create, duplicate, edit, and delete your own templates.
- **Focus-loss detection**: leaving the test window (tab switch / blur) is counted and warned about, mirroring real exam conditions.
- **KDPH**: Key Depressions Per Hour is computed alongside Gross/Net WPM and accuracy.
- **Certificates** (`/certificates`): printable certificates (Print / Save as PDF) generated ONLY from your real passed results. Clearly marked as practice certificates, not official documents.
- Exam data is stored in a separate IndexedDB database, so the main schema is untouched.

## Honesty notes
- Exam passages are original practice text; target numbers are editable illustrative defaults.
- Certificates are practice certificates, not official government documents.
- No build, typecheck, or Windows installer was produced in the authoring sandbox (no network). See BUILD-STATUS.txt.

## Apply order
Apply the Phase 4 update first, then Phase 5. The new App.tsx references Phase 4 pages.

## Develop
```
npm ci
npm run dev
npm run typecheck
npm run build
```
