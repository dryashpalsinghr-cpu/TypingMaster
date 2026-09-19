// Run:  npx tsx scripts/krutidev-lessons-check.ts
// Checks every Kruti lesson: (1) only ASCII/typable, (2) only uses keys taught so far,
// (3) Kruti -> Unicode round-trips back to the original word.
import { KRUTI_LESSON_SPECS, krutiDevBeginnerLessons } from "../src/data/lessons/krutiDevBeginner";
import { unicodeToKrutiDev as u2k, krutiDevToUnicode as k2u, untypableChars } from "../src/converter/krutiDevCore";

let problems = 0;
let allowed = new Set<string>([" "]);
KRUTI_LESSON_SPECS.forEach((spec, i) => {
  for (const k of spec.newKeys) allowed.add(k);
  const lesson = krutiDevBeginnerLessons[i];
  // key usage check on the WORDS (drills are built only from newKeys)
  for (const w of spec.words.split(/\s+/)) {
    const kr = u2k(w);
    const bad = Array.from(kr).filter((c) => !allowed.has(c));
    if (bad.length) { problems++; console.log(`L${i + 1} word ${w} -> ${kr} uses untaught keys: ${[...new Set(bad)].join(" ")}`); }
    const back = k2u(kr);
    if (back !== w.normalize("NFC")) { problems++; console.log(`L${i + 1} round-trip fail ${w} -> ${kr} -> ${back}`); }
  }
  for (const ex of lesson.exercises ?? []) {
    const bad = untypableChars(ex.text);
    if (bad.length) { problems++; console.log(`L${i + 1} untypable chars in exercise: ${bad.join(" ")}`); }
  }
});
console.log(`lessons: ${krutiDevBeginnerLessons.length}, problems: ${problems}`);
console.log("sample L9:", krutiDevBeginnerLessons[8].exercises![1].text.slice(0, 80));
console.log("sample L12:", krutiDevBeginnerLessons[11].practiceText.slice(0, 80));
process.exit(problems ? 1 : 0);
