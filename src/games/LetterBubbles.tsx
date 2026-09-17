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
  const idRef = useRef(0);
  const hitsRef = useRef(0);
  const triesRef = useRef(0);
  const lastKeyRef = useRef(0);
  const capsRef = useRef<KeystrokeRecord[]>([]);
  const livesRef = useRef(3);
  const start = () => { setBubbles([]); setScore(0); setLives(3); livesRef.current = 3; hitsRef.current = 0; triesRef.current = 0; capsRef.current = []; lastKeyRef.current = performance.now(); setOver(false); setRunning(true); };
  const endGame = useCallback(async () => {
    setRunning(false); setOver(true);
    const acc = triesRef.current ? Math.round((hitsRef.current / triesRef.current) * 100) : 0;
    if (capsRef.current.length) await recordKeystrokes(capsRef.current);
    await saveScore({ profileId, game: "letter-bubbles", score, accuracy: acc, at: Date.now() });
  }, [profileId, score]);
  useEffect(() => {
    if (!running) return;
    const spawn = window.setInterval(() => { setBubbles((b) => [...b, { id: idRef.current++, ch: randomLetter(), x: 5 + Math.random() * 82, y: 0 }]); }, 1050);
    const move = window.setInterval(() => {
      setBubbles((prev) => {
        const next: Bubble[] = []; let lost = 0;
        for (const b of prev) { const ny = b.y + 7; if (ny >= AREA_H) lost++; else next.push({ ...b, y: ny }); }
        if (lost > 0) { livesRef.current -= lost; setLives(livesRef.current); }
        return next;
      });
    }, 80);
    return () => { window.clearInterval(spawn); window.clearInterval(move); };
  }, [running]);
  useEffect(() => { if (running && livesRef.current <= 0) void endGame(); }, [lives, running, endGame]);
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return;
      const key = e.key.toLowerCase();
      const now = performance.now();
      const delta = Math.min(4000, Math.round(now - lastKeyRef.current)); lastKeyRef.current = now;
      triesRef.current++;
      setBubbles((prev) => {
        if (prev.length === 0) return prev;
        const sorted = [...prev].sort((a, b) => b.y - a.y);
        const target = sorted.find((b) => b.ch === key);
        if (target) { hitsRef.current++; setScore((s) => s + 10); capsRef.current.push({ profileId, at: Date.now(), layoutId, expected: key, typed: key, correct: true, deltaMs: delta }); return prev.filter((b) => b.id !== target.id); }
        const nearest = sorted[0]; capsRef.current.push({ profileId, at: Date.now(), layoutId, expected: nearest.ch, typed: key, correct: false, deltaMs: delta }); return prev;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, profileId, layoutId]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Letter Bubbles</h2><div className="flex items-center gap-3 text-sm"><span>Score: <b>{score}</b></span><span className="flex items-center gap-1">{Array.from({ length: Math.max(0, lives) }).map((_, i) => <Heart key={i} size={16} className="fill-red-500 text-red-500" />)}</span></div></div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950" style={{ height: AREA_H }}>
        {!running && !over && <div className="absolute inset-0 grid place-items-center"><button onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-white"><Play size={18} />Start</button></div>}
        {over && <div className="absolute inset-0 z-10 grid place-items-center bg-black/40"><div className="rounded-xl bg-white p-6 text-center dark:bg-slate-900"><p className="text-lg font-bold">Game over</p><p className="mt-1 text-sm text-slate-500">Score {score}</p><div className="mt-4 flex gap-2"><button onClick={start} className="flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm text-white"><RotateCcw size={16} />Again</button><button onClick={onExit} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Exit</button></div></div></div>}
        {bubbles.map((b) => (<div key={b.id} className="absolute grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-sm font-bold uppercase text-white" style={{ left: `${b.x}%`, top: b.y }}>{b.ch}</div>))}
      </div>
      <p className="text-xs text-slate-400">Type the letters before they reach the bottom. 3 misses ends the game.</p>
    </div>
  );
}
