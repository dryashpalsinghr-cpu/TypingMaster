import { useCallback, useEffect, useRef, useState } from "react";
import { DatabaseBackup, Download, Upload, RefreshCw, AlertTriangle } from "lucide-react";
import { exportAll, importAll, countAll, isBackupFile } from "../services/backupService";
const DB_LABELS: Record<string, string> = {
  "typeguru-pro-db": "Profiles, lessons & progress",
  "typeguru-exam-db": "Exam templates, results & certificates",
  "typeguru-analytics-db": "Typing analytics",
  "typeguru-games-db": "Game high scores",
};
export function BackupPage() {
  const [counts, setCounts] = useState<{ name: string; records: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replace, setReplace] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = useCallback(async () => { try { setCounts(await countAll()); } catch { /* ignore */ } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const doExport = async () => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "typeguru-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setMessage("Backup file downloaded.");
    } catch (e) { setError("Export failed: " + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };
  const onFile = async (file: File) => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const parsed = JSON.parse(await file.text());
      if (!isBackupFile(parsed)) { setError("That file is not a TypeGuru Pro backup."); return; }
      const res = await importAll(parsed, { clear: replace });
      let msg = "Restored " + res.recordCount + " records across " + res.dbCount + " databases. Reload the app to see everything.";
      if (res.skipped.length) msg += " Skipped: " + res.skipped.join(", ") + ".";
      setMessage(msg);
      await refresh();
    } catch (e) { setError("Import failed: " + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2"><DatabaseBackup size={22} /><h1 className="text-xl font-bold">Backup &amp; Restore</h1></div>
      <p className="text-sm text-slate-500 dark:text-slate-400">All your data lives only on this device. Export it to a single JSON file to keep it safe or move it to another device. Nothing is uploaded anywhere.</p>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Current data on this device</h2><button onClick={() => void refresh()} className="flex items-center gap-1 text-sm text-slate-500"><RefreshCw size={16} />Refresh</button></div>
        <ul className="space-y-1 text-sm">
          {counts.length === 0 && <li className="text-slate-400">No local databases found yet.</li>}
          {counts.map((c) => (<li key={c.name} className="flex justify-between"><span>{DB_LABELS[c.name] ?? c.name}</span><span className="text-slate-400">{c.records} records</span></li>))}
        </ul>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Export</h2>
        <p className="mt-1 text-sm text-slate-500">Download a full backup of every profile, result, analytic, and score.</p>
        <button disabled={busy} onClick={() => void doExport()} className="mt-3 flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"><Download size={16} />Download backup</button>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Restore</h2>
        <p className="mt-1 text-sm text-slate-500">Import a backup file. Open the app at least once on this device first, so its storage exists.</p>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />Replace existing data (uncheck to merge)</label>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"><AlertTriangle size={16} />Restoring with “Replace” will overwrite current data. Export first if unsure.</div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
        <button disabled={busy} onClick={() => fileRef.current?.click()} className="mt-3 flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-slate-700"><Upload size={16} />Choose backup file</button>
      </section>
      {message && <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">{message}</div>}
      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{error}</div>}
    </div>
  );
}
