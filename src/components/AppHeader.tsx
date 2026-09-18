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
    <header className="pp-header flex h-16 flex-wrap items-center justify-between gap-2 px-6">
      <div className="flex items-center gap-3">
        {activeProfile && (<div className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: activeProfile.avatarColor }}>{activeProfile.displayName.slice(0, 1).toUpperCase()}</div>)}
        <span className="text-sm font-semibold text-[#0f2a52] dark:text-slate-100">{activeProfile?.displayName ?? "Guest"}</span>
        <span className="rounded-full bg-[#1677e8]/10 px-2 py-0.5 text-xs font-medium text-[#0a5bc4] dark:bg-brand-900/30 dark:text-brand-300 font-devanagari">{currentLayout ? (interfaceLanguage === "hi" ? currentLayout.labelHi : currentLayout.label) : "-"}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-[#5c7599] dark:text-slate-400">{t("header_typing_language")}
          <select value={activeProfile?.preferredTypingLanguage ?? "en"} onChange={(e) => void changeTypingLanguage(e.target.value as TypingLanguage)} className="rounded-md border border-[#1677e8]/25 bg-white/80 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">
            <option value="en">English</option><option value="hi">हिन्दी</option>
          </select>
        </label>
        {activeProfile?.preferredTypingLanguage === "hi" && (
          <label className="flex items-center gap-1 text-xs text-[#5c7599] dark:text-slate-400">{t("header_layout")}
            <select value={activeProfile.preferredLayout} onChange={(e) => void changeLayout(e.target.value as KeyboardLayoutId)} className="rounded-md border border-[#1677e8]/25 bg-white/80 px-2 py-1 text-sm font-devanagari dark:border-slate-700 dark:bg-slate-800">
              <option value="unicode-inscript">यूनिकोड - इनस्क्रिप्ट</option>
              <option value="kruti-dev-010">Kruti Dev 010 (Legacy)</option>
              <option value="remington-gail">Remington GAIL (Legacy)</option>
            </select>
          </label>
        )}
        <select value={interfaceLanguage} onChange={(e) => setInterfaceLanguage(e.target.value as "en" | "hi")} className="rounded-md border border-[#1677e8]/25 bg-white/80 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="en">English</option><option value="hi">हिन्दी</option>
        </select>
        <button onClick={toggleTheme} className="rounded-md p-2 text-[#0a5bc4] hover:bg-[#1677e8]/10 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Toggle theme">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
        <button onClick={() => navigate("/settings")} className="rounded-md p-2 text-[#0a5bc4] hover:bg-[#1677e8]/10 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Settings"><SettingsIcon size={18} /></button>
      </div>
    </header>
  );
}
