import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw, Trash2 } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { getKeystrokes, clearAnalytics, computeKeyStats, computeFingerStats, getDifficultBigrams, getTrends } from "../services/analyticsService";
import { KEYBOARD_ROWS, FINGER_ORDER } from "../data/fingerMap";
import type { KeystrokeRecord, KeyStat, FingerStat, BigramStat, TrendPoint } from "../types/analytics";
type Metric = "errors" | "speed";
function heatColor(v: number, metric: Metric): string {
  const clamped = Math.max(0, Math.min(1, v));
  return metric === "errors" ? `rgba(239,68,68,${0.12 + clamped * 0.78})` : `rgba(245,158,11,${0.12 + clamped * 0.78})`;
}
export function StatisticsPage() {
  const { activeProfile } = useProfileContext();
  const [records, setRecords] = useState<KeystrokeRecord[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [metric, setMetric] = useState<Metric>("errors");
  const load = useCallback(async () => {
    if (!activeProfile?.id) return;
    setRecords(await getKeystrokes(activeProfile.id));
    setTrends(await getTrends(activeProfile.id));
  }, [activeProfile]);
  useEffect(() => { void load(); }, [load]);
  const keyStats = useMemo(() => computeKeyStats(records), [records]);
  const fingerStats = useMemo<FingerStat[]>(() => computeFingerStats(records), [records]);
  const bigrams = useMemo<BigramStat[]>(() => getDifficultBigrams(records), [records]);
  const keyMap = useMemo(() => { const m = new Map<string, KeyStat>(); for (const k of keyStats) m.set(k.key, k); return m; }, [keyStats]);
  const maxDelta = useMemo(() => Math.max(1, ...keyStats.map((k) => k.avgDeltaMs)), [keyStats]);
  const totalKeys = records.length;
  const totalErrors = records.filter((r) => !r.correct).length;
  const overallAcc = totalKeys ? Math.round(((totalKeys - totalErrors) / totalKeys) * 100) : 0;
  const maxWpm = Math.max(1, ...trends.map((t) => t.netWpm));
  if (totalKeys === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2"><BarChart3 size={22} /><h1 className="text-xl font-bold">Statistics</h1></div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-500">No typing analytics yet. Do a Personalized Review session to start collecting real per-key data - nothing here is simulated.</p>
        </div>
        {trends.length > 0 && <TrendCard trends={trends} maxWpm={maxWpm} />}
      </div>
    );
  }
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-2"><BarChart3 size={22} /><h1 className="text-xl font-bold">Statistics</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => void load()} className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"><RefreshCw size={16} />Refresh</button>
          <button onClick={() => { if (activeProfile?.id) void clearAnalytics(activeProfile.id).then(load); }} className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 dark:border-red-800"><Trash2 size={16} />Clear data</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Keystrokes analysed</div><div className="text-lg font-semibold">{totalKeys}</div></div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Overall accuracy</div><div className="text-lg font-semibold">{overallAcc}%</div></div>
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Distinct keys</div><div className="text-lg font-semibold">{keyStats.length}</div></div>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Keyboard heatmap</h2>
          <div className="flex gap-1 text-xs"><button onClick={() => setMetric("errors")} className={metric === "errors" ? "rounded bg-brand-600 px-2 py-1 text-white" : "rounded border border-slate-300 px-2 py-1 dark:border-slate-700"}>Errors</button><button onClick={() => setMetric("speed")} className={metric === "speed" ? "rounded bg-brand-600 px-2 py-1 text-white" : "rounded border border-slate-300 px-2 py-1 dark:border-slate-700"}>Speed</button></div>
        </div>
        <div className="space-y-1">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1" style={{ paddingLeft: ri * 12 }}>
              {row.map((k) => { const st = keyMap.get(k); const intensity = !st ? 0 : metric === "errors" ? st.errorRate : st.avgDeltaMs / maxDelta; return (<div key={k} title={st ? `${k}: ${st.count} hits, ${Math.round(st.errorRate * 100)}% err, ${st.avgDeltaMs}ms` : `${k}: no data`} className="grid h-9 w-9 place-items-center rounded border border-slate-200 text-sm font-medium uppercase dark:border-slate-700" style={{ backgroundColor: st ? heatColor(intensity, metric) : "transparent" }}>{k}</div>); })}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">Darker = {metric === "errors" ? "more errors" : "slower"}. Blank keys have no data yet.</p>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Finger performance</h2>
        <div className="space-y-2">
          {FINGER_ORDER.map((f) => { const st = fingerStats.find((s) => s.finger === f); const acc = st && st.count ? Math.round((1 - st.errorRate) * 100) : 0; return (<div key={f} className="flex items-center gap-3 text-sm"><span className="w-20 shrink-0 text-slate-500">{f}</span><div className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800"><div className="h-3 rounded bg-brand-500" style={{ width: `${acc}%` }} /></div><span className="w-24 shrink-0 text-right text-xs text-slate-400">{st ? `${acc}% · ${st.avgDeltaMs}ms` : "no data"}</span></div>); })}
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Most difficult bigrams</h2>
        {bigrams.length === 0 ? <p className="text-sm text-slate-500">Not enough data yet.</p> : (
          <div className="flex flex-wrap gap-2">{bigrams.map((b) => (<span key={b.bigram} className="rounded-lg border border-slate-200 px-3 py-1 text-sm dark:border-slate-700"><span className="font-mono font-semibold uppercase">{b.bigram}</span> <span className="text-xs text-slate-400">{Math.round(b.errorRate * 100)}% · {b.avgDeltaMs}ms</span></span>))}</div>
        )}
      </section>
      {trends.length > 0 && <TrendCard trends={trends} maxWpm={maxWpm} />}
    </div>
  );
}
function TrendCard({ trends, maxWpm }: { trends: TrendPoint[]; maxWpm: number }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 font-semibold">Exam WPM trend</h2>
      <div className="flex items-end gap-2" style={{ height: 140 }}>
        {trends.map((t, i) => (<div key={i} className="flex flex-1 flex-col items-center justify-end" title={`${t.label}: ${t.netWpm} WPM, ${t.accuracy}%`}><div className="w-full rounded-t bg-brand-500" style={{ height: `${(t.netWpm / maxWpm) * 110}px` }} /><span className="mt-1 text-[10px] text-slate-400">{t.netWpm}</span></div>))}
      </div>
      <p className="mt-2 text-xs text-slate-400">From your real exam results (Phase 5). Newest on the right.</p>
    </section>
  );
}
