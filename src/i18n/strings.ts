export const strings = {
  en: {
    nav_dashboard: "Dashboard", nav_learn: "Learn", nav_practice: "Practice", nav_keyboard_chart: "Keyboard Chart", nav_font_setup: "Font Setup", nav_mapping_validator: "Mapping Validator", nav_converter: "Converter", nav_test: "Typing Test", nav_exam: "Exam Mode", nav_review: "Review", nav_games: "Games", nav_statistics: "Statistics", nav_certificates: "Certificates", nav_profiles: "Profiles", nav_settings: "Settings",
    header_typing_language: "Typing:", header_layout: "Layout:",
    learn_title: "Learn to Type", learn_subtitle_en: "Structured English typing lessons.", learn_subtitle_hi: "Structured Hindi typing lessons.",
    learn_legacy_locked_title: "Lessons locked for this legacy layout", learn_legacy_locked_body: "Kruti Dev and Remington GAIL lessons unlock only after their key mappings are verified. No mappings are guessed. Set up the licensed font and verify the layout to enable lessons.",
    settings_subtitle: "Manage your preferences.", settings_legacy_section: "Legacy Hindi (Kruti Dev / Remington)", settings_legacy_desc: "Set up the licensed font, verify key mappings, and use the Beta converter.", settings_desktop_section: "Desktop App", settings_desktop_desc: "Windows packaging is built via the project build scripts and GitHub Actions.", settings_hindi_section: "Hindi Input", settings_physical_hints: "Show physical key hints", settings_normalization: "Unicode normalization",
  },
  hi: {
    nav_dashboard: "डैशबोर्ड", nav_learn: "सीखें", nav_practice: "अभ्यास", nav_keyboard_chart: "कीबोर्ड चार्ट", nav_font_setup: "फ़ॉन्ट सेटअप", nav_mapping_validator: "मैपिंग वैलिडेटर", nav_converter: "कन्वर्टर", nav_test: "टाइपिंग टेस्ट", nav_exam: "परीक्षा मोड", nav_review: "समीक्षा", nav_games: "गेम", nav_statistics: "आंकड़े", nav_certificates: "प्रमाणपत्र", nav_profiles: "प्रोफ़ाइल", nav_settings: "सेटिंग्स",
    header_typing_language: "टाइपिंग:", header_layout: "लेआउट:",
    learn_title: "टाइप करना सीखें", learn_subtitle_en: "संरचित अंग्रेज़ी पाठ।", learn_subtitle_hi: "संरचित हिन्दी पाठ।",
    learn_legacy_locked_title: "इस लीगेसी लेआउट के पाठ लॉक हैं", learn_legacy_locked_body: "कृति देव और रेमिंगटन गेल के पाठ तभी खुलते हैं जब उनकी की मैपिंग सत्यापित हो। कोई मैपिंग अनुमान से नहीं भरी गई।",
    settings_subtitle: "अपनी पसंद प्रबंधित करें।", settings_legacy_section: "लीगेसी हिन्दी (कृति देव / रेमिंगटन)", settings_legacy_desc: "लाइसेंस फ़ॉन्ट सेट करें, मैपिंग सत्यापित करें।", settings_desktop_section: "डेस्कटॉप ऐप", settings_desktop_desc: "विंडोज़ पैकेजिंग बिल्ड स्क्रिप्ट से बनती है।", settings_hindi_section: "हिन्दी इनपुट", settings_physical_hints: "भौतिक की संकेत दिखाएं", settings_normalization: "यूनिकोड नॉर्मलाइज़ेशन",
  },
} as const;
export type StringKey = keyof typeof strings.en;
export type InterfaceLang = keyof typeof strings;
