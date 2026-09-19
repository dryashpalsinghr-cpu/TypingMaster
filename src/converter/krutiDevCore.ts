/**
 * Kruti Dev 010 <-> Unicode (Devanagari) core.
 *
 * Kruti Dev is a legacy *glyph* font: the ASCII key you press is drawn as a
 * Devanagari shape. So "Hkkjr" is what you TYPE and भारत is what you SEE.
 * Three things make it more than a lookup table:
 *   1. The ि matra is typed BEFORE the consonant cluster ("f" + "d" = कि).
 *   2. Reph (र् on top) is typed AFTER the cluster ("/keZ" = धर्म).
 *   3. Full letters like थ/ख/भ/श are two keys ("Fk", "[k", "Hk", "'k"),
 *      and conjuncts use half-letter keys ("L" + "Fk" = स्थ).
 *
 * Key -> glyph data comes from the widely used community Kruti<->Unicode
 * converter table. It is NOT official Kruti Dev documentation, so spot-check a
 * few words against the installed Kruti Dev 010 font before an exam.
 *
 * Only keys reachable on a normal US keyboard (printable ASCII) are used when
 * generating typing text, so every character can actually be typed.
 */

type Kind =
  | "half" | "full" | "vowel" | "matra" | "sign" | "nukta"
  | "rakar" | "halant" | "imatra" | "reph" | "other";
interface Token { uni: string; kind: Kind }
interface Unit { c: string; nukta: boolean; half: boolean }

// ---- Unicode consonant -> Kruti keys ---------------------------------------
const FULL: Record<string, string> = {
  क: "d", ख: "[k", ग: "x", घ: "?k", ङ: "³", च: "p", छ: "N", ज: "t", झ: ">", ञ: "¥",
  ट: "V", ठ: "B", ड: "M", ढ: "<", ण: ".k", त: "r", थ: "Fk", द: "n", ध: "/k", न: "u",
  प: "i", फ: "Q", ब: "c", भ: "Hk", म: "e", य: ";", र: "j", ल: "y", ळ: "G", व: "o",
  श: "'k", ष: "\"k", स: "l", ह: "g",
};
// Half-letter keys that exist on the keyboard (ASCII only). Anything missing
// here is typed as full letter + "~" (halant key).
const HALF: Record<string, string> = {
  क: "D", ख: "[", ग: "X", घ: "?", च: "P", ज: "T", त: "R", थ: "F", ध: "/", न: "U",
  प: "I", ब: "C", भ: "H", म: "E", ल: "Y", व: "O", श: "'", ष: "\"", स: "L", ण: ".",
};
const FULL_NUKTA: Record<string, string> = {
  क: "d+", ख: "[+k", ग: "x+", ज: "t+", ड: "M+", ढ: "<+", फ: "Q+", य: ";+", र: "j+", न: "u+",
};
const HALF_NUKTA: Record<string, string> = { ख: "[+", ज: "T+" };

// Conjunct keys: क्ष त्र ज्ञ श्र द्य द्व द्ध
const LIGS = [
  { a: "क", b: "ष", full: "{k", half: "{" },
  { a: "त", b: "र", full: "=", half: "=~" },
  { a: "ज", b: "ञ", full: "K", half: "K~" },
  { a: "श", b: "र", full: "J", half: "J~" },
  { a: "द", b: "य", full: "|", half: "|~" },
  { a: "द", b: "व", full: "}", half: "}~" },
  { a: "द", b: "ध", full: ")", half: ")~" },
];

const VOWELS: Record<string, string> = {
  अ: "v", आ: "vk", इ: "b", ई: "bZ", उ: "m", ऊ: "Å", ऋ: "_", ए: ",", ऐ: ",s", ओ: "vks", औ: "vkS", ऑ: "v‚",
};
const MATRAS: Record<string, string> = {
  "ा": "k", "ी": "h", "ु": "q", "ू": "w", "ृ": "`", "े": "s", "ै": "S", "ो": "ks", "ौ": "kS", "ॅ": "W", "ॉ": "‚",
};
const SIGNS: Record<string, string> = { "ं": "a", "ँ": "¡", "ः": "%" };
const PUNCT_FWD: Record<string, string> = {
  "।": "A", ",": "]", ".": "-", "?": "\\", "-": "&", ";": "(",
  "‘": "^", "’": "*", "“": "Þ", "”": "ß", "(": "¼", ")": "½", "{": "¿", "}": "À", "=": "¾", "/": "@",
};

