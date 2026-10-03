import type { Course, Lesson, LessonExercise } from "../../types";
import { unicodeToKrutiDev, krutiDevToUnicode } from "../../converter/krutiDevCore";

// Kruti Dev 010 lessons.
//
// What you TYPE in Kruti Dev is plain ASCII (e.g. "Hkkjr"), and the Kruti Dev
// font DRAWS it as Devanagari (भारत). So practice text here is stored as the
// Kruti keystrokes. To keep it readable and correct, word lists are written in
// Unicode below and converted with unicodeToKrutiDev() (which handles ि
// placement, reph, half letters and conjuncts).
//
// Each lesson only uses keys taught up to that lesson - scripts/krutidev-lessons-check
// checks this automatically.
//
// The lesson timer in the app is 5 minutes, so every lesson carries far more
// UNIQUE text than a fast typist can finish in 5 minutes (words never repeat
// inside a lesson until the whole word list has been used):
//   key drill -> mixed key drill -> word drill -> word drill again
//   -> revision words (all earlier lessons) -> 300-word paragraph.
// Lessons 1-3 also use "practice words" (syllable combinations), the way
// typing tutors do while only a few letters are known.

export const krutiDevBeginnerCourse: Course = {
  id: "kd-beginner",
  language: "hi",
  title: "Kruti Dev 010 - Beginner",
  titleHi: "कृति देव 010 - प्रारंभिक",
  order: 2,
};

const kd = (words: string) => words.trim().split(/\s+/).map(unicodeToKrutiDev);

function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

/** Deterministic shuffle (no Math.random) - same order every time. */
function shuffle<T>(items: T[], salt = 0): T[] {
  const n = items.length;
  if (n < 3) return [...items];
  let s = Math.max(1, Math.floor(n / 3) + salt);
  while (gcd(s, n) !== 1) s++;
  return items.map((_, i) => items[(i * s + salt) % n]);
}

/** Walk a token list without repeating, wrapping only when the list is used up. */
class Feed {
  private pos = 0;
  constructor(private tokens: string[]) {}
  /** Take tokens until the text is about `chars` long. */
  chars(chars: number): string {
    const out: string[] = [];
    let n = 0;
    while (n < chars && this.tokens.length) {
      const w = this.tokens[this.pos % this.tokens.length];
      this.pos++;
      out.push(w);
      n += w.length + 1;
    }
    return out.join(" ");
  }
  /** Take exactly `count` tokens. */
  words(count: number): string {
    const out: string[] = [];
    for (let i = 0; i < count && this.tokens.length; i++) out.push(this.tokens[this.pos++ % this.tokens.length]);
    return out.join(" ");
  }
}

/** Every 2-, 3- and 4-key combination of `keys` (distinct), used by the key drills. */
function keyCombos(keys: string): string[] {
  const ks = Array.from(keys);
  const out: string[] = [];
  for (const a of ks) for (const b of ks) {
    out.push(a + b);
    for (const c of ks) {
      out.push(a + b + c);
      if (ks.length <= 8) for (const d of ks) out.push(a + b + c + d);
    }
  }
  return out;
}

/** Syllable words (consonant + optional matra, 2-3 syllables) for the first lessons. */
function pseudoWords(p: { cons: string; matras: string; must: string }): string[] {
  const cons = Array.from(p.cons);
  const matras = ["", ...Array.from(p.matras)];
  const syl: string[] = [];
  for (const c of cons) for (const m of matras) syl.push(c + m);
  const out: string[] = [];
  for (const a of syl) for (const b of syl) {
    out.push(a + b);
    for (const c of syl) {
      out.push(a + b + c);
      if (syl.length <= 8) for (const d of syl) out.push(a + b + c + d);
    }
  }
  const must = Array.from(p.must);
  const ok = out.filter((w) => must.some((m) => w.includes(m)) && !w.endsWith("ि"));
  return shuffle(ok, 5)
    .filter((w) => krutiDevToUnicode(unicodeToKrutiDev(w)) === w.normalize("NFC"))
    .slice(0, 420);
}

