import { Moon, Sun, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../contexts/ThemeContext";
import { useProfileContext } from "../contexts/ProfileContext";
import { useT } from "../hooks/useTranslation";
import { updateProfile } from "../services/profileService";
import type { KeyboardLayoutId, TypingLanguage } from "../types";
import { getKeyboardLayout } from "../keyboards";

export function AppHeader() {
  const { theme, toggleTheme, interfaceLanguage, setInterfaceLanguage } = useThemeContext();
  const { activeProfile, setActiveProfile } = useProfileContext();
  const t = useT();
  const navigate = useNavigate();

  const changeTypingLanguage = async (language: TypingLanguage) => {
    if (!activeProfile?.id) return;
    const layout: KeyboardLayoutId = language === "hi" ? "unicode-inscript" : "en-qwerty";
    await updateProfile(activeProfile.id, { preferredTypingLanguage: language, preferredLayout: layout });
    setActiveProfile({ ...activeProfile, preferredTypingLanguage: language, preferredLayout: layout });
  };

  const changeLayout = async (layout: KeyboardLayoutId) => {
    if (!activeProfile?.id) return;
    await updateProfile(activeProfile.id, { preferredLayout: layout });
    setActiveProfile({ ...activeProfile, preferredLayout: layout });
  };

  const currentLayout = activeProfile ? getKeyboardLayout(activeProfile.preferredLayout) : null;

  return (
    <header className="flex h-16 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        {activeProfile && (
          <div
            className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: activeProfile.avatarColor }}
          >
            {activeProfile.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium">{activeProfile?.displayName ?? "Guest"}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-devanagari">
          {currentLayout ? (interfaceLanguage === "hi" ? currentLayout.labelHi : currentLayout.label) : "-"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          {t("header_typing_language")}
          <select
            value={activeProfile?.preferredTypingLanguage ?? "en"}
            onChange={(e) => void changeTypingLanguage(e.target.value as TypingLanguage)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>

        {activeProfile?.preferredTypingLanguage === "hi" && (
          <label className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            {t("header_layout")}
            <select
              value={activeProfile.preferredLayout}
              onChange={(e) => void changeLayout(e.target.value as KeyboardLayoutId)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-devanagari dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="unicode-inscript">यूनिकोड - इनस्क्रिप्ट</option>
              <option value="kruti-dev-010" disabled>
                Kruti Dev 010 (Phase 4)
              </option>
              <option value="remington-gail" disabled>
                Remington GAIL (Phase 4)
              </option>
            </select>
          </label>
        )}

        <select
          value={interfaceLanguage}
          onChange={(e) => setInterfaceLanguage(e.target.value as "en" | "hi")}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
}
