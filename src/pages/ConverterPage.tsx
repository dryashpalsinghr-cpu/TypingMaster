import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { krutiDevToUnicode, unicodeToKrutiDev } from "../converter/krutiDevCore";

export function ConverterPage() {
  const [direction, setDirection] = useState<"k2u" | "u2k">("u2k");
  const [input, setInput] = useState("");
  const output = useMemo(
    () => (direction === "k2u" ? krutiDevToUnicode(input) : unicodeToKrutiDev(input)),
    [input, direction]
  );
  const btn = (active: boolean) =>
    active
      ? "rounded-md bg-brand-600 px-3 py-2 text-sm text-white"
      : "rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700";
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Kruti Dev ↔ Unicode Converter</h1>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">BETA</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-devanagari">
        Unicode → Kruti Dev में आपको वे key-कोड मिलते हैं जो असल में टाइप किए जाते हैं (भारत = Hkkjr)। ि की जगह, रेफ़ (र्), आधे अक्षर और
        संयुक्ताक्षर संभाले जाते हैं। मैपिंग एक प्रचलित कम्युनिटी टेबल पर आधारित है, आधिकारिक नहीं — आउटपुट हमेशा जाँच लें।
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => setDirection("u2k")} className={btn(direction === "u2k")}>Unicode → Kruti Dev</button>
        <button onClick={() => setDirection("k2u")} className={btn(direction === "k2u")}>Kruti Dev → Unicode</button>
        <ArrowLeftRight size={16} className="text-slate-400" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-500">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 font-devanagari"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Output</label>
          <div className="mt-1 min-h-[240px] w-full whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 font-devanagari">
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}
