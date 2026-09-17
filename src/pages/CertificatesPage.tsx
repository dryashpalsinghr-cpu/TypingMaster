import { useCallback, useEffect, useState } from "react";
import { Award, Printer, RefreshCw } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { getResults } from "../services/examService";
import { issueCertificate, getCertificates } from "../services/certificateService";
import type { ExamResult, CertificateRecord } from "../types/exam";
export function CertificatesPage() {
  const { activeProfile } = useProfileContext();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [certs, setCerts] = useState<CertificateRecord[]>([]);
  const [active, setActive] = useState<CertificateRecord | null>(null);
  const [name, setName] = useState(activeProfile?.displayName ?? "");
  const load = useCallback(async () => {
    if (!activeProfile?.id) return;
    setResults(await getResults(activeProfile.id));
    setCerts(await getCertificates(activeProfile.id));
  }, [activeProfile]);
  useEffect(() => { void load(); }, [load]);
  const passed = results.filter((r) => r.passed);
  const generate = async (r: ExamResult) => { const c = await issueCertificate(r, name); await load(); setActive(c); };
  return (
    <div className="space-y-6 p-6">
      <style>{"@media print { body * { visibility: hidden !important; } .cert-print, .cert-print * { visibility: visible !important; } .cert-print { position: fixed; inset: 0; margin: auto; height: fit-content; } .no-print { display: none !important; } }"}</style>
      <div className="flex items-center gap-2 no-print"><Award size={22} /><h1 className="text-xl font-bold">Certificates</h1><button onClick={() => void load()} className="ml-auto flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"><RefreshCw size={16} />Refresh</button></div>
      <p className="text-sm text-slate-500 dark:text-slate-400 no-print">Certificates are generated only from your real passed exam results. There is no sample or fabricated data. This is a practice certificate, not an official government document.</p>
      <label className="no-print block text-sm">Name on certificate<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full max-w-sm rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" /></label>
      {active && (
        <div className="cert-print rounded-xl border-4 border-brand-600 bg-white p-10 text-center text-slate-900">
          <div className="text-sm uppercase tracking-widest text-slate-500">TypeGuru Pro</div>
          <h2 className="mt-2 text-3xl font-bold">Certificate of Achievement</h2>
          <p className="mt-4">This certifies that</p>
          <p className="mt-1 text-2xl font-semibold">{active.recipientName}</p>
          <p className="mt-4">completed the <strong>{active.templateName}</strong> ({active.category.toUpperCase()}) typing test with</p>
          <div className="mt-4 flex justify-center gap-8">
            <div><div className="text-2xl font-bold">{active.netWpm}</div><div className="text-xs">Net WPM</div></div>
            <div><div className="text-2xl font-bold">{active.accuracy}%</div><div className="text-xs">Accuracy</div></div>
            <div><div className="text-2xl font-bold">{active.kdph}</div><div className="text-xs">KDPH</div></div>
          </div>
          <p className="mt-6 text-xs text-slate-500">Serial {active.serial} · Issued {new Date(active.issuedAt).toLocaleDateString()}</p>
          <p className="mt-1 text-[10px] text-slate-400">Practice certificate generated from a real in-app result. Not an official government document.</p>
          <button onClick={() => window.print()} className="no-print mt-6 inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm text-white"><Printer size={16} />Print / Save as PDF</button>
        </div>
      )}
      <section className="no-print space-y-2">
        <h2 className="font-semibold">Passed results</h2>
        {passed.length === 0 && <p className="text-sm text-slate-500">No passed exam results yet. Pass an exam in Exam Mode first.</p>}
        {passed.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div><div className="text-sm font-medium">{r.templateName}</div><div className="text-xs text-slate-500">{r.netWpm} WPM · {r.accuracy}% · {r.kdph} KDPH · {new Date(r.takenAt).toLocaleDateString()}</div></div>
            <button onClick={() => void generate(r)} className="rounded-md bg-brand-600 px-3 py-1 text-xs text-white">Generate</button>
          </div>
        ))}
      </section>
      {certs.length > 0 && (
        <section className="no-print space-y-2">
          <h2 className="font-semibold">Issued certificates</h2>
          {certs.map((c) => (<button key={c.id} onClick={() => setActive(c)} className="block w-full rounded-lg border border-slate-200 p-3 text-left text-sm dark:border-slate-700">{c.recipientName} - {c.templateName} · {c.serial}</button>))}
        </section>
      )}
    </div>
  );
}
