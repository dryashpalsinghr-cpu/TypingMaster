import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, DatabaseBackup, Compass, X } from "lucide-react";
import { OnboardingTour } from "./OnboardingTour";
const DONE_KEY = "tg-onboarding-done";
export function AppEnhancements() {
  const navigate = useNavigate();
  const [tourOpen, setTourOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => { if (!localStorage.getItem(DONE_KEY)) setTourOpen(true); }, []);
  const closeTour = () => { localStorage.setItem(DONE_KEY, "1"); setTourOpen(false); };
  const goBackup = () => { closeTour(); setMenu(false); navigate("/backup"); };
  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 no-print">
        {menu && (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <button onClick={goBackup} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><DatabaseBackup size={16} />Backup &amp; restore</button>
            <button onClick={() => { setMenu(false); setTourOpen(true); }} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><Compass size={16} />Replay tour</button>
          </div>
        )}
        <button onClick={() => setMenu((m) => !m)} aria-label="Help and backup" className="grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white shadow-lg">{menu ? <X size={22} /> : <HelpCircle size={22} />}</button>
      </div>
      <OnboardingTour open={tourOpen} onClose={closeTour} onGoBackup={goBackup} />
    </>
  );
}
