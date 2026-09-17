import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { getConversionMappings } from "../services/mappingService";
import { convertKrutiDevToUnicode, convertUnicodeToKrutiDev, type ConversionResult } from "../converter/krutiDevUnicode";
import type { ConversionMapping } from "../types";
const LAYOUT_ID = "kruti-dev-010";
export function ConverterPage() {
  const [direction, setDirection] = useState<"k2u" | "u2k">("k2u");
  const [input, setInput] = useState("");
  const [mappings, setMappings] = useState<ConversionMapping[]>([]);
  const [result, setResult] = useState<ConversionResult>({ output: "", converted: 0, preserved: 0 });
  useEffect(() => { void getConversionMappings(LAYOUT_ID).then(setMappings); }, []);
  useEffect(() => {
    const r = direction === "k2u" ? convertKrutiDevToUnicode(input, mappings) : convertUnicodeToKrutiDev(input, mappings);
    setResult(r);
  }, [input, direction, mappings]);
  const verifiedCount = mappings.filter((m) => m.verified).length;
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2"><h1 className="text-xl font-bold">Kruti Dev ↔ Unicode Converter</h1><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">BETA</span></div>
      <p className="text-sm text-slate-500 dark:text-slate-400">This converter only uses mapping pairs you have marked verified ({verifiedCount} available). Unmatched characters are preserved unchanged. Always proofread the output.</p>
      <div className="flex items-center gap-2">
        <button onClick={() => setDirection("k2u")} className={direction === "k2u" ? "rounded-md bg-brand-600 px-3 py-2 text-sm text-white" : "rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"}>Kruti Dev → Unicode</button>
        <button onClick={() => setDirection("u2k")} className={direction === "u2k" ? "rounded-md bg-brand-600 px-3 py-2 text-sm text-white" : "rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"}>Unicode → Kruti Dev</button>
        <ArrowLeftRight size={16} className="text-slate-400" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="text-xs font-medium text-slate-500">Input</label><textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Paste text here" /></div>
        <div><label className="text-xs font-medium text-slate-500">Output</label><div className="mt-1 min-h-[240px] w-full whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 font-devanagari">{result.output}</div></div>
      </div>
      <div className="text-xs text-slate-400">Converted: {result.converted} · Preserved: {result.preserved}</div>
    </div>
  );
}
