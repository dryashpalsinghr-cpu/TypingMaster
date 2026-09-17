import { useMemo } from "react";
import clsx from "clsx";

// Ascending base heights (0-1) so the bar chart reads as "climbing"
// progress, the same visual language used by commercial typing tutors'
// session-progress widgets - purely decorative motion, not a metric.
const BASE_HEIGHTS = [0.14, 0.2, 0.24, 0.32, 0.4, 0.5, 0.6, 0.72, 0.85, 1];

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

interface SessionSidePanelProps {
  progressLabel: string;
  progressRatio: number; // 0..1
  timeLabel: string;
  timeValue: string;
  timeUrgent?: boolean;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  showPrimary?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function SessionSidePanel({
  progressLabel,
  progressRatio,
  timeLabel,
  timeValue,
  timeUrgent,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  showPrimary = true,
  secondaryLabel,
  onSecondary,
}: SessionSidePanelProps) {
  const ratio = Math.min(1, Math.max(0, progressRatio));
  const bars = useMemo(() => BASE_HEIGHTS.map((h) => Math.max(0.08, h * ratio)), [ratio]);

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <span className="inline-block h-2 w-2 rounded-sm bg-brand-500" />
        {progressLabel}
      </div>
      <div className="mb-6 flex h-24 items-end gap-1 rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-brand-400/80 transition-all duration-300 dark:bg-brand-500/70"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>

      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{timeLabel}</div>
        <div className={clsx("text-3xl font-bold tabular-nums", timeUrgent ? "text-red-500" : "text-slate-800 dark:text-slate-100")}>
          {timeValue}
        </div>
      </div>

      <div className="mt-auto space-y-2">
        {showPrimary && (
          <button
            onClick={onPrimary}
            disabled={primaryDisabled}
            className={clsx(
              "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
              primaryDisabled ? "cursor-not-allowed bg-slate-300 dark:bg-slate-700" : "bg-brand-600 hover:bg-brand-700"
            )}
          >
            {primaryLabel}
          </button>
        )}
        {secondaryLabel && (
          <button
            onClick={onSecondary}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
