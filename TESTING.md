# Testing Notes — Phase 3

Manual QA checklist. No automated test runner is set up yet (Phase 1-3
priority was the working feature set); Vitest + Testing Library would be
the natural next addition and is left for a later phase.

## Automated checks run before this build was packaged
```bash
npm run typecheck   # tsc --noEmit — passed, 0 errors
npm run build       # tsc -b && vite build — passed
```

## Manual test matrix

### Regression: English still works
- [ ] Create a new profile with typing language = English → lands on
      `en-qwerty` layout, `/learn` shows the 10 English lessons.
- [ ] Open lesson 1 (`en-b-01`) → virtual keyboard shows English labels,
      hand guide highlights left/right pinky for F/J drill.
- [ ] Type the drill correctly → characters turn green; type a wrong key →
      that character turns red; Backspace removes it.
- [ ] Finish the lesson → Gross/Net WPM, accuracy, and pass/fail banner
      appear; dashboard's "Lessons Done" and "English Progress" card
      increment.
- [ ] Reload the browser → profile, theme, and progress persist
      (IndexedDB survived the reload).

### Hindi InScript — normal layer
- [ ] Switch typing language to Hindi from the header (or create a Hindi
      profile) → layout badge shows "हिन्दी यूनिकोड - इनस्क्रिप्ट".
- [ ] `/learn` shows the 10 Hindi lessons with Devanagari titles.
- [ ] Lesson 1 (`hi-b-01`): pressing the physical **F** key produces ि
      and physical **J** produces र, regardless of the OS keyboard layout
      currently active in Windows/the browser's host OS.
- [ ] Virtual keyboard shows Devanagari glyphs on every mapped key; toggle
      "Show physical English key hints" in Settings → small English
      letter appears in the corner of each Hindi key.

### Hindi InScript — Shift layer
- [ ] Lesson 2 (basic vowels): holding Shift + A/S/D/E/G types
      ओ/ए/अ/आ/उ. While the next required character is one of these, the
      Shift key on the virtual keyboard is highlighted **before** the user
      presses it (required-shift highlight), not just while physically held.

### Matras and reordered marks
- [ ] Lesson 6 (मात्राएँ): typing क then ा renders का as a single unit
      turning green only once both keystrokes land; a wrong second
      keystroke (e.g. क then a wrong matra) marks the cell red without
      requiring a full string-index comparison bug.

### Halant and conjuncts
- [ ] Lesson 7: क + ् + र + म → कर्म. Confirm partial input (e.g. just
      "क्" typed so far) stays in a pending/neutral state rather than
      flashing an error prematurely, and only resolves once the full
      cluster is typed.

### Virtual-key and finger highlighting
- [ ] For both English and Hindi lessons, the currently-required key glows
      (ring highlight) and the matching hand/finger in the SVG hand guide
      lights up in the same finger color used on the virtual keyboard.

### WPM and accuracy
- [ ] Confirm Gross WPM, Net WPM, KPM, and accuracy update live during a
      Hindi lesson exactly as they do for English (same formulas, same
      `calculateMetrics()` call) — spot-check the numbers are reasonable
      (not NaN/Infinity) even with multi-keystroke Hindi clusters.

### Language switching
- [ ] Switch from Hindi back to English in the header → virtual keyboard,
      hand guide, lesson list, and practice screen all revert to English
      immediately, with no leftover Devanagari font/labels.
- [ ] Interface language (header, right-hand selector) can be set
      independently of typing language — e.g. Hindi typing + English
      interface, and vice versa.

### Progress persistence
- [ ] Complete one English lesson and one Hindi lesson for the same
      profile → Dashboard's "English Progress" and "Hindi Progress" cards
      show different, correct numbers (not merged/blended).
- [ ] "Continue" button reopens the correct language's lesson list and the
      correct lesson id.

### Windows / Tauri build configuration
- [ ] `.github/workflows/build-windows-exe.yml` unchanged from Phase 2.
- [ ] `src-tauri/tauri.conf.json`, `Cargo.toml`, `main.rs` unchanged.
- [ ] `npm run build` output still gets picked up by
      `beforeBuildCommand` (`npm run build`) → `frontendDist: "../dist"` —
      no path changes were needed since the Hindi work is all inside
      `src/`, not the build pipeline.

## Known non-issues (documented, not bugs)
- A handful of rarer InScript keys (retroflex ट/ठ, sibilant ष, some nukta
  letters, obscure shifted punctuation) are intentionally unmapped rather
  than guessed — see the header comment in `hindiInscript.ts`. This means
  a small number of valid Hindi words cannot yet be typed; all lesson
  content in this phase was deliberately written to only use verified
  mappings.
- Kruti Dev 010 / Remington GAIL layout options are visible but disabled in
  the header's layout selector — expected, they land in Phase 4.