// ---- Kruti keys -> Unicode (reverse table) ---------------------------------
const T = new Map<string, Token>();
const add = (k: string, uni: string, kind: Kind) => { if (!T.has(k)) T.set(k, { uni, kind }); };

for (const [c, k] of Object.entries(FULL)) add(k, c, "full");
for (const [c, k] of Object.entries(HALF)) add(k, c + "्", "half");
for (const [c, k] of Object.entries(FULL_NUKTA)) add(k, c + "़", "full");
for (const [c, k] of Object.entries(HALF_NUKTA)) add(k, c + "़्", "half");
for (const l of LIGS) add(l.full, l.a + "्" + l.b, "full");
add("{", "क्ष्", "half");
add("«", "त्र्", "half");
add("#", "रु", "full");
add(":", "रू", "full");
add("¶", "फ्", "half");
add("¸", "य्", "half");
add("÷", "झ्", "half");
add("º", "ह्", "half");
for (const [c, k] of Object.entries(VOWELS)) add(k, c, "vowel");
for (const [c, k] of Object.entries(MATRAS)) add(k, c, "matra");
for (const [c, k] of Object.entries(SIGNS)) add(k, c, "sign");
for (const [c, k] of Object.entries(PUNCT_FWD)) add(k, c, "other");
add("f", "ि", "imatra");
add("Z", "र्", "reph");
add("z", "्र", "rakar");
add("ª", "्र", "rakar");
add("~", "्", "halant");
add("+", "़", "nukta");
// Pre-composed glyph codes found in old documents (not typed on the keyboard).
for (const [k, u] of [
  ["Ù", "त्त"], ["ô", "क्क"], ["ê", "ट्ट"], ["ë", "ट्ठ"], ["ì", "ड्ड"], ["ï", "ड्ढ"],
  ["Ø", "क्र"], ["Ý", "फ्र"], ["æ", "द्र"], ["ç", "प्र"], ["Á", "प्र"], ["à", "ह्न"],
  ["á", "ह्य"], ["â", "हृ"], ["ã", "ह्म"], ["í", "द्द"], ["–", "दृ"], ["—", "कृ"],
] as const) add(k, u, "full");
"åƒ„…†‡ˆ‰Š‹".split("").forEach((g, i) => add(g, String.fromCharCode(0x0966 + i), "other"));

const MAX_LEN = Math.max(...Array.from(T.keys()).map((k) => k.length));

/** Kruti Dev (typed/legacy text) -> Unicode Devanagari. */
export function krutiDevToUnicode(input: string): string {
  const chars = Array.from(input);
  const out: string[] = [];
  let start = 0;
  let inCluster = false;
  let pendingI = false;
  let iReady = false;
  const flushI = () => {
    if (pendingI && iReady) { out.push("ि"); pendingI = false; iReady = false; }
  };
  let i = 0;
  while (i < chars.length) {
    let tok: Token | undefined;
    let len = 0;
    for (let l = Math.min(MAX_LEN, chars.length - i); l >= 1; l--) {
      const t = T.get(chars.slice(i, i + l).join(""));
      if (t) { tok = t; len = l; break; }
    }
    if (!tok) { flushI(); out.push(chars[i]); i++; inCluster = false; continue; }
    i += len;
    if (tok.kind !== "rakar" && tok.kind !== "nukta") flushI();
    switch (tok.kind) {
      case "imatra": pendingI = true; iReady = false; break;
      case "half": if (!inCluster) start = out.length; out.push(tok.uni); inCluster = true; break;
      case "full": if (!inCluster) start = out.length; out.push(tok.uni); inCluster = false; if (pendingI) iReady = true; break;
      case "vowel": start = out.length; out.push(tok.uni); inCluster = false; break;
      case "matra": case "sign": out.push(tok.uni); inCluster = false; break;
      case "nukta": out.push("़"); break;
      case "rakar": out.push("्र"); break;
      case "halant": out.push("्"); inCluster = true; break;
      case "reph": out.splice(start, 0, "र्"); break;
      default: out.push(tok.uni); inCluster = false;
    }
  }
  flushI();
  return out.join("").normalize("NFC");
}

