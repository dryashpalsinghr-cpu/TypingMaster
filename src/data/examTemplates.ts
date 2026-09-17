import type { ExamTemplate } from "../types/exam";
// Built-in templates are EDITABLE starting points. Duration and target numbers
// are illustrative defaults - adjust them to the current official notification.
// All passages below are original practice text, not copied from any exam.
export const BUILT_IN_TEMPLATES: ExamTemplate[] = [
  {
    category: "ssc",
    name: "SSC Style (English)",
    description: "English typing test format. Edit duration and targets to match the current notification.",
    language: "en",
    durationSeconds: 600,
    targetWpm: 35,
    targetKdph: 10500,
    minAccuracy: 90,
    allowBackspace: true,
    focusLossLimit: 3,
    isBuiltIn: true,
    updatedAt: 0,
    passage:
      "Practice makes a typist steady and calm. Sit straight, keep both wrists relaxed, and let your fingers return to the home row after every word. Speed grows on its own once your accuracy becomes reliable, so aim for clean and even strokes before you try to race the clock.",
  },
  {
    category: "rrb",
    name: "RRB Style (English)",
    description: "Railways typing practice format. Adjust the targets as required.",
    language: "en",
    durationSeconds: 600,
    targetWpm: 30,
    targetKdph: 9000,
    minAccuracy: 88,
    allowBackspace: true,
    focusLossLimit: 3,
    isBuiltIn: true,
    updatedAt: 0,
    passage:
      "A reliable typist reads a few words ahead while the fingers keep moving. Breathe evenly, keep your eyes on the source text, and trust the muscle memory you have built through daily practice. Small, consistent sessions beat long and tiring ones every single week.",
  },
  {
    category: "cpct",
    name: "CPCT Style (Hindi)",
    description: "Hindi typing practice format. Requires a Hindi layout. Edit targets as needed.",
    language: "hi",
    durationSeconds: 900,
    targetWpm: 25,
    targetKdph: 7500,
    minAccuracy: 85,
    allowBackspace: true,
    focusLossLimit: 3,
    isBuiltIn: true,
    updatedAt: 0,
    passage:
      "कंप्यूटर पर लगातार अभ्यास से गति और शुद्धता दोनों बढ़ती हैं। सीधे बैठें, कंधों को ढीला रखें और हर शब्द के बाद उँगलियों को होम रो पर लौटाएँ। जब आपकी शुद्धता स्थिर हो जाती है तब गति अपने आप बढ़ने लगती है, इसलिए पहले साफ़ टाइपिंग पर ध्यान दें।",
  },
];
