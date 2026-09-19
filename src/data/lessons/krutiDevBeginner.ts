import type { Course, Lesson, LessonExercise } from "../../types";
import { unicodeToKrutiDev } from "../../converter/krutiDevCore";

// Kruti Dev 010 lessons.
//
// What you TYPE in Kruti Dev is plain ASCII (e.g. "Hkkjr"), and the Kruti Dev
// font DRAWS it as Devanagari (भारत). So practice text here is stored as the
// Kruti keystrokes. To keep it readable and correct, word lists are written in
// Unicode below and converted with unicodeToKrutiDev() (which handles ि
// placement, reph, half letters and conjuncts).
//
// Each lesson only uses keys taught up to that lesson - scripts/krutidev-selftest
// checks this automatically.

export const krutiDevBeginnerCourse: Course = {
  id: "kd-beginner",
  language: "hi",
  title: "Kruti Dev 010 - Beginner",
  titleHi: "कृति देव 010 - प्रारंभिक",
  order: 2,
};

const kd = (words: string) => words.trim().split(/\s+/).map(unicodeToKrutiDev);

/** Cycle a word list until the text is about `chars` long. */
function fit(words: string[], chars = 240): string {
  const out: string[] = [];
  let n = 0;
  for (let i = 0; n < chars; i++) {
    const w = words[(i * 3 + Math.floor(i / words.length)) % words.length];
    out.push(w);
    n += w.length + 1;
  }
  return out.join(" ");
}

/** Raw key drill: short key groups built only from `keys`. */
function drill(keys: string, chars = 170): string {
  const ks = Array.from(keys);
  const out: string[] = [];
  let n = 0;
  for (let i = 0; n < chars; i++) {
    const a = ks[i % ks.length];
    const b = ks[(i * 3 + 1) % ks.length];
    const c = ks[(i * 5 + 2) % ks.length];
    const g = i % 2 ? a + b + c : a + b;
    out.push(g);
    n += g.length + 1;
  }
  return out.join(" ");
}

interface Spec {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  /** Keys introduced in this lesson (ASCII keys you press). */
  newKeys: string;
  /** Unicode word list for the word drill. */
  words: string;
  /** Sentences (Unicode) for the sentence drill. */
  sentences?: string[];
  seconds: number;
  wpm: number;
  acc: number;
}