interface Spec {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  /** Keys introduced in this lesson (ASCII keys you press). */
  newKeys: string;
  /** Unicode words that become typable in THIS lesson (earlier words are re-used automatically). */
  words: string;
  /** Sentences (Unicode) for the sentence drill. */
  sentences?: string[];
  /** Real 300-word Unicode paragraph (last lesson). */
  paragraph?: string;
  /**
   * Practice-only syllable words (like the key-combination words a typing tutor uses at the start)
   * for lessons where real Hindi words are too few. `cons` = consonants, `matras` = matras / vowel signs
   * available up to this lesson, `must` = at least one of these new letters must appear in the word.
   */
  pseudo?: { cons: string; matras: string; must: string };
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
    pseudo: { cons: "कर", matras: "ाि", must: "कर" },
    words: "कर कार कारक किरकिरा रक काका कका रकार करका कारका किरका कराकर",
    seconds: 300, wpm: 5, acc: 85,
  },
  {
    title: "Home Row II: ह ी स य",
    titleHi: "होम रो २: ह ी स य",
    description: "G=ह, H=ी, L=स, ;=य.",
    descriptionHi: "g से ह, h से ी, l से स, ; से य।",
    newKeys: "ghl;",
    pseudo: { cons: "करहसय", matras: "ािी", must: "हसयी" },
    words: "यह कहा कही सही यही हीरा हार सार रस सर किसी सारा यार हरी हरि सीरी सीसा हाय सीकर सहारा हाहा सारी सरकार सहसा रही सिर हरा साहस सियार या ही साहसी",
    seconds: 300, wpm: 6, acc: 85,
  },
  {
    title: "Anusvara and े: ं े",
    titleHi: "अनुस्वार और े: ं े",
    description: "A=ं (anusvara), S=े.",
    descriptionHi: "a से ं (अनुस्वार), s से े।",
    newKeys: "as",
    pseudo: { cons: "करहसय", matras: "ाीिंे", must: "ंे" },
    words: "कहीं करें कहें रहें सहें करे कहे रहे सहे किसे यहीं यहां कहां सरसों हसीं रहीं कोहरा संकरा सिरोही ये हां",
    seconds: 300, wpm: 7, acc: 86,
  },
  {
    title: "Top Row: त ज ल न प व च",
    titleHi: "ऊपरी पंक्ति: त ज ल न प व च",
    description: "R=त, T=ज, Y=ल, U=न, I=प, O=व, P=च.",
    descriptionHi: "r से त, t से ज, y से ल, u से न, i से प, o से व, p से च।",
    newKeys: "rtyuiop",
    words: "रसीला पानी जल नल पल कल चल वह वही तीन नाच पता जाना जीत पीना पकाया लाल तार पर चाय नहीं वहां चलें पहले तरह पहला वाला पाया लिया तीर पास पाली जीवन नीचे पालन पहिया जलाया पतला नयी नया तेल तालिका सवाल पवन वन जन तन नवीन पीली नाना तेरा पिता नानी चाचा चाची पति सहेली राजा रानी किसान लोहार कान नाक पांव चेहरा तारा हवा रात सवेरा रेत कली चावल पालक करेला चीनी केला संतरा पपीता नारियल हलवा चार पांच सात तेरह सोलह तीस चालीस पचास हजार तीसरा सवा रविवार जनवरी वसंत साल परसों सोना चलना हंसना रोना नाचना कहना करना पकाना लेना जीतना हारना सजाना तेज पीला नीला काला नीचा चंचल रेल जहाज नाव पेंसिल ताला तकिया जालोर कोलकाता रांची कविता कहानी कला सेना नेता वेतन तोता चील सांप तितली वे कितना कितने लेकिन तो जी हाल चाल ताल ताज किला राज सिंहासन तलवार विजय वीर वीरता",
    seconds: 300, wpm: 7, acc: 86,
  },
  {
    title: "म ग ब द and अ इ उ",
    titleHi: "म ग ब द और अ इ उ",
    description: "E=म, X=ग, C=ब, N=द; V=अ, B=इ, M=उ (आ is V then K).",
    descriptionHi: "e से म, x से ग, c से ब, n से द; v से अ, b से इ, m से उ (आ = v फिर k)।",
    newKeys: "excnvbm",
    words: "हिसाब तालाब जवाब कलम मगर बदल नमक दम गम बम मन बात बाग दान गाना अब इस उस अगर गया मदद आम आदमी मदन मीना बगल बाल बाजार दादा नाम मामा दीवार दवा इमली उमर उपाय अनाज इनाम नमन गिनती मंगल दिन बीच गीत अपना बनाना बिना उनका अमन में आप आज हम गरीब मेरा माता बहन दादी मामी दामाद मेहमान माली दांत गला बांह उंगली कमर दिल दिमाग गाल चांद बादल बिजली दोपहर उजाला नदी सागर जंगल बीज बगीचा दाल गाजर दही सेब अनार बादाम समोसा जलेबी दो दस बारह बीस सोमवार मंगलवार सितंबर नवंबर दिसंबर हेमंत महीना देर आना बोलना बताना बंद देना मांगना मिलना गिरना लंबा गरम नरम गंदा नमकीन चांदी अमीर गहरा उदास मकान कमरा आंगन दरवाजा गली मंदिर बस साइकिल किताब रबर गिलास कमीज मोजा चाबी चादर कंबल दीपक दीया अजमेर बीकानेर अलवर बारां राजसमंद गंगानगर अहिंसा दया बल इतिहास संगीत अदालत मतदान आयोग आवेदन गाय बकरी बंदर मोर कब आगे अंदर बाहर मत कमाल महल दरबार कमान तिरंगा",
    seconds: 300, wpm: 8, acc: 87,
  },
  {
    title: "Matras and vowels: ु ू ृ ै ए ऐ",
    titleHi: "मात्राएँ और स्वर: ु ू ृ ै ए ऐ",
    description: "Q=ु, W=ू, `=ृ, Shift+S=ै, ,=ए, ,+S=ऐ. ो = K then S. ौ = K then Shift+S.",
    descriptionHi: "q से ु, w से ू, ` से ृ, Shift+S से ै, ',' से ए। ो = k फिर s।",
    newKeys: "qw`S,",
    words: "ससुर बहुत सुन पुल दूर मूल कृपा है और एक ऐसा कैसे पैसा सुबह गुलाब सूरज तुम मैं कैसा सुना सुनो चुप दुकान पुराना मूली कुआं तुरंत तुला चुनाव सुंदर कैसी मैला बैल ऐनक ऐब ऐसे पैर हैं बाहुबली मुंह गृह मृग दुनिया बहू राजकुमार सैनिक मजदूर दुकानदार सुनार मैदान आलू बैंगन लौकी अंगूर नींबू तरबूज काजू पूरी नौ चौदह सौ दूसरा पौना जून कूदना सुनना बुलाना सुनाना तैरना बुरा गुलाबी बैंगनी सुनहरा बहादुर चतुर चौराहा चाकू कैंची जूता जयपुर उदयपुर नागौर जैसलमेर दौसा करौली बूंदी रायपुर देहरादून तैराकी कानून पुलिस बैंक चूहा कौआ कबूतर तू कौन परंतु इसलिए सुर",
    seconds: 300, wpm: 8, acc: 87,
  },
  {
    title: "Shift letters: ट ठ ड ढ छ झ फ ळ",
    titleHi: "Shift अक्षर: ट ठ ड ढ छ झ फ ळ",
    description: "Hold Shift: V=ट, B=ठ, M=ड, <=ढ, N=छ, >=झ, Q=फ, G=ळ.",
    descriptionHi: "Shift दबाकर: V=ट, B=ठ, M=ड, <=ढ, N=छ, >=झ, Q=फ, G=ळ।",
    newKeys: "VBM<N>QG",
    words: "सरसराहट कुछ पूछ मुझे लुटेरा टमाटर ठंड डर छत छोटा फल फूल झील ढोल टोपी छाता डाल फिर ठीक झूठ डोर टीका ठंडा छोटी डाक टूटा फटा झंडा फैसला छुरी फौज टहल ठहर डोली झरना फसल फैला बेटा बेटी डाकिया पेट पीठ टांग होंठ तूफान छांव डाली रोटी मटर छाछ पराठा छह आठ अठारह साठ फरवरी मिनट उठना बैठना पूछना समझना काटना उठाना टहलना डरना ठिगना मोटा कठोर साफ मीठा सफेद झूठा डरपोक मोटर लोटा कटोरी पैंट बटुआ लालटेन कोटा झुंझुनूं टोंक डूंगरपुर पटना नाटक नोट मछली मेंढक कछुआ चींटी पीछे ढाल",
    seconds: 300, wpm: 9, acc: 88,
  },
  {
    title: "Half letters (आधे अक्षर)",
    titleHi: "आधे अक्षर",
    description: "Capital keys are half letters: D=क् X=ग् T=ज् R=त् U=न् I=प् C=ब् E=म् Y=ल् O=व् L=स् P=च् '=श्.",
    descriptionHi: "कैपिटल keys आधे अक्षर हैं: D=क् X=ग् T=ज् R=त् U=न् I=प् C=ब् E=म् Y=ल् O=व् L=स् P=च् '=श्।",
    newKeys: "DXTRUICEYOLP'",
    words: "यशा रहस्य बिल्ली पुस्तक तृप्त दृश्य छप्पर ढक्कन डिब्बा बच्चा अच्छा पक्का सच्चा दिल्ली पत्ता कुत्ता पन्ना स्कूल सब्जी जल्दी अस्पताल मुश्किल सम्मान रस्सी मक्का गुस्सा अक्सर चप्पल सत्य सप्ताह पक्की हल्का कच्चा स्वाद स्वर विश्वास सन्नाटा शहर देश शाम शरीर शेर शांत शिकार पत्नी दोस्त व्यापारी कुम्हार त्वचा आकाश बारिश रेगिस्तान प्याज शलजम शरबत लस्सी किशमिश रसगुल्ला ग्यारह उन्नीस सत्तर अस्सी नब्बे शनिवार अगस्त अक्टूबर शरद शिशिर हमेशा शायद मुस्कुराना होशियार रास्ता मस्जिद स्टेशन स्केल बस्ता बाल्टी चम्मच प्लेट चश्मा बिस्तर बल्ब हिंदुस्तान शिमला शक्ति संस्कार संस्कृति साहित्य नृत्य कुश्ती न्याय पेशा सिक्का उल्लू मगरमच्छ मच्छर क्या क्यों क्योंकि शांति शहीद",
    seconds: 300, wpm: 9, acc: 88,
  },
  {
    title: "Two-key letters and conjuncts",
    titleHi: "दो-key अक्षर और संयुक्ताक्षर",
    description: "ख=[+K, घ=?+K, ण=.+K, थ=F+K, ध=/+K, भ=H+K, श='+K, ष=\"+K. क्ष={+K, त्र==, ज्ञ=Shift+K, श्र=Shift+J.",
    descriptionHi: "ख=[ फिर k, घ=? फिर k, ण=. फिर k, थ=F फिर k, ध=/ फिर k, भ=H फिर k, श=' फिर k, ष=\" फिर k। क्ष={k, त्र==, ज्ञ=K, श्र=J।",
    newKeys: "[?.F/H\"{=KJ",
    words: "हाथ रखें सीख सीखें लिखा उधार मित्र गणना भैया कृषि धक्का स्थान खाना घर भारत भाषा धन साथ कथा गणित क्षमा शिक्षा त्रिकोण ज्ञान श्रमिक खेल घंटा देखो धूप खिलौना खुश खबर भोजन धीरे भगवान क्षेत्र ज्ञानी श्रम श्रीमान थाली घास घाट घाव धनुष भालू भूख पुत्र स्त्री अतिथि शिष्य धोबी आंख जीभ कंधा नाखून घुटना खून माथा धरती आंधी अंधेरा पत्थर पौधा खेत खलिहान गोभी भिंडी धनिया दूध मक्खन घी खरबूजा खीर सत्रह लाख चौथा आधा बुधवार क्षण अभी कभी लिखना देखना सीखना सिखाना खेलना खोलना धोना सुखाना खींचना धकेलना रखना भेजना दिखाना घूमना संभलना भारी धीमा तीखा भूरा सीधा उथला तख्ती धागा धोती थैला पंखा राजस्थान जोधपुर भरतपुर धौलपुर भोपाल गांधीनगर सभ्यता भूगोल विज्ञान चित्र मंत्री अधिकारी विभाग परीक्षा परिणाम हस्ताक्षर तारीख खाता हाथी भैंस गधा खरगोश हिरण मधुमक्खी मक्खी किधर इधर उधर भी धमाल भाला देशभक्त",
    seconds: 300, wpm: 10, acc: 88,
  },
  {
    title: "Reph and rakar: र् ्र",
    titleHi: "रेफ और रकार: र् ्र",
    description: "Z=र् (typed AFTER the letter, धर्म = /keZ). z=्र (typed after the letter, प्र = iz). द्य = |.",
    descriptionHi: "Z से रेफ (र्), अक्षर के बाद टाइप होता है (धर्म = /keZ)। z से ्र (प्र = iz)। द्य = |।",
    newKeys: "Zz|",
    words: "भाई धर्म कर्म सर्दी गर्मी पर्वत प्रकार क्रम राष्ट्र ग्राम प्रेम कार्य अर्थ मूर्ति पूर्ण कार्यालय विद्या सर्वत्र वर्ष पूर्व चर्चा तर्क दर्द मर्द प्रश्न प्रभात प्राण प्रिय प्रकाश क्रोध क्रिया ग्रंथ दर्पण आदर्श पर्यटन पर्यावरण स्वर्ग मिठाई ग्राहक वैद्य नाई दर्जी बर्फ समुद्र मिर्च बर्फी पंद्रह ढाई शुक्रवार मार्च अप्रैल मई जुलाई ग्रीष्म वर्षा गर्म मूर्ख रसोई फर्श चर्च हवाई ट्रेन सुई कुर्ता रजाई मुंबई चेन्नई धैर्य क्रिकेट कर्मचारी प्रमाणपत्र उम्र राष्ट्रगान राष्ट्रीय",
    seconds: 300, wpm: 10, acc: 88,
  },
  {
    title: "Nukta, ई, रु/रू and mixed words",
    titleHi: "नुक्ता, ई, रु/रू और मिश्रित शब्द",
    description: "+ adds a nukta (ज़ = t+, ड़ = M+, ढ़ = <+). ई = b then Z. Shift+3 = रु, Shift+; = रू.",
    descriptionHi: "+ से नुक्ता (ज़ = t+, ड़ = M+, ढ़ = <+)। ई = b फिर Z। Shift+3 से रु, Shift+; से रू।",
    newKeys: "+#:",
    words: "शुरू झाड़ू छोड़ना घड़ी थोड़ा खिड़की भेड़ क्रीड़ा बड़ा पढ़ना ज़रूर रुपया रूप गुरु कागज़ आज़ादी ज़मीन सड़क लड़का लड़की पढ़ाई बढ़ाना रूई रुमाल रुकना रूखा गुरुवार जरूरत ज़िंदगी ज़बान पड़ोसी बढ़ई ठोड़ी पहाड़ पेड़ जड़ गुड़ अमरूद पकौड़ा करोड़ डेढ़ रोज़ दौड़ना जोड़ना तोड़ना बिछड़ना उड़ना कुरूप कड़वा टेढ़ा चौड़ा सीढ़ी गाड़ी कपड़ा साड़ी पगड़ी चूरू बाड़मेर झालावाड़ चित्तौड़गढ़ भीलवाड़ा प्रतापगढ़ बांसवाड़ा हनुमानगढ़ चंडीगढ़ करुणा दौड़ घोड़ा लोमड़ी भेड़िया चिड़िया",
    seconds: 300, wpm: 11, acc: 88,
  },
  {
    title: "Sentences (वाक्य) and 300-word paragraph",
    titleHi: "वाक्य अभ्यास और 300 शब्द का पैराग्राफ",
    description: "Shift+A = । (danda), ] = , (comma). Finish with a full 300-word paragraph.",
    descriptionHi: "Shift+A से ।, ] से , (अल्पविराम)। अंत में 300 शब्दों का पूरा पैराग्राफ।",
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
      "सुबह जल्दी उठना अच्छी आदत है।",
      "मेरा भाई रोज़ स्कूल जाता है।",
      "मां रसोई में खाना बनाती है।",
      "किसान खेत में अनाज उगाता है।",
      "हमें रोज़ थोड़ी देर टहलना चाहिए।",
      "शिक्षक बच्चों को पढ़ाते हैं।",
      "राजस्थान एक बड़ा और सुंदर राज्य है।",
      "बगीचे में लाल, पीले और गुलाबी फूल खिले हैं।",
      "सच बोलना सबसे अच्छा धर्म है।",
      "मेहनत करने वाला कभी नहीं हारता।",
      "दिल्ली भारत की राजधानी है।",
      "हम सबको मिलकर रहना चाहिए।",
      "टाइपिंग का अभ्यास रोज़ करना चाहिए।",
      "धीरे धीरे गति बढ़ती है और गलतियां कम होती हैं।",
      "पानी जीवन के लिए बहुत ज़रूरी है।",
      "समय पर काम करने वाला व्यक्ति आगे बढ़ता है।",
      "आप भी सही उंगली से सही बटन दबाइए।",
    ],
    paragraph: "हमारा भारत एक बहुत सुंदर और बड़ा देश है। यहां पर्वत हैं, नदियां हैं, जंगल हैं और हरे भरे खेत हैं। उत्तर में हिमालय खड़ा है और दक्षिण में गहरा समुद्र है। गंगा, यमुना और गोदावरी जैसी नदियां करोड़ों लोगों को पानी देती हैं। हमारे देश में कई भाषाएं बोली जाती हैं, कई त्योहार मनाए जाते हैं और कई तरह का भोजन बनाया जाता है, फिर भी सब लोग मिलकर रहते हैं। यही हमारी सबसे बड़ी ताकत है। सुबह जल्दी उठना अच्छी आदत है। जो बच्चा सुबह उठकर पढ़ाई करता है, उसे दिनभर सब कुछ याद रहता है। ताज़ी हवा में थोड़ी देर टहलने से शरीर स्वस्थ रहता है और मन भी प्रसन्न रहता है। इसलिए हर किसी को रोज़ थोड़ा समय अपने लिए निकालना चाहिए। जो लोग समय का सही उपयोग करते हैं, वे जीवन में आगे बढ़ते हैं। मेहनत करने वाला व्यक्ति कभी हारता नहीं है। किसान सुबह से शाम तक खेत में काम करता है, तब जाकर हमें अनाज मिलता है। मजदूर ईंट और पत्थर उठाता है, तब जाकर घर और सड़क बनती है। शिक्षक बच्चों को पढ़ाता है, तब जाकर समाज में ज्ञान का प्रकाश फैलता है। वैद्य मरीज की सेवा करता है और सैनिक सीमा पर देश की रक्षा करता है। हर काम का अपना महत्व है और हर व्यक्ति का अपना योगदान है। टाइपिंग सीखना भी एक अच्छी कला है। आज कार्यालय, बैंक, स्कूल और सरकारी विभाग में कंप्यूटर पर काम होता है। जो व्यक्ति तेज और सही टाइप करता है, उसे नौकरी में बहुत सहायता मिलती है। शुरू में गलतियां होती हैं, उंगलियां धीरे चलती हैं, पर रोज़ अभ्यास करने से गति बढ़ती है। इसलिए धैर्य रखें, सही उंगली से सही बटन दबाएं और स्क्रीन की ओर देखकर लिखते रहें। एक दिन आप बिना रुके, बिना देखे और बिना गलती के टाइप करेंगे।",
    seconds: 300, wpm: 12, acc: 90,
  },
];

