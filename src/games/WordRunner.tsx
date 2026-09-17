import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { randomWord } from "../data/gameWords";
import { saveScore, recordKeystrokes } from "../services/gamesService";
import type { GameProps } from "../types/games";
import type { KeystrokeRecord } from "../types/analytics";
const DURATION = 60;
export function WordRunner({ profileId, layoutId, onExit }: GameProps) {
  const { activeProfile } = useProfileContext();
  const hindi = activeProfile?.preferredTypingLanguage === "hi";
  const [word, setWord] = useState("");
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const hitsRef = useRef(0); const triesRef = useRef(0); const lastKeyRef = useRef(0);
  const capsRef = useRef<KeystrokeRecord[]>([]);
  const scoreRef = useRef(0);
  const start = () => { setScore(0); scoreRef.current = 0; setRemaining(DURATION); setTyped(""); setWord(randomWord(hindi)); hitsRef.current = 0; triesRef.current = 0; capsRef.current = []; lastKeyRef.current = performance.now(); setOver(false); setRunning(true); };
  const endGame = useCallback(async () => {
    setRunning(false); setOver(true);
    const acc = triesRef.current ? Math.round((hitsRef.current / triesRef.current) * 100) : 0;
    if (capsRef.current.length) await recordKeystrokes(capsRef.current);
    await saveScore({ profileId, game: "word-runner", score: scoreRef.current, accuracy: acc, at: Date.now() });
  }, [profileId]);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => { setRemaining((r) => { if (r <= 1) { void endGame(); return 0; } return r - 1; }); }, 1000);
    return () => window.clearInterval(t);
  }, [running, endGame]);
  const onChange = (value: string) => {
    if (!running) return;
    if (value.length > typed.length) {
      const idx = value.length - 1; const expected = word[idx] ?? ""; const got = value[idx] ?? "";
      const now = performance.now(); const delta = Math.min(4000, Math.round(now - lastKeyRef.current)); lastKeyRef.current = now;
      triesRef.current++; if (expected === got) hitsRef.current++;
      if (!hindi) capsRef.current.push({ profileId, at: Date.now(), layoutId, expected, typed: got, correct: expected === got, deltaMs: delta });
    }
    if (value === word) { const pts = word.length; setScore((s) => { scoreRef.current = s + pts; return s + pts; }); setTyped(""); setWord(randomWord(hindi)); return; }
    if (word.startsWith(value)) setTyped(value); else setTyped(value);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Word Runner</h2><div className="flex items-center gap-3 text-sm"><span>Score: <b>{score}</b></span><span className="flex items-center gap-1"><Timer size={16} />{remaining}s</span></div></div>
      <div className="grid min-h-[220px] place-items-center rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {!running && !over && <button onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-white"><Play size={18} />Start</button>}
        {over && <div className="text-center"><p className="text-lg font-bold">Time up</p><p className="mt-1 text-sm text-slate-500">Score {score}</p><div className="mt-4 flex justify-center gap-2"><button onClick={start} className="flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm text-white"><RotateCcw size={16} />Again</button><button onClick={onExit} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Exit</button></div></div>}
        {running && (<div className="w-full max-w-md text-center">
          <div className="font-devanagari text-4xl font-bold tracking-wide">{word.split("").map((ch, i) => { const t = typed[i]; const cls = t == null ? "text-slate-400" : t === ch ? "text-green-600" : "text-red-600"; return <span key={i} className={cls}>{ch}</span>; })}</div>
          <input autoFocus value={typed} onChange={(e) => onChange(e.target.value)} className="mt-4 w-full rounded-md border border-slate-300 p-3 text-center font-devanagari text-xl dark:border-slate-700 dark:bg-slate-800" placeholder="Type the word" />
        </div>)}
      </div>
      <p className="text-xs text-slate-400">Type each word correctly before the 60-second clock runs out. {hindi ? "Hindi words need a Hindi layout/font." : ""}</p>
    </div>
  );
}
