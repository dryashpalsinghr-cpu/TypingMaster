import { useRef, useState } from "react";
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
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const savePreferences = async (changes: Parameters<typeof updateProfile>[1]) => {
    if (!activeProfile?.id || savingRef.current) return;
    savingRef.current = true; setSaving(true); setError(null);
    try { await updateProfile(activeProfile.id, changes); setActiveProfile({ ...activeProfile, ...changes }); }
    catch { setError("Could not save profile preferences."); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const changeTypingLanguage = async (language: TypingLanguage) => {
    if (!activeProfile?.id) return;
    const layout: KeyboardLayoutId = language === "hi" ? "kruti-dev-010" : "en-qwerty";
    await savePreferences({ preferredTypingLanguage: language, preferredLayout: layout });
  };
  const changeLayout = async (layout: KeyboardLayoutId) => {
    if (!activeProfile?.id) return;
    await savePreferences({ preferredLayout: layout });
  };
  const effectiveLayout: KeyboardLayoutId = activeProfile?.preferredTypingLanguage === "hi" ? "kruti-dev-010" : "en-qwerty";
  const currentLayout = activeProfile ? getKeyboardLayout(effectiveLayout) : null;
  return (
    <header className="pp-header flex h-16 flex-wrap items-center justify-between gap-2 px-6">
      <div className="flex items-center gap-3">
        {activeProfile && (<div className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: activeProfile.avatarColor }}>{activeProfile.displayName.slice(0, 1).toUpperCase()}</div>)}
        <span className="text-sm font-semibold text-[#0f2a52] dark:text-slate-100">{activeProfile?.displayName ?? "Guest"}</span>
        <span className="rounded-full bg-[#1677e8]/10 px-2 py-0.5 text-xs font-medium text-[#0a5bc4] dark:bg-brand-900/30 dark:text-brand-300 font-devanagari">{currentLayout ? (interfaceLanguage === "hi" ? currentLayout.labelHi : currentLayout.label) : "-"}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {error && <span role="alert" className="text-sm text-red-600">{error}</span>}
        <label className="flex items-center gap-1 text-xs text-[#5c7599] dark:text-slate-400">{t("header_typing_language")}
          <select disabled={saving} value={activeProfile?.preferredTypingLanguage ?? "en"} onChange={(e) => void changeTypingLanguage(e.target.value as TypingLanguage)} className="rounded-md border border-[#1677e8]/25 bg-white/80 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">
            <option value="en">English</option><option value="hi">हिन्दी</option>
          </select>
        </label>
        {activeProfile?.preferredTypingLanguage === "hi" && (
          <label className="flex items-center gap-1 text-xs text-[#5c7599] dark:text-slate-400">{t("header_layout")}
            <select disabled={saving} value={effectiveLayout} onChange={(e) => void changeLayout(e.target.value as KeyboardLayoutId)} className="rounded-md border border-[#1677e8]/25 bg-white/80 px-2 py-1 text-sm font-devanagari dark:border-slate-700 dark:bg-slate-800">
              <option value="kruti-dev-010">Kruti Dev 010</option>
            </select>
          </label>
        )}
        <select disabled={saving} aria-label="Interface language" value={interfaceLanguage} onChange={(e) => { const language = e.target.value as "en" | "hi"; setInterfaceLanguage(language); void savePreferences({ preferredInterfaceLanguage: language }); }} className="rounded-md border border-[#1677e8]/25 bg-white/80 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="en">English</option><option value="hi">हिन्दी</option>
        </select>
        <button onClick={toggleTheme} className="rounded-md p-2 text-[#0a5bc4] hover:bg-[#1677e8]/10 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Toggle theme">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
        <button onClick={() => navigate("/settings")} className="rounded-md p-2 text-[#0a5bc4] hover:bg-[#1677e8]/10 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Settings"><SettingsIcon size={18} /></button>
      </div>
    </header>
  );
}
