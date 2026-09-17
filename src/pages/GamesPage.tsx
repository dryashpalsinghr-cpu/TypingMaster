import { useCallback, useEffect, useState } from "react";
import { Gamepad2, Trophy, ArrowLeft } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { getHighScores } from "../services/gamesService";
import { LetterBubbles } from "../games/LetterBubbles";
import { WordRunner } from "../games/WordRunner";
import { KeyDefender } from "../games/KeyDefender";
import type { GameId, GameScore } from "../types/games";
const GAMES: { id: GameId; name: string; desc: string }[] = [
  { id: "letter-bubbles", name: "Letter Bubbles", desc: "Pop the falling letters by typing them before they reach the bottom." },
  { id: "word-runner", name: "Word Runner", desc: "Type the running words correctly against the clock." },
  { id: "key-defender", name: "Key Defender", desc: "Destroy incoming keys before they reach your base." },
];
export function GamesPage() {
  const { activeProfile } = useProfileContext();
  const [active, setActive] = useState<GameId | null>(null);
  const [scores, setScores] = useState<Record<string, GameScore[]>>({});
  const layoutId = activeProfile?.preferredLayout ?? "en-qwerty";
  const refresh = useCallback(async () => {
    if (!activeProfile?.id) return;
    const entries: Record<string, GameScore[]> = {};
    for (const g of GAMES) entries[g.id] = await getHighScores(activeProfile.id, g.id);
    setScores(entries);
  }, [activeProfile]);
  useEffect(() => { void refresh(); }, [refresh]);
  const exit = () => { setActive(null); void refresh(); };
  if (!activeProfile?.id) return <div className="p-6 text-sm text-slate-500">Select a profile to play.</div>;
  if (active) {
    const common = { profileId: activeProfile.id, layoutId, onExit: exit };
    return (
      <div className="p-6">
        <button onClick={exit} className="mb-4 flex items-center gap-1 text-sm text-slate-500"><ArrowLeft size={16} />All games</button>
        {active === "letter-bubbles" && <LetterBubbles {...common} />}
        {active === "word-runner" && <WordRunner {...common} />}
        {active === "key-defender" && <KeyDefender {...common} />}
      </div>
    );
  }
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2"><Gamepad2 size={22} /><h1 className="text-xl font-bold">Typing Games</h1></div>
      <p className="text-sm text-slate-500 dark:text-slate-400">Original games built for TypeGuru Pro - no assets copied from any commercial product. Each game also records real keystroke data, so your Statistics and Personalized Review keep improving.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {GAMES.map((g) => (
          <div key={g.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">{g.name}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-500">{g.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-slate-400"><Trophy size={14} />Best: {scores[g.id]?.[0]?.score ?? 0}</div>
            <button onClick={() => setActive(g.id)} className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm text-white">Play</button>
          </div>
        ))}
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">High scores</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {GAMES.map((g) => (
            <div key={g.id}>
              <h3 className="text-sm font-medium">{g.name}</h3>
              {(scores[g.id]?.length ?? 0) === 0 ? <p className="text-xs text-slate-400">No scores yet.</p> : (
                <ol className="mt-1 space-y-1 text-sm">{scores[g.id].map((s, i) => (<li key={s.id} className="flex justify-between"><span className="text-slate-400">{i + 1}.</span><span className="font-medium">{s.score}</span><span className="text-xs text-slate-400">{s.accuracy}%</span></li>))}</ol>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