const SPECS: Spec[] = [
  {
    title: "Home Row I: क ि र ा",
    titleHi: "होम रो १: क ि र ा",
    description: "D=क, F=ि (typed BEFORE the letter), J=र, K=ा.",
    descriptionHi: "d से क, f से ि (अक्षर से पहले टाइप होती है), j से र, k से ा।",
    newKeys: "dfjk",
    words: "कर कार कारक किरकिरा",
    seconds: 90, wpm: 5, acc: 85,
  },
  {
    title: "Home Row II: ह ी स य",
    titleHi: "होम रो २: ह ी स य",
    description: "G=ह, H=ी, L=स, ;=य.",
    descriptionHi: "g से ह, h से ी, l से स, ; से य।",
    newKeys: "ghl;",
    words: "यह कहा कही सही यही हीरा हार सार रस सर किसी सारा यार",
    seconds: 100, wpm: 6, acc: 85,
  },
  {
    title: "Anusvara and े: ं े",
    titleHi: "अनुस्वार और े: ं े",
    description: "A=ं (anusvara), S=े.",
    descriptionHi: "a से ं (अनुस्वार), s से े।",
    newKeys: "as",
    words: "करें कहें रहें सहें करे कहे रहे सहे किसे यहीं कहीं यहां कहां",
    seconds: 100, wpm: 7, acc: 86,
  },
  {
    title: "Top Row: त ज ल न प व च",
    titleHi: "ऊपरी पंक्ति: त ज ल न प व च",
    description: "R=त, T=ज, Y=ल, U=न, I=प, O=व, P=च.",
    descriptionHi: "r से त, t से ज, y से ल, u से न, i से प, o से व, p से च।",
    newKeys: "rtyuiop",
    words: "पानी जल नल पल कल चल वह वही तीन नाच पता जाना जीत पीना पकाया लाल तार पर चाय नहीं वहां चलें पहले",
    seconds: 110, wpm: 7, acc: 86,
  },
  {
    title: "म ग ब द and अ इ उ",
    titleHi: "म ग ब द और अ इ उ",
    description: "E=म, X=ग, C=ब, N=द; V=अ, B=इ, M=उ (आ is V then K).",
    descriptionHi: "e से म, x से ग, c से ब, n से द; v से अ, b से इ, m से उ (आ = v फिर k)।",
    newKeys: "excnvbm",
    words: "मगर बदल नमक दम गम बम मन बात बाग दान गाना अब इस उस अगर गया मदद आम आदमी",
    seconds: 110, wpm: 8, acc: 87,
  },
  {
    title: "Matras and vowels: ु ू ृ ै ए ऐ",
    titleHi: "मात्राएँ और स्वर: ु ू ृ ै ए ऐ",
    description: "Q=ु, W=ू, `=ृ, Shift+S=ै, ,=ए, ,+S=ऐ. ो = K then S. ौ = K then Shift+S.",
    descriptionHi: "q से ु, w से ू, ` से ृ, Shift+S से ै, ',' से ए। ो = k फिर s।",
    newKeys: "qw`S,",
    words: "बहुत सुन पुल दूर मूल कृपा है में और आप आज एक ऐसा कैसे पैसा सुबह गुलाब सूरज तुम हम मैं कैसा",
    seconds: 120, wpm: 8, acc: 87,
  },
  {
    title: "Shift letters: ट ठ ड ढ छ झ फ ळ",
    titleHi: "Shift अक्षर: ट ठ ड ढ छ झ फ ळ",
    description: "Hold Shift: V=ट, B=ठ, M=ड, <=ढ, N=छ, >=झ, Q=फ, G=ळ.",
    descriptionHi: "Shift दबाकर: V=ट, B=ठ, M=ड, <=ढ, N=छ, >=झ, Q=फ, G=ळ।",
    newKeys: "VBM<N>QG",
    words: "टमाटर ठंड डर छत छोटा फल फूल झील ढोल टोपी छाता डाल फिर ठीक झूठ डोर टीका ठंडा छोटी",
    seconds: 120, wpm: 9, acc: 88,
  },
  {
    title: "Half letters (आधे अक्षर)",
    titleHi: "आधे अक्षर",
    description: "Capital keys are half letters: D=क् X=ग् T=ज् R=त् U=न् I=प् C=ब् E=म् Y=ल् O=व् L=स् P=च् '=श्.",
    descriptionHi: "कैपिटल keys आधे अक्षर हैं: D=क् X=ग् T=ज् R=त् U=न् I=प् C=ब् E=म् Y=ल् O=व् L=स् P=च् '=श्।",
    newKeys: "DXTRUICEYOLP'",
    words: "बच्चा अच्छा पक्का सच्चा दिल्ली पत्ता कुत्ता पन्ना स्कूल सब्जी जल्दी अस्पताल मुश्किल सम्मान बिल्ली रस्सी मक्का गुस्सा अक्सर",
    seconds: 130, wpm: 9, acc: 88,
  },
  {
    title: "Two-key letters and conjuncts",
    titleHi: "दो-key अक्षर और संयुक्ताक्षर",
    description: "ख=[+K, घ=?+K, ण=.+K, थ=F+K, ध=/+K, भ=H+K, श='+K, ष=\"+K. क्ष={+K, त्र==, ज्ञ=Shift+K, श्र=Shift+J.",
    descriptionHi: "ख=[ फिर k, घ=? फिर k, ण=. फिर k, थ=F फिर k, ध=/ फिर k, भ=H फिर k, श=' फिर k, ष=\" फिर k। क्ष={k, त्र==, ज्ञ=K, श्र=J।",
    newKeys: "[?.F/H\"{=KJ",
    words: "खाना घर भारत शहर देश भाषा धन साथ कथा गणित क्षमा शिक्षा त्रिकोण ज्ञान श्रमिक खेल घंटा देखो धूप",
    seconds: 140, wpm: 10, acc: 88,
  },
  {
    title: "Reph and rakar: र् ्र",
    titleHi: "रेफ और रकार: र् ्र",
    description: "Z=र् (typed AFTER the letter, धर्म = /keZ). z=्र (typed after the letter, प्र = iz). द्य = |.",
    descriptionHi: "Z से रेफ (र्), अक्षर के बाद टाइप होता है (धर्म = /keZ)। z से ्र (प्र = iz)। द्य = |।",
    newKeys: "Zz|",
    words: "धर्म कर्म सर्दी गर्मी पर्वत प्रकार क्रम मित्र पुत्र राष्ट्र स्त्री ग्राम प्रेम कार्य अर्थ मूर्ति पूर्ण कार्यालय विद्या",
    seconds: 150, wpm: 10, acc: 88,
  },
  {
    title: "Nukta, ई, रु/रू and mixed words",
    titleHi: "नुक्ता, ई, रु/रू और मिश्रित शब्द",
    description: "+ adds a nukta (ज़ = t+, ड़ = M+, ढ़ = <+). ई = b then Z. Shift+3 = रु, Shift+; = रू.",
    descriptionHi: "+ से नुक्ता (ज़ = t+, ड़ = M+, ढ़ = <+)। ई = b फिर Z। Shift+3 से रु, Shift+; से रू।",
    newKeys: "+#:",
    words: "भाई मिठाई बड़ा पढ़ना ज़रूर रुपया रूप गुरु गरीब दुनिया",
    seconds: 150, wpm: 11, acc: 88,
  },
  {
    title: "Sentences (वाक्य)",
    titleHi: "वाक्य अभ्यास",
    description: "Shift+A = । (danda), ] = , (comma).",
    descriptionHi: "Shift+A से ।, ] से , (अल्पविराम)।",
    newKeys: "A]",
    words: "भारत एक देश है",
    sentences: [
      "भारत एक देश है।",
      "राम घर जाता है।",
      "आज मौसम अच्छा है।",
      "हम सब भारत के लोग हैं।",
      "गंगा बहुत पवित्र नदी है।",
      "मुझे पानी चाहिए।",
      "पढ़ाई, खेल और संगीत ज़रूरी हैं।",
    ],
    seconds: 180, wpm: 12, acc: 90,
  },
];

