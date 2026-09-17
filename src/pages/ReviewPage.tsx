import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Target, Play, RotateCcw } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { getKeystrokes, getWeakKeys, getSlowKeys, getDifficultBigrams, buildDrill, recordKeystrokes, saveReviewSession } from "../services/analyticsService";
import type { KeystrokeRecord } from "../types/analytics";
type Mode = "weak-keys" | "slow-keys" | "bigrams" | "warmup";
const MODE_LABELS: Record<Mode, string> = { "weak-keys": "Weak keys", "slow-keys": "Slow keys", bigrams: "Difficult bigrams", warmup: "Home-row warmup" };
export function ReviewPage() {
  const { activeProfile } = useProfileContext();
  const [records, setRecords] = useState<KeystrokeRecord[]>([]);
  const [mode, setMode] = useState<Mode>("weak-keys");
  const [drill, setDrill] = useState("");
  const [typed, setTyped] = useState("");
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<{ accuracy: number; avgDeltaMs: number; total: number } | null>(null);
  const lastTimeRef = useRef<number>(0);
  const captureRef = useRef<KeystrokeRecord[]>([]);
  const load = useCallback(async () => { if (!activeProfile?.id) return; setRecords(await getKeystrokes(activeProfile.id)); }, [activeProfile]);
  useEffect(() => { void load(); }, [load]);
  const weak = useMemo(() => getWeakKeys(records), [records]);
  const slow = useMemo(() => getSlowKeys(records), [records]);
  const bigrams = useMemo(() => getDifficultBigrams(records), [records]);
  const hasData = records.length > 0;
  const layoutId = activeProfile?.preferredLayout ?? "en-qwerty";
  const makeDrill = (m: Mode): string => {
    if (m === "weak-keys") return buildDrill(weak.map((k) => k.key), []);
    if (m === "slow-keys") return buildDrill(slow.map((k) => k.key), []);
    if (m === "bigrams") return buildDrill([], bigrams.map((b) => b.bigram));
    return buildDrill([], []);
  };
  const start = () => {
    const d = makeDrill(mode);
    setDrill(d); setTyped(""); setSummary(null); setRunning(true);
    captureRef.current = []; lastTimeRef.current = performance.now();
  };
  const onChange = (value: string) => {
    if (!running) return;
    if (value.length > typed.length && value.length <= drill.length) {
      const idx = value.length - 1;
      const now = performance.now();
      const delta = Math.min(4000, Math.round(now - lastTimeRef.current));
      lastTimeRef.current = now;
      const expected = drill[idx] ?? "";
      const got = value[idx] ?? "";
      if (activeProfile?.id) captureRef.current.push({ profileId: activeProfile.id, at: Date.now(), layoutId, expected, typed: got, correct: expected === got, deltaMs: delta });
    }
    setTyped(value);
    if (value.length >= drill.length) void finish();
  };
  const finish = useCallback(async () => {
    setRunning(false);
    const caps = captureRef.current;
    if (!activeProfile?.id || caps.length === 0) { setSummary({ accuracy: 0, avgDeltaMs: 0, total: 0 }); return; }
    await recordKeystrokes(caps);
    const correct = caps.filter((c) => c.correct).length;
    const accuracy = Math.round((correct / caps.length) * 100);
    const avgDeltaMs = Math.round(caps.reduce((s, c) => s + c.deltaMs, 0) / caps.length);
    await saveReviewSession({ profileId: activeProfile.id, at: Date.now(), mode, totalKeys: caps.length, correctKeys: correct, accuracy, avgDeltaMs });
    setSummary({ accuracy, avgDeltaMs, total: caps.length });
    await load();
  }, [activeProfile, mode, load]);
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2"><Target size={22} /><h1 className="text-xl font-bold">Personalized Review</h1></div>
      <p className="text-sm text-slate-500 dark:text-slate-400">Drills are generated from YOUR real typing history. Each review session also records new keystroke data, so your Statistics get more accurate over time. Nothing here is simulated.</p>
      {!hasData && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">No history yet - start with the Home-row warmup to build your first data set.</div>}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MODE_LABELS) as Mode[]).map((m) => { const disabled = (m === "weak-keys" && weak.length === 0) || (m === "slow-keys" && slow.length === 0) || (m === "bigrams" && bigrams.length === 0); return (<button key={m} disabled={disabled && hasData} onClick={() => setMode(m)} className={(mode === m ? "bg-brand-600 text-white " : "border border-slate-300 dark:border-slate-700 ") + "rounded-md px-3 py-2 text-sm disabled:opacity-40"}>{MODE_LABELS[m]}{disabled ? " (no data)" : ""}</button>); })}
      </div>
      {!running && (<button onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm text-white"><Play size={16} />Start {MODE_LABELS[mode]} drill</button>)}
      {(running || drill) && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-lg tracking-wide dark:border-slate-800 dark:bg-slate-900">
            {drill.split("").map((ch, i) => { const t = typed[i]; const cls = t == null ? "text-slate-400" : t === ch ? "text-green-600" : "bg-red-200 text-red-700 dark:bg-red-900/40"; return (<span key={i} className={cls}>{ch}</span>); })}
          </div>
          <textarea autoFocus value={typed} onChange={(e) => onChange(e.target.value)} rows={3} disabled={!running} className="w-full rounded-xl border border-slate-300 p-3 font-mono text-lg dark:border-slate-700 dark:bg-slate-800" placeholder="Type the text above..." />
        </div>
      )}
      {summary && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">Session recorded</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div><div className="text-xs text-slate-500">Keys</div><div className="text-lg font-semibold">{summary.total}</div></div>
            <div><div className="text-xs text-slate-500">Accuracy</div><div className="text-lg font-semibold">{summary.accuracy}%</div></div>
            <div><div className="text-xs text-slate-500">Avg / key</div><div className="text-lg font-semibold">{summary.avgDeltaMs}ms</div></div>
          </div>
          <button onClick={start} className="mt-4 flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"><RotateCcw size={16} />Another drill</button>
        </div>
      )}
    </div>
  );
}
