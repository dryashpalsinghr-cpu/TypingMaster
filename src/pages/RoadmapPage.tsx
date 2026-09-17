interface RoadmapPageProps {
  title: string;
  phase: string;
  description: string;
}

export function RoadmapPage({ title, phase, description }: RoadmapPageProps) {
  return (
    <div className="mx-auto max-w-xl p-10 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
        🚧
      </div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Scheduled: {phase}
      </span>
    </div>
  );
}
