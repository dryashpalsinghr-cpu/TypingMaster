import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Play, RotateCcw } from "lucide-react";
import { randomLetter } from "../data/gameWords";
import { saveScore, recordKeystrokes } from "../services/gamesService";
import type { GameProps } from "../types/games";
import type { KeystrokeRecord } from "../types/analytics";
interface Enemy { id: number; ch: string; x: number; lane: number; }
export function KeyDefender({ profileId, layoutId, onExit }: GameProps) {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const idRef = useRef(0); const hitsRef = useRef(0); const triesRef = useRef(0); const lastKeyRef = useRef(0);
  const capsRef = useRef<KeystrokeRecord[]>([]); const livesRef = useRef(3); const speedRef = useRef(1.4);
  const start = () => { setEnemies([]); setScore(0); setLives(3); livesRef.current = 3; speedRef.current = 1.4; hitsRef.current = 0; triesRef.current = 0; capsRef.current = []; lastKeyRef.current = performance.now(); setOver(false); setRunning(true); };
  const endGame = useCallback(async () => {
    setRunning(false); setOver(true);
    const acc = triesRef.current ? Math.round((hitsRef.current / triesRef.current) * 100) : 0;
    if (capsRef.current.length) await recordKeystrokes(capsRef.current);
    await saveScore({ profileId, game: "key-defender", score, accuracy: acc, at: Date.now() });
  }, [profileId, score]);
  useEffect(() => {
    if (!running) return;
    const spawn = window.setInterval(() => { setEnemies((e) => [...e, { id: idRef.current++, ch: randomLetter(), x: 100, lane: Math.floor(Math.random() * 5) }]); speedRef.current += 0.05; }, 1200);
    const move = window.setInterval(() => {
      setEnemies((prev) => { const next: Enemy[] = []; let lost = 0; for (const en of prev) { const nx = en.x - speedRef.current; if (nx <= 0) lost++; else next.push({ ...en, x: nx }); } if (lost > 0) { livesRef.current -= lost; setLives(livesRef.current); } return next; });
    }, 80);
    return () => { window.clearInterval(spawn); window.clearInterval(move); };
  }, [running]);
  useEffect(() => { if (running && livesRef.current <= 0) void endGame(); }, [lives, running, endGame]);
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return; const key = e.key.toLowerCase();
      const now = performance.now(); const delta = Math.min(4000, Math.round(now - lastKeyRef.current)); lastKeyRef.current = now; triesRef.current++;
      setEnemies((prev) => { if (prev.length === 0) return prev; const sorted = [...prev].sort((a, b) => a.x - b.x); const target = sorted.find((en) => en.ch === key); if (target) { hitsRef.current++; setScore((s) => s + 10); capsRef.current.push({ profileId, at: Date.now(), layoutId, expected: key, typed: key, correct: true, deltaMs: delta }); return prev.filter((en) => en.id !== target.id); } const nearest = sorted[0]; capsRef.current.push({ profileId, at: Date.now(), layoutId, expected: nearest.ch, typed: key, correct: false, deltaMs: delta }); return prev; });
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [running, profileId, layoutId]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Key Defender</h2><div className="flex items-center gap-3 text-sm"><span>Score: <b>{score}</b></span><span className="flex items-center gap-1">{Array.from({ length: Math.max(0, lives) }).map((_, i) => <Heart key={i} size={16} className="fill-red-500 text-red-500" />)}</span></div></div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" style={{ height: 320 }}>
        <div className="absolute inset-y-0 left-0 w-2 bg-brand-600" />
        {!running && !over && <div className="absolute inset-0 grid place-items-center"><button onClick={start} className="flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-white"><Play size={18} />Start</button></div>}
        {over && <div className="absolute inset-0 z-10 grid place-items-center bg-black/40"><div className="rounded-xl bg-white p-6 text-center dark:bg-slate-900"><p className="text-lg font-bold">Base overrun</p><p className="mt-1 text-sm text-slate-500">Score {score}</p><div className="mt-4 flex gap-2"><button onClick={start} className="flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm text-white"><RotateCcw size={16} />Again</button><button onClick={onExit} className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Exit</button></div></div></div>}
        {enemies.map((en) => (<div key={en.id} className="absolute grid h-8 w-8 place-items-center rounded bg-red-500 text-sm font-bold uppercase text-white" style={{ left: `${en.x}%`, top: 20 + en.lane * 56 }}>{en.ch}</div>))}
      </div>
      <p className="text-xs text-slate-400">Type the letters on incoming keys to destroy them before they reach the base on the left.</p>
    </div>
  );
}
