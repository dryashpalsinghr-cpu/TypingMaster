import { useEffect, useMemo, useRef, useState } from "react";
import { Grid3x3, Download, Upload, RotateCcw, Lock, AlertTriangle } from "lucide-react";
import { getMergedLayout, upsertOverride, resetOverrides, getVerificationSummary, exportMappings, importMappings } from "../services/mappingService";
import type { KeyboardLayoutId, KeyDefinition } from "../types";
const PIN_KEY = "tg-mapping-admin-pin";
const LAYOUTS: { id: KeyboardLayoutId; label: string }[] = [
  { id: "kruti-dev-010", label: "Kruti Dev 010" },
  { id: "remington-gail", label: "Remington GAIL" },
];
type Draft = { normalOutput: string; shiftOutput: string; unicodeEquivalent: string; status: "verified" | "unverified" | "unsupported" };
function Stat({ label, value }: { label: string; value: string | number }) {
  return (<div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">{label}</div><div className="text-lg font-semibold">{value}</div></div>);
}
export function MappingValidatorPage() {
  const [layoutId, setLayoutId] = useState<KeyboardLayoutId>("kruti-dev-010");
  const [keys, setKeys] = useState<KeyDefinition[]>([]);
  const [summary, setSummary] = useState({ total: 0, verified: 0, unverified: 0, unsupported: 0, completion: 0 });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const storedPin = typeof localStorage !== "undefined" ? localStorage.getItem(PIN_KEY) : null;
  const load = async (id: KeyboardLayoutId) => {
    const merged = await getMergedLayout(id);
    setKeys(merged.keys);
    setSummary(await getVerificationSummary(id));
    const d: Record<string, Draft> = {};
    for (const k of merged.keys) d[k.code] = { normalOutput: k.legacyOutput?.normal ?? "", shiftOutput: k.legacyOutput?.shift ?? "", unicodeEquivalent: k.unicodeEquivalent ?? "", status: k.mappingStatus ?? "unverified" };
    setDrafts(d);
  };
  useEffect(() => { void load(layoutId); }, [layoutId]);
  const duplicates = useMemo(() => {
    const seen = new Map<string, number>(); const dupes = new Set<string>();
    for (const [code, d] of Object.entries(drafts)) { if (!d.normalOutput) continue; const c = seen.get(d.normalOutput) ?? 0; seen.set(d.normalOutput, c + 1); if (c >= 1) dupes.add(d.normalOutput); void code; }
    return dupes;
  }, [drafts]);
  const missing = useMemo(() => Object.values(drafts).filter((d) => d.status === "verified" && !d.normalOutput).length, [drafts]);
  const setField = (code: string, field: keyof Draft, value: string) => setDrafts((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value as Draft[keyof Draft] } }));
  const save = async (code: string) => { const d = drafts[code]; if (!d) return; await upsertOverride({ layoutId, code, normalOutput: d.normalOutput, shiftOutput: d.shiftOutput, unicodeEquivalent: d.unicodeEquivalent, status: d.status }); await load(layoutId); };
  const doExport = async () => { const data = await exportMappings(layoutId); const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${layoutId}-mappings.json`; a.click(); URL.revokeObjectURL(url); };
  const doImport = async (file: File) => { const text = await file.text(); await importMappings(layoutId, JSON.parse(text)); await load(layoutId); };
  if (!unlocked) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2"><Grid3x3 size={20} /><h1 className="text-xl font-bold">Keyboard Mapping Validator</h1></div>
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Lock size={18} />Admin area</div>
          <p className="mt-2 text-sm text-slate-500">This tool edits legacy key mappings. Built-in mappings are immutable; you only add overrides. {storedPin ? "Enter the admin PIN to continue." : "Set an optional PIN or continue without one."}</p>
          <input value={pinInput} onChange={(e) => setPinInput(e.target.value)} type="password" placeholder="PIN" className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => { if (!storedPin) { if (pinInput) localStorage.setItem(PIN_KEY, pinInput); setUnlocked(true); } else if (pinInput === storedPin) setUnlocked(true); }} className="rounded-md bg-brand-600 px-3 py-2 text-sm text-white">Unlock</button>
            {!storedPin && <button onClick={() => setUnlocked(true)} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Skip</button>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3"><Grid3x3 size={20} /><h1 className="text-xl font-bold">Keyboard Mapping Validator</h1>
        <select value={layoutId} onChange={(e) => setLayoutId(e.target.value as KeyboardLayoutId)} className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">{LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
        <div className="ml-auto flex gap-2">
          <button onClick={() => void doExport()} className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"><Download size={16} />Export</button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"><Upload size={16} />Import</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ""; }} />
          <button onClick={() => void resetOverrides(layoutId).then(() => load(layoutId))} className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 dark:border-red-800"><RotateCcw size={16} />Reset overrides</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5"><Stat label="Total keys" value={summary.total} /><Stat label="Verified" value={summary.verified} /><Stat label="Unverified" value={summary.unverified} /><Stat label="Unsupported" value={summary.unsupported} /><Stat label="Completion" value={`${summary.completion}%`} /></div>
      {(duplicates.size > 0 || missing > 0) && (<div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"><AlertTriangle size={16} />{duplicates.size > 0 && <span>{duplicates.size} duplicate output(s). </span>}{missing > 0 && <span>{missing} key(s) marked verified but empty.</span>}</div>)}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm"><thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="p-2 text-left">Key</th><th className="p-2 text-left">Normal</th><th className="p-2 text-left">Shift</th><th className="p-2 text-left">Unicode</th><th className="p-2 text-left">Status</th><th className="p-2"></th></tr></thead>
          <tbody>{keys.map((k) => { const d = drafts[k.code]; if (!d) return null; const isDupe = d.normalOutput && duplicates.has(d.normalOutput); return (<tr key={k.code} className="border-t border-slate-100 dark:border-slate-800"><td className="p-2 font-mono text-xs">{k.code}<div className="text-slate-400">{k.label}</div></td><td className="p-2"><input value={d.normalOutput} onChange={(e) => setField(k.code, "normalOutput", e.target.value)} className={`w-24 rounded border px-2 py-1 font-devanagari ${isDupe ? "border-amber-400" : "border-slate-300 dark:border-slate-700"} dark:bg-slate-800`} /></td><td className="p-2"><input value={d.shiftOutput} onChange={(e) => setField(k.code, "shiftOutput", e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1 font-devanagari dark:border-slate-700 dark:bg-slate-800" /></td><td className="p-2"><input value={d.unicodeEquivalent} onChange={(e) => setField(k.code, "unicodeEquivalent", e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1 font-devanagari dark:border-slate-700 dark:bg-slate-800" /></td><td className="p-2"><select value={d.status} onChange={(e) => setField(k.code, "status", e.target.value)} className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"><option value="unverified">unverified</option><option value="verified">verified</option><option value="unsupported">unsupported</option></select></td><td className="p-2"><button onClick={() => void save(k.code)} className="rounded-md bg-brand-600 px-2 py-1 text-xs text-white">Save</button></td></tr>); })}</tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">Built-in mappings ship empty and unverified on purpose. Nothing is guessed. Only keys you explicitly verify here become usable for lessons and the converter.</p>
    </div>
  );
}
