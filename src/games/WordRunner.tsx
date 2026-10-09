import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { randomWord } from "../data/gameWords";
import { saveScore, recordKeystrokes } from "../services/gamesService";
import type { GameProps } from "../types/games";
import type { KeystrokeRecord } from "../types/analytics";
import { unicodeToKrutiDev } from "../converter/krutiDevCore";
const DURATION = 60;
export function WordRunner({ profileId, layoutId, onExit }: GameProps) {
  const { activeProfile } = useProfileContext();
  const hindi = activeProfile?.preferredTypingLanguage === "hi";
  const [word, setWord] = useState("");
  const [displayWord, setDisplayWord] = useState("");
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const hitsRef = useRef(0); const triesRef = useRef(0); const lastKeyRef = useRef(0);
  const capsRef = useRef<KeystrokeRecord[]>([]);
  const scoreRef = useRef(0);
  const deadlineRef = useRef(0);
  const playingRef = useRef(false);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextWord = () => {
    const unicode = randomWord(hindi);
    setDisplayWord(unicode);
    setWord(hindi ? unicodeToKrutiDev(unicode) : unicode);
  };
  const start = () => { if (savingRef.current) return; playingRef.current = true; deadlineRef.current = performance.now() + DURATION * 1000; setError(null); setScore(0); scoreRef.current = 0; setRemaining(DURATION); setTyped(""); nextWord(); hitsRef.current = 0; triesRef.current = 0; capsRef.current = []; lastKeyRef.current = performance.now(); setOver(false); setRunning(true); };
  const endGame = useCallback(async () => {
    if (!playingRef.current) return;
    playingRef.current = false; savingRef.current = true; setSaving(true);
    setRunning(false); setOver(true);
    const acc = triesRef.current ? Math.round((hitsRef.current / triesRef.current) * 100) : 0;
    const records = capsRef.current.slice(); const finalScore = scoreRef.current;
    try {
      if (records.length) await recordKeystrokes(records);
      await saveScore({ profileId, game: "word-runner", score: finalScore, accuracy: acc, at: Date.now() });
    } catch { setError("Could not save all game statistics. Check device storage."); }
    finally { savingRef.current = false; setSaving(false); }
  }, [profileId]);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - performance.now()) / 1000));
      setRemaining(left); if (left === 0) void endGame();
    }, 100);
    return () => window.clearInterval(t);
  }, [running, endGame]);
  const onChange = (value: string) => {
    if (!playingRef.current) return;
    if (performance.now() >= deadlineRef.current) { setRemaining(0); void endGame(); return; }
    if (value.length > word.length) return;
    // Accept append and backspace only: replacement/paste cannot bypass captured keys.
    if (value.length > typed.length && (!value.startsWith(typed) || value.length !== typed.length + 1)) return;
    if (value.length <= typed.length && !typed.startsWith(value)) return;
    if (value.length > typed.length) {
      const idx = value.length - 1; const expected = word[idx] ?? ""; const got = value[idx] ?? "";
      const now = performance.now(); const delta = Math.min(4000, Math.round(now - lastKeyRef.current)); lastKeyRef.current = now;
      triesRef.current++; if (expected === got) hitsRef.current++;
      capsRef.current.push({ profileId, at: Date.now(), layoutId, expected, typed: got, correct: expected === got, deltaMs: delta });
    }
    if (value === word) { const pts = word.length; scoreRef.current += pts; setScore(scoreRef.current); setTyped(""); nextWord(); return; }
    if (word.startsWith(value)) setTyped(value); else setTyped(value);
  };
  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Word Runner</h2><div className="flex items-center gap-3 text-sm"><span>Score: <b>{score}</b></span><span className="flex items-center gap-1"><Timer size={16} />{remaining}s</span></div></div>
      <div className="grid min-h-[220px] place-items-center rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {!running && !over && <button onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-white"><Play size={18} />Start</button>}
        {over && <div className="text-center"><p className="text-lg font-bold">Time up</p><p className="mt-1 text-sm text-slate-500">Score {score}</p><div className="mt-4 flex justify-center gap-2"><button onClick={start} disabled={saving} className="flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm text-white"><RotateCcw size={16} />Again</button><button onClick={onExit} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Exit</button></div></div>}
        {running && (<div className="w-full max-w-md text-center">
          {hindi && <div className="mb-2 font-devanagari text-sm text-slate-500">{displayWord}</div>}
          <div className={`${hindi ? "font-krutidev" : "font-mono"} text-4xl font-bold tracking-wide`}>{word.split("").map((ch, i) => { const t = typed[i]; const cls = t == null ? "text-slate-400" : t === ch ? "text-green-600" : "text-red-600"; return <span key={i} className={cls}>{ch}</span>; })}</div>
          <input autoFocus value={typed} onChange={(e) => onChange(e.target.value)} maxLength={word.length} onPaste={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()} className={`mt-4 w-full rounded-md border border-slate-300 p-3 text-center text-xl ${hindi ? "font-krutidev" : "font-mono"} dark:border-slate-700 dark:bg-slate-800`} placeholder="Type the word" />
        </div>)}
      </div>
      <p className="text-xs text-slate-400">Type each word correctly before the 60-second clock runs out. {hindi ? "Hindi words use the Kruti Dev 010 keyboard and font." : ""}</p>
    </div>
  );
}
