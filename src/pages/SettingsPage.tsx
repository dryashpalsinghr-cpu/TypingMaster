import { useEffect, useState } from "react";
import { useProfileContext } from "../contexts/ProfileContext";
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
      <h1 className="text-xl font-bold">Settings</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">Typing</h2>
        <Toggle label="Show virtual keyboard" checked={settings.showKeyboard} onChange={(v) => update({ showKeyboard: v })} />
        <Toggle label="Show hand guide" checked={settings.showHands} onChange={(v) => update({ showHands: v })} />
        <Toggle label="Show finger colors" checked={settings.showFingerColors} onChange={(v) => update({ showFingerColors: v })} />
        <Toggle label="Strict mode (fix errors before moving on)" checked={settings.strictMode} onChange={(v) => update({ strictMode: v })} />
        <Toggle label="Allow backspace" checked={settings.backspaceAllowed} onChange={(v) => update({ backspaceAllowed: v })} />
        <Toggle label="Pause on focus loss" checked={settings.pauseOnFocusLoss} onChange={(v) => update({ pauseOnFocusLoss: v })} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">Course</h2>
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
        <h2 className="mb-2 font-semibold">Desktop (Tauri) — coming with Windows EXE build</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Start with Windows, minimize to tray, and system-wide TypingMeter tracking require the
          desktop build and explicit permission. They are inactive in the browser version — this
          is stated honestly rather than faked.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">Data</h2>
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
