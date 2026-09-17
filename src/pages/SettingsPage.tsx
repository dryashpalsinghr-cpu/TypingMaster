import { useNavigate } from "react-router-dom";
import { Keyboard, Grid3x3, BookOpen } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { useT } from "../hooks/useTranslation";
export function SettingsPage() {
  const navigate = useNavigate();
  const { activeProfile } = useProfileContext();
  const t = useT();
  const isHindi = activeProfile?.preferredTypingLanguage === "hi";
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">{t("nav_settings")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("settings_subtitle")}</p>
      </div>
      {isHindi && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">{t("settings_legacy_section")}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("settings_legacy_desc")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button onClick={() => navigate("/font-setup")} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Keyboard size={18} />{t("nav_font_setup")}</button>
            <button onClick={() => navigate("/mapping-validator")} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Grid3x3 size={18} />{t("nav_mapping_validator")}</button>
            <button onClick={() => navigate("/converter")} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><BookOpen size={18} />{t("nav_converter")}</button>
          </div>
        </section>
      )}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">{t("settings_desktop_section")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("settings_desktop_desc")}</p>
      </section>
    </div>
  );
}
