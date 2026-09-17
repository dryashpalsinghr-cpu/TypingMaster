import type { TypingLanguage, KeyboardLayoutId } from "../types";

export interface TestText {
  id: string;
  language: TypingLanguage;
  layout: KeyboardLayoutId;
  title: string;
  titleHi: string;
  text: string;
  wordCount: number;
}

// All passages below are written fresh for this project (plain, exam-style
// filler content on generic topics) - none of it is copied from any
// commercial typing-tutor or exam paper. Each is long enough to cover the
// longest duration offered on the Typing Test screen; if a fast typist
// finishes early the test simply ends and scores what was typed.

const englishShort =
  "The quick brown fox jumps over the lazy dog near the river bank every morning before sunrise. " +
  "Good typing habits save time and reduce mistakes. Sit straight, keep your wrists relaxed, and look " +
  "at the screen instead of the keyboard while you practice each day.";

const englishMedium =
  "Learning to type without looking at the keyboard is one of the most useful skills for any office job. " +
  "It saves time, reduces errors, and makes daily computer work far less tiring on the hands and eyes. " +
  "Most typing exams check both your speed and your accuracy, so it is never a good idea to rush through " +
  "a passage while making careless mistakes. Instead, practice at a steady and comfortable pace, and let " +
  "your speed increase naturally over time as your fingers learn where each key is located. Regular short " +
  "sessions of ten to fifteen minutes are usually far more effective than one long session done occasionally. " +
  "Keep your back straight, your elbows close to your body, and take a short break every twenty minutes " +
  "to rest your eyes and your hands. With steady daily practice, most learners can double their typing " +
  "speed within a few weeks while also becoming far more accurate.";

const englishLong =
  "Computers have changed the way people work, study, and communicate with one another across the world. " +
  "In almost every office today, employees are expected to prepare reports, send emails, and manage records " +
  "using a keyboard, which makes accurate and fast typing an essential skill for nearly every career. " +
  "Government departments, banks, and private companies often test typing speed and accuracy before hiring " +
  "candidates for clerical and administrative positions, because a skilled typist can complete far more work " +
  "in the same amount of time compared to someone who still searches for each key. Building this skill does " +
  "not happen overnight, but it also does not require years of effort. With regular, focused practice, most " +
  "people can reach a comfortable working speed within a few weeks. The most important habits to develop are " +
  "sitting with good posture, keeping the wrists level with the keyboard, resting the fingers lightly on the " +
  "home row keys, and looking at the screen rather than at the hands. Beginners often make the mistake of " +
  "typing as fast as possible from the very first day, which usually leads to more errors and bad finger " +
  "habits that are hard to correct later. It is far better to type slowly and correctly at first, and only " +
  "increase speed once the correct finger for every key becomes automatic. Accuracy matters just as much as " +
  "speed in most typing tests, since a fast typist who makes many mistakes will often score lower than a " +
  "slightly slower typist who types cleanly. Taking short breaks during long practice sessions also helps " +
  "prevent tiredness in the hands and eyes, which in turn helps maintain both speed and accuracy over time. " +
  "With patience and consistent daily practice, anyone preparing for a typing examination can steadily build " +
  "the confidence and skill needed to perform well on the actual test day.";

const hindiShort =
  "अच्छी आदतें अपनाकर टाइपिंग सीखना आसान हो जाता है। सीधे बैठें, उंगलियों को होम रो पर रखें और स्क्रीन " +
  "की ओर देखें, कीबोर्ड की ओर नहीं। रोज़ थोड़ा अभ्यास करने से गति और सटीकता दोनों बढ़ती हैं।";

const hindiMedium =
  "आज के समय में कंप्यूटर पर तेज़ और सही टाइपिंग करना एक बहुत उपयोगी कौशल बन गया है। सरकारी और निजी " +
  "दोनों क्षेत्रों में कई नौकरियों के लिए टाइपिंग परीक्षा देनी पड़ती है, जिसमें गति के साथ-साथ सटीकता को " +
  "भी परखा जाता है। शुरुआत में जल्दबाज़ी करने के बजाय धीरे और सही तरीके से अभ्यास करना चाहिए, ताकि " +
  "उंगलियों को सही कुंजी की आदत पड़ जाए। रोज़ दस से पंद्रह मिनट का अभ्यास करने से कुछ ही हफ़्तों में " +
  "अच्छी गति हासिल की जा सकती है। बैठने का तरीका सही रखें, कलाइयों को आराम से रखें और हर बीस मिनट " +
  "बाद थोड़ा विश्राम अवश्य लें, इससे आँखों और हाथों दोनों को राहत मिलती है।";