const isCons = (c?: string) => !!c && c >= "\u0915" && c <= "\u0939";
const isMatra = (c?: string) => !!c && c >= "\u093E" && c <= "\u094C";

const fullSeq = (u: Unit): string =>
  u.nukta ? FULL_NUKTA[u.c] ?? (FULL[u.c] ?? u.c) + "+" : FULL[u.c] ?? u.c;
const halfSeq = (u: Unit): string =>
  u.nukta ? HALF_NUKTA[u.c] ?? fullSeq(u) + "~" : HALF[u.c] ?? (FULL[u.c] ?? u.c) + "~";

function emitUnits(units: Unit[]): string {
  let s = "";
  for (let k = 0; k < units.length; k++) {
    const u = units[k];
    const next = units[k + 1];
    if (u.half && !u.nukta && next && !next.nukta) {
      const lig = LIGS.find((l) => l.a === u.c && l.b === next.c);
      if (lig) { s += next.half ? lig.half : lig.full; k++; continue; }
      if (next.c === "र") { s += fullSeq(u) + "z" + (next.half ? "~" : ""); k++; continue; }
    }
    s += u.half ? halfSeq(u) : fullSeq(u);
  }
  return s;
}

/** Unicode Devanagari -> the ASCII keys you type in Kruti Dev 010. */
export function unicodeToKrutiDev(input: string): string {
  const chars = Array.from(
    input
      .normalize("NFC")
      .replace(/\u0929/g, "न\u093C")
      .replace(/\u0931/g, "र\u093C")
      .replace(/\u0934/g, "ळ\u093C")
      .replace(/[\u200C\u200D]/g, "")
  );
  let out = "";
  let i = 0;
  while (i < chars.length) {
    const c = chars[i];
    if (!isCons(c)) {
      if (c >= "\u0966" && c <= "\u096F") out += String(c.charCodeAt(0) - 0x0966);
      else out += VOWELS[c] ?? SIGNS[c] ?? PUNCT_FWD[c] ?? c;
      i++;
      continue;
    }
    const units: Unit[] = [];
    let j = i;
    for (;;) {
      const uc = chars[j++];
      let nukta = false;
      if (chars[j] === "\u093C") { nukta = true; j++; }
      if (chars[j] === "\u094D") {
        j++;
        units.push({ c: uc, nukta, half: true });
        if (isCons(chars[j])) continue;
        break;
      }
      units.push({ c: uc, nukta, half: false });
      break;
    }
    let iMatra = false;
    const matras: string[] = [];
    while (j < chars.length && isMatra(chars[j])) {
      if (chars[j] === "ि") iMatra = true; else matras.push(chars[j]);
      j++;
    }
    const signs: string[] = [];
    while (chars[j] && SIGNS[chars[j]]) signs.push(chars[j++]);

    const reph = units.length >= 2 && units[0].c === "र" && units[0].half && !units[0].nukta;
    let body = emitUnits(reph ? units.slice(1) : units);
    let m = matras.map((x) => MATRAS[x] ?? x).join("");
    if (
      !reph && !iMatra && units.length === 1 && units[0].c === "र" && !units[0].half &&
      !units[0].nukta && matras.length === 1 && (matras[0] === "ु" || matras[0] === "ू")
    ) {
      body = matras[0] === "ु" ? "#" : ":";
      m = "";
    }
    out += (iMatra ? "f" : "") + body + m + (reph ? "Z" : "") + signs.map((x) => SIGNS[x]).join("");
    i = j;
  }
  return out;
}

/** What glyph a single Kruti key produces (used for key labels). */
export function krutiKeyLabel(ch: string): string {
  return T.get(ch)?.uni ?? ch;
}

/** True when every character can be typed on a plain US keyboard. */
export function isKrutiTypable(s: string): boolean {
  return untypableChars(s).length === 0;
}

export function untypableChars(s: string): string[] {
  const bad = new Set<string>();
  for (const ch of Array.from(s)) {
    const code = ch.codePointAt(0)!;
    if (!((code >= 0x20 && code <= 0x7e) || ch === "\n")) bad.add(ch);
  }
  return Array.from(bad);
}
