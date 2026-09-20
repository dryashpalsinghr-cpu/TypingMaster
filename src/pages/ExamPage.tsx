import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Copy, GraduationCap, Play, Plus, Save, Timer, Trash2 } from "lucide-react";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import { useProfileContext } from "../contexts/ProfileContext";
import { unicodeToKrutiDev, untypableChars } from "../converter/krutiDevCore";
import { getKeyboardLayout, getKeyboardRows } from "../keyboards";
import { findKeyForOutput, outputRequiresShift } from "../keyboards/resolveInput";
import { deleteTemplate, getTemplates, computeExamMetrics, saveResult, saveTemplate } from "../services/examService";
import type { ExamCategory, ExamResult, ExamTemplate } from "../types/exam";

type Phase = "setup" | "running" | "result";
const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

export function ExamPage() {
  const { activeProfile } = useProfileContext();
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [typed, setTyped] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [focusLoss, setFocusLoss] = useState(0);
  const [keyDepressions, setKeyDepressions] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [editor, setEditor] = useState<ExamTemplate | null>(null);
  const timerRef = useRef<number | null>(null);
  const typedRef = useRef("");
  const focusLossRef = useRef(0);
  const keyDepressionsRef = useRef(0);
  const remainingRef = useRef(0);
  const lastFocusLossAtRef = useRef(0);
  const finishingRef = useRef(false);

  const load = useCallback(async () => {
    const rows = await getTemplates();
    setTemplates(rows);
    setSelectedId((prev) => (rows.some((t) => t.id === prev) ? prev : (rows[0]?.id ?? null)));
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => templates.find((t) => t.id === selectedId) ?? null, [templates, selectedId]);
  const isKruti = selected?.language === "hi";
  const targetText = useMemo(() => !selected ? "" : isKruti ? unicodeToKrutiDev(selected.passage) : selected.passage, [selected, isKruti]);
  const unsupported = useMemo(() => isKruti ? untypableChars(targetText) : [], [isKruti, targetText]);
  const layoutId = isKruti ? "kruti-dev-010" as const : "en-qwerty" as const;
  const layout = getKeyboardLayout(layoutId);
  const nextExpected = phase === "running" ? targetText[typed.length] ?? null : null;
  const activeKey = nextExpected ? findKeyForOutput(layout, nextExpected) : null;
  const shiftRequired = nextExpected ? outputRequiresShift(layout, nextExpected) : false;

  useEffect(() => {
    if (phase !== "running") return;
    const addLoss = () => {
      const now = Date.now();
      if (now - lastFocusLossAtRef.current < 500) return;
      lastFocusLossAtRef.current = now;
      focusLossRef.current += 1;
      setFocusLoss(focusLossRef.current);
    };
    const onVisibility = () => { if (document.hidden) addLoss(); };
    window.addEventListener("blur", addLoss);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.removeEventListener("blur", addLoss); document.removeEventListener("visibilitychange", onVisibility); };
  }, [phase]);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (!selected || !activeProfile?.id) { finishingRef.current = false; setPhase("setup"); return; }
    const finalTyped = typedRef.current;
    const target = selected.language === "hi" ? unicodeToKrutiDev(selected.passage) : selected.passage;
    let correct = 0;
    for (let i = 0; i < finalTyped.length; i++) if (finalTyped[i] === target[i]) correct++;
    const errors = finalTyped.length - correct;
    const durationSeconds = Math.max(1, selected.durationSeconds - remainingRef.current);
    const metrics = computeExamMetrics({ typedChars: finalTyped.length, correctChars: correct, errors, keyDepressions: keyDepressionsRef.current, durationSeconds, minAccuracy: selected.minAccuracy, targetWpm: selected.targetWpm, targetKdph: selected.targetKdph });
    const row: ExamResult = {
      profileId: activeProfile.id, templateId: selected.id ?? 0, templateName: selected.name,
      category: selected.category, language: selected.language, takenAt: Date.now(),
      durationSeconds, typedChars: finalTyped.length, correctChars: correct,
      errors, keyDepressions: keyDepressionsRef.current, grossWpm: metrics.grossWpm,
      netWpm: metrics.netWpm, accuracy: metrics.accuracy, kdph: metrics.kdph,
      focusLossCount: focusLossRef.current,
      passed: metrics.passed && (selected.focusLossLimit <= 0 || focusLossRef.current <= selected.focusLossLimit),
    };
    void saveResult(row).then((id) => { setResult({ ...row, id }); setPhase("result"); });
  }, [selected, activeProfile]);

  const start = () => {
    if (!selected || unsupported.length) return;
    typedRef.current = ""; focusLossRef.current = 0; keyDepressionsRef.current = 0;
    remainingRef.current = selected.durationSeconds; lastFocusLossAtRef.current = 0; finishingRef.current = false;
    setTyped(""); setFocusLoss(0); setKeyDepressions(0); setResult(null);
    setRemaining(selected.durationSeconds); setPhase("running");
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setRemaining((r) => {
      const next = Math.max(0, r - 1);
      remainingRef.current = next;
      if (next === 0) window.setTimeout(finish, 0);
      return next;
    }), 1000);
  };
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  const changeTyped = (value: string) => {
    if (selected && !selected.allowBackspace && value.length < typedRef.current.length) return;
    typedRef.current = value;
    setTyped(value);
  };
  const blank = (): ExamTemplate => {
    const hindi = activeProfile?.preferredTypingLanguage === "hi";
    return { category: "custom", name: hindi ? "Kruti Dev Custom Test" : "English Custom Test", description: "Custom typing practice test.", language: hindi ? "hi" : "en", durationSeconds: 600, passage: hindi ? "भारत एक महान देश है। नियमित अभ्यास से गति और शुद्धता बढ़ती है।" : "Regular practice improves typing speed and accuracy.", targetWpm: 30, targetKdph: 9000, minAccuracy: 90, allowBackspace: true, focusLossLimit: 3, isBuiltIn: false, updatedAt: Date.now() };
  };
  const duplicate = (t: ExamTemplate) => setEditor({ ...t, id: undefined, name: `${t.name} (Copy)`, category: "custom", isBuiltIn: false });
  const saveEditor = async () => { if (!editor) return; await saveTemplate(editor); setEditor(null); await load(); };
  const removeTemplate = async (id: number) => { await deleteTemplate(id); await load(); setSelectedId(null); };

  if (phase === "running" && selected) {
    const overLimit = selected.focusLossLimit > 0 && focusLoss > selected.focusLossLimit;
    return <div className="space-y-4 p-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Timer size={20} /><span className="text-2xl font-bold tabular-nums">{fmt(remaining)}</span></div><div className="text-sm text-slate-500">{isKruti ? "Kruti Dev 010" : "English QWERTY"} · Keys: {keyDepressions} · Focus losses: {focusLoss}</div><button onClick={finish} className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white">Submit</button></div>
      {focusLoss > 0 && <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${overLimit ? "border-red-400 bg-red-50 text-red-700" : "border-amber-300 bg-amber-50 text-amber-800"}`}><AlertTriangle size={16} />You left the test window {focusLoss} time(s). Allowed: {selected.focusLossLimit}.</div>}
      {isKruti && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"><div className="mb-2 text-xs text-slate-500 font-devanagari">देवनागरी स्रोत: {selected.passage}</div><div className="font-krutidev text-xl leading-relaxed">{targetText}</div></div>}
      {!isKruti && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-lg leading-relaxed dark:border-slate-800 dark:bg-slate-900">{targetText}</div>}
      <textarea autoFocus value={typed} onChange={(e) => changeTyped(e.target.value)} onKeyDown={(e) => { if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") { keyDepressionsRef.current += 1; setKeyDepressions(keyDepressionsRef.current); } }} onPaste={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} rows={6} className={`${isKruti ? "font-krutidev" : "font-mono"} w-full rounded-xl border border-slate-300 p-4 text-xl dark:border-slate-700 dark:bg-slate-800`} placeholder={isKruti ? "Kruti Dev 010 में टाइप करें..." : "Start typing..."} />
      <VirtualKeyboard rows={getKeyboardRows(layoutId)} activeCode={activeKey?.code ?? null} pressedCode={null} pressedCorrect={null} shiftActive={false} shiftRequired={shiftRequired} showFingerColors devanagari={isKruti} krutiDev={isKruti} />
      <div className="text-xs text-slate-400">Backspace {selected.allowBackspace ? "allowed" : "disabled"} · Target: {selected.targetWpm} WPM / {selected.targetKdph} KDPH / {selected.minAccuracy}% accuracy</div>
    </div>;
  }

  if (phase === "result" && result) return <div className="space-y-6 p-6">
    <h1 className="text-xl font-bold">Exam Result</h1>
    <div className={`rounded-xl border p-4 ${result.passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}><span className="text-lg font-semibold">{result.passed ? "Passed" : "Not passed"}</span> — {result.templateName}</div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Net WPM",result.netWpm],["Gross WPM",result.grossWpm],["Accuracy",`${result.accuracy}%`],["KDPH",result.kdph],["Errors",result.errors],["Focus losses",result.focusLossCount]].map(([label,value]) => <div key={label} className="rounded-lg border border-slate-200 p-3"><div className="text-xs text-slate-500">{label}</div><div className="text-lg font-semibold">{value}</div></div>)}</div>
    <button onClick={() => setPhase("setup")} className="rounded-md border border-slate-300 px-4 py-2 text-sm">Back to tests</button>
  </div>;

  return <div className="space-y-6 p-6">
    <div className="flex items-center gap-2"><GraduationCap size={22} /><h1 className="text-xl font-bold">English + Kruti Dev 010 Exam Mode</h1></div>
    <p className="text-sm text-slate-500">English tests use QWERTY. Hindi tests use Kruti Dev 010 key-codes and font.</p>
    <div className="grid gap-3 md:grid-cols-2">{templates.map((t) => <div key={t.id} onClick={() => setSelectedId(t.id ?? null)} className={`cursor-pointer rounded-xl border p-4 ${selectedId === t.id ? "border-brand-500 ring-1 ring-brand-500" : "border-slate-200"}`}><div className="flex items-center justify-between"><span className="font-semibold">{t.name}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{t.language === "hi" ? "KRUTI DEV 010" : "ENGLISH"}</span></div><p className="mt-1 text-sm text-slate-500">{t.description}</p><div className="mt-2 text-xs text-slate-400">{Math.round(t.durationSeconds / 60)} min · {t.targetWpm} WPM · {t.targetKdph} KDPH</div><div className="mt-3 flex gap-2"><button onClick={(e) => { e.stopPropagation(); duplicate(t); }} className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs"><Copy size={14}/>Duplicate</button>{!t.isBuiltIn && <><button onClick={(e) => { e.stopPropagation(); setEditor(t); }} className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs"><Save size={14}/>Edit</button><button onClick={(e) => { e.stopPropagation(); if(t.id) void removeTemplate(t.id); }} className="flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"><Trash2 size={14}/>Delete</button></>}</div></div>)}</div>
    {selected && unsupported.length > 0 && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 font-devanagari">इस Kruti passage में Alt-code वाले अक्षर हैं: {unsupported.join(" ")}। इन्हें हटाकर सामान्य keyboard वाला passage रखें।</div>}
    <div className="flex gap-2"><button disabled={!selected || unsupported.length > 0} onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"><Play size={16}/>Start selected test</button><button onClick={() => setEditor(blank())} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm"><Plus size={16}/>New custom test</button></div>
    {editor && <div className="rounded-xl border bg-white p-5 dark:bg-slate-900"><h2 className="font-semibold">Edit template</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Name"><input value={editor.name} onChange={(e)=>setEditor({...editor,name:e.target.value})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"/></Field><Field label="Category"><select value={editor.category} onChange={(e)=>setEditor({...editor,category:e.target.value as ExamCategory})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"><option value="ssc">SSC</option><option value="rrb">RRB</option><option value="cpct">CPCT</option><option value="custom">Custom</option></select></Field><Field label="Mode"><select value={editor.language} onChange={(e)=>setEditor({...editor,language:e.target.value as "en"|"hi"})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"><option value="en">English QWERTY</option><option value="hi">Kruti Dev 010 Hindi</option></select></Field><Field label="Duration seconds"><input type="number" value={editor.durationSeconds} onChange={(e)=>setEditor({...editor,durationSeconds:Number(e.target.value)})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"/></Field><Field label="Target WPM"><input type="number" value={editor.targetWpm} onChange={(e)=>setEditor({...editor,targetWpm:Number(e.target.value)})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"/></Field><Field label="Target KDPH"><input type="number" value={editor.targetKdph} onChange={(e)=>setEditor({...editor,targetKdph:Number(e.target.value)})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"/></Field><Field label="Min accuracy %"><input type="number" value={editor.minAccuracy} onChange={(e)=>setEditor({...editor,minAccuracy:Number(e.target.value)})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"/></Field><Field label="Focus-loss limit"><input type="number" value={editor.focusLossLimit} onChange={(e)=>setEditor({...editor,focusLossLimit:Number(e.target.value)})} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"/></Field></div><label className="mt-3 block text-sm">Passage<textarea value={editor.passage} onChange={(e)=>setEditor({...editor,passage:e.target.value})} rows={4} className="mt-1 w-full rounded-md border p-2 font-devanagari dark:bg-slate-800"/></label><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={editor.allowBackspace} onChange={(e)=>setEditor({...editor,allowBackspace:e.target.checked})}/>Allow backspace</label><div className="mt-4 flex gap-2"><button onClick={()=>void saveEditor()} className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white">Save template</button><button onClick={()=>setEditor(null)} className="rounded-md border px-4 py-2 text-sm">Cancel</button></div></div>}
  </div>;
}

function Field({label,children}:{label:string;children:ReactNode}) { return <label className="text-sm">{label}{children}</label>; }