const hindiLong =
  "शिक्षा और तकनीक ने मिलकर आज हर क्षेत्र में काम करने के तरीके को पूरी तरह बदल दिया है। सरकारी कार्यालयों, " +
  "बैंकों और निजी कंपनियों में अधिकतर काम अब कंप्यूटर के माध्यम से ही होता है, इसलिए सही और तेज़ टाइपिंग " +
  "करना हर कर्मचारी के लिए एक ज़रूरी कौशल बन गया है। कई सरकारी परीक्षाओं में भर्ती से पहले उम्मीदवार की " +
  "टाइपिंग गति और सटीकता दोनों की जाँच की जाती है, क्योंकि एक कुशल टाइपिस्ट उतने ही समय में कहीं अधिक " +
  "काम पूरा कर सकता है। यह कौशल एक दिन में नहीं आता, लेकिन नियमित अभ्यास से कुछ ही हफ़्तों में अच्छी " +
  "गति हासिल की जा सकती है। शुरुआत में सबसे ज़रूरी बात यह है कि बैठने का तरीका सही हो, कलाइयाँ कीबोर्ड " +
  "के समांतर रहें, उंगलियाँ होम रो की कुंजियों पर टिकी रहें और नज़र स्क्रीन पर हो, कीबोर्ड पर नहीं। " +
  "बहुत से नए सीखने वाले शुरू से ही तेज़ टाइप करने की कोशिश करते हैं, जिससे गलतियाँ ज़्यादा होती हैं और " +
  "गलत आदतें बन जाती हैं जिन्हें बाद में सुधारना मुश्किल होता है। इसलिए पहले धीरे और सही टाइप करना " +
  "सीखना चाहिए, और सही उंगली की आदत बनने के बाद ही गति बढ़ानी चाहिए। अधिकतर टाइपिंग परीक्षाओं में " +
  "सटीकता उतनी ही महत्वपूर्ण मानी जाती है जितनी गति, क्योंकि बहुत सी गलतियाँ करने वाला तेज़ टाइपिस्ट " +
  "अक्सर धीमे लेकिन सही टाइप करने वाले से कम अंक पाता है। लंबे अभ्यास सत्र के दौरान बीच-बीच में छोटा " +
  "विश्राम लेना भी ज़रूरी है, इससे हाथों और आँखों की थकान कम होती है और गति व सटीकता दोनों बनी रहती हैं। " +
  "धैर्य और निरंतर अभ्यास से कोई भी उम्मीदवार परीक्षा के दिन आत्मविश्वास के साथ अच्छा प्रदर्शन कर सकता है।";

function wc(t: string): number {
  return t.trim().split(/\s+/).length;
}

export const testTexts: TestText[] = [
  { id: "en-t-short", language: "en", layout: "en-qwerty", title: "Short passage (~1 min)", titleHi: "छोटा टेक्स्ट (~1 मिनट)", text: englishShort, wordCount: wc(englishShort) },
  { id: "en-t-medium", language: "en", layout: "en-qwerty", title: "Medium passage (~5 min)", titleHi: "मध्यम टेक्स्ट (~5 मिनट)", text: englishMedium, wordCount: wc(englishMedium) },
  { id: "en-t-long", language: "en", layout: "en-qwerty", title: "Long passage (~15 min)", titleHi: "लंबा टेक्स्ट (~15 मिनट)", text: englishLong, wordCount: wc(englishLong) },
  { id: "hi-t-short", language: "hi", layout: "unicode-inscript", title: "Short passage (~1 min)", titleHi: "छोटा टेक्स्ट (~1 मिनट)", text: hindiShort, wordCount: wc(hindiShort) },
  { id: "hi-t-medium", language: "hi", layout: "unicode-inscript", title: "Medium passage (~5 min)", titleHi: "मध्यम टेक्स्ट (~5 मिनट)", text: hindiMedium, wordCount: wc(hindiMedium) },
  { id: "hi-t-long", language: "hi", layout: "unicode-inscript", title: "Long passage (~15 min)", titleHi: "लंबा टेक्स्ट (~15 मिनट)", text: hindiLong, wordCount: wc(hindiLong) },
];

export function getTestTextsForLanguage(language: TypingLanguage): TestText[] {
  return testTexts.filter((t) => t.language === language);
}

export const TEST_DURATIONS_MIN = [1, 2, 5, 10, 15] as const;
