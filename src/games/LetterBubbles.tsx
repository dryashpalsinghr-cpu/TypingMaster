import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Play, RotateCcw } from "lucide-react";
import { randomLetter } from "../data/gameWords";
import { saveScore, recordKeystrokes } from "../services/gamesService";
import type { GameProps } from "../types/games";
import type { KeystrokeRecord } from "../types/analytics";
interface Bubble { id: number; ch: string; x: number; y: number; }
const AREA_H = 380;
export function LetterBubbles({ profileId, layoutId, onExit }: GameProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const bubblesRef = useRef<Bubble[]>([]);
  const scoreRef = useRef(0);
  const playingRef = useRef(false);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(0);
  const hitsRef = useRef(0);
  const triesRef = useRef(0);
  const lastKeyRef = useRef(0);
  const capsRef = useRef<KeystrokeRecord[]>([]);
  const livesRef = useRef(3);
  const start = () => { if (savingRef.current) return; playingRef.current = true; bubblesRef.current = []; scoreRef.current = 0; setError(null); setBubbles([]); setScore(0); setLives(3); livesRef.current = 3; hitsRef.current = 0; triesRef.current = 0; capsRef.current = []; lastKeyRef.current = performance.now(); setOver(false); setRunning(true); };
  const endGame = useCallback(async () => {
    if (!playingRef.current) return;
    playingRef.current = false; savingRef.current = true; setSaving(true);
    setRunning(false); setOver(true);
    const records = capsRef.current.slice();
    const savedScore = scoreRef.current;
    const acc = triesRef.current ? Math.round((hitsRef.current / triesRef.current) * 100) : 0;
    try {
      if (records.length) await recordKeystrokes(records);
      await saveScore({ profileId, game: "letter-bubbles", score: savedScore, accuracy: acc, at: Date.now() });
    } catch { setError("Could not save all game statistics. Check device storage."); }
    finally { savingRef.current = false; setSaving(false); }
  }, [profileId]);
  useEffect(() => {
    if (!running) return;
    const spawn = window.setInterval(() => {
      if (!playingRef.current) return;
      bubblesRef.current = [...bubblesRef.current, { id: idRef.current++, ch: randomLetter(), x: 5 + Math.random() * 82, y: 0 }];
      setBubbles(bubblesRef.current); 
    }, 1050);
    const move = window.setInterval(() => {
      if (!playingRef.current) return;
      const next: Bubble[] = []; let lost = 0;
      for (const item of bubblesRef.current) { const nextPosition = item.y + 7; if (nextPosition >= AREA_H) lost++; else next.push({ ...item, y: nextPosition }); }
      bubblesRef.current = next; setBubbles(next);
      if (lost > 0) { livesRef.current = Math.max(0, livesRef.current - lost); setLives(livesRef.current); }
    }, 80);
    return () => { window.clearInterval(spawn); window.clearInterval(move); };
  }, [running]);
  useEffect(() => { if (running && livesRef.current <= 0) void endGame(); }, [lives, running, endGame]);
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (!playingRef.current || e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1 || bubblesRef.current.length === 0) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable=true]")) return;
      e.preventDefault();
      const key = e.key.toLowerCase();
      const now = performance.now();
      const delta = Math.min(4000, Math.round(now - lastKeyRef.current)); lastKeyRef.current = now;
      triesRef.current++;
      const sorted = [...bubblesRef.current].sort((a, b) => b.y - a.y);
      const target = sorted.find((item) => item.ch === key);
      if (target) {
        hitsRef.current++; scoreRef.current += 10; setScore(scoreRef.current);
        bubblesRef.current = bubblesRef.current.filter((item) => item.id !== target.id); setBubbles(bubblesRef.current);
      }
      capsRef.current.push({ profileId, at: Date.now(), layoutId, expected: target?.ch ?? sorted[0].ch, typed: key, correct: !!target, deltaMs: delta });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, profileId, layoutId]);
  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Letter Bubbles</h2><div className="flex items-center gap-3 text-sm"><span>Score: <b>{score}</b></span><span className="flex items-center gap-1">{Array.from({ length: Math.max(0, lives) }).map((_, i) => <Heart key={i} size={16} className="fill-red-500 text-red-500" />)}</span></div></div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950" style={{ height: AREA_H }}>
        {!running && !over && <div className="absolute inset-0 grid place-items-center"><button onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-white"><Play size={18} />Start</button></div>}
        {over && <div className="absolute inset-0 z-10 grid place-items-center bg-black/40"><div className="rounded-xl bg-white p-6 text-center dark:bg-slate-900"><p className="text-lg font-bold">Game over</p><p className="mt-1 text-sm text-slate-500">Score {score}</p><div className="mt-4 flex gap-2"><button onClick={start} disabled={saving} className="flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm text-white"><RotateCcw size={16} />Again</button><button onClick={onExit} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Exit</button></div></div></div>}
        {bubbles.map((b) => (<div key={b.id} className="absolute grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-sm font-bold uppercase text-white" style={{ left: `${b.x}%`, top: b.y }}>{b.ch}</div>))}
      </div>
      <p className="text-xs text-slate-400">Type the letters before they reach the bottom. 3 misses ends the game.</p>
    </div>
  );
}
