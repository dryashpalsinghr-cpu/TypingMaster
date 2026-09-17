import { Moon, Sun, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../contexts/ThemeContext";
import { useProfileContext } from "../contexts/ProfileContext";

export function AppHeader() {
  const { theme, toggleTheme, interfaceLanguage, setInterfaceLanguage } = useThemeContext();
  const { activeProfile } = useProfileContext();
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
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
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {activeProfile?.preferredTypingLanguage === "hi" ? "हिन्दी" : "English"} ·{" "}
          {activeProfile?.preferredLayout ?? "en-qwerty"}
        </span>
      </div>
      <div className="flex items-center gap-2">
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
