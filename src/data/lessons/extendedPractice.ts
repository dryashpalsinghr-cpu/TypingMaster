import type { Lesson, LessonExercise } from "../../types";
import { unicodeToKrutiDev } from "../../converter/krutiDevCore";

// Original drills, following the course categories in TypingMaster's official manual:
// https://www.typingmaster.com/typing-tutor/support/user-manual.html
// Existing lesson IDs and progress are retained. Speed follows letter mastery,
// then two number-row lessons, followed by special marks.
const longDrill = (text: string) => Array.from({ length: Math.ceil(2400 / text.length) }, () => text).join(" ");
const enSpecs = [
  { title: "Speed Building: Left Hand", titleHi: "गति अभ्यास: बायाँ हाथ", keys: "asdfqwertgzxcvb", drill: "as we draw a red vase a great tree a brave waiter", text: "We draw a brave face as we read. A great wave sweeps a red desert. We rest after a great race.", wpm: 18 },
  { title: "Speed Building: Right Hand", titleHi: "गति अभ्यास: दायाँ हाथ", keys: "jkl;uiophnm", drill: "join link milk jump moon noon onion pool hill minimum", text: "Join a group and keep your hands relaxed. Look up from the keys and follow the line. Build a smooth rhythm with regular practice.", wpm: 20 },
  { title: "Speed Building: Common Words", titleHi: "गति अभ्यास: सामान्य शब्द", keys: "abcdefghijklmnopqrstuvwxyz", drill: "the and that have with this from they would there their about which when make time people", text: "Every day we can make time for a little practice. Look at the words on the screen and return your fingers to the home row. A steady rhythm helps you type with confidence.", wpm: 22 },
  { title: "Speed Building: Full Text", titleHi: "गति अभ्यास: पूरा पाठ", keys: "abcdefghijklmnopqrstuvwxyz", drill: "accuracy rhythm confidence practice progress keyboard fingers steady smooth relaxed", text: "A student plans a short practice session each morning. First the student checks posture and places both hands on the home row. The next task is to type a paragraph carefully. When a mistake appears, the student corrects it and continues at a comfortable pace. Regular practice improves accuracy and speed together.", wpm: 25 },
  { title: "Numbers: Left Side 1 2 3 4 5", titleHi: "संख्याएँ: बाईं ओर 1 2 3 4 5", keys: "12345", drill: "11 22 33 44 55 12 23 34 45 51 123 234 345 543 321 15243", text: "Room 123 has 45 files. Desk 12 has 34 books. We practise 15 minutes and check 25 records. The first list has 5 items and the next list has 4 items.", wpm: 15 },
  { title: "Numbers: Right Side 6 7 8 9 0", titleHi: "संख्याएँ: दाईं ओर 6 7 8 9 0", keys: "67890", drill: "66 77 88 99 00 67 78 89 90 06 678 789 890 987 076 1234567890", text: "The record number is 67890. The office has 90 forms and 78 files. On 12 June 2026, we checked 60 entries. Order 890 has 7 boxes and order 901 has 8 boxes.", wpm: 15 },
  { title: "Special Marks: Email and Web", titleHi: "विशेष चिह्न: ईमेल और वेब", keys: "@._-/:", drill: "@ @ . . _ _ - - / / : : user@example.test first_last mail-box https://example.test", text: "Email: learner@example.test Website: https://example.test/practice File: daily_notes.txt User: typing-student Folder: notes/lesson-01", wpm: 15 },
  { title: "Special Marks: Maths and Brackets", titleHi: "विशेष चिह्न: गणित और ब्रैकेट", keys: "!#$%^&*()+={}[]<>?\\|`~\"", drill: "! # $ % ^ & * ( ) + = { } [ ] < > ? \\ | ` ~ \" 5+3=8 (12-4)/2=4 [item] {value}", text: 'Total = (12 + 8) * 3; Discount = 10%; Check [A] & [B]. Is 5 < 9? Yes! Save "practice" in {notes}. Price: $25 #1.', wpm: 15 },
];
export const englishExtendedLessons: Lesson[] = enSpecs.map((s, i) => {
  const speed = i < 4;
  const exercises: LessonExercise[] = [
    { type: speed ? "word-drill" : "key-drill", label: speed ? "Word rhythm" : "New keys", labelHi: speed ? "शब्द लय" : "नई keys", text: longDrill(s.drill) },
    { type: "sentence-drill", label: "Sentences", labelHi: "वाक्य", text: longDrill(s.text) },
    { type: speed ? "speed-drill" : "text-drill", label: speed ? "Speed practice" : "Mixed text", labelHi: speed ? "गति अभ्यास" : "मिश्रित पाठ", text: longDrill(`${s.text} ${s.drill}`) },
  ];
  return {
    id: `en-extra-${i + 1}`, courseId: "en-beginner", language: "en", layout: "en-qwerty", order: 13 + i,
    title: s.title, titleHi: s.titleHi,
    description: speed ? "Build a steady rhythm after learning all letter keys. Keep accuracy above 95%." : "Learn the new number or symbol keys, practise combinations, then type full text.",
    descriptionHi: speed ? "सभी अक्षर सीखने के बाद नियमित लय बनाएँ। शुद्धता 95% से ऊपर रखें।" : "नई संख्या या चिह्न keys सीखें, संयोजन और पूरा पाठ टाइप करें।",
    newKeys: Array.from(s.keys), requiredKeys: Array.from(new Set(exercises.flatMap((e) => Array.from(e.text)))),
    exerciseType: exercises[0].type, practiceText: exercises[0].text, exercises,
    suggestedDurationSec: 300, passWpm: s.wpm, passAccuracy: 95,
  };
});
const hiSpecs = [
  { title: "Kruti Dev: Common Word Speed", titleHi: "कृति देव: सामान्य शब्दों की गति", words: "भारत समय काम नाम घर परिवार समाज शिक्षा विकास अभ्यास गति शुद्धता नियमित प्रयास", text: "नियमित अभ्यास से टाइपिंग की गति और शुद्धता बढ़ती है। पहले धीरे और सही टाइप करें। फिर अपनी गति बढ़ाएं। हाथ आराम से रखें और स्क्रीन पर ध्यान दें।" },
  { title: "Kruti Dev: Full Text Speed", titleHi: "कृति देव: पूरे पाठ की गति", words: "विद्यालय विद्यार्थी अध्ययन पुस्तक शिक्षक जीवन सफलता मेहनत अवसर विश्वास", text: "शिक्षा जीवन में आगे बढ़ने का मार्ग दिखाती है। विद्यार्थी हर दिन समय पर विद्यालय जाते हैं। शिक्षक उन्हें पढ़ने और लिखने का अभ्यास कराते हैं। नियमित मेहनत से काम में सुधार होता है। हमें अपना काम ध्यान से करना चाहिए।" },
];
export const hindiSpeedLessons: Lesson[] = hiSpecs.map((s, i) => {
  const exercises: LessonExercise[] = [
    { type: "word-drill", label: "Common words", labelHi: "सामान्य शब्द", text: longDrill(unicodeToKrutiDev(s.words)) },
    { type: "sentence-drill", label: "Sentences", labelHi: "वाक्य", text: longDrill(unicodeToKrutiDev(s.text)) },
    { type: "speed-drill", label: "Full text speed", labelHi: "पूरे पाठ की गति", text: longDrill(unicodeToKrutiDev(`${s.text} ${s.words}`)) },
  ];
  return { id: `kd-speed-${i + 1}`, courseId: "kd-beginner", language: "hi", layout: "kruti-dev-010", order: 100 + i,
    title: s.title, titleHi: s.titleHi, description: "Practise fluent Hindi typing after completing the key lessons.", descriptionHi: "keys के पाठ पूरे करने के बाद सहज हिन्दी टाइपिंग और गति का अभ्यास।",
    newKeys: [], requiredKeys: Array.from(new Set(exercises.flatMap((e) => Array.from(e.text)))), exerciseType: exercises[0].type,
    practiceText: exercises[0].text, exercises, suggestedDurationSec: 300, passWpm: 20 + i * 5, passAccuracy: 95 };
});
