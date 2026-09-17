export type LangKey = "en" | "hi";

export const strings = {
  // Navigation
  nav_dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  nav_learn: { en: "Learn", hi: "सीखें" },
  nav_practice: { en: "Practice", hi: "अभ्यास" },
  nav_test: { en: "Typing Test", hi: "टाइपिंग टेस्ट" },
  nav_exam: { en: "Exam Mode", hi: "परीक्षा मोड" },
  nav_review: { en: "Personalized Review", hi: "व्यक्तिगत समीक्षा" },
  nav_games: { en: "Games", hi: "गेम्स" },
  nav_statistics: { en: "Statistics", hi: "आँकड़े" },
  nav_certificates: { en: "Certificates", hi: "प्रमाणपत्र" },
  nav_profiles: { en: "Profiles", hi: "प्रोफ़ाइल" },
  nav_settings: { en: "Settings", hi: "सेटिंग्स" },
  nav_keyboard_chart: { en: "Keyboard Chart", hi: "कीबोर्ड चार्ट" },

  // Header
  header_typing_language: { en: "Typing language", hi: "टाइपिंग भाषा" },
  header_layout: { en: "Layout", hi: "लेआउट" },
  header_interface_language: { en: "Interface", hi: "इंटरफ़ेस" },

  // Dashboard
  dash_welcome: { en: "Welcome back", hi: "वापसी पर स्वागत है" },
  dash_daily_goal: { en: "Daily goal", hi: "दैनिक लक्ष्य" },
  dash_minutes: { en: "minutes", hi: "मिनट" },
  dash_streak: { en: "Streak", hi: "लगातार दिन" },
  dash_days: { en: "day(s)", hi: "दिन" },
  dash_continue: { en: "Continue", hi: "जारी रखें" },
  dash_avg_wpm: { en: "Avg WPM", hi: "औसत WPM" },
  dash_avg_accuracy: { en: "Avg Accuracy", hi: "औसत सटीकता" },
  dash_best_wpm: { en: "Best WPM", hi: "सर्वश्रेष्ठ WPM" },
  dash_lessons_done: { en: "Lessons Done", hi: "पूर्ण पाठ" },
  dash_practiced_today: { en: "Practiced Today", hi: "आज अभ्यास" },
  dash_weekly_speed: { en: "Weekly Speed", hi: "साप्ताहिक गति" },
  dash_weekly_accuracy: { en: "Weekly Accuracy", hi: "साप्ताहिक सटीकता" },
  dash_weakest_keys: { en: "Weakest Keys", hi: "कमज़ोर कुंजियाँ" },
  dash_english_progress: { en: "English Progress", hi: "अंग्रेज़ी प्रगति" },
  dash_hindi_progress: { en: "Hindi Progress", hi: "हिन्दी प्रगति" },
  dash_start_lesson: { en: "Start Lesson", hi: "पाठ शुरू करें" },
  dash_one_min_test: { en: "1-Min Test", hi: "1-मिनट टेस्ट" },
  dash_exam_test: { en: "Exam Test", hi: "परीक्षा टेस्ट" },
  dash_weak_keys: { en: "Weak Keys", hi: "कमज़ोर कुंजियाँ" },
  dash_keyboard_chart: { en: "Keyboard Chart", hi: "कीबोर्ड चार्ट" },

  // Learn
  learn_title: { en: "Learn", hi: "सीखें" },
  learn_subtitle_en: {
    en: "Structured lessons for English touch typing.",
    hi: "अंग्रेज़ी टच टाइपिंग के लिए संरचित पाठ।",
  },
  learn_subtitle_hi: {
    en: "Structured lessons for Hindi InScript touch typing.",
    hi: "हिन्दी इनस्क्रिप्ट टच टाइपिंग के लिए संरचित पाठ।",
  },

  // Lesson practice
  practice_restart: { en: "Restart", hi: "फिर से शुरू करें" },
  practice_gross_wpm: { en: "Gross WPM", hi: "सकल WPM" },
  practice_net_wpm: { en: "Net WPM", hi: "निवल WPM" },
  practice_accuracy: { en: "Accuracy", hi: "सटीकता" },
  practice_errors: { en: "Errors", hi: "त्रुटियाँ" },
  practice_progress: { en: "Progress", hi: "प्रगति" },
  practice_exercise: { en: "Exercise", hi: "अभ्यास" },
  practice_of: { en: "of", hi: "में से" },
  practice_next_exercise: { en: "Next Exercise", hi: "अगला अभ्यास" },
  practice_lesson_passed: { en: "Lesson passed! Great job.", hi: "पाठ पास हो गया! बहुत बढ़िया।" },
  practice_lesson_retry: {
    en: "Lesson complete. Try again to hit the pass targets.",
    hi: "पाठ पूरा हुआ। लक्ष्य तक पहुँचने के लिए फिर से प्रयास करें।",
  },
  practice_back_to_learn: { en: "Back to Learn", hi: "सीखें पर वापस जाएँ" },
  practice_input_mode: { en: "Input mode", hi: "इनपुट मोड" },
  practice_windows_setup: { en: "Windows Hindi setup", hi: "विंडोज़ हिन्दी सेटअप" },

  // Settings
  settings_title: { en: "Settings", hi: "सेटिंग्स" },
  settings_typing_section: { en: "Typing", hi: "टाइपिंग" },
  settings_course_section: { en: "Course", hi: "पाठ्यक्रम" },
  settings_hindi_section: { en: "Hindi", hi: "हिन्दी" },
  settings_desktop_section: { en: "Desktop (Tauri)", hi: "डेस्कटॉप (Tauri)" },
  settings_data_section: { en: "Data", hi: "डेटा" },
  settings_show_keyboard: { en: "Show virtual keyboard", hi: "वर्चुअल कीबोर्ड दिखाएँ" },
  settings_show_hands: { en: "Show hand guide", hi: "हाथ गाइड दिखाएँ" },
  settings_show_finger_colors: { en: "Show finger colors", hi: "उंगली के रंग दिखाएँ" },
  settings_strict_mode: { en: "Strict mode (fix errors before moving on)", hi: "सख्त मोड (आगे बढ़ने से पहले त्रुटि सुधारें)" },
  settings_backspace: { en: "Allow backspace", hi: "बैकस्पेस की अनुमति दें" },
  settings_pause_focus: { en: "Pause on focus loss", hi: "फोकस खोने पर रोकें" },
  settings_physical_hints: {
    en: "Show physical English key hints on Hindi keys",
    hi: "हिन्दी कुंजियों पर भौतिक अंग्रेज़ी कुंजी संकेत दिखाएँ",
  },
  settings_normalization: { en: "Unicode normalization", hi: "यूनिकोड सामान्यीकरण" },

  // Errors (generic, expandable in later phases)
  error_indexeddb_unavailable: {
    en: "Local storage is unavailable in this browser. Your progress cannot be saved right now.",
    hi: "इस ब्राउज़र में लोकल स्टोरेज उपलब्ध नहीं है। आपकी प्रगति अभी सहेजी नहीं जा सकती।",
  },
  error_font_missing: {
    en: "The Kruti Dev 010 font has not been installed by the administrator yet.",
    hi: "प्रशासक द्वारा अभी तक Kruti Dev 010 फ़ॉन्ट इंस्टॉल नहीं किया गया है।",
  },
} as const;

export type StringKey = keyof typeof strings;