const split = (s: string) => s.trim().split(/\s+/).filter(Boolean);

/** Real words typable in lesson `i` only. */
const newWordsFor = (i: number): string[] => split(SPECS[i].words);

/** Practice (syllable) words for lessons that define `pseudo`, up to and including lesson `i`. */
const pseudoUpTo = (i: number): string[] =>
  SPECS.slice(0, i + 1).flatMap((s) => (s.pseudo ? pseudoWords(s.pseudo) : []));

/** Keys typable up to and including lesson `i`. */
const keysFor = (i: number): string =>
  Array.from(new Set(SPECS.slice(0, i + 1).flatMap((s) => Array.from(s.newKeys)))).join("");

export const krutiDevBeginnerLessons: Lesson[] = SPECS.map((s, i) => {
  const ex = (type: LessonExercise["type"], label: string, labelHi: string, text: string): LessonExercise => ({ type, label, labelHi, text });
  const realNew = newWordsFor(i);
  const realBefore = SPECS.slice(0, i).flatMap((_, k) => newWordsFor(k));
  const pseudoNew = s.pseudo ? pseudoWords(s.pseudo) : [];
  const pseudoAll = pseudoUpTo(i);

  let exercises: LessonExercise[];

  if (s.sentences) {
    // Last lesson: sentences, revision words and the real 300-word paragraph.
    const half = Math.ceil(s.sentences.length / 2);
    const rev = new Feed(shuffle(kd([...realNew, ...realBefore].join(" ")), 7));
    exercises = [
      ex("sentence-drill", "Sentences 1", "वाक्य 1", kd(s.sentences.slice(0, half).join(" ")).join(" ")),
      ex("sentence-drill", "Sentences 2", "वाक्य 2", kd(s.sentences.slice(half).join(" ")).join(" ")),
      ex("word-drill", "Revision words", "पुराने शब्दों का अभ्यास", rev.chars(1100)),
      ex("sentence-drill", "All sentences", "सभी वाक्य", kd(shuffle(s.sentences, 3).join(" ")).join(" ")),
      ex("paragraph-drill", "Paragraph (300 words)", "पैराग्राफ (300 शब्द)", kd(s.paragraph ?? "").join(" ")),
    ];
  } else {
    const keyFeedA = new Feed(shuffle(keyCombos(s.newKeys), 1));
    const keyFeedB = new Feed(shuffle(keyCombos(i === 0 ? s.newKeys : keysFor(i)), 4));
    // New words first (real + practice words), then everything learned so far - never repeating inside a lesson.
    const newTokens = shuffle(kd([...realNew, ...pseudoNew].join(" ")), 2);
    const oldTokens = shuffle(kd([...realBefore, ...pseudoAll.filter((w) => !pseudoNew.includes(w))].join(" ")).filter(Boolean), 9);
    // One master list: this lesson's words first, then earlier lessons' words, so the three
    // word drills walk it without repeating anything until the whole list is used.
    const master = new Feed([...newTokens, ...oldTokens]);
    const feedNew = master;
    const feedOld = master;
    const para = new Feed(shuffle(kd([...realNew, ...realBefore, ...pseudoAll].join(" ")), 11));
    exercises = [
      ex("key-drill", "Key drill", "key अभ्यास", keyFeedA.chars(500)),
      ex("key-drill", "Mixed key drill", "मिश्रित key अभ्यास", keyFeedB.chars(500)),
      ex("word-drill", "Word drill", "शब्द अभ्यास", feedNew.chars(900)),
      ex("word-drill", "Word drill again", "शब्द अभ्यास दोबारा", feedNew.chars(900)),
      ex("word-drill", i === 0 ? "Word drill (fast)" : "Revision words", i === 0 ? "शब्द अभ्यास (तेज़)" : "पुराने शब्दों का अभ्यास", feedOld.chars(900)),
      ex("paragraph-drill", "Paragraph (300 words)", "पैराग्राफ (300 शब्द)", para.words(300)),
    ];
  }

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

/** Spec exported for scripts/krutidev-lessons-check (checks keys used per lesson). */
export const KRUTI_LESSON_SPECS = SPECS.map((s) => ({
  newKeys: s.newKeys,
  words: s.sentences
    ? s.sentences.join(" ") + (s.paragraph ? " " + s.paragraph : "")
    : s.words + (s.pseudo ? " " + pseudoWords(s.pseudo).join(" ") : ""),
}));
