import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GraduationCap, Play, AlertTriangle, Plus, Save, Copy, Trash2, Timer } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { getTemplates, saveTemplate, deleteTemplate, computeExamMetrics, saveResult } from "../services/examService";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { getKeyboardLayout } from "../keyboards";
import { resolveKeyOutput } from "../keyboards/resolveInput";
import { unicodeToKrutiDev } from "../converter/krutiDevCore";
import { PracticeText } from "../components/PracticeText";
import type { ExamTemplate, ExamResult, ExamCategory } from "../types/exam";
import type { KeyboardLayoutId } from "../types";

type Phase = "setup" | "running" | "result";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// Hindi exams are Kruti Dev 010 only (see app-wide layout lock). English
// exams use standard QWERTY. Both go through the same physical-key ->
// active-layout resolver used by lessons, so exam typing works the same
// whether or not the OS keyboard layout is actually switched.
function layoutIdForTemplate(language: "en" | "hi"): KeyboardLayoutId {
  return language === "hi" ? "kruti-dev-010" : "en-qwerty";
}

export function ExamPage() {
  const { activeProfile } = useProfileContext();
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [remaining, setRemaining] = useState(0);
  const [focusLoss, setFocusLoss] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [editor, setEditor] = useState<ExamTemplate | null>(null);
  const timerRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    const t = await getTemplates();
    setTemplates(t);
    setSelectedId((prev) => prev ?? (t[0]?.id ?? null));
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => templates.find((t) => t.id === selectedId) ?? null, [templates, selectedId]);

  // Kruti Dev 010 is a keystroke-encoded font layout: what you TYPE is plain
  // ASCII, which the Kruti Dev font then DRAWS as Devanagari. So the engine's
  // target text must be the Kruti-encoded form of the passage, not the
  // readable Unicode Hindi stored on the template - exactly like the Kruti
  // Dev lesson content does. English passages need no conversion.
  const examLayoutId = selected ? layoutIdForTemplate(selected.language) : "en-qwerty";
  const layout = useMemo(() => getKeyboardLayout(examLayoutId), [examLayoutId]);
  const engineTargetText = useMemo(() => {
    if (!selected) return "";
    return selected.language === "hi" ? unicodeToKrutiDev(selected.passage) : selected.passage;
  }, [selected]);

  const { snapshot, typeCharacter, backspace, restart, metrics } = useTypingEngine(engineTargetText, {
    strictMode: false,
    backspaceAllowed: selected?.allowBackspace ?? true,
  });

  useEffect(() => {
    if (phase !== "running") return;
    const onBlur = () => setFocusLoss((n) => n + 1);
    const onVis = () => { if (document.hidden) setFocusLoss((n) => n + 1); };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => { window.removeEventListener("blur", onBlur); document.removeEventListener("visibilitychange", onVis); };
  }, [phase]);

  const finishRef = useRef<() => void>(() => {});
  finishRef.current = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (!selected || !activeProfile?.id) { setPhase("setup"); return; }
    const typedChars = snapshot.totalKeystrokes;
    const correctChars = snapshot.totalKeystrokes - snapshot.uncorrectedErrors;
    const errors = snapshot.uncorrectedErrors;
    const computed = computeExamMetrics({
      typedChars,
      correctChars,
      errors,
      keyDepressions: snapshot.totalKeystrokes,
      durationSeconds: selected.durationSeconds,
      minAccuracy: selected.minAccuracy,
      targetWpm: selected.targetWpm,
    });
    const res: ExamResult = {
      profileId: activeProfile.id, templateId: selected.id ?? 0, templateName: selected.name, category: selected.category, language: selected.language,
      takenAt: Date.now(), durationSeconds: selected.durationSeconds, typedChars, correctChars, errors, keyDepressions: snapshot.totalKeystrokes,
      grossWpm: computed.grossWpm, netWpm: computed.netWpm, accuracy: computed.accuracy, kdph: computed.kdph, focusLossCount: focusLoss, passed: computed.passed,
    };
    void saveResult(res).then((id) => { setResult({ ...res, id }); setPhase("result"); });
  };
  const finish = useCallback(() => finishRef.current(), []);

  const start = () => {
    if (!selected) return;
    restart();
    setFocusLoss(0);
    setResult(null);
    setRemaining(selected.durationSeconds);
    setPhase("running");
    timerRef.current = window.setInterval(() => {
      setRemaining((r) => { if (r <= 1) { finish(); return 0; } return r - 1; });
    }, 1000);
  };
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  // Auto-submit once every character of the passage has been typed, same as
  // a lesson round completing.
  useEffect(() => {
    if (phase === "running" && snapshot.completed) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.completed, phase]);

  // Physical-key -> active-layout resolution (identical mechanism to Lesson
  // Practice), so Kruti Dev exams work purely from key position, with no
  // dependency on an OS-level Kruti Dev keyboard layout being installed.
  useEffect(() => {
    if (phase !== "running") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (snapshot.completed) return;
      if (e.key === "Shift") return;
      if (e.key === "Backspace") { e.preventDefault(); backspace(); return; }
      const resolved = resolveKeyOutput(layout, e.code, e.shiftKey);
      if (resolved === null) return;
      e.preventDefault();
      typeCharacter(resolved);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, layout, snapshot.completed, backspace, typeCharacter]);

  const blank = (): ExamTemplate => ({ category: "custom", name: "My Custom Test", description: "Custom practice test.", language: activeProfile?.preferredTypingLanguage ?? "en", durationSeconds: 600, passage: "Type your own practice passage here.", targetWpm: 30, targetKdph: 9000, minAccuracy: 90, allowBackspace: true, focusLossLimit: 3, isBuiltIn: false, updatedAt: Date.now() });
  const duplicate = (t: ExamTemplate) => setEditor({ ...t, id: undefined, name: t.name + " (Copy)", category: "custom", isBuiltIn: false });
  const saveEditor = async () => { if (!editor) return; await saveTemplate(editor); setEditor(null); await load(); };
  const removeTemplate = async (id: number) => { await deleteTemplate(id); await load(); setSelectedId(null); };

  if (phase === "running" && selected) {
    const overLimit = selected.focusLossLimit > 0 && focusLoss > selected.focusLossLimit;
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Timer size={20} /><span className="text-2xl font-bold tabular-nums">{fmt(remaining)}</span></div>
          <div className="text-sm text-slate-500">Keys: {snapshot.totalKeystrokes} · Focus losses: {focusLoss}</div>
          <button onClick={finish} className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white">Submit</button>
        </div>
        {focusLoss > 0 && (<div className={"flex items-center gap-2 rounded-lg border p-3 text-sm " + (overLimit ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" : "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300")}><AlertTriangle size={16} />You left the test window {focusLoss} time(s). {selected.focusLossLimit > 0 ? "Allowed: " + selected.focusLossLimit + "." : ""} In a real exam this is usually flagged.</div>)}
        <PracticeText
          characters={snapshot.characters}
          cursor={snapshot.cursor}
          devanagari={selected.language === "hi"}
          krutiDev={selected.language === "hi"}
          unicodePreview={selected.language === "hi" ? selected.passage : undefined}
        />
        <p className="text-xs text-slate-400">Just start typing - no need to click into a box first.</p>
        <div className="text-xs text-slate-400">Backspace {selected.allowBackspace ? "allowed" : "disabled"} · Target: {selected.targetWpm} WPM / {selected.targetKdph} KDPH / {selected.minAccuracy}% accuracy · So far: {metrics.grossWpm} WPM / {metrics.accuracy}%</div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-xl font-bold">Exam Result</h1>
        <div className={"rounded-xl border p-4 " + (result.passed ? "border-green-400 bg-green-50 dark:bg-green-900/20" : "border-red-400 bg-red-50 dark:bg-red-900/20")}><span className="text-lg font-semibold">{result.passed ? "Passed" : "Not passed"}</span> - {result.templateName}</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Net WPM</div><div className="text-lg font-semibold">{result.netWpm}</div></div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Gross WPM</div><div className="text-lg font-semibold">{result.grossWpm}</div></div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Accuracy</div><div className="text-lg font-semibold">{result.accuracy}%</div></div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">KDPH</div><div className="text-lg font-semibold">{result.kdph}</div></div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Errors</div><div className="text-lg font-semibold">{result.errors}</div></div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="text-xs text-slate-500">Focus losses</div><div className="text-lg font-semibold">{result.focusLossCount}</div></div>
        </div>
        <p className="text-sm text-slate-500">{result.passed ? "You can generate a certificate for this result on the Certificates page." : "Keep practising - only passed results can be turned into a certificate."}</p>
        <button onClick={() => setPhase("setup")} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Back to tests</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2"><GraduationCap size={22} /><h1 className="text-xl font-bold">Government Exam Mode</h1></div>
      <p className="text-sm text-slate-500 dark:text-slate-400">Editable SSC / RRB / CPCT practice templates with focus-loss detection and KDPH targets. Parameters are starting points - edit them to match the current official notification. Passages are original practice text. Hindi tests are typed in Kruti Dev 010.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((t) => (
          <div key={t.id} className={"rounded-xl border p-4 cursor-pointer " + (selectedId === t.id ? "border-brand-500 ring-1 ring-brand-500" : "border-slate-200 dark:border-slate-800")} onClick={() => setSelectedId(t.id ?? null)} role="button">
            <div className="flex items-center justify-between"><span className="font-semibold">{t.name}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-500 dark:bg-slate-800">{t.category}</span></div>
            <p className="mt-1 text-sm text-slate-500">{t.description}</p>
            <div className="mt-2 text-xs text-slate-400">{Math.round(t.durationSeconds / 60)} min · {t.targetWpm} WPM · {t.targetKdph} KDPH · {t.minAccuracy}%</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={(e) => { e.stopPropagation(); duplicate(t); }} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"><Copy size={14} />Duplicate</button>
              {!t.isBuiltIn && (<><button onClick={(e) => { e.stopPropagation(); setEditor(t); }} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"><Save size={14} />Edit</button><button onClick={(e) => { e.stopPropagation(); if (t.id) void removeTemplate(t.id); }} className="flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 dark:border-red-800"><Trash2 size={14} />Delete</button></>)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button disabled={!selected} onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"><Play size={16} />Start selected test</button>
        <button onClick={() => setEditor(blank())} className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"><Plus size={16} />New custom test</button>
      </div>
      {editor && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">Edit template</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Name<input value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-sm">Category<select value={editor.category} onChange={(e) => setEditor({ ...editor, category: e.target.value as ExamCategory })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"><option value="ssc">SSC</option><option value="rrb">RRB</option><option value="cpct">CPCT</option><option value="custom">Custom</option></select></label>
            <label className="text-sm">Language<select value={editor.language} onChange={(e) => setEditor({ ...editor, language: e.target.value as "en" | "hi" })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"><option value="en">English</option><option value="hi">Hindi (Kruti Dev 010)</option></select></label>
            <label className="text-sm">Duration (seconds)<input type="number" value={editor.durationSeconds} onChange={(e) => setEditor({ ...editor, durationSeconds: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-sm">Target WPM<input type="number" value={editor.targetWpm} onChange={(e) => setEditor({ ...editor, targetWpm: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-sm">Target KDPH<input type="number" value={editor.targetKdph} onChange={(e) => setEditor({ ...editor, targetKdph: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-sm">Min accuracy %<input type="number" value={editor.minAccuracy} onChange={(e) => setEditor({ ...editor, minAccuracy: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" /></label>
            <label className="text-sm">Focus-loss limit<input type="number" value={editor.focusLossLimit} onChange={(e) => setEditor({ ...editor, focusLossLimit: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" /></label>
          </div>
          <label className="mt-3 block text-sm">Passage (plain readable text - Hindi is auto-converted to Kruti Dev keystrokes at exam start)<textarea value={editor.passage} onChange={(e) => setEditor({ ...editor, passage: e.target.value })} rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800 font-devanagari" /></label>
          <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={editor.allowBackspace} onChange={(e) => setEditor({ ...editor, allowBackspace: e.target.checked })} />Allow backspace</label>
          <div className="mt-4 flex gap-2"><button onClick={() => void saveEditor()} className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white">Save template</button><button onClick={() => setEditor(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Cancel</button></div>
        </div>
      )}
    </div>
  );
}
