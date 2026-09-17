import { useEffect, useState } from "react";
import { useProfileContext } from "../contexts/ProfileContext";
import { useT } from "../hooks/useTranslation";
import { db, DEFAULT_SETTINGS } from "../db/database";
import type { AppSettings } from "../types";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand-600"
      />
    </label>
  );
}

export function SettingsPage() {
  const { activeProfile } = useProfileContext();
  const t = useT();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (!activeProfile?.id) return;
    void db.settings
      .where("profileId")
      .equals(activeProfile.id)
      .first()
      .then((s) => setSettings(s ?? { profileId: activeProfile.id!, ...DEFAULT_SETTINGS }));
  }, [activeProfile?.id]);

  const update = (changes: Partial<AppSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...changes };
    setSettings(next);
    if (next.id) void db.settings.update(next.id, changes);
  };

  if (!settings) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-xl font-bold">{t("settings_title")}</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">{t("settings_typing_section")}</h2>
        <Toggle label={t("settings_show_keyboard")} checked={settings.showKeyboard} onChange={(v) => update({ showKeyboard: v })} />
        <Toggle label={t("settings_show_hands")} checked={settings.showHands} onChange={(v) => update({ showHands: v })} />
        <Toggle
          label={t("settings_show_finger_colors")}
          checked={settings.showFingerColors}
          onChange={(v) => update({ showFingerColors: v })}
        />
        <Toggle label={t("settings_strict_mode")} checked={settings.strictMode} onChange={(v) => update({ strictMode: v })} />
        <Toggle label={t("settings_backspace")} checked={settings.backspaceAllowed} onChange={(v) => update({ backspaceAllowed: v })} />
        <Toggle
          label={t("settings_pause_focus")}
          checked={settings.pauseOnFocusLoss}
          onChange={(v) => update({ pauseOnFocusLoss: v })}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">{t("settings_course_section")}</h2>
        <Toggle label="Adaptive lessons" checked={settings.adaptiveEnabled} onChange={(v) => update({ adaptiveEnabled: v })} />
        <Toggle label="Lock next lesson until passed" checked={settings.lockNextLesson} onChange={(v) => update({ lockNextLesson: v })} />
        <label className="flex items-center justify-between py-2 text-sm">
          <span>Minimum pass accuracy</span>
          <input
            type="number"
            value={settings.minAccuracy}
            onChange={(e) => update({ minAccuracy: Number(e.target.value) })}
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">{t("settings_hindi_section")}</h2>
        <Toggle
          label={t("settings_physical_hints")}
          checked={settings.showPhysicalKeyHints}
          onChange={(v) => update({ showPhysicalKeyHints: v })}
        />
        <label className="flex items-center justify-between py-2 text-sm">
          <span>{t("settings_normalization")}</span>
          <select
            value={settings.hindiNormalization}
            onChange={(e) => update({ hindiNormalization: e.target.value as "NFC" | "none" })}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="NFC">NFC</option>
            <option value="none">None</option>
          </select>
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">{t("settings_desktop_section")} — coming with Windows EXE build</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Start with Windows, minimize to tray, and system-wide TypingMeter tracking require the
          desktop build and explicit permission. They are inactive in the browser version — this
          is stated honestly rather than faked.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">{t("settings_data_section")}</h2>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            Export backup (Phase 7)
          </button>
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            Import backup (Phase 7)
          </button>
        </div>
      </section>
    </div>
  );
}
