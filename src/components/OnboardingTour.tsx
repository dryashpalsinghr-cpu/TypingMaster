import { useState } from "react";
import { ChevronLeft, ChevronRight, X, DatabaseBackup } from "lucide-react";
interface Step { title: string; body: string; }
const STEPS: Step[] = [
  { title: "Welcome to TypeGuru Pro", body: "An offline-first Hindi and English typing tutor. Everything runs on your device - no account, no internet needed." },
  { title: "Profiles", body: "Create a profile to save your progress. Each profile keeps its own language, layout, lessons, results, analytics, and game scores." },
  { title: "Learn and practice", body: "Start with guided lessons, then take timed typing tests. Hindi supports Unicode InScript and the legacy Kruti Dev / Remington layouts." },
  { title: "Exam Mode and Certificates", body: "Practice editable SSC / RRB / CPCT tests with focus-loss detection and KDPH, then generate a printable certificate from a real passed result." },
  { title: "Games, Statistics and Review", body: "Play three original typing games, then check your keyboard heatmap and let Personalized Review drill your weakest keys." },
  { title: "Back up your data", body: "Because everything is stored locally, use Backup & Restore to save all your data to a single file - handy when moving to a new device." },
];
export function OnboardingTour({ open, onClose, onGoBackup }: { open: boolean; onClose: () => void; onGoBackup: () => void }) {
  const [i, setI] = useState(0);
  if (!open) return null;
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between"><h2 className="text-lg font-bold">{step.title}</h2><button onClick={onClose} aria-label="Close" className="text-slate-400"><X size={20} /></button></div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
        <div className="mt-4 flex justify-center gap-1">{STEPS.map((_, idx) => (<span key={idx} className={"h-1.5 w-6 rounded-full " + (idx === i ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700")} />))}</div>
        <div className="mt-5 flex items-center justify-between">
          <button onClick={onClose} className="text-sm text-slate-500">Skip</button>
          <div className="flex gap-2">
            {i > 0 && <button onClick={() => setI((n) => n - 1)} className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"><ChevronLeft size={16} />Back</button>}
            {!last && <button onClick={() => setI((n) => n + 1)} className="flex items-center gap-1 rounded-md bg-brand-600 px-3 py-2 text-sm text-white">Next<ChevronRight size={16} /></button>}
            {last && <button onClick={onGoBackup} className="flex items-center gap-1 rounded-md bg-brand-600 px-3 py-2 text-sm text-white"><DatabaseBackup size={16} />Open Backup</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
