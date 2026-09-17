import { useEffect, useState, useCallback } from "react";
import { Keyboard, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { saveFontStatus, getFontStatus } from "../services/mappingService";
const FONT_FAMILY = "KrutiDev010Local";
const PREVIEW_TEXT = "vLrqkj";
export function FontSetupPage() {
  const [status, setStatus] = useState<"installed" | "missing" | "failed" | "unknown">("unknown");
  const [checking, setChecking] = useState(false);
  const detect = useCallback(async () => {
    setChecking(true);
    try {
      if (typeof document === "undefined" || !("fonts" in document)) { setStatus("unknown"); return; }
      try { await document.fonts.load(`16px "${FONT_FAMILY}"`); } catch { /* ignore */ }
      const available = document.fonts.check(`16px "${FONT_FAMILY}"`);
      const next = available ? "installed" : "missing";
      setStatus(next);
      await saveFontStatus({ fontFamily: FONT_FAMILY, status: next });
    } catch { setStatus("failed"); }
    finally { setChecking(false); }
  }, []);
  useEffect(() => { void getFontStatus(FONT_FAMILY).then((r) => { if (r) setStatus(r.status); }); void detect(); }, [detect]);
  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-xl font-bold">Legacy Font Setup</h1><p className="text-sm text-slate-500 dark:text-slate-400">Kruti Dev and Remington GAIL are font-based legacy encodings. The Kruti Dev font is copyrighted, so it is NOT bundled with this app. Install a font you are licensed to use, then detect it here.</p></div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3"><Keyboard size={20} /><span className="font-semibold">Font detection</span></div>
        <div className="mt-4 flex items-center gap-3">
          {status === "installed" && <span className="flex items-center gap-2 text-green-600"><CheckCircle2 size={18} />Detected on this device</span>}
          {status === "missing" && <span className="flex items-center gap-2 text-amber-600"><XCircle size={18} />Not detected</span>}
          {status === "failed" && <span className="flex items-center gap-2 text-red-600"><XCircle size={18} />Detection failed</span>}
          {status === "unknown" && <span className="text-slate-500">Checking...</span>}
          <button onClick={() => void detect()} disabled={checking} className="ml-auto flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"><RefreshCw size={16} className={checking ? "animate-spin" : ""} />Re-check</button>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800"><div className="text-xs text-slate-500">Preview (renders correctly only if the font is installed):</div><div className="font-krutidev mt-2 text-3xl">{PREVIEW_TEXT}</div></div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">How to install</h2><ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-600 dark:text-slate-300"><li>Obtain a Kruti Dev 010 font file you are licensed to use.</li><li>Install it in your operating system (Windows: right-click the font file, then Install).</li><li>Register the same family name (“KrutiDev010Local”) via the CSS @font-face if you self-host the file, or rename the CSS family to match your installed font.</li><li>Return here and press Re-check.</li></ol><p className="mt-3 text-xs text-slate-400">This app never downloads or bundles the copyrighted font for you.</p></section>
    </div>
  );
}