export const krutiDevBeginnerLessons: Lesson[] = SPECS.map((s, i) => {
  const exercises: LessonExercise[] = s.sentences
    ? [
        { type: "sentence-drill", label: "Sentences", labelHi: "वाक्य", text: kd(s.sentences.join(" ")).join(" ") },
        { type: "sentence-drill", label: "Sentences again", labelHi: "वाक्य दोबारा", text: kd([...s.sentences].reverse().join(" ")).join(" ") },
      ]
    : [
        { type: "key-drill", label: "Key drill", labelHi: "key अभ्यास", text: drill(s.newKeys) },
        { type: "word-drill", label: "Word drill", labelHi: "शब्द अभ्यास", text: fit(kd(s.words)) },
      ];
  return {
    id: `kd-b-${String(i + 1).padStart(2, "0")}`,
    courseId: "kd-beginner",
    language: "hi",
    layout: "kruti-dev-010",
    order: i + 1,
    title: s.title,
    titleHi: s.titleHi,
    description: s.description,
    descriptionHi: s.descriptionHi,
    newKeys: Array.from(s.newKeys),
    requiredKeys: Array.from(s.newKeys),
    exerciseType: exercises[0].type,
    practiceText: exercises[0].text,
    exercises,
    suggestedDurationSec: s.seconds,
    passWpm: s.wpm,
    passAccuracy: s.acc,
  };
});

/** Spec exported for scripts/krutidev-selftest (checks keys used per lesson). */
export const KRUTI_LESSON_SPECS = SPECS.map((s) => ({
  newKeys: s.newKeys,
  words: s.sentences ? s.sentences.join(" ") : s.words,
}));
